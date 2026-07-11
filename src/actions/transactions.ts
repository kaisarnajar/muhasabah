'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
