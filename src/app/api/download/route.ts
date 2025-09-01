import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PDFGenerator } from '@/lib/pdfGenerator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');

    // Validate filename parameter
    if (!filename) {
      return NextResponse.json(
        { error: 'Missing required parameter: file' },
        { status: 400 }
      );
    }

    // Validate filename format (security check)
    const filenameRegex = /^workout_[a-f0-9-]+\.pdf$/;
    if (!filenameRegex.test(filename)) {
      return NextResponse.json(
        { error: 'Invalid filename format' },
        { status: 400 }
      );
    }

    // Construct file path - use /tmp for Vercel serverless
    const tmpDir = '/tmp';
    const filepath = path.join(tmpDir, filename);

    // Check if file exists
    let fileBuffer: Buffer;
    
    if (fs.existsSync(filepath)) {
      console.log('Reading PDF from file system');
      fileBuffer = await fs.promises.readFile(filepath);
    } else {
      console.log('File not found in file system, checking cache...');
      const cachedPdf = PDFGenerator.getPdfFromCache(filename);
      if (cachedPdf) {
        console.log('PDF found in cache, serving from cache');
        fileBuffer = cachedPdf;
      } else {
        console.log('PDF not found in cache either');
        return NextResponse.json(
          { error: 'File not found or has expired' },
          { status: 404 }
        );
      }
    }

    try {
      // Create response with proper headers for PDF download
      const response = new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': fileBuffer.length.toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      // Optional: Schedule immediate cleanup after download
      // Uncomment the next line if you want to delete the file immediately after serving
      // setTimeout(() => PDFGenerator.cleanupFile(filepath), 1000);

      return response;

    } catch (readError) {
      console.error('Error reading file:', readError);
      return NextResponse.json(
        { error: 'Error reading file' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in download endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to download files.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to download files.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to download files.' },
    { status: 405 }
  );
}