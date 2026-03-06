import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages, users, enrollments, courses, notifications } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, or, sql } from 'drizzle-orm';

// GET /api/messages - Get messages based on role
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'inbox'; // inbox, sent, announcements
    const courseId = searchParams.get('courseId');

    // Get messages where user is receiver (inbox)
    if (folder === 'inbox') {
      const inboxMessages = await db
        .select({
          id: messages.id,
          senderId: messages.senderId,
          receiverId: messages.receiverId,
          courseId: messages.courseId,
          subject: messages.subject,
          content: messages.content,
          isRead: messages.isRead,
          isAnnouncement: messages.isAnnouncement,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(
          or(
            eq(messages.receiverId, user.id),
            and(eq(messages.isAnnouncement, true), eq(messages.courseId, parseInt(courseId || '0')))
          )
        )
        .orderBy(messages.createdAt);

      // Get sender details
      const messagesWithSenders = await Promise.all(
        inboxMessages.map(async (message) => {
          const sender = await db.query.users.findFirst({
            where: eq(users.id, message.senderId),
          });
          return {
            ...message,
            senderName: sender?.name || 'Unknown',
            senderRole: sender?.role || '',
          };
        })
      );

      return NextResponse.json({ messages: messagesWithSenders });
    }

    // Get messages where user is sender (sent)
    if (folder === 'sent') {
      const sentMessages = await db
        .select({
          id: messages.id,
          senderId: messages.senderId,
          receiverId: messages.receiverId,
          courseId: messages.courseId,
          subject: messages.subject,
          content: messages.content,
          isRead: messages.isRead,
          isAnnouncement: messages.isAnnouncement,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(eq(messages.senderId, user.id))
        .orderBy(messages.createdAt);

      // Get receiver details
      const messagesWithReceivers = await Promise.all(
        sentMessages.map(async (message) => {
          const receiver = await db.query.users.findFirst({
            where: eq(users.id, message.receiverId),
          });
          return {
            ...message,
            receiverName: receiver?.name || 'Unknown',
            receiverRole: receiver?.role || '',
          };
        })
      );

      return NextResponse.json({ messages: messagesWithReceivers });
    }

    // Get announcements (for teachers)
    if (folder === 'announcements' && user.role === 'teacher') {
      const announcements = await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.isAnnouncement, true),
            eq(messages.senderId, user.id)
          )
        )
        .orderBy(messages.createdAt);

      return NextResponse.json({ messages: announcements });
    }

    return NextResponse.json({ messages: [] });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/messages - Send a message
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId, courseId, subject, content, isAnnouncement } = body;

    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // If sending announcement, verify teacher owns the course
    if (isAnnouncement && user.role === 'teacher') {
      if (!courseId) {
        return NextResponse.json({ error: 'Course ID required for announcements' }, { status: 400 });
      }

      const course = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
      });

      if (!course || course.teacherId !== user.id) {
        return NextResponse.json({ error: 'You can only send announcements to your own courses' }, { status: 403 });
      }

      // Get all enrolled students
      const enrolledStudents = await db.query.enrollments.findMany({
        where: and(
          eq(enrollments.courseId, courseId),
          eq(enrollments.status, 'approved')
        ),
      });

      // Create announcement for each student
      const announcementMessages = enrolledStudents.map(enrollment => ({
        senderId: user.id,
        receiverId: enrollment.studentId,
        courseId,
        subject: subject || `Announcement: ${course.title}`,
        content,
        isAnnouncement: true,
      }));

      for (const msg of announcementMessages) {
        await db.insert(messages).values(msg);
        
        // Send notification
        await db.insert(notifications).values({
          userId: msg.receiverId,
          title: 'New Announcement',
          message: `New announcement in "${course.title}": ${subject || 'No subject'}`,
          type: 'teacher_message',
          link: '/messages',
        });
      }

      return NextResponse.json({ message: 'Announcement sent successfully' }, { status: 201 });
    }

    // Regular message
    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 });
    }

    // Students can only message teachers
    if (user.role === 'student') {
      const receiver = await db.query.users.findFirst({
        where: eq(users.id, receiverId),
      });

      if (!receiver || receiver.role !== 'teacher') {
        return NextResponse.json({ error: 'Students can only message teachers' }, { status: 403 });
      }
    }

    // Create message
    const newMessage = await db.insert(messages).values({
      senderId: user.id,
      receiverId,
      courseId: courseId || null,
      subject: subject || '',
      content,
      isAnnouncement: false,
    }).returning();

    // Send notification to receiver
    const sender = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    await db.insert(notifications).values({
      userId: receiverId,
      title: 'New Message',
      message: `${sender?.name || 'Someone'} sent you a message: ${subject || 'No subject'}`,
      type: 'teacher_message',
      link: '/messages',
    });

    return NextResponse.json({ message: newMessage[0] }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// PUT /api/messages - Mark message as read
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, markAllRead } = body;

    if (markAllRead) {
      // Mark all messages as read
      await db
        .update(messages)
        .set({ isRead: true })
        .where(
          and(
            eq(messages.receiverId, user.id),
            eq(messages.isRead, false)
          )
        );

      return NextResponse.json({ message: 'All messages marked as read' });
    }

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    // Mark single message as read
    const message = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Only receiver can mark as read
    if (message.receiverId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));

    return NextResponse.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
