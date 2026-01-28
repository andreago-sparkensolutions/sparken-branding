# Sparken Document Branding

**Built for the Brain**

A behavioral-science driven document branding tool that applies Sparken's professional identity to PDF, Word, and Markdown documents.

## Brand Philosophy

This tool reflects Sparken's core principles:
- **Clarity over hype** - Clean, structured layouts
- **Depth over decoration** - Intentional design choices
- **Trust over persuasion** - Subtle, professional branding

All brand assets verified against official Sparken brandbook.

## Features

- 🎨 **Official Brand Colors**: Deep Cognitive Purple (#5E5592), Behavioral Yellow (#F8D830), Research Lime (#D7DF5E), Soft Purple (#D0C6E1)
- ⚡ **Instant Processing**: Fast client-side PDF processing
- 📄 **Multiple Formats**: Supports PDF, Word, and Markdown documents (.pdf, .doc, .docx, .md)
- 🎯 **Effortless Upload**: Clean drag-and-drop interface
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🧠 **Cognitive Flow**: Reduces friction at every step
- 🏢 **Official Logo**: Uses authentic Sparken four-pointed star logo
- 🔧 **Auto-Cleanup**: Automatically removes PDF conversion artifacts for clean output
- 📑 **Table of Contents**: Automatically generates TOC with page numbers from document headers

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Upload**: Drag and drop your PDF, Word, or Markdown document, or click to browse
2. **Process**: The app automatically applies Sparken branding (and cleans any formatting issues)
3. **Download**: Download your professionally branded document instantly

### Automatic Formatting Cleanup

The system automatically detects and removes common PDF conversion artifacts:
- Link wrappers like `**[TITLE](#anchor)**`
- Page markers like `-- 1 of 13 --`
- Embedded footer text
- Random symbols and TOC numbers

No extra steps needed - just upload and the system handles it! See [docs/FORMATTING_FIXES_SUMMARY.md](docs/FORMATTING_FIXES_SUMMARY.md) for details.

### Table of Contents

PDFs now include an automatic table of contents:
- Extracts all headers (H1, H2, H3) from your document
- Displays hierarchical structure with page numbers
- Professional styling with Sparken brand colors
- Can be disabled if not needed

See [docs/TOC_QUICKSTART.md](docs/TOC_QUICKSTART.md) for a quick guide, or [docs/TABLE_OF_CONTENTS_FEATURE.md](docs/TABLE_OF_CONTENTS_FEATURE.md) for full documentation.

## Branding Elements

The tool applies the following elements designed for clarity and trust:

- **Official Sparken Logo**: Four-pointed star with "S" mark + horizontal wordmark
- **Watermark**: Very subtle diagonal "SPARKEN" watermark (4% opacity - calm, not aggressive)
- **Header Area**: Logo placement with decorative line in Deep Cognitive Purple
- **Footer**: "Built for the Brain" tagline with page numbers in official black (#030403)
- **Structure**: Thin decorative lines for visual hierarchy

All colors verified from official Sparken brandbook.

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Processing**: pdf-lib
- **File Upload**: react-dropzone

## Project Structure

```
sparken-branding/
├── app/                    # Next.js application
│   ├── api/
│   │   └── brand/          # PDF branding API endpoint
│   ├── components/
│   │   ├── FileUpload.tsx  # Drag-and-drop upload
│   │   └── ProcessingStatus.tsx  # Status indicator
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── lib/                    # Core libraries
│   ├── constants.ts        # Sparken brand constants
│   ├── markdown-to-pdf.ts  # Markdown to PDF converter
│   ├── pdf-branding.ts     # PDF branding engine
│   └── python-bridge.ts    # Python integration layer
├── python/                 # Python PDF system
│   ├── sparken_pdf_generator.py  # ReportLab PDF generator
│   ├── components.py       # PDF components (headers, footers, etc)
│   ├── brand_constants.py  # Brand color/font definitions
│   └── clean_pdf_text.py   # PDF artifact cleaning utility
├── public/                 # Static assets
│   ├── logos/              # Sparken brand logos
│   │   ├── sparken-logo-horizontal.png
│   │   ├── sparken-logo-horizontal-white.png
│   │   ├── sparken-logo-horizontal-yellow.png
│   │   ├── sparken-logo-vertical.png
│   │   └── [other variations]
│   └── icons/              # UI icons
│       ├── file.svg
│       ├── globe.svg
│       └── [other icons]
├── docs/                   # Project documentation
│   ├── README.md           # Documentation index
│   ├── QUICK_START.md      # Quick start guide
│   ├── DEPLOYMENT.md       # Deployment guide
│   └── [other docs]
└── tests/                  # Test files and outputs
    ├── README.md           # Test documentation
    └── [test files]
```

## Customization

To customize the branding, edit the constants in `lib/constants.ts`:

- **Brand colors** - Official palette from brandbook
  - Deep Cognitive Purple (#5E5592)
  - Behavioral Yellow (#F8D830)
  - Research Lime (#D7DF5E)
  - Soft Purple (#D0C6E1)
  - Near-black (#030403)
- **Logo** - Official PNG logo files in `/public`
- **Watermark opacity** - Control subtlety (default: 4%)
- **Header and footer text** - Update messaging
- **Upload file size limits** - Adjust as needed

Design philosophy: If a change increases cognitive load or feels aggressive, reconsider it.

## Official Brand Assets

Logo files used:
- `public/logos/sparken-logo-horizontal.png` - Horizontal logo with tagline
- `public/logos/sparken-logo-vertical.png` - Vertical logo variation

Colors verified from Sparken brandbook 1.pdf

## Documentation

For detailed documentation, see the [docs/](docs/) folder:
- [Quick Start Guide](docs/QUICK_START.md)
- [Table of Contents Quick Start](docs/TOC_QUICKSTART.md)
- [Table of Contents Feature](docs/TABLE_OF_CONTENTS_FEATURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Brand Implementation Details](docs/BRAND_IMPLEMENTATION.md)
- [Python System Guide](docs/PYTHON_SYSTEM_GUIDE.md)

## License

© 2026 Sparken. All rights reserved.
