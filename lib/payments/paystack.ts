import { env } from "cloudflare:workers";

type PaystackEnv = Cloudflare.Env & {
  PAYSTACK_SECRET_KEY: string;
};

export type PaystackTransactionStatus =
  | "abandoned"
  | "failed"
  | "ongoing"
  | "pending"
  | "processing"
  | "queued"
  | "reversed"
  | "success";

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    id: number | string;
    domain: string;
    status: PaystackTransactionStatus;
    reference: string;
    amount: number;
    currency: string;
    gateway_response: string | null;
    paid_at: string | null;
  };
};

export async function verifyPaystackTransaction(
  reference: string
) {
  const secretKey =
    (env as PaystackEnv).PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not configured."
    );
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: "application/json",
      },
    }
  );

  let result: PaystackVerifyResponse | null = null;

  try {
    result =
      (await response.json()) as PaystackVerifyResponse;
  } catch {
    result = null;
  }

  if (
    !response.ok ||
    !result?.status ||
    !result.data
  ) {
    throw new Error(
      result?.message ||
        "Paystack transaction verification failed."
    );
  }

  if (result.data.reference !== reference) {
    throw new Error(
      "Paystack returned an unexpected transaction reference."
    );
  }

  return result.data;
}
