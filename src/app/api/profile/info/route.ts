import { NextResponse } from 'next/server';

// In-memory store for demo purposes (would be database in production)
const profiles: Record<string, { avatar?: string; name?: string; email?: string; bio?: string; institution?: string; location?: string; updatedAt?: string }> = {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // Return existing profile or default
  const profile = profiles[userId] || {};
  
  return NextResponse.json({
    userId,
    avatar: profile.avatar || null,
    name: profile.name || '',
    email: profile.email || '',
    bio: profile.bio || '',
    institution: profile.institution || '',
    location: profile.location || '',
    updatedAt: profile.updatedAt || null
  });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, email, bio, institution, location } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Initialize profile if not exists
    if (!profiles[userId]) {
      profiles[userId] = {};
    }

    // Update profile fields
    if (name !== undefined) profiles[userId].name = name;
    if (email !== undefined) profiles[userId].email = email;
    if (bio !== undefined) profiles[userId].bio = bio;
    if (institution !== undefined) profiles[userId].institution = institution;
    if (location !== undefined) profiles[userId].location = location;
    profiles[userId].updatedAt = new Date().toISOString();

    return NextResponse.json({ 
      success: true, 
      profile: profiles[userId]
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
