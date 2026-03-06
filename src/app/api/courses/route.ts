import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { courses, users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, like, or, sql } from 'drizzle-orm';

// GET /api/courses - Get all published courses (for students to browse)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const search = searchParams.get('search');
    const teacherId = searchParams.get('teacherId');

    // Build query conditions
    const conditions: any[] = [eq(courses.isPublished, true)];

    if (subject) {
      conditions.push(eq(courses.subject, subject));
    }

    if (search) {
      conditions.push(
        or(
          like(courses.title, `%${search}%`),
          like(courses.description, `%${search}%`),
          like(courses.courseCode, `%${search}%`)
        )
      );
    }

    if (teacherId) {
      conditions.push(eq(courses.teacherId, teacherId));
    }

    // If user is a teacher, show their own courses regardless of publish status
    if (user?.role === 'teacher') {
      conditions.length = 0; // Clear previous conditions
      conditions.push(eq(courses.teacherId, user.id));
    }

    // If admin, show all courses
    if (user?.role === 'admin') {
      conditions.length = 0;
    }

    const courseList = await db.select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      subject: courses.subject,
      courseCode: courses.courseCode,
      teacherId: courses.teacherId,
      thumbnail: courses.thumbnail,
      isPublished: courses.isPublished,
      createdAt: courses.createdAt,
    })
      .from(courses)
      .where(and(...conditions))
      .orderBy(courses.createdAt);

    // Get teacher names for each course
    const coursesWithTeachers = await Promise.all(
      courseList.map(async (course) => {
        const teacher = await db.query.users.findFirst({
          where: eq(users.id, course.teacherId),
        });
        return {
          ...course,
          teacherName: teacher?.name || 'Unknown Teacher',
        };
      })
    );

    // Get enrollment counts
    const { enrollments } = await import('@/lib/db/schema');
    const coursesWithEnrollment = await Promise.all(
      coursesWithTeachers.map(async (course) => {
        const enrollmentCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(enrollments)
          .where(and(eq(enrollments.courseId, course.id), eq(enrollments.status, 'approved')));
        
        return {
          ...course,
          enrollmentCount: enrollmentCount[0]?.count || 0,
        };
      })
    );

    return NextResponse.json({ courses: coursesWithEnrollment });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

// POST /api/courses - Create a new course (teacher only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'teacher' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only teachers can create courses' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, subject, courseCode, thumbnail, isPublished } = body;

    if (!title || !subject) {
      return NextResponse.json({ error: 'Title and subject are required' }, { status: 400 });
    }

    const newCourse = await db.insert(courses).values({
      title,
      description: description || '',
      subject,
      courseCode: courseCode || '',
      teacherId: user.id,
      thumbnail: thumbnail || '',
      isPublished: isPublished || false,
    }).returning();

    return NextResponse.json({ course: newCourse[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
