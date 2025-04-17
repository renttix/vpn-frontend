import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Comment } from '@/models/Comment';

// GET endpoint to fetch all comments (including unapproved ones)
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Fetch all comments, sorted by creation date (newest first)
    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .lean();
    
    // Return the comments
    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching all comments:', error);
    return NextResponse.json(
      { message: 'Failed to fetch comments', error: String(error) },
      { status: 500 }
    );
  }
}
