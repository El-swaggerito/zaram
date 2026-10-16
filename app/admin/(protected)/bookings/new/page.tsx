import type { Metadata } from "next";
import Link from "next/link";
import { env } from "cloudflare:workers";

import AdminManualBookingForm from "@/components/admin/AdminManualBookingForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Booking",
  robots: {
    index: false,
    follow: false,
  },
};

type RoomRow = {
  id: number;
  name: string;
  slug: string;
  category: string;
};

export default async function NewAdminBookingPage() {
  const roomsResult =
    await env.zaram_hotels_db
      .prepare(
        `
          SELECT
            id,
            name,
            slug,
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
      .all<RoomRow>();

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-10 sm:px-6 lg:px-10">
      <div className="mb-6">
        <Link
          href="/admin/bookings"
          className="text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]"
        >
          ← All Bookings
        </Link>
      </div>

      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B88923]">
          Reservations
        </p>

        <h2 className="mt-2 font-serif text-4xl font-semibold text-[#00321F]">
          New Booking
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#606963]">
          Create reservations received by phone,
          walk-in or directly by hotel staff.
        </p>
      </div>

      <AdminManualBookingForm
        rooms={roomsResult.results}
      />
    </main>
  );
}
