import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, notificationPreferences } from '@/lib/db/schema';
import { createSession, getCurrentUser, hashPassword, verifyPassword, generateId } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Validate role
    const validRoles = ['student', 'teacher', 'parent', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'student';

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateId();

    // Create user
    const newUser = await db.insert(users).values({
      id: generateId(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userRole,
      emailVerified: false, // Would send verification email in production
      verificationToken,
    }).returning();

    // Create notification preferences
    await db.insert(notificationPreferences).values({
      userId: newUser[0].id,
      emailEnabled: true,
      inAppEnabled: true,
    });

    // In production, send verification email here
    // For now, auto-verify for demo
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, newUser[0].id));

    // Create session
    await createSession({
      id: newUser[0].id,
      name: newUser[0].name,
      email: newUser[0].email,
      role: newUser[0].role,
    });

    // Redirect based on role
    const redirectPath = getDashboardPath(userRole);

    return NextResponse.json({
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        role: newUser[0].role,
      },
      redirectPath,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}

// GET /api/auth/session - Get current session
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
}

// DELETE /api/auth/session - Logout
export async function DELETE() {
  try {
    const { destroySession } = await import('@/lib/auth');
    await destroySession();

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}

// Helper function to get dashboard path based on role
function getDashboardPath(role: string): string {
  switch (role) {
    case 'teacher':
      return '/dashboard/teacher';
    case 'admin':
      return '/dashboard/admin';
    case 'parent':
      return '/dashboard/parent';
    default:
      return '/dashboard/student';
  }
}
