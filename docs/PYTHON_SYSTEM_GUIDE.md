# Sparken PDF Generation System - Quick Start Guide

## System Overview

You now have TWO complementary PDF branding systems:

### 1. Python ReportLab Generator (NEW)
**Purpose**: Generate complete branded PDFs from scratch  
**Best For**: Markdown/text documents with tables, cover pages, rich formatting  
**Files**: `python/sparken_pdf_generator.py` + components

### 2. TypeScript pdf-lib Overlay (EXISTING)
**Purpose**: Add branding overlays to existing PDFs  
**Best For**: Pre-made PDFs that need Sparken branding applied  
**Files**: `lib/pdf-branding.ts`

## How It Works

The system **automatically routes** files based on type:

```
Upload File
    ↓
Is it .md or .txt?
    ↓ YES → Python Generator (rich document creation)
    ↓ NO  → TypeScript Overlay (branding overlay)
    ↓
Branded PDF Download
```

## Quick Test

### Test Python Generator

1. Upload `test-python-pdf.md` to http://localhost:3000
2. You'll get a PDF with:
   - ✅ Purple cover page with yellow logo
   - ✅ Purple headers throughout
   - ✅ Styled table with purple headers and striped rows
   - ✅ Callout box with yellow border
   - ✅ Repeated vertical logo watermarks
   - ✅ Purple footer with page numbers

### Test TypeScript Overlay

1. Upload any existing PDF to http://localhost:3000
2. You'll get the same PDF with:
   - ✅ Purple header bar added (with yellow logo)
   - ✅ Repeated vertical logo watermarks
   - ✅ Purple footer bar with page numbers

## Start the Server

```bash
cd /Users/andreagonzalezh/Documents/Sparken/sparken-branding

# Kill any existing processes
lsof -ti:3000 | xargs kill -9

# Start the server
npm run build && npm start
```

Then open: http://localhost:3000

## Creating Branded Documents

### Method 1: Upload Markdown

Create a file like this:

```markdown
# My Report Title

## Prepared For: Client Name

This is the introduction paragraph.

### Key Findings

The following table shows our results:

| Metric | Value | Status |
|--------|-------|--------|
| Conversion Rate | 45% | High |
| Engagement | 78% | Good |

> Important note: This is a callout box with yellow border

## Conclusion

Summary paragraph here.
```

Upload it and get a fully branded PDF with cover page, styled tables, and more!

### Method 2: Upload Existing PDF

Simply upload any PDF file and the TypeScript system will add:
- Purple header with yellow logo
- Watermark pattern
- Purple footer with page numbers

## Brand Elements Applied

Both systems use identical Sparken brand colors:

| Element | Color | Usage |
|---------|-------|-------|
| Headers | #5E5592 (Purple) | H1, H2, H3, footers |
| Accents | #F8D830 (Yellow) | Logo, callout borders |
| Tables | #D0C6E1 (Lavender) | Striped row backgrounds |
| Text | #030403 (Black) | Body text |

## Customization

### Cover Page Theme

When uploading markdown, the system defaults to "formal" (purple) theme.

For a yellow/creative theme, you'd need to modify the API call in `app/api/brand/route.ts`:

```typescript
theme: 'creative' // instead of 'formal'
```

### Modify Colors

All colors are centralized:
- **Python**: `python/brand_constants.py`
- **TypeScript**: `lib/pdf-branding.ts`

Both use the same hex values to ensure consistency.

## Troubleshooting

### Python Dependencies Missing

```bash
pip install -r python/requirements.txt
```

### Server Won't Start

```bash
# Clear port and restart
lsof -ti:3000 | xargs kill -9
npm run build
npm start
```

### PDF Generation Fails

Check the browser console and terminal for error messages. The system will fallback to TypeScript if Python fails.

## Next Steps

1. **Test the system**: Upload test-python-pdf.md
2. **Create your own**: Write a markdown document and upload it
3. **Customize**: Adjust colors or layouts in brand_constants.py
4. **Deploy**: Both systems work together seamlessly

## Files Created

```
python/
├── brand_constants.py          # Brand colors and layout specs
├── components.py                # PDF components (tables, headers, etc.)
├── sparken_pdf_generator.py    # Main generator
├── requirements.txt             # Dependencies
└── README.md                    # Full documentation

lib/
├── python-bridge.ts            # Next.js ↔ Python interface
├── pdf-branding.ts             # TypeScript overlay (unchanged)
└── markdown-to-pdf.ts          # Fallback converter

app/api/brand/route.ts          # Updated with smart routing

test-python-pdf.md              # Test document
test-output.pdf                 # Generated test PDF (60KB)
```

## Support

For issues or questions:
1. Check `python/README.md` for detailed documentation
2. Review error logs in terminal
3. Verify Python dependencies are installed
4. Ensure logo files exist in `public/` directory

---

**Ready!** Upload a markdown file to see the Python generator create a beautiful branded PDF from scratch. 🎉
