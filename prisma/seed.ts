import { PrismaClient, TransactionType, GoalCategory, GoalPriority, JournalCategory, DebtType, DebtStatus, DuaCategory } from '@prisma/client';
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
  await prisma.dua.deleteMany();

  console.log('Seeding massive data...');

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
  const goalSamples = [
    // RELIGIOUS
    { title: 'Read 1 Juz of Quran daily', description: 'Keep up with daily Quranic reading goals.', category: 'RELIGIOUS' },
    { title: 'Pray Fajr in the mosque', description: 'Strive to pray congregational Fajr prayer.', category: 'RELIGIOUS' },
    { title: 'Complete morning Adhkar', description: 'Read morning Azkaar right after Fajr.', category: 'RELIGIOUS' },
    { title: 'Pray Tahajjud twice a week', description: 'Wake up before Fajr for night prayers.', category: 'RELIGIOUS' },
    { title: 'Memorise Surah Al-Mulk', description: 'Memorise Surah Al-Mulk verse by verse.', category: 'RELIGIOUS' },
    { title: 'Fast on Mondays and Thursdays', description: 'Revive the Sunnah of voluntary fasting.', category: 'RELIGIOUS' },
    { title: 'Donate to charity weekly', description: 'Give regular Sadaqah to those in need.', category: 'RELIGIOUS' },
    { title: 'Listen to one Islamic lecture', description: 'Acquire spiritual knowledge weekly.', category: 'RELIGIOUS' },
    { title: 'Complete evening Adhkar', description: 'Read evening Azkaar right after Asr/Maghrib.', category: 'RELIGIOUS' },
    { title: 'Read Tafsir of Surah Kahf', description: 'Understand the meanings and lessons.', category: 'RELIGIOUS' },
    { title: 'Memorise last 10 Surahs', description: 'Memorise short surahs for daily prayers.', category: 'RELIGIOUS' },
    { title: 'Perform Umrah this year', description: 'Plan and save for the spiritual journey.', category: 'RELIGIOUS' },
    
    // CAREER
    { title: 'Learn TypeScript design patterns', description: 'Improve code architecture skills.', category: 'CAREER' },
    { title: 'Build a Next.js side project', description: 'Apply latest framework features.', category: 'CAREER' },
    { title: 'Read 3 technical papers', description: 'Stay updated with software engineering research.', category: 'CAREER' },
    { title: 'Contribute to open source code', description: 'Contribute to library repositories.', category: 'CAREER' },
    { title: 'Improve system design skills', description: 'Study microservices and scaling techniques.', category: 'CAREER' },
    { title: 'Pass AWS Certified Cloud Architect', description: 'Earn cloud practitioner certification.', category: 'CAREER' },
    { title: 'Write 2 technical blog posts', description: 'Share knowledge with the developer community.', category: 'CAREER' },
    { title: 'Optimize database queries', description: 'Learn query execution plans and indexing.', category: 'CAREER' },
    { title: 'Refactor legacy helper utilities', description: 'Clean up and standardize shared utils.', category: 'CAREER' },
    { title: 'Practice 50 LeetCode problems', description: 'Keep data structures & algorithms sharp.', category: 'CAREER' },
    { title: 'Mentor junior developers', description: 'Guide and teach team members.', category: 'CAREER' },
    { title: 'Prepare for senior role review', description: 'Compile achievements and portfolio.', category: 'CAREER' },

    // FINANCES
    { title: 'Save 30% of monthly income', description: 'Put money into long-term savings account.', category: 'FINANCES' },
    { title: 'Create a strict budget plan', description: 'Track and limit variable expenses.', category: 'FINANCES' },
    { title: 'Invest in index funds monthly', description: 'Grow wealth through diversified stocks.', category: 'FINANCES' },
    { title: 'Pay off outstanding credit debts', description: 'Become completely debt-free.', category: 'FINANCES' },
    { title: 'Save for a house downpayment', description: 'Build a dedicated real estate fund.', category: 'FINANCES' },
    { title: 'Track all daily expenses', description: 'Record every transaction in Muhasabah.', category: 'FINANCES' },
    { title: 'Cut down dining out expenses', description: 'Cook at home more often to save money.', category: 'FINANCES' },
    { title: 'Analyze monthly spending habits', description: 'Find areas of unnecessary spending.', category: 'FINANCES' },
    { title: 'Create emergency cash fund', description: 'Keep 6 months of expenses in cash reserve.', category: 'FINANCES' },
    { title: 'Read 2 personal finance books', description: 'Learn investment strategies.', category: 'FINANCES' },
    { title: 'Establish a passive income stream', description: 'Create side income from digital assets.', category: 'FINANCES' },
    { title: 'Review annual insurance policies', description: 'Optimize premiums and coverage.', category: 'FINANCES' },

    // HEALTH
    { title: 'Run a total of 50 km this month', description: 'Track runs using fitness tracker.', category: 'HEALTH' },
    { title: 'Hit gym 3 times every week', description: 'Complete weightlifting and core routines.', category: 'HEALTH' },
    { title: 'Drink 3 liters of water daily', description: 'Keep body hydrated throughout the day.', category: 'HEALTH' },
    { title: 'Sleep 8 hours every single night', description: 'Establish a healthy sleep schedule.', category: 'HEALTH' },
    { title: 'Limit sugar intake to weekends', description: 'Reduce consumption of processed sugars.', category: 'HEALTH' },
    { title: 'Complete a 10K run outdoors', description: 'Build endurance and cardiovascular strength.', category: 'HEALTH' },
    { title: 'Cook healthy meals at home', description: 'Prepare nutritious meals rich in proteins.', category: 'HEALTH' },
    { title: 'Stretch for 10 minutes daily', description: 'Improve body flexibility and mobility.', category: 'HEALTH' },
    { title: 'Do a full physical checkup', description: 'Schedule annual bloodwork and tests.', category: 'HEALTH' },
    { title: 'Achieve target body weight', description: 'Monitor body composition and fitness levels.', category: 'HEALTH' },
    { title: 'Walk 10,000 steps daily', description: 'Maintain active movement throughout the day.', category: 'HEALTH' },
    { title: 'Reduce screen time before bed', description: 'Turn off all screens 1 hour before sleep.', category: 'HEALTH' },

    // PERSONAL
    { title: 'Read 1 non-fiction book monthly', description: 'Expand knowledge in history and psychology.', category: 'PERSONAL' },
    { title: 'Journal every single evening', description: 'Reflect on accomplishments and emotions.', category: 'PERSONAL' },
    { title: 'Learn basic conversational Arabic', description: 'Study vocabulary and simple dialogue.', category: 'PERSONAL' },
    { title: 'Limit social media to 30 min', description: 'Reduce screen time on phone apps.', category: 'PERSONAL' },
    { title: 'Declutter room and workspace', description: 'Maintain a clean and organized environment.', category: 'PERSONAL' },
    { title: 'Practice calligraphy weekly', description: 'Develop a creative artistic hobby.', category: 'PERSONAL' },
    { title: 'Call parents every weekend', description: 'Stay connected with family regularly.', category: 'PERSONAL' },
    { title: 'Wake up at 5:00 AM daily', description: 'Develop a consistent early morning routine.', category: 'PERSONAL' },
    { title: 'Plan weekly tasks on Sundays', description: 'Organize upcoming week for maximum focus.', category: 'PERSONAL' },
    { title: 'Spend 1 hour in nature weekly', description: 'Go for walks in parks or forest trails.', category: 'PERSONAL' },
    { title: 'Learn to cook 5 new recipes', description: 'Broaden culinary skills and kitchen knowledge.', category: 'PERSONAL' },
    { title: 'Practice gratitude reflection', description: 'Write 3 things I am grateful for daily.', category: 'PERSONAL' }
  ];

  for (const sample of goalSamples) {
    goals.push({
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
    const habit = await prisma.spiritualHabit.create({ data: { name } });
    seededHabits.push(habit);
  }

  console.log('Seeding Spiritual Logs...');
  const habitLogs = [];
  const dayLogs = [];

  const sampleDeeds = [
    'Watched video lecture on Seerah of Prophet Muhammad (PBUH)',
    'Read 10 pages of "Patience and Gratitude" book',
    'Gave Sadaqah to a local charity',
    'Helped clean the local mosque area',
    'Made extensive dua for parents and friends',
    'Volunteered at community food kitchen',
    'Dhuha prayer completed',
    'Read morning and evening Azkaar with focus',
    'Helped a family member with their work',
    'Visited a sick friend at home',
  ];

  for (let i = 0; i < 180; i++) {
    const date = getPastDate(i);
    
    // Determine if we write a day log (with some random probability)
    const hasQuran = Math.random() > 0.4;
    const hasOtherDeeds = Math.random() > 0.3;
    
    let quranVal = null;
    if (hasQuran) {
      // Pick a random surah (1 to 5)
      const surahNum = Math.floor(Math.random() * 5) + 1;
      const fromV = Math.floor(Math.random() * 5) + 1;
      const toV = fromV + Math.floor(Math.random() * 10) + 1;
      quranVal = JSON.stringify({
        surahNumber: surahNum,
        fromVerse: fromV,
        toVerse: toV,
      });
    }

    let otherVal = null;
    if (hasOtherDeeds) {
      const deed1 = sampleDeeds[Math.floor(Math.random() * sampleDeeds.length)];
      const deed2 = sampleDeeds[Math.floor(Math.random() * sampleDeeds.length)];
      otherVal = deed1 === deed2 ? deed1 : `${deed1}\n${deed2}`;
    }

    if (hasQuran || hasOtherDeeds) {
      dayLogs.push({
        date,
        quranMemorization: quranVal,
        otherActivities: otherVal,
      });
    }

    // Seed habit logs
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

  // --- FITNESS LOGS ---
  console.log('Seeding Fitness Logs...');
  const fitnessLogs = [];
  const activitiesList = ['Running', 'Gym', 'Walking', 'Cycling', 'Yoga', 'Swimming'];
  for (let i = 0; i < 25; i++) {
    const act = activitiesList[Math.floor(Math.random() * activitiesList.length)];
    const dur = [20, 30, 45, 60, 90][Math.floor(Math.random() * 5)];
    const dist = ['Running', 'Walking', 'Cycling'].includes(act) 
      ? Math.floor(Math.random() * 10) + 1 + (Math.floor(Math.random() * 10) / 10)
      : null;
    
    fitnessLogs.push({
      activity: act,
      duration: dur,
      distance: dist,
      notes: Math.random() > 0.4 ? `Good workout, felt strong ${i}.` : null,
      date: getPastDate(Math.floor(Math.random() * 30)),
    });
  }
  await prisma.fitnessLog.createMany({ data: fitnessLogs });

  // --- DUAS ---
  console.log('Seeding Duas...');
  const duas = [
    {
      title: 'Dua for Knowledge & Understanding',
      content: 'اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي وَعَلِّمْنِي مَا يَنْفَعُنِي وَزِدْنِي عِلْمًا',
      translation: 'O Allah, benefit me with what You have taught me, teach me what will benefit me, and increase me in knowledge.',
      category: DuaCategory.CAREER,
    },
    {
      title: 'Dua for Success & Ease',
      content: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا',
      translation: 'O Allah, there is no ease except in what You make easy, and You make the difficult easy if You will.',
      category: DuaCategory.CAREER,
    },
    {
      title: 'Dua for Parents',
      content: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
      translation: 'My Lord, have mercy upon them as they brought me up when I was small.',
      category: DuaCategory.FAMILY,
    },
    {
      title: 'Dua for Family & Offspring',
      content: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
      translation: 'Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous.',
      category: DuaCategory.FAMILY,
    },
    {
      title: 'Dua for Guidance & Steadfastness',
      content: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ',
      translation: 'O Changer of hearts, keep my heart steadfast on Your religion.',
      category: DuaCategory.PERSONAL,
    },
    {
      title: 'Dua for Forgiveness (Sayyid al-Istighfar)',
      content: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
      translation: 'O Allah, You are my Lord, there is no deity except You. You created me and I am Your servant, and I am faithful to my covenant and my promise to the best of my ability. I seek refuge in You from the evil of what I have done. I acknowledge before You Your favor upon me, and I acknowledge my sin. So forgive me, for indeed, none can forgive sins except You.',
      category: DuaCategory.PERSONAL,
    },
    {
      title: 'Dua for General Goodness',
      content: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      translation: 'Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.',
      category: DuaCategory.GENERAL,
    },
    {
      title: 'Dua for Protection from Anxiety & Grief',
      content: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ وَالْبُخْلِ وَالْجُبْنِ وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
      translation: 'O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.',
      category: DuaCategory.GENERAL,
    },
  ];
  await prisma.dua.createMany({ data: duas });

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
