import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Crown, MapPin, Navigation, RefreshCw, ShieldCheck } from "lucide-react";
import heroImg from "@/assets/hero-bus-futuristic.jpg";
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
  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = prev;
    };
  }, []);

  return (
    <PageShell theme="rose">
      <Hero />
      <FourSteps />
      <PinkSpotlight />
    </PageShell>
  );
}

/* ── Particle animation canvas ────────────────────────── */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  colorIndex: number;
}

function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  const COLORS = [
    "#09f2f9",
    "#05b8be",
    "#03d4da",
    "#f870e6",
    "#c245b2",
    "#e055d0",
    "#7df9fc",
    "#fb9ef3",
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let width = 0;
    let height = 0;

    const isDesktop = () => window.innerWidth >= 1024;

    function getConfig() {
      const desktop = isDesktop();
      return {
        COUNT: desktop ? 105 : 60,
        LINK_DIST: desktop ? 165 : 140,
        LINE_WIDTH: desktop ? 1.8 : 0.9,
        SPEED: 0.55,
        REPULSE: desktop ? 130 : 100,
      };
    }

    let cfg = getConfig();

    function resize() {
      if (!canvas) return;
      cfg = getConfig();
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      ctx!.scale(devicePixelRatio, devicePixelRatio);
      init();
    }

    function init() {
      particlesRef.current = Array.from({ length: cfg.COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * cfg.SPEED * 2,
        vy: (Math.random() - 0.5) * cfg.SPEED * 2,
        radius: Math.random() * 2 + 1,
        colorIndex: Math.floor(Math.random() * COLORS.length),
      }));
    }

    function hexToRgb(hex: string): [number, number, number] {
      const c = hex.replace("#", "");
      return [
        parseInt(c.substring(0, 2), 16),
        parseInt(c.substring(2, 4), 16),
        parseInt(c.substring(4, 6), 16),
      ];
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      for (const p of particles) {
        if (mouse) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < cfg.REPULSE && dist > 0) {
            const force = (cfg.REPULSE - dist) / cfg.REPULSE;
            p.vx += (dx / dist) * force * 0.6;
            p.vy += (dy / dist) * force * 0.6;
          }
        }

        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const maxSpd = cfg.SPEED * 3;
        if (spd > maxSpd) {
          p.vx = (p.vx / spd) * maxSpd;
          p.vy = (p.vy / spd) * maxSpd;
        }
        p.vx *= 0.99;
        p.vy *= 0.99;
        if (Math.abs(p.vx) < cfg.SPEED * 0.3) p.vx += (Math.random() - 0.5) * cfg.SPEED * 0.2;
        if (Math.abs(p.vy) < cfg.SPEED * 0.3) p.vy += (Math.random() - 0.5) * cfg.SPEED * 0.2;

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > width) { p.x = width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > height) { p.y = height; p.vy *= -1; }
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < cfg.LINK_DIST) {
            const alpha = 0.6 * (1 - dist / cfg.LINK_DIST);
            const [r1, g1, b1] = hexToRgb(COLORS[particles[i].colorIndex]);
            const [r2, g2, b2] = hexToRgb(COLORS[particles[j].colorIndex]);
            const r = Math.round((r1 + r2) / 2);
            const g = Math.round((g1 + g2) / 2);
            const b = Math.round((b1 + b2) / 2);

            const grad = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            grad.addColorStop(0, `rgba(${r1},${g1},${b1},${alpha})`);
            grad.addColorStop(1, `rgba(${r2},${g2},${b2},${alpha})`);

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = cfg.LINE_WIDTH;
            ctx.stroke();

            if (dist < cfg.LINK_DIST * 0.4) {
              const mx = (particles[i].x + particles[j].x) / 2;
              const my = (particles[i].y + particles[j].y) / 2;
              ctx.beginPath();
              ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 1.6})`;
              ctx.fill();
            }
          }
        }
      }

      for (const p of particles) {
        const [r, g, b] = hexToRgb(COLORS[p.colorIndex]);
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        glow.addColorStop(0, `rgba(${r},${g},${b},0.35)`);
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function onMouseLeave() {
      mouseRef.current = null;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    rafRef.current = requestAnimationFrame(draw);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-auto absolute inset-0 size-full"
      aria-hidden
    />
  );
}

/* ── Hero ─────────────────────────────────────────────── */

function Hero() {
  const { t } = useI18n();
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const title = t("home.title");
  const typed = useTypewriter(title, 700);

  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;

    function onScroll() {
      rafId = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;

        const vh = window.innerHeight;
        const y = window.scrollY;

        // progress: 0 at top, 1 when hero fully scrolled past
        const progress = Math.min(y / vh, 1);

        // ── Background: parallax + subtle scale down ──
        if (bgRef.current) {
          const translateY = y * 0.4;
          const scale = Math.max(1, 1.08 - y * 0.00008);
          // Also scale down slightly as user scrolls (1 → 0.96)
          const scaleOut = 1 - progress * 0.04;
          bgRef.current.style.transform =
            `translateY(${translateY}px) scale(${Math.max(scale, scaleOut)})`;
        }

        // ── Text: float up + fade out ──
        if (textRef.current) {
          const translateY = y * 0.15;
          const opacity = Math.max(0, 1 - progress * 1.6);
          textRef.current.style.transform = `translateY(${translateY}px)`;
          textRef.current.style.opacity = `${opacity}`;
        }

        // ── Overlay: darken hero as user scrolls away ──
        if (overlayRef.current) {
          const extraDark = progress * 0.35;
          overlayRef.current.style.backgroundColor = `rgba(0,0,0,${0.6 + extraDark})`;
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
    <section
      ref={sectionRef}
      className="relative -mt-[88px] flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* Parallax background */}
      <div
        ref={bgRef}
        className="absolute -inset-y-28 inset-x-0 will-change-transform"
        style={{ transformOrigin: "center top" }}
      >
        <img
          src={heroImg}
          alt="Futuristic neon bus in a digital city"
          width={1920}
          height={1088}
          className="size-full object-cover"
        />
      </div>

      {/* Scroll-reactive overlay — darkens as you leave */}
      <div
        ref={overlayRef}
        className="absolute inset-0 will-change-[background-color]"
        style={{ backgroundColor: "rgba(0,0,0,0.60)" }}
      />

      <HeroParticles />

      {/* Text */}
      <div
        ref={textRef}
        className="relative z-10 mx-auto w-full max-w-[900px] px-6 pt-[88px] text-center will-change-transform"
        style={{ transition: "opacity 0.05s linear" }}
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
            <button
              onClick={() => requireAuth(() => navigate({ to: "/book" }))}
              className="relative inline-flex items-center justify-center px-8 py-3.5 font-display text-[15px] font-semibold text-white rounded-[10px] overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, rgba(9,242,249,0.15) 0%, rgba(9,242,249,0.05) 100%)",
                border: "1px solid rgba(9,242,249,0.7)",
                boxShadow: "0 0 18px rgba(9,242,249,0.35), inset 0 0 18px rgba(9,242,249,0.05)",
              }}
            >
              <span
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, rgba(9,242,249,0.25), rgba(9,242,249,0.1))" }}
              />
              <span className="relative" style={{ textShadow: "0 0 12px rgba(9,242,249,0.8)" }}>
                {t("home.cta")}
              </span>
            </button>
          </div>

          <div style={{ animationDelay: "1180ms" }} className="anim-fade-up">
            <button
              onClick={() => navigate({ to: "/pink-card" })}
              className="relative inline-flex items-center justify-center px-8 py-3.5 font-display text-[15px] font-semibold text-white rounded-[10px] overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, rgba(248,112,230,0.15) 0%, rgba(248,112,230,0.05) 100%)",
                border: "1px solid rgba(248,112,230,0.7)",
                boxShadow: "0 0 18px rgba(248,112,230,0.35), inset 0 0 18px rgba(248,112,230,0.05)",
              }}
            >
              <span
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, rgba(248,112,230,0.25), rgba(248,112,230,0.1))" }}
              />
              <span className="relative" style={{ textShadow: "0 0 12px rgba(248,112,230,0.8)" }}>
                {t("home.ctaSecondary")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom fade — hero dissolves into next section */}
      <div
        className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, var(--color-canvas) 100%)",
        }}
      />
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



/* ── Four Steps — slides up into view ────────────────── */


function FourSteps() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    section.style.transform = "translateY(40px)";
    section.style.opacity = "0";
    section.style.transition =
      "transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms ease";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          section.style.transform = "translateY(0px)";
          section.style.opacity = "1";
          observer.disconnect();
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const cards = [
    { n: "01", title: t("steps.1.title"), body: t("steps.1.body"), mock: <SearchMock /> },
    { n: "02", title: t("steps.2.title"), body: t("steps.2.body"), mock: <PayMock /> },
    { n: "03", title: t("steps.3.title"), body: t("steps.3.body"), mock: <QrMock /> },
    { n: "04", title: t("steps.4.title"), body: t("steps.4.body"), mock: <ScanMock /> },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-canvas pt-[72px] pb-[100px] will-change-transform"
    >
      <div aria-hidden className="rose-glow absolute -left-40 top-20 size-[420px]" />
      <div aria-hidden className="rose-glow absolute -right-40 bottom-0 size-[420px]" />

      <div className="relative mx-auto max-w-[1280px] px-6">
        <Reveal className="text-center">
          <SectionEyebrow label={t("steps.eyebrow")} />
          <div className="mt-4 flex items-center justify-center gap-6">
            <span className="hidden h-px flex-1 max-w-[180px] bg-divider sm:block" />
            <h2 className="font-display text-[30px] text-ink sm:text-[38px]">{t("steps.title")}</h2>
            <span className="hidden h-px flex-1 max-w-[180px] bg-divider sm:block" />
          </div>
          <p className="mx-auto mt-3 max-w-[560px] font-sans text-[13.5px] leading-relaxed text-ink-muted">
            {t("steps.sub")}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal key={c.n} delay={i * 120} className="h-full">
              <TiltCard max={8}>
                <article className="glass-panel flex h-full min-h-[300px] flex-col p-8">
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

        <Reveal delay={480} className="mt-10 flex items-center justify-center gap-2">
          <ShieldCheck className="size-4 text-rose" strokeWidth={1.5} />
          <p className="font-display text-[14px] text-ink-muted">{t("steps.footnote")}</p>
        </Reveal>
      </div>
    </section>
  );
}
// function FourSteps() {
//   const { t } = useI18n();
//   const sectionRef = useRef<HTMLElement>(null);

//   useEffect(() => {
//     const section = sectionRef.current;
//     if (!section) return;

//     // Start slightly below, slide up as hero fades
//     section.style.transform = "translateY(40px)";
//     section.style.opacity = "0";
//     section.style.transition =
//       "transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms ease";

//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (!entry.isIntersecting) return;
//           section.style.transform = "translateY(0px)";
//           section.style.opacity = "1";
//           observer.disconnect();
//         });
//       },
//       { threshold: 0.05 }
//     );

//     observer.observe(section);
//     return () => observer.disconnect();
//   }, []);

//   const cards = [
//     { n: "01", title: t("steps.1.title"), body: t("steps.1.body"), mock: <SearchMock /> },
//     { n: "02", title: t("steps.2.title"), body: t("steps.2.body"), mock: <PayMock /> },
//     { n: "03", title: t("steps.3.title"), body: t("steps.3.body"), mock: <QrMock /> },
//     { n: "04", title: t("steps.4.title"), body: t("steps.4.body"), mock: <ScanMock /> },
//   ];

//   return (
//     <section
//       ref={sectionRef}
//       className="relative overflow-hidden bg-canvas py-[120px] will-change-transform"
//     >
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
//                 <article className="glass-panel flex h-full min-h-[340px] flex-col p-8">
//                   <p className="font-display text-[22px] text-rose-numeral">{c.n}</p>
//                   <h3 className="mt-3 font-display text-[21px] text-ink">{c.title}</h3>
//                   <p className="mt-2 font-sans text-[12.5px] leading-relaxed text-ink-muted">
//                     {c.body}
//                   </p>
//                   <div className="mt-6 flex-1">{c.mock}</div>
//                 </article>
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

          if (textRef.current) {
            textRef.current.style.clipPath = "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)";
            textRef.current.style.opacity = "1";
          }
          if (cardsRef.current) {
            const cards = cardsRef.current.querySelectorAll<HTMLElement>("[data-card]");
            cards.forEach((card) => {
              card.style.opacity = "1";
              card.style.transform = "translateY(0)";
            });
          }
          if (photoRef.current) {
            photoRef.current.style.clipPath = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
          }
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




