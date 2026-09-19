import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ReactNode } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface SubjectCardProps {
  title: string;
  href: string;
  gradient: string;
  icon: ReactNode;
  description?: string;
}

export function SubjectCard({ title, href, gradient, icon, description }: SubjectCardProps) {
  const { playSound } = useSettings();

  return (
    <Link href={href}>
      <motion.div
        className={`relative overflow-hidden rounded-3xl shadow-xl cursor-pointer ${gradient} h-40 flex flex-col items-center justify-center text-white p-6`}
        whileHover={{ scale: 1.05, rotate: 1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => playSound('click')}
        data-testid={`card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-3"
        >
          {icon}
        </motion.div>
        <h3 className="text-2xl font-black text-center mb-1">{title}</h3>
        {description && (
          <p className="text-sm opacity-90 text-center font-semibold">{description}</p>
        )}
        
        {/* Decorative sparkles */}
        <div className="absolute top-3 right-3 w-3 h-3 bg-white/30 rounded-full animate-pulse" />
        <div className="absolute bottom-4 left-4 w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      </motion.div>
    </Link>
  );
}
