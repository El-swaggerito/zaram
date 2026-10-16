import Link from "next/link";
import { notFound } from "next/navigation";
import { env } from "cloudflare:workers";

import { formatNaira } from "@/data/rooms";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    reference: string;
  }>;
};

type BookingRow = {
  booking_reference: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  number_of_nights: number;
  total_amount_kobo: number;
  amount_paid_kobo: number;
  booking_status: string;
  payment_status: string;
  paid_at: string | null;
  room_name: string;
  room_slug: string;
  full_name: string;
  email: string;
  phone: string;
};

export default async function BookingConfirmationPage({
  params,
}: PageProps) {
  const { reference } = await params;

  const booking = await env.zaram_hotels_db
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
          b.amount_paid_kobo,
          b.booking_status,
          b.payment_status,
          b.paid_at,

          r.name AS room_name,
          r.slug AS room_slug,

          g.full_name,
          g.email,
          g.phone

        FROM bookings b

        JOIN rooms r
          ON r.id = b.room_id

        JOIN guests g
          ON g.id = b.guest_id

        WHERE b.booking_reference = ?

        LIMIT 1
      `
    )
    .bind(reference)
    .first<BookingRow>();

  if (!booking) {
    notFound();
  }

  const confirmed =
    booking.booking_status === "confirmed" &&
    booking.payment_status === "paid";

  return (
    <main className="min-h-screen bg-[#F7F3EA] pt-20">
      <section className="bg-[#00321F] py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#FFDF9D]">
            Reservation
          </p>

          <h1 className="mt-3 font-serif text-4xl font-semibold text-white md:text-6xl">
            {confirmed ? "Booking Confirmed" : "Payment Pending"}
          </h1>

          <p className="mt-4 text-sm leading-7 text-white/75">
            {confirmed
              ? "Your payment was successful and your room is now confirmed."
              : "This booking has not yet been confirmed by payment."}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <div className="border border-[#0B4A32]/10 bg-white p-7 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
              Booking Reference
            </p>

            <p className="mt-2 font-serif text-3xl font-semibold text-[#00321F]">
              {booking.booking_reference}
            </p>

            <div className="mt-8 space-y-4 border-y border-[#0B4A32]/10 py-6 text-sm">
              <div className="flex justify-between gap-6">
                <span className="text-[#404943]">Guest</span>
                <span className="font-semibold text-[#00321F]">
                  {booking.full_name}
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-[#404943]">Room</span>
                <span className="font-semibold text-[#00321F]">
                  {booking.room_name}
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-[#404943]">Check-in</span>
                <span className="font-semibold text-[#00321F]">
                  {booking.check_in}
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-[#404943]">Check-out</span>
                <span className="font-semibold text-[#00321F]">
                  {booking.check_out}
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-[#404943]">Nights</span>
                <span className="font-semibold text-[#00321F]">
                  {booking.number_of_nights}
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-[#404943]">Payment</span>
                <span className="font-semibold capitalize text-[#00321F]">
                  {booking.payment_status}
                </span>
              </div>
            </div>

            <div className="mt-7 flex items-end justify-between gap-6">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#404943]">
                Amount Paid
              </span>

              <span className="font-serif text-4xl font-semibold text-[#00321F]">
                {formatNaira(booking.amount_paid_kobo)}
              </span>
            </div>

            {confirmed && (
              <div className="mt-8 border border-[#0B4A32]/20 bg-[#EEF4EF] p-5">
                <p className="font-semibold text-[#0B4A32]">
                  Your reservation is confirmed.
                </p>

                <p className="mt-2 text-sm leading-6 text-[#404943]">
                  A booking confirmation has been sent to: {booking.email}
                </p>
              </div>
            )}

            {!confirmed && (
              <Link
                href={`/payment/${booking.booking_reference}`}
                className="zaram-button mt-8 inline-flex h-12 w-full items-center justify-center bg-[#0B4A32] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038]"
              >
                Return to Payment
              </Link>
            )}

            <Link
              href="/"
              className="mt-4 inline-flex h-12 w-full items-center justify-center border border-[#0B4A32]/20 px-8 text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]"
            >
              Return Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
