import { useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees on each axis. */
  max?: number;
};

/**
 * Physical 3D tilt-on-hover with a soft cursor-tracking glare sheen.
 * Falls back to a plain container when the user prefers reduced motion.
 */
export function TiltCard({ children, className, max = 9 }: Props) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const [hovered, setHovered] = useState(false);

  const spring = { stiffness: 220, damping: 20, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        px.set(0.5);
        py.set(0.5);
      }}
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: "preserve-3d" }}
      className={cn("relative h-full [&>*]:h-full", className)}
    >
      {children}
      <motion.span
        aria-hidden
        style={{
          opacity: hovered ? 1 : 0,
          background: useTransform(
            [glareX, glareY],
            ([x, y]) =>
              `radial-gradient(220px circle at ${x} ${y}, rgba(255,255,255,0.14), transparent 70%)`,
          ),
        }}
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-200"
      />
    </motion.div>
  );
}
