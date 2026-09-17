import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Bus,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  Loader2,
  MapPin,
  ShieldCheck,
  UserRound,
  Wifi,
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

// ── Module-level flag — StrictMode double-mount guard only ────────────────────
// Reset on unmount so animation replays every visit
let revealHasRun = false;

// ── Per-user key ──────────────────────────────────────────────────────────────

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

// ── Status screen type ────────────────────────────────────────────────────────

type StatusScreen = "eligible" | "not-eligible" | "not-applied";

// ── Three.js CDN loader ───────────────────────────────────────────────────────

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

// ── 3D Reveal Effect ──────────────────────────────────────────────────────────

function RevealEffect({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // StrictMode: first mount sets flag and runs; second mount sees flag and skips
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
        } else {
          allDone = false;
        }

        if (elapsed >= a.flyDelay) {
          const tFly = Math.min((elapsed - a.flyDelay) / a.flyDuration, 1);
          mesh.position.z = 80 * easeOutQuad(tFly);
          mesh.material.opacity = 1 - tFly;
          if (tFly < 1) allDone = false;
        } else {
          allDone = false;
        }
      }

      renderer.render(scene, camera);

      if (allDone) {
        finished = true;
        cancelAnimationFrame(rafId);
        setTimeout(() => onDone(), 80);
      }
    }

    rafId = requestAnimationFrame(animate);

    // ── FIX 1: reset flag on unmount so animation replays next visit ──
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
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
          <img
            src={navyBg}
            alt=""
            width={1920}
            height={1088}
            className="absolute inset-0 size-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-black/65" />
          <div className="relative z-10 w-full max-w-[500px] px-6 text-center">

            {statusScreen === "not-applied" && (
              <>
                <ClipboardList className="mx-auto size-16 text-ink-muted" strokeWidth={1.25} />
                <h1 className="mt-5 font-display text-[34px] text-ink">Not Applied Yet</h1>
                <p className="mt-3 font-sans text-[14px] text-ink-muted">
                  You haven't applied for the Pink Card yet. Complete the 4-step verification to
                  check your eligibility for zero-fare bus travel.
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
                    <p className="font-sans text-[13px] text-ink-muted">
                      Annual family income below ₹2,50,000
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Button variant="pinkSolid" size="lg" onClick={() => navigate({ to: "/pink-card-apply" })}>
                    Apply Now →
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => setStatusScreen(null)}>
                    Back
                  </Button>
                </div>
              </>
            )}

            {statusScreen === "eligible" && savedResult && (
              <>
                <CheckCircle2 className="mx-auto size-16 text-green-400" strokeWidth={1.5} />
                <h1 className="mt-5 font-display text-[34px] text-ink">You're Eligible! 🌸</h1>
                <p className="mt-3 font-sans text-[14px] text-ink-muted">
                  Your Pink Card is active. Your next ticket booking will automatically be{" "}
                  <strong className="text-rose">₹0</strong>.
                </p>
                <div className="mt-6 rounded-[14px] border border-green-500/30 bg-green-500/10 p-5 text-left">
                  <Row label="PAN" value={savedResult.pan} />
                  <Row label="Annual Income" value={`₹${savedResult.annual_income.toLocaleString("en-IN")}`} />
                  <Row label="Threshold" value={`₹${savedResult.threshold.toLocaleString("en-IN")}`} />
                  <Row label="Reason" value={savedResult.reason_message} />
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Button variant="pinkSolid" size="lg" onClick={() => navigate({ to: "/book" })}>
                    Book a Free Ticket →
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => setStatusScreen(null)}>
                    Back
                  </Button>
                </div>
              </>
            )}

            {statusScreen === "not-eligible" && savedResult && (
              <>
                <XCircle className="mx-auto size-16 text-destructive" strokeWidth={1.5} />
                <h1 className="mt-5 font-display text-[34px] text-ink">Not Eligible</h1>
                <p className="mt-3 font-sans text-[14px] text-ink-muted">
                  {savedResult.reason_message}
                </p>
                <div className="mt-6 rounded-[14px] border border-destructive/30 bg-destructive/10 p-5 text-left">
                  <Row label="PAN" value={savedResult.pan} />
                  <Row label="Reason Code" value={savedResult.reason_code} />
                  {savedResult.annual_income > 0 && (
                    <Row label="Annual Income" value={`₹${savedResult.annual_income.toLocaleString("en-IN")}`} />
                  )}
                </div>
                <div className="mt-5 rounded-[12px] border border-white/10 bg-white/5 p-4 text-left">
                  {savedResult.reason_code === "INELIGIBLE_GENDER" && (
                    <p className="font-sans text-[13px] text-ink-muted">
                      The Pink Card scheme is available only to female applicants as per government guidelines.
                    </p>
                  )}
                  {savedResult.reason_code === "INELIGIBLE_INCOME_HIGH" && (
                    <p className="font-sans text-[13px] text-ink-muted">
                      Your annual income exceeds the ₹{savedResult.threshold.toLocaleString("en-IN")} threshold. You are ₹{Math.abs(savedResult.gap).toLocaleString("en-IN")} above the limit.
                    </p>
                  )}
                  {savedResult.reason_code === "INELIGIBLE_NO_RECORD" && (
                    <p className="font-sans text-[13px] text-ink-muted">
                      No income record was found for this PAN. Please check the PAN number or contact support.
                    </p>
                  )}
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      localStorage.removeItem(getPinkCardKey());
                      setStatusScreen(null);
                      navigate({ to: "/pink-card-apply" });
                    }}
                  >
                    Try Another PAN
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => setStatusScreen(null)}>
                    Back
                  </Button>
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
      {/* ── FIX 2: instant dark cover — same color as canvas bg ── */}
      {/* Visible from frame 0, removed the moment Three.js canvas takes over */}
      {!threeReady && !revealed && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "#0b0a10", // d4546e
            pointerEvents: "none",
          }}
        />
      )}

      {/* 3D canvas — mounts once Three.js is ready */}
      {threeReady && !revealed && (
        <RevealEffect onDone={() => setRevealed(true)} />
      )}

      {/* Page always rendered underneath */}
      <PageShell theme="rose" backHome>
        <section className="relative -mt-[88px] flex min-h-[100svh] items-center overflow-hidden pt-[88px]">
          <img
            src={glowBg}
            alt=""
            width={1920}
            height={1088}
            className="absolute inset-0 size-full object-cover opacity-70"
          />
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
                <Button
                  variant="outline"
                  size="md"
                  className="font-display text-[15px] font-medium"
                  onClick={handleApplyNow}
                >
                  {t("pc.apply")}
                </Button>
                <Button
                  variant="pinkSolid"
                  size="md"
                  className="font-display text-[15px] font-medium"
                  onClick={handleCheckStatus}
                >
                  {t("pc.status")}
                </Button>
              </div>
              <p className="mt-8 flex items-center gap-2 font-display text-[13px] text-ink-muted">
                <ShieldCheck className="size-4 text-rose" strokeWidth={1.5} />
                {t("pc.note")}
              </p>
            </Reveal>

            <Reveal delay={150} className="flex justify-center">
              <PinkCardRender />
            </Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden bg-canvas py-[130px]">
          <div aria-hidden className="rose-glow absolute -left-32 bottom-0 size-[380px]" />
          <div aria-hidden className="rose-glow absolute -right-32 top-0 size-[380px]" />

          <div className="relative mx-auto max-w-[1040px] px-6 text-center">
            <Reveal>
              <h2 className="font-display text-[34px] text-ink sm:text-[42px]">
                {t("pc.whoTitle")}
              </h2>
              <span className="mx-auto mt-4 block h-0.5 w-28 bg-rose" />
              <p className="mt-5 font-sans text-[13px] text-ink-muted">{t("pc.whoSub")}</p>
            </Reveal>

            <div className="relative mt-16 grid gap-12 sm:grid-cols-3">
              <span
                aria-hidden
                className="absolute left-[16%] right-[16%] top-[34px] hidden h-px bg-rose/30 sm:block"
              />
              {checks.map(({ icon: Icon, title, body }, i) => (
                <Reveal key={title} delay={i * 120} className="relative flex flex-col items-center">
                  <span className="flex size-[68px] items-center justify-center rounded-full border border-rose/60 bg-canvas">
                    <Icon className="size-6 text-rose-bright" strokeWidth={1.5} />
                  </span>
                  <p className="mt-6 font-sans text-[12px] uppercase tracking-[0.16em] text-ink">
                    {title}
                  </p>
                  <p className="mt-4 max-w-[220px] font-display text-[17px] leading-relaxed text-ink/85">
                    {body}
                  </p>
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

function PinkCardRender() {
  const { t } = useI18n();
  return (
    <div className="relative flex w-full max-w-[420px] flex-col items-center">
      <div className="anim-float w-full">
        <div className="pinkcard-face relative aspect-[1.6/1] w-full rounded-[16px] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-sans text-[11px] text-white/90">
              <Bus className="size-3.5" strokeWidth={1.75} />
              {t("pc.brand")}
            </span>
            <Wifi className="size-4 rotate-90 text-white/80" strokeWidth={1.75} />
          </div>
          <p className="mt-7 font-sans text-[24px] font-semibold tracking-wide text-white">
            {t("pc.cardName")}
          </p>
          <p className="mt-1 font-sans text-[10.5px] text-white/80">{t("pc.cardTag")}</p>
          <div className="absolute inset-x-6 bottom-5 flex items-end justify-between">
            <p className="max-w-[150px] font-sans text-[9.5px] leading-snug text-white/80">
              {t("pc.cardValid")}
            </p>
            <div className="flex items-end gap-2">
              <span className="rounded-[6px] bg-black/25 px-2 py-1 text-center">
                <span className="block font-sans text-[13px] font-semibold text-white">₹0</span>
                <span className="block font-sans text-[7px] tracking-wider text-white/80">
                  {t("pc.cardFare")}
                </span>
              </span>
              <span className="rounded-[6px] bg-black/25 px-2 py-1 text-center">
                <span className="block font-sans text-[13px] text-white">✓</span>
                <span className="block font-sans text-[7px] tracking-wider text-white/80">
                  {t("pc.cardVerified")}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="relative mt-6 h-14 w-[78%]">
        <span
          aria-hidden
          className="anim-pulse-glow absolute inset-x-[-14%] top-1 h-14 rounded-[50%] bg-rose-glow/45 blur-2xl"
        />
        <span className="absolute inset-0 rounded-[50%] border border-rose-glow/70 bg-[#0b0a10]" />
      </div>
    </div>
  );
}



