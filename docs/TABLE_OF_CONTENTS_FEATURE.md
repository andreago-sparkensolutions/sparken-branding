# Table of Contents Feature

## Overview

The Sparken PDF Generator now automatically includes a **Table of Contents (TOC)** on all generated PDFs. The TOC displays all document headers (H1, H2, H3) with their corresponding page numbers, making it easy for readers to navigate long documents.

## Features

### Automatic Generation
- **Automatic extraction** of all headers from your markdown content
- **Hierarchical structure** that reflects your document organization
- **Page number tracking** with estimated page references
- **Professional styling** using Sparken brand colors

### Visual Hierarchy
- **H1 headings**: Purple, bold, uppercase, no indentation
- **H2 headings**: Black, regular, indented 15pt
- **H3 headings**: Black, smaller font, indented 30pt

### Placement
- TOC appears immediately after the cover page
- Dedicated page with "TABLE OF CONTENTS" heading
- Followed by page break before main content begins

## Usage

### Python API

```python
from sparken_pdf_generator import SparkEnPDFGenerator

# Create generator with TOC enabled (default)
generator = SparkEnPDFGenerator(output_path, include_toc=True)

# Or disable TOC if needed
generator = SparkEnPDFGenerator(output_path, include_toc=False)

# Add your content
generator.add_content_from_markdown(markdown_text)

# Generate PDF
pdf_bytes = generator.generate()
```

### Command Line

```bash
# Generate PDF with TOC (default behavior)
cat document.md | python3 python/sparken_pdf_generator.py - \
  '{"title": "My Document", "subtitle": "Subtitle", "theme": "formal"}' \
  > output.pdf

# Disable TOC via metadata
cat document.md | python3 python/sparken_pdf_generator.py - \
  '{"title": "My Document", "includeToc": false}' \
  > output.pdf
```

### TypeScript/Next.js API

```typescript
import { generatePythonPDF } from '@/lib/python-bridge';

const pdfBytes = await generatePythonPDF(markdownContent, {
  title: 'My Document',
  subtitle: 'Q1 2026 Report',
  theme: 'formal',
  includeToc: true  // Default is true
});
```

## Example

Given this markdown:

```markdown
# Executive Summary

This is the introduction.

## Market Analysis

### Current Conditions

Details about the market.

### Future Outlook

Predictions for next quarter.

## Strategic Goals

Our objectives for the year.
```

The TOC will display:

```
TABLE OF CONTENTS

EXECUTIVE SUMMARY                    3
  Market Analysis                    4
    Current Conditions               4
    Future Outlook                   5
  Strategic Goals                    6
```

## Styling Details

### Colors
- **H1 entries**: Deep Cognitive Purple (#5E5592)
- **H2/H3 entries**: Text Black (#030403)
- **Page numbers**: Bold, right-aligned

### Typography
- **H1**: Helvetica-Bold, 12pt
- **H2**: Helvetica, 11pt
- **H3**: Helvetica, 10pt

### Layout
- **Page width**: Uses full content width minus margins
- **Spacing**: 
  - H1: 6pt after
  - H2: 4pt after
  - H3: 3pt after

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `include_toc` | boolean | `true` | Whether to generate TOC |
| `title` | string | - | Document title (required for cover) |
| `subtitle` | string | - | Document subtitle |
| `theme` | string | `'formal'` | Cover page theme (formal/creative) |

## Technical Details

### Page Number Calculation
The current implementation uses an **estimation algorithm** for page numbers based on:
- Cover page = Page 1
- TOC page = Page 2
- Content starts at Page 3
- Each heading increments the counter

### Future Enhancements
Potential improvements for future versions:
1. **Exact page tracking**: Use ReportLab's bookmarking system for precise page numbers
2. **Clickable links**: Make TOC entries clickable to jump to sections
3. **Custom depth**: Allow users to specify TOC depth (H1 only, H1-H2, etc.)
4. **Dots/leaders**: Add dot leaders between heading text and page numbers

## Limitations

1. **Page numbers are estimates**: The current implementation provides estimated page numbers that may not exactly match the final PDF due to dynamic content sizing
2. **No sub-H3 support**: Headers below H3 level (####, #####) are not included in TOC
3. **Not clickable**: TOC entries are not currently hyperlinked to their sections

## Testing

Test the TOC feature with:

```bash
# Generate test PDF with comprehensive TOC
cat tests/test-toc.md | python3 python/sparken_pdf_generator.py - \
  '{"title": "Marketing Strategy Report 2026", "subtitle": "Q1 Planning Document"}' \
  > tests/test-toc-output.pdf

# View the generated PDF
open tests/test-toc-output.pdf
```

## See Also

- [Brand Implementation Guide](./BRAND_IMPLEMENTATION.md)
- [System Architecture](./SYSTEM_ARCHITECTURE.md)
- [Developer Reference](./DEVELOPER_REFERENCE.md)
