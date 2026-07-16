'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/actions/auth';

// ── Folders ──────────────────────────────────────────────────────────────────

export async function getDocumentFolders() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  return await prisma.documentFolder.findMany({
    where: { userId: user.id },
    orderBy: { name: 'asc' },
  });
}

export async function addDocumentFolder(name: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (!name.trim()) throw new Error('Folder name is required.');

  await prisma.documentFolder.create({
    data: { name: name.trim(), userId: user.id },
  });
  revalidatePath('/documents');
}

export async function renameDocumentFolder(id: number, name: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (!name.trim()) throw new Error('Folder name is required.');

  await prisma.documentFolder.updateMany({
    where: { id, userId: user.id },
    data: { name: name.trim() },
  });
  revalidatePath('/documents');
}

export async function deleteDocumentFolder(id: number) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  // Documents inside become unfiled (folderId set to null via SetNull cascade)
  await prisma.documentFolder.deleteMany({ where: { id, userId: user.id } });
  revalidatePath('/documents');
}

// ── Documents ─────────────────────────────────────────────────────────────────

export async function getDocuments() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  return await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addDocument(
  title: string,
  link: string,
  notes: string | null,
  folderId?: number | null,
) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (!title.trim()) throw new Error('Title is required.');
  if (!link.trim()) throw new Error('Link is required.');

  await prisma.document.create({
    data: {
      title: title.trim(),
      link: link.trim(),
      notes: notes?.trim() || null,
      date: new Date(),
      userId: user.id,
      folderId: folderId ?? null,
    },
  });
  revalidatePath('/documents');
  revalidatePath('/');
}

export async function updateDocument(
  id: number,
  title: string,
  link: string,
  notes: string | null,
  folderId?: number | null,
) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (!title.trim()) throw new Error('Title is required.');
  if (!link.trim()) throw new Error('Link is required.');

  await prisma.document.updateMany({
    where: { id, userId: user.id },
    data: {
      title: title.trim(),
      link: link.trim(),
      notes: notes?.trim() || null,
      folderId: folderId ?? null,
    },
  });
  revalidatePath('/documents');
  revalidatePath('/');
}

export async function deleteDocument(id: number) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.document.deleteMany({ where: { id, userId: user.id } });
  revalidatePath('/documents');
  revalidatePath('/');
}
