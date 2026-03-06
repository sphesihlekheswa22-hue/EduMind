import { NextRequest, NextResponse } from "next/server";
import { uploadedFiles } from "../upload/route";

const MIN_TEXT_LENGTH = 50;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, title } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 });
    }

    const trimmedText = text.trim();
    
    if (trimmedText.length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text must be at least ${MIN_TEXT_LENGTH} characters. Please paste more content.` },
        { status: 400 }
      );
    }

    // Generate a unique file ID for the text content
    const fileId = `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const documentTitle = title?.trim() || "Pasted Notes";

    // Store the text content in the same map as uploaded files
    uploadedFiles.set(fileId, {
      name: documentTitle,
      content: trimmedText,
      uploadedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      fileId,
      fileName: documentTitle,
      contentLength: trimmedText.length,
      wordCount: trimmedText.split(/\s+/).length,
      message: "Text submitted successfully",
    });
  } catch (error) {
    console.error("Text input error:", error);
    return NextResponse.json(
      { error: "Failed to process text. Please try again." },
      { status: 500 }
    );
  }
}
