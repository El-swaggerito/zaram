import type { Metadata } from "next";
import Link from "next/link";
import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calendar",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  searchParams: Promise<{
    start?: string;
  }>;
};

type RoomRow = {
  id: number;
  name: string;
  category: string;
};

type BookingRow = {
  booking_reference: string;
  room_id: number;
  guest_name: string;
  check_in: string;
  check_out: string;
  booking_status: string;
  payment_status: string;
  hold_expires_at: string | null;
};

type BlockRow = {
  id: number;
  room_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  notes: string | null;
};

function validDate(value?: string) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return isoDate(date);
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function getTodayNigeria() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const map = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${map.year}-${map.month}-${map.day}`;
}

function bookingOccupiesDate(
  booking: BookingRow,
  date: string
) {
  return booking.check_in <= date && booking.check_out > date;
}

function blockOccupiesDate(
  block: BlockRow,
  date: string
) {
  return block.start_date <= date && block.end_date > date;
}

function bookingClasses(status: string) {
  switch (status) {
    case "checked_in":
      return "bg-[#0B4A32] text-white";

    case "confirmed":
      return "bg-[#DCEBE2] text-[#00321F]";

    case "pending":
      return "bg-[#FFF0C7] text-[#8A671C]";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default async function AdminCalendarPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const today = getTodayNigeria();

  const start =
    validDate(params.start)
      ? params.start!
      : today;

  const days = Array.from(
    { length: 14 },
    (_, index) => addDays(start, index)
  );

  const rangeEnd = addDays(start, 14);

  const db = env.zaram_hotels_db;

  const [
    roomsResult,
    bookingsResult,
    blocksResult,
  ] = await Promise.all([
    db
      .prepare(
        `
          SELECT
            id,
            name,
            category
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
      .all<RoomRow>(),

    db
      .prepare(
        `
          SELECT
            b.booking_reference,
            b.room_id,
            g.full_name AS guest_name,
            b.check_in,
            b.check_out,
            b.booking_status,
            b.payment_status,
            b.hold_expires_at

          FROM bookings b

          JOIN guests g
            ON g.id = b.guest_id

          WHERE
            b.check_in < ?
            AND b.check_out > ?

            AND (
              b.booking_status IN (
                'confirmed',
                'checked_in'
              )

              OR (
                b.booking_status = 'pending'
                AND b.hold_expires_at IS NOT NULL
                AND datetime(b.hold_expires_at) > datetime('now')
              )
            )
        `
      )
      .bind(rangeEnd, start)
      .all<BookingRow>(),

    db
      .prepare(
        `
          SELECT
            id,
            room_id,
            start_date,
            end_date,
            reason,
            notes
          FROM room_blocks
          WHERE
            start_date < ?
            AND end_date > ?
        `
      )
      .bind(rangeEnd, start)
      .all<BlockRow>(),
  ]);

  const previousStart = addDays(start, -14);
  const nextStart = addDays(start, 14);

  return (
    <main className="mx-auto max-w-[1600px] px-5 py-10 sm:px-6 lg:px-10">
      <section className="border border-[#0B4A32]/10 bg-white">

        <div className="flex flex-col gap-5 border-b border-[#0B4A32]/10 p-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B88923]">
              Room Planning
            </p>

            <h2 className="mt-2 font-serif text-3xl font-semibold text-[#00321F]">
              14-Day Calendar
            </h2>

            <p className="mt-2 text-sm text-[#606963]">
              View room occupancy, payment holds and management blocks.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/calendar?start=${previousStart}`}
              className="flex h-10 items-center border border-[#0B4A32]/15 bg-white px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]"
            >
              ← Previous
            </Link>

            <Link
              href="/admin/calendar"
              className="flex h-10 items-center border border-[#0B4A32]/15 bg-[#F7F3EA] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]"
            >
              Today
            </Link>

            <Link
              href={`/admin/calendar?start=${nextStart}`}
              className="flex h-10 items-center bg-[#0B4A32] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-white"
            >
              Next →
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="w-[1700px] min-w-[1700px]">

            <div
              className="grid border-b border-[#0B4A32]/10 bg-[#EAE1D5]"
              style={{
                gridTemplateColumns:
                  "180px repeat(14, 108.57px)",
              }}
            >
              <div className="border-r border-[#0B4A32]/10 p-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                  Room
                </span>
              </div>

              {days.map((day) => (
                <div
                  key={day}
                  className={`border-r border-[#0B4A32]/10 p-3 text-center last:border-r-0 ${
                    day === today
                      ? "bg-[#FFF0C7]"
                      : ""
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#59645E]">
                    {formatDay(day)}
                  </p>

                  {day === today && (
                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#B88923]">
                      Today
                    </p>
                  )}
                </div>
              ))}
            </div>

            {roomsResult.results.map((room) => {
              const roomBookings =
                bookingsResult.results.filter(
                  (booking) =>
                    booking.room_id === room.id
                );

              const roomBlocks =
                blocksResult.results.filter(
                  (block) =>
                    block.room_id === room.id
                );

              return (
                <div
                  key={room.id}
                  className="grid border-b border-[#0B4A32]/8 last:border-b-0"
                  style={{
                    gridTemplateColumns:
                      "180px repeat(14, 108.57px)",
                  }}
                >
                  <div className="border-r border-[#0B4A32]/10 bg-[#F7F3EA] p-4">
                    <p className="font-semibold text-[#00321F]">
                      {room.name}
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-[0.10em] text-[#7A817D]">
                      {room.category}
                    </p>
                  </div>

                  {days.map((day) => {
                    const booking =
                      roomBookings.find(
                        (item) =>
                          bookingOccupiesDate(
                            item,
                            day
                          )
                      );

                    const block =
                      roomBlocks.find(
                        (item) =>
                          blockOccupiesDate(
                            item,
                            day
                          )
                      );

                    return (
                      <div
                        key={day}
                        className={`min-h-[92px] border-r border-[#0B4A32]/8 p-2 last:border-r-0 ${
                          day === today
                            ? "bg-[#FFFDF4]"
                            : ""
                        }`}
                      >
                        {block ? (
                          <div className="h-full bg-red-50 p-2 text-[10px] text-red-700">
                            <p className="font-semibold uppercase">
                              {block.reason.replaceAll(
                                "_",
                                " "
                              )}
                            </p>

                            {block.notes && (
                              <p className="mt-1 line-clamp-2">
                                {block.notes}
                              </p>
                            )}
                          </div>
                        ) : booking ? (
                          <Link
                            href={`/admin/bookings/${booking.booking_reference}`}
                            className={`block h-full p-2 ${bookingClasses(
                              booking.booking_status
                            )}`}
                          >
                            <p className="truncate text-[10px] font-semibold">
                              {booking.guest_name}
                            </p>

                            <p className="mt-1 truncate text-[9px] opacity-75">
                              {booking.booking_reference}
                            </p>

                            <p className="mt-2 text-[9px] uppercase tracking-[0.06em] opacity-75">
                              {booking.booking_status.replaceAll(
                                "_",
                                " "
                              )}
                            </p>
                          </Link>
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-[10px] uppercase tracking-[0.08em] text-[#A4AAA6]">
                              Available
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-5 border-t border-[#0B4A32]/10 bg-[#F7F3EA] px-6 py-4 text-xs text-[#606963]">
          <span>
            <span className="mr-2 inline-block h-3 w-3 bg-[#DCEBE2]" />
            Confirmed
          </span>

          <span>
            <span className="mr-2 inline-block h-3 w-3 bg-[#0B4A32]" />
            Checked In
          </span>

          <span>
            <span className="mr-2 inline-block h-3 w-3 bg-[#FFF0C7]" />
            Payment Hold
          </span>

          <span>
            <span className="mr-2 inline-block h-3 w-3 bg-red-100" />
            Room Block
          </span>
        </div>
      </section>
    </main>
  );
}
