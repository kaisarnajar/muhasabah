# Generalization Report: Decoupling Muhasabah from a Single-Faith Structure

Currently, Muhasabah is designed primarily for Muslim users. It features hardcoded prayer lists, Quran memorization widgets, Arabic quotes, and Islamic schedules. 

To expand the application's user base, it should be refactored into a **multi-faith and secular accountability dashboard**. This report outlines the changes needed in the database schema, business logic, APIs, and UI to allow any user to customize the dashboard to their preferred belief system or routine.

---

## 1. Core Architecture Strategy: User-Selected Profiles

Instead of hardcoding Islamic rituals into the database and UI, we will introduce a `faithProfile` field on the `User` entity. This field supports the following configurations:

1.  **ISLAMIC:** Seeds five daily prayers (Fajr, Zuhur, Asr, Maghrib, Isha), Quran readings, and Adhkar. It enables geolocation-based prayer calculations.
2.  **CHRISTIAN:** Seeds morning devotions, Bible study, Sunday service logs, and evening reflections.
3.  **HINDU:** Seeds Puja, Mantra chanting, Bhagavad Gita study, and evening Aarti.
4.  **SECULAR / MINDFULNESS:** Seeds morning meditation, journaling, gratitude checklists, reading milestones, and breathing exercises.
5.  **CUSTOM:** Starts with an empty checklist, allowing the user to build their routine from scratch.

---

## 2. Database Schema Adjustments (Prisma Migration)

We need to modify the schema to make the database models more generic.

### Schema Changes

```diff
model User {
  id                Int       @id @default(autoincrement())
  name              String
  email             String    @unique
  passwordHash      String
  emailVerified     Boolean   @default(false)
+ faithProfile      FaithProfile @default(SECULAR)
  latitude          Float?
  longitude         Float?
  locationName      String?
  calculationMethod Int       @default(1)
  
- duas              Dua[]
+ reflections       Reflection[]
  ...
}

+enum FaithProfile {
+  ISLAM
+  CHRISTIAN
+  HINDU
+  SECULAR
+  CUSTOM
+}

-enum DuaCategory {
-  PERSONAL
-  FAMILY
-  CAREER
-  GENERAL
-}

-model Dua {
-  id          Int         @id @default(autoincrement())
-  userId      Int
-  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
-  title       String
-  content     String      @db.Text
-  translation String?     @db.Text
-  category    DuaCategory @default(PERSONAL)
-  createdAt   DateTime    @default(now()) @db.Timestamptz()
-}

+model Reflection {
+  id          Int              @id @default(autoincrement())
+  userId      Int
+  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
+  title       String
+  content     String           @db.Text
+  translation String?          @db.Text // Optional original script translations
+  category    ReflectionCategory @default(PERSONAL)
+  createdAt   DateTime         @default(now()) @db.Timestamptz()
+}

+enum ReflectionCategory {
+  PERSONAL
+  FAMILY
+  CAREER
+  GENERAL
+  PRAYER
+  MEDITATION
+}
```

### Decoupling the Hardcoded Timetable Schema

Currently, `TimeTable` contains hardcoded columns like `tillSunrise`, `maghribToIsha`, and `ishaToHifz`. We will replace these with dynamic, user-definable slots.

```diff
model TimeTable {
  id                    Int      @id @default(autoincrement())
  userId                Int      @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  wakeUpTime            String   @default("06:00")
- tillSunrise           String   @default("Dua, Adhkar & Fajr Prayer")
- sunriseTillOffice     String   @default("Recitation, Study & Breakfast")
- officeDeparture       String   @default("08:30")
- officeReturn          String   @default("17:30")
- gymPreference         String   @default("NONE")
- maghribToIsha         String   @default("Spiritual reading, family time")
- ishaToHifz            String   @default("Isha prayer and Quran review")
- hifzClassTime         String   @default("22:00")
  sleepTime             String   @default("22:30")
  createdAt             DateTime @default(now()) @db.Timestamptz()
  updatedAt             DateTime @updatedAt @db.Timestamptz()
+ slots                 TimeTableSlot[]
}

+model TimeTableSlot {
+  id            Int       @id @default(autoincrement())
+  timeTableId   Int
+  timeTable     TimeTable @relation(fields: [timeTableId], references: [id], onDelete: Cascade)
+  startTime     String    // e.g. "08:30"
+  endTime       String    // e.g. "17:30"
+  title         String    // e.g. "Work Hours"
+  description   String?
+  activityType  String    // e.g. "WORK", "MEDITATION", "PHYSICAL", "REST", "PRAYER"
+}
```

---

## 3. Generalizing Code Logic & Utility Layers

### Seeding Strategies (`seed.ts`)

In `src/lib/spiritualHabits.ts`, we rename the default definitions and load them conditionally based on the user's profile:

```typescript
export interface HabitSeed {
  name: string;
  isPrayer: boolean;
}

export const FAITH_HABITS_SEEDS: Record<string, HabitSeed[]> = {
  ISLAM: [
    { name: 'Fajr', isPrayer: true },
    { name: 'Zuhur', isPrayer: true },
    { name: 'Asr', isPrayer: true },
    { name: 'Maghrib', isPrayer: true },
    { name: 'Isha', isPrayer: true },
    { name: 'Tahajjud', isPrayer: true },
    { name: 'Azkaar', isPrayer: false },
    { name: 'Quran Memorisation', isPrayer: false }
  ],
  CHRISTIAN: [
    { name: 'Morning Devotional', isPrayer: true },
    { name: 'Bible Reading', isPrayer: false },
    { name: 'Community Fellowship', isPrayer: false },
    { name: 'Evening Intercession', isPrayer: true }
  ],
  HINDU: [
    { name: 'Pratah Sandhya Puja', isPrayer: true },
    { name: 'Mantra Chanting', isPrayer: true },
    { name: 'Scripture Reading', isPrayer: false },
    { name: 'Evening Aarti', isPrayer: true }
  ],
  SECULAR: [
    { name: 'Morning Meditation', isPrayer: false },
    { name: 'Gratitude Journaling', isPrayer: false },
    { name: 'Active Exercise', isPrayer: false },
    { name: 'Evening Reflection', isPrayer: false }
  ]
};
```

---

## 4. UI Generalization Details

### Dynamic Dashboard Quote Engine

We will replace the hardcoded Umar RA quote card in `src/app/(dashboard)/page.tsx` with a dynamic engine. When the user logs in, the dashboard reads their `faithProfile` and displays an appropriate quote:

*   **ISLAMIC:** Quotes from Prophet Muhammad (PBUH), Umar RA, or other Islamic scholars.
*   **CHRISTIAN:** Biblical passages or quotes from Christian authors.
*   **HINDU:** Verses from the Bhagavad Gita or Upanishads.
*   **SECULAR:** Inspirational quotes from philosophers like Marcus Aurelius, Seneca, or modern writers.

### Modular Dashboard Rendering

The main dashboard will show or hide widgets based on the selected profile:

```tsx
{/* Render Quran memorization stats only for Islamic profiles */}
{user.faithProfile === 'ISLAM' && (
  <Link href="/religious" className="card">
     <h4>Quran Memorisation</h4>
     <div>{monthlyQuranVerses} verses</div>
  </Link>
)}

{/* Render general spiritual habits for other profiles */}
{user.faithProfile !== 'ISLAM' && (
  <Link href="/religious" className="card">
     <h4>Mindful Habits Consistency</h4>
     <div>{completionPercentage}% completed this month</div>
  </Link>
)}
```

---

## 5. Migration Roadmap to a Multi-Faith System

1.  **Schema Migration:** Run a Prisma migration to add `faithProfile` and create the `Reflection` and `TimeTableSlot` tables.
2.  **Registration Choice:** Add a profile selection step during user registration, letting users choose their preferred faith profile.
3.  **Refactor the Timetable:** Update the schedule interface to allow users to add custom slots rather than relying on a static, hardcoded layout.
4.  **UI Updates:** Update labels across the app (e.g., changing `/dua` to `/reflections` and `/religious` to `/spiritual` or `/mindfulness`) to align with the chosen profile.
