# ToolShare — Technical Specification

**Document Type:** Technical Architecture & Developer Reference  
**Author:** Oussama Dadouch  
**Version:** 1.0  
**Date:** May 16, 2026

---

## 1. Tech Stack

| Layer            | Technology                  | Version | Justification                                                                                                                                                                           |
| ---------------- | --------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework        | Next.js (App Router)        | 14.x    | Unifies frontend and backend into a single project. Server Components eliminate a separate Express server. File-based routing maps cleanly to the small set of pages and API endpoints. |
| Language         | TypeScript                  | 5.x     | Catches shape mismatches between the DB row and component props at compile time — critical when the same `Item` type flows from SQLite through a Route Handler into a React component.  |
| UI Library       | shadcn/ui                   | latest  | Components are owned (copied into `components/ui/`), not installed as a black-box package. Built on Radix UI for accessibility and Tailwind for styling — no separate CSS files needed. |
| Styling          | Tailwind CSS                | 3.x     | Utility-first classes directly in TSX. Pairs natively with shadcn/ui's `cn()` helper for conditional class merging.                                                                     |
| Database         | SQLite via `better-sqlite3` | 9.x     | Single-file database, zero infrastructure. The synchronous API of `better-sqlite3` works cleanly inside Next.js Route Handlers without the ceremony of async/await for every query.     |
| Password hashing | `bcryptjs`                  | 2.x     | Pure-JavaScript bcrypt implementation; no native bindings needed. Acceptable for a prototype with a small user base.                                                                    |
| Icons            | `lucide-react`              | latest  | Consistent icon set used by shadcn/ui; tree-shakeable.                                                                                                                                  |

---

## 2. Database Schema

### 2.1 CREATE TABLE Statements

```sql
CREATE TABLE IF NOT EXISTS users (
  id               INTEGER  PRIMARY KEY AUTOINCREMENT,
  full_name        TEXT     NOT NULL,
  email            TEXT     NOT NULL UNIQUE,
  password_hash    TEXT     NOT NULL,
  apartment_number TEXT     NOT NULL,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  owner_id    INTEGER  NOT NULL,
  name        TEXT     NOT NULL,
  description TEXT,
  status      TEXT     NOT NULL DEFAULT 'available'
                       CHECK(status IN ('available', 'borrowed')),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lending_transactions (
  id           INTEGER  PRIMARY KEY AUTOINCREMENT,
  item_id      INTEGER  NOT NULL,
  borrower_id  INTEGER  NOT NULL,
  borrowed_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  due_date     DATE     NOT NULL,
  returned_at  DATETIME,
  status       TEXT     NOT NULL DEFAULT 'active'
                        CHECK(status IN ('active', 'returned')),
  FOREIGN KEY (item_id)     REFERENCES items(id),
  FOREIGN KEY (borrower_id) REFERENCES users(id)
);
```

### 2.2 ER Diagram (text notation)

```
users
  |id| full_name | email | password_hash | apartment_number | created_at
    │
    │ 1 ──< many
    │
  items
    |id| owner_id(FK→users) | name | description | status | created_at
      │
      │ 1 ──< many
      │
    lending_transactions
      |id| item_id(FK→items) | borrower_id(FK→users) | borrowed_at | due_date | returned_at | status

  users ──< lending_transactions  (via borrower_id)
```

**Key constraint:** Only one `lending_transactions` row may have `status = 'active'` for a given `item_id` at any time. This is enforced at the application layer inside the POST /api/borrow transaction, not at the database level (no partial unique index in SQLite without a generated column — keep it simple for the prototype).

---

## 3. API Contract

All endpoints are Next.js Route Handlers under `app/api/`. Requests and responses use `Content-Type: application/json`.

### 3.1 GET /api/items

Returns all items in the building with the owner's first name and apartment number joined from `users`.

|               | Detail                     |
| ------------- | -------------------------- |
| Method        | `GET`                      |
| Auth required | Yes (valid session cookie) |
| Request body  | None                       |

**Success response — 200 OK:**

```json
[
  {
    "id": 1,
    "name": "Bosch combi-drill",
    "description": "Comes with 3 drill bits",
    "status": "available",
    "owner_first_name": "Ieva",
    "owner_apartment": "1C"
  },
  {
    "id": 4,
    "name": "Electric sander",
    "description": null,
    "status": "borrowed",
    "owner_first_name": "Ieva",
    "owner_apartment": "1C"
  }
]
```

**Error responses:**

| Status | Body                                  | Condition                 |
| ------ | ------------------------------------- | ------------------------- |
| 401    | `{ "error": "Not authenticated" }`    | No valid session cookie   |
| 500    | `{ "error": "Failed to load items" }` | Unexpected database error |

---

### 3.2 POST /api/borrow

Attempts to borrow an item. The availability check and transaction insert are wrapped in a single serialized `better-sqlite3` transaction to prevent double-booking.

|               | Detail                     |
| ------------- | -------------------------- |
| Method        | `POST`                     |
| Auth required | Yes (valid session cookie) |
| Content-Type  | `application/json`         |

**Request body:**

```json
{
  "item_id": 1,
  "borrower_id": 2,
  "due_date": "2026-06-20"
}
```

**Success response — 201 Created:**

```json
{
  "transaction_id": 7,
  "item_id": 1,
  "borrower_id": 2,
  "due_date": "2026-06-20"
}
```

**Error responses:**

| Status | Body                                                             | Condition                                       |
| ------ | ---------------------------------------------------------------- | ----------------------------------------------- |
| 400    | `{ "error": "item_id, borrower_id, and due_date are required" }` | Missing fields                                  |
| 401    | `{ "error": "Not authenticated" }`                               | No valid session cookie                         |
| 404    | `{ "error": "Item not found" }`                                  | `item_id` does not exist                        |
| 409    | `{ "error": "This item is already checked out" }`                | Item status is `"borrowed"` at transaction time |
| 500    | `{ "error": "Borrow request failed" }`                           | Unexpected error                                |

---

### 3.3 PATCH /api/items/[id]/return

Marks an item as returned. Only callable by the item's owner.

|               | Detail                       |
| ------------- | ---------------------------- |
| Method        | `PATCH`                      |
| Auth required | Yes — must be the item owner |
| URL param     | `id` — the item's integer id |

**Request body:** None

**Success response — 200 OK:**

```json
{ "message": "Item marked as returned" }
```

**Error responses:**

| Status | Body                                            | Condition                           |
| ------ | ----------------------------------------------- | ----------------------------------- |
| 401    | `{ "error": "Not authenticated" }`              | No session cookie                   |
| 403    | `{ "error": "You do not own this item" }`       | Authenticated user is not the owner |
| 404    | `{ "error": "Item not found" }`                 | `id` does not exist                 |
| 409    | `{ "error": "Item is not currently borrowed" }` | Status is already `"available"`     |

---

### 3.4 POST /api/auth/login

Authenticates a user and sets a session cookie.

**Request body:**

```json
{ "email": "mantas.p@toolshare.lt", "password": "toolshare123" }
```

**Success response — 200 OK:**

```json
{ "id": 2, "full_name": "Mantas Petrauskas" }
```

Sets cookie: `toolshare_session` (HTTP-only, SameSite=Lax, 7-day expiry).

**Error responses:** 400 (missing fields), 401 (invalid credentials).

---

### 3.5 POST /api/auth/logout

Clears the session cookie.

**Success response — 200 OK:** `{ "message": "Logged out" }`

---

## 4. Application Folder Structure

```
app/                          ← Next.js project root
│
├── app/                      ← App Router (pages + API)
│   ├── layout.tsx            ← Root layout: HTML shell, Navbar, Toaster
│   ├── page.tsx              ← Login page (/ route)
│   ├── dashboard/
│   │   └── page.tsx          ← Item catalog (Server Component)
│   └── api/
│       ├── items/
│       │   └── route.ts      ← GET /api/items
│       ├── borrow/
│       │   └── route.ts      ← POST /api/borrow
│       ├── items/[id]/
│       │   └── return/
│       │       └── route.ts  ← PATCH /api/items/[id]/return
│       └── auth/
│           ├── login/
│           │   └── route.ts
│           └── logout/
│               └── route.ts
│
├── components/
│   ├── ui/                   ← shadcn/ui owned components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── sonner.tsx        ← Toast (Sonner integration)
│   ├── ItemCard.tsx
│   ├── ItemFeed.tsx          ← "use client"
│   ├── BorrowModal.tsx       ← "use client"
│   └── Navbar.tsx
│
├── lib/
│   ├── db.ts                 ← better-sqlite3 singleton + schema init
│   └── utils.ts              ← cn() helper from shadcn
│
├── types/
│   └── index.ts              ← Item, User, Transaction interfaces
│
├── public/
│   └── logo.svg
│
├── components.json           ← shadcn/ui CLI config
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

**Why Server vs Client Components are split this way:**

- `app/dashboard/page.tsx` is a Server Component — it fetches items directly from `lib/db.ts` without making an HTTP request to itself, which is faster and avoids a network hop.
- `components/ItemFeed.tsx` must be a Client Component (`"use client"`) because it manages the local optimistic-update state after a borrow action.
- `components/BorrowModal.tsx` is a Client Component because it controls dialog open/close state and fires the POST request.
- Route Handlers (`app/api/**`) run exclusively on the server and can safely import `lib/db.ts`.

---

## 5. UI Wireframe Descriptions

### Screen 1 — Login Page (`/`)

**Layout:** Single centred column, vertically centred on the viewport.

```
┌──────────────────────────────────┐
│                                  │
│        🔧  ToolShare             │  ← Logo + wordmark, centred
│                                  │
│  ┌────────────────────────────┐  │
│  │  Email                     │  │  ← shadcn/ui Input
│  │  vardas@paštas.lt          │  │    (placeholder in Lithuanian)
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Password                  │  │  ← shadcn/ui Input type="password"
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │         Sign in            │  │  ← shadcn/ui Button (full width)
│  └────────────────────────────┘  │
│                                  │
│  ⚠ Invalid email or password     │  ← Inline error (only on failure)
│                                  │
└──────────────────────────────────┘
```

Components used: `Card`, `CardContent`, `CardHeader`, `CardTitle`, `Input`, `Label`, `Button`

---

### Screen 2 — Item Catalog Dashboard (`/dashboard`)

**Layout:** Full-width page with top Navbar and a responsive grid below.

```
┌─────────────────────────────────────────────────────┐
│  🔧 ToolShare          Mantas P.   [Sign out]        │  ← Navbar
├─────────────────────────────────────────────────────┤
│                                                     │
│  [+ List an item]                        (filter)   │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  │ Bosch drill  │  │ Ladder 6m    │  │ Monopoly     │
│  │ Ieva · 1C    │  │ Rūta · 3A    │  │ Simona · 5B  │
│  │ ● Available  │  │ ● Available  │  │ ● Available  │
│  │  [Borrow]    │  │  [Borrow]    │  │  [Borrow]    │
│  └──────────────┘  └──────────────┘  └──────────────┘
│
│  ┌──────────────┐  ┌──────────────┐
│  │ Elec. sander │  │ Ext. reel    │
│  │ Ieva · 1C    │  │ Rūta · 3A    │
│  │ ○ Borrowed   │  │ ● Available  │
│  │ [Checked out]│  │  [Borrow]    │
│  └──────────────┘  └──────────────┘
│                                                     │
└─────────────────────────────────────────────────────┘
```

Components used: `Navbar`, `ItemFeed`, `ItemCard`, `Badge` (green/grey), `Button` (active/disabled)

---

### Screen 3 — Borrow Confirmation Modal

**Layout:** shadcn/ui `Dialog` overlaid on the dashboard grid (backdrop blur).

```
┌──────────────────────────────────────┐
│  Borrow this item?                   │  ← Dialog title
├──────────────────────────────────────┤
│                                      │
│  Item:    Bosch combi-drill          │
│  Owner:   Ieva K. · Apt 1C           │
│                                      │
│  Return by:                          │
│  ┌─────────────────────────────────┐ │
│  │  📅  Select a date...           │ │  ← date input
│  └─────────────────────────────────┘ │
│                                      │
│  ┌──────────────┐  ┌──────────────┐  │
│  │    Cancel    │  │    Confirm   │  │  ← outline / default Button
│  └──────────────┘  └──────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

Components used: `Dialog`, `DialogHeader`, `DialogTitle`, `DialogContent`, `DialogFooter`, `Button` (variant="outline" and default), `Input` (type="date")

---

## 6. PostgreSQL Migration Path

SQLite is appropriate for a single-building prototype. If ToolShare were to expand to multiple buildings, the migration path to PostgreSQL is straightforward:

1. Replace `better-sqlite3` with `pg` or Prisma.
2. Swap the synchronous `db.transaction()` call for a PostgreSQL `BEGIN / COMMIT` block or a Prisma `$transaction`.
3. The SQL schema above is fully portable — no SQLite-specific types or functions were used.
4. The CHECK constraints (`status IN (...)`) are supported in PostgreSQL identically.
5. The Next.js Route Handlers and components do not change — the database is only touched in `lib/db.ts` and the route handlers.
