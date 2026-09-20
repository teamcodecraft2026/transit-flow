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

export async function verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse> {
  return request<VerifyOtpResponse>("/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otp }),
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
}

export async function getApplicationStatus(
  application_id: string,
): Promise<ApplicationStatusResponse> {
  const params = new URLSearchParams({ application_id });
  return request<ApplicationStatusResponse>(`/get-application-status?${params.toString()}`);
}

// 4. Service Portal

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

// 5. Admin / analytics

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

// v2
