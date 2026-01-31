import { BASE_URL, CREDENTIALS } from "@/app/lib/constants";
import { Client } from "@upstash/qstash";
import { NextRequest, NextResponse } from "next/server";

const qstash = new Client({ token: CREDENTIALS.qstash_token });

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email)
      return NextResponse.json({ error: "Email required" }, { status: 400 });

    // Publish to QStash
    await qstash.publishJSON({
      url: BASE_URL + "/api/worker/subscribe",
      body: { email },
      retries: 3, // QStash will try up to 3 times if it fails
      flowControl: {
        key: "resend-limit", // Global key for all subscribe requests
        parallelism: 1, // Process one job at a time
      },
    });

    return NextResponse.json(
      { message: "Subscription pending" },
      { status: 202 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Queue failed" }, { status: 500 });
  }
}
