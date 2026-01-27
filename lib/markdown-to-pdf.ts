import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { marked } from 'marked';

// Sparken Brand Colors
const DEEP_COGNITIVE_PURPLE = rgb(0.369, 0.333, 0.573);  // #5E5592
const BEHAVIORAL_YELLOW = rgb(0.973, 0.847, 0.188);      // #F8D830
const RESEARCH_LIME = rgb(0.843, 0.875, 0.369);          // #D7DF5E
const SOFT_GRAY = rgb(0.957, 0.961, 0.969);              // #F4F5F7
const TEXT_BLACK = rgb(0.012, 0.016, 0.012);             // #030403

// Function to remove characters that WinAnsi encoding can't handle
function sanitizeForWinAnsi(text: string): string {
  return text
    .replace(/[^\x00-\xFF]/g, '') // Remove non-Latin characters
    .replace(/\t/g, '    ')       // Replace tabs with 4 spaces
    .replace(/→/g, '->')          // Replace arrows
    .replace(/←/g, '<-')
    .replace(/↑/g, '^')
    .replace(/↓/g, 'v')
    .replace(/•/g, '*')           // Replace bullet
    .replace(/…/g, '...')         // Replace ellipsis
    .replace(/"/g, '"')           // Replace smart quotes
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/—/g, '-')           // Replace em dash
    .replace(/–/g, '-');          // Replace en dash
}

// Function to parse markdown and convert to plain text
function markdownToPlainText(markdown: string): string[] {
  // First, clean up common markdown artifacts that marked doesn't handle
  let cleaned = markdown
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove custom anchors {#id}
    .replace(/\{#[^}]+\}/g, '')
    // Remove horizontal rules
    .replace(/^---+$/gm, '\n')
    .replace(/^___+$/gm, '\n')
    .replace(/^\*\*\*+$/gm, '\n')
    // Remove page break markers like "-- 1 of 17 --"
    .replace(/^--\s+\d+\s+of\s+\d+\s+--$/gm, '')
    // Remove escaped characters
    .replace(/\\([*_~`\-\\#\[\]])/g, '$1')
    // Clean up HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    // Clean up multiple blank lines
    .replace(/\n\n\n+/g, '\n\n');
  
  // Use marked to convert markdown to HTML
  const html = marked(cleaned, { breaks: true, gfm: true });
  
  // Strip HTML tags and convert to plain text
  let plainText = html
    // Convert headers
    .replace(/<h([1-6])>(.*?)<\/h\1>/g, (_, level, text) => {
      return '\n' + '#'.repeat(parseInt(level)) + ' ' + text + '\n';
    })
    // Convert paragraphs
    .replace(/<p>(.*?)<\/p>/g, '$1\n')
    // Convert lists
    .replace(/<li>(.*?)<\/li>/g, '• $1\n')
    .replace(/<\/ul>/g, '\n')
    .replace(/<\/ol>/g, '\n')
    .replace(/<ul>/g, '')
    .replace(/<ol>/g, '')
    // Convert line breaks
    .replace(/<br\s*\/?>/g, '\n')
    // Convert tables (basic)
    .replace(/<table>(.*?)<\/table>/gs, (match) => {
      // Simple table to text conversion
      return match
        .replace(/<\/?table>/g, '')
        .replace(/<\/?thead>/g, '')
        .replace(/<\/?tbody>/g, '')
        .replace(/<\/?tr>/g, '\n')
        .replace(/<\/?th>/g, ' | ')
        .replace(/<\/?td>/g, ' | ');
    })
    // Remove all remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities again after stripping tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    // Clean up multiple spaces
    .replace(/  +/g, ' ')
    // Clean up multiple newlines
    .replace(/\n\n\n+/g, '\n\n');
  
  // Split into lines and sanitize
  return plainText
    .split('\n')
    .map(line => sanitizeForWinAnsi(line.trim()))
    .filter(line => line.length > 0);
}

export async function convertMarkdownToPdf(markdownText: string): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Parse markdown to clean lines
  const lines = markdownToPlainText(markdownText);
  
  const pageWidth = 612;  // 8.5 inches
  const pageHeight = 792; // 11 inches
  const margin = 72;      // 1 inch margins
  const fontSize = 11;
  const lineHeight = fontSize * 1.6;
  const maxWidth = pageWidth - (margin * 2);
  const minSpaceForHeaderContent = lineHeight * 3; // Need at least 3 lines after header
  
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin - 80; // Leave space for header/logo
  
  for (const line of lines) {
    // Skip empty lines but add spacing
    if (!line.trim()) {
      yPosition -= lineHeight * 0.5;
      continue;
    }
    
    let currentFont = font;
    let currentFontSize = fontSize;
    let currentColor = TEXT_BLACK;
    let cleanLine = line;
    
    // Check for headers (markdown # syntax)
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const headerLevel = headerMatch[1].length;
      cleanLine = headerMatch[2];
      currentFont = boldFont;
      currentColor = DEEP_COGNITIVE_PURPLE; // Headers in purple
      
      // Size headers appropriately
      if (headerLevel === 1) {
        currentFontSize = 20;
        yPosition -= lineHeight; // Extra space before H1
      } else if (headerLevel === 2) {
        currentFontSize = 16;
        yPosition -= lineHeight * 0.5;
      } else if (headerLevel === 3) {
        currentFontSize = 14;
        yPosition -= lineHeight * 0.3;
      } else {
        currentFontSize = 12;
      }
      
      // Check if header would be orphaned at bottom of page
      // If there's not enough space for header + some content, start new page
      if (yPosition < margin + 50 + minSpaceForHeaderContent) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin - 80;
      }
    }
    
    // Check for list items
    if (cleanLine.match(/^[•*-]\s+/) || cleanLine.match(/^\d+\.\s+/)) {
      cleanLine = cleanLine.replace(/^[•*-]\s+/, '  • ');
      cleanLine = cleanLine.replace(/^\d+\.\s+/, '  • ');
    }
    
    // Word wrap
    const words = cleanLine.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = currentFont.widthOfTextAtSize(testLine, currentFontSize);
      
      if (textWidth > maxWidth && currentLine) {
        // Draw current line
        page.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: currentFontSize,
          font: currentFont,
          color: currentColor,
        });
        yPosition -= lineHeight;
        currentLine = word;
        
        // Check if we need a new page
        if (yPosition < margin + 50) { // Leave space for footer
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margin - 80;
        }
      } else {
        currentLine = testLine;
      }
    }
    
    // Draw remaining text
    if (currentLine) {
      page.drawText(currentLine, {
        x: margin,
        y: yPosition,
        size: currentFontSize,
        font: currentFont,
        color: currentColor,
      });
      yPosition -= lineHeight;
      
      // Check if we need a new page
      if (yPosition < margin + 50) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin - 80;
      }
    }
    
    // Extra spacing after headers
    if (headerMatch) {
      yPosition -= lineHeight * 0.3;
    }
  }
  
  // Save and return the PDF
  return await pdfDoc.save();
}
