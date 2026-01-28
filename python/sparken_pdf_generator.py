#!/usr/bin/env python3
"""
Sparken PDF Generator
Main script to generate fully branded PDFs from markdown/text content
"""

import sys
import os
import re
import json
from io import BytesIO

from reportlab.lib.pagesizes import letter
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak, 
                                KeepTogether, Table, TableStyle)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas as pdf_canvas
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_JUSTIFY

from brand_constants import BrandColors, Typography, Layout
from components import (
    CoverPageComponent, HeaderComponent, FooterComponent, WatermarkComponent,
    TableComponent, CalloutComponent, HeadingComponent, BodyTextComponent
)


class SparkEnPDFGenerator:
    """Main PDF generator class"""
    
    def __init__(self, output_path=None, include_toc=True):
        """
        Initialize PDF generator
        
        Args:
            output_path: Path to save PDF (or None for BytesIO)
            include_toc: Whether to include a table of contents (default: True)
        """
        self.output_path = output_path or BytesIO()
        self.story = []
        self.metadata = {}
        self.has_cover = False
        self.include_toc = include_toc
        self.toc_entries = []  # Track heading entries for TOC
        
    def parse_markdown(self, markdown_text):
        """
        Parse markdown text and extract components
        
        Args:
            markdown_text: Raw markdown text
        
        Returns:
            Parsed content structure
        """
        lines = markdown_text.split('\n')
        content = []
        
        # Extract metadata from first few lines
        if lines and lines[0].startswith('# '):
            self.metadata['title'] = lines[0][2:].strip()
            lines = lines[1:]
        
        # Look for subtitle or "Prepared For" in next lines
        if lines and (lines[0].startswith('## ') or 'Prepared For' in lines[0] or 'Subtitle' in lines[0]):
            self.metadata['subtitle'] = lines[0].replace('## ', '').strip()
            lines = lines[1:]
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            if not line:
                i += 1
                continue
            
            # Headers
            if line.startswith('# '):
                content.append(('h1', line[2:]))
            elif line.startswith('## '):
                content.append(('h2', line[3:]))
            elif line.startswith('### '):
                content.append(('h3', line[4:]))
            
            # Tables (markdown table detection - handles both | column | and column | formats)
            elif '|' in line:
                table_rows = []
                # Check if this looks like a table (has multiple pipes or starts with pipe)
                pipe_count = line.count('|')
                if pipe_count >= 1:
                    while i < len(lines) and '|' in lines[i].strip():
                        current_line = lines[i].strip()
                        
                        # Parse row - handle both |col|col| and col|col formats
                        if current_line.startswith('|') and current_line.endswith('|'):
                            # Format: | col1 | col2 |
                            row = [cell.strip() for cell in current_line.split('|')[1:-1]]
                        else:
                            # Format: col1 | col2 (no leading/trailing pipes)
                            row = [cell.strip() for cell in current_line.split('|')]
                        
                        # Skip separator rows (lines with only dashes, colons, pipes)
                        if row and not all(re.match(r'^[-:\s]+$', cell) for cell in row):
                            # Clean ALL markdown formatting from cells
                            cleaned_row = []
                            for cell in row:
                                if cell:  # Skip empty cells
                                    # Remove bold markers (both ** and __)
                                    cell = re.sub(r'\*\*(.+?)\*\*', r'\1', cell)
                                    cell = re.sub(r'__(.+?)__', r'\1', cell)
                                    # Remove italic markers (both * and _)
                                    cell = re.sub(r'\*(.+?)\*', r'\1', cell)
                                    cell = re.sub(r'_(.+?)_', r'\1', cell)
                                    # Remove inline code markers
                                    cell = re.sub(r'`(.+?)`', r'\1', cell)
                                    # Remove links [text](url)
                                    cell = re.sub(r'\[([^\]]+?)\]\([^\)]+?\)', r'\1', cell)
                                    cleaned_row.append(cell)
                            if cleaned_row:  # Only add if row has content
                                table_rows.append(cleaned_row)
                        i += 1
                    if table_rows:
                        content.append(('table', table_rows))
                    i -= 1
            
            # Callouts (lines starting with > )
            elif line.startswith('> '):
                callout_text = line[2:]
                # Collect multi-line callouts
                while i + 1 < len(lines) and lines[i + 1].strip().startswith('> '):
                    i += 1
                    callout_text += ' ' + lines[i].strip()[2:]
                content.append(('callout', callout_text))
            
            # Lists
            elif line.startswith('- ') or line.startswith('* ') or line.startswith('+ '):
                # Clean markdown formatting from list items
                cleaned_line = re.sub(r'\*\*(.+?)\*\*', r'\1', line)  # Remove bold
                cleaned_line = re.sub(r'\*(.+?)\*', r'\1', cleaned_line)  # Remove italic
                cleaned_line = re.sub(r'`(.+?)`', r'\1', cleaned_line)  # Remove code
                content.append(('body', cleaned_line))
            
            # Regular paragraphs
            else:
                # Skip lines that are just bullets with dashes like "• --"
                if re.match(r'^[•\-]\s*--\s*$', line):
                    i += 1
                    continue
                
                # Clean markdown formatting from paragraphs
                # Remove ALL markdown markers - they should not appear in PDF
                cleaned_line = re.sub(r'\*\*(.+?)\*\*', r'\1', line)  # Remove bold markers
                cleaned_line = re.sub(r'\*(.+?)\*', r'\1', cleaned_line)  # Remove italic markers
                cleaned_line = re.sub(r'`(.+?)`', r'\1', cleaned_line)  # Remove code markers
                
                # Skip if line became empty after cleaning
                if not cleaned_line.strip():
                    i += 1
                    continue
                    
                content.append(('body', cleaned_line))
            
            i += 1
        
        return content
    
    def add_cover_page(self, title=None, subtitle=None, theme='formal'):
        """
        Add a cover page to the PDF
        
        Args:
            title: Cover page title (uses metadata if not provided)
            subtitle: Cover page subtitle
            theme: 'formal' (purple) or 'creative' (yellow)
        """
        title = title or self.metadata.get('title', 'Untitled Document')
        subtitle = subtitle or self.metadata.get('subtitle', '')
        
        self.has_cover = True
        self.cover_data = {
            'title': title,
            'subtitle': subtitle,
            'theme': theme
        }
    
    def _create_simple_toc(self):
        """Create a simple table of contents using a table layout"""
        if not self.toc_entries:
            return []
        
        toc_elements = []
        
        # Add TOC title
        toc_title_style = ParagraphStyle(
            'TOCTitle',
            fontName=Typography.DISPLAY_FONT,
            fontSize=Typography.H1_SIZE,
            textColor=BrandColors.BRAND_PURPLE,
            leading=Typography.H1_SIZE * Typography.H1_LEADING,
            spaceAfter=Layout.PARAGRAPH_SPACING
        )
        toc_title = Paragraph('<b>TABLE OF CONTENTS</b>', toc_title_style)
        toc_elements.append(toc_title)
        toc_elements.append(Spacer(1, 0.3 * inch))
        
        # Create TOC entries as table for better alignment
        toc_data = []
        page_counter = 2 if self.has_cover else 1  # Start after cover
        page_counter += 1  # TOC itself takes a page
        
        for level, text, _ in self.toc_entries:
            # Define style based on level
            if level == 0:  # H1
                style = ParagraphStyle(
                    'TOC_H1_text',
                    fontName=Typography.DISPLAY_FONT,
                    fontSize=12,
                    textColor=BrandColors.BRAND_PURPLE,
                    leading=15
                )
                display_text = text.upper()
                indent = ""
            elif level == 1:  # H2
                style = ParagraphStyle(
                    'TOC_H2_text',
                    fontName=Typography.BODY_FONT,
                    fontSize=11,
                    textColor=BrandColors.TEXT_BLACK,
                    leading=14
                )
                display_text = text
                indent = "&nbsp;&nbsp;&nbsp;"
            else:  # H3
                style = ParagraphStyle(
                    'TOC_H3_text',
                    fontName=Typography.BODY_FONT,
                    fontSize=10,
                    textColor=BrandColors.TEXT_BLACK,
                    leading=13
                )
                display_text = text
                indent = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
            
            # Create table row with heading and page number
            heading_para = Paragraph(f'{indent}{display_text}', style)
            page_style = ParagraphStyle(
                f'TOC_page_{level}',
                fontName=Typography.BODY_FONT if level > 0 else Typography.DISPLAY_FONT,
                fontSize=11 if level ==1 else (10 if level == 2 else 12),
                textColor=BrandColors.BRAND_PURPLE if level == 0 else BrandColors.TEXT_BLACK,
                alignment=TA_RIGHT
            )
            page_para = Paragraph(f'<b>{page_counter}</b>', page_style)
            
            toc_data.append([heading_para, page_para])
            
            # Increment page counter (rough estimate)
            # In practice, you'd track actual pages during generation
            page_counter += 1
        
        # Create table with two columns
        toc_table = Table(toc_data, colWidths=[Layout.CONTENT_WIDTH - 50, 50])
        toc_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        
        toc_elements.append(toc_table)
        toc_elements.append(PageBreak())
        
        return toc_elements
    
    def add_content_from_markdown(self, markdown_text):
        """
        Parse markdown and add all content to story
        
        Args:
            markdown_text: Raw markdown text
        """
        parsed = self.parse_markdown(markdown_text)
        
        # Add cover page if we found title metadata and no cover exists yet
        # OR update existing cover with parsed title if it's better
        if self.metadata.get('title'):
            if not self.has_cover:
                self.add_cover_page()
            else:
                # Update existing cover data with parsed title (parsed title takes precedence)
                print(f"Updating cover title from '{self.cover_data.get('title')}' to '{self.metadata['title']}'", file=sys.stderr)
                self.cover_data['title'] = self.metadata['title']
                if self.metadata.get('subtitle'):
                    self.cover_data['subtitle'] = self.metadata['subtitle']
        
        # Convert parsed content to PDF components
        # If TOC is enabled, track headings for later
        for content_type, content_data in parsed:
            if content_type == 'h1':
                self.story.append(HeadingComponent.create_h1(content_data))
                self.story.append(Spacer(1, Layout.PARAGRAPH_SPACING / 2))
                # Track for TOC (page number will be calculated later)
                if self.include_toc:
                    self.toc_entries.append((0, content_data, None))
            
            elif content_type == 'h2':
                self.story.append(HeadingComponent.create_h2(content_data))
                self.story.append(Spacer(1, Layout.PARAGRAPH_SPACING / 2))
                # Track for TOC
                if self.include_toc:
                    self.toc_entries.append((1, content_data, None))
            
            elif content_type == 'h3':
                self.story.append(HeadingComponent.create_h3(content_data))
                self.story.append(Spacer(1, Layout.PARAGRAPH_SPACING / 4))
                # Track for TOC
                if self.include_toc:
                    self.toc_entries.append((2, content_data, None))
            
            elif content_type == 'body':
                self.story.append(BodyTextComponent.create(content_data))
            
            elif content_type == 'table':
                table = TableComponent.create(content_data)
                if table:
                    self.story.append(table)
                    self.story.append(Spacer(1, Layout.PARAGRAPH_SPACING))
            
            elif content_type == 'callout':
                callout_elements = CalloutComponent.create(content_data)
                for element in callout_elements:
                    self.story.append(element)
    
    def _add_page_decorations(self, canvas_obj, doc):
        """
        Add headers, footers, and watermarks to each page
        
        Args:
            canvas_obj: ReportLab canvas
            doc: Document object
        """
        page_num = canvas_obj.getPageNumber()
        
        # Skip decorations on cover page
        if self.has_cover and page_num == 1:
            return
        
        # Determine actual page number (subtract cover page if present)
        actual_page = page_num - 1 if self.has_cover else page_num
        total_pages = doc.page - 1 if self.has_cover else doc.page
        
        # Get logo paths
        logo_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'logos')
        horizontal_logo = os.path.join(logo_dir, 'sparken-logo-horizontal-white.png')
        vertical_logo = os.path.join(logo_dir, 'sparken logo-vertical-cropped.png')
        
        # Add watermark first (so it's behind content)
        WatermarkComponent.create(canvas_obj, vertical_logo)
        
        # Add header
        HeaderComponent.create(canvas_obj, horizontal_logo, actual_page)
        
        # Add footer
        FooterComponent.create(canvas_obj, actual_page, total_pages)
    
    def _draw_cover_page(self, canvas_obj):
        """Draw the cover page"""
        if not self.has_cover:
            return
        
        logo_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'logos')
        theme = self.cover_data.get('theme', 'formal')
        
        # Use white logo for both themes for consistency
        logo_path = os.path.join(logo_dir, 'sparken-logo-horizontal-white.png')
        
        CoverPageComponent.create(
            canvas_obj,
            self.cover_data['title'],
            self.cover_data.get('subtitle', ''),
            theme,
            logo_path
        )
    
    def generate(self):
        """
        Generate the final PDF
        
        Returns:
            PDF bytes (if output_path is BytesIO) or None (if writing to file)
        """
        # Insert TOC at the beginning of story if enabled
        if self.include_toc and self.toc_entries:
            toc_elements = self._create_simple_toc()
            self.story = toc_elements + self.story
        
        # Create document
        doc = SimpleDocTemplate(
            self.output_path,
            pagesize=letter,
            leftMargin=Layout.MARGIN_LEFT,
            rightMargin=Layout.MARGIN_RIGHT,
            topMargin=Layout.MARGIN_TOP + Layout.HEADER_HEIGHT,
            bottomMargin=Layout.MARGIN_BOTTOM + Layout.FOOTER_HEIGHT
        )
        
        # Build PDF
        if self.has_cover:
            # Create a custom canvas for cover page
            def add_decorations(canvas_obj, doc):
                if canvas_obj.getPageNumber() == 1:
                    self._draw_cover_page(canvas_obj)
                else:
                    self._add_page_decorations(canvas_obj, doc)
            
            # Add page break after cover
            cover_story = [PageBreak()] + self.story
            doc.build(cover_story, onFirstPage=add_decorations, onLaterPages=add_decorations)
        else:
            doc.build(self.story, onFirstPage=self._add_page_decorations, 
                     onLaterPages=self._add_page_decorations)
        
        # Return bytes if using BytesIO
        if isinstance(self.output_path, BytesIO):
            return self.output_path.getvalue()
        
        return None


def main():
    """Main entry point for command-line usage"""
    # Read input from stdin or file
    if len(sys.argv) > 1 and sys.argv[1] != '-':
        input_file = sys.argv[1]
        with open(input_file, 'r', encoding='utf-8') as f:
            markdown_text = f.read()
        metadata_arg_index = 2
    else:
        # Read from stdin (either no args or first arg is '-')
        markdown_text = sys.stdin.read()
        metadata_arg_index = 2
    
    # Parse metadata if JSON is provided
    metadata = {}
    if len(sys.argv) > metadata_arg_index:
        try:
            metadata = json.loads(sys.argv[metadata_arg_index])
        except Exception as e:
            print(f"Warning: Could not parse metadata: {e}", file=sys.stderr)
            pass
    
    # Generate PDF
    output = BytesIO()
    include_toc = metadata.get('includeToc', True)  # Default to True
    generator = SparkEnPDFGenerator(output, include_toc=include_toc)
    
    # Add cover page if metadata provided
    if metadata.get('title'):
        print(f"Creating cover with API title: {metadata.get('title')}", file=sys.stderr)
        generator.add_cover_page(
            metadata.get('title'),
            metadata.get('subtitle', ''),
            metadata.get('theme', 'formal')
        )
    
    # Add content
    generator.add_content_from_markdown(markdown_text)
    
    # Debug: print final cover title
    if generator.has_cover:
        print(f"Final cover title: {generator.cover_data.get('title')}", file=sys.stderr)
    
    # Generate and output
    pdf_bytes = generator.generate()
    
    # Write to stdout (binary)
    sys.stdout.buffer.write(pdf_bytes)


if __name__ == '__main__':
    main()
