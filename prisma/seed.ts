import { PrismaClient, TransactionType, GoalCategory, GoalPriority, JournalCategory, DebtType, DebtStatus, DuaCategory } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Cleaning up existing data...');
  // Delete all dependent data first
  await prisma.verificationToken.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.spiritualHabitLog.deleteMany();
  await prisma.spiritualHabit.deleteMany();
  await prisma.spiritualDayLog.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.dailyTask.deleteMany();
  await prisma.debtRecord.deleteMany();
  await prisma.person.deleteMany();
  await prisma.weekendTaskLog.deleteMany();
  await prisma.weekendTask.deleteMany();
  await prisma.note.deleteMany();
  await prisma.fitnessLog.deleteMany();
  await prisma.recurringTracker.deleteMany();
  await prisma.dua.deleteMany();
  await prisma.book.deleteMany();
  await prisma.relapseLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.timeTable.deleteMany();
  // Finally delete users
  await prisma.user.deleteMany();

  console.log('Seeding Users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.create({
    data: {
      name: 'Test User 1',
      email: 'test1@example.com',
      passwordHash,
      emailVerified: true,
      latitude: 12.9716,
      longitude: 77.5946,
      locationName: 'Bengaluru, India',
      calculationMethod: 2,
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Test User 2',
      email: 'test2@example.com',
      passwordHash,
      emailVerified: true,
    }
  });

  const uId = user1.id;

  // --- TIMETABLE ---
  console.log('Seeding Time Table...');
  await prisma.timeTable.create({
    data: {
      userId: uId,
      wakeUpTime: '05:00',
      tillSunrise: 'Adhkar, Quran Memorisation & morning reflection',
      sunriseTillOffice: 'Exercise at home, study technical concepts & breakfast',
      officeDeparture: '08:30',
      officeReturn: '17:30',
      gymPreference: 'AFTER_ISHA',
      maghribToIsha: 'Dua class, Arabic grammar revision & family dinner',
      ishaToHifz: 'Isha prayer, revision of previous Juz, dinner prep',
      hifzClassTime: '22:00',
      sleepTime: '22:30',
    }
  });

  console.log(`Seeding massive data for Test User 1 (ID: ${uId})...`);

  const today = new Date();
  const getPastDate = (daysAgo: number) => {
    const d = new Date(today);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - daysAgo);
    return d;
  };
  const getMonday = (d: Date) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  // --- TRANSACTIONS ---
  console.log('Seeding Transactions...');
  const txs = [];
  for (let i = 0; i < 300; i++) {
    txs.push({
      userId: uId,
      amount: Math.floor(Math.random() * 500) + 5,
      description: `Expense ${i}`,
      category: ['Food', 'Transport', 'Shopping', 'Utilities', 'Health', 'General', 'Other'][Math.floor(Math.random() * 7)],
      type: TransactionType.EXPENSE,
      date: getPastDate(Math.floor(Math.random() * 365)),
    });
  }
  for (let i = 0; i < 50; i++) {
    txs.push({
      userId: uId,
      amount: Math.floor(Math.random() * 4000) + 1000,
      description: `Income ${i}`,
      category: ['Salary', 'Freelance', 'Business', 'Gift'][Math.floor(Math.random() * 4)],
      type: TransactionType.INCOME,
      date: getPastDate(Math.floor(Math.random() * 365)),
    });
  }
  await prisma.transaction.createMany({ data: txs });

  // --- GOALS ---
  console.log('Seeding Goals...');
  const goals = [];
  const goalSamples = [
    { title: 'Read 1 Juz of Quran daily', description: 'Keep up with daily Quranic reading goals.', category: 'RELIGIOUS' },
    { title: 'Pray Fajr in the mosque', description: 'Strive to pray congregational Fajr prayer.', category: 'RELIGIOUS' },
    { title: 'Learn TypeScript design patterns', description: 'Improve code architecture skills.', category: 'CAREER' },
    { title: 'Save 30% of monthly income', description: 'Put money into long-term savings account.', category: 'FINANCES' },
    { title: 'Run a total of 50 km this month', description: 'Track runs using fitness tracker.', category: 'HEALTH' },
    { title: 'Journal every single evening', description: 'Reflect on accomplishments and emotions.', category: 'PERSONAL' }
  ];

  for (const sample of goalSamples) {
    goals.push({
      userId: uId,
      title: sample.title,
      description: sample.description,
      category: sample.category as GoalCategory,
      priority: Object.values(GoalPriority)[Math.floor(Math.random() * Object.values(GoalPriority).length)],
      progress: Math.floor(Math.random() * 100),
      targetDate: Math.random() > 0.5 ? getPastDate(Math.floor(Math.random() * -100)) : null,
      isCompleted: Math.random() > 0.8,
      reminders: Math.random() > 0.5,
    });
  }
  await prisma.goal.createMany({ data: goals });

  // --- SPIRITUAL HABITS & LOGS ---
  console.log('Seeding Spiritual Habits...');
  const defaultHabits = [
    'Fajr', 'Zuhur', 'Asr', 'Maghrib', 'Isha', 'Azkaar', 'Quran Memorisation', 'Tahajjud'
  ];
  const seededHabits = [];
  for (const name of defaultHabits) {
    const habit = await prisma.spiritualHabit.create({ data: { name, userId: uId } });
    seededHabits.push(habit);
  }

  console.log('Seeding Spiritual Logs...');
  const habitLogs = [];
  const dayLogs = [];
  const sampleDeeds = ['Watched video lecture', 'Read book', 'Gave Sadaqah'];

  for (let i = 0; i < 180; i++) {
    const date = getPastDate(i);
    const hasQuran = Math.random() > 0.4;
    const hasOtherDeeds = Math.random() > 0.3;
    
    let quranVal = null;
    if (hasQuran) quranVal = JSON.stringify({ surahNumber: 1, fromVerse: 1, toVerse: 10 });
    let otherVal = null;
    if (hasOtherDeeds) otherVal = sampleDeeds[Math.floor(Math.random() * sampleDeeds.length)];

    if (hasQuran || hasOtherDeeds) {
      dayLogs.push({ userId: uId, date, quranMemorization: quranVal, otherActivities: otherVal });
    }

    for (const habit of seededHabits) {
      const isTahajjud = habit.name === 'Tahajjud';
      const isQuran = habit.name === 'Quran Memorisation';
      const threshold = isTahajjud ? 0.7 : (isQuran && !hasQuran) ? 0.9 : 0.2;
      const isCompleted = Math.random() > threshold;
      const isCompulsoryPrayer = ['Fajr', 'Zuhur', 'Asr', 'Maghrib', 'Isha'].includes(habit.name);
      
      habitLogs.push({
        habitId: habit.id,
        date,
        isCompleted,
        prayedWithJamaat: isCompulsoryPrayer && isCompleted ? Math.random() > 0.4 : false,
      });
    }
  }

  await prisma.spiritualDayLog.createMany({ data: dayLogs });
  await prisma.spiritualHabitLog.createMany({ data: habitLogs });

  // --- JOURNAL ENTRIES ---
  console.log('Seeding Journal Entries...');
  const journalData = [];
  const categories = Object.values(JournalCategory);
  
  const officeProjects = ["Muhasabah App", "Payment Gateway", "Auth Service", "Notification Engine", "Reports Portal"];
  const officeTickets = ["JIRA-1042", "JIRA-2940", "JIRA-3811", "JIRA-4022", "JIRA-1190"];
  const officeWorkTypes = ["Feature", "Bug Fix", "Refactor", "Meeting", "Deployment", "Support", "Other"];
  const officeDurations = ["1.5h", "3h", "4.5h", "2h", "45m", "8h"];
  const officeContents = [
    "Worked on integrating Aladhan API for dynamic prayer timings.",
    "Fixed a bug where the sidebar is not scrollable on small screens.",
    "Refactored the dashboard components for better performance.",
    "Sprint planning meeting with team and discussing architecture.",
    "Deployed build v1.2.0 to staging and ran sanity checks.",
    "Resolved customer ticket regarding password reset failure.",
    "Updated Prisma models to support custom fields in dev log cards."
  ];

  const learningSubjects = [
    "Android Development",
    "Backend Development",
    "Frontend Development",
    "Java",
    "C++",
    "DSA",
    "Machine Learning",
    "AI & ML",
    "AI Engineering",
    "System Design",
    "TypeScript",
    "Next.js"
  ];
  const learningContents = [
    "Learned about standard Asr time computation in Shafi Fiqh.",
    "Explored React Portals for modal rendering outside parent DOM tree.",
    "Studied hash-based dynamic color generator for topic badges.",
    "Solved 3 medium LeetCode problems on Dynamic Programming.",
    "Watched a tutorial on building neural networks with TensorFlow.",
    "Practiced multithreading concepts and synchronization in Java.",
    "Built a simple application using Jetpack Compose in Android."
  ];

  const miscLocations = ["Bengaluru", "Nandi Hills", "Mysuru", "Koramangala", "Indiranagar", "Bannerghatta Park"];
  const miscActivities = ["Travel", "Food", "Social", "Shopping", "Health", "Thoughts", "Entertainment", "Other"];
  const miscTags = ["two days trip", "dinner outside", "weekend outing", "birthday party", "evening run", "shopping spree"];
  const miscContents = [
    "Went to Nandi Hills for sunrise on a two days trip. Amazing weather!",
    "Had a delicious dinner outside with family at Koramangala.",
    "Met up with college friends after a long time. Had deep conversations.",
    "Purchased some new winter clothes and books from the local store.",
    "Went for an evening run around the lake. Felt very refreshed.",
    "Reflected on personal growth goals and drafted a plan for the next month.",
    "Visited the Bannerghatta national park and saw the safari animals."
  ];

  for (let i = 0; i < 100; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const entryDate = getPastDate(Math.floor(Math.random() * 365));
    
    let entry: any = {
      userId: uId,
      category,
      date: entryDate,
      createdAt: entryDate,
    };

    if (category === 'OFFICE') {
      entry.project = officeProjects[Math.floor(Math.random() * officeProjects.length)];
      entry.ticketId = Math.random() > 0.3 ? officeTickets[Math.floor(Math.random() * officeTickets.length)] : null;
      entry.workType = officeWorkTypes[Math.floor(Math.random() * officeWorkTypes.length)];
      entry.duration = Math.random() > 0.2 ? officeDurations[Math.floor(Math.random() * officeDurations.length)] : null;
      entry.content = officeContents[Math.floor(Math.random() * officeContents.length)];
    } else if (category === 'LEARNING') {
      entry.subject = Math.random() > 0.15 ? learningSubjects[Math.floor(Math.random() * learningSubjects.length)] : null;
      entry.content = learningContents[Math.floor(Math.random() * learningContents.length)];
    } else if (category === 'MISC') {
      entry.location = Math.random() > 0.25 ? miscLocations[Math.floor(Math.random() * miscLocations.length)] : null;
      entry.activity = miscActivities[Math.floor(Math.random() * miscActivities.length)];
      entry.tag = Math.random() > 0.3 ? miscTags[Math.floor(Math.random() * miscTags.length)] : null;
      entry.content = miscContents[Math.floor(Math.random() * miscContents.length)];
    }

    journalData.push(entry);
  }
  await prisma.journalEntry.createMany({ data: journalData });

  // --- DAILY TASKS ---
  console.log('Seeding Daily Tasks...');
  const dailyTasks = [];
  for (let i = 0; i < 100; i++) {
    dailyTasks.push({
      userId: uId,
      title: `Daily Task ${i}`,
      isCompleted: Math.random() > 0.4,
      targetDate: getPastDate(Math.floor(Math.random() * 30)), 
    });
  }
  await prisma.dailyTask.createMany({ data: dailyTasks });

  // --- WEEKEND TASKS & LOGS ---
  console.log('Seeding Weekend Tasks...');
  const weekendTaskTitles = ['Bathing', 'Ears Cleaning', 'Room Cleaning', 'Hair Cutting'];
  for (const title of weekendTaskTitles) {
    const task = await prisma.weekendTask.create({ data: { title, userId: uId } });
    const logs = [];
    for (let w = 0; w < 12; w++) {
      if (Math.random() > 0.3) {
        const d = getPastDate(w * 7);
        const weekStart = getMonday(d);
        logs.push({ weekendTaskId: task.id, date: d, weekStartDate: weekStart });
      }
    }
    if (logs.length > 0) {
      const uniqueLogs = Array.from(new Map(logs.map(l => [l.weekStartDate.toISOString(), l])).values());
      await prisma.weekendTaskLog.createMany({ data: uniqueLogs });
    }
  }

  // --- DEBTS & PERSONS ---
  console.log('Seeding Persons and Debts...');
  const peopleNames = ['John Doe', 'Alice Smith', 'Bob Johnson'];
  for (const name of peopleNames) {
    const person = await prisma.person.create({ data: { name, userId: uId } });
    const numDebts = Math.floor(Math.random() * 8) + 2;
    const debts = [];
    for (let i = 0; i < numDebts; i++) {
      debts.push({
        personId: person.id,
        amount: Math.floor(Math.random() * 1000) + 10,
        type: Math.random() > 0.5 ? DebtType.CREDIT : DebtType.DEBIT,
        status: Math.random() > 0.6 ? DebtStatus.PAID : DebtStatus.PENDING,
        date: getPastDate(Math.floor(Math.random() * 365)),
        notes: Math.random() > 0.5 ? `Expense context ${i}` : null,
      });
    }
    await prisma.debtRecord.createMany({ data: debts });
  }

  // --- NOTES ---
  console.log('Seeding Notes...');
  await prisma.note.createMany({
    data: [
      { userId: uId, title: 'Project Ideas', content: '1. Build a personal finance tracker', createdAt: getPastDate(5) },
      { userId: uId, title: 'Shopping List', content: '- Milk\n- Eggs', createdAt: getPastDate(2) }
    ]
  });

  // --- FITNESS LOGS ---
  console.log('Seeding Fitness Logs...');
  const fitnessLogs = [];
  const activitiesList = ['Running', 'Gym'];
  const musclesList = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
  for (let i = 0; i < 25; i++) {
    const activity = activitiesList[Math.floor(Math.random() * activitiesList.length)];
    const isGym = activity === 'Gym';
    fitnessLogs.push({
      userId: uId,
      activity,
      duration: isGym ? 45 + Math.floor(Math.random() * 30) : 20 + Math.floor(Math.random() * 40),
      distance: isGym ? null : 3 + Math.random() * 7,
      muscleGroup: isGym ? musclesList[Math.floor(Math.random() * musclesList.length)] : null,
      notes: isGym ? 'Great pump today, felt strong.' : 'Paced run, felt good.',
      date: getPastDate(Math.floor(Math.random() * 30)),
    });
  }
  await prisma.fitnessLog.createMany({ data: fitnessLogs });

  // --- DUAS ---
  console.log('Seeding Duas...');
  await prisma.dua.createMany({
    data: [
      {
        userId: uId,
        title: 'Dua for Knowledge',
        content: 'اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي',
        translation: 'O Allah, benefit me with what You have taught me',
        category: DuaCategory.CAREER,
      }
    ]
  });

  // --- BOOKS ---
  console.log('Seeding Books...');
  await prisma.book.createMany({
    data: [
      {
        userId: uId,
        title: 'Atomic Habits',
        author: 'James Clear',
        driveLink: null,
        notes: 'An easy way to build habits.',
        date: getPastDate(2),
      }
    ]
  });

  // --- RELAPSE LOGS ---
  console.log('Seeding Relapse Logs...');
  await prisma.relapseLog.createMany({
    data: [
      { userId: uId, date: getPastDate(30), notes: 'Stressful day.' },
    ]
  });

  // --- DOCUMENTS ---
  console.log('Seeding Documents...');
  await prisma.document.createMany({
    data: [
      {
        userId: uId,
        title: 'Gym Workout Plan (PPL Split)',
        link: 'https://drive.google.com/file/d/example-gym-plan',
        notes: 'Push-Pull-Legs split with progressive overload schedule.',
        date: getPastDate(5),
      },
      {
        userId: uId,
        title: 'Quran Memorisation Tracker',
        link: 'https://docs.google.com/spreadsheets/d/example-quran-tracker',
        notes: 'Month-wise Juz progress sheet for Hifz program.',
        date: getPastDate(10),
      },
      {
        userId: uId,
        title: 'Monthly Budget Spreadsheet',
        link: 'https://docs.google.com/spreadsheets/d/example-budget',
        notes: 'Income vs expense tracker for each month.',
        date: getPastDate(15),
      },
      {
        userId: uId,
        title: 'Android Dev Roadmap',
        link: 'https://roadmap.sh/android',
        notes: 'Complete path from beginner to intermediate Android developer.',
        date: getPastDate(20),
      },
      {
        userId: uId,
        title: 'Salary Slip - June 2026',
        link: 'https://drive.google.com/file/d/example-salary-slip',
        notes: 'Official salary slip from employer for June 2026.',
        date: getPastDate(3),
      },
      {
        userId: uId,
        title: 'Resume - July 2026',
        link: 'https://drive.google.com/file/d/example-resume',
        notes: 'Latest resume with updated experience and skills.',
        date: getPastDate(7),
      },
    ]
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
