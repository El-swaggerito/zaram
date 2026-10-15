"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function MockPayment({ reference }: Props) {
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBooking() {
      try {
        const response = await fetch(`/api/bookings/${reference}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load booking.");
        }

        setBooking(data.booking);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load booking."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [reference]);

  async function mockPay(result: "success" | "failed") {
    setProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/payments/mock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingReference: reference,
          result,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Payment could not be completed.");
      }

      router.push(`/booking/confirmed/${reference}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Payment could not be completed."
      );
    } finally {
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
        Mock Payment
      </p>

      <h2 className="mt-3 font-serif text-3xl font-semibold text-[#00321F]">
        {booking.room_name}
      </h2>

      <div className="mt-7 space-y-4 border-y border-[#0B4A32]/10 py-6 text-sm">
        <div className="flex justify-between gap-6">
          <span className="text-[#404943]">Booking reference</span>
          <span className="font-semibold text-[#00321F]">
            {booking.booking_reference}
          </span>
        </div>

        <div className="flex justify-between gap-6">
          <span className="text-[#404943]">Guest</span>
          <span className="font-semibold text-[#00321F]">
            {booking.full_name}
          </span>
        </div>

        <div className="flex justify-between gap-6">
          <span className="text-[#404943]">Stay</span>
          <span className="font-semibold text-[#00321F]">
            {booking.check_in} → {booking.check_out}
          </span>
        </div>

        <div className="flex justify-between gap-6">
          <span className="text-[#404943]">Nights</span>
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
          {formatNaira(booking.total_amount_kobo)}
        </span>
      </div>

      {error && (
        <div className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 space-y-3">
        <button
          type="button"
          disabled={processing}
          onClick={() => mockPay("success")}
          className="zaram-button inline-flex h-12 w-full items-center justify-center bg-[#0B4A32] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038] disabled:opacity-60"
        >
          {processing ? "Processing..." : "Simulate Successful Payment"}
        </button>

        <button
          type="button"
          disabled={processing}
          onClick={() => mockPay("failed")}
          className="inline-flex h-12 w-full items-center justify-center border border-[#0B4A32]/20 px-8 text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]"
        >
          Simulate Failed Payment
        </button>
      </div>

      <p className="mt-5 text-center text-xs leading-5 text-[#404943]/60">
        Development payment simulator. This will later be replaced by Paystack.
      </p>
    </div>
  );
}
