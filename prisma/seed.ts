import { PrismaClient, TransactionType, GoalPeriod, GoalPriority, JournalCategory, DebtType, DebtStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Cleaning up existing data...');
  await prisma.transaction.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.religiousActivity.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.dailyTask.deleteMany();
  await prisma.debtRecord.deleteMany();
  await prisma.person.deleteMany();
  await prisma.weekendTaskLog.deleteMany();
  await prisma.weekendTask.deleteMany();
  await prisma.note.deleteMany();

  console.log('Seeding massive data...');

  const today = new Date();
  const getPastDate = (daysAgo: number) => {
    const d = new Date(today);
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
  for (let i = 0; i < 300; i++) { // Increased to 300
    txs.push({
      amount: Math.floor(Math.random() * 500) + 5,
      description: `Expense ${i}`,
      category: ['Food', 'Transport', 'Shopping', 'Utilities', 'Health', 'General', 'Other'][Math.floor(Math.random() * 7)],
      type: TransactionType.EXPENSE,
      date: getPastDate(Math.floor(Math.random() * 365)), // within last year
    });
  }
  for (let i = 0; i < 50; i++) {
    txs.push({
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
  for (let i = 0; i < 30; i++) {
    goals.push({
      title: `Goal ${i}`,
      description: `Detailed description for goal ${i}...`,
      period: Object.values(GoalPeriod)[Math.floor(Math.random() * Object.values(GoalPeriod).length)],
      priority: Object.values(GoalPriority)[Math.floor(Math.random() * Object.values(GoalPriority).length)],
      progress: Math.floor(Math.random() * 100),
      targetDate: Math.random() > 0.5 ? getPastDate(Math.floor(Math.random() * -100)) : null,
      isCompleted: Math.random() > 0.8,
      isArchived: Math.random() > 0.9,
      reminders: Math.random() > 0.5,
    });
  }
  await prisma.goal.createMany({ data: goals });

  // --- RELIGIOUS ACTIVITIES ---
  console.log('Seeding Religious Activities...');
  const relActivities = [];
  for (let i = 0; i < 180; i++) { // 6 months of data
    relActivities.push({
      date: getPastDate(i),
      fajr: Math.random() > 0.2,
      dhuhr: Math.random() > 0.2,
      asr: Math.random() > 0.2,
      maghrib: Math.random() > 0.2,
      isha: Math.random() > 0.2,
      quranReading: Math.random() > 0.4,
      adhkar: Math.random() > 0.3,
      quranMemorization: i % 7 === 0 ? 'Surah Yaseen' : null,
    });
  }
  await prisma.religiousActivity.createMany({ data: relActivities });

  // --- JOURNAL ENTRIES ---
  console.log('Seeding Journal Entries...');
  const journalData = [];
  const categories = Object.values(JournalCategory);
  for (let i = 0; i < 100; i++) {
    journalData.push({
      content: `Journal entry ${i}. Reflecting on the day, tracking progress, noting challenges...`,
      category: categories[Math.floor(Math.random() * categories.length)],
      date: getPastDate(Math.floor(Math.random() * 365)),
    });
  }
  await prisma.journalEntry.createMany({ data: journalData });

  // --- DAILY TASKS ---
  console.log('Seeding Daily Tasks...');
  const dailyTasks = [];
  for (let i = 0; i < 100; i++) {
    dailyTasks.push({
      title: `Daily Task ${i}`,
      isCompleted: Math.random() > 0.4,
      targetDate: getPastDate(Math.floor(Math.random() * 30)), 
    });
  }
  await prisma.dailyTask.createMany({ data: dailyTasks });

  // --- WEEKEND TASKS & LOGS ---
  console.log('Seeding Weekend Tasks...');
  const weekendTaskTitles = [
    'Bathing', 'Ears Cleaning', 'Clothes Washing', 'Shoe Cleaning', 
    'Washroom Cleaning', 'Room Cleaning', 'Beard Setting', 'Hands Nail Cutting', 
    'Hair Removal', 'Feet Nail Cutting', 'Hair Cutting', 'Expense Tracker', 
    'Tasks Tracker', 'Iron Clothes'
  ];
  
  for (const title of weekendTaskTitles) {
    const task = await prisma.weekendTask.create({ data: { title } });
    
    // Seed logs for the last 12 weeks
    const logs = [];
    for (let w = 0; w < 12; w++) {
      if (Math.random() > 0.3) {
        const d = getPastDate(w * 7);
        const weekStart = getMonday(d);
        logs.push({
          weekendTaskId: task.id,
          date: d,
          weekStartDate: weekStart
        });
      }
    }
    if (logs.length > 0) {
      // Remove any potential duplicates in same week
      const uniqueLogs = Array.from(new Map(logs.map(l => [l.weekStartDate.toISOString(), l])).values());
      await prisma.weekendTaskLog.createMany({ data: uniqueLogs });
    }
  }

  // --- DEBTS & PERSONS ---
  console.log('Seeding Persons and Debts...');
  const peopleNames = ['John Doe', 'Alice Smith', 'Bob Johnson', 'Emily Davis', 'Michael Brown', 'Sarah Wilson', 'David Clark', 'Lisa Lewis', 'James Young', 'Olivia King'];
  
  for (const name of peopleNames) {
    const person = await prisma.person.create({
      data: { name }
    });

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
  const notes = [];
  const noteSamples = [
    { title: 'Project Ideas', content: '1. Build a personal finance tracker\n2. Design a productivity task grid\n3. Create a spiritual tracker with prayer alarms' },
    { title: 'Shopping List', content: '- Milk\n- Eggs\n- Whole wheat bread\n- Organic honey\n- Green tea packets' },
    { title: 'Workout Routine', content: 'Monday: Push day (Chest, Shoulders, Triceps)\nWednesday: Pull day (Back, Biceps)\nFriday: Leg day (Squats, Lunges, Calves)\nSaturday: Active recovery/Cardio' },
    { title: 'Meeting Notes', content: 'Align on dashboard aesthetics with team. Use HSL dynamic colors, sleek rounded cards, and responsive navigation drawers.' },
    { title: 'Books to Read', content: '1. Atomic Habits by James Clear\n2. Deep Work by Cal Newport\n3. Thinking, Fast and Slow by Daniel Kahneman' },
    { title: 'Self-Reflection', content: 'Focus on consistent daily goals instead of massive weekend pushes. Progress is made in small increments every single day.' },
    { title: 'Travel Plans', content: 'Summer vacation wishlist:\n- Kyoto, Japan for the cherry blossoms and heritage temples\n- Switzerland for mountain hikes\n- Iceland for road trip and aurora borealis' },
    { title: 'Coding Tips', content: 'Use Prisma adapter-pg for Postgres connections. Remember to always run npx prisma generate after updating the schema models.' }
  ];
  for (const sample of noteSamples) {
    notes.push({
      title: sample.title,
      content: sample.content,
      createdAt: getPastDate(Math.floor(Math.random() * 30)),
    });
  }
  await prisma.note.createMany({ data: notes });

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
