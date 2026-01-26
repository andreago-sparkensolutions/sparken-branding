import { PDFDocument, rgb, StandardFonts, PDFImage, PDFPage, PDFFont } from 'pdf-lib';
import { SPARKEN_BRAND } from './constants';
import fs from 'fs';
import path from 'path';

// Sparken Brand Colors (from brand guidelines)
const DEEP_COGNITIVE_PURPLE = rgb(0.369, 0.333, 0.573);  // #5E5592
const BEHAVIORAL_YELLOW = rgb(0.973, 0.847, 0.188);      // #F8D830
const RESEARCH_LIME = rgb(0.843, 0.875, 0.369);          // #D7DF5E
const SOFT_GRAY = rgb(0.957, 0.961, 0.969);              // #F4F5F7

export async function applySparkEnBranding(pdfBytes: Uint8Array): Promise<Uint8Array> {
  try {
    console.log('Starting PDF branding process...');
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    console.log(`PDF loaded: ${pages.length} pages`);
    
    // Embed fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Load and embed the Sparken logos
    let horizontalLogoImage: PDFImage | null = null;
    let verticalLogoImage: PDFImage | null = null;
    
    // Load yellow horizontal logo for header
    const horizontalLogoPath = path.join(process.cwd(), 'public', 'sparken-logo-horizontal-yellow.png');
    try {
      console.log('Loading yellow horizontal logo from:', horizontalLogoPath);
      if (fs.existsSync(horizontalLogoPath)) {
        const logoBytes = fs.readFileSync(horizontalLogoPath);
        console.log(`Yellow horizontal logo loaded: ${logoBytes.length} bytes`);
        try {
          horizontalLogoImage = await pdfDoc.embedPng(logoBytes);
          console.log('Yellow horizontal logo embedded successfully');
        } catch (error) {
          console.error('Failed to embed yellow horizontal logo:', error);
        }
      }
    } catch (error) {
      console.error('Yellow horizontal logo loading error:', error);
    }
    
    // Load vertical logo for watermark pattern
    const verticalLogoPath = path.join(process.cwd(), 'public', 'sparken logo-vertical-cropped.png');
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
      }
    } catch (error) {
      console.error('Vertical logo loading error:', error);
    }

    if (!horizontalLogoImage && !verticalLogoImage) {
      console.warn('WARNING: No logos could be loaded. Proceeding without logos.');
    }

    // Apply branding to each page
    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      const pageNumber = index + 1;
      const totalPages = pages.length;

      console.log(`Branding page ${pageNumber}: ${width}x${height}`);

      // 1. Add purple header block (like the example PDF)
      const headerHeight = 80;
      page.drawRectangle({
        x: 0,
        y: height - headerHeight,
        width: width,
        height: headerHeight,
        color: DEEP_COGNITIVE_PURPLE,
      });

      // 2. Add yellow Sparken horizontal logo in header
      if (horizontalLogoImage) {
        try {
          page.drawImage(horizontalLogoImage, {
            x: 50,
            y: height - 65,
            width: 140,
            height: 45,
          });
          console.log(`Yellow logo added to page ${pageNumber} header`);
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
    });

    // Save and return the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    console.log('PDF branding completed successfully');
    return modifiedPdfBytes;
  } catch (error) {
    console.error('Error in applySparkEnBranding:', error);
    throw error;
  }
}
