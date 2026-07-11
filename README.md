# Muhasabah

A comprehensive, beautifully designed personal dashboard and self-accountability application to help you track your goals, finances, religious duties, journal entries, and daily/weekend tasks.

## Features

- **Financial Tracker:** Track your daily, weekly, and monthly income and expenses with elegant charts and visual filtering.
- **Credit & Debit Manager:** Easily manage money you owe and money owed to you on a per-person basis with a built-in address book.
- **Goals Dashboard:** Set Daily, Weekly, Monthly, Quarterly, Yearly, and Lifetime goals, and visually track your progress.
- **Spiritual Tracker:** Maintain a daily streak for your prayers (Fajr, Dhuhr, Asr, Maghrib, Isha), Quran reading, Adhkar, and log specific Quran memorization verses with historical tracking.
- **Daily & Weekend Tasks:** Manage recurring tasks that automatically reset when appropriate to ensure you stay on top of your responsibilities.
- **Journaling System:** Keep categorized notes for Office, Learning, and Miscellaneous topics to clear your mind.
- **Task History:** Pick any past date from a built-in calendar to review exactly what tasks you were supposed to do and what you actually accomplished.

## Tech Stack

- **Framework:** Next.js 16+ (App Router)
- **Styling:** Vanilla CSS + Global Custom Properties (Glassmorphism & Dynamic Themes)
- **Database:** PostgreSQL (managed via Prisma ORM)
- **Deployment:** Vercel (or any standard Node environment)
- **Icons:** Lucide React & Google Material Symbols

## Project Architecture (Post-Refactoring)

The application has been heavily refactored for maximum scalability, modularity, and strict typing:

```text
src/
├── actions/             # Strictly typed modular server actions
│   ├── auth.ts          # Authentication logic
│   ├── debts.ts         # Credit & Debit tracking
│   ├── goals.ts         # Goal management
│   ├── journal.ts       # Journal entries
│   ├── religious.ts     # Spiritual tracking
│   ├── tasks.ts         # Daily/Weekend task management
│   ├── transactions.ts  # Finance tracking
│   └── index.ts         # Global exporter
├── app/
│   ├── (dashboard)/     # Main protected application UI (Pages & Client Components)
│   ├── login/           # Authentication pages
│   ├── globals.css      # Core Design System (Tokens, Reset, Global Utilities)
│   └── layout.tsx       # Root layout
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
   Populate your dashboard with a massive amount of varied dummy data to test out all the features visually:
   ```bash
   npx prisma db seed
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the application.

## Best Practices Enforced

- **0 TypeScript Errors:** The codebase strictly relies on `@prisma/client` types and custom interfaces. There are absolutely no `any` types rendering data.
- **Pure CSS:** We have removed bloated CSS frameworks and replaced them with highly reusable global CSS utility classes (`flex-row`, `justify-between`, `gap-16`) to keep JSX components incredibly clean and performant.
- **Modular Actions:** All server logic is split by domain, preventing monolithic file bottlenecks and ensuring easy maintainability as the app grows.
