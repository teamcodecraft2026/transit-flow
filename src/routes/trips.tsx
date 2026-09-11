import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bus, Loader2, Ticket, X } from "lucide-react";
import navyBg from "@/assets/night-street-navy.jpg";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthProvider";
import { getTicketHistory, type TicketHistoryItem } from "@/lib/api";
import { QrCodeImage } from "@/components/QrCodeImage";

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "My Trips — Upcoming & Past Journeys | Public Transit" },
      {
        name: "description",
        content:
          "View your upcoming and past bus journeys, open QR tickets, and see which trips travelled zero-fare on the Pink Card.",
      },
      { property: "og:title", content: "My Trips — Upcoming & Past Journeys | Public Transit" },
      {
        property: "og:description",
        content: "Every booking in one place, with instant access to your QR tickets.",
      },
    ],
  }),
  component: TripsPage,
});

function TripsPage() {
  const { t } = useI18n();
  const { isAuthenticated, requireAuth } = useAuth();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [tickets, setTickets] = useState<TicketHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    getTicketHistory()
      .then((res) => setTickets(res.tickets))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load ticket history."),
      )
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const upcoming = tickets.filter((t) => t.status === "issued");
  const past = tickets.filter((t) => t.status !== "issued");
  const displayed = tab === "upcoming" ? upcoming : past;

  const expandedTicket = tickets.find((t) => t.ticket_id === expandedId) ?? null;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <PageShell theme="navy" backHome>
      <section className="relative -mt-[88px] min-h-[100svh] overflow-hidden pb-[120px] pt-[160px]">
        <img
          src={navyBg}
          alt=""
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-x-0 bottom-0 h-60 bg-linear-to-b from-transparent to-canvas" />

        <div className="relative z-10 mx-auto max-w-[1180px] px-6">
          <h1 className="font-display text-[36px] text-ink sm:text-[42px]">{t("trips.title")}</h1>

          {!isAuthenticated ? (
            <div className="mt-16 flex flex-col items-center gap-6 text-center">
              <Ticket className="size-14 text-navy-icon opacity-60" strokeWidth={1.25} />
              <p className="font-sans text-[15px] text-ink-muted">
                Sign in to view your ticket history.
              </p>
              <button
                type="button"
                onClick={() => requireAuth()}
                className="rounded-[10px] border border-navy-accent/70 px-6 py-3 font-sans text-[14px] text-ink transition-colors hover:bg-navy-accent/20"
              >
                Sign In
              </button>
            </div>
          ) : (
            <>
              <div className="mt-5 flex gap-8 border-b border-divider">
                {(["upcoming", "past"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={cn(
                      "relative -mb-px pb-3 font-display text-[16px] transition-colors duration-150",
                      tab === key
                        ? "text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-navy-bright"
                        : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {key === "upcoming" ? "Upcoming" : "Past"}
                    <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 font-sans text-[12px]">
                      {key === "upcoming" ? upcoming.length : past.length}
                    </span>
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="mt-16 flex justify-center">
                  <Loader2 className="size-8 animate-spin text-navy-icon" />
                </div>
              ) : error ? (
                <p className="mt-8 rounded-[10px] border border-destructive/40 bg-destructive/10 px-4 py-3 font-sans text-[13px] text-destructive">
                  {error}
                </p>
              ) : displayed.length === 0 ? (
                <div className="mt-16 flex flex-col items-center gap-4 text-center">
                  <Bus className="size-12 text-navy-icon opacity-40" strokeWidth={1.25} />
                  <p className="font-sans text-[14px] text-ink-muted">
                    {tab === "upcoming"
                      ? "No upcoming trips. Book a ticket to get started."
                      : "No past trips yet."}
                  </p>
                </div>
              ) : (
                <ul className="mt-8 space-y-4">
                  {displayed.map((ticket, i) => (
                    <li
                      key={ticket.ticket_id}
                      style={{ animationDelay: `${i * 80}ms` }}
                      className={cn(
                        "anim-slide-left rounded-[14px] border border-navy-line bg-navy-panel/95 p-5 transition-colors duration-150",
                        ticket.status === "issued" && "cursor-pointer hover:border-navy-bright/50",
                      )}
                      onClick={() => {
                        if (ticket.status !== "issued") return;
                        setExpandedId(ticket.ticket_id);
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-display text-[18px] text-ink">{ticket.route_name}</p>
                          <p className="mt-1 font-sans text-[13px] text-ink-muted">
                            {ticket.origin} → {ticket.destination}
                          </p>
                          <p className="mt-0.5 font-sans text-[12px] text-ink-muted">
                            Bus {ticket.bus_number} · {formatDate(ticket.departure_time)} ·{" "}
                            {formatTime(ticket.departure_time)}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 font-sans text-[11.5px]",
                              ticket.fare_charged === 0
                                ? "bg-rose-glow font-semibold text-white"
                                : "border border-navy-bright/70 text-ink",
                            )}
                          >
                            {ticket.fare_charged === 0 ? "🌸 Free" : `₹${ticket.fare_charged}`}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 font-sans text-[10.5px] uppercase tracking-wide",
                              ticket.status === "issued"
                                ? "bg-green-500/20 text-green-300"
                                : ticket.status === "scanned"
                                  ? "bg-white/10 text-ink-muted"
                                  : "bg-destructive/20 text-destructive",
                            )}
                          >
                            {ticket.status}
                          </span>
                        </div>
                      </div>

                      {ticket.status === "issued" && (
                        <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
                          <QrCodeImage
                            value={ticket.ticket_id}
                            size={80}
                            className="rounded-[8px] border border-white/15"
                          />
                          <div>
                            <p className="font-sans text-[12px] text-ink-muted">
                              Show this QR when boarding
                            </p>
                            <p className="mt-1 font-sans text-[11px] text-ink-muted/60">
                              ID: {ticket.ticket_id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="mt-1 font-sans text-[11px] text-navy-icon">
                              Tap to enlarge QR
                            </p>
                          </div>
                        </div>
                      )}

                      {ticket.scanned_at && (
                        <p className="mt-3 font-sans text-[11.5px] text-ink-muted/60">
                          Scanned: {formatDate(ticket.scanned_at)} {formatTime(ticket.scanned_at)}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </section>

      {/* QR Expand Modal */}
      {expandedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setExpandedId(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-[16px]"
          />
          <div className="relative w-full max-w-[340px] rounded-[20px] border border-white/10 bg-[rgba(10,18,42,0.95)] p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
            <button
              type="button"
              onClick={() => setExpandedId(null)}
              className="absolute right-4 top-4 text-ink-muted hover:text-ink"
            >
              <X className="size-5" />
            </button>

            <p className="font-display text-[18px] text-ink">{expandedTicket.route_name}</p>
            <p className="mt-1 font-sans text-[12px] text-ink-muted">
              {expandedTicket.origin} → {expandedTicket.destination}
            </p>

            <div className="mt-5 flex justify-center">
              <QrCodeImage
                value={expandedTicket.ticket_id}
                size={220}
                className="rounded-[12px] border border-white/15"
              />
            </div>

            <p className="mt-4 font-sans text-[12px] text-ink-muted">
              Show this QR to the conductor when boarding.
            </p>
            <p className="mt-1 font-sans text-[11px] text-ink-muted/50">
              ID: {expandedTicket.ticket_id.slice(0, 8).toUpperCase()}
            </p>

            {expandedTicket.fare_charged === 0 && (
              <span className="mt-3 inline-block rounded-full bg-rose-glow px-4 py-1 font-sans text-[12px] font-semibold text-white">
                🌸 Pink Card — Free Travel
              </span>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}



// import { createFileRoute } from "@tanstack/react-router";
// import { useEffect, useState } from "react";
// import { Bus, Loader2, Ticket } from "lucide-react";
// import navyBg from "@/assets/night-street-navy.jpg";
// import { PageShell } from "@/components/PageShell";
// import { useI18n } from "@/i18n/LanguageProvider";
// import { cn } from "@/lib/utils";
// import { useAuth } from "@/auth/AuthProvider";
// import { getTicketHistory, type TicketHistoryItem } from "@/lib/api";

// export const Route = createFileRoute("/trips")({
//   head: () => ({
//     meta: [
//       { title: "My Trips — Upcoming & Past Journeys | Public Transit" },
//       {
//         name: "description",
//         content:
//           "View your upcoming and past bus journeys, open QR tickets, and see which trips travelled zero-fare on the Pink Card.",
//       },
//       { property: "og:title", content: "My Trips — Upcoming & Past Journeys | Public Transit" },
//       {
//         property: "og:description",
//         content: "Every booking in one place, with instant access to your QR tickets.",
//       },
//     ],
//   }),
//   component: TripsPage,
// });

// function TripsPage() {
//   const { t } = useI18n();
//   const { isAuthenticated, requireAuth } = useAuth();
//   const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
//   const [tickets, setTickets] = useState<TicketHistoryItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!isAuthenticated) return;
//     setLoading(true);
//     setError(null);
//     getTicketHistory()
//       .then((res) => setTickets(res.tickets))
//       .catch((err: unknown) =>
//         setError(err instanceof Error ? err.message : "Failed to load ticket history."),
//       )
//       .finally(() => setLoading(false));
//   }, [isAuthenticated]);

//   // Split into upcoming (issued) vs past (scanned / expired)
//   const upcoming = tickets.filter((t) => t.status === "issued");
//   const past = tickets.filter((t) => t.status !== "issued");
//   const displayed = tab === "upcoming" ? upcoming : past;

//   function formatDate(iso: string) {
//     return new Date(iso).toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   }

//   function formatTime(iso: string) {
//     return new Date(iso).toLocaleTimeString("en-IN", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   }

//   return (
//     <PageShell theme="navy" backHome>
//       <section className="relative -mt-[88px] min-h-[100svh] overflow-hidden pb-[120px] pt-[160px]">
//         <img
//           src={navyBg}
//           alt=""
//           width={1920}
//           height={1088}
//           className="absolute inset-0 size-full object-cover opacity-60"
//         />
//         <div className="absolute inset-0 bg-black/60" />
//         <div className="absolute inset-x-0 bottom-0 h-60 bg-linear-to-b from-transparent to-canvas" />

//         <div className="relative z-10 mx-auto max-w-[1180px] px-6">
//           <h1 className="font-display text-[36px] text-ink sm:text-[42px]">{t("trips.title")}</h1>

//           {!isAuthenticated ? (
//             <div className="mt-16 flex flex-col items-center gap-6 text-center">
//               <Ticket className="size-14 text-navy-icon opacity-60" strokeWidth={1.25} />
//               <p className="font-sans text-[15px] text-ink-muted">
//                 Sign in to view your ticket history.
//               </p>
//               <button
//                 type="button"
//                 onClick={() => requireAuth()}
//                 className="rounded-[10px] border border-navy-accent/70 px-6 py-3 font-sans text-[14px] text-ink transition-colors hover:bg-navy-accent/20"
//               >
//                 Sign In
//               </button>
//             </div>
//           ) : (
//             <>
//               <div className="mt-5 flex gap-8 border-b border-divider">
//                 {(["upcoming", "past"] as const).map((key) => (
//                   <button
//                     key={key}
//                     type="button"
//                     onClick={() => setTab(key)}
//                     className={cn(
//                       "relative -mb-px pb-3 font-display text-[16px] transition-colors duration-150",
//                       tab === key
//                         ? "text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-navy-bright"
//                         : "text-ink-muted hover:text-ink",
//                     )}
//                   >
//                     {key === "upcoming" ? "Upcoming" : "Past"}
//                     <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 font-sans text-[12px]">
//                       {key === "upcoming" ? upcoming.length : past.length}
//                     </span>
//                   </button>
//                 ))}
//               </div>

//               {loading ? (
//                 <div className="mt-16 flex justify-center">
//                   <Loader2 className="size-8 animate-spin text-navy-icon" />
//                 </div>
//               ) : error ? (
//                 <p className="mt-8 rounded-[10px] border border-destructive/40 bg-destructive/10 px-4 py-3 font-sans text-[13px] text-destructive">
//                   {error}
//                 </p>
//               ) : displayed.length === 0 ? (
//                 <div className="mt-16 flex flex-col items-center gap-4 text-center">
//                   <Bus className="size-12 text-navy-icon opacity-40" strokeWidth={1.25} />
//                   <p className="font-sans text-[14px] text-ink-muted">
//                     {tab === "upcoming"
//                       ? "No upcoming trips. Book a ticket to get started."
//                       : "No past trips yet."}
//                   </p>
//                 </div>
//               ) : (
//                 <ul className="mt-8 space-y-4">
//                   {displayed.map((ticket, i) => (
//                     <li
//                       key={ticket.ticket_id}
//                       style={{ animationDelay: `${i * 80}ms` }}
//                       className="anim-slide-left rounded-[14px] border border-navy-line bg-navy-panel/95 p-5"
//                     >
//                       <div className="flex items-start justify-between gap-4">
//                         <div>
//                           <p className="font-display text-[18px] text-ink">{ticket.route_name}</p>
//                           <p className="mt-1 font-sans text-[13px] text-ink-muted">
//                             {ticket.origin} → {ticket.destination}
//                           </p>
//                           <p className="mt-0.5 font-sans text-[12px] text-ink-muted">
//                             Bus {ticket.bus_number} · {formatDate(ticket.departure_time)} ·{" "}
//                             {formatTime(ticket.departure_time)}
//                           </p>
//                         </div>

//                         <div className="flex flex-col items-end gap-2 shrink-0">
//                           <span
//                             className={cn(
//                               "rounded-full px-3 py-1 font-sans text-[11.5px]",
//                               ticket.fare_charged === 0
//                                 ? "bg-rose-glow font-semibold text-white"
//                                 : "border border-navy-bright/70 text-ink",
//                             )}
//                           >
//                             {ticket.fare_charged === 0 ? "🌸 Free" : `₹${ticket.fare_charged}`}
//                           </span>
//                           <span
//                             className={cn(
//                               "rounded-full px-2 py-0.5 font-sans text-[10.5px] uppercase tracking-wide",
//                               ticket.status === "issued"
//                                 ? "bg-green-500/20 text-green-300"
//                                 : ticket.status === "scanned"
//                                   ? "bg-white/10 text-ink-muted"
//                                   : "bg-destructive/20 text-destructive",
//                             )}
//                           >
//                             {ticket.status}
//                           </span>
//                         </div>
//                       </div>

//                       {ticket.status === "issued" && (
//                         <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
//                           <div className="flex justify-center">
//                             <img
//                               src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(ticket.ticket_id)}`}
//                               alt="QR"
//                               width={80}
//                               height={80}
//                               className="rounded-[8px] border border-white/15"
//                             />
//                           </div>
//                           <div>
//                             <p className="font-sans text-[12px] text-ink-muted">
//                               Show this QR when boarding
//                             </p>
//                             <p className="mt-1 font-sans text-[11px] text-ink-muted/60">
//                               ID: {ticket.ticket_id.slice(0, 8).toUpperCase()}
//                             </p>
//                           </div>
//                         </div>
//                       )}

//                       {ticket.scanned_at && (
//                         <p className="mt-3 font-sans text-[11.5px] text-ink-muted/60">
//                           Scanned: {formatDate(ticket.scanned_at)} {formatTime(ticket.scanned_at)}
//                         </p>
//                       )}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </>
//           )}
//         </div>
//       </section>
//     </PageShell>
//   );
// }
