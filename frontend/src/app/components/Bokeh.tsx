const ORBS = [
  {
    top: '12%',
    left: '5%',
    size: 110,
    color: 'var(--bokeh-1)',
    opacity: 0.2,
    duration: 12,
    delay: 0,
  },
  {
    top: '7%',
    left: '76%',
    size: 78,
    color: 'var(--bokeh-2)',
    opacity: 0.16,
    duration: 9,
    delay: 1.5,
  },
  {
    top: '36%',
    left: '90%',
    size: 54,
    color: 'var(--bokeh-3)',
    opacity: 0.14,
    duration: 7,
    delay: 3,
  },
  {
    top: '55%',
    left: '7%',
    size: 92,
    color: 'var(--bokeh-4)',
    opacity: 0.18,
    duration: 14,
    delay: 2,
  },
  {
    top: '76%',
    left: '68%',
    size: 120,
    color: 'var(--bokeh-5)',
    opacity: 0.2,
    duration: 11,
    delay: 4.5,
  },
  {
    top: '86%',
    left: '24%',
    size: 62,
    color: 'var(--bokeh-2)',
    opacity: 0.15,
    duration: 8,
    delay: 6,
  },
  {
    top: '28%',
    left: '44%',
    size: 42,
    color: 'var(--bokeh-1)',
    opacity: 0.13,
    duration: 10,
    delay: 2.8,
  },
];

export default function Bokeh() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[2] overflow-hidden">
      {ORBS.map((orb, index) => (
        <div
          key={index}
          className="bokeh-orb"
          style={{
            top: orb.top,
            left: orb.left,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: `blur(${Math.round(orb.size * 0.3)}px)`,
            opacity: orb.opacity,
            animationDuration: `${orb.duration}s`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
