import { env } from "cloudflare:workers";

import { confirmBookingPayment } from "@/lib/payments/confirm-booking-payment";

export const dynamic = "force-dynamic";

type RequestBody = {
  bookingReference: string;
  result: "success" | "failed";
};

type BookingRow = {
  id: number;
  total_amount_kobo: number;
  booking_status: string;
  payment_status: string;
  hold_expires_at: string | null;
};

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

  if (!["success", "failed"].includes(body.result)) {
    return Response.json(
      {
        success: false,
        error: "Invalid mock payment result.",
      },
      { status: 400 }
    );
  }

  const db = env.zaram_hotels_db;

  const booking = await db
    .prepare(
      `
        SELECT
          id,
          total_amount_kobo,
          booking_status,
          payment_status,
          hold_expires_at
        FROM bookings
        WHERE booking_reference = ?
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
   * Preserve idempotency for already-paid mock bookings.
   * The shared helper performs the final reference check.
   */
  if (
    booking.booking_status === "confirmed" &&
    booking.payment_status === "paid"
  ) {
    const result = await confirmBookingPayment({
      bookingReference,
      paymentReference: `MOCK-${bookingReference}`,
      paymentProvider: "mock",
      amountPaidKobo: booking.total_amount_kobo,
      paidAt: null,
    });

    return Response.json(
      result,
      { status: result.success ? 200 : 409 }
    );
  }

  if (
    booking.booking_status !== "pending" ||
    booking.payment_status !== "unpaid"
  ) {
    return Response.json(
      {
        success: false,
        error: "This booking is not awaiting payment.",
      },
      { status: 409 }
    );
  }

  /*
   * Mock payments still obey the original 15-minute hold.
   *
   * Real Paystack verification is handled differently because
   * the guest may complete payment just as the hold expires.
   */
  if (
    !booking.hold_expires_at ||
    new Date(booking.hold_expires_at).getTime() <= Date.now()
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

  if (body.result === "failed") {
    return Response.json({
      success: false,
      paymentFailed: true,
      error:
        "Mock payment failed. Your booking has not been confirmed.",
    });
  }

  const result = await confirmBookingPayment({
    bookingReference,
    paymentReference: `MOCK-${bookingReference}`,
    paymentProvider: "mock",
    amountPaidKobo: booking.total_amount_kobo,
    paidAt: new Date().toISOString(),
  });

  if (!result.success) {
    return Response.json(
      result,
      {
        status:
          result.code === "booking_not_found"
            ? 404
            : 409,
      }
    );
  }

  return Response.json(result);
}
