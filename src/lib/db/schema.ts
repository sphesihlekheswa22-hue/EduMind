import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Notifications table
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // course_material, quiz_result, feedback, quiz_available, teacher_message, admin_update, system_announcement
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  link: text('link'), // Optional link to related page
});

// Notification preferences table (for email settings)
export const notificationPreferences = sqliteTable('notification_preferences', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(),
  emailEnabled: integer('email_enabled', { mode: 'boolean' }).default(true),
  inAppEnabled: integer('in_app_enabled', { mode: 'boolean' }).default(true),
  courseMaterialNotifications: integer('course_material_notifications', { mode: 'boolean' }).default(true),
  quizResultNotifications: integer('quiz_result_notifications', { mode: 'boolean' }).default(true),
  feedbackNotifications: integer('feedback_notifications', { mode: 'boolean' }).default(true),
  quizAvailableNotifications: integer('quiz_available_notifications', { mode: 'boolean' }).default(true),
  teacherMessageNotifications: integer('teacher_message_notifications', { mode: 'boolean' }).default(true),
  adminUpdateNotifications: integer('admin_update_notifications', { mode: 'boolean' }).default(true),
  systemAnnouncementNotifications: integer('system_announcement_notifications', { mode: 'boolean' }).default(true),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert;
