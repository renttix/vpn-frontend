// This file overrides the NextAuth.js configuration to disable it
// We are now using a custom authentication system with cookies instead

import { NextResponse } from "next/server";

// Return a 404 for all NextAuth.js routes
export function GET() {
  return new NextResponse(null, { status: 404 });
}

export function POST() {
  return new NextResponse(null, { status: 404 });
}
