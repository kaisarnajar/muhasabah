'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { JournalCategory } from '@prisma/client';
import { getAuthenticatedUser } from '@/features/auth/actions';

export async function getJournalEntries(category?: JournalCategory) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  return await prisma.journalEntry.findMany({
    where: {
      userId: user.id,
      ...(category ? { category } : {}),
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function addJournalEntry(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  const content = formData.get('content') as string;
  const categoryStr = formData.get('category') as string;
  const category = categoryStr as JournalCategory;
  const subject = formData.get('subject') as string || null;
  const project = formData.get('project') as string || null;
  const ticketId = formData.get('ticketId') as string || null;
  const workType = formData.get('workType') as string || null;
  const duration = formData.get('duration') as string || null;
  const location = formData.get('location') as string || null;
  const activity = formData.get('activity') as string || null;
  const tag = formData.get('tag') as string || null;

  if (!content || !category) throw new Error('Content and category are required.');

  await prisma.journalEntry.create({
    data: {
      content,
      category,
      subject,
      project,
      ticketId,
      workType,
      duration,
      location,
      activity,
      tag,
      date: new Date(),
      userId: user.id,
    },
  });
  revalidatePath('/journal/office');
  revalidatePath('/journal/learning');
  revalidatePath('/journal/misc');
  revalidatePath('/');
}

export async function deleteJournalEntry(id: number) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.journalEntry.deleteMany({
    where: { id, userId: user.id },
  });
  revalidatePath('/journal/office');
  revalidatePath('/journal/learning');
  revalidatePath('/journal/misc');
  revalidatePath('/');
}

export async function editJournalEntry(
  id: number, 
  content: string, 
  subject?: string | null,
  project?: string | null,
  ticketId?: string | null,
  workType?: string | null,
  duration?: string | null,
  location?: string | null,
  activity?: string | null,
  tag?: string | null
) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.journalEntry.updateMany({
    where: { id, userId: user.id },
    data: { 
      content,
      ...(subject !== undefined ? { subject } : {}),
      ...(project !== undefined ? { project } : {}),
      ...(ticketId !== undefined ? { ticketId } : {}),
      ...(workType !== undefined ? { workType } : {}),
      ...(duration !== undefined ? { duration } : {}),
      ...(location !== undefined ? { location } : {}),
      ...(activity !== undefined ? { activity } : {}),
      ...(tag !== undefined ? { tag } : {}),
    },
  });
  revalidatePath('/journal/office');
  revalidatePath('/journal/learning');
  revalidatePath('/journal/misc');
  revalidatePath('/');
}
