import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getAIAdminSummary, type AIAdminSummary } from "@/lib/api";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bus,
  IndianRupee,
  Loader2,
  LogOut,
  Phone,
  RefreshCw,
  Ticket,
  TrendingDown,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { sendOtp, verifyOtp, getAdminStats, type AdminStatsResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Transit Flow" },
      { name: "description", content: "Admin analytics: revenue, Pink Card discounts, route performance." },
    ],
  }),
  component: AdminFlow,
});

const PHONE_RE = /^[6-9]\d{9}$/;
const ADMIN_SESSION_KEY = "pt.adminSession";
const ADMIN_NAME_KEY = "pt.adminName";
const OTP_RESEND = 30;

type Screen = "login" | "otp" | "dashboard";
type Range = "today" | "week" | "all";

function AdminFlow() {
  const [screen, setScreen] = useState<Screen>("login");
  const [phone, setPhone] = useState("");
  const [initialOtp, setInitialOtp] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_SESSION_KEY);
    if (saved) setScreen("dashboard");
  }, []);

  return (
    <div className="min-h-[100svh] bg-[#07090f] text-white">
      {screen === "dashboard" ? (
        <AdminDashboard
          onLogout={() => {
            localStorage.removeItem(ADMIN_SESSION_KEY);
            localStorage.removeItem(ADMIN_NAME_KEY);
            setScreen("login");
          }}
        />
      ) : screen === "login" ? (
        <LoginScreen
          phone={phone}
          setPhone={setPhone}
          onSent={(otp) => { setInitialOtp(otp); setScreen("otp"); }}
        />
      ) : (
        <OtpScreen
          phone={phone}
          initialOtp={initialOtp}
          onBack={() => setScreen("login")}
          onVerified={() => setScreen("dashboard")}
        />
      )}
    </div>
  );
}

function LoginScreen({
  phone, setPhone, onSent,
}: {
  phone: string;
  setPhone: (v: string) => void;
  onSent: (otp: string | null) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!PHONE_RE.test(phone)) { setError("Enter a valid 10-digit phone number."); return; }
    setError(null);
    setBusy(true);
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
    <div className="flex min-h-[100svh] items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex items-center gap-3">
          <img src="/logo.png" alt="Transit Flow Logo" className="h-10 w-auto object-contain" />
          <div>
            <p className="font-sans text-[11px] uppercase tracking-widest text-white/40">Transit Flow</p>
            <h1 className="font-sans text-[18px] font-semibold text-white">Admin Portal</h1>
          </div>
        </div>

        <div className="rounded-[16px] border border-white/10 bg-white/[0.04] p-7">
          <h2 className="font-sans text-[22px] font-semibold text-white">Sign in</h2>
          <p className="mt-1 font-sans text-[13px] text-white/50">
            Use admin phone number · OTP will appear on screen
          </p>

          <div className="mt-6">
            <label className="mb-2 block font-sans text-[12px] text-white/60">Phone number</label>
            <div className="flex items-center rounded-[10px] border border-white/15 bg-white/[0.05]">
              <span className="flex items-center gap-2 border-r border-white/10 px-3 font-sans text-[13px] text-white/50">
                <Phone className="size-3.5" strokeWidth={1.5} />
                +91
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                onKeyDown={(e) => e.key === "Enter" && send()}
                inputMode="numeric"
                maxLength={10}
                placeholder="9888888888"
                className="h-11 flex-1 bg-transparent px-3 font-sans text-[14px] text-white placeholder:text-white/25 focus:outline-none"
              />
            </div>
          </div>

          <p className="mt-3 font-sans text-[11.5px] text-white/40">
            Admin phone: <span className="text-indigo-400">9888888888</span>
          </p>

          {error && (
            <p className="mt-4 rounded-[8px] border border-red-500/30 bg-red-500/10 px-3 py-2 font-sans text-[12px] text-red-400">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={send}
            disabled={busy}
            className="mt-6 flex h-11 w-full items-center justify-center rounded-[10px] bg-indigo-600 font-sans text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : "Send OTP →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OtpScreen({
  phone, initialOtp, onBack, onVerified,
}: {
  phone: string;
  initialOtp: string | null;
  onBack: () => void;
  onVerified: () => void;
}) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [mockOtp, setMockOtp] = useState<string | null>(initialOtp);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(OTP_RESEND);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const id = setInterval(() => setResendIn((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(id);
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
    if (code.length < 6) { setError("Enter all 6 digits."); return; }
    setError(null);
    setBusy(true);
    try {
      const res = await verifyOtp(phone, code);
      if (res.user.role !== "admin") {
        setError("This account does not have admin access.");
        return;
      }
      localStorage.setItem(ADMIN_SESSION_KEY, res.token);
      localStorage.setItem(ADMIN_NAME_KEY, res.user.name ?? `Admin (${phone})`);
      localStorage.setItem("pt.session", res.token);
      onVerified();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Incorrect OTP.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    try {
      const res = await sendOtp(phone);
      if (res.otp_code) setMockOtp(res.otp_code);
      setResendIn(OTP_RESEND);
      setOtp(Array(6).fill(""));
    } catch { /* ignore */ }
  }

  return (
    <div className="flex min-h-[100svh] items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex items-center gap-3">
          <img src="/logo.png" alt="Transit Flow Logo" className="h-10 w-auto object-contain" />
          <div>
            <p className="font-sans text-[11px] uppercase tracking-widest text-white/40">Transit Flow</p>
            <h1 className="font-sans text-[18px] font-semibold text-white">Admin Portal</h1>
          </div>
        </div>

        <div className="rounded-[16px] border border-white/10 bg-white/[0.04] p-7">
          <h2 className="font-sans text-[22px] font-semibold text-white">Verify OTP</h2>
          <p className="mt-1 font-sans text-[13px] text-white/50">
            Sent to +91 {phone} ·{" "}
            <button type="button" onClick={onBack} className="text-indigo-400 hover:underline">
              change
            </button>
          </p>

          {mockOtp && (
            <div className="mt-4 rounded-[8px] border border-yellow-400/30 bg-yellow-400/10 px-3 py-2">
              <p className="font-sans text-[12px] text-yellow-300">
                Demo OTP: <span className="font-bold tracking-widest">{mockOtp}</span>
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-between gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => setAt(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
                  if (e.key === "Enter") verify();
                }}
                className="h-12 w-full rounded-[8px] border border-white/15 bg-white/[0.05] text-center font-sans text-[18px] text-white focus:border-indigo-500 focus:outline-none"
              />
            ))}
          </div>

          {error && (
            <p className="mt-4 rounded-[8px] border border-red-500/30 bg-red-500/10 px-3 py-2 font-sans text-[12px] text-red-400">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={verify}
            disabled={busy}
            className="mt-5 flex h-11 w-full items-center justify-center rounded-[10px] bg-indigo-600 font-sans text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : "Verify & Enter →"}
          </button>

          <p className="mt-4 text-center font-sans text-[12px] text-white/40">
            {resendIn > 0 ? (
              `Resend in ${resendIn}s`
            ) : (
              <button type="button" onClick={resend} className="text-indigo-400 hover:underline">
                Resend OTP
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const adminName = localStorage.getItem(ADMIN_NAME_KEY) ?? "Admin";
  const [range, setRange] = useState<Range>("all");
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchStats(r: Range) {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem(ADMIN_SESSION_KEY);
    if (token) localStorage.setItem("pt.session", token);
    try {
      const res = await getAdminStats(r);
      setStats(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load stats.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchStats(range); }, [range]);

  return (
    <div className="flex min-h-[100svh] flex-col">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Transit Flow Logo" className="h-8 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 font-sans text-[13px] text-white/50">
            <UserRound className="size-4" strokeWidth={1.5} />
            {adminName}
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 font-sans text-[13px] text-white/50 transition-colors hover:text-white"
          >
            <LogOut className="size-4" strokeWidth={1.5} />
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-sans text-[26px] font-bold text-white">Analytics Dashboard</h1>
              <p className="mt-0.5 font-sans text-[13px] text-white/40">
                Live data from Supabase · Last refreshed just now
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(["today", "week", "all"] as Range[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded-[8px] px-4 py-2 font-sans text-[13px] transition-colors",
                    range === r
                      ? "bg-indigo-600 text-white"
                      : "border border-white/15 text-white/50 hover:text-white"
                  )}
                >
                  {r === "today" ? "Today" : r === "week" ? "This Week" : "All Time"}
                </button>
              ))}
              <button
                type="button"
                onClick={() => fetchStats(range)}
                className="flex size-9 items-center justify-center rounded-[8px] border border-white/15 text-white/50 transition-colors hover:text-white"
              >
                <RefreshCw className={cn("size-4", loading && "animate-spin")} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-3 rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3">
              <AlertTriangle className="size-5 text-red-400" strokeWidth={1.5} />
              <p className="font-sans text-[13px] text-red-400">{error}</p>
            </div>
          )}

          {loading && !stats ? (
            <div className="mt-20 flex justify-center">
              <Loader2 className="size-8 animate-spin text-indigo-400" />
            </div>
          ) : stats ? (
            <>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  icon={<IndianRupee className="size-5" strokeWidth={1.5} />}
                  label="Total Revenue"
                  value={`₹${stats.total_revenue.toLocaleString("en-IN")}`}
                  sub={`Net estimate: ₹${stats.net_estimate.toLocaleString("en-IN")}`}
                  trend={stats.net_estimate >= 0 ? "up" : "down"}
                  color="indigo"
                />
                <KpiCard
                  icon={<Ticket className="size-5" strokeWidth={1.5} />}
                  label="Tickets Sold"
                  value={stats.revenue_by_route.reduce((a, r) => a + r.tickets_sold, 0).toString()}
                  sub={`Free tickets: ${stats.revenue_by_route.reduce((a, r) => a + r.free_tickets, 0)}`}
                  color="violet"
                />
                <KpiCard
                  icon={<Activity className="size-5" strokeWidth={1.5} />}
                  label="Pink Card Discount"
                  value={`₹${stats.pink_card_discount_lost.toLocaleString("en-IN")}`}
                  sub="Govt subsidy applied"
                  color="rose"
                />
                <KpiCard
                  icon={<Bus className="size-5" strokeWidth={1.5} />}
                  label="Total Trips"
                  value={stats.trip_count.toString()}
                  sub={`Est. cost/trip: ₹${stats.estimated_cost_per_trip}`}
                  color="emerald"
                />
              </div>

              <div className="mt-6 rounded-[14px] border border-white/10 bg-white/[0.03] p-6">
                <h2 className="font-sans text-[15px] font-semibold text-white">Revenue vs Estimated Cost</h2>
                <div className="mt-4 flex items-end gap-8">
                  {/* FIX: max now includes all three values so no bar can overflow */}
                  <BarItem
                    label="Revenue"
                    value={stats.total_revenue}
                    max={Math.max(stats.total_revenue, stats.estimated_cost, stats.pink_card_discount_lost)}
                    color="bg-indigo-500"
                  />
                  <BarItem
                    label="Est. Cost"
                    value={stats.estimated_cost}
                    max={Math.max(stats.total_revenue, stats.estimated_cost, stats.pink_card_discount_lost)}
                    color="bg-red-500/70"
                  />
                  <BarItem
                    label="Pink Card Discount"
                    value={stats.pink_card_discount_lost}
                    max={Math.max(stats.total_revenue, stats.estimated_cost, stats.pink_card_discount_lost)}
                    color="bg-rose-400"
                  />
                </div>
                <p className="mt-4 font-sans text-[11.5px] text-white/30">{stats.cost_note}</p>
              </div>

              <div className="mt-6 rounded-[14px] border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-sans text-[15px] font-semibold text-white">Revenue by Route</h2>
                  <div className="flex items-center gap-1.5 font-sans text-[12px] text-white/40">
                    <BarChart3 className="size-4" strokeWidth={1.5} />
                    {stats.revenue_by_route.length} routes
                  </div>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        {["Route", "Revenue", "Tickets Sold", "Free Tickets", "Paid %"].map((h) => (
                          <th key={h} className="pb-3 text-left font-sans text-[11px] uppercase tracking-wide text-white/40">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.revenue_by_route.map((row, i) => {
                        const paidPct = row.tickets_sold > 0
                          ? Math.round(((row.tickets_sold - row.free_tickets) / row.tickets_sold) * 100)
                          : 0;
                        return (
                          <tr
                            key={row.route_name}
                            className={cn(
                              "border-b border-white/[0.06] transition-colors hover:bg-white/[0.03]",
                              i === stats.revenue_by_route.length - 1 && "border-0"
                            )}
                          >
                            <td className="py-4 font-sans text-[13px] font-medium text-white">{row.route_name}</td>
                            <td className="py-4 font-sans text-[13px] text-emerald-400">
                              ₹{row.revenue.toLocaleString("en-IN")}
                            </td>
                            <td className="py-4 font-sans text-[13px] text-white/70">{row.tickets_sold}</td>
                            <td className="py-4">
                              <span className="rounded-full bg-rose-500/20 px-2 py-0.5 font-sans text-[11.5px] text-rose-300">
                                🌸 {row.free_tickets}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                                  <div
                                    className="h-full rounded-full bg-indigo-500"
                                    style={{ width: `${paidPct}%` }}
                                  />
                                </div>
                                <span className="font-sans text-[12px] text-white/50">{paidPct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {stats.revenue_by_route.length === 0 && (
                    <p className="py-8 text-center font-sans text-[13px] text-white/30">
                      No route data for this period.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <SummaryCard
                  label="Range"
                  value={stats.range}
                  icon={<Activity className="size-4 text-indigo-400" strokeWidth={1.5} />}
                />
                <SummaryCard
                  label="Est. Operating Cost"
                  value={`₹${stats.estimated_cost.toLocaleString("en-IN")}`}
                  icon={<TrendingDown className="size-4 text-red-400" strokeWidth={1.5} />}
                />
                <SummaryCard
                  label="Net Estimate"
                  value={`₹${stats.net_estimate.toLocaleString("en-IN")}`}
                  icon={
                    stats.net_estimate >= 0
                      ? <TrendingUp className="size-4 text-emerald-400" strokeWidth={1.5} />
                      : <TrendingDown className="size-4 text-red-400" strokeWidth={1.5} />
                  }
                />
              </div>

              <AIForecastSection />
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function AIForecastSection() {
  const [data, setData] = useState<AIAdminSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAIAdminSummary()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="mt-6 rounded-[14px] border border-white/10 bg-white/[0.03] p-6">
      <h2 className="font-sans text-[15px] font-semibold text-white">🤖 AI Demand Forecast</h2>
      <div className="mt-4 flex justify-center">
        <Loader2 className="size-6 animate-spin text-indigo-400" />
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="mt-6 rounded-[14px] border border-indigo-500/30 bg-indigo-500/5 p-6">
      <h2 className="font-sans text-[15px] font-semibold text-white">🤖 AI Demand Forecast</h2>
      <p className="mt-1 font-sans text-[12px] text-white/40">Powered by ML model · Predicted load and fleet recommendation</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[10px] border border-white/10 bg-white/[0.03] p-4">
          <p className="font-sans text-[11px] text-white/40">Est. Daily Revenue</p>
          <p className="mt-1 font-sans text-[22px] font-bold text-emerald-400">₹{data.total_estimated_revenue.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-[10px] border border-white/10 bg-white/[0.03] p-4">
          <p className="font-sans text-[11px] text-white/40">Est. Daily Cost</p>
          <p className="mt-1 font-sans text-[22px] font-bold text-red-400">₹{data.total_estimated_cost.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-[10px] border border-white/10 bg-white/[0.03] p-4">
          <p className="font-sans text-[11px] text-white/40">Est. Profit</p>
          <p className="mt-1 font-sans text-[22px] font-bold text-indigo-400">₹{data.estimated_profit.toLocaleString("en-IN")}</p>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {["Route", "Avg Load", "Peak Load", "Buses Needed", "Daily Revenue", "Daily Cost"].map((h) => (
                <th key={h} className="pb-3 text-left font-sans text-[11px] uppercase tracking-wide text-white/40">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.route_stats.map((row) => (
              <tr key={row.route_id} className="border-b border-white/[0.06]">
                <td className="py-3 font-sans text-[13px] font-medium text-white">{row.route_id}</td>
                <td className="py-3 font-sans text-[13px] text-white/70">{row.avg_predicted_load}</td>
                <td className="py-3 font-sans text-[13px] text-white/70">{row.peak_predicted_load}</td>
                <td className="py-3 font-sans text-[13px] text-indigo-400">{row.recommended_buses} buses</td>
                <td className="py-3 font-sans text-[13px] text-emerald-400">₹{row.estimated_daily_revenue.toLocaleString("en-IN")}</td>
                <td className="py-3 font-sans text-[13px] text-red-400">₹{row.estimated_daily_cost.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiCard({
  icon, label, value, sub, trend, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  trend?: "up" | "down";
  color: "indigo" | "violet" | "rose" | "emerald";
}) {
  const bg = {
    indigo: "bg-indigo-500/15 text-indigo-400",
    violet: "bg-violet-500/15 text-violet-400",
    rose: "bg-rose-500/15 text-rose-400",
    emerald: "bg-emerald-500/15 text-emerald-400",
  }[color];

  return (
    <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-5">
      <div className={cn("inline-flex size-9 items-center justify-center rounded-[8px]", bg)}>
        {icon}
      </div>
      <p className="mt-4 font-sans text-[26px] font-bold text-white">{value}</p>
      <p className="mt-0.5 font-sans text-[12px] text-white/40">{label}</p>
      <p className="mt-3 flex items-center gap-1 font-sans text-[11.5px] text-white/30">
        {trend === "up" && <TrendingUp className="size-3 text-emerald-400" />}
        {trend === "down" && <TrendingDown className="size-3 text-red-400" />}
        {sub}
      </p>
    </div>
  );
}

function BarItem({
  label, value, max, color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const HEIGHT = 120;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-sans text-[13px] font-semibold text-white">
        ₹{value.toLocaleString("en-IN")}
      </p>
      <div className="flex w-16 items-end" style={{ height: HEIGHT }}>
        <div
          className={cn("w-full rounded-t-[6px] transition-all duration-700", color)}
          style={{ height: `${pct}%` }}
        />
      </div>
      <p className="font-sans text-[11px] text-white/40">{label}</p>
    </div>
  );
}

function SummaryCard({
  label, value, icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[12px] border border-white/10 bg-white/[0.03] px-4 py-3">
      {icon}
      <div>
        <p className="font-sans text-[11px] text-white/40">{label}</p>
        <p className="font-sans text-[14px] font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
