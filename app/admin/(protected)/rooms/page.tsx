import type { Metadata } from "next";
import { env } from "cloudflare:workers";

import RoomBlockManager from "@/components/admin/RoomBlockManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rooms",
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
  is_active: number;
};

type BlockRow = {
  id: number;
  room_id: number;
  room_name: string;
  start_date: string;
  end_date: string;
  reason: string;
  notes: string | null;
};

export default async function AdminRoomsPage() {
  const db = env.zaram_hotels_db;

  const [roomsResult, blocksResult] =
    await Promise.all([
      db
        .prepare(
          `
            SELECT
              id,
              name,
              slug,
              category,
              is_active
            FROM rooms
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
              rb.id,
              rb.room_id,
              r.name AS room_name,
              rb.start_date,
              rb.end_date,
              rb.reason,
              rb.notes
            FROM room_blocks rb
            JOIN rooms r
              ON r.id = rb.room_id
            WHERE rb.end_date > date('now')
            ORDER BY
              rb.start_date ASC,
              r.name ASC
          `
        )
        .all<BlockRow>(),
    ]);

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-10 sm:px-6 lg:px-10">
      <section className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B88923]">
          Inventory
        </p>

        <h2 className="mt-2 font-serif text-3xl font-semibold text-[#00321F]">
          Hotel Rooms
        </h2>

        <p className="mt-2 text-sm text-[#606963]">
          {roomsResult.results.length} physical rooms currently configured.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {roomsResult.results.map((room) => (
            <div
              key={room.id}
              className="border border-[#0B4A32]/10 bg-white p-4"
            >
              <p className="font-serif text-lg font-semibold text-[#00321F]">
                {room.name}
              </p>

              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B88923]">
                {room.category}
              </p>

              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0B4A32]">
                {room.is_active ? "Active" : "Inactive"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <RoomBlockManager
        rooms={roomsResult.results}
        blocks={blocksResult.results}
      />
    </main>
  );
}
