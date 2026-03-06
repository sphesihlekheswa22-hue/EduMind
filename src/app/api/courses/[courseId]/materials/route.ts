import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { courseMaterials, courses, enrollments, users, notifications } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

// GET /api/courses/[courseId]/materials - Get materials for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const courseIdNum = parseInt(courseId);
    const user = await getCurrentUser();

    if (isNaN(courseIdNum)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    // Check if course exists
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseIdNum),
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check access - teacher owns course, or student is enrolled
    if (user) {
      if (user.role === 'teacher' && course.teacherId === user.id) {
        // Teacher can see all materials
        const materials = await db
          .select({
            id: courseMaterials.id,
            courseId: courseMaterials.courseId,
            title: courseMaterials.title,
            description: courseMaterials.description,
            fileType: courseMaterials.fileType,
            fileUrl: courseMaterials.fileUrl,
            fileSize: courseMaterials.fileSize,
            uploadedBy: courseMaterials.uploadedBy,
            createdAt: courseMaterials.createdAt,
          })
          .from(courseMaterials)
          .where(eq(courseMaterials.courseId, courseIdNum));

        // Get uploader names
        const materialsWithUploader = await Promise.all(
          materials.map(async (material) => {
            const uploader = await db.query.users.findFirst({
              where: eq(users.id, material.uploadedBy),
            });
            return {
              ...material,
              uploaderName: uploader?.name || 'Unknown',
            };
          })
        );

        return NextResponse.json({ materials: materialsWithUploader });
      }

      if (user.role === 'student') {
        // Check if student is enrolled
        const enrollment = await db.query.enrollments.findFirst({
          where: and(
            eq(enrollments.studentId, user.id),
            eq(enrollments.courseId, courseIdNum),
            eq(enrollments.status, 'approved')
          ),
        });

        if (!enrollment) {
          return NextResponse.json({ error: 'You must be enrolled to view materials' }, { status: 403 });
        }

        // Get materials
        const materials = await db
          .select({
            id: courseMaterials.id,
            courseId: courseMaterials.courseId,
            title: courseMaterials.title,
            description: courseMaterials.description,
            fileType: courseMaterials.fileType,
            fileUrl: courseMaterials.fileUrl,
            fileSize: courseMaterials.fileSize,
            uploadedBy: courseMaterials.uploadedBy,
            createdAt: courseMaterials.createdAt,
          })
          .from(courseMaterials)
          .where(eq(courseMaterials.courseId, courseIdNum));

        const materialsWithUploader = await Promise.all(
          materials.map(async (material) => {
            const uploader = await db.query.users.findFirst({
              where: eq(users.id, material.uploadedBy),
            });
            return {
              ...material,
              uploaderName: uploader?.name || 'Unknown',
            };
          })
        );

        return NextResponse.json({ materials: materialsWithUploader });
      }

      // Admin can see all
      if (user.role === 'admin') {
        const materials = await db
          .select()
          .from(courseMaterials)
          .where(eq(courseMaterials.courseId, courseIdNum));

        return NextResponse.json({ materials });
      }
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
  }
}

// POST /api/courses/[courseId]/materials - Upload material (teacher only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const courseIdNum = parseInt(courseId);
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'teacher' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only teachers can upload materials' }, { status: 403 });
    }

    if (isNaN(courseIdNum)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    // Check if course exists and user owns it
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseIdNum),
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (user.role !== 'admin' && course.teacherId !== user.id) {
      return NextResponse.json({ error: 'You can only upload to your own courses' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, fileType, fileUrl, fileSize, extractedText } = body;

    if (!title || !fileType || !fileUrl) {
      return NextResponse.json({ error: 'Title, file type, and file URL are required' }, { status: 400 });
    }

    // Create material
    const newMaterial = await db.insert(courseMaterials).values({
      courseId: courseIdNum,
      title,
      description: description || '',
      fileType,
      fileUrl,
      fileSize: fileSize || 0,
      extractedText: extractedText || '',
      uploadedBy: user.id,
    }).returning();

    // Notify enrolled students
    const enrolledStudents = await db.query.enrollments.findMany({
      where: and(
        eq(enrollments.courseId, courseIdNum),
        eq(enrollments.status, 'approved')
      ),
    });

    for (const enrollment of enrolledStudents) {
      await db.insert(notifications).values({
        userId: enrollment.studentId,
        title: 'New Course Material',
        message: `New material "${title}" has been uploaded to "${course.title}"`,
        type: 'course_material',
        link: `/courses/${courseIdNum}/materials`,
      });
    }

    return NextResponse.json({ material: newMaterial[0] }, { status: 201 });
  } catch (error) {
    console.error('Error uploading material:', error);
    return NextResponse.json({ error: 'Failed to upload material' }, { status: 500 });
  }
}
