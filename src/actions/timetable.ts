'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/actions/auth';

export async function getTimeTable() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  let timetable = await prisma.timeTable.findUnique({
    where: { userId: user.id }
  });

  if (!timetable) {
    timetable = await prisma.timeTable.create({
      data: {
        userId: user.id
      }
    });
  }

  return timetable;
}

export async function updateTimeTable(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  const wakeUpTime = formData.get('wakeUpTime') as string;
  const tillSunrise = formData.get('tillSunrise') as string;
  const sunriseTillOffice = formData.get('sunriseTillOffice') as string;
  const officeDeparture = formData.get('officeDeparture') as string;
  const officeReturn = formData.get('officeReturn') as string;
  const gymPreference = formData.get('gymPreference') as string;
  const maghribToIsha = formData.get('maghribToIsha') as string;
  const ishaToHifz = formData.get('ishaToHifz') as string;
  const sleepTime = formData.get('sleepTime') as string;

  await prisma.timeTable.upsert({
    where: { userId: user.id },
    update: {
      wakeUpTime,
      tillSunrise,
      sunriseTillOffice,
      officeDeparture,
      officeReturn,
      gymPreference,
      maghribToIsha,
      ishaToHifz,
      sleepTime
    },
    create: {
      userId: user.id,
      wakeUpTime,
      tillSunrise,
      sunriseTillOffice,
      officeDeparture,
      officeReturn,
      gymPreference,
      maghribToIsha,
      ishaToHifz,
      sleepTime
    }
  });

  revalidatePath('/');
  revalidatePath('/timetable');

  return { success: 'Time Table updated successfully.' };
}

export async function updateUserLocation(latitude: number, longitude: number) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.user.update({
    where: { id: user.id },
    data: { latitude, longitude }
  });

  revalidatePath('/');
  revalidatePath('/timetable');

  return { success: 'Location updated successfully. Prayer times will now be synced.' };
}
