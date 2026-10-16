import type { Metadata } from "next";
import Link from "next/link";
import { env } from "cloudflare:workers";

import { formatNaira } from "@/data/rooms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guests",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

type GuestRow = {
  guest_key: string;
  full_name: string;
  email: string;
  phone: string;
  nationality: string | null;
  bookings_count: number;
  lifetime_paid_kobo: number;
  last_check_out: string | null;
  next_check_in: string | null;
};

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

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function AdminGuestsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";

  const db = env.zaram_hotels_db;
  const today = getTodayNigeria();

  const search = `%${q}%`;

  const guestsResult = await db
    .prepare(
      `
        WITH latest_guest AS (
          SELECT
            id,
            LOWER(TRIM(email)) AS guest_key,
            full_name,
            email,
            phone,
            nationality,
            ROW_NUMBER() OVER (
              PARTITION BY LOWER(TRIM(email))
              ORDER BY id DESC
            ) AS rn
          FROM guests
        )

        SELECT
          lg.guest_key,
          lg.full_name,
          lg.email,
          lg.phone,
          lg.nationality,

          COUNT(b.id) AS bookings_count,

          COALESCE(
            SUM(
              CASE
                WHEN b.payment_status = 'paid'
                  THEN b.amount_paid_kobo
                ELSE 0
              END
            ),
            0
          ) AS lifetime_paid_kobo,

          MAX(
            CASE
              WHEN b.check_out <= ?
                AND b.booking_status IN (
                  'confirmed',
                  'checked_in',
                  'checked_out'
                )
              THEN b.check_out
              ELSE NULL
            END
          ) AS last_check_out,

          MIN(
            CASE
              WHEN b.check_in >= ?
                AND b.booking_status IN (
                  'confirmed',
                  'checked_in'
                )
              THEN b.check_in
              ELSE NULL
            END
          ) AS next_check_in

        FROM latest_guest lg

        LEFT JOIN guests all_guests
          ON LOWER(TRIM(all_guests.email)) = lg.guest_key

        LEFT JOIN bookings b
          ON b.guest_id = all_guests.id

        WHERE
          lg.rn = 1
          AND (
            ? = '%%'
            OR lg.full_name LIKE ?
            OR lg.email LIKE ?
            OR lg.phone LIKE ?
          )

        GROUP BY
          lg.guest_key,
          lg.full_name,
          lg.email,
          lg.phone,
          lg.nationality

        ORDER BY lg.full_name COLLATE NOCASE ASC
      `
    )
    .bind(
      today,
      today,
      search,
      search,
      search,
      search
    )
    .all<GuestRow>();

  const guests = guestsResult.results;

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-10 sm:px-6 lg:px-10">
      <section className="border border-[#0B4A32]/10 bg-white">
        <div className="flex flex-col gap-5 border-b border-[#0B4A32]/10 p-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B88923]">
              Guest Records
            </p>

            <h2 className="mt-2 font-serif text-3xl font-semibold text-[#00321F]">
              Guest Directory
            </h2>

            <p className="mt-2 text-sm text-[#606963]">
              View contact details, booking activity and guest history.
            </p>
          </div>

          <p className="text-sm font-semibold text-[#00321F]">
            {guests.length} guest{guests.length === 1 ? "" : "s"}
          </p>
        </div>

        <form
          method="GET"
          className="flex flex-col gap-3 border-b border-[#0B4A32]/10 bg-[#F7F3EA] p-6 sm:flex-row"
        >
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name, email or phone..."
            className="h-11 flex-1 border border-[#0B4A32]/15 bg-white px-4 text-sm text-[#00321F] outline-none focus:border-[#B88923]"
          />

          <button
            type="submit"
            className="h-11 bg-[#0B4A32] px-7 text-xs font-semibold uppercase tracking-[0.08em] text-white"
          >
            Search
          </button>

          {q && (
            <Link
              href="/admin/guests"
              className="flex h-11 items-center justify-center border border-[#0B4A32]/15 bg-white px-5 text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]"
            >
              Reset
            </Link>
          )}
        </form>

        {guests.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-serif text-2xl text-[#00321F]">
              No guests found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead>
                <tr className="bg-[#EAE1D5]">
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                    Guest
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                    Bookings
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                    Last Stay
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                    Next Stay
                  </th>

                  <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                    Paid
                  </th>
                </tr>
              </thead>

              <tbody>
                {guests.map((guest) => (
                  <tr
                    key={guest.guest_key}
                    className="border-b border-[#0B4A32]/8 last:border-0 hover:bg-[#F7F3EA]"
                  >
                    <td className="px-6 py-5">
                      <Link
                        href={`/admin/guests/${encodeURIComponent(
                          guest.guest_key
                        )}`}
                        className="font-semibold text-[#00321F] hover:text-[#B88923]"
                      >
                        {guest.full_name}
                      </Link>

                      <p className="mt-1 text-xs text-[#7A817D]">
                        {guest.nationality || "Nationality not provided"}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="text-sm text-[#404943]">
                        {guest.email}
                      </p>

                      <p className="mt-1 text-xs text-[#606963]">
                        {guest.phone}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <span className="font-serif text-2xl font-semibold text-[#00321F]">
                        {guest.bookings_count}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm text-[#404943]">
                      {formatDate(guest.last_check_out)}
                    </td>

                    <td className="px-6 py-5 text-sm">
                      {guest.next_check_in ? (
                        <span className="font-semibold text-[#0B4A32]">
                          {formatDate(guest.next_check_in)}
                        </span>
                      ) : (
                        <span className="text-[#A0A6A2]">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5 text-right font-semibold text-[#00321F]">
                      {formatNaira(guest.lifetime_paid_kobo)}
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
