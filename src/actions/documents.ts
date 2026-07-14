'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/actions/auth';

export async function getDocuments() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  return await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addDocument(title: string, link: string, notes: string | null) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (!title.trim()) {
    throw new Error('Title is required.');
  }
  if (!link.trim()) {
    throw new Error('Link is required.');
  }

  await prisma.document.create({
    data: {
      title: title.trim(),
      link: link.trim(),
      notes: notes?.trim() || null,
      date: new Date(),
      userId: user.id,
    },
  });
  revalidatePath('/documents');
  revalidatePath('/');
}

export async function updateDocument(id: number, title: string, link: string, notes: string | null) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (!title.trim()) {
    throw new Error('Title is required.');
  }
  if (!link.trim()) {
    throw new Error('Link is required.');
  }

  await prisma.document.updateMany({
    where: { id, userId: user.id },
    data: {
      title: title.trim(),
      link: link.trim(),
      notes: notes?.trim() || null,
    },
  });
  revalidatePath('/documents');
  revalidatePath('/');
}

export async function deleteDocument(id: number) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.document.deleteMany({
    where: { id, userId: user.id },
  });
  revalidatePath('/documents');
  revalidatePath('/');
}
