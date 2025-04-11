import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Subscription from '@/models/Subscription';

// DELETE handler to remove a specific subscription by ID
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Handle mock IDs for demo purposes
    if (id.startsWith('mock-id')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Mock subscription deleted successfully',
        isMockData: true
      });
    }

    // Connect to the database
    await connectToDatabase();
    
    // Delete the subscription
    const result = await Subscription.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    
    // For demo purposes, pretend the operation succeeded even if MongoDB is not available
    if (params.id.startsWith('mock-id')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Mock subscription deleted successfully',
        isMockData: true
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to delete subscription. MongoDB connection may not be properly configured.' },
      { status: 500 }
    );
  }
}
