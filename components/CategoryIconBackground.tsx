'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import {
  Music,
  Video,
  Mic2,
  Palette,
  Camera,
  Film,
  Radio,
  Keyboard,
  Headphones,
  Sparkles,
  Star,
  Heart,
  Zap,
  Wind,
  Cloud,
  Target,
  Shapes,
  Boxes,
  Award,
  Trophy,
} from 'lucide-react';

const icons = [
  Music,
  Video,
  Mic2,
  Palette,
  Camera,
  Film,
  Radio,
  Keyboard,
  Headphones,
  Sparkles,
  Star,
  Heart,
  Zap,
  Wind,
  Cloud,
  Target,
  Shapes,
  Boxes,
  Award,
  Trophy,
];

// Pre-generate scattered icons with consistent positions - evenly spaced grid with randomization
const generateScatteredIcons = () => {
  const icons = [];
  const cols = 10;
  const rows = 8;
  const cellWidth = 100 / cols;
  const cellHeight = 100 / rows;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Add randomness within each cell to avoid perfect grid
      const left = (col * cellWidth) + (Math.random() * cellWidth * 0.8);
      const top = (row * cellHeight) + (Math.random() * cellHeight * 0.8);
      
      icons.push({
        id: row * cols + col,
        IconIndex: (row * cols + col) % 20,
        left,
        top,
        size: Math.random() * 50 + 32, // 32-82px
        rotation: Math.random() * 360,
        opacity: Math.random() * 0.3 + 0.15, // 0.15-0.45 opacity
        delay: (row * cols + col) * 0.02,
      });
    }
  }
  
  return icons;
};

const SCATTERED_ICONS = generateScatteredIcons();

export default function CategoryIconBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  if (!mounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {SCATTERED_ICONS.map(({ id, IconIndex, left, top, size, rotation, opacity, delay }) => {
        const Icon = icons[IconIndex];
        return (
          <div
            key={id}
            className="absolute"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            }}
          >
            <Icon
              size={size}
              style={{
                opacity: opacity,
                animation: `float-${id % 3} 6s ease-in-out ${delay}s infinite`,
                color: isDark ? 'rgb(148, 163, 184)' : 'rgb(156, 163, 175)',
              }}
            />
          </div>
        );
      })}

      {/* Subtle overlay for readability */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark
            ? 'bg-gradient-to-b from-gray-950/30 via-transparent to-gray-950/30'
            : 'bg-gradient-to-b from-white/25 via-transparent to-white/25'
        }`}
      />

      <style>{`
        @keyframes float-0 {
          0%, 100% { transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(0px); }
          50% { transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(-30px); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(0px); }
          50% { transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(25px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(0px); }
          50% { transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(-25px); }
        }
      `}</style>
    </div>
  );
}
