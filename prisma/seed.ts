import {
  PrismaClient,
  TransactionType,
  GoalCategory,
  GoalPriority,
  JournalCategory,
  DebtType,
  DebtStatus,
  DuaCategory,
} from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🧹 Cleaning up existing data...');


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
  // Books & folders
  await prisma.book.deleteMany();
  await prisma.bookFolder.deleteMany();
  // Documents & folders
  await prisma.document.deleteMany();
  await prisma.documentFolder.deleteMany();
  await prisma.relapseLog.deleteMany();
  await prisma.timeTable.deleteMany();
  await prisma.user.deleteMany();

  // ── Helpers ────────────────────────────────────────────────────────────────
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
    date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
    return date;
  };
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  // ── Users ──────────────────────────────────────────────────────────────────
  console.log('👤 Seeding Users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      name: 'Test User 1',
      email: 'test1@example.com',
      passwordHash,
      latitude: 12.9716,
      longitude: 77.5946,
      locationName: 'Bengaluru, India',
      calculationMethod: 1,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Test User 2',
      email: 'test2@example.com',
      passwordHash,
    },
  });

  const uId = user1.id;

  // ── Timetable ──────────────────────────────────────────────────────────────
  console.log('⏰ Seeding Timetable...');
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
    },
  });

  // ── Transactions ───────────────────────────────────────────────────────────
  console.log('💰 Seeding Transactions...');
  const expenseDescs = [
    'Grocery shopping', 'Petrol / fuel', 'Electricity bill', 'Water bill',
    'Internet bill', 'Mobile recharge', 'Restaurant dinner', 'Lunch at office',
    'Medical consultation', 'Medicines', 'Clothes shopping', 'Shoes',
    'Books & stationery', 'Online subscription', 'Gym membership',
    'Auto / cab fare', 'Bus ticket', 'Movie tickets', 'Household supplies',
    'Charity / Sadaqah', 'Gift for friend', 'Electronics accessory',
    'Barber / haircut', 'Laundry', 'Snacks',
  ];
  const incomeDescs = [
    'Monthly salary', 'Freelance project', 'Side project payment',
    'Bonus from office', 'Gift from family', 'Dividend income',
  ];
  const expenseCats = ['Food', 'Transport', 'Shopping', 'Utilities', 'Health', 'General', 'Entertainment', 'Personal'];
  const incomeCats = ['Salary', 'Freelance', 'Business', 'Gift'];

  const txs: any[] = [];
  for (let i = 0; i < 300; i++) {
    txs.push({
      userId: uId,
      amount: rand(5, 800),
      description: pick(expenseDescs),
      category: pick(expenseCats),
      type: TransactionType.EXPENSE,
      date: getPastDate(rand(0, 365)),
    });
  }
  for (let i = 0; i < 60; i++) {
    txs.push({
      userId: uId,
      amount: rand(1000, 8000),
      description: pick(incomeDescs),
      category: pick(incomeCats),
      type: TransactionType.INCOME,
      date: getPastDate(rand(0, 365)),
    });
  }
  await prisma.transaction.createMany({ data: txs });

  // ── Goals ──────────────────────────────────────────────────────────────────
  console.log('🎯 Seeding Goals...');
  const goalSamples = [
    { title: 'Read 1 Juz of Quran daily', description: 'Keep up with daily Quranic reading goals.', category: GoalCategory.RELIGIOUS },
    { title: 'Pray Fajr in congregation', description: 'Pray congregational Fajr at the masjid.', category: GoalCategory.RELIGIOUS },
    { title: 'Memorise 2 new pages weekly', description: 'Consistent Hifz progress.', category: GoalCategory.RELIGIOUS },
    { title: 'Learn system design patterns', description: 'Improve architecture skills for senior roles.', category: GoalCategory.CAREER },
    { title: 'Build and release side project', description: 'Ship a production-ready mobile app.', category: GoalCategory.CAREER },
    { title: 'Complete DSA revision', description: 'Cover all major data structures and algorithms.', category: GoalCategory.CAREER },
    { title: 'Save 30% of monthly income', description: 'Emergency fund + long-term savings.', category: GoalCategory.FINANCES },
    { title: 'Invest in index funds monthly', description: 'SIP of fixed amount each month.', category: GoalCategory.FINANCES },
    { title: 'Run 50 km this month', description: 'Track via fitness app.', category: GoalCategory.HEALTH },
    { title: 'Gym 4x per week consistently', description: 'PPL split with progressive overload.', category: GoalCategory.HEALTH },
    { title: 'Journal every evening', description: 'Reflect on accomplishments and emotions.', category: GoalCategory.PERSONAL },
    { title: 'Read 2 books per month', description: 'Personal development + Islamic books.', category: GoalCategory.PERSONAL },
  ];
  await prisma.goal.createMany({
    data: goalSamples.map(g => ({
      userId: uId,
      title: g.title,
      description: g.description,
      category: g.category,
      priority: pick(Object.values(GoalPriority)),
      progress: rand(0, 100),
      targetDate: Math.random() > 0.4 ? getPastDate(rand(-120, 120)) : null,
      isCompleted: Math.random() > 0.75,
      reminders: Math.random() > 0.5,
    })),
  });

  // ── Spiritual Habits & Logs ────────────────────────────────────────────────
  console.log('🕌 Seeding Spiritual Habits & Logs...');
  const habitNames = ['Fajr', 'Zuhur', 'Asr', 'Maghrib', 'Isha', 'Azkaar', 'Quran Memorisation', 'Tahajjud', 'Duha Prayer'];
  const prayers = ['Fajr', 'Zuhur', 'Asr', 'Maghrib', 'Isha'];
  const seededHabits = [];
  for (const name of habitNames) {
    const h = await prisma.spiritualHabit.create({ data: { name, userId: uId, isPrayer: prayers.includes(name) } });
    seededHabits.push(h);
  }

  const habitLogs: any[] = [];
  const dayLogs: any[] = [];
  for (let i = 0; i < 180; i++) {
    const date = getPastDate(i);
    const hasQuran = Math.random() > 0.35;
    const hasDeeds = Math.random() > 0.4;
    if (hasQuran || hasDeeds) {
      dayLogs.push({
        userId: uId,
        date,
        quranMemorization: hasQuran ? JSON.stringify({ surahNumber: rand(1, 114), fromVerse: 1, toVerse: rand(5, 20) }) : null,
        otherActivities: hasDeeds ? pick(['Gave Sadaqah', 'Visited the sick', 'Read Islamic book', 'Attended Dars', 'Helped someone']) : null,
      });
    }
    for (const habit of seededHabits) {
      const isTahajjud = habit.name === 'Tahajjud' || habit.name === 'Duha Prayer';
      const threshold = isTahajjud ? 0.65 : 0.2;
      const isCompleted = Math.random() > threshold;
      habitLogs.push({
        habitId: habit.id,
        date,
        isCompleted,
        prayedWithJamaat: prayers.includes(habit.name) && isCompleted ? Math.random() > 0.4 : false,
      });
    }
  }
  await prisma.spiritualDayLog.createMany({ data: dayLogs });
  await prisma.spiritualHabitLog.createMany({ data: habitLogs });

  // ── Journal Entries ────────────────────────────────────────────────────────
  console.log('📓 Seeding Journal Entries...');
  const officeProjects = ['Muhasabah App', 'Payment Gateway', 'Auth Service', 'Notification Engine', 'Reports Portal', 'Mobile SDK'];
  const officeTickets = ['JIRA-1042', 'JIRA-2940', 'JIRA-3811', 'JIRA-4022', 'JIRA-1190', 'JIRA-5500'];
  const officeWorkTypes = ['Feature', 'Bug Fix', 'Refactor', 'Meeting', 'Deployment', 'Support', 'Other'];
  const officeDurations = ['1h', '1.5h', '2h', '3h', '4h', '4.5h', '8h'];
  const officeContents = [
    'Integrated Aladhan API for dynamic prayer timings with Shafi school support.',
    'Fixed sidebar not scrollable on small screens — now uses overflow-y: auto.',
    'Refactored dashboard components for better SSR performance.',
    'Sprint planning meeting — discussed Q3 architecture changes.',
    'Deployed v1.3.0 to staging and ran full smoke test suite.',
    'Resolved customer ticket: password reset email not delivered to Gmail.',
    'Updated Prisma models to support BookFolder and DocumentFolder.',
    'Implemented folder-based navigation for Documents and Books sections.',
    'Added per-card edit button for timetable timings.',
    'Fixed debt transaction history grid layout — now shows 3-5 cards per row.',
  ];
  const learningSubjects = [
    'Android Development', 'iOS Development', 'Backend Development', 'Frontend Development',
    'Next.js', 'TypeScript', 'React', 'Node.js', 'Java', 'Kotlin', 'Python', 'C++',
    'DSA', 'System Design', 'Database / SQL', 'Machine Learning', 'AI & ML',
    'AI Engineering', 'LLMs & Prompt Engineering', 'DevOps', 'Docker & Kubernetes',
    'Cloud (AWS / GCP / Azure)', 'Cybersecurity', 'Competitive Programming',
  ];
  const learningContents = [
    'Learned about Standard Asr time computation in Shafi Fiqh.',
    'Explored React Portals for modal rendering outside parent DOM tree.',
    'Studied consistent hashing for distributed systems.',
    'Solved 3 medium LeetCode DP problems — tabulation approach.',
    'Watched lecture on building neural networks with PyTorch.',
    'Practiced multithreading synchronization in Java (ReentrantLock vs synchronized).',
    'Built a basic Compose UI in Android with MVVM pattern.',
    'Understood the difference between SQL joins — LEFT, INNER, FULL OUTER.',
    'Read about CAP theorem and its trade-offs in distributed databases.',
    'Explored how LLM embeddings work for semantic search.',
    'Implemented binary search on answer technique for range problems.',
    'Studied microservices communication patterns — REST vs gRPC vs message queues.',
  ];
  const miscLocations = ['Bengaluru', 'Nandi Hills', 'Mysuru', 'Coorg', 'Chikmagalur', 'Mangalore'];
  const miscActivities = ['Travel', 'Food', 'Social', 'Shopping', 'Health', 'Thoughts', 'Entertainment'];
  const miscTags = ['road trip', 'dinner outside', 'weekend outing', 'birthday celebration', 'evening walk', 'family time'];
  const miscContents = [
    'Went to Nandi Hills for sunrise — amazing view, cool weather, refreshing.',
    'Had a delicious dinner at a coastal restaurant in Indiranagar.',
    'Met college friends after months — deep conversations about life goals.',
    'Bought new running shoes and a few Islamic books from the store.',
    'Ran 6 km around the lake in the evening, feeling very refreshed.',
    'Reflected on personal growth and drafted a 3-month roadmap.',
    'Visited Chikmagalur for a weekend coffee plantation trek.',
  ];

  const journalData: any[] = [];
  const cats = Object.values(JournalCategory);
  for (let i = 0; i < 120; i++) {
    const category = pick(cats);
    const date = getPastDate(rand(0, 365));
    const entry: any = { userId: uId, category, date, createdAt: date };
    if (category === 'OFFICE') {
      entry.project = pick(officeProjects);
      entry.ticketId = Math.random() > 0.3 ? pick(officeTickets) : null;
      entry.workType = pick(officeWorkTypes);
      entry.duration = Math.random() > 0.2 ? pick(officeDurations) : null;
      entry.content = pick(officeContents);
    } else if (category === 'LEARNING') {
      entry.subject = Math.random() > 0.1 ? pick(learningSubjects) : null;
      entry.content = pick(learningContents);
    } else {
      entry.location = Math.random() > 0.25 ? pick(miscLocations) : null;
      entry.activity = pick(miscActivities);
      entry.tag = Math.random() > 0.3 ? pick(miscTags) : null;
      entry.content = pick(miscContents);
    }
    journalData.push(entry);
  }
  await prisma.journalEntry.createMany({ data: journalData });

  // ── Daily Tasks ────────────────────────────────────────────────────────────
  console.log('✅ Seeding Daily Tasks...');
  const taskTitles = [
    'Review Quran Hifz notes', 'Do 30 min workout', 'Read 20 pages', 'Reply to emails',
    'Study DSA topic', 'Update expense tracker', 'Call family', 'Drink 8 glasses of water',
    'Prepare tomorrow\'s plan', 'Submit daily report', 'Review PR comments', 'Attend standup',
    'Complete LeetCode problem', 'Watch 1 lecture', 'Clean workspace', 'Review goals',
  ];
  const dailyTasks: any[] = [];
  for (let i = 0; i < 80; i++) {
    dailyTasks.push({
      userId: uId,
      title: pick(taskTitles),
      isCompleted: Math.random() > 0.4,
      targetDate: getPastDate(rand(0, 30)),
    });
  }
  await prisma.dailyTask.createMany({ data: dailyTasks });

  // ── Weekend Tasks & Logs ───────────────────────────────────────────────────
  console.log('📅 Seeding Weekend Tasks...');
  const weekendTaskTitles = [
    'Bathing', 'Ears Cleaning', 'Clothes Washing', 'Shoe Cleaning',
    'Washroom Cleaning', 'Room Cleaning', 'Beard Setting', 'Hands Nail Cutting',
    'Hair Removal', 'Feet Nail Cutting', 'Hair Cutting', 'Expense Tracker',
    'Tasks Tracker', 'Iron Clothes',
  ];
  for (const title of weekendTaskTitles) {
    const task = await prisma.weekendTask.create({ data: { title, userId: uId } });
    const logs: any[] = [];
    for (let w = 0; w < 12; w++) {
      if (Math.random() > 0.35) {
        const d = getPastDate(w * 7);
        const weekStart = getMonday(d);
        logs.push({ weekendTaskId: task.id, date: d, weekStartDate: weekStart });
      }
    }
    if (logs.length > 0) {
      const unique = Array.from(new Map(logs.map(l => [l.weekStartDate.toISOString(), l])).values());
      await prisma.weekendTaskLog.createMany({ data: unique });
    }
  }

  // ── Persons & Debts ────────────────────────────────────────────────────────
  console.log('💳 Seeding Debts...');
  const debtPeople = [
    { name: 'Ahmed Khan', notes: ['Borrowed for rent', 'Restaurant split', 'Emergency loan', 'Book purchase'] },
    { name: 'Sara Ali', notes: ['Travel expenses', 'Shared cab', 'Coffee', 'Birthday gift split'] },
    { name: 'Omar Farooq', notes: ['Grocery split', 'Movie tickets', 'Parking', 'Petrol'] },
    { name: 'Fatima Noor', notes: ['Medical bill share', 'Office lunch', 'Stationery', 'Subscription split'] },
  ];
  for (const { name, notes: debtNotes } of debtPeople) {
    const person = await prisma.person.create({ data: { name, userId: uId } });
    const debts: any[] = [];
    for (let i = 0; i < rand(4, 10); i++) {
      debts.push({
        personId: person.id,
        amount: rand(20, 2000),
        type: Math.random() > 0.5 ? DebtType.CREDIT : DebtType.DEBIT,
        status: Math.random() > 0.55 ? DebtStatus.PAID : DebtStatus.PENDING,
        date: getPastDate(rand(0, 365)),
        notes: Math.random() > 0.3 ? pick(debtNotes) : null,
      });
    }
    await prisma.debtRecord.createMany({ data: debts });
  }

  // ── Notes ──────────────────────────────────────────────────────────────────
  console.log('📝 Seeding Notes...');
  await prisma.note.createMany({
    data: [
      { userId: uId, title: 'Project Ideas', content: '1. Personal finance tracker\n2. Quran revision app\n3. Habit streak visualiser\n4. AI-powered journaling assistant', createdAt: getPastDate(10) },
      { userId: uId, title: 'Shopping List', content: '- Milk\n- Eggs\n- Almonds\n- Dates\n- Protein powder', createdAt: getPastDate(3) },
      { userId: uId, title: 'Books to Read', content: '1. Atomic Habits — James Clear\n2. Deep Work — Cal Newport\n3. The Alchemist — Paulo Coelho\n4. Fiqh of Worship — Dr. Hatem al-Haj', createdAt: getPastDate(7) },
      { userId: uId, title: 'Quran Hifz Plan', content: 'Target: 2 pages new + 5 pages revision daily\nWeek 1: Surah Al-Mulk\nWeek 2: Surah Al-Qiyamah\nWeek 3: Surah Al-Insan', createdAt: getPastDate(14) },
      { userId: uId, title: 'Career Goals 2026', content: '- Get senior developer title\n- Build 2 production-ready side projects\n- Complete system design course\n- Contribute to open source', createdAt: getPastDate(20) },
      { userId: uId, title: 'Daily Dua Reminders', content: 'Morning: Ayatul Kursi + last 2 ayahs of Al-Baqarah\nEvening: Surah Al-Ikhlas x3, Al-Falaq, An-Nas\nBefore sleep: Surah Al-Mulk', createdAt: getPastDate(1) },
    ],
  });

  // ── Fitness Logs ───────────────────────────────────────────────────────────
  console.log('🏋️ Seeding Fitness Logs...');
  const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
  const gymNotes = ['Great pump, felt strong.', 'Increased bench by 2.5 kg.', 'PB on deadlift today.', 'Focused on form.', 'High volume session.'];
  const runNotes = ['Easy 5k pace run.', 'Interval training.', 'Long slow run by the lake.', 'Felt refreshed post-run.', 'New personal best 6k.'];
  const fitnessActivities = ['Running', 'Gym', 'Walking', 'Cycling', 'Yoga', 'Swimming'];
  const fitnessLogs: any[] = [];
  for (let i = 0; i < 50; i++) {
    const activity = pick(fitnessActivities);
    const isGym = activity === 'Gym';
    const isCardio = ['Running', 'Walking', 'Cycling', 'Swimming'].includes(activity);
    fitnessLogs.push({
      userId: uId,
      activity,
      duration: isGym ? rand(40, 75) : rand(20, 60),
      distance: isCardio ? parseFloat((rand(3, 12) + Math.random()).toFixed(2)) : null,
      muscleGroup: isGym ? pick(muscleGroups) : null,
      notes: isGym ? pick(gymNotes) : isCardio ? pick(runNotes) : null,
      date: getPastDate(rand(0, 60)),
    });
  }
  await prisma.fitnessLog.createMany({ data: fitnessLogs });

  // ── Recurring Trackers ─────────────────────────────────────────────────────
  console.log('🔁 Seeding Recurring Trackers...');
  const trackerTitles = [
    'Change bed sheets', 'Deep clean bathroom', 'Trim beard', 'Cut nails',
    'Oil hair massage', 'Clean fridge', 'Update Quran progress log',
    'Review monthly budget', 'Back up phone photos', 'Clean laptop screen',
  ];
  await prisma.recurringTracker.createMany({
    data: trackerTitles.map(title => ({
      userId: uId,
      title,
      lastDone: Math.random() > 0.3 ? getPastDate(rand(1, 30)) : null,
    })),
  });

  // ── Duas ───────────────────────────────────────────────────────────────────
  console.log('🤲 Seeding Duas...');
  await prisma.dua.createMany({
    data: [
      { userId: uId, title: 'Dua for Knowledge', content: 'اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي وَعَلِّمْنِي مَا يَنْفَعُنِي', translation: 'O Allah, benefit me with what You have taught me, and teach me what will benefit me.', category: DuaCategory.CAREER },
      { userId: uId, title: 'Dua for Good Health', content: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي', translation: 'O Allah, grant me health in my body, hearing, and sight.', category: DuaCategory.PERSONAL },
      { userId: uId, title: 'Dua for Parents', content: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', translation: 'My Lord, have mercy upon them as they raised me when I was small.', category: DuaCategory.FAMILY },
      { userId: uId, title: 'Dua for Rizq', content: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ', translation: 'O Allah, suffice me with what You have made lawful, away from what You have made unlawful, and make me self-sufficient by Your grace.', category: DuaCategory.GENERAL },
      { userId: uId, title: 'Morning Dua', content: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ', translation: 'We have entered the morning and all dominion belongs to Allah; praise be to Allah.', category: DuaCategory.PERSONAL },
      { userId: uId, title: 'Dua for Steadfastness', content: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ', translation: 'O Turner of hearts, make my heart firm upon Your religion.', category: DuaCategory.GENERAL },
    ],
  });

  // ── Book Folders & Books ───────────────────────────────────────────────────
  console.log('📚 Seeding Book Folders & Books...');
  const bookFolderNames = ['Self Development', 'Islamic Books', 'Programming & Tech', 'Fiction'];
  const bookFolders = [];
  for (const name of bookFolderNames) {
    const f = await prisma.bookFolder.create({ data: { name, userId: uId } });
    bookFolders.push(f);
  }

  const booksData = [
    { title: 'Atomic Habits', author: 'James Clear', notes: 'Small habits compound into remarkable results. Focus on systems, not goals.', folderName: 'Self Development' },
    { title: 'Deep Work', author: 'Cal Newport', notes: 'Ability to focus deeply is becoming rare and valuable. Eliminate shallow work.', folderName: 'Self Development' },
    { title: 'The 7 Habits of Highly Effective People', author: 'Stephen Covey', notes: 'Be proactive, begin with the end in mind, put first things first.', folderName: 'Self Development' },
    { title: 'Dont Be Sad', author: 'Aaidh al-Qarni', notes: 'Islamic perspective on managing grief, stress, and anxiety.', folderName: 'Islamic Books' },
    { title: 'The Sealed Nectar', author: 'Saif-ur-Rahman Mubarakpuri', notes: 'Comprehensive biography of the Prophet ﷺ.', folderName: 'Islamic Books' },
    { title: 'Fiqh of Worship', author: 'Dr. Hatem al-Haj', notes: 'Detailed explanations of Islamic rituals for daily practice.', folderName: 'Islamic Books' },
    { title: 'Clean Code', author: 'Robert C. Martin', notes: 'Every function should do one thing. Naming matters. Tests matter.', folderName: 'Programming & Tech' },
    { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', notes: 'Essential reading for backend/distributed systems engineers.', folderName: 'Programming & Tech' },
    { title: 'The Pragmatic Programmer', author: 'David Thomas & Andrew Hunt', notes: 'Be a craftsman. Own your career. DRY principle.', folderName: 'Programming & Tech' },
    { title: 'The Alchemist', author: 'Paulo Coelho', notes: 'Follow your Personal Legend. The universe conspires to help you.', folderName: 'Fiction' },
    { title: '1984', author: 'George Orwell', notes: 'Dystopian classic about surveillance, totalitarianism, and truth.', folderName: 'Fiction' },
    // Unfiled book
    { title: 'Psychology of Money', author: 'Morgan Housel', notes: 'Wealth is not about returns, it is about behaviour and patience.', folderName: null },
  ];

  for (const b of booksData) {
    const folder = b.folderName ? bookFolders.find(f => f.name === b.folderName) : null;
    await prisma.book.create({
      data: {
        userId: uId,
        title: b.title,
        author: b.author,
        driveLink: Math.random() > 0.5 ? `https://drive.google.com/file/d/example-${b.title.replace(/ /g, '-').toLowerCase()}` : null,
        notes: b.notes,
        date: getPastDate(rand(0, 90)),
        folderId: folder?.id ?? null,
      },
    });
  }

  // ── Document Folders & Documents ───────────────────────────────────────────
  console.log('📄 Seeding Document Folders & Documents...');
  const docFolderNames = ['Work & Career', 'Health & Fitness', 'Finance', 'Islamic Resources', 'Personal'];
  const docFolders = [];
  for (const name of docFolderNames) {
    const f = await prisma.documentFolder.create({ data: { name, userId: uId } });
    docFolders.push(f);
  }

  const documentsData = [
    { title: 'Resume — July 2026', link: 'https://drive.google.com/file/d/example-resume', notes: 'Latest resume with updated experience and skills.', folderName: 'Work & Career' },
    { title: 'Salary Slip — June 2026', link: 'https://drive.google.com/file/d/example-salary-june', notes: 'Official salary slip from employer for June 2026.', folderName: 'Work & Career' },
    { title: 'Offer Letter', link: 'https://drive.google.com/file/d/example-offer-letter', notes: 'Offer letter for current position.', folderName: 'Work & Career' },
    { title: 'Android Dev Roadmap', link: 'https://roadmap.sh/android', notes: 'Complete path from beginner to intermediate Android developer.', folderName: 'Work & Career' },
    { title: 'Gym Workout Plan (PPL Split)', link: 'https://drive.google.com/file/d/example-gym-plan', notes: 'Push-Pull-Legs split with progressive overload schedule.', folderName: 'Health & Fitness' },
    { title: 'Diet & Nutrition Chart', link: 'https://docs.google.com/spreadsheets/d/example-diet', notes: 'Calorie targets and macro breakdown for lean bulk.', folderName: 'Health & Fitness' },
    { title: 'Monthly Budget Spreadsheet', link: 'https://docs.google.com/spreadsheets/d/example-budget', notes: 'Income vs expense tracker for each month.', folderName: 'Finance' },
    { title: 'Investment Portfolio', link: 'https://docs.google.com/spreadsheets/d/example-portfolio', notes: 'Index fund SIP tracking and returns.', folderName: 'Finance' },
    { title: 'Tax Documents 2025-26', link: 'https://drive.google.com/file/d/example-tax', notes: 'ITR and Form 16 for FY 2025-26.', folderName: 'Finance' },
    { title: 'Quran Memorisation Tracker', link: 'https://docs.google.com/spreadsheets/d/example-quran-tracker', notes: 'Month-wise Juz progress sheet for Hifz program.', folderName: 'Islamic Resources' },
    { title: 'Islamic Books Reading List', link: 'https://docs.google.com/document/d/example-books', notes: 'Curated list of must-read Islamic books with notes.', folderName: 'Islamic Resources' },
    { title: 'Daily Adhkar Sheet', link: 'https://drive.google.com/file/d/example-adhkar', notes: 'Morning and evening adhkar reference card.', folderName: 'Islamic Resources' },
    { title: 'Passport & ID Scan', link: 'https://drive.google.com/file/d/example-passport', notes: 'Scanned copies of travel and identity documents.', folderName: 'Personal' },
    // Unfiled document
    { title: 'Miscellaneous Links', link: 'https://docs.google.com/document/d/example-misc', notes: 'Various useful references and links.', folderName: null },
  ];

  for (const d of documentsData) {
    const folder = d.folderName ? docFolders.find(f => f.name === d.folderName) : null;
    await prisma.document.create({
      data: {
        userId: uId,
        title: d.title,
        link: d.link,
        notes: d.notes,
        date: getPastDate(rand(0, 60)),
        folderId: folder?.id ?? null,
      },
    });
  }

  // ── Relapse Logs ───────────────────────────────────────────────────────────
  console.log('📌 Seeding Relapse Logs...');
  await prisma.relapseLog.createMany({
    data: [
      { userId: uId, date: getPastDate(45), notes: 'Very stressful week at work. Lack of sleep and poor schedule.' },
      { userId: uId, date: getPastDate(30), notes: 'Skipped Fajr and felt disconnected. Need to tighten evening routine.' },
      { userId: uId, date: getPastDate(12), notes: 'Triggered by boredom and idle time. Need to fill gaps productively.' },
    ],
  });

  console.log('\n✅ Seeding completed successfully!');
  console.log('   👤 test1@example.com / password123  (full data)');
  console.log('   👤 test2@example.com / password123  (empty account)\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
