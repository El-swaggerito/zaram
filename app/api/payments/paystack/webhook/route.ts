import { env } from "cloudflare:workers";

import { confirmBookingPayment } from "@/lib/payments/confirm-booking-payment";
import { verifyPaystackTransaction } from "@/lib/payments/paystack";

export const dynamic = "force-dynamic";

type PaystackEnv = Cloudflare.Env & {
  PAYSTACK_SECRET_KEY: string;
  PAYSTACK_WEBHOOK_SECRET?: string;
};

type PaymentAttemptRow = {
  id: number;
  booking_id: number;
  reference: string;
  amount_kobo: number;
  currency: string;
  booking_reference: string;
};

type ChargeSuccessEvent = {
  event: "charge.success";
  data: {
    id: number | string;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    gateway_response?: string | null;
    paid_at?: string | null;
  };
};

type PaystackEvent = {
  event: string;
  data?: unknown;
};

function hexToBytes(hex: string) {
  if (
    hex.length % 2 !== 0 ||
    !/^[0-9a-f]+$/i.test(hex)
  ) {
    return null;
  }

  const bytes = new Uint8Array(hex.length / 2);

  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(
      hex.slice(i * 2, i * 2 + 2),
      16
    );
  }

  return bytes;
}

function constantTimeEqual(
  left: Uint8Array,
  right: Uint8Array
) {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;

  for (let i = 0; i < left.length; i += 1) {
    difference |= left[i] ^ right[i];
  }

  return difference === 0;
}

async function hmacSha512(
  secret: string,
  payload: ArrayBuffer
) {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-512",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    payload
  );

  return new Uint8Array(signature);
}

async function verifyNewPaystackSignature(
  header: string,
  rawBody: ArrayBuffer,
  secret: string
) {
  let timestamp: number | null = null;
  const signatures: string[] = [];

  for (const part of header.split(",")) {
    const value = part.trim();

    if (value.startsWith("t=")) {
      const parsed = Number(
        value.slice(2)
      );

      if (Number.isFinite(parsed)) {
        timestamp = parsed;
      }

      continue;
    }

    if (value.startsWith("v1=")) {
      const signedValue = value.slice(3);
      const colonIndex =
        signedValue.indexOf(":");

      if (colonIndex === -1) {
        continue;
      }

      const signature =
        signedValue.slice(colonIndex + 1);

      if (/^[0-9a-f]{128}$/.test(signature)) {
        signatures.push(signature);
      }
    }
  }

  if (
    timestamp === null ||
    signatures.length === 0
  ) {
    return false;
  }

  /*
   * Paystack specifies a five-minute replay window.
   */
  const now = Math.floor(Date.now() / 1000);

  if (Math.abs(now - timestamp) > 300) {
    return false;
  }

  const encoder = new TextEncoder();
  const prefix = encoder.encode(
    `${timestamp}.`
  );
  const bodyBytes =
    new Uint8Array(rawBody);

  const signedPayload =
    new Uint8Array(
      prefix.length + bodyBytes.length
    );

  signedPayload.set(prefix, 0);
  signedPayload.set(
    bodyBytes,
    prefix.length
  );

  const expected =
    await hmacSha512(
      secret,
      signedPayload.buffer
    );

  for (const signatureHex of signatures) {
    const received =
      hexToBytes(signatureHex);

    if (
      received &&
      constantTimeEqual(
        expected,
        received
      )
    ) {
      return true;
    }
  }

  return false;
}

async function verifyLegacyPaystackSignature(
  header: string,
  rawBody: ArrayBuffer,
  secretKey: string
) {
  if (!/^[0-9a-f]{128}$/i.test(header)) {
    return false;
  }

  const received =
    hexToBytes(header);

  if (!received) {
    return false;
  }

  const expected =
    await hmacSha512(
      secretKey,
      rawBody
    );

  return constantTimeEqual(
    expected,
    received
  );
}

async function verifyWebhookSignature(
  request: Request,
  rawBody: ArrayBuffer
) {
  const paystackEnv =
    env as PaystackEnv;

  const modernHeader =
    request.headers.get(
      "Paystack-Signature"
    );

  const webhookSecret =
    paystackEnv.PAYSTACK_WEBHOOK_SECRET;

  /*
   * Prefer Paystack's newer timestamped signing-secret
   * mechanism whenever both the header and secret exist.
   */
  if (
    modernHeader &&
    webhookSecret
  ) {
    return verifyNewPaystackSignature(
      modernHeader,
      rawBody,
      webhookSecret
    );
  }

  /*
   * Compatibility path for current Paystack integrations.
   * This uses the API secret key and X-Paystack-Signature.
   */
  const legacyHeader =
    request.headers.get(
      "X-Paystack-Signature"
    );

  if (
    !legacyHeader ||
    !paystackEnv.PAYSTACK_SECRET_KEY
  ) {
    return false;
  }

  return verifyLegacyPaystackSignature(
    legacyHeader,
    rawBody,
    paystackEnv.PAYSTACK_SECRET_KEY
  );
}

export async function POST(
  request: Request
) {
  /*
   * Read the exact raw bytes before JSON parsing.
   * Re-serialising parsed JSON would invalidate the signature.
   */
  const rawBody =
    await request.arrayBuffer();

  const validSignature =
    await verifyWebhookSignature(
      request,
      rawBody
    );

  if (!validSignature) {
    console.error(
      "Rejected Paystack webhook with invalid signature."
    );

    return new Response(
      "Invalid signature",
      { status: 401 }
    );
  }

  let event: PaystackEvent;

  try {
    const text =
      new TextDecoder().decode(rawBody);

    event =
      JSON.parse(text) as PaystackEvent;
  } catch {
    return new Response(
      "Invalid JSON",
      { status: 400 }
    );
  }

  /*
   * We only need charge.success for booking confirmation.
   * Other legitimate Paystack events are acknowledged and ignored.
   */
  if (event.event !== "charge.success") {
    return new Response("OK", {
      status: 200,
    });
  }

  const chargeEvent =
    event as ChargeSuccessEvent;

  const webhookReference =
    chargeEvent.data?.reference?.trim();

  if (!webhookReference) {
    console.error(
      "Paystack charge.success event had no reference."
    );

    return new Response("OK", {
      status: 200,
    });
  }

  const db =
    env.zaram_hotels_db;

  /*
   * Ignore valid Paystack transactions that were not
   * initialised by this booking system.
   */
  const attempt = await db
    .prepare(
      `
        SELECT
          pt.id,
          pt.booking_id,
          pt.reference,
          pt.amount_kobo,
          pt.currency,
          b.booking_reference
        FROM payment_transactions pt

        JOIN bookings b
          ON b.id = pt.booking_id

        WHERE
          pt.reference = ?
          AND pt.provider = 'paystack'

        LIMIT 1
      `
    )
    .bind(webhookReference)
    .first<PaymentAttemptRow>();

  if (!attempt) {
    console.warn(
      "Ignoring Paystack webhook for unknown transaction:",
      webhookReference
    );

    return new Response("OK", {
      status: 200,
    });
  }

  /*
   * Signature validation proves Paystack sent the event.
   * We still independently verify the transaction with
   * Paystack before confirming the booking.
   */
  let transaction;

  try {
    transaction =
      await verifyPaystackTransaction(
        webhookReference
      );
  } catch (error) {
    console.error(
      "Paystack webhook transaction verification failed:",
      error
    );

    /*
     * Non-2xx allows Paystack to retry this webhook.
     */
    return new Response(
      "Verification unavailable",
      { status: 503 }
    );
  }

  if (transaction.status !== "success") {
    console.error(
      "charge.success webhook did not verify as successful:",
      {
        reference:
          webhookReference,
        verifiedStatus:
          transaction.status,
      }
    );

    return new Response(
      "Verification not successful",
      { status: 503 }
    );
  }

  /*
   * Require exact agreement with our server-created
   * payment attempt before fulfilling the booking.
   */
  if (
    transaction.reference !==
      attempt.reference ||
    transaction.amount !==
      attempt.amount_kobo ||
    transaction.currency !==
      attempt.currency ||
    transaction.currency !== "NGN"
  ) {
    console.error(
      "Paystack webhook verification mismatch:",
      {
        reference:
          transaction.reference,
        expectedReference:
          attempt.reference,
        amount:
          transaction.amount,
        expectedAmount:
          attempt.amount_kobo,
        currency:
          transaction.currency,
        expectedCurrency:
          attempt.currency,
      }
    );

    /*
     * This is not a transient condition.
     * Acknowledge it so Paystack does not continually retry,
     * while leaving the booking unconfirmed for investigation.
     */
    return new Response("OK", {
      status: 200,
    });
  }

  try {
    const result =
      await confirmBookingPayment({
        bookingReference:
          attempt.booking_reference,
        paymentReference:
          attempt.reference,
        paymentProvider:
          "paystack",
        amountPaidKobo:
          transaction.amount,
        paidAt:
          transaction.paid_at,
        providerTransactionId:
          String(transaction.id),
        gatewayResponse:
          transaction.gateway_response,
      });

    if (!result.success) {
      console.error(
        "Verified Paystack webhook payment requires review:",
        result
      );

      /*
       * The payment itself has been verified.
       * Repeated webhook delivery will not resolve a room conflict
       * or an already-paid-different-transaction situation.
       */
      return new Response("OK", {
        status: 200,
      });
    }
  } catch (error) {
    console.error(
      "Paystack webhook processing failed:",
      error
    );

    return new Response(
      "Processing failed",
      { status: 500 }
    );
  }

  return new Response("OK", {
    status: 200,
  });
}
