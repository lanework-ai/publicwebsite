'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AnimatedIconProps {
  icon: LucideIcon;
  className?: string;
  size?: number;
  variant?: 'default' | 'pulse' | 'bounce' | 'spin' | 'float';
}

export default function AnimatedIcon({
  icon: Icon,
  className = '',
  size = 24,
  variant = 'default'
}: AnimatedIconProps) {
  const getAnimationProps = () => {
    switch (variant) {
      case 'pulse':
        return {
          animate: { scale: [1, 1.1, 1] },
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        };
      case 'bounce':
        return {
          animate: { y: [0, -10, 0] },
          transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        };
      case 'spin':
        return {
          animate: { rotate: 360 },
          transition: { duration: 3, repeat: Infinity, ease: "linear" }
        };
      case 'float':
        return {
          animate: { y: [0, -5, 0] },
          transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      className={`inline-flex ${className}`}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      {...getAnimationProps()}
    >
      <Icon size={size} className="drop-shadow-lg" />
    </motion.div>
  );
}
