import { env } from "cloudflare:workers";

import { sendBookingConfirmationEmails } from "@/lib/email";

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

type ConfirmedBookingRow = {
  booking_reference: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  number_of_nights: number;
  total_amount_kobo: number;

  room_name: string;

  full_name: string;
  email: string;
  phone: string;
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

  /*
   * Do not send emails again if this booking
   * was already paid and confirmed.
   */
  if (
    booking.booking_status === "confirmed" &&
    booking.payment_status === "paid"
  ) {
    return Response.json({
      success: true,
      alreadyPaid: true,
      bookingReference: body.bookingReference,
      bookingStatus: "confirmed",
      paymentStatus: "paid",
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

  /*
   * Successful mock payment.
   *
   * Payment/booking confirmation happens BEFORE email.
   * Email failure must never undo a successful payment.
   */
  const updateResult = await db
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

  if (!updateResult.success || updateResult.meta.changes !== 1) {
    return Response.json(
      {
        success: false,
        error:
          "The booking could not be confirmed. Please check the booking status.",
      },
      { status: 409 }
    );
  }

  const confirmedBooking = await db
    .prepare(
      `
        SELECT
          b.booking_reference,
          b.check_in,
          b.check_out,
          b.adults,
          b.children,
          b.number_of_nights,
          b.total_amount_kobo,

          r.name AS room_name,

          g.full_name,
          g.email,
          g.phone

        FROM bookings b

        JOIN rooms r
          ON r.id = b.room_id

        JOIN guests g
          ON g.id = b.guest_id

        WHERE b.id = ?

        LIMIT 1
      `
    )
    .bind(booking.id)
    .first<ConfirmedBookingRow>();

  let emailSent = false;
  let emailWarning: string | null = null;

  if (confirmedBooking) {
    try {
      await sendBookingConfirmationEmails({
        bookingReference: confirmedBooking.booking_reference,
        guestName: confirmedBooking.full_name,
        guestEmail: confirmedBooking.email,
        guestPhone: confirmedBooking.phone,
        roomName: confirmedBooking.room_name,
        checkIn: confirmedBooking.check_in,
        checkOut: confirmedBooking.check_out,
        numberOfNights: confirmedBooking.number_of_nights,
        adults: confirmedBooking.adults,
        children: confirmedBooking.children,
        totalAmountKobo: confirmedBooking.total_amount_kobo,
      });

      emailSent = true;
    } catch (error) {
      console.error("Booking confirmed but email failed:", error);

      emailWarning =
        "Booking confirmed successfully, but the confirmation email could not be sent.";
    }
  } else {
    emailWarning =
      "Booking confirmed successfully, but booking details could not be loaded for email.";
  }

  return Response.json({
    success: true,
    bookingReference: body.bookingReference,
    bookingStatus: "confirmed",
    paymentStatus: "paid",
    amountPaidKobo: booking.total_amount_kobo,
    emailSent,
    emailWarning,
  });
}
