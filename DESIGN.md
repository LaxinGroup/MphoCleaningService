# Visual Design & Branding Specification

This design document outlines the official brand identity, color palette, typography guidelines, and content structure for **MUPHO THE CLEANER** web application. Use these specifications to style the Next.js frontend using Tailwind CSS.

---

## 1. Core Brand Personality
- **Aesthetic:** Clean, professional, trustworthy, accessible, vibrant.
- **Slogan:** "Let us do the dirty work!" / "Clean Spaces, Happy Lives"

---

## 2. Color Palette
The brand utilizes a high-contrast palette consisting of a primary deep blue, an energetic accent yellow, clean whites, and supporting tones for secondary categories.

### Primary Brand Colors
- **Navy/Deep Blue:** `#033B76` (Used for primary text, main header backgrounds, and professional branding elements)
- **Vibrant Yellow:** `#F9C80E` (Used for accents, highlighting price headers, section dividers, and key calls-to-action)
- **Pure White:** `#FFFFFF` (Used as the core canvas background for clean contrast)

### UI Utility Colors (From Pricing Categories)
- **Laundry Category Blue:** `#0082C8` (Bright primary blue variant used for icons and section boxes)
- **Windows Category Dark Blue:** `#1A365D` (Darker slate blue used for structural grid panels)
- **Floor/Upholstery Category Ochre:** `#C68A14` (Deep warm gold used as secondary categorization)
- **Gardening Category Green:** `#316A3A` (Deep forest green used specifically for lawn/yard sections)
- **Alert/Important Yellow:** `#FFF200` (Ultra-bright neon yellow background blocks for drop-off details)

---

## 3. Typography & Font Recommendations

The marketing materials use highly legible, clean sans-serif typefaces to communicate clarity and structure. 

### Typography Hierarchy

#### 1. Display Headings (Logo & Section Headers)
* **Style:** Geometric, Bold, Blocky Sans-Serif
* **Characteristics:** High visual weight, uppercase, crisp tracking.
* **Tailwind Alternative:** `font-sans font-black tracking-wide uppercase`
* **Google Font Recommendation:** **`Montserrat`** (Weight: 900) or **`Poppins`** (Weight: 800)

#### 2. Body Text & List Elements
* **Style:** Highly readable, clean, standard Sans-Serif
* **Characteristics:** Medium tracking, regular to medium weight. Used for service descriptions, addresses, and lists.
* **Tailwind Alternative:** `font-sans font-normal antialiased`
* **Google Font Recommendation:** **`Inter`** or **`Open Sans`**

#### 3. Accent Scripts (Micro-copy & Taglines)
* **Style:** Organic, handwritten, casual cursive script
* **Characteristics:** Slanted, friendly, flowing line thickness. Used for phrases like *"Clean Spaces, Happy Lives"* and *"Let us do the dirty work!"*
* **Tailwind Alternative:** `font-script tracking-normal`
* **Google Font Recommendation:** **`Caveat`** or **`Architects Daughter`**

---

## 4. UI Layout & Component Guidelines

### Card Layouts
- **Service Cards:** Use a modern, light-themed grid panel (`bg-white`) bordered or accented by thin yellow (`#F9C80E`) or blue line-dividers.
- **Section Headers within Cards:** Each main service category header should have a colored pill background matching its utility category color with white bold uppercase text inside.

### Buttons & Interactivity
- **Primary CTA (e.g., "Book Now"):** Solid `#F9C80E` background with dark bold navy text. Elevate or transition smoothly on hover.
- **Secondary CTA:** Outline style with `#033B76` borders.

### Contact Blocks
- Keep the contact blocks prominent using a high-visibility container matching the bottom banner: a thick deep blue block with large white font, and contrasting yellow accents for phone numbers and locations.
