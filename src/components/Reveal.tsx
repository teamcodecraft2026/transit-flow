import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** Stagger delay in ms. */
  delay?: number;
  className?: string;
};

/** Scroll-reveal wrapper: fades + lifts once, at 20% visibility. */
export function Reveal({ children, delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-shown={shown}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn("reveal", className)}
    >
      {children}
    </div>
  );
}
