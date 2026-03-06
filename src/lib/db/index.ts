import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const DB_PATH = process.env.DB_PATH || './edumind.db';

// Ensure the directory exists
const dir = dirname(DB_PATH);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Initialize database tables
export function initializeDatabase() {
  // ==================== USER MANAGEMENT ====================
  
  // Create users table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      avatar TEXT,
      email_verified INTEGER DEFAULT 0,
      verification_token TEXT,
      created_at INTEGER,
      updated_at INTEGER
    )
  `);

  // ==================== COURSES ====================
  
  // Create courses table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      subject TEXT NOT NULL,
      course_code TEXT,
      teacher_id TEXT NOT NULL,
      thumbnail TEXT,
      is_published INTEGER DEFAULT 0,
      created_at INTEGER,
      updated_at INTEGER
    )
  `);

  // ==================== ENROLLMENTS ====================
  
  // Create enrollments table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      course_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      requested_at INTEGER,
      processed_at INTEGER,
      processed_by TEXT,
      UNIQUE(student_id, course_id)
    )
  `);

  // ==================== COURSE MATERIALS ====================
  
  // Create course materials table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS course_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      file_type TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_size INTEGER,
      extracted_text TEXT,
      uploaded_by TEXT NOT NULL,
      created_at INTEGER
    )
  `);

  // ==================== MESSAGES ====================
  
  // Create messages table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      course_id INTEGER,
      subject TEXT,
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      is_announcement INTEGER DEFAULT 0,
      created_at INTEGER
    )
  `);

  // ==================== QUIZZES ====================
  
  // Create quizzes table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      material_id INTEGER,
      time_limit INTEGER,
      passing_score INTEGER DEFAULT 60,
      created_by TEXT NOT NULL,
      created_at INTEGER
    )
  `);

  // Create quiz questions table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_answer INTEGER NOT NULL,
      explanation TEXT,
      points INTEGER DEFAULT 1
    )
  `);

  // Create quiz results table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL,
      student_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_points INTEGER NOT NULL,
      answers TEXT,
      time_taken INTEGER,
      completed_at INTEGER
    )
  `);

  // Create AI feedback table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS ai_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      result_id INTEGER NOT NULL,
      student_id TEXT NOT NULL,
      quiz_id INTEGER NOT NULL,
      weak_topics TEXT,
      strong_topics TEXT,
      suggestions TEXT,
      recommended_materials TEXT,
      generated_at INTEGER
    )
  `);

  // ==================== NOTIFICATIONS ====================
  
  // Create notifications table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at INTEGER,
      link TEXT
    )
  `);

  // Create notification preferences table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL UNIQUE,
      email_enabled INTEGER DEFAULT 1,
      in_app_enabled INTEGER DEFAULT 1,
      course_material_notifications INTEGER DEFAULT 1,
      quiz_result_notifications INTEGER DEFAULT 1,
      feedback_notifications INTEGER DEFAULT 1,
      quiz_available_notifications INTEGER DEFAULT 1,
      teacher_message_notifications INTEGER DEFAULT 1,
      admin_update_notifications INTEGER DEFAULT 1,
      system_announcement_notifications INTEGER DEFAULT 1
    )
  `);

  // ==================== INDEXES ====================
  
  // Create indexes for better query performance
  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    
    CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_courses_subject ON courses(subject);
    CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
    
    CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
    
    CREATE INDEX IF NOT EXISTS idx_course_materials_course_id ON course_materials(course_id);
    
    CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
    CREATE INDEX IF NOT EXISTS idx_messages_course_id ON messages(course_id);
    
    CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_results_student_id ON quiz_results(student_id);
    CREATE INDEX IF NOT EXISTS idx_ai_feedback_student_id ON ai_feedback(student_id);
    
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
  `);

  console.log('Database initialized successfully');
}

// Export schema for use in other files
export { schema };
