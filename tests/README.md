# Test Files

This folder contains test files and outputs used during development.

## Test Files

- **test-branding.md** - Test markdown for branding features
- **test-python-pdf.md** - Test markdown for Python PDF generation
- **test-markdown-conversion.js** - JavaScript test script for markdown conversion

## Test Outputs

- **test-output.pdf** - General test output
- **test-white-logo.pdf** - Test output for white logo testing
- **python-test.pdf** - Python system test output

## Running Tests

To test the PDF generation system:

```bash
# Test with the Python system
npm run convert test-branding.md output.pdf

# Test markdown conversion
node test-markdown-conversion.js
```

## Note

These files are for testing purposes only and should not be used in production. They help verify that branding, formatting, and PDF generation work correctly.
