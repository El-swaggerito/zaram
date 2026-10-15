import { env } from "cloudflare:workers";

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

  if (!body.bookingReference) {
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
    .bind(body.bookingReference)
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

  if (
    booking.booking_status === "confirmed" &&
    booking.payment_status === "paid"
  ) {
    return Response.json({
      success: true,
      alreadyPaid: true,
      bookingReference: body.bookingReference,
    });
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
      error: "Mock payment failed. Your booking has not been confirmed.",
    });
  }

  await db
    .prepare(
      `
        UPDATE bookings
        SET
          booking_status = 'confirmed',
          payment_status = 'paid',
          amount_paid_kobo = total_amount_kobo,
          paid_at = CURRENT_TIMESTAMP,
          hold_expires_at = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE
          id = ?
          AND booking_status = 'pending'
          AND payment_status = 'unpaid'
      `
    )
    .bind(booking.id)
    .run();

  return Response.json({
    success: true,
    bookingReference: body.bookingReference,
    bookingStatus: "confirmed",
    paymentStatus: "paid",
    amountPaidKobo: booking.total_amount_kobo,
  });
}
