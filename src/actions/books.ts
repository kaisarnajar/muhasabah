'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/actions/auth';

// ── Folders ──────────────────────────────────────────────────────────────────

export async function getBookFolders() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  return await prisma.bookFolder.findMany({
    where: { userId: user.id },
    orderBy: { name: 'asc' },
  });
}

export async function addBookFolder(name: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (!name.trim()) throw new Error('Folder name is required.');

  await prisma.bookFolder.create({
    data: { name: name.trim(), userId: user.id },
  });
  revalidatePath('/books');
}

export async function renameBookFolder(id: number, name: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (!name.trim()) throw new Error('Folder name is required.');

  await prisma.bookFolder.updateMany({
    where: { id, userId: user.id },
    data: { name: name.trim() },
  });
  revalidatePath('/books');
}

export async function deleteBookFolder(id: number) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  // Books inside become unfiled (folderId set to null via SetNull cascade)
  await prisma.bookFolder.deleteMany({ where: { id, userId: user.id } });
  revalidatePath('/books');
}

// ── Books ─────────────────────────────────────────────────────────────────────

export async function getBooks() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  return await prisma.book.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addBook(
  title: string,
  author: string | null,
  driveLink: string | null,
  notes: string | null,
  folderId?: number | null,
) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (!title.trim()) throw new Error('Title is required.');

  await prisma.book.create({
    data: {
      title: title.trim(),
      author: author?.trim() || null,
      driveLink: driveLink?.trim() || null,
      notes: notes?.trim() || null,
      date: new Date(),
      userId: user.id,
      folderId: folderId ?? null,
    },
  });
  revalidatePath('/books');
  revalidatePath('/');
}

export async function updateBook(
  id: number,
  title: string,
  author: string | null,
  driveLink: string | null,
  notes: string | null,
  folderId?: number | null,
) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (!title.trim()) throw new Error('Title is required.');

  await prisma.book.updateMany({
    where: { id, userId: user.id },
    data: {
      title: title.trim(),
      author: author?.trim() || null,
      driveLink: driveLink?.trim() || null,
      notes: notes?.trim() || null,
      folderId: folderId ?? null,
    },
  });
  revalidatePath('/books');
  revalidatePath('/');
}

export async function deleteBook(id: number) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.book.deleteMany({ where: { id, userId: user.id } });
  revalidatePath('/books');
  revalidatePath('/');
}
