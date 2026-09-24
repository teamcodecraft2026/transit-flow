import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Armchair,
  Bus,
  CheckCircle2,
  Clock,
  Copy,
  Info,
  Loader2,
  LogOut,
  Phone,
  QrCode,
  UserRound,
  XCircle,
} from "lucide-react";
import navyBg from "@/assets/night-street-navy.jpg";
import { Button } from "@/components/Button";
import { GlowBorderButton } from "@/components/GlowBorderButton";
import { LanguageToggle } from "@/components/LanguageToggle";
import { QrFrame } from "@/components/QrFrame";
import { QrScanner } from "@/components/QrScanner";
import { useI18n } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { sendOtp, verifyOtp, scanTicket, type ScanTicketResponse } from "@/lib/api";

export const Route = createFileRoute("/conductor")({
  head: () => ({
    meta: [
      { title: "Conductor Login  Scan & Verify Tickets | Public Transit" },
      {
        name: "description",
        content:
          "Conductor sign-in for Public Transit: verify your ID and phone, then scan passenger QR tickets and review recent boardings.",
      },
      { property: "og:title", content: "Conductor Login  Scan & Verify Tickets | Public Transit" },
      {
        property: "og:description",
        content: "Sign in as a conductor to scan passenger QR tickets and confirm boardings.",
      },
    ],
  }),
  component: ConductorFlow,
});

const PHONE_RE = /^[6-9]\d{9}$/;
const OTP_SECONDS = 120;
const RESEND_SECONDS = 45;
const CONDUCTOR_ID_KEY = "pt.conductorId";
const CONDUCTOR_SESSION_KEY = "pt.conductorSession";

type Screen = "login" | "otp" | "dashboard";

function ConductorFlow() {
  const [screen, setScreen] = useState<Screen>("login");
  const [phone, setPhone] = useState("");
  const [conductorId, setConductorId] = useState("");
  const [name, setName] = useState("");
  const [initialOtp, setInitialOtp] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(CONDUCTOR_SESSION_KEY);
    const savedName = window.localStorage.getItem("pt.conductorName");
    if (saved && savedName) {
      setName(savedName);
      setScreen("dashboard");
    }
  }, []);

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-canvas">
      <img
        src={navyBg}
        alt=""
        width={1920}
        height={1088}
        className="absolute inset-0 size-full object-cover opacity-45 saturate-50"
      />
      <div className="absolute inset-0 bg-black/55" />

      {screen === "dashboard" ? (
        <Dashboard
          name={name}
          onLogout={() => {
            window.localStorage.removeItem(CONDUCTOR_SESSION_KEY);
            window.localStorage.removeItem("pt.conductorName");
            setScreen("login");
            setPhone("");
            setConductorId("");
          }}
        />
      ) : (
        <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-6 py-16">
          <div className="absolute right-6 top-6">
            <LanguageToggle />
          </div>
          {screen === "login" ? (
            <LoginPanel
              phone={phone}
              conductorId={conductorId}
              setPhone={setPhone}
              setConductorId={setConductorId}
              onSent={(otp) => {
                setInitialOtp(otp);
                setScreen("otp");
              }}
            />
          ) : (
            <OtpPanel
              phone={phone}
              initialOtp={initialOtp}
              onBack={() => setScreen("login")}
              onVerified={(who) => {
                setName(who);
                setScreen("dashboard");
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="anim-scale-in relative w-full max-w-[480px] rounded-[20px] border border-white/10 p-9 text-center shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-[20px]"
      style={{ backgroundColor: "rgba(10,18,42,0.7)" }}
    >
      {children}
    </div>
  );
}

function BusBadge() {
  return (
    <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-navy-accent/40">
      <Bus className="size-7 text-navy-icon" strokeWidth={1.5} />
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-left font-sans text-[13px] text-ink-muted">{children}</label>;
}

function Field({
  icon,
  value,
  onChange,
  placeholder,
  inputMode,
  maxLength,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  inputMode?: "numeric" | "text";
  maxLength?: number;
}) {
  return (
    <div className="mt-2 flex items-center rounded-[10px] border border-white/15 bg-navy-field-alt/80 transition-colors duration-150 focus-within:border-navy-accent">
      <span className="pl-4 text-ink-muted">{icon}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className="h-12 w-full bg-transparent px-3 font-sans text-[14px] text-ink placeholder:text-ink-muted/70 focus:outline-none"
      />
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="mt-4 rounded-[8px] border border-destructive/40 bg-destructive/15 px-3 py-2 text-left font-sans text-[12.5px] text-destructive">
      {message}
    </p>
  );
}

function HelpFooter() {
  const { t } = useI18n();
  return (
    <p className="mt-6 font-sans text-[12.5px] text-ink-muted">
      {t("cond.help")}{" "}
      <a href="mailto:admin@publictransit.in" className="text-navy-icon hover:brightness-125">
        {t("cond.helpLink")}
      </a>
    </p>
  );
}

function LoginPanel({
  phone,
  conductorId,
  setPhone,
  setConductorId,
  onSent,
}: {
  phone: string;
  conductorId: string;
  setPhone: (v: string) => void;
  setConductorId: (v: string) => void;
  onSent: (otp: string | null) => void;
}) {
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!conductorId.trim()) {
      setError(t("cond.errId"));
      return;
    }
    if (!PHONE_RE.test(phone)) {
      setError(t("cond.errPhone"));
      return;
    }
    setError(null);
    setBusy(true);
    window.localStorage.setItem(CONDUCTOR_ID_KEY, conductorId.trim());
    try {
      const res = await sendOtp(phone);
      onSent(res.otp_code ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel>
      <BusBadge />
      <h1 className="mt-4 font-display text-[28px] font-semibold text-ink">{t("cond.title")}</h1>
      <p className="mt-1 font-sans text-[14px] text-ink-muted">{t("cond.sub")}</p>

      <div className="mt-7 space-y-5">
        <div>
          <FieldLabel>{t("cond.idLabel")}</FieldLabel>
          <Field
            icon={<UserRound className="size-4" strokeWidth={1.75} />}
            value={conductorId}
            onChange={setConductorId}
            placeholder={t("cond.idPlaceholder")}
            maxLength={12}
          />
        </div>
        <div>
          <FieldLabel>{t("cond.phoneLabel")}</FieldLabel>
          <Field
            icon={<Phone className="size-4" strokeWidth={1.75} />}
            value={phone}
            onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
            placeholder={t("cond.phonePlaceholder")}
            inputMode="numeric"
            maxLength={10}
          />
        </div>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 font-sans text-[12px] text-ink-muted">
        <Info className="size-3.5" strokeWidth={1.75} />
        {t("cond.otpNote")}
      </p>

      {error ? <ErrorBanner message={error} /> : null}

      <SweepButton disabled={busy} onClick={send} label={busy ? "Sending" : t("cond.sendOtp")} />
      <HelpFooter />
    </Panel>
  );
}

function SweepButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative mx-auto mt-6 block h-12 w-[240px] overflow-hidden rounded-[10px] border border-navy-accent/70 font-sans text-[15px] font-semibold text-ink transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50"
    >
      <span
        aria-hidden
        className="absolute inset-0 origin-left scale-x-0 bg-navy-accent transition-transform duration-[250ms] ease-out group-hover:scale-x-100 group-active:scale-x-100"
      />
      <span className="relative">{label}</span>
    </button>
  );
}

function OtpPanel({
  phone,
  initialOtp,
  onBack,
  onVerified,
}: {
  phone: string;
  initialOtp: string | null;
  onBack: () => void;
  onVerified: (name: string) => void;
}) {
  const { t } = useI18n();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [validFor, setValidFor] = useState(OTP_SECONDS);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [mockOtp, setMockOtp] = useState<string | null>(initialOtp);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setValidFor((v) => (v > 0 ? v - 1 : 0));
      setResendIn((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  function setAt(i: number, value: string) {
    const digits = value.replace(/\D/g, "");
    setOtp((prev) => {
      const next = [...prev];
      if (!digits) next[i] = "";
      else digits.split("").forEach((d, k) => i + k < 6 && (next[i + k] = d));
      return next;
    });
    if (digits) refs.current[Math.min(i + digits.length, 5)]?.focus();
  }

  async function verify() {
    const code = otp.join("");
    if (code.length < 6) {
      setError(t("cond.errOtpShort"));
      return;
    }
    if (validFor === 0) {
      setError(t("cond.errExpired"));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await verifyOtp(phone, code);
      if (res.user.role !== "conductor") {
        setError("This phone number is not registered as a conductor. Contact your admin.");
        return;
      }
      const displayName = res.user.name ?? `Conductor (${phone})`;
      window.localStorage.setItem(CONDUCTOR_SESSION_KEY, res.token);
      window.localStorage.setItem("pt.conductorName", displayName);
      onVerified(displayName);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Incorrect OTP.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    try {
      const res = await sendOtp(phone);
      if (res.otp_code) setMockOtp(res.otp_code);
      setResendIn(RESEND_SECONDS);
      setValidFor(OTP_SECONDS);
      setOtp(Array(6).fill(""));
    } catch {
      // ignore
    }
  }

  return (
    <Panel>
      <BusBadge />
      <h1 className="mt-4 font-display text-[28px] font-semibold text-ink">{t("cond.otpTitle")}</h1>
      <p className="mt-1 font-sans text-[14px] text-ink-muted">
        {t("cond.otpSub")}{" "}
        <button type="button" onClick={onBack} className="text-navy-icon hover:brightness-125">
          +91 {phone}
        </button>
      </p>

      {mockOtp && (
        <p className="mt-3 rounded-[8px] border border-yellow-400/40 bg-yellow-400/10 px-3 py-2 font-sans text-[12.5px] text-yellow-300">
          Demo OTP: <span className="font-bold tracking-widest">{mockOtp}</span>
        </p>
      )}

      <div className="mt-7">
        <FieldLabel>{t("cond.otpLabel")}</FieldLabel>
        <div className="mt-2 flex justify-center gap-2.5">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
                if (e.key === "Enter") verify();
              }}
              className="size-12 rounded-[10px] border border-white/15 bg-navy-field-alt/80 text-center font-sans text-[18px] text-ink transition-colors duration-150 focus:border-navy-accent focus:outline-none"
            />
          ))}
        </div>
      </div>

      <p className="mt-3 font-sans text-[12px] text-ink-muted">
        {t("cond.validFor", { s: fmt(validFor) })}
      </p>

      {error ? <ErrorBanner message={error} /> : null}

      <div className="mt-5 h-px bg-divider" />

      <p className="mt-4 font-sans text-[13px] text-ink-muted">
        {t("cond.noOtp")}{" "}
        {resendIn > 0 ? (
          <span className="text-ink-muted">{t("cond.resendIn", { s: fmt(resendIn) })}</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-navy-icon transition-[filter] duration-150 hover:brightness-125"
          >
            {t("cond.resend")}
          </button>
        )}
      </p>

      <GlowBorderButton
        tone="navy"
        className="mt-5 w-full"
        disabled={busy}
        onClick={verify}
        innerClassName="hover:scale-[1.0]"
      >
        {busy ? <Loader2 className="mx-auto size-4 animate-spin" /> : t("cond.verify")}
      </GlowBorderButton>

      <HelpFooter />
    </Panel>
  );
}

function fmt(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type ScanState = "idle" | "valid" | "already_used" | "expired" | "invalid";

interface ScanRecord {
  id: string;
  ticket_id: string;
  fare_charged: number;
  scan_result: string;
  when: string;
}

type ScanMode = "idle" | "camera" | "manual";

function Dashboard({ name, onLogout }: { name: string; onLogout: () => void }) {
  const { t } = useI18n();
  const [scanResult, setScanResult] = useState<ScanTicketResponse | null>(null);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);
  const [mode, setMode] = useState<ScanMode>("idle");
  const [ticketInput, setTicketInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanKey, setScanKey] = useState(0);

  async function handleScan(rawValue?: string) {
    const value = (rawValue ?? ticketInput).trim();
    if (!value) return;
    setScanError(null);
    setScanning(true);
    try {
      const token = window.localStorage.getItem(CONDUCTOR_SESSION_KEY) ?? "";
      window.localStorage.setItem("pt.session", token);
      const res = await scanTicket(value);
      setScanResult(res);
      setRecentScans((prev) => [
        {
          id: crypto.randomUUID(),
          ticket_id: (res.ticket_id ?? value).slice(0, 8).toUpperCase(),
          fare_charged: res.fare_charged,
          scan_result: res.scan_result,
          when: "Just now",
        },
        ...prev.slice(0, 9),
      ]);
      setTicketInput("");
      setMode("idle");
    } catch (err: unknown) {
      setScanError(err instanceof Error ? err.message : "Scan failed.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="relative z-10 flex min-h-[100svh] flex-col">
      <header className="flex items-center justify-between bg-navy-field-alt px-6 py-4">
        <img src="/logo.png" alt="TransitFlow Logo" className="h-10 w-auto object-contain" />
        <span className="font-display text-[19px] text-ink">{t("cond.greeting", { s: name })}</span>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 font-sans text-[14px] text-navy-icon transition-[filter] duration-150 hover:brightness-125"
          >
            <LogOut className="size-4" strokeWidth={1.75} />
            {t("cond.logout")}
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-[620px]">
          {scanResult ? (
            <ScanResultCard result={scanResult} onDismiss={() => setScanResult(null)} />
          ) : mode === "camera" ? (
            <CameraScanPanel
              scanKey={scanKey}
              scanning={scanning}
              error={scanError}
              onDecoded={(text) => handleScan(text)}
              onCameraError={(msg) => setScanError(msg)}
              onRetry={() => {
                setScanError(null);
                setScanKey((k) => k + 1);
              }}
              onManualEntry={() => {
                setMode("manual");
                setScanError(null);
              }}
              onCancel={() => {
                setMode("idle");
                setScanError(null);
              }}
            />
          ) : mode === "manual" ? (
            <div
              className="anim-fade rounded-[24px] p-8 text-center"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--color-navy-accent) 0%, var(--color-navy-bright) 100%)",
              }}
            >
              <QrCode className="mx-auto size-[60px] text-white" strokeWidth={1.25} />
              <p className="mt-4 font-sans text-[16px] text-white">Enter Ticket ID / QR Payload</p>
              <input
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                placeholder="Paste ticket UUID here"
                className="mt-4 w-full rounded-[10px] border border-white/20 bg-white/10 px-4 py-3 font-sans text-[14px] text-white placeholder:text-white/50 focus:outline-none"
              />
              {scanError && <p className="mt-3 font-sans text-[12px] text-red-300">{scanError}</p>}
              <div className="mt-4 flex gap-3">
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1"
                  onClick={() => {
                    setMode("idle");
                    setScanError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="blue"
                  size="md"
                  className="flex-1"
                  disabled={scanning}
                  onClick={() => handleScan()}
                >
                  {scanning ? (
                    <Loader2 className="mx-auto size-4 animate-spin" />
                  ) : (
                    "Validate Ticket"
                  )}
                </Button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode("camera");
                  setScanError(null);
                  setScanKey((k) => k + 1);
                }}
                className="mt-4 font-sans text-[12.5px] text-white/70 underline underline-offset-2 hover:text-white"
              >
                Use camera instead
              </button>
            </div>
          ) : (
            <ScanCard
              onScan={() => {
                setMode("camera");
                setScanError(null);
                setScanKey((k) => k + 1);
              }}
            />
          )}
        </div>
      </div>

      <RecentScans scans={recentScans} />
    </div>
  );
}

function CameraScanPanel({
  scanKey,
  scanning,
  error,
  onDecoded,
  onCameraError,
  onRetry,
  onManualEntry,
  onCancel,
}: {
  scanKey: number;
  scanning: boolean;
  error: string | null;
  onDecoded: (text: string) => void;
  onCameraError: (message: string) => void;
  onRetry: () => void;
  onManualEntry: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="anim-fade rounded-[24px] p-8 text-center"
      style={{
        backgroundImage:
          "linear-gradient(135deg, var(--color-navy-accent) 0%, var(--color-navy-bright) 100%)",
      }}
    >
      <p className="font-sans text-[16px] text-white">Point the camera at the passenger's QR</p>

      <QrFrame tone="green" className="mx-auto mt-4 max-w-[300px]">
        {error ? (
          <div className="flex aspect-square w-full items-center justify-center rounded-[12px] bg-black/40 px-4 text-center font-sans text-[13px] text-red-200">
            {error}
          </div>
        ) : (
          <QrScanner key={scanKey} onScan={onDecoded} onError={onCameraError} />
        )}
      </QrFrame>

      {scanning && !error && (
        <p className="mt-3 flex items-center justify-center gap-2 font-sans text-[13px] text-white/80">
          <Loader2 className="size-4 animate-spin" /> Validating
        </p>
      )}

      <div className="mt-5 flex gap-3">
        <Button variant="outline" size="md" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        {error ? (
          <Button variant="blue" size="md" className="flex-1" onClick={onRetry}>
            Try Again
          </Button>
        ) : (
          <Button variant="outline" size="md" className="flex-1" onClick={onManualEntry}>
            Enter Manually
          </Button>
        )}
      </div>
    </div>
  );
}

function ScanCard({ onScan }: { onScan: () => void }) {
  const { t } = useI18n();
  const [pos, setPos] = useState({ x: 50, y: 50 });

  return (
    <button
      type="button"
      onClick={onScan}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({
          x: ((e.clientX - r.left) / r.width) * 100,
          y: ((e.clientY - r.top) / r.height) * 100,
        });
      }}
      className="anim-fade group relative block w-full overflow-hidden rounded-[24px] px-8 py-14 text-center shadow-[0_20px_60px_rgba(22,96,222,0.35)] transition-transform duration-150 ease-[var(--ease-micro)] hover:scale-[1.02]"
      style={{
        backgroundImage:
          "linear-gradient(135deg, var(--color-navy-accent) 0%, var(--color-navy-bright) 100%)",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.28), transparent 55%)`,
        }}
      />
      <QrCode className="relative mx-auto size-[90px] text-white" strokeWidth={1.25} />
      <span className="relative mt-5 block font-sans text-[26px] font-bold text-white">
        {t("cond.scanTitle")}
      </span>
      <span className="relative mt-1 block font-sans text-[14px] text-white/80">
        {t("cond.scanSub")}
      </span>
    </button>
  );
}

function ScanResultCard({
  result,
  onDismiss,
}: {
  result: ScanTicketResponse;
  onDismiss: () => void;
}) {
  const { t } = useI18n();
  const state = result.scan_result as ScanState;

  const look = {
    valid: { icon: CheckCircle2, ring: "bg-green-500", heading: t("cond.rValid") },
    already_used: { icon: Copy, ring: "bg-[#e8a33d]", heading: t("cond.rUsed") },
    expired: { icon: AlertTriangle, ring: "bg-destructive", heading: t("cond.rExpired") },
    invalid: { icon: XCircle, ring: "bg-destructive", heading: t("cond.rInvalid") },
  }[state] ?? { icon: XCircle, ring: "bg-destructive", heading: "Unknown" };

  const Icon = look.icon;

  return (
    <div
      className="anim-fade relative overflow-hidden rounded-[24px] px-8 py-12 text-center shadow-[0_20px_60px_rgba(22,96,222,0.35)]"
      style={{
        backgroundImage: "linear-gradient(160deg, var(--color-navy-accent) 0%, #0b2f78 100%)",
      }}
    >
      <div
        className={cn(
          "mx-auto flex size-[90px] items-center justify-center rounded-full",
          look.ring,
        )}
      >
        <Icon className="size-11 text-white" strokeWidth={2} />
      </div>

      <h2 className="mt-6 font-display text-[32px] text-white">{look.heading}</h2>
      <p className="mt-2 font-sans text-[14px] text-white/70">{result.reason}</p>

      {(state === "valid" || state === "already_used") && (
        <div className="mt-5 inline-block rounded-full border border-white/50 px-4 py-1.5 font-sans text-[13px] text-white">
          {result.fare_charged === 0
            ? " Pink Card  Free Travel"
            : result.fare_charged
              ? `${result.fare_charged} Paid`
              : "Ticket Already Used"}
        </div>
      )}

      <div className="mt-4 rounded-[10px] border border-white/15 bg-white/10 px-5 py-3 text-left">
        <div className="flex items-center justify-between py-1">
          <span className="font-sans text-[12px] text-white/60">Ticket</span>
          <span className="font-sans text-[13px] text-white">
            {(result.ticket_id ?? "").slice(0, 8).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="font-sans text-[12px] text-white/60">Result</span>
          <span className="font-sans text-[13px] text-white">
            {result.scan_result.replace("_", " ").toUpperCase()}
          </span>
        </div>
      </div>

      <Button variant="outline" size="md" className="mt-8" onClick={onDismiss}>
        {t("cond.scanNext")}
      </Button>
    </div>
  );
}

function RecentScans({ scans }: { scans: ScanRecord[] }) {
  const { t } = useI18n();
  if (scans.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1180px] rounded-t-[20px] border border-navy-line bg-navy-panel/95 px-7 pb-8 pt-6">
      <h2 className="flex items-center gap-2 font-sans text-[14px] text-ink">
        <Clock className="size-4 text-navy-icon" strokeWidth={1.75} />
        {t("cond.recent")}
      </h2>

      <div className="mt-5 grid grid-cols-[1fr_auto_120px] gap-4 border-b border-divider pb-2 font-sans text-[12px] uppercase tracking-wide text-ink-muted">
        <span>Ticket</span>
        <span>Result</span>
        <span className="text-right">When</span>
      </div>

      {scans.map((s, i) => (
        <div
          key={s.id}
          style={{ animationDelay: `${i * 90}ms` }}
          className="anim-slide-left row-interactive grid grid-cols-[1fr_auto_120px] items-center gap-4 border-b border-white/[0.08] py-4"
        >
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full border",
                s.scan_result === "valid" ? "border-green-500/70" : "border-destructive/70",
              )}
            >
              <Armchair
                className={cn(
                  "size-4",
                  s.scan_result === "valid" ? "text-green-400" : "text-destructive",
                )}
                strokeWidth={1.75}
              />
            </span>
            <span className="font-sans text-[14px] text-ink">{s.ticket_id}</span>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 font-sans text-[11.5px]",
              s.scan_result === "valid"
                ? "bg-green-500/20 text-green-300"
                : "border border-destructive/50 text-destructive",
            )}
          >
            {s.fare_charged === 0 ? "Free" : `${s.fare_charged}`}
          </span>
          <span className="text-right font-sans text-[13px] text-ink-muted">{s.when}</span>
        </div>
      ))}
    </section>
  );
}




// import { createFileRoute } from "@tanstack/react-router";
// import { useEffect, useRef, useState } from "react";
// import {
//   AlertTriangle,
//   Armchair,
//   Bus,
//   CheckCircle2,
//   Clock,
//   Copy,
//   Info,
//   Loader2,
//   LogOut,
//   Phone,
//   QrCode,
//   UserRound,
//   XCircle,
// } from "lucide-react";
// import navyBg from "@/assets/night-street-navy.jpg";
// import { Button } from "@/components/Button";
// import { GlowBorderButton } from "@/components/GlowBorderButton";
// import { LanguageToggle } from "@/components/LanguageToggle";
// import { useI18n } from "@/i18n/LanguageProvider";
// import { cn } from "@/lib/utils";
// import { sendOtp, verifyOtp, scanTicket, type ScanTicketResponse } from "@/lib/api";

// export const Route = createFileRoute("/conductor")({
//   head: () => ({
//     meta: [
//       { title: "Conductor Login  Scan & Verify Tickets | Public Transit" },
//       {
//         name: "description",
//         content:
//           "Conductor sign-in for Public Transit: verify your ID and phone, then scan passenger QR tickets and review recent boardings.",
//       },
//       { property: "og:title", content: "Conductor Login  Scan & Verify Tickets | Public Transit" },
//       {
//         property: "og:description",
//         content: "Sign in as a conductor to scan passenger QR tickets and confirm boardings.",
//       },
//     ],
//   }),
//   component: ConductorFlow,
// });



// const PHONE_RE = /^[6-9]\d{9}$/;
// const OTP_SECONDS = 120;
// const RESEND_SECONDS = 45;
// const CONDUCTOR_ID_KEY = "pt.conductorId";
// const CONDUCTOR_SESSION_KEY = "pt.conductorSession";

// type Screen = "login" | "otp" | "dashboard";

// function ConductorFlow() {
//   const [screen, setScreen] = useState<Screen>("login");
//   const [phone, setPhone] = useState("");
//   const [conductorId, setConductorId] = useState("");
//   const [name, setName] = useState("");
//   const [initialOtp, setInitialOtp] = useState<string | null>(null);

//   useEffect(() => {
//     const saved = window.localStorage.getItem(CONDUCTOR_SESSION_KEY);
//     const savedName = window.localStorage.getItem("pt.conductorName");
//     if (saved && savedName) {
//       setName(savedName);
//       setScreen("dashboard");
//     }
//   }, []);

//   return (
//     <div className="relative min-h-[100svh] overflow-hidden bg-canvas">
//       <img
//         src={navyBg}
//         alt=""
//         width={1920}
//         height={1088}
//         className="absolute inset-0 size-full object-cover opacity-45 saturate-50"
//       />
//       <div className="absolute inset-0 bg-black/55" />
      

//       {screen === "dashboard" ? (
//         <Dashboard
//           name={name}
//           onLogout={() => {
//             window.localStorage.removeItem(CONDUCTOR_SESSION_KEY);
//             window.localStorage.removeItem("pt.conductorName");
//             setScreen("login");
//             setPhone("");
//             setConductorId("");
//           }}
//         />
//       ) : (
//         <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-6 py-16">
//           <div className="absolute right-6 top-6">
//             <LanguageToggle />
//           </div>
//           {screen === "login" ? (
//             <LoginPanel
//               phone={phone}
//               conductorId={conductorId}
//               setPhone={setPhone}
//               setConductorId={setConductorId}
//               onSent={(otp) => {
//                 setInitialOtp(otp);
//                 setScreen("otp");
//               }}
//             />
//           ) : (
//             <OtpPanel
//               phone={phone}
//               initialOtp={initialOtp}
//               onBack={() => setScreen("login")}
//               onVerified={(who) => {
//                 setName(who);
//                 setScreen("dashboard");
//               }}
//             />
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// function Panel({ children }: { children: React.ReactNode }) {
//   return (
//     <div
//       className="anim-scale-in relative w-full max-w-[480px] rounded-[20px] border border-white/10 p-9 text-center shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-[20px]"
//       style={{ backgroundColor: "rgba(10,18,42,0.7)" }}
//     >
//       {children}
//     </div>
//   );
// }

// function BusBadge() {
//   return (
//     <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-navy-accent/40">
//       <Bus className="size-7 text-navy-icon" strokeWidth={1.5} />
//     </div>
//   );
// }

// function FieldLabel({ children }: { children: React.ReactNode }) {
//   return <label className="block text-left font-sans text-[13px] text-ink-muted">{children}</label>;
// }

// function Field({
//   icon,
//   value,
//   onChange,
//   placeholder,
//   inputMode,
//   maxLength,
// }: {
//   icon: React.ReactNode;
//   value: string;
//   onChange: (v: string) => void;
//   placeholder: string;
//   inputMode?: "numeric" | "text";
//   maxLength?: number;
// }) {
//   return (
//     <div className="mt-2 flex items-center rounded-[10px] border border-white/15 bg-navy-field-alt/80 transition-colors duration-150 focus-within:border-navy-accent">
//       <span className="pl-4 text-ink-muted">{icon}</span>
//       <input
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         inputMode={inputMode}
//         maxLength={maxLength}
//         className="h-12 w-full bg-transparent px-3 font-sans text-[14px] text-ink placeholder:text-ink-muted/70 focus:outline-none"
//       />
//     </div>
//   );
// }

// function ErrorBanner({ message }: { message: string }) {
//   return (
//     <p className="mt-4 rounded-[8px] border border-destructive/40 bg-destructive/15 px-3 py-2 text-left font-sans text-[12.5px] text-destructive">
//       {message}
//     </p>
//   );
// }

// function HelpFooter() {
//   const { t } = useI18n();
//   return (
//     <p className="mt-6 font-sans text-[12.5px] text-ink-muted">
//       {t("cond.help")}{" "}
//       <a href="mailto:admin@publictransit.in" className="text-navy-icon hover:brightness-125">
//         {t("cond.helpLink")}
//       </a>
//     </p>
//   );
// }

// function LoginPanel({
//   phone,
//   conductorId,
//   setPhone,
//   setConductorId,
//   onSent,
// }: {
//   phone: string;
//   conductorId: string;
//   setPhone: (v: string) => void;
//   setConductorId: (v: string) => void;
//   onSent: (otp: string | null) => void;
// }) {
//   const { t } = useI18n();
//   const [error, setError] = useState<string | null>(null);
//   const [busy, setBusy] = useState(false);

//   async function send() {
//     if (!conductorId.trim()) {
//       setError(t("cond.errId"));
//       return;
//     }
//     if (!PHONE_RE.test(phone)) {
//       setError(t("cond.errPhone"));
//       return;
//     }
//     setError(null);
//     setBusy(true);
//     window.localStorage.setItem(CONDUCTOR_ID_KEY, conductorId.trim());
//     try {
//       const res = await sendOtp(phone);
//       onSent(res.otp_code ?? null);
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : "Failed to send OTP.");
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <Panel>
//       <BusBadge />
//       <h1 className="mt-4 font-display text-[28px] font-semibold text-ink">{t("cond.title")}</h1>
//       <p className="mt-1 font-sans text-[14px] text-ink-muted">{t("cond.sub")}</p>

//       <div className="mt-7 space-y-5">
//         <div>
//           <FieldLabel>{t("cond.idLabel")}</FieldLabel>
//           <Field
//             icon={<UserRound className="size-4" strokeWidth={1.75} />}
//             value={conductorId}
//             onChange={setConductorId}
//             placeholder={t("cond.idPlaceholder")}
//             maxLength={12}
//           />
//         </div>
//         <div>
//           <FieldLabel>{t("cond.phoneLabel")}</FieldLabel>
//           <Field
//             icon={<Phone className="size-4" strokeWidth={1.75} />}
//             value={phone}
//             onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
//             placeholder={t("cond.phonePlaceholder")}
//             inputMode="numeric"
//             maxLength={10}
//           />
//         </div>
//       </div>

//       <p className="mt-4 flex items-center justify-center gap-1.5 font-sans text-[12px] text-ink-muted">
//         <Info className="size-3.5" strokeWidth={1.75} />
//         {t("cond.otpNote")}
//       </p>

//       {error ? <ErrorBanner message={error} /> : null}

//       <SweepButton disabled={busy} onClick={send} label={busy ? "Sending" : t("cond.sendOtp")} />
//       <HelpFooter />
//     </Panel>
//   );
// }

// function SweepButton({
//   label,
//   onClick,
//   disabled,
// }: {
//   label: string;
//   onClick: () => void;
//   disabled?: boolean;
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       disabled={disabled}
//       className="group relative mx-auto mt-6 block h-12 w-[240px] overflow-hidden rounded-[10px] border border-navy-accent/70 font-sans text-[15px] font-semibold text-ink transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50"
//     >
//       <span
//         aria-hidden
//         className="absolute inset-0 origin-left scale-x-0 bg-navy-accent transition-transform duration-[250ms] ease-out group-hover:scale-x-100 group-active:scale-x-100"
//       />
//       <span className="relative">{label}</span>
//     </button>
//   );
// }

// function OtpPanel({
//   phone,
//   initialOtp,
//   onBack,
//   onVerified,
// }: {
//   phone: string;
//   initialOtp: string | null;
//   onBack: () => void;
//   onVerified: (name: string) => void;
// }) {
//   const { t } = useI18n();
//   const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
//   const [error, setError] = useState<string | null>(null);
//   const [busy, setBusy] = useState(false);
//   const [validFor, setValidFor] = useState(OTP_SECONDS);
//   const [resendIn, setResendIn] = useState(RESEND_SECONDS);
//   const [mockOtp, setMockOtp] = useState<string | null>(initialOtp);
//   const refs = useRef<Array<HTMLInputElement | null>>([]);

//   useEffect(() => {
//     const id = window.setInterval(() => {
//       setValidFor((v) => (v > 0 ? v - 1 : 0));
//       setResendIn((v) => (v > 0 ? v - 1 : 0));
//     }, 1000);
//     return () => window.clearInterval(id);
//   }, []);

//   function setAt(i: number, value: string) {
//     const digits = value.replace(/\D/g, "");
//     setOtp((prev) => {
//       const next = [...prev];
//       if (!digits) next[i] = "";
//       else digits.split("").forEach((d, k) => i + k < 6 && (next[i + k] = d));
//       return next;
//     });
//     if (digits) refs.current[Math.min(i + digits.length, 5)]?.focus();
//   }

//   async function verify() {
//     const code = otp.join("");
//     if (code.length < 6) {
//       setError(t("cond.errOtpShort"));
//       return;
//     }
//     if (validFor === 0) {
//       setError(t("cond.errExpired"));
//       return;
//     }
//     setError(null);
//     setBusy(true);
//     try {
//       const res = await verifyOtp(phone, code);
//       if (res.user.role !== "conductor") {
//         setError("This phone number is not registered as a conductor. Contact your admin.");
//         return;
//       }
//       const displayName = res.user.name ?? `Conductor (${phone})`;
//       window.localStorage.setItem(CONDUCTOR_SESSION_KEY, res.token);
//       window.localStorage.setItem("pt.conductorName", displayName);
//       onVerified(displayName);
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : "Incorrect OTP.");
//     } finally {
//       setBusy(false);
//     }
//   }

//   async function handleResend() {
//     try {
//       const res = await sendOtp(phone);
//       if (res.otp_code) setMockOtp(res.otp_code);
//       setResendIn(RESEND_SECONDS);
//       setValidFor(OTP_SECONDS);
//       setOtp(Array(6).fill(""));
//     } catch {
//       // ignore
//     }
//   }

//   return (
//     <Panel>
//       <BusBadge />
//       <h1 className="mt-4 font-display text-[28px] font-semibold text-ink">{t("cond.otpTitle")}</h1>
//       <p className="mt-1 font-sans text-[14px] text-ink-muted">
//         {t("cond.otpSub")}{" "}
//         <button type="button" onClick={onBack} className="text-navy-icon hover:brightness-125">
//           +91 {phone}
//         </button>
//       </p>

//       {mockOtp && (
//         <p className="mt-3 rounded-[8px] border border-yellow-400/40 bg-yellow-400/10 px-3 py-2 font-sans text-[12.5px] text-yellow-300">
//           Demo OTP: <span className="font-bold tracking-widest">{mockOtp}</span>
//         </p>
//       )}

//       <div className="mt-7">
//         <FieldLabel>{t("cond.otpLabel")}</FieldLabel>
//         <div className="mt-2 flex justify-center gap-2.5">
//           {otp.map((digit, i) => (
//             <input
//               key={i}
//               ref={(el) => {
//                 refs.current[i] = el;
//               }}
//               inputMode="numeric"
//               maxLength={6}
//               value={digit}
//               onChange={(e) => setAt(i, e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
//                 if (e.key === "Enter") verify();
//               }}
//               className="size-12 rounded-[10px] border border-white/15 bg-navy-field-alt/80 text-center font-sans text-[18px] text-ink transition-colors duration-150 focus:border-navy-accent focus:outline-none"
//             />
//           ))}
//         </div>
//       </div>

//       <p className="mt-3 font-sans text-[12px] text-ink-muted">
//         {t("cond.validFor", { s: fmt(validFor) })}
//       </p>

//       {error ? <ErrorBanner message={error} /> : null}

//       <div className="mt-5 h-px bg-divider" />

//       <p className="mt-4 font-sans text-[13px] text-ink-muted">
//         {t("cond.noOtp")}{" "}
//         {resendIn > 0 ? (
//           <span className="text-ink-muted">{t("cond.resendIn", { s: fmt(resendIn) })}</span>
//         ) : (
//           <button
//             type="button"
//             onClick={handleResend}
//             className="text-navy-icon transition-[filter] duration-150 hover:brightness-125"
//           >
//             {t("cond.resend")}
//           </button>
//         )}
//       </p>

//       <GlowBorderButton
//         tone="navy"
//         className="mt-5 w-full"
//         disabled={busy}
//         onClick={verify}
//         innerClassName="hover:scale-[1.0]"
//       >
//         {busy ? <Loader2 className="mx-auto size-4 animate-spin" /> : t("cond.verify")}
//       </GlowBorderButton>

//       <HelpFooter />
//     </Panel>
//   );
// }

// function fmt(total: number) {
//   const m = Math.floor(total / 60);
//   const s = total % 60;
//   return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
// }

// type ScanState = "idle" | "valid" | "already_used" | "expired" | "invalid";

// interface ScanRecord {
//   id: string;
//   ticket_id: string;
//   fare_charged: number;
//   scan_result: string;
//   when: string;
// }

// function Dashboard({ name, onLogout }: { name: string; onLogout: () => void }) {
//   const { t } = useI18n();
//   const [scanResult, setScanResult] = useState<ScanTicketResponse | null>(null);
//   const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
//   const [scanError, setScanError] = useState<string | null>(null);
//   const [showInput, setShowInput] = useState(false);
//   const [ticketInput, setTicketInput] = useState("");
//   const [scanning, setScanning] = useState(false);

//   async function handleScan() {
//     if (!ticketInput.trim()) return;
//     setScanError(null);
//     setScanning(true);
//     try {
//       const token = window.localStorage.getItem(CONDUCTOR_SESSION_KEY) ?? "";
//       window.localStorage.setItem("pt.session", token);
//       const res = await scanTicket(ticketInput.trim());
//       setScanResult(res);
//       setRecentScans((prev) => [
//         {
//           id: crypto.randomUUID(),
//           ticket_id: (res.ticket_id ?? ticketInput.trim()).slice(0, 8).toUpperCase(),
//           fare_charged: res.fare_charged,
//           scan_result: res.scan_result,
//           when: "Just now",
//         },
//         ...prev.slice(0, 9),
//       ]);
//       setTicketInput("");
//       setShowInput(false);
//     } catch (err: unknown) {
//       setScanError(err instanceof Error ? err.message : "Scan failed.");
//     } finally {
//       setScanning(false);
//     }
//   }

//   return (
//     <div className="relative z-10 flex min-h-[100svh] flex-col">
//       <header className="flex items-center justify-between bg-navy-field-alt px-6 py-4">
//         <img src="/logo.png" alt="TransitFlow Logo" className="h-10 w-auto object-contain" />
//         <span className="font-display text-[19px] text-ink">{t("cond.greeting", { s: name })}</span>
//         <div className="flex items-center gap-4">
//           <LanguageToggle />
//           <button
//             type="button"
//             onClick={onLogout}
//             className="flex items-center gap-2 font-sans text-[14px] text-navy-icon transition-[filter] duration-150 hover:brightness-125"
//           >
//             <LogOut className="size-4" strokeWidth={1.75} />
//             {t("cond.logout")}
//           </button>
//         </div>
//       </header>

//       <div className="flex flex-1 items-center justify-center px-6 py-10">
//         <div className="w-full max-w-[620px]">
//           {scanResult ? (
//             <ScanResultCard result={scanResult} onDismiss={() => setScanResult(null)} />
//           ) : showInput ? (
//             <div
//               className="anim-fade rounded-[24px] p-8 text-center"
//               style={{
//                 backgroundImage:
//                   "linear-gradient(135deg, var(--color-navy-accent) 0%, var(--color-navy-bright) 100%)",
//               }}
//             >
//               <QrCode className="mx-auto size-[60px] text-white" strokeWidth={1.25} />
//               <p className="mt-4 font-sans text-[16px] text-white">Enter Ticket ID / QR Payload</p>
//               <input
//                 value={ticketInput}
//                 onChange={(e) => setTicketInput(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && handleScan()}
//                 placeholder="Paste ticket UUID here"
//                 className="mt-4 w-full rounded-[10px] border border-white/20 bg-white/10 px-4 py-3 font-sans text-[14px] text-white placeholder:text-white/50 focus:outline-none"
//               />
//               {scanError && <p className="mt-3 font-sans text-[12px] text-red-300">{scanError}</p>}
//               <div className="mt-4 flex gap-3">
//                 <Button
//                   variant="outline"
//                   size="md"
//                   className="flex-1"
//                   onClick={() => {
//                     setShowInput(false);
//                     setScanError(null);
//                   }}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   variant="blue"
//                   size="md"
//                   className="flex-1"
//                   disabled={scanning}
//                   onClick={handleScan}
//                 >
//                   {scanning ? (
//                     <Loader2 className="mx-auto size-4 animate-spin" />
//                   ) : (
//                     "Validate Ticket"
//                   )}
//                 </Button>
//               </div>
//             </div>
//           ) : (
//             <ScanCard onScan={() => setShowInput(true)} />
//           )}
//         </div>
//       </div>

//       <RecentScans scans={recentScans} />
//     </div>
//   );
// }

// function ScanCard({ onScan }: { onScan: () => void }) {
//   const { t } = useI18n();
//   const [pos, setPos] = useState({ x: 50, y: 50 });

//   return (
//     <button
//       type="button"
//       onClick={onScan}
//       onMouseMove={(e) => {
//         const r = e.currentTarget.getBoundingClientRect();
//         setPos({
//           x: ((e.clientX - r.left) / r.width) * 100,
//           y: ((e.clientY - r.top) / r.height) * 100,
//         });
//       }}
//       className="anim-fade group relative block w-full overflow-hidden rounded-[24px] px-8 py-14 text-center shadow-[0_20px_60px_rgba(22,96,222,0.35)] transition-transform duration-150 ease-[var(--ease-micro)] hover:scale-[1.02]"
//       style={{
//         backgroundImage:
//           "linear-gradient(135deg, var(--color-navy-accent) 0%, var(--color-navy-bright) 100%)",
//       }}
//     >
//       <span
//         aria-hidden
//         className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
//         style={{
//           background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.28), transparent 55%)`,
//         }}
//       />
//       <QrCode className="relative mx-auto size-[90px] text-white" strokeWidth={1.25} />
//       <span className="relative mt-5 block font-sans text-[26px] font-bold text-white">
//         {t("cond.scanTitle")}
//       </span>
//       <span className="relative mt-1 block font-sans text-[14px] text-white/80">
//         {t("cond.scanSub")}
//       </span>
//     </button>
//   );
// }

// function ScanResultCard({
//   result,
//   onDismiss,
// }: {
//   result: ScanTicketResponse;
//   onDismiss: () => void;
// }) {
//   const { t } = useI18n();
//   const state = result.scan_result as ScanState;

//   const look = {
//     valid: { icon: CheckCircle2, ring: "bg-green-500", heading: t("cond.rValid") },
//     already_used: { icon: Copy, ring: "bg-[#e8a33d]", heading: t("cond.rUsed") },
//     expired: { icon: AlertTriangle, ring: "bg-destructive", heading: t("cond.rExpired") },
//     invalid: { icon: XCircle, ring: "bg-destructive", heading: t("cond.rInvalid") },
//   }[state] ?? { icon: XCircle, ring: "bg-destructive", heading: "Unknown" };

//   const Icon = look.icon;

//   return (
//     <div
//       className="anim-fade relative overflow-hidden rounded-[24px] px-8 py-12 text-center shadow-[0_20px_60px_rgba(22,96,222,0.35)]"
//       style={{
//         backgroundImage: "linear-gradient(160deg, var(--color-navy-accent) 0%, #0b2f78 100%)",
//       }}
//     >
//       <div
//         className={cn(
//           "mx-auto flex size-[90px] items-center justify-center rounded-full",
//           look.ring,
//         )}
//       >
//         <Icon className="size-11 text-white" strokeWidth={2} />
//       </div>

//       <h2 className="mt-6 font-display text-[32px] text-white">{look.heading}</h2>
//       <p className="mt-2 font-sans text-[14px] text-white/70">{result.reason}</p>

//       {(state === "valid" || state === "already_used") && (
//         <div className="mt-5 inline-block rounded-full border border-white/50 px-4 py-1.5 font-sans text-[13px] text-white">
//           {result.fare_charged === 0
//             ? " Pink Card  Free Travel"
//             : result.fare_charged
//               ? `${result.fare_charged} Paid`
//               : "Ticket Already Used"}
//         </div>
//       )}

//       <div className="mt-4 rounded-[10px] border border-white/15 bg-white/10 px-5 py-3 text-left">
//         <div className="flex items-center justify-between py-1">
//           <span className="font-sans text-[12px] text-white/60">Ticket</span>
//           <span className="font-sans text-[13px] text-white">
//             {(result.ticket_id ?? "").slice(0, 8).toUpperCase()}
//           </span>
//         </div>
//         <div className="flex items-center justify-between py-1">
//           <span className="font-sans text-[12px] text-white/60">Result</span>
//           <span className="font-sans text-[13px] text-white">
//             {result.scan_result.replace("_", " ").toUpperCase()}
//           </span>
//         </div>
//       </div>

//       <Button variant="outline" size="md" className="mt-8" onClick={onDismiss}>
//         {t("cond.scanNext")}
//       </Button>
//     </div>
//   );
// }

// function RecentScans({ scans }: { scans: ScanRecord[] }) {
//   const { t } = useI18n();
//   if (scans.length === 0) return null;

//   return (
//     <section className="mx-auto w-full max-w-[1180px] rounded-t-[20px] border border-navy-line bg-navy-panel/95 px-7 pb-8 pt-6">
//       <h2 className="flex items-center gap-2 font-sans text-[14px] text-ink">
//         <Clock className="size-4 text-navy-icon" strokeWidth={1.75} />
//         {t("cond.recent")}
//       </h2>

//       <div className="mt-5 grid grid-cols-[1fr_auto_120px] gap-4 border-b border-divider pb-2 font-sans text-[12px] uppercase tracking-wide text-ink-muted">
//         <span>Ticket</span>
//         <span>Result</span>
//         <span className="text-right">When</span>
//       </div>

//       {scans.map((s, i) => (
//         <div
//           key={s.id}
//           style={{ animationDelay: `${i * 90}ms` }}
//           className="anim-slide-left row-interactive grid grid-cols-[1fr_auto_120px] items-center gap-4 border-b border-white/[0.08] py-4"
//         >
//           <div className="flex items-center gap-3">
//             <span
//               className={cn(
//                 "flex size-9 items-center justify-center rounded-full border",
//                 s.scan_result === "valid" ? "border-green-500/70" : "border-destructive/70",
//               )}
//             >
//               <Armchair
//                 className={cn(
//                   "size-4",
//                   s.scan_result === "valid" ? "text-green-400" : "text-destructive",
//                 )}
//                 strokeWidth={1.75}
//               />
//             </span>
//             <span className="font-sans text-[14px] text-ink">{s.ticket_id}</span>
//           </div>
//           <span
//             className={cn(
//               "rounded-full px-3 py-1 font-sans text-[11.5px]",
//               s.scan_result === "valid"
//                 ? "bg-green-500/20 text-green-300"
//                 : "border border-destructive/50 text-destructive",
//             )}
//           >
//             {s.fare_charged === 0 ? "Free" : `${s.fare_charged}`}
//           </span>
//           <span className="text-right font-sans text-[13px] text-ink-muted">{s.when}</span>
//         </div>
//       ))}
//     </section>
//   );
// }
