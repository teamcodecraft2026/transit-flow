import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  MapPin,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import glowBg from "@/assets/pink-glow-bg.jpg";
import navyBg from "@/assets/night-street-navy.jpg";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { useI18n } from "@/i18n/LanguageProvider";
import { type PinkCardResponse } from "@/lib/api";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";

export const Route = createFileRoute("/pink-card")({
  head: () => ({
    meta: [
      { title: "The Pink Card — Free Verified Bus Travel for Women | Public Transit" },
      {
        name: "description",
        content:
          "Apply for the Pink Card and get zero-fare bus travel across all public transit services. Encrypted, government-linked, verified in minutes.",
      },
      {
        property: "og:title",
        content: "The Pink Card — Free Verified Bus Travel for Women",
      },
      {
        property: "og:description",
        content:
          "Zero-fare bus travel for eligible women — encrypted, government-linked, verified in minutes.",
      },
    ],
  }),
  component: PinkCardPage,
});

let revealHasRun = false;

function getPinkCardKey(): string {
  try {
    const raw = localStorage.getItem("pt.user");
    if (raw) {
      const user = JSON.parse(raw) as { id: string };
      if (user?.id) return `pt.pinkCardResult.${user.id}`;
    }
  } catch { /* ignore */ }
  return "pt.pinkCardResult.guest";
}

function getSavedResult(): PinkCardResponse | null {
  try {
    const raw = localStorage.getItem(getPinkCardKey());
    return raw ? (JSON.parse(raw) as PinkCardResponse) : null;
  } catch {
    return null;
  }
}

type StatusScreen = "eligible" | "not-eligible" | "not-applied";

function useThreeJS(onReady: () => void) {
  useEffect(() => {
    if ((window as any).THREE) { onReady(); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.async = true;
    script.onload = onReady;
    document.head.appendChild(script);
  }, []);
}

function RevealEffect({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (revealHasRun) { onDone(); return; }
    revealHasRun = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDone();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) { onDone(); return; }

    const THREE = (window as any).THREE;
    if (!THREE) { onDone(); return; }

    const W = window.innerWidth;
    const H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);

    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
    camera.position.z = 75;

    const scene = new THREE.Scene();

    const vFOV = (75 * Math.PI) / 180;
    const wHeight = 2 * Math.tan(vFOV / 2) * 75;
    const wWidth = wHeight * (W / H);

    const OBJ_SIZE = 8;
    const THICKNESS = 3;
    const nx = Math.round(wWidth / OBJ_SIZE) + 1;
    const ny = Math.round(wHeight / OBJ_SIZE) + 1;

    scene.add(new THREE.AmbientLight(0x808080));
    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.z = 100;
    scene.add(pointLight);

    const CUBE_COLOR = 0xb5405e;
    const geometry = new THREE.BoxGeometry(OBJ_SIZE, OBJ_SIZE, THICKNESS);
    const meshes: any[] = [];

    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        const mat = new THREE.MeshLambertMaterial({
          color: CUBE_COLOR,
          transparent: true,
          opacity: 1,
        });
        const mesh = new THREE.Mesh(geometry, mat);
        mesh.position.set(
          -wWidth / 2 + i * OBJ_SIZE,
          -wHeight / 2 + j * OBJ_SIZE,
          0
        );
        scene.add(mesh);
        meshes.push(mesh);

        const delay = 1 + Math.random() * 1;
        const rotDuration = 2.0;
        const flyDelay = delay + 0.5;
        const flyDuration = 2.0;
        const rx = (Math.random() - 0.5) * 2 * Math.PI;
        const ry = (Math.random() - 0.5) * 2 * Math.PI;
        const rz = (Math.random() - 0.5) * 2 * Math.PI;
        (mesh as any)._anim = { delay, rotDuration, flyDelay, flyDuration, rx, ry, rz };
      }
    }

    let startTime: number | null = null;
    let rafId: number;
    let finished = false;

    function easeOutQuad(t: number) { return t * (2 - t); }
    function linear(t: number) { return t; }

    function animate(ts: number) {
      if (finished) return;
      rafId = requestAnimationFrame(animate);
      if (startTime === null) startTime = ts;
      const elapsed = (ts - startTime) / 1000;
      let allDone = true;

      for (const mesh of meshes) {
        const a = mesh._anim;
        if (elapsed >= a.delay) {
          const tRot = Math.min((elapsed - a.delay) / a.rotDuration, 1);
          mesh.rotation.x = a.rx * linear(tRot);
          mesh.rotation.y = a.ry * linear(tRot);
          mesh.rotation.z = a.rz * linear(tRot);
          if (tRot < 1) allDone = false;
        } else { allDone = false; }

        if (elapsed >= a.flyDelay) {
          const tFly = Math.min((elapsed - a.flyDelay) / a.flyDuration, 1);
          mesh.position.z = 80 * easeOutQuad(tFly);
          mesh.material.opacity = 1 - tFly;
          if (tFly < 1) allDone = false;
        } else { allDone = false; }
      }

      renderer.render(scene, camera);

      if (allDone) {
        finished = true;
        cancelAnimationFrame(rafId);
        setTimeout(() => onDone(), 80);
      }
    }

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      renderer.dispose();
      revealHasRun = false;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        zIndex: 9999, pointerEvents: "none",
      }}
    />
  );
}

function PinkCardPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const [statusScreen, setStatusScreen] = useState<StatusScreen | null>(null);
  const [savedResult, setSavedResult] = useState<PinkCardResponse | null>(null);
  const [threeReady, setThreeReady] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useThreeJS(() => setThreeReady(true));

  const checks = [
    { icon: UserRound, title: t("pc.w1"), body: t("pc.w1sub") },
    { icon: MapPin, title: t("pc.w2"), body: t("pc.w2sub") },
    { icon: IndianRupee, title: t("pc.w3"), body: t("pc.w3sub") },
  ];

  function handleApplyNow() {
    requireAuth(() => {
      const saved = getSavedResult();
      if (saved) {
        setSavedResult(saved);
        setStatusScreen(saved.eligible ? "eligible" : "not-eligible");
        return;
      }
      navigate({ to: "/pink-card-apply" });
    });
  }

  function handleCheckStatus() {
    requireAuth(() => {
      const saved = getSavedResult();
      if (saved) {
        setSavedResult(saved);
        setStatusScreen(saved.eligible ? "eligible" : "not-eligible");
      } else {
        setStatusScreen("not-applied");
      }
    });
  }

  if (statusScreen) {
    return (
      <PageShell theme="rose" backHome hideFooter>
        <section className="relative -mt-[88px] flex min-h-[100svh] items-center justify-center overflow-hidden pb-24 pt-[150px]">
          <img src={navyBg} alt="" width={1920} height={1088} className="absolute inset-0 size-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-black/65" />
          <div className="relative z-10 w-full max-w-[500px] px-6 text-center">
            {statusScreen === "not-applied" && (
              <>
                <ClipboardList className="mx-auto size-16 text-ink-muted" strokeWidth={1.25} />
                <h1 className="mt-5 font-display text-[34px] text-ink">Not Applied Yet</h1>
                <p className="mt-3 font-sans text-[14px] text-ink-muted">
                  You haven't applied for the Pink Card yet. Complete the 4-step verification to check your eligibility for zero-fare bus travel.
                </p>
                <div className="mt-6 rounded-[14px] border border-white/15 bg-white/5 p-5 text-left">
                  <div className="flex items-start gap-3 py-2">
                    <UserRound className="mt-0.5 size-4 shrink-0 text-rose" strokeWidth={1.5} />
                    <p className="font-sans text-[13px] text-ink-muted">Must be a female applicant</p>
                  </div>
                  <div className="flex items-start gap-3 py-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-rose" strokeWidth={1.5} />
                    <p className="font-sans text-[13px] text-ink-muted">Must be a state resident</p>
                  </div>
                  <div className="flex items-start gap-3 py-2">
                    <IndianRupee className="mt-0.5 size-4 shrink-0 text-rose" strokeWidth={1.5} />
                    <p className="font-sans text-[13px] text-ink-muted">Annual family income below ₹2,50,000</p>
                  </div>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Button variant="pinkSolid" size="lg" onClick={() => navigate({ to: "/pink-card-apply" })}>Apply Now →</Button>
                  <Button variant="outline" size="lg" onClick={() => setStatusScreen(null)}>Back</Button>
                </div>
              </>
            )}
            {statusScreen === "eligible" && savedResult && (
              <>
                <CheckCircle2 className="mx-auto size-16 text-green-400" strokeWidth={1.5} />
                <h1 className="mt-5 font-display text-[34px] text-ink">You're Eligible! 🌸</h1>
                <p className="mt-3 font-sans text-[14px] text-ink-muted">
                  Your Pink Card is active. Your next ticket booking will automatically be <strong className="text-rose">₹0</strong>.
                </p>
                <div className="mt-6 rounded-[14px] border border-green-500/30 bg-green-500/10 p-5 text-left">
                  <Row label="PAN" value={savedResult.pan} />
                  <Row label="Annual Income" value={`₹${savedResult.annual_income.toLocaleString("en-IN")}`} />
                  <Row label="Threshold" value={`₹${savedResult.threshold.toLocaleString("en-IN")}`} />
                  <Row label="Reason" value={savedResult.reason_message} />
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Button variant="pinkSolid" size="lg" onClick={() => navigate({ to: "/book" })}>Book a Free Ticket →</Button>
                  <Button variant="outline" size="lg" onClick={() => setStatusScreen(null)}>Back</Button>
                </div>
              </>
            )}
            {statusScreen === "not-eligible" && savedResult && (
              <>
                <XCircle className="mx-auto size-16 text-destructive" strokeWidth={1.5} />
                <h1 className="mt-5 font-display text-[34px] text-ink">Not Eligible</h1>
                <p className="mt-3 font-sans text-[14px] text-ink-muted">{savedResult.reason_message}</p>
                <div className="mt-6 rounded-[14px] border border-destructive/30 bg-destructive/10 p-5 text-left">
                  <Row label="PAN" value={savedResult.pan} />
                  <Row label="Reason Code" value={savedResult.reason_code} />
                  {savedResult.annual_income > 0 && (
                    <Row label="Annual Income" value={`₹${savedResult.annual_income.toLocaleString("en-IN")}`} />
                  )}
                </div>
                <div className="mt-5 rounded-[12px] border border-white/10 bg-white/5 p-4 text-left">
                  {savedResult.reason_code === "INELIGIBLE_GENDER" && (
                    <p className="font-sans text-[13px] text-ink-muted">The Pink Card scheme is available only to female applicants as per government guidelines.</p>
                  )}
                  {savedResult.reason_code === "INELIGIBLE_INCOME_HIGH" && (
                    <p className="font-sans text-[13px] text-ink-muted">Your annual income exceeds the ₹{savedResult.threshold.toLocaleString("en-IN")} threshold. You are ₹{Math.abs(savedResult.gap).toLocaleString("en-IN")} above the limit.</p>
                  )}
                  {savedResult.reason_code === "INELIGIBLE_NO_RECORD" && (
                    <p className="font-sans text-[13px] text-ink-muted">No income record was found for this PAN. Please check the PAN number or contact support.</p>
                  )}
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Button variant="outline" size="lg" onClick={() => { localStorage.removeItem(getPinkCardKey()); setStatusScreen(null); navigate({ to: "/pink-card-apply" }); }}>Try Another PAN</Button>
                  <Button variant="outline" size="lg" onClick={() => setStatusScreen(null)}>Back</Button>
                </div>
              </>
            )}
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <>
      {!threeReady && !revealed && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "#0b0a10", pointerEvents: "none" }} />
      )}
      {threeReady && !revealed && (
        <RevealEffect onDone={() => setRevealed(true)} />
      )}

      <PageShell theme="rose" backHome>
        <section className="relative -mt-[88px] flex min-h-[100svh] items-center overflow-hidden pt-[88px]">
          <img src={glowBg} alt="" width={1920} height={1088} className="absolute inset-0 size-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-x-0 bottom-0 h-52 bg-linear-to-b from-transparent to-canvas" />

          <div className="relative z-10 mx-auto grid w-full max-w-[1240px] items-center gap-16 px-6 py-24 lg:grid-cols-2">
            <Reveal>
              <h1 className="font-display text-[40px] leading-[1.12] text-ink sm:text-[52px]">
                {t("pc.title")}
                <br />
                {t("pc.title2")} <span className="text-rose">{t("pc.title2Accent")}</span>
              </h1>
              <span className="mt-5 block h-0.5 w-24 bg-rose" />
              <p className="mt-7 max-w-[460px] font-sans text-[13.5px] leading-relaxed text-ink-muted">
                {t("pc.body")}
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Button variant="outline" size="md" className="font-display text-[15px] font-medium" onClick={handleApplyNow}>
                  {t("pc.apply")}
                </Button>
                <Button variant="pinkSolid" size="md" className="font-display text-[15px] font-medium" onClick={handleCheckStatus}>
                  {t("pc.status")}
                </Button>
              </div>
              <p className="mt-8 flex items-center gap-2 font-display text-[13px] text-ink-muted">
                <ShieldCheck className="size-4 text-rose" strokeWidth={1.5} />
                {t("pc.note")}
              </p>
            </Reveal>

            <Reveal delay={150} className="flex justify-center">
              <PinkCard3D />
            </Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden bg-canvas py-[130px]">
          <div aria-hidden className="rose-glow absolute -left-32 bottom-0 size-[380px]" />
          <div aria-hidden className="rose-glow absolute -right-32 top-0 size-[380px]" />
          <div className="relative mx-auto max-w-[1040px] px-6 text-center">
            <Reveal>
              <h2 className="font-display text-[34px] text-ink sm:text-[42px]">{t("pc.whoTitle")}</h2>
              <span className="mx-auto mt-4 block h-0.5 w-28 bg-rose" />
              <p className="mt-5 font-sans text-[13px] text-ink-muted">{t("pc.whoSub")}</p>
            </Reveal>
            <div className="relative mt-16 grid gap-12 sm:grid-cols-3">
              <span aria-hidden className="absolute left-[16%] right-[16%] top-[34px] hidden h-px bg-rose/30 sm:block" />
              {checks.map(({ icon: Icon, title, body }, i) => (
                <Reveal key={title} delay={i * 120} className="relative flex flex-col items-center">
                  <span className="flex size-[68px] items-center justify-center rounded-full border border-rose/60 bg-canvas">
                    <Icon className="size-6 text-rose-bright" strokeWidth={1.5} />
                  </span>
                  <p className="mt-6 font-sans text-[12px] uppercase tracking-[0.16em] text-ink">{title}</p>
                  <p className="mt-4 max-w-[220px] font-display text-[17px] leading-relaxed text-ink/85">{body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </PageShell>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="font-sans text-[12px] text-ink-muted">{label}</span>
      <span className="font-sans text-[13px] text-ink">{value}</span>
    </div>
  );
}

// ── 3D Pink Card with mouse tracking ─────────────────────────────────────────

function PinkCard3D() {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const currentRotRef = useRef({ x: 0, y: 0 });
  const targetRotRef = useRef({ x: 0, y: 0 });
  const shadowRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const isMobile = window.matchMedia("(hover: none)").matches;

    if (isMobile) {
      let t = 0;
      function autoRotate() {
        t += 0.012;
        const rx = Math.sin(t * 0.7) * 10;
        const ry = Math.sin(t) * 14;
        if (cardRef.current) {
          cardRef.current.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        }
        rafRef.current = requestAnimationFrame(autoRotate);
      }
      rafRef.current = requestAnimationFrame(autoRotate);
      return () => cancelAnimationFrame(rafRef.current);
    }

    function onMouseMove(e: MouseEvent) {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (window.innerWidth / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);
      targetRotRef.current = { x: -dy * 18, y: dx * 22 };
      shadowRef.current = { x: -dx * 20, y: dy * 20 };
    }

    function onMouseLeave() {
      targetRotRef.current = { x: 0, y: 0 };
      shadowRef.current = { x: 0, y: 0 };
    }

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    function loop() {
      const cur = currentRotRef.current;
      const tgt = targetRotRef.current;
      cur.x = lerp(cur.x, tgt.x, 0.08);
      cur.y = lerp(cur.y, tgt.y, 0.08);

      if (cardRef.current) {
        cardRef.current.style.transform =
          `perspective(1000px) rotateX(${cur.x}deg) rotateY(${cur.y}deg)`;
        cardRef.current.style.boxShadow =
          `${shadowRef.current.x}px ${shadowRef.current.y}px 60px rgba(0,0,0,0.6), 0 30px 70px rgba(0,0,0,0.5)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="relative flex w-full max-w-[420px] flex-col items-center">
      <div style={{ perspective: "1000px", transformStyle: "preserve-3d" }}>
        <div
          ref={cardRef}
          style={{
            transformStyle: "preserve-3d",
            transition: "box-shadow 0.1s ease",
            borderRadius: "16px",
            boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
            cursor: "pointer",
            overflow: "hidden",
          }}
        >
          <img
            src="/pink-card-visual.png"
            alt="Pink Card"
            draggable={false}
            style={{
              display: "block",
              width: "420px",
              aspectRatio: "1.586",
              objectFit: "cover",
              borderRadius: "16px",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* Shadow ellipse below card */}
      <div className="relative mt-6 h-14 w-[78%]">
        <span aria-hidden className="anim-pulse-glow absolute inset-x-[-14%] top-1 h-14 rounded-[50%] bg-rose-glow/45 blur-2xl" />
        <span className="absolute inset-0 rounded-[50%] border border-rose-glow/70 bg-[#0b0a10]" />
      </div>
    </div>
  );
}


// import { createFileRoute, useNavigate } from "@tanstack/react-router";
// import {
//   Bus,
//   CheckCircle2,
//   ClipboardList,
//   IndianRupee,
//   Loader2,
//   MapPin,
//   ShieldCheck,
//   UserRound,
//   Wifi,
//   XCircle,
// } from "lucide-react";
// import glowBg from "@/assets/pink-glow-bg.jpg";
// import navyBg from "@/assets/night-street-navy.jpg";
// import { PageShell } from "@/components/PageShell";
// import { Reveal } from "@/components/Reveal";
// import { Button } from "@/components/Button";
// import { useI18n } from "@/i18n/LanguageProvider";
// import { type PinkCardResponse } from "@/lib/api";
// import { useEffect, useRef, useState } from "react";
// import { useAuth } from "@/auth/AuthProvider";

// export const Route = createFileRoute("/pink-card")({
//   head: () => ({
//     meta: [
//       { title: "The Pink Card — Free Verified Bus Travel for Women | Public Transit" },
//       {
//         name: "description",
//         content:
//           "Apply for the Pink Card and get zero-fare bus travel across all public transit services. Encrypted, government-linked, verified in minutes.",
//       },
//       {
//         property: "og:title",
//         content: "The Pink Card — Free Verified Bus Travel for Women",
//       },
//       {
//         property: "og:description",
//         content:
//           "Zero-fare bus travel for eligible women — encrypted, government-linked, verified in minutes.",
//       },
//     ],
//   }),
//   component: PinkCardPage,
// });

// let revealHasRun = false;

// function getPinkCardKey(): string {
//   try {
//     const raw = localStorage.getItem("pt.user");
//     if (raw) {
//       const user = JSON.parse(raw) as { id: string };
//       if (user?.id) return `pt.pinkCardResult.${user.id}`;
//     }
//   } catch { /* ignore */ }
//   return "pt.pinkCardResult.guest";
// }

// function getSavedResult(): PinkCardResponse | null {
//   try {
//     const raw = localStorage.getItem(getPinkCardKey());
//     return raw ? (JSON.parse(raw) as PinkCardResponse) : null;
//   } catch {
//     return null;
//   }
// }

// type StatusScreen = "eligible" | "not-eligible" | "not-applied";

// function useThreeJS(onReady: () => void) {
//   useEffect(() => {
//     if ((window as any).THREE) { onReady(); return; }
//     const script = document.createElement("script");
//     script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
//     script.async = true;
//     script.onload = onReady;
//     document.head.appendChild(script);
//   }, []);
// }

// function RevealEffect({ onDone }: { onDone: () => void }) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     if (revealHasRun) { onDone(); return; }
//     revealHasRun = true;

//     if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
//       onDone();
//       return;
//     }

//     const canvas = canvasRef.current;
//     if (!canvas) { onDone(); return; }

//     const THREE = (window as any).THREE;
//     if (!THREE) { onDone(); return; }

//     const W = window.innerWidth;
//     const H = window.innerHeight;

//     const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
//     renderer.setClearColor(0x000000, 0);
//     renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
//     renderer.setSize(W, H);

//     const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
//     camera.position.z = 75;

//     const scene = new THREE.Scene();

//     const vFOV = (75 * Math.PI) / 180;
//     const wHeight = 2 * Math.tan(vFOV / 2) * 75;
//     const wWidth = wHeight * (W / H);

//     const OBJ_SIZE = 8;
//     const THICKNESS = 3;
//     const nx = Math.round(wWidth / OBJ_SIZE) + 1;
//     const ny = Math.round(wHeight / OBJ_SIZE) + 1;

//     scene.add(new THREE.AmbientLight(0x808080));
//     const pointLight = new THREE.PointLight(0xffffff);
//     pointLight.position.z = 100;
//     scene.add(pointLight);

//     const CUBE_COLOR = 0xb5405e;
//     const geometry = new THREE.BoxGeometry(OBJ_SIZE, OBJ_SIZE, THICKNESS);
//     const meshes: any[] = [];

//     for (let i = 0; i < nx; i++) {
//       for (let j = 0; j < ny; j++) {
//         const mat = new THREE.MeshLambertMaterial({
//           color: CUBE_COLOR,
//           transparent: true,
//           opacity: 1,
//         });
//         const mesh = new THREE.Mesh(geometry, mat);
//         mesh.position.set(
//           -wWidth / 2 + i * OBJ_SIZE,
//           -wHeight / 2 + j * OBJ_SIZE,
//           0
//         );
//         scene.add(mesh);
//         meshes.push(mesh);

//         const delay = 1 + Math.random() * 1;
//         const rotDuration = 2.0;
//         const flyDelay = delay + 0.5;
//         const flyDuration = 2.0;
//         const rx = (Math.random() - 0.5) * 2 * Math.PI;
//         const ry = (Math.random() - 0.5) * 2 * Math.PI;
//         const rz = (Math.random() - 0.5) * 2 * Math.PI;
//         (mesh as any)._anim = { delay, rotDuration, flyDelay, flyDuration, rx, ry, rz };
//       }
//     }

//     let startTime: number | null = null;
//     let rafId: number;
//     let finished = false;

//     function easeOutQuad(t: number) { return t * (2 - t); }
//     function linear(t: number) { return t; }

//     function animate(ts: number) {
//       if (finished) return;
//       rafId = requestAnimationFrame(animate);
//       if (startTime === null) startTime = ts;
//       const elapsed = (ts - startTime) / 1000;
//       let allDone = true;

//       for (const mesh of meshes) {
//         const a = mesh._anim;
//         if (elapsed >= a.delay) {
//           const tRot = Math.min((elapsed - a.delay) / a.rotDuration, 1);
//           mesh.rotation.x = a.rx * linear(tRot);
//           mesh.rotation.y = a.ry * linear(tRot);
//           mesh.rotation.z = a.rz * linear(tRot);
//           if (tRot < 1) allDone = false;
//         } else { allDone = false; }

//         if (elapsed >= a.flyDelay) {
//           const tFly = Math.min((elapsed - a.flyDelay) / a.flyDuration, 1);
//           mesh.position.z = 80 * easeOutQuad(tFly);
//           mesh.material.opacity = 1 - tFly;
//           if (tFly < 1) allDone = false;
//         } else { allDone = false; }
//       }

//       renderer.render(scene, camera);

//       if (allDone) {
//         finished = true;
//         cancelAnimationFrame(rafId);
//         setTimeout(() => onDone(), 80);
//       }
//     }

//     rafId = requestAnimationFrame(animate);

//     return () => {
//       cancelAnimationFrame(rafId);
//       renderer.dispose();
//       revealHasRun = false;
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{
//         position: "fixed", inset: 0, width: "100%", height: "100%",
//         zIndex: 9999, pointerEvents: "none",
//       }}
//     />
//   );
// }

// function PinkCardPage() {
//   const { t } = useI18n();
//   const navigate = useNavigate();
//   const { requireAuth } = useAuth();
//   const [statusScreen, setStatusScreen] = useState<StatusScreen | null>(null);
//   const [savedResult, setSavedResult] = useState<PinkCardResponse | null>(null);
//   const [threeReady, setThreeReady] = useState(false);
//   const [revealed, setRevealed] = useState(false);

//   useThreeJS(() => setThreeReady(true));

//   const checks = [
//     { icon: UserRound, title: t("pc.w1"), body: t("pc.w1sub") },
//     { icon: MapPin, title: t("pc.w2"), body: t("pc.w2sub") },
//     { icon: IndianRupee, title: t("pc.w3"), body: t("pc.w3sub") },
//   ];

//   function handleApplyNow() {
//     requireAuth(() => {
//       const saved = getSavedResult();
//       if (saved) {
//         setSavedResult(saved);
//         setStatusScreen(saved.eligible ? "eligible" : "not-eligible");
//         return;
//       }
//       navigate({ to: "/pink-card-apply" });
//     });
//   }

//   function handleCheckStatus() {
//     requireAuth(() => {
//       const saved = getSavedResult();
//       if (saved) {
//         setSavedResult(saved);
//         setStatusScreen(saved.eligible ? "eligible" : "not-eligible");
//       } else {
//         setStatusScreen("not-applied");
//       }
//     });
//   }

//   if (statusScreen) {
//     return (
//       <PageShell theme="rose" backHome hideFooter>
//         <section className="relative -mt-[88px] flex min-h-[100svh] items-center justify-center overflow-hidden pb-24 pt-[150px]">
//           <img src={navyBg} alt="" width={1920} height={1088} className="absolute inset-0 size-full object-cover opacity-40" />
//           <div className="absolute inset-0 bg-black/65" />
//           <div className="relative z-10 w-full max-w-[500px] px-6 text-center">
//             {statusScreen === "not-applied" && (
//               <>
//                 <ClipboardList className="mx-auto size-16 text-ink-muted" strokeWidth={1.25} />
//                 <h1 className="mt-5 font-display text-[34px] text-ink">Not Applied Yet</h1>
//                 <p className="mt-3 font-sans text-[14px] text-ink-muted">
//                   You haven't applied for the Pink Card yet. Complete the 4-step verification to check your eligibility for zero-fare bus travel.
//                 </p>
//                 <div className="mt-6 rounded-[14px] border border-white/15 bg-white/5 p-5 text-left">
//                   <div className="flex items-start gap-3 py-2">
//                     <UserRound className="mt-0.5 size-4 shrink-0 text-rose" strokeWidth={1.5} />
//                     <p className="font-sans text-[13px] text-ink-muted">Must be a female applicant</p>
//                   </div>
//                   <div className="flex items-start gap-3 py-2">
//                     <MapPin className="mt-0.5 size-4 shrink-0 text-rose" strokeWidth={1.5} />
//                     <p className="font-sans text-[13px] text-ink-muted">Must be a state resident</p>
//                   </div>
//                   <div className="flex items-start gap-3 py-2">
//                     <IndianRupee className="mt-0.5 size-4 shrink-0 text-rose" strokeWidth={1.5} />
//                     <p className="font-sans text-[13px] text-ink-muted">Annual family income below ₹2,50,000</p>
//                   </div>
//                 </div>
//                 <div className="mt-8 flex flex-wrap justify-center gap-4">
//                   <Button variant="pinkSolid" size="lg" onClick={() => navigate({ to: "/pink-card-apply" })}>Apply Now →</Button>
//                   <Button variant="outline" size="lg" onClick={() => setStatusScreen(null)}>Back</Button>
//                 </div>
//               </>
//             )}
//             {statusScreen === "eligible" && savedResult && (
//               <>
//                 <CheckCircle2 className="mx-auto size-16 text-green-400" strokeWidth={1.5} />
//                 <h1 className="mt-5 font-display text-[34px] text-ink">You're Eligible! 🌸</h1>
//                 <p className="mt-3 font-sans text-[14px] text-ink-muted">
//                   Your Pink Card is active. Your next ticket booking will automatically be <strong className="text-rose">₹0</strong>.
//                 </p>
//                 <div className="mt-6 rounded-[14px] border border-green-500/30 bg-green-500/10 p-5 text-left">
//                   <Row label="PAN" value={savedResult.pan} />
//                   <Row label="Annual Income" value={`₹${savedResult.annual_income.toLocaleString("en-IN")}`} />
//                   <Row label="Threshold" value={`₹${savedResult.threshold.toLocaleString("en-IN")}`} />
//                   <Row label="Reason" value={savedResult.reason_message} />
//                 </div>
//                 <div className="mt-8 flex flex-wrap justify-center gap-4">
//                   <Button variant="pinkSolid" size="lg" onClick={() => navigate({ to: "/book" })}>Book a Free Ticket →</Button>
//                   <Button variant="outline" size="lg" onClick={() => setStatusScreen(null)}>Back</Button>
//                 </div>
//               </>
//             )}
//             {statusScreen === "not-eligible" && savedResult && (
//               <>
//                 <XCircle className="mx-auto size-16 text-destructive" strokeWidth={1.5} />
//                 <h1 className="mt-5 font-display text-[34px] text-ink">Not Eligible</h1>
//                 <p className="mt-3 font-sans text-[14px] text-ink-muted">{savedResult.reason_message}</p>
//                 <div className="mt-6 rounded-[14px] border border-destructive/30 bg-destructive/10 p-5 text-left">
//                   <Row label="PAN" value={savedResult.pan} />
//                   <Row label="Reason Code" value={savedResult.reason_code} />
//                   {savedResult.annual_income > 0 && (
//                     <Row label="Annual Income" value={`₹${savedResult.annual_income.toLocaleString("en-IN")}`} />
//                   )}
//                 </div>
//                 <div className="mt-5 rounded-[12px] border border-white/10 bg-white/5 p-4 text-left">
//                   {savedResult.reason_code === "INELIGIBLE_GENDER" && (
//                     <p className="font-sans text-[13px] text-ink-muted">The Pink Card scheme is available only to female applicants as per government guidelines.</p>
//                   )}
//                   {savedResult.reason_code === "INELIGIBLE_INCOME_HIGH" && (
//                     <p className="font-sans text-[13px] text-ink-muted">Your annual income exceeds the ₹{savedResult.threshold.toLocaleString("en-IN")} threshold. You are ₹{Math.abs(savedResult.gap).toLocaleString("en-IN")} above the limit.</p>
//                   )}
//                   {savedResult.reason_code === "INELIGIBLE_NO_RECORD" && (
//                     <p className="font-sans text-[13px] text-ink-muted">No income record was found for this PAN. Please check the PAN number or contact support.</p>
//                   )}
//                 </div>
//                 <div className="mt-8 flex flex-wrap justify-center gap-4">
//                   <Button variant="outline" size="lg" onClick={() => { localStorage.removeItem(getPinkCardKey()); setStatusScreen(null); navigate({ to: "/pink-card-apply" }); }}>Try Another PAN</Button>
//                   <Button variant="outline" size="lg" onClick={() => setStatusScreen(null)}>Back</Button>
//                 </div>
//               </>
//             )}
//           </div>
//         </section>
//       </PageShell>
//     );
//   }

//   return (
//     <>
//       {!threeReady && !revealed && (
//         <div style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "#0b0a10", pointerEvents: "none" }} />
//       )}
//       {threeReady && !revealed && (
//         <RevealEffect onDone={() => setRevealed(true)} />
//       )}

//       <PageShell theme="rose" backHome>
//         <section className="relative -mt-[88px] flex min-h-[100svh] items-center overflow-hidden pt-[88px]">
//           <img src={glowBg} alt="" width={1920} height={1088} className="absolute inset-0 size-full object-cover opacity-70" />
//           <div className="absolute inset-0 bg-black/55" />
//           <div className="absolute inset-x-0 bottom-0 h-52 bg-linear-to-b from-transparent to-canvas" />

//           <div className="relative z-10 mx-auto grid w-full max-w-[1240px] items-center gap-16 px-6 py-24 lg:grid-cols-2">
//             <Reveal>
//               <h1 className="font-display text-[40px] leading-[1.12] text-ink sm:text-[52px]">
//                 {t("pc.title")}
//                 <br />
//                 {t("pc.title2")} <span className="text-rose">{t("pc.title2Accent")}</span>
//               </h1>
//               <span className="mt-5 block h-0.5 w-24 bg-rose" />
//               <p className="mt-7 max-w-[460px] font-sans text-[13.5px] leading-relaxed text-ink-muted">
//                 {t("pc.body")}
//               </p>
//               <div className="mt-9 flex flex-wrap gap-4">
//                 <Button variant="outline" size="md" className="font-display text-[15px] font-medium" onClick={handleApplyNow}>
//                   {t("pc.apply")}
//                 </Button>
//                 <Button variant="pinkSolid" size="md" className="font-display text-[15px] font-medium" onClick={handleCheckStatus}>
//                   {t("pc.status")}
//                 </Button>
//               </div>
//               <p className="mt-8 flex items-center gap-2 font-display text-[13px] text-ink-muted">
//                 <ShieldCheck className="size-4 text-rose" strokeWidth={1.5} />
//                 {t("pc.note")}
//               </p>
//             </Reveal>

//             <Reveal delay={150} className="flex justify-center">
//               <PinkCard3D />
//             </Reveal>
//           </div>
//         </section>

//         <section className="relative overflow-hidden bg-canvas py-[130px]">
//           <div aria-hidden className="rose-glow absolute -left-32 bottom-0 size-[380px]" />
//           <div aria-hidden className="rose-glow absolute -right-32 top-0 size-[380px]" />
//           <div className="relative mx-auto max-w-[1040px] px-6 text-center">
//             <Reveal>
//               <h2 className="font-display text-[34px] text-ink sm:text-[42px]">{t("pc.whoTitle")}</h2>
//               <span className="mx-auto mt-4 block h-0.5 w-28 bg-rose" />
//               <p className="mt-5 font-sans text-[13px] text-ink-muted">{t("pc.whoSub")}</p>
//             </Reveal>
//             <div className="relative mt-16 grid gap-12 sm:grid-cols-3">
//               <span aria-hidden className="absolute left-[16%] right-[16%] top-[34px] hidden h-px bg-rose/30 sm:block" />
//               {checks.map(({ icon: Icon, title, body }, i) => (
//                 <Reveal key={title} delay={i * 120} className="relative flex flex-col items-center">
//                   <span className="flex size-[68px] items-center justify-center rounded-full border border-rose/60 bg-canvas">
//                     <Icon className="size-6 text-rose-bright" strokeWidth={1.5} />
//                   </span>
//                   <p className="mt-6 font-sans text-[12px] uppercase tracking-[0.16em] text-ink">{title}</p>
//                   <p className="mt-4 max-w-[220px] font-display text-[17px] leading-relaxed text-ink/85">{body}</p>
//                 </Reveal>
//               ))}
//             </div>
//           </div>
//         </section>
//       </PageShell>
//     </>
//   );
// }

// function Row({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="flex items-center justify-between py-2">
//       <span className="font-sans text-[12px] text-ink-muted">{label}</span>
//       <span className="font-sans text-[13px] text-ink">{value}</span>
//     </div>
//   );
// }

// // ── 3D Pink Card with mouse tracking ─────────────────────────────────────────

// function PinkCard3D() {
//   const { t } = useI18n();
//   const cardRef = useRef<HTMLDivElement>(null);
//   const rafRef = useRef<number>(0);
//   const currentRotRef = useRef({ x: 0, y: 0 });
//   const targetRotRef = useRef({ x: 0, y: 0 });
//   const shadowRef = useRef({ x: 0, y: 0 });

//   useEffect(() => {
//     const isMobile = window.matchMedia("(hover: none)").matches;

//     if (isMobile) {
//       // Auto-rotate on mobile
//       let t = 0;
//       function autoRotate() {
//         t += 0.012;
//         const rx = Math.sin(t * 0.7) * 10;
//         const ry = Math.sin(t) * 14;
//         if (cardRef.current) {
//           cardRef.current.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
//         }
//         rafRef.current = requestAnimationFrame(autoRotate);
//       }
//       rafRef.current = requestAnimationFrame(autoRotate);
//       return () => cancelAnimationFrame(rafRef.current);
//     }

//     function onMouseMove(e: MouseEvent) {
//       const card = cardRef.current;
//       if (!card) return;
//       const rect = card.getBoundingClientRect();
//       const cx = rect.left + rect.width / 2;
//       const cy = rect.top + rect.height / 2;
//       const dx = (e.clientX - cx) / (window.innerWidth / 2);
//       const dy = (e.clientY - cy) / (window.innerHeight / 2);
//       targetRotRef.current = { x: -dy * 18, y: dx * 22 };
//       shadowRef.current = { x: -dx * 20, y: dy * 20 };
//     }

//     function onMouseLeave() {
//       targetRotRef.current = { x: 0, y: 0 };
//       shadowRef.current = { x: 0, y: 0 };
//     }

//     function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

//     function loop() {
//       const cur = currentRotRef.current;
//       const tgt = targetRotRef.current;
//       cur.x = lerp(cur.x, tgt.x, 0.08);
//       cur.y = lerp(cur.y, tgt.y, 0.08);

//       if (cardRef.current) {
//         cardRef.current.style.transform =
//           `perspective(1000px) rotateX(${cur.x}deg) rotateY(${cur.y}deg)`;
//         cardRef.current.style.boxShadow =
//           `${shadowRef.current.x}px ${shadowRef.current.y}px 60px rgba(0,0,0,0.6), 0 30px 70px rgba(0,0,0,0.5)`;
//       }
//       rafRef.current = requestAnimationFrame(loop);
//     }

//     window.addEventListener("mousemove", onMouseMove);
//     window.addEventListener("mouseleave", onMouseLeave);
//     rafRef.current = requestAnimationFrame(loop);

//     return () => {
//       window.removeEventListener("mousemove", onMouseMove);
//       window.removeEventListener("mouseleave", onMouseLeave);
//       cancelAnimationFrame(rafRef.current);
//     };
//   }, []);

//   return (
//     <div className="relative flex w-full max-w-[420px] flex-col items-center">
//       {/* Card wrapper — perspective container */}
//       <div style={{ perspective: "1000px", transformStyle: "preserve-3d" }}>
//         <div
//           ref={cardRef}
//           style={{
//             transformStyle: "preserve-3d",
//             transition: "box-shadow 0.1s ease",
//             width: "420px",
//             aspectRatio: "1.586",
//             borderRadius: "16px",
//             background: "linear-gradient(135deg, #c2185b 0%, #880e4f 50%, #6a0436 100%)",
//             position: "relative",
//             overflow: "hidden",
//             boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
//             cursor: "pointer",
//           }}
//         >
//           {/* Wavy background lines — base layer */}
//           <svg
//             style={{
//               position: "absolute", inset: 0, width: "100%", height: "100%",
//               opacity: 0.15, transform: "translateZ(0px)",
//             }}
//             viewBox="0 0 420 265"
//             preserveAspectRatio="none"
//           >
//             {[0, 30, 60, 90, 120, 150, 180].map((offset, i) => (
//               <path
//                 key={i}
//                 d={`M-50,${80 + offset} Q105,${40 + offset} 210,${80 + offset} T470,${80 + offset}`}
//                 fill="none"
//                 stroke="white"
//                 strokeWidth="1.5"
//               />
//             ))}
//           </svg>

//           {/* Woman silhouette — low depth */}
//           <div
//             style={{
//               position: "absolute", right: 0, top: 0, bottom: 0,
//               width: "55%", opacity: 0.18,
//               transform: "translateZ(4px)",
//               background: "radial-gradient(ellipse at 70% 40%, rgba(255,255,255,0.3) 0%, transparent 70%)",
//             }}
//           >
//             <svg viewBox="0 0 200 265" style={{ width: "100%", height: "100%" }}>
//               <ellipse cx="120" cy="60" rx="28" ry="32" fill="rgba(255,255,255,0.6)" />
//               <path d="M92,92 Q80,120 75,160 Q90,170 120,172 Q150,170 165,160 Q160,120 148,92 Q135,85 120,84 Q105,85 92,92Z" fill="rgba(255,255,255,0.6)" />
//               <path d="M75,158 Q60,180 58,220 Q70,225 85,222 Q90,190 95,165Z" fill="rgba(255,255,255,0.5)" />
//               <path d="M165,158 Q180,180 182,220 Q170,225 155,222 Q150,190 145,165Z" fill="rgba(255,255,255,0.5)" />
//             </svg>
//           </div>

//           {/* Shine overlay — moves with mouse via CSS */}
//           <div
//             style={{
//               position: "absolute", inset: 0,
//               background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
//               transform: "translateZ(2px)",
//               pointerEvents: "none",
//             }}
//           />

//           {/* Top row: brand + contactless */}
//           <div
//             style={{
//               position: "absolute", top: 20, left: 24, right: 24,
//               display: "flex", justifyContent: "space-between", alignItems: "center",
//               transform: "translateZ(20px)",
//               filter: "drop-shadow(-4px 4px 6px rgba(0,0,0,0.5))",
//             }}
//           >
//             <span style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.92)", fontSize: 12, fontFamily: "sans-serif" }}>
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
//                 <rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1" /><path d="m12 7-3-3-3 3" />
//               </svg>
//               {t("pc.brand")}
//             </span>
//             {/* Contactless wave */}
//             <svg width="24" height="24" viewBox="0 0 46 56" style={{ color: "rgba(255,255,255,0.8)" }}>
//               <path fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
//                 d="m35,3a50,50 0 0,1 0,50M24,8.5a39,39 0 0,1 0,39M13.5,13.55a28.2,28.5 0 0,1 0,28.5M3,19a18,17 0 0,1 0,18" />
//             </svg>
//           </div>

//           {/* PINK CARD title — highest depth, biggest shadow */}
//           <div
//             style={{
//               position: "absolute", top: 72, left: 24,
//               transform: "translateZ(40px)",
//               textShadow: "-6px 6px 8px rgba(0,0,0,0.7)",
//             }}
//           >
//             <p style={{ color: "white", fontSize: 28, fontWeight: 700, letterSpacing: 2, fontFamily: "sans-serif", margin: 0 }}>
//               PINK CARD
//             </p>
//             <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "sans-serif", marginTop: 4 }}>
//               {t("pc.cardTag")}
//             </p>
//           </div>

//           {/* Valid for text — medium depth */}
//           <div
//             style={{
//               position: "absolute", bottom: 48, left: 24,
//               transform: "translateZ(25px)",
//               textShadow: "-5px 5px 6px rgba(0,0,0,0.6)",
//             }}
//           >
//             <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 10, fontFamily: "sans-serif", maxWidth: 150, lineHeight: 1.4 }}>
//               {t("pc.cardValid")}
//             </p>
//           </div>

//           {/* ₹0 FARE + ✓ VERIFIED badges — highest depth */}
//           <div
//             style={{
//               position: "absolute", bottom: 20, right: 24,
//               display: "flex", gap: 8,
//               transform: "translateZ(50px)",
//               filter: "drop-shadow(-6px 6px 8px rgba(0,0,0,0.7))",
//             }}
//           >
//             <span style={{
//               background: "rgba(0,0,0,0.3)", borderRadius: 6, padding: "6px 10px",
//               textAlign: "center", backdropFilter: "blur(4px)",
//               border: "1px solid rgba(255,255,255,0.2)",
//             }}>
//               <span style={{ display: "block", color: "white", fontSize: 15, fontWeight: 700, fontFamily: "sans-serif" }}>₹0</span>
//               <span style={{ display: "block", color: "rgba(255,255,255,0.75)", fontSize: 7.5, letterSpacing: 1, fontFamily: "sans-serif" }}>
//                 {t("pc.cardFare")}
//               </span>
//             </span>
//             <span style={{
//               background: "rgba(0,0,0,0.3)", borderRadius: 6, padding: "6px 10px",
//               textAlign: "center", backdropFilter: "blur(4px)",
//               border: "1px solid rgba(255,255,255,0.2)",
//             }}>
//               <span style={{ display: "block", color: "white", fontSize: 15, fontFamily: "sans-serif" }}>✓</span>
//               <span style={{ display: "block", color: "rgba(255,255,255,0.75)", fontSize: 7.5, letterSpacing: 1, fontFamily: "sans-serif" }}>
//                 {t("pc.cardVerified")}
//               </span>
//             </span>
//           </div>

//           {/* Thickness layers for depth illusion */}
//           <div style={{
//             position: "absolute", inset: 0, borderRadius: 16,
//             background: "linear-gradient(135deg, #c2185b, #6a0436)",
//             transform: "translateZ(-4px)", zIndex: -1,
//           }} />
//           <div style={{
//             position: "absolute", inset: 0, borderRadius: 16,
//             background: "linear-gradient(135deg, #c2185b, #6a0436)",
//             transform: "translateZ(-8px)", zIndex: -2,
//           }} />
//         </div>
//       </div>

//       {/* Shadow ellipse below card */}
//       <div className="relative mt-6 h-14 w-[78%]">
//         <span aria-hidden className="anim-pulse-glow absolute inset-x-[-14%] top-1 h-14 rounded-[50%] bg-rose-glow/45 blur-2xl" />
//         <span className="absolute inset-0 rounded-[50%] border border-rose-glow/70 bg-[#0b0a10]" />
//       </div>
//     </div>
//   );
// }

