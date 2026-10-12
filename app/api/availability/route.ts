import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

type RoomRow = {
  id: number;
  name: string;
  category: "vip" | "big" | "medium";
  base_rate_kobo: number;
  vat_kobo: number;
  total_rate_kobo: number;
};

const VALID_CATEGORIES = new Set(["vip", "big", "medium"]);

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const checkIn = url.searchParams.get("checkIn");
  const checkOut = url.searchParams.get("checkOut");
  const category = url.searchParams.get("category");

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

  /*
    A room is unavailable if:

      existing check-in < requested check-out
      AND
      existing check-out > requested check-in

    This allows one guest to check out on the same day
    another guest checks in.
  */

  const categoryClause = category
    ? "AND r.category = ?"
    : "";

  const sql = `
    SELECT
      r.id,
      r.name,
      r.category,
      r.base_rate_kobo,
      r.vat_kobo,
      r.total_rate_kobo
    FROM rooms r
    WHERE
      r.is_active = 1
      AND r.operational_status = 'available'
      ${categoryClause}

      AND NOT EXISTS (
        SELECT 1
        FROM bookings b
        WHERE
          b.room_id = r.id
          AND b.booking_status IN (
            'pending',
            'confirmed',
            'checked_in'
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

  const result = category
    ? await statement
        .bind(
          category,
          checkOut,
          checkIn,
          checkOut,
          checkIn
        )
        .all<RoomRow>()
    : await statement
        .bind(
          checkOut,
          checkIn,
          checkOut,
          checkIn
        )
        .all<RoomRow>();

  const rooms = result.results.map((room) => ({
    id: room.id,
    name: room.name,
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
    vip: rooms.filter((room) => room.category === "vip").length,
    big: rooms.filter((room) => room.category === "big").length,
    medium: rooms.filter((room) => room.category === "medium").length,
  };

  return Response.json(
    {
      success: true,
      checkIn,
      checkOut,
      category: category ?? "all",
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
