import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { useAuth } from "@/auth/AuthProvider";
import { LanguageToggle } from "./LanguageToggle";
import { cn } from "@/lib/utils";

type Props = {
  /** Accent system for hover/active states. */
  theme?: "rose" | "navy";
  /** Hero nav floats inset from the screen edges. */
  floating?: boolean;
};

export function NavBar({ theme = "rose", floating = true }: Props) {
  const { t } = useI18n();
  const { isAuthenticated, openAuth, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const accent = theme === "rose" ? "text-rose-bright" : "text-navy-bright";

  const links = [
    { to: "/book", label: t("nav.book") },
    { to: "/trips", label: t("nav.trips") },
    { to: "/pink-card", label: t("nav.pinkCard") },
  ] as const;

  return (
    <header className={cn("sticky top-0 z-40", floating ? "px-4 pt-4" : "")}>
      <nav
        className={cn(
          "glass-nav mx-auto flex h-[72px] max-w-[1360px] items-center justify-between gap-4 px-5 sm:h-[80px] sm:gap-6 sm:px-8 overflow-hidden",
          floating ? "rounded-[16px]" : "rounded-none border-x-0 border-t-0",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/home"
            className="flex items-center"
            onClick={() => setOpen(false)}
         >
         <img
            src="/logo.png"
            alt="SmartBus Logo"
            className="h-[40px] w-auto object-contain sm:h-[50px]"
          />
          </Link>
        </div>

        <div className="hidden items-center gap-8 md:flex lg:gap-10">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "group relative flex items-center gap-2 font-display text-[15px] text-ink/85 transition-colors duration-150",
                `hover:${accent}`,
              )}
              activeProps={{ className: accent }}
            >
              <span className="size-1.5 rounded-full bg-status opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-data-[status=active]:opacity-100" />
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-4 sm:gap-6">
          <LanguageToggle />
          <div className="hidden items-center gap-3 font-display text-[15px] md:flex">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={logout}
                className={cn("text-ink/85 transition-colors hover:text-ink", accent)}
              >
                {t("nav.logout")}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="text-ink/85 transition-colors duration-150 hover:text-ink"
                >
                  {t("nav.login")}
                </button>
                <span className="text-white/25">|</span>
                <button
                  type="button"
                  onClick={() => openAuth("signup")}
                  className="text-ink/85 transition-colors duration-150 hover:text-ink"
                >
                  {t("nav.signup")}
                </button>
              </>
            )}
          </div>
          <button
            type="button"
            aria-label={open ? t("nav.close") : t("nav.menu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-white/15 text-ink/85 transition-colors duration-150 hover:text-ink md:hidden"
          >
            {open ? (
              <X className="size-4" strokeWidth={1.5} />
            ) : (
              <Menu className="size-4" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile slide-out menu */}
      {open ? (
        <div
          className={cn(
            "anim-fade-up glass-nav mx-auto mt-2 max-w-[1360px] overflow-hidden rounded-[16px] px-5 py-4 md:hidden",
            floating ? "" : "rounded-none border-x-0",
          )}
        >
          <div className="flex flex-col divide-y divide-divider">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-3 font-display text-[17px] text-ink/90 transition-colors duration-150 hover:text-ink"
                activeProps={{ className: accent }}
              >
                {l.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className={cn("py-3 text-left font-display text-[17px]", accent)}
              >
                {t("nav.logout")}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openAuth("login");
                  }}
                  className="py-3 text-left font-display text-[17px] text-ink/90"
                >
                  {t("nav.login")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openAuth("signup");
                  }}
                  className="py-3 text-left font-display text-[17px] text-ink/90"
                >
                  {t("nav.signup")}
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
