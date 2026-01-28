#!/usr/bin/env python3
"""
Clean PDF Text Utility
Removes artifacts from PDF-to-text conversions before rebranding
"""

import re
import sys


def clean_pdf_artifacts(text):
    """
    Remove common PDF conversion artifacts
    
    Args:
        text: Raw text extracted from PDF
    
    Returns:
        Cleaned text ready for markdown processing
    """
    # First pass: clean multiline artifacts before processing line by line
    # Remove link-wrapped titles that span multiple lines
    text = re.sub(r'\*\*\[([^\]]+?)\n+([^\]]*?)\]\([^\)]+?\)\*\*', r'\1 \2', text, flags=re.MULTILINE)
    text = re.sub(r'\*\*\[([^\]]+?)\]\([^\)]+?\)\*\*', r'\1', text)
    
    # Remove trailing numbers from link fragments (like "TITLE\n1" from PDF TOC)
    text = re.sub(r'([A-Z\s&]+)\n+\d+\s*$', r'\1', text, flags=re.MULTILINE)
    
    lines = text.split('\n')
    cleaned_lines = []
    
    skip_next = False
    found_first_heading = False
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Skip if we flagged this line previously
        if skip_next:
            skip_next = False
            continue
        
        # Skip page break markers like "-- X of Y --"
        if re.match(r'^--\s*\d+\s+of\s+\d+\s*--$', stripped):
            continue
        
        # Skip footer lines like "Page X of Y Sparken" or "Page X of Y [word]"
        if re.match(r'^Page\s+\d+\s+of\s+\d+\s+\w+\s*$', stripped):
            continue
        
        # Skip standalone "##" or "###" lines (not markdown headers)
        if re.match(r'^#{2,}$', stripped):
            continue
        
        # Skip lines that are just numbers (likely page markers or TOC numbers)
        if re.match(r'^\d+$', stripped):
            continue
        
        # Clean inline link references that shouldn't be there
        # Example: [Text](#anchor) -> Text
        cleaned = re.sub(r'\[([^\]]+?)\]\(#[^\)]+?\)', r'\1', stripped)
        
        # Clean up HTML entities
        cleaned = re.sub(r'&amp;', '&', cleaned)
        cleaned = re.sub(r'&nbsp;', ' ', cleaned)
        
        # Remove trailing single digits (common in PDF TOC extractions)
        cleaned = re.sub(r'\s+\d+\s*$', '', cleaned)
        
        # If this looks like a title (ALL CAPS or Title Case, reasonable length) and we haven't found one yet
        # Add it as H1
        if not found_first_heading and 10 < len(cleaned) < 100 and not cleaned.startswith('#'):
            # Check if it's mostly uppercase (at least 70%)
            alpha_chars = [c for c in cleaned if c.isalpha()]
            if alpha_chars and sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars) > 0.7:
                cleaned_lines.append(f"# {cleaned}")
                found_first_heading = True
                continue
        
        # Remove ALL markdown bold/italic markers (both inline and full-line)
        # These should not appear in final PDF output
        cleaned = re.sub(r'\*\*(.+?)\*\*', r'\1', cleaned)  # Remove bold
        cleaned = re.sub(r'\*(.+?)\*', r'\1', cleaned)  # Remove italic
        cleaned = re.sub(r'`(.+?)`', r'\1', cleaned)  # Remove code markers
        
        # Fix escaped numbered lists like "1\." → "1."
        cleaned = re.sub(r'(\d+)\\.', r'\1.', cleaned)
        
        # Fix escaped equals signs like "\=" → "="
        cleaned = re.sub(r'\\=', '=', cleaned)
        
        # Remove bullet point artifacts like "•" followed by "--"
        cleaned = re.sub(r'^[•\-]\s*--\s*$', '', cleaned)
        
        # Remove standalone bullet points or dashes at start of line if they're alone
        if re.match(r'^[•\-]\s*$', cleaned):
            cleaned = ''
        
        # Remove excessive whitespace but preserve paragraph breaks
        if cleaned:
            cleaned_lines.append(cleaned)
        elif cleaned_lines and cleaned_lines[-1] != '':
            # Keep single blank lines for paragraph breaks
            cleaned_lines.append('')
    
    # Join lines and clean up excessive blank lines
    text = '\n'.join(cleaned_lines)
    
    # Remove more than 2 consecutive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text


def main():
    """Process text from stdin and output cleaned version"""
    if len(sys.argv) > 1 and sys.argv[1] != '-':
        with open(sys.argv[1], 'r', encoding='utf-8') as f:
            input_text = f.read()
    else:
        input_text = sys.stdin.read()
    
    # Clean PDF artifacts
    cleaned_text = clean_pdf_artifacts(input_text)
    
    # Output cleaned text
    print(cleaned_text)


if __name__ == '__main__':
    main()
