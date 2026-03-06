import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { enrollments, courses, users, notifications } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, sql } from 'drizzle-orm';

// GET /api/enrollments - Get enrollments based on role
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status');

    // Students see their own enrollments
    if (user.role === 'student') {
      const conditions = [eq(enrollments.studentId, user.id)];
      
      if (status) {
        conditions.push(eq(enrollments.status, status));
      }

      const studentEnrollments = await db
        .select({
          id: enrollments.id,
          studentId: enrollments.studentId,
          courseId: enrollments.courseId,
          status: enrollments.status,
          requestedAt: enrollments.requestedAt,
          processedAt: enrollments.processedAt,
        })
        .from(enrollments)
        .where(and(...conditions));

      // Get course details for each enrollment
      const enrollmentsWithCourse = await Promise.all(
        studentEnrollments.map(async (enrollment) => {
          const course = await db.query.courses.findFirst({
            where: eq(courses.id, enrollment.courseId),
          });
          const teacher = course ? await db.query.users.findFirst({
            where: eq(users.id, course.teacherId),
          }) : null;
          return {
            ...enrollment,
            course: course ? {
              title: course.title,
              description: course.description,
              subject: course.subject,
              courseCode: course.courseCode,
              teacherName: teacher?.name || 'Unknown',
            } : null,
          };
        })
      );

      return NextResponse.json({ enrollments: enrollmentsWithCourse });
    }

    // Teachers see enrollments for their courses
    if (user.role === 'teacher') {
      const teacherCourses = await db
        .select({ id: courses.id })
        .from(courses)
        .where(eq(courses.teacherId, user.id));

      const courseIds = teacherCourses.map(c => c.id);

      if (courseIds.length === 0) {
        return NextResponse.json({ enrollments: [] });
      }

      const conditions = [sql`${enrollments.courseId} IN (${courseIds.join(',')})`];

      if (status) {
        conditions.push(eq(enrollments.status, status));
      }

      const teacherEnrollments = await db
        .select({
          id: enrollments.id,
          studentId: enrollments.studentId,
          courseId: enrollments.courseId,
          status: enrollments.status,
          requestedAt: enrollments.requestedAt,
          processedAt: enrollments.processedAt,
        })
        .from(enrollments)
        .where(and(...conditions));

      // Get student and course details
      const enrollmentsWithDetails = await Promise.all(
        teacherEnrollments.map(async (enrollment) => {
          const student = await db.query.users.findFirst({
            where: eq(users.id, enrollment.studentId),
          });
          const course = await db.query.courses.findFirst({
            where: eq(courses.id, enrollment.courseId),
          });
          return {
            ...enrollment,
            studentName: student?.name || 'Unknown',
            studentEmail: student?.email || '',
            courseTitle: course?.title || 'Unknown Course',
            courseSubject: course?.subject || '',
          };
        })
      );

      return NextResponse.json({ enrollments: enrollmentsWithDetails });
    }

    // Admins see all enrollments
    if (user.role === 'admin') {
      const allEnrollments = await db
        .select({
          id: enrollments.id,
          studentId: enrollments.studentId,
          courseId: enrollments.courseId,
          status: enrollments.status,
          requestedAt: enrollments.requestedAt,
          processedAt: enrollments.processedAt,
          processedBy: enrollments.processedBy,
        })
        .from(enrollments)
        .orderBy(enrollments.requestedAt);

      return NextResponse.json({ enrollments: allEnrollments });
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 403 });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
  }
}

// POST /api/enrollments - Request enrollment (student)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Only students can request enrollment' }, { status: 403 });
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Check if course exists
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.studentId, user.id),
        eq(enrollments.courseId, courseId)
      ),
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: `You already have a ${existingEnrollment.status} enrollment request` },
        { status: 400 }
      );
    }

    // Create enrollment request
    const newEnrollment = await db.insert(enrollments).values({
      studentId: user.id,
      courseId,
      status: 'pending',
    }).returning();

    return NextResponse.json(
      { enrollment: newEnrollment[0], message: 'Enrollment request submitted' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error requesting enrollment:', error);
    return NextResponse.json({ error: 'Failed to request enrollment' }, { status: 500 });
  }
}

// PUT /api/enrollments - Process enrollment (approve/reject)
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'teacher' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only teachers can process enrollments' }, { status: 403 });
    }

    const body = await request.json();
    const { enrollmentId, action } = body; // action: 'approve' or 'reject'

    if (!enrollmentId || !action) {
      return NextResponse.json({ error: 'Enrollment ID and action are required' }, { status: 400 });
    }

    // Get the enrollment
    const enrollment = await db.query.enrollments.findFirst({
      where: eq(enrollments.id, enrollmentId),
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Check if teacher owns the course
    if (user.role === 'teacher') {
      const course = await db.query.courses.findFirst({
        where: eq(courses.id, enrollment.courseId),
      });

      if (!course || course.teacherId !== user.id) {
        return NextResponse.json({ error: 'You can only process enrollments for your own courses' }, { status: 403 });
      }
    }

    // Update enrollment status
    const updatedEnrollment = await db
      .update(enrollments)
      .set({
        status: action === 'approve' ? 'approved' : 'rejected',
        processedAt: new Date(),
        processedBy: user.id,
      })
      .where(eq(enrollments.id, enrollmentId))
      .returning();

    // Send notification to student
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, enrollment.courseId),
    });

    const notificationType = action === 'approve' ? 'enrollment_approved' : 'enrollment_rejected';
    const notificationTitle = action === 'approve' ? 'Enrollment Approved' : 'Enrollment Rejected';
    const notificationMessage = action === 'approve'
      ? `Your enrollment request for "${course?.title}" has been approved!`
      : `Your enrollment request for "${course?.title}" has been rejected.`;

    await db.insert(notifications).values({
      userId: enrollment.studentId,
      title: notificationTitle,
      message: notificationMessage,
      type: notificationType,
      link: action === 'approve' ? `/my-courses` : `/courses`,
    });

    return NextResponse.json({
      enrollment: updatedEnrollment[0],
      message: `Enrollment ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error) {
    console.error('Error processing enrollment:', error);
    return NextResponse.json({ error: 'Failed to process enrollment' }, { status: 500 });
  }
}
