# Sparken PDF Branding - Figma Design Specifications

## 📐 Document Setup

### Page Size
- **Format:** US Letter
- **Dimensions:** 8.5" × 11" (612pt × 792pt)
- **Orientation:** Portrait

---

## 🎨 Brand Colors

### Primary Colors
```
Deep Cognitive Purple:  #5E5592  (RGB: 94, 85, 146)
Behavioral Yellow:      #F8D830  (RGB: 248, 216, 48)
Research Lime:          #D7DF5E  (RGB: 215, 223, 94)
Soft Cognitive Gray:    #F4F5F7  (RGB: 244, 245, 247)
Pure White:             #FFFFFF  (RGB: 255, 255, 255)
Text Black:             #030403  (RGB: 3, 4, 3)
```

### Usage Rules
- **Purple (#5E5592):** Headers, footers, brand identity, cover background
- **Yellow (#F8D830):** CTAs and key attention moments (use sparingly)
- **Lime (#D7DF5E):** Status, validation, success indicators
- **Gray (#F4F5F7):** Backgrounds, surfaces
- **White:** Text on dark backgrounds, clean surfaces

---

## 📄 COVER PAGE (Page 1)

### Background
- **Color:** Deep Cognitive Purple (#5E5592)
- **Size:** Full page (612pt × 792pt)
- **No margins**

### Logo
- **File:** `sparken-logo-horizontal-white.png`
- **Position:** Horizontally centered, 592pt from bottom (200pt from top)
- **Size:** 300pt width × 100pt height
- **Color:** White logo on purple background

### Title
- **Position:** Horizontally centered, 442pt from bottom (middle-upper area)
- **Font:** Helvetica Bold (or similar sans-serif)
- **Size:** 36pt
- **Color:** White (#FFFFFF)
- **Transform:** ALL UPPERCASE
- **Alignment:** Center
- **Letter Spacing:** 0 (normal)

### Subtitle (Optional)
- **Position:** Horizontally centered, 396pt from bottom (below title)
- **Font:** Helvetica Regular
- **Size:** 18pt
- **Color:** White (#FFFFFF)
- **Alignment:** Center
- **Text:** "Prepared by Sparken" or custom subtitle

### Tagline
- **Position:** Horizontally centered, 100pt from bottom
- **Font:** Helvetica Regular
- **Size:** 12pt
- **Color:** White (#FFFFFF)
- **Text:** "DIGITAL MARKETING AGENCY"
- **Alignment:** Center

---

## 📝 CONTENT PAGES (Page 2+)

### Page Margins
- **Top Margin:** 72pt (1 inch) *below header*
- **Bottom Margin:** 72pt (1 inch) *above footer*
- **Left Margin:** 72pt (1 inch)
- **Right Margin:** 72pt (1 inch)

---

## 🎯 HEADER (Content Pages)

### Purple Header Bar
- **Position:** Top of page, 0pt from top
- **Size:** 612pt width × 35pt height
- **Color:** Deep Cognitive Purple (#5E5592)
- **No stroke/border**

### Logo in Header
- **File:** `sparken-logo-horizontal-white.png`
- **Position:** 
  - X: 30pt from left edge
  - Y: 762pt from bottom (5pt from top of header bar)
- **Size:** 100pt width × 25pt height
- **Color:** White logo

---

## 👣 FOOTER (Content Pages)

### Footer Divider Line
- **Position:** 45pt from bottom
- **Start Point:** X: 50pt, Y: 45pt
- **End Point:** X: 562pt, Y: 45pt
- **Stroke:** 1.5pt
- **Color:** Deep Cognitive Purple (#5E5592) at 40% opacity
- **Style:** Solid line

### Page Number (Left Side)
- **Position:** 
  - X: 50pt from left
  - Y: 30pt from bottom
- **Font:** Helvetica Regular
- **Size:** 9pt
- **Color:** Deep Cognitive Purple (#5E5592)
- **Text Format:** "Page X of Y"

### Brand Name (Right Side)
- **Position:** 
  - X: 562pt from left (50pt from right edge)
  - Y: 30pt from bottom
- **Font:** Helvetica Bold
- **Size:** 10pt
- **Color:** Deep Cognitive Purple (#5E5592)
- **Text:** "Sparken"
- **Alignment:** Right-aligned

---

## 💧 WATERMARK (Content Pages)

### Watermark Pattern
- **Logo:** `sparken-logo-vertical-cropped.png`
- **Size per logo:** 120pt × 120pt
- **Spacing:** 180pt between logo centers (both horizontal and vertical)
- **Opacity:** 4% (very subtle)
- **Color:** Grayscale or purple tinted
- **Pattern:** Grid layout covering entire page
- **Layer:** Behind all content (lowest z-index)

### Grid Calculation
- **Columns:** ~4 logos across (spacing: 180pt)
- **Rows:** ~5 logos down (spacing: 180pt)
- **Starting offset:** -60pt (half logo size) to ensure edge coverage
- **Result:** Subtle repeated pattern across entire page

---

## 📊 TYPOGRAPHY SPECIFICATIONS

### Body Text
- **Font:** Helvetica or Helvetica Neue
- **Size:** 11pt
- **Line Height:** 16pt (1.45 line spacing)
- **Color:** Text Black (#030403)

### Headings

#### H1 - Main Heading
- **Font:** Helvetica Bold
- **Size:** 24pt
- **Color:** Deep Cognitive Purple (#5E5592)
- **Spacing Above:** 24pt
- **Spacing Below:** 12pt

#### H2 - Section Heading
- **Font:** Helvetica Bold
- **Size:** 18pt
- **Color:** Deep Cognitive Purple (#5E5592)
- **Spacing Above:** 20pt
- **Spacing Below:** 10pt

#### H3 - Subsection Heading
- **Font:** Helvetica Bold
- **Size:** 14pt
- **Color:** Deep Cognitive Purple (#5E5592)
- **Spacing Above:** 16pt
- **Spacing Below:** 8pt

---

## 📦 SPECIAL COMPONENTS

### Callout Box
- **Border Left:** 4pt solid
- **Border Color:** Behavioral Yellow (#F8D830)
- **Background:** Soft Cognitive Gray (#F4F5F7)
- **Padding:** 16pt all sides
- **Text Font:** Helvetica Regular
- **Text Size:** 11pt
- **Text Color:** Text Black (#030403)
- **Usage:** Important notes, tips, highlights

### Data Table
- **Header Row:**
  - Background: Deep Cognitive Purple (#5E5592)
  - Text Color: White (#FFFFFF)
  - Font: Helvetica Bold
  - Size: 11pt
  - Height: 30pt
  
- **Data Rows:**
  - Alternating backgrounds:
    - Odd rows: White (#FFFFFF)
    - Even rows: Soft Cognitive Gray (#F4F5F7)
  - Text Color: Text Black (#030403)
  - Font: Helvetica Regular
  - Size: 11pt
  - Row Height: 30pt
  - Cell Padding: 8pt horizontal, 6pt vertical
  
- **Borders:**
  - 1pt solid lines
  - Color: Deep Cognitive Purple (#5E5592) at 20% opacity

---

## 📏 LAYOUT MEASUREMENTS

### Safe Content Area (Content Pages)
```
Top:    107pt from page top (35pt header + 72pt margin)
Bottom: 122pt from page bottom (50pt footer + 72pt margin)
Left:   72pt from page edge
Right:  72pt from page edge

Content Width:  468pt (612 - 72 - 72)
Content Height: 563pt (792 - 107 - 122)
```

---

## 🎨 FIGMA LAYERS STRUCTURE

### Cover Page Frame
```
📄 Cover Page (612×792)
  ├─ 🟣 Background Rectangle (#5E5592)
  ├─ 🖼️ Logo Image (300×100, centered)
  ├─ 📝 Title Text (36pt, bold, white, uppercase)
  ├─ 📝 Subtitle Text (18pt, regular, white)
  └─ 📝 Tagline Text (12pt, regular, white)
```

### Content Page Frame
```
📄 Content Page (612×792)
  ├─ 💧 Watermark Group (4% opacity)
  │   └─ Repeated vertical logos in grid
  ├─ 🎯 Header Group
  │   ├─ Purple Rectangle (612×35)
  │   └─ White Logo (100×25)
  ├─ 📄 Content Area (468×563)
  │   ├─ Body text
  │   ├─ Headings
  │   ├─ Callout boxes
  │   └─ Tables
  └─ 👣 Footer Group
      ├─ Divider Line (1.5pt)
      ├─ Page Number (left)
      └─ Brand Name (right)
```

---

## 🖼️ ASSET REQUIREMENTS

### Logo Files Needed
1. **`sparken-logo-horizontal-white.png`**
   - White version of horizontal Sparken logo
   - Transparent background
   - High resolution (300 DPI minimum)
   - For headers and cover page

2. **`sparken-logo-vertical-cropped.png`**
   - Vertical Sparken logo
   - Transparent background
   - For watermark pattern

---

## 💡 DESIGN TIPS FOR FIGMA

### Auto Layout Recommendations
1. **Header Component:** Make it a reusable component with auto-layout
2. **Footer Component:** Make it a reusable component with variables for page numbers
3. **Callout Box:** Create as a component with auto-layout for flexible text
4. **Table Rows:** Use auto-layout for easy row additions

### Variables to Set Up
- **Colors:** All brand colors as color variables
- **Spacing:** 
  - Small: 8pt
  - Medium: 16pt
  - Large: 24pt
  - Section: 72pt

### Components to Create
1. Cover Page Template
2. Content Page Template
3. Header Component
4. Footer Component
5. H1, H2, H3 Text Styles
6. Body Text Style
7. Callout Box Component
8. Table Header Component
9. Table Row Component

### Text Styles to Define
- Cover Title (36pt Bold White)
- Cover Subtitle (18pt Regular White)
- Cover Tagline (12pt Regular White)
- H1 Purple (24pt Bold)
- H2 Purple (18pt Bold)
- H3 Purple (14pt Bold)
- Body (11pt Regular)
- Footer Small (9pt Regular)
- Footer Brand (10pt Bold)

---

## 🔍 QUALITY CHECKLIST

Before finalizing your Figma design, verify:
- ✅ All colors match exact hex codes
- ✅ Page size is exactly 612×792pt
- ✅ Header is exactly 35pt tall
- ✅ Logo in header is 100×25pt
- ✅ Logo on cover is 300×100pt
- ✅ Watermark is at 4% opacity
- ✅ All margins are 72pt (1 inch)
- ✅ Footer text is at 30pt from bottom
- ✅ Purple color (#5E5592) used consistently
- ✅ White logos on purple backgrounds
- ✅ Text hierarchy follows specifications

---

## 📤 EXPORT SETTINGS

For PDF export from Figma:
- **Format:** PDF
- **Resolution:** 300 DPI
- **Color Profile:** RGB (for digital) or CMYK (for print)
- **Flatten:** No (keep layers if possible)

---

## 🎯 KEY DESIGN PRINCIPLES

1. **Minimalist Header:** Only 35pt tall to avoid covering content
2. **Subtle Watermark:** 4% opacity ensures readability
3. **Consistent Purple:** Used for all brand touchpoints
4. **Professional Spacing:** 72pt margins create breathing room
5. **Clear Hierarchy:** Bold purple headings, regular black body text
6. **White Logo:** Always use white logo on purple backgrounds

---

Need help with any specific component or measurement? Let me know!
