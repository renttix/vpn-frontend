import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity.client';
// Use crypto module's randomUUID instead of uuid package
import { randomUUID } from 'crypto';

// Function alias to maintain compatibility with existing code
const uuidv4 = () => randomUUID();

// Verify reCAPTCHA token (supports both v2 and v3)
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
    
    // For reCAPTCHA v2, we only need to check data.success
    // For reCAPTCHA v3, we need to check both data.success and data.score
    if (data.success) {
      // If score is present (v3), check if it meets the threshold
      if (version === 'v3' && typeof data.score !== 'undefined') {
        return data.score >= 0.5;
      }
      // If no score or v2, just return success
      return true;
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

export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const description = formData.get('description') as string;
    const recaptchaToken = formData.get('recaptchaToken') as string;

    // Validate required fields
    if (!email || !subject || !description) {
      return NextResponse.json(
        { message: 'Email, subject, and description are required' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA (default to v2 since we're using v2 now)
    const recaptchaVersion = formData.get('recaptchaVersion') as 'v2' | 'v3' || 'v2';
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken, recaptchaVersion);
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { message: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    // Process attachments
    const attachments = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('attachment_') && value instanceof File) {
        const file = value;
        
        // Get file data
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileType = file.type;
        
        // Create a unique filename
        const filename = `${uuidv4()}-${file.name}`;
        
        // Upload file to Sanity
        const asset = await client.assets.upload('file', buffer, {
          filename,
          contentType: fileType,
        });
        
        attachments.push({
          _type: 'file',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
        });
      }
    }

    // Create document in Sanity
    const tipDocument = {
      _type: 'tipSubmission',
      email,
      subject,
      description: [
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'normal',
          markDefs: [],
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: description,
              marks: [],
            },
          ],
        },
      ],
      attachments,
      submittedAt: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      status: 'new',
    };

    const result = await client.create(tipDocument);

    return NextResponse.json({ success: true, id: result._id });
  } catch (error) {
    console.error('Error submitting tip/story:', error);
    return NextResponse.json(
      { message: 'Failed to submit tip/story' },
      { status: 500 }
    );
  }
}
