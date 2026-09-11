import { useI18n } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

/** EN / বাং switch — the knob slides, and all UI copy re-renders. */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const isEn = locale === "en";

  return (
    <div
      className={cn(
        "relative flex h-7 items-center rounded-full border border-white/15 bg-black/40 p-0.5",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute top-0.5 h-6 w-[38px] rounded-full bg-ink transition-transform duration-200 ease-[var(--ease-micro)]"
        style={{ transform: isEn ? "translateX(0)" : "translateX(38px)" }}
      />
      {(["en", "bn"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={cn(
            "relative z-10 w-[38px] font-sans text-[11px] font-semibold tracking-wide transition-colors duration-150",
            locale === code ? "text-canvas" : "text-ink/70 hover:text-ink",
          )}
        >
          {code === "en" ? "EN" : "বাং"}
        </button>
      ))}
    </div>
  );
}
