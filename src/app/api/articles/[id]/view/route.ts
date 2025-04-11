import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { client } from '@/lib/sanity.client';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    const articleId = params.id;
    
    if (!articleId) {
      return NextResponse.json(
        { success: false, message: 'Article ID is required' },
        { status: 400 }
      );
    }
    
    // Increment the pageViews counter in Sanity
    // This uses the GROQ patch operation to atomically increment the counter
    await client
      .patch(articleId)
      .setIfMissing({ pageViews: 0 })
      .inc({ pageViews: 1 })
      .commit();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking article view:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to track article view' },
      { status: 500 }
    );
  }
}
