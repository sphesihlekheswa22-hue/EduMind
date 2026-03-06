import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// In-memory store for demo purposes (would be database in production)
const profiles: Record<string, { avatar?: string; name?: string; email?: string; bio?: string; institution?: string; location?: string; updatedAt?: string }> = {};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const file = formData.get('avatar') as File | null;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Initialize profile if not exists
    if (!profiles[userId]) {
      profiles[userId] = {};
    }

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
      await mkdir(uploadDir, { recursive: true });
      
      // Generate unique filename
      const filename = `${userId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filepath = path.join(uploadDir, filename);
      
      await writeFile(filepath, buffer);
      
      // Save avatar URL to profile
      profiles[userId].avatar = `/uploads/avatars/${filename}`;
      profiles[userId].updatedAt = new Date().toISOString();
    }

    return NextResponse.json({ 
      success: true, 
      avatar: profiles[userId].avatar 
    });
  } catch (error) {
    console.error('Profile upload error:', error);
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
  }
}

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
