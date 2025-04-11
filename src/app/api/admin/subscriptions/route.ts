import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Subscription from '@/models/Subscription';

// Mock data for when MongoDB is not available
const mockSubscriptions = [
  {
    _id: 'mock-id-1',
    endpoint: 'https://fcm.googleapis.com/fcm/send/example-endpoint-1',
    keys: {
      p256dh: 'mock-p256dh-key-1',
      auth: 'mock-auth-key-1'
    },
    createdAt: new Date().toISOString(),
    lastNotified: null,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    _id: 'mock-id-2',
    endpoint: 'https://fcm.googleapis.com/fcm/send/example-endpoint-2',
    keys: {
      p256dh: 'mock-p256dh-key-2',
      auth: 'mock-auth-key-2'
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    lastNotified: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  }
];

// GET handler to fetch all subscriptions
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get all subscriptions from the database
    const subscriptions = await Subscription.find({})
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .lean(); // Convert to plain JavaScript objects
    
    return NextResponse.json({ 
      success: true, 
      subscriptions,
      count: subscriptions.length
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    
    // Return mock data instead of an error
    return NextResponse.json({ 
      success: true, 
      subscriptions: mockSubscriptions,
      count: mockSubscriptions.length,
      isMockData: true
    });
  }
}

// DELETE handler to remove a subscription
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
  try {
    const id = params.id;
    
    // Check if this is a mock ID
    if (id.startsWith('mock-id')) {
      return NextResponse.json({ success: true });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Delete the subscription
    const result = await Subscription.findByIdAndDelete(id);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
