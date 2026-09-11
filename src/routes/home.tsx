import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Crown, MapPin, Navigation, RefreshCw, ShieldCheck } from "lucide-react";
import heroImg from "@/assets/hero-bus-interior.jpg";
import womanImg from "@/assets/woman-boarding.jpg";
import { PageShell } from "@/components/PageShell";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { GlowBorderButton } from "@/components/GlowBorderButton";
import { TiltCard } from "@/components/TiltCard";
import { ParallaxLayer } from "@/components/ParallaxLayer";
import { QrFrame } from "@/components/QrFrame";
import { useI18n } from "@/i18n/LanguageProvider";
import { useAuth } from "@/auth/AuthProvider";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Public Transit — Bus Ticketing Made Seamless & Equitable" },
      {
        name: "description",
        content:
          "Book bus tickets, get an encrypted QR, and travel zero-fare with the Pink Card. One bilingual ticketing fabric for passengers, conductors and state authorities.",
      },
      {
        property: "og:title",
        content: "Public Transit — Bus Ticketing Made Seamless & Equitable",
      },
      {
        property: "og:description",
        content:
          "Search routes, pay in a tap, and board with a dynamic QR — with instant Pink Card zero-fare verification.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <PageShell theme="rose">
      <Hero />
      <FourSteps />
      <PinkSpotlight />
    </PageShell>
  );
}

/* ── Hero with parallax ───────────────────────────────── */

// function Hero() {
//   const { t } = useI18n();
//   const { requireAuth } = useAuth();
//   const navigate = useNavigate();
//   const title = t("home.title");
//   const typed = useTypewriter(title, 700);

//   const bgRef = useRef<HTMLDivElement>(null);
//   const textRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     let rafId: number;
//     let ticking = false;

//     function onScroll() {
//       if (ticking) return;
//       ticking = true;
//       rafId = requestAnimationFrame(() => {
//         const y = window.scrollY;
//         const vh = window.innerHeight;

//         // Only apply parallax while hero is visible
//         if (y > vh) {
//           ticking = false;
//           return;
//         }

//         if (bgRef.current) {
//           const scale = Math.max(1, 1.08 - y * 0.00008);
//           bgRef.current.style.transform = `translateY(${y * 0.4}px) scale(${scale})`;
//         }

//         if (textRef.current) {
//           const opacity = Math.max(0, 1 - y / 500);
//           textRef.current.style.transform = `translateY(${y * 0.15}px)`;
//           textRef.current.style.opacity = `${opacity}`;
//         }

//         ticking = false;
//       });
//     }

//     window.addEventListener("scroll", onScroll, { passive: true });
//     return () => {
//       window.removeEventListener("scroll", onScroll);
//       cancelAnimationFrame(rafId);
//     };
//   }, []);

//   return (
//     <section
//       className="relative -mt-[88px] flex min-h-[100svh] items-center"
//       style={{ overflow: "hidden", isolation: "isolate" }}
//     >
//       {/* Parallax background — clipped strictly inside section */}
//       <div
//         ref={bgRef}
//         className="absolute inset-0 will-change-transform"
//         style={{ transformOrigin: "center top" }}
//       >
//         <img
//           src={heroImg}
//           alt="View down the aisle of a city bus at night"
//           width={1920}
//           height={1088}
//           className="size-full object-cover"
//         />
//       </div>

//       <div className="absolute inset-0 scrim-dark" />

//       <div
//         ref={textRef}
//         className="relative z-10 mx-auto w-full max-w-[900px] px-6 pt-[88px] text-center will-change-transform"
//       >
//         <div style={{ animationDelay: "0ms", animationDuration: "150ms" }} className="anim-fade">
//           <SectionEyebrow label={t("home.eyebrow")} />
//         </div>

//         <h1 className="mt-8 font-display text-[40px] leading-[1.05] text-ink sm:text-[56px] lg:text-[64px]">
//           {typed}
//           <span className="ml-0.5 inline-block w-px animate-pulse align-middle" />
//         </h1>
//         <p
//           style={{ animationDelay: "900ms" }}
//           className="anim-fade-up font-display text-[30px] italic leading-[1.1] text-ink sm:text-[40px] lg:text-[46px]"
//         >
//           {t("home.subtitle")}
//         </p>

//         <p
//           style={{ animationDelay: "1000ms" }}
//           className="anim-fade-up mx-auto mt-6 max-w-[620px] font-sans text-[14px] leading-relaxed text-ink/85 sm:text-[15px]"
//         >
//           {t("home.body")}
//         </p>

//         <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
//           <div style={{ animationDelay: "1100ms" }} className="anim-fade-up">
//             <GlowBorderButton
//               tone="gold"
//               hero
//               onClick={() => requireAuth(() => navigate({ to: "/book" }))}
//             >
//               {t("home.cta")}
//             </GlowBorderButton>
//           </div>
//           <div style={{ animationDelay: "1180ms" }} className="anim-fade-up">
//             <GlowBorderButton tone="gold" hero onClick={() => navigate({ to: "/pink-card" })}>
//               {t("home.ctaSecondary")}
//             </GlowBorderButton>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }




function Hero() {
  const { t } = useI18n();
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const title = t("home.title");
  const typed = useTypewriter(title, 700);

  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;

    function onScroll() {
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY;

        // Background moves at 0.4x scroll speed + subtle scale
        if (bgRef.current) {
          const scale = 1.08 - y * 0.00008;
          bgRef.current.style.transform = `translateY(${y * 0.4}px) scale(${Math.max(1, scale)})`;
        }

        // Text moves at 0.85x scroll speed
        if (textRef.current) {
          textRef.current.style.transform = `translateY(${y * 0.15}px)`;
          textRef.current.style.opacity = `${Math.max(0, 1 - y / 600)}`;
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="relative -mt-[88px] flex min-h-[100svh] items-center overflow-hidden">
      {/* Parallax background */}
      <div
        ref={bgRef}
        className="absolute -inset-y-28 inset-x-0 will-change-transform"
        style={{ transformOrigin: "center top" }}
      >
        <img
          src={heroImg}
          alt="View down the aisle of a city bus at night"
          width={1920}
          height={1088}
          className="size-full object-cover"
        />
      </div>

      <div className="absolute inset-0 scrim-dark" />

      {/* Text content moves slightly slower */}
      <div
        ref={textRef}
        className="relative z-10 mx-auto w-full max-w-[900px] px-6 pt-[88px] text-center will-change-transform"
        style={{ transition: "opacity 0.1s linear" }}
      >
        <div style={{ animationDelay: "0ms", animationDuration: "150ms" }} className="anim-fade">
          <SectionEyebrow label={t("home.eyebrow")} />
        </div>

        <h1 className="mt-8 font-display text-[40px] leading-[1.05] text-ink sm:text-[56px] lg:text-[64px]">
          {typed}
          <span className="ml-0.5 inline-block w-px animate-pulse align-middle" />
        </h1>
        <p
          style={{ animationDelay: "900ms" }}
          className="anim-fade-up font-display text-[30px] italic leading-[1.1] text-ink sm:text-[40px] lg:text-[46px]"
        >
          {t("home.subtitle")}
        </p>

        <p
          style={{ animationDelay: "1000ms" }}
          className="anim-fade-up mx-auto mt-6 max-w-[620px] font-sans text-[14px] leading-relaxed text-ink/85 sm:text-[15px]"
        >
          {t("home.body")}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <div style={{ animationDelay: "1100ms" }} className="anim-fade-up">
            <GlowBorderButton
              tone="gold"
              hero
              onClick={() => requireAuth(() => navigate({ to: "/book" }))}
            >
              {t("home.cta")}
            </GlowBorderButton>
          </div>
          <div style={{ animationDelay: "1180ms" }} className="anim-fade-up">
            <GlowBorderButton tone="gold" hero onClick={() => navigate({ to: "/pink-card" })}>
              {t("home.ctaSecondary")}
            </GlowBorderButton>
          </div>
        </div>
      </div>
    </section>
  );
}






function useTypewriter(text: string, duration: number) {
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(text);
      return;
    }
    setShown("");
    const per = duration / Math.max(text.length, 1);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, per);
    return () => window.clearInterval(id);
  }, [text, duration]);

  return shown;
}

/* ── Four steps ───────────────────────────────────────── */

function FourSteps() {
  const { t } = useI18n();

  const cards = [
    { n: "01", title: t("steps.1.title"), body: t("steps.1.body"), mock: <SearchMock /> },
    { n: "02", title: t("steps.2.title"), body: t("steps.2.body"), mock: <PayMock /> },
    { n: "03", title: t("steps.3.title"), body: t("steps.3.body"), mock: <QrMock /> },
    { n: "04", title: t("steps.4.title"), body: t("steps.4.body"), mock: <ScanMock /> },
  ];

  return (
    <section className="relative overflow-hidden bg-canvas py-[120px]">
      <div aria-hidden className="rose-glow absolute -left-40 top-20 size-[420px]" />
      <div aria-hidden className="rose-glow absolute -right-40 bottom-0 size-[420px]" />

      <div className="relative mx-auto max-w-[1280px] px-6">
        <Reveal className="text-center">
          <SectionEyebrow label={t("steps.eyebrow")} />
          <div className="mt-6 flex items-center justify-center gap-6">
            <span className="hidden h-px flex-1 max-w-[180px] bg-divider sm:block" />
            <h2 className="font-display text-[30px] text-ink sm:text-[38px]">{t("steps.title")}</h2>
            <span className="hidden h-px flex-1 max-w-[180px] bg-divider sm:block" />
          </div>
          <p className="mx-auto mt-4 max-w-[560px] font-sans text-[13.5px] leading-relaxed text-ink-muted">
            {t("steps.sub")}
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal key={c.n} delay={i * 120} className="h-full">
              <TiltCard max={8}>
                <article className="glass-panel flex h-full min-h-[340px] flex-col p-8">
                  <p className="font-display text-[22px] text-rose-numeral">{c.n}</p>
                  <h3 className="mt-3 font-display text-[21px] text-ink">{c.title}</h3>
                  <p className="mt-2 font-sans text-[12.5px] leading-relaxed text-ink-muted">
                    {c.body}
                  </p>
                  <div className="mt-6 flex-1">{c.mock}</div>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={480} className="mt-14 flex items-center justify-center gap-2">
          <ShieldCheck className="size-4 text-rose" strokeWidth={1.5} />
          <p className="font-display text-[14px] text-ink-muted">{t("steps.footnote")}</p>
        </Reveal>
      </div>
    </section>
  );
}

function SearchMock() {
  const { t } = useI18n();
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-[10px] border border-white/10 bg-black/40 px-3 py-2.5">
        <Navigation className="size-3.5 text-ink-muted" strokeWidth={1.5} />
        <span className="flex-1 font-sans text-[11px] text-ink-muted">
          {t("steps.searchPlaceholder")}
        </span>
        <MapPin className="size-3.5 text-rose" strokeWidth={1.5} />
      </div>
      <div className="relative h-[110px] overflow-hidden rounded-[10px] border border-white/10 bg-[#0d0d14]">
        <svg viewBox="0 0 200 110" className="size-full">
          <path
            d="M10 95 C60 80 70 40 120 35 S180 20 195 12"
            fill="none"
            stroke="var(--color-rose-bright)"
            strokeWidth="2"
          />
          <circle cx="120" cy="35" r="3" fill="var(--color-rose-bright)" />
        </svg>
        <div className="absolute bottom-2 left-2 rounded-[6px] border border-white/10 bg-black/70 px-2 py-1">
          <p className="font-sans text-[9px] text-ink">{t("steps.mapStop")}</p>
          <p className="font-sans text-[8px] text-ink-muted">{t("steps.mapWalk")}</p>
        </div>
      </div>
    </div>
  );
}

function PayMock() {
  const { t } = useI18n();
  const rows = [
    { title: t("steps.payPink"), sub: t("steps.payPinkSub"), active: true },
    { title: t("steps.payUpi"), sub: t("steps.payUpiSub"), active: false },
    { title: t("steps.payCard"), sub: t("steps.payCardSub"), active: false },
  ];
  return (
    <div className="space-y-2 rounded-[10px] border border-white/10 bg-black/40 p-2.5">
      <p className="font-sans text-[8.5px] uppercase tracking-[0.16em] text-ink-muted">
        {t("steps.payTitle")}
      </p>
      {rows.map((r) => (
        <div
          key={r.title}
          className={`flex items-center gap-2 rounded-[8px] border px-2.5 py-2 ${
            r.active ? "border-rose-bright/50 bg-rose-bright/10" : "border-white/8 bg-white/[0.03]"
          }`}
        >
          <span className="size-4 rounded-[4px] border border-white/20" />
          <div className="flex-1">
            <p className="font-sans text-[10px] text-ink">{r.title}</p>
            <p className="font-sans text-[8.5px] text-ink-muted">{r.sub}</p>
          </div>
          {r.active ? <span className="size-2.5 rounded-full bg-rose-bright" /> : null}
        </div>
      ))}
      <div className="rounded-[8px] bg-rose-deep/70 py-1.5 text-center font-sans text-[10px] text-ink">
        {t("steps.next")}
      </div>
    </div>
  );
}

function QrMock() {
  const { t } = useI18n();
  return (
    <div className="rounded-[10px] border border-white/10 bg-black/40 p-3">
      <p className="text-center font-sans text-[8.5px] uppercase tracking-[0.16em] text-rose">
        {t("steps.qrTitle")}
      </p>
      <div className="mx-auto mt-2 grid size-[104px] grid-cols-8 gap-[2px] rounded-[6px] bg-white p-1.5">
        {Array.from({ length: 64 }).map((_, i) => (
          <span
            key={i}
            className={(i * 7) % 3 === 0 || i % 5 === 0 ? "bg-black" : "bg-transparent"}
          />
        ))}
      </div>
    </div>
  );
}

function ScanMock() {
  const { t } = useI18n();
  return (
    <div className="rounded-[10px] border border-white/10 bg-black/40 p-3">
      <p className="text-center font-sans text-[8.5px] uppercase tracking-[0.16em] text-ink-muted">
        {t("steps.scanTitle")}
      </p>
      <QrFrame tone="green" className="mt-2">
        <div className="flex h-[92px] flex-col items-center justify-center gap-1.5">
          <span className="flex size-9 items-center justify-center rounded-full border-2 border-status text-status">
            ✓
          </span>
          <p className="font-sans text-[10px] text-status">{t("steps.verified")}</p>
          <p className="font-sans text-[8.5px] text-ink-muted">{t("steps.happy")}</p>
        </div>
      </QrFrame>
    </div>
  );
}

/* ── Pink Card spotlight with clip-path reveal ────────── */

function PinkSpotlight() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const btnsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Set initial hidden states
    if (textRef.current) {
      textRef.current.style.clipPath = "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)";
      textRef.current.style.opacity = "0";
      textRef.current.style.transition =
        "clip-path 900ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 600ms ease";
    }
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll<HTMLElement>("[data-card]");
      cards.forEach((card, i) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(24px)";
        card.style.transition = `opacity 600ms ease ${200 + i * 150}ms, transform 600ms cubic-bezier(0.25,0.46,0.45,0.94) ${200 + i * 150}ms`;
      });
    }
    if (photoRef.current) {
      photoRef.current.style.clipPath = "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)";
      photoRef.current.style.transition =
        "clip-path 1100ms cubic-bezier(0.25,0.46,0.45,0.94) 200ms";
    }
    if (btnsRef.current) {
      btnsRef.current.style.opacity = "0";
      btnsRef.current.style.transform = "translateY(16px)";
      btnsRef.current.style.transition = "opacity 600ms ease 700ms, transform 600ms ease 700ms";
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          // Reveal text block
          if (textRef.current) {
            textRef.current.style.clipPath = "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)";
            textRef.current.style.opacity = "1";
          }

          // Stagger cards
          if (cardsRef.current) {
            const cards = cardsRef.current.querySelectorAll<HTMLElement>("[data-card]");
            cards.forEach((card) => {
              card.style.opacity = "1";
              card.style.transform = "translateY(0)";
            });
          }

          // Sweep photo from right
          if (photoRef.current) {
            photoRef.current.style.clipPath = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
          }

          // Buttons fade in
          if (btnsRef.current) {
            btnsRef.current.style.opacity = "1";
            btnsRef.current.style.transform = "translateY(0)";
          }

          observer.disconnect();
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: Crown, title: t("spot.f1"), caption: t("spot.f1sub") },
    { icon: ShieldCheck, title: t("spot.f2"), caption: t("spot.f2sub") },
    { icon: RefreshCw, title: t("spot.f3"), caption: t("spot.f3sub") },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative grid overflow-hidden bg-canvas-alt lg:grid-cols-2"
    >
      <div className="relative z-10 flex flex-col justify-center px-6 py-[110px] lg:pl-[8vw] lg:pr-16">
        {/* Text block — clip-path reveal from bottom */}
        <div ref={textRef}>
          <SectionEyebrow label={t("spot.eyebrow")} />
          <h2 className="mt-8 font-display text-[36px] leading-[1.15] text-ink sm:text-[44px]">
            {t("spot.title")}
            <br />
            <span className="text-rose">{t("spot.title2")}</span>
            <br />
            <span className="text-rose">{t("spot.title3")}</span>
          </h2>
          <p className="mt-6 max-w-[460px] font-sans text-[13.5px] leading-relaxed text-ink-muted">
            {t("spot.body")}
          </p>
        </div>

        {/* Feature cards — stagger slide up */}
        <div
          ref={cardsRef}
          className="mt-10 grid divide-y divide-divider rounded-[16px] border border-white/10 bg-black/30 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        >
          {features.map(({ icon: Icon, title, caption }) => (
            <div key={title} data-card className="px-5 py-6">
              <Icon className="size-4 text-rose-bright" strokeWidth={1.5} />
              <p className="mt-3 font-display text-[15px] text-ink">{title}</p>
              <p className="mt-1 font-sans text-[11px] leading-relaxed text-ink-muted">{caption}</p>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div ref={btnsRef} className="mt-9 flex flex-wrap gap-4">
          <Button
            variant="pinkSolid"
            size="md"
            className="font-display text-[15px] font-medium"
            onClick={() => navigate({ to: "/pink-card" })}
          >
            {t("spot.cta")}
          </Button>
          <Button
            variant="outlineRose"
            size="md"
            className="font-display text-[15px] font-medium"
            onClick={() => navigate({ to: "/pink-card" })}
          >
            {t("spot.cta2")}
          </Button>
        </div>
      </div>

      {/* Photo — sweep in from right */}
      <div ref={photoRef} className="relative min-h-[420px] lg:min-h-full">
        <ParallaxLayer distance={50} className="-inset-y-16">
          <img
            src={womanImg}
            alt="A woman boarding a city bus at dusk"
            loading="lazy"
            width={1200}
            height={1408}
            className="size-full object-cover"
          />
        </ParallaxLayer>
        <div className="absolute inset-0 bg-linear-to-r from-canvas-alt via-canvas-alt/30 to-transparent" />
      </div>
    </section>
  );
}











// import { createFileRoute, useNavigate } from "@tanstack/react-router";
// import { useEffect, useState } from "react";
// import { Crown, MapPin, Navigation, RefreshCw, ShieldCheck } from "lucide-react";
// import heroImg from "@/assets/hero-bus-interior.jpg";
// import womanImg from "@/assets/woman-boarding.jpg";
// import { PageShell } from "@/components/PageShell";
// import { SectionEyebrow } from "@/components/SectionEyebrow";
// import { Reveal } from "@/components/Reveal";
// import { Button } from "@/components/Button";
// import { GlowBorderButton } from "@/components/GlowBorderButton";
// import { TiltCard } from "@/components/TiltCard";
// import { ParallaxLayer } from "@/components/ParallaxLayer";

// import { QrFrame } from "@/components/QrFrame";
// import { useI18n } from "@/i18n/LanguageProvider";
// import { useAuth } from "@/auth/AuthProvider";

// export const Route = createFileRoute("/home")({
//   head: () => ({
//     meta: [
//       { title: "Public Transit — Bus Ticketing Made Seamless & Equitable" },
//       {
//         name: "description",
//         content:
//           "Book bus tickets, get an encrypted QR, and travel zero-fare with the Pink Card. One bilingual ticketing fabric for passengers, conductors and state authorities.",
//       },
//       {
//         property: "og:title",
//         content: "Public Transit — Bus Ticketing Made Seamless & Equitable",
//       },
//       {
//         property: "og:description",
//         content:
//           "Search routes, pay in a tap, and board with a dynamic QR — with instant Pink Card zero-fare verification.",
//       },
//     ],
//   }),
//   component: Home,
// });

// function Home() {
//   return (
//     <PageShell theme="rose">
//       <Hero />
//       <FourSteps />
//       <PinkSpotlight />
//     </PageShell>
//   );
// }

// /* ── Hero ─────────────────────────────────────────────── */

// function Hero() {
//   const { t } = useI18n();
//   const { requireAuth } = useAuth();
//   const navigate = useNavigate();
//   const title = t("home.title");
//   const typed = useTypewriter(title, 700);

//   return (
//     <section className="relative -mt-[88px] flex min-h-[100svh] items-center overflow-hidden">
//       <ParallaxLayer distance={70} className="-inset-y-28">
//         <img
//           src={heroImg}
//           alt="View down the aisle of a city bus at night"
//           width={1920}
//           height={1088}
//           className="size-full object-cover"
//         />
//       </ParallaxLayer>
//       <div className="absolute inset-0 scrim-dark" />

//       <div className="relative z-10 mx-auto w-full max-w-[900px] px-6 pt-[88px] text-center">
//         <div style={{ animationDelay: "0ms", animationDuration: "150ms" }} className="anim-fade">
//           <SectionEyebrow label={t("home.eyebrow")} />
//         </div>

//         <h1 className="mt-8 font-display text-[40px] leading-[1.05] text-ink sm:text-[56px] lg:text-[64px]">
//           {typed}
//           <span className="ml-0.5 inline-block w-px animate-pulse align-middle" />
//         </h1>
//         <p
//           style={{ animationDelay: "900ms" }}
//           className="anim-fade-up font-display text-[30px] italic leading-[1.1] text-ink sm:text-[40px] lg:text-[46px]"
//         >
//           {t("home.subtitle")}
//         </p>

//         <p
//           style={{ animationDelay: "1000ms" }}
//           className="anim-fade-up mx-auto mt-6 max-w-[620px] font-sans text-[14px] leading-relaxed text-ink/85 sm:text-[15px]"
//         >
//           {t("home.body")}
//         </p>

//         <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
//           <div style={{ animationDelay: "1100ms" }} className="anim-fade-up">
//             <GlowBorderButton
//               tone="gold"
//               hero
//               onClick={() => requireAuth(() => navigate({ to: "/book" }))}
//             >
//               {t("home.cta")}
//             </GlowBorderButton>
//           </div>
//           <div style={{ animationDelay: "1180ms" }} className="anim-fade-up">
//             <GlowBorderButton tone="gold" hero onClick={() => navigate({ to: "/pink-card" })}>
//               {t("home.ctaSecondary")}
//             </GlowBorderButton>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// function useTypewriter(text: string, duration: number) {
//   const [shown, setShown] = useState(text);

//   useEffect(() => {
//     if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
//       setShown(text);
//       return;
//     }
//     setShown("");
//     const per = duration / Math.max(text.length, 1);
//     let i = 0;
//     const id = window.setInterval(() => {
//       i += 1;
//       setShown(text.slice(0, i));
//       if (i >= text.length) window.clearInterval(id);
//     }, per);
//     return () => window.clearInterval(id);
//   }, [text, duration]);

//   return shown;
// }

// /* ── Four steps ───────────────────────────────────────── */

// function FourSteps() {
//   const { t } = useI18n();

//   const cards = [
//     { n: "01", title: t("steps.1.title"), body: t("steps.1.body"), mock: <SearchMock /> },
//     { n: "02", title: t("steps.2.title"), body: t("steps.2.body"), mock: <PayMock /> },
//     { n: "03", title: t("steps.3.title"), body: t("steps.3.body"), mock: <QrMock /> },
//     { n: "04", title: t("steps.4.title"), body: t("steps.4.body"), mock: <ScanMock /> },
//   ];

//   return (
//     <section className="relative overflow-hidden bg-canvas py-[120px]">
//       <div aria-hidden className="rose-glow absolute -left-40 top-20 size-[420px]" />
//       <div aria-hidden className="rose-glow absolute -right-40 bottom-0 size-[420px]" />

//       <div className="relative mx-auto max-w-[1280px] px-6">
//         <Reveal className="text-center">
//           <SectionEyebrow label={t("steps.eyebrow")} />
//           <div className="mt-6 flex items-center justify-center gap-6">
//             <span className="hidden h-px flex-1 max-w-[180px] bg-divider sm:block" />
//             <h2 className="font-display text-[30px] text-ink sm:text-[38px]">{t("steps.title")}</h2>
//             <span className="hidden h-px flex-1 max-w-[180px] bg-divider sm:block" />
//           </div>
//           <p className="mx-auto mt-4 max-w-[560px] font-sans text-[13.5px] leading-relaxed text-ink-muted">
//             {t("steps.sub")}
//           </p>
//         </Reveal>

//         <div className="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
//           {cards.map((c, i) => (
//             <Reveal key={c.n} delay={i * 120} className="h-full">
//               <TiltCard max={8}>
//               <article className="glass-panel flex h-full min-h-[340px] flex-col p-8">
//                 <p className="font-display text-[22px] text-rose-numeral">{c.n}</p>
//                 <h3 className="mt-3 font-display text-[21px] text-ink">{c.title}</h3>
//                 <p className="mt-2 font-sans text-[12.5px] leading-relaxed text-ink-muted">
//                   {c.body}
//                 </p>
//                 <div className="mt-6 flex-1">{c.mock}</div>
//               </article>
//               </TiltCard>
//             </Reveal>
//           ))}
//         </div>

//         <Reveal delay={480} className="mt-14 flex items-center justify-center gap-2">
//           <ShieldCheck className="size-4 text-rose" strokeWidth={1.5} />
//           <p className="font-display text-[14px] text-ink-muted">{t("steps.footnote")}</p>
//         </Reveal>
//       </div>
//     </section>
//   );
// }

// function SearchMock() {
//   const { t } = useI18n();
//   return (
//     <div className="space-y-3">
//       <div className="flex items-center gap-2 rounded-[10px] border border-white/10 bg-black/40 px-3 py-2.5">
//         <Navigation className="size-3.5 text-ink-muted" strokeWidth={1.5} />
//         <span className="flex-1 font-sans text-[11px] text-ink-muted">
//           {t("steps.searchPlaceholder")}
//         </span>
//         <MapPin className="size-3.5 text-rose" strokeWidth={1.5} />
//       </div>
//       <div className="relative h-[110px] overflow-hidden rounded-[10px] border border-white/10 bg-[#0d0d14]">
//         <svg viewBox="0 0 200 110" className="size-full">
//           <path
//             d="M10 95 C60 80 70 40 120 35 S180 20 195 12"
//             fill="none"
//             stroke="var(--color-rose-bright)"
//             strokeWidth="2"
//           />
//           <circle cx="120" cy="35" r="3" fill="var(--color-rose-bright)" />
//         </svg>
//         <div className="absolute bottom-2 left-2 rounded-[6px] border border-white/10 bg-black/70 px-2 py-1">
//           <p className="font-sans text-[9px] text-ink">{t("steps.mapStop")}</p>
//           <p className="font-sans text-[8px] text-ink-muted">{t("steps.mapWalk")}</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// function PayMock() {
//   const { t } = useI18n();
//   const rows = [
//     { title: t("steps.payPink"), sub: t("steps.payPinkSub"), active: true },
//     { title: t("steps.payUpi"), sub: t("steps.payUpiSub"), active: false },
//     { title: t("steps.payCard"), sub: t("steps.payCardSub"), active: false },
//   ];
//   return (
//     <div className="space-y-2 rounded-[10px] border border-white/10 bg-black/40 p-2.5">
//       <p className="font-sans text-[8.5px] uppercase tracking-[0.16em] text-ink-muted">
//         {t("steps.payTitle")}
//       </p>
//       {rows.map((r) => (
//         <div
//           key={r.title}
//           className={`flex items-center gap-2 rounded-[8px] border px-2.5 py-2 ${
//             r.active ? "border-rose-bright/50 bg-rose-bright/10" : "border-white/8 bg-white/[0.03]"
//           }`}
//         >
//           <span className="size-4 rounded-[4px] border border-white/20" />
//           <div className="flex-1">
//             <p className="font-sans text-[10px] text-ink">{r.title}</p>
//             <p className="font-sans text-[8.5px] text-ink-muted">{r.sub}</p>
//           </div>
//           {r.active ? <span className="size-2.5 rounded-full bg-rose-bright" /> : null}
//         </div>
//       ))}
//       <div className="rounded-[8px] bg-rose-deep/70 py-1.5 text-center font-sans text-[10px] text-ink">
//         {t("steps.next")}
//       </div>
//     </div>
//   );
// }

// function QrMock() {
//   const { t } = useI18n();
//   return (
//     <div className="rounded-[10px] border border-white/10 bg-black/40 p-3">
//       <p className="text-center font-sans text-[8.5px] uppercase tracking-[0.16em] text-rose">
//         {t("steps.qrTitle")}
//       </p>
//       <div className="mx-auto mt-2 grid size-[104px] grid-cols-8 gap-[2px] rounded-[6px] bg-white p-1.5">
//         {Array.from({ length: 64 }).map((_, i) => (
//           <span
//             key={i}
//             className={(i * 7) % 3 === 0 || i % 5 === 0 ? "bg-black" : "bg-transparent"}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// function ScanMock() {
//   const { t } = useI18n();
//   return (
//     <div className="rounded-[10px] border border-white/10 bg-black/40 p-3">
//       <p className="text-center font-sans text-[8.5px] uppercase tracking-[0.16em] text-ink-muted">
//         {t("steps.scanTitle")}
//       </p>
//       <QrFrame tone="green" className="mt-2">
//         <div className="flex h-[92px] flex-col items-center justify-center gap-1.5">
//           <span className="flex size-9 items-center justify-center rounded-full border-2 border-status text-status">
//             ✓
//           </span>
//           <p className="font-sans text-[10px] text-status">{t("steps.verified")}</p>
//           <p className="font-sans text-[8.5px] text-ink-muted">{t("steps.happy")}</p>
//         </div>
//       </QrFrame>
//     </div>
//   );
// }

// /* ── Pink Card spotlight ──────────────────────────────── */

// function PinkSpotlight() {
//   const { t } = useI18n();
//   const navigate = useNavigate();

//   const features = [
//     { icon: Crown, title: t("spot.f1"), caption: t("spot.f1sub") },
//     { icon: ShieldCheck, title: t("spot.f2"), caption: t("spot.f2sub") },
//     { icon: RefreshCw, title: t("spot.f3"), caption: t("spot.f3sub") },
//   ];

//   return (
//     <section className="relative grid overflow-hidden bg-canvas-alt lg:grid-cols-2">
//       <div className="relative z-10 flex flex-col justify-center px-6 py-[110px] lg:pl-[8vw] lg:pr-16">
//         <Reveal>
//           <SectionEyebrow label={t("spot.eyebrow")} />
//           <h2 className="mt-8 font-display text-[36px] leading-[1.15] text-ink sm:text-[44px]">
//             {t("spot.title")}
//             <br />
//             <span className="text-rose">{t("spot.title2")}</span>
//             <br />
//             <span className="text-rose">{t("spot.title3")}</span>
//           </h2>
//           <p className="mt-6 max-w-[460px] font-sans text-[13.5px] leading-relaxed text-ink-muted">
//             {t("spot.body")}
//           </p>
//         </Reveal>

//         <Reveal delay={120}>
//           <div className="mt-10 grid divide-y divide-divider rounded-[16px] border border-white/10 bg-black/30 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
//             {features.map(({ icon: Icon, title, caption }) => (
//               <div key={title} className="px-5 py-6">
//                 <Icon className="size-4 text-rose-bright" strokeWidth={1.5} />
//                 <p className="mt-3 font-display text-[15px] text-ink">{title}</p>
//                 <p className="mt-1 font-sans text-[11px] leading-relaxed text-ink-muted">
//                   {caption}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </Reveal>

//         <Reveal delay={240} className="mt-9 flex flex-wrap gap-4">
//           <Button
//             variant="pinkSolid"
//             size="md"
//             className="font-display text-[15px] font-medium"
//             onClick={() => navigate({ to: "/pink-card" })}
//           >
//             {t("spot.cta")}
//           </Button>
//           <Button
//             variant="outlineRose"
//             size="md"
//             className="font-display text-[15px] font-medium"
//             onClick={() => navigate({ to: "/pink-card" })}
//           >
//             {t("spot.cta2")}
//           </Button>
//         </Reveal>
//       </div>

//       <div className="relative min-h-[420px] lg:min-h-full">
//         <ParallaxLayer distance={50} className="-inset-y-16">
//         <img
//           src={womanImg}
//           alt="A woman boarding a city bus at dusk"
//           loading="lazy"
//           width={1200}
//           height={1408}
//           className="size-full object-cover"
//         />
//         </ParallaxLayer>
//         <div className="absolute inset-0 bg-linear-to-r from-canvas-alt via-canvas-alt/30 to-transparent" />
//       </div>
//     </section>
//   );
// }
