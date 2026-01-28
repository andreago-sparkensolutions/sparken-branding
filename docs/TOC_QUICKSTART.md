# Table of Contents Feature - Quick Start

## What You Get

Your PDFs now automatically include a professional table of contents with:
- ✅ All document headers (H1, H2, H3)
- ✅ Page numbers for each section
- ✅ Hierarchical indentation
- ✅ Sparken brand styling

## 5-Minute Setup

### 1. Structure Your Markdown

Use proper markdown headers:

```markdown
# Main Topic

## Subtopic

### Detail Point

Content goes here...

## Another Subtopic

More content...
```

### 2. Generate PDF

The TOC is automatically included - no extra steps needed!

```bash
cat your-document.md | python3 python/sparken_pdf_generator.py - \
  '{"title": "Your Title", "subtitle": "Optional Subtitle"}' \
  > output.pdf
```

### 3. View Result

Your PDF will have:
1. **Page 1**: Cover page with title
2. **Page 2**: Table of contents
3. **Page 3+**: Your content

## Example Output

```
TABLE OF CONTENTS

EXECUTIVE SUMMARY                    3
  Background                         3
  Key Findings                       4
    
MAIN ANALYSIS                        5
  Market Overview                    5
    Current Trends                   5
    Future Predictions               6
  Competitive Landscape              7
    
RECOMMENDATIONS                      8
  Short-term Actions                 8
  Long-term Strategy                 9
```

## Customization

### Disable TOC (if needed)

```bash
# Add "includeToc": false to metadata
cat document.md | python3 python/sparken_pdf_generator.py - \
  '{"title": "Title", "includeToc": false}' \
  > output.pdf
```

### In TypeScript/Next.js

```typescript
await generatePythonPDF(markdown, {
  title: 'My Document',
  includeToc: false  // Optional: disable TOC
});
```

## Best Practices

### ✅ Do This
- Use clear, descriptive header text
- Maintain consistent heading hierarchy (H1 → H2 → H3)
- Keep header text concise (< 60 characters)
- Use H1 for major sections only

### ❌ Avoid This
- Don't skip heading levels (H1 → H3)
- Don't use headers for emphasis (use bold instead)
- Don't repeat header text
- Don't use very long header text (breaks layout)

## Tips

1. **Preview structure**: Look at your markdown headers - that's exactly what your TOC will show
2. **Page count**: More headers = longer TOC (plan accordingly)
3. **Readability**: Aim for 5-12 TOC entries for best readability
4. **Nesting**: Limit to 3 levels (H1, H2, H3) for clarity

## Troubleshooting

**Q: TOC is empty**
- Check that you're using markdown headers (`#`, `##`, `###`)
- Ensure headers are on their own lines with blank lines before/after

**Q: Page numbers seem off**
- This is normal - they're estimates based on content
- Actual pages may vary by 1-2 pages depending on content size

**Q: Headers not showing up**
- Only H1, H2, and H3 are included
- H4 and below are ignored

**Q: TOC takes multiple pages**
- If you have 30+ headers, TOC may span multiple pages
- Consider consolidating sections or removing H3 headers from TOC

## What's Next?

- [Full Documentation](./TABLE_OF_CONTENTS_FEATURE.md)
- [Examples](../tests/test-toc.md)
- [Brand Guidelines](./BRAND_IMPLEMENTATION.md)

---

**Need help?** Check the full documentation or create an issue.
