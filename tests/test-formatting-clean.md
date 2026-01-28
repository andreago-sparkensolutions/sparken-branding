# Test Document for Formatting Fixes

This document tests the removal of markdown artifacts.

• --

## Section with Bold Text

This paragraph has **bold text** that should not show markdown markers in the final PDF.

The property has **Propiedad Privada** (fully titled).

• --

## Table Test

| Attribute | Summary |
|-----------|---------|
| Legal Status | **Propiedad Privada** (fully titled) |
| Financing | **Owner financing available** (terms negotiable) |
| Size | 20 hectares |

• --

## List with Bold Items

- **First item** with bold text
- Second item with **inline bold** text
- *Italic text* should also be cleaned
- `Code text` should have backticks removed

• --

## Conclusion

All **markdown markers** should be removed, including *italic*, **bold**, and `code` markers.

The document should have clean horizontal lines instead of bullet dashes.
