import { NextRequest, NextResponse } from "next/server";
import { uploadedFiles } from "@/lib/storage/uploaded-files";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

function extractTextFromTxt(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(buffer);
}

function extractTextFromPdf(_buffer: ArrayBuffer, fileName: string): string {
  // In a real implementation, use a PDF parsing library like pdf-parse
  // For demo purposes, return simulated content based on filename
  return `[Extracted content from ${fileName}]

This document contains study notes on various topics. The AI has processed the uploaded PDF and extracted the following key information:

Introduction to the Subject
The document begins with foundational concepts that form the basis of understanding. These concepts are interconnected and build upon each other progressively.

Key Concepts
1. Primary Concept: The fundamental principle that governs the subject matter
2. Secondary Concept: How the primary concept applies in different contexts
3. Advanced Applications: Real-world scenarios where these concepts are used

Important Definitions
- Term A: A specific definition related to the subject
- Term B: Another important term with its explanation
- Term C: A technical term that students should memorize

Summary Points
The document emphasizes the importance of understanding the relationships between concepts rather than memorizing isolated facts. Students are encouraged to practice applying these concepts through exercises and real-world examples.`;
}

function extractTextFromDocx(_buffer: ArrayBuffer, fileName: string): string {
  // In a real implementation, use a DOCX parsing library like mammoth
  // For demo purposes, return simulated content
  return `[Extracted content from ${fileName}]

Study Notes - Comprehensive Overview

Chapter 1: Foundations
This chapter covers the essential building blocks needed to understand the subject. Students should pay particular attention to the definitions and examples provided.

Key Topics Covered:
• Topic 1: Introduction and background
• Topic 2: Core principles and theories
• Topic 3: Practical applications

Chapter 2: Advanced Concepts
Building on the foundations, this chapter explores more complex ideas and their relationships.

Important Formulas and Rules:
1. Rule 1: The primary rule governing the subject
2. Rule 2: An exception to the primary rule
3. Rule 3: How to apply rules in complex scenarios

Review Questions:
- What are the main differences between Topic 1 and Topic 2?
- How does Rule 1 apply when combined with Rule 3?
- Provide an example of Topic 3 in a real-world context.`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 20MB limit" },
        { status: 400 }
      );
    }

    // Check file type
    const fileName = file.name.toLowerCase();
    const fileExtension = "." + fileName.split(".").pop();
    const isAllowedType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(fileExtension);

    if (!isAllowedType) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, DOCX, or TXT files only." },
        { status: 400 }
      );
    }

    // Extract text from file
    const buffer = await file.arrayBuffer();
    let extractedText = "";

    if (file.type === "text/plain" || fileExtension === ".txt") {
      extractedText = extractTextFromTxt(buffer);
    } else if (file.type === "application/pdf" || fileExtension === ".pdf") {
      extractedText = extractTextFromPdf(buffer, file.name);
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileExtension === ".docx"
    ) {
      extractedText = extractTextFromDocx(buffer, file.name);
    }

    // Generate a unique file ID
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store the file content (in production, save to database/storage)
    uploadedFiles.set(fileId, {
      name: file.name,
      content: extractedText,
      uploadedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      fileId,
      fileName: file.name,
      fileSize: file.size,
      extractedLength: extractedText.length,
      message: "File uploaded and processed successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process file. Please try again." },
      { status: 500 }
    );
  }
}
