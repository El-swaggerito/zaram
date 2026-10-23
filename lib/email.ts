import { env } from "cloudflare:workers";
import { Resend } from "resend";

type BookingEmailData = {
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
  adults: number;
  children: number;
  totalAmountKobo: number;
};

type EmailEnv = Cloudflare.Env & {
  RESEND_API_KEY: string;
};

const MANAGEMENT_EMAIL = "zaramhotel10@gmail.com";

/*
 * Keep this true until Zaram has a verified sending domain in Resend.
 * In test mode, emails are sent to Resend's test delivery address.
 */
const TEST_MODE = true;
const TEST_RECIPIENT = "delivered@resend.dev";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export async function sendBookingConfirmationEmails(
  booking: BookingEmailData
) {
  const apiKey = (env as EmailEnv).RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const resend = new Resend(apiKey);

  const guestRecipient = TEST_MODE
    ? TEST_RECIPIENT
    : booking.guestEmail;

  const managementRecipient = TEST_MODE
    ? TEST_RECIPIENT
    : MANAGEMENT_EMAIL;

  const guestHtml = `
    <!doctype html>
    <html>
      <body style="margin:0;background:#F7F3EA;font-family:Arial,sans-serif;color:#00321F;">
        <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
          <div style="background:#00321F;padding:32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-family:Georgia,serif;">
              Zaram Hotels & Garden
            </h1>
          </div>

          <div style="background:#ffffff;padding:36px;">
            <p style="margin-top:0;color:#B88923;font-size:12px;font-weight:700;letter-spacing:2px;">
              BOOKING CONFIRMED
            </p>

            <h2 style="font-family:Georgia,serif;font-size:30px;margin-bottom:16px;">
              Thank you, ${escapeHtml(booking.guestName)}
            </h2>

            <p style="line-height:1.7;color:#404943;">
              Your payment was successful and your reservation at
              Zaram Hotels & Garden is confirmed.
            </p>

            <div style="margin:28px 0;border-top:1px solid #ddd;border-bottom:1px solid #ddd;padding:20px 0;">
              <p><strong>Booking reference:</strong> ${escapeHtml(booking.bookingReference)}</p>
              <p><strong>Room:</strong> ${escapeHtml(booking.roomName)}</p>
              <p><strong>Check-in:</strong> ${formatDate(booking.checkIn)}</p>
              <p><strong>Check-out:</strong> ${formatDate(booking.checkOut)}</p>
              <p><strong>Nights:</strong> ${booking.numberOfNights}</p>
              <p><strong>Guests:</strong> ${booking.adults} adult${booking.adults === 1 ? "" : "s"}${
                booking.children > 0
                  ? `, ${booking.children} child${booking.children === 1 ? "" : "ren"}`
                  : ""
              }</p>
              <p><strong>Amount paid:</strong> ${formatNaira(booking.totalAmountKobo)}</p>
            </div>

            <p style="line-height:1.7;color:#404943;">
              Please keep your booking reference for check-in.
            </p>

            <p style="margin-bottom:0;color:#404943;">
              Zaram Hotels & Garden<br>
              EFAB Global Estate, Road 121, House 8, Abuja<br>
              08139654033
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const managementHtml = `
    <!doctype html>
    <html>
      <body style="font-family:Arial,sans-serif;color:#222;">
        <h2>New Paid Booking</h2>

        <p>A new booking has been confirmed and paid.</p>

        <hr>

        <p><strong>Booking reference:</strong> ${escapeHtml(booking.bookingReference)}</p>
        <p><strong>Guest:</strong> ${escapeHtml(booking.guestName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(booking.guestEmail)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(booking.guestPhone)}</p>
        <p><strong>Room:</strong> ${escapeHtml(booking.roomName)}</p>
        <p><strong>Check-in:</strong> ${formatDate(booking.checkIn)}</p>
        <p><strong>Check-out:</strong> ${formatDate(booking.checkOut)}</p>
        <p><strong>Nights:</strong> ${booking.numberOfNights}</p>
        <p><strong>Adults:</strong> ${booking.adults}</p>
        <p><strong>Children:</strong> ${booking.children}</p>
        <p><strong>Amount paid:</strong> ${formatNaira(booking.totalAmountKobo)}</p>
      </body>
    </html>
  `;

  const guestResult = await resend.emails.send({
    from: "Zaram Hotels <onboarding@resend.dev>",
    to: [guestRecipient],
    subject: `Booking Confirmed - ${booking.bookingReference}`,
    html: guestHtml,
  });

  if (guestResult.error) {
    throw new Error(
      `Guest confirmation email failed: ${guestResult.error.message}`
    );
  }

  const managementResult = await resend.emails.send({
    from: "Zaram Hotels <onboarding@resend.dev>",
    to: [managementRecipient],
    subject: `New Paid Booking - ${booking.bookingReference}`,
    html: managementHtml,
  });

  if (managementResult.error) {
    throw new Error(
      `Management notification email failed: ${managementResult.error.message}`
    );
  }

  return {
    guestEmailId: guestResult.data?.id ?? null,
    managementEmailId: managementResult.data?.id ?? null,
    testMode: TEST_MODE,
  };
}

type ContactEnquiryEmailData = {
  fullName: string;
  email: string;
  phone: string;
  enquiryType: string;
  message: string;
  room: string | null;
};

function enquiryTypeLabel(
  value: string
) {
  switch (value) {
    case "room":
      return "Room Enquiry";
    case "reservation":
      return "Reservation";
    case "general":
      return "General Enquiry";
    case "other":
      return "Other";
    default:
      return value;
  }
}

export async function sendContactEnquiryEmails(
  enquiry: ContactEnquiryEmailData
) {
  const apiKey =
    (env as EmailEnv)
      .RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  const resend =
    new Resend(apiKey);

  const managementRecipient =
    TEST_MODE
      ? TEST_RECIPIENT
      : MANAGEMENT_EMAIL;

  const guestRecipient =
    TEST_MODE
      ? TEST_RECIPIENT
      : enquiry.email;

  const typeLabel =
    enquiryTypeLabel(
      enquiry.enquiryType
    );

  const managementHtml = `
    <!doctype html>
    <html>
      <body style="margin:0;background:#F7F3EA;font-family:Arial,sans-serif;color:#20251F;">
        <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
          <div style="background:#00321F;padding:28px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-family:Georgia,serif;">
              Zaram Hotels & Garden
            </h1>
          </div>

          <div style="background:#ffffff;padding:34px;">
            <p style="margin-top:0;color:#B88923;font-size:12px;font-weight:700;letter-spacing:2px;">
              NEW WEBSITE ENQUIRY
            </p>

            <h2 style="font-family:Georgia,serif;color:#00321F;font-size:28px;">
              ${escapeHtml(typeLabel)}
            </h2>

            <p>
              <strong>Name:</strong>
              ${escapeHtml(enquiry.fullName)}
            </p>

            <p>
              <strong>Email:</strong>
              ${escapeHtml(enquiry.email)}
            </p>

            <p>
              <strong>Phone:</strong>
              ${escapeHtml(enquiry.phone || "Not provided")}
            </p>

            ${
              enquiry.room
                ? `
                  <p>
                    <strong>Room:</strong>
                    ${escapeHtml(enquiry.room)}
                  </p>
                `
                : ""
            }

            <div style="margin-top:24px;padding:20px;background:#F7F3EA;">
              <p style="margin-top:0;">
                <strong>Message</strong>
              </p>

              <p style="margin-bottom:0;line-height:1.7;white-space:pre-wrap;">
                ${escapeHtml(enquiry.message)}
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const guestHtml = `
    <!doctype html>
    <html>
      <body style="margin:0;background:#F7F3EA;font-family:Arial,sans-serif;color:#00321F;">
        <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
          <div style="background:#00321F;padding:32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-family:Georgia,serif;">
              Zaram Hotels & Garden
            </h1>
          </div>

          <div style="background:#ffffff;padding:36px;">
            <p style="margin-top:0;color:#B88923;font-size:12px;font-weight:700;letter-spacing:2px;">
              ENQUIRY RECEIVED
            </p>

            <h2 style="font-family:Georgia,serif;font-size:30px;margin-bottom:16px;">
              Thank you, ${escapeHtml(enquiry.fullName)}
            </h2>

            <p style="line-height:1.7;color:#404943;">
              We have received your ${escapeHtml(typeLabel.toLowerCase())}.
              Our team will review your message and respond as soon as possible.
            </p>

            <div style="margin:28px 0;background:#F7F3EA;padding:20px;">
              <p style="margin-top:0;color:#7A817D;font-size:12px;font-weight:700;">
                YOUR MESSAGE
              </p>

              <p style="margin-bottom:0;line-height:1.7;white-space:pre-wrap;color:#404943;">
                ${escapeHtml(enquiry.message)}
              </p>
            </div>

            <p style="line-height:1.7;color:#404943;">
              If your enquiry is urgent, please call us on
              <strong>08139654033</strong>.
            </p>

            <p style="margin-bottom:0;color:#404943;">
              Zaram Hotels & Garden<br>
              EFAB Global Estate, Road 121, House 8, Abuja<br>
              08139654033
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const managementResult =
    await resend.emails.send({
      from:
        "Zaram Hotels <onboarding@resend.dev>",
      to: [
        managementRecipient,
      ],
      replyTo:
        enquiry.email,
      subject:
        `New ${typeLabel} - ${enquiry.fullName}`,
      html:
        managementHtml,
    });

  if (
    managementResult.error
  ) {
    throw new Error(
      `Management enquiry email failed: ${managementResult.error.message}`
    );
  }

  const guestResult =
    await resend.emails.send({
      from:
        "Zaram Hotels <onboarding@resend.dev>",
      to: [
        guestRecipient,
      ],
      subject:
        "We received your enquiry - Zaram Hotels",
      html:
        guestHtml,
    });

  if (guestResult.error) {
    throw new Error(
      `Guest acknowledgement email failed: ${guestResult.error.message}`
    );
  }

  return {
    managementEmailId:
      managementResult.data?.id ??
      null,

    guestEmailId:
      guestResult.data?.id ??
      null,

    testMode:
      TEST_MODE,
  };
}
