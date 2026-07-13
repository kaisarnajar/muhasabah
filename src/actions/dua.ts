'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { DuaCategory } from '@prisma/client';

export async function getDuas() {
  return await prisma.dua.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function addDua(title: string, content: string, translation: string | null, category: DuaCategory) {
  if (!title.trim() || !content.trim()) {
    throw new Error('Title and content are required.');
  }

  await prisma.dua.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      translation: translation?.trim() || null,
      category,
    },
  });
  revalidatePath('/dua');
}

export async function updateDua(id: number, title: string, content: string, translation: string | null, category: DuaCategory) {
  if (!title.trim() || !content.trim()) {
    throw new Error('Title and content are required.');
  }

  await prisma.dua.update({
    where: { id },
    data: {
      title: title.trim(),
      content: content.trim(),
      translation: translation?.trim() || null,
      category,
    },
  });
  revalidatePath('/dua');
}

export async function deleteDua(id: number) {
  await prisma.dua.delete({
    where: { id },
  });
  revalidatePath('/dua');
}
