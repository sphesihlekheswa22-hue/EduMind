import { NextRequest, NextResponse } from "next/server";
import { uploadedFiles } from "@/lib/storage/uploaded-files";

interface SummaryResult {
  summary: string;
  keyConcepts: string[];
  importantTopics: string[];
}

function generateSummary(content: string, fileName: string): SummaryResult {
  // In a real implementation, this would call an AI API (OpenAI, Anthropic, etc.)
  // For demo purposes, we generate a structured response based on the content

  const wordCount = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10);

  // Extract key sentences for summary (first few meaningful sentences)
  const summaryLines = sentences.slice(0, 5).map((s) => s.trim()).filter(Boolean);

  const summary = `This document "${fileName}" contains ${wordCount} words of study material. 

${summaryLines.slice(0, 3).join(". ")}${summaryLines.length > 0 ? "." : ""}

The material covers foundational concepts and their practical applications. Key areas include theoretical frameworks, definitions, and real-world examples that help reinforce understanding. The content is structured to build knowledge progressively, starting from basic principles and advancing to more complex topics.

Students are advised to focus on understanding the relationships between concepts rather than rote memorization. Regular review and practice with the provided examples will strengthen comprehension and retention.`;

  const keyConcepts = [
    "Foundational Principles",
    "Core Definitions and Terminology",
    "Theoretical Frameworks",
    "Practical Applications",
    "Problem-Solving Strategies",
    "Conceptual Relationships",
  ];

  const importantTopics = [
    "Introduction and Background",
    "Primary Concepts and Rules",
    "Advanced Applications",
    "Review and Practice Questions",
    "Real-World Examples",
  ];

  return { summary, keyConcepts, importantTopics };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    const fileData = uploadedFiles.get(fileId);
    if (!fileData) {
      return NextResponse.json(
        { error: "File not found. Please upload the file again." },
        { status: 404 }
      );
    }

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = generateSummary(fileData.content, fileData.name);

    return NextResponse.json({
      success: true,
      fileId,
      fileName: fileData.name,
      ...result,
    });
  } catch (error) {
    console.error("Summarize error:", error);
    return NextResponse.json(
      { error: "AI summarization failed. Please try again." },
      { status: 500 }
    );
  }
}
