import { NextRequest, NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db';
import { notificationHelpers, notifyMultipleUsers } from '@/lib/notifications/notification-service';

// Initialize database on first import
let dbInitialized = false;
if (!dbInitialized) {
  initializeDatabase();
  dbInitialized = true;
}

// POST /api/notifications/trigger - Trigger a notification event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data } = body;

    if (!event || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: event, data' },
        { status: 400 }
      );
    }

    switch (event) {
      case 'course_material_uploaded':
        // Notify students when teacher uploads material
        if (data.studentIds && Array.isArray(data.studentIds)) {
          await notifyMultipleUsers(
            data.studentIds,
            'New Course Material Available',
            `Your teacher has uploaded new material for ${data.subject || 'a course'}. Check it out to enhance your learning!`,
            'course_material',
            '/dashboard/student'
          );
          return NextResponse.json({ success: true, message: 'Students notified' });
        }
        break;

      case 'quiz_result_ready':
        // Notify student when quiz is graded
        if (data.userId) {
          await notificationHelpers.quizResultReady(
            data.userId,
            data.subject || 'Quiz',
            '/feedback'
          );
          return NextResponse.json({ success: true, message: 'Student notified' });
        }
        break;

      case 'feedback_ready':
        // Notify student when AI feedback is ready
        if (data.userId) {
          await notificationHelpers.feedbackReady(
            data.userId,
            data.subject || 'Your learning',
            '/feedback'
          );
          return NextResponse.json({ success: true, message: 'Student notified' });
        }
        break;

      case 'new_quiz_available':
        // Notify students when new quiz is available
        if (data.studentIds && Array.isArray(data.studentIds)) {
          await notifyMultipleUsers(
            data.studentIds,
            'New Quiz Available',
            `A new adaptive quiz for ${data.subject || 'a subject'} is available. Test your knowledge and track your progress!`,
            'quiz_available',
            '/quiz'
          );
          return NextResponse.json({ success: true, message: 'Students notified' });
        }
        break;

      case 'teacher_message':
        // Notify student when teacher sends message
        if (data.userId && data.teacherName) {
          await notificationHelpers.teacherMessage(
            data.userId,
            data.teacherName,
            '/dashboard/student'
          );
          return NextResponse.json({ success: true, message: 'Student notified' });
        }
        break;

      case 'admin_update':
        // Notify user of admin updates
        if (data.userId && data.message) {
          await notificationHelpers.adminUpdate(
            data.userId,
            data.message,
            data.link
          );
          return NextResponse.json({ success: true, message: 'User notified' });
        }
        break;

      case 'system_announcement':
        // System-wide announcement
        if (data.userId && data.title && data.message) {
          await notificationHelpers.systemAnnouncement(
            data.userId,
            data.title,
            data.message,
            data.link
          );
          return NextResponse.json({ success: true, message: 'User notified' });
        }
        break;

      case 'broadcast':
        // Broadcast to multiple users
        if (data.userIds && Array.isArray(data.userIds)) {
          await notifyMultipleUsers(
            data.userIds,
            data.title,
            data.message,
            data.type || 'system_announcement',
            data.link
          );
          return NextResponse.json({ success: true, message: 'Broadcast sent' });
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown event type' },
          { status: 400 }
        );
    }

    return NextResponse.json(
      { error: 'Invalid event data' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error triggering notification:', error);
    return NextResponse.json(
      { error: 'Failed to trigger notification' },
      { status: 500 }
    );
  }
}
