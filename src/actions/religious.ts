'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSpiritualHabits() {
  return await prisma.spiritualHabit.findMany({
    orderBy: { id: 'asc' },
  });
}

const DEFAULT_HABITS = [
  'Fajr',
  'Zuhur',
  'Asr',
  'Maghrib',
  'Isha',
  'Azkaar',
];

const PRAYER_HABITS = new Set(['Fajr', 'Zuhur', 'Asr', 'Maghrib', 'Isha']);

export async function seedDefaultSpiritualHabits() {
  await prisma.spiritualHabit.createMany({
    data: DEFAULT_HABITS.map(name => ({ name })),
    skipDuplicates: true,
  });
}

export async function addSpiritualHabit(name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Habit name cannot be empty.');

  await prisma.spiritualHabit.create({
    data: { name: trimmed },
  });
  revalidatePath('/religious');
}

export async function deleteSpiritualHabit(id: number) {
  await prisma.spiritualHabit.delete({
    where: { id },
  });
  revalidatePath('/religious');
}

export async function getSpiritualTodayData(dateStr: string) {
  const date = new Date(dateStr);

  const habits = await prisma.spiritualHabit.findMany({
    orderBy: { id: 'asc' },
  });

  const logs = await prisma.spiritualHabitLog.findMany({
    where: { date },
  });

  const dayLog = await prisma.spiritualDayLog.findUnique({
    where: { date },
  });

  const habitsWithStatus = habits.map(habit => {
    const log = logs.find(l => l.habitId === habit.id);
    return {
      id: habit.id,
      name: habit.name,
      isCompleted: log ? log.isCompleted : false,
      prayedWithJamaat: log?.prayedWithJamaat ?? false,
    };
  });

  return {
    habits: habitsWithStatus,
    quranMemorization: dayLog?.quranMemorization || '',
  };
}

export async function toggleSpiritualHabit(dateStr: string, habitId: number, currentCompleted: boolean) {
  const date = new Date(dateStr);

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
  const habit = await prisma.spiritualHabit.findUnique({
    where: { id: habitId },
    select: { name: true },
  });

  if (!habit || !PRAYER_HABITS.has(habit.name)) {
    throw new Error('Jamaat status is only available for the five daily prayers.');
  }

  const date = new Date(dateStr);
  await prisma.spiritualHabitLog.upsert({
    where: { habitId_date: { habitId, date } },
    update: { isCompleted: true, prayedWithJamaat },
    create: { habitId, date, isCompleted: true, prayedWithJamaat },
  });

  revalidatePath('/religious');
}

export async function updateQuranMemorization(dateStr: string, notes: string) {
  const date = new Date(dateStr);

  await prisma.spiritualDayLog.upsert({
    where: { date },
    update: {
      quranMemorization: notes.trim() || null,
    },
    create: {
      date,
      quranMemorization: notes.trim() || null,
    },
  });

  revalidatePath('/religious');
}

export async function getSpiritualHistory() {
  const logs = await prisma.spiritualHabitLog.findMany({
    include: { habit: true },
    orderBy: { date: 'desc' },
  });

  const dayLogs = await prisma.spiritualDayLog.findMany();

  const historyMap: Record<string, {
    date: Date;
    completedCount: number;
    totalCount: number;
    quranMemorization: string | null;
    habits: Array<{ name: string; isCompleted: boolean; prayedWithJamaat: boolean }>;
  }> = {};

  logs.forEach(log => {
    const dateStr = log.date.toISOString().split('T')[0];
    if (!historyMap[dateStr]) {
      const dayNote = dayLogs.find(dl => dl.date.toISOString().split('T')[0] === dateStr);
      historyMap[dateStr] = {
        date: log.date,
        completedCount: 0,
        totalCount: 0,
        quranMemorization: dayNote?.quranMemorization || null,
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
    const dateStr = dl.date.toISOString().split('T')[0];
    if (!historyMap[dateStr]) {
      historyMap[dateStr] = {
        date: dl.date,
        completedCount: 0,
        totalCount: 0,
        quranMemorization: dl.quranMemorization,
        habits: [],
      };
    }
  });

  return Object.values(historyMap).sort((a, b) => b.date.getTime() - a.date.getTime());
}
