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

  // Create indexes for better query performance
  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
  `);

  console.log('Database initialized successfully');
}

// Export schema for use in other files
export { schema };
