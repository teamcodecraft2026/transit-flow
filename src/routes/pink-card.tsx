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
import { useState } from "react";
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

// ── Page ──────────────────────────────────────────────────────────────────────

function PinkCardPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const [statusScreen, setStatusScreen] = useState<StatusScreen | null>(null);
  const [savedResult, setSavedResult] = useState<PinkCardResponse | null>(null);

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
        // User logged in but never applied
        setStatusScreen("not-applied");
      }
    });
  }

  // ── Status result screens ─────────────────────────────────────────────────

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

            {/* ── Not Applied ── */}
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
                    <p className="font-sans text-[13px] text-ink-muted">
                      Must be a female applicant
                    </p>
                  </div>
                  <div className="flex items-start gap-3 py-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-rose" strokeWidth={1.5} />
                    <p className="font-sans text-[13px] text-ink-muted">
                      Must be a state resident
                    </p>
                  </div>
                  <div className="flex items-start gap-3 py-2">
                    <IndianRupee className="mt-0.5 size-4 shrink-0 text-rose" strokeWidth={1.5} />
                    <p className="font-sans text-[13px] text-ink-muted">
                      Annual family income below ₹2,50,000
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Button
                    variant="pinkSolid"
                    size="lg"
                    onClick={() => navigate({ to: "/pink-card-apply" })}
                  >
                    Apply Now →
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStatusScreen(null)}
                  >
                    Back
                  </Button>
                </div>
              </>
            )}

            {/* ── Eligible ── */}
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
                  <Row
                    label="Annual Income"
                    value={`₹${savedResult.annual_income.toLocaleString("en-IN")}`}
                  />
                  <Row
                    label="Threshold"
                    value={`₹${savedResult.threshold.toLocaleString("en-IN")}`}
                  />
                  <Row label="Reason" value={savedResult.reason_message} />
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Button
                    variant="pinkSolid"
                    size="lg"
                    onClick={() => navigate({ to: "/book" })}
                  >
                    Book a Free Ticket →
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => setStatusScreen(null)}>
                    Back
                  </Button>
                </div>
              </>
            )}

            {/* ── Not Eligible ── */}
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
                    <Row
                      label="Annual Income"
                      value={`₹${savedResult.annual_income.toLocaleString("en-IN")}`}
                    />
                  )}
                </div>
                <div className="mt-5 rounded-[12px] border border-white/10 bg-white/5 p-4 text-left">
                  {savedResult.reason_code === "INELIGIBLE_GENDER" && (
                    <p className="font-sans text-[13px] text-ink-muted">
                      The Pink Card scheme is available only to female applicants as per government
                      guidelines.
                    </p>
                  )}
                  {savedResult.reason_code === "INELIGIBLE_INCOME_HIGH" && (
                    <p className="font-sans text-[13px] text-ink-muted">
                      Your annual income exceeds the ₹
                      {savedResult.threshold.toLocaleString("en-IN")} threshold. You are ₹
                      {Math.abs(savedResult.gap).toLocaleString("en-IN")} above the limit.
                    </p>
                  )}
                  {savedResult.reason_code === "INELIGIBLE_NO_RECORD" && (
                    <p className="font-sans text-[13px] text-ink-muted">
                      No income record was found for this PAN. Please check the PAN number or
                      contact support.
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

  // ── Main Pink Card page ───────────────────────────────────────────────────

  return (
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

      {/* Who can apply */}
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

// import { createFileRoute, useNavigate } from "@tanstack/react-router";
// import {
//   Bus,
//   CheckCircle2,
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
// import { checkPinkCard, type PinkCardResponse } from "@/lib/api";
// import { useState } from "react";
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

// // ── Per-user key so different accounts never share results ────────────────────

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

// function saveResult(res: PinkCardResponse) {
//   localStorage.setItem(getPinkCardKey(), JSON.stringify(res));
// }

// function clearResult() {
//   localStorage.removeItem(getPinkCardKey());
// }

// // ── Page ──────────────────────────────────────────────────────────────────────

// function PinkCardPage() {
//   const { t } = useI18n();
//   const navigate = useNavigate();
//   const { requireAuth } = useAuth();
//   const [statusResult, setStatusResult] = useState<PinkCardResponse | null>(null);
//   const [checking, setChecking] = useState(false);
//   const [panInput, setPanInput] = useState("");
//   const [showPanInput, setShowPanInput] = useState(false);
//   const [checkError, setCheckError] = useState<string | null>(null);

//   const checks = [
//     { icon: UserRound, title: t("pc.w1"), body: t("pc.w1sub") },
//     { icon: MapPin, title: t("pc.w2"), body: t("pc.w2sub") },
//     { icon: IndianRupee, title: t("pc.w3"), body: t("pc.w3sub") },
//   ];

//   function handleApplyNow() {
//     requireAuth(() => {
//       // Only show saved result if this specific user has applied before
//       const saved = getSavedResult();
//       if (saved) {
//         setStatusResult(saved);
//         return;
//       }
//       // Otherwise go to 4-step form
//       navigate({ to: "/pink-card-apply" });
//     });
//   }

//   function handleCheckStatus() {
//     requireAuth(() => {
//       // Only show saved result for this specific logged-in user
//       const saved = getSavedResult();
//       if (saved) {
//         setStatusResult(saved);
//         return;
//       }
//       // No result for this user — show PAN input
//       setShowPanInput(true);
//     });
//   }

//   async function handleCheckByPan() {
//     if (!panInput.trim()) return;
//     setChecking(true);
//     setCheckError(null);
//     try {
//       const res = await checkPinkCard(panInput.trim().toUpperCase());
//       saveResult(res);
//       setStatusResult(res);
//       setShowPanInput(false);
//       setPanInput("");
//     } catch (err: unknown) {
//       setCheckError(err instanceof Error ? err.message : "Check failed. Please try again.");
//     } finally {
//       setChecking(false);
//     }
//   }

//   // Show status result screen
//   if (statusResult) {
//     return (
//       <PageShell theme="rose" backHome hideFooter>
//         <section className="relative -mt-[88px] flex min-h-[100svh] items-center justify-center overflow-hidden pb-24 pt-[150px]">
//           <img
//             src={navyBg}
//             alt=""
//             width={1920}
//             height={1088}
//             className="absolute inset-0 size-full object-cover opacity-40"
//           />
//           <div className="absolute inset-0 bg-black/65" />

//           <div className="relative z-10 w-full max-w-[500px] px-6 text-center">
//             {statusResult.eligible ? (
//               <>
//                 <CheckCircle2 className="mx-auto size-16 text-green-400" strokeWidth={1.5} />
//                 <h1 className="mt-5 font-display text-[34px] text-ink">You're Eligible! 🌸</h1>
//                 <p className="mt-3 font-sans text-[14px] text-ink-muted">
//                   Your Pink Card is active. Your next ticket booking will automatically be{" "}
//                   <strong className="text-rose">₹0</strong>.
//                 </p>
//                 <div className="mt-6 rounded-[14px] border border-green-500/30 bg-green-500/10 p-5 text-left">
//                   <Row label="PAN" value={statusResult.pan} />
//                   <Row
//                     label="Annual Income"
//                     value={`₹${statusResult.annual_income.toLocaleString("en-IN")}`}
//                   />
//                   <Row
//                     label="Threshold"
//                     value={`₹${statusResult.threshold.toLocaleString("en-IN")}`}
//                   />
//                   <Row label="Reason" value={statusResult.reason_message} />
//                 </div>
//                 <div className="mt-8 flex flex-wrap justify-center gap-4">
//                   <Button
//                     variant="pinkSolid"
//                     size="lg"
//                     onClick={() => navigate({ to: "/book" })}
//                   >
//                     Book a Free Ticket →
//                   </Button>
//                   <Button variant="outline" size="lg" onClick={() => setStatusResult(null)}>
//                     Back
//                   </Button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <XCircle className="mx-auto size-16 text-destructive" strokeWidth={1.5} />
//                 <h1 className="mt-5 font-display text-[34px] text-ink">Not Eligible</h1>
//                 <p className="mt-3 font-sans text-[14px] text-ink-muted">
//                   {statusResult.reason_message}
//                 </p>
//                 <div className="mt-6 rounded-[14px] border border-destructive/30 bg-destructive/10 p-5 text-left">
//                   <Row label="PAN" value={statusResult.pan} />
//                   <Row label="Reason Code" value={statusResult.reason_code} />
//                   {statusResult.annual_income > 0 && (
//                     <Row
//                       label="Annual Income"
//                       value={`₹${statusResult.annual_income.toLocaleString("en-IN")}`}
//                     />
//                   )}
//                 </div>
//                 <div className="mt-8 flex flex-wrap justify-center gap-4">
//                   <Button
//                     variant="outline"
//                     size="lg"
//                     onClick={() => {
//                       clearResult();
//                       setStatusResult(null);
//                       navigate({ to: "/pink-card-apply" });
//                     }}
//                   >
//                     Try Another PAN
//                   </Button>
//                   <Button variant="outline" size="lg" onClick={() => setStatusResult(null)}>
//                     Back
//                   </Button>
//                 </div>
//               </>
//             )}
//           </div>
//         </section>
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell theme="rose" backHome>
//       {/* Hero */}
//       <section className="relative -mt-[88px] flex min-h-[100svh] items-center overflow-hidden pt-[88px]">
//         <img
//           src={glowBg}
//           alt=""
//           width={1920}
//           height={1088}
//           className="absolute inset-0 size-full object-cover opacity-70"
//         />
//         <div className="absolute inset-0 bg-black/55" />
//         <div className="absolute inset-x-0 bottom-0 h-52 bg-linear-to-b from-transparent to-canvas" />

//         <div className="relative z-10 mx-auto grid w-full max-w-[1240px] items-center gap-16 px-6 py-24 lg:grid-cols-2">
//           <Reveal>
//             <h1 className="font-display text-[40px] leading-[1.12] text-ink sm:text-[52px]">
//               {t("pc.title")}
//               <br />
//               {t("pc.title2")} <span className="text-rose">{t("pc.title2Accent")}</span>
//             </h1>
//             <span className="mt-5 block h-0.5 w-24 bg-rose" />
//             <p className="mt-7 max-w-[460px] font-sans text-[13.5px] leading-relaxed text-ink-muted">
//               {t("pc.body")}
//             </p>

//             {/* PAN input for Check Status */}
//             {showPanInput && (
//               <div className="mt-6 rounded-[14px] border border-rose/30 bg-black/40 p-5">
//                 <p className="mb-3 font-sans text-[13px] text-ink-muted">
//                   Enter your PAN to check eligibility status:
//                 </p>
//                 <div className="flex gap-3">
//                   <input
//                     value={panInput}
//                     onChange={(e) => setPanInput(e.target.value.toUpperCase().slice(0, 10))}
//                     onKeyDown={(e) => e.key === "Enter" && handleCheckByPan()}
//                     placeholder="ABCDE1234F"
//                     className="flex-1 rounded-[10px] border border-white/15 bg-white/5 px-4 py-2.5 font-sans text-[14px] text-ink placeholder:text-ink-muted focus:border-rose/50 focus:outline-none"
//                   />
//                   <Button
//                     variant="pinkSolid"
//                     size="md"
//                     onClick={handleCheckByPan}
//                     disabled={checking}
//                   >
//                     {checking ? <Loader2 className="size-4 animate-spin" /> : "Check"}
//                   </Button>
//                 </div>
//                 {checkError && (
//                   <p className="mt-3 font-sans text-[12px] text-destructive">{checkError}</p>
//                 )}
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowPanInput(false);
//                     setCheckError(null);
//                     setPanInput("");
//                   }}
//                   className="mt-3 font-sans text-[12px] text-ink-muted hover:text-ink"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             )}

//             <div className="mt-9 flex flex-wrap gap-4">
//               <Button
//                 variant="outline"
//                 size="md"
//                 className="font-display text-[15px] font-medium"
//                 onClick={handleApplyNow}
//               >
//                 {t("pc.apply")}
//               </Button>
//               <Button
//                 variant="pinkSolid"
//                 size="md"
//                 className="font-display text-[15px] font-medium"
//                 onClick={handleCheckStatus}
//                 disabled={checking}
//               >
//                 {checking ? <Loader2 className="size-4 animate-spin" /> : t("pc.status")}
//               </Button>
//             </div>
//             <p className="mt-8 flex items-center gap-2 font-display text-[13px] text-ink-muted">
//               <ShieldCheck className="size-4 text-rose" strokeWidth={1.5} />
//               {t("pc.note")}
//             </p>
//           </Reveal>

//           <Reveal delay={150} className="flex justify-center">
//             <PinkCardRender />
//           </Reveal>
//         </div>
//       </section>

//       {/* Who can apply */}
//       <section className="relative overflow-hidden bg-canvas py-[130px]">
//         <div aria-hidden className="rose-glow absolute -left-32 bottom-0 size-[380px]" />
//         <div aria-hidden className="rose-glow absolute -right-32 top-0 size-[380px]" />

//         <div className="relative mx-auto max-w-[1040px] px-6 text-center">
//           <Reveal>
//             <h2 className="font-display text-[34px] text-ink sm:text-[42px]">
//               {t("pc.whoTitle")}
//             </h2>
//             <span className="mx-auto mt-4 block h-0.5 w-28 bg-rose" />
//             <p className="mt-5 font-sans text-[13px] text-ink-muted">{t("pc.whoSub")}</p>
//           </Reveal>

//           <div className="relative mt-16 grid gap-12 sm:grid-cols-3">
//             <span
//               aria-hidden
//               className="absolute left-[16%] right-[16%] top-[34px] hidden h-px bg-rose/30 sm:block"
//             />
//             {checks.map(({ icon: Icon, title, body }, i) => (
//               <Reveal key={title} delay={i * 120} className="relative flex flex-col items-center">
//                 <span className="flex size-[68px] items-center justify-center rounded-full border border-rose/60 bg-canvas">
//                   <Icon className="size-6 text-rose-bright" strokeWidth={1.5} />
//                 </span>
//                 <p className="mt-6 font-sans text-[12px] uppercase tracking-[0.16em] text-ink">
//                   {title}
//                 </p>
//                 <p className="mt-4 max-w-[220px] font-display text-[17px] leading-relaxed text-ink/85">
//                   {body}
//                 </p>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>
//     </PageShell>
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

// function PinkCardRender() {
//   const { t } = useI18n();
//   return (
//     <div className="relative flex w-full max-w-[420px] flex-col items-center">
//       <div className="anim-float w-full">
//         <div className="pinkcard-face relative aspect-[1.6/1] w-full rounded-[16px] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.6)]">
//           <div className="flex items-center justify-between">
//             <span className="flex items-center gap-2 font-sans text-[11px] text-white/90">
//               <Bus className="size-3.5" strokeWidth={1.75} />
//               {t("pc.brand")}
//             </span>
//             <Wifi className="size-4 rotate-90 text-white/80" strokeWidth={1.75} />
//           </div>

//           <p className="mt-7 font-sans text-[24px] font-semibold tracking-wide text-white">
//             {t("pc.cardName")}
//           </p>
//           <p className="mt-1 font-sans text-[10.5px] text-white/80">{t("pc.cardTag")}</p>

//           <div className="absolute inset-x-6 bottom-5 flex items-end justify-between">
//             <p className="max-w-[150px] font-sans text-[9.5px] leading-snug text-white/80">
//               {t("pc.cardValid")}
//             </p>
//             <div className="flex items-end gap-2">
//               <span className="rounded-[6px] bg-black/25 px-2 py-1 text-center">
//                 <span className="block font-sans text-[13px] font-semibold text-white">₹0</span>
//                 <span className="block font-sans text-[7px] tracking-wider text-white/80">
//                   {t("pc.cardFare")}
//                 </span>
//               </span>
//               <span className="rounded-[6px] bg-black/25 px-2 py-1 text-center">
//                 <span className="block font-sans text-[13px] text-white">✓</span>
//                 <span className="block font-sans text-[7px] tracking-wider text-white/80">
//                   {t("pc.cardVerified")}
//                 </span>
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="relative mt-6 h-14 w-[78%]">
//         <span
//           aria-hidden
//           className="anim-pulse-glow absolute inset-x-[-14%] top-1 h-14 rounded-[50%] bg-rose-glow/45 blur-2xl"
//         />
//         <span className="absolute inset-0 rounded-[50%] border border-rose-glow/70 bg-[#0b0a10]" />
//       </div>
//     </div>
//   );
// }




// import { createFileRoute, useNavigate } from "@tanstack/react-router";
// import {
//   Bus,
//   CheckCircle2,
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
// import { checkPinkCard, type PinkCardResponse } from "@/lib/api";
// import { useState } from "react";
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

// const PINK_CARD_RESULT_KEY = "pt.pinkCardResult";

// function getSavedResult(): PinkCardResponse | null {
//   try {
//     const raw = localStorage.getItem(PINK_CARD_RESULT_KEY);
//     return raw ? (JSON.parse(raw) as PinkCardResponse) : null;
//   } catch {
//     return null;
//   }
// }

// function PinkCardPage() {
//   const { t } = useI18n();
//   const navigate = useNavigate();
//   const { requireAuth } = useAuth();
//   const [statusResult, setStatusResult] = useState<PinkCardResponse | null>(null);
//   const [checking, setChecking] = useState(false);
//   const [panInput, setPanInput] = useState("");
//   const [showPanInput, setShowPanInput] = useState(false);
//   const [checkError, setCheckError] = useState<string | null>(null);

//   const checks = [
//     { icon: UserRound, title: t("pc.w1"), body: t("pc.w1sub") },
//     { icon: MapPin, title: t("pc.w2"), body: t("pc.w2sub") },
//     { icon: IndianRupee, title: t("pc.w3"), body: t("pc.w3sub") },
//   ];

//   function handleApplyNow() {
//     // If already applied, show the saved result
//     const saved = getSavedResult();
//     if (saved) {
//       setStatusResult(saved);
//       return;
//     }
//     // Otherwise go to 4-step form
//     navigate({ to: "/pink-card-apply" });
//   }

//   function handleCheckStatus() {
//     requireAuth(() => {
//       // If already have a saved result, show it directly
//       const saved = getSavedResult();
//       if (saved) {
//         setStatusResult(saved);
//         return;
//       }
//       // Otherwise show PAN input to check
//       setShowPanInput(true);
//     });
//   }

//   async function handleCheckByPan() {
//     if (!panInput.trim()) return;
//     setChecking(true);
//     setCheckError(null);
//     try {
//       const res = await checkPinkCard(panInput.trim().toUpperCase());
//       localStorage.setItem(PINK_CARD_RESULT_KEY, JSON.stringify(res));
//       setStatusResult(res);
//       setShowPanInput(false);
//     } catch (err: unknown) {
//       setCheckError(err instanceof Error ? err.message : "Check failed. Please try again.");
//     } finally {
//       setChecking(false);
//     }
//   }

//   // Show status result screen
//   if (statusResult) {
//     return (
//       <PageShell theme="rose" backHome hideFooter>
//         <section className="relative -mt-[88px] flex min-h-[100svh] items-center justify-center overflow-hidden pb-24 pt-[150px]">
//           <img
//             src={navyBg}
//             alt=""
//             width={1920}
//             height={1088}
//             className="absolute inset-0 size-full object-cover opacity-40"
//           />
//           <div className="absolute inset-0 bg-black/65" />

//           <div className="relative z-10 w-full max-w-[500px] px-6 text-center">
//             {statusResult.eligible ? (
//               <>
//                 <CheckCircle2 className="mx-auto size-16 text-green-400" strokeWidth={1.5} />
//                 <h1 className="mt-5 font-display text-[34px] text-ink">You're Eligible! 🌸</h1>
//                 <p className="mt-3 font-sans text-[14px] text-ink-muted">
//                   Your Pink Card is active. Your next ticket booking will automatically be{" "}
//                   <strong className="text-rose">₹0</strong>.
//                 </p>
//                 <div className="mt-6 rounded-[14px] border border-green-500/30 bg-green-500/10 p-5 text-left">
//                   <Row label="PAN" value={statusResult.pan} />
//                   <Row
//                     label="Annual Income"
//                     value={`₹${statusResult.annual_income.toLocaleString("en-IN")}`}
//                   />
//                   <Row
//                     label="Threshold"
//                     value={`₹${statusResult.threshold.toLocaleString("en-IN")}`}
//                   />
//                   <Row label="Reason" value={statusResult.reason_message} />
//                 </div>
//                 <div className="mt-8 flex flex-wrap justify-center gap-4">
//                   <Button
//                     variant="pinkSolid"
//                     size="lg"
//                     onClick={() => navigate({ to: "/book" })}
//                   >
//                     Book a Free Ticket →
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="lg"
//                     onClick={() => setStatusResult(null)}
//                   >
//                     Back
//                   </Button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <XCircle className="mx-auto size-16 text-destructive" strokeWidth={1.5} />
//                 <h1 className="mt-5 font-display text-[34px] text-ink">Not Eligible</h1>
//                 <p className="mt-3 font-sans text-[14px] text-ink-muted">
//                   {statusResult.reason_message}
//                 </p>
//                 <div className="mt-6 rounded-[14px] border border-destructive/30 bg-destructive/10 p-5 text-left">
//                   <Row label="PAN" value={statusResult.pan} />
//                   <Row label="Reason Code" value={statusResult.reason_code} />
//                   {statusResult.annual_income > 0 && (
//                     <Row
//                       label="Annual Income"
//                       value={`₹${statusResult.annual_income.toLocaleString("en-IN")}`}
//                     />
//                   )}
//                 </div>
//                 <div className="mt-8 flex flex-wrap justify-center gap-4">
//                   <Button
//                     variant="outline"
//                     size="lg"
//                     onClick={() => {
//                       localStorage.removeItem(PINK_CARD_RESULT_KEY);
//                       setStatusResult(null);
//                       navigate({ to: "/pink-card-apply" });
//                     }}
//                   >
//                     Try Another PAN
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="lg"
//                     onClick={() => setStatusResult(null)}
//                   >
//                     Back
//                   </Button>
//                 </div>
//               </>
//             )}
//           </div>
//         </section>
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell theme="rose" backHome>
//       {/* Hero */}
//       <section className="relative -mt-[88px] flex min-h-[100svh] items-center overflow-hidden pt-[88px]">
//         <img
//           src={glowBg}
//           alt=""
//           width={1920}
//           height={1088}
//           className="absolute inset-0 size-full object-cover opacity-70"
//         />
//         <div className="absolute inset-0 bg-black/55" />
//         <div className="absolute inset-x-0 bottom-0 h-52 bg-linear-to-b from-transparent to-canvas" />

//         <div className="relative z-10 mx-auto grid w-full max-w-[1240px] items-center gap-16 px-6 py-24 lg:grid-cols-2">
//           <Reveal>
//             <h1 className="font-display text-[40px] leading-[1.12] text-ink sm:text-[52px]">
//               {t("pc.title")}
//               <br />
//               {t("pc.title2")} <span className="text-rose">{t("pc.title2Accent")}</span>
//             </h1>
//             <span className="mt-5 block h-0.5 w-24 bg-rose" />
//             <p className="mt-7 max-w-[460px] font-sans text-[13.5px] leading-relaxed text-ink-muted">
//               {t("pc.body")}
//             </p>

//             {/* PAN input for Check Status */}
//             {showPanInput && (
//               <div className="mt-6 rounded-[14px] border border-rose/30 bg-black/40 p-5">
//                 <p className="font-sans text-[13px] text-ink-muted mb-3">
//                   Enter your PAN to check eligibility status:
//                 </p>
//                 <div className="flex gap-3">
//                   <input
//                     value={panInput}
//                     onChange={(e) => setPanInput(e.target.value.toUpperCase().slice(0, 10))}
//                     onKeyDown={(e) => e.key === "Enter" && handleCheckByPan()}
//                     placeholder="ABCDE1234F"
//                     className="flex-1 rounded-[10px] border border-white/15 bg-white/5 px-4 py-2.5 font-sans text-[14px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-rose/50"
//                   />
//                   <Button
//                     variant="pinkSolid"
//                     size="md"
//                     onClick={handleCheckByPan}
//                     disabled={checking}
//                   >
//                     {checking ? <Loader2 className="size-4 animate-spin" /> : "Check"}
//                   </Button>
//                 </div>
//                 {checkError && (
//                   <p className="mt-3 font-sans text-[12px] text-destructive">{checkError}</p>
//                 )}
//                 <button
//                   type="button"
//                   onClick={() => { setShowPanInput(false); setCheckError(null); }}
//                   className="mt-3 font-sans text-[12px] text-ink-muted hover:text-ink"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             )}

//             <div className="mt-9 flex flex-wrap gap-4">
//               <Button
//                 variant="outline"
//                 size="md"
//                 className="font-display text-[15px] font-medium"
//                 onClick={handleApplyNow}
//               >
//                 {t("pc.apply")}
//               </Button>
//               <Button
//                 variant="pinkSolid"
//                 size="md"
//                 className="font-display text-[15px] font-medium"
//                 onClick={handleCheckStatus}
//                 disabled={checking}
//               >
//                 {checking ? <Loader2 className="size-4 animate-spin" /> : t("pc.status")}
//               </Button>
//             </div>
//             <p className="mt-8 flex items-center gap-2 font-display text-[13px] text-ink-muted">
//               <ShieldCheck className="size-4 text-rose" strokeWidth={1.5} />
//               {t("pc.note")}
//             </p>
//           </Reveal>

//           <Reveal delay={150} className="flex justify-center">
//             <PinkCardRender />
//           </Reveal>
//         </div>
//       </section>

//       {/* Who can apply */}
//       <section className="relative overflow-hidden bg-canvas py-[130px]">
//         <div aria-hidden className="rose-glow absolute -left-32 bottom-0 size-[380px]" />
//         <div aria-hidden className="rose-glow absolute -right-32 top-0 size-[380px]" />

//         <div className="relative mx-auto max-w-[1040px] px-6 text-center">
//           <Reveal>
//             <h2 className="font-display text-[34px] text-ink sm:text-[42px]">
//               {t("pc.whoTitle")}
//             </h2>
//             <span className="mx-auto mt-4 block h-0.5 w-28 bg-rose" />
//             <p className="mt-5 font-sans text-[13px] text-ink-muted">{t("pc.whoSub")}</p>
//           </Reveal>

//           <div className="relative mt-16 grid gap-12 sm:grid-cols-3">
//             <span
//               aria-hidden
//               className="absolute left-[16%] right-[16%] top-[34px] hidden h-px bg-rose/30 sm:block"
//             />
//             {checks.map(({ icon: Icon, title, body }, i) => (
//               <Reveal key={title} delay={i * 120} className="relative flex flex-col items-center">
//                 <span className="flex size-[68px] items-center justify-center rounded-full border border-rose/60 bg-canvas">
//                   <Icon className="size-6 text-rose-bright" strokeWidth={1.5} />
//                 </span>
//                 <p className="mt-6 font-sans text-[12px] uppercase tracking-[0.16em] text-ink">
//                   {title}
//                 </p>
//                 <p className="mt-4 max-w-[220px] font-display text-[17px] leading-relaxed text-ink/85">
//                   {body}
//                 </p>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>
//     </PageShell>
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

// function PinkCardRender() {
//   const { t } = useI18n();
//   return (
//     <div className="relative flex w-full max-w-[420px] flex-col items-center">
//       <div className="anim-float w-full">
//         <div className="pinkcard-face relative aspect-[1.6/1] w-full rounded-[16px] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.6)]">
//           <div className="flex items-center justify-between">
//             <span className="flex items-center gap-2 font-sans text-[11px] text-white/90">
//               <Bus className="size-3.5" strokeWidth={1.75} />
//               {t("pc.brand")}
//             </span>
//             <Wifi className="size-4 rotate-90 text-white/80" strokeWidth={1.75} />
//           </div>

//           <p className="mt-7 font-sans text-[24px] font-semibold tracking-wide text-white">
//             {t("pc.cardName")}
//           </p>
//           <p className="mt-1 font-sans text-[10.5px] text-white/80">{t("pc.cardTag")}</p>

//           <div className="absolute inset-x-6 bottom-5 flex items-end justify-between">
//             <p className="max-w-[150px] font-sans text-[9.5px] leading-snug text-white/80">
//               {t("pc.cardValid")}
//             </p>
//             <div className="flex items-end gap-2">
//               <span className="rounded-[6px] bg-black/25 px-2 py-1 text-center">
//                 <span className="block font-sans text-[13px] font-semibold text-white">₹0</span>
//                 <span className="block font-sans text-[7px] tracking-wider text-white/80">
//                   {t("pc.cardFare")}
//                 </span>
//               </span>
//               <span className="rounded-[6px] bg-black/25 px-2 py-1 text-center">
//                 <span className="block font-sans text-[13px] text-white">✓</span>
//                 <span className="block font-sans text-[7px] tracking-wider text-white/80">
//                   {t("pc.cardVerified")}
//                 </span>
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="relative mt-6 h-14 w-[78%]">
//         <span
//           aria-hidden
//           className="anim-pulse-glow absolute inset-x-[-14%] top-1 h-14 rounded-[50%] bg-rose-glow/45 blur-2xl"
//         />
//         <span className="absolute inset-0 rounded-[50%] border border-rose-glow/70 bg-[#0b0a10]" />
//       </div>
//     </div>
//   );
// }
