'use server';

import prisma from '@/lib/prisma';
import { hashPassword, comparePasswords, createSession, destroySession, getSession } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/mailer';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

const ALLOWED_EMAILS = [
  'kaisarnajar11114@gmail.com'
];

export async function register(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: 'All fields are required.' };
  }

  const emailLower = email.trim().toLowerCase();
  const envAllowed = process.env.ALLOWED_REGISTRATION_EMAILS;
  const allowedList = envAllowed 
    ? envAllowed.split(',').map(e => e.trim().toLowerCase())
    : ALLOWED_EMAILS.map(e => e.toLowerCase());

  if (!allowedList.includes(emailLower)) {
    return { error: 'Registration is currently restricted. This application is not yet open for public registration.' };
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
      emailVerified: true,
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

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'Invalid email or password.' };
  }

  const isValid = await comparePasswords(password, user.passwordHash);
  if (!isValid) {
    return { error: 'Invalid email or password.' };
  }

  // Email verification is disabled

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

export async function verifyEmail(token: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token }
  });

  if (!verificationToken || verificationToken.type !== 'EMAIL_VERIFICATION') {
    return { error: 'Invalid or missing token.' };
  }

  if (new Date() > verificationToken.expires) {
    return { error: 'Token has expired.' };
  }

  const user = await prisma.user.findUnique({ where: { email: verificationToken.identifier } });
  if (!user) {
    return { error: 'User does not exist.' };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true }
  });

  await prisma.verificationToken.delete({
    where: { id: verificationToken.id }
  });

  return { success: 'Email verified successfully! You can now log in.' };
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email is required.' };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Return success anyway to prevent email enumeration
    return { success: 'If an account exists, a reset link has been sent.' };
  }

  const token = generateToken();
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
      type: 'PASSWORD_RESET'
    }
  });

  await sendPasswordResetEmail(email, token);

  return { success: 'If an account exists, a reset link has been sent.' };
}

export async function resetPassword(formData: FormData) {
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;

  if (!token || !password) {
    return { error: 'Invalid request.' };
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token }
  });

  if (!verificationToken || verificationToken.type !== 'PASSWORD_RESET') {
    return { error: 'Invalid or missing token.' };
  }

  if (new Date() > verificationToken.expires) {
    return { error: 'Token has expired.' };
  }

  const user = await prisma.user.findUnique({ where: { email: verificationToken.identifier } });
  if (!user) {
    return { error: 'User does not exist.' };
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  });

  await prisma.verificationToken.delete({
    where: { id: verificationToken.id }
  });

  return { success: 'Password has been reset successfully. You can now log in.' };
}

export async function getAuthenticatedUser() {
  const session = await getSession();
  if (!session) return null;
  return await prisma.user.findUnique({ where: { id: session.userId } });
}

export async function changePassword(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!currentPassword || !newPassword) {
    return { error: 'Both current and new password are required.' };
  }

  if (newPassword.length < 6) {
    return { error: 'New password must be at least 6 characters long.' };
  }

  const isValid = await comparePasswords(currentPassword, user.passwordHash);
  if (!isValid) {
    return { error: 'Incorrect current password.' };
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  });

  return { success: 'Password changed successfully.' };
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

