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

function cleanBraces(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();
  // Strip outer double or single parentheses/braces: e.g. ((...)) or (...) optionally followed by a period
  cleaned = cleaned.replace(/^(\(\(|\()/, ''); // remove leading (( or (
  cleaned = cleaned.replace(/(\)\)|\))\.?$/, ''); // remove trailing )) or ) optionally followed by a dot
  return cleaned.trim();
}

export async function searchAuthenticDuas(query: string): Promise<AuthenticDua[]> {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  const trimmedQuery = query.trim().toLowerCase();
  if (trimmedQuery.length < 2) return [];

  // Fetch user's existing Duas
  const existingDuas = await prisma.dua.findMany({
    where: { userId: user.id },
    select: { content: true }
  });

  const existingContents = new Set(
    existingDuas.map(d => cleanBraces(d.content).replace(/\s+/g, ''))
  );

  const results: { item: AuthenticDua; score: number }[] = [];

  for (const chapter of hisnMuslimData.English) {
    const chapterTitleLower = chapter.TITLE.toLowerCase();
    const isChapterMatch = chapterTitleLower.includes(trimmedQuery);

    for (const supplication of chapter.TEXT) {
      const supp = supplication as any;
      
      const rawArabic = supp.ARABIC_TEXT || supp.Text || '';
      const arabicText = cleanBraces(rawArabic);
      const normalizedArabic = arabicText.replace(/\s+/g, '');

      // Exclude if already added
      if (existingContents.has(normalizedArabic)) {
        continue;
      }

      let score = 0;

      if (isChapterMatch) {
        score += 10;
      } else if (chapterTitleLower.split(/\s+/).some(word => word.length > 2 && trimmedQuery.includes(word))) {
        score += 3;
      }

      const translationText = cleanBraces(supp.TRANSLATED_TEXT || '');
      const translationLower = translationText.toLowerCase();
      if (translationLower.includes(trimmedQuery)) {
        score += 5;
      }

      const arabicLower = arabicText.toLowerCase();
      if (arabicLower.includes(trimmedQuery)) {
        score += 2;
      }

      if (score > 0) {
        results.push({
          item: {
            title: cleanBraces(chapter.TITLE),
            content: arabicText,
            translation: translationText || null,
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
