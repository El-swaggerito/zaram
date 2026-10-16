import type { Metadata } from "next";
import Link from "next/link";
import { env } from "cloudflare:workers";

import { formatNaira } from "@/data/rooms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

type CountRow = {
  count: number;
};

type RevenueRow = {
  total: number | null;
};

type OperationalBooking = {
  booking_reference: string;
  guest_name: string;
  phone: string;
  room_name: string;
  check_in: string;
  check_out: string;
  booking_status: string;
  payment_status: string;
};

type RecentBooking = {
  booking_reference: string;
  guest_name: string;
  room_name: string;
  check_in: string;
  check_out: string;
  booking_status: string;
  payment_status: string;
  total_amount_kobo: number;
};

function getTodayNigeria() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

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

export default async function AdminDashboardPage() {
  const db = env.zaram_hotels_db;
  const today = getTodayNigeria();

  const [
    roomCount,
    occupiedCount,
    arrivalsCount,
    departuresCount,
    activeBookingsCount,
    holdCount,
    revenue,
    arrivalsResult,
    departuresResult,
    recentResult,
  ] = await Promise.all([
    db
      .prepare(
        `
          SELECT COUNT(*) AS count
          FROM rooms
          WHERE is_active = 1
        `
      )
      .first<CountRow>(),

    db
      .prepare(
        `
          SELECT COUNT(DISTINCT room_id) AS count
          FROM bookings
          WHERE
            booking_status IN ('confirmed', 'checked_in')
            AND check_in <= ?
            AND check_out > ?
        `
      )
      .bind(today, today)
      .first<CountRow>(),

    db
      .prepare(
        `
          SELECT COUNT(*) AS count
          FROM bookings
          WHERE
            check_in = ?
            AND booking_status IN ('confirmed', 'checked_in')
        `
      )
      .bind(today)
      .first<CountRow>(),

    db
      .prepare(
        `
          SELECT COUNT(*) AS count
          FROM bookings
          WHERE
            check_out = ?
            AND booking_status IN (
              'confirmed',
              'checked_in',
              'checked_out'
            )
        `
      )
      .bind(today)
      .first<CountRow>(),

    db
      .prepare(
        `
          SELECT COUNT(*) AS count
          FROM bookings
          WHERE booking_status IN ('confirmed', 'checked_in')
        `
      )
      .first<CountRow>(),

    db
      .prepare(
        `
          SELECT COUNT(*) AS count
          FROM bookings
          WHERE
            booking_status = 'pending'
            AND hold_expires_at IS NOT NULL
            AND datetime(hold_expires_at) > datetime('now')
        `
      )
      .first<CountRow>(),

    db
      .prepare(
        `
          SELECT COALESCE(SUM(amount_paid_kobo), 0) AS total
          FROM bookings
          WHERE payment_status = 'paid'
        `
      )
      .first<RevenueRow>(),

    db
      .prepare(
        `
          SELECT
            b.booking_reference,
            g.full_name AS guest_name,
            g.phone,
            r.name AS room_name,
            b.check_in,
            b.check_out,
            b.booking_status,
            b.payment_status

          FROM bookings b

          JOIN guests g
            ON g.id = b.guest_id

          JOIN rooms r
            ON r.id = b.room_id

          WHERE
            b.check_in = ?
            AND b.booking_status IN (
              'confirmed',
              'checked_in'
            )

          ORDER BY r.name ASC
        `
      )
      .bind(today)
      .all<OperationalBooking>(),

    db
      .prepare(
        `
          SELECT
            b.booking_reference,
            g.full_name AS guest_name,
            g.phone,
            r.name AS room_name,
            b.check_in,
            b.check_out,
            b.booking_status,
            b.payment_status

          FROM bookings b

          JOIN guests g
            ON g.id = b.guest_id

          JOIN rooms r
            ON r.id = b.room_id

          WHERE
            b.check_out = ?
            AND b.booking_status IN (
              'confirmed',
              'checked_in',
              'checked_out'
            )

          ORDER BY r.name ASC
        `
      )
      .bind(today)
      .all<OperationalBooking>(),

    db
      .prepare(
        `
          SELECT
            b.booking_reference,
            g.full_name AS guest_name,
            r.name AS room_name,
            b.check_in,
            b.check_out,
            b.booking_status,
            b.payment_status,
            b.total_amount_kobo

          FROM bookings b

          JOIN guests g
            ON g.id = b.guest_id

          JOIN rooms r
            ON r.id = b.room_id

          ORDER BY datetime(b.created_at) DESC

          LIMIT 6
        `
      )
      .all<RecentBooking>(),
  ]);

  const totalRooms = roomCount?.count ?? 0;
  const occupiedRooms = occupiedCount?.count ?? 0;

  const occupancy =
    totalRooms > 0
      ? Math.round(
          (occupiedRooms / totalRooms) * 100
        )
      : 0;

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-10 sm:px-6 lg:px-10">

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="border border-[#0B4A32]/10 bg-white p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#68726C]">
            Occupancy Today
          </p>

          <p className="mt-3 font-serif text-4xl font-semibold text-[#00321F]">
            {occupancy}%
          </p>

          <p className="mt-2 text-sm text-[#606963]">
            {occupiedRooms} of {totalRooms} rooms
          </p>
        </div>

        <div className="border border-[#0B4A32]/10 bg-white p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#68726C]">
            Arrivals Today
          </p>

          <p className="mt-3 font-serif text-4xl font-semibold text-[#00321F]">
            {arrivalsCount?.count ?? 0}
          </p>

          <p className="mt-2 text-sm text-[#606963]">
            Scheduled check-ins
          </p>
        </div>

        <div className="border border-[#0B4A32]/10 bg-white p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#68726C]">
            Departures Today
          </p>

          <p className="mt-3 font-serif text-4xl font-semibold text-[#00321F]">
            {departuresCount?.count ?? 0}
          </p>

          <p className="mt-2 text-sm text-[#606963]">
            Scheduled check-outs
          </p>
        </div>

        <div className="border border-[#0B4A32]/10 bg-[#EAE1D5] p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#68726C]">
            Paid Revenue
          </p>

          <p className="mt-3 font-serif text-3xl font-semibold text-[#00321F]">
            {formatNaira(revenue?.total ?? 0)}
          </p>

          <p className="mt-2 text-sm text-[#606963]">
            Recorded paid bookings
          </p>
        </div>
      </section>

      {/* SECONDARY KPIs */}
      <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

        <div className="flex items-center justify-between border border-[#0B4A32]/10 bg-white p-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#68726C]">
              Active Bookings
            </p>

            <p className="mt-2 text-sm text-[#606963]">
              Confirmed or checked in
            </p>
          </div>

          <p className="font-serif text-4xl font-semibold text-[#00321F]">
            {activeBookingsCount?.count ?? 0}
          </p>
        </div>

        <div className="flex items-center justify-between border border-[#0B4A32]/10 bg-white p-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#68726C]">
              Payment Holds
            </p>

            <p className="mt-2 text-sm text-[#606963]">
              Active temporary reservations
            </p>
          </div>

          <p className="font-serif text-4xl font-semibold text-[#B88923]">
            {holdCount?.count ?? 0}
          </p>
        </div>
      </section>

      {/* TODAY */}
      <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* ARRIVALS */}
        <div className="border border-[#0B4A32]/10 bg-white">
          <div className="flex items-center justify-between border-b border-[#0B4A32]/10 p-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B88923]">
                Front Desk
              </p>

              <h2 className="mt-1 font-serif text-2xl font-semibold text-[#00321F]">
                Today&apos;s Arrivals
              </h2>
            </div>

            <span className="font-serif text-3xl font-semibold text-[#00321F]">
              {arrivalsResult.results.length}
            </span>
          </div>

          {arrivalsResult.results.length === 0 ? (
            <p className="p-8 text-sm text-[#606963]">
              No arrivals scheduled today.
            </p>
          ) : (
            <div className="divide-y divide-[#0B4A32]/10">
              {arrivalsResult.results.map(
                (booking) => (
                  <Link
                    key={booking.booking_reference}
                    href={`/admin/bookings/${booking.booking_reference}`}
                    className="flex items-center justify-between gap-5 p-5 transition hover:bg-[#F7F3EA]"
                  >
                    <div>
                      <p className="font-semibold text-[#00321F]">
                        {booking.guest_name}
                      </p>

                      <p className="mt-1 text-sm text-[#606963]">
                        {booking.room_name}
                      </p>

                      <p className="mt-1 text-xs text-[#8A918D]">
                        {booking.phone}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${statusClasses(
                          booking.booking_status
                        )}`}
                      >
                        {booking.booking_status.replaceAll(
                          "_",
                          " "
                        )}
                      </span>

                      <p className="mt-2 text-xs font-semibold text-[#00321F]">
                        {booking.booking_reference}
                      </p>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </div>

        {/* DEPARTURES */}
        <div className="border border-[#0B4A32]/10 bg-white">
          <div className="flex items-center justify-between border-b border-[#0B4A32]/10 p-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B88923]">
                Front Desk
              </p>

              <h2 className="mt-1 font-serif text-2xl font-semibold text-[#00321F]">
                Today&apos;s Departures
              </h2>
            </div>

            <span className="font-serif text-3xl font-semibold text-[#00321F]">
              {departuresResult.results.length}
            </span>
          </div>

          {departuresResult.results.length === 0 ? (
            <p className="p-8 text-sm text-[#606963]">
              No departures scheduled today.
            </p>
          ) : (
            <div className="divide-y divide-[#0B4A32]/10">
              {departuresResult.results.map(
                (booking) => (
                  <Link
                    key={booking.booking_reference}
                    href={`/admin/bookings/${booking.booking_reference}`}
                    className="flex items-center justify-between gap-5 p-5 transition hover:bg-[#F7F3EA]"
                  >
                    <div>
                      <p className="font-semibold text-[#00321F]">
                        {booking.guest_name}
                      </p>

                      <p className="mt-1 text-sm text-[#606963]">
                        {booking.room_name}
                      </p>

                      <p className="mt-1 text-xs text-[#8A918D]">
                        {booking.phone}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${statusClasses(
                          booking.booking_status
                        )}`}
                      >
                        {booking.booking_status.replaceAll(
                          "_",
                          " "
                        )}
                      </span>

                      <p className="mt-2 text-xs font-semibold text-[#00321F]">
                        {booking.booking_reference}
                      </p>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* RECENT */}
      <section className="mt-8 border border-[#0B4A32]/10 bg-white">
        <div className="flex items-center justify-between border-b border-[#0B4A32]/10 p-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B88923]">
              Reservations
            </p>

            <h2 className="mt-1 font-serif text-2xl font-semibold text-[#00321F]">
              Recent Bookings
            </h2>
          </div>

          <Link
            href="/admin/bookings"
            className="text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]"
          >
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="bg-[#EAE1D5]">
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.12em] text-[#59645E]">
                  Reference
                </th>

                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.12em] text-[#59645E]">
                  Guest
                </th>

                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.12em] text-[#59645E]">
                  Room
                </th>

                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.12em] text-[#59645E]">
                  Stay
                </th>

                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.12em] text-[#59645E]">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-[10px] uppercase tracking-[0.12em] text-[#59645E]">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {recentResult.results.map(
                (booking) => (
                  <tr
                    key={booking.booking_reference}
                    className="border-b border-[#0B4A32]/8 last:border-0"
                  >
                    <td className="px-6 py-5">
                      <Link
                        href={`/admin/bookings/${booking.booking_reference}`}
                        className="font-semibold text-[#00321F] hover:text-[#B88923]"
                      >
                        {booking.booking_reference}
                      </Link>
                    </td>

                    <td className="px-6 py-5 text-sm text-[#404943]">
                      {booking.guest_name}
                    </td>

                    <td className="px-6 py-5 text-sm text-[#404943]">
                      {booking.room_name}
                    </td>

                    <td className="px-6 py-5 text-xs leading-5 text-[#606963]">
                      {formatDate(booking.check_in)}
                      <br />
                      {formatDate(booking.check_out)}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${statusClasses(
                          booking.booking_status
                        )}`}
                      >
                        {booking.booking_status.replaceAll(
                          "_",
                          " "
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-right font-semibold text-[#00321F]">
                      {formatNaira(
                        booking.total_amount_kobo
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
