/**
 * Python Bridge - Interface between Next.js and Python PDF Generator
 */

import { spawn } from 'child_process';
import path from 'path';

export interface PythonPDFOptions {
  title?: string;
  subtitle?: string;
  theme?: 'formal' | 'creative';
}

/**
 * Generate a PDF using the Python ReportLab generator
 * 
 * @param markdownContent - Markdown or plain text content
 * @param options - PDF generation options
 * @returns Promise<Uint8Array> - PDF bytes
 */
export async function generatePythonPDF(
  markdownContent: string,
  options: PythonPDFOptions = {}
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'python', 'sparken_pdf_generator.py');
    
    // Prepare metadata as JSON
    const metadata = JSON.stringify({
      title: options.title,
      subtitle: options.subtitle,
      theme: options.theme || 'formal'
    });
    
    // Spawn Python process
    const pythonProcess = spawn('python3', [pythonScript, '-', metadata], {
      cwd: process.cwd()
    });
    
    const chunks: Buffer[] = [];
    const errorChunks: Buffer[] = [];
    
    // Collect stdout (PDF bytes)
    pythonProcess.stdout.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    // Collect stderr (errors and logs)
    pythonProcess.stderr.on('data', (chunk: Buffer) => {
      errorChunks.push(chunk);
      console.error('Python stderr:', chunk.toString());
    });
    
    // Handle process completion
    pythonProcess.on('close', (code: number) => {
      if (code !== 0) {
        const errorMessage = Buffer.concat(errorChunks).toString();
        reject(new Error(`Python process exited with code ${code}: ${errorMessage}`));
        return;
      }
      
      const pdfBytes = Buffer.concat(chunks);
      resolve(new Uint8Array(pdfBytes));
    });
    
    // Handle process errors
    pythonProcess.on('error', (error: Error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
    
    // Write markdown content to stdin
    pythonProcess.stdin.write(markdownContent);
    pythonProcess.stdin.end();
  });
}

/**
 * Check if Python and required packages are available
 * 
 * @returns Promise<boolean>
 */
export async function checkPythonAvailability(): Promise<boolean> {
  return new Promise((resolve) => {
    const pythonProcess = spawn('python3', ['-c', 'import reportlab; import markdown; print("OK")']);
    
    let output = '';
    pythonProcess.stdout.on('data', (chunk: Buffer) => {
      output += chunk.toString();
    });
    
    pythonProcess.on('close', (code: number) => {
      resolve(code === 0 && output.includes('OK'));
    });
    
    pythonProcess.on('error', () => {
      resolve(false);
    });
  });
}
