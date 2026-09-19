import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Brighty } from '@/components/Brighty';
import { Loader2, Sparkles, BookOpen } from 'lucide-react';

export default function Splash() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-[100dvh] relative overflow-hidden bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300">
      {/* Floating elements */}
      <motion.div
        className="absolute top-20 left-[10%]"
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Sparkles className="w-12 h-12 text-white/60" />
      </motion.div>
      
      <motion.div
        className="absolute top-40 right-[15%]"
        animate={{ y: [0, 15, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
      >
        <BookOpen className="w-16 h-16 text-white/50" />
      </motion.div>

      <motion.div
        className="absolute bottom-32 left-[20%]"
        animate={{ y: [0, -25, 0], x: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      >
        <Sparkles className="w-10 h-10 text-white/40" />
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
        >
          <Brighty size={180} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center mt-8"
        >
          <h1 className="text-5xl md:text-6xl font-black text-white mb-3 drop-shadow-lg">
            Adaptive Learning Support
          </h1>
          <p className="text-3xl font-bold text-white/95 drop-shadow-md">
            For Bright Learners
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12"
        >
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </motion.div>

        {/* Animated stars */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 text-yellow-200"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            ⭐
          </motion.div>
        ))}
      </div>
    </div>
  );
}
