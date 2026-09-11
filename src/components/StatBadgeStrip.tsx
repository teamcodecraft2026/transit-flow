import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatItem = {
  icon: LucideIcon;
  title: string;
  caption: string;
};

type Props = {
  items: StatItem[];
  tone?: "rose" | "navy";
  className?: string;
};

/** Horizontal icon + title + caption strip, divided by hairlines. */
export function StatBadgeStrip({ items, tone = "rose", className }: Props) {
  return (
    <div
      className={cn(
        "grid divide-y divide-divider sm:grid-cols-3 sm:divide-x sm:divide-y-0",
        tone === "navy"
          ? "rounded-[18px] border border-navy-line bg-navy-panel/95"
          : "glass-panel",
        className,
      )}
    >
      {items.map(({ icon: Icon, title, caption }) => (
        <div
          key={title}
          className={cn(
            "flex items-center gap-4 px-6 py-6",
            tone === "navy" ? "sm:px-8" : "sm:flex-col sm:items-start sm:gap-3",
          )}
        >
          <Icon
            className={cn(
              "shrink-0",
              tone === "navy" ? "size-8 text-navy-icon" : "size-5 text-rose-bright",
            )}
            strokeWidth={1.5}
          />
          <div>
            <p
              className={cn(
                "font-display text-ink",
                tone === "navy" ? "text-[19px]" : "text-[17px]",
              )}
            >
              {title}
            </p>
            <p className="mt-0.5 font-sans text-[12px] leading-relaxed text-ink-muted">
              {caption}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
