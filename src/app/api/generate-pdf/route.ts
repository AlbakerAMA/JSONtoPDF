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
    console.log('=== PDF Generation API Called ===');
    
    // Parse the JSON body
    console.log('Parsing request body...');
    const body = await request.json() as GeneratePdfRequest;
    console.log('Request body parsed successfully:', {
      hasData: !!body.data,
      dataKeys: body.data ? Object.keys(body.data) : [],
      hasOptions: !!body.options
    });
    
    // Validate required data
    if (!body.data) {
      console.log('Validation failed: Missing data field');
      return NextResponse.json(
        { error: 'Missing required field: data' },
        { status: 400 }
      );
    }

    // Extract options with defaults
    const { autoCleanup = true, cleanupDelayMs = 300000 } = body.options || {};
    console.log('Options extracted:', { autoCleanup, cleanupDelayMs });

    // Generate the PDF
    console.log('Calling PDFGenerator.generateWorkoutPDF...');
    const result = await PDFGenerator.generateWorkoutPDF(body.data);
    console.log('PDF generation completed:', {
      filename: result.filename,
      downloadUrl: result.downloadUrl
    });

    // Schedule automatic cleanup if enabled
    if (autoCleanup) {
      console.log('Scheduling cleanup...');
      PDFGenerator.scheduleCleanup(result.filepath, cleanupDelayMs);
    }

    // Return the success response
    console.log('Returning success response');
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
    console.error('=== PDF Generation Error ===');
    console.error('Error generating PDF:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      console.log('Returning JSON syntax error response');
      return NextResponse.json(
        { error: 'Invalid JSON format in request body' },
        { status: 400 }
      );
    }

    // Generic error response
    console.log('Returning generic error response');
    return NextResponse.json(
      { 
        error: 'Internal server error occurred while generating PDF',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        errorType: error instanceof Error ? error.name : 'UnknownError',
        errorMessage: error instanceof Error ? error.message : String(error)
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