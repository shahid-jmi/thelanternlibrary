const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(#g)'/></svg>`;

export default function GrainTexture() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[51]"
      style={{
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}")`,
        backgroundSize: '200px 200px',
        mixBlendMode: 'multiply',
        opacity: 0.82,
      }}
    />
  );
}
