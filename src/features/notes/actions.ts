'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/features/auth/actions';

// ── Folders ──────────────────────────────────────────────────────────────────

export async function getNoteFolders() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  return await prisma.noteFolder.findMany({
    where: { userId: user.id },
    orderBy: { name: 'asc' },
  });
}

export async function addNoteFolder(name: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (!name.trim()) throw new Error('Folder name is required.');

  await prisma.noteFolder.create({
    data: { name: name.trim(), userId: user.id },
  });
  revalidatePath('/notes');
}

export async function renameNoteFolder(id: number, name: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (!name.trim()) throw new Error('Folder name is required.');

  await prisma.noteFolder.updateMany({
    where: { id, userId: user.id },
    data: { name: name.trim() },
  });
  revalidatePath('/notes');
}

export async function deleteNoteFolder(id: number) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  // Notes inside become unfiled (folderId set to null via SetNull cascade)
  await prisma.noteFolder.deleteMany({ where: { id, userId: user.id } });
  revalidatePath('/notes');
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export async function getNotes() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  return await prisma.note.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function addNote(
  title: string,
  content: string,
  category: string = 'General',
  folderId?: number | null,
) {
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
      folderId: folderId ?? null,
    },
  });
  revalidatePath('/notes');
}

export async function updateNote(
  id: number,
  title: string,
  content: string,
  category: string = 'General',
  folderId?: number | null,
) {
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
      folderId: folderId ?? null,
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
