import { env } from "cloudflare:workers";
import { getCurrentAdmin } from "@/lib/admin-session";

const ALLOWED_REASONS = [
  "maintenance",
  "cleaning",
  "renovation",
  "management_hold",
  "out_of_service",
  "other",
];

type CreateBlockBody = {
  roomId?: number;
  startDate?: string;
  endDate?: string;
  reason?: string;
  notes?: string;
};

export async function POST(request: Request) {
  const admin = await getCurrentAdmin(
    request.headers.get("cookie")
  );

  if (!admin) {
    return Response.json(
      { success: false, error: "Unauthorised." },
      { status: 401 }
    );
  }

  let body: CreateBlockBody;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid request." },
      { status: 400 }
    );
  }

  const roomId = Number(body.roomId);
  const startDate = body.startDate?.trim();
  const endDate = body.endDate?.trim();
  const reason = body.reason?.trim();
  const notes = body.notes?.trim() || null;

  if (
    !roomId ||
    !startDate ||
    !endDate ||
    !reason ||
    !ALLOWED_REASONS.includes(reason)
  ) {
    return Response.json(
      { success: false, error: "Complete all required fields." },
      { status: 400 }
    );
  }

  if (endDate <= startDate) {
    return Response.json(
      {
        success: false,
        error: "End date must be after start date.",
      },
      { status: 400 }
    );
  }

  const db = env.zaram_hotels_db;

  const room = await db
    .prepare(
      `
        SELECT id, name
        FROM rooms
        WHERE id = ? AND is_active = 1
        LIMIT 1
      `
    )
    .bind(roomId)
    .first<{ id: number; name: string }>();

  if (!room) {
    return Response.json(
      { success: false, error: "Room not found." },
      { status: 404 }
    );
  }

  const existingBlock = await db
    .prepare(
      `
        SELECT id
        FROM room_blocks
        WHERE
          room_id = ?
          AND start_date < ?
          AND end_date > ?
        LIMIT 1
      `
    )
    .bind(roomId, endDate, startDate)
    .first();

  if (existingBlock) {
    return Response.json(
      {
        success: false,
        error: "This room already has a block overlapping those dates.",
      },
      { status: 409 }
    );
  }

  const conflictingBooking = await db
    .prepare(
      `
        SELECT booking_reference
        FROM bookings
        WHERE
          room_id = ?
          AND check_in < ?
          AND check_out > ?
          AND (
            booking_status IN ('confirmed', 'checked_in')
            OR (
              booking_status = 'pending'
              AND hold_expires_at IS NOT NULL
              AND datetime(hold_expires_at) > datetime('now')
            )
          )
        LIMIT 1
      `
    )
    .bind(roomId, endDate, startDate)
    .first<{ booking_reference: string }>();

  if (conflictingBooking) {
    return Response.json(
      {
        success: false,
        error: `Room has booking ${conflictingBooking.booking_reference} during these dates.`,
      },
      { status: 409 }
    );
  }

  await db.batch([
    db
      .prepare(
        `
          INSERT INTO room_blocks (
            room_id,
            start_date,
            end_date,
            reason,
            notes
          )
          VALUES (?, ?, ?, ?, ?)
        `
      )
      .bind(
        roomId,
        startDate,
        endDate,
        reason,
        notes
      ),

    db
      .prepare(
        `
          INSERT INTO audit_log (
            admin_id,
            action,
            entity_type,
            entity_id,
            details
          )
          VALUES (?, ?, ?, ?, ?)
        `
      )
      .bind(
        admin.id,
        "room_block_created",
        "room",
        String(roomId),
        JSON.stringify({
          room: room.name,
          startDate,
          endDate,
          reason,
          notes,
        })
      ),
  ]);

  return Response.json({
    success: true,
  });
}
