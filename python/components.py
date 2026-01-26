"""
Sparken PDF Components
Reusable components for generating branded PDF elements
"""

from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import Table, TableStyle, Paragraph, Spacer, Image, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
import os

from brand_constants import BrandColors, Typography, Layout, ComponentStyles, DocumentTheme


class CoverPageComponent:
    """Generate a branded cover page"""
    
    @staticmethod
    def create(canvas_obj, title, subtitle="", theme_type="formal", logo_path=None):
        """
        Create a cover page with full-color background
        
        Args:
            canvas_obj: ReportLab canvas object
            title: Main title text
            subtitle: Subtitle or "Prepared For" text
            theme_type: "formal" (purple) or "creative" (yellow)
            logo_path: Path to logo image file
        """
        theme = DocumentTheme.FORMAL if theme_type == "formal" else DocumentTheme.CREATIVE
        
        # Full page background
        canvas_obj.setFillColor(theme['background'])
        canvas_obj.rect(0, 0, Layout.PAGE_WIDTH, Layout.PAGE_HEIGHT, fill=1, stroke=0)
        
        # Add logo (centered, upper third)
        if logo_path and os.path.exists(logo_path):
            try:
                logo_width = 300
                logo_height = 100
                x = (Layout.PAGE_WIDTH - logo_width) / 2
                y = Layout.PAGE_HEIGHT - 200
                canvas_obj.drawImage(logo_path, x, y, width=logo_width, height=logo_height, 
                                   mask='auto', preserveAspectRatio=True)
            except Exception as e:
                print(f"Could not load logo: {e}")
        
        # Title (centered, middle) with text wrapping
        canvas_obj.setFillColor(theme['title_color'])
        canvas_obj.setFont(Typography.DISPLAY_FONT, Typography.COVER_TITLE_SIZE)
        title_text = title.upper()
        max_title_width = Layout.PAGE_WIDTH - 100  # Leave margins
        
        title_size = Typography.COVER_TITLE_SIZE
        title_width = canvas_obj.stringWidth(title_text, Typography.DISPLAY_FONT, title_size)
        
        # If title is too wide, reduce font size
        while title_width > max_title_width and title_size > 20:
            title_size -= 2
            title_width = canvas_obj.stringWidth(title_text, Typography.DISPLAY_FONT, title_size)
        
        # If still too wide, wrap text
        if title_width > max_title_width:
            words = title_text.split(' ')
            lines = []
            current_line = ''
            
            for word in words:
                test_line = f"{current_line} {word}".strip()
                test_width = canvas_obj.stringWidth(test_line, Typography.DISPLAY_FONT, title_size)
                
                if test_width > max_title_width and current_line:
                    lines.append(current_line)
                    current_line = word
                else:
                    current_line = test_line
            
            if current_line:
                lines.append(current_line)
            
            # Draw multi-line title
            line_height = title_size * 1.2
            total_height = len(lines) * line_height
            y_pos = Layout.PAGE_HEIGHT / 2 + 50 + (total_height / 2) - line_height
            
            for line in lines:
                line_width = canvas_obj.stringWidth(line, Typography.DISPLAY_FONT, title_size)
                canvas_obj.drawString((Layout.PAGE_WIDTH - line_width) / 2, y_pos, line)
                y_pos -= line_height
        else:
            # Draw single line title
            canvas_obj.drawString((Layout.PAGE_WIDTH - title_width) / 2, Layout.PAGE_HEIGHT / 2 + 50, title_text)
        
        # Subtitle
        if subtitle:
            canvas_obj.setFillColor(theme['subtitle_color'])
            canvas_obj.setFont(Typography.BODY_FONT, Typography.COVER_SUBTITLE_SIZE)
            subtitle_width = canvas_obj.stringWidth(subtitle, Typography.BODY_FONT, Typography.COVER_SUBTITLE_SIZE)
            canvas_obj.drawString((Layout.PAGE_WIDTH - subtitle_width) / 2, Layout.PAGE_HEIGHT / 2, subtitle)
        
        # Footer tagline
        canvas_obj.setFillColor(theme['subtitle_color'])
        canvas_obj.setFont(Typography.BODY_FONT, Typography.BODY_SIZE)
        tagline = "SCIENCE-POWERED CREATIVE STUDIO"
        tagline_width = canvas_obj.stringWidth(tagline, Typography.BODY_FONT, Typography.BODY_SIZE)
        canvas_obj.drawString((Layout.PAGE_WIDTH - tagline_width) / 2, 100, tagline)


class HeaderComponent:
    """Generate page headers with logo and accent line"""
    
    @staticmethod
    def create(canvas_obj, logo_path=None, page_num=1):
        """
        Create header with optional logo and purple bar
        
        Args:
            canvas_obj: ReportLab canvas object
            logo_path: Path to logo image (horizontal white logo)
            page_num: Current page number
        """
        # Small purple header bar (reduced from 80 to 35 points to avoid covering text)
        canvas_obj.setFillColor(BrandColors.BRAND_PURPLE)
        canvas_obj.rect(0, Layout.PAGE_HEIGHT - Layout.HEADER_HEIGHT, 
                       Layout.PAGE_WIDTH, Layout.HEADER_HEIGHT, fill=1, stroke=0)
        
        # White horizontal logo in header (smaller to fit reduced header)
        if logo_path and os.path.exists(logo_path):
            try:
                logo_width = 100  # Reduced from 140
                logo_height = 25  # Reduced from 45
                x = Layout.MARGIN_LEFT - 10
                y = Layout.PAGE_HEIGHT - Layout.HEADER_HEIGHT + 5
                canvas_obj.drawImage(logo_path, x, y, width=logo_width, height=logo_height,
                                   mask='auto', preserveAspectRatio=True)
            except Exception as e:
                print(f"Could not load header logo: {e}")


class FooterComponent:
    """Generate page footers with branding"""
    
    @staticmethod
    def create(canvas_obj, page_num, total_pages):
        """
        Create footer with purple bar and page numbers
        
        Args:
            canvas_obj: ReportLab canvas object
            page_num: Current page number
            total_pages: Total number of pages
        """
        footer_y = Layout.MARGIN_BOTTOM - 20
        
        # Purple footer bar
        canvas_obj.setFillColor(BrandColors.BRAND_PURPLE)
        canvas_obj.rect(0, 0, Layout.PAGE_WIDTH, Layout.FOOTER_HEIGHT, fill=1, stroke=0)
        
        # Page number (left side in white)
        canvas_obj.setFillColor(BrandColors.WHITE)
        canvas_obj.setFont(Typography.BODY_FONT, Typography.SMALL_SIZE)
        canvas_obj.drawString(Layout.MARGIN_LEFT, 20, f"Page {page_num} of {total_pages}")
        
        # "Sparken Solutions" (right side in white)
        canvas_obj.setFont(Typography.DISPLAY_FONT, Typography.SMALL_SIZE + 1)
        text = "Sparken"
        text_width = canvas_obj.stringWidth(text, Typography.DISPLAY_FONT, Typography.SMALL_SIZE + 1)
        canvas_obj.drawString(Layout.PAGE_WIDTH - Layout.MARGIN_RIGHT - text_width, 20, text)


class WatermarkComponent:
    """Generate repeated logo watermark pattern"""
    
    @staticmethod
    def create(canvas_obj, logo_path):
        """
        Create repeated vertical logo watermark across the page
        
        Args:
            canvas_obj: ReportLab canvas object
            logo_path: Path to vertical logo image
        """
        if not logo_path or not os.path.exists(logo_path):
            return
        
        try:
            size = Layout.WATERMARK_SIZE
            spacing = Layout.WATERMARK_SPACING
            opacity = Layout.WATERMARK_OPACITY
            
            # Calculate grid
            cols = int(Layout.PAGE_WIDTH / spacing) + 2
            rows = int(Layout.PAGE_HEIGHT / spacing) + 2
            
            # Save state and set opacity
            canvas_obj.saveState()
            canvas_obj.setFillAlpha(opacity)
            
            # Draw logos in grid pattern
            for row in range(rows):
                for col in range(cols):
                    x = col * spacing - (size / 2)
                    y = row * spacing - (size / 2)
                    canvas_obj.drawImage(logo_path, x, y, width=size, height=size,
                                       mask='auto', preserveAspectRatio=True)
            
            canvas_obj.restoreState()
        except Exception as e:
            print(f"Could not create watermark: {e}")


class TableComponent:
    """Generate styled tables with brand colors"""
    
    @staticmethod
    def create(data, col_widths=None):
        """
        Create a branded table with purple headers and striped rows
        
        Args:
            data: List of lists containing table data (first row is header)
            col_widths: Optional list of column widths
        
        Returns:
            ReportLab Table object
        """
        if not data or len(data) == 0:
            return None
        
        # Default column widths if not provided
        if not col_widths:
            num_cols = len(data[0])
            col_widths = [Layout.CONTENT_WIDTH / num_cols] * num_cols
        
        # Create table
        table = Table(data, colWidths=col_widths, repeatRows=1)
        
        # Build style commands
        style_commands = [
            # Header row styling
            ('BACKGROUND', (0, 0), (-1, 0), BrandColors.BRAND_PURPLE),
            ('TEXTCOLOR', (0, 0), (-1, 0), BrandColors.WHITE),
            ('FONT', (0, 0), (-1, 0), Typography.DISPLAY_FONT, Typography.BODY_SIZE),
            ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
            ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
            
            # Body styling
            ('FONT', (0, 1), (-1, -1), Typography.BODY_FONT, Typography.BODY_SIZE),
            ('TEXTCOLOR', (0, 1), (-1, -1), BrandColors.TEXT_BLACK),
            ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 1), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ]
        
        # Add striped row backgrounds
        for i in range(1, len(data)):
            bg_color = BrandColors.BRAND_LAVENDER if i % 2 == 1 else BrandColors.WHITE
            style_commands.append(('BACKGROUND', (0, i), (-1, i), bg_color))
        
        # Add grid
        style_commands.append(('GRID', (0, 0), (-1, -1), 0.5, BrandColors.BRAND_PURPLE))
        
        table.setStyle(TableStyle(style_commands))
        return table


class CalloutComponent:
    """Generate callout boxes with yellow left border"""
    
    @staticmethod
    def create(text, callout_type="info"):
        """
        Create a callout box with yellow left border
        
        Args:
            text: Content text
            callout_type: Type of callout ("info", "warning", "quote")
        
        Returns:
            List of ReportLab flowables
        """
        # Create paragraph style for callout
        style = ParagraphStyle(
            'Callout',
            fontName=Typography.BODY_FONT,
            fontSize=Typography.BODY_SIZE,
            textColor=BrandColors.TEXT_BLACK,
            leading=Typography.BODY_SIZE * Typography.BODY_LEADING,
            leftIndent=15,
            rightIndent=10,
            spaceAfter=10,
            spaceBefore=10
        )
        
        # Create the paragraph
        para = Paragraph(text, style)
        
        # Wrap in a table to create the left border effect
        data = [[para]]
        table = Table(data, colWidths=[Layout.CONTENT_WIDTH - 20])
        
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), BrandColors.SOFT_GRAY),
            ('LEFTPADDING', (0, 0), (-1, -1), Layout.CALLOUT_BORDER_WIDTH + 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('LINEBELOW', (0, 0), (0, -1), Layout.CALLOUT_BORDER_WIDTH, BrandColors.BRAND_YELLOW),
        ]))
        
        return [table, Spacer(1, Layout.PARAGRAPH_SPACING)]


class HeadingComponent:
    """Generate styled headings"""
    
    @staticmethod
    def create_h1(text):
        """Create H1 heading in purple, all caps"""
        style = ParagraphStyle(
            'Heading1',
            fontName=Typography.DISPLAY_FONT,
            fontSize=Typography.H1_SIZE,
            textColor=BrandColors.BRAND_PURPLE,
            leading=Typography.H1_SIZE * Typography.H1_LEADING,
            spaceAfter=Layout.PARAGRAPH_SPACING,
            spaceBefore=Layout.SECTION_SPACING
        )
        return Paragraph(text.upper(), style)
    
    @staticmethod
    def create_h2(text):
        """Create H2 heading in purple"""
        style = ParagraphStyle(
            'Heading2',
            fontName=Typography.DISPLAY_FONT,
            fontSize=Typography.H2_SIZE,
            textColor=BrandColors.BRAND_PURPLE,
            leading=Typography.H2_SIZE * Typography.H2_LEADING,
            spaceAfter=Layout.PARAGRAPH_SPACING,
            spaceBefore=Layout.SECTION_SPACING
        )
        return Paragraph(text, style)
    
    @staticmethod
    def create_h3(text):
        """Create H3 heading in purple"""
        style = ParagraphStyle(
            'Heading3',
            fontName=Typography.DISPLAY_FONT,
            fontSize=Typography.H3_SIZE,
            textColor=BrandColors.BRAND_PURPLE,
            leading=Typography.H3_SIZE * Typography.H3_LEADING,
            spaceAfter=Layout.PARAGRAPH_SPACING / 2,
            spaceBefore=Layout.PARAGRAPH_SPACING
        )
        return Paragraph(text, style)


class BodyTextComponent:
    """Generate body text paragraphs"""
    
    @staticmethod
    def create(text, alignment='left'):
        """Create body text paragraph"""
        align_map = {
            'left': TA_LEFT,
            'center': TA_CENTER,
            'justify': TA_JUSTIFY
        }
        
        style = ParagraphStyle(
            'Body',
            fontName=Typography.BODY_FONT,
            fontSize=Typography.BODY_SIZE,
            textColor=BrandColors.TEXT_BLACK,
            leading=Typography.BODY_SIZE * Typography.BODY_LEADING,
            spaceAfter=Layout.PARAGRAPH_SPACING,
            alignment=align_map.get(alignment, TA_LEFT)
        )
        return Paragraph(text, style)
