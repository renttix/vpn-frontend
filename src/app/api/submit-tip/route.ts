import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity.client';
// Use crypto module's randomUUID instead of uuid package
import { randomUUID } from 'crypto';

// Function alias to maintain compatibility with existing code
const uuidv4 = () => randomUUID();

// Verify reCAPTCHA token
async function verifyRecaptcha(token: string): Promise<boolean> {
  // If no token is provided, fail verification in production
  if (!token) {
    return process.env.NODE_ENV !== 'production';
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
    return data.success && data.score >= 0.5;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
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

    // Verify reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
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
    console.error('Error submitting tip:', error);
    return NextResponse.json(
      { message: 'Failed to submit tip' },
      { status: 500 }
    );
  }
}
