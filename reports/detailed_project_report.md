# Project Analysis & Overview: Muhasabah

Muhasabah is a comprehensive, modern, and beautifully designed personal dashboard and self-accountability application. The name **Muhasabah** (an Arabic term for self-examination or accounting) reflects its core purpose: to help users systematically audit and track their daily habits, finances, religious duties, tasks, career learnings, physical fitness, and personal journals. 

This document serves as the **Detailed Project Report** for the Muhasabah codebase, providing a high-level project analysis, tech stack description, directory structure mapping, and architecture summary.

---

## 1. Tech Stack Overview

The application utilizes a modern JavaScript/TypeScript stack configured for rapid server-side rendering, type safety, and clean styling.

*   **Frontend & Web Framework:** Next.js 16.2.10 (App Router layout) using React 19.2.4. It leverages Server Actions for CRUD operations and Server Components for immediate page loads.
*   **Database ORM:** Prisma ORM 7.8.0.
*   **Database Engine:** PostgreSQL (configured for standard production servers, with timezone-aware datetime tables `timestamptz`).
*   **Authentication & Security:** 
    *   `bcryptjs` (v3.0.3) for securing password hashes.
    *   `jose` (v6.2.3) for generating lightweight JSON Web Tokens (JWT) stored in HTTP-only cookies.
    *   Custom route guards in the layout folder group `(dashboard)` ensuring instant redirection of unauthenticated requests.
*   **Icons & Visuals:** `lucide-react` (v1.24.0) and Google Material Symbols.
*   **Styling System:** Pure Vanilla CSS utilizing dynamic CSS custom variables (`globals.css`) for consistent dark/light configurations, visual glassmorphism, responsive cards, and premium animations. It explicitly eschews utility frameworks like Tailwind CSS, keeping the JSX clean.
*   **External APIs:** Integrated with the **Aladhan Geolocation API** for fetching prayer timetable times based on coordinates.

---

## 2. Directory Structure Mapping

Below is the directory mapping of the Muhasabah codebase:

```text
muhasabah/
├── .agents/                 # AI Agent configurations and project rules
├── prisma/                  # Database management files
│   ├── schema.prisma        # Database schema models (Prisma DSL)
│   └── seed.ts              # Seeding script generating rich mock data
├── src/
│   ├── actions/             # Server Actions (database CRUD & security triggers)
│   │   ├── auth.ts          # Auth (register, login, logout, verification, change-password)
│   │   ├── books.ts         # Book tracking actions
│   │   ├── debts.ts         # Ledger actions (credits and debits)
│   │   ├── documents.ts     # Saved links and file references actions
│   │   ├── dua.ts           # Dua actions
│   │   ├── fitness.ts       # Workout log actions
│   │   ├── goals.ts         # Goal dashboard actions
│   │   ├── journal.ts       # Office work, learning, and miscellaneous journal actions
│   │   ├── notes.ts         # Personal notes actions
│   │   ├── relapse.ts       # Habit/recovery tracking actions
│   │   ├── religious.ts     # Spiritual habit logs (daily prayers, Quran memorization)
│   │   ├── tasks.ts         # Daily & weekend task actions
│   │   ├── timetable.ts     # Location setup & custom timeline configurations
│   │   ├── transactions.ts  # Income and expense management actions
│   │   └── index.ts         # Entry file exporting all server actions
│   ├── app/                 # Next.js App Router (views and layouts)
│   │   ├── (dashboard)/     # Main application container pages
│   │   │   ├── books/       # Books interface
│   │   │   ├── debts/       # Ledger UI
│   │   │   ├── documents/   # Documents manager UI
│   │   │   ├── dua/         # Supplications dashboard
│   │   │   ├── fitness/     # Fitness workouts manager
│   │   │   ├── goals/       # Objectives & progress bars UI
│   │   │   ├── journal/     # Career, office, and misc logs UI
│   │   │   ├── notes/       # Simple markdown notepad
│   │   │   ├── profile/     # Password change & details settings
│   │   │   ├── relapse/     # Habit recovery logs
│   │   │   ├── religious/   # Daily prayers, habits & Quran logs
│   │   │   ├── tasks/       # Daily checklists
│   │   │   ├── timetable/   # Work hours & prayer settings view
│   │   │   ├── transactions/# Transaction ledgers
│   │   │   ├── layout.tsx   # Sidebar wrapper with layout session authentication guards
│   │   │   └── page.tsx     # Unified home dashboard
│   │   ├── forgot-password/ # Password recovery page
│   │   ├── login/           # Credentials login form
│   │   ├── register/        # Registration form
│   │   ├── reset-password/  # Password reset page
│   │   ├── verify-email/    # E-mail verification landing
│   │   ├── globals.css      # Design tokens, color system, and global layout classes
│   │   └── layout.tsx       # Root layout defining document structures
│   ├── components/          # Fragmented React views by feature area
│   │   ├── books/           # Book list components
│   │   ├── dashboard/       # Main page summary widgets
│   │   ├── debts/           # Credit/debit widgets
│   │   ├── documents/       # Documents list widgets
│   │   ├── dua/             # Dua cards and lists
│   │   ├── fitness/         # Fitness statistics and logs
│   │   ├── goals/           # Objectives view components
│   │   ├── history/         # Historic calendar selectors
│   │   ├── journal/         # Structured journal forms
│   │   ├── layout/          # Global navigation components
│   │   ├── notes/           # Notepad list and editor
│   │   ├── profile/         # Account editing cards
│   │   ├── relapse/         # Recovery streak visualizers
│   │   ├── religious/       # Prayer streaks & memorization logs
│   │   ├── timetable/       # Custom routine builders
│   │   ├── transactions/    # Financial charts & filters
│   │   └── weekend/         # Weekend task components
│   └── lib/                 # Shared utilities and configurations
│       ├── auth.ts          # Encrypting/decrypting JWT payloads
│       ├── mailer.ts        # Mock Mailer mock logic for emails
│       ├── prisma.ts        # Prisma client singleton export
│       ├── quranData.ts     # Static metadata mapping Quran surahs
│       └── spiritualHabits.ts # Spiritual habits sorting & history logic
```

---

## 3. Development and Codebase Quality Standards

*   **Strict Typing:** The project operates with zero TypeScript errors. Component communication relies directly on generated Prisma clients (`User`, `Transaction`, `Goal`, etc.), preventing runtime mapping mismatch errors.
*   **Modular Architecture:** Business logic is entirely extracted into a modular server action setup (`src/actions/`), minimizing file bloat in page components.
*   **Vanilla CSS Design System:** The visual framework uses a strict design system defined in `globals.css` with CSS custom variables for themes, colors, border-radiuses, shadows, transitions, and flex layouts.
*   **Protected Dashboard Boundary:** Routing configuration enforces authentication at the layout level (`src/app/(dashboard)/layout.tsx`). If the JWT session is absent, it redirects the request to `/login` immediately.

---

## 4. Key Architectural Dependencies

The project's architectural dependencies include:
1.  **Next.js (App Router):** Controls page structures, caching, route revalidation, server actions, and HTTP header controls.
2.  **Prisma Client:** Communicates with the PostgreSQL database.
3.  **jose:** Used for signing and verifying JWTs in the middleware/layout layer.
4.  **Aladhan API:** Used for calculating localized prayer timings based on latitudinal and longitudinal coordinates.
