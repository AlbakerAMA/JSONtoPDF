import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Debug Test Endpoint Called ===');
    
    // Test temp directory access - use /tmp for Vercel serverless
    const tmpDir = '/tmp';
    console.log('Temp directory path:', tmpDir);
    
    if (!fs.existsSync(tmpDir)) {
      throw new Error('Vercel /tmp directory is not accessible');
    } else {
      console.log('Temp directory exists and is accessible');
    }
    
    // Test file creation
    const filename = `test_${uuidv4()}.txt`;
    const filepath = path.join(tmpDir, filename);
    console.log('Test file path:', filepath);
    
    const testContent = 'This is a test file created by the debug endpoint';
    await fs.promises.writeFile(filepath, testContent);
    console.log('Test file written successfully');
    
    // Verify file exists
    const exists = fs.existsSync(filepath);
    console.log('File exists:', exists);
    
    if (exists) {
      const stats = await fs.promises.stat(filepath);
      console.log('File stats:', {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug test completed successfully',
      data: {
        tmpDir,
        filename,
        filepath,
        fileExists: exists,
        processInfo: {
          cwd: process.cwd(),
          platform: process.platform,
          nodeVersion: process.version
        }
      }
    });
    
  } catch (error) {
    console.error('Debug test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}