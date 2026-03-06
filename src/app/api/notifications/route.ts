import { NextRequest, NextResponse } from 'next/server';
import { db, schema, initializeDatabase } from '@/lib/db';
import { eq, desc, and, sql } from 'drizzle-orm';
import { notificationHelpers, getUnreadCount } from '@/lib/notifications/notification-service';

// Initialize database on first import
let dbInitialized = false;
if (!dbInitialized) {
  initializeDatabase();
  dbInitialized = true;
}

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const conditions = [eq(schema.notifications.userId, userId)];
    
    if (unreadOnly) {
      conditions.push(eq(schema.notifications.isRead, false));
    }

    const notifications = await db
      .select()
      .from(schema.notifications)
      .where(and(...conditions))
      .orderBy(desc(schema.notifications.createdAt))
      .limit(limit)
      .offset(offset);

    // Get unread count
    const unreadCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.notifications)
      .where(and(
        eq(schema.notifications.userId, userId),
        eq(schema.notifications.isRead, false)
      ));

    const unreadCount = unreadCountResult[0]?.count || 0;

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, message, type, link } = body;

    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, message, type' },
        { status: 400 }
      );
    }

    const validTypes = ['course_material', 'quiz_result', 'feedback', 'quiz_available', 'teacher_message', 'admin_update', 'system_announcement'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    const [notification] = await db
      .insert(schema.notifications)
      .values({
        userId,
        title,
        message,
        type,
        link: link || null,
        isRead: false,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { notificationId } = body;

    if (action === 'markAllRead') {
      // Mark all notifications as read
      const result = await db
        .update(schema.notifications)
        .set({ isRead: true })
        .where(eq(schema.notifications.userId, userId))
        .run();

      return NextResponse.json({ 
        success: true, 
        updatedCount: result.changes 
      });
    } else if (action === 'markRead' && notificationId) {
      // Mark single notification as read
      const result = await db
        .update(schema.notifications)
        .set({ isRead: true })
        .where(and(
          eq(schema.notifications.id, notificationId),
          eq(schema.notifications.userId, userId)
        ))
        .run();

      return NextResponse.json({ 
        success: result.changes > 0,
        updatedCount: result.changes 
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { notificationId } = body;

    if (action === 'clearAll') {
      // Clear all notifications
      const result = await db
        .delete(schema.notifications)
        .where(eq(schema.notifications.userId, userId))
        .run();

      return NextResponse.json({ 
        success: true, 
        deletedCount: result.changes 
      });
    } else if (action === 'delete' && notificationId) {
      // Delete single notification
      const result = await db
        .delete(schema.notifications)
        .where(and(
          eq(schema.notifications.id, notificationId),
          eq(schema.notifications.userId, userId)
        ))
        .run();

      return NextResponse.json({ 
        success: result.changes > 0,
        deletedCount: result.changes 
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
