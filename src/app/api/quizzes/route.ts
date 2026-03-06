import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quizzes, quizQuestions, quizResults, courses, enrollments, users, notifications, aiFeedback, courseMaterials } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, sql, desc } from 'drizzle-orm';

// GET /api/quizzes - Get quizzes based on role
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const type = searchParams.get('type') || 'all'; // all, my-quizzes, available

    // Teachers see quizzes they created
    if (user.role === 'teacher') {
      const teacherQuizzes = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.createdBy, user.id))
        .orderBy(desc(quizzes.createdAt));

      const quizzesWithCourse = await Promise.all(
        teacherQuizzes.map(async (quiz) => {
          const course = await db.query.courses.findFirst({
            where: eq(courses.id, quiz.courseId),
          });
          const questionCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(quizQuestions)
            .where(eq(quizQuestions.quizId, quiz.id));
          return {
            ...quiz,
            courseName: course?.title || 'Unknown Course',
            questionCount: questionCount[0]?.count || 0,
          };
        })
      );

      return NextResponse.json({ quizzes: quizzesWithCourse });
    }

    // Students see available quizzes (enrolled courses)
    if (user.role === 'student') {
      // Get enrolled courses
      const enrolled = await db
        .select({ courseId: enrollments.courseId })
        .from(enrollments)
        .where(
          and(
            eq(enrollments.studentId, user.id),
            eq(enrollments.status, 'approved')
          )
        );

      const enrolledCourseIds = enrolled.map(e => e.courseId);

      if (enrolledCourseIds.length === 0) {
        return NextResponse.json({ quizzes: [] });
      }

      // Get quizzes for enrolled courses
      const availableQuizzes = await db
        .select()
        .from(quizzes)
        .where(
          and(
            sql`${quizzes.courseId} IN (${enrolledCourseIds.join(',')})`
          )
        )
        .orderBy(desc(quizzes.createdAt));

      // Get quiz details and attempt status
      const quizzesWithDetails = await Promise.all(
        availableQuizzes.map(async (quiz) => {
          const course = await db.query.courses.findFirst({
            where: eq(courses.id, quiz.courseId),
          });
          
          // Get student's best score
          const bestResult = await db
            .select()
            .from(quizResults)
            .where(
              and(
                eq(quizResults.quizId, quiz.id),
                eq(quizResults.studentId, user.id)
              )
            )
            .orderBy(desc(quizResults.score))
            .limit(1);

          // Get question count
          const questionCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(quizQuestions)
            .where(eq(quizQuestions.quizId, quiz.id));

          return {
            ...quiz,
            courseName: course?.title || 'Unknown Course',
            questionCount: questionCount[0]?.count || 0,
            bestScore: bestResult[0]?.score || null,
            hasAttempted: bestResult.length > 0,
          };
        })
      );

      return NextResponse.json({ quizzes: quizzesWithDetails });
    }

    // Admins see all quizzes
    if (user.role === 'admin') {
      const allQuizzes = await db
        .select()
        .from(quizzes)
        .orderBy(desc(quizzes.createdAt));

      return NextResponse.json({ quizzes: allQuizzes });
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 403 });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}

// POST /api/quizzes - Create a quiz (teacher)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'teacher' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only teachers can create quizzes' }, { status: 403 });
    }

    const body = await request.json();
    const { courseId, title, description, materialId, timeLimit, passingScore, questions } = body;

    if (!courseId || !title) {
      return NextResponse.json({ error: 'Course ID and title are required' }, { status: 400 });
    }

    // Verify teacher owns the course
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (user.role !== 'admin' && course.teacherId !== user.id) {
      return NextResponse.json({ error: 'You can only create quizzes for your own courses' }, { status: 403 });
    }

    // Create quiz
    const newQuiz = await db.insert(quizzes).values({
      courseId,
      title,
      description: description || '',
      materialId: materialId || null,
      timeLimit: timeLimit || null,
      passingScore: passingScore || 60,
      createdBy: user.id,
    }).returning();

    const quizId = newQuiz[0].id;

    // Add questions if provided
    if (questions && questions.length > 0) {
      for (const q of questions) {
        await db.insert(quizQuestions).values({
          quizId,
          question: q.question,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          points: q.points || 1,
        });
      }
    }

    // Notify enrolled students
    const enrolledStudents = await db.query.enrollments.findMany({
      where: and(
        eq(enrollments.courseId, courseId),
        eq(enrollments.status, 'approved')
      ),
    });

    for (const enrollment of enrolledStudents) {
      await db.insert(notifications).values({
        userId: enrollment.studentId,
        title: 'New Quiz Available',
        message: `A new quiz "${title}" is available in "${course.title}"`,
        type: 'quiz_available',
        link: `/quizzes/${quizId}`,
      });
    }

    return NextResponse.json({ quiz: newQuiz[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
  }
}
