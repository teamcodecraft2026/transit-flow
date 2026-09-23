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
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";

export const Route = createFileRoute("/pink-card")({
  head: () => ({
    meta: [
      { title: "The Pink Card  Free Verified Bus Travel for Women | Public Transit" },
      {
        name: "description",
        content:
          "Apply for the Pink Card and get zero-fare bus travel across all public transit services. Encrypted, government-linked, verified in minutes.",
      },
      {
        property: "og:title",
        content: "The Pink Card  Free Verified Bus Travel for Women",
      },
      {
        property: "og:description",
        content:
          "Zero-fare bus travel for eligible women  encrypted, government-linked, verified in minutes.",
      },
    ],
  }),
  component: PinkCardPage,
});

let revealHasRun = false;

function getPinkCardApplicationId(): string | null {
  try {
    const raw = localStorage.getItem("pt.user");
    if (raw) {
      const user = JSON.parse(raw) as { id: string };
      if (user?.id) {
        return localStorage.getItem(`pt.pinkCardApplicationId.${user.id}`);
      }
    }
  } catch { /* ignore */ }
  return localStorage.getItem("pt.pinkCardApplicationId.guest");
}

type StatusScreen = "already-applied" | "not-applied";

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
      const appId = getPinkCardApplicationId();
      if (appId) {
        // Already applied  send them back to the apply page
        // which will resume polling/showing the result
        navigate({ to: "/pink-card-apply" });
        return;
      }
      navigate({ to: "/pink-card-apply" });
    });
  }

  function handleCheckStatus() {
    requireAuth(() => {
      const appId = getPinkCardApplicationId();
      if (appId) {
        // Resume the apply page which polls for the current status
        navigate({ to: "/pink-card-apply" });
      } else {
        setStatusScreen("not-applied");
      }
    });
  }

  if (statusScreen === "not-applied") {
    return (
      <PageShell theme="rose" backHome hideFooter>
        <section className="relative -mt-[88px] flex min-h-[100svh] items-center justify-center overflow-hidden pb-24 pt-[150px]">
          <img src={navyBg} alt="" width={1920} height={1088}
            className="absolute inset-0 size-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-black/65" />
          <div className="relative z-10 w-full max-w-[500px] px-6 text-center">
            <ClipboardList className="mx-auto size-16 text-white/30" strokeWidth={1.25} />
            <h1 className="mt-5 font-display text-[34px] text-white">Not Applied Yet</h1>
            <p className="mt-3 font-sans text-[14px] text-white/60">
              You haven't applied for the Pink Card yet. Complete the 4-step verification
              to check your eligibility for zero-fare bus travel.
            </p>
            <div className="mt-6 rounded-[14px] border border-white/15 bg-white/5 p-5 text-left">
              <div className="flex items-start gap-3 py-2">
                <UserRound className="mt-0.5 size-4 shrink-0 text-rose-400" strokeWidth={1.5} />
                <p className="font-sans text-[13px] text-white/60">Must be a female applicant</p>
              </div>
              <div className="flex items-start gap-3 py-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-rose-400" strokeWidth={1.5} />
                <p className="font-sans text-[13px] text-white/60">Must be a state resident</p>
              </div>
              <div className="flex items-start gap-3 py-2">
                <IndianRupee className="mt-0.5 size-4 shrink-0 text-rose-400" strokeWidth={1.5} />
                <p className="font-sans text-[13px] text-white/60">
                  Annual family income below 2,50,000
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button variant="pinkSolid" size="lg"
                onClick={() => navigate({ to: "/pink-card-apply" })}>
                Apply Now 
              </Button>
              <Button variant="outline" size="lg" onClick={() => setStatusScreen(null)}>
                Back
              </Button>
            </div>
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
          <img src={glowBg} alt="" width={1920} height={1088}
            className="absolute inset-0 size-full object-cover opacity-70" />
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
                <Button variant="outline" size="md"
                  className="font-display text-[15px] font-medium"
                  onClick={handleApplyNow}>
                  {t("pc.apply")}
                </Button>
                <Button variant="pinkSolid" size="md"
                  className="font-display text-[15px] font-medium"
                  onClick={handleCheckStatus}>
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
              <span aria-hidden
                className="absolute left-[16%] right-[16%] top-[34px] hidden h-px bg-rose/30 sm:block" />
              {checks.map(({ icon: Icon, title, body }, i) => (
                <Reveal key={title} delay={i * 120}
                  className="relative flex flex-col items-center">
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
      <span className="font-sans text-[12px] text-white/40">{label}</span>
      <span className="font-sans text-[13px] text-white">{value}</span>
    </div>
  );
}

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
          cardRef.current.style.transform =
            `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
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
      <div className="relative mt-6 h-14 w-[78%]">
        <span aria-hidden
          className="anim-pulse-glow absolute inset-x-[-14%] top-1 h-14 rounded-[50%] bg-rose-glow/45 blur-2xl" />
        <span className="absolute inset-0 rounded-[50%] border border-rose-glow/70 bg-[#0b0a10]" />
      </div>
    </div>
  );
}

