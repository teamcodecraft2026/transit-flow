# Transit Flow — SmartBus Public Transit Platform

<div align="center">


**A full-stack, AI-powered public bus ticketing system with zero-fare Pink Card support for women**

[![Deployed on Cloudflare](https://img.shields.io/badge/Frontend-Cloudflare%20Workers-orange?style=flat-square&logo=cloudflare)](https://pink-card-transit.teamcodecraft.workers.dev)
[![Backend on Supabase](https://img.shields.io/badge/Backend-Supabase-green?style=flat-square&logo=supabase)](https://supabase.com)
[![AI/ML on Render](https://img.shields.io/badge/AI%2FML-Render.com-blue?style=flat-square)](https://bus-aiml.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

> **Academic Submission**
> **Event:** AI — UNLEASHED 2026
> **Institution:** Techno India University
> **Team:** CodeCraft 2026
> **Team Members:** Sayan Ghosh · Archisman Saha · Samanwita Mandal · Aditya Bikram Dhar · Mousumi Mandal

---

##  Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Tech Stack & Libraries](#-tech-stack--libraries)
4. [System Architecture](#-system-architecture)
5. [Getting Started](#-getting-started)
6. [How to Use the Application](#-how-to-use-the-application)
7. [API Reference](#-api-reference)
8. [AI/ML Module](#-aiml-module)
9. [QR Code System](#-qr-code-system)
10. [Database Schema](#-database-schema)
11. [Known Limitations & Future Scope](#-known-limitations--future-scope)
12. [References & Acknowledgements](#-references--acknowledgements)

---

##  Project Overview

Transit Flow is a **full-stack, production-deployed public bus ticketing platform** built for the state of West Bengal, India. It digitises the entire bus journey — from route discovery and ticket booking to conductor-side QR validation — while embedding an AI-powered demand forecasting engine and a government-linked zero-fare scheme for eligible women.

### The Problem

Public bus ticketing in India remains overwhelmingly paper-based and cash-dependent. Conductors manually issue tickets, revenue leaks are common, and there is no digital mechanism to enforce or verify government subsidy schemes such as free travel for economically disadvantaged women. Passengers have no way to search routes, book ahead, or carry a verifiable ticket on their phone.

### What We Built

Transit Flow solves this end-to-end:

- **Passengers** can search bus routes, book tickets, receive a real QR code, and board using their phone — with zero-fare automatically applied if they hold a verified Pink Card.
- **Conductors** log in via OTP on their phone, open the camera-based QR scanner, and validate passenger tickets in real time — with instant visual feedback for valid, already-used, expired, or fraudulent tickets.
- **Administrators** view a live analytics dashboard showing revenue, Pink Card subsidy cost, route-wise performance, and an AI-generated demand forecast powered by a trained scikit-learn model.
- **The Pink Card system** verifies women's eligibility for zero-fare travel using PAN-linked income data, mirroring real government subsidy frameworks.

The platform is **fully deployed and publicly accessible**, bilingual (English and Bengali), and built with a modern serverless architecture that scales without infrastructure overhead.

### Live Deployment

| Service | URL |
|---------|-----|
| Frontend (Passenger Portal) | https://pink-card-transit.teamcodecraft.workers.dev |
| Backend (Supabase Edge Functions) | https://welccusfyovxgpfplnlj.supabase.co/functions/v1 |
| AI/ML API | https://bus-aiml.onrender.com |

---

##  Key Features

###  Passenger Portal
- **OTP-based phone authentication** — no passwords, no email, login via 6-digit SMS OTP
- **Route search** — search trips by origin and destination against live Supabase data
- **Ticket booking** — one-tap booking with instant fare calculation
- **Real QR ticket generation** — QR codes generated locally in the browser using `qrcode` library (no external API calls, fully offline-capable)
- **Click-to-enlarge QR modal** — passengers can expand their ticket QR for easy scanning
- **My Trips dashboard** — view all upcoming and past tickets with live status (Issued / Scanned / Expired)
- **Pink Card zero-fare** — eligible passengers are automatically charged ₹0 at booking

###  Pink Card System
- **4-step eligibility application** — Aadhaar details, PAN details, residency proof, review
- **PAN-linked income verification** — backend checks income record against threshold (₹2,50,000/year)
- **Three-factor eligibility check** — gender (female), state residency, and income threshold
- **Persistent result storage** — eligibility result saved locally so "Check Status" shows immediately on return
- **Detailed rejection reasons** — users see exactly why they were rejected with guidance

###  Conductor Portal
- **Separate conductor login** — role-based OTP auth, only users with `role = conductor` in database can access
- **Camera-based QR scanning** — uses `html5-qrcode` to open the phone's rear camera and decode QR codes in real time
- **Manual ticket ID fallback** — conductors can paste/type the full ticket UUID if camera is unavailable
- **Instant validation feedback** — green (Valid), amber (Already Scanned), red (Expired/Invalid) result cards
- **Pink Card detection** — scan result shows " Pink Card — Free Travel" for zero-fare tickets
- **Recent scans log** — live session history of all scans with timestamps

###  Admin Dashboard
- **Separate admin login** — `role = admin` OTP authentication
- **Live revenue analytics** — total revenue, Pink Card discount cost, net estimate
- **Route-wise breakdown table** — per-route revenue, tickets sold, free tickets, paid percentage bar
- **Date range filtering** — Today / This Week / All Time
- **AI Demand Forecast section** — powered by the ML backend, shows predicted passenger load, recommended buses per route, and estimated daily revenue/cost

###  AI/ML Features
- **Gemini-powered chatbot** — floating assistant on all passenger pages, answers transit queries in English or Bengali
- **Demand prediction model** — scikit-learn regression model predicts passenger load per route based on time, day, and historical data
- **Fleet recommendation engine** — calculates how many buses each route needs based on predicted demand
- **Admin forecast summary** — aggregated AI output showing estimated profit/loss across all routes

###  Additional Features
- **Bilingual UI** — full English and Bengali (বাংলা) translation across all pages
- **Responsive design** — works on mobile, tablet, and desktop
- **Parallax hero animations** — smooth scroll-based parallax on landing pages
- **Clip-path reveal animations** — cinematic section reveals on scroll using IntersectionObserver
- **Serverless architecture** — zero server maintenance; scales automatically

---

##  Tech Stack & Libraries

### Frontend

| Technology | Library / Tool | Version | Purpose |
|-----------|---------------|---------|---------|
| Language | TypeScript | 5.x | Type-safe JavaScript for all frontend code |
| UI Framework | React | 19.x | Component-based UI rendering |
| Styling | TailwindCSS | v4 | Utility-first CSS framework |
| Routing | TanStack Router | Latest | File-based type-safe client-side routing |
| Build Tool | Vite | Latest | Fast frontend bundler and dev server |
| Runtime | Bun | 1.2.15 | JavaScript runtime and package manager |
| QR Generation | qrcode | 1.5.4 | Generates real QR codes on `<canvas>` — fully offline, no external calls |
| QR Types | @types/qrcode | 1.5.6 | TypeScript type definitions for qrcode library |
| QR Scanning | html5-qrcode | 2.3.8 | Opens phone camera and decodes QR codes in real time (MIT licensed) |
| Icons | lucide-react | 0.383.0 | SVG icon library |

### Backend (Supabase)

| Technology | Library / Tool | Purpose |
|-----------|---------------|---------|
| Database | PostgreSQL (via Supabase) | Relational database for users, trips, tickets, Pink Card applications |
| Edge Functions | Deno (TypeScript) | Serverless functions running at the edge |
| Authentication | Custom OTP via Supabase DB | Phone-based OTP authentication with JWT tokens |
| Hosting | Supabase Cloud | Managed PostgreSQL + Edge Function hosting |

### AI/ML Backend

| Technology | Library / Tool | Version | Purpose |
|-----------|---------------|---------|---------|
| Language | Python | 3.11+ | Core language for AI/ML service |
| Framework | FastAPI | Latest | REST API framework for ML endpoints |
| Server | uvicorn | Latest | ASGI server to run FastAPI |
| LLM | google-generativeai | Latest | Google Gemini API — powers the chatbot |
| ML Model | scikit-learn | Latest | Trains and serves the demand prediction model |
| Numerics | numpy | Latest | Numerical computations and array operations |
| Data Processing | pandas | Latest | Data manipulation and preprocessing |
| Model Persistence | joblib | Latest | Saves and loads the trained `model.pkl` |
| Environment | python-dotenv | Latest | Loads API keys from `.env` file |
| Validation | pydantic | Latest | Request/response schema validation |
| CORS | fastapi.middleware.cors | Built-in | Allows frontend domain to call AI/ML API |

### Infrastructure & Deployment

| Service | Purpose |
|---------|---------|
| Cloudflare Workers | Frontend hosting and global CDN |
| GitHub Actions (via Cloudflare Pages CI) | Automatic deploy on `git push` |
| Supabase Cloud | Backend Edge Functions + PostgreSQL |
| Render.com | AI/ML FastAPI service hosting |

---

##  System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER DEVICES                          │
│  Passenger (Mobile/Desktop)  │  Conductor (Mobile)  │ Admin  │
└──────────────┬───────────────┴──────────┬───────────┴───┬───┘
               │                          │               │
               ▼                          ▼               ▼
┌──────────────────────────────────────────────────────────────┐
│           CLOUDFLARE WORKERS — Frontend (React + Vite)        │
│  /home  /book  /trips  /pink-card  /conductor  /admin         │
│  QR Generation (qrcode)  │  QR Scanning (html5-qrcode)        │
└───────────────────────┬──────────────────────────────────────┘
                        │  HTTPS API Calls
          ┌─────────────┴──────────────┐
          ▼                            ▼
┌─────────────────────┐    ┌──────────────────────────┐
│  SUPABASE EDGE      │    │  AI/ML FASTAPI SERVICE   │
│  FUNCTIONS (Deno)   │    │  (Python on Render.com)  │
│                     │    │                          │
│  /send-otp          │    │  /chatbot (Gemini)       │
│  /verify-otp        │    │  /predict-demand (ML)    │
│  /search-trips      │    │  /fleet-recommendation   │
│  /book-ticket       │    │  /admin/summary          │
│  /scan-ticket       │    │  /health                 │
│  /check-pink-card   │    └──────────────────────────┘
│  /ticket-history    │
│  /admin-stats       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  SUPABASE           │
│  POSTGRESQL DB      │
│                     │
│  users              │
│  trips              │
│  tickets            │
│  pink_card_apps     │
│  otp_codes          │
└─────────────────────┘
```

### Authentication Flow

```
Passenger/Conductor/Admin
        │
        │  Enter Phone Number
        ▼
  POST /send-otp
        │
        │  OTP stored in DB (5 min expiry)
        │  OTP returned in response (mock SMS for demo)
        ▼
  POST /verify-otp
        │
        │  OTP matched → JWT issued (contains user_id + role)
        ▼
  JWT stored in localStorage
        │
        │  Attached as Authorization: Bearer <token>
        ▼
  All protected API calls authenticated
```

### Ticket Booking & Scanning Flow

```
Passenger                    Backend                   Conductor
    │                            │                          │
    │── POST /book-ticket ──────►│                          │
    │                            │ Check pink_card_apps     │
    │                            │ Calculate fare (₹0/₹X)  │
    │                            │ Create ticket record     │
    │◄── ticket + qr_payload ───│                          │
    │                            │                          │
    │ Generate QR locally        │                          │
    │ (qrcode library, canvas)   │                          │
    │                            │                          │
    │ [Boards bus, shows QR]     │                          │
    │                            │                          │
    │                            │◄── POST /scan-ticket ───│
    │                            │    (ticket_id in body)  │
    │                            │                          │
    │                            │ Validate ticket status  │
    │                            │ Mark as scanned         │
    │                            │──► scan result ────────►│
    │                            │    (valid/used/expired) │
```

---

##  Getting Started

### Prerequisites

Before running this project locally, ensure you have the following installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18+ | https://nodejs.org |
| Bun | 1.2.15+ | https://bun.sh |
| Git | Latest | https://git-scm.com |
| Python | 3.11+ | https://python.org (for AI/ML module only) |

You also need accounts on:
- [Supabase](https://supabase.com) — for the backend database and edge functions
- [Cloudflare](https://cloudflare.com) — for frontend deployment
- [Google AI Studio](https://makersuite.google.com) — for Gemini API key (AI/ML module)

---

### 1. Clone the Repository

```bash
# Clone the frontend repository
git clone https://github.com/teamcodecraft2026/transit-flow.git
cd transit-flow
```

---

### 2. Install Frontend Dependencies

```bash
# Install all dependencies using Bun
bun install
```

This installs all packages defined in `package.json`, including:
- React, TailwindCSS, TanStack Router
- `qrcode@1.5.4` — local QR generation
- `@types/qrcode@1.5.6` — TypeScript types
- `html5-qrcode@2.3.8` — camera-based QR scanning

---

### 3. Configure Environment Variables

Create a `.env` file in the root of the `transit-flow` directory:

```env
VITE_SUPABASE_URL=https://welccusfyovxgpfplnlj.supabase.co/functions/v1
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

>  **Note:** The Supabase anon key is a public key designed to be used in browser code. It is safe to include in frontend environment variables.

---

### 4. Run the Frontend Locally

```bash
# Start the development server
bun run dev
```

The application will be available at `http://localhost:5173`

---

### 5. Set Up the AI/ML Backend (Optional)

```bash
# Clone the AI/ML repository
git clone https://github.com/teamcodecraft2026/bus-aiml.git
cd bus-aiml

# Create and activate a virtual environment
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
echo "GEMINI_API_KEY=your_google_gemini_api_key_here" > .env

# Start the FastAPI server
uvicorn main:app --reload
```

The AI/ML API will be available at `http://localhost:8000`

>  The live AI/ML API is already deployed at `https://bus-aiml.onrender.com` — local setup is only needed for development.

---

### 6. Deploy to Cloudflare Workers

```bash
# Build the frontend for production
bun run build

# Deploy to Cloudflare Workers
bunx wrangler deploy
```

Or simply push to GitHub — Cloudflare automatically deploys on every push to the `main` branch.

---

##  How to Use the Application

###  As a Passenger

#### Step 1 — Visit the Application
Navigate to `https://pink-card-transit.teamcodecraft.workers.dev` in any browser (mobile or desktop).


#### Step 2 — Log In
Click **Login** in the top-right navigation bar.

- Enter your 10-digit Indian phone number (starting with 6, 7, 8, or 9)
- Click **Send OTP**
- A yellow demo banner will appear on screen showing the OTP (since SMS is mocked for demo)
- Enter the 6-digit OTP in the boxes
- Click **Verify**

You are now logged in. Your name and a **Logout** button appear in the navbar.


#### Step 3 — Book a Ticket
Navigate to **Book** from the navbar.

- Enter an origin (e.g., `Howrah`) in the **From** field
- Enter a destination (e.g., `Salt Lake`) in the **To** field
- Click **Search**
- A list of available bus trips appears with route name, bus number, departure time, and fare
- Click **Select** on any trip
- A booking success modal appears with:
  - A green ✅ checkmark
  - A real QR code generated locally in your browser
  - Ticket ID, fare charged, status, and issue time
  - If you hold a Pink Card: a pink banner showing **"Pink Card Applied — ₹0 Fare"**


#### Step 4 — View Your Trips
Navigate to **My Trips** from the navbar.

- **Upcoming** tab shows tickets with status `ISSUED` — includes the QR code to show when boarding
- **Past** tab shows tickets with status `SCANNED` or `EXPIRED`
- Click any QR code to enlarge it in a full-screen modal for easy scanning


---

###  Applying for the Pink Card

#### Step 1 — Navigate to Pink Card
Click **Pink Card** in the navbar, then click **Apply Now**.

#### Step 2 — Complete 4-Step Verification

| Step | What to Fill |
|------|-------------|
| 1 — Aadhaar Details | Full name, phone number, 12-digit Aadhaar number, upload Aadhaar image |
| 2 — PAN Details | 10-character PAN number, upload PAN card image |
| 3 — Residency Proof | Select your state, upload residency certificate |
| 4 — Review | Review all details, click **Submit Application** |

**Test PAN numbers for demo:**

| PAN | Expected Result |
|-----|----------------|
| `ABCDE1234F` | ✅ Eligible — female, income below threshold |
| `IJKLM9012N` | ❌ Ineligible — income too high |
| `NOPQR4567S` | ❌ Ineligible — male applicant |

#### Step 3 — View Result
- If **eligible**: Green screen with Pink Card active confirmation + "Book a Free Ticket →" button
- If **ineligible**: Red screen with specific reason and guidance


#### Checking Status Later
Click **Check Status** on the Pink Card page — if you have already applied, your result appears immediately without re-submitting.

---

###  As a Conductor

#### Step 1 — Navigate to Conductor Portal
Go to `/conductor` route or find the Conductor link.

#### Step 2 — Log In
- Enter any Conductor ID (e.g., `COND001`) — this is a UI field, not verified by backend
- Enter the conductor's registered phone number: **`9999999999`**
- Click **Send OTP** — the OTP appears in a yellow banner immediately
- Enter the OTP and click **Verify**

>  Only phone numbers with `role = conductor` in the database can access the dashboard.

#### Step 3 — Scan a Passenger Ticket

**Option A — Camera Scan (recommended on mobile):**
- Click the large blue **Scan QR** card
- Your phone camera opens automatically
- Point it at the passenger's QR code on their phone
- Result appears instantly

**Option B — Manual Entry (fallback):**
- Click the Scan button
- Paste or type the full ticket UUID (e.g., `069f8e72-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- Click **Validate Ticket**

#### Step 4 — Read the Result

| Result | Colour | Meaning |
|--------|--------|---------|
| ✅ Verified | Green | Valid ticket — passenger boards |
| 🔁 Already Scanned | Amber | Ticket already used — possible fraud |
| ⚠️ Expired | Red | Ticket past validity window |
| ❌ Invalid | Red | Ticket not found in database |


---

###  As an Administrator

#### Step 1 — Navigate to Admin Portal
Go to `/admin` route.

#### Step 2 — Log In
- Enter phone number: **`9888888888`**
- Enter the OTP shown in the yellow banner
- Click **Verify & Enter**

#### Step 3 — View Analytics

The dashboard shows:

| KPI Card | What it Shows |
|----------|--------------|
| Total Revenue | Sum of all fares collected |
| Tickets Sold | Total tickets issued (with free ticket count) |
| Pink Card Discount | Total government subsidy applied |
| Total Trips | Number of bus trips operated |

Use the **Today / This Week / All Time** toggle to filter data by date range.

The **Revenue by Route** table shows per-route performance with a visual paid-percentage bar.

The **AI Demand Forecast** section (powered by the ML backend) shows:
- Predicted average and peak passenger load per route
- Recommended number of buses
- Estimated daily revenue and cost

---

##  API Reference

All backend endpoints are Supabase Edge Functions deployed at:
`https://welccusfyovxgpfplnlj.supabase.co/functions/v1/`

| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| `POST` | `/send-otp` | No (anon key) | Sends OTP to phone number |
| `POST` | `/verify-otp` | No (anon key) | Verifies OTP, returns JWT + user role |
| `GET` | `/search-trips` | No (anon key) | Search trips by origin/destination |
| `POST` | `/book-ticket` | Yes (JWT) | Books a ticket, applies Pink Card if eligible |
| `POST` | `/scan-ticket` | Yes (conductor JWT) | Validates and marks a ticket as scanned |
| `POST` | `/check-pink-card` | Yes (JWT) | Checks PAN eligibility for Pink Card |
| `GET` | `/ticket-history` | Yes (JWT) | Returns all tickets for logged-in user |
| `GET` | `/admin-stats` | Yes (admin JWT) | Returns revenue and booking analytics |

### Example: Book a Ticket

**Request:**
```bash
POST /book-ticket
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "trip_id": "uuid-of-the-trip"
}
```

**Response:**
```json
{
  "success": true,
  "ticket": {
    "id": "069f8e72-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "trip_id": "...",
    "fare_charged": 0,
    "qr_payload": "069f8e72-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "status": "issued",
    "issued_at": "2026-09-09T11:05:00Z"
  },
  "pink_card_applied": true,
  "payment_status": "success",
  "mock_payment": true
}
```

---

##  AI/ML Module

The AI/ML backend is a standalone FastAPI service deployed on Render.com.

**Live URL:** `https://bus-aiml.onrender.com`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check — confirms service is running |
| `POST` | `/chatbot` | AI chatbot powered by Google Gemini 1.5 Flash |
| `POST` | `/predict-demand` | ML model predicts passenger demand for a route |
| `GET` | `/fleet-recommendation` | Recommends bus count per route based on predicted load |
| `GET` | `/admin/summary` | Aggregated ML forecast consumed by admin dashboard |

### Demand Prediction Model

The ML model is trained using **scikit-learn** on historical passenger load data:

- **Type:** Supervised regression model
- **Saved as:** `model.pkl` (serialised with `joblib`)
- **Input features:** Route ID, time of day, day of week, historical average load
- **Output:** Predicted passenger load per route

**Sample `/admin/summary` response:**
```json
{
  "total_estimated_revenue": 66582,
  "total_estimated_cost": 18000,
  "estimated_profit": 48582,
  "route_stats": [
    {
      "route_id": "R1",
      "avg_predicted_load": 62.83,
      "peak_predicted_load": 86.56,
      "recommended_buses": 3,
      "estimated_daily_revenue": 22618.80,
      "estimated_daily_cost": 6000
    }
  ]
}
```

### Chatbot

- **Model:** `gemini-1.5-flash`
- **Library:** `google-generativeai`
- **Integration:** Floating chat widget on all passenger pages
- **Languages:** Responds in English or Bengali based on user input
- **Context:** System-prompted with SmartBus app context for accurate transit answers

### AI/ML File Structure

```
bus-aiml/
├── main.py              # FastAPI app — all endpoints defined here
├── model.pkl            # Trained scikit-learn demand prediction model
├── train_model.py       # Script used to train and serialise the model
├── requirements.txt     # All Python dependencies
├── .env                 # GEMINI_API_KEY (not committed to git)
└── README.md
```

---

##  QR Code System

### Problem with the Previous Approach

The app initially used `api.qrserver.com` — an external third-party API — to generate QR images. This introduced three critical issues:

1. **Privacy risk** — ticket IDs were being sent to a third-party server
2. **Rate limiting** — the external API imposes strict request limits
3. **Offline fragility** — QR codes failed to render without an internet connection

### What We Built Instead

We replaced the external service with a fully local, privacy-safe QR system:

#### QR Generation — `qrcode@1.5.4`

- Generates real, scannable QR codes directly on an HTML `<canvas>` element
- **Zero external calls** — works fully offline
- **Zero cost** — no API keys, no rate limits
- Used in: `src/components/QrCodeImage.tsx`, `src/routes/book.tsx`, `src/routes/trips.tsx`

#### QR Scanning — `html5-qrcode@2.3.8`

- Opens the device's **rear camera** using the browser's `getUserMedia` API
- Decodes QR codes in real time using `requestAnimationFrame`
- **MIT licensed** — no API key, no backend, no cost
- Falls back gracefully to manual ticket ID entry if camera permission is denied
- Used in: `src/components/QrScanner.tsx`, `src/routes/conductor.tsx`

### New Components

| File | Purpose |
|------|---------|
| `src/components/QrCodeImage.tsx` | Reusable QR generator — renders QR to canvas from any string payload |
| `src/components/QrScanner.tsx` | Reusable camera scanner — opens rear camera, emits decoded string |

### Modified Files

| File | Change Made |
|------|------------|
| `src/routes/book.tsx` | Replaced `<img src="api.qrserver.com/...">` with `<QrCodeImage payload={ticket.qr_payload} />` |
| `src/routes/trips.tsx` | Replaced external QR image, added click-to-enlarge modal |
| `src/routes/conductor.tsx` | Added `CameraScanPanel` component with `html5-qrcode` integration and manual fallback |

---

## 🗄 Database Schema

The PostgreSQL database on Supabase contains the following core tables:

```sql
-- Users table (passengers, conductors, admins)
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       TEXT UNIQUE NOT NULL,
  name        TEXT,
  role        TEXT NOT NULL DEFAULT 'passenger', -- 'passenger' | 'conductor' | 'admin'
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Bus routes
CREATE TABLE routes (
  route_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name  TEXT NOT NULL,
  origin      TEXT NOT NULL,
  destination TEXT NOT NULL
);

-- Individual bus trips
CREATE TABLE trips (
  trip_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id        UUID REFERENCES routes(route_id),
  bus_number      TEXT NOT NULL,
  departure_time  TIMESTAMPTZ NOT NULL,
  base_fare       INTEGER NOT NULL
);

-- Tickets issued to passengers
CREATE TABLE tickets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id),
  trip_id      UUID REFERENCES trips(trip_id),
  fare_charged INTEGER NOT NULL,
  qr_payload   TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'issued', -- 'issued' | 'scanned' | 'expired'
  issued_at    TIMESTAMPTZ DEFAULT now(),
  scanned_at   TIMESTAMPTZ
);

-- Pink Card eligibility applications
CREATE TABLE pink_card_applications (
  application_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  pan             TEXT NOT NULL,
  eligible        BOOLEAN NOT NULL,
  gender          TEXT,
  annual_income   INTEGER,
  reason_code     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- OTP codes for authentication
CREATE TABLE otp_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       TEXT NOT NULL,
  otp_code    TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN DEFAULT false
);
```

---

##  Known Limitations & Future Scope

### Current Limitations

| Limitation | Details |
|-----------|---------|
| **Mock SMS** | OTP is returned in the API response instead of being sent via SMS. In production, this would use Twilio, MSG91, or AWS SNS. |
| **Mock Payment** | Ticket booking marks payment as successful without integrating a real payment gateway. Production would use Razorpay or PhonePe. |
| **Seed PAN data only** | The Pink Card income check uses a small set of seeded PAN records. A real deployment would integrate with Income Tax Department APIs. |
| **No Aadhaar OCR** | The 4-step Pink Card form accepts file uploads but does not perform OCR or verify Aadhaar data. |
| **ML model trained on synthetic data** | The demand prediction model is trained on generated data. Real deployment requires historical WBTC ridership data. |
| **Session persistence** | JWT tokens are stored in `localStorage`. A production system would use secure `httpOnly` cookies. |
| **Single state coverage** | The app is seeded with West Bengal routes only. Expanding requires adding routes, buses, and state-specific income thresholds for other states. |

### Future Scope

| Feature | Description |
|---------|------------|
| **Real SMS OTP** | Integrate MSG91 or Twilio for actual SMS delivery |
| **Payment gateway** | Razorpay / UPI integration for real fare collection |
| **Aadhaar eKYC** | DigiLocker API integration for verified Aadhaar data |
| **Real-time bus tracking** | GPS integration showing live bus location on map |
| **Push notifications** | Notify passengers when bus is approaching their stop |
| **Offline PWA mode** | Service workers for full offline ticket access |
| **Multi-state expansion** | Support for all Indian states with state-specific Pink Card income thresholds |
| **Conductor mobile app** | Dedicated Android app for conductors with better camera access |
| **WBTC data integration** | Live route and schedule data from West Bengal Transport Corporation |
| **Federated ML model** | Train demand model on real ridership data from WBTC |
| **Analytics export** | Admin dashboard CSV/PDF export for government reporting |

---

##  References & Acknowledgements

### Government Schemes

- West Bengal Free Bus Pass Scheme for Women — policy reference for Pink Card design & income eligibility framework reference
- Income Tax Department of India — PAN-linked income verification concept

### Libraries & Frameworks

- [React](https://react.dev) — UI framework
- [TanStack Router](https://tanstack.com/router) — type-safe routing
- [TailwindCSS v4](https://tailwindcss.com) — utility-first CSS
- [Supabase](https://supabase.com) — open source Firebase alternative
- [qrcode](https://github.com/soldair/node-qrcode) — MIT licensed QR generation
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) — MIT licensed camera QR scanning
- [FastAPI](https://fastapi.tiangolo.com) — Python REST API framework
- [scikit-learn](https://scikit-learn.org) — ML model training and inference
- [Google Gemini](https://deepmind.google/technologies/gemini/) — LLM powering the chatbot
- [Cloudflare Workers](https://workers.cloudflare.com) — serverless frontend hosting
- [Render.com](https://render.com) — AI/ML backend hosting

### Acknowledgements

We thank **Techno India University** and the organisers of **AI — UNLEASHED 2026** for providing the platform to build and present this project. We also acknowledge the open-source community whose libraries made this system possible.

---

<div align="center">

**Built with by Team CodeCraft 2026**

Sayan Ghosh · Archisman Saha · Samanwita Mandal · Aditya Bikram Dhar · Mousumi Mandal

*Techno India University · AI — UNLEASHED 2026*

</div>
