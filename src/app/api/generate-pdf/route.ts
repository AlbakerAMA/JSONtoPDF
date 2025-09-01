import { NextRequest, NextResponse } from 'next/server';
import { PDFGenerator, WorkoutData } from '@/lib/pdfGenerator';

interface GeneratePdfRequest {
  data: WorkoutData;
  options?: {
    autoCleanup?: boolean;
    cleanupDelayMs?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body
    const body = await request.json() as GeneratePdfRequest;
    
    // Validate required data
    if (!body.data) {
      return NextResponse.json(
        { error: 'Missing required field: data' },
        { status: 400 }
      );
    }

    // Extract options with defaults
    const { autoCleanup = true, cleanupDelayMs = 300000 } = body.options || {};

    // Generate the PDF
    const result = await PDFGenerator.generateWorkoutPDF(body.data);

    // Schedule automatic cleanup if enabled
    if (autoCleanup) {
      PDFGenerator.scheduleCleanup(result.filepath, cleanupDelayMs);
    }

    // Return the success response
    return NextResponse.json({
      success: true,
      message: 'PDF generated successfully',
      data: {
        filename: result.filename,
        downloadUrl: result.downloadUrl,
        expiresAt: autoCleanup 
          ? new Date(Date.now() + cleanupDelayMs).toISOString()
          : null
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating PDF:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON format in request body' },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { 
        error: 'Internal server error occurred while generating PDF',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        errorType: error instanceof Error ? error.name : 'UnknownError'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate PDFs.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate PDFs.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate PDFs.' },
    { status: 405 }
  );
}