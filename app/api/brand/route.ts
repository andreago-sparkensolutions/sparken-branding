import { NextRequest, NextResponse } from 'next/server';
import { applySparkEnBranding } from '@/lib/pdf-branding';
import { convertMarkdownToPdf } from '@/lib/markdown-to-pdf';
import { generatePythonPDF, checkPythonAvailability } from '@/lib/python-bridge';

// Force Node.js runtime for fs access
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Branding API called ===');
    console.log('Environment:', process.env.VERCEL ? 'Vercel' : 'Local');
    console.log('CWD:', process.cwd());
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File received:', file.name, 'Type:', file.type, 'Size:', file.size);

    let brandedPdfBytes: Uint8Array;

    // Route to appropriate generator based on file type
    if (file.name.toLowerCase().endsWith('.md') || file.name.toLowerCase().endsWith('.txt')) {
      console.log('Processing as Markdown/Text file - using Python generator');
      
      // Check if Python is available
      const pythonAvailable = await checkPythonAvailability();
      
      if (pythonAvailable) {
        // Use Python ReportLab generator for rich document generation
        try {
          const markdownText = await file.text();
          console.log('Markdown text length:', markdownText.length);
          
          // Extract metadata from markdown for cover page
          const titleMatch = markdownText.match(/^#\s+(.+)$/m);
          const subtitleMatch = markdownText.match(/^##\s+(.+)$/m);
          
          // If no title found in markdown, try to extract from filename
          let title = titleMatch ? titleMatch[1].trim() : undefined;
          if (!title) {
            title = file.name
              .replace(/\.(md|txt)$/i, '')
              .replace(/[-_]/g, ' ')
              .replace(/\b\w/g, (char) => char.toUpperCase());
          }
          
          brandedPdfBytes = await generatePythonPDF(markdownText, {
            title: title,
            subtitle: subtitleMatch ? subtitleMatch[1].trim() : undefined,
            theme: 'formal' // Default to formal (purple) theme
          });
          console.log('Python PDF generated, size:', brandedPdfBytes.length);
        } catch (error) {
          console.error('Python PDF generation failed, falling back to TypeScript:', error);
          // Fallback to TypeScript converter
          const markdownText = await file.text();
          
          // Extract title from markdown
          const titleMatch = markdownText.match(/^#\s+(.+)$/m);
          const subtitleMatch = markdownText.match(/^##\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1].trim() : 'Document';
          const subtitle = subtitleMatch ? subtitleMatch[1].trim() : 'Prepared by Sparken Solutions';
          
          const pdfBytes = await convertMarkdownToPdf(markdownText);
          brandedPdfBytes = await applySparkEnBranding(pdfBytes, {
            addCoverPage: true,
            title: title,
            subtitle: subtitle
          });
        }
      } else {
        console.log('Python not available, using TypeScript converter');
        console.log('Starting TypeScript fallback path');
        
        // Fallback to TypeScript converter
        const markdownText = await file.text();
        console.log('Markdown text read, length:', markdownText.length);
        
        // Extract title from markdown
        const titleMatch = markdownText.match(/^#\s+(.+)$/m);
        const subtitleMatch = markdownText.match(/^##\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : 'Document';
        const subtitle = subtitleMatch ? subtitleMatch[1].trim() : 'Prepared by Sparken Solutions';
        
        console.log('Extracted title:', title, 'subtitle:', subtitle);
        console.log('About to call convertMarkdownToPdf');
        
        const pdfBytes = await convertMarkdownToPdf(markdownText);
        console.log('convertMarkdownToPdf completed, PDF size:', pdfBytes.length);
        console.log('About to call applySparkEnBranding');
        
        brandedPdfBytes = await applySparkEnBranding(pdfBytes, {
          addCoverPage: true,
          title: title,
          subtitle: subtitle
        });
        console.log('applySparkEnBranding completed, branded PDF size:', brandedPdfBytes.length);
      }
    } else if (file.name.toLowerCase().endsWith('.pdf')) {
      console.log('Processing as existing PDF file - using TypeScript overlay');
      // Use TypeScript overlay for existing PDFs
      const arrayBuffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      console.log('PDF loaded, size:', pdfBytes.length);
      
      // Check if this is already a Sparken-branded PDF
      const isAlreadyBranded = file.name.toLowerCase().includes('sparken-branded');
      
      if (isAlreadyBranded) {
        // Don't re-brand, just return the PDF as-is
        console.log('PDF is already branded, returning as-is');
        brandedPdfBytes = pdfBytes;
      } else {
        // Extract title from filename (remove extension, download numbers, and clean up)
        const titleFromFilename = file.name
          .replace(/\.pdf$/i, '')
          .replace(/\s*\(\d+\)$/, '') // Remove " (3)", " (2)", etc. from duplicate downloads
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());
        
        // Apply Sparken branding overlay with cover page
        console.log('Applying Sparken branding overlay with cover page...');
        brandedPdfBytes = await applySparkEnBranding(pdfBytes, {
          addCoverPage: true,
          title: titleFromFilename,
          subtitle: 'Prepared by Sparken Solutions'
        });
        console.log('Branding complete, final size:', brandedPdfBytes.length);
      }
    } else {
      console.error('Unsupported file type:', file.name);
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, Markdown (.md), or Text (.txt) files.' },
        { status: 400 }
      );
    }

    // Return the branded PDF
    return new NextResponse(Buffer.from(brandedPdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="sparken-branded-${file.name.replace(/\.(md|docx?)$/i, '')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('=== Branding API error ===');
    console.error('Error details:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    
    // More detailed error for debugging
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      cwd: process.cwd(),
      env: process.env.VERCEL ? 'vercel' : 'local',
      nodeVersion: process.version,
    };
    
    return NextResponse.json(
      { 
        error: 'Failed to apply branding', 
        details: error instanceof Error ? error.message : 'Unknown error',
        debug: errorDetails  // Always return debug info to see what's failing
      },
      { status: 500 }
    );
  }
}
