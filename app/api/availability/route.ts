import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

type RoomRow = {
  id: number;
  name: string;
  slug: string;
  category: "vip" | "big" | "medium";
  base_rate_kobo: number;
  vat_kobo: number;
  total_rate_kobo: number;
};

const VALID_CATEGORIES = new Set(["vip", "big", "medium"]);

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidSlug(value: string) {
  return /^[a-z0-9-]+$/.test(value);
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const checkIn = url.searchParams.get("checkIn");
  const checkOut = url.searchParams.get("checkOut");
  const category = url.searchParams.get("category");
  const slug = url.searchParams.get("slug");

  if (!checkIn || !checkOut) {
    return Response.json(
      {
        success: false,
        error: "checkIn and checkOut are required.",
      },
      { status: 400 }
    );
  }

  if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
    return Response.json(
      {
        success: false,
        error: "Dates must use YYYY-MM-DD format.",
      },
      { status: 400 }
    );
  }

  if (checkOut <= checkIn) {
    return Response.json(
      {
        success: false,
        error: "checkOut must be later than checkIn.",
      },
      { status: 400 }
    );
  }

  if (category && !VALID_CATEGORIES.has(category)) {
    return Response.json(
      {
        success: false,
        error: "category must be vip, big or medium.",
      },
      { status: 400 }
    );
  }

  if (slug && !isValidSlug(slug)) {
    return Response.json(
      {
        success: false,
        error: "Invalid room slug.",
      },
      { status: 400 }
    );
  }

  /*
    Date overlap rule:

      existing check-in < requested check-out
      AND
      existing check-out > requested check-in

    This allows same-day turnover.

    A booking blocks availability when:
      - confirmed
      - checked_in
      - pending AND its temporary hold has not expired
  */

  const filters: string[] = [];
  const filterValues: string[] = [];

  if (category) {
    filters.push("AND r.category = ?");
    filterValues.push(category);
  }

  if (slug) {
    filters.push("AND r.slug = ?");
    filterValues.push(slug);
  }

  const sql = `
    SELECT
      r.id,
      r.name,
      r.slug,
      r.category,
      r.base_rate_kobo,
      r.vat_kobo,
      r.total_rate_kobo
    FROM rooms r
    WHERE
      r.is_active = 1
      AND r.operational_status = 'available'
      ${filters.join("\n      ")}

      AND NOT EXISTS (
        SELECT 1
        FROM bookings b
        WHERE
          b.room_id = r.id

          AND (
            b.booking_status IN ('confirmed', 'checked_in')

            OR (
              b.booking_status = 'pending'
              AND b.hold_expires_at IS NOT NULL
              AND datetime(b.hold_expires_at) > datetime('now')
            )
          )

          AND b.check_in < ?
          AND b.check_out > ?
      )

      AND NOT EXISTS (
        SELECT 1
        FROM room_blocks rb
        WHERE
          rb.room_id = r.id
          AND rb.start_date < ?
          AND rb.end_date > ?
      )

    ORDER BY
      CASE r.category
        WHEN 'vip' THEN 1
        WHEN 'big' THEN 2
        WHEN 'medium' THEN 3
        ELSE 4
      END,
      r.id ASC
  `;

  const statement = env.zaram_hotels_db.prepare(sql);

  const result = await statement
    .bind(
      ...filterValues,
      checkOut,
      checkIn,
      checkOut,
      checkIn
    )
    .all<RoomRow>();

  const rooms = result.results.map((room: RoomRow) => ({
    id: room.id,
    name: room.name,
    slug: room.slug,
    category: room.category,
    rate: {
      baseKobo: room.base_rate_kobo,
      vatKobo: room.vat_kobo,
      totalKobo: room.total_rate_kobo,

      baseNaira: room.base_rate_kobo / 100,
      vatNaira: room.vat_kobo / 100,
      totalNaira: room.total_rate_kobo / 100,
    },
  }));

  const categorySummary = {
    vip: rooms.filter(
      (room: { category: RoomRow["category"] }) =>
        room.category === "vip"
    ).length,

    big: rooms.filter(
      (room: { category: RoomRow["category"] }) =>
        room.category === "big"
    ).length,

    medium: rooms.filter(
      (room: { category: RoomRow["category"] }) =>
        room.category === "medium"
    ).length,
  };

  return Response.json(
    {
      success: true,
      checkIn,
      checkOut,
      category: category ?? "all",
      slug: slug ?? null,
      availableCount: rooms.length,
      availability: categorySummary,
      rooms,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
