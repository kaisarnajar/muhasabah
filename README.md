# Muhasabah

A comprehensive personal dashboard and self-accountability app to help you track your goals, finances, spiritual duties, journal entries, fitness activities, tasks, books, documents, notes, focus productivity tools, relapse recovery, and daily timetable.

---

## Features

### 🕌 Spiritual Tracker
- Daily habit tracking for 5 prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) and Adhkar
- **Jamaat vs Individual tracking**: Dedicated selection to record whether prayers were performed in congregation or individually
- **Optimistic real-time UI updates**: Instant visual feedback when updating prayer logs and habit completions
- **Accurate consistency rate**: Monthly and window prayer consistency calculated based on total elapsed days
- **Ibadah Register**: Log and edit spiritual habit data for any past date so you never miss a record
- **Islamic Events Calendar**: Interactive modal calendar to explore significant Islamic historical events month by month
- 180-day rolling history view with monthly performance breakdowns

### ⏰ Dynamic Timetable, Hijri Calendar & Prayer Times
- **Adjustable Hijri Date Display**: Displays today's adjusted Hijri date prominently on the Dashboard and Timetable pages
  - Allows manual adjustment of ±1 day (or more) via a clean portal dialog modal on the Timetable page to match local moon sighting announcements
  - Persisted in the database per user account
- Geolocation API support for saving precise latitude/longitude coordinates
- **Aladhan API integration**: Fetch accurate prayer times with configurable calculation methods (Karachi, ISNA, MWL, Umm Al-Qura, etc.)
- **Asr timing preference**: Choose between Earlier Asr (shadow factor 1×) and Later Asr (shadow factor 2×) with real-time prayer schedule recalculation
- **Isha End Time calculation**: Automatically computes and displays the midpoint between Sunset and Fajr as the Islamic Isha end time
- Horizontally scrollable daily routine timeline with live "Now" indicator, active card highlights, and pulsing indicator
- Per-field edit popup for custom time slots
- Gym preference selector (After Fajr, Before Office, Maghrib–Isha, After Isha, None) dynamically inserting gym slots into the routine

### 💰 Financial Tracker
- Track income and expenses with customizable category tagging
- Filter transactions by Day, Week, Month, Quarter, Year, or Custom Date Range
- Summary cards: Total Income (green), Total Expense (red), Net Flow (gold/red) with icon badges
- Export filtered transactions to CSV
- Pagination with 25 records per page

### 💳 Ledger (Debt Manager)
- Per-person credit/debit tracking
- **Net Balance Overview**: Calculates person-by-person net balance and presents two dedicated summary cards: **"They Owe You"** and **"You Owe Them"**
- Mark individual debt records as Paid or revert to Pending
- Responsive card grid with color-coded status badges

### 🎯 Goals Dashboard
- Create goals across Religious, Career, Finances, Health, and Personal categories
- Set priority (Low / Medium / High), progress percentage (0–100%), target date, top goal pin, and completion status
- Multi-line textarea support for rich goal descriptions during creation and editing
- Redesigned 3-item-per-row card grid with gold borders, priority pills, and metadata footers matching Notes aesthetic

### 📓 Structured Journal
- **Office Logs:** Track project, Ticket ID, work type (Feature, Bug Fix, Refactor, Meeting, Deployment, Support), and duration
- **Career Learning:** 35+ predefined topics across Mobile, Web, Languages, CS Fundamentals, AI/ML, DevOps, Cloud — or custom free-text topics
- **Miscellaneous:** Location, activity type, tag, and free-form content
- Pinned journal entries and category search/filtering

### 📚 Books Library (with Folders)
- Folder-based organization — create folders like "Self Development", "Islamic Books", "Tech"
- Click any card to view full notes in a modal popup
- Drive link attachment, inline Edit and Delete per book card
- Filter books by folder or view unfiled books

### 📄 Documents (with Folders)
- Folder-based structure matching Books
- Store document titles, direct URL links, and notes
- Filter tabs: All, Today, This Week, This Month, This Year, Custom Range
- Popup viewer with direct "Open Document" preview link

### 📝 Notes (with Folders)
- **Folder-based organization**: Group notes into custom folders (e.g., "Work", "Personal", "Ideas")
- Clean card grid with title, content preview (5-line clamp), folder tag, and pinned status
- Modal preview viewer for full content reading
- Inline Edit and Delete options per note card

### 🏋️ Fitness Tracker
- Log workouts across diverse activities: Gym, Running, Walking, Cycling, Cricket, Football, Badminton, Yoga, Swimming, etc.
- Track duration, distance (km), muscle group, exercise count, total sets & reps count (for Gym workouts), and notes
- Summary cards: Active Minutes, Workouts Completed, and Total Distance Covered

### ✅ Tasks & Weekend Tasks
- **Weekend Tasks**: Direct weekly checklist manager tracked per week in a scrollable 2D history matrix (Done / Undone status) with popup management
- **Daily Tasks**: Create, complete, and delete daily tasks for targeted dates

### ⏱️ Productivity Tools & Focus Timer
- **Pomodoro Focus Timer**: Configurable session timer with customizable intervals (Focus, Short Break, Long Break), label logging, and session completion tracking
- **Focus History Table**: Detailed logs and summary statistics for completed focus sessions

### 🛡️ Clean Recovery Tracker (Relapse Log)
- Interactive heatmap calendar grid to track clean recovery streaks and log incidents
- Summary metrics: Current streak, longest streak, and incident history
- Modals for adding, editing, viewing, and filtering clean recovery logs

### 🔁 Recurring Trackers
- Dashboard widget for tracking periodic chores (e.g., "Change bed sheets", "Oil hair")
- Reset completion timers with a single tap

### 🤲 Dua Collection
- Personal dua library with title, Arabic text, translation, and category filters (Personal, Family, Career, General)

### 📊 Dashboard
- Today's adjusted Hijri date & Gregorian date
- Prayer times at a glance & Isha End Time indicator
- Today's task & weekend task overview
- Focus session productivity summary
- Recurring tracker status & live routine timetable card

### 📱 PWA Support
- Progressive Web App ready with Web Application Manifest (`manifest.json`) and Service Worker (`sw.js`) registration
- Mobile-friendly PWA install prompt banner for quick home screen installation

### 🔐 Auth & User Settings
- Email/password authentication via `jose` JWT session cookies and `bcryptjs` password hashing
- **Registration restrictions**: Optional email whitelist configuration via `ALLOWED_REGISTRATION_EMAILS` environment variable
- Profile preferences: Edit location coordinates, Aladhan prayer calculation method, Asr shadow timing preference, and Hijri date offset

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Styling | Vanilla CSS + CSS Custom Properties (Tokens & Responsive Layouts) |
| Database | PostgreSQL via Prisma ORM 7 (`@prisma/adapter-pg`) |
| Auth | Custom session-based authentication with `jose` & `bcryptjs` |
| Icons | Lucide React |
| PWA | Web App Manifest + Service Worker Registration |
| Prayer Times | Aladhan API |
| Deployment | Vercel / Node.js Server Environment |

---

## Project Structure

```
src/
├── actions/             # Barrel exports of server actions
│   └── index.ts
├── app/                 # Next.js App Router routing layer
│   ├── (dashboard)/     # Authenticated pages (Timetable, Religious, Tasks, Tools, etc.)
│   └── ...              # Auth pages (Login, Register)
├── components/          # Shared/Global layout and UI components
│   ├── dashboard/       # Dashboard widgets & overview cards
│   ├── layout/          # Navigation, Header, Sidebar
│   └── ui/              # Global UI primitives (Dialogs, Modals, Buttons)
├── features/            # Encapsulated feature domains (Actions, Components, Modals)
│   ├── auth/            # Authentication, session & settings
│   ├── books/           # Books library & book folder management
│   ├── debts/           # Credit/Debit ledger & net balance summary
│   ├── documents/       # Documents manager & folder filtering
│   ├── dua/             # Dua collection library
│   ├── fitness/         # Fitness logs & exercise summaries
│   ├── goals/           # Goals tracking & 3-item card grid
│   ├── journal/         # Structured journal (Office, Learning, Misc)
│   ├── notes/           # Notes manager & note folder organization
│   ├── profile/         # User profile & prayer preferences
│   ├── pwa/             # Service worker & install prompt banner
│   ├── relapse/         # Clean recovery heatmap & streak tracker
│   ├── religious/       # Spiritual habit tracker & Ibadah register
│   ├── tasks/           # Weekend recurring task checklist & daily tasks
│   ├── timetable/       # Dynamic timetable, Hijri calendar & prayer times
│   ├── tools/           # Pomodoro Focus timer & session history table
│   └── transactions/    # Financial tracker & CSV export
└── lib/                 # Shared utilities
    ├── auth.ts          # Authentication session manager
    ├── hijri.ts         # Hijri date calculation utilities
    └── prisma.ts        # Prisma Client instance configuration
```

---

## Database Schema (Key Models)

| Model | Key Fields / Description |
|---|---|
| `User` | name, email, passwordHash, latitude, longitude, locationName, calculationMethod, asrTiming, hijriOffset |
| `BookFolder` | name, userId |
| `Book` | title, author, driveLink, notes, folderId? |
| `DocumentFolder` | name, userId |
| `Document` | title, link, notes, folderId? |
| `NoteFolder` | name, userId |
| `Note` | title, content, folderId?, isPinned |
| `Transaction` | amount, description, category, type (INCOME/EXPENSE), date |
| `Goal` | title, description, category, priority, progress, targetDate, isCompleted, isTopGoal, reminders |
| `SpiritualHabit` | name, isPrayer |
| `SpiritualHabitLog` | habitId, date, isCompleted, prayedWithJamaat |
| `SpiritualDayLog` | date, quranMemorization, otherActivities, shortcomings |
| `JournalEntry` | content, category (OFFICE/LEARNING/MISC), project, ticketId, workType, duration, location, activity, tag |
| `DailyTask` | title, isCompleted, targetDate, category |
| `WeekendTask` + `WeekendTaskLog` | Recurring weekly checklists & status history matrix |
| `FitnessLog` | activity, duration, distance, muscleGroup, exercisesCount, setsCount, repsCount, date |
| `FocusSession` | duration, label, completedAt |
| `RecurringTracker` | title, lastDone |
| `Person` + `DebtRecord` | Per-person credit/debit ledger with Paid/Pending status |
| `Dua` | title, content, translation, category |
| `TimeTable` | wakeUpTime, officeDeparture, officeReturn, gymPreference, maghribToIsha, ishaTillSleep, sleepTime |
| `RelapseLog` | date, notes |

---

## Setup & Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Set DATABASE_URL and ALLOWED_REGISTRATION_EMAILS in .env

# 3. Push database schema
npx prisma db push

# 4. Generate Prisma Client
npx prisma generate

# 5. Seed with realistic mock data (optional)
npx prisma db seed

# 6. Run development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Test Accounts

After running `npx prisma db seed`:

| Email | Password | Data |
|---|---|---|
| `test1@example.com` | `password123` | Full realistic dataset |
| `test2@example.com` | `password123` | Clean / empty account |

---

## Key Design Principles

- **Feature-Based Domain Encapsulation**: Domain components, modals, cards, and server actions are grouped within `/src/features/[domain]/`.
- **Server Components First**: Data fetching is executed on the server; interactive widgets use `'use client'`.
- **Portal-based Modals**: All modal popups use React `createPortal` targeting `document.body` to avoid z-index or stacking context clipping.
- **Pure Vanilla CSS Design System**: Uses CSS Custom Properties for design tokens (colors, spacing, typography, shadows) without third-party utility frameworks.
- **Folder-First Organization**: Books, Documents, and Notes support folder grouping with unfiled fallbacks.
- **Strict Typing**: Fully typed with Prisma ORM client models and TypeScript definitions.

