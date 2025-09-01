import { NextRequest, NextResponse } from 'next/server';
import { PDFGenerator, WorkoutData } from '@/lib/pdfGenerator';

interface GeneratePdfRequest {
  data: WorkoutData;
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Direct PDF Download API Called ===');
    
    // Parse the JSON body
    console.log('Parsing request body...');
    const body = await request.json() as GeneratePdfRequest;
    console.log('Request body parsed successfully');
    
    // Validate required data
    if (!body.data) {
      console.log('Validation failed: Missing data field');
      return NextResponse.json(
        { error: 'Missing required field: data' },
        { status: 400 }
      );
    }

    // Generate the PDF
    console.log('Calling PDFGenerator.generateWorkoutPDF...');
    const result = await PDFGenerator.generateWorkoutPDF(body.data);
    console.log('PDF generation completed');

    // Return the PDF directly as a download
    if (result.pdfData) {
      console.log('Returning PDF as direct download');
      return new NextResponse(new Uint8Array(result.pdfData), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${result.filename}"`,
          'Content-Length': result.pdfData.length.toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    } else {
      throw new Error('PDF data not available');
    }

  } catch (error) {
    console.error('=== Direct PDF Download Error ===');
    console.error('Error generating/downloading PDF:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error occurred while generating PDF',
        errorMessage: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate and download PDFs directly.' },
    { status: 405 }
  );
}