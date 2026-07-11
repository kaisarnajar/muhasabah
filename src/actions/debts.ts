'use server'

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// --- DEBT RECORDS ---
export async function getDebtRecords() {
  return await prisma.debtRecord.findMany({
    include: {
      payments: {
        orderBy: { date: 'desc' }
      }
    },
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function addDebtRecord(formData: FormData) {
  const personName = formData.get('personName') as string;
  const amount = Number(formData.get('amount'));
  const typeStr = formData.get('type') as string;
  const type = typeStr === 'CREDIT' ? 'CREDIT' : 'DEBIT';
  const dateStr = formData.get('date') as string;
  const dueDateStr = formData.get('dueDate') as string;
  const category = formData.get('category') as string;
  const notes = formData.get('notes') as string;
  const file = formData.get('attachment') as File;

  if (!personName || !amount || !dateStr) {
    throw new Error('Name, Amount, and Date are required.');
  }

  let attachmentUrl = null;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (e) {
      // Ignore if it exists
    }

    const uniqueFileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadsDir, uniqueFileName);
    await writeFile(filePath, buffer);
    attachmentUrl = `/uploads/${uniqueFileName}`;
  }

  await prisma.debtRecord.create({
    data: {
      personName,
      amount,
      type,
      date: new Date(dateStr),
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      category,
      notes,
      attachment: attachmentUrl,
      status: 'PENDING',
    },
  });

  revalidatePath('/debts');
}

export async function deleteDebtRecord(id: number) {
  await prisma.debtRecord.delete({
    where: { id },
  });
  revalidatePath('/debts');
}

// --- DEBT PAYMENTS ---
export async function addDebtPayment(formData: FormData) {
  const debtId = Number(formData.get('debtId'));
  const amount = Number(formData.get('amount'));
  const dateStr = formData.get('date') as string;
  const notes = formData.get('notes') as string;

  if (!debtId || !amount || !dateStr) {
    throw new Error('Debt ID, Amount, and Date are required.');
  }

  // Use a transaction to ensure payment insertion and status update happen together
  await prisma.$transaction(async (tx) => {
    // 1. Create the payment
    await tx.debtPayment.create({
      data: {
        debtId,
        amount,
        date: new Date(dateStr),
        notes,
      },
    });

    // 2. Fetch the debt and all payments to calculate new status
    const debt = await tx.debtRecord.findUnique({
      where: { id: debtId },
      include: { payments: true }
    });

    if (!debt) throw new Error('Debt record not found');

    const totalPaid = debt.payments.reduce((sum, p) => sum + Number(p.amount), 0) + amount; // Include the new amount since we just created it but wait, if we created it inside transaction and then fetched it, is it included? Yes, but just to be safe:
    // Wait, `debt.payments` DOES include the newly created payment if it was created in the same tx? Actually, to be perfectly safe, let's just sum `debt.payments` from the fetch.
    const actualTotalPaid = debt.payments.reduce((sum, p) => sum + Number(p.amount), 0);

    let newStatus: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' = 'PENDING';
    if (actualTotalPaid >= Number(debt.amount)) {
      newStatus = 'PAID';
    } else if (actualTotalPaid > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    // 3. Update the debt status
    if (debt.status !== newStatus) {
      await tx.debtRecord.update({
        where: { id: debtId },
        data: { status: newStatus }
      });
    }
  });

  revalidatePath('/debts');
}
