'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getNotes() {
  return await prisma.note.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function addNote(title: string, content: string) {
  if (!title.trim() || !content.trim()) {
    throw new Error('Title and content are required.');
  }

  await prisma.note.create({
    data: {
      title,
      content,
    },
  });
  revalidatePath('/notes');
}

export async function updateNote(id: number, title: string, content: string) {
  if (!title.trim() || !content.trim()) {
    throw new Error('Title and content are required.');
  }

  await prisma.note.update({
    where: { id },
    data: {
      title,
      content,
    },
  });
  revalidatePath('/notes');
}

export async function deleteNote(id: number) {
  await prisma.note.delete({
    where: { id },
  });
  revalidatePath('/notes');
}
