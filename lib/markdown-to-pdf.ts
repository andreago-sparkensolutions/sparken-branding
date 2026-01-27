import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { marked } from 'marked';
import { cleanPdfArtifacts } from './clean-text';

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
async function markdownToPlainText(markdown: string): Promise<string[]> {
  // #region agent log
  fetch('http://127.0.0.1:7248/ingest/f73cb11f-b80b-4ec6-92ef-134f11cd7f6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'markdown-to-pdf.ts:31',message:'markdownToPlainText input',data:{markdownLength:markdown.length,firstChars:markdown.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
  // #endregion
  
  // FIRST: Clean PDF artifacts (removes page markers, footer text, etc.)
  markdown = cleanPdfArtifacts(markdown);
  
  console.log('[Markdown-to-PDF] After cleaning, length:', markdown.length);
  
  // Then, clean up other markdown artifacts
  let cleaned = markdown
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove table of contents sections (everything before the first real heading)
    // TOC typically has links like [Text	PageNumber](#anchor)
    .replace(/^[\s\S]*?(?=^#{1,3}\s+\*\*[^*]+\*\*\s*\{#)/m, '')
    // Remove custom anchors {#id}
    .replace(/\{#[^}]+\}/g, '')
    // Remove page break markers like "-- 1 of 15 --"
    .replace(/^--\s+\d+\s+of\s+\d+\s+--$/gm, '')
    // Remove horizontal rules (they just add visual breaks we don't need)
    .replace(/^---+$/gm, '')
    .replace(/^___+$/gm, '')
    .replace(/^\*\*\*+$/gm, '')
    // Convert tabs to spaces (they break both markdown parsing and WinAnsi encoding)
    .replace(/\t/g, ' ')
    // Clean up multiple blank lines
    .replace(/\n\n\n+/g, '\n\n')
    .trim();
  
  // #region agent log
  fetch('http://127.0.0.1:7248/ingest/f73cb11f-b80b-4ec6-92ef-134f11cd7f6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'markdown-to-pdf.ts:54',message:'After cleanup',data:{cleanedLength:cleaned.length,firstChars:cleaned.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  // Use marked to convert markdown to HTML
  const html = await marked(cleaned, { breaks: true, gfm: true });
  
  // #region agent log
  fetch('http://127.0.0.1:7248/ingest/f73cb11f-b80b-4ec6-92ef-134f11cd7f6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'markdown-to-pdf.ts:61',message:'HTML from marked',data:{htmlLength:html.length,firstChars:html.substring(0,1000),sampleTable:html.match(/<table[\s\S]{0,300}/)?.[0]||'no-table'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
  // #endregion
  
  // Convert HTML to plain text with proper formatting
  let plainText = html
    // First decode HTML entities
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    // Convert strong/bold tags
    .replace(/<\/?strong>/g, '')
    .replace(/<\/?b>/g, '')
    // Convert emphasis/italic tags
    .replace(/<\/?em>/g, '')
    .replace(/<\/?i>/g, '')
    // Convert code tags
    .replace(/<\/?code>/g, '')
    // Convert links (keep just the text, discard href)
    .replace(/<a[^>]*>(.*?)<\/a>/g, '$1')
    // Convert headers to text with # prefix
    .replace(/<h1[^>]*>(.*?)<\/h1>/g, '\n# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/g, '\n## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/g, '\n### $1\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/g, '\n#### $1\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/g, '\n##### $1\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/g, '\n###### $1\n')
    // Convert paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n')
    // Convert line breaks
    .replace(/<br\s*\/?>/g, '\n')
    // Convert lists
    .replace(/<li[^>]*>(.*?)<\/li>/g, '• $1\n')
    .replace(/<\/?ul[^>]*>/g, '')
    .replace(/<\/?ol[^>]*>/g, '')
    // Convert tables to simple text format
    .replace(/<table[^>]*>[\s\S]*?<\/table>/g, (table) => {
      // Extract rows
      const rows = table.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
      return rows.map(row => {
        // Extract cells (th or td)
        const cells = row.match(/<t[hd][^>]*>(.*?)<\/t[hd]>/g) || [];
        const cellTexts = cells.map(cell => 
          cell.replace(/<t[hd][^>]*>(.*?)<\/t[hd]>/, '$1').trim()
        );
        return cellTexts.join(' | ');
      }).join('\n') + '\n\n';
    })
    // Remove horizontal rules
    .replace(/<hr\s*\/?>/g, '')
    // Remove any remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities again (in case they were inside tags)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    // FALLBACK: Remove any remaining markdown syntax that wasn't converted
    // Remove markdown links [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove markdown bold **text** or __text__
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Remove markdown italic *text* or _text_ (but be careful not to match other uses)
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/_([^_\n]+)_/g, '$1')
    // Remove markdown code `text`
    .replace(/`([^`]+)`/g, '$1')
    // Clean up whitespace
    .replace(/  +/g, ' ')
    .replace(/\n\n\n+/g, '\n\n')
    .trim();
  
  // #region agent log
  fetch('http://127.0.0.1:7248/ingest/f73cb11f-b80b-4ec6-92ef-134f11cd7f6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'markdown-to-pdf.ts:110',message:'PlainText after HTML stripping',data:{plainTextLength:plainText.length,firstChars:plainText.substring(0,1000),sampleLines:plainText.split('\n').slice(0,20)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C,D'})}).catch(()=>{});
  // #endregion
  
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
  const lines = await markdownToPlainText(markdownText);
  
  console.log('[PDF] Converting', lines.length, 'lines to PDF');
  
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
