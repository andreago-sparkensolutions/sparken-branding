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
2. **Process**: The app automatically applies Sparken branding
3. **Download**: Download your branded document instantly

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
├── app/
│   ├── api/
│   │   └── brand/          # PDF branding API endpoint
│   ├── components/
│   │   ├── FileUpload.tsx  # Drag-and-drop upload
│   │   └── ProcessingStatus.tsx  # Status indicator
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── lib/
│   ├── constants.ts        # Sparken brand constants
│   ├── markdown-to-pdf.ts  # Markdown to PDF converter
│   └── pdf-branding.ts     # PDF branding engine
└── public/
    └── sparken-logo.svg    # Sparken logo
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
- `public/sparken-logo-horizontal.png` - Horizontal logo with tagline
- `public/sparken-logo-vertical.png` - Vertical logo variation

Colors verified from Sparken brandbook 1.pdf

## License

© 2026 Sparken. All rights reserved.
