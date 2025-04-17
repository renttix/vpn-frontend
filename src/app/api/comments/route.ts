import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Comment } from '@/models/Comment';
import { submitFormToHubSpot } from '@/lib/hubspot';

// Function to verify reCAPTCHA token
async function verifyRecaptcha(token: string, version: 'v2' | 'v3' = 'v3'): Promise<boolean> {
  // Special handling for development mode
  if (process.env.NODE_ENV !== 'production') {
    // In development, accept 'dev-token' as a valid token for testing
    if (token === 'dev-token') {
      console.log('Using development token for reCAPTCHA verification');
      return true;
    }
    
    // If no token is provided in development, still allow it
    if (!token) {
      console.warn('No reCAPTCHA token provided, but allowing in development mode');
      return true;
    }
  } else if (!token) {
    // In production, fail if no token is provided
    console.error('No reCAPTCHA token provided in production');
    return false;
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    // If no secret key is configured, skip verification in development
    if (!secretKey) {
      console.warn('RECAPTCHA_SECRET_KEY is not set');
      return process.env.NODE_ENV !== 'production';
    }

    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      { method: 'POST' }
    );

    const data = await response.json();
    
    // For v2, we just need to check if the verification was successful
    if (version === 'v2') {
      if (data.success === true) {
        return true;
      }
    } else {
      // For v3, we also check the score
      if (data.success === true && data.score >= 0.5) {
        return true;
      }
    }
    
    // In development, allow even if verification fails
    if (process.env.NODE_ENV !== 'production') {
      console.warn('reCAPTCHA verification failed, but allowing in development mode');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    // In development, allow even if verification throws an error
    return process.env.NODE_ENV !== 'production';
  }
}

// POST endpoint to create a new comment
export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.articleId || !body.name || !body.email || !body.content || !body.recaptchaToken) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Verify reCAPTCHA token
    const recaptchaVersion = body.recaptchaVersion || 'v3';
    const isRecaptchaValid = await verifyRecaptcha(
      body.recaptchaToken, 
      recaptchaVersion as 'v2' | 'v3'
    );
    
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { message: 'reCAPTCHA verification failed. Please try again.' },
        { status: 400 }
      );
    }
    
    // Create a new comment
    const comment = new Comment({
      articleId: body.articleId,
      name: body.name,
      email: body.email,
      content: body.content,
      // Default values for createdAt and isApproved are set in the schema
    });
    
    // Save the comment to the database
    await comment.save();
    
    // Also submit the commenter's information to HubSpot
    try {
      const referer = request.headers.get('referer') || '';
      const pageName = 'Article Comment';
      
      // Prepare the data for HubSpot
      const hubspotData = {
        email: body.email,
        firstName: body.name.split(' ')[0], // Extract first name
        lastName: body.name.split(' ').slice(1).join(' '), // Extract last name
        message: body.content,
        form_type: 'comment',
        submission_date: new Date().toISOString()
      };
      
      // Submit to HubSpot
      await submitFormToHubSpot(
        hubspotData,
        referer,
        pageName
      );
      
      console.log('Comment data submitted to HubSpot successfully');
    } catch (hubspotError) {
      // Log the error but don't fail the comment submission
      console.error('Error submitting comment data to HubSpot:', hubspotError);
    }
    
    // Return success response
    return NextResponse.json(
      { 
        message: 'Comment submitted successfully', 
        comment: {
          id: comment._id,
          name: comment.name,
          content: comment.content,
          createdAt: comment.createdAt,
          isApproved: comment.isApproved
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { message: 'Failed to submit comment', error: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch comments for an article
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get the article ID from the query parameters
    const url = new URL(request.url);
    const articleId = url.searchParams.get('articleId');
    
    // Validate article ID
    if (!articleId) {
      return NextResponse.json(
        { message: 'Article ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch all comments for the article, sorted by creation date (newest first)
    const comments = await Comment.find({ 
      articleId
    })
    .sort({ createdAt: -1 })
    .select('name content createdAt')
    .lean();
    
    // Return the comments
    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { message: 'Failed to fetch comments', error: String(error) },
      { status: 500 }
    );
  }
}
