'use server';

import prisma from '@/lib/prisma';
import { DEFAULT_HABIT_ORDER, isDefaultSpiritualHabit, mergeHistoryHabits, PRAYER_HABIT_NAMES, sortSpiritualHabits, OPTIONAL_HABIT_NAMES } from '@/lib/spiritualHabits';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/features/auth/actions';
import { parseLocalDate, getLocalDateString } from '@/lib/dateUtils';

export async function getSpiritualHabits() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  const habits = await prisma.spiritualHabit.findMany({
    where: { userId: user.id },
    orderBy: { id: 'asc' },
  });
  return sortSpiritualHabits(habits);
}

export async function seedDefaultSpiritualHabits() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  // Purge any existing Quran Memorisation habit from database
  await prisma.spiritualHabit.deleteMany({
    where: {
      userId: user.id,
      name: { in: ['Quran Memorisation', 'Quran Memorization'] },
    },
  });

  await prisma.spiritualHabit.createMany({
    data: DEFAULT_HABIT_ORDER.map(name => ({ name, userId: user.id })),
    skipDuplicates: true,
  });
}

export async function addSpiritualHabit(name: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  const trimmed = name.trim();
  if (!trimmed) throw new Error('Habit name cannot be empty.');

  await prisma.spiritualHabit.create({
    data: { name: trimmed, userId: user.id },
  });
  revalidatePath('/religious');
}

export async function deleteSpiritualHabit(id: number) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  const habit = await prisma.spiritualHabit.findUnique({
    where: { id },
    select: { name: true, userId: true },
  });

  if (!habit || habit.userId !== user.id) {
    throw new Error('Habit not found or unauthorized.');
  }

  if (isDefaultSpiritualHabit(habit.name)) {
    throw new Error('Default spiritual habits cannot be deleted.');
  }

  await prisma.spiritualHabit.deleteMany({
    where: { id, userId: user.id },
  });
  revalidatePath('/religious');
}

export async function getSpiritualTodayData(dateStr: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  const date = parseLocalDate(dateStr);

  const habits = await prisma.spiritualHabit.findMany({
    where: { userId: user.id },
    orderBy: { id: 'asc' },
  });

  const logs = await prisma.spiritualHabitLog.findMany({
    where: { date, habit: { userId: user.id } },
  });

  const dayLog = await prisma.spiritualDayLog.findUnique({
    where: { userId_date: { userId: user.id, date } },
  });

  const habitsWithStatus = sortSpiritualHabits(habits.map(habit => {
    const log = logs.find(l => l.habitId === habit.id);
    return {
      id: habit.id,
      name: habit.name,
      isCompleted: log ? log.isCompleted : false,
      prayedWithJamaat: log?.prayedWithJamaat ?? false,
    };
  }));

  return {
    habits: habitsWithStatus,
    quranMemorization: dayLog?.quranMemorization || '',
    otherActivities: dayLog?.otherActivities || '',
    shortcomings: dayLog?.shortcomings || '',
  };
}

export async function toggleSpiritualHabit(dateStr: string, habitId: number, currentCompleted: boolean) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  const habit = await prisma.spiritualHabit.findFirst({
    where: { id: habitId, userId: user.id }
  });
  if (!habit) throw new Error('Unauthorized');

  const date = parseLocalDate(dateStr);

  await prisma.spiritualHabitLog.upsert({
    where: {
      habitId_date: {
        habitId,
        date,
      },
    },
    update: {
      isCompleted: !currentCompleted,
      prayedWithJamaat: currentCompleted ? false : undefined,
    },
    create: {
      habitId,
      date,
      isCompleted: !currentCompleted,
    },
  });

  revalidatePath('/religious');
}

export async function setPrayerJamaat(dateStr: string, habitId: number, prayedWithJamaat: boolean) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  const habit = await prisma.spiritualHabit.findUnique({
    where: { id: habitId },
    select: { name: true, userId: true },
  });

  if (!habit || habit.userId !== user.id || !PRAYER_HABIT_NAMES.has(habit.name)) {
    throw new Error('Jamaat status is only available for the five daily prayers.');
  }

  const date = parseLocalDate(dateStr);
  await prisma.spiritualHabitLog.upsert({
    where: { habitId_date: { habitId, date } },
    update: { isCompleted: true, prayedWithJamaat },
    create: { habitId, date, isCompleted: true, prayedWithJamaat },
  });

  revalidatePath('/religious');
}

export async function updateQuranMemorization(dateStr: string, notes: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  const date = parseLocalDate(dateStr);

  await prisma.spiritualDayLog.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: {
      quranMemorization: notes.trim() || null,
    },
    create: {
      userId: user.id,
      date,
      quranMemorization: notes.trim() || null,
    },
  });

  revalidatePath('/religious');
}

export async function updateOtherActivities(dateStr: string, notes: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  const date = parseLocalDate(dateStr);

  await prisma.spiritualDayLog.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: {
      otherActivities: notes.trim() || null,
    },
    create: {
      userId: user.id,
      date,
      otherActivities: notes.trim() || null,
    },
  });

  revalidatePath('/religious');
}

export async function updateShortcomings(dateStr: string, notes: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  const date = parseLocalDate(dateStr);

  await prisma.spiritualDayLog.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: {
      shortcomings: notes.trim() || null,
    },
    create: {
      userId: user.id,
      date,
      shortcomings: notes.trim() || null,
    },
  });

  revalidatePath('/religious');
}

export async function getSpiritualHistory() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  const logs = await prisma.spiritualHabitLog.findMany({
    where: { habit: { userId: user.id } },
    include: { habit: true },
    orderBy: { date: 'desc' },
  });

  const dayLogs = await prisma.spiritualDayLog.findMany({
    where: { userId: user.id }
  });

  const historyMap: Record<string, {
    date: Date;
    completedCount: number;
    totalCount: number;
    quranMemorization: string | null;
    otherActivities: string | null;
    shortcomings: string | null;
    habits: Array<{ name: string; isCompleted: boolean; prayedWithJamaat: boolean }>;
  }> = {};

  logs.forEach(log => {
    const dateStr = getLocalDateString(log.date, 'UTC');
    if (!historyMap[dateStr]) {
      const dayNote = dayLogs.find(dl => getLocalDateString(dl.date, 'UTC') === dateStr);
      historyMap[dateStr] = {
        date: log.date,
        completedCount: 0,
        totalCount: 0,
        quranMemorization: dayNote?.quranMemorization || null,
        otherActivities: dayNote?.otherActivities || null,
        shortcomings: dayNote?.shortcomings || null,
        habits: [],
      };
    }
    historyMap[dateStr].totalCount += 1;
    if (log.isCompleted) {
      historyMap[dateStr].completedCount += 1;
    }
    historyMap[dateStr].habits.push({
      name: log.habit.name,
      isCompleted: log.isCompleted,
      prayedWithJamaat: log.prayedWithJamaat,
    });
  });

  dayLogs.forEach(dl => {
    const dateStr = getLocalDateString(dl.date, 'UTC');
    if (!historyMap[dateStr]) {
      historyMap[dateStr] = {
        date: dl.date,
        completedCount: 0,
        totalCount: 0,
        quranMemorization: dl.quranMemorization,
        otherActivities: dl.otherActivities,
        shortcomings: dl.shortcomings,
        habits: [],
      };
    }
  });

  const allHabits = await prisma.spiritualHabit.findMany({ 
    where: { userId: user.id },
    orderBy: { id: 'asc' } 
  });

  return Object.values(historyMap)
    .map(entry => {
      const habits = mergeHistoryHabits(entry.habits, allHabits);
      const requiredCompleted = habits.filter(h => !OPTIONAL_HABIT_NAMES.has(h.name) && h.isCompleted).length;
      const requiredTotal = habits.filter(h => !OPTIONAL_HABIT_NAMES.has(h.name)).length;

      return {
        ...entry,
        habits,
        completedCount: requiredCompleted,
        totalCount: requiredTotal,
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}
