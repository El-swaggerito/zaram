import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "cloudflare:workers";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import { getCurrentAdmin } from "@/lib/admin-session";
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

type RecentBooking = {
  booking_reference: string;
  room_name: string;
  full_name: string;
  check_in: string;
  check_out: string;
  booking_status: string;
  payment_status: string;
  total_amount_kobo: number;
  created_at: string;
};

function getTodayInNigeria() {
  const parts = new Intl.DateTimeFormat("en-GB", {
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

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function statusClasses(status: string) {
  switch (status) {
    case "confirmed":
    case "paid":
    case "checked_in":
      return "bg-[#E7F2EB] text-[#0B4A32]";

    case "pending":
    case "unpaid":
      return "bg-[#FFF4D6] text-[#8A671C]";

    case "cancelled":
    case "no_show":
      return "bg-red-50 text-red-700";

    case "checked_out":
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default async function AdminDashboardPage() {
  const requestHeaders = await headers();

  const admin = await getCurrentAdmin(
    requestHeaders.get("cookie")
  );

  if (!admin) {
    redirect("/admin/login");
  }

  const db = env.zaram_hotels_db;
  const today = getTodayInNigeria();

  const [
    roomCount,
    occupiedCount,
    arrivalsCount,
    departuresCount,
    paidRevenue,
    activeBookings,
    pendingHolds,
    recentBookingsResult,
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
          SELECT COALESCE(SUM(amount_paid_kobo), 0) AS total
          FROM bookings
          WHERE payment_status = 'paid'
        `
      )
      .first<RevenueRow>(),

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
          SELECT
            b.booking_reference,
            r.name AS room_name,
            g.full_name,
            b.check_in,
            b.check_out,
            b.booking_status,
            b.payment_status,
            b.total_amount_kobo,
            b.created_at

          FROM bookings b

          JOIN rooms r
            ON r.id = b.room_id

          JOIN guests g
            ON g.id = b.guest_id

          ORDER BY datetime(b.created_at) DESC

          LIMIT 8
        `
      )
      .all<RecentBooking>(),
  ]);

  const totalRooms = roomCount?.count ?? 0;
  const occupiedRooms = occupiedCount?.count ?? 0;

  const occupancy =
    totalRooms > 0
      ? Math.round((occupiedRooms / totalRooms) * 100)
      : 0;

  const recentBookings = recentBookingsResult.results;

  return (
    <main className="min-h-screen bg-[#F4F1E9]">
<div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-6 lg:px-10">
{/* KPI CARDS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="border border-[#0B4A32]/10 bg-white p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B746F]">
              Occupancy Today
            </p>

            <p className="mt-4 font-serif text-4xl font-semibold text-[#00321F]">
              {occupancy}%
            </p>

            <p className="mt-2 text-sm text-[#606963]">
              {occupiedRooms} of {totalRooms} rooms
            </p>
          </div>

          <div className="border border-[#0B4A32]/10 bg-white p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B746F]">
              Arrivals Today
            </p>

            <p className="mt-4 font-serif text-4xl font-semibold text-[#00321F]">
              {arrivalsCount?.count ?? 0}
            </p>

            <p className="mt-2 text-sm text-[#606963]">
              Scheduled check-ins
            </p>
          </div>

          <div className="border border-[#0B4A32]/10 bg-white p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B746F]">
              Departures Today
            </p>

            <p className="mt-4 font-serif text-4xl font-semibold text-[#00321F]">
              {departuresCount?.count ?? 0}
            </p>

            <p className="mt-2 text-sm text-[#606963]">
              Scheduled check-outs
            </p>
          </div>

          <div className="border border-[#0B4A32]/10 bg-[#EAE1D5] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B746F]">
              Paid Revenue
            </p>

            <p className="mt-4 font-serif text-3xl font-semibold text-[#00321F]">
              {formatNaira(paidRevenue?.total ?? 0)}
            </p>

            <p className="mt-2 text-sm text-[#606963]">
              Recorded paid bookings
            </p>
          </div>
        </section>

        {/* SECONDARY STATS */}
        <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="flex items-center justify-between border border-[#0B4A32]/10 bg-white p-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B746F]">
                Active Bookings
              </p>

              <p className="mt-2 text-sm text-[#606963]">
                Confirmed or checked-in
              </p>
            </div>

            <p className="font-serif text-4xl font-semibold text-[#00321F]">
              {activeBookings?.count ?? 0}
            </p>
          </div>

          <div className="flex items-center justify-between border border-[#0B4A32]/10 bg-white p-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B746F]">
                Payment Holds
              </p>

              <p className="mt-2 text-sm text-[#606963]">
                Active temporary reservations
              </p>
            </div>

            <p className="font-serif text-4xl font-semibold text-[#B88923]">
              {pendingHolds?.count ?? 0}
            </p>
          </div>
        </section>

        {/* RECENT BOOKINGS */}
        <section className="mt-10 border border-[#0B4A32]/10 bg-white">

          <div className="flex items-center justify-between border-b border-[#0B4A32]/10 px-6 py-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B88923]">
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

          {recentBookings.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-[#606963]">
              No bookings have been recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-[#0B4A32]/10 bg-[#F7F3EA]">
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#69736D]">
                      Reference
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#69736D]">
                      Guest
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#69736D]">
                      Room
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#69736D]">
                      Stay
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#69736D]">
                      Booking
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#69736D]">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[#69736D]">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentBookings.map((booking) => (
                    <tr
                      key={booking.booking_reference}
                      className="border-b border-[#0B4A32]/8 last:border-b-0"
                    >
                      <td className="px-6 py-5 text-sm font-semibold text-[#00321F]">
                        {booking.booking_reference}
                      </td>

                      <td className="px-6 py-5 text-sm text-[#404943]">
                        {booking.full_name}
                      </td>

                      <td className="px-6 py-5 text-sm text-[#404943]">
                        {booking.room_name}
                      </td>

                      <td className="px-6 py-5 text-xs leading-6 text-[#606963]">
                        {formatDisplayDate(booking.check_in)}
                        <br />
                        {formatDisplayDate(booking.check_out)}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${statusClasses(
                            booking.booking_status
                          )}`}
                        >
                          {booking.booking_status.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${statusClasses(
                            booking.payment_status
                          )}`}
                        >
                          {booking.payment_status.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right text-sm font-semibold text-[#00321F]">
                        {formatNaira(booking.total_amount_kobo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
