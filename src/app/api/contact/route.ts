import { NextRequest, NextResponse } from "next/server";
import {
  processContactSubmission,
  extractClientIp,
  sanitizeErrorMessage,
} from "@/lib/contact";

export async function POST(req: NextRequest) {
  try {
    const contentLengthHeader = req.headers.get("content-length");
    const contentLength = contentLengthHeader
      ? parseInt(contentLengthHeader, 10)
      : undefined;

    // Immediate check if Content-Length header is present and oversized
    if (contentLength !== undefined && (isNaN(contentLength) || contentLength > 65536)) {
      return NextResponse.json(
        { success: false, error: "Payload too large. Please shorten your message." },
        { status: 413 }
      );
    }

    const clientIp = extractClientIp(req.headers);

    // Read raw body text first to protect against oversized chunked requests without Content-Length
    let rawText: string;
    try {
      rawText = await req.text();
    } catch {
      return NextResponse.json(
        { success: false, error: "Unable to read request payload." },
        { status: 400 }
      );
    }

    // Enforce 64KB size limit on raw body (both length and UTF-8 byte size)
    const byteLength = Buffer.byteLength(rawText, "utf-8");
    if (rawText.length > 65536 || byteLength > 65536) {
      return NextResponse.json(
        { success: false, error: "Payload too large. Please shorten your message." },
        { status: 413 }
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request format." },
        { status: 400 }
      );
    }

    // Ensure parsed JSON is a non-null plain object (reject arrays, primitives, null)
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: "Request body must be a valid JSON object." },
        { status: 400 }
      );
    }

    const result = await processContactSubmission(body, {
      contentLength: byteLength,
      clientIp,
    });

    return NextResponse.json(result.data, { status: result.status });
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
