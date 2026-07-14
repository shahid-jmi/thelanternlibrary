Lantern Library — Complete Design Prompt
Brand Identity
Brand Name: Lantern Library
Brand Voice: Warm, calm, personal, passionate about books. Never corporate, never aggressive.
Concept: A curated online book catalog that feels like a physical bookstore — not a marketplace. The design should feel like you are browsing a trusted, intimate space.

Overall Aesthetic
The website follows a vintage editorial aesthetic — think old paper, candlelight, worn book covers, and the quiet atmosphere of an antique library. Every design decision should serve this feeling.
The three core layers that build this aesthetic are:

1. Paper-like background — warm, uneven, slightly blotchy color that mimics aged parchment or old paper. Not a flat color, not a gradient — something that breathes and has variation across the surface.
2. Grain texture — a fractalNoise SVG grain overlaid on top of the background at 0.82 opacity, blended using mix-blend-mode: multiply. This is the most critical layer. It must be clearly visible and tactile — not subtle. It should feel like the surface of old paper or aged film. Technical values: baseFrequency: 0.85, numOctaves: 4, stitchTiles: stitch, background-size 200px x 200px.
3. Bokeh orbs — soft, blurry, warm glowing circles of light scattered across the background. They use mix-blend-mode: screen so they glow into the surface rather than sitting on top. They animate slowly with a gentle floating drift — subtle, not distracting. They reference the brand name directly — Lantern Library — as if candlelight or lantern light is softly illuminating the page. Orb colors are warm amber and gold tones. They vary in size, opacity, blur intensity, and animation duration so they feel organic and not mechanical.
4. Vignette — a dark radial gradient from transparent at the center to a deep warm brown at the edges. This gives the page depth and an aged, worn feeling — like the corners of an old photograph.

Color System
Light Mode
ElementValueBase background#e8d9bcRadial variation 1#f0e5cc at 25% 20%Radial variation 2#d4bf9a at 75% 75%Radial variation 3#e0ccaa at 50% 5%Vignette colorrgba(100, 65, 20, 0.38)Primary text#2e1a08Secondary text#2e1a08 at reduced opacityDividers / accents#9a7040Card backgroundrgba(255, 245, 225, 0.5)Card borderrgba(100, 65, 20, 0.22)Button borderrgba(80, 45, 10, 0.45)Bokeh orb colorsWarm amber golds — rgba(255,210,130), rgba(255,200,100), rgba(240,180,90), rgba(255,220,150), rgba(210,170,80)Bokeh opacity range0.13 to 0.22Icon / logo color#7a4f1a
The light mode should feel like aged parchment on a warm afternoon — creamy, soft, slightly uneven. Not bright white. Not flat beige. Something that has lived in.

Dark Mode
ElementValueBase background#2a2018Radial variation 1#382c1e at 30% 20%Radial variation 2#1a1208 at 70% 75%Radial variation 3#302418 at 50% 5%Vignette colorrgba(5, 2, 0, 0.62)Primary text#e8d5a8Secondary text#e8d5a8 at reduced opacityDividers / accents#c09050Card backgroundrgba(255, 220, 140, 0.06)Card borderrgba(200, 160, 80, 0.20)Button borderrgba(200, 160, 80, 0.40)Bokeh orb colorsDeeper ambers — rgba(200,150,60), rgba(180,130,50), rgba(160,110,40), rgba(210,160,70), rgba(190,140,55)Bokeh opacity range0.16 to 0.24Icon / logo color#c09050
The dark mode should feel like a library at night, lit only by lantern light — deep, warm, intimate. Not cold black. Not navy. A rich, dark brown that feels like aged wood and ink.

Typography
Font family: Georgia, serif (or a premium alternative like Cormorant Garamond, EB Garamond, or Playfair Display)
No sans-serif fonts anywhere in the UI. Every element — headings, body, labels, buttons, captions — uses the serif stack. This is non-negotiable for the vintage feel.
ElementSizeStyleTrackingBrand name36–52pxRegular 4000.06–0.08emSection headings24–30pxRegular 4000.04emBody text15–16pxRegular 400normalLabels / badges9–11pxUppercase0.25–0.35emTagline11–13pxItalic0.07–0.08emButtons10–13pxUppercase0.15–0.18emAuthor namesanyItalicslight
Text color in light mode: #2e1a08 — dark warm brown, never pure black.
Text color in dark mode: #e8d5a8 — warm cream, never pure white.

Cards — Book Cards
Cards are the primary UI component since the website is a catalog.

Shape: Slightly rounded corners — border-radius: 3px. Not pill-shaped, not sharp 0px. Just a hint of rounding.
Background: Semi-transparent warm tint — light mode rgba(255,245,225,0.5), dark mode rgba(255,220,140,0.06). Barely visible, just enough to lift the card off the background.
Border: Thin, aged — light mode rgba(100,65,20,0.22), dark mode rgba(200,160,80,0.20). Always 0.5px. Never 1px or thicker.
No glassmorphism. No backdrop-filter blur. No glowing white borders. No box shadows that feel digital or modern. The card should feel like it belongs to the paper, not floating above a screen.
Book cover image takes up the top portion of the card. Consistent aspect ratio across all cards.
Card content: Title in serif, author in serif italic, price, availability status.

Buttons

Font: Georgia serif, uppercase, wide letter-spacing 0.15–0.18em
Background: transparent
Border: 0.5px solid — warm brown in light mode, warm gold in dark mode
Border-radius: 2px — barely rounded, almost sharp
No filled buttons anywhere. All outline style.
Hover state: very subtle background fill — rgba of the border color at low opacity

Dividers & Decorative Elements
Use thin decorative dividers between sections — not plain horizontal rules. Options:

A line with a small diamond shape in the center
A line that fades from transparent → color → transparent
Small ornamental marks

These add to the editorial, vintage feel without being heavy.

What to Avoid Completely

Glassmorphism — backdrop-filter, frosted glass, glowing white borders
Sans-serif fonts — no Inter, no Roboto, no system UI fonts
Pure black (#000000) or pure white (#ffffff) anywhere
Flat single-color backgrounds with no texture
Rounded corners larger than 4px on cards and buttons
Drop shadows that feel digital or modern
Bright, saturated colors
Gradient fills on buttons or cards
Any UI pattern that feels like a SaaS app, e-commerce platform, or tech product

The Feeling Test
Before finalizing any design decision, ask: does this feel like it belongs in a candlelit library?
If yes — ship it.
If no — remove it.
