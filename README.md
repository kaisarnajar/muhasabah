# Muhasabah

A comprehensive, beautifully designed personal dashboard and self-accountability application to help you track your goals, finances, religious duties, journal entries, fitness activities, and daily/weekend tasks.

## Features

- **Financial Tracker:** Track your daily, weekly, and monthly income and expenses with elegant charts and visual filtering.
- **Credit & Debit Manager:** Easily manage money you owe and money owed to you on a per-person basis with a built-in address book.
- **Goals Dashboard:** Set Daily, Weekly, Monthly, Quarterly, Yearly, and Lifetime goals, and visually track your progress.
- **Dynamic Prayer Timings & Timetable:** 
  - Save your location coordinates via browser Geolocation.
  - Fetch actual prayer times via **Aladhan API** using **Shafi Fiqh** (Standard Asr timing calculation).
  - Dynamically generate your daily routine timeline. If Fajr is before your wake-up time, it is automatically sorted first; otherwise, the wake-up routine comes first.
  - Shows your current location name directly in the timetable section.
- **Spiritual Habit Tracker:** Maintain a daily streak for your prayers (Fajr, Dhuhr, Asr, Maghrib, Isha), Quran reading, Adhkar, and log specific Quran memorization verses with history.
- **Structured Journaling System:**
  - **Office Work Logs:** Track dev work with fields for Project Name, Ticket ID, Work Type (Feature, Bug Fix, Refactor, Meeting, Deployment, Support, Other), and Duration. Cards feature dynamic, color-coded work badges.
  - **Career Learnings:** Document learnings under predefined subjects (Android Development, Backend, Frontend, Java, C++, DSA, Machine Learning, AI & ML, AI Engineering) or custom topics. Generates hashed, unique color pill badges for topics.
  - **Miscellaneous Logs:** Log personal trips, travel events, and restaurant visits with fields for Location / Place, Activity Type (Travel, Food, Social, Shopping, Health, Thoughts, Entertainment, Other), and descriptions.
- **Fitness Tracker:** 
  - Visual summary cards showing Active Minutes, Workouts Completed, and Distance Covered with scaling hover animations and custom colored glows.
  - Responsive grid of activity cards with customized color profiles based on activity type (Gym, Running, Walking, Cycling, Yoga, Swimming, etc.).
  - Stylized speech-bubble boxes with left-border accents for workout notes.
- **Scrollable Navigation:** A scrollable left-side sidebar designed to handle all dashboard menu options cleanly on any screen resolution.
- **Task History:** Pick any past date from a built-in calendar to review exactly what tasks you were supposed to do and what you actually accomplished.

## Tech Stack

- **Framework:** Next.js 16+ (App Router)
- **Styling:** Vanilla CSS + Global Custom Properties (Glassmorphism, Dynamic Color Hashing & Premium Animations)
- **Database:** PostgreSQL (managed via Prisma ORM)
- **Deployment:** Vercel (or any standard Node environment)
- **Icons:** Lucide React & Google Material Symbols
- **APIs:** Aladhan Geolocation API

## Project Architecture (Post-Refactoring)

The application has been heavily refactored for maximum scalability, modularity, and strict typing:

```text
src/
├── actions/             # Strictly typed modular server actions
│   ├── auth.ts          # Authentication & session controls
│   ├── debts.ts         # Credit & Debit tracking
│   ├── fitness.ts       # Workouts & health logs
│   ├── goals.ts         # Goal management
│   ├── journal.ts       # Categorized journal entries
│   ├── religious.ts     # Spiritual tracking
│   ├── tasks.ts         # Daily/Weekend task management
│   ├── transactions.ts  # Finance tracking
│   └── index.ts         # Global exporter
├── app/
│   ├── (dashboard)/     # Main protected application UI (Pages)
│   ├── login/           # Authentication pages
│   ├── globals.css      # Core Design System (Tokens, Reset, Global Utilities)
│   └── layout.tsx       # Root layout
├── components/          # Reusable UI components grouped by feature
│   ├── dashboard/       # Dashboard components (e.g., TasksOfTheDay)
│   ├── debts/           # Debt management components
│   ├── fitness/         # Beautified fitness tracker widgets
│   ├── goals/           # Goal tracking components
│   ├── history/         # History viewer components
│   ├── journal/         # Structured Office, Learning, and Misc logs
│   ├── layout/          # Global layout components (Navigation, delete confirmations)
│   ├── religious/       # Spiritual tracking components
│   ├── transactions/    # Financial tracker components
│   └── weekend/         # Weekend task components
├── lib/                 # Core utilities
│   └── prisma.ts        # Database connection singleton
└── types/               # (Removed in favor of native `@prisma/client` generated types)
```

## Setup & Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   Configure your PostgreSQL connection in a `.env` file:
   ```env
   DATABASE_URL="postgres://..."
   ```
   Push the schema to your database:
   ```bash
   npx prisma db push
   ```

3. **Seed the Database (Optional but Recommended)**
   Populate your dashboard with a massive amount of varied, highly realistic dummy data (structured dev tasks, color-coded subjects, travel logs, and fitness entries) to test out all the features visually:
   ```bash
   npx prisma db seed
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the application.

## Best Practices Enforced

- **Protected Layout Routing:** All routes in the `(dashboard)` group are guarded by async server layout checks. Non-authenticated users are immediately redirected to `/login` before child component queries load, preventing unauthorized action exceptions.
- **0 TypeScript Errors:** The codebase strictly relies on `@prisma/client` types and custom interfaces. There are absolutely no `any` types rendering data.
- **Pure CSS:** We have removed bloated CSS frameworks and replaced them with highly reusable global CSS utility classes (`flex-row`, `justify-between`, `gap-16`) to keep JSX components incredibly clean and performant.
- **Modular Actions:** All server logic is split by domain, preventing monolithic file bottlenecks and ensuring easy maintainability as the app grows.

## Test Accounts

If you seeded the database using `npx prisma db seed`, the following test accounts are available to log in and test the application data:

1. **Email:** `test1@example.com`
   **Password:** `password123`
   *(This account contains all the seeded dummy data)*

2. **Email:** `test2@example.com`
   **Password:** `password123`
   *(This account is fresh and empty)*
