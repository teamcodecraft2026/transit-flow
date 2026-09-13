import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeftRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Loader2,
  MapPin,
  ShieldCheck,
  Ticket,
  X,
} from "lucide-react";
import navyBg from "@/assets/night-street-navy.jpg";
import { PageShell } from "@/components/PageShell";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { StatBadgeStrip } from "@/components/StatBadgeStrip";
import { QrCodeImage } from "@/components/QrCodeImage";
import { useI18n } from "@/i18n/LanguageProvider";
import { useAuth } from "@/auth/AuthProvider";
import { searchTrips, bookTicket, fetchAllStops, type Trip, type Ticket as TicketType } from "@/lib/api";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Bus — Search Routes | Public Transit" },
      {
        name: "description",
        content:
          "Search bus routes across every state we serve, pay securely, and receive an instant QR ticket. Pink Card zero-fare applies automatically.",
      },
      { property: "og:title", content: "Book a Bus — Search Routes | Public Transit" },
      {
        property: "og:description",
        content:
          "Search routes, pick a date, and get an instant QR ticket with automatic Pink Card zero-fare.",
      },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const { t } = useI18n();
  const { isAuthenticated, requireAuth, openAuth } = useAuth();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [allStops, setAllStops] = useState<string[]>([]);

  const [booking, setBooking] = useState<string | null>(null);
  const [bookedTicket, setBookedTicket] = useState<TicketType | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);
  const [pinkCardApplied, setPinkCardApplied] = useState(false);

  const features = [
    { icon: ShieldCheck, title: t("book.f1"), caption: t("book.f1sub") },
    { icon: Ticket, title: t("book.f2"), caption: t("book.f2sub") },
    { icon: CreditCard, title: t("book.f3"), caption: t("book.f3sub") },
  ];

  useEffect(() => {
    fetchAllStops().then(setAllStops).catch(console.error);
  }, []);

  async function handleSearch() {
    setSearchError(null);
    setSearched(true);
    setLoading(true);
    setTrips([]);
    try {
      const res = await searchTrips(from.trim(), to.trim(), date);
      setTrips(res.trips);
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBook(trip_id: string) {
    requireAuth(async () => {
      setBookError(null);
      setBooking(trip_id);
      try {
        const res = await bookTicket(trip_id);
        setBookedTicket(res.ticket);
        setPinkCardApplied(res.pink_card_applied);
      } catch (err: unknown) {
        setBookError(err instanceof Error ? err.message : "Booking failed. Please try again.");
      } finally {
        setBooking(null);
      }
    });
  }

  function formatTime(isoString: string) {
    return new Date(isoString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <PageShell theme="navy" backHome>
      <section className="relative -mt-[88px] overflow-hidden pb-[120px] pt-[160px]">
        <img
          src={navyBg}
          alt=""
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-x-0 bottom-0 h-60 bg-linear-to-b from-transparent to-canvas" />

        <div className="relative z-10 mx-auto max-w-[1240px] px-6">
          <Reveal className="text-center">
            <SectionEyebrow label={t("book.eyebrow")} tone="navy" />
            <h1 className="mt-6 font-display text-[36px] text-ink sm:text-[44px]">
              {t("book.title")}
            </h1>
            <p className="mt-2 font-sans text-[13.5px] text-ink-muted">{t("book.sub")}</p>
          </Reveal>

          {/* Search panel */}
          <Reveal delay={120}>
            <div className="mt-12 overflow-visible rounded-[18px] border border-navy-line bg-navy-field/70 p-5 backdrop-blur-md sm:p-7">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,0.8fr)_auto] lg:items-end">
                <Field label={t("book.from")}>
                  <StopDropdown
                    icon={<MapPin className="size-3.5 shrink-0 text-navy-icon" strokeWidth={1.5} />}
                    value={from}
                    onChange={setFrom}
                    placeholder={t("book.fromPlaceholder")}
                    stops={allStops}
                  />
                </Field>

                <button
                  type="button"
                  aria-label={t("book.swap")}
                  onClick={() => {
                    setFrom(to);
                    setTo(from);
                  }}
                  className="mb-3 hidden size-9 items-center justify-center self-end rounded-full border border-navy-line text-navy-icon transition-colors hover:bg-navy-accent/20 lg:flex"
                >
                  <ArrowLeftRight className="size-4" strokeWidth={1.5} />
                </button>

                <Field label={t("book.to")}>
                  <StopDropdown
                    icon={<MapPin className="size-3.5 shrink-0 text-navy-icon" strokeWidth={1.5} />}
                    value={to}
                    onChange={setTo}
                    placeholder={t("book.toPlaceholder")}
                    stops={allStops}
                  />
                </Field>

                <Field label={t("book.date")}>
                  <div className="flex h-12 w-full min-w-0 items-center gap-2 rounded-[10px] border border-navy-line bg-navy-field-alt px-3">
                    <Calendar className="size-3.5 shrink-0 text-navy-icon" strokeWidth={1.5} />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="min-w-0 flex-1 bg-transparent font-sans text-[13px] text-ink [color-scheme:dark] focus:outline-none"
                    />
                  </div>
                </Field>

                <Button
                  variant="blue"
                  size="lg"
                  className="h-12 w-full lg:w-auto"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : t("book.search")}
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <StatBadgeStrip items={features} tone="navy" className="mt-8" />
          </Reveal>

          {/* Pink Card banner */}
          <Reveal delay={280}>
            <div className="mt-8 flex flex-col gap-5 rounded-[18px] border border-rose/25 bg-black/45 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <CreditCard className="mt-0.5 size-7 text-rose-bright" strokeWidth={1.5} />
                <div>
                  <p className="font-display text-[18px] text-ink">{t("book.bannerTitle")}</p>
                  <p className="mt-1 font-sans text-[12px] text-ink-muted">
                    {t("book.bannerSub")} <span className="text-rose">{t("book.bannerLink")}</span>
                  </p>
                </div>
              </div>
              {!isAuthenticated && (
                <Button
                  variant="outlineBlue"
                  size="md"
                  className="font-display text-[15px] font-medium"
                  onClick={() => openAuth("login")}
                >
                  {t("book.bannerCta")}
                </Button>
              )}
            </div>
          </Reveal>

          {/* Search results */}
          <div className="mt-14">
            <h2 className="font-display text-[26px] text-ink">{t("book.results")}</h2>

            {searchError ? (
              <p className="mt-4 rounded-[10px] border border-destructive/40 bg-destructive/10 px-4 py-3 font-sans text-[13px] text-destructive">
                {searchError}
              </p>
            ) : loading ? (
              <div className="mt-8 flex justify-center">
                <Loader2 className="size-8 animate-spin text-navy-icon" />
              </div>
            ) : searched && trips.length === 0 ? (
              <p className="mt-4 font-sans text-[13px] text-ink-muted">
                No buses found for that route. Try different origins/destinations.
              </p>
            ) : trips.length > 0 ? (
              <>
                {bookError && (
                  <p className="mb-4 mt-2 rounded-[10px] border border-destructive/40 bg-destructive/10 px-4 py-3 font-sans text-[13px] text-destructive">
                    {bookError}
                  </p>
                )}
                <ul className="mt-6 space-y-3">
                  {trips.map((trip, i) => (
                    <li
                      key={trip.trip_id}
                      style={{ animationDelay: `${i * 90}ms` }}
                      className="anim-slide-left rounded-[14px] border border-navy-line bg-navy-panel/95 p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-display text-[18px] text-ink">{trip.route_name}</p>
                          <p className="mt-1 font-sans text-[12px] text-ink-muted">
                            {trip.origin} → {trip.destination} · Bus {trip.bus_number} ·{" "}
                            {formatTime(trip.departure_time)}
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <span className="font-display text-[20px] text-ink">₹{trip.base_fare}</span>
                          <Button
                            variant="blue"
                            size="sm"
                            disabled={booking === trip.trip_id}
                            onClick={() => handleBook(trip.trip_id)}
                          >
                            {booking === trip.trip_id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              t("book.select")
                            )}
                          </Button>
                        </div>
                      </div>
                      {trip.stops && trip.stops.length > 0 && (
                        <div className="mt-4 border-t border-navy-line pt-4">
                          <p className="mb-3 font-sans text-[11px] uppercase tracking-wider text-ink-muted">
                            Route Stops
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            {trip.stops.map((stop, idx) => (
                              <div key={stop.name} className="flex items-center gap-2">
                                <div className="rounded-[8px] border border-navy-line bg-navy-field/50 px-3 py-1.5">
                                  <span className="font-sans text-[12px] text-ink">{stop.name}</span>
                                </div>
                                {idx < trip.stops.length - 1 && (
                                  <span className="text-[10px] text-ink-muted">→</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-4 font-sans text-[13px] text-ink-muted">{t("book.noResults")}</p>
            )}
          </div>
        </div>
      </section>

      {bookedTicket && (
        <BookingSuccessModal
          ticket={bookedTicket}
          pinkCardApplied={pinkCardApplied}
          onClose={() => {
            setBookedTicket(null);
            setPinkCardApplied(false);
          }}
        />
      )}
    </PageShell>
  );
}

function BookingSuccessModal({
  ticket,
  pinkCardApplied,
  onClose,
}: {
  ticket: TicketType;
  pinkCardApplied: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[16px]"
      />
      <div className="relative w-full max-w-[400px] rounded-[20px] border border-white/10 bg-[rgba(10,18,42,0.92)] p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-ink-muted hover:text-ink"
        >
          <X className="size-5" />
        </button>

        <CheckCircle2 className="mx-auto size-10 text-green-400" strokeWidth={1.5} />
        <h2 className="mt-3 font-display text-[24px] text-ink">Ticket Booked!</h2>

        {pinkCardApplied && (
          <span className="mt-2 inline-block rounded-full bg-rose-glow px-4 py-1 font-sans text-[12px] font-semibold text-white">
            Pink Card Applied — ₹0 Fare
          </span>
        )}

        <div className="mt-5 flex justify-center">
          <QrCodeImage
            value={ticket.qr_payload}
            size={200}
            className="rounded-[12px] border border-white/15"
          />
        </div>

        <p className="mt-4 font-sans text-[12px] text-ink-muted">
          Show this QR to the conductor when boarding.
        </p>

        <div className="mt-5 rounded-[10px] border border-white/10 bg-white/5 p-4 text-left">
          <Row label="Ticket ID (Full)" value={ticket.id} />
          <Row label="Fare Charged" value={`₹${ticket.fare_charged}`} />
          <Row label="Status" value={ticket.status.toUpperCase()} />
          <Row
            label="Issued"
            value={new Date(ticket.issued_at).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          />
        </div>

        <Button variant="blue" size="full" className="mt-6" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="font-sans text-[12px] text-ink-muted">{label}</span>
      <span className="font-sans text-[13px] text-ink">{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block font-sans text-[12.5px] text-ink/80">{label}</span>
      {children}
    </label>
  );
}

function StopDropdown({
  icon,
  value,
  onChange,
  placeholder,
  stops,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  stops: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = stops.filter((s) =>
    s.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <div className="flex h-12 w-full min-w-0 items-center gap-2 rounded-[10px] border border-navy-line bg-navy-field-alt px-3">
        {icon}
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent font-sans text-[13px] text-ink placeholder:text-ink-muted/80 focus:outline-none"
        />
        <ChevronDown className="size-3.5 shrink-0 text-ink-muted" strokeWidth={1.5} />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-[52px] z-50 max-h-[200px] overflow-y-auto rounded-[10px] border border-navy-line bg-[rgba(10,18,42,0.97)] shadow-lg">
          {filtered.map((stop) => (
            <button
              key={stop}
              type="button"
              onMouseDown={() => {
                onChange(stop);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-sans text-[13px] text-ink hover:bg-navy-accent/20"
            >
              <MapPin className="size-3 shrink-0 text-navy-icon" strokeWidth={1.5} />
              {stop}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
