import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

/** Subtle wayfinding link back to the landing page. */
export function BackHome({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Link
      to="/home"
      className={cn(
        "inline-flex items-center gap-2 font-sans text-[12.5px] text-ink-muted transition-colors duration-150 ease-[var(--ease-micro)] hover:text-ink",
        className,
      )}
    >
      <ArrowLeft className="size-3.5" strokeWidth={1.5} />
      {t("nav.backHome")}
    </Link>
  );
}
