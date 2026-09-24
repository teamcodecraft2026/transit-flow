import { useEffect, useRef, useState } from "react";
import { Bus } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { useI18n } from "@/i18n/LanguageProvider";
import { Button } from "./Button";
import { sendOtp, verifyOtp } from "@/lib/api";

type Step = "phone" | "otp";

const PHONE_RE = /^[6-9]\d{9}$/;
const RESEND_SECONDS = 30;

export function AuthModal() {
  const { modalOpen, modalMode, setModalMode, closeAuth, completeAuth } = useAuth();
  const { t } = useI18n();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [closing, setClosing] = useState(false);
  // shown only in mock/demo mode when backend returns otp_code
  const [mockOtp, setMockOtp] = useState<string | null>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (modalOpen) {
      setStep("phone");
      setOtp(Array(6).fill(""));
      setError(null);
      setClosing(false);
      setMockOtp(null);
    }
  }, [modalOpen]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);

  if (!modalOpen) return null;

  function handleClose() {
    setClosing(true);
    window.setTimeout(closeAuth, 200);
  }

  async function handleSendOtp() {
    if (!PHONE_RE.test(phone)) {
      setError(t("auth.errPhone"));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await sendOtp(phone);
      // Backend is in mock mode  it returns the OTP in the response.
      // Show it as a helper banner so testers don't need to check logs.
      if (res.otp_code) setMockOtp(res.otp_code);
      setCooldown(RESEND_SECONDS);
      setStep("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify() {
    const code = otp.join("");
    if (code.length < 6) {
      setError(t("auth.errOtpShort"));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await verifyOtp(phone, code);
      // Save user role so pages can check it without re-decoding the JWT
      window.localStorage.setItem("pt.role", res.user.role);
      window.localStorage.setItem("pt.user", JSON.stringify(res.user));
      completeAuth(res.token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Incorrect OTP. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    try {
      const res = await sendOtp(phone);
      if (res.otp_code) setMockOtp(res.otp_code);
      setCooldown(RESEND_SECONDS);
      setOtp(Array(6).fill(""));
      setError(null);
    } catch {
      // silently ignore resend errors
    }
  }

  function setOtpAt(index: number, value: string) {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      setOtp((prev) => prev.map((d, i) => (i === index ? "" : d)));
      return;
    }
    setOtp((prev) => {
      const next = [...prev];
      digits.split("").forEach((d, k) => {
        if (index + k < 6) next[index + k] = d;
      });
      return next;
    });
    const target = Math.min(index + digits.length, 5);
    otpRefs.current[target]?.focus();
  }

  const isSignup = modalMode === "signup";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("auth.welcome")}
    >
      <button
        type="button"
        aria-label={t("auth.close")}
        onClick={handleClose}
        style={{ animationDuration: closing ? "200ms" : "300ms" }}
        className={`absolute inset-0 bg-black/40 backdrop-blur-[20px] ${
          closing ? "anim-fade [animation-direction:reverse]" : "anim-fade"
        }`}
      />

      <div
        style={{ animationDuration: closing ? "200ms" : "250ms" }}
        className={`relative w-full max-w-[420px] rounded-[20px] border border-white/10 p-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl ${
          closing ? "anim-scale-in [animation-direction:reverse]" : "anim-scale-in"
        }`}
      >
        <div
          aria-hidden
          className="absolute inset-0 -z-10 rounded-[20px]"
          style={{ backgroundColor: "rgba(36,30,31,0.55)" }}
        />

        {step === "phone" ? (
          <div key="phone" className="anim-fade">
            <Bus className="mx-auto size-8 text-peri" strokeWidth={1.75} />
            <h2 className="mt-4 font-display text-[24px] font-semibold text-ink">
              {isSignup ? t("auth.welcomeNew") : t("auth.welcome")}
            </h2>
            <p className="mt-1 font-sans text-[14px] text-ink-muted">
              {isSignup ? t("auth.subNew") : t("auth.sub")}
            </p>

            <div className="mt-7 flex items-center rounded-[10px] border border-white/15 bg-black/20">
              <span className="px-4 font-sans text-[14px] text-ink-muted">+91</span>
              <span className="h-6 w-px bg-white/15" />
              <input
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                placeholder={t("auth.placeholder")}
                className="h-12 flex-1 bg-transparent px-4 font-sans text-[14px] text-ink placeholder:text-ink-muted/70 focus:outline-none"
              />
            </div>

            {error ? <ErrorBanner message={error} /> : null}

            <Button
              variant="periwinkle"
              size="full"
              className="mt-4"
              disabled={busy}
              onClick={handleSendOtp}
            >
              {busy ? "Sending" : t("auth.sendOtp")}
            </Button>

            <p className="mt-5 font-sans text-[13px] text-ink-muted">
              {isSignup ? t("auth.haveAccount") : t("auth.newHere")}{" "}
              <button
                type="button"
                onClick={() => setModalMode(isSignup ? "login" : "signup")}
                className="text-peri transition-colors hover:brightness-125"
              >
                {isSignup ? t("auth.loginLink") : t("auth.signupLink")}
              </button>
            </p>
          </div>
        ) : (
          <div key="otp" className="anim-fade">
            <Bus className="mx-auto size-8 text-peri" strokeWidth={1.75} />
            <h2 className="mt-4 font-display text-[24px] font-semibold text-ink">
              {t("auth.otpTitle")}
            </h2>
            <p className="mt-1 font-sans text-[14px] text-ink-muted">
              {t("auth.otpSub")} +91 {phone}
            </p>

            {/* Demo helper  backend returns OTP in response since SMS is mocked */}
            {mockOtp ? (
              <p className="mt-3 rounded-[8px] border border-yellow-400/40 bg-yellow-400/10 px-3 py-2 font-sans text-[12.5px] text-yellow-300">
                Demo OTP: <span className="font-bold tracking-widest">{mockOtp}</span>
              </p>
            ) : null}

            <div className="mt-5 flex justify-center gap-2.5">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpRefs.current[i] = el;
                  }}
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => setOtpAt(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
                    if (e.key === "Enter") handleVerify();
                  }}
                  className="size-12 rounded-[10px] border border-white/15 bg-black/20 text-center font-sans text-[18px] text-ink focus:border-peri focus:outline-none"
                />
              ))}
            </div>

            {error ? <ErrorBanner message={error} /> : null}

            <Button
              variant="periwinkle"
              size="full"
              className="mt-4"
              disabled={busy}
              onClick={handleVerify}
            >
              {busy ? "Verifying" : t("auth.verify")}
            </Button>

            <div className="mt-5 flex items-center justify-between font-sans text-[13px]">
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-ink-muted transition-colors hover:text-ink"
              >
                {t("auth.changeNumber")}
              </button>
              <button
                type="button"
                disabled={cooldown > 0}
                onClick={handleResend}
                className="text-peri transition-colors hover:brightness-125 disabled:text-ink-muted"
              >
                {cooldown > 0 ? t("auth.resendIn", { s: cooldown }) : t("auth.resend")}
              </button>
            </div>
          </div>
        )}
      </div>
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
