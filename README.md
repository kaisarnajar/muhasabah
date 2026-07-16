# Muhasabah

A comprehensive personal dashboard and self-accountability app to help you track your goals, finances, religious duties, journal entries, fitness activities, tasks, books, documents, and daily timetable.

---

## Features

### 🕌 Spiritual Tracker
- Daily habit tracking for all 5 prayers (Fajr, Dhuhr, Asr, Maghrib, Isha), Adhkar, Quran Memorisation, Tahajjud, and Duha
- Log whether each prayer was prayed in congregation (Jamaat)
- Quran verse memorisation logging per day with Surah and verse range
- 180-day rolling history view

### ⏰ Dynamic Timetable & Hijri Calendar
- **Adjustable Hijri Date Display**: Displays today's adjusted Hijri date prominently on the Dashboard and Time Table pages.
  - Allows manual adjustment of ±1 day (or more) via a clean portal dialog popup modal on the Time Table page to align with local moon sighting announcements.
  - Selected offset persists across refreshes and sessions (saved in the database per user).
- Save your GPS coordinates via browser Geolocation API
- Fetch accurate prayer times via **Aladhan API** with configurable calculation method (Karachi, ISNA, MWL, Umm Al-Qura, and more)
- **Asr timing preference** — choose between Earlier Asr (shadow factor 1×) or Later Asr (shadow factor 2×); updates the prayer time fetched from the API immediately
- Horizontally scrollable daily routine timeline with live "Now" indicator
- Dedicated prayer time cards for all 5 prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) in the timeline
- Active card highlights and pulsing dot for the current time block
- Per-field edit popup — click the pencil on any timing card to edit just that one value
- Gym preference selector (After Fajr, Before Office, Maghrib–Isha, After Isha, None) dynamically inserts gym slot into the timeline

### 💰 Financial Tracker
- Track income and expenses with category tagging
- Filter by Day, Week, Month, Quarter, Year, or custom date range
- Summary cards: Total Income (green), Total Expense (red), Net Flow (gold/red) — each with icon and color-coded border
- CSV export for any filtered period
- Pagination with 25 items per page

### 💳 Ledger (Debt Manager)
- Per-person credit/debit tracking
- Mark individual records as Paid or revert to Pending
- Responsive card grid (3–5 per row) with color-coded borders per type
- Net balance summary per person

### 🎯 Goals Dashboard
- Create goals across Religious, Career, Finances, Health, Personal categories
- Set priority (Low / Medium / High), progress %, target date, and completion status

### 📓 Structured Journal
- **Office Logs:** Project, Ticket ID, Work Type (Feature, Bug Fix, Refactor, Meeting, Deployment, Support), Duration
- **Career Learning:** 35+ predefined topics across Mobile, Web, Languages, CS Fundamentals, AI/ML, DevOps, Cloud — or free-text custom topic
- **Miscellaneous:** Location, Activity type, Tag, free-form description

### 📚 Books Library (with Folders)
- Folder-based organisation — create folders like "Self Development", "Islamic Books", "Tech"
- Click any card to view full notes in a popup
- Link, Edit, Delete buttons on each card
- Add books to a folder or leave unfiled

### 📄 Documents (with Folders)
- Same folder structure as Books
- Store document title, URL link, and notes
- Filter tabs: All, Today, This Week, This Month, This Year, Custom Range
- Popup viewer with direct "Open Document" link

### 📝 Notes
- Clean card grid with title + content preview (5-line clamp)
- Click any note to view full content in a popup
- Inline Edit and Delete per card

### 🏋️ Fitness Tracker
- Log workouts: Gym, Running, Walking, Cycling, Yoga, Swimming, and more
- Track duration, distance, muscle group, and notes
- Summary cards: Active Minutes, Workouts Completed, Distance Covered

### ✅ Tasks
- **Today's Tasks:** Add, complete, and delete daily tasks for any target date
- **Task History:** Pick any past date from a calendar to review what was planned vs completed
- **Weekend Tasks:** Recurring checklist tracked per week in a scrollable 2D history table; manage tasks via popup

### 🔁 Recurring Trackers
- Dashboard widget for tracking periodic chores (e.g., "Change bed sheets", "Oil hair")
- Mark as done to reset the timer

### 🤲 Dua Collection
- Personal dua library with Arabic text, translation, and category (Personal, Family, Career, General)

### 📊 Dashboard
- Today's adjusted Hijri date & Gregorian date
- Today's prayer times at a glance
- Today's tasks overview
- Recurring tracker status
- Live timetable card

### 🔐 Auth
- Email/password registration with email verification
- **Registration restrictions**: Option to whitelist specific email addresses for registration via environment variable configuration (`ALLOWED_REGISTRATION_EMAILS`) to restrict unauthorized access.
- Forgot password / reset password flow

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, Server Components) |
| Styling | Vanilla CSS + CSS Custom Properties |
| Database | PostgreSQL via Prisma ORM |
| Auth | Custom session-based auth with bcrypt |
| Icons | Lucide React + Google Material Symbols |
| Prayer Times | Aladhan API |
| Deployment | Vercel / any Node environment |

---

## Project Structure

```
src/
├── actions/             # Barrel exports of server actions
│   └── index.ts
├── app/                 # App Router routing layer
│   ├── (dashboard)/     # Authenticated pages (Timetable, religious, etc.)
│   └── ...              # Auth pages (login, register, reset-password)
├── components/          # Shared/Global layout and UI components
│   ├── dashboard/       # Dashboard card widgets
│   ├── layout/          # Global navigation layout
│   └── ui/              # Common UI components (Dialogs, Buttons)
├── features/            # Feature domains (Encapsulated actions, modals, cards, grids)
│   ├── auth/            # Auth action flow & settings
│   ├── books/           # Books cards, folders, forms, viewer modal
│   ├── debts/           # Credit/Debit forms, ledger logs
│   ├── documents/       # Documents grid, cards, folders, form modals
│   ├── dua/             # Duas list
│   ├── fitness/         # Fitness logs, summaries
│   ├── goals/           # Goals forms, checklist
│   ├── journal/         # Journal categories forms, filters
│   ├── notes/           # Note card grid
│   ├── profile/         # Profile update forms
│   ├── relapse/         # Heatmap calendar grid, clean recovery logs
│   ├── religious/       # Spiritual habits stats, tracker modals
│   ├── tasks/           # Daily & weekend task grids
│   ├── timetable/       # Time table timeline routine, forms
│   └── transactions/    # Transactions filter, CSV export
└── lib/                 # Core utilities
    ├── auth.ts          # Authentication session manager
    ├── hijri.ts         # Hijri date calculations utility
    └── prisma.ts        # Prisma Client instance config
```

---

## Database Schema (Key Models)

| Model | Key Fields |
|---|---|
| `User` | name, email, passwordHash, latitude, longitude, calculationMethod, asrTiming, hijriOffset |
| `BookFolder` | name, userId |
| `Book` | title, author, driveLink, notes, folderId? |
| `DocumentFolder` | name, userId |
| `Document` | title, link, notes, folderId? |
| `Note` | title, content |
| `Transaction` | amount, description, category, type (INCOME/EXPENSE) |
| `Goal` | title, category, priority, progress, targetDate |
| `SpiritualHabit` | name, isPrayer |
| `SpiritualHabitLog` | habitId, date, isCompleted, prayedWithJamaat |
| `SpiritualDayLog` | date, quranMemorization, otherActivities |
| `JournalEntry` | content, category (OFFICE/LEARNING/MISC), subject/project/etc. |
| `DailyTask` | title, isCompleted, targetDate |
| `WeekendTask` + `WeekendTaskLog` | recurring weekly checklists |
| `FitnessLog` | activity, duration, distance, muscleGroup |
| `RecurringTracker` | title, lastDone |
| `Person` + `DebtRecord` | per-person credit/debit ledger |
| `Dua` | title, content, translation, category |
| `TimeTable` | wakeUpTime, officeDeparture, officeReturn, gymPreference, etc. |
| `RelapseLog` | date, notes |

---

## Setup & Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Set DATABASE_URL and ALLOWED_REGISTRATION_EMAILS in .env

# 3. Push schema to database
npx prisma db push

# 4. Generate Prisma Client
npx prisma generate

# 5. Seed with realistic fake data (optional but recommended)
npx prisma db seed

# 6. Run dev server
npm run dev
```

Open `http://localhost:3000`

---

## Test Accounts

After running `npx prisma db seed`:

| Email | Password | Data |
|---|---|---|
| `test1@example.com` | `password123` | Full realistic dataset |
| `test2@example.com` | `password123` | Empty account |

---

## Key Design Principles

- **Feature-Based Domain encapsulations** — related components, subcomponents, modals, cards, and server actions are placed inside their respective domain directory under `/src/features/`.
- **Server Components by default** — data fetching happens on the server; only interactive islands use `'use client'`
- **Portal-based modals** — all popups use `createPortal` to render at `document.body`, preventing z-index and overflow issues
- **No CSS framework** — pure CSS custom properties with design tokens for theming, spacing, and shadows
- **Strict typing** — Prisma-generated types used throughout; no `any` in data-rendering paths
- **Folder-first organisation** — Books and Documents support optional folder grouping with unfiled fallback
