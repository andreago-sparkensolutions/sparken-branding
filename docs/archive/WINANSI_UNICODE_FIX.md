# WinAnsi Encoding Fix - Unicode Character Handling

## The Error

```
WinAnsi cannot encode "→" (0x2192)
```

## Root Cause

The TypeScript PDF generator (`pdf-lib`) uses **WinAnsi encoding** which only supports:
- Basic Latin characters (A-Z, a-z, 0-9)
- Common punctuation
- Extended ASCII (characters 0-255)

**It does NOT support:**
- Unicode arrows: `→`, `←`, `↑`, `↓`, `⇒`, `⇐`
- Special symbols beyond ASCII range
- Emojis
- Many international characters

## Solution

### 1. Comprehensive Unicode Replacement

Instead of removing Unicode characters, we now **replace them with ASCII equivalents**:

```typescript
.replace(/→/g, '->')          // Right arrow
.replace(/←/g, '<-')          // Left arrow  
.replace(/↑/g, '^')           // Up arrow
.replace(/↓/g, 'v')           // Down arrow
.replace(/⇒/g, '=>')          // Double right arrow
.replace(/⇐/g, '<=')          // Double left arrow
.replace(/•/g, '*')           // Bullet point
.replace(/…/g, '...')         // Ellipsis
```

### 2. Order Matters

**CRITICAL**: Unicode replacements must happen **BEFORE** the catch-all removal:

```typescript
// ✅ CORRECT ORDER:
.replace(/→/g, '->')          // Replace specific Unicode
.replace(/…/g, '...')         // Replace more Unicode
.replace(/[^\x00-\xFF]/g, '') // Remove any remaining

// ❌ WRONG ORDER:
.replace(/[^\x00-\xFF]/g, '') // Removes everything including →
.replace(/→/g, '->')          // Never runs because → already gone
```

### 3. Applied in Two Places

**A. API Route (`app/api/brand/route.ts`)**
- Updated `sanitizeText()` function
- Applied to markdown content before PDF generation
- Applied to titles and subtitles

**B. Markdown Processing**
- Sanitize the entire markdown text after cleaning
- Ensures all content is WinAnsi-safe

## Character Mapping Reference

| Unicode | ASCII | Name |
|---------|-------|------|
| → | `->` | Right arrow |
| ← | `<-` | Left arrow |
| ↑ | `^` | Up arrow |
| ↓ | `v` | Down arrow |
| ⇒ | `=>` | Double right arrow |
| ⇐ | `<=` | Double left arrow |
| • | `*` | Bullet point |
| … | `...` | Ellipsis |
| " | `"` | Smart quote left |
| " | `"` | Smart quote right |
| ' | `'` | Smart apostrophe left |
| ' | `'` | Smart apostrophe right |
| — | `-` | Em dash |
| – | `-` | En dash |

## Why This Approach?

### Preserve Meaning
```
Before: "learn → explore → contact"
After:  "learn -> explore -> contact"  ✅ Meaningful
```

vs.

```
Before: "learn → explore → contact"
After:  "learn  explore  contact"      ❌ Lost meaning
```

### Better UX
- Arrows become ASCII arrows (readable)
- Bullets become asterisks (still bullets)
- Ellipsis becomes three dots (same meaning)

## Files Modified

### `app/api/brand/route.ts` ✅
1. Enhanced `sanitizeText()` function with Unicode mapping
2. Applied sanitization to markdown content
3. Ensures all text is WinAnsi-compatible

## Testing

### Before (Failed)
```
Error: WinAnsi cannot encode "→" (0x2192)
```

### After (Success)
```
Text renders as: "learn -> explore -> contact"
PDF generates successfully ✅
```

## Common Unicode Characters in Your Documents

Based on your files, these characters appear:
- `→` - Right arrow (navigation, flows)
- `—` - Em dash (emphasis)
- `–` - En dash (ranges)
- `"` `"` - Smart quotes
- `'` `'` - Smart apostrophes

All now properly handled! ✅

## Vercel Compatibility

✅ **Pure TypeScript** - No external dependencies
✅ **Works on Vercel** - Serverless compatible
✅ **No Python needed** - Uses pdf-lib
✅ **Production ready** - Handles all common Unicode

## Edge Cases Handled

1. **Multiple arrows in sequence**: `→→→` becomes `->->->`
2. **Mixed Unicode**: `"learn → explore"` becomes `"learn -> explore"`
3. **Already ASCII**: No change to existing ASCII text
4. **Unknown Unicode**: Removed by catch-all at end

## Deploy

```bash
git add .
git commit -m "Fix WinAnsi encoding error by replacing Unicode arrows and symbols"
git push origin master
```

## Result

**No more WinAnsi encoding errors!** 🎉

All Unicode characters are now properly converted to ASCII equivalents before PDF generation.
