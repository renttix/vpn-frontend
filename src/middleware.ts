import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for login pages and login API route
  if (
    pathname === "/admin-login.html" || 
    pathname.startsWith("/api/admin/login")
  ) {
    return NextResponse.next();
  }
  
  // Handle redirect for old login page path
  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin-login.html", request.url));
  }
  
  // Only apply auth check to admin routes, admin API routes, and Apple News API routes
  if (pathname.startsWith("/admin") || 
      (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/login")) || 
      pathname.startsWith("/api/apple-news")) {
    
    // Check for our custom admin session cookie
    const adminSession = request.cookies.get("admin_session");
    
    if (!adminSession || adminSession.value !== "authenticated") {
      // Redirect to the HTML login page if not authenticated
      return NextResponse.redirect(new URL("/admin-login.html", request.url));
    }
  }
  
  // Allow the request to proceed
  return NextResponse.next();
}

// Update the matcher to be more specific
export const config = {
  matcher: [
    // Match all admin routes and the admin login route
    "/admin/:path*",
    "/admin/login",
    "/admin/login/",
    // Match all admin API routes
    "/api/admin/:path*",
    // Match all Apple News API routes
    "/api/apple-news/:path*",
  ],
};
