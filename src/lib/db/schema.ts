import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ==================== USER MANAGEMENT ====================

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('student'), // student, teacher, parent, admin
  avatar: text('avatar'),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  verificationToken: text('verification_token'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ==================== COURSES ====================

// Courses table
export const courses = sqliteTable('courses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  subject: text('subject').notNull(),
  courseCode: text('course_code'),
  teacherId: text('teacher_id').notNull(),
  thumbnail: text('thumbnail'),
  isPublished: integer('is_published', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ==================== ENROLLMENTS ====================

// Enrollments table
export const enrollments = sqliteTable('enrollments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: text('student_id').notNull(),
  courseId: integer('course_id').notNull(),
  status: text('status').notNull().default('pending'), // pending, approved, rejected
  requestedAt: integer('requested_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  processedAt: integer('processed_at', { mode: 'timestamp' }),
  processedBy: text('processed_by'),
});

// ==================== COURSE MATERIALS ====================

// Course materials table
export const courseMaterials = sqliteTable('course_materials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  fileType: text('file_type').notNull(), // pdf, docx, pptx, txt, video
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'),
  extractedText: text('extracted_text'),
  uploadedBy: text('uploaded_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ==================== MESSAGES ====================

// Messages table
export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  senderId: text('sender_id').notNull(),
  receiverId: text('receiver_id').notNull(),
  courseId: integer('course_id'), // Optional - for course-related messages
  subject: text('subject'),
  content: text('content').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  isAnnouncement: integer('is_announcement', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ==================== QUIZZES ====================

// Quizzes table
export const quizzes = sqliteTable('quizzes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  materialId: integer('material_id'), // Optional - from course material
  timeLimit: integer('time_limit'), // in minutes
  passingScore: integer('passing_score').default(60),
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Quiz questions table
export const quizQuestions = sqliteTable('quiz_questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  quizId: integer('quiz_id').notNull(),
  question: text('question').notNull(),
  options: text('options').notNull(), // JSON array of 4 options
  correctAnswer: integer('correct_answer').notNull(), // 0-3 index
  explanation: text('explanation'),
  points: integer('points').default(1),
});

// Quiz results table
export const quizResults = sqliteTable('quiz_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  quizId: integer('quiz_id').notNull(),
  studentId: text('student_id').notNull(),
  score: integer('score').notNull(),
  totalPoints: integer('total_points').notNull(),
  answers: text('answers'), // JSON object of answers
  timeTaken: integer('time_taken'), // in seconds
  completedAt: integer('completed_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// AI Feedback table
export const aiFeedback = sqliteTable('ai_feedback', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  resultId: integer('result_id').notNull(),
  studentId: text('student_id').notNull(),
  quizId: integer('quiz_id').notNull(),
  weakTopics: text('weak_topics'), // JSON array
  strongTopics: text('strong_topics'), // JSON array
  suggestions: text('suggestions'), // JSON array of suggestions
  recommendedMaterials: text('recommended_materials'), // JSON array of material IDs
  generatedAt: integer('generated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ==================== NOTIFICATIONS ====================

// Notifications table
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  link: text('link'),
});

// Notification preferences table
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

// ==================== TYPE EXPORTS ====================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;
export type CourseMaterial = typeof courseMaterials.$inferSelect;
export type NewCourseMaterial = typeof courseMaterials.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type NewQuizQuestion = typeof quizQuestions.$inferInsert;
export type QuizResult = typeof quizResults.$inferSelect;
export type NewQuizResult = typeof quizResults.$inferInsert;
export type AIFeedback = typeof aiFeedback.$inferSelect;
export type NewAIFeedback = typeof aiFeedback.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert;
