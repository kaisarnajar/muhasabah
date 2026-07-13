'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/actions/auth';

export async function getRelapseLogs() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  return await prisma.relapseLog.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
  });
}

export async function addRelapseLog(date: Date, notes: string | null) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.relapseLog.create({
    data: {
      date: new Date(date),
      notes: notes?.trim() || null,
      userId: user.id,
    },
  });
  revalidatePath('/relapse');
  revalidatePath('/');
}

export async function updateRelapseLog(id: number, date: Date, notes: string | null) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.relapseLog.updateMany({
    where: { id, userId: user.id },
    data: {
      date: new Date(date),
      notes: notes?.trim() || null,
    },
  });
  revalidatePath('/relapse');
  revalidatePath('/');
}

export async function deleteRelapseLog(id: number) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.relapseLog.deleteMany({
    where: { id, userId: user.id },
  });
  revalidatePath('/relapse');
  revalidatePath('/');
}
