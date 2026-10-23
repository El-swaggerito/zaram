import { sendContactEnquiryEmails } from "@/lib/email";

export const dynamic = "force-dynamic";

type ContactRequest = {
  fullName?: string;
  email?: string;
  phone?: string;
  enquiryType?: string;
  message?: string;
  room?: string;
  website?: string;
};

const ALLOWED_TYPES = new Set([
  "room",
  "reservation",
  "general",
  "other",
]);

function clean(
  value: unknown,
  maxLength: number
) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

export async function POST(
  request: Request
) {
  let body: ContactRequest;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        success: false,
        error: "Invalid request.",
      },
      { status: 400 }
    );
  }

  /*
   * Honeypot.
   * Real users never see this field.
   */
  if (body.website) {
    return Response.json({
      success: true,
    });
  }

  const fullName = clean(
    body.fullName,
    120
  );

  const email = clean(
    body.email,
    180
  ).toLowerCase();

  const phone = clean(
    body.phone,
    50
  );

  const enquiryType = clean(
    body.enquiryType,
    30
  );

  const message = clean(
    body.message,
    3000
  );

  const room = clean(
    body.room,
    80
  );

  if (
    !fullName ||
    !email ||
    !message
  ) {
    return Response.json(
      {
        success: false,
        error:
          "Name, email and message are required.",
      },
      { status: 400 }
    );
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    )
  ) {
    return Response.json(
      {
        success: false,
        error:
          "Enter a valid email address.",
      },
      { status: 400 }
    );
  }

  if (
    !ALLOWED_TYPES.has(
      enquiryType
    )
  ) {
    return Response.json(
      {
        success: false,
        error:
          "Select a valid enquiry type.",
      },
      { status: 400 }
    );
  }

  try {
    const result =
      await sendContactEnquiryEmails({
        fullName,
        email,
        phone,
        enquiryType,
        message,
        room: room || null,
      });

    return Response.json({
      success: true,
      testMode:
        result.testMode,
    });
  } catch (error) {
    console.error(
      "Contact email error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "We could not send your enquiry. Please try again or contact the hotel directly.",
      },
      { status: 500 }
    );
  }
}
