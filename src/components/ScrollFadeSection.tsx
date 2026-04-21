import React, { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollFadeSectionProps {
  children: ReactNode;
  className?: string;
}

/**
 * A wrapper component that fades children in and out based on their
 * scroll position relative to the viewport.
 */
export default function ScrollFadeSection({ children, className }: ScrollFadeSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end", "start start", "end start"]
  });

  // start end: top of element enters bottom of viewport (0)
  // end end: bottom of element enters bottom of viewport
  // start start: top of element reaches top of viewport
  // end start: bottom of element leaves top of viewport (1)

  // Opacity: 0 when entering, 1 when mostly visible, 0 when leaving
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );

  // Vertical movement: 40px when entering, 0 at center, -40px when leaving
  const y = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [40, 0, 0, -40]
  );

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
