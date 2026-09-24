import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "rose" | "navy" | "gold";

const RIM: Record<Tone, string> = {
  rose: "conic-gradient(from 0deg, var(--color-rose-glow), var(--color-rose-bright), var(--color-rose-deep), var(--color-rose-glow))",
  navy: "conic-gradient(from 0deg, var(--color-navy-bright), var(--color-navy-accent), var(--color-navy-icon), var(--color-navy-bright))",
  gold: "conic-gradient(from 0deg, #c9a96a, #f0dfaf, #c9a96a, #f0dfaf, #c9a96a)",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: Tone;
  /** Gold hero treatment: transparent  cream fill on hover, serif ivory text. */
  hero?: boolean;
  children: ReactNode;
  innerClassName?: string;
};

/**
 * A button wrapped in a slowly rotating conic-gradient rim. The gradient IS the
 * 1px stroke  the inner surface sits on top so only the rim glows.
 */
export function GlowBorderButton({
  tone = "navy",
  hero = false,
  className,
  innerClassName,
  children,
  ...props
}: Props) {
  return (
    <span
      className={cn("relative isolate inline-flex overflow-hidden rounded-[10px] p-px", className)}
    >
      <span
        aria-hidden
        className="anim-spin-slow absolute left-1/2 top-1/2 -z-10 aspect-square w-[240%] -translate-x-1/2 -translate-y-1/2"
        style={{ background: RIM[tone] }}
      />
      <button
        {...props}
        className={cn(
          "inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-[9px] px-8 transition-all duration-200 ease-[var(--ease-micro)] disabled:pointer-events-none disabled:opacity-50",
          hero
            ? "bg-canvas/70 font-display text-[16px] font-medium text-[#ede6d8] hover:bg-[#f0e4c0] hover:text-[#2a2118]"
            : "bg-navy-accent font-sans text-[15px] font-semibold text-white hover:brightness-110",
          innerClassName,
        )}
      >
        {children}
      </button>
    </span>
  );
}
