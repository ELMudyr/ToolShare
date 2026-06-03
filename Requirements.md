# Role & Context
You are an expert AI software engineer, technical writer, and project management consultant. You are helping me, Oussama Dadouch, build a complete exam and capstone package for a project named "ToolShare." 

I am acting as a solo practitioner covering ALL roles: Project Manager, Business Analyst, Full-Stack Developer, and QA Tester. The documentation and output must reflect my single-handed execution of the full software development lifecycle (SDLC).

Deliver a thorough, high-quality, comprehensive project blueprint and documentation package based on the following specific requirements:

---

## 1. Project Identification
- **Project Name:** ToolShare
- **Project Description:** A simple, innovative micro-local tool and item-sharing web application designed specifically for apartment buildings. It allows neighbors to list, browse, and request to borrow rarely-used household items (e.g., drills, ladders, board games), reducing consumer waste and saving storage space.
- **Project Owner & Contributor:** Oussama Dadouch
- **My Roles:** Full-Stack Developer, QA Lead, Business Analyst, and Project Manager.

---

## 2. PROJECT MANAGER - Project Plan Document
Generate a complete Project Plan including:
- **Project Charter:** Summary, defined business case (sustainability/sharing economy), constraints, and success criteria.
- **Work Breakdown Structure (WBS):** A clean, text-based hierarachal structure breaking the project down into Phase 1 (Initiation & BA), Phase 2 (Design & Architecture), Phase 3 (Development), Phase 4 (Testing), and Phase 5 (Deployment).
- **Project Timeline (Gantt Chart representation):** A detailed, text-based project schedule showing task durations, start/end dates, and milestones across a hypothetical 6-week timeline. Highlight the "Critical Path" (e.g., Database design -> API Development -> Front-End Integration).
- **Risk Register:** A table containing at least 4 potential project risks (e.g., scope creep, concurrent booking conflicts, low user adoption) with their likelihood, impact, and concrete mitigation strategies.

---

## 3. BUSINESS ANALYST - Business Analysis Document
Generate a thorough BA package containing:
- **Problem Statement & Target Audience:** A clear analysis of urban apartment dwellers' pain points.
- **User Personas:** Provide 2 distinct brief personas (e.g., "Sarah, the DIY Enthusiast who owns tools" and "Mike, the Casual Borrower who needs a drill once a year").
- **Functional Requirements (User Stories):** Write 5 robust user stories using the standard template (*"As a..., I want to..., So that..."*). Include explicit **Acceptance Criteria** for each (using Given-When-Then format).
- **Data Dictionary:** A mapping of the core database schema entities (`Users`, `Items`, `LendingTransactions`) including fields, data types, and constraints.
- **Process Flow:** A step-by-step textual description or markdown sequence chart mapping out the "Borrowing Workflow" from browsing to return.

---

## 4. PROGRAMMERS - Technical Documentation & Code Base
Generate the complete software architecture, structural guidelines, and functional code snippets:
- **Tech Stack Specification:**
  - **Front-End:** React (with Tailwind CSS for minimalist, mobile-first UI)
  - **Back-End:** Node.js with Express.js (REST API architecture)
  - **Database:** SQLite (Lightweight relational database ideal for prototyping)
- **Database Schema:** Provide the raw SQL data definitions (`CREATE TABLE` statements) for the tables defined in the BA document, showcasing primary keys and foreign key relationships.
- **Back-End Code:** Provide clean, production-ready JavaScript code for the Express server, focusing specifically on the critical `POST /api/borrow` endpoint which securely checks item availability, updates database status, and prevents double-booking.
- **Front-End Code:** Provide the React component code for the main item feed dashboard, demonstrating conditional rendering of buttons (e.g., rendering a disabled grey button when an item status changes to "Borrowed").
- **UI Placeholders:** Describe exactly what 3 critical "Print Screens" (Screenshots) should look like so I can capture them from the working app (e.g., Login Screen, Item Catalog, and Borrow Confirmation).

---

## 5. TESTERS - Quality Assurance & Testing Documentation
Generate a complete QA package to prove system stability:
- **Test Strategy:** A brief outline of how Unit, Integration, User Acceptance (UAT), and Boundary testing are applied to this micro-app.
- **Test Cases:** A structured table containing at least 4 detailed test cases. Columns must include: *Test ID, Component, Description, Input Steps, Expected Result, and Actual Result (marked as PASSED)*. Include scenarios for:
  - Successful item borrowing.
  - Failure/Error when attempting to borrow an already checked-out item (Concurrency testing).
  - UI state change validation.
- **Requirements Traceability Matrix (RTM):** A mapping table demonstrating how each of the 5 BA User Stories links directly to specific Front-End/Back-End tasks and their verifying QA Test Cases.

---

## 6. Project Retrospective & Lessons Learned
Write a detailed, reflective summary written from my perspective (Oussama Dadouch) explaining what I learned during this cross-functional journey. Break this down into four clear perspectives:
- **As a Project Manager:** What I learned about scope management and sticking to a critical path when working solo.
- **As a Business Analyst:** What I learned about translating vague user desires into rigid database rules and strict acceptance criteria.
- **As a Developer:** What I learned about handling state synchronization between back-end data states and front-end UI components.
- **As a Tester:** What I learned about the value of automated edge-case testing, and how writing tests *before* code can save hours of debugging.

---

# Output Instructions
- Avoid placeholders like "Lorem Ipsum" or "[Insert code here]". Write out the documentation, code blocks, and analysis tables fully.
- Maintain a highly professional, academic, yet practical tone suitable for a top-tier project management and software engineering submission.
- Begin generating the entire comprehensive documentation package sequentially.