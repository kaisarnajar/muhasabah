# Detailed Report of Features: Muhasabah

This report provides a granular analysis of all major modules and features in the Muhasabah application. Each section maps the feature to its corresponding user interface, backend database models, and Server Actions.

---

## 1. Authentication & Profile Management

*   **Description:** Secures the entire system, provides account registration, handles email verification and password resets, and enables users to update their credentials and information.
*   **User Interface:** Located at `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, and `/profile`. It features secure text inputs, dynamic validation error messages, and success redirects.
*   **Database Models:** 
    *   `User`: Holds name, email, passwordHash, emailVerified, location parameters, and timestamps.
    *   `VerificationToken`: Temporarily holds tokens for email confirmation and password resets.
*   **Server Actions:** `src/actions/auth.ts`
    *   `register(formData)`: Validates inputs, creates user, creates token, calls mock mailer.
    *   `login(formData)`: Verifies credentials via `bcryptjs`, issues JWT via `jose` inside HTTP-only cookie.
    *   `logoutAction()`: Invalidates and clears the session cookie.
    *   `verifyEmail(token)`: Confirms email and marks `emailVerified: true`.
    *   `changePassword(formData)`: Validates and updates user password hash.
    *   `updateProfile(formData)`: Updates name and email, sends new verification link if email changed.

---

## 2. Main Dashboard & Accountability Hub

*   **Description:** The centralized homepage of the app. It provides an immediate overview of daily tasks, timetable routines, expenses, spiritual consistency, and goals.
*   **User Interface:** Located at `/`. Includes:
    *   **Umar RA Quote Card:** An interactive quote container displaying the famous quote by Umar ibn al-Khattab in Arabic and English, emphasizing self-accountability.
    *   **Timetable Widget:** A visual daily timeline mapping wake-up times, work slots, gym preferences, spiritual classes, and bedtime.
    *   **Finance Expenses Grid:** Displays spending calculations for Today, This Week, This Month, and This Year.
    *   **Spiritual Insights Grid:** Displays percentages of completed daily prayers, surahs memorized, and recent good deeds.
    *   **Tasks Checklist:** Directly interacts with daily task records to check off goals.
*   **Database Models:** Directly fetches from `TimeTable`, `Transaction`, `SpiritualHabitLog`, `SpiritualDayLog`, `Goal`, and `DailyTask`.
*   **Server Actions:** Primarily triggers utility calls from across various action folders, as well as:
    *   `src/actions/timetable.ts` -> `getTimeTable()`

---

## 3. Financial Tracker (Finances)

*   **Description:** A dashboard to monitor income and expenses, helping users stick to a budget.
*   **User Interface:** Located at `/transactions`. Includes income/expense forms, numerical lists, dynamic filter dropdowns (by category: e.g., food, bills, salary), and visual bar/doughnut distributions.
*   **Database Model:** 
    *   `Transaction`: Stores numeric amount (`Decimal`), description, category, type (`INCOME` or `EXPENSE` enum), and transaction date.
*   **Server Actions:** `src/actions/transactions.ts`
    *   `getTransactions()`: Returns all transactions sorted by date.
    *   `addTransaction(amount, description, category, type, date)`: Logs a new entry.
    *   `deleteTransaction(id)`: Removes a transaction.

---

## 4. Credit & Debit Manager (Ledger)

*   **Description:** Helps users track interpersonal debts. It functions as an informal lending ledger.
*   **User Interface:** Located at `/debts`. Divided by contact persons. Displays balance cards showing the net amount owed or lent, along with buttons to mark records as paid.
*   **Database Models:** 
    *   `Person`: Address book entry linked to user.
    *   `DebtRecord`: Linked to `Person`, holds amount, type (`CREDIT` for money lent, `DEBIT` for money borrowed), status (`PENDING` or `PAID`), and optional notes.
*   **Server Actions:** `src/actions/debts.ts`
    *   `getDebts()`: Fetches all contacts and their respective pending/paid debt records.
    *   `addDebtRecord(personName, amount, type, notes)`: Upserts a contact and creates a pending transaction record.
    *   `toggleDebtStatus(id)`: Marks a debt as `PAID` or resets to `PENDING`.
    *   `deleteDebtRecord(id)`: Deletes the ledger entry.

---

## 5. Goals Dashboard

*   **Description:** Allows users to define structured personal, professional, or spiritual targets and track their execution levels.
*   **User Interface:** Located at `/goals`. Arranged in columns by timeline levels: Daily, Weekly, Monthly, Quarterly, Yearly, and Lifetime. Each goal is displayed as a card with color-coded priorities, category tags, and progress sliders (0% to 100%).
*   **Database Model:** 
    *   `Goal`: Holds title, description, category (`RELIGIOUS`, `CAREER`, `FINANCES`, `HEALTH`, `PERSONAL`), priority (`LOW`, `MEDIUM`, `HIGH`), progress percentage, target date, and completion status.
*   **Server Actions:** `src/actions/goals.ts`
    *   `getGoals()`: Fetches user objectives.
    *   `addGoal(formData)`: Extracts details from input and creates a new goal.
    *   `updateGoalProgress(id, progress)`: Updates the progress value. Marks it as completed if progress is 100%.
    *   `deleteGoal(id)`: Removes the goal card.

---

## 6. Spiritual Tracker

*   **Description:** Designed to help Muslim users maintain daily religious disciplines.
*   **User Interface:** Located at `/religious`. Features:
    *   **Prayer Matrix:** Checkboxes for Fajr, Zuhur, Asr, Maghrib, Isha, and Tahajjud. Includes a "Prayed in Jamaat" toggle for congregation logs.
    *   **Habits Check:** Daily checklist for custom spiritual tasks like Adhkar (Remembrance).
    *   **Quran memorization Logger:** Form to record memorized surahs, starting and ending verses. Shows a list of past memorization tasks.
    *   **History Logs:** Calendar page viewing historical completion metrics.
*   **Database Models:**
    *   `SpiritualHabit`: Defines tracked habits (e.g. prayer names, custom habits).
    *   `SpiritualHabitLog`: Tracks date, completion status, and congregation status.
    *   `SpiritualDayLog`: Daily text column log for memorization history and general deeds.
*   **Server Actions:** `src/actions/religious.ts`
    *   `getSpiritualHabits()`, `seedDefaultSpiritualHabits()`, `addSpiritualHabit(name)`, `deleteSpiritualHabit(id)`: Manage the habit lists.
    *   `getSpiritualTodayData(dateStr)`: Fetches checked status for any selected date.
    *   `toggleSpiritualHabit(dateStr, habitId, currentCompleted)`: Checks/unchecks habit.
    *   `setPrayerJamaat(dateStr, habitId, prayedWithJamaat)`: Sets congregation flag.
    *   `updateQuranMemorization(...)` and `updateOtherActivities(...)`: Log text logs.

---

## 7. Dynamic Time Table & Geolocation

*   **Description:** Helps users structure their day and automatically aligns routines with astronomical prayer times.
*   **User Interface:** Located at `/timetable`. Includes forms to set default waking, sleeping, and work hours. Also features a location lookup button that triggers browser GPS coordinates to dynamically calculate prayer times.
*   **Database Model:** 
    *   `TimeTable` (1:1 relation with User): Holds wakeUpTime, tillSunrise, sunriseTillOffice, officeDeparture, officeReturn, gymPreference, maghribToIsha, ishaToHifz, hifzClassTime, sleepTime.
*   **Server Actions:** `src/actions/timetable.ts`
    *   `getTimeTable()`: Gets or initializes the timetable.
    *   `updateTimeTable(formData)`: Saves form values.
    *   `updateUserLocation(lat, lng, name)`: Saves coordinates and names.
    *   `updateCalculationMethod(methodId)`: Configures prayer timing school preferences.

---

## 8. Structured Journaling System

*   **Description:** A categorized logger designed to capture various aspects of daily life.
*   **User Interface:** Located at `/journal/[category]`, where subpaths route to:
    *   **Office Work:** Features fields for project name, ticket numbers, work type (Feature, Refactor, Bug Fix, Deployment, Meeting, Support), and duration.
    *   **Career Learnings:** Displays a list of studied subjects (Frontend, Backend, ML, DSA, etc.) using uniquely colored pill badges.
    *   **Miscellaneous:** General travel logs, restaurant visits, or thoughts.
*   **Database Model:**
    *   `JournalEntry`: Holds text content, category (`OFFICE`, `LEARNING`, `MISC`), and metadata fields (subject, project, ticketId, workType, duration, location, activity, tag).
*   **Server Actions:** `src/actions/journal.ts`
    *   `getJournalEntries(category)`: Fetches filtered entries.
    *   `addJournalEntry(content, category, metadata)`: Saves a categorized log.
    *   `deleteJournalEntry(id)`: Deletes a journal record.

---

## 9. Fitness Tracker

*   **Description:** A dashboard to log fitness activities.
*   **User Interface:** Located at `/fitness`. Includes summary widgets for active duration, total workouts, and total distance covered, alongside workout grids with colored indicators based on workout types (Gym, Run, Swim, Yoga).
*   **Database Model:**
    *   `FitnessLog`: Stores exercise type, duration (minutes), distance (kilometers), muscle groups targeted, and notes.
*   **Server Actions:** `src/actions/fitness.ts`
    *   `getFitnessLogs()`: Retreives historical exercise sessions.
    *   `addFitnessLog(activity, duration, distance, notes, date, muscleGroup)`: Logs a workout.
    *   `deleteFitnessLog(id)`: Deletes an activity log.

---

## 10. Checklists (Daily & Weekend Tasks)

*   **Description:** Split checklists for organizing task completion during weekdays versus weekends.
*   **User Interface:** Located at `/tasks`. Features side-by-side components for daily tasks and recurring weekend items.
*   **Database Models:**
    *   `DailyTask`: Single-day checklist items.
    *   `WeekendTask` & `WeekendTaskLog`: Weekend tasks tracked by week start dates.
*   **Server Actions:** `src/actions/tasks.ts`
    *   Handles listing, creating, toggling completion status, and deleting for both daily and weekend items.

---

## 11. Core Repositories & Utilities

*   **Books Dashboard (`/books`):** Tracks reading lists, book author details, general notes, and external file shares (e.g. Google Drive links). Triggers actions from `src/actions/books.ts`.
*   **Documents Manager (`/documents`):** A link saver to organize web references, online templates, or file attachments. Triggers actions from `src/actions/documents.ts`.
*   **Habit Tracker (`/relapse`):** Logs habits and recovery stats. Tracks days clean and relapse dates to show recovery progress. Triggers actions from `src/actions/relapse.ts`.
*   **Personal Notepad (`/notes`):** A simplified textual markdown tool to write short-term notes. Triggers actions from `src/actions/notes.ts`.
*   **Dua Supplications (`/dua`):** A collection of personal and family prayers, complete with translations and categories (Family, Career, Personal). Triggers actions from `src/actions/dua.ts`.
