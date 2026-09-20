const BASE_URL = `https://${import.meta.env["VITE_SUPABASE_PROJECT_REF"]}.supabase.co/functions/v1`;
const ANON_KEY = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string;

function getSession(): string | null {
  return localStorage.getItem("pt.session");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getSession();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── 1. OTP auth ───────────────────────────────────────────────────────────────

export interface SendOtpResponse {
  message: string;
  otp_code?: string; // demo only — shown on screen
}

export async function sendOtp(phone: string): Promise<SendOtpResponse> {
  return request<SendOtpResponse>("/send-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export interface VerifyOtpUser {
  id: string;
  phone: string;
  role: "passenger" | "conductor" | "admin" | "officer";
  name?: string | null;
}

export interface VerifyOtpResponse {
  token: string;
  user: VerifyOtpUser;
}

export async function verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse> {
  return request<VerifyOtpResponse>("/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otp }),
  });
}

// ── 2. Tickets ────────────────────────────────────────────────────────────────

export interface Ticket {
  id: string;
  user_id: string;
  bus_id: string;
  bus_number: string;
  source: string;
  destination: string;
  fare: number;
  type: "paid" | "pink_card";
  status: "issued" | "scanned" | "expired";
  issued_at: string;
  qr_code?: string;
}

export interface BookTicketPayload {
  bus_id: string;
  source: string;
  destination: string;
}

export interface BookTicketResponse {
  success: boolean;
  ticket: Ticket;
}

export async function bookTicket(payload: BookTicketPayload): Promise<BookTicketResponse> {
  return request<BookTicketResponse>("/book-ticket", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface TicketHistoryItem {
  id: string;
  bus_number: string;
  source: string;
  destination: string;
  fare: number;
  type: "paid" | "pink_card";
  status: "issued" | "scanned" | "expired";
  issued_at: string;
}

export interface TicketHistoryResponse {
  success: boolean;
  tickets: TicketHistoryItem[];
}

export async function getTicketHistory(): Promise<TicketHistoryResponse> {
  return request<TicketHistoryResponse>("/ticket-history");
}

// ── 3. Pink Card application (officer-review workflow) ───────────────────────

export interface SubmitPinkCardApplicationPayload {
  full_name: string;
  phone: string;
  aadhaar: string;
  pan: string;
  state: string;
}

export interface SubmitPinkCardApplicationResponse {
  success: boolean;
  application_id: string;
  status: "submitted";
  message: string;
}

export async function submitPinkCardApplication(
  payload: SubmitPinkCardApplicationPayload,
): Promise<SubmitPinkCardApplicationResponse> {
  return request<SubmitPinkCardApplicationResponse>("/submit-pink-card-application", {
    method: "POST",
    body: JSON.stringify({ ...payload, pan: payload.pan.trim().toUpperCase() }),
  });
}

export type PinkCardReasonCode =
  | "ELIGIBLE_INCOME_GENDER"
  | "INELIGIBLE_GENDER"
  | "INELIGIBLE_INCOME_HIGH"
  | "INELIGIBLE_NO_RECORD";

export interface ApplicationStatusResponse {
  success: boolean;
  application_id: string;
  status: "submitted" | "eligible" | "not_eligible";
  message?: string;
  eligible?: boolean;
  pan?: string;
  gender?: string | null;
  annual_income?: number | null;
  threshold?: number;
  gap?: number | null;
  reason_code?: PinkCardReasonCode;
  reason_message?: string;
  decided_at?: string;
}

export async function getApplicationStatus(
  application_id: string,
): Promise<ApplicationStatusResponse> {
  const params = new URLSearchParams({ application_id });
  return request<ApplicationStatusResponse>(`/get-application-status?${params.toString()}`);
}

// ── 4. Service Portal — Verifying Officer ────────────────────────────────────

export interface OfficerApplication {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  aadhaar: string;
  pan: string;
  state: string;
  status: "submitted" | "eligible" | "not_eligible";
  source: "auto_match" | "manual" | null;
  eligible: boolean | null;
  gender: string | null;
  annual_income: number | null;
  threshold: number;
  gap: number | null;
  reason_code: PinkCardReasonCode | null;
  reason_message: string | null;
  manual_income: number | null;
  manual_reason: string | null;
  decided_by: string | null;
  decided_at: string | null;
  checked_at: string;
}

export interface OfficerListApplicationsResponse {
  success: boolean;
  count: number;
  applications: OfficerApplication[];
}

export async function officerListApplications(
  status?: "pending" | "checked",
): Promise<OfficerListApplicationsResponse> {
  const params = status ? `?status=${status}` : "";
  return request<OfficerListApplicationsResponse>(`/officer-list-applications${params}`);
}

export interface OfficerDecideApplicationPayload {
  application_id: string;
  decision: "approve" | "deny";
  manual_income?: number;
  manual_reason?: string;
}

export interface OfficerDecideApplicationResponse {
  success: boolean;
  application: OfficerApplication;
}

export async function officerDecideApplication(
  payload: OfficerDecideApplicationPayload,
): Promise<OfficerDecideApplicationResponse> {
  return request<OfficerDecideApplicationResponse>("/officer-decide-application", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── 5. Admin / analytics (existing) ─────────────────────────────────────────

export interface RouteRevenue {
  route: string;
  revenue: number;
  passenger_count: number;
}

export interface RevenueResponse {
  success: boolean;
  routes: RouteRevenue[];
}

export async function getRouteRevenue(): Promise<RevenueResponse> {
  return request<RevenueResponse>("/route-revenue");
}

//─── Pink Transit — API Client ───────────────────────────────────────────────

// const BASE = "https://welccusfyovxgpfplnlj.supabase.co/functions/v1";
// const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
// const TOKEN_KEY = "pt.session";

// // ── helpers ──────────────────────────────────────────────────────────────────

// function getToken(): string | null {
//   return window.localStorage.getItem(TOKEN_KEY);
// }

// async function request<T>(
//   path: string,
//   options: RequestInit & { auth?: "anon" | "user" } = {},
// ): Promise<T> {
//   const { auth = "user", ...init } = options;
//   const bearer = auth === "anon" ? ANON_KEY : (getToken() ?? ANON_KEY);

//   const res = await fetch(`${BASE}${path}`, {
//     ...init,
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${bearer}`,
//       ...init.headers,
//     },
//   });

//   const json = await res.json();
//   if (!res.ok) {
//     throw new Error(json?.error ?? `Request failed: ${res.status}`);
//   }
//   return json as T;
// }

// // ── 1. Send OTP ───────────────────────────────────────────────────────────────

// export interface SendOtpResponse {
//   success: boolean;
//   mock_sms: boolean;
//   message: string;
//   otp_code?: string; // only present in mock/demo mode
// }

// export async function sendOtp(phone: string): Promise<SendOtpResponse> {
//   return request<SendOtpResponse>("/send-otp", {
//     method: "POST",
//     auth: "anon",
//     body: JSON.stringify({ phone }),
//   });
// }

// // ── 2. Verify OTP ─────────────────────────────────────────────────────────────

// export interface VerifyOtpUser {
//   id: string;
//   phone: string;
//   name: string | null;
//   role: "passenger" | "conductor" | "admin";
//   created_at: string;
// }

// export interface VerifyOtpResponse {
//   success: boolean;
//   token: string;
//   user: VerifyOtpUser;
// }

// export async function verifyOtp(phone: string, otp_code: string): Promise<VerifyOtpResponse> {
//   return request<VerifyOtpResponse>("/verify-otp", {
//     method: "POST",
//     auth: "anon",
//     body: JSON.stringify({ phone, otp_code }),
//   });
// }

// // ── 3. Check Pink Card eligibility ───────────────────────────────────────────

// export interface PinkCardResponse {
//   success: boolean;
//   application_id: string;
//   pan: string;
//   eligible: boolean;
//   gender: string;
//   annual_income: number;
//   threshold: number;
//   gap: number;
//   reason_code:
//     | "ELIGIBLE_INCOME_GENDER"
//     | "INELIGIBLE_GENDER"
//     | "INELIGIBLE_INCOME_HIGH"
//     | "INELIGIBLE_NO_RECORD";
//   reason_message: string;
// }

// export async function checkPinkCard(pan: string): Promise<PinkCardResponse> {
//   return request<PinkCardResponse>("/check-pink-card", {
//     method: "POST",
//     body: JSON.stringify({ pan }),
//   });
// }

// // ── 4. Book Ticket ────────────────────────────────────────────────────────────

// export interface Stop {
//   name: string;
//   fare: number;
// }

// export interface Trip {
//   trip_id: string;
//   bus_number: string;
//   departure_time: string;
//   route_name: string;
//   origin: string;
//   destination: string;
//   base_fare: number;
//   stops: Stop[];
// }

// export interface BookTicketResponse {
//   success: boolean;
//   ticket: Ticket;
//   pink_card_applied: boolean;
//   payment_status: string;
//   mock_payment: boolean;
// }

// // ✅ UPDATED: now accepts fare so book-ticket uses the correct stop-based fare
// export async function bookTicket(trip_id: string, fare: number): Promise<BookTicketResponse> {
//   return request<BookTicketResponse>("/book-ticket", {
//     method: "POST",
//     body: JSON.stringify({ trip_id, fare }),
//   });
// }

// // ── 5. Scan Ticket (conductor only) ──────────────────────────────────────────

// export interface ScanTicketResponse {
//   success: boolean;
//   scan_result: "valid" | "already_used" | "expired" | "invalid";
//   valid: boolean;
//   reason: string;
//   ticket_id: string;
//   fare_charged: number;
// }

// export async function scanTicket(ticket_id: string, trip_id?: string): Promise<ScanTicketResponse> {
//   return request<ScanTicketResponse>("/scan-ticket", {
//     method: "POST",
//     body: JSON.stringify({ ticket_id, ...(trip_id ? { trip_id } : {}) }),
//   });
// }

// // ── 6. Admin Stats ────────────────────────────────────────────────────────────

// export interface RouteRevenue {
//   route_name: string;
//   revenue: number;
//   tickets_sold: number;
//   free_tickets: number;
// }

// export interface AdminStatsResponse {
//   success: boolean;
//   range: string;
//   total_revenue: number;
//   pink_card_discount_lost: number;
//   revenue_by_route: RouteRevenue[];
//   trip_count: number;
//   estimated_cost_per_trip: number;
//   estimated_cost: number;
//   net_estimate: number;
//   cost_note: string;
// }

// export async function getAdminStats(
//   range: "today" | "week" | "all" = "all",
// ): Promise<AdminStatsResponse> {
//   return request<AdminStatsResponse>(`/admin-stats?range=${range}`);
// }

// // ── 7. Search Trips ───────────────────────────────────────────────────────────

// export interface Trip {
//   trip_id: string;
//   bus_number: string;
//   departure_time: string;
//   route_name: string;
//   origin: string;
//   destination: string;
//   base_fare: number;
// }

// export interface SearchTripsResponse {
//   success: boolean;
//   count: number;
//   trips: Trip[];
// }

// export async function searchTrips(
//   origin?: string,
//   destination?: string,
//   date?: string,
// ): Promise<SearchTripsResponse> {
//   const params = new URLSearchParams();
//   if (origin) params.set("origin", origin);
//   if (date) params.set("date", date);
//   if (destination) params.set("destination", destination);
//   return request<SearchTripsResponse>(`/search-trips?${params.toString()}`, {
//     auth: "anon",
//   });
// }

// // ── 8. Ticket History ─────────────────────────────────────────────────────────

// export interface TicketHistoryItem {
//   ticket_id: string;
//   route_name: string;
//   origin: string;
//   destination: string;
//   bus_number: string;
//   departure_time: string;
//   fare_charged: number;
//   status: "issued" | "scanned" | "expired";
//   issued_at: string;
//   scanned_at: string | null;
// }

// export interface TicketHistoryResponse {
//   success: boolean;
//   count: number;
//   tickets: TicketHistoryItem[];
// }

// export async function getTicketHistory(): Promise<TicketHistoryResponse> {
//   return request<TicketHistoryResponse>("/ticket-history");
// }

// // ── 9. AI Chatbot ─────────────────────────────────────────────────────────────

// export interface ChatbotResponse {
//   response: string;
//   reason_code: string;
//   eligible: boolean;
// }

// export async function askChatbot(
//   message: string,
//   eligibility_context: object
// ): Promise<ChatbotResponse> {
//   const res = await fetch("https://bus-aiml.onrender.com/chatbot", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ message, eligibility_context }),
//   });
//   return res.json();
// }

// // ── 10. Demand Prediction ─────────────────────────────────────────────────────

// export interface DemandResponse {
//   route_id: string;
//   predicted_load: number;
//   is_peak_hour: boolean;
//   is_weekend: boolean;
//   confidence: number;
// }

// export async function predictDemand(
//   route_id: string,
//   time_of_day: string,
//   day_of_week: string
// ): Promise<DemandResponse> {
//   const res = await fetch("https://bus-aiml.onrender.com/predict-demand", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ route_id, time_of_day, day_of_week }),
//   });
//   return res.json();
// }

// // ── AI/ML Admin Summary ───────────────────────────────────────────────────────

// export interface RouteStats {
//   route_id: string;
//   avg_predicted_load: number;
//   peak_predicted_load: number;
//   recommended_buses: number;
//   estimated_daily_revenue: number;
//   estimated_daily_cost: number;
// }

// export interface AIAdminSummary {
//   total_routes: number;
//   total_estimated_revenue: number;
//   total_estimated_cost: number;
//   estimated_profit: number;
//   route_stats: RouteStats[];
// }

// export async function getAIAdminSummary(): Promise<AIAdminSummary> {
//   const res = await fetch("https://bus-aiml.onrender.com/admin/summary");
//   return res.json();
// }

// // ── Fetch all stops ───────────────────────────────────────────────────────────
// export async function fetchAllStops(): Promise<string[]> {
//   const res = await request<{ stops: string[] }>("/search-trips/stops", { auth: "anon" });
//   return res.stops;
// }

// // ── 11. Route Passengers (Admin) ──────────────────────────────────────────────

// export interface RoutePassenger {
//   ticket_id: string;
//   passenger_name: string;
//   passenger_phone: string;
//   origin: string;
//   destination: string;
//   bus_number: string;
//   departure_time: string | null;
//   issued_at: string;
//   scanned_at: string | null;
//   fare_charged: number;
//   is_pink_card: boolean;
//   status: string;
// }

// export interface RoutePassengersResponse {
//   success: boolean;
//   route_name: string;
//   range: string;
//   summary: {
//     total_revenue: number;
//     total_passengers: number;
//     pink_card_count: number;
//     paid_count: number;
//   };
//   passengers: RoutePassenger[];
// }

// export async function getRoutePassengers(
//   route_name: string,
//   range: "today" | "week" | "all" = "all",
// ): Promise<RoutePassengersResponse> {
//   const params = new URLSearchParams({ route_name, range });
//   return request<RoutePassengersResponse>(`/route-passengers?${params.toString()}`);
// }
