import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-semibold transition-all duration-150 ease-[var(--ease-micro)] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
  {
    variants: {
      variant: {
        cream:
          "bg-cream text-cream-ink border border-white/15 hover:brightness-110 focus-visible:ring-cream",
        pink: "bg-linear-to-r from-rose-deep/90 to-rose-deep text-white hover:brightness-110 focus-visible:ring-rose",
        pinkSolid:
          "btn-glow bg-rose-bright text-white hover:brightness-110 focus-visible:ring-rose",
        blue: "btn-glow bg-navy-accent text-white hover:bg-navy-bright focus-visible:ring-navy-bright",
        periwinkle: "btn-glow bg-peri text-white hover:brightness-110 focus-visible:ring-peri",
        outline:
          "border border-white/35 bg-transparent text-ink hover:bg-white/10 hover:border-white/60 focus-visible:ring-white/40",
        outlineRose:
          "border border-rose-bright/60 bg-transparent text-ink hover:bg-rose-bright/15 focus-visible:ring-rose",
        outlineBlue:
          "border border-navy-line bg-transparent text-ink hover:bg-navy-accent/20 focus-visible:ring-navy-bright",
      },
      size: {
        sm: "h-9 px-4 text-[13px] rounded-[8px]",
        md: "h-11 px-6 text-sm rounded-[10px]",
        lg: "h-12 px-8 text-[15px] rounded-[10px]",
        full: "h-12 w-full px-6 text-[15px] rounded-[10px]",
        pill: "h-12 w-full px-6 text-[15px] rounded-full",
      },
    },
    defaultVariants: { variant: "cream", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className={cn(buttonVariants({ variant, size }), className)}
      {...(props as unknown as React.ComponentProps<typeof motion.button>)}
    />
  );
}
