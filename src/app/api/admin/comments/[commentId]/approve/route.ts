import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Comment } from '@/models/Comment';

// PUT endpoint to approve a comment
export async function PUT(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const { commentId } = params;
    
    // Validate comment ID
    if (!commentId) {
      return NextResponse.json(
        { message: 'Comment ID is required' },
        { status: 400 }
      );
    }
    
    // Find the comment and update its approval status
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { isApproved: true },
      { new: true } // Return the updated document
    );
    
    // Check if the comment exists
    if (!comment) {
      return NextResponse.json(
        { message: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Return the updated comment
    return NextResponse.json({ 
      message: 'Comment approved successfully',
      comment
    });
  } catch (error) {
    console.error('Error approving comment:', error);
    return NextResponse.json(
      { message: 'Failed to approve comment', error: String(error) },
      { status: 500 }
    );
  }
}
