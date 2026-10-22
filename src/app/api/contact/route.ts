import { NextRequest, NextResponse } from "next/server";
import { processContactSubmission } from "@/lib/contact";

export async function POST(req: NextRequest) {
  try {
    const contentLengthHeader = req.headers.get("content-length");
    const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : undefined;
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request format." },
        { status: 400 }
      );
    }

    const result = await processContactSubmission(body, {
      contentLength,
      clientIp,
    });

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Unhandled contact API exception:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while processing your request. Please try again.",
      },
      { status: 500 }
    );
  }
}
