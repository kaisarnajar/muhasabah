'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/features/auth/actions';

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

  const updateData: any = {};
  const fields = [
    'wakeUpTime', 'tillSunrise', 'sunriseTillOffice', 
    'officeDeparture', 'officeReturn', 'gymPreference', 
    'maghribToIsha', 'ishaToHifz', 'sleepTime', 'hifzClassTime'
  ];

  for (const f of fields) {
    const val = formData.get(f);
    if (val !== null) {
      updateData[f] = val as string;
    }
  }

  await prisma.timeTable.upsert({
    where: { userId: user.id },
    update: updateData,
    create: {
      userId: user.id,
      wakeUpTime: updateData.wakeUpTime || '05:00',
      tillSunrise: updateData.tillSunrise || 'Dhikr & Quran reading',
      sunriseTillOffice: updateData.sunriseTillOffice || 'Breakfast & prepare for office',
      officeDeparture: updateData.officeDeparture || '09:00',
      officeReturn: updateData.officeReturn || '17:00',
      gymPreference: updateData.gymPreference || 'NONE',
      maghribToIsha: updateData.maghribToIsha || 'Spiritual reading, family time',
      ishaToHifz: updateData.ishaToHifz || 'Isha prayer and Quran review',
      sleepTime: updateData.sleepTime || '22:30',
      hifzClassTime: updateData.hifzClassTime || '22:00',
    }
  });

  revalidatePath('/');
  revalidatePath('/timetable');

  return { success: 'Time Table updated successfully.' };
}

export async function updateUserLocation(latitude: number, longitude: number, locationName: string | null) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.user.update({
    where: { id: user.id },
    data: { latitude, longitude, locationName }
  });

  revalidatePath('/');
  revalidatePath('/timetable');

  return { success: 'Location updated successfully. Prayer times will now be synced.' };
}

export async function updateCalculationMethod(methodId: number) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.user.update({
    where: { id: user.id },
    data: { calculationMethod: methodId }
  });

  revalidatePath('/');
  revalidatePath('/timetable');

  return { success: 'Calculation method updated successfully. Prayer times will adjust immediately.' };
}

export async function updateAsrTiming(school: number) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.user.update({
    where: { id: user.id },
    data: { asrTiming: school }
  });

  revalidatePath('/');
  revalidatePath('/timetable');

  return { success: 'Asr timing preference updated successfully.' };
}

export async function updateHijriOffset(offset: number) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.user.update({
    where: { id: user.id },
    data: { hijriOffset: offset }
  });

  revalidatePath('/');
  revalidatePath('/timetable');

  return { success: 'Hijri offset updated successfully.' };
}

