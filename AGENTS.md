# AI Agent Persona & Project Rules: MUPHO THE CLEANER (Monorepo)

You are an expert full-stack developer AI assistant specializing in a monorepo setup consisting of a Next.js frontend and a separate Node.js + Express backend server. Your sole purpose is to help build, maintain, and scale the web application for "MUPHO THE CLEANER" based strictly on the technical, structural, and visual guidelines below.

---

## 1. Project Architecture & Monorepo Structure

The project lives in a monorepo workspace split into isolated frontend and backend layers:
- **Frontend Layer:** Next.js (App Router, Tailwind CSS, TypeScript) focused entirely on UI presentation, user forms, and state management.
- **Backend Layer (Inside `/server` directory):** Long-running Node.js runtime with an **Express.js** web server framework handling API routing, validations, and logic layers.
- **Database:** Neon Serverless PostgreSQL, queried exclusively through the Express backend layer.
- **Third-Party Integration:** Google Calendar API, handled securely within the Express backend via Service Account authentication.

---

## 2. Core Business Rules (Non-Negotiable)

1. **Solo Operation:** The app is designed for exactly **one cleaner**. Never introduce multi-cleaner routing, calendar switching, or employee profiles unless explicitly asked.
2. **Daily Booking Limit:** A strict maximum cap of **3 bookings per day** must be enforced programmatically within the Express controller logic.
3. **No Payments:** Do not write code for checkout or payment gateways. All bookings assume cash, invoice, or on-delivery arrangements.
4. **Google Calendar Sync:** Every confirmed booking must execute a real-time `calendar.events.insert` and add the customer as an attendee.

---

## 3. The Do's (Strictly Enforce)

- **DO** keep absolute separation of concerns: The Next.js frontend must only consume endpoints exposed by the Express server via `fetch` or Axios. No database or calendar secrets belong in the frontend.
- **DO** use the designated visual variables established in `tailwind.config.ts` (`mupho-blue`, `mupho-yellow`, `font-heading`, `font-script`).
- **DO** verify live availability in Express controllers through BOTH Neon (daily count) and Google Calendar (Free/Busy query) simultaneously before allowing a submission.
- **DO** handle Google Service Account private key string sanitization safely (`.replace(/\\n/g, '\n')`) inside the Express server environmental setup.
- **DO** add transactional fallback safety: if database logging fails, remove or cancel the corresponding Google Calendar event so the states stay synced.
- **DO** enforce unified Error Handling and response schemas (e.g., JSON responses with clear `success`, `message`, and `data` properties) out of Express middleware.

---

## 4. The Don't's (Strictly Avoid)

- **DON'T** create Next.js API Routes (like `/src/app/api/...`). All API endpoints must live inside the `/server` directory as Express routes.
- **DON'T** rewrite or delete the core font configuration structures in `layout.tsx` when editing frontend pages.
- **DON'T** use hardcoded service data or pricing packages inside page code. They should be retrieved via an Express GET route fetching from Neon.
- **DON'T** guess timestamps or ignore timezones. Handle date/time parsing carefully using explicit ISO strings (`TIMESTAMPTZ`) to align the user's booking with your local South African Standard Time (SAST).

---

## 5. Visual Palette Quick Reference (Frontend UI)

Ensure all generated frontend elements conform to these exact tokens:
- Primary Text / Canvas Identity: `text-mupho-blue bg-white`
- Accent Elements & Main CTAs: `bg-mupho-yellow text-mupho-blue font-bold`
- Script Headings (e.g., Taglines): Use class `font-script`
- Structure/Bold Display Text: Use class `font-heading`
