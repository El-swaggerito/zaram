import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

type RequestBody = {
  bookingReference: string;
};

type BookingRow = {
  id: number;
  booking_reference: string;
  total_amount_kobo: number;
  booking_status: string;
  payment_status: string;
  hold_expires_at: string | null;
  email: string;
  full_name: string;
};

type PaystackEnv = Cloudflare.Env & {
  PAYSTACK_SECRET_KEY: string;
};

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

function createPaystackReference() {
  const random = crypto
    .randomUUID()
    .replace(/-/g, "")
    .toUpperCase();

  return `ZRMPS-${random.slice(0, 20)}`;
}

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return Response.json(
      {
        success: false,
        error: "Invalid request body.",
      },
      { status: 400 }
    );
  }

  const bookingReference =
    body.bookingReference?.trim();

  if (!bookingReference) {
    return Response.json(
      {
        success: false,
        error: "Booking reference is required.",
      },
      { status: 400 }
    );
  }

  const db = env.zaram_hotels_db;

  /*
   * Load the authoritative booking amount and guest email
   * from D1. Never trust either value from the browser.
   */
  const booking = await db
    .prepare(
      `
        SELECT
          b.id,
          b.booking_reference,
          b.total_amount_kobo,
          b.booking_status,
          b.payment_status,
          b.hold_expires_at,

          g.email,
          g.full_name

        FROM bookings b

        JOIN guests g
          ON g.id = b.guest_id

        WHERE b.booking_reference = ?

        LIMIT 1
      `
    )
    .bind(bookingReference)
    .first<BookingRow>();

  if (!booking) {
    return Response.json(
      {
        success: false,
        error: "Booking not found.",
      },
      { status: 404 }
    );
  }

  /*
   * An already-paid booking must never create
   * another Paystack transaction.
   */
  if (
    booking.booking_status === "confirmed" &&
    booking.payment_status === "paid"
  ) {
    return Response.json({
      success: true,
      alreadyPaid: true,
      bookingReference:
        booking.booking_reference,
    });
  }

  if (
    booking.booking_status !== "pending" ||
    booking.payment_status !== "unpaid"
  ) {
    return Response.json(
      {
        success: false,
        error:
          "This booking is not awaiting payment.",
      },
      { status: 409 }
    );
  }

  if (
    !booking.hold_expires_at ||
    new Date(
      booking.hold_expires_at
    ).getTime() <= Date.now()
  ) {
    return Response.json(
      {
        success: false,
        error:
          "Your room hold has expired. Please check availability again.",
      },
      { status: 409 }
    );
  }

  if (
    !Number.isInteger(
      booking.total_amount_kobo
    ) ||
    booking.total_amount_kobo <= 0
  ) {
    return Response.json(
      {
        success: false,
        error:
          "This booking has an invalid payment amount.",
      },
      { status: 500 }
    );
  }

  const secretKey =
    (env as PaystackEnv)
      .PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    console.error(
      "PAYSTACK_SECRET_KEY is not configured."
    );

    return Response.json(
      {
        success: false,
        error:
          "Payment service is not configured.",
      },
      { status: 500 }
    );
  }

  const paymentReference =
    createPaystackReference();

  /*
   * Record the attempt before contacting Paystack.
   * This gives us a durable reference even if the
   * external API call fails.
   */
  try {
    await db
      .prepare(
        `
          INSERT INTO payment_transactions (
            booking_id,
            provider,
            reference,
            amount_kobo,
            currency,
            status
          )
          VALUES (
            ?,
            'paystack',
            ?,
            ?,
            'NGN',
            'initialized'
          )
        `
      )
      .bind(
        booking.id,
        paymentReference,
        booking.total_amount_kobo
      )
      .run();
  } catch (error) {
    console.error(
      "Could not create payment attempt:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Payment could not be initialised.",
      },
      { status: 500 }
    );
  }

  let paystackResponse: Response;

  try {
    paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${secretKey}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          email: booking.email,
          amount:
            booking.total_amount_kobo,
          currency: "NGN",
          reference:
            paymentReference,
          callback_url:
            "https://zaramhotel.com/api/payments/paystack/callback",
          metadata: {
            booking_reference:
              booking.booking_reference,
          },
        }),
      }
    );
  } catch (error) {
    console.error(
      "Paystack initialise request failed:",
      error
    );

    await db
      .prepare(
        `
          UPDATE payment_transactions
          SET
            status = 'failed',
            gateway_response = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE reference = ?
        `
      )
      .bind(
        "Unable to reach Paystack.",
        paymentReference
      )
      .run();

    return Response.json(
      {
        success: false,
        error:
          "Payment provider could not be reached.",
      },
      { status: 502 }
    );
  }

  let paystack:
    | PaystackInitializeResponse
    | null = null;

  try {
    paystack =
      (await paystackResponse.json()) as
        PaystackInitializeResponse;
  } catch {
    paystack = null;
  }

  if (
    !paystackResponse.ok ||
    !paystack?.status ||
    !paystack.data?.authorization_url ||
    !paystack.data?.access_code ||
    paystack.data.reference !==
      paymentReference
  ) {
    console.error(
      "Paystack initialisation rejected:",
      paystack
    );

    await db
      .prepare(
        `
          UPDATE payment_transactions
          SET
            status = 'failed',
            gateway_response = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE reference = ?
        `
      )
      .bind(
        paystack?.message ||
          "Paystack rejected transaction initialisation.",
        paymentReference
      )
      .run();

    return Response.json(
      {
        success: false,
        error:
          "Payment could not be initialised.",
      },
      { status: 502 }
    );
  }

  await db
    .prepare(
      `
        UPDATE payment_transactions
        SET
          access_code = ?,
          authorization_url = ?,
          gateway_response = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE reference = ?
      `
    )
    .bind(
      paystack.data.access_code,
      paystack.data.authorization_url,
      paystack.message,
      paymentReference
    )
    .run();

  /*
   * Return only information required for checkout.
   * The Paystack secret key never reaches the browser.
   */
  return Response.json(
    {
      success: true,
      payment: {
        reference:
          paymentReference,
        authorizationUrl:
          paystack.data.authorization_url,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
