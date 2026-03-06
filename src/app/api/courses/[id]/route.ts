import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { courses, users, enrollments, courseMaterials } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

// GET /api/courses/[id] - Get single course details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = parseInt(id);
    const user = await getCurrentUser();

    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Get teacher info
    const teacher = await db.query.users.findFirst({
      where: eq(users.id, course.teacherId),
    });

    // Check if user is enrolled (if logged in)
    let enrollmentStatus = null;
    if (user) {
      const enrollment = await db.query.enrollments.findFirst({
        where: and(
          eq(enrollments.studentId, user.id),
          eq(enrollments.courseId, courseId)
        ),
      });
      enrollmentStatus = enrollment?.status || null;
    }

    // Get course materials count
    const materials = await db.query.courseMaterials.findMany({
      where: eq(courseMaterials.courseId, courseId),
    });

    // Get enrollment count
    const enrollmentCount = await db
      .select({ count: enrollments.id })
      .from(enrollments)
      .where(and(eq(enrollments.courseId, courseId), eq(enrollments.status, 'approved')));

    return NextResponse.json({
      course: {
        ...course,
        teacherName: teacher?.name || 'Unknown Teacher',
        teacherEmail: teacher?.email || '',
        enrollmentCount: enrollmentCount.length,
        materialsCount: materials.length,
        enrollmentStatus,
      },
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}

// PUT /api/courses/[id] - Update course (teacher only, owner)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = parseInt(id);
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'teacher' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only teachers can update courses' }, { status: 403 });
    }

    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check ownership (or admin)
    if (user.role !== 'admin' && course.teacherId !== user.id) {
      return NextResponse.json({ error: 'You can only update your own courses' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, subject, courseCode, thumbnail, isPublished } = body;

    const updatedCourse = await db
      .update(courses)
      .set({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(subject && { subject }),
        ...(courseCode !== undefined && { courseCode }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(isPublished !== undefined && { isPublished }),
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId))
      .returning();

    return NextResponse.json({ course: updatedCourse[0] });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

// DELETE /api/courses/[id] - Delete course (teacher only, owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = parseInt(id);
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'teacher' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only teachers can delete courses' }, { status: 403 });
    }

    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check ownership (or admin)
    if (user.role !== 'admin' && course.teacherId !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own courses' }, { status: 403 });
    }

    // Delete course (cascade should handle enrollments and materials)
    await db.delete(courses).where(eq(courses.id, courseId));

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
