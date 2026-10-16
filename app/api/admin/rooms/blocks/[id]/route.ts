import { env } from "cloudflare:workers";
import { getCurrentAdmin } from "@/lib/admin-session";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
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

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  const admin = await getCurrentAdmin(
    request.headers.get("cookie")
  );

  if (!admin) {
    return Response.json(
      { success: false, error: "Unauthorised." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const blockId = Number(id);

  if (!Number.isInteger(blockId) || blockId <= 0) {
    return Response.json(
      { success: false, error: "Invalid block." },
      { status: 400 }
    );
  }

  const db = env.zaram_hotels_db;

  const block = await db
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
        WHERE rb.id = ?
        LIMIT 1
      `
    )
    .bind(blockId)
    .first<BlockRow>();

  if (!block) {
    return Response.json(
      { success: false, error: "Room block not found." },
      { status: 404 }
    );
  }

  await db.batch([
    db
      .prepare(
        `
          DELETE FROM room_blocks
          WHERE id = ?
        `
      )
      .bind(blockId),

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
        "room_block_removed",
        "room",
        String(block.room_id),
        JSON.stringify({
          room: block.room_name,
          startDate: block.start_date,
          endDate: block.end_date,
          reason: block.reason,
          notes: block.notes,
        })
      ),
  ]);

  return Response.json({
    success: true,
  });
}
