# ToolShare — QA & Testing Documentation

**Document Type:** Quality Assurance Package  
**Author:** Oussama Dadouch  
**Version:** 1.0  
**Date:** June 5, 2026

---

## 1. Test Strategy

### 1.1 Objectives

The testing strategy for ToolShare aims to verify:

- All five user stories produce the expected system behaviour.
- The critical `POST /api/borrow` endpoint is safe under concurrent access.
- UI components correctly reflect server-side state changes without a page reload.
- Invalid inputs at system boundaries are handled gracefully.

### 1.2 Testing Levels Applied

| Level                     | Scope                                      | Applied To                                                                                        |
| ------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| **Unit**                  | Individual functions in isolation          | `getSession()` helper, date validation in `BorrowModal`, first-name extraction SQL expression     |
| **Integration**           | Route handler + database together          | `POST /api/borrow` → SQLite transaction → item status update; `POST /api/auth/login` → cookie set |
| **User Acceptance (UAT)** | Full user workflow end-to-end in a browser | Mantas logs in → browses items → borrows a drill → sees confirmation → item shows "Borrowed"      |
| **Boundary**              | Edge cases at input limits                 | Missing fields in request body, invalid item_id, attempting to return an already-available item   |

### 1.3 Tools

- **Manual testing:** Local dev server (`npm run dev`), browser DevTools for cookie inspection.
- **API testing:** cURL or browser fetch console for route handler assertions.
- **TypeScript:** Static type-checking (`npx tsc --noEmit`) serves as an automated pre-test gate.

---

## 2. Test Cases

| Test ID   | Component                        | Description                                                                  | Input Steps                                                                                                                                                                                                                   | Expected Result                                                                                                                                                                                                   | Actual Result |
| --------- | -------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| **TC-01** | `POST /api/borrow`               | Successful borrow by Mantas Petrauskas                                       | 1. Log in as `mantas.p@toolshare.lt` / `toolshare123` 2. Navigate to `/dashboard` 3. Click "Borrow" on "Bosch combi-drill" (owned by Ieva, status: available) 4. Select return date June 25, 2026 5. Click "Confirm"          | HTTP 201; response contains `transaction_id`; `items.status` updates to `"borrowed"` in DB; drill card shows grey "Borrowed" badge, disabled "Checked out" button                                                 | **PASSED**    |
| **TC-02** | `POST /api/borrow` (concurrency) | Two simultaneous borrow requests for the same item — only one should succeed | 1. Ensure "6m aluminium ladder" status is `"available"` 2. Send two POST requests to `/api/borrow` with `item_id` pointing to the ladder within the same millisecond (simulated via two rapid fetch calls in browser console) | First request: HTTP 201, item status → `"borrowed"`. Second request: HTTP 409 with `{ "error": "This item is already checked out" }`. Item status in DB remains `"borrowed"` — no duplicate transaction inserted. | **PASSED**    |
| **TC-03** | `ItemCard` + `ItemFeed`          | UI state update — button disables without page reload                        | 1. Log in as `lukas.z@toolshare.lt` 2. Dashboard loads; "Extension reel" shows green "Available" badge and active "Borrow" button 3. Click "Borrow", select date, click "Confirm"                                             | On HTTP 201 response: `ItemFeed` local state updates optimistically; "Extension reel" card immediately shows grey "Borrowed" badge and disabled "Checked out" button. No full page navigation occurs.             | **PASSED**    |
| **TC-04** | `POST /api/auth/login`           | Login with incorrect password — no session set                               | 1. Navigate to `/` 2. Enter `mantas.p@toolshare.lt` with password `wrongpassword` 3. Click "Sign in"                                                                                                                          | HTTP 401; login page stays visible; inline error reads "Invalid email or password"; browser DevTools shows no `toolshare_session` cookie was set; no redirect to `/dashboard`.                                    | **PASSED**    |
| **TC-05** | `POST /api/borrow` (boundary)    | Missing `due_date` field in request body                                     | 1. Log in 2. Send POST to `/api/borrow` with body `{ "item_id": 1 }` (no `due_date`)                                                                                                                                          | HTTP 400 with `{ "error": "item_id and due_date are required" }`. No DB write occurs.                                                                                                                             | **PASSED**    |
| **TC-06** | `PATCH /api/items/[id]/return`   | Lender marks a borrowed item as returned                                     | 1. Log in as `ieva.k@toolshare.lt` 2. Send PATCH to `/api/items/4/return` (Electric sander, currently borrowed)                                                                                                               | HTTP 200; `items.status` → `"available"`; `lending_transactions.status` → `"returned"`; `lending_transactions.returned_at` populated with current timestamp.                                                      | **PASSED**    |

---

## 3. Requirements Traceability Matrix (RTM)

| User Story | Story Summary            | Dev Task(s)                                                                               | Verifying Test Case(s)                 | Status                      |
| ---------- | ------------------------ | ----------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------- |
| **US-01**  | Browse available items   | `app/dashboard/page.tsx` (server-side fetch) · `ItemFeed.tsx` · `ItemCard.tsx` with Badge | TC-03 (item visible pre-borrow)        | ✅ Covered                  |
| **US-02**  | Borrow an item           | `POST /api/borrow` route handler · `BorrowModal.tsx` · `ItemFeed` optimistic update       | TC-01, TC-02, TC-03, TC-05             | ✅ Covered                  |
| **US-03**  | List an item for lending | _(Seeded via `lib/db.ts` for prototype; full "list item" form is deferred post-v1)_       | TC-01 (seed item used as test fixture) | ⚠ Partially covered by seed |
| **US-04**  | Mark an item as returned | `PATCH /api/items/[id]/return` route handler · DB transaction update                      | TC-06                                  | ✅ Covered                  |
| **US-05**  | Reject invalid login     | `POST /api/auth/login` · bcrypt comparison · client-side form validation                  | TC-04                                  | ✅ Covered                  |

---

## 4. Defects Log

No defects open at time of writing. One defect was found and resolved during development:

| Defect ID | Description                                                                                                                                                                           | Severity | Resolution                                                                                                                                 | Status                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| BUG-01    | `POST /api/borrow` initially returned a silent HTTP 200 (no error) when the item was already borrowed, because the early-exit check was returning before the transaction was entered. | High     | Moved the availability check **inside** the `db.transaction()` callback so the check and write are atomic. Now correctly returns HTTP 409. | Resolved — `fix: return 409 on concurrent borrow attempt instead of silent fail` |
