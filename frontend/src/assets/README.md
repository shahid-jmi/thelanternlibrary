# Assets

Static images and fonts that ship with the app bundle. Anything placed here is
processed by Vite (hashed, optimized) — this is different from a `public/`
folder, which is copied as-is and unprocessed. Prefer this folder unless a
file genuinely needs a stable, un-hashed URL (e.g. `favicon.ico`).

## Structure

- `images/hero/` — the homepage hero photo(s).
- `images/offerings/` — the 8 "What We Offer" tiles (books, postcards, letters, etc).
- `images/mosaic/` — the 4 "A Space Built on Feeling" mosaic tiles.
- `images/products/` — fallback/placeholder product photography not tied to a
  specific book/product record (per-product images come from the API instead).
- `icons/` — custom SVG icons that aren't covered by `lucide-react`. Most
  icons in this project should keep using `lucide-react` — only drop a file
  here if you need a one-off custom mark.
- `fonts/` — local font files, if the project ever moves off the Google
  Fonts CDN import in `src/styles/fonts.css`. Empty for now.

## How to use an image

Import it like any module and pass it to `ImageTile` (see
`src/app/components/ImageTile.tsx`), which handles the duotone photo
treatment, hover zoom, and warm overlay automatically:

```tsx
import heroPhoto from '../../assets/images/hero/reading-room.jpg';
import ImageTile from '../components/ImageTile';

<ImageTile src={heroPhoto} alt="The reading room in Srinagar" className="aspect-[4/3] w-full" />;
```

Until a real photo is dropped in, `ImageTile` renders its `placeholder`
line-art fallback — so it's safe to add real images incrementally, section
by section, without breaking the layout.

## Naming

Use lowercase kebab-case file names (`reading-room.jpg`, `dried-flowers.jpg`),
and prefer `.webp` for photos where possible — smaller bundle, same quality.
