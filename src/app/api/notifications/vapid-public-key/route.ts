import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
// Skip static generation for this API route
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET() {
  // Use a fallback key during build time to prevent errors
  const isBuildTime = process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !process.env.NETLIFY_LOCAL;
  
  // During build time, return a dummy key to avoid errors
  if (isBuildTime) {
    return NextResponse.json({ 
      publicKey: 'BLBz5U0ynWG4O3RsQKR-eLmEt0srZSIVM8k-RgFawuO5fFX8PQYCvnE0xKOV9wbVP6j9RK1NKl_rNzFdPeUJUAA',
      isBuildTime: true
    });
  }
  
  // In runtime, return the actual key
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
    'BLBz5U0ynWG4O3RsQKR-eLmEt0srZSIVM8k-RgFawuO5fFX8PQYCvnE0xKOV9wbVP6j9RK1NKl_rNzFdPeUJUAA';
  
  return NextResponse.json({ publicKey: vapidPublicKey });
}
