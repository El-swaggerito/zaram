import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    reference: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: PageProps
) {
  const { reference } = await params;

  const booking = await env.zaram_hotels_db
    .prepare(
      `
        SELECT
          b.id,
          b.booking_reference,
          b.check_in,
          b.check_out,
          b.adults,
          b.children,
          b.number_of_nights,
          b.nightly_rate_kobo,
          b.total_amount_kobo,
          b.booking_status,
          b.payment_status,
          b.payment_provider,
          b.payment_reference,
          b.hold_expires_at,
          b.paid_at,

          r.name AS room_name,
          r.slug AS room_slug,

          g.full_name,
          g.email,
          g.phone

        FROM bookings b

        JOIN rooms r
          ON r.id = b.room_id

        JOIN guests g
          ON g.id = b.guest_id

        WHERE b.booking_reference = ?

        LIMIT 1
      `
    )
    .bind(reference)
    .first();

  if (!booking) {
    return Response.json(
      {
        success: false,
        error: "Booking not found.",
      },
      { status: 404 }
    );
  }

  return Response.json(
    {
      success: true,
      booking,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
