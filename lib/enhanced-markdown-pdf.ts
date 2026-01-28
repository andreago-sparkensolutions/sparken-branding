/**
 * Enhanced Markdown to PDF with proper formatting
 * Handles bold, tables, and lists correctly
 */

import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from 'pdf-lib';

// Sparken Brand Colors
const DEEP_COGNITIVE_PURPLE = rgb(0.369, 0.333, 0.573);  // #5E5592
const BRAND_LAVENDER = rgb(0.816, 0.776, 0.882);         // #D0C6E1
const TEXT_BLACK = rgb(0.012, 0.016, 0.012);             // #030403
const WHITE = rgb(1, 1, 1);

interface TextSegment {
  text: string;
  bold: boolean;
}

export class EnhancedMarkdownPDF {
  private pdfDoc!: PDFDocument;
  private font!: PDFFont;
  private boldFont!: PDFFont;
  private page!: PDFPage;
  private yPosition: number = 0;
  
  private readonly pageWidth = 612;
  private readonly pageHeight = 792;
  private readonly margin = 72;
  private readonly fontSize = 11;
  private readonly lineHeight = 17.6; // 11 * 1.6
  private readonly maxWidth = 468; // pageWidth - 2*margin
  
  async initialize() {
    this.pdfDoc = await PDFDocument.create();
    this.font = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
    this.boldFont = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);
    this.page = this.pdfDoc.addPage([this.pageWidth, this.pageHeight]);
    this.yPosition = this.pageHeight - this.margin - 80;
  }
  
  private addPage() {
    this.page = this.pdfDoc.addPage([this.pageWidth, this.pageHeight]);
    this.yPosition = this.pageHeight - this.margin - 80;
  }
  
  private checkPageBreak(requiredSpace: number = 50) {
    if (this.yPosition < this.margin + requiredSpace) {
      this.addPage();
    }
  }
  
  private checkHeadingPageBreak(headingSize: number) {
    // Headings need space for:
    // 1. The heading itself (headingSize * 2)
    // 2. At least 4-5 lines of content after (lineHeight * 5) - more aggressive
    // This prevents widows/orphans where heading is at bottom of page
    const requiredSpace = (headingSize * 2) + (this.lineHeight * 5);
    
    if (this.yPosition < this.margin + requiredSpace) {
      this.addPage();
    }
  }
  
  private preventWidow() {
    // Prevent widows: ensure at least 2 lines of space remain
    // If less than 2 lines worth of space, move to next page
    const minLines = 2;
    const requiredSpace = this.lineHeight * minLines;
    
    if (this.yPosition < this.margin + requiredSpace) {
      this.addPage();
    }
  }
  
  private parseInlineBold(text: string): TextSegment[] {
    // UPDATED: Don't parse bold markers - clean-text.ts should have already removed them
    // Just return the text as a single segment
    // If any ** markers remain, remove them here as a safety measure
    const cleanedText = text
      .replace(/\*\*(.+?)\*\*/g, '$1')  // Remove ** bold markers
      .replace(/\*(.+?)\*/g, '$1')      // Remove * italic markers
      .replace(/`(.+?)`/g, '$1')        // Remove ` code markers
      .replace(/(\d+)\\\./g, '$1.')     // Fix escaped numbers: 1\. → 1.
      .replace(/\\=/g, '=')             // Fix escaped equals: \= → =
      .replace(/\\([=+\-])/g, '$1');    // Fix other escaped chars: \= → =
    
    return [{ text: cleanedText, bold: false }];
  }
  
  private drawTextWithBold(segments: TextSegment[], x: number, y: number, color = TEXT_BLACK) {
    let currentX = x;
    
    try {
      for (const segment of segments) {
        if (!segment || !segment.text) continue;
        
        // CRITICAL: Replace tabs with spaces to avoid WinAnsi encoding error
        const sanitizedText = segment.text.replace(/\t/g, '    ');
        
        const font = segment.bold ? this.boldFont : this.font;
        this.page.drawText(sanitizedText, {
          x: currentX,
          y,
          size: this.fontSize,
          font,
          color
        });
        currentX += font.widthOfTextAtSize(sanitizedText, this.fontSize);
      }
    } catch (error) {
      console.error('Error drawing text with bold:', error);
      // Fallback: draw without formatting
      const allText = segments.map(s => s.text.replace(/\t/g, '    ')).join('');
      this.page.drawText(allText, {
        x,
        y,
        size: this.fontSize,
        font: this.font,
        color
      });
    }
  }
  
  private drawTable(rows: string[][]) {
    if (rows.length === 0) return;
    
    // Calculate column widths based on content
    const numCols = rows[0].length;
    const colWidths: number[] = [];
    
    // For 2-column tables, use 30/70 split (label/content)
    if (numCols === 2) {
      colWidths[0] = this.maxWidth * 0.30;  // Label column: 30%
      colWidths[1] = this.maxWidth * 0.70;  // Content column: 70%
    } else {
      // For other tables, distribute evenly
      for (let i = 0; i < numCols; i++) {
        colWidths[i] = this.maxWidth / numCols;
      }
    }
    
    const cellPadding = 10;
    const minRowHeight = 30;
    
    // Calculate row heights based on content
    const rowHeights: number[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      let maxLines = 1;
      
      for (let j = 0; j < row.length; j++) {
        let cellText = (row[j] || '')
          .replace(/\*\*(.+?)\*\*/g, '$1')
          .replace(/\*(.+?)\*/g, '$1')
          .replace(/`(.+?)`/g, '$1')
          .replace(/\[([^\]]+?)\]\([^\)]+?\)/g, '$1')
          .replace(/\t/g, '    ');
        
        const font = i === 0 ? this.boldFont : this.font;
        const words = cellText.split(' ');
        let line = '';
        let lineCount = 0;
        
        for (const word of words) {
          const testLine = line ? `${line} ${word}` : word;
          const width = font.widthOfTextAtSize(testLine, this.fontSize);
          
          if (width > colWidths[j] - cellPadding * 2 && line) {
            lineCount++;
            line = word;
          } else {
            line = testLine;
          }
        }
        if (line) lineCount++;
        maxLines = Math.max(maxLines, lineCount);
      }
      
      // Calculate row height: minimum height or based on lines
      rowHeights[i] = Math.max(minRowHeight, maxLines * this.lineHeight + cellPadding * 2);
    }
    
    // Check if table fits on page
    const tableHeight = rowHeights.reduce((sum, h) => sum + h, 0);
    this.checkPageBreak(tableHeight + 20);
    
    let currentY = this.yPosition;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const isHeader = i === 0;
      const rowHeight = rowHeights[i];
      
      // Draw row background
      if (isHeader) {
        this.page.drawRectangle({
          x: this.margin,
          y: currentY - rowHeight + 5,
          width: this.maxWidth,
          height: rowHeight,
          color: DEEP_COGNITIVE_PURPLE
        });
      } else if (i % 2 === 0) {
        this.page.drawRectangle({
          x: this.margin,
          y: currentY - rowHeight + 5,
          width: this.maxWidth,
          height: rowHeight,
          color: BRAND_LAVENDER
        });
      }
      
      // Draw cells
      let currentX = this.margin;
      for (let j = 0; j < row.length; j++) {
        // Clean markdown markers from table cells
        let cellText = (row[j] || '')
          .replace(/\*\*(.+?)\*\*/g, '$1')  // Remove bold markers
          .replace(/\*(.+?)\*/g, '$1')      // Remove italic markers
          .replace(/`(.+?)`/g, '$1')        // Remove code markers
          .replace(/\[([^\]]+?)\]\([^\)]+?\)/g, '$1')  // Remove links
          .replace(/(\d+)\\\./g, '$1.')     // Fix escaped numbers
          .replace(/\t/g, '    ');          // Sanitize tabs
        
        const font = isHeader ? this.boldFont : this.font;
        const color = isHeader ? WHITE : TEXT_BLACK;
        
        // Word wrap in cell if needed
        const words = cellText.split(' ');
        let line = '';
        let lineY = currentY - cellPadding - 5;
        
        for (const word of words) {
          const testLine = line ? `${line} ${word}` : word;
          const width = font.widthOfTextAtSize(testLine, this.fontSize);
          
          if (width > colWidths[j] - cellPadding * 2 && line) {
            // Draw the current line
            this.page.drawText(line, {
              x: currentX + cellPadding,
              y: lineY,
              size: this.fontSize,
              font,
              color
            });
            line = word;
            lineY -= this.lineHeight;
          } else {
            line = testLine;
          }
        }
        
        // Draw remaining text
        if (line) {
          this.page.drawText(line, {
            x: currentX + cellPadding,
            y: lineY,
            size: this.fontSize,
            font,
            color
          });
        }
        
        currentX += colWidths[j];
      }
      
      currentY -= rowHeight;
    }
    
    this.yPosition = currentY - 20;
  }
  
  addMarkdownContent(markdown: string) {
    // CRITICAL: Remove tab characters that cause WinAnsi encoding errors
    markdown = markdown.replace(/\t/g, '    '); // Replace tabs with 4 spaces
    
    const lines = markdown.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        this.yPosition -= this.lineHeight * 0.5;
        continue;
      }
      
      // Skip bullet point artifacts like "• --"
      if (/^[•\-]\s*--\s*$/.test(line)) {
        continue;
      }
      
      // Skip standalone bullets or dashes
      if (/^[•\-]\s*$/.test(line)) {
        continue;
      }
      
      // Check for headers
      const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2].replace(/\t/g, '    '); // Sanitize tabs
        const fontSize = level === 1 ? 20 : level === 2 ? 16 : 14;
        
        // SPECIAL CASE: Appendix always starts on a new page
        if (/appendix/i.test(text)) {
          this.addPage();
        } else {
          // PREVENT WIDOW: Ensure heading has space for content after it
          this.checkHeadingPageBreak(fontSize);
        }
        
        this.yPosition -= this.lineHeight;
        
        this.page.drawText(text, {
          x: this.margin,
          y: this.yPosition,
          size: fontSize,
          font: this.boldFont,
          color: DEEP_COGNITIVE_PURPLE
        });
        
        this.yPosition -= fontSize * 1.3;
        continue;
      }
      
      // Check for tables
      if (line.includes('|')) {
        const tableRows: string[][] = [];
        let j = i;
        
        while (j < lines.length && lines[j].includes('|')) {
          const row = lines[j].split('|').map(cell => cell.trim()).filter(cell => cell);
          if (row.length > 0 && !row[0].match(/^[-:]+$/)) {
            tableRows.push(row);
          }
          j++;
        }
        
        if (tableRows.length > 0) {
          this.drawTable(tableRows);
          i = j - 1;
          continue;
        }
      }
      
      // Check for bullets
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        this.preventWidow(); // Prevent orphaning bullets at bottom of page
        const text = line.replace(/^[•\-\*]\s*/, '').replace(/\t/g, '    '); // Sanitize tabs
        const segments = this.parseInlineBold(text);
        
        this.page.drawText('  •', {
          x: this.margin,
          y: this.yPosition,
          size: this.fontSize,
          font: this.font,
          color: TEXT_BLACK
        });
        
        this.drawTextWithBold(segments, this.margin + 20, this.yPosition);
        this.yPosition -= this.lineHeight;
        continue;
      }
      
      // Regular paragraph with bold support
      this.preventWidow(); // Prevent orphaning paragraphs
      const segments = this.parseInlineBold(line);
      
      // Word wrap
      let currentLine: TextSegment[] = [];
      let currentWidth = 0;
      
      for (const segment of segments) {
        const font = segment.bold ? this.boldFont : this.font;
        const words = segment.text.split(' ');
        
        for (const word of words) {
          const wordWidth = font.widthOfTextAtSize(word + ' ', this.fontSize);
          
          if (currentWidth + wordWidth > this.maxWidth && currentLine.length > 0) {
            // Draw current line
            this.drawTextWithBold(currentLine, this.margin, this.yPosition);
            this.yPosition -= this.lineHeight;
            this.preventWidow(); // Check for widow after each wrapped line
            currentLine = [];
            currentWidth = 0;
          }
          
          currentLine.push({ text: word + ' ', bold: segment.bold });
          currentWidth += wordWidth;
        }
      }
      
      // Draw remaining
      if (currentLine.length > 0) {
        this.drawTextWithBold(currentLine, this.margin, this.yPosition);
        this.yPosition -= this.lineHeight;
      }
    }
  }
  
  async save(): Promise<Uint8Array> {
    return await this.pdfDoc.save();
  }
}

export async function convertMarkdownToPdfEnhanced(markdown: string): Promise<Uint8Array> {
  try {
    const generator = new EnhancedMarkdownPDF();
    await generator.initialize();
    generator.addMarkdownContent(markdown);
    return await generator.save();
  } catch (error) {
    console.error('Enhanced markdown PDF generation failed:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
