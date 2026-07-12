'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSpiritualHabits() {
  return await prisma.spiritualHabit.findMany({
    orderBy: { id: 'asc' },
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
    },
    create: {
      habitId,
      date,
      isCompleted: !currentCompleted,
    },
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
    habits: Array<{ name: string; isCompleted: boolean }>;
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
