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
  
  // Helper function to detect if we're in a table
  const isTableLine = (line: string) => line.trim().startsWith('|');
  const isTableSeparator = (line: string) => /^\|[\s:-]+\|/.test(line.trim());
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Check if this is the start of a table
    if (isTableLine(line) && i + 1 < lines.length) {
      // Collect all table rows
      const tableRows: string[][] = [];
      let hasHeader = false;
      
      while (i < lines.length && isTableLine(lines[i])) {
        const currentLine = lines[i].trim();
        
        // Skip separator rows but note if we've seen one (indicates header)
        if (isTableSeparator(currentLine)) {
          hasHeader = tableRows.length > 0;
          i++;
          continue;
        }
        
        // Parse row and clean markdown from cells
        const cells = currentLine
          .split('|')
          .slice(1, -1) // Remove empty first/last elements
          .map(cell => {
            let cleanCell = cell.trim();
            // Remove markdown formatting
            cleanCell = cleanCell.replace(/\*\*(.+?)\*\*/g, '$1'); // Remove bold
            cleanCell = cleanCell.replace(/\*(.+?)\*/g, '$1');     // Remove italic
            cleanCell = cleanCell.replace(/`(.+?)`/g, '$1');       // Remove code
            return cleanCell;
          });
        
        if (cells.length > 0 && cells.some(cell => cell.length > 0)) {
          tableRows.push(cells);
        }
        i++;
      }
      
      // Draw the table
      if (tableRows.length > 0) {
        const numCols = tableRows[0].length;
        const colWidth = maxWidth / numCols;
        const rowHeight = lineHeight * 1.5;
        
        // Check if table fits on page
        const tableHeight = tableRows.length * rowHeight;
        if (yPosition - tableHeight < margin + 50) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margin - 80;
        }
        
        // Draw table
        for (let rowIdx = 0; rowIdx < tableRows.length; rowIdx++) {
          const row = tableRows[rowIdx];
          const isHeader = hasHeader && rowIdx === 0;
          
          // Draw row background
          if (isHeader) {
            page.drawRectangle({
              x: margin,
              y: yPosition - rowHeight + 4,
              width: maxWidth,
              height: rowHeight,
              color: DEEP_COGNITIVE_PURPLE,
            });
          } else if (rowIdx % 2 === 1) {
            page.drawRectangle({
              x: margin,
              y: yPosition - rowHeight + 4,
              width: maxWidth,
              height: rowHeight,
              color: SOFT_GRAY,
            });
          }
          
          // Draw cells
          for (let colIdx = 0; colIdx < row.length; colIdx++) {
            const cellText = row[colIdx];
            const cellX = margin + (colIdx * colWidth) + 8;
            const cellY = yPosition - (rowHeight / 2) - 2;
            
            const cellFont = isHeader ? boldFont : font;
            const cellColor = isHeader ? rgb(1, 1, 1) : TEXT_BLACK;
            const cellSize = isHeader ? fontSize : fontSize - 1;
            
            // Wrap text if too long
            const words = cellText.split(' ');
            let currentLine = '';
            let lines: string[] = [];
            
            for (const word of words) {
              const testLine = currentLine ? `${currentLine} ${word}` : word;
              const textWidth = cellFont.widthOfTextAtSize(testLine, cellSize);
              
              if (textWidth > colWidth - 16) {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
              } else {
                currentLine = testLine;
              }
            }
            if (currentLine) lines.push(currentLine);
            
            // Draw text (only first line for now to keep simple)
            if (lines.length > 0) {
              page.drawText(lines[0], {
                x: cellX,
                y: cellY,
                size: cellSize,
                font: cellFont,
                color: cellColor,
              });
            }
          }
          
          // Draw row border
          page.drawLine({
            start: { x: margin, y: yPosition - rowHeight + 4 },
            end: { x: margin + maxWidth, y: yPosition - rowHeight + 4 },
            thickness: 0.5,
            color: DEEP_COGNITIVE_PURPLE,
            opacity: 0.3,
          });
          
          yPosition -= rowHeight;
        }
        
        // Add spacing after table
        yPosition -= lineHeight;
        
        // Check if we need a new page
        if (yPosition < margin + 50) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margin - 80;
        }
      }
      
      continue; // Skip to next line after table
    }
    
    // Regular line processing
    i++; // Increment for non-table lines
    
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
    
    // Remove bold markers but DON'T make the whole line bold
    // Only specific words marked with ** should be bold (handled separately)
    cleanLine = cleanLine.replace(/\*\*(.+?)\*\*/g, '$1');
    
    // Check for italic (just remove markers, we don't have italic font)
    cleanLine = cleanLine.replace(/\*(.+?)\*/g, '$1');
    
    // Check for inline code
    cleanLine = cleanLine.replace(/`(.+?)`/g, '$1');
    
    // Check for links [text](url) - just show text
    cleanLine = cleanLine.replace(/\[(.+?)\]\(.+?\)/g, '$1');
    
    // Check for list items - clean markdown from them
    if (cleanLine.match(/^[-*+]\s+/)) {
      cleanLine = cleanLine.replace(/^[-*+]\s+/, '  • ');
      // Remove any remaining markdown formatting from list items
      cleanLine = cleanLine.replace(/\*\*(.+?)\*\*/g, '$1');
      cleanLine = cleanLine.replace(/\*(.+?)\*/g, '$1');
      cleanLine = cleanLine.replace(/`(.+?)`/g, '$1');
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
