import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Manual cleanup endpoint - call this periodically to clean up old PDF files
// Note: Automatic cron job was removed due to Vercel plan limitations
// You can call this endpoint manually: GET /api/cleanup
export async function GET(request: NextRequest) {
  try {
    const tmpDir = path.join(process.cwd(), 'tmp');
    
    // Check if tmp directory exists
    if (!fs.existsSync(tmpDir)) {
      return NextResponse.json({
        success: true,
        message: 'No temporary directory found, nothing to clean'
      });
    }

    // Read all files in tmp directory
    const files = await fs.promises.readdir(tmpDir);
    const currentTime = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    let cleanedCount = 0;
    let errorCount = 0;

    for (const filename of files) {
      try {
        const filepath = path.join(tmpDir, filename);
        const stats = await fs.promises.stat(filepath);
        
        // Check if file is older than maxAge
        if (currentTime - stats.mtime.getTime() > maxAge) {
          await fs.promises.unlink(filepath);
          cleanedCount++;
        }
      } catch (error) {
        console.error(`Error processing file ${filename}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      details: {
        filesScanned: files.length,
        filesCleaned: cleanedCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { 
        error: 'Cleanup failed',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}