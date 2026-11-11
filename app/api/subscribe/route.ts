import { CREDENTIALS } from "@/app/lib/credentials";
import { NextRequest, NextResponse } from "next/server";

const EMAIL_SERVICE_URL = "https://email-service.pxxl.pro";

export async function POST(request: NextRequest) {
  try {
    const projectId = CREDENTIALS.email_service_project_id;
    const adminKey = CREDENTIALS.email_service_admin_key;
    if (!projectId || !adminKey)
      return NextResponse.json({ error: "Not configured" }, { status: 500 });

    const { email } = await request.json();

    if (!email || typeof email !== "string")
      return NextResponse.json({ error: "Email required" }, { status: 400 });

    const res = await fetch(
      `${EMAIL_SERVICE_URL}/api/projects/${projectId}/audience`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": adminKey,
        },
        body: JSON.stringify({ audiences: [{ email }] }),
      },
    );

    if (!res.ok) {
      console.error("Email service error:", res.status, await res.text());
      return NextResponse.json(
        { error: "Failed to subscribe" },
        { status: res.status === 409 ? 409 : 502 },
      );
    }

    return NextResponse.json({ message: "Subscribed" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Subscribe failed" }, { status: 500 });
  }
}
