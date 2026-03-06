# Active Context: EduMind AI Platform

## Current State

**Project Status**: ✅ EduMind AI platform fully built and deployed

The template has been transformed into a full EduMind AI adaptive learning platform with all 4 core modules implemented.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] **EduMind AI full platform build** (all pages, components, and modules)
- [x] **AI Study Assistant feature** — file upload, AI summarization, chat tutor, quiz generation
- [x] **Direct text input for AI Study Assistant** — paste notes directly for better AI analysis
- [x] **Notification System** — bell icon, dropdown, notifications page, real-time polling, notification triggers

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Landing page with hero, features, how-it-works, roles, CTA | ✅ Done |
| `src/app/layout.tsx` | Root layout with EduMind metadata | ✅ Done |
| `src/app/globals.css` | EduMind design system (dark theme, indigo/cyan palette) | ✅ Done |
| `src/app/login/page.tsx` | Login page with OAuth + email/password + demo links | ✅ Done |
| `src/app/register/page.tsx` | 2-step registration (role select → account details) | ✅ Done |
| `src/app/dashboard/student/page.tsx` | Student dashboard: stats, subject performance, badges, AI recs | ✅ Done |
| `src/app/dashboard/teacher/page.tsx` | Teacher dashboard: overview, students, upload, analytics tabs | ✅ Done |
| `src/app/dashboard/admin/page.tsx` | Admin panel: user management, audit logs, RBAC settings | ✅ Done |
| `src/app/quiz/page.tsx` | AI adaptive quiz: subject select → quiz → results | ✅ Done |
| `src/app/feedback/page.tsx` | AI personalised feedback: weak/strong topics, resources, history | ✅ Done |
| `src/components/Navbar.tsx` | Public navbar with mobile menu | ✅ Done |
| `src/components/DashboardSidebar.tsx` | Role-aware sidebar (student/teacher/admin) with AI Study Assistant link | ✅ Done |
| `src/app/study-assistant/page.tsx` | AI Study Assistant: file upload + text paste, summary, chat, quiz tabs | ✅ Done |
| `src/app/api/study-assistant/upload/route.ts` | API: file upload + text extraction (PDF/DOCX/TXT, 20MB limit) | ✅ Done |
| `src/app/api/study-assistant/summarize/route.ts` | API: AI summarization — summary, key concepts, important topics | ✅ Done |
| `src/app/api/study-assistant/chat/route.ts` | API: AI chat tutor — context-aware Q&A based on uploaded notes | ✅ Done |
| `src/app/api/study-assistant/generate-quiz/route.ts` | API: AI quiz generation — 5–8 MCQs with explanations | ✅ Done |
| `src/app/api/study-assistant/text/route.ts` | API: direct text input — paste notes for better AI analysis | ✅ Done |
| `src/app/api/notifications/route.ts` | API: notifications CRUD operations | ✅ Done |
| `src/app/api/notifications/preferences/route.ts` | API: notification preferences | ✅ Done |
| `src/app/api/notifications/trigger/route.ts` | API: trigger notifications for events | ✅ Done |
| `src/app/dashboard/notifications/page.tsx` | Notifications page with history | ✅ Done |
| `src/components/NotificationBell.tsx` | Notification bell with dropdown | ✅ Done |

## Architecture Implemented

### 4 Core Modules

1. **Authentication System** (`/login`, `/register`)
   - Email/password login with show/hide password
   - Google OAuth button
   - 2-step registration with role selection (Student/Teacher/Parent)
   - Forgot password link
   - Demo dashboard quick-links

2. **AI Learning System** (`/quiz`, `/feedback`)
   - Subject selection (5 subjects)
   - Adaptive difficulty display (5-level bar)
   - Real-time AI messages on correct/incorrect answers
   - Quiz results with score, avg time, AI analysis
   - Personalised feedback with weak/strong topic analysis
   - Recommended resources with bookmark support
   - Quiz history table

3. **Learning Management System** (`/dashboard/teacher`)
   - File upload drag-and-drop zone (PDF/DOCX/PPT/MP4)
   - AI processing explanation
   - Uploaded materials list with status (Approved/Processing/Review)
   - Student management table with filters

4. **Analytics System** (`/dashboard/student`, `/dashboard/teacher`, `/dashboard/admin`)
   - Student: score trends, subject performance bars, weekly goals, badges, streak
   - Teacher: class stats, subject overview, at-risk alerts, score distribution, engagement chart, AI insights
   - Admin: system stats, user management with RBAC, audit logs, system settings toggles

5. **Notification System** (`/dashboard/notifications`, Navbar bell icon)
   - Notification bell in navbar with unread count badge
   - Dropdown with recent notifications
   - Full notifications history page with filters (All/Unread/Read)
   - Real-time polling (30-second interval)
   - Mark as read, mark all as read, delete notifications
   - 7 notification types: course_material, quiz_result, feedback, quiz_available, teacher_message, admin_update, system_announcement
   - Notification preferences API
   - Trigger API for generating notifications from events

- **Theme**: Dark (slate-950 background)
- **Primary**: Indigo (#6366f1) + Cyan (#06b6d4) gradient
- **Typography**: Geist Sans
- **Components**: Cards, badges, progress bars, buttons, input fields, sidebar links — all defined in `globals.css`

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2025-03-06 | Full EduMind AI platform built — 12 files, 2788 lines added |
| 2026-03-06 | AI Study Assistant feature added — 6 new files (page + 4 API routes + sidebar update + dashboard section) |
| 2026-03-06 | Direct text input for AI Study Assistant — paste notes directly for better AI analysis |
| 2026-03-06 | Notification System added — bell icon, dropdown, notifications page, real-time polling, notification triggers |

## Database Schema

### Notifications

```sql
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at INTEGER,
  link TEXT
);

CREATE TABLE notification_preferences (
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
);
```
