# Facility Maintenance Platform

A facility maintenance company's website and client/admin portal: a React (Vite + Tailwind) frontend and an Express + MySQL backend, with a lightweight CMS so non-technical admins can manage nearly all site content (services, team, FAQs, plans, parts, knowledge base, site contact info, blog) without a code deploy.

## Project Structure

```
facility-maintenance/
├── client/           # Vite + React frontend
│   ├── src/
│   │   ├── components/  # Auth, Dashboard (incl. admin CRUD + Reports), Layout, UI kit
│   │   ├── pages/
│   │   ├── services/api.js   # single axios client for the whole app
│   │   └── hooks/
│   └── .env.example
├── server/           # Express + MySQL backend
│   ├── routes/        # auth, client, admin, public, content (generic CMS CRUD), payments, reports
│   ├── middleware/     # auth, rate limiting, validation, upload, error handling
│   ├── db/schema.sql   # full schema + seed data (source of truth; no ORM)
│   ├── config/
│   └── .env.example
└── README.md
```

## Getting Started

### Database

1. Create a MySQL database (e.g. `facilitypro`).
2. Apply the schema: `cd server && npm run db:migrate` (reads `db/schema.sql`, safe on a fresh database).

### Server (`server/`)

```
cd server
cp .env.example .env   # fill in DB, JWT_SECRET, STRIPE_SECRET_KEY, etc.
npm install
npm run dev
```

Health check: `GET /api/health`.

### Client (`client/`)

```
cd client
cp .env.example .env   # set VITE_API_URL to the server URL, VITE_STRIPE_PUBLISHABLE_KEY
npm install
npm run dev
```

## Content Management

Once logged in as an admin (`role = 'admin'` in the `users` table), the Dashboard's **Content** tab manages: Services, Team Members, FAQs, Service Plans, Parts, Knowledge Base guides/videos, the Blog, and site-wide contact settings (address/phone/email/hours) — all backed by real database tables, not hardcoded frontend data. The **Reports** tab provides filterable, chart-based analytics (revenue, signups, request/payment/feedback status breakdowns) with CSV export.

## Payments

Stripe PaymentIntents are created server-side only from a catalog reference (`service_plans`/`parts` id) or a bounded custom amount — the client never dictates the charged amount. Configure `STRIPE_WEBHOOK_SECRET` (e.g. via `stripe listen` locally) so payment status updates automatically from Stripe events.

## Deploying with Docker

The whole stack (MySQL + server + client) runs with one command on any Docker host — a VPS, Railway, Render, Fly.io, etc.

```
cp .env.example .env   # fill in JWT_SECRET, Stripe keys, etc.
docker compose up -d --build
```

This builds `server/Dockerfile` and `client/Dockerfile` (multi-stage, served via Nginx), starts MySQL with `server/db/schema.sql` auto-applied on first boot via `docker-entrypoint-initdb.d`, and persists both the database and `server/uploads/` in named volumes. The client is on `:8080`, the API on `:4000`.

Note `VITE_API_URL` in `.env.example` must be the URL the **browser** will use to reach the API — if you deploy behind a real domain, set it to that domain before building, not `localhost`.

## Maintenance

- Update dependencies regularly with `npm outdated` / `npm update` in each of `client/` and `server/`.
- `server/db/schema.sql` is the source of truth for the database — update it alongside any new query, and re-apply to a fresh dev database to confirm it stays valid. Changes to a database that's already running in production go in `server/db/migrations/` instead (see the existing files there for the pattern).
- Outside Docker: deploy the frontend as a static build (`npm run build` in `client/`) and the backend as a standard Node process; both need their own `.env` in production.
