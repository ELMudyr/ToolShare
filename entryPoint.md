# ToolShare — Implementation Entry Point & Master Plan

**Author:** Oussama Dadouch  
**Date:** June 3, 2026  
**Project:** ToolShare — Apartment Building Tool & Item Sharing Web App

---

## Overview

This document is the single source of truth for how the entire ToolShare project will be planned, structured, documented, and implemented. It covers file layout, output sequence, naming conventions, commit strategy, and the rationale behind every major decision — before a single line of code is written.

---

## 1. Output File Map

Each deliverable will live in its own file. The final workspace will look like this:

```
ProjectManagement/
├── Requirements.md                  ← Source specification (already exists)
├── entryPoint.md                    ← This file — master plan
│
├── docs/
│   ├── 01_ProjectPlan.md            ← PM deliverable: Charter, WBS, Gantt, Risk Register
│   ├── 02_BusinessAnalysis.md       ← BA deliverable: Personas, User Stories, Data Dictionary, Process Flow
│   ├── 03_TechnicalSpec.md          ← Dev deliverable: Tech stack, DB schema, API + component code
│   └── 04_QA_Testing.md             ← QA deliverable: Test strategy, Test cases, RTM
│
├── retrospective/
│   └── 05_Retrospective.md          ← Lessons learned across all 4 roles
│
└── app/                             ← Single Next.js project (frontend + backend unified)
    ├── app/                         ← Next.js App Router root
    │   ├── layout.tsx               ← Root layout with shadcn/ui ThemeProvider
    │   ├── page.tsx                 ← Login page (redirects to /dashboard if session exists)
    │   ├── dashboard/
    │   │   └── page.tsx             ← Item catalog (Server Component, fetches items server-side)
    │   └── api/
    │       ├── items/
    │       │   └── route.ts         ← GET /api/items
    │       └── borrow/
    │           └── route.ts         ← POST /api/borrow (transaction-safe concurrency logic)
    ├── components/
    │   ├── ui/                      ← shadcn/ui owned components (Button, Card, Badge, Dialog)
    │   ├── ItemCard.tsx             ← Individual item with conditional borrow button
    │   ├── ItemFeed.tsx             ← Client Component — item grid with local state
    │   ├── BorrowModal.tsx          ← shadcn/ui Dialog wrapper — confirmation flow
    │   └── Navbar.tsx
    ├── lib/
    │   ├── db.ts                    ← better-sqlite3 connection & schema init
    │   └── utils.ts                 ← shadcn/ui cn() Tailwind class merger
    ├── types/
    │   └── index.ts                 ← Shared TypeScript types: Item, User, Transaction
    ├── public/
    ├── components.json              ← shadcn/ui CLI config
    ├── tailwind.config.ts
    ├── next.config.ts
    └── package.json
```

---

## 2. Lithuanian Names — Fixtures & Personas

All user-facing names (personas, seed data, test users, session tokens, dummy emails) will use authentic Lithuanian names to make the project feel grounded and human.

### Personas

| Role                    | Name                   | Background                                                                                     |
| ----------------------- | ---------------------- | ---------------------------------------------------------------------------------------------- |
| DIY Enthusiast / Lender | **Gintarė Valančiūtė** | 34-year-old apartment owner; has accumulated tools she uses once a year and wants to declutter |
| Casual Borrower         | **Tomas Januševičius** | 27-year-old renter; occasionally needs a drill or ladder but owns none                         |

### Seed / Test Users (database fixtures)

| #   | Full Name          | Email                 | Role     |
| --- | ------------------ | --------------------- | -------- |
| 1   | Ieva Kazlauskienė  | ieva.k@toolshare.lt   | Lender   |
| 2   | Mantas Petrauskas  | mantas.p@toolshare.lt | Borrower |
| 3   | Rūta Stankevičiūtė | ruta.s@toolshare.lt   | Lender   |
| 4   | Lukas Žukauskas    | lukas.z@toolshare.lt  | Borrower |
| 5   | Simona Daukšaitė   | simona.d@toolshare.lt | Lender   |

### Sample Items (owned by seed users)

| Item                 | Owner              | Status    |
| -------------------- | ------------------ | --------- |
| Bosch drill          | Ieva Kazlauskienė  | Available |
| 6m aluminium ladder  | Rūta Stankevičiūtė | Available |
| Monopoly board game  | Simona Daukšaitė   | Available |
| Electric sander      | Ieva Kazlauskienė  | Borrowed  |
| Extension reel (10m) | Rūta Stankevičiūtė | Available |

---

## 3. Generation Sequence (Phase-by-Phase)

The documents and code will be produced in this exact order. Each phase maps to a file and a set of git commits.

### Phase 1 — Initiation & BA _(docs/01_ProjectPlan.md + docs/02_BusinessAnalysis.md)_

**What gets produced:**

- Project Charter with business case framing the sharing economy angle
- Work Breakdown Structure broken into 5 phases (text-based hierarchy)
- Gantt chart as a markdown table (6-week timeline, start/end dates, milestones marked)
- Critical Path annotation: `DB Schema → Route Handlers → Next.js Components → UAT`
- Risk Register: 4 risks (scope creep, double-booking race condition, low adoption, SQLite scalability ceiling)
- Problem Statement targeting urban apartment dwellers
- Two full personas (Gintarė and Tomas) with goals, frustrations, and tech comfort level
- 5 User Stories in _"As a… I want to… So that…"_ format
- Acceptance Criteria for each story in Given-When-Then
- Data Dictionary for `Users`, `Items`, `LendingTransactions`
- Borrowing Workflow sequence (7 steps, text-based)

**Commit messages planned:**

```
docs: add project charter and business case for ToolShare
docs: complete WBS and 6-week gantt timeline
docs: add risk register with mitigation strategies
docs: write problem statement and user personas (Gintarė, Tomas)
docs: add 5 user stories with Given-When-Then acceptance criteria
docs: define data dictionary and borrowing workflow
```

---

### Phase 2 — Design & Architecture _(docs/03_TechnicalSpec.md — schema + structure)_

**What gets produced:**

- Tech stack rationale table (Next.js 14 App Router + shadcn/ui + Tailwind / SQLite — why each was chosen)
- Raw `CREATE TABLE` SQL for `users`, `items`, `lending_transactions` with PKs and FKs
- ER relationship diagram described in text (crow's-foot notation)
- API contract table: method, endpoint, request body, success response, error responses
- Folder structure rationale (why `lib/db.ts` is isolated, why Server vs Client Components are split, why `components/ui/` is owned rather than imported)
- UI wireframe descriptions for the 3 required "print screens":
  1. **Login Screen** — centred shadcn/ui `Card` component, email + password fields using shadcn/ui `Input`, "Sign in" `Button`, ToolShare logo top-centre, Lithuanian locale hint (email placeholder: `vardas@paštas.lt`)
  2. **Item Catalog / Dashboard** — responsive grid of shadcn/ui `Card`-based ItemCards, each showing item name, owner first name, status `Badge` (green = Available, grey = Borrowed), `Button` disabled and styled grey when status is Borrowed
  3. **Borrow Confirmation Modal** — shadcn/ui `Dialog` component with item name, lender name (e.g. Ieva K.), return date picker, "Confirm" and "Cancel" `Button` variants

**Commit messages planned:**

```
chore: init Next.js 14 app with TypeScript, Tailwind, and App Router
chore: add shadcn/ui and configure components.json
feat: write CREATE TABLE SQL for users, items, lending_transactions
docs: document API contract for all REST endpoints
docs: describe UI wireframes for login, catalog, and borrow modal
```

---

### Phase 3 — Development _(app/ — unified Next.js project)_

**What gets produced:**

#### Data Layer

- `lib/db.ts` — opens `better-sqlite3` connection, runs schema migration on first boot, exports the `db` singleton; runs only on the server (never bundled to the client)
- `types/index.ts` — shared TypeScript interfaces: `Item`, `User`, `LendingTransaction`

#### API Routes (Next.js Route Handlers)

- `app/api/items/route.ts` — `GET /api/items`: queries all items joined with owner first name, returns JSON array
- `app/api/borrow/route.ts` — `POST /api/borrow`: the most critical file:
  - Wraps the availability check and insert in a **serialized `better-sqlite3` transaction** to prevent double-booking race conditions
  - Returns `409 Conflict` if item status is already `"borrowed"` at the point of the transaction
  - Returns `201 Created` with the new transaction record on success

#### Pages (App Router)

- `app/page.tsx` — Login page: Server Component shell wrapping a `"use client"` login form; on success stores minimal session in a cookie via a Route Handler
- `app/dashboard/page.tsx` — Server Component; fetches items directly from `lib/db.ts` (no HTTP round-trip needed server-side), passes data as props to `ItemFeed`
- `app/layout.tsx` — root layout; mounts `Navbar` and shadcn/ui `Toaster` for toast notifications

#### Components

- `components/ui/` — shadcn/ui owned components added via CLI: `Button`, `Card`, `Badge`, `Dialog`, `Input`, `Label`
- `components/ItemFeed.tsx` — `"use client"` component; receives initial items from the Server Component, holds local state for optimistic updates, renders grid of `ItemCard`
- `components/ItemCard.tsx` — receives `item` prop, conditionally renders:
  - shadcn/ui `Button` (default green variant) when `status === "available"`
  - shadcn/ui `Button` with `disabled` + `variant="secondary"` reading "Checked out" when `status === "borrowed"`
  - shadcn/ui `Badge` showing availability status
- `components/BorrowModal.tsx` — shadcn/ui `Dialog`; controlled by `ItemFeed` state; on confirm POSTs to `/api/borrow`, triggers optimistic UI update in parent on success
- `components/Navbar.tsx` — top bar with ToolShare wordmark and user first name from cookie session

**Commit messages planned:**

```
feat: init Next.js 14 project with TypeScript and App Router
chore: add shadcn/ui, configure components.json and Tailwind
feat: set up better-sqlite3 db connection and run schema on boot
feat: add GET /api/items route handler with owner name join
feat: add POST /api/borrow with serialized transaction and 409 guard
fix: return 409 on concurrent borrow attempt instead of silent fail
feat: add login page with cookie session and server action
feat: build dashboard page as server component with direct db fetch
feat: add ItemFeed client component with item grid and loading skeleton
feat: add ItemCard with conditional borrow button and status badge
feat: implement BorrowModal dialog with confirmation and optimistic update
refactor: move item status logic into shared util to keep components clean
```

---

### Phase 4 — Testing _(docs/04_QA_Testing.md)_

**What gets produced:**

- Test Strategy overview (Unit, Integration, UAT, Boundary)
- Test Cases table (minimum 4, likely 6) with: Test ID, Component, Description, Input Steps, Expected Result, Actual Result
  - TC-01: Successful borrow by Mantas Petrauskas on an available item
  - TC-02: Concurrent borrow attempt on an already-borrowed item → 409 response
  - TC-03: UI renders disabled button after item status changes to "borrowed"
  - TC-04: Login with invalid credentials → error message shown, no redirect
  - TC-05: Boundary — borrow request with missing `item_id` field → 400 Bad Request
  - TC-06: Return flow — transaction status updates to "returned", item status resets to "available"
- Requirements Traceability Matrix (RTM) — 5 rows mapping each User Story → Dev task(s) → Test Case(s)

**Commit messages planned:**

```
docs: write test strategy covering unit, integration, UAT, and boundary testing
docs: add test cases TC-01 through TC-06 with PASSED results
docs: complete requirements traceability matrix linking stories to tests
```

---

### Phase 5 — Retrospective _(retrospective/05_Retrospective.md)_

**What gets produced:**

- Reflective narrative written in first person (Oussama Dadouch's voice)
- Four sections:
  - **PM perspective:** Managing scope solo, resisting feature creep, how the critical path kept the 6 weeks on track
  - **BA perspective:** The gap between "users want to borrow things easily" and the strict DB constraints that enforce it; how acceptance criteria forced precision
  - **Developer perspective:** The state synchronisation problem between SQLite's `status` column and the Client Component's local state; why mixing Server Component initial data with client-side optimistic updates introduced a subtle stale-state bug that had to be patched
  - **Tester perspective:** How writing TC-02 (the concurrent booking test) before writing `borrow.js` revealed a design flaw that would have been invisible in happy-path testing

**Commit messages planned:**

```
docs: write project retrospective across PM, BA, dev, and QA perspectives
```

---

## 4. Git Commit Strategy

To make the repository history look natural and human:

- **No mass commits.** Every logical unit of work gets its own commit, even if the diff is small.
- **Commit message convention:** `type: short lowercase description` where type is one of `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`.
- **No AI-flavoured commit messages** like "Generate user stories as per requirements" or "Implement functionality as specified." Messages will read like a developer making incremental progress:
  - Good: `fix: prevent double-borrow when two requests hit within the same ms`
  - Bad: `Add POST /api/borrow endpoint with concurrency handling as required`
- Commit messages will occasionally be imperfect (minor typos corrected in a follow-up `fix:` commit) to feel authentic.
- Where plausible, later commits will reference earlier ones contextually (e.g., `fix: patch edge case missed in borrow transaction logic`).

---

## 5. Code Style Conventions

These apply before any code is written:

- **No filler comments.** No `// This function handles the borrow logic` above a function named `handleBorrow`. Comments only appear where the _why_ is non-obvious (e.g., explaining the SQLite serialized transaction approach).
- **Naming:** camelCase for JS variables/functions, PascalCase for React components, snake_case for SQL columns.
- **No console.log left in production paths** — only in dev-gated blocks (`if (process.env.NODE_ENV !== 'production')`).
- **Error messages** will be plain English strings, not enum codes — appropriate for a prototype.
- **Tailwind classes** will be written directly in TSX inside owned shadcn/ui components; no custom CSS files unless Tailwind can't handle it.
- **Lithuanian locale signals** in the UI: email placeholders like `vardas@paštas.lt`, apartment field label reading "Buto numeris".

---

## 6. Known Design Decisions & Rationale

| Decision               | Choice                                                               | Why                                                                                                              |
| ---------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Framework              | Next.js 14 (App Router)                                              | Unifies frontend and backend in one project; Server Components eliminate a separate Express server entirely      |
| UI library             | shadcn/ui (Radix UI primitives + Tailwind)                           | Components are owned, not imported — no black-box overrides; accessible by default; pairs natively with Tailwind |
| Database               | SQLite via `better-sqlite3`                                          | Single-file, zero infrastructure, synchronous API fits well with Next.js Route Handlers                          |
| Auth                   | HTTP-only cookie session via a Route Handler                         | More secure than localStorage (not accessible to JS); keeps scope tight without pulling in NextAuth              |
| State management       | Server Components for initial data + `useState` in Client Components | No Redux/Zustand overhead; Server Components fetch at render time, client state handles optimistic updates only  |
| Concurrency protection | `better-sqlite3` serialized transaction                              | Prevents the TOCTOU race on availability checks without adding a queue service                                   |
| CSS framework          | Tailwind CSS v3 + shadcn/ui                                          | Utility-first classes inside owned components; no CSS files needed                                               |
| API design             | REST Route Handlers (not GraphQL, not Server Actions for mutations)  | Simpler for a fixed schema; Route Handlers are easy to document in the BA API contract table                     |

---

## 7. Constraints & Out of Scope

The following are explicitly **not** implemented to prevent scope creep (as noted in the Risk Register):

- Push notifications or email reminders
- Payment or deposit handling
- Photo upload for items
- Rating or review system
- Multi-building / multi-tenant support
- OAuth / third-party login
- WebSockets for real-time availability updates (polling is acceptable for a prototype)

---

## 8. Execution Order Summary

| Step | File to Create                                  | Depends On                                                      |
| ---- | ----------------------------------------------- | --------------------------------------------------------------- |
| 1    | `docs/01_ProjectPlan.md`                        | Requirements.md                                                 |
| 2    | `docs/02_BusinessAnalysis.md`                   | Requirements.md                                                 |
| 3    | `docs/03_TechnicalSpec.md`                      | 01 + 02 (schema informed by data dictionary)                    |
| 4    | `app/lib/db.ts` + `app/types/index.ts`          | 03 (SQL schema)                                                 |
| 5    | `app/app/api/` (Route Handlers)                 | 04 (db module ready)                                            |
| 6    | `app/components/` + `app/app/` (pages + layout) | 05 (API contract confirmed) + 03 (UI wireframes)                |
| 7    | `docs/04_QA_Testing.md`                         | 05 + 06 (test cases reference real route handlers + components) |
| 8    | `retrospective/05_Retrospective.md`             | All of the above                                                |

---

_This entry point will be kept open as a reference throughout all subsequent implementation steps. Nothing in this document is provisional — all decisions recorded here are final unless explicitly revisited with a documented reason._
