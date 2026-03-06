import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Session cookie name
export const SESSION_COOKIE = 'edumind_session';

// User session interface
export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
}

// Create a simple session (in production, use proper JWT or session management)
export async function createSession(user: { id: string; name: string; email: string; role: string }): Promise<string> {
  const sessionToken = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  // Store session in cookie (simplified - in production use proper session store)
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return sessionToken;
}

// Get current user from session
export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);

    if (!sessionCookie?.value) {
      return null;
    }

    // Extract user ID from session token (format: userId-timestamp-random)
    const userId = sessionCookie.value.split('-')[0];
    if (!userId) {
      return null;
    }

    // Fetch user from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'student' | 'teacher' | 'parent' | 'admin',
    };
  } catch {
    return null;
  }
}

// Destroy session (logout)
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

// Check user role
export async function hasRole(role: 'student' | 'teacher' | 'parent' | 'admin'): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

// Require authentication - redirects to login if not authenticated
export async function requireAuth(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

// Require specific role
export async function requireRole(roles: ('student' | 'teacher' | 'parent' | 'admin')[]): Promise<UserSession> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  return user;
}

// Simple password hashing (in production, use bcrypt or argon2)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
}

// Generate random ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
