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
  
  private parseInlineBold(text: string): TextSegment[] {
    const segments: TextSegment[] = [];
    
    try {
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      
      for (const part of parts) {
        if (!part) continue;
        
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          // Bold text
          segments.push({
            text: part.slice(2, -2),
            bold: true
          });
        } else {
          // Regular text
          segments.push({
            text: part,
            bold: false
          });
        }
      }
    } catch (error) {
      // Fallback: return text as-is if parsing fails
      segments.push({ text, bold: false });
    }
    
    return segments.length > 0 ? segments : [{ text, bold: false }];
  }
  
  private drawTextWithBold(segments: TextSegment[], x: number, y: number, color = TEXT_BLACK) {
    let currentX = x;
    
    try {
      for (const segment of segments) {
        if (!segment || !segment.text) continue;
        
        const font = segment.bold ? this.boldFont : this.font;
        this.page.drawText(segment.text, {
          x: currentX,
          y,
          size: this.fontSize,
          font,
          color
        });
        currentX += font.widthOfTextAtSize(segment.text, this.fontSize);
      }
    } catch (error) {
      console.error('Error drawing text with bold:', error);
      // Fallback: draw without formatting
      const allText = segments.map(s => s.text).join('');
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
    
    const colWidths = new Array(rows[0].length).fill(this.maxWidth / rows[0].length);
    const rowHeight = 30;
    const cellPadding = 10;
    
    // Check if table fits on page
    const tableHeight = rows.length * rowHeight;
    this.checkPageBreak(tableHeight + 20);
    
    let currentY = this.yPosition;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const isHeader = i === 0;
      
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
        const cellText = row[j] || '';
        const font = isHeader ? this.boldFont : this.font;
        const color = isHeader ? WHITE : TEXT_BLACK;
        
        // Word wrap in cell if needed
        const words = cellText.split(' ');
        let line = '';
        let lineY = currentY - 10;
        
        for (const word of words) {
          const testLine = line ? `${line} ${word}` : word;
          const width = font.widthOfTextAtSize(testLine, this.fontSize);
          
          if (width > colWidths[j] - cellPadding * 2 && line) {
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
    const lines = markdown.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        this.yPosition -= this.lineHeight * 0.5;
        continue;
      }
      
      // Check for headers
      const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        const fontSize = level === 1 ? 20 : level === 2 ? 16 : 14;
        
        this.checkPageBreak(fontSize * 2);
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
        this.checkPageBreak();
        const text = line.replace(/^[•\-\*]\s*/, '');
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
      this.checkPageBreak();
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
            this.checkPageBreak();
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
