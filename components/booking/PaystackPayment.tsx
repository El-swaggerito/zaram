"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { formatNaira } from "@/data/rooms";

type Props = {
  reference: string;
};

type Booking = {
  booking_reference: string;
  check_in: string;
  check_out: string;
  number_of_nights: number;
  total_amount_kobo: number;
  booking_status: string;
  payment_status: string;
  hold_expires_at: string | null;
  room_name: string;
  full_name: string;
};

type InitializeResponse = {
  success: boolean;
  alreadyPaid?: boolean;
  bookingReference?: string;
  payment?: {
    reference: string;
    authorizationUrl: string;
  };
  error?: string;
};

function paymentMessage(value: string | null) {
  switch (value) {
    case "abandoned":
      return "Payment was not completed. You can try again.";
    case "failed":
      return "Payment failed. No successful payment has been recorded.";
    case "pending":
    case "processing":
    case "ongoing":
    case "queued":
      return "Your payment is still being processed. Please try again shortly.";
    case "reversed":
      return "The payment was reversed. Please try another payment.";
    case "verification-error":
      return "We could not verify the payment with Paystack. Please try again.";
    case "verification-mismatch":
      return "The payment could not be matched safely to this booking. Please contact the hotel.";
    case "manual-review":
      return "Your payment requires manual review. Please contact the hotel before making another payment.";
    default:
      return "";
  }
}

export default function PaystackPayment({
  reference,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [booking, setBooking] =
    useState<Booking | null>(null);
  const [loading, setLoading] =
    useState(true);
  const [processing, setProcessing] =
    useState(false);
  const [error, setError] =
    useState("");

  const callbackMessage = paymentMessage(
    searchParams.get("payment")
  );

  useEffect(() => {
    async function loadBooking() {
      try {
        const response = await fetch(
          `/api/bookings/${encodeURIComponent(reference)}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              "Unable to load booking."
          );
        }

        setBooking(data.booking);

        if (
          data.booking.booking_status ===
            "confirmed" &&
          data.booking.payment_status ===
            "paid"
        ) {
          router.replace(
            `/booking/confirmed/${encodeURIComponent(reference)}`
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load booking."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [reference, router]);

  async function payWithPaystack() {
    setProcessing(true);
    setError("");

    try {
      const response = await fetch(
        "/api/payments/paystack/initialize",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            bookingReference:
              reference,
          }),
        }
      );

      const data =
        (await response.json()) as InitializeResponse;

      if (
        data.alreadyPaid &&
        data.bookingReference
      ) {
        router.push(
          `/booking/confirmed/${encodeURIComponent(
            data.bookingReference
          )}`
        );
        return;
      }

      if (
        !response.ok ||
        !data.success ||
        !data.payment?.authorizationUrl
      ) {
        throw new Error(
          data.error ||
            "Payment could not be initialised."
        );
      }

      /*
       * Redirect to Paystack's hosted checkout.
       * Card details never pass through the hotel website.
       */
      window.location.assign(
        data.payment.authorizationUrl
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Payment could not be initialised."
      );

      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="border border-[#0B4A32]/10 bg-white p-8">
        Loading booking...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="border border-red-200 bg-red-50 p-8 text-red-700">
        {error || "Booking not found."}
      </div>
    );
  }

  return (
    <div className="border border-[#0B4A32]/10 bg-white p-7 sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
        Secure Payment
      </p>

      <h2 className="mt-3 font-serif text-3xl font-semibold text-[#00321F]">
        {booking.room_name}
      </h2>

      <div className="mt-7 space-y-4 border-y border-[#0B4A32]/10 py-6 text-sm">
        <div className="flex justify-between gap-6">
          <span className="text-[#404943]">
            Booking reference
          </span>

          <span className="font-semibold text-[#00321F]">
            {booking.booking_reference}
          </span>
        </div>

        <div className="flex justify-between gap-6">
          <span className="text-[#404943]">
            Guest
          </span>

          <span className="font-semibold text-[#00321F]">
            {booking.full_name}
          </span>
        </div>

        <div className="flex justify-between gap-6">
          <span className="text-[#404943]">
            Stay
          </span>

          <span className="text-right font-semibold text-[#00321F]">
            {booking.check_in} →{" "}
            {booking.check_out}
          </span>
        </div>

        <div className="flex justify-between gap-6">
          <span className="text-[#404943]">
            Nights
          </span>

          <span className="font-semibold text-[#00321F]">
            {booking.number_of_nights}
          </span>
        </div>
      </div>

      <div className="mt-7 flex items-end justify-between gap-6">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#404943]">
          Amount Due
        </span>

        <span className="font-serif text-4xl font-semibold text-[#00321F]">
          {formatNaira(
            booking.total_amount_kobo
          )}
        </span>
      </div>

      {callbackMessage && !error && (
        <div className="mt-6 border border-[#B88923]/30 bg-[#FFDF9D]/20 p-4 text-sm leading-6 text-[#5D4717]">
          {callbackMessage}
        </div>
      )}

      {error && (
        <div className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        disabled={processing}
        onClick={payWithPaystack}
        className="zaram-button mt-8 inline-flex h-12 w-full items-center justify-center bg-[#0B4A32] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {processing
          ? "Connecting to Paystack..."
          : `Pay ${formatNaira(
              booking.total_amount_kobo
            )} securely`}
      </button>

      <p className="mt-5 text-center text-xs leading-5 text-[#404943]/60">
        Secure payment powered by Paystack. Your payment details are handled by Paystack and are not stored by Zaram Hotels & Garden.
      </p>
    </div>
  );
}
