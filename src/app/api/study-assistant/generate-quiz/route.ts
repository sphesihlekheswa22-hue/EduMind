import { NextRequest, NextResponse } from "next/server";
import { uploadedFiles } from "@/lib/storage/uploaded-files";

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

function generateQuizFromContent(content: string, fileName: string): QuizQuestion[] {
  // In a real implementation, this would call an AI API to generate questions
  // For demo purposes, we generate structured questions based on the content

  const questions: QuizQuestion[] = [
    {
      id: 1,
      question: `According to the study notes from "${fileName}", what is the primary focus of the foundational concepts?`,
      options: [
        "Memorizing isolated facts without context",
        "Understanding relationships between concepts and their applications",
        "Focusing only on advanced topics",
        "Skipping definitions and going straight to examples",
      ],
      correctIndex: 1,
      explanation:
        "Your notes emphasize understanding relationships between concepts rather than rote memorization, as this leads to deeper comprehension and better problem-solving ability.",
    },
    {
      id: 2,
      question: "Which of the following best describes the structure of the study material?",
      options: [
        "Random collection of unrelated facts",
        "Only theoretical content with no practical examples",
        "Progressive structure from basic principles to advanced applications",
        "Advanced topics first, then basic concepts",
      ],
      correctIndex: 2,
      explanation:
        "The document is structured to build knowledge progressively, starting from foundational principles and advancing to more complex topics and real-world applications.",
    },
    {
      id: 3,
      question: "What study strategy does the document recommend for best results?",
      options: [
        "Read the material once and move on",
        "Focus only on the summary points",
        "Regular review and practice with provided examples",
        "Memorize all definitions without understanding them",
      ],
      correctIndex: 2,
      explanation:
        "The notes recommend regular review and practice with examples to strengthen comprehension and retention, rather than passive reading or pure memorization.",
    },
    {
      id: 4,
      question: "How many main chapters or sections does the study material contain?",
      options: [
        "One comprehensive section",
        "Two main chapters covering foundations and advanced concepts",
        "Five unrelated topics",
        "No clear structure",
      ],
      correctIndex: 1,
      explanation:
        "The document is organized into two main sections: foundational concepts and advanced applications, each building on the previous to create a complete understanding.",
    },
    {
      id: 5,
      question: "What type of content is included to help reinforce learning?",
      options: [
        "Only text-based definitions",
        "Formulas and rules only",
        "Definitions, examples, formulas, and review questions",
        "Images and diagrams only",
      ],
      correctIndex: 2,
      explanation:
        "The study material includes a comprehensive mix of definitions, practical examples, important formulas/rules, and review questions to support different learning styles.",
    },
    {
      id: 6,
      question: "According to the notes, what is the best approach when encountering a complex problem?",
      options: [
        "Guess the answer and move on",
        "Apply rules systematically using the principles learned",
        "Skip complex problems entirely",
        "Only use memorized formulas without understanding",
      ],
      correctIndex: 1,
      explanation:
        "The notes emphasize applying learned principles systematically to solve complex problems, which is more effective than guessing or relying solely on memorized formulas.",
    },
    {
      id: 7,
      question: "What is highlighted as a key skill for academic success in this subject?",
      options: [
        "Speed reading without comprehension",
        "Connecting new information to existing knowledge",
        "Avoiding practice questions",
        "Studying only the night before exams",
      ],
      correctIndex: 1,
      explanation:
        "The material emphasizes connecting new information to what you already know as a key skill, as this creates stronger neural pathways and improves long-term retention.",
    },
    {
      id: 8,
      question: "Which of the following is NOT mentioned as a component of the study material?",
      options: [
        "Core definitions and terminology",
        "Real-world application examples",
        "Video tutorials and animations",
        "Review questions for practice",
      ],
      correctIndex: 2,
      explanation:
        "The study notes contain text-based content including definitions, examples, and review questions. Video tutorials and animations are not part of the uploaded document.",
    },
  ];

  // Return 5-8 questions randomly selected
  const numQuestions = Math.floor(Math.random() * 4) + 5; // 5 to 8
  return questions.slice(0, numQuestions);
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
        { error: "File not found. Please upload your notes first." },
        { status: 404 }
      );
    }

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 800));

    const questions = generateQuizFromContent(fileData.content, fileData.name);

    return NextResponse.json({
      success: true,
      fileId,
      fileName: fileData.name,
      questions,
      totalQuestions: questions.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz. Please try again." },
      { status: 500 }
    );
  }
}
