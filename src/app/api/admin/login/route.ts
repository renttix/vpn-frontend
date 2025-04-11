import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { username, password } = body;
    
    // Check credentials against environment variables
    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'secure-password-here';
    
    if (username === validUsername && password === validPassword) {
      // Create a simple session cookie
      const response = NextResponse.json({ success: true, message: "Login successful" });
      
      // Set a cookie to track the session
      response.cookies.set({
        name: "admin_session",
        value: "authenticated",
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
        sameSite: "strict",
      });
      
      return response;
    } else {
      // Return error for invalid credentials
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during login" },
      { status: 500 }
    );
  }
}
