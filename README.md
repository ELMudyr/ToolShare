# ToolShare

**Author:** Oussama Dadouch  
A micro-local tool and item-sharing web app for apartment buildings. Neighbours list, browse, and borrow rarely-used household items — reducing waste and saving storage space.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2 (App Router, TypeScript) |
| UI components | @base-ui/react 1.5 + Tailwind CSS 3.4 |
| Icons | lucide-react |
| Notifications | sonner |
| Database | better-sqlite3 (SQLite, WAL mode) |
| Auth | HTTP-only cookie session (base64 JSON) |
| Password hashing | bcryptjs |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & run

```bash
cd app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).  
The SQLite database (`toolshare.db`) and seed data are created automatically on first boot.

### Other scripts

```bash
npm run build   # production build
npm run start   # run production server
npm run lint    # ESLint check
```

---

## Seed Accounts

Five accounts are seeded on first boot. Use any of these to log in:

| Name | Email | Password |
|---|---|---|
| Ieva Kazlauskienė | ieva.k@toolshare.lt | password123 |
| Mantas Petrauskas | mantas.p@toolshare.lt | password123 |
| Rūta Stankevičiūtė | ruta.s@toolshare.lt | password123 |
| Lukas Žukauskas | lukas.z@toolshare.lt | password123 |
| Simona Daukšaitė | simona.d@toolshare.lt | password123 |

---

## Project Structure

```
app/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout — Navbar, Toaster
│   ├── page.tsx                # Login page
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard — Server Component, direct DB fetch
│   └── api/
│       ├── auth/
│       │   ├── login/          # POST  — issue session cookie
│       │   ├── logout/         # POST  — clear session cookie
│       │   ├── register/       # POST  — create account
│       │   ├── profile/        # PATCH — update name / email / apartment / avatar
│       │   └── password/       # PATCH — change password (bcrypt verify + rehash)
│       ├── items/
│       │   ├── route.ts        # GET all items  |  POST create item
│       │   └── [id]/return/    # PATCH — return a borrowed item
│       ├── borrow/
│       │   ├── route.ts        # POST — borrow an item (serialised transaction, 409 guard)
│       │   └── [id]/
│       │       ├── cancel/     # PATCH — cancel active borrow
│       │       └── extend/     # PATCH — extend due date (conflict check)
│       ├── my-borrows/         # GET  — active borrows for current user
│       └── upload/             # POST — image upload → public/uploads/
│
├── components/
│   ├── ui/                     # Base-UI wrappers (Button, Dialog, Tabs, …)
│   ├── Navbar.tsx              # Sticky nav — logo, apartment badge, profile dropdown
│   ├── ProfileDropdown.tsx     # Avatar pill → Edit profile / Change password / Sign out
│   ├── DashboardShell.tsx      # Stats grid + tabbed view (Browse / Borrows / Listings)
│   ├── ItemFeed.tsx            # Search, filter, sort + responsive item grid
│   ├── ItemCard.tsx            # Item card with real photo, status badge, borrow button
│   ├── BorrowModal.tsx         # Borrow confirmation dialog — date picker + notes
│   ├── MyBorrows.tsx           # Active borrows — progress bar, extend, cancel
│   └── AddItemModal.tsx        # List a new item — name, description, photo upload
│
├── lib/
│   ├── db.ts                   # SQLite singleton, schema migration, seed data
│   ├── session.ts              # getSession() — reads HTTP-only cookie
│   ├── itemVisuals.ts          # getItemVisual() — category colours + getInitials()
│   └── utils.ts                # cn() Tailwind class merger
│
├── types/
│   └── index.ts                # Item, ActiveBorrow, SessionUser interfaces
│
└── public/
    └── uploads/                # User-uploaded item & avatar images
```

---

## Key Features

- **Browse & borrow** — search, filter by status, sort by name / newest / availability
- **Borrow confirmation** — date picker (tomorrow → +90 days), optional note to owner
- **Race-condition safe** — availability check and status update wrapped in a single SQLite transaction; returns `409` on concurrent collision
- **Extend borrow** — push due date forward as long as no other booking conflicts
- **Cancel borrow** — returns item to available immediately
- **Photo support** — Unsplash photos for seed items; file upload for user-added items and profile pictures
- **Profile management** — edit name, email, apartment, profile picture; change password
- **Mobile-first** — responsive grid, stacked tab bar, always-visible action buttons

---

## Database Schema

```sql
CREATE TABLE users (
  id               INTEGER  PRIMARY KEY AUTOINCREMENT,
  full_name        TEXT     NOT NULL,
  email            TEXT     NOT NULL UNIQUE,
  password_hash    TEXT     NOT NULL,
  apartment_number TEXT     NOT NULL,
  avatar_url       TEXT,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  owner_id    INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT     NOT NULL,
  description TEXT,
  image_url   TEXT,
  status      TEXT     NOT NULL DEFAULT 'available'
                       CHECK(status IN ('available', 'borrowed')),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lending_transactions (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  item_id     INTEGER  NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  borrower_id INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  borrowed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  due_date    TEXT     NOT NULL,
  returned_at DATETIME,
  status      TEXT     NOT NULL DEFAULT 'active'
                       CHECK(status IN ('active', 'returned', 'cancelled')),
  notes       TEXT
);
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Sign in, receive session cookie |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `POST` | `/api/auth/register` | Create a new account |
| `PATCH` | `/api/auth/profile` | Update name, email, apartment, avatar |
| `PATCH` | `/api/auth/password` | Change password |
| `GET` | `/api/items` | List all items (with owner info) |
| `POST` | `/api/items` | Create a new item listing |
| `PATCH` | `/api/items/[id]/return` | Mark item as returned |
| `GET` | `/api/my-borrows` | Active borrows for current user |
| `POST` | `/api/borrow` | Request to borrow an item |
| `PATCH` | `/api/borrow/[id]/cancel` | Cancel an active borrow |
| `PATCH` | `/api/borrow/[id]/extend` | Extend borrow due date |
| `POST` | `/api/upload` | Upload an image file (≤ 5 MB) |

---

## Documentation

Full project documentation lives in `../docs/`:

| File | Contents |
|---|---|
| `docs/01_ProjectPlan.md` | Project charter, WBS, Gantt chart, risk register |
| `docs/02_BusinessAnalysis.md` | Personas, user stories, data dictionary, borrowing workflow |
| `docs/03_TechnicalSpec.md` | Tech stack rationale, DB schema, API contract, UI wireframes |
| `docs/04_QA_Testing.md` | Test strategy, test cases (TC-01 → TC-06), RTM |
| `retrospective/05_Retrospective.md` | Lessons learned across PM, BA, Dev, and QA roles |

