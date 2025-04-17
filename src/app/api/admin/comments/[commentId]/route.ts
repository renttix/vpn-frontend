import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Comment } from '@/models/Comment';

// DELETE endpoint to remove a comment
export async function DELETE(
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
    
    // Find the comment and delete it
    const comment = await Comment.findByIdAndDelete(commentId);
    
    // Check if the comment exists
    if (!comment) {
      return NextResponse.json(
        { message: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Return success response
    return NextResponse.json({ 
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { message: 'Failed to delete comment', error: String(error) },
      { status: 500 }
    );
  }
}
