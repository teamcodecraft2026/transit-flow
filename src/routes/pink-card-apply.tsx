import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  Phone,
  UploadCloud,
  UserRound,
  XCircle,
} from "lucide-react";
import navyBg from "@/assets/night-street-navy.jpg";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/Button";
import { useI18n } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import {
  submitPinkCardApplication,
  getApplicationStatus,
  type ApplicationStatusResponse,
} from "@/lib/api";
import { useAuth } from "@/auth/AuthProvider";

export const Route = createFileRoute("/pink-card-apply")({
  component: PinkCardApplyPage,
});

const STATUS_POLL_INTERVAL_MS = 2000;

function getPinkCardKey(): string {
  try {
    const raw = localStorage.getItem("pt.user");
    if (raw) {
      const user = JSON.parse(raw) as { id: string };
      if (user?.id) return `pt.pinkCardApplicationId.${user.id}`;
    }
  } catch {
    /* ignore */
  }
  return "pt.pinkCardApplicationId.guest";
}

const AADHAAR_RE = /^\d{12}$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const PAN_RE = /^[A-Z]{5}\d{4}[A-Z]$/;

//  Types

type FormState = {
  fullName: string;
  phone: string;
  aadhaar: string;
  aadhaarFile: string | null;
  pan: string;
  panFile: string | null;
  state: string;
  certFile: string | null;
};

const EMPTY: FormState = {
  fullName: "",
  phone: "",
  aadhaar: "",
  aadhaarFile: null,
  pan: "",
  panFile: null,
  state: "",
  certFile: null,
};

const STATES = [
  "West Bengal",
  "Bihar",
  "Jharkhand",
  "Odisha",
  "Assam",
  "Delhi",
  "Maharashtra",
  "Karnataka",
];

function PinkCardApplyPage() {
  const { t } = useI18n();
  const { requireAuth } = useAuth();
  const navigate = useNavigate();

  const savedApplicationId = (() => {
    try {
      return localStorage.getItem(getPinkCardKey());
    } catch {
      return null;
    }
  })();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormState | "state", string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(savedApplicationId);
  const [appStatus, setAppStatus] = useState<ApplicationStatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(Boolean(savedApplicationId));
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const steps = [t("apply.s1"), t("apply.s2"), t("apply.s3"), t("apply.s4")];
  const titles = [t("apply.t1"), t("apply.t2"), t("apply.t3"), t("apply.t4")];

  //  Poll status once we have an application_id
  useEffect(() => {
    if (!applicationId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const res = await getApplicationStatus(applicationId!);
        if (cancelled) return;
        setAppStatus(res);
        setStatusLoading(false);
        if (res.status === "submitted") {
          timer = setTimeout(poll, STATUS_POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (!cancelled) {
          setStatusLoading(false);
          console.error("Status poll failed:", err);
          timer = setTimeout(poll, STATUS_POLL_INTERVAL_MS);
        }
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [applicationId]);

  //  Per-step validation
  function validateStep(n: number): boolean {
    const errs: Partial<Record<string, string>> = {};
    if (n === 1) {
      if (!form.fullName.trim()) errs["fullName"] = "Full name is required.";
      if (!PHONE_RE.test(form.phone)) errs["phone"] = "Enter a valid 10-digit phone number.";
      if (!AADHAAR_RE.test(form.aadhaar)) errs["aadhaar"] = "Aadhaar must be exactly 12 digits.";
    } else if (n === 2) {
      if (!PAN_RE.test(form.pan.toUpperCase()))
        errs["pan"] = "Enter a valid PAN (e.g. ABCDE1234F).";
    } else if (n === 3) {
      if (!form.state) errs["state"] = "Please select your state.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, 4));
  }

  function back() {
    setFieldErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }

  async function submit() {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setSubmitError("Please complete all required fields before submitting.");
      return;
    }
    requireAuth(async () => {
      setSubmitting(true);
      setSubmitError(null);
      try {
        const res = await submitPinkCardApplication({
          full_name: form.fullName.trim(),
          phone: form.phone.trim(),
          aadhaar: form.aadhaar.trim(),
          pan: form.pan.trim().toUpperCase(),
          state: form.state,
        });
        localStorage.setItem(getPinkCardKey(), res.application_id);
        setApplicationId(res.application_id);
        setStatusLoading(true);
      } catch (err: unknown) {
        setSubmitError(err instanceof Error ? err.message : "Submission failed. Please try again.");
      } finally {
        setSubmitting(false);
      }
    });
  }

  function startOver() {
    localStorage.removeItem(getPinkCardKey());
    setApplicationId(null);
    setAppStatus(null);
    setStep(1);
    setForm(EMPTY);
    setFieldErrors({});
  }

  //  "Application Submitted" / pending screen
  if (applicationId && (statusLoading || !appStatus || appStatus.status === "submitted")) {
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
            <Clock className="mx-auto size-16 text-rose-400" strokeWidth={1.5} />
            <h1 className="mt-5 font-display text-[34px] text-white">Application Submitted</h1>
            <p className="mt-3 font-sans text-[14px] text-white/60">
              Your Pink Card application has been forwarded to a Verifying Officer for review. This
              page will update automatically once a decision is made.
            </p>
            <div className="mt-6 rounded-[14px] border border-white/10 bg-white/[0.04] p-5 text-left">
              <Row label="Application ID" value={applicationId} />
              <Row label="Status" value="Pending officer review" />
            </div>
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 font-sans text-[12.5px] text-white/40">
                <Loader2 className="size-4 animate-spin" />
                Checking for updates every 2s
              </div>
              <button
                type="button"
                onClick={async () => {
                  setStatusLoading(true);
                  try {
                    const res = await getApplicationStatus(applicationId!);
                    setAppStatus(res);
                  } catch {
                    /* ignore */
                  } finally {
                    setStatusLoading(false);
                  }
                }}
                className="font-sans text-[12px] text-rose-400 underline hover:text-rose-300"
              >
                Check now
              </button>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="mt-8 min-w-[200px]"
              onClick={() => navigate({ to: "/home" })}
            >
              Back to Home
            </Button>
          </div>
        </section>
      </PageShell>
    );
  }

  //  Decided result screen
  if (applicationId && appStatus && appStatus.status !== "submitted") {
    const eligible = appStatus.status === "eligible";
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
            {eligible ? (
              <>
                <CheckCircle2 className="mx-auto size-16 text-green-400" strokeWidth={1.5} />
                <h1 className="mt-5 font-display text-[34px] text-white">You're Eligible! </h1>
                <p className="mt-3 font-sans text-[14px] text-white/60">
                  Your Pink Card is now active. Your next ticket booking will automatically be{" "}
                  <strong className="text-rose-400">0</strong>.
                </p>
                <div className="mt-6 rounded-[14px] border border-green-500/30 bg-green-500/10 p-5 text-left">
                  <Row label="PAN" value={appStatus.pan ?? ""} />
                  <Row
                    label="Annual Income"
                    value={`${(appStatus.annual_income ?? 0).toLocaleString("en-IN")}`}
                  />
                  <Row
                    label="Threshold"
                    value={`${(appStatus.threshold ?? 0).toLocaleString("en-IN")}`}
                  />
                  <Row label="Reason" value={appStatus.reason_message ?? ""} />
                </div>
                <Button
                  variant="pinkSolid"
                  size="lg"
                  className="mt-8 min-w-[200px]"
                  onClick={() => navigate({ to: "/book" })}
                >
                  Book a Free Ticket
                </Button>
              </>
            ) : (
              <>
                {(() => {
                  // For manual apps, use manual_reason as the reason code
                  // For auto_match apps, use reason_code
                  const isManual =
                    !appStatus.reason_code ||
                    (appStatus.reason_code === "INELIGIBLE_NO_RECORD" &&
                      appStatus.reason_message !==
                        "No income record found for this PAN — requires manual review.");
                  const effectiveReasonCode = appStatus.reason_code;
                  const manualReason = appStatus.reason_message;

                  // Override reason code → human readable label
                  function getOverrideLabel(code: string): string {
                    if (code === "OVERRIDE_DOC_MISMATCH")
                      return "Documents do not match PAN records.";
                    if (code === "OVERRIDE_DUPLICATE") return "Duplicate application detected.";
                    if (code === "OVERRIDE_FRAUD")
                      return "Application contains false or suspicious information.";
                    // OVERRIDE_OTHER or custom text — show as-is
                    return code;
                  }

                  // Build human-readable label
                  function getReasonLabel(): string {
                    // Officer override check FIRST — takes priority over everything
                    if (appStatus.is_officer_override && appStatus.override_reason) {
                      return `Your application was denied by a Verifying Officer: ${getOverrideLabel(appStatus.override_reason)}`;
                    }
                    // Check if this is a manual review app by seeing if reason_message
                    // matches one of our known reason codes
                    const knownCodes = [
                      "ELIGIBLE_INCOME_GENDER",
                      "INELIGIBLE_GENDER",
                      "INELIGIBLE_INCOME_HIGH",
                      "INELIGIBLE_STATE",
                    ];
                    // If manual_reason is one of our dropdown codes, map it to a label
                    if (manualReason && knownCodes.includes(manualReason)) {
                      if (manualReason === "INELIGIBLE_GENDER")
                        return "Pink Card is only available to female applicants.";
                      if (manualReason === "INELIGIBLE_INCOME_HIGH") {
                        if (appStatus.gap)
                          return `Your annual income exceeds the threshold by ₹${Math.abs(appStatus.gap).toLocaleString("en-IN")}.`;
                        return "Your annual income exceeds the threshold.";
                      }
                      if (manualReason === "INELIGIBLE_STATE")
                        return "Pink Card is not available in your state.";
                      if (manualReason === "ELIGIBLE_INCOME_GENDER")
                        return "You meet the income and gender criteria.";
                    }
                    // If manual_reason is a custom text (OTHER), show it directly
                    if (
                      manualReason &&
                      !knownCodes.includes(manualReason) &&
                      manualReason !==
                        "No income record found for this PAN — requires manual review."
                    )
                      return manualReason;

                    // Auto match fallback
                    if (effectiveReasonCode === "INELIGIBLE_GENDER")
                      return "Pink Card is only available to female applicants.";
                    if (effectiveReasonCode === "INELIGIBLE_INCOME_HIGH") {
                      if (appStatus.gap)
                        return `Your annual income exceeds the threshold by ₹${Math.abs(appStatus.gap).toLocaleString("en-IN")}.`;
                      return "Your annual income exceeds the threshold.";
                    }
                    if (effectiveReasonCode === "INELIGIBLE_STATE")
                      return "Pink Card is not available in your state.";
                    return "Your application was not approved.";
                  }

                  // Display reason code — for manual apps use manual_reason if it's a known code
                  const knownCodes = [
                    "ELIGIBLE_INCOME_GENDER",
                    "INELIGIBLE_GENDER",
                    "INELIGIBLE_INCOME_HIGH",
                    "INELIGIBLE_STATE",
                  ];
                  const displayReasonCode =
                    appStatus.is_officer_override && appStatus.override_reason
                      ? (() => {
                          // override_reason stores the code directly
                          if (appStatus.override_reason === "OVERRIDE_DOC_MISMATCH")
                            return "OVERRIDE_DOC_MISMATCH";
                          if (appStatus.override_reason === "OVERRIDE_DUPLICATE")
                            return "OVERRIDE_DUPLICATE";
                          if (appStatus.override_reason === "OVERRIDE_FRAUD")
                            return "OVERRIDE_FRAUD";
                          return "OVERRIDE_OTHER"; // custom text from officer
                        })()
                      : manualReason && knownCodes.includes(manualReason)
                        ? manualReason
                        : effectiveReasonCode && effectiveReasonCode !== "INELIGIBLE_NO_RECORD"
                          ? effectiveReasonCode
                          : null;
                  const reasonLabel = getReasonLabel();

                  return (
                    <>
                      <XCircle className="mx-auto size-16 text-red-400" strokeWidth={1.5} />
                      <h1 className="mt-5 font-display text-[34px] text-white">Not Eligible</h1>
                      <p className="mt-3 font-sans text-[14px] text-white/60">{reasonLabel}</p>
                      <div className="mt-6 rounded-[14px] border border-red-500/30 bg-red-500/10 p-5 text-left">
                        <Row label="PAN" value={appStatus.pan ?? ""} />
                        {displayReasonCode && <Row label="Reason Code" value={displayReasonCode} />}
                        {(appStatus.annual_income ?? appStatus.manual_income ?? 0) > 0 && (
                          <Row
                            label="Annual Income"
                            value={`${(appStatus.annual_income ?? appStatus.manual_income ?? 0).toLocaleString("en-IN")}`}
                          />
                        )}
                      </div>
                      <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Button variant="outline" size="lg" onClick={startOver}>
                          Apply Again
                        </Button>
                        <Button
                          variant="pinkSolid"
                          size="lg"
                          onClick={() => navigate({ to: "/home" })}
                        >
                          Back to Home
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </section>
      </PageShell>
    );
  }

  //  4-step form
  return (
    <PageShell theme="rose" backHome hideFooter>
      <section className="relative -mt-[88px] flex min-h-[100svh] items-start justify-center overflow-hidden pb-24 pt-[120px]">
        <img
          src={navyBg}
          alt=""
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-black/65" />

        <div className="relative z-10 flex w-full max-w-[900px] gap-10 px-6">
          {/* Stepper sidebar */}
          <aside className="hidden w-[180px] shrink-0 pt-2 md:block">
            {steps.map((label, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={n} className="flex items-start gap-3 pb-8 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full font-display text-[15px] transition-colors",
                        done
                          ? "bg-rose-500 text-white"
                          : active
                            ? "bg-rose-500 text-white"
                            : "border border-white/20 text-white/30",
                      )}
                    >
                      {done ? <CheckCircle2 className="size-4" strokeWidth={2} /> : n}
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={cn(
                          "mt-1 w-px flex-1 transition-colors",
                          done ? "bg-rose-500/60" : "bg-white/10",
                        )}
                        style={{ height: 40 }}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-1.5 font-sans text-[13px]",
                      active ? "text-white" : done ? "text-rose-400" : "text-white/30",
                    )}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </aside>

          {/* Form card */}
          <div className="flex-1">
            <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm">
              <p className="mb-1 font-sans text-[11px] uppercase tracking-widest text-white/40">
                {t("apply.step").replace("{s}", String(step))}
              </p>
              <h2 className="font-display text-[26px] text-white">{titles[step - 1]}</h2>

              <div className="relative mt-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={back}
                    className="absolute left-0 top-0 flex items-center gap-1.5 font-sans text-[13px] text-white/40 transition-colors hover:text-white"
                  >
                    <ArrowLeft className="size-4" strokeWidth={1.75} />
                    Back
                  </button>
                )}

                <div className={step > 1 ? "pt-8" : ""}>
                  {/*  Step 1  */}
                  {step === 1 && (
                    <div className="space-y-5">
                      <TextField
                        label={t("apply.fullName")}
                        required
                        icon={<UserRound className="size-5" strokeWidth={1.5} />}
                        value={form.fullName}
                        onChange={(v) => set("fullName", v)}
                        placeholder="Priya Sharma"
                        error={fieldErrors["fullName"]}
                      />
                      <TextField
                        label={t("apply.phone")}
                        required
                        icon={<Phone className="size-5" strokeWidth={1.5} />}
                        value={form.phone}
                        onChange={(v) => set("phone", v.replace(/\D/g, "").slice(0, 10))}
                        placeholder="9876543210"
                        inputMode="numeric"
                        error={fieldErrors["phone"]}
                      />
                      <TextField
                        label={t("apply.aadhaar")}
                        required
                        icon={<CreditCard className="size-5" strokeWidth={1.5} />}
                        value={form.aadhaar}
                        onChange={(v) => set("aadhaar", v.replace(/\D/g, "").slice(0, 12))}
                        placeholder="XXXX XXXX XXXX"
                        inputMode="numeric"
                        error={fieldErrors["aadhaar"]}
                      />
                      <Dropzone
                        file={form.aadhaarFile}
                        onFile={(n) => set("aadhaarFile", n)}
                        className="h-32"
                      />
                      <p className="font-sans text-[11px] text-white/30">
                        Document upload is optional for this demo.
                      </p>
                    </div>
                  )}

                  {/*  Step 2  */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <TextField
                        label={t("apply.pan")}
                        required
                        icon={<CreditCard className="size-5" strokeWidth={1.5} />}
                        value={form.pan}
                        onChange={(v) => set("pan", v.toUpperCase().slice(0, 10))}
                        placeholder="ABCDE1234F"
                        error={fieldErrors["pan"]}
                      />
                      <p className="font-sans text-[12px] text-white/40">
                        Test PANs: <span className="text-rose-400">ABCDE1234F</span> (eligible
                        female) <span className="text-rose-400">IJKLM9012N</span> (income too high){" "}
                        <span className="text-rose-400">NOPQR4567S</span> (male). Any other PAN goes
                        to the officer for manual review.
                      </p>
                      <Dropzone
                        file={form.panFile}
                        onFile={(n) => set("panFile", n)}
                        className="h-32"
                      />
                      <p className="font-sans text-[11px] text-white/30">
                        Document upload is optional for this demo.
                      </p>
                    </div>
                  )}

                  {/*  Step 3  */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <div>
                        <span className="mb-2 block font-display text-[15px] text-white/90">
                          {t("apply.state")} <span className="text-rose-400">*</span>
                        </span>
                        <div
                          className={cn(
                            "flex h-12 items-center gap-3 rounded-[10px] border bg-white/[0.04] px-3",
                            fieldErrors["state"] ? "border-red-500" : "border-rose-500/45",
                          )}
                        >
                          <MapPin className="size-5 shrink-0 text-rose-400" strokeWidth={1.5} />
                          <select
                            value={form.state}
                            onChange={(e) => set("state", e.target.value)}
                            className="min-w-0 flex-1 bg-transparent font-display text-[15px] text-white focus:outline-none [&>option]:bg-[#0a0a14] [&>option]:text-white"
                          >
                            <option value="">Select state</option>
                            {STATES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="size-4 text-white/40" strokeWidth={1.5} />
                        </div>
                        {fieldErrors["state"] && (
                          <p className="mt-1.5 font-sans text-[12px] text-red-400">
                            {fieldErrors["state"]}
                          </p>
                        )}
                      </div>
                      <Dropzone
                        file={form.certFile}
                        onFile={(n) => set("certFile", n)}
                        className="h-36"
                      />
                      <p className="font-sans text-[11px] text-white/30">
                        Residency certificate upload is optional for this demo.
                      </p>
                    </div>
                  )}

                  {/*  Step 4  Review  */}
                  {step === 4 && (
                    <div className="space-y-2">
                      <ReviewRow
                        icon={<UserRound className="size-7 text-rose-400" strokeWidth={1.5} />}
                        label={t("apply.fullName")}
                        value={form.fullName || ""}
                        action={t("apply.edit")}
                        onEdit={() => setStep(1)}
                      />
                      <ReviewRow
                        icon={<CreditCard className="size-7 text-rose-400" strokeWidth={1.5} />}
                        label={t("apply.aadhaar")}
                        value={form.aadhaar || ""}
                        action={t("apply.editUpload")}
                        onEdit={() => setStep(1)}
                      />
                      <ReviewRow
                        icon={<CreditCard className="size-7 text-rose-400" strokeWidth={1.5} />}
                        label={t("apply.pan")}
                        value={form.pan || ""}
                        action={t("apply.editUpload")}
                        onEdit={() => setStep(2)}
                      />
                      <ReviewRow
                        icon={<MapPin className="size-7 text-rose-400" strokeWidth={1.5} />}
                        label={t("apply.state")}
                        value={form.state || ""}
                        action={t("apply.editUpload")}
                        onEdit={() => setStep(3)}
                      />
                      <ReviewRow
                        icon={<FileText className="size-7 text-rose-400" strokeWidth={1.5} />}
                        label={t("apply.uploadRes")}
                        value={form.certFile ?? t("apply.none")}
                        thumb={form.certFile}
                        action={t("apply.editUpload")}
                        onEdit={() => setStep(3)}
                      />
                      {submitError && (
                        <p className="mt-5 rounded-[8px] border border-red-500/40 bg-red-500/15 px-3 py-2 font-sans text-[12.5px] text-red-400">
                          {submitError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation button */}
                <div className="mt-9 flex justify-center">
                  {step < 4 ? (
                    <Button
                      variant="outlineRose"
                      size="lg"
                      className="min-w-[220px] font-display text-[15px] font-medium"
                      onClick={next}
                    >
                      {t("apply.continue")}
                    </Button>
                  ) : (
                    <Button
                      variant="pinkSolid"
                      size="lg"
                      className="min-w-[220px] font-display text-[15px] font-medium"
                      onClick={submit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" /> Submitting
                        </>
                      ) : (
                        t("apply.submit")
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

//  Sub-components

function TextField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  inputMode,
  required,
  error,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  inputMode?: "numeric" | "text";
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-display text-[15px] text-white/90">
        {label}
        {required && <span className="ml-1 text-rose-400">*</span>}
      </span>
      <div
        className={cn(
          "flex h-12 items-center gap-3 rounded-[10px] border bg-white/[0.04] px-3",
          error ? "border-red-500" : "border-rose-500/45",
        )}
      >
        <span className="shrink-0 text-rose-400">{icon}</span>
        <input
          value={value}
          inputMode={inputMode ?? "text"}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent font-display text-[15px] text-white placeholder:text-white/25 focus:outline-none"
        />
      </div>
      {error && <p className="mt-1.5 font-sans text-[12px] text-red-400">{error}</p>}
    </label>
  );
}

function Dropzone({
  file,
  onFile,
  className,
}: {
  file: string | null;
  onFile: (name: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => ref.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-rose-500/30 bg-white/[0.02] text-center transition-colors hover:border-rose-500/60",
        className,
      )}
    >
      <input
        ref={ref}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) onFile(e.target.files[0].name);
        }}
      />
      {file ? (
        <>
          <CheckCircle2 className="size-6 text-rose-400" strokeWidth={1.5} />
          <p className="font-sans text-[12px] text-rose-400">{file}</p>
        </>
      ) : (
        <>
          <UploadCloud className="size-6 text-white/30" strokeWidth={1.5} />
          <p className="font-sans text-[12px] text-white/30">{`Click to upload or drag and drop`}</p>
          <p className="font-sans text-[11px] text-white/20">JPG, PNG or PDF (Max 5MB)</p>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.07] py-2.5 last:border-0">
      <span className="font-sans text-[12px] text-white/40">{label}</span>
      <span className="font-sans text-[13px] text-white">{value}</span>
    </div>
  );
}

function ReviewRow({
  icon,
  label,
  value,
  thumb,
  action,
  onEdit,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  thumb?: string | null;
  action: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-white/[0.07] py-4 last:border-0">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[15px] text-white">{label}</p>
        <p className="font-sans text-[12px] text-white/40">
          {thumb ? " " : ""}
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 font-sans text-[12px] text-rose-400 hover:underline"
      >
        {action}
      </button>
    </div>
  );
}
//
