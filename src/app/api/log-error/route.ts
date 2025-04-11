import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const errorData = await request.json();
    
    // Format the error log
    const timestamp = new Date().toISOString();
    const logEntry = JSON.stringify({
      timestamp,
      ...errorData
    }, null, 2);
    
    // Log to a file
    const logsDir = path.join(process.cwd(), "logs");
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const logFile = path.join(logsDir, "errors.log");
    fs.appendFileSync(logFile, logEntry + "\n");
    
    // Also log to Google Analytics via server-side event
    // This could be implemented if needed
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error logging:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
