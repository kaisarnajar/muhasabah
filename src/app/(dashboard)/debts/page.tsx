import { getDebtRecords } from '@/actions/debts';

import { Building2 } from 'lucide-react';
import DebtsDashboard from './DebtsDashboard';

export default async function DebtsPage() {
  const records = await getDebtRecords();

  // Calculate Summaries
  let totalCredit = 0;
  let totalDebit = 0;
  let outstandingCredit = 0;
  let outstandingDebit = 0;

  for (const record of records) {
    const totalAmount = Number(record.amount);
    const totalPaid = record.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const outstanding = totalAmount - totalPaid;

    if (record.type === 'CREDIT') {
      totalCredit += totalAmount;
      outstandingCredit += outstanding;
    } else {
      totalDebit += totalAmount;
      outstandingDebit += outstanding;
    }
  }

  const netBalance = outstandingCredit - outstandingDebit;

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Building2 color="var(--c-primary)" size={28} />
        <h2 className="text-headline-md" style={{ margin: 0 }}>Credit & Debit</h2>
      </div>

      {/* SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ backgroundColor: 'var(--c-surface-container-high)', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="text-label-sm text-on-surface-variant" style={{ marginBottom: '8px' }}>OUTSTANDING CREDIT (OWED TO YOU)</span>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--c-secondary)' }}>${outstandingCredit.toFixed(2)}</h3>
        </div>
        <div className="card" style={{ backgroundColor: 'var(--c-surface-container-high)', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="text-label-sm text-on-surface-variant" style={{ marginBottom: '8px' }}>OUTSTANDING DEBIT (YOU OWE)</span>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--c-error)' }}>${outstandingDebit.toFixed(2)}</h3>
        </div>
        <div className="card" style={{ backgroundColor: 'var(--c-surface-container-high)', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="text-label-sm text-on-surface-variant" style={{ marginBottom: '8px' }}>NET BALANCE</span>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: netBalance >= 0 ? 'var(--c-secondary)' : 'var(--c-error)' }}>
            ${netBalance.toFixed(2)}
          </h3>
        </div>
      </div>

      <DebtsDashboard initialRecords={records} />
    </div>
  );
}
