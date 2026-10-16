import { env } from "cloudflare:workers";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

type EmailEnv = Cloudflare.Env & {
  RESEND_API_KEY: string;
};

export async function GET() {
  const apiKey = (env as EmailEnv).RESEND_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        success: false,
        stage: "environment",
        error: "RESEND_API_KEY is not available to the local Worker.",
      },
      { status: 500 }
    );
  }

  try {
    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: "Zaram Hotels <onboarding@resend.dev>",
      to: ["delivered@resend.dev"],
      subject: "Zaram Hotels Email Test",
      html: `
        <h1>Zaram Hotels</h1>
        <p>The Resend integration is working.</p>
      `,
    });

    if (result.error) {
      return Response.json(
        {
          success: false,
          stage: "resend",
          error: result.error,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      emailId: result.data?.id ?? null,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        stage: "exception",
        error:
          error instanceof Error
            ? error.message
            : "Unknown email error.",
      },
      { status: 500 }
    );
  }
}
