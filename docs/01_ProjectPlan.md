# ToolShare — Project Plan

**Document Type:** Project Management Plan  
**Author:** Oussama Dadouch  
**Version:** 1.0  
**Date:** May 5, 2026

---

## 1. Project Charter

### 1.1 Project Summary

**Project Name:** ToolShare  
**Project Owner:** Oussama Dadouch  
**Start Date:** May 5, 2026  
**End Date:** June 13, 2026  
**Duration:** 6 weeks

ToolShare is a micro-local web application designed for residents of apartment buildings. It allows neighbours to list household items they rarely use, and to request to borrow those items from other residents. The platform reduces unnecessary consumer spending, minimises clutter in small apartments, and builds a sense of community within a building.

The system is scoped intentionally small: one building, one database, a handful of item categories, and a straightforward borrow/return workflow. The goal is a working, demonstrable prototype — not a SaaS product.

---

### 1.2 Business Case

Urban apartment dwellers face two compounding problems. First, small living spaces mean there is no room to store tools and equipment that are only used once or twice a year (a drill, a ladder, a carpet cleaner). Second, buying these items is wasteful — both financially and environmentally — when dozens of identical items already sit unused in the same building.

The sharing economy has demonstrated, at scale (Airbnb, OLIO, Library of Things), that people are willing to share when the friction of sharing is low enough. ToolShare applies this principle at the smallest possible unit: a single apartment building, where trust is already established by proximity and building management.

**Strategic alignment:** sustainability goals, community-building, reduction of single-use consumer purchases.

**Expected benefits:**

- Residents save money on rarely-needed tools.
- Items get used rather than accumulating in storage lockers.
- A soft social network emerges naturally from lending interactions.

---

### 1.3 Stakeholders

| Stakeholder                     | Role                                 | Interest                                    |
| ------------------------------- | ------------------------------------ | ------------------------------------------- |
| Oussama Dadouch                 | Project Owner, Developer, PM, BA, QA | Successful delivery of all SDLC phases      |
| Gintarė Valančiūtė _(persona)_  | Lender / Tool Owner                  | Easy listing, confidence items are returned |
| Tomas Januševičius _(persona)_  | Borrower                             | Simple browsing, no commitment to own tools |
| Building Management _(implied)_ | Platform host                        | Liability-free, no financial transactions   |

---

### 1.4 Constraints

| Category   | Constraint                                                                        |
| ---------- | --------------------------------------------------------------------------------- |
| Budget     | Zero — only free/open-source tools (Next.js, SQLite, shadcn/ui, Vercel free tier) |
| Time       | 6 calendar weeks; all phases must complete by June 13, 2026                       |
| Team       | Single developer — no parallel development streams                                |
| Scope      | Single building; no multi-tenancy; no payment processing                          |
| Technology | Node.js ecosystem only; no backend microservices                                  |

---

### 1.5 Success Criteria

1. A user can register, log in, and log out.
2. A logged-in user can list an item with a name and description.
3. A logged-in user can browse all items in the building.
4. A user can submit a borrow request for an available item; the item status changes to "Borrowed" immediately.
5. The system correctly rejects a second borrow request for an already-borrowed item, returning an appropriate error.
6. A lender can mark a returned item as available again.
7. All 6 QA test cases pass.
8. The application runs locally without error with `npm run dev`.

---

## 2. Work Breakdown Structure (WBS)

```
1.0  ToolShare Project
│
├── 1.1  Phase 1 — Initiation & Business Analysis
│   ├── 1.1.1  Draft project charter and business case
│   ├── 1.1.2  Identify stakeholders and constraints
│   ├── 1.1.3  Define problem statement and target audience
│   ├── 1.1.4  Develop user personas (Gintarė, Tomas)
│   ├── 1.1.5  Write 5 user stories with acceptance criteria
│   ├── 1.1.6  Build data dictionary (Users, Items, LendingTransactions)
│   └── 1.1.7  Document borrowing workflow (7-step process)
│
├── 1.2  Phase 2 — Design & Architecture
│   ├── 1.2.1  Select and justify tech stack
│   ├── 1.2.2  Write SQL CREATE TABLE statements
│   ├── 1.2.3  Define API contract (endpoints, methods, payloads)
│   ├── 1.2.4  Describe UI wireframes for 3 core screens
│   └── 1.2.5  Document folder structure and component boundaries
│
├── 1.3  Phase 3 — Development
│   ├── 1.3.1  Initialise Next.js 14 project with TypeScript and Tailwind
│   ├── 1.3.2  Install and configure shadcn/ui component library
│   ├── 1.3.3  Create SQLite schema and db connection module (lib/db.ts)
│   ├── 1.3.4  Seed database with 5 Lithuanian test users and 5 items
│   ├── 1.3.5  Implement GET /api/items route handler
│   ├── 1.3.6  Implement POST /api/borrow route handler (transaction-safe)
│   ├── 1.3.7  Implement POST /api/auth/login and logout handlers
│   ├── 1.3.8  Build root layout with Navbar and Toaster
│   ├── 1.3.9  Build Login page with controlled form
│   ├── 1.3.10 Build Dashboard server page with server-side item fetch
│   ├── 1.3.11 Build ItemFeed client component (grid + local state)
│   ├── 1.3.12 Build ItemCard with conditional borrow button
│   └── 1.3.13 Build BorrowModal dialog with confirmation flow
│
├── 1.4  Phase 4 — Testing
│   ├── 1.4.1  Write test strategy document
│   ├── 1.4.2  Execute TC-01 through TC-06 and record results
│   ├── 1.4.3  Build Requirements Traceability Matrix
│   └── 1.4.4  Resolve defects found during testing
│
└── 1.5  Phase 5 — Deployment & Retrospective
    ├── 1.5.1  Verify local run with npm run dev
    ├── 1.5.2  Capture 3 UI print-screens
    ├── 1.5.3  Write retrospective (PM, BA, Dev, QA perspectives)
    └── 1.5.4  Final documentation review
```

---

## 3. Project Timeline — Gantt Chart

**Timeline:** May 5 – June 13, 2026 (6 weeks)  
**Legend:** `████` = active period · `◆` = milestone

| WBS           | Task                                 | Start      | End    | W1<br>May 5–9 | W2<br>May 12–16 | W3<br>May 19–23 | W4<br>May 26–30 | W5<br>Jun 2–6 | W6<br>Jun 9–13 |
| ------------- | ------------------------------------ | ---------- | ------ | :-----------: | :-------------: | :-------------: | :-------------: | :-----------: | :------------: |
| 1.1.1–1.1.2   | Charter, stakeholders, constraints   | May 5      | May 6  |      ██       |                 |                 |                 |               |                |
| 1.1.3–1.1.4   | Problem statement, personas          | May 6      | May 7  |      ███      |                 |                 |                 |               |                |
| 1.1.5         | User stories + acceptance criteria   | May 8      | May 9  |     ████      |                 |                 |                 |               |                |
| 1.1.6–1.1.7   | Data dictionary, borrowing workflow  | May 9      | May 9  |       ◆       |                 |                 |                 |               |                |
|               | **◆ MILESTONE: BA Package Complete** | **May 9**  |        |       ◆       |                 |                 |                 |               |                |
| 1.2.1–1.2.2   | Tech stack decision, SQL schema      | May 12     | May 13 |               |      ████       |                 |                 |               |                |
| 1.2.3         | API contract definition              | May 14     | May 15 |               |      ████       |                 |                 |               |                |
| 1.2.4–1.2.5   | Wireframes, folder structure         | May 15     | May 16 |               |      ████       |                 |                 |               |                |
|               | **◆ MILESTONE: Architecture Frozen** | **May 16** |        |               |        ◆        |                 |                 |               |                |
| 1.3.1–1.3.2   | Next.js scaffold + shadcn/ui         | May 19     | May 20 |               |                 |      ████       |                 |               |                |
| 1.3.3–1.3.4   | DB module + seed data                | May 20     | May 21 |               |                 |      ████       |                 |               |                |
| 1.3.5–1.3.6   | GET /api/items + POST /api/borrow    | May 21     | May 23 |               |                 |      ████       |                 |               |                |
| 1.3.7         | Auth route handlers                  | May 23     | May 23 |               |                 |       ██        |                 |               |                |
|               | **◆ MILESTONE: Backend Complete**    | **May 23** |        |               |                 |        ◆        |                 |               |                |
| 1.3.8–1.3.9   | Layout, Navbar, Login page           | May 26     | May 27 |               |                 |                 |      ████       |               |                |
| 1.3.10–1.3.11 | Dashboard page, ItemFeed             | May 27     | May 29 |               |                 |                 |      ████       |               |                |
| 1.3.12–1.3.13 | ItemCard, BorrowModal                | May 29     | May 30 |               |                 |                 |      ████       |               |                |
|               | **◆ MILESTONE: Frontend Complete**   | **May 30** |        |               |                 |                 |        ◆        |               |                |
| 1.4.1–1.4.3   | Test strategy, TC-01–TC-06, RTM      | Jun 2      | Jun 5  |               |                 |                 |                 |     ████      |                |
| 1.4.4         | Defect resolution                    | Jun 5      | Jun 6  |               |                 |                 |                 |     ████      |                |
|               | **◆ MILESTONE: Testing Complete**    | **Jun 6**  |        |               |                 |                 |                 |       ◆       |                |
| 1.5.1–1.5.2   | Local run verification, screenshots  | Jun 9      | Jun 10 |               |                 |                 |                 |               |      ████      |
| 1.5.3–1.5.4   | Retrospective + final review         | Jun 11     | Jun 13 |               |                 |                 |                 |               |      ████      |
|               | **◆ MILESTONE: Project Complete**    | **Jun 13** |        |               |                 |                 |                 |               |       ◆        |

### 3.1 Critical Path

The following sequence determines the earliest possible project completion date. Any delay in a critical-path task delays the entire project.

```
DB Schema (May 12–13)
  → Route Handlers — POST /api/borrow (May 21–23)
      → Next.js Components — ItemFeed / ItemCard (May 27–30)
          → UAT — TC-01 & TC-02 concurrent borrow test (Jun 4–5)
              → Project Complete (Jun 13)
```

The `POST /api/borrow` transaction logic is the single highest-risk task. If the SQLite serialized transaction is not correctly implemented, TC-02 (concurrent borrow test) will fail, which would unblock all downstream QA tasks. This is reflected in the Risk Register below.

---

## 4. Risk Register

| Risk ID | Risk Description                                                                                                                                                                                             | Category  | Likelihood | Impact | Risk Score     | Mitigation Strategy                                                                                                                                                                                                                       | Owner           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ---------- | ------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| R-01    | **Scope Creep** — Temptation to add features (photo upload, ratings, notifications) beyond the defined scope, stretching the 6-week timeline                                                                 | Scope     | Medium     | High   | **High**       | Maintain a hard "Out of Scope" list in `entryPoint.md`. Any new feature idea is logged but frozen until after project completion. No WBS additions after Phase 2 architecture freeze (May 16).                                            | Oussama Dadouch |
| R-02    | **Double-Booking Race Condition** — Two users submitting a borrow request for the same item within milliseconds of each other, both reading "available" before either write completes (TOCTOU vulnerability) | Technical | Medium     | High   | **High**       | Implement `POST /api/borrow` inside a `better-sqlite3` serialized transaction. The synchronous nature of `better-sqlite3` combined with SQLite's write-lock ensures only one transaction can write at a time. Test explicitly with TC-02. | Oussama Dadouch |
| R-03    | **Low User Adoption** — Residents of the pilot building are unwilling to lend personal items, making the platform a catalogue with nothing available to borrow                                               | Business  | Medium     | Medium | **Medium**     | Pre-seed the database with 5 realistic Lithuanian user accounts and 5 items. The application launches with visible content rather than an empty state. Document the onboarding flow clearly for any future pilot.                         | Oussama Dadouch |
| R-04    | **SQLite Scalability Ceiling** — SQLite's single-writer model becomes a bottleneck if the app were ever extended to multiple buildings or hundreds of concurrent users                                       | Technical | Low        | Medium | **Low-Medium** | Scope is fixed at single-building prototype (< 100 users). Document a clear migration path to PostgreSQL in `03_TechnicalSpec.md`. Schema is intentionally designed to be portable — no SQLite-specific types used.                       | Oussama Dadouch |
| R-05    | **Solo Developer Bus Factor** — As the only contributor, illness or unexpected obligations could halt all progress                                                                                           | Resource  | Low        | High   | **Medium**     | Maintain detailed documentation at each phase so the project state is always recoverable from documentation alone. All decisions are written, not tribal.                                                                                 | Oussama Dadouch |
