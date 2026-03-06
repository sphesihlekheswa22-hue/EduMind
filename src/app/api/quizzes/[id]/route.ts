import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quizzes, quizQuestions, quizResults, courses, enrollments, users, notifications, aiFeedback, courseMaterials } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, sql, desc } from 'drizzle-orm';

// GET /api/quizzes/[id] - Get quiz details and questions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quizId = parseInt(id);
    const user = await getCurrentUser();

    if (isNaN(quizId)) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }

    // Get quiz
    const quiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.id, quizId),
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Get course info
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, quiz.courseId),
    });

    // Teachers see full quiz details
    if (user && (user.role === 'teacher' || user.role === 'admin')) {
      const questions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quizId));

      // Parse options
      const questionsWithParsedOptions = questions.map(q => ({
        ...q,
        options: JSON.parse(q.options),
      }));

      // Get student results
      const results = await db
        .select()
        .from(quizResults)
        .where(eq(quizResults.quizId, quizId))
        .orderBy(desc(quizResults.completedAt));

      const resultsWithStudents = await Promise.all(
        results.map(async (result) => {
          const student = await db.query.users.findFirst({
            where: eq(users.id, result.studentId),
          });
          return {
            ...result,
            studentName: student?.name || 'Unknown',
            studentEmail: student?.email || '',
          };
        })
      );

      return NextResponse.json({
        quiz: {
          ...quiz,
          courseName: course?.title || 'Unknown Course',
        },
        questions: questionsWithParsedOptions,
        results: resultsWithStudents,
      });
    }

    // Students see quiz without correct answers
    if (user && user.role === 'student') {
      // Check if enrolled
      const enrollment = await db.query.enrollments.findFirst({
        where: and(
          eq(enrollments.studentId, user.id),
          eq(enrollments.courseId, quiz.courseId),
          eq(enrollments.status, 'approved')
        ),
      });

      if (!enrollment) {
        return NextResponse.json({ error: 'You must be enrolled to access this quiz' }, { status: 403 });
      }

      // Get questions without correct answers
      const questions = await db
        .select({
          id: quizQuestions.id,
          quizId: quizQuestions.quizId,
          question: quizQuestions.question,
          options: quizQuestions.options,
          points: quizQuestions.points,
        })
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quizId));

      const questionsWithParsedOptions = questions.map(q => ({
        ...q,
        options: JSON.parse(q.options),
      }));

      // Get previous attempts
      const previousAttempts = await db
        .select()
        .from(quizResults)
        .where(
          and(
            eq(quizResults.quizId, quizId),
            eq(quizResults.studentId, user.id)
          )
        )
        .orderBy(desc(quizResults.completedAt));

      return NextResponse.json({
        quiz: {
          ...quiz,
          courseName: course?.title || 'Unknown Course',
        },
        questions: questionsWithParsedOptions,
        previousAttempts,
      });
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 });
  }
}

// POST /api/quizzes/[id] - Submit quiz answers
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quizId = parseInt(id);
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Only students can submit quizzes' }, { status: 403 });
    }

    if (isNaN(quizId)) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }

    // Get quiz
    const quiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.id, quizId),
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Check enrollment
    const enrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.studentId, user.id),
        eq(enrollments.courseId, quiz.courseId),
        eq(enrollments.status, 'approved')
      ),
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'You must be enrolled to submit this quiz' }, { status: 403 });
    }

    const body = await request.json();
    const { answers, timeTaken } = body; // answers: { questionId: selectedOptionIndex }

    if (!answers) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
    }

    // Get all questions
    const questions = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId));

    // Calculate score
    let score = 0;
    let totalPoints = 0;
    const answeredQuestions = [];

    for (const question of questions) {
      totalPoints += question.points || 1;
      const userAnswer = answers[question.id];
      
      answeredQuestions.push({
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: userAnswer === question.correctAnswer,
        points: question.points ?? 1,
      });

      if (userAnswer === question.correctAnswer) {
        score += question.points ?? 1;
      }
    }

    // Save result
    const result = await db.insert(quizResults).values({
      quizId,
      studentId: user.id,
      score,
      totalPoints,
      answers: JSON.stringify(answers),
      timeTaken: timeTaken || null,
    }).returning();

    // Calculate percentage
    const percentage = Math.round((score / totalPoints) * 100);
    const passed = percentage >= (quiz.passingScore || 60);

    // Generate AI feedback
    const weakTopics: string[] = [];
    const strongTopics: string[] = [];
    const suggestions: string[] = [];

    for (const answered of answeredQuestions) {
      if (answered.isCorrect) {
        strongTopics.push(answered.questionId.toString());
      } else {
        weakTopics.push(answered.questionId.toString());
      }
    }

    if (weakTopics.length > 0) {
      suggestions.push('Focus on understanding the topics you missed');
      suggestions.push('Review the course materials related to the incorrect answers');
    }

    if (percentage >= 90) {
      suggestions.push('Excellent work! Consider helping other students');
    } else if (percentage >= 70) {
      suggestions.push('Good job! A bit more practice will help you master the material');
    } else {
      suggestions.push('Consider reviewing the course materials before trying again');
    }

    // Save AI feedback
    const feedback = await db.insert(aiFeedback).values({
      resultId: result[0].id,
      studentId: user.id,
      quizId,
      weakTopics: JSON.stringify(weakTopics),
      strongTopics: JSON.stringify(strongTopics),
      suggestions: JSON.stringify(suggestions),
      recommendedMaterials: JSON.stringify([]),
    }).returning();

    // Send notification
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, quiz.courseId),
    });

    await db.insert(notifications).values({
      userId: user.id,
      title: 'Quiz Result Available',
      message: `Your result for "${quiz.title}" is ready! Score: ${percentage}% ${passed ? '(Passed)' : '(Try again)'}`,
      type: 'quiz_result',
      link: `/feedback?resultId=${result[0].id}`,
    });

    return NextResponse.json({
      result: {
        ...result[0],
        percentage,
        passed,
      },
      feedback: feedback[0],
      breakdown: answeredQuestions,
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
  }
}
