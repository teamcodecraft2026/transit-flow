import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-divider bg-canvas-alt">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-20 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
         <img src="/logo.png" alt="TransitFlow Logo" className="h-12 w-auto object-contain" />
          <p className="mt-5 max-w-xs font-sans text-[13px] leading-relaxed text-ink-muted">
            {t("footer.blurb")}
          </p>
        </div>

        <div>
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-rose">
            {t("footer.explore")}
          </p>
          <ul className="mt-5 space-y-3 font-sans text-[13px] text-ink-muted">
            <li>
              <Link to="/book" className="transition-colors hover:text-ink">
                {t("footer.bookTicket")}
              </Link>
            </li>
            <li>
              <Link to="/pink-card" className="transition-colors hover:text-ink">
                {t("footer.passes")}
              </Link>
            </li>
            <li>
              <Link to="/trips" className="transition-colors hover:text-ink">
                {t("nav.trips")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-rose">
            {t("footer.about")}
          </p>
          <ul className="mt-5 space-y-3 font-sans text-[13px] text-ink-muted">
            <li>{t("footer.aboutUs")}</li>
            <li>{t("footer.how")}</li>
          </ul>
        </div>

        <div>
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-rose">
            {t("footer.contact")}
          </p>
          <ul className="mt-5 space-y-3 font-sans text-[13px] text-ink-muted">
            <li className="flex items-center gap-2">
              <Phone className="size-3.5" strokeWidth={1.5} /> 1234567890
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-3.5" strokeWidth={1.5} /> abc@gmail.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-divider py-6 text-center font-sans text-[12px] text-ink-muted">
        {t("footer.copy")}
      </div>
    </footer>
  );
}
