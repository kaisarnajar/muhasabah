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
  await prisma.weekendTask.deleteMany();

  console.log('Seeding data...');

  // Helper to get dates
  const today = new Date();
  const getPastDate = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d;
  };

  // --- TRANSACTIONS ---
  console.log('Seeding Transactions...');
  const txs = [];
  for (let i = 0; i < 50; i++) {
    txs.push({
      amount: Math.floor(Math.random() * 500) + 10,
      description: `Expense ${i}`,
      category: ['Food', 'Transport', 'Shopping', 'Utilities'][Math.floor(Math.random() * 4)],
      type: TransactionType.EXPENSE,
      date: getPastDate(Math.floor(Math.random() * 60)), // within last 60 days
    });
  }
  for (let i = 0; i < 10; i++) {
    txs.push({
      amount: Math.floor(Math.random() * 3000) + 1000,
      description: `Salary / Income ${i}`,
      category: 'Salary',
      type: TransactionType.INCOME,
      date: getPastDate(Math.floor(Math.random() * 60)),
    });
  }
  await prisma.transaction.createMany({ data: txs });

  // --- GOALS ---
  console.log('Seeding Goals...');
  await prisma.goal.createMany({
    data: [
      { title: 'Read 10 pages daily', period: GoalPeriod.DAILY, priority: GoalPriority.HIGH, progress: 40 },
      { title: 'Workout 3x a week', period: GoalPeriod.WEEKLY, priority: GoalPriority.HIGH, progress: 66 },
      { title: 'Save $500 this month', period: GoalPeriod.MONTHLY, priority: GoalPriority.MEDIUM, progress: 80 },
      { title: 'Learn Next.js App Router', period: GoalPeriod.QUARTERLY, priority: GoalPriority.HIGH, progress: 90 },
      { title: 'Buy a new car', period: GoalPeriod.YEARLY, priority: GoalPriority.LOW, progress: 20, isArchived: false },
      { title: 'Old completed goal', period: GoalPeriod.MONTHLY, priority: GoalPriority.LOW, progress: 100, isCompleted: true, isArchived: true },
    ]
  });

  // --- RELIGIOUS ACTIVITIES ---
  console.log('Seeding Religious Activities...');
  const relActivities = [];
  for (let i = 0; i < 14; i++) {
    relActivities.push({
      date: getPastDate(i),
      fajr: Math.random() > 0.3,
      dhuhr: Math.random() > 0.2,
      asr: Math.random() > 0.2,
      maghrib: Math.random() > 0.1,
      isha: Math.random() > 0.2,
      quranReading: Math.random() > 0.5,
      adhkar: Math.random() > 0.4,
      quranMemorization: i % 3 === 0 ? 'Surah Al-Mulk Verses 1-5' : null,
    });
  }
  await prisma.religiousActivity.createMany({ data: relActivities });

  // --- JOURNAL ENTRIES ---
  console.log('Seeding Journal Entries...');
  const journalData = [];
  const categories = [JournalCategory.OFFICE, JournalCategory.LEARNING, JournalCategory.MISC];
  for (let i = 0; i < 20; i++) {
    journalData.push({
      content: `This is a sample journal entry number ${i}. Reflecting on the day and thoughts...`,
      category: categories[Math.floor(Math.random() * categories.length)],
      date: getPastDate(Math.floor(Math.random() * 30)),
    });
  }
  await prisma.journalEntry.createMany({ data: journalData });

  // --- DAILY TASKS ---
  console.log('Seeding Daily Tasks...');
  const dailyTasks = [];
  for (let i = 0; i < 30; i++) {
    dailyTasks.push({
      title: `Task ${i} for the day`,
      isCompleted: Math.random() > 0.5,
      targetDate: getPastDate(Math.floor(Math.random() * 10)), // last 10 days
    });
  }
  // add some for today specifically
  for (let i = 0; i < 5; i++) {
    dailyTasks.push({
      title: `Today's urgent task ${i}`,
      isCompleted: false,
      targetDate: today,
    });
  }
  await prisma.dailyTask.createMany({ data: dailyTasks });

  // --- WEEKEND TASKS ---
  console.log('Seeding Weekend Tasks...');
  await prisma.weekendTask.createMany({
    data: [
      { title: 'Clean the entire house' },
      { title: 'Do laundry' },
      { title: 'Meal prep for the week' },
      { title: 'Call parents', lastCompletedAt: getPastDate(3) },
    ]
  });

  // --- DEBTS & PERSONS ---
  console.log('Seeding Persons and Debts...');
  const peopleNames = ['John Doe', 'Alice Smith', 'Bob Johnson', 'Family Member', 'Colleague X'];
  
  for (const name of peopleNames) {
    const person = await prisma.person.create({
      data: { name }
    });

    // Create 3 to 6 debts for each person
    const numDebts = Math.floor(Math.random() * 4) + 3;
    const debts = [];
    for (let i = 0; i < numDebts; i++) {
      debts.push({
        personId: person.id,
        amount: Math.floor(Math.random() * 500) + 20,
        type: Math.random() > 0.5 ? DebtType.CREDIT : DebtType.DEBIT,
        status: Math.random() > 0.7 ? DebtStatus.PAID : DebtStatus.PENDING,
        date: getPastDate(Math.floor(Math.random() * 90)),
        notes: Math.random() > 0.5 ? `Dinner, taxi or random expense ${i}` : null,
      });
    }
    await prisma.debtRecord.createMany({ data: debts });
  }

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
