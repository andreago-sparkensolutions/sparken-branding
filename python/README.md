# Sparken Python PDF Generator

## Overview

This Python-based PDF generator creates fully branded Sparken documents from scratch using ReportLab. It works alongside the existing TypeScript overlay system to provide two complementary approaches:

- **Python (ReportLab)**: Generate complete branded PDFs from markdown/text with tables, cover pages, and rich styling
- **TypeScript (pdf-lib)**: Overlay branding on existing PDF files

## Features

### Complete Brand Implementation
- ✅ Purple header bars with yellow Sparken logo
- ✅ Repeated vertical logo watermark pattern
- ✅ Purple footer with page numbers
- ✅ All brand colors: #5E5592 (purple), #F8D830 (yellow), #D0C6E1 (lavender)
- ✅ Typography hierarchy (H1: 24pt, H2: 18pt, H3: 14pt, Body: 11pt)

### Document Components
- **Cover Pages**: Full-page purple or yellow background with centered branding
- **Headers**: H1 (all caps, purple), H2 (title case, purple), H3 (bold, purple)
- **Tables**: Purple headers with white text, striped lavender/white rows
- **Callout Boxes**: Yellow left border (4pt) with gray background
- **Lists**: Properly formatted bullet points
- **Body Text**: Clean Helvetica at 11pt with 1.6x line spacing

## Installation

```bash
cd /Users/andreagonzalezh/Documents/Sparken/sparken-branding
pip install -r python/requirements.txt
```

### Required Packages
- `reportlab==4.0.9` - PDF generation library
- `Pillow==10.2.0` - Image processing for logos
- `markdown==3.5.2` - Markdown parsing support

## Usage

### Command Line

```bash
# Generate PDF from markdown file
python3 python/sparken_pdf_generator.py input.md '{"title": "My Document", "subtitle": "Subtitle", "theme": "formal"}' > output.pdf

# Generate from stdin
cat document.md | python3 python/sparken_pdf_generator.py - '{}' > output.pdf
```

### Programmatic (Next.js API)

The system automatically routes files based on type:

- **Markdown/Text files (.md, .txt)**: Routed to Python generator for rich document creation
- **Existing PDFs (.pdf)**: Routed to TypeScript overlay for branding

```typescript
import { generatePythonPDF } from '@/lib/python-bridge';

const pdfBytes = await generatePythonPDF(markdownContent, {
  title: 'Document Title',
  subtitle: 'Prepared For: Client Name',
  theme: 'formal' // or 'creative'
});
```

## File Structure

```
python/
├── brand_constants.py       # Brand colors, fonts, layout specs
├── components.py             # Reusable PDF components (tables, headers, etc.)
├── sparken_pdf_generator.py # Main generator script
└── requirements.txt          # Python dependencies

lib/
├── python-bridge.ts          # TypeScript interface to Python
├── pdf-branding.ts          # TypeScript overlay system (for existing PDFs)
└── markdown-to-pdf.ts       # Fallback TypeScript converter

app/api/brand/route.ts       # Unified API endpoint (routes to Python or TS)
```

## Markdown Syntax Support

### Headers
```markdown
# H1 Heading (All Caps, Purple, 24pt)
## H2 Heading (Title Case, Purple, 18pt)
### H3 Heading (Bold, Purple, 14pt)
```

### Tables
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```
*Renders with purple headers and striped lavender/white rows*

### Callouts
```markdown
> This is a callout box with a yellow left border
> It can span multiple lines
```

### Lists
```markdown
- Bullet point 1
- Bullet point 2
- Bullet point 3
```

### Text Formatting
```markdown
**Bold text** and *italic text*
`Inline code`
[Link text](https://example.com)
```

## Cover Page Themes

### Formal (Purple)
- Full purple background (#5E5592)
- White title and subtitle text
- Yellow Sparken logo (horizontal)
- "DIGITAL MARKETING AGENCY" tagline at bottom

```python
theme='formal'
```

### Creative (Yellow)
- Full yellow background (#F8D830)
- Purple title and subtitle text
- Purple Sparken logo (horizontal)
- "DIGITAL MARKETING AGENCY" tagline at bottom

```python
theme='creative'
```

## Brand Colors

All colors match the Sparken Brand Identity System:

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| Deep Cognitive Purple | #5E5592 | (94, 85, 146) | Headers, footers, brand identity |
| Behavioral Yellow | #F8D830 | (248, 216, 48) | Accents, logo on purple |
| Soft Lavender | #D0C6E1 | (208, 198, 225) | Table row striping, backgrounds |
| Research Lime | #D7DF5E | (215, 223, 94) | Success metrics (sparingly) |
| Soft Gray | #F4F5F7 | (244, 245, 247) | Callout backgrounds |
| Text Black | #030403 | (3, 4, 3) | Body text |

## Layout Specifications

- **Page Size**: US Letter (8.5" x 11" / 612pt x 792pt)
- **Margins**: 1 inch (72pt) on all sides
- **Header Height**: 80pt (purple bar)
- **Footer Height**: 50pt (purple bar)
- **Watermark**: 120pt logos, 180pt spacing, 0.04 opacity

## Testing

Test the generator with the included test file:

```bash
# Generate test PDF
python3 python/sparken_pdf_generator.py test-python-pdf.md '{"title": "Test Document", "subtitle": "Python PDF Test", "theme": "formal"}' > test-output.pdf

# Open the result
open test-output.pdf
```

Expected output:
- Cover page with purple background and yellow logo
- Purple headers throughout
- Styled table with purple headers
- Callout box with yellow border
- Repeated vertical logo watermarks

## Troubleshooting

### Python Not Found
```bash
# Check Python installation
python3 --version

# Should show Python 3.7+
```

### Missing Dependencies
```bash
# Install all dependencies
pip install -r python/requirements.txt

# Or install individually
pip install reportlab Pillow markdown
```

### Logo Not Showing
Ensure logo files exist in `public/` directory:
- `sparken-logo-horizontal-yellow.png` (for purple header)
- `sparken logo-vertical-cropped.png` (for watermark)

### PDF Generation Fails
Check Python script has execute permissions:
```bash
chmod +x python/sparken_pdf_generator.py
```

## API Integration

The Next.js API automatically handles routing:

1. **Upload markdown file** → Python generator creates rich branded PDF
2. **Upload existing PDF** → TypeScript overlay adds branding
3. **Python unavailable** → Fallback to TypeScript converter

## Development

### Adding New Components

Add to `components.py`:

```python
class MyComponent:
    @staticmethod
    def create(params):
        # Component implementation
        pass
```

### Modifying Brand Colors

Edit `brand_constants.py`:

```python
BRAND_PURPLE = colors.Color(94/255, 85/255, 146/255)
```

### Changing Layout

Modify `Layout` class in `brand_constants.py`:

```python
class Layout:
    MARGIN_TOP = 72
    HEADER_HEIGHT = 80
    # etc.
```

## Performance

- **Python PDF Generation**: ~1-2 seconds for typical documents
- **TypeScript Overlay**: ~500ms for existing PDFs
- **Memory**: ~50-100MB for typical documents

## License

Proprietary - Sparken Solutions © 2026
