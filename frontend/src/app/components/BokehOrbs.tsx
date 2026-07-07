import { motion } from 'motion/react';

interface Orb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  blur: number;
  duration: number;
  delay: number;
}

export default function BokehOrbs({ isDark = false }: { isDark?: boolean }) {
  const lightColors = [
    'rgba(255,210,130,',
    'rgba(255,200,100,',
    'rgba(240,180,90,',
    'rgba(255,220,150,',
    'rgba(210,170,80,',
  ];

  const darkColors = [
    'rgba(200,150,60,',
    'rgba(180,130,50,',
    'rgba(160,110,40,',
    'rgba(210,160,70,',
    'rgba(190,140,55,',
  ];

  const colors = isDark ? darkColors : lightColors;
  const opacityRange = isDark ? [0.16, 0.24] : [0.13, 0.22];

  const generateOrbs = (): Orb[] => {
    const orbs: Orb[] = [];
    const orbCount = 12;

    for (let i = 0; i < orbCount; i++) {
      orbs.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 300 + 150,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * (opacityRange[1] - opacityRange[0]) + opacityRange[0],
        blur: Math.random() * 60 + 80,
        duration: Math.random() * 25 + 35,
        delay: Math.random() * -20,
      });
    }
    return orbs;
  };

  const orbs = generateOrbs();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[2]" style={{ mixBlendMode: 'screen' }}>
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            backgroundColor: `${orb.color}${orb.opacity})`,
            filter: `blur(${orb.blur}px)`,
          }}
          animate={{
            x: [0, Math.random() * 40 - 20, Math.random() * 30 - 15, 0],
            y: [0, Math.random() * 50 - 25, Math.random() * 40 - 20, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
