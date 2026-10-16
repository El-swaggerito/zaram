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
    | "update_notes"
    | "confirm_manual";
  notes?: string;
  paymentReceived?: boolean;
  paymentMethod?: string;
};

type BookingRow = {
  id: number;
  booking_reference: string;
  booking_status: string;
  management_notes: string | null;
  hold_expires_at: string | null;
  total_amount_kobo: number;
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

const MANUAL_PAYMENT_METHODS = [
  "cash",
  "pos",
  "bank_transfer",
  "other",
];

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
          management_notes,
          hold_expires_at,
          total_amount_kobo
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

  /*
   * ADMIN MANUAL BOOKING
   *
   * The public hold endpoint creates and validates the temporary
   * reservation first. This action converts that hold into a
   * confirmed admin reservation.
   */
  if (body.action === "confirm_manual") {
    if (booking.booking_status !== "pending") {
      return Response.json(
        {
          success: false,
          error: "Only a pending hold can be converted into a manual booking.",
        },
        { status: 409 }
      );
    }

    if (
      !booking.hold_expires_at ||
      new Date(booking.hold_expires_at).getTime() <= Date.now()
    ) {
      return Response.json(
        {
          success: false,
          error: "The temporary room hold has expired. Check availability again.",
        },
        { status: 409 }
      );
    }

    const paymentReceived =
      body.paymentReceived === true;

    const paymentMethod =
      body.paymentMethod?.trim() || "";

    if (
      paymentReceived &&
      !MANUAL_PAYMENT_METHODS.includes(paymentMethod)
    ) {
      return Response.json(
        {
          success: false,
          error: "Select a valid payment method.",
        },
        { status: 400 }
      );
    }

    const manualPaymentReference =
      paymentReceived
        ? `MANUAL-${crypto
            .randomUUID()
            .replaceAll("-", "")
            .slice(0, 12)
            .toUpperCase()}`
        : null;

    const source = paymentReceived
      ? `admin_${paymentMethod}`
      : "admin_manual";

    const noteParts = [
      `Manual booking created by ${admin.fullName}.`,
    ];

    if (paymentReceived) {
      noteParts.push(
        `Payment recorded as ${paymentMethod.replaceAll(
          "_",
          " "
        )}.`
      );
    } else {
      noteParts.push("Payment not yet received.");
    }

    if (body.notes?.trim()) {
      noteParts.push(body.notes.trim());
    }

    const manualNote = noteParts.join("\n");

    await db.batch([
      db
        .prepare(
          `
            UPDATE bookings
            SET
              booking_status = 'confirmed',
              payment_status = ?,
              amount_paid_kobo = ?,
              payment_provider = NULL,
              payment_reference = ?,
              paid_at = ?,
              hold_expires_at = NULL,
              source = ?,
              management_notes =
                CASE
                  WHEN management_notes IS NULL
                    OR TRIM(management_notes) = ''
                  THEN ?
                  ELSE management_notes || char(10) || char(10) || ?
                END,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `
        )
        .bind(
          paymentReceived ? "paid" : "unpaid",
          paymentReceived
            ? booking.total_amount_kobo
            : 0,
          manualPaymentReference,
          paymentReceived
            ? new Date().toISOString()
            : null,
          source,
          manualNote,
          manualNote,
          booking.id
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
          "manual_booking_created",
          "booking",
          booking.booking_reference,
          JSON.stringify({
            paymentReceived,
            paymentMethod:
              paymentReceived
                ? paymentMethod
                : null,
            paymentReference:
              manualPaymentReference,
            totalAmountKobo:
              booking.total_amount_kobo,
          })
        ),
    ]);

    return Response.json({
      success: true,
      bookingReference:
        booking.booking_reference,
      bookingStatus: "confirmed",
      paymentStatus:
        paymentReceived ? "paid" : "unpaid",
    });
  }

  if (body.action === "update_notes") {
    const notes =
      body.notes?.trim() || null;

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
            previousNotes:
              booking.management_notes,
            newNotes: notes,
          })
        ),
    ]);

    return Response.json({
      success: true,
      bookingStatus:
        booking.booking_status,
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
      .bind(
        config.target,
        booking.id
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
        config.audit,
        "booking",
        booking.booking_reference,
        JSON.stringify({
          previousStatus:
            booking.booking_status,
          newStatus:
            config.target,
        })
      ),
  ]);

  return Response.json({
    success: true,
    bookingStatus:
      config.target,
  });
}
