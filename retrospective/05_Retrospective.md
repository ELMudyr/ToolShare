# ToolShare — Project Retrospective & Lessons Learned

**Author:** Oussama Dadouch  
**Date:** June 13, 2026  
**Project Duration:** May 5 – June 13, 2026 (6 weeks)

---

## Opening Reflection

Building ToolShare end-to-end as a solo practitioner covering all four roles — Project Manager, Business Analyst, Developer, and QA Tester — forced me to think about every layer of software delivery simultaneously. Wearing four hats in the same week is genuinely different from specialising. There is no one else to blame when the requirements are vague, no handoff meeting to catch a misunderstanding, and no QA team to find the bug you introduced at 11pm. But there is also no communication overhead, no misaligned priorities, and no distance between the user story and the code that implements it.

What follows is an honest account of what I learned in each of those four roles.

---

## As a Project Manager

The single most valuable thing I did in Week 1 was write the "Out of Scope" list in `entryPoint.md` before writing a single line of code.

Twice during the development phase I found myself about to add a feature that was not in any user story. The first was a star rating system for lenders — "it would only take an extra table and a small UI component." The second was a push notification when your borrowed item was overdue. Both ideas were real improvements. Both were dropped immediately because they were not in the scope document, and adding them would have meant either extending the 6-week timeline or cutting corners on the QA phase.

Working solo, the biggest risk to a project is not a technical one — it is the developer's own enthusiasm. There is no product manager saying no. There is no sprint planning ceremony that forces you to estimate how long something actually takes. Scope creep is seductive when you are both the person with the idea and the person who could implement it in an afternoon.

The critical path discipline was equally important. By establishing early that the order was DB schema → Route Handlers → Next.js Components → UAT, I never got into a situation where I was building UI for an API that didn't exist yet. When I finished the `POST /api/borrow` handler on May 23, I had a testable, confirmed foundation before touching any React code. That sequence felt slow in the moment and saved hours later.

**What I would do differently:** Add a daily 10-minute planning note — even a bullet point — to capture what was actually done each day. Reconstructing the commit history after the fact is possible but noisier than a live log.

---

## As a Business Analyst

The gap between "users want to borrow things easily" and "the database requires `items.status` to be either `'available'` or `'borrowed'` with no nulls and a CHECK constraint" is wider than it looks on a whiteboard.

The user story for borrowing (US-02) started as a single sentence: "As Tomas, I want to borrow a drill." Writing the Given-When-Then acceptance criteria turned that sentence into seven distinct requirements — what the modal shows, what happens on a 409, what the button looks like after, what happens if no date is selected. Every one of those criteria became a concrete piece of code or a QA test case.

The most instructive exercise was writing the Data Dictionary before touching any SQL. I spent an hour arguing with myself about whether `status` should be a foreign key to a lookup table or a CHECK constraint on the column itself. For this scale of prototype, the CHECK constraint was the right call. But thinking through the tradeoff made me realise how much the schema constrains the application behaviour — the schema is not a technical detail, it is the formalisation of the business rules.

The borrowing workflow (Section 5 of the BA document) was also more valuable than I expected. Writing it as seven sequential steps forced me to identify Step 5 — the server-side transaction — as the point where everything could go wrong. That diagnosis is what led to the `db.transaction()` implementation being prioritised and tested explicitly.

**What I would do differently:** Write a negative-path workflow alongside the happy-path one. The happy-path workflow shows what happens when everything works. A negative-path shows what happens when the item is already borrowed, when the user's session expires, when the database is locked. Several edge cases in TC-02 and TC-05 were discovered during test writing that I would have caught earlier with a formal negative-path diagram.

---

## As a Developer

The technical challenge I underestimated most was the boundary between server-side data and client-side state.

The `/dashboard` page is a Next.js Server Component. It reads from SQLite directly at render time and passes `initialItems` to the `ItemFeed` Client Component. This works beautifully for the initial page load — no network hop, no loading skeleton, no race condition on mount. But the moment a user clicks "Borrow" and the `POST /api/borrow` request succeeds, the Client Component's local state (`useState<Item[]>`) diverges from the server's actual database state.

I handled this with an optimistic update: on a successful borrow, `ItemFeed` immediately flips the borrowed item's status in its local state without re-fetching from the server. This makes the UI feel instant. But it introduced a subtle bug that I hit in manual testing: if the user navigated away from `/dashboard` and came back (triggering a fresh server render), the item correctly showed as "Borrowed" because the DB was updated. However, if they clicked "Borrow" on an item, got a 409 (someone else had just taken it), and did not refresh, the local state still showed that item as "Available" — because the optimistic update only runs on success, but the initial `useState` still held the stale server-rendered state.

The fix was straightforward: on a 409, force a `router.refresh()` to re-run the Server Component and get fresh data. But recognising _why_ the stale state happened required understanding the full Server Component → Client Component data flow, which is not obvious the first time you build with the Next.js App Router.

**What I would do differently:** Start every new feature by drawing the data flow: where does the data live, who owns it, what happens when it changes? Even a three-box diagram would have caught the stale-state issue before the code was written.

---

## As a Tester

TC-02 — the concurrent borrow test — was the most important test case in the project, and I almost skipped it.

My first instinct was to test only the happy path (TC-01) and the basic error cases (TC-04, TC-05). The concurrent booking test felt academic for a single-building prototype. In practice, two neighbours would be unlikely to request the same item within the same millisecond.

But writing the test case before fixing the code revealed something: my first implementation of `POST /api/borrow` had the availability check _outside_ the transaction, and the status update _inside_ it. Under normal sequential use, this worked fine. Under a simulated concurrent call, both requests passed the check before either one committed the update — the classic TOCTOU (time-of-check to time-of-use) pattern. Both requests received HTTP 201, two lending transactions were inserted, and the item showed "Borrowed" with two active transactions in the DB.

This is the kind of bug that would have been invisible in all happy-path testing and would have surfaced in production at the worst possible time — when the app was actually being used. Writing TC-02 first made me think about the transactional boundary before writing the code, which led directly to the correct implementation: availability check and insert, both inside the same `db.transaction()` call.

**What I would do differently:** Adopt test-first more consistently — not necessarily full TDD, but writing the test case description and expected result before starting on the implementation of any endpoint that writes to the database. The discipline of asking "how would I break this?" before asking "how do I build this?" consistently produces better designs.

---

## Summary

| Role             | Key Lesson                                                                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Project Manager  | Written scope constraints protect the project from the developer's own ideas more than from any external pressure.                                                                   |
| Business Analyst | Acceptance criteria are not documentation — they are the specification that the code must match, expressed in a language both humans and tests can verify.                           |
| Developer        | The Server Component → Client Component boundary in Next.js is a data ownership boundary, not just a rendering boundary. Stale local state is a design problem, not a runtime error. |
| Tester           | Writing TC-02 before implementing `POST /api/borrow` was the single highest-ROI hour of the entire project. The test did not just verify the code — it shaped it.                    |
