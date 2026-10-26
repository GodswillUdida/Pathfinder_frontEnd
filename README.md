# Pathfinder Frontend

Next.js app for **Accountant Pathfinder / Pathfinder College** — public storefront, learner dashboard, application intake, and admin.

## Domain model

Backend behaviour the UI must follow is documented in:

**[docs/DOMAIN.md](./docs/DOMAIN.md)**

Summary:

- **Tier 1 (public buyer):** course Enrollment only  
- **Tier 2 (registered student):** `StudentProfile` + cohort membership (chat, live, announcements)  
- **Seat purchase:** `CohortOffer` → membership + optional bundled course access (`COHORT_SEAT`)  
- **Application form:** creates student **status** only — not course/live access  
- **Live classes:** Zoom/Meet first; schema ready for LiveKit later  

Read that doc before adding checkout, cohort, or community UI.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind / shadcn-style components (see `components.json`)

## Related

- Backend: Path_BE_REAL (Express + Prisma + PostgreSQL + BullMQ)
- Payments: Paystack (claim-based fulfillment; free orders skip the gateway)

## Deploy

Prefer Vercel or your existing pipeline. Point `NEXT_PUBLIC_API_URL` (or equivalent) at the backend API.
