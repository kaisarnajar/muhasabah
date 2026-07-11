'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { GoalPeriod, GoalPriority } from '@prisma/client';

export async function getGoals(includeArchived = false) {
  return await prisma.goal.findMany({
    where: { isArchived: includeArchived ? undefined : false },
    orderBy: [{ priority: 'desc' }, { targetDate: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function addGoal(formData: FormData) {
  const title = formData.get('title') as string;
  const targetDateStr = formData.get('targetDate') as string;
  const description = formData.get('description') as string || null;
  const period = (formData.get('period') as GoalPeriod) || 'MONTHLY';
  const priority = (formData.get('priority') as GoalPriority) || 'MEDIUM';
  const reminders = formData.get('reminders') === 'true';
  
  await prisma.goal.create({
    data: {
      title,
      description,
      period,
      priority,
      reminders,
      targetDate: targetDateStr ? new Date(targetDateStr) : null,
    },
  });

  revalidatePath('/goals');
  revalidatePath('/'); 
}

export async function toggleGoal(id: number, currentState: boolean) {
  await prisma.goal.update({
    where: { id },
    data: { 
      isCompleted: !currentState,
      progress: !currentState ? 100 : 0 
    },
  });
  revalidatePath('/goals');
  revalidatePath('/');
}

export async function updateGoalProgress(id: number, progress: number) {
  await prisma.goal.update({
    where: { id },
    data: { 
      progress,
      isCompleted: progress === 100 
    }
  });
  revalidatePath('/goals');
  revalidatePath('/');
}

export async function archiveGoal(id: number, isArchived: boolean = true) {
  await prisma.goal.update({
    where: { id },
    data: { isArchived }
  });
  revalidatePath('/goals');
  revalidatePath('/');
}
