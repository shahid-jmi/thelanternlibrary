export default function GrainTexture() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1]" style={{ mixBlendMode: 'multiply', opacity: 0.82 }}>
      <svg className="w-full h-full">
        <filter id="grainFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={4}
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grainFilter)" />
      </svg>
    </div>
  );
}
