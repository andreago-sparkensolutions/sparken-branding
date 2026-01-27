# Developer Quick Reference - PDF Cleaning System

## Quick Start

### Test the Cleaning Utility
```bash
# Standalone test
echo "**[TITLE](#link)**
-- 1 of 5 --
Content" | python3 python/clean_pdf_text.py -

# With file
python3 python/clean_pdf_text.py input.txt > cleaned.txt

# In Python
from clean_pdf_text import clean_pdf_artifacts
result = clean_pdf_artifacts(text)
```

### Add New Cleaning Pattern
```python
# Edit python/clean_pdf_text.py

# Option 1: In the initial multiline pass (before line processing)
text = re.sub(r'your_pattern', r'replacement', text, flags=re.MULTILINE)

# Option 2: In the line-by-line processing
if re.match(r'your_pattern', stripped):
    continue  # Skip this line
```

## Common Patterns

### Remove entire lines
```python
if re.match(r'^--\s*\d+\s+of\s+\d+\s*--$', stripped):
    continue
```

### Replace text
```python
cleaned = re.sub(r'pattern', r'replacement', stripped)
```

### Clean multiline before processing
```python
text = re.sub(r'multi\nline\npattern', r'replacement', text, flags=re.MULTILINE)
```

## Integration Points

### 1. Python Bridge (`lib/python-bridge.ts`)
```typescript
// Cleaning happens here automatically
async function cleanPdfArtifacts(content: string): Promise<string>

// Called before PDF generation
export async function generatePythonPDF(
  markdownContent: string,
  options: PythonPDFOptions = {}
): Promise<Uint8Array>
```

### 2. API Route (`app/api/brand/route.ts`)
```typescript
// No changes needed - automatically uses cleaning
// via generatePythonPDF()
```

## Testing Checklist

When adding new patterns:

- [ ] Test with sample content containing artifact
- [ ] Verify artifact is removed
- [ ] Verify actual content is preserved
- [ ] Test that markdown structure is intact
- [ ] Check that tables still work
- [ ] Verify lists are preserved
- [ ] Run full PDF generation pipeline
- [ ] Check final PDF output

## Debugging

### Enable verbose logging
```typescript
// In python-bridge.ts
console.log('Original content:', markdownContent);
console.log('Cleaned content:', cleanedContent);
```

### Check Python stderr
```bash
# Run with stderr visible
python3 python/clean_pdf_text.py test.txt 2>&1
```

### Test regex patterns
```python
# In Python REPL
import re
text = "**[TITLE\n1](#link)**"
result = re.sub(r'\*\*\[([^\]]+?)\n+([^\]]*?)\]\([^\)]+?\)\*\*', r'\1 \2', text, flags=re.MULTILINE)
print(result)  # Should be: TITLE 1
```

## Common Issues

### Pattern not matching
- Check flags (MULTILINE, DOTALL)
- Test pattern in isolation
- Print intermediate results

### Content being removed
- Make pattern more specific
- Add negative lookahead/lookbehind
- Test with edge cases

### Fallback triggering
- Check Python script errors
- Verify script is executable
- Check for encoding issues

## Performance

Typical processing time:
- Small doc (< 10KB): ~50ms
- Medium doc (10-100KB): ~150ms  
- Large doc (> 100KB): ~300ms

If slower:
- Check regex complexity (avoid nested quantifiers)
- Profile with Python's `cProfile`
- Consider caching cleaned content

## Code Style

### Python
```python
def clean_something(text):
    """
    Brief description
    
    Args:
        text: Description
    
    Returns:
        Cleaned text
    """
    # Descriptive comments
    pattern = r'...'  # Explain complex regex
    return re.sub(pattern, r'', text)
```

### TypeScript
```typescript
/**
 * Brief description
 * 
 * @param content - Description
 * @returns Cleaned content
 */
async function cleanSomething(content: string): Promise<string> {
  // Descriptive comments
  return cleaned;
}
```

## Regex Patterns Reference

Common patterns used:

```python
# Match page markers
r'^--\s*\d+\s+of\s+\d+\s*--$'

# Match footer text  
r'^Page\s+\d+\s+of\s+\d+\s+\w+\s*$'

# Match link wrappers
r'\*\*\[([^\]]+?)\]\([^\)]+?\)\*\*'

# Match standalone symbols
r'^#{2,}$'

# Match trailing numbers
r'\s+\d+\s*$'

# Match HTML entities
r'&amp;' → '&'
r'&nbsp;' → ' '
```

## File Locations

```
python/
  ├── clean_pdf_text.py         ← Main cleaning utility
  ├── sparken_pdf_generator.py  ← Receives cleaned content
  ├── components.py             ← PDF components
  └── brand_constants.py        ← Brand definitions

lib/
  ├── python-bridge.ts          ← Cleaning integration
  └── pdf-branding.ts           ← TypeScript branding

app/api/brand/
  └── route.ts                  ← API endpoint
```

## Documentation

- `PDF_FORMATTING_FIXES.md` - Technical details
- `FORMATTING_QUICK_FIX.md` - User guide
- `BEFORE_AFTER_COMPARISON.md` - Examples
- `SYSTEM_ARCHITECTURE.md` - System flow
- `IMPLEMENTATION_CHECKLIST.md` - Completion status

## Emergency Rollback

If cleaning causes issues:

```typescript
// In lib/python-bridge.ts, comment out cleaning call:
export async function generatePythonPDF(...) {
  // const cleanedContent = await cleanPdfArtifacts(markdownContent);
  const cleanedContent = markdownContent; // Use original
  
  // ... rest of function
}
```

## Support

If you need help:
1. Check this quick reference
2. Review `PDF_FORMATTING_FIXES.md`
3. Test cleaning utility standalone
4. Check logs for errors
5. Add debug logging

## Best Practices

1. **Test patterns before deploying**
2. **Make patterns specific** (avoid false positives)
3. **Preserve actual content** (only remove artifacts)
4. **Log warnings** (for debugging)
5. **Fail gracefully** (fallback to original)
6. **Document patterns** (explain complex regex)
7. **Keep it fast** (avoid expensive operations)

---

**Remember**: The goal is to remove PDF artifacts while preserving all actual content!
