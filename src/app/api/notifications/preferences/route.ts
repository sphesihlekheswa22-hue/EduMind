import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

// GET /api/notifications/preferences - Get user's notification preferences
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let prefs = await db
      .select()
      .from(schema.notificationPreferences)
      .where(eq(schema.notificationPreferences.userId, userId))
      .limit(1);

    // Create default preferences if not exist
    if (prefs.length === 0) {
      const [newPrefs] = await db
        .insert(schema.notificationPreferences)
        .values({
          userId,
          emailEnabled: true,
          inAppEnabled: true,
          courseMaterialNotifications: true,
          quizResultNotifications: true,
          feedbackNotifications: true,
          quizAvailableNotifications: true,
          teacherMessageNotifications: true,
          adminUpdateNotifications: true,
          systemAnnouncementNotifications: true,
        })
        .returning();
      
      prefs = [newPrefs];
    }

    return NextResponse.json({ preferences: prefs[0] });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/preferences - Update user's notification preferences
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if preferences exist
    const existing = await db
      .select()
      .from(schema.notificationPreferences)
      .where(eq(schema.notificationPreferences.userId, userId))
      .limit(1);

    let result;
    if (existing.length === 0) {
      // Create new preferences
      const [newPrefs] = await db
        .insert(schema.notificationPreferences)
        .values({
          userId,
          ...updates,
        })
        .returning();
      
      result = newPrefs;
    } else {
      // Update existing preferences
      const [updated] = await db
        .update(schema.notificationPreferences)
        .set(updates)
        .where(eq(schema.notificationPreferences.userId, userId))
        .returning();
      
      result = updated;
    }

    return NextResponse.json({ preferences: result });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}
