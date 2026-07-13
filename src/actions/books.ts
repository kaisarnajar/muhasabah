'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getBooks() {
  return await prisma.book.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function addBook(title: string, author: string | null, driveLink: string | null, notes: string | null) {
  if (!title.trim()) {
    throw new Error('Title is required.');
  }

  await prisma.book.create({
    data: {
      title: title.trim(),
      author: author?.trim() || null,
      driveLink: driveLink?.trim() || null,
      notes: notes?.trim() || null,
      date: new Date(),
    },
  });
  revalidatePath('/books');
  revalidatePath('/');
}

export async function updateBook(id: number, title: string, author: string | null, driveLink: string | null, notes: string | null) {
  if (!title.trim()) {
    throw new Error('Title is required.');
  }

  await prisma.book.update({
    where: { id },
    data: {
      title: title.trim(),
      author: author?.trim() || null,
      driveLink: driveLink?.trim() || null,
      notes: notes?.trim() || null,
    },
  });
  revalidatePath('/books');
  revalidatePath('/');
}

export async function deleteBook(id: number) {
  await prisma.book.delete({
    where: { id },
  });
  revalidatePath('/books');
  revalidatePath('/');
}
