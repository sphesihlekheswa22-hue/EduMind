import { NextRequest, NextResponse } from "next/server";
import { uploadedFiles } from "../upload/route";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function generateAIResponse(question: string, documentContent: string, fileName: string): string {
  // In a real implementation, this would call an AI API with the document as context
  // For demo purposes, we generate contextual responses

  const questionLower = question.toLowerCase();

  // Check for common question patterns and provide relevant responses
  if (questionLower.includes("photosynthesis")) {
    return `Based on your uploaded notes from "${fileName}", here's an explanation of photosynthesis:

**Photosynthesis** is the process by which plants convert light energy into chemical energy stored as glucose.

The basic equation is:
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

**Key stages from your notes:**
1. **Light-dependent reactions** - Occur in the thylakoid membranes, capturing light energy
2. **Light-independent reactions (Calvin Cycle)** - Occur in the stroma, using energy to fix CO₂

**Important points your notes highlight:**
- Chlorophyll is the primary pigment that absorbs light
- The process requires sunlight, water, and carbon dioxide
- Oxygen is released as a byproduct

Would you like me to explain any specific part in more detail?`;
  }

  if (questionLower.includes("summary") || questionLower.includes("summarize")) {
    const wordCount = documentContent.split(/\s+/).length;
    return `Here's a summary of your uploaded document "${fileName}" (${wordCount} words):

The document covers several key areas of study material. Based on the content I've analyzed:

**Main Topics:**
• Foundational concepts and definitions
• Core principles and theoretical frameworks  
• Practical applications and examples
• Review questions and practice exercises

**Key Takeaways:**
1. The material builds progressively from basic to advanced concepts
2. Understanding relationships between ideas is emphasized over memorization
3. Real-world examples are provided to reinforce learning

Is there a specific section or topic you'd like me to explain in more detail?`;
  }

  if (questionLower.includes("key concept") || questionLower.includes("main point") || questionLower.includes("important")) {
    return `Based on your notes in "${fileName}", here are the key concepts:

**Primary Concepts:**
1. **Foundational Principles** - The core ideas that everything else builds upon
2. **Definitions and Terminology** - Essential vocabulary you need to know
3. **Theoretical Frameworks** - How concepts are organized and related

**Why These Matter:**
Your notes emphasize that understanding these concepts deeply will help you:
- Answer complex questions by applying principles
- Connect new information to what you already know
- Solve problems systematically

**Study Tip:** Your notes suggest reviewing these concepts in order, as each builds on the previous one.

What specific concept would you like me to explain further?`;
  }

  if (questionLower.includes("explain") || questionLower.includes("what is") || questionLower.includes("how does")) {
    return `Great question! Based on the content in your uploaded notes "${fileName}":

The topic you're asking about is covered in your study material. Here's what your notes say:

**Definition:** This concept refers to the fundamental principle or process described in your document.

**How it works:**
1. First, the initial conditions or inputs are established
2. Then, the process or mechanism operates according to defined rules
3. Finally, the outcome or result is produced

**From your notes specifically:**
Your document provides examples and explanations that connect this concept to real-world applications. The key insight is understanding not just *what* it is, but *why* it works this way.

**Remember:** Your notes highlight that this concept is frequently tested, so make sure you can explain it in your own words.

Would you like me to create some practice questions on this topic?`;
  }

  if (questionLower.includes("quiz") || questionLower.includes("test") || questionLower.includes("practice")) {
    return `I can help you practice! Based on your notes in "${fileName}", here are some practice questions:

**Quick Check Questions:**

1. What is the main principle discussed in the first section of your notes?
2. How do the concepts in your document relate to each other?
3. Can you explain the key terms in your own words?
4. What are the practical applications mentioned in your notes?
5. What are the most important points to remember?

**Tip:** Try answering these without looking at your notes first, then check your answers. This active recall technique is one of the most effective study methods!

Would you like me to generate a full multiple-choice quiz from your notes? Click the "Generate Quiz" button for that!`;
  }

  // Default contextual response
  const contentPreview = documentContent.substring(0, 200).replace(/\[.*?\]/g, "").trim();
  return `Based on your uploaded study notes from "${fileName}", I can help you understand this topic.

**From your document:**
${contentPreview}...

**My explanation:**
Your notes cover this subject comprehensively. The key thing to understand is the relationship between the main concepts and how they apply in different contexts.

**Study Strategy:**
1. Start with the definitions in your notes
2. Understand the core principles
3. Practice applying them to examples
4. Review the summary points

I'm here to help you understand any specific part of your notes. Feel free to ask about:
- Specific concepts or terms
- How different ideas connect
- Practice questions on any topic
- Explanations of difficult sections

What would you like to explore next?`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, message, history } = body as {
      fileId: string;
      message: string;
      history: ChatMessage[];
    };

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const fileData = uploadedFiles.get(fileId);
    if (!fileData) {
      return NextResponse.json(
        { error: "File not found. Please upload your notes first." },
        { status: 404 }
      );
    }

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 300));

    const response = generateAIResponse(message, fileData.content, fileData.name);

    const updatedHistory: ChatMessage[] = [
      ...history,
      { role: "user", content: message },
      { role: "assistant", content: response },
    ];

    return NextResponse.json({
      success: true,
      response,
      history: updatedHistory,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "AI assistant is temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
