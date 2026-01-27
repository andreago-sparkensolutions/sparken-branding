# Quick Start Guide

## Running the Sparken Document Branding Tool

### Start the Development Server

```bash
cd "/Users/andreagonzalezh/Documents/Sparken/sparken-branding"
npm run dev
```

The application will be available at **http://localhost:3000**

### How to Use

1. **Open the app** in your browser at http://localhost:3000
2. **Upload a PDF, Word, or Markdown file** by dragging and dropping or clicking to browse
3. **Wait** for the branding to be applied (usually takes 1-2 seconds)
4. **Download** your branded PDF with the Sparken logo, watermark, headers, and footers

### What Gets Added to Your Documents

- **Sparken Logo**: Top section of each page
- **Watermark**: Diagonal "SPARKEN" watermark across each page (semi-transparent)
- **Header**: Sparken branding at the top with a decorative line
- **Footer**: Company information and page numbers

### Customizing the Branding

Edit `lib/constants.ts` to customize:
- Brand colors
- Logo position and size
- Watermark text, size, and opacity
- Header and footer text
- Maximum file size

### Building for Production

```bash
npm run build
npm start
```

### Troubleshooting

**Issue**: Dependencies not found
**Solution**: Run `npm install` in the project directory

**Issue**: Port 3000 already in use
**Solution**: Stop other Next.js apps or change the port: `npm run dev -- -p 3001`

**Issue**: PDF branding not working
**Solution**: Make sure you're uploading a valid PDF file (not password protected)

**Issue**: Markdown formatting looks basic
**Solution**: The Markdown converter creates clean PDFs with basic formatting. For more advanced formatting, convert to PDF with styling first before uploading

### Supported File Types

- **PDF (.pdf)**: Direct branding applied
- **Word (.doc, .docx)**: Currently accepted but may need additional converter setup
- **Markdown (.md)**: Automatically converted to PDF, then branded

### Project Location

The project is located at:
```
/Users/andreagonzalezh/Documents/Sparken/sparken-branding
```

### Next Steps

- Replace `/public/sparken-logo.svg` with your actual Sparken logo
- Customize brand colors in `lib/constants.ts`
- Add more branding elements as needed
- Deploy to Vercel or another hosting platform
