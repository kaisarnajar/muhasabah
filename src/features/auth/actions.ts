'use server';

import prisma from '@/lib/prisma';
import { hashPassword, createSession, destroySession, getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { isEmailAuthorized } from './authorization';

export async function register(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: 'All fields are required.' };
  }

  const globalPassword = process.env.GLOBAL_PASSWORD || 'password123';
  if (password !== globalPassword) {
    return { error: 'Invalid password. All accounts must use the configured global password.' };
  }

  if (!isEmailAuthorized(email)) {
    return { error: 'Registration is currently restricted. This email is not authorized.' };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: 'User already exists.' };
  }

  const passwordHash = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    }
  });

  return { success: 'Registration successful! You can now log in.' };
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const globalPassword = process.env.GLOBAL_PASSWORD || 'password123';
  if (password !== globalPassword) {
    return { error: 'Invalid email or password.' };
  }

  if (!isEmailAuthorized(email)) {
    return { error: 'Access denied. This email is not authorized.' };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'Invalid email or password.' };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  redirect('/');
}

export async function logoutAction() {
  await destroySession();
  redirect('/login');
}

export async function getAuthenticatedUser() {
  const session = await getSession();
  if (!session) return null;
  return await prisma.user.findUnique({ where: { id: session.userId } });
}

export async function updateProfile(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  if (!name || !email) {
    return { error: 'Name and email are required.' };
  }

  if (email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: 'Email address is already in use.' };
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: name.trim(),
      email: email.trim(),
    }
  });

  await createSession({
    userId: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
  });

  return { success: 'Profile updated successfully.' };
}

