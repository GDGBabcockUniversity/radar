import { resend } from "@/app/lib/resend";
import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

export async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Check if the email address exists
    const { data, error: contactFetchError } = await resend.contacts.get({
      email,
    });

    if (
      contactFetchError &&
      contactFetchError.message !== "Contact not found"
    ) {
      return NextResponse.json(
        { error: "Failed to subcribe to RADAR" },
        { status: 500 },
      );
    }

    if (data?.id) {
      return NextResponse.json({ error: "Email exists" }, { status: 409 });
    }

    const segmentId = "9154cc72-f7b8-4ce1-b148-6771be86c6e8";

    const { error: contactCreationError } = await resend.contacts.create({
      email,
      unsubscribed: false,
    });

    if (contactCreationError) {
      return NextResponse.json(
        { error: "Failed to subcribe to RADAR" },
        { status: 500 },
      );
    }

    const { error: addToSegmentError } = await resend.contacts.segments.add({
      email,
      segmentId,
    });

    if (addToSegmentError) {
      return NextResponse.json(
        { error: "Failed to subcribe to RADAR" },
        { status: 500 },
      );
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to subscribe to RADAR:", error);

    return NextResponse.json(
      { error: "Failed to subcribe to RADAR" },
      { status: 500 },
    );
  }
}

export const POST = verifySignatureAppRouter(handler);
