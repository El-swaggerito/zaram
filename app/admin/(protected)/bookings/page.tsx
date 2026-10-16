import type { Metadata } from "next";
import { env } from "cloudflare:workers";

import { formatNaira } from "@/data/rooms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bookings",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    payment?: string;
    room?: string;
  }>;
};

type BookingRow = {
  booking_reference: string;
  full_name: string;
  email: string;
  phone: string;
  room_name: string;
  room_slug: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  number_of_nights: number;
  total_amount_kobo: number;
  amount_paid_kobo: number;
  booking_status: string;
  payment_status: string;
  hold_expires_at: string | null;
  created_at: string;
};

type RoomRow = {
  name: string;
  slug: string;
};

const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
  "no_show",
];

const PAYMENT_STATUSES = [
  "unpaid",
  "part_paid",
  "paid",
  "refunded",
];

function formatDate(value: string) {
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
    case "part_paid":
      return "bg-[#FFF4D6] text-[#8A671C]";

    case "cancelled":
    case "no_show":
      return "bg-red-50 text-red-700";

    case "checked_out":
    case "refunded":
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default async function AdminBookingsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const q = params.q?.trim() ?? "";
  const status = BOOKING_STATUSES.includes(params.status ?? "")
    ? params.status!
    : "";

  const payment = PAYMENT_STATUSES.includes(params.payment ?? "")
    ? params.payment!
    : "";

  const room = params.room?.trim() ?? "";

  const db = env.zaram_hotels_db;

  const roomsResult = await db
    .prepare(
      `
        SELECT name, slug
        FROM rooms
        WHERE is_active = 1
        ORDER BY
          CASE category
            WHEN 'vip' THEN 1
            WHEN 'big' THEN 2
            WHEN 'medium' THEN 3
            ELSE 4
          END,
          id
      `
    )
    .all<RoomRow>();

  const where: string[] = [];
  const values: (string | number)[] = [];

  if (q) {
    where.push(`
      (
        b.booking_reference LIKE ?
        OR g.full_name LIKE ?
        OR g.email LIKE ?
        OR g.phone LIKE ?
        OR r.name LIKE ?
      )
    `);

    const search = `%${q}%`;

    values.push(
      search,
      search,
      search,
      search,
      search
    );
  }

  if (status) {
    where.push("b.booking_status = ?");
    values.push(status);
  }

  if (payment) {
    where.push("b.payment_status = ?");
    values.push(payment);
  }

  if (room) {
    where.push("r.slug = ?");
    values.push(room);
  }

  const whereClause =
    where.length > 0
      ? `WHERE ${where.join(" AND ")}`
      : "";

  const bookingsResult = await db
    .prepare(
      `
        SELECT
          b.booking_reference,
          g.full_name,
          g.email,
          g.phone,

          r.name AS room_name,
          r.slug AS room_slug,

          b.check_in,
          b.check_out,
          b.adults,
          b.children,
          b.number_of_nights,
          b.total_amount_kobo,
          b.amount_paid_kobo,
          b.booking_status,
          b.payment_status,
          b.hold_expires_at,
          b.created_at

        FROM bookings b

        JOIN guests g
          ON g.id = b.guest_id

        JOIN rooms r
          ON r.id = b.room_id

        ${whereClause}

        ORDER BY datetime(b.created_at) DESC
      `
    )
    .bind(...values)
    .all<BookingRow>();

  const bookings = bookingsResult.results;

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-10 sm:px-6 lg:px-10">

      <section className="border border-[#0B4A32]/10 bg-white">
        <div className="border-b border-[#0B4A32]/10 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B88923]">
            Reservations
          </p>

          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-[#00321F]">
                All Bookings
              </h2>

              <p className="mt-2 text-sm text-[#606963]">
                Search and filter reservations recorded in the hotel system.
              </p>
            </div>

            <p className="text-sm font-semibold text-[#00321F]">
              {bookings.length} result{bookings.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <form
          method="GET"
          className="grid grid-cols-1 gap-4 border-b border-[#0B4A32]/10 bg-[#F7F3EA] p-6 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_auto]"
        >
          <label>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5B665F]">
              Search
            </span>

            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Reference, guest, email, phone..."
              className="h-11 w-full border border-[#0B4A32]/15 bg-white px-4 text-sm text-[#00321F] outline-none focus:border-[#B88923]"
            />
          </label>

          <label>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5B665F]">
              Booking Status
            </span>

            <select
              name="status"
              defaultValue={status}
              className="h-11 w-full border border-[#0B4A32]/15 bg-white px-3 text-sm text-[#00321F] outline-none focus:border-[#B88923]"
            >
              <option value="">All statuses</option>

              {BOOKING_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5B665F]">
              Payment
            </span>

            <select
              name="payment"
              defaultValue={payment}
              className="h-11 w-full border border-[#0B4A32]/15 bg-white px-3 text-sm text-[#00321F] outline-none focus:border-[#B88923]"
            >
              <option value="">All payments</option>

              {PAYMENT_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5B665F]">
              Room
            </span>

            <select
              name="room"
              defaultValue={room}
              className="h-11 w-full border border-[#0B4A32]/15 bg-white px-3 text-sm text-[#00321F] outline-none focus:border-[#B88923]"
            >
              <option value="">All rooms</option>

              {roomsResult.results.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="h-11 bg-[#0B4A32] px-6 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038]"
            >
              Filter
            </button>

            <a
              href="/admin/bookings"
              className="flex h-11 items-center justify-center border border-[#0B4A32]/15 bg-white px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]"
            >
              Reset
            </a>
          </div>
        </form>

        {bookings.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-serif text-2xl text-[#00321F]">
              No bookings found
            </p>

            <p className="mt-2 text-sm text-[#606963]">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left">
              <thead>
                <tr className="border-b border-[#0B4A32]/10 bg-[#EAE1D5]">
                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                    Reference
                  </th>

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                    Guest
                  </th>

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                    Room
                  </th>

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                    Stay
                  </th>

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                    Guests
                  </th>

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                    Booking
                  </th>

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                    Payment
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.booking_reference}
                    className="border-b border-[#0B4A32]/8 last:border-0 hover:bg-[#F7F3EA]"
                  >
                    <td className="px-5 py-5">
                      <p className="text-sm font-semibold text-[#00321F]">
                        {booking.booking_reference}
                      </p>

                      <p className="mt-1 text-[11px] text-[#7A817D]">
                        {booking.created_at}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="text-sm font-semibold text-[#00321F]">
                        {booking.full_name}
                      </p>

                      <p className="mt-1 text-xs text-[#606963]">
                        {booking.email}
                      </p>

                      <p className="mt-1 text-xs text-[#606963]">
                        {booking.phone}
                      </p>
                    </td>

                    <td className="px-5 py-5 text-sm text-[#404943]">
                      {booking.room_name}
                    </td>

                    <td className="px-5 py-5 text-xs leading-6 text-[#606963]">
                      {formatDate(booking.check_in)}
                      <br />
                      {formatDate(booking.check_out)}
                      <br />

                      <span className="font-semibold text-[#00321F]">
                        {booking.number_of_nights} night
                        {booking.number_of_nights === 1 ? "" : "s"}
                      </span>
                    </td>

                    <td className="px-5 py-5 text-sm text-[#404943]">
                      {booking.adults} adult
                      {booking.adults === 1 ? "" : "s"}

                      {booking.children > 0 && (
                        <>
                          <br />
                          {booking.children} child
                          {booking.children === 1 ? "" : "ren"}
                        </>
                      )}
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${statusClasses(
                          booking.booking_status
                        )}`}
                      >
                        {booking.booking_status.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${statusClasses(
                          booking.payment_status
                        )}`}
                      >
                        {booking.payment_status.replaceAll("_", " ")}
                      </span>

                      {booking.amount_paid_kobo > 0 && (
                        <p className="mt-2 text-xs text-[#606963]">
                          Paid {formatNaira(booking.amount_paid_kobo)}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-5 text-right">
                      <p className="text-sm font-semibold text-[#00321F]">
                        {formatNaira(booking.total_amount_kobo)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
