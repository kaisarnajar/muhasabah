'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { DuaCategory } from '@prisma/client';
import { getAuthenticatedUser } from '@/features/auth/actions';

export async function getDuas() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  return await prisma.dua.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addDua(title: string, content: string, translation: string | null, category: DuaCategory) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (!title.trim() || !content.trim()) {
    throw new Error('Title and content are required.');
  }

  await prisma.dua.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      translation: translation?.trim() || null,
      category,
      userId: user.id,
    },
  });
  revalidatePath('/dua');
}

export async function updateDua(id: number, title: string, content: string, translation: string | null, category: DuaCategory) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (!title.trim() || !content.trim()) {
    throw new Error('Title and content are required.');
  }

  await prisma.dua.updateMany({
    where: { id, userId: user.id },
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
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.dua.deleteMany({
    where: { id, userId: user.id },
  });
  revalidatePath('/dua');
}

import hisnMuslimData from './data/hisn_muslim.json';

export interface AuthenticDua {
  title: string;
  content: string;
  translation: string | null;
  reference: string;
}

export async function searchAuthenticDuas(query: string): Promise<AuthenticDua[]> {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  const trimmedQuery = query.trim().toLowerCase();
  if (trimmedQuery.length < 2) return [];

  const results: { item: AuthenticDua; score: number }[] = [];

  for (const chapter of hisnMuslimData.English) {
    const chapterTitleLower = chapter.TITLE.toLowerCase();
    const isChapterMatch = chapterTitleLower.includes(trimmedQuery);

    for (const supplication of chapter.TEXT) {
      const supp = supplication as any;
      let score = 0;

      if (isChapterMatch) {
        score += 10;
      } else if (chapterTitleLower.split(/\s+/).some(word => word.length > 2 && trimmedQuery.includes(word))) {
        score += 3;
      }

      const translationLower = (supp.TRANSLATED_TEXT || '').toLowerCase();
      if (translationLower.includes(trimmedQuery)) {
        score += 5;
      }

      const arabicText = supp.ARABIC_TEXT || supp.Text || '';
      const arabicLower = arabicText.toLowerCase();
      if (arabicLower.includes(trimmedQuery)) {
        score += 2;
      }

      if (score > 0) {
        results.push({
          item: {
            title: chapter.TITLE,
            content: arabicText,
            translation: supp.TRANSLATED_TEXT || null,
            reference: `Hisn al-Muslim (Hadith/Source)`
          },
          score
        });
      }
    }
  }

  // Remove duplicates based on content
  const uniqueContents = new Set<string>();
  const uniqueResults: typeof results = [];

  for (const res of results) {
    if (!uniqueContents.has(res.item.content)) {
      uniqueContents.add(res.item.content);
      uniqueResults.push(res);
    }
  }

  // Sort by score descending and take top 5
  return uniqueResults
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(r => r.item);
}
