# Pathfinder domain model (backend schema v3)

Source of truth for product behaviour the frontend must respect.
Synced from the Path_BE_REAL backend work (Oct 2026).

---

## Two learner axes (orthogonal)

| Axis | Meaning | Data |
|------|---------|------|
| **Course access** | Can watch / progress on a course | `Enrollment` |
| **Community access** | Chat, live classes, cohort announcements | `StudentProfile` (ACTIVE) + `CohortMember` (ACTIVE, not expired) |

- **Tier 1 — Public buyer:** account + Enrollment only. No community UI.
- **Tier 2 — Registered student:** `StudentProfile.status === ACTIVE` plus usually enrollments and cohort membership.
- `Role.student` means “learner account”, **not** registered student. Always check `studentProfile`, never role alone.

---

## What grants what

| Action | Grants |
|--------|--------|
| Buy course (`CoursePricing`) | `Enrollment` (`source: PURCHASE`) |
| Admin grant | `Enrollment` (`source: ADMIN_GRANT`) |
| Buy cohort seat (`CohortOffer`) | `CohortMember` + optional bundled `Enrollment` (`source: COHORT_SEAT`) |
| Submit application form | `StudentProfile` only (status). **No** course or live access |
| Admin creates student | `StudentProfile` only |

Access is evaluated with **status + dates**, not status alone:

- Enrollment: `status === ACTIVE` && `startedAt <= now` && (`expiresAt === null` \|\| `expiresAt > now`)
- CohortMember: `status === ACTIVE` && (`expiresAt === null` \|\| `expiresAt > now`)

Lifetime access = `expiresAt === null`.

---

## Commerce

### Products in cart / order

Exactly one product kind per line:

- `pricingId` → course access plan (`CoursePricing`)
- `cohortOfferId` → live-class seat (`CohortOffer`)

No guest checkout: user must be signed in (`Order.userId` required).

### Bonus / grace

- `CoursePricing.bonusDays` and `CohortOffer.bonusDays` are snapshotted onto `OrderItem.bonusDays` at order creation.
- Fulfillment bakes bonus into `Enrollment.expiresAt` / membership window.
- Never shorten access the learner already has (e.g. lifetime stays lifetime).

### Cohort seats

- Seat includes community membership until **batch end** (`CohortMember.expiresAt`).
- If `includesCourseAccess`, creates `Enrollment` rows for each `CohortCourse`, ending at batch end **+ bonusDays**.
- Capacity lives on `Cohort.capacity`. Pending order items count as holds; paid seat when full = anomaly (refund/waitlist), not silent drop.
- Refund of a seat removes membership and only `COHORT_SEAT` enrollments from that seat — separately purchased courses stay.

### Payment UX

- Initialize payment → may return `requiresPayment: false` for free orders (already fulfilled).
- Verify endpoint is owner-only; same recovery path as lost-webhook worker.
- Success page should poll verify until `success` / `failed`, not assume webhook arrived first.

---

## Application form

- Subjects / papers come from the **backend** (courses), not hard-coded lists.
- Optional `cohortOfferId` for batch intake.
- Submitting can auto-create `StudentProfile` (status only). Access still requires purchase or admin grant.

---

## Community features (registered students)

### Access policy (one function for REST + WebSocket)

| Actor | Allowed |
|-------|--------|
| admin / superadmin | Any cohort |
| instructor | Cohorts with `CohortInstructor` row |
| student | ACTIVE `StudentProfile` + ACTIVE non-expired `CohortMember` |

### Chat

- Rooms are **cohort- or course-scoped**. Membership is **derived** (no room-member table).
- Cursor-paginate messages on `(createdAt, id)`. Never OFFSET.

### Announcements

- Feed = published `Announcement` + targets (cohort and/or course).
- Late joiners still see history via targets, not only via Notification inbox.
- Notification rows are for alerts / read state / email delivery.

### Live sessions (Stage 1 now)

- Providers: Zoom / Google Meet today; LiveKit later (`roomName`, token join).
- Always prefer showing `fallbackJoinUrl` if primary fails.
- `joinUrl` / `passcode` are secrets — only after access policy passes. Never in public lists.
- `MeetingAccount` (2–3 licences): scheduler must not overlap sessions on the same licence.
- Recordings: `LiveSessionRecording` on Bunny; visible to eligible cohort members while membership rules allow.

Live rollout stages (product):

1. **Now** — external Zoom/Meet links; import recordings to Bunny  
2. **Later** — LiveKit Cloud in-app  
3. **Only if bill justifies** — self-hosted LiveKit  

Frontend should treat provider as data-driven, not hard-code Zoom-only UI forever.

---

## Key enums (frontend-facing)

```ts
EnrollmentStatus = ACTIVE | EXPIRED | REVOKED
EnrollmentSource = PURCHASE | ADMIN_GRANT | COHORT_SEAT
StudentStatus = ACTIVE | SUSPENDED | ALUMNI | WITHDRAWN
CohortMemberStatus = ACTIVE | REMOVED | COMPLETED
CohortStatus = UPCOMING | ACTIVE | COMPLETED | ARCHIVED
PaymentStatus = PENDING | PAID | FAILED | REFUNDED
LiveSessionStatus = SCHEDULED | LIVE | ENDED | CANCELLED
LiveSessionProvider = ZOOM | GOOGLE_MEET | MICROSOFT_TEAMS | JITSI | LIVEKIT | OTHER
NotificationType = STUDENT_REGISTERED | ENROLLMENT_GRANTED | ANNOUNCEMENT
  | LIVE_SESSION_* | SEAT_CONFIRMED | ACCESS_ENDING_SOON | SYSTEM
```

---

## Suggested frontend surfaces (gaps vs current app)

Existing routes (admin courses/programs/enrollments/students, cart, checkout, apply) stay.

Add / evolve toward:

| Area | Notes |
|------|------|
| Learner home | Split “My courses” (Enrollment) vs “My cohorts” (membership) |
| Seat purchase | Catalog of active `CohortOffer`s; cart line with `cohortOfferId` |
| Application | Load courses + open offers from API |
| Cohort space | Chat + live schedule + announcements (gate on profile + membership) |
| Live join | Authorized endpoint for joinUrl; show fallback |
| Notifications inbox | Unread badge; deep links via `refType` / `refId` |
| Admin | Cohorts, offers, capacity, grant enrollment, meeting accounts |

---

## Auth session shape (recommended)

```ts
type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  role: "student" | "instructor" | "admin" | "superadmin";
  emailVerified: boolean;
  profileImage: string | null;
  studentProfile?: { status: StudentStatus } | null;
};
```

Gate community nav with `studentProfile?.status === "ACTIVE"`.

---

## Non-goals for the frontend

- Do not invent a second “student role” flag client-side.
- Do not treat purchase as auto-registration.
- Do not show join links in unauthenticated or non-member UIs.
- Do not implement LiveKit self-host orchestration in the browser; provider stays server-driven.
