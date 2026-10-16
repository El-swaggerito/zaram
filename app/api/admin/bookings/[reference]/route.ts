import { env } from "cloudflare:workers";

import { getCurrentAdmin } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    reference: string;
  }>;
};

type ActionBody = {
  action?:
    | "check_in"
    | "check_out"
    | "cancel"
    | "no_show"
    | "update_notes";
  notes?: string;
};

type BookingRow = {
  id: number;
  booking_reference: string;
  booking_status: string;
  management_notes: string | null;
};

const STATUS_ACTIONS = {
  check_in: {
    target: "checked_in",
    allowed: ["confirmed"],
    audit: "booking_checked_in",
  },
  check_out: {
    target: "checked_out",
    allowed: ["checked_in"],
    audit: "booking_checked_out",
  },
  cancel: {
    target: "cancelled",
    allowed: ["pending", "confirmed"],
    audit: "booking_cancelled",
  },
  no_show: {
    target: "no_show",
    allowed: ["confirmed"],
    audit: "booking_marked_no_show",
  },
} as const;

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  const admin = await getCurrentAdmin(
    request.headers.get("cookie")
  );

  if (!admin) {
    return Response.json(
      {
        success: false,
        error: "Unauthorised.",
      },
      { status: 401 }
    );
  }

  const { reference } = await params;

  let body: ActionBody;

  try {
    body = (await request.json()) as ActionBody;
  } catch {
    return Response.json(
      {
        success: false,
        error: "Invalid request body.",
      },
      { status: 400 }
    );
  }

  if (!body.action) {
    return Response.json(
      {
        success: false,
        error: "Action is required.",
      },
      { status: 400 }
    );
  }

  const db = env.zaram_hotels_db;

  const booking = await db
    .prepare(
      `
        SELECT
          id,
          booking_reference,
          booking_status,
          management_notes
        FROM bookings
        WHERE booking_reference = ?
        LIMIT 1
      `
    )
    .bind(reference)
    .first<BookingRow>();

  if (!booking) {
    return Response.json(
      {
        success: false,
        error: "Booking not found.",
      },
      { status: 404 }
    );
  }

  if (body.action === "update_notes") {
    const notes = body.notes?.trim() || null;

    await db.batch([
      db
        .prepare(
          `
            UPDATE bookings
            SET
              management_notes = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `
        )
        .bind(notes, booking.id),

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
          "booking_notes_updated",
          "booking",
          booking.booking_reference,
          JSON.stringify({
            previousNotes: booking.management_notes,
            newNotes: notes,
          })
        ),
    ]);

    return Response.json({
      success: true,
      bookingStatus: booking.booking_status,
      managementNotes: notes,
    });
  }

  const config =
    STATUS_ACTIONS[
      body.action as keyof typeof STATUS_ACTIONS
    ];

  if (!config) {
    return Response.json(
      {
        success: false,
        error: "Invalid booking action.",
      },
      { status: 400 }
    );
  }

  if (
    !config.allowed.includes(
      booking.booking_status as never
    )
  ) {
    return Response.json(
      {
        success: false,
        error: `Cannot perform this action while booking status is ${booking.booking_status.replaceAll(
          "_",
          " "
        )}.`,
      },
      { status: 409 }
    );
  }

  await db.batch([
    db
      .prepare(
        `
          UPDATE bookings
          SET
            booking_status = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `
      )
      .bind(config.target, booking.id),

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
        config.audit,
        "booking",
        booking.booking_reference,
        JSON.stringify({
          previousStatus: booking.booking_status,
          newStatus: config.target,
        })
      ),
  ]);

  return Response.json({
    success: true,
    bookingStatus: config.target,
  });
}
