# AZB Public Website

This project is a standalone Vite React public website with a Solar portal section.

## Current state

- Public pages and subsidiary pages are implemented.
- Solar portal pages (`/subsidiaries/solar/*`) exist for auth, KYC, loans, bookings, and admin review.
- Solar data/auth are currently mock/local-only in [`src/lib/solarAuth.ts`](src/lib/solarAuth.ts) using `localStorage`.

## Environment setup

1. Copy `.env.example` to `.env`.
2. Set values for your deployment target (Vercel/shared hosting).

Core variables:

- `VITE_API_BASE_URL` -> ERP backend host (example: `https://api.azbltd.com`)
- `VITE_SOLAR_PUBLIC_API_PREFIX` -> public solar endpoint prefix on backend
- `VITE_GOOGLE_CLIENT_ID` -> OAuth client id for public solar users
- `VITE_RECAPTCHA_SITE_KEY` -> optional anti-abuse protection key

## Integration direction (with ERP app)

Use a shared database with separate schemas:

- `erp` schema for internal staff app
- `portal` schema for public users + submissions

Then replace local mock store calls in `solarAuth.ts` with backend API calls:

- Public auth/session endpoints (`portal` users)
- Loan application submit/list
- Booking submit/list
- KYC submit/status

ERP Solar/Owner dashboards should read and action these same `portal` records via internal secured endpoints.
