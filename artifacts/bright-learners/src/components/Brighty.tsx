import { motion } from 'framer-motion';

interface BrightyProps {
  celebrating?: boolean;
  size?: number;
  className?: string;
}

export function Brighty({ celebrating = false, size = 120, className = '' }: BrightyProps) {
  return (
    <motion.div
      className={className}
      animate={celebrating ? {
        scale: [1, 1.15, 1, 1.1, 1],
        rotate: [0, -5, 5, -3, 0],
      } : {
        y: [0, -8, 0],
      }}
      transition={celebrating ? {
        duration: 0.6,
        ease: "easeInOut",
      } : {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body */}
        <ellipse cx="60" cy="70" rx="35" ry="40" fill="#C17817" />
        
        {/* Head */}
        <circle cx="60" cy="45" r="32" fill="#D4941A" />
        
        {/* Left wing */}
        <motion.ellipse
          cx={celebrating ? "28" : "32"}
          cy="70"
          rx="14"
          ry="22"
          fill="#A66314"
          animate={celebrating ? {
            cx: [32, 24, 32],
            rotate: [0, -15, 0],
          } : undefined}
          transition={{ duration: 0.6 }}
        />
        
        {/* Right wing */}
        <motion.ellipse
          cx={celebrating ? "92" : "88"}
          cy="70"
          rx="14"
          ry="22"
          fill="#A66314"
          animate={celebrating ? {
            cx: [88, 96, 88],
            rotate: [0, 15, 0],
          } : undefined}
          transition={{ duration: 0.6 }}
        />
        
        {/* Left eye white */}
        <circle cx="48" cy="42" r="12" fill="white" />
        {/* Right eye white */}
        <circle cx="72" cy="42" r="12" fill="white" />
        
        {/* Left eye yellow */}
        <circle cx="48" cy="42" r="9" fill="#FFD700" />
        {/* Right eye yellow */}
        <circle cx="72" cy="42" r="9" fill="#FFD700" />
        
        {/* Left pupil */}
        <motion.circle
          cx="48"
          cy="42"
          r={celebrating ? "5" : "4"}
          fill="#1a1a1a"
          animate={celebrating ? {
            scale: [1, 1.3, 1],
          } : undefined}
          transition={{ duration: 0.4 }}
        />
        {/* Right pupil */}
        <motion.circle
          cx="72"
          cy="42"
          r={celebrating ? "5" : "4"}
          fill="#1a1a1a"
          animate={celebrating ? {
            scale: [1, 1.3, 1],
          } : undefined}
          transition={{ duration: 0.4 }}
        />
        
        {/* Beak */}
        <path
          d="M 60 50 L 65 58 L 55 58 Z"
          fill="#FF8C00"
        />
        
        {/* Eyebrows (happy when celebrating) */}
        {celebrating ? (
          <>
            <path
              d="M 42 36 Q 48 34 54 36"
              stroke="#8B5A00"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 66 36 Q 72 34 78 36"
              stroke="#8B5A00"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : (
          <>
            <path
              d="M 42 38 Q 48 36 54 38"
              stroke="#8B5A00"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 66 38 Q 72 36 78 38"
              stroke="#8B5A00"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}
        
        {/* Feet */}
        <ellipse cx="50" cy="108" rx="8" ry="6" fill="#FF8C00" />
        <ellipse cx="70" cy="108" rx="8" ry="6" fill="#FF8C00" />
      </svg>
    </motion.div>
  );
}
