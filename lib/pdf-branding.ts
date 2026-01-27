import { PDFDocument, rgb, StandardFonts, PDFImage, PDFPage, PDFFont } from 'pdf-lib';
import { SPARKEN_BRAND } from './constants';
import fs from 'fs';
import path from 'path';

// Sparken Brand Colors (from brand guidelines)
const DEEP_COGNITIVE_PURPLE = rgb(0.369, 0.333, 0.573);  // #5E5592
const BEHAVIORAL_YELLOW = rgb(0.973, 0.847, 0.188);      // #F8D830
const RESEARCH_LIME = rgb(0.843, 0.875, 0.369);          // #D7DF5E
const SOFT_GRAY = rgb(0.957, 0.961, 0.969);              // #F4F5F7
const WHITE = rgb(1, 1, 1);

/**
 * Create a cover page for the PDF
 */
async function createCoverPage(
  pdfDoc: PDFDocument, 
  horizontalLogoImage: PDFImage | null,
  title: string = 'Document',
  subtitle: string = ''
): Promise<PDFPage> {
  const coverPage = pdfDoc.insertPage(0);
  const { width, height } = coverPage.getSize();
  
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Full purple background
  coverPage.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: height,
    color: DEEP_COGNITIVE_PURPLE,
  });
  
  // Add white logo at top center
  if (horizontalLogoImage) {
    const logoWidth = 300;
    const logoHeight = 100;
    const logoX = (width - logoWidth) / 2;
    const logoY = height - 200;
    
    coverPage.drawImage(horizontalLogoImage, {
      x: logoX,
      y: logoY,
      width: logoWidth,
      height: logoHeight,
    });
  }
  
  // Title (centered, upper-case, white) with text wrapping
  const titleText = title.toUpperCase();
  let titleSize = 36;
  const maxTitleWidth = width - 100; // Leave 50px margin on each side
  
  // Check if title fits, if not reduce size or wrap
  let titleWidth = helveticaBold.widthOfTextAtSize(titleText, titleSize);
  
  // If title is too wide, reduce font size
  while (titleWidth > maxTitleWidth && titleSize > 20) {
    titleSize -= 2;
    titleWidth = helveticaBold.widthOfTextAtSize(titleText, titleSize);
  }
  
  // If still too wide, wrap text
  if (titleWidth > maxTitleWidth) {
    const words = titleText.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = helveticaBold.widthOfTextAtSize(testLine, titleSize);
      
      if (testWidth > maxTitleWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    // Draw multi-line title
    const lineHeight = titleSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    let yPos = height / 2 + 50 + (totalHeight / 2) - lineHeight;
    
    for (const line of lines) {
      const lineWidth = helveticaBold.widthOfTextAtSize(line, titleSize);
      coverPage.drawText(line, {
        x: (width - lineWidth) / 2,
        y: yPos,
        size: titleSize,
        font: helveticaBold,
        color: WHITE,
      });
      yPos -= lineHeight;
    }
  } else {
    // Draw single line title
    coverPage.drawText(titleText, {
      x: (width - titleWidth) / 2,
      y: height / 2 + 50,
      size: titleSize,
      font: helveticaBold,
      color: WHITE,
    });
  }
  
  // Subtitle if provided
  if (subtitle) {
    const subtitleSize = 18;
    const subtitleWidth = helvetica.widthOfTextAtSize(subtitle, subtitleSize);
    coverPage.drawText(subtitle, {
      x: (width - subtitleWidth) / 2,
      y: height / 2,
      size: subtitleSize,
      font: helvetica,
      color: WHITE,
    });
  }
  
  // Footer tagline
  const tagline = 'SCIENCE-POWERED CREATIVE STUDIO';
  const taglineSize = 12;
  const taglineWidth = helvetica.widthOfTextAtSize(tagline, taglineSize);
  coverPage.drawText(tagline, {
    x: (width - taglineWidth) / 2,
    y: 100,
    size: taglineSize,
    font: helvetica,
    color: WHITE,
  });
  
  return coverPage;
}

export async function applySparkEnBranding(
  pdfBytes: Uint8Array, 
  options?: { 
    addCoverPage?: boolean;
    title?: string;
    subtitle?: string;
  }
): Promise<Uint8Array> {
  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    
    // Embed fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Load and embed the Sparken logos
    let horizontalLogoImage: PDFImage | null = null;
    let verticalLogoImage: PDFImage | null = null;
    
    // Load white horizontal logo for header
    const horizontalLogoPath = path.join(process.cwd(), 'public', 'logos', 'sparken-logo-horizontal-white.png');
    try {
      if (fs.existsSync(horizontalLogoPath)) {
        const logoBytes = fs.readFileSync(horizontalLogoPath);
        try {
          horizontalLogoImage = await pdfDoc.embedPng(logoBytes);
        } catch (error) {
          console.error('Failed to embed white horizontal logo:', error);
        }
      }
    } catch (error) {
      console.error('White horizontal logo loading error:', error);
    }
    
    // Load vertical logo for watermark pattern
    const verticalLogoPath = path.join(process.cwd(), 'public', 'logos', 'sparken-logo-vertical.png');
    try {
      console.log('Loading vertical logo from:', verticalLogoPath);
      if (fs.existsSync(verticalLogoPath)) {
        const logoBytes = fs.readFileSync(verticalLogoPath);
        console.log(`Vertical logo loaded: ${logoBytes.length} bytes`);
        try {
          verticalLogoImage = await pdfDoc.embedPng(logoBytes);
          console.log('Vertical logo embedded successfully');
        } catch (error) {
          console.error('Failed to embed vertical logo:', error);
        }
      } else {
        console.warn('Vertical logo file not found at:', verticalLogoPath);
      }
    } catch (error) {
      console.error('Vertical logo loading error:', error);
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    }

    if (!horizontalLogoImage && !verticalLogoImage) {
      console.warn('WARNING: No logos could be loaded. Proceeding without logos.');
    }

    // Add cover page if requested (defaults to true)
    if (options?.addCoverPage !== false) {
      const title = options?.title || 'Branded Document';
      const subtitle = options?.subtitle || '';
      console.log('Adding cover page:', title);
      await createCoverPage(pdfDoc, horizontalLogoImage, title, subtitle);
    }

    // Get all pages (including the new cover page if added)
    const allPages = pdfDoc.getPages();
    const startIndex = options?.addCoverPage !== false ? 1 : 0; // Skip cover page for branding

    // Apply branding to each content page (not the cover)
    for (let i = startIndex; i < allPages.length; i++) {
      const page = allPages[i];
      const { width, height } = page.getSize();
      const pageNumber = i - startIndex + 1;
      const totalPages = allPages.length - startIndex;

      console.log(`Branding page ${pageNumber}: ${width}x${height}`);

      // 1. Add small purple header block - much smaller to avoid covering text
      // Reduced from 80 to 35 points to minimize content coverage
      const headerHeight = 35;
      page.drawRectangle({
        x: 0,
        y: height - headerHeight,
        width: width,
        height: headerHeight,
        color: DEEP_COGNITIVE_PURPLE,
      });

      // 2. Add white Sparken horizontal logo in header (smaller size)
      if (horizontalLogoImage) {
        try {
          // Smaller logo to fit in the reduced header
          page.drawImage(horizontalLogoImage, {
            x: 40,
            y: height - 30,
            width: 100,  // Reduced from 140
            height: 25,  // Reduced from 45
          });
          console.log(`White logo added to page ${pageNumber} header`);
        } catch (error) {
          console.error(`Failed to draw logo on page ${pageNumber}:`, error);
        }
      }

      // 3. Add repeated vertical logo watermark pattern
      if (verticalLogoImage) {
        try {
          const logoSize = 120;
          const spacing = 180;
          const opacity = 0.04;
          
          // Calculate how many logos fit on the page
          const cols = Math.ceil(width / spacing) + 1;
          const rows = Math.ceil(height / spacing) + 1;
          
          // Draw logos in a grid pattern
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const x = col * spacing - (logoSize / 2);
              const y = row * spacing - (logoSize / 2);
              
              page.drawImage(verticalLogoImage, {
                x: x,
                y: y,
                width: logoSize,
                height: logoSize,
                opacity: opacity,
              });
            }
          }
          console.log(`Repeated watermark pattern added to page ${pageNumber}`);
        } catch (error) {
          console.error(`Failed to draw watermark pattern on page ${pageNumber}:`, error);
        }
      }

      // 4. Add footer with Sparken branding
      const footerY = 30;
      
      // Footer line in Deep Cognitive Purple
      page.drawLine({
        start: { x: 50, y: footerY + 15 },
        end: { x: width - 50, y: footerY + 15 },
        thickness: 1.5,
        color: DEEP_COGNITIVE_PURPLE,
        opacity: 0.4,
      });

      // Page numbers (left side) in Deep Cognitive Purple
      page.drawText(`Page ${pageNumber} of ${totalPages}`, {
        x: 50,
        y: footerY,
        size: 9,
        font: helvetica,
        color: DEEP_COGNITIVE_PURPLE,
      });

      // "Sparken" brand name (right side) in Deep Cognitive Purple
      const sparkEnText = 'Sparken';
      const sparkEnWidth = helveticaBold.widthOfTextAtSize(sparkEnText, 10);
      page.drawText(sparkEnText, {
        x: width - 50 - sparkEnWidth,
        y: footerY,
        size: 10,
        font: helveticaBold,
        color: DEEP_COGNITIVE_PURPLE,
      });
    }

    // Save and return the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    console.log('PDF branding completed successfully');
    return modifiedPdfBytes;
  } catch (error) {
    console.error('Error in applySparkEnBranding:', error);
    throw error;
  }
}
