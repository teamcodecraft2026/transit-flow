// import { createFileRoute } from "@tanstack/react-router";
// import { useEffect, useRef, useState } from "react";
// import {
//   AlertTriangle,
//   CheckCircle2,
//   ChevronRight,
//   Clock,
//   Loader2,
//   LogOut,
//   Phone,
//   RefreshCw,
//   ShieldCheck,
//   UserCheck,
//   X,
//   XCircle,
// } from "lucide-react";
// import {
//   sendOtp,
//   verifyOtp,
//   officerListApplications,
//   officerDecideApplication,
//   type OfficerApplication,
// } from "@/lib/api";
// import { cn } from "@/lib/utils";

// export const Route = createFileRoute("/service-portal")({
//   head: () => ({
//     meta: [
//       { title: "Service Portal — Pink Card Verification" },
//       {
//         name: "description",
//         content: "Verifying Officer portal for reviewing Pink Card applications.",
//       },
//     ],
//   }),
//   component: ServicePortalFlow,
// });

// const PHONE_RE = /^[6-9]\d{9}$/;
// const OFFICER_SESSION_KEY = "pt.officerSession";
// const OFFICER_NAME_KEY = "pt.officerName";
// const OTP_RESEND = 30;

// type Screen = "login" | "otp" | "dashboard";
// type Tab = "pending" | "checked";

// // ── Root flow ────────────────────────────────────────────────────────────────

// function ServicePortalFlow() {
//   const [screen, setScreen] = useState<Screen>("login");
//   const [phone, setPhone] = useState("");
//   const [initialOtp, setInitialOtp] = useState<string | null>(null);

//   useEffect(() => {
//     const saved = localStorage.getItem(OFFICER_SESSION_KEY);
//     if (saved) setScreen("dashboard");
//   }, []);

//   if (screen === "dashboard") {
//     return (
//       <ServiceDashboard
//         onLogout={() => {
//           localStorage.removeItem(OFFICER_SESSION_KEY);
//           localStorage.removeItem(OFFICER_NAME_KEY);
//           setScreen("login");
//         }}
//       />
//     );
//   }

//   if (screen === "otp") {
//     return (
//       <OtpScreen
//         phone={phone}
//         initialOtp={initialOtp}
//         onBack={() => setScreen("login")}
//         onVerified={() => setScreen("dashboard")}
//       />
//     );
//   }

//   return (
//     <LoginScreen
//       phone={phone}
//       setPhone={setPhone}
//       onSent={(otp) => {
//         setInitialOtp(otp ?? null);
//         setScreen("otp");
//       }}
//     />
//   );
// }

// // ── Login ────────────────────────────────────────────────────────────────────

// function LoginScreen({
//   phone,
//   setPhone,
//   onSent,
// }: {
//   phone: string;
//   setPhone: (v: string) => void;
//   onSent: (otp: string | undefined) => void;
// }) {
//   const [error, setError] = useState<string | null>(null);
//   const [busy, setBusy] = useState(false);

//   async function send() {
//     if (!PHONE_RE.test(phone)) {
//       setError("Enter a valid 10-digit phone number.");
//       return;
//     }
//     setError(null);
//     setBusy(true);
//     try {
//       const res = await sendOtp(phone);
//       onSent(res.otp_code);
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : "Failed to send OTP.");
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <div className="flex min-h-[100svh] items-center justify-center bg-[#07090f] px-4">
//       <div className="w-full max-w-[420px]">
//         <div className="mb-8 flex items-center gap-3">
//           <div className="flex size-10 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
//             <ShieldCheck className="size-5" strokeWidth={1.5} />
//           </div>
//           <div>
//             <p className="font-sans text-[11px] uppercase tracking-widest text-white/40">
//               State Transit Department
//             </p>
//             <h1 className="font-sans text-[18px] font-semibold text-white">
//               Service Portal
//             </h1>
//           </div>
//         </div>

//         <div className="rounded-[16px] border border-white/10 bg-white/[0.04] p-7">
//           <h2 className="font-sans text-[22px] font-semibold text-white">
//             Officer Sign in
//           </h2>
//           <p className="mt-1 font-sans text-[13px] text-white/50">
//             Use your registered officer phone number · OTP will appear on screen
//           </p>

//           <div className="mt-6">
//             <label className="mb-2 block font-sans text-[12px] text-white/60">
//               Phone number
//             </label>
//             <div className="flex items-center rounded-[10px] border border-white/15 bg-white/[0.05]">
//               <span className="flex items-center gap-2 border-r border-white/10 px-3 font-sans text-[13px] text-white/50">
//                 <Phone className="size-3.5" strokeWidth={1.5} />
//                 +91
//               </span>
//               <input
//                 value={phone}
//                 onChange={(e) =>
//                   setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
//                 }
//                 onKeyDown={(e) => e.key === "Enter" && send()}
//                 inputMode="numeric"
//                 maxLength={10}
//                 placeholder="9888888888"
//                 className="h-11 flex-1 bg-transparent px-3 font-sans text-[14px] text-white placeholder:text-white/25 focus:outline-none"
//               />
//             </div>
//           </div>

//           {error && (
//             <p className="mt-4 rounded-[8px] border border-red-500/30 bg-red-500/10 px-3 py-2 font-sans text-[12px] text-red-400">
//               {error}
//             </p>
//           )}

//           <button
//             type="button"
//             onClick={send}
//             disabled={busy}
//             className="mt-6 flex h-11 w-full items-center justify-center rounded-[10px] bg-rose-600 font-sans text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
//           >
//             {busy ? <Loader2 className="size-4 animate-spin" /> : "Send OTP →"}
//           </button>
//         </div>

//         <p className="mt-5 text-center font-sans text-[12px] text-white/30">
//           Access restricted to authorised Verifying Officers only.
//         </p>
//       </div>
//     </div>
//   );
// }

// // ── OTP ──────────────────────────────────────────────────────────────────────

// function OtpScreen({
//   phone,
//   initialOtp,
//   onBack,
//   onVerified,
// }: {
//   phone: string;
//   initialOtp: string | null;
//   onBack: () => void;
//   onVerified: () => void;
// }) {
//   const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
//   const [mockOtp, setMockOtp] = useState<string | null>(initialOtp);
//   const [error, setError] = useState<string | null>(null);
//   const [busy, setBusy] = useState(false);
//   const [resendIn, setResendIn] = useState(OTP_RESEND);
//   const refs = useRef<Array<HTMLInputElement | null>>([]);

//   useEffect(() => {
//     const id = setInterval(
//       () => setResendIn((v) => (v > 0 ? v - 1 : 0)),
//       1000,
//     );
//     return () => clearInterval(id);
//   }, []);

//   function setAt(i: number, value: string) {
//     const digits = value.replace(/\D/g, "");
//     setOtp((prev) => {
//       const next = [...prev];
//       if (!digits) {
//         next[i] = "";
//       } else {
//         digits.split("").forEach((d, k) => {
//           if (i + k < 6) next[i + k] = d;
//         });
//       }
//       return next;
//     });
//     if (digits) {
//       refs.current[Math.min(i + digits.length, 5)]?.focus();
//     }
//   }

//   async function verify() {
//     const code = otp.join("");
//     if (code.length < 6) {
//       setError("Enter all 6 digits.");
//       return;
//     }
//     setError(null);
//     setBusy(true);
//     try {
//       const res = await verifyOtp(phone, code);
//       if (res.user.role !== "officer" && res.user.role !== "admin") {
//         setError(
//           "This account does not have Verifying Officer access. Contact your administrator.",
//         );
//         setBusy(false);
//         return;
//       }
//       localStorage.setItem(OFFICER_SESSION_KEY, res.token);
//       localStorage.setItem(
//         OFFICER_NAME_KEY,
//         res.user.name ?? `Officer (${phone})`,
//       );
//       // Also update the main app session so API calls work
//       localStorage.setItem("pt.session", res.token);
//       onVerified();
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : "Incorrect OTP.");
//     } finally {
//       setBusy(false);
//     }
//   }

//   async function resend() {
//     try {
//       const res = await sendOtp(phone);
//       if (res.otp_code) setMockOtp(res.otp_code);
//       setResendIn(OTP_RESEND);
//       setOtp(Array(6).fill(""));
//     } catch {
//       /* ignore */
//     }
//   }

//   return (
//     <div className="flex min-h-[100svh] items-center justify-center bg-[#07090f] px-4">
//       <div className="w-full max-w-[420px]">
//         <div className="mb-8 flex items-center gap-3">
//           <div className="flex size-10 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
//             <ShieldCheck className="size-5" strokeWidth={1.5} />
//           </div>
//           <div>
//             <p className="font-sans text-[11px] uppercase tracking-widest text-white/40">
//               State Transit Department
//             </p>
//             <h1 className="font-sans text-[18px] font-semibold text-white">
//               Service Portal
//             </h1>
//           </div>
//         </div>

//         <div className="rounded-[16px] border border-white/10 bg-white/[0.04] p-7">
//           <h2 className="font-sans text-[22px] font-semibold text-white">
//             Verify OTP
//           </h2>
//           <p className="mt-1 font-sans text-[13px] text-white/50">
//             Sent to +91 {phone} ·{" "}
//             <button
//               type="button"
//               onClick={onBack}
//               className="text-rose-400 hover:underline"
//             >
//               change
//             </button>
//           </p>

//           {mockOtp && (
//             <div className="mt-4 rounded-[8px] border border-yellow-400/30 bg-yellow-400/10 px-3 py-2">
//               <p className="font-sans text-[12px] text-yellow-300">
//                 Demo OTP:{" "}
//                 <span className="font-bold tracking-widest">{mockOtp}</span>
//               </p>
//             </div>
//           )}

//           <div className="mt-6 flex justify-between gap-2">
//             {otp.map((digit, i) => (
//               <input
//                 key={i}
//                 ref={(el) => {
//                   refs.current[i] = el;
//                 }}
//                 inputMode="numeric"
//                 maxLength={6}
//                 value={digit}
//                 onChange={(e) => setAt(i, e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Backspace" && !otp[i] && i > 0)
//                     refs.current[i - 1]?.focus();
//                   if (e.key === "Enter") verify();
//                 }}
//                 className="h-12 w-full rounded-[8px] border border-white/15 bg-white/[0.05] text-center font-sans text-[18px] text-white focus:border-rose-500 focus:outline-none"
//               />
//             ))}
//           </div>

//           {error && (
//             <p className="mt-4 rounded-[8px] border border-red-500/30 bg-red-500/10 px-3 py-2 font-sans text-[12px] text-red-400">
//               {error}
//             </p>
//           )}

//           <button
//             type="button"
//             onClick={verify}
//             disabled={busy}
//             className="mt-5 flex h-11 w-full items-center justify-center rounded-[10px] bg-rose-600 font-sans text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
//           >
//             {busy ? (
//               <Loader2 className="size-4 animate-spin" />
//             ) : (
//               "Verify & Enter →"
//             )}
//           </button>

//           <p className="mt-4 text-center font-sans text-[12px] text-white/40">
//             {resendIn > 0 ? (
//               `Resend in ${resendIn}s`
//             ) : (
//               <button
//                 type="button"
//                 onClick={resend}
//                 className="text-rose-400 hover:underline"
//               >
//                 Resend OTP
//               </button>
//             )}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Dashboard ────────────────────────────────────────────────────────────────

// function ServiceDashboard({ onLogout }: { onLogout: () => void }) {
//   const officerName =
//     localStorage.getItem(OFFICER_NAME_KEY) ?? "Verifying Officer";
//   const [tab, setTab] = useState<Tab>("pending");
//   const [applications, setApplications] = useState<OfficerApplication[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selected, setSelected] = useState<OfficerApplication | null>(null);

//   async function fetchApplications(t: Tab) {
//     setLoading(true);
//     setError(null);
//     // Ensure the officer token is active for API calls
//     const token = localStorage.getItem(OFFICER_SESSION_KEY);
//     if (token) localStorage.setItem("pt.session", token);
//     try {
//       const res = await officerListApplications(t);
//       setApplications(res.applications);
//     } catch (err: unknown) {
//       setError(
//         err instanceof Error ? err.message : "Failed to load applications.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchApplications(tab);
//   }, [tab]);

//   function onDecided(updated: OfficerApplication) {
//     setSelected(null);
//     setApplications((prev) => prev.filter((a) => a.id !== updated.id));
//   }

//   return (
//     <div className="flex min-h-[100svh] flex-col bg-[#07090f] text-white">
//       {/* Header */}
//       <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
//         <div className="flex items-center gap-3">
//           <div className="flex size-8 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
//             <ShieldCheck className="size-4" strokeWidth={1.5} />
//           </div>
//           <div>
//             <p className="font-sans text-[13px] font-semibold text-white">
//               Service Portal
//             </p>
//             <p className="font-sans text-[11px] text-white/40">
//               Pink Card Verification
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center gap-5">
//           <div className="flex items-center gap-2 font-sans text-[13px] text-white/50">
//             <UserCheck className="size-4" strokeWidth={1.5} />
//             {officerName}
//           </div>
//           <button
//             type="button"
//             onClick={onLogout}
//             className="flex items-center gap-2 font-sans text-[13px] text-white/50 transition-colors hover:text-white"
//           >
//             <LogOut className="size-4" strokeWidth={1.5} />
//             Logout
//           </button>
//         </div>
//       </header>

//       {/* Main */}
//       <main className="flex-1 px-6 py-8">
//         <div className="mx-auto max-w-[1100px]">
//           {/* Title row */}
//           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h1 className="font-sans text-[26px] font-bold text-white">
//                 Pink Card Applications
//               </h1>
//               <p className="mt-0.5 font-sans text-[13px] text-white/40">
//                 Review citizen applications and approve or deny eligibility
//               </p>
//             </div>
//             <div className="flex items-center gap-2">
//               {/* Tabs */}
//               <div className="flex gap-1 rounded-[8px] border border-white/10 bg-white/[0.03] p-1">
//                 {(["pending", "checked"] as Tab[]).map((t) => (
//                   <button
//                     key={t}
//                     type="button"
//                     onClick={() => setTab(t)}
//                     className={cn(
//                       "rounded-[6px] px-4 py-1.5 font-sans text-[13px] capitalize transition-colors",
//                       tab === t
//                         ? "bg-rose-600 text-white"
//                         : "text-white/50 hover:text-white",
//                     )}
//                   >
//                     {t}
//                   </button>
//                 ))}
//               </div>
//               {/* Refresh */}
//               <button
//                 type="button"
//                 onClick={() => fetchApplications(tab)}
//                 className="flex size-9 items-center justify-center rounded-[8px] border border-white/15 text-white/50 transition-colors hover:text-white"
//               >
//                 <RefreshCw
//                   className={cn("size-4", loading && "animate-spin")}
//                   strokeWidth={1.5}
//                 />
//               </button>
//             </div>
//           </div>

//           {/* Error */}
//           {error && (
//             <div className="mt-6 flex items-center gap-3 rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3">
//               <AlertTriangle className="size-5 text-red-400" strokeWidth={1.5} />
//               <p className="font-sans text-[13px] text-red-400">{error}</p>
//             </div>
//           )}

//           {/* Table */}
//           {loading && applications.length === 0 ? (
//             <div className="mt-20 flex justify-center">
//               <Loader2 className="size-8 animate-spin text-rose-400" />
//             </div>
//           ) : (
//             <div className="mt-6 overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.03]">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-white/10 bg-white/[0.02]">
//                     {[
//                       "Applicant",
//                       "PAN",
//                       "State",
//                       "Source",
//                       "System Check",
//                       "Status",
//                       "",
//                     ].map((h) => (
//                       <th
//                         key={h}
//                         className="px-4 py-3 text-left font-sans text-[11px] uppercase tracking-wide text-white/40"
//                       >
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {applications.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={7}
//                         className="py-16 text-center font-sans text-[13px] text-white/30"
//                       >
//                         {tab === "pending"
//                           ? "No pending applications — all caught up!"
//                           : "No checked applications yet."}
//                       </td>
//                     </tr>
//                   ) : (
//                     applications.map((app, i) => (
//                       <tr
//                         key={app.id}
//                         onClick={() => setSelected(app)}
//                         className={cn(
//                           "cursor-pointer border-b border-white/[0.05] transition-colors hover:bg-white/[0.04]",
//                           i === applications.length - 1 && "border-0",
//                         )}
//                       >
//                         <td className="px-4 py-3">
//                           <p className="font-sans text-[13px] font-medium text-white">
//                             {app.full_name}
//                           </p>
//                           <p className="font-sans text-[11px] text-white/40">
//                             {app.phone}
//                           </p>
//                         </td>
//                         <td className="px-4 py-3 font-sans text-[13px] text-white/70">
//                           {app.pan}
//                         </td>
//                         <td className="px-4 py-3 font-sans text-[13px] text-white/70">
//                           {app.state}
//                         </td>
//                         <td className="px-4 py-3">
//                           <span
//                             className={cn(
//                               "rounded-full px-2 py-0.5 font-sans text-[11px]",
//                               app.source === "auto_match"
//                                 ? "bg-indigo-500/20 text-indigo-300"
//                                 : "bg-amber-500/20 text-amber-300",
//                             )}
//                           >
//                             {app.source === "auto_match"
//                               ? "PAN matched"
//                               : "Manual review"}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3">
//                           {app.source === "auto_match" ? (
//                             app.eligible ? (
//                               <span className="flex items-center gap-1 font-sans text-[12px] text-emerald-400">
//                                 <CheckCircle2
//                                   className="size-3.5"
//                                   strokeWidth={1.5}
//                                 />
//                                 Eligible
//                               </span>
//                             ) : (
//                               <span className="flex items-center gap-1 font-sans text-[12px] text-red-400">
//                                 <XCircle
//                                   className="size-3.5"
//                                   strokeWidth={1.5}
//                                 />
//                                 Not eligible
//                               </span>
//                             )
//                           ) : (
//                             <span className="font-sans text-[12px] text-white/30">
//                               —
//                             </span>
//                           )}
//                         </td>
//                         <td className="px-4 py-3">
//                           <span
//                             className={cn(
//                               "flex w-fit items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[11px] uppercase tracking-wide",
//                               app.status === "submitted"
//                                 ? "bg-white/10 text-white/60"
//                                 : app.status === "eligible"
//                                   ? "bg-emerald-500/20 text-emerald-300"
//                                   : "bg-red-500/20 text-red-300",
//                             )}
//                           >
//                             {app.status === "submitted" && (
//                               <Clock className="size-3" strokeWidth={2} />
//                             )}
//                             {app.status === "submitted"
//                               ? "Pending"
//                               : app.status === "eligible"
//                                 ? "Eligible"
//                                 : "Not eligible"}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-right">
//                           <ChevronRight
//                             className="ml-auto size-4 text-white/30"
//                             strokeWidth={1.5}
//                           />
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           <p className="mt-3 font-sans text-[11.5px] text-white/25">
//             {tab === "pending"
//               ? `${applications.length} awaiting review`
//               : `${applications.length} total`}
//           </p>
//         </div>
//       </main>

//       {/* Detail panel */}
//       {selected && (
//         <ApplicationDetailPanel
//           application={selected}
//           onClose={() => setSelected(null)}
//           onDecided={onDecided}
//         />
//       )}
//     </div>
//   );
// }

// // ── Detail panel ─────────────────────────────────────────────────────────────

// function ApplicationDetailPanel({
//   application,
//   onClose,
//   onDecided,
// }: {
//   application: OfficerApplication;
//   onClose: () => void;
//   onDecided: (updated: OfficerApplication) => void;
// }) {
//   const app = application;
//   const isAutoIneligible =
//     app.source === "auto_match" && app.eligible === false;
//   const isManual = app.source === "manual";
//   const alreadyDecided = app.status !== "submitted";

//   const [manualIncome, setManualIncome] = useState(
//     app.manual_income != null ? String(app.manual_income) : "",
//   );
//   const [manualReason, setManualReason] = useState(
//     app.manual_reason ?? "",
//   );
//   const [busy, setBusy] = useState<"approve" | "deny" | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   async function decide(decision: "approve" | "deny") {
//     setError(null);

//     if (isManual) {
//       if (
//         decision === "approve" &&
//         (!manualIncome.trim() || Number.isNaN(Number(manualIncome)))
//       ) {
//         setError("Enter a valid annual income to approve.");
//         return;
//       }
//       if (!manualReason.trim()) {
//         setError("Enter a reason before deciding.");
//         return;
//       }
//     }

//     setBusy(decision);
//     try {
//       const payload: Parameters<typeof officerDecideApplication>[0] = {
//         application_id: app.id,
//         decision,
//       };
//       if (isManual) {
//         if (manualIncome) payload.manual_income = Number(manualIncome);
//         if (manualReason) payload.manual_reason = manualReason.trim();
//       }
//       const res = await officerDecideApplication(payload);
//       onDecided(res.application);
//     } catch (err: unknown) {
//       setError(
//         err instanceof Error ? err.message : "Failed to record decision.",
//       );
//     } finally {
//       setBusy(null);
//     }
//   }

//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[3px]"
//         onClick={onClose}
//       />

//       {/* Slide-in panel */}
//       <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col bg-[#0d0f1a] shadow-[-8px_0_40px_rgba(0,0,0,0.6)]">
//         {/* Panel header */}
//         <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
//           <h2 className="font-sans text-[16px] font-semibold text-white">
//             Application Detail
//           </h2>
//           <button
//             type="button"
//             onClick={onClose}
//             className="text-white/40 transition-colors hover:text-white"
//           >
//             <X className="size-5" strokeWidth={1.5} />
//           </button>
//         </div>

//         {/* Panel body */}
//         <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
//           {/* Citizen details */}
//           <div className="rounded-[12px] border border-white/10 bg-white/[0.03] p-5">
//             <p className="mb-3 font-sans text-[11px] uppercase tracking-wide text-white/40">
//               Citizen Details
//             </p>
//             <DetailRow label="Full Name" value={app.full_name} />
//             <DetailRow label="Phone" value={app.phone} />
//             <DetailRow label="Aadhaar" value={app.aadhaar} />
//             <DetailRow label="PAN" value={app.pan} />
//             <DetailRow label="State" value={app.state} />
//             <DetailRow
//               label="Submitted"
//               value={new Date(app.checked_at).toLocaleString("en-IN")}
//             />
//           </div>

//           {/* System check */}
//           <div className="rounded-[12px] border border-white/10 bg-white/[0.03] p-5">
//             <p className="mb-3 font-sans text-[11px] uppercase tracking-wide text-white/40">
//               System Check
//             </p>
//             {app.source === "auto_match" ? (
//               <>
//                 <DetailRow label="PAN match" value="Found in income records" />
//                 <DetailRow label="Gender" value={app.gender ?? "—"} />
//                 <DetailRow
//                   label="Annual Income"
//                   value={`₹${(app.annual_income ?? 0).toLocaleString("en-IN")}`}
//                 />
//                 <DetailRow
//                   label="Threshold"
//                   value={`₹${app.threshold.toLocaleString("en-IN")}`}
//                 />
//                 <DetailRow
//                   label="System Decision"
//                   value={app.eligible ? "✓ Eligible" : "✗ Not eligible"}
//                 />
//                 <DetailRow
//                   label="Reason"
//                   value={app.reason_message ?? "—"}
//                 />
//               </>
//             ) : (
//               <p className="font-sans text-[13px] text-amber-300">
//                 No income record found for this PAN. Enter income and reason
//                 below before deciding.
//               </p>
//             )}
//           </div>

//           {/* Auto-ineligible warning */}
//           {isAutoIneligible && !alreadyDecided && (
//             <div className="flex items-start gap-3 rounded-[10px] border border-amber-500/30 bg-amber-500/10 px-4 py-3">
//               <AlertTriangle
//                 className="mt-0.5 size-5 shrink-0 text-amber-400"
//                 strokeWidth={1.5}
//               />
//               <p className="font-sans text-[12.5px] text-amber-300">
//                 This PAN matched income records and was found ineligible by the
//                 system. Only <strong>Deny</strong> is available for this
//                 application.
//               </p>
//             </div>
//           )}

//           {/* Manual entry fields */}
//           {isManual && !alreadyDecided && (
//             <div className="rounded-[12px] border border-white/10 bg-white/[0.03] p-5">
//               <p className="mb-3 font-sans text-[11px] uppercase tracking-wide text-white/40">
//                 Manual Entry
//               </p>
//               <label className="mb-4 block">
//                 <span className="mb-1.5 block font-sans text-[12px] text-white/60">
//                   Annual Income (₹)
//                 </span>
//                 <input
//                   value={manualIncome}
//                   onChange={(e) =>
//                     setManualIncome(e.target.value.replace(/[^\d]/g, ""))
//                   }
//                   inputMode="numeric"
//                   placeholder="e.g. 180000"
//                   className="h-10 w-full rounded-[8px] border border-white/15 bg-white/[0.05] px-3 font-sans text-[13px] text-white placeholder:text-white/25 focus:border-rose-500 focus:outline-none"
//                 />
//               </label>
//               <label className="block">
//                 <span className="mb-1.5 block font-sans text-[12px] text-white/60">
//                   Reason for Decision
//                 </span>
//                 <textarea
//                   value={manualReason}
//                   onChange={(e) => setManualReason(e.target.value)}
//                   rows={3}
//                   placeholder="e.g. Income verified manually at ₹1,80,000 — below threshold."
//                   className="w-full rounded-[8px] border border-white/15 bg-white/[0.05] px-3 py-2 font-sans text-[13px] text-white placeholder:text-white/25 focus:border-rose-500 focus:outline-none"
//                 />
//               </label>
//             </div>
//           )}

//           {/* Already decided summary */}
//           {alreadyDecided && (
//             <div className="rounded-[12px] border border-white/10 bg-white/[0.03] p-5">
//               <p className="mb-3 font-sans text-[11px] uppercase tracking-wide text-white/40">
//                 Decision
//               </p>
//               <DetailRow
//                 label="Final Status"
//                 value={
//                   app.status === "eligible" ? "✓ Eligible" : "✗ Not eligible"
//                 }
//               />
//               {app.decided_at && (
//                 <DetailRow
//                   label="Decided At"
//                   value={new Date(app.decided_at).toLocaleString("en-IN")}
//                 />
//               )}
//               {app.manual_income != null && (
//                 <DetailRow
//                   label="Manual Income"
//                   value={`₹${app.manual_income.toLocaleString("en-IN")}`}
//                 />
//               )}
//               {app.manual_reason && (
//                 <DetailRow label="Manual Reason" value={app.manual_reason} />
//               )}
//             </div>
//           )}

//           {/* Error */}
//           {error && (
//             <p className="rounded-[8px] border border-red-500/40 bg-red-500/15 px-3 py-2 font-sans text-[12.5px] text-red-400">
//               {error}
//             </p>
//           )}
//         </div>

//         {/* Action buttons — only shown for pending applications */}
//         {!alreadyDecided && (
//           <div className="flex gap-3 border-t border-white/10 px-6 py-4">
//             {!isAutoIneligible && (
//               <button
//                 type="button"
//                 onClick={() => decide("approve")}
//                 disabled={busy !== null}
//                 className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] bg-emerald-600 font-sans text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
//               >
//                 {busy === "approve" ? (
//                   <Loader2 className="size-4 animate-spin" />
//                 ) : (
//                   <CheckCircle2 className="size-4" strokeWidth={1.5} />
//                 )}
//                 Approve
//               </button>
//             )}
//             <button
//               type="button"
//               onClick={() => decide("deny")}
//               disabled={busy !== null}
//               className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] bg-red-600 font-sans text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
//             >
//               {busy === "deny" ? (
//                 <Loader2 className="size-4 animate-spin" />
//               ) : (
//                 <XCircle className="size-4" strokeWidth={1.5} />
//               )}
//               Deny
//             </button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

// // ── Detail row ────────────────────────────────────────────────────────────────

// function DetailRow({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2.5 last:border-0">
//       <span className="shrink-0 font-sans text-[12px] text-white/40">
//         {label}
//       </span>
//       <span className="text-right font-sans text-[13px] text-white">
//         {value}
//       </span>
//     </div>
//   );
// }
