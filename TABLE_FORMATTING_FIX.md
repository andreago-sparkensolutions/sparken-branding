# Table Formatting Fix

## Issue
Tables were not being properly formatted in the PDF output. Instead of formatted tables, they appeared as plain text with pipe characters.

**Before:**
```
Detail | Description
Size | 20 hectares
```
This would render as plain text in the PDF.

## Root Cause
The table parser in `python/sparken_pdf_generator.py` only detected tables that started with a pipe character (`|`):

```python
elif line.startswith('|'):
```

This meant standard markdown tables (without leading pipes) were not recognized:
- ❌ `Detail | Description` (not detected)
- ✅ `| Detail | Description |` (detected)

## Solution
Updated the table detection logic to handle both formats:

### Enhanced Detection
- Detects any line containing `|` character
- Handles tables with or without leading/trailing pipes
- Skips separator rows (lines with only dashes and colons)
- Cleans markdown formatting from cells (bold, italic, code)

### Supported Formats

**Format 1: No leading/trailing pipes (standard)**
```
Header 1 | Header 2 | Header 3
Data 1 | Data 2 | Data 3
```

**Format 2: With leading/trailing pipes**
```
| Header 1 | Header 2 | Header 3 |
| Data 1 | Data 2 | Data 3 |
```

**Format 3: With separator rows (GitHub-style)**
```
| Header 1 | Header 2 |
|----------|----------|
| Data 1   | Data 2   |
```

All three formats now render as properly formatted tables in the PDF!

## Changes Made

File: `python/sparken_pdf_generator.py` (lines ~79-108)

- Changed detection from `line.startswith('|')` to `'|' in line`
- Added logic to handle both pipe formats
- Improved row parsing to skip empty cells
- Enhanced separator row detection
- Better markdown cleanup in cells

## Testing

### Test Case 1: Two-Column Table
```
Detail | Description
Size | 20 hectares (49.4 acres) beachfront
Title | Propiedad Privada
```

**Result:** ✅ Renders as formatted table with purple header row

### Test Case 2: Multi-Column Table
```
Property | Size | Beach | Title Status | Price | $/Hectare
Your Property | 20 ha | 200m | Titled | $2,000,000 | $100,000
```

**Result:** ✅ Renders as formatted table with 6 columns

## PDF Table Styling

Tables automatically receive Sparken branding:
- **Header row**: Purple background (#5E5592), white text
- **Data rows**: Alternating white and lavender (#D0C6E1) backgrounds
- **Grid lines**: Purple borders
- **Text**: Clean sans-serif font
- **Padding**: Proper cell spacing

## Impact

This fix ensures all tables in your documents are properly formatted, regardless of which markdown table format is used. The original Market & Behavioral Research Report had multiple tables that are now correctly rendered.

## Status
✅ **Fixed and tested** - Tables now render properly in PDF output
