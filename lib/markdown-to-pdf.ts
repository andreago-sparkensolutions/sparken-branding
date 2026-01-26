import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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

export async function convertMarkdownToPdf(markdownText: string): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Sanitize text to remove characters WinAnsi can't encode
  markdownText = sanitizeForWinAnsi(markdownText);
  
  const lines = markdownText.split('\n');
  const pageWidth = 612;  // 8.5 inches
  const pageHeight = 792; // 11 inches
  const margin = 72;      // 1 inch margins
  const fontSize = 11;
  const lineHeight = fontSize * 1.6;
  const maxWidth = pageWidth - (margin * 2);
  
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin - 80; // Leave space for header/logo
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
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
    }
    
    // Check for bold text
    cleanLine = cleanLine.replace(/\*\*(.+?)\*\*/g, '$1');
    if (line.includes('**')) {
      currentFont = boldFont;
    }
    
    // Check for italic (just remove markers, we don't have italic font)
    cleanLine = cleanLine.replace(/\*(.+?)\*/g, '$1');
    
    // Check for inline code
    cleanLine = cleanLine.replace(/`(.+?)`/g, '$1');
    
    // Check for links [text](url) - just show text
    cleanLine = cleanLine.replace(/\[(.+?)\]\(.+?\)/g, '$1');
    
    // Check for list items
    if (cleanLine.match(/^[-*+]\s+/)) {
      cleanLine = cleanLine.replace(/^[-*+]\s+/, '  • ');
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
