import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export interface WorkoutData {
  title?: string;
  description?: string;
  schedule?: Array<{
    day: string;
    exercises: Array<{
      name: string;
      sets?: number;
      reps?: number;
      duration?: string;
      notes?: string;
    }>;
  }>;
  metadata?: {
    createdBy?: string;
    createdAt?: string;
    duration?: string;
    difficulty?: string;
  };
}

export interface PdfGenerationResult {
  filename: string;
  filepath: string;
  downloadUrl: string;
}

export class PDFGenerator {
  private static ensureTmpDir(): string {
    try {
      const tmpDir = path.join(process.cwd(), 'tmp');
      console.log('Checking temp directory:', tmpDir);
      
      if (!fs.existsSync(tmpDir)) {
        console.log('Creating temp directory...');
        fs.mkdirSync(tmpDir, { recursive: true });
        console.log('Temp directory created successfully');
      } else {
        console.log('Temp directory already exists');
      }
      
      return tmpDir;
    } catch (error) {
      console.error('Error creating temp directory:', error);
      throw new Error(`Failed to create temp directory: ${error}`);
    }
  }

  static async generateWorkoutPDF(data: WorkoutData): Promise<PdfGenerationResult> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Starting PDF generation with data:', JSON.stringify(data, null, 2));
        
        const tmpDir = this.ensureTmpDir();
        console.log('Temp directory created/verified:', tmpDir);
        
        const filename = `workout_${uuidv4()}.pdf`;
        const filepath = path.join(tmpDir, filename);
        console.log('Generated filepath:', filepath);
        
        // Create a new PDF document
        console.log('Creating PDFDocument...');
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4'
        });
        console.log('PDFDocument created successfully');

        // Pipe the PDF to a file
        console.log('Creating write stream...');
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);
        console.log('Stream created and piped');

        // Add header
        console.log('Adding header...');
        this.addHeader(doc, data.title || 'Workout Schedule');
        
        // Add description if provided
        if (data.description) {
          console.log('Adding description...');
          this.addDescription(doc, data.description);
        }

        // Add metadata section
        if (data.metadata) {
          console.log('Adding metadata...');
          this.addMetadata(doc, data.metadata);
        }

        // Add workout schedule
        if (data.schedule && data.schedule.length > 0) {
          console.log('Adding workout schedule...');
          this.addWorkoutSchedule(doc, data.schedule);
        }

        // Add footer
        console.log('Adding footer...');
        this.addFooter(doc);

        // Finalize the PDF
        console.log('Finalizing PDF...');
        doc.end();

        stream.on('finish', () => {
          console.log('PDF generation completed successfully');
          const downloadUrl = `/api/download?file=${filename}`;
          resolve({
            filename,
            filepath,
            downloadUrl
          });
        });

        stream.on('error', (error) => {
          console.error('Stream error:', error);
          reject(error);
        });

      } catch (error) {
        console.error('PDF generation error:', error);
        reject(error);
      }
    });
  }

  private static addHeader(doc: PDFKit.PDFDocument, title: string): void {
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text(title, { align: 'center' })
       .moveDown(1);
    
    // Add a line under the title
    doc.moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .stroke()
       .moveDown(1);
  }

  private static addDescription(doc: PDFKit.PDFDocument, description: string): void {
    doc.fontSize(12)
       .font('Helvetica')
       .text('Description:', { continued: false })
       .fontSize(11)
       .text(description, { align: 'left' })
       .moveDown(1);
  }

  private static addMetadata(doc: PDFKit.PDFDocument, metadata: WorkoutData['metadata']): void {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Workout Information', { underline: true })
       .moveDown(0.5);

    doc.fontSize(10)
       .font('Helvetica');

    if (metadata?.createdBy) {
      doc.text(`Created by: ${metadata.createdBy}`);
    }
    
    if (metadata?.createdAt) {
      doc.text(`Created on: ${metadata.createdAt}`);
    }
    
    if (metadata?.duration) {
      doc.text(`Duration: ${metadata.duration}`);
    }
    
    if (metadata?.difficulty) {
      doc.text(`Difficulty: ${metadata.difficulty}`);
    }

    doc.moveDown(1);
  }

  private static addWorkoutSchedule(doc: PDFKit.PDFDocument, schedule: WorkoutData['schedule']): void {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Workout Schedule', { underline: true })
       .moveDown(1);

    schedule?.forEach((day, dayIndex) => {
      // Day header
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(`${day.day}`, { underline: true })
         .moveDown(0.5);

      // Exercises for the day
      day.exercises.forEach((exercise, exerciseIndex) => {
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text(`${exerciseIndex + 1}. ${exercise.name}`, { continued: false });

        let exerciseDetails = [];
        
        if (exercise.sets && exercise.reps) {
          exerciseDetails.push(`${exercise.sets} sets × ${exercise.reps} reps`);
        } else if (exercise.duration) {
          exerciseDetails.push(`Duration: ${exercise.duration}`);
        }

        if (exerciseDetails.length > 0) {
          doc.fontSize(10)
             .font('Helvetica')
             .text(`   ${exerciseDetails.join(' | ')}`);
        }

        if (exercise.notes) {
          doc.fontSize(9)
             .font('Helvetica-Oblique')
             .text(`   Notes: ${exercise.notes}`);
        }

        doc.moveDown(0.3);
      });

      doc.moveDown(0.7);
    });
  }

  private static addFooter(doc: PDFKit.PDFDocument): void {
    const currentDate = new Date().toLocaleDateString();
    
    doc.fontSize(8)
       .font('Helvetica')
       .text(`Generated on ${currentDate} by PDF Workout Generator`, 50, doc.page.height - 50, {
         align: 'center'
       });
  }

  static async cleanupFile(filepath: string): Promise<void> {
    try {
      if (fs.existsSync(filepath)) {
        await fs.promises.unlink(filepath);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }

  static scheduleCleanup(filepath: string, delayMs: number = 300000): void {
    // Schedule file cleanup after 5 minutes by default
    setTimeout(async () => {
      await this.cleanupFile(filepath);
    }, delayMs);
  }
}