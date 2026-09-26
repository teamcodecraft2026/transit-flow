const BASE_URL = "https://welccusfyovxgpfplnlj.supabase.co/functions/v1";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbGNjdXNmeW92eGdwZnBsbmxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MzE4MzgsImV4cCI6MjEwMzUwNzgzOH0.2kf_gcHn0bapWkWOLEbU1yF_5ancGjSxDn1LVMwcr54";

// Each role reads its own namespaced key — never share pt.session
function getSession(): string | null {
  return localStorage.getItem("pt.session");
}

function getOfficerSession(): string | null {
  return localStorage.getItem("pt.officerSession");
}

function getAdminSession(): string | null {
  return localStorage.getItem("pt.adminSession");
}

async function request<T>(path: string, init: RequestInit & { auth?: "anon" } = {}): Promise<T> {
  const token = getSession();
  const { auth, ...fetchInit } = init;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchInit,
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      ...(auth !== "anon" && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchInit.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// 1. OTP auth

export interface SendOtpResponse {
  message: string;
  otp_code?: string;
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

export async function verifyOtp(phone: string, otp_code: string): Promise<VerifyOtpResponse> {
  return request<VerifyOtpResponse>("/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otp_code }),
  });
}

// 2. Tickets

export interface Ticket {
  id: string;
  user_id: string;
  bus_id: string;
  bus_number: string;
  source: string;
  destination: string;
  fare: number;
  fare_charged: number;
  type: "paid" | "pink_card";
  status: "issued" | "scanned" | "expired";
  issued_at: string;
  qr_code?: string;
  qr_payload: string;
}

export interface BookTicketPayload {
  trip_id: string;
  fare: number;
}

export interface BookTicketResponse {
  success: boolean;
  ticket: Ticket;
  pink_card_applied: boolean;
  payment_status?: string;
  mock_payment?: boolean;
}

export async function bookTicket(trip_id: string, fare: number): Promise<BookTicketResponse> {
  return request<BookTicketResponse>("/book-ticket", {
    method: "POST",
    body: JSON.stringify({ trip_id, fare }),
  });
}

export interface TicketHistoryItem {
  ticket_id: string;
  route_name: string;
  origin: string;
  destination: string;
  bus_number: string;
  departure_time: string;
  fare_charged: number;
  status: "issued" | "scanned" | "expired";
  issued_at: string;
  scanned_at: string | null;
}

export interface TicketHistoryResponse {
  success: boolean;
  count: number;
  tickets: TicketHistoryItem[];
}

export async function getTicketHistory(): Promise<TicketHistoryResponse> {
  return request<TicketHistoryResponse>("/ticket-history");
}

// 3. Pink Card application

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
  manual_income?: number | null;
  manual_reason?: string | null;
  is_officer_override?: boolean;
  override_reason?: string | null;
}

export async function getApplicationStatus(
  application_id: string,
): Promise<ApplicationStatusResponse> {
  const params = new URLSearchParams({ application_id });
  return request<ApplicationStatusResponse>(`/get-application-status?${params.toString()}`);
}

// 4. Service Portal — uses pt.officerSession directly
//
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
  manual_gender: string | null;
  manual_income: number | null;
  manual_reason: string | null;
  override_reason: string | null;
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
  const token = getOfficerSession();
  return request<OfficerListApplicationsResponse>(`/officer-list-applications${params}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export interface OfficerDecideApplicationPayload {
  application_id: string;
  decision: "approve" | "deny";
  manual_gender?: "Male" | "Female";
  manual_income?: number;
  manual_reason?: string;
  override_reason?: string;
  override_reason_custom?: string;
}

export interface OfficerDecideApplicationResponse {
  success: boolean;
  application: OfficerApplication;
}

export async function officerDecideApplication(
  payload: OfficerDecideApplicationPayload,
): Promise<OfficerDecideApplicationResponse> {
  const token = getOfficerSession();
  return request<OfficerDecideApplicationResponse>("/officer-decide-application", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// 5. Admin stats — uses pt.adminSession directly

export interface RouteRevenue {
  route_name: string;
  revenue: number;
  tickets_sold: number;
  free_tickets: number;
}

export interface AdminStatsResponse {
  success: boolean;
  range: string;
  total_revenue: number;
  pink_card_discount_lost: number;
  revenue_by_route: RouteRevenue[];
  trip_count: number;
  estimated_cost_per_trip: number;
  estimated_cost: number;
  net_estimate: number;
  cost_note: string;
}

export async function getAdminStats(
  range: "today" | "week" | "all" = "all",
): Promise<AdminStatsResponse> {
  const token = getAdminSession();
  return request<AdminStatsResponse>(`/admin-stats?range=${range}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// 6. Route passengers — uses pt.adminSession directly

export interface RoutePassenger {
  ticket_id: string;
  passenger_name: string;
  passenger_phone: string;
  origin: string;
  destination: string;
  bus_number: string;
  fare_charged: number;
  is_pink_card: boolean;
  status: "issued" | "scanned" | "expired";
  issued_at: string;
  departure_time: string | null;
}

export interface RoutePassengersResponse {
  success: boolean;
  route: string;
  count: number;
  passengers: RoutePassenger[];
  summary: {
    total_revenue: number;
    total_passengers: number;
    pink_card_count: number;
    paid_count: number;
  };
}

export async function getRoutePassengers(
  route: string,
  range: "today" | "week" | "all" = "all",
): Promise<RoutePassengersResponse> {
  const params = new URLSearchParams({ route, range });
  const token = getAdminSession();
  return request<RoutePassengersResponse>(`/route-passengers?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// 7. Search trips

export interface Trip {
  trip_id: string;
  bus_number: string;
  departure_time: string;
  route_name: string;
  origin: string;
  destination: string;
  base_fare: number;
}

export interface SearchTripsResponse {
  success: boolean;
  count: number;
  trips: Trip[];
}

export async function searchTrips(
  origin?: string,
  destination?: string,
  date?: string,
): Promise<SearchTripsResponse> {
  const params = new URLSearchParams();
  if (origin) params.set("origin", origin);
  if (destination) params.set("destination", destination);
  if (date) params.set("date", date);
  return request<SearchTripsResponse>(`/search-trips?${params.toString()}`, { auth: "anon" });
}

// 8. Fetch all stops

export interface StopsResponse {
  success: boolean;
  stops: string[];
}

export async function fetchAllStops(): Promise<StopsResponse> {
  try {
    return await request<StopsResponse>("/fetch-stops", { auth: "anon" });
  } catch {
    const res = await request<SearchTripsResponse>("/search-trips", { auth: "anon" });
    const seen = new Set<string>();
    res.trips.forEach((t) => {
      seen.add(t.origin);
      seen.add(t.destination);
    });
    return { success: true, stops: Array.from(seen).sort() };
  }
}

// 9. AI chatbot

export interface ChatbotResponse {
  response: string;
  reason_code: string;
  eligible: boolean;
}

export async function askChatbot(
  message: string,
  eligibility_context: object,
): Promise<ChatbotResponse> {
  const res = await fetch("https://bus-aiml.onrender.com/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, eligibility_context }),
  });
  return res.json();
}

// 10. Demand prediction

export interface DemandResponse {
  route_id: string;
  predicted_load: number;
  is_peak_hour: boolean;
  is_weekend: boolean;
  confidence: number;
}

export async function predictDemand(
  route_id: string,
  time_of_day: string,
  day_of_week: string,
): Promise<DemandResponse> {
  const res = await fetch("https://bus-aiml.onrender.com/predict-demand", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ route_id, time_of_day, day_of_week }),
  });
  return res.json();
}

// 11. AI admin summary

export interface RouteStats {
  route_id: string;
  avg_predicted_load: number;
  peak_predicted_load: number;
  recommended_buses: number;
  estimated_daily_revenue: number;
  estimated_daily_cost: number;
}

export interface AIAdminSummary {
  total_routes: number;
  total_estimated_revenue: number;
  total_estimated_cost: number;
  estimated_profit: number;
  route_stats: RouteStats[];
}

export async function getAIAdminSummary(): Promise<AIAdminSummary> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const res = await fetch("https://bus-aiml.onrender.com/admin/summary", {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res.json();
    } catch {
      if (attempt === 3) throw new Error("AI Forecast unavailable — Render is waking up, please refresh in a minute.");
    }
  }
  throw new Error("AI Forecast unavailable.");
}
// 12. Scan ticket (conductor)

export interface ScanTicketResponse {
  success: boolean;
  message: string;
  ticket_id: string;
  status: string;
  scan_result: "valid" | "already_used" | "expired" | "invalid";
  valid: boolean;
  reason: string;
  fare_charged: number;
}

export async function scanTicket(ticket_id: string): Promise<ScanTicketResponse> {
  return request<ScanTicketResponse>("/scan-ticket", {
    method: "POST",
    body: JSON.stringify({ ticket_id }),
  });
}
