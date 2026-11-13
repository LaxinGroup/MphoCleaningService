# MUPHO THE CLEANER

> **A full-stack booking platform for a solo cleaning business: customers browse live service pricing, pick an open time window, and book in seconds. Every confirmed booking is written to Neon PostgreSQL and synced to Google Calendar in real time, with a strict cap of three bookings per day.**

---

## 🚀 Key Features

### 🧺 Customer Booking Experience (`/`)
- **Live Service Catalogue:** Seven service categories (Laundry, Home Cleaning, Windows, Floors & Upholstery, Office, Gardening, Additional Services) with prices loaded from Neon, never hardcoded in page code.
- **Multi-Service Selection:** Combine several services (for example, wash & fold plus window cleaning) into a single booking.
- **Date & Slot Picker:** Three fixed daily windows in South African Standard Time:
  - `morning`: 08:00 – 11:00
  - `midday`: 12:00 – 15:00
  - `afternoon`: 15:30 – 18:30
- **Live Availability Indicators:** Each slot shows whether it is open, already booked, blocked on the calendar, past, or unavailable because the daily cap is reached.
- **No Online Payments:** Bookings are settled by cash, invoice or on delivery. There is no checkout flow.

### 📅 Solo Cleaner Operations (Google Calendar)
- **Real-Time Calendar Sync:** Every confirmed booking creates a Google Calendar event (`calendar.events.insert`) with the customer added as an attendee.
- **Rich Event Details:** Event descriptions include the selected services and prices, customer phone, address and notes.
- **Free/Busy Protection:** Slots that clash with existing calendar events are blocked automatically, so personal appointments are respected.

### 🛡️ Booking Integrity & Business Rules
- **3-Bookings-Per-Day Cap:** Enforced in the Express controller and again at insert time (`insertBookingIfUnderCap`).
- **Dual Availability Check:** Availability is verified against **both** the Neon daily booking count and the Google Calendar Free/Busy query before a booking is accepted.
- **One Booking per Slot:** A `UNIQUE (booking_date, slot_id)` constraint prevents double-booking under concurrent requests.
- **Transactional Fallback:** The calendar event is written first. If the Neon insert fails or the slot is taken mid-request, the calendar event is deleted so both systems stay in sync.
- **Timezone-Safe Dates:** All slot times are built as explicit `TIMESTAMPTZ` instants with the SAST offset (`+02:00`, `Africa/Johannesburg`).

---

## 🛠️ Technology Stack & Architecture

- **Frontend (`client/`):** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 with the brand tokens `mupho-blue`, `mupho-yellow`, `font-heading` and `font-script`.
- **Backend (`server/`):** Node.js, Express.js 5, TypeScript (run via `tsx`), `zod` request validation, `helmet` security headers, CORS.
- **Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`). Falls back to an in-memory catalogue and booking store when `DATABASE_URL` is not set (development only).
- **Third-Party Integration:** Google Calendar API (`googleapis`) using Service Account (JWT) authentication.
- **Separation of Concerns:** The frontend only calls the Express API. All database and calendar secrets stay on the server. In development, Next.js rewrites `/api/*` to the Express server.

### Project Structure
```
MphoCleaningService/
├── client/                  # Next.js frontend (UI only)
│   ├── app/                 # App Router pages and layout
│   ├── components/          # Hero, ServiceList, BookingCoupon, etc.
│   └── lib/api.ts           # Typed fetch wrappers for the Express API
└── server/                  # Express backend
    ├── server.js            # Process entry point
    └── src/
        ├── config/env.ts    # Environment and key sanitisation
        ├── controllers/     # services, availability, bookings
        ├── services/        # availability rules and Google Calendar
        ├── db/              # Neon client, schema.sql, seed
        ├── lib/             # SAST time helpers, JSON response helpers
        └── middleware/      # Unified error handler
```

---

## 🔌 API Reference

All responses use a single JSON shape:
```json
{ "success": true, "message": "Booking confirmed.", "data": { } }
```

| Method | Endpoint                   | Description                                                   |
|--------|----------------------------|---------------------------------------------------------------|
| GET    | `/health`                  | Health check                                                  |
| GET    | `/api/services`            | Service categories and live prices from Neon                  |
| POST   | `/api/check-availability`  | Body `{ "date": "YYYY-MM-DD" }`. Returns slot availability for a SAST day |
| POST   | `/api/book`                | Creates a booking and the matching Google Calendar event      |

**Example booking request:**
```json
{
  "serviceIds": [1, 17],
  "date": "2026-11-20",
  "slotId": "morning",
  "customerName": "Thandi Mokoena",
  "customerEmail": "thandi@example.com",
  "customerPhone": "0821234567",
  "address": "12 Main Road, Pretoria",
  "notes": "Gate code 1234"
}
```

---

## ⚙️ Environment Configuration

### Backend (`server/.env`)
```env
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://<user>:<password>@<host>.neon.tech/<db>?sslmode=require
GOOGLE_CLIENT_EMAIL=<service-account>@<project>.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=primary
GOOGLE_IMPERSONATE_EMAIL=
```
> `GOOGLE_PRIVATE_KEY` is stored with escaped `\n` newlines. The server restores them automatically (`.replace(/\\n/g, '\n')`).
> Share the target calendar with the service account email so it can create events.

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> Never commit `.env` files. They are ignored by Git.

---

## 🧪 Getting Started

### 1. Set Up the Database
Run [server/src/db/schema.sql](server/src/db/schema.sql) in the Neon SQL Editor, or seed from the CLI:
```bash
cd server
pnpm install
pnpm seed
```
*Creates the `service_categories`, `services` and `bookings` tables and upserts all service prices. Prices can be edited directly in Neon at any time.*

### 2. Run the Express Backend
```bash
cd server
pnpm dev
```
*Starts the API at `http://localhost:4000`. Without `DATABASE_URL` it runs on the in-memory store. Without Google credentials, bookings still work in development but are refused in production.*

### 3. Run the Next.js Frontend
```bash
cd client
pnpm install
pnpm dev
```
*Opens the site at `http://localhost:3000`.*

### 4. Quick Smoke Test
```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/services
curl -X POST http://localhost:4000/api/check-availability \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-11-20"}'
```

---

## 🌐 Production Deployment Guide

### Deploy Backend to Render
1. Connect the repository and set the root directory to `server`.
2. Build command: `pnpm install`
3. Start command: `pnpm start`
4. Environment variables: `NODE_ENV=production`, `DATABASE_URL`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CALENDAR_ID`, `CLIENT_ORIGIN` (your Vercel URL).

### Deploy Frontend to Vercel
1. Connect the repository and set the root directory to `client`.
2. Framework: Next.js.
3. Set `NEXT_PUBLIC_API_URL` to the Render backend origin (for example, `https://your-api.onrender.com`).
4. After redeploying, check the backend health endpoint at `https://your-api.onrender.com/health`.

---

## 📋 Business Rules

- **Solo operation:** one cleaner, one calendar. No multi-staff routing.
- **Maximum 3 bookings per day**, one per time window.
- **No payment gateway:** cash, invoice or on delivery only.
- **Every confirmed booking is synced to Google Calendar** with the customer as an attendee.
