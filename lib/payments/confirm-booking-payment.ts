import { env } from "cloudflare:workers";

import { sendBookingConfirmationEmails } from "@/lib/email";

type PaymentProvider = "mock" | "paystack";

type ConfirmBookingPaymentInput = {
  bookingReference: string;
  paymentReference: string;
  paymentProvider: PaymentProvider;
  amountPaidKobo: number;
  paidAt: string | null;
  providerTransactionId?: string | null;
  gatewayResponse?: string | null;
};

type BookingRow = {
  id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  total_amount_kobo: number;
  booking_status: string;
  payment_status: string;
  payment_provider: string | null;
  payment_reference: string | null;
};

type PaymentAttemptRow = {
  id: number;
  booking_id: number;
  amount_kobo: number;
  currency: string;
  status: string;
};

type ConfirmedBookingRow = {
  booking_reference: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  number_of_nights: number;
  total_amount_kobo: number;
  payment_provider: string | null;
  payment_reference: string | null;
  paid_at: string | null;

  room_name: string;

  full_name: string;
  email: string;
  phone: string;
};

export async function confirmBookingPayment(
  input: ConfirmBookingPaymentInput
) {
  const db = env.zaram_hotels_db;

  const booking = await db
    .prepare(
      `
        SELECT
          id,
          room_id,
          check_in,
          check_out,
          total_amount_kobo,
          booking_status,
          payment_status,
          payment_provider,
          payment_reference
        FROM bookings
        WHERE booking_reference = ?
        LIMIT 1
      `
    )
    .bind(input.bookingReference)
    .first<BookingRow>();

  if (!booking) {
    return {
      success: false as const,
      code: "booking_not_found",
      error: "Booking not found.",
    };
  }

  /*
   * Amount must always match the authoritative booking total.
   */
  if (
    !Number.isInteger(input.amountPaidKobo) ||
    input.amountPaidKobo !== booking.total_amount_kobo
  ) {
    return {
      success: false as const,
      code: "amount_mismatch",
      error: "Payment amount does not match the booking total.",
    };
  }

  /*
   * Idempotency.
   *
   * Callback and webhook may both arrive for the same payment.
   * Once the exact transaction has already confirmed this booking,
   * return success without sending the emails again.
   */
  if (
    booking.booking_status === "confirmed" &&
    booking.payment_status === "paid"
  ) {
    if (
      booking.payment_provider === input.paymentProvider &&
      booking.payment_reference === input.paymentReference
    ) {
      return {
        success: true as const,
        alreadyPaid: true,
        bookingReference: input.bookingReference,
        bookingStatus: "confirmed",
        paymentStatus: "paid",
        amountPaidKobo: booking.total_amount_kobo,
        emailSent: false,
        emailWarning: null,
      };
    }

    return {
      success: false as const,
      code: "already_paid_different_transaction",
      error: "This booking has already been paid.",
    };
  }

  if (
    booking.booking_status !== "pending" ||
    booking.payment_status !== "unpaid"
  ) {
    return {
      success: false as const,
      code: "invalid_booking_state",
      error: "This booking is not awaiting payment.",
    };
  }

  /*
   * Paystack transactions must correspond to a payment attempt
   * that we created before redirecting the guest to Paystack.
   */
  let paymentAttempt: PaymentAttemptRow | null = null;

  if (input.paymentProvider === "paystack") {
    paymentAttempt = await db
      .prepare(
        `
          SELECT
            id,
            booking_id,
            amount_kobo,
            currency,
            status
          FROM payment_transactions
          WHERE reference = ?
          LIMIT 1
        `
      )
      .bind(input.paymentReference)
      .first<PaymentAttemptRow>();

    if (!paymentAttempt) {
      return {
        success: false as const,
        code: "payment_attempt_not_found",
        error: "Payment transaction was not initialised by this booking system.",
      };
    }

    if (paymentAttempt.booking_id !== booking.id) {
      return {
        success: false as const,
        code: "payment_booking_mismatch",
        error: "Payment transaction does not belong to this booking.",
      };
    }

    if (
      paymentAttempt.amount_kobo !== booking.total_amount_kobo ||
      paymentAttempt.currency !== "NGN"
    ) {
      return {
        success: false as const,
        code: "payment_attempt_mismatch",
        error: "Payment transaction does not match the booking.",
      };
    }
  }

  /*
   * A Paystack checkout may finish moments after the original hold
   * expires. A successful payment should still be honoured if the
   * physical room has not subsequently been confirmed for somebody
   * else and has not been blocked by management.
   *
   * The UPDATE performs the conflict recheck and state transition
   * together so two payments cannot both confirm the same room.
   */
  const confirmStatement = db
    .prepare(
      `
        UPDATE bookings
        SET
          booking_status = 'confirmed',
          payment_status = 'paid',
          amount_paid_kobo = total_amount_kobo,
          payment_provider = ?,
          payment_reference = ?,
          paid_at = ?,
          hold_expires_at = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE
          id = ?
          AND booking_status = 'pending'
          AND payment_status = 'unpaid'

          AND NOT EXISTS (
            SELECT 1
            FROM bookings other
            WHERE
              other.id <> bookings.id
              AND other.room_id = bookings.room_id
              AND other.booking_status IN (
                'confirmed',
                'checked_in'
              )
              AND other.check_in < bookings.check_out
              AND other.check_out > bookings.check_in
          )

          AND NOT EXISTS (
            SELECT 1
            FROM room_blocks rb
            WHERE
              rb.room_id = bookings.room_id
              AND rb.start_date < bookings.check_out
              AND rb.end_date > bookings.check_in
          )
      `
    )
    .bind(
      input.paymentProvider,
      input.paymentReference,
      input.paidAt || new Date().toISOString(),
      booking.id
    );

  let confirmResult;

  if (input.paymentProvider === "paystack") {
    const paymentStatement = db
      .prepare(
        `
          UPDATE payment_transactions
          SET
            status = 'success',
            provider_transaction_id = ?,
            gateway_response = ?,
            paid_at = ?,
            verified_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE
            id = ?
            AND booking_id = ?
            AND reference = ?
        `
      )
      .bind(
        input.providerTransactionId || null,
        input.gatewayResponse || null,
        input.paidAt || new Date().toISOString(),
        paymentAttempt!.id,
        booking.id,
        input.paymentReference
      );

    /*
     * D1 batch statements execute in one SQL transaction.
     */
    const results = await db.batch([
      confirmStatement,
      paymentStatement,
    ]);

    confirmResult = results[0];
  } else {
    confirmResult = await confirmStatement.run();
  }

  /*
   * Another request may have confirmed the booking between
   * our initial SELECT and UPDATE, or a room conflict may now exist.
   */
  if (
    !confirmResult.success ||
    confirmResult.meta.changes !== 1
  ) {
    const currentBooking = await db
      .prepare(
        `
          SELECT
            booking_status,
            payment_status,
            payment_provider,
            payment_reference
          FROM bookings
          WHERE id = ?
          LIMIT 1
        `
      )
      .bind(booking.id)
      .first<{
        booking_status: string;
        payment_status: string;
        payment_provider: string | null;
        payment_reference: string | null;
      }>();

    if (
      currentBooking?.booking_status === "confirmed" &&
      currentBooking.payment_status === "paid" &&
      currentBooking.payment_provider === input.paymentProvider &&
      currentBooking.payment_reference === input.paymentReference
    ) {
      return {
        success: true as const,
        alreadyPaid: true,
        bookingReference: input.bookingReference,
        bookingStatus: "confirmed",
        paymentStatus: "paid",
        amountPaidKobo: booking.total_amount_kobo,
        emailSent: false,
        emailWarning: null,
      };
    }

    return {
      success: false as const,
      code: "booking_conflict",
      paymentRecorded:
        input.paymentProvider === "paystack",
      error:
        "Payment was received, but the booking could not be confirmed automatically because the room is no longer available. Management assistance is required.",
    };
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
          b.payment_provider,
          b.payment_reference,
          b.paid_at,

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

  /*
   * The successful database update is authoritative.
   * Email failure must never reverse the payment or booking.
   */
  if (confirmedBooking) {
    try {
      await sendBookingConfirmationEmails({
        bookingReference:
          confirmedBooking.booking_reference,
        guestName:
          confirmedBooking.full_name,
        guestEmail:
          confirmedBooking.email,
        guestPhone:
          confirmedBooking.phone,
        roomName:
          confirmedBooking.room_name,
        checkIn:
          confirmedBooking.check_in,
        checkOut:
          confirmedBooking.check_out,
        numberOfNights:
          confirmedBooking.number_of_nights,
        adults:
          confirmedBooking.adults,
        children:
          confirmedBooking.children,
        totalAmountKobo:
          confirmedBooking.total_amount_kobo,
        paymentReference:
          confirmedBooking.payment_reference,
        paymentProvider:
          confirmedBooking.payment_provider,
        paidAt:
          confirmedBooking.paid_at,
      });

      emailSent = true;
    } catch (error) {
      console.error(
        "Booking confirmed but email failed:",
        error
      );

      emailWarning =
        "Booking confirmed successfully, but one or more confirmation emails could not be sent.";
    }
  } else {
    emailWarning =
      "Booking confirmed successfully, but booking details could not be loaded for email.";
  }

  return {
    success: true as const,
    alreadyPaid: false,
    bookingReference: input.bookingReference,
    bookingStatus: "confirmed",
    paymentStatus: "paid",
    amountPaidKobo: booking.total_amount_kobo,
    emailSent,
    emailWarning,
  };
}
