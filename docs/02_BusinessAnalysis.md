# ToolShare — Business Analysis Document

**Document Type:** Business Analysis Package  
**Author:** Oussama Dadouch  
**Version:** 1.0  
**Date:** May 9, 2026

---

## 1. Problem Statement & Target Audience

### 1.1 Problem Statement

Urban apartment residents accumulate household tools and equipment that serve a specific, infrequent purpose: a power drill used once to hang a mirror, a ladder borrowed from a friend to change a ceiling bulb, a carpet steamer rented from a hardware shop for one afternoon. The pattern is consistent — the item is needed, used briefly, and then either stored (taking up scarce space) or purchased new (a wasteful expense when the same item sits unused in a neighbour's storage locker).

The root cause is not a lack of tools in the building — it is a lack of visibility. Neighbours do not know what each other owns, and the social friction of knocking on doors to ask is high enough that most people simply buy or rent instead.

ToolShare addresses this by providing a frictionless, always-available digital catalogue of items that building residents have voluntarily listed for borrowing. The system does not facilitate money, ratings, or complex logistics — it simply makes the inventory visible and provides a lightweight workflow for managing a lending agreement.

### 1.2 Target Audience

**Primary users:** Residents of apartment buildings in urban centres, aged 22–55, who:

- Live in units smaller than 80 m² where storage space is a genuine constraint.
- Own at least one household tool or appliance they use fewer than 3 times per year.
- Are comfortable using a web application on a mobile phone.

**Secondary users:** Building managers who may choose to host a ToolShare instance for their building as a resident benefit.

**Out of scope for v1:** Commercial landlords, co-working spaces, neighbourhoods (non-building), or any user who expects financial transactions.

---

## 2. User Personas

### Persona 1 — Gintarė Valančiūtė (The Lender)

| Attribute    | Detail                                                  |
| ------------ | ------------------------------------------------------- |
| Full name    | Gintarė Valančiūtė                                      |
| Age          | 34                                                      |
| Occupation   | Interior designer, self-employed                        |
| Lives in     | Apartment 4B, 2-bedroom unit                            |
| Tech comfort | High — uses smartphone daily, comfortable with web apps |

**Background:** Gintarė has lived in her apartment for six years. Over time she has collected a Bosch combi-drill, an aluminium ladder, a tile cutter, and several other tools that she used during renovation projects but rarely touches now. They sit in a storage locker below the building, collectively occupying a full shelf. She does not want to sell them — she might need them again — but she also feels vaguely guilty about how rarely they are used.

**Goals:**

- List items quickly, with minimal form-filling.
- Know who has her item and when it is due back.
- Trust that the borrower is a verified building resident.

**Frustrations:**

- She once lent her drill to a neighbour verbally and it took three weeks and two reminder conversations to get it back.
- She does not want to manage a spreadsheet or WhatsApp thread to track her items.

**Quote:** _"I have a perfectly good drill collecting dust. If someone in the building needs it, they can use it — I just want to know where it is."_

---

### Persona 2 — Tomas Januševičius (The Borrower)

| Attribute    | Detail                                       |
| ------------ | -------------------------------------------- |
| Full name    | Tomas Januševičius                           |
| Age          | 27                                           |
| Occupation   | Software support analyst                     |
| Lives in     | Apartment 2A, studio flat                    |
| Tech comfort | Very high — developer background, power user |

**Background:** Tomas rents a studio apartment. He has very few tools — a hammer, a screwdriver set, and a tape measure. He has never bought a drill because he knows he would use it once and forget about it. When he recently needed to mount a TV bracket, he spent €40 renting a drill from a hardware shop across town, only to discover that the shop's drill had a flat battery and the replacement took 45 minutes to arrive.

**Goals:**

- Find an available item in under a minute.
- Confirm a borrow request without leaving the app.
- Know exactly when he is expected to return the item.

**Frustrations:**

- Renting tools from shops is expensive and inconvenient.
- Buying tools he will use once is wasteful.
- Informal WhatsApp lending arrangements in the building are chaotic.

**Quote:** _"Why would I spend €40 at a hardware shop when there's probably a drill two floors above me?"_

---

## 3. Functional Requirements — User Stories

### US-01 — Browse Available Items

> **As a** logged-in resident,  
> **I want to** see a list of all items available to borrow in my building,  
> **So that** I can quickly identify whether something I need is already in the building.

**Acceptance Criteria:**

```
Given I am logged in as Tomas Januševičius
When I navigate to /dashboard
Then I see a grid of item cards, each displaying:
  - Item name
  - Owner first name and apartment number
  - A green "Available" badge if status = "available"
  - A grey "Borrowed" badge if status = "borrowed"
  - A "Borrow" button (enabled if available, disabled if borrowed)

Given there are no items listed in the building
When I navigate to /dashboard
Then I see an empty state message reading "No items listed yet."

Given an item's status has just changed to "borrowed"
When I view that item card
Then the button reads "Checked out" and is visually disabled (grey, non-clickable)
```

---

### US-02 — Borrow an Item

> **As a** logged-in resident,  
> **I want to** submit a borrow request for an available item,  
> **So that** the lender knows I have it and I have a confirmed return deadline.

**Acceptance Criteria:**

```
Given I am logged in as Tomas Januševičius
And the item "Bosch drill" owned by Ieva Kazlauskienė has status "available"
When I click "Borrow" on the Bosch drill card
Then a confirmation modal opens showing:
  - Item name: "Bosch drill"
  - Owner: "Ieva K."
  - A date picker for the return date

Given I select a return date of June 20, 2026 and click "Confirm"
When the POST /api/borrow request completes successfully
Then the modal closes
And the Bosch drill card updates immediately to show status "Borrowed" (grey badge, disabled button)
And a success toast notification appears reading "Borrow request confirmed"

Given another user submits a borrow request for the same item at the same time
When my POST /api/borrow request is processed
Then I receive an error response (HTTP 409)
And the modal displays: "Sorry, this item was just taken. Please try another."
```

---

### US-03 — List an Item for Lending

> **As a** logged-in resident who owns a tool,  
> **I want to** list my item on the platform,  
> **So that** my neighbours know it is available and can request to borrow it.

**Acceptance Criteria:**

```
Given I am logged in as Gintarė Valančiūtė
When I click "List an item" on the dashboard
Then a form appears with fields: Item name (required), Description (optional)

Given I enter "6m aluminium ladder" in the name field and submit
When the form submission completes successfully
Then the new item card appears in the dashboard grid with status "Available"
And the item is owned by Gintarė Valančiūtė (apartment 4B)

Given I leave the item name field blank and click submit
Then the form shows a validation error: "Item name is required"
And no request is sent to the server
```

---

### US-04 — Mark an Item as Returned

> **As a** logged-in lender,  
> **I want to** mark a borrowed item as returned when I get it back,  
> **So that** the item becomes available for other residents to borrow again.

**Acceptance Criteria:**

```
Given I am logged in as Ieva Kazlauskienė
And my item "Bosch drill" is currently on loan to Tomas Januševičius
When I navigate to "My Items" and click "Mark as Returned" on the Bosch drill
Then the lending_transaction record for that borrow updates:
  - status → "returned"
  - returned_at → current timestamp

And the item record updates:
  - status → "available"

And the item card on the dashboard now shows a green "Available" badge
And the "Borrow" button is re-enabled
```

---

### US-05 — Reject an Invalid Login Attempt

> **As a** building resident,  
> **I want to** be prevented from logging in with incorrect credentials,  
> **So that** other residents' accounts and item data remain private.

**Acceptance Criteria:**

```
Given I am on the login page at /
When I enter the email "mantas.p@toolshare.lt" with an incorrect password and click "Sign in"
Then the POST /api/auth/login request returns HTTP 401
And the form displays an inline error: "Invalid email or password"
And I remain on the login page (no redirect to /dashboard)
And no session cookie is set

Given I leave the email field blank and click "Sign in"
Then the form displays a client-side validation error: "Email is required"
And no request is sent to the server

Given I enter correct credentials for Mantas Petrauskas
When I click "Sign in"
Then I am redirected to /dashboard
And an HTTP-only session cookie is set for the duration of the session
```

---

## 4. Data Dictionary

### 4.1 Entity: `users`

| Column             | Data Type  | Constraints                 | Description                                                   |
| ------------------ | ---------- | --------------------------- | ------------------------------------------------------------- |
| `id`               | `INTEGER`  | `PRIMARY KEY AUTOINCREMENT` | Internal unique identifier                                    |
| `full_name`        | `TEXT`     | `NOT NULL`                  | Resident's full name (e.g. "Ieva Kazlauskienė")               |
| `email`            | `TEXT`     | `NOT NULL UNIQUE`           | Login credential; must be unique across all users             |
| `password_hash`    | `TEXT`     | `NOT NULL`                  | bcrypt hash of the user's password; plaintext is never stored |
| `apartment_number` | `TEXT`     | `NOT NULL`                  | Apartment identifier (e.g. "4B"); displayed on item cards     |
| `created_at`       | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Timestamp when the account was created                        |

---

### 4.2 Entity: `items`

| Column        | Data Type  | Constraints                                                               | Description                                                          |
| ------------- | ---------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `id`          | `INTEGER`  | `PRIMARY KEY AUTOINCREMENT`                                               | Internal unique identifier                                           |
| `owner_id`    | `INTEGER`  | `NOT NULL, FOREIGN KEY → users(id) ON DELETE CASCADE`                     | References the resident who owns the item                            |
| `name`        | `TEXT`     | `NOT NULL`                                                                | Short item name (e.g. "Bosch combi-drill")                           |
| `description` | `TEXT`     | `NULL allowed`                                                            | Optional longer description of condition, included accessories, etc. |
| `status`      | `TEXT`     | `NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'borrowed'))` | Current availability state; only two valid values                    |
| `created_at`  | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP`                                               | Timestamp when the item was listed                                   |

---

### 4.3 Entity: `lending_transactions`

| Column        | Data Type  | Constraints                                                         | Description                                                          |
| ------------- | ---------- | ------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `id`          | `INTEGER`  | `PRIMARY KEY AUTOINCREMENT`                                         | Internal unique identifier                                           |
| `item_id`     | `INTEGER`  | `NOT NULL, FOREIGN KEY → items(id)`                                 | References the item being borrowed                                   |
| `borrower_id` | `INTEGER`  | `NOT NULL, FOREIGN KEY → users(id)`                                 | References the user who is borrowing                                 |
| `borrowed_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP`                                         | When the borrow was confirmed                                        |
| `due_date`    | `DATE`     | `NOT NULL`                                                          | Agreed return date, supplied by the borrower at request time         |
| `returned_at` | `DATETIME` | `NULL allowed`                                                      | Populated when the lender marks the item returned; NULL while active |
| `status`      | `TEXT`     | `NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'returned'))` | Lifecycle state of the transaction                                   |

---

### 4.4 Entity Relationships Summary

```
users  ──< items               (one user owns many items)
users  ──< lending_transactions (one user borrows many items over time)
items  ──< lending_transactions (one item has many historical transactions; only one can be active at a time)
```

**Business rule enforced at the application layer:** Before inserting a new `lending_transaction`, the API must confirm that `items.status = 'available'`. This check and the subsequent write happen inside a single serialized SQLite transaction to prevent race conditions.

---

## 5. Process Flow — Borrowing Workflow

The following describes the end-to-end borrowing workflow from the borrower's perspective.

```
Step 1 — Authentication
  Tomas navigates to toolshare.app (or localhost:3000)
  He enters his email (mantas.p@toolshare.lt or his own) and password
  POST /api/auth/login sets an HTTP-only session cookie
  He is redirected to /dashboard

Step 2 — Browse
  /dashboard (Server Component) queries the database directly
  Items are rendered as a responsive grid of ItemCard components
  Available items show a green "Available" badge and an active "Borrow" button
  Already-borrowed items show a grey "Borrowed" badge and a disabled "Checked out" button

Step 3 — Select Item
  Tomas identifies "Bosch drill" owned by Ieva (Apt 1C) as available
  He clicks the "Borrow" button on the ItemCard
  The BorrowModal dialog opens client-side (no network request yet)

Step 4 — Confirm Request
  The modal shows: item name, owner name, and a date picker
  Tomas selects a return date
  He clicks "Confirm"
  The client sends: POST /api/borrow { item_id, borrower_id, due_date }

Step 5 — Server-Side Processing (Critical Path)
  The route handler opens a better-sqlite3 transaction
  Inside the transaction:
    a) SELECT status FROM items WHERE id = ? (check availability)
    b) If status ≠ 'available' → rollback → return HTTP 409
    c) UPDATE items SET status = 'borrowed' WHERE id = ?
    d) INSERT INTO lending_transactions (item_id, borrower_id, due_date)
  Transaction commits atomically

Step 6 — UI Update
  On HTTP 201: modal closes, success toast fires
  ItemFeed's local React state updates optimistically:
    the borrowed item's status flips to "borrowed"
  The ItemCard re-renders: badge goes grey, button disables — no page reload needed

Step 7 — Return
  When Tomas returns the drill, Ieva logs in and navigates to "My Items"
  She clicks "Mark as Returned"
  PATCH /api/items/:id/return updates:
    lending_transactions.status → 'returned'
    lending_transactions.returned_at → NOW()
    items.status → 'available'
  The item card reflects "Available" again on next dashboard load
```
