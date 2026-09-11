import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  tone?: "rose" | "green";
  className?: string;
};

/** Viewfinder bracket frame — reused for ticket QR and conductor scan states. */
export function QrFrame({ children, tone = "rose", className }: Props) {
  const color = tone === "rose" ? "border-rose-bright" : "border-status";
  const corner = "pointer-events-none absolute size-5 border-2";
  return (
    <div className={cn("relative p-3", className)}>
      <span className={cn(corner, color, "left-0 top-0 border-r-0 border-b-0")} />
      <span className={cn(corner, color, "right-0 top-0 border-l-0 border-b-0")} />
      <span className={cn(corner, color, "bottom-0 left-0 border-r-0 border-t-0")} />
      <span className={cn(corner, color, "bottom-0 right-0 border-l-0 border-t-0")} />
      {children}
    </div>
  );
}
