'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getReligiousActivity(dateStr: string) {
  const date = new Date(dateStr);
  const activity = await prisma.religiousActivity.findUnique({
    where: { date },
  });

  if (!activity) {
    return {
      date,
      fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false,
      quranReading: false, adhkar: false, quranMemorization: null
    };
  }
  return activity;
}

export async function getAllReligiousActivities() {
  return await prisma.religiousActivity.findMany({
    orderBy: { date: 'desc' },
  });
}

export async function toggleReligiousActivity(dateStr: string, field: string, currentValue: boolean) {
  const date = new Date(dateStr);
  
  const allowedFields = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'quranReading', 'adhkar'];
  if (!allowedFields.includes(field)) {
    throw new Error('Invalid field');
  }

  await prisma.religiousActivity.upsert({
    where: { date },
    update: {
      [field]: !currentValue,
    },
    create: {
      date,
      [field]: !currentValue,
    },
  });

  revalidatePath('/religious');
  revalidatePath('/');
}

export async function updateQuranMemorization(formData: FormData) {
  const dateStr = formData.get('date') as string;
  const memorization = formData.get('memorization') as string;
  
  if (!dateStr) throw new Error('Date is required.');

  await prisma.religiousActivity.upsert({
    where: { date: new Date(dateStr) },
    update: { quranMemorization: memorization },
    create: { date: new Date(dateStr), quranMemorization: memorization },
  });
  revalidatePath('/religious');
  revalidatePath('/');
}
