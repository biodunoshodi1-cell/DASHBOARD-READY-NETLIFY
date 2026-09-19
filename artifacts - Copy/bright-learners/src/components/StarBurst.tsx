import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

interface BurstStar {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
  color: string;
}

// Radiating star-burst celebration, shown when a learner does really well
// (e.g. finishing the Math Sprint warm-up with half the questions or more
// correct). Distinct from ConfettiEffect's falling confetti — these stars
// explode outward from the center of the screen and fade.
export function StarBurst({ trigger }: { trigger: boolean }) {
  const [stars, setStars] = useState<BurstStar[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const colors = ['#FFD700', '#FFA500', '#FF6B35', '#FFEC8B', '#FFFFFF'];
    const count = 28;
    const newStars: BurstStar[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      angle: (360 / count) * i + (Math.random() * 10 - 5),
      distance: 180 + Math.random() * 160,
      size: 16 + Math.random() * 20,
      delay: Math.random() * 0.15,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setStars(newStars);
    const timer = setTimeout(() => setStars([]), 2200);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <AnimatePresence>
        {stars.map((star) => {
          const radians = (star.angle * Math.PI) / 180;
          const x = Math.cos(radians) * star.distance;
          const y = Math.sin(radians) * star.distance;
          return (
            <motion.div
              key={star.id}
              className="absolute"
              initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
              animate={{ x, y, scale: [0, 1.3, 1], opacity: [1, 1, 0], rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, delay: star.delay, ease: 'easeOut' }}
            >
              <Star
                style={{ width: star.size, height: star.size, color: star.color }}
                fill={star.color}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
