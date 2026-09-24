import { cn } from "@/lib/utils";

type Props = {
  label: string;
  tone?: "rose" | "navy";
  className?: string;
};

/** Small bordered pill with a dot  used above every section heading. */
export function SectionEyebrow({ label, tone = "rose", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/40 px-3.5 py-1.5 backdrop-blur-sm",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          tone === "rose" ? "bg-rose-bright" : "bg-navy-bright",
        )}
      />
      <span className="font-sans text-[11px] uppercase tracking-[0.18em] text-ink/80">
        {label}
      </span>
    </span>
  );
}
