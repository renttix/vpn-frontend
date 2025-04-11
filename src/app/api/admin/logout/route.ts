import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Create a response that clears the admin_session cookie
    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    
    // Clear the admin session cookie
    response.cookies.set({
      name: "admin_session",
      value: "",
      httpOnly: true,
      path: "/",
      maxAge: 0, // Expire immediately
      sameSite: "strict",
    });
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
