'use server'

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- AUTHENTICATION ---
export async function loginAction(formData: FormData) {
  const password = formData.get('password');
  const APP_PASSWORD = process.env.APP_PASSWORD;

  if (password === APP_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set('auth_token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    return { success: true };
  }
  return { error: 'Invalid password' };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/login');
}

// --- TRANSACTIONS ---
export async function getTransactions() {
  return await prisma.transaction.findMany({
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function addTransaction(formData: FormData) {
  const amount = Number(formData.get('amount'));
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const dateStr = formData.get('date') as string;
  const typeStr = formData.get('type') as string;
  const type = typeStr === 'INCOME' ? 'INCOME' : 'EXPENSE';

  if (!amount || !description || !category || !dateStr) {
    throw new Error('All fields are required.');
  }

  await prisma.transaction.create({
    data: {
      amount,
      description,
      category,
      type,
      date: new Date(dateStr),
    },
  });
  revalidatePath('/transactions');
  revalidatePath('/');
}

// --- GOALS ---
export async function getGoals() {
  return await prisma.goal.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function addGoal(formData: FormData) {
  const title = formData.get('title') as string;
  const targetDateStr = formData.get('targetDate') as string;
  
  await prisma.goal.create({
    data: {
      title,
      targetDate: targetDateStr ? new Date(targetDateStr) : null,
    },
  });

  revalidatePath('/goals');
  revalidatePath('/'); // update dashboard
}

export async function toggleGoal(id: number, currentState: boolean) {
  await prisma.goal.update({
    where: { id },
    data: { isCompleted: !currentState },
  });
  revalidatePath('/goals');
  revalidatePath('/');
}

// --- RELIGIOUS ACTIVITIES ---
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

export async function toggleReligiousActivity(dateStr: string, field: string, currentValue: boolean) {
  const date = new Date(dateStr);
  
  // Basic validation to ensure we only update allowed boolean fields
  const allowedFields = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'quranReading', 'adhkar'];
  if (!allowedFields.includes(field)) {
    throw new Error('Invalid field');
  }

  // Use a transaction or upsert to safely create or update
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

// --- DAILY JOURNAL ---
export async function getJournal(dateStr: string) {
  const date = new Date(dateStr);
  const journal = await prisma.dailyJournal.findUnique({
    where: { date },
  });

  return journal || { date, office: '', learning: '', other: '' };
}

export async function updateJournal(formData: FormData) {
  const dateStr = formData.get('date') as string;
  const office = formData.get('office') as string;
  const learning = formData.get('learning') as string;
  const other = formData.get('other') as string;

  if (!dateStr) throw new Error('Date is required.');

  await prisma.dailyJournal.upsert({
    where: { date: new Date(dateStr) },
    update: { office, learning, other },
    create: { date: new Date(dateStr), office, learning, other },
  });
  revalidatePath('/journal');
}
