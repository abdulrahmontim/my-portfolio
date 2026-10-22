import { NextRequest, NextResponse } from "next/server";
import {
  processContactSubmission,
  extractClientIp,
  sanitizeErrorMessage,
} from "@/lib/contact";

export async function POST(req: NextRequest) {
  try {
    // 1. Cross-origin validation (protects against unauthorized cross-site form abuse)
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        const isAllowed =
          originUrl.host === host ||
          originUrl.host === "abdulrahmon.tech" ||
          originUrl.host === "abdulrahmon-sulaimon.vercel.app" ||
          originUrl.hostname === "localhost" ||
          originUrl.hostname === "127.0.0.1";

        if (!isAllowed) {
          return NextResponse.json(
            { success: false, error: "Cross-origin submissions are not allowed." },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid origin header." },
          { status: 403 }
        );
      }
    }

    // 2. Content-Length header verification
    const contentLengthHeader = req.headers.get("content-length");
    const contentLength = contentLengthHeader
      ? parseInt(contentLengthHeader, 10)
      : undefined;

    if (contentLength !== undefined && (isNaN(contentLength) || contentLength > 65536)) {
      return NextResponse.json(
        { success: false, error: "Payload too large. Please shorten your message." },
        { status: 413 }
      );
    }

    // 3. Extract trusted client IP
    const clientIp = extractClientIp(req.headers);

    // 4. Read raw body text first to protect against chunked requests without Content-Length
    let rawText: string;
    try {
      rawText = await req.text();
    } catch {
      return NextResponse.json(
        { success: false, error: "Unable to read request payload." },
        { status: 400 }
      );
    }

    // 5. Enforce 64KB size limit on raw body (both length and UTF-8 byte size)
    const byteLength = Buffer.byteLength(rawText, "utf-8");
    if (rawText.length > 65536 || byteLength > 65536) {
      return NextResponse.json(
        { success: false, error: "Payload too large. Please shorten your message." },
        { status: 413 }
      );
    }

    // 6. Parse JSON safely
    let body: unknown;
    try {
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request format." },
        { status: 400 }
      );
    }

    // 7. Ensure parsed JSON is a non-null plain object
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: "Request body must be a valid JSON object." },
        { status: 400 }
      );
    }

    // 8. Process submission through contact service layer
    const result = await processContactSubmission(body, {
      contentLength: byteLength,
      clientIp,
    });

    const response = NextResponse.json(result.data, { status: result.status });

    // 9. Include Retry-After header when rate limited
    if (result.status === 429 && result.retryAfter) {
      response.headers.set("Retry-After", String(result.retryAfter));
    }

    return response;
  } catch (error) {
    console.error(
      "Unhandled contact API exception:",
      sanitizeErrorMessage(error)
    );
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while processing your request. Please try again.",
      },
      { status: 500 }
    );
  }
}
