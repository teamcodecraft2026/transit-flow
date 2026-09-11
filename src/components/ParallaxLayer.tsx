import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** How far the layer drifts, in px, across the section's scroll range. */
  distance?: number;
};

/**
 * Background/decorative layer that scrolls slower than the foreground.
 * Wrap it around an absolutely-positioned image or glow.
 */
export function ParallaxLayer({ children, className, distance = 90 }: Props) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);

  return (
    <motion.div
      ref={ref}
      style={{ y: reduced ? 0 : y }}
      className={cn("absolute inset-0 will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}
