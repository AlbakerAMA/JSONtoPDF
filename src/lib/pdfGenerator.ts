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
      // In Vercel serverless functions, use /tmp which is the only writable directory
      const tmpDir = '/tmp';
      console.log('Using Vercel serverless tmp directory:', tmpDir);
      
      // /tmp always exists in serverless environments, no need to create it
      if (fs.existsSync(tmpDir)) {
        console.log('Temp directory exists and is accessible');
      } else {
        throw new Error('Serverless /tmp directory is not accessible');
      }
      
      return tmpDir;
    } catch (error) {
      console.error('Error accessing temp directory:', error);
      throw new Error(`Failed to access temp directory: ${error}`);
    }
  }

  // Simple PDF creation using minimal PDF structure
  static async generateWorkoutPDF(data: WorkoutData): Promise<PdfGenerationResult> {
    try {
      console.log('Starting PDF generation with data:', JSON.stringify(data, null, 2));
      
      const tmpDir = this.ensureTmpDir();
      console.log('Temp directory created/verified:', tmpDir);
      
      const filename = `workout_${uuidv4()}.pdf`;
      const filepath = path.join(tmpDir, filename);
      console.log('Generated filepath:', filepath);
      
      // Create a simple PDF content
      console.log('Creating PDF content...');
      const pdfContent = this.createSimplePDF(data);
      console.log('PDF content created, length:', pdfContent.length);
      
      // Write the PDF content to file
      console.log('Writing PDF content to file...');
      await fs.promises.writeFile(filepath, pdfContent);
      console.log('PDF file written successfully');
      
      // Verify file exists
      if (fs.existsSync(filepath)) {
        console.log('PDF file verified to exist');
      } else {
        throw new Error('PDF file was not created');
      }
      
      console.log('PDF generation completed successfully');

      const downloadUrl = `/api/download?file=${filename}`;
      return {
        filename,
        filepath,
        downloadUrl
      };

    } catch (error) {
      console.error('PDF generation error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  private static createSimplePDF(data: WorkoutData): Buffer {
    // Basic PDF structure (this is a very simplified PDF)
    let content = '';
    
    // PDF Header
    content += '%PDF-1.4\n';
    content += '1 0 obj\n';
    content += '<<\n';
    content += '/Type /Catalog\n';
    content += '/Pages 2 0 R\n';
    content += '>>\n';
    content += 'endobj\n\n';
    
    // Pages object
    content += '2 0 obj\n';
    content += '<<\n';
    content += '/Type /Pages\n';
    content += '/Kids [3 0 R]\n';
    content += '/Count 1\n';
    content += '>>\n';
    content += 'endobj\n\n';
    
    // Page object
    content += '3 0 obj\n';
    content += '<<\n';
    content += '/Type /Page\n';
    content += '/Parent 2 0 R\n';
    content += '/MediaBox [0 0 612 792]\n';
    content += '/Contents 4 0 R\n';
    content += '/Resources <<\n';
    content += '/Font <<\n';
    content += '/F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n';
    content += '>>\n';
    content += '>>\n';
    content += '>>\n';
    content += 'endobj\n\n';
    
    // Content stream
    const streamContent = this.generateContentStream(data);
    content += '4 0 obj\n';
    content += '<<\n';
    content += `/Length ${streamContent.length}\n`;
    content += '>>\n';
    content += 'stream\n';
    content += streamContent;
    content += '\nendstream\n';
    content += 'endobj\n\n';
    
    // Cross-reference table
    content += 'xref\n';
    content += '0 5\n';
    content += '0000000000 65535 f \n';
    content += '0000000010 65535 n \n';
    content += '0000000079 65535 n \n';
    content += '0000000173 65535 n \n';
    content += '0000000301 65535 n \n';
    
    // Trailer
    content += 'trailer\n';
    content += '<<\n';
    content += '/Size 5\n';
    content += '/Root 1 0 R\n';
    content += '>>\n';
    content += 'startxref\n';
    content += `${content.length - 100}\n`;
    content += '%%EOF\n';
    
    return Buffer.from(content);
  }

  private static generateContentStream(data: WorkoutData): string {
    // Helper function to escape PDF string content
    const escapePdfString = (str: string): string => {
      return str.replace(/[()\\]/g, '\\$&');
    };
    
    let stream = 'BT\n';
    stream += '/F1 16 Tf\n';
    stream += '50 750 Td\n';
    stream += `(${escapePdfString(data.title || 'Workout Schedule')}) Tj\n`;
    
    let yPos = 720;
    
    if (data.description) {
      stream += '/F1 12 Tf\n';
      stream += `50 ${yPos} Td\n`;
      stream += `(Description: ${escapePdfString(data.description)}) Tj\n`;
      yPos -= 20;
    }
    
    if (data.metadata) {
      stream += '/F1 12 Tf\n';
      stream += `50 ${yPos} Td\n`;
      stream += '(Workout Information) Tj\n';
      yPos -= 15;
      
      if (data.metadata.createdBy) {
        stream += `50 ${yPos} Td\n`;
        stream += `(Created by: ${escapePdfString(data.metadata.createdBy)}) Tj\n`;
        yPos -= 12;
      }
      
      if (data.metadata.createdAt) {
        stream += `50 ${yPos} Td\n`;
        stream += `(Created on: ${escapePdfString(data.metadata.createdAt)}) Tj\n`;
        yPos -= 12;
      }
      
      if (data.metadata.duration) {
        stream += `50 ${yPos} Td\n`;
        stream += `(Duration: ${escapePdfString(data.metadata.duration)}) Tj\n`;
        yPos -= 12;
      }
      
      if (data.metadata.difficulty) {
        stream += `50 ${yPos} Td\n`;
        stream += `(Difficulty: ${escapePdfString(data.metadata.difficulty)}) Tj\n`;
        yPos -= 12;
      }
    }
    
    if (data.schedule && data.schedule.length > 0) {
      stream += '/F1 14 Tf\n';
      stream += `50 ${yPos} Td\n`;
      stream += '(Workout Schedule) Tj\n';
      yPos -= 20;
      
      data.schedule.forEach(day => {
        if (yPos < 50) { // Simple page break check
          yPos = 750; // Reset to top of page
        }
        
        stream += '/F1 12 Tf\n';
        stream += `50 ${yPos} Td\n`;
        stream += `(${escapePdfString(day.day)}) Tj\n`;
        yPos -= 15;
        
        day.exercises.forEach((exercise, index) => {
          if (yPos < 50) {
            yPos = 750;
          }
          
          stream += '/F1 10 Tf\n';
          stream += `60 ${yPos} Td\n`;
          let exerciseText = `${index + 1}. ${exercise.name}`;
          if (exercise.sets && exercise.reps) {
            exerciseText += ` - ${exercise.sets} sets x ${exercise.reps} reps`;
          } else if (exercise.duration) {
            exerciseText += ` - Duration: ${exercise.duration}`;
          }
          if (exercise.notes) {
            exerciseText += ` (${exercise.notes})`;
          }
          stream += `(${escapePdfString(exerciseText)}) Tj\n`;
          yPos -= 12;
        });
        yPos -= 5;
      });
    }
    
    stream += 'ET\n';
    return stream;
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