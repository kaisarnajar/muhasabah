import prisma from '../src/lib/prisma';

async function main() {
  console.log('Seeding database with test data...');

  // Clean up existing data
  await prisma.expense.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.religiousActivity.deleteMany();

  // Create Expenses
  await prisma.expense.createMany({
    data: [
      { amount: 25.50, description: 'Lunch with colleagues', category: 'Food', date: new Date() },
      { amount: 40.00, description: 'Gas station', category: 'Transport', date: new Date(new Date().setDate(new Date().getDate() - 1)) },
      { amount: 150.00, description: 'Sadaqah to local masjid', category: 'Charity/Sadaqah', date: new Date(new Date().setDate(new Date().getDate() - 2)) },
      { amount: 60.00, description: 'Internet Bill', category: 'Utilities', date: new Date() },
    ],
  });

  // Create Goals
  await prisma.goal.createMany({
    data: [
      { title: 'Memorize Surah Al-Mulk', targetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), isCompleted: false },
      { title: 'Exercise 3 times a week', targetDate: null, isCompleted: false },
      { title: 'Finish reading Islamic History book', targetDate: new Date(), isCompleted: true },
    ],
  });

  // Create Religious Activities
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.religiousActivity.createMany({
    data: [
      { date: today, fajr: true, dhuhr: true, asr: false, maghrib: true, isha: false, quranReading: true, adhkar: false },
      { date: yesterday, fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true, quranReading: true, adhkar: true },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
