'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getRelapseLogs() {
  return await prisma.relapseLog.findMany({
    orderBy: { date: 'desc' },
  });
}

export async function addRelapseLog(date: Date, notes: string | null) {
  await prisma.relapseLog.create({
    data: {
      date: new Date(date),
      notes: notes?.trim() || null,
    },
  });
  revalidatePath('/relapse');
  revalidatePath('/');
}

export async function updateRelapseLog(id: number, date: Date, notes: string | null) {
  await prisma.relapseLog.update({
    where: { id },
    data: {
      date: new Date(date),
      notes: notes?.trim() || null,
    },
  });
  revalidatePath('/relapse');
  revalidatePath('/');
}

export async function deleteRelapseLog(id: number) {
  await prisma.relapseLog.delete({
    where: { id },
  });
  revalidatePath('/relapse');
  revalidatePath('/');
}
