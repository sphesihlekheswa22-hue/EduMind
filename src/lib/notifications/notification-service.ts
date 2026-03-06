import { db, schema } from '../db';
import { eq, desc, and, sql, or } from 'drizzle-orm';

export type NotificationType = 
  | 'course_material'
  | 'quiz_result'
  | 'feedback'
  | 'quiz_available'
  | 'teacher_message'
  | 'admin_update'
  | 'system_announcement';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  sendEmail?: boolean;
}

// Notification type labels for display
export const notificationTypeLabels: Record<NotificationType, string> = {
  course_material: 'Course Material',
  quiz_result: 'Quiz Result',
  feedback: 'AI Feedback',
  quiz_available: 'Quiz Available',
  teacher_message: 'Teacher Message',
  admin_update: 'Admin Update',
  system_announcement: 'System Announcement',
};

// Create a new notification
export async function createNotification(params: CreateNotificationParams) {
  const { userId, title, message, type, link, sendEmail = false } = params;

  // Insert notification into database
  const [notification] = await db.insert(schema.notifications).values({
    userId,
    title,
    message,
    type,
    link: link || null,
    isRead: false,
    createdAt: new Date(),
  }).returning();

  // TODO: Send email notification if enabled
  // For now, we'll just log it. In production, integrate with an email service
  if (sendEmail) {
    console.log(`[Email] Sending notification to user ${userId}: ${title}`);
    // await sendEmailNotification(userId, title, message);
  }

  return notification;
}

// Get notifications for a user
export async function getUserNotifications(
  userId: string,
  options?: { limit?: number; offset?: number; unreadOnly?: boolean }
) {
  const { limit = 20, offset = 0, unreadOnly = false } = options || {};

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

  return notifications;
}

// Get unread notification count
export async function getUnreadCount(userId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.notifications)
    .where(and(
      eq(schema.notifications.userId, userId),
      eq(schema.notifications.isRead, false)
    ));

  return result[0]?.count || 0;
}

// Mark a notification as read
export async function markAsRead(notificationId: number, userId: string) {
  const result = await db
    .update(schema.notifications)
    .set({ isRead: true })
    .where(and(
      eq(schema.notifications.id, notificationId),
      eq(schema.notifications.userId, userId)
    ))
    .run();

  return result.changes > 0;
}

// Mark all notifications as read for a user
export async function markAllAsRead(userId: string) {
  const result = await db
    .update(schema.notifications)
    .set({ isRead: true })
    .where(eq(schema.notifications.userId, userId))
    .run();

  return result.changes > 0;
}

// Delete a notification
export async function deleteNotification(notificationId: number, userId: string) {
  const result = await db
    .delete(schema.notifications)
    .where(and(
      eq(schema.notifications.id, notificationId),
      eq(schema.notifications.userId, userId)
    ))
    .run();

  return result.changes > 0;
}

// Clear all notifications for a user
export async function clearAllNotifications(userId: string) {
  const result = await db
    .delete(schema.notifications)
    .where(eq(schema.notifications.userId, userId))
    .run();

  return result.changes > 0;
}

// Notify multiple users (e.g., when teacher uploads material to a course)
export async function notifyMultipleUsers(
  userIds: string[],
  title: string,
  message: string,
  type: NotificationType,
  link?: string
) {
  const notifications = userIds.map(userId => ({
    userId,
    title,
    message,
    type,
    link: link || null,
    isRead: false,
    createdAt: new Date(),
  }));

  await db.insert(schema.notifications).values(notifications);
  
  return { success: true, count: userIds.length };
}

// Get or create notification preferences for a user
export async function getNotificationPreferences(userId: string) {
  let prefs = await db
    .select()
    .from(schema.notificationPreferences)
    .where(eq(schema.notificationPreferences.userId, userId))
    .limit(1);

  if (prefs.length === 0) {
    // Create default preferences
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

  return prefs[0];
}

// Update notification preferences
export async function updateNotificationPreferences(
  userId: string,
  updates: Partial<{
    emailEnabled: boolean;
    inAppEnabled: boolean;
    courseMaterialNotifications: boolean;
    quizResultNotifications: boolean;
    feedbackNotifications: boolean;
    quizAvailableNotifications: boolean;
    teacherMessageNotifications: boolean;
    adminUpdateNotifications: boolean;
    systemAnnouncementNotifications: boolean;
  }>
) {
  const result = await db
    .update(schema.notificationPreferences)
    .set(updates)
    .where(eq(schema.notificationPreferences.userId, userId))
    .run();

  return result.changes > 0;
}

// Helper function to create common notification types
export const notificationHelpers = {
  // When teacher uploads material
  courseMaterialUploaded: (userId: string, subject: string, link?: string) =>
    createNotification({
      userId,
      title: 'New Course Material Available',
      message: `Your teacher has uploaded new material for ${subject}. Check it out to enhance your learning!`,
      type: 'course_material',
      link: link || '/dashboard/student',
    }),

  // When quiz results are available
  quizResultReady: (userId: string, subject: string, link?: string) =>
    createNotification({
      userId,
      title: 'Quiz Results Ready',
      message: `Your ${subject} quiz has been graded. View your results and see how you performed!`,
      type: 'quiz_result',
      link: link || '/feedback',
    }),

  // When AI feedback is generated
  feedbackReady: (userId: string, subject: string, link?: string) =>
    createNotification({
      userId,
      title: 'AI Feedback Report Ready',
      message: `Your personalized AI feedback for ${subject} is ready. Discover your strengths and areas for improvement!`,
      type: 'feedback',
      link: link || '/feedback',
    }),

  // When new quiz is available
  newQuizAvailable: (userId: string, subject: string, link?: string) =>
    createNotification({
      userId,
      title: 'New Quiz Available',
      message: `A new adaptive quiz for ${subject} is available. Test your knowledge and track your progress!`,
      type: 'quiz_available',
      link: link || '/quiz',
    }),

  // When teacher sends message
  teacherMessage: (userId: string, teacherName: string, link?: string) =>
    createNotification({
      userId,
      title: 'Message from Your Teacher',
      message: `${teacherName} has sent you a message. Check your inbox for details!`,
      type: 'teacher_message',
      link: link || '/dashboard/student',
    }),

  // When admin updates account
  adminUpdate: (userId: string, message: string, link?: string) =>
    createNotification({
      userId,
      title: 'Account Update',
      message,
      type: 'admin_update',
      link,
    }),

  // System-wide announcement
  systemAnnouncement: (userId: string, title: string, message: string, link?: string) =>
    createNotification({
      userId,
      title,
      message,
      type: 'system_announcement',
      link,
    }),
};
