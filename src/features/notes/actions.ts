'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/features/auth/actions';

export async function getNotes() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  return await prisma.note.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function addNote(title: string, content: string, category: string = 'General') {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (!title.trim() || !content.trim()) {
    throw new Error('Title and content are required.');
  }

  await prisma.note.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      userId: user.id,
    },
  });
  revalidatePath('/notes');
}

export async function updateNote(id: number, title: string, content: string, category: string = 'General') {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (!title.trim() || !content.trim()) {
    throw new Error('Title and content are required.');
  }

  await prisma.note.updateMany({
    where: { id, userId: user.id },
    data: {
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
    },
  });
  revalidatePath('/notes');
}

export async function deleteNote(id: number) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.note.deleteMany({
    where: { id, userId: user.id },
  });
  revalidatePath('/notes');
}
