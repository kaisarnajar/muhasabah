import prisma from '../src/lib/prisma';

async function main() {
  console.log('Seeding database with test data...');

  // Clean up existing data
  await prisma.transaction.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.religiousActivity.deleteMany();
  await prisma.dailyJournal.deleteMany();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate 30 days of data
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    return d;
  });

  // Bulk Transactions (Income and Expense)
  const transactions = [];
  for (const day of days) {
    // 1st of the month: Salary Income
    if (day.getDate() === 1) {
      transactions.push({ amount: 5000.00, description: 'Monthly Salary', category: 'Salary', type: 'INCOME', date: day });
    }
    // 15th of the month: Freelance Income
    if (day.getDate() === 15) {
      transactions.push({ amount: 800.00, description: 'Freelance Project', category: 'Freelance', type: 'INCOME', date: day });
    }
    
    // Daily expenses
    transactions.push({ amount: Math.floor(Math.random() * 20) + 10, description: 'Lunch', category: 'Food', type: 'EXPENSE', date: day });
    if (day.getDay() === 5) { // Fridays
      transactions.push({ amount: 50.00, description: 'Jummah Sadaqah', category: 'Charity/Sadaqah', type: 'EXPENSE', date: day });
    }
    if (day.getDate() === 5) {
      transactions.push({ amount: 120.00, description: 'Internet Bill', category: 'Utilities', type: 'EXPENSE', date: day });
      transactions.push({ amount: 800.00, description: 'Rent', category: 'Housing', type: 'EXPENSE', date: day });
    }
  }

  await prisma.transaction.createMany({
    data: transactions as any,
  });

  // Create Goals
  await prisma.goal.createMany({
    data: [
      { title: 'Memorize Surah Al-Mulk', targetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), isCompleted: false },
      { title: 'Exercise 3 times a week', targetDate: null, isCompleted: false },
      { title: 'Finish reading Islamic History book', targetDate: new Date(), isCompleted: true },
      { title: 'Save $10,000 Emergency Fund', targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), isCompleted: false },
    ],
  });

  // Bulk Religious Activities
  const religiousActivities = days.map(day => {
    const randomBool = () => Math.random() > 0.3; // 70% chance of true
    return {
      date: day,
      fajr: randomBool(),
      dhuhr: randomBool(),
      asr: randomBool(),
      maghrib: true, // always pray maghrib :)
      isha: randomBool(),
      quranReading: randomBool(),
      adhkar: randomBool(),
      quranMemorization: randomBool() ? `Memorized ${Math.floor(Math.random() * 5) + 1} verses of Surah Al-Kahf` : null,
    };
  });

  await prisma.religiousActivity.createMany({
    data: religiousActivities,
  });

  // Bulk Daily Journals
  const journals = days.map(day => {
    const randomBool = () => Math.random() > 0.5;
    return {
      date: day,
      office: randomBool() ? 'Completed the sprint planning and fixed 3 major bugs in the dashboard module.' : 'Attended multiple meetings and unblocked the design team.',
      learning: randomBool() ? 'Read a chapter on Next.js App Router caching mechanisms.' : 'Watched a tutorial on advanced TypeScript patterns.',
      other: randomBool() ? 'Went out for dinner with friends at a new Turkish restaurant.' : 'Cleaned the house and did grocery shopping.',
    };
  });

  await prisma.dailyJournal.createMany({
    data: journals,
  });

  console.log('Database seeded successfully with bulk data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
