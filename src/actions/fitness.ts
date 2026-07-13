'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/actions/auth';

export async function getFitnessLogs() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  return await prisma.fitnessLog.findMany({
    where: { userId: user.id },
    orderBy: [
      { date: 'desc' },
      { createdAt: 'desc' }
    ],
  });
}

export async function addFitnessLog(
  activity: string,
  duration: number,
  distance: number | null,
  notes: string | null,
  date: Date
) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (!activity) throw new Error('Activity type is required.');
  if (duration <= 0) throw new Error('Duration must be greater than 0.');

  await prisma.fitnessLog.create({
    data: {
      activity,
      duration,
      distance,
      notes,
      date,
      userId: user.id,
    },
  });
  revalidatePath('/fitness');
}

export async function deleteFitnessLog(id: number) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.fitnessLog.deleteMany({
    where: { id, userId: user.id },
  });
  revalidatePath('/fitness');
}
