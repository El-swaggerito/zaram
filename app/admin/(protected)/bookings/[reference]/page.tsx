import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { env } from "cloudflare:workers";

import BookingActions from "@/components/admin/BookingActions";
import { formatNaira } from "@/data/rooms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Booking Details",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  params: Promise<{
    reference: string;
  }>;
};

type BookingRow = {
  id: number;
  booking_reference: string;
  full_name: string;
  email: string;
  phone: string;
  nationality: string | null;

  room_name: string;
  room_slug: string;
  category: string;

  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  number_of_nights: number;

  nightly_rate_kobo: number;
  total_amount_kobo: number;
  amount_paid_kobo: number;

  booking_status: string;
  payment_status: string;
  payment_provider: string | null;
  payment_reference: string | null;
  paid_at: string | null;

  special_requests: string | null;
  management_notes: string | null;

  created_at: string;
};

type AuditRow = {
  id: number;
  action: string;
  details: string | null;
  created_at: string;
  admin_name: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function statusClasses(status: string) {
  if (
    status === "confirmed" ||
    status === "paid" ||
    status === "checked_in"
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

export default async function BookingDetailPage({
  params,
}: PageProps) {
  const { reference } = await params;

  const db = env.zaram_hotels_db;

  const booking = await db
    .prepare(
      `
        SELECT
          b.id,
          b.booking_reference,

          g.full_name,
          g.email,
          g.phone,
          g.nationality,

          r.name AS room_name,
          r.slug AS room_slug,
          r.category,

          b.check_in,
          b.check_out,
          b.adults,
          b.children,
          b.number_of_nights,

          b.nightly_rate_kobo,
          b.total_amount_kobo,
          b.amount_paid_kobo,

          b.booking_status,
          b.payment_status,
          b.payment_provider,
          b.payment_reference,
          b.paid_at,

          b.special_requests,
          b.management_notes,
          b.created_at

        FROM bookings b

        JOIN guests g
          ON g.id = b.guest_id

        JOIN rooms r
          ON r.id = b.room_id

        WHERE b.booking_reference = ?

        LIMIT 1
      `
    )
    .bind(reference)
    .first<BookingRow>();

  if (!booking) {
    notFound();
  }

  const auditResult = await db
    .prepare(
      `
        SELECT
          l.id,
          l.action,
          l.details,
          l.created_at,
          a.full_name AS admin_name

        FROM audit_log l

        LEFT JOIN admins a
          ON a.id = l.admin_id

        WHERE
          l.entity_type = 'booking'
          AND l.entity_id = ?

        ORDER BY datetime(l.created_at) DESC
      `
    )
    .bind(reference)
    .all<AuditRow>();

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-10 sm:px-6 lg:px-10">
      <div className="mb-6">
        <Link
          href="/admin/bookings"
          className="text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]"
        >
          ← All Bookings
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">

        <div className="space-y-6 xl:col-span-8">
          <section className="border border-[#0B4A32]/10 bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                  Booking Reference
                </p>

                <h2 className="mt-2 font-serif text-3xl font-semibold text-[#00321F]">
                  {booking.booking_reference}
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${statusClasses(
                    booking.booking_status
                  )}`}
                >
                  {booking.booking_status.replaceAll("_", " ")}
                </span>

                <span
                  className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${statusClasses(
                    booking.payment_status
                  )}`}
                >
                  {booking.payment_status.replaceAll("_", " ")}
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-px bg-[#0B4A32]/10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-[#F7F3EA] p-5">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#68726C]">
                  Room
                </p>

                <p className="mt-2 font-semibold text-[#00321F]">
                  {booking.room_name}
                </p>
              </div>

              <div className="bg-[#F7F3EA] p-5">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#68726C]">
                  Check-in
                </p>

                <p className="mt-2 font-semibold text-[#00321F]">
                  {formatDate(booking.check_in)}
                </p>
              </div>

              <div className="bg-[#F7F3EA] p-5">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#68726C]">
                  Check-out
                </p>

                <p className="mt-2 font-semibold text-[#00321F]">
                  {formatDate(booking.check_out)}
                </p>
              </div>

              <div className="bg-[#F7F3EA] p-5">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#68726C]">
                  Length
                </p>

                <p className="mt-2 font-semibold text-[#00321F]">
                  {booking.number_of_nights} night
                  {booking.number_of_nights === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="border border-[#0B4A32]/10 bg-white p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B88923]">
                Guest
              </p>

              <h3 className="mt-3 font-serif text-2xl font-semibold text-[#00321F]">
                {booking.full_name}
              </h3>

              <div className="mt-5 space-y-3 text-sm text-[#404943]">
                <p>{booking.email}</p>
                <p>{booking.phone}</p>

                {booking.nationality && (
                  <p>{booking.nationality}</p>
                )}

                <p>
                  {booking.adults} adult
                  {booking.adults === 1 ? "" : "s"}

                  {booking.children > 0
                    ? `, ${booking.children} child${
                        booking.children === 1 ? "" : "ren"
                      }`
                    : ""}
                </p>
              </div>
            </div>

            <div className="border border-[#0B4A32]/10 bg-white p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B88923]">
                Payment
              </p>

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex justify-between gap-6">
                  <span className="text-[#606963]">Total</span>
                  <strong className="text-[#00321F]">
                    {formatNaira(booking.total_amount_kobo)}
                  </strong>
                </div>

                <div className="flex justify-between gap-6">
                  <span className="text-[#606963]">Paid</span>
                  <strong className="text-[#00321F]">
                    {formatNaira(booking.amount_paid_kobo)}
                  </strong>
                </div>

                <div className="flex justify-between gap-6">
                  <span className="text-[#606963]">Provider</span>
                  <span className="capitalize text-[#00321F]">
                    {booking.payment_provider ?? "—"}
                  </span>
                </div>

                <div className="flex justify-between gap-6">
                  <span className="text-[#606963]">Reference</span>
                  <span className="break-all text-right text-[#00321F]">
                    {booking.payment_reference ?? "—"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="border border-[#0B4A32]/10 bg-white p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B88923]">
              Guest Requests
            </p>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#404943]">
              {booking.special_requests ||
                "No special requests were provided."}
            </p>
          </section>

          <section className="border border-[#0B4A32]/10 bg-white">
            <div className="border-b border-[#0B4A32]/10 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B88923]">
                Activity
              </p>

              <h3 className="mt-2 font-serif text-2xl font-semibold text-[#00321F]">
                Audit History
              </h3>
            </div>

            {auditResult.results.length === 0 ? (
              <p className="p-6 text-sm text-[#606963]">
                No management activity has been recorded yet.
              </p>
            ) : (
              <div>
                {auditResult.results.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-[#0B4A32]/8 px-6 py-5 last:border-0"
                  >
                    <p className="text-sm font-semibold text-[#00321F]">
                      {item.action.replaceAll("_", " ")}
                    </p>

                    <p className="mt-1 text-xs text-[#606963]">
                      {item.admin_name ?? "System"} · {item.created_at}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="xl:col-span-4">
          <BookingActions
            reference={booking.booking_reference}
            bookingStatus={booking.booking_status}
            managementNotes={booking.management_notes}
          />
        </aside>
      </div>
    </main>
  );
}
