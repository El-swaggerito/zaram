import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

type RequestBody = {
  roomSlug: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  fullName: string;
  email: string;
  phone: string;
  nationality?: string;
  specialRequests?: string;
};

type RoomRow = {
  id: number;
  name: string;
  slug: string;
  total_rate_kobo: number;
};

const HOLD_MINUTES = 15;

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function nightsBetween(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);

  return Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function createBookingReference() {
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `ZRM-${random}`;
}

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return Response.json(
      {
        success: false,
        error: "Invalid request body.",
      },
      { status: 400 }
    );
  }

  const {
    roomSlug,
    checkIn,
    checkOut,
    adults,
    children,
    fullName,
    email,
    phone,
    nationality,
    specialRequests,
  } = body;

  if (
    !roomSlug ||
    !checkIn ||
    !checkOut ||
    !fullName?.trim() ||
    !email?.trim() ||
    !phone?.trim()
  ) {
    return Response.json(
      {
        success: false,
        error: "Room, dates, name, email and phone are required.",
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
        error: "Check-out must be later than check-in.",
      },
      { status: 400 }
    );
  }

  if (!Number.isInteger(adults) || adults < 1) {
    return Response.json(
      {
        success: false,
        error: "At least one adult is required.",
      },
      { status: 400 }
    );
  }

  if (!Number.isInteger(children) || children < 0) {
    return Response.json(
      {
        success: false,
        error: "Children must be zero or more.",
      },
      { status: 400 }
    );
  }

  const db = env.zaram_hotels_db;

  const room = await db
    .prepare(
      `
        SELECT
          id,
          name,
          slug,
          total_rate_kobo
        FROM rooms
        WHERE
          slug = ?
          AND is_active = 1
          AND operational_status = 'available'
        LIMIT 1
      `
    )
    .bind(roomSlug)
    .first<RoomRow>();

  if (!room) {
    return Response.json(
      {
        success: false,
        error: "Room not found or unavailable.",
      },
      { status: 404 }
    );
  }

  const conflict = await db
    .prepare(
      `
        SELECT 1
        FROM bookings b
        WHERE
          b.room_id = ?

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

        LIMIT 1
      `
    )
    .bind(room.id, checkOut, checkIn)
    .first();

  if (conflict) {
    return Response.json(
      {
        success: false,
        error:
          "This room is no longer available for the selected dates. Please choose different dates.",
      },
      { status: 409 }
    );
  }

  const blocked = await db
    .prepare(
      `
        SELECT 1
        FROM room_blocks rb
        WHERE
          rb.room_id = ?
          AND rb.start_date < ?
          AND rb.end_date > ?
        LIMIT 1
      `
    )
    .bind(room.id, checkOut, checkIn)
    .first();

  if (blocked) {
    return Response.json(
      {
        success: false,
        error:
          "This room is unavailable for the selected dates. Please choose different dates.",
      },
      { status: 409 }
    );
  }

  const numberOfNights = nightsBetween(checkIn, checkOut);

  if (numberOfNights < 1) {
    return Response.json(
      {
        success: false,
        error: "The stay must be at least one night.",
      },
      { status: 400 }
    );
  }

  const totalAmountKobo = numberOfNights * room.total_rate_kobo;

  const holdExpiresAt = new Date(
    Date.now() + HOLD_MINUTES * 60 * 1000
  ).toISOString();

  const bookingReference = createBookingReference();

  try {
    const guestResult = await db
      .prepare(
        `
          INSERT INTO guests (
            full_name,
            email,
            phone,
            nationality
          )
          VALUES (?, ?, ?, ?)
        `
      )
      .bind(
        fullName.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        nationality?.trim() || null
      )
      .run();

    const guestId = Number(guestResult.meta.last_row_id);

    const paymentReference = `MOCK-${crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 12)
      .toUpperCase()}`;

    const bookingResult = await db
      .prepare(
        `
          INSERT INTO bookings (
            booking_reference,
            guest_id,
            room_id,
            check_in,
            check_out,
            adults,
            children,
            nightly_rate_kobo,
            number_of_nights,
            total_amount_kobo,
            booking_status,
            payment_status,
            amount_paid_kobo,
            source,
            special_requests,
            hold_expires_at,
            payment_provider,
            payment_reference
          )
          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            'pending',
            'unpaid',
            0,
            'website',
            ?,
            ?,
            'mock',
            ?
          )
        `
      )
      .bind(
        bookingReference,
        guestId,
        room.id,
        checkIn,
        checkOut,
        adults,
        children,
        room.total_rate_kobo,
        numberOfNights,
        totalAmountKobo,
        specialRequests?.trim() || null,
        holdExpiresAt,
        paymentReference
      )
      .run();

    return Response.json(
      {
        success: true,
        booking: {
          id: Number(bookingResult.meta.last_row_id),
          reference: bookingReference,
          paymentReference,
          room: {
            id: room.id,
            name: room.name,
            slug: room.slug,
          },
          checkIn,
          checkOut,
          adults,
          children,
          numberOfNights,
          nightlyRateKobo: room.total_rate_kobo,
          totalAmountKobo,
          bookingStatus: "pending",
          paymentStatus: "unpaid",
          paymentProvider: "mock",
          holdExpiresAt,
          holdMinutes: HOLD_MINUTES,
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Failed to create booking hold:", error);

    return Response.json(
      {
        success: false,
        error: "Unable to create your booking hold. Please try again.",
      },
      { status: 500 }
    );
  }
}
