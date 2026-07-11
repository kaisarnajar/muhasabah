'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { JournalCategory } from '@prisma/client';

export async function getJournalEntries(category?: JournalCategory) {
  return await prisma.journalEntry.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: 'desc' },
  });
}

export async function addJournalEntry(formData: FormData) {
  const content = formData.get('content') as string;
  const categoryStr = formData.get('category') as string;
  const category = categoryStr as JournalCategory;

  if (!content || !category) throw new Error('Content and category are required.');

  await prisma.journalEntry.create({
    data: {
      content,
      category,
      date: new Date(),
    },
  });
  revalidatePath('/journal');
  revalidatePath('/');
}

export async function deleteJournalEntry(id: number) {
  await prisma.journalEntry.delete({
    where: { id },
  });
  revalidatePath('/journal');
  revalidatePath('/');
}
