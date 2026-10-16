import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { env } from "cloudflare:workers";

import { formatNaira } from "@/data/rooms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guest Details",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  params: Promise<{
    guestKey: string;
  }>;
};

type GuestProfile = {
  full_name: string;
  email: string;
  phone: string;
  nationality: string | null;
};

type BookingRow = {
  booking_reference: string;
  room_name: string;
  check_in: string;
  check_out: string;
  number_of_nights: number;
  adults: number;
  children: number;
  booking_status: string;
  payment_status: string;
  total_amount_kobo: number;
  amount_paid_kobo: number;
  special_requests: string | null;
  created_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function statusClasses(status: string) {
  if (
    status === "confirmed" ||
    status === "checked_in" ||
    status === "paid"
  ) {
    return "bg-[#E7F2EB] text-[#0B4A32]";
  }

  if (
    status === "pending" ||
    status === "unpaid" ||
    status === "part_paid"
  ) {
    return "bg-[#FFF4D6] text-[#8A671C]";
  }

  if (
    status === "cancelled" ||
    status === "no_show"
  ) {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
}

export default async function GuestDetailsPage({
  params,
}: PageProps) {
  const { guestKey } = await params;
  const key = decodeURIComponent(guestKey).toLowerCase();

  const db = env.zaram_hotels_db;

  const guest = await db
    .prepare(
      `
        SELECT
          full_name,
          email,
          phone,
          nationality
        FROM guests
        WHERE LOWER(TRIM(email)) = ?
        ORDER BY id DESC
        LIMIT 1
      `
    )
    .bind(key)
    .first<GuestProfile>();

  if (!guest) {
    notFound();
  }

  const bookingsResult = await db
    .prepare(
      `
        SELECT
          b.booking_reference,
          r.name AS room_name,
          b.check_in,
          b.check_out,
          b.number_of_nights,
          b.adults,
          b.children,
          b.booking_status,
          b.payment_status,
          b.total_amount_kobo,
          b.amount_paid_kobo,
          b.special_requests,
          b.created_at

        FROM bookings b

        JOIN guests g
          ON g.id = b.guest_id

        JOIN rooms r
          ON r.id = b.room_id

        WHERE LOWER(TRIM(g.email)) = ?

        ORDER BY
          b.check_in DESC,
          datetime(b.created_at) DESC
      `
    )
    .bind(key)
    .all<BookingRow>();

  const bookings = bookingsResult.results;

  const totalPaid = bookings.reduce(
    (sum, booking) =>
      sum + booking.amount_paid_kobo,
    0
  );

  const totalNights = bookings.reduce(
    (sum, booking) => {
      if (
        booking.booking_status === "cancelled" ||
        booking.booking_status === "no_show"
      ) {
        return sum;
      }

      return sum + booking.number_of_nights;
    },
    0
  );

  const completedStays = bookings.filter(
    (booking) =>
      booking.booking_status === "checked_out"
  ).length;

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-10 sm:px-6 lg:px-10">
      <div className="mb-6">
        <Link
          href="/admin/guests"
          className="text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]"
        >
          ← Guest Directory
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="border border-[#0B4A32]/10 bg-white p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B88923]">
              Guest Profile
            </p>

            <h2 className="mt-3 font-serif text-3xl font-semibold text-[#00321F]">
              {guest.full_name}
            </h2>

            <div className="mt-7 space-y-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A817D]">
                  Email
                </p>

                <a
                  href={`mailto:${guest.email}`}
                  className="mt-1 block break-all text-sm text-[#00321F]"
                >
                  {guest.email}
                </a>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A817D]">
                  Phone
                </p>

                <a
                  href={`tel:${guest.phone}`}
                  className="mt-1 block text-sm text-[#00321F]"
                >
                  {guest.phone}
                </a>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A817D]">
                  Nationality
                </p>

                <p className="mt-1 text-sm text-[#00321F]">
                  {guest.nationality || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="border border-[#0B4A32]/10 bg-white p-5">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#68726C]">
                Bookings
              </p>

              <p className="mt-2 font-serif text-3xl font-semibold text-[#00321F]">
                {bookings.length}
              </p>
            </div>

            <div className="border border-[#0B4A32]/10 bg-white p-5">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#68726C]">
                Completed
              </p>

              <p className="mt-2 font-serif text-3xl font-semibold text-[#00321F]">
                {completedStays}
              </p>
            </div>

            <div className="border border-[#0B4A32]/10 bg-white p-5">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#68726C]">
                Nights
              </p>

              <p className="mt-2 font-serif text-3xl font-semibold text-[#00321F]">
                {totalNights}
              </p>
            </div>

            <div className="border border-[#0B4A32]/10 bg-[#EAE1D5] p-5">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#68726C]">
                Total Paid
              </p>

              <p className="mt-2 font-serif text-2xl font-semibold text-[#00321F]">
                {formatNaira(totalPaid)}
              </p>
            </div>
          </div>

          <section className="border border-[#0B4A32]/10 bg-white">
            <div className="border-b border-[#0B4A32]/10 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                History
              </p>

              <h3 className="mt-2 font-serif text-2xl font-semibold text-[#00321F]">
                Reservations
              </h3>
            </div>

            {bookings.length === 0 ? (
              <p className="p-8 text-sm text-[#606963]">
                No reservations found.
              </p>
            ) : (
              <div className="divide-y divide-[#0B4A32]/10">
                {bookings.map((booking) => (
                  <div
                    key={booking.booking_reference}
                    className="p-6"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div>
                        <Link
                          href={`/admin/bookings/${booking.booking_reference}`}
                          className="font-semibold text-[#00321F] hover:text-[#B88923]"
                        >
                          {booking.booking_reference}
                        </Link>

                        <p className="mt-2 font-serif text-xl font-semibold text-[#00321F]">
                          {booking.room_name}
                        </p>

                        <p className="mt-2 text-sm text-[#606963]">
                          {formatDate(booking.check_in)}
                          {" → "}
                          {formatDate(booking.check_out)}
                        </p>

                        <p className="mt-1 text-xs text-[#7A817D]">
                          {booking.number_of_nights} night
                          {booking.number_of_nights === 1
                            ? ""
                            : "s"}
                          {" · "}
                          {booking.adults} adult
                          {booking.adults === 1 ? "" : "s"}

                          {booking.children > 0
                            ? ` · ${booking.children} child${
                                booking.children === 1
                                  ? ""
                                  : "ren"
                              }`
                            : ""}
                        </p>
                      </div>

                      <div className="md:text-right">
                        <div className="flex flex-wrap gap-2 md:justify-end">
                          <span
                            className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${statusClasses(
                              booking.booking_status
                            )}`}
                          >
                            {booking.booking_status.replaceAll(
                              "_",
                              " "
                            )}
                          </span>

                          <span
                            className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${statusClasses(
                              booking.payment_status
                            )}`}
                          >
                            {booking.payment_status.replaceAll(
                              "_",
                              " "
                            )}
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-semibold text-[#00321F]">
                          {formatNaira(
                            booking.total_amount_kobo
                          )}
                        </p>

                        <p className="mt-1 text-xs text-[#606963]">
                          Paid{" "}
                          {formatNaira(
                            booking.amount_paid_kobo
                          )}
                        </p>
                      </div>
                    </div>

                    {booking.special_requests && (
                      <div className="mt-5 bg-[#F7F3EA] p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.10em] text-[#7A817D]">
                          Guest Request
                        </p>

                        <p className="mt-2 text-sm leading-6 text-[#404943]">
                          {booking.special_requests}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
