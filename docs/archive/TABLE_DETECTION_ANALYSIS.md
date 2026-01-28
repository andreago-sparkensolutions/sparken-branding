# Table Detection Issue Analysis

## Problem

When extracting text from PDFs, tables often lose their pipe delimiters (`|`) and come through as plain text like:

```
Attribute Summary
Size 20 hectares (49.4 acres)
Beachfront \~200 meters
Legal Status Propiedad Privada (fully titled; converted from ejido \~7 years ago)
```

Instead of:

```
| Attribute | Summary |
|-----------|---------|
| Size | 20 hectares (49.4 acres) |
| Beachfront | \~200 meters |
```

## Why This Happens

PDF text extraction removes visual table structure and returns plain text. The pipe characters (`|`) are visual elements in the rendered PDF, not part of the extracted text.

## Current Detection

Our code only detects tables when pipes are present:

```typescript
if (line.includes('|')) {
  // Parse as table
}
```

## Possible Solutions

### Option 1: Pattern-Based Detection (Complex)
Detect lines that look like key-value pairs:
```
Word(s) Multiple words with spaces or special chars
```

Problems:
- False positives
- Hard to determine column boundaries
- May break regular paragraphs

### Option 2: Preserve Original Markdown
If the original uploaded file was markdown with tables, we should preserve that structure.

The issue is that you uploaded a **PDF file**, not markdown. When we extract text from PDFs, we lose table structure.

### Option 3: Manual Table Formatting (Current Best Option)
For PDFs that already exist, the table structure is already rendered visually in the original PDF. When we apply branding:

1. We overlay headers/footers
2. We add cover page
3. We preserve the original content as-is

**Recommendation**: Don't re-extract and re-render PDF content. Just overlay branding.

## For Markdown Files

When you upload `.md` files with proper table syntax:
```markdown
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
```

These WILL render correctly as tables because we parse the markdown structure.

## Action Needed

To get tables formatted correctly:
1. **Start with markdown** (`.md` file) that has proper table syntax, OR
2. **Keep original PDF** and just apply branding overlay (don't re-render content)

The current PDF you showed was already rendered from markdown, then you re-uploaded it as PDF, which lost the table structure during text extraction.
