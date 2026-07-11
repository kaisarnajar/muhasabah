import { getTransactions } from '@/actions';
import { Receipt, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import AddTransactionForm from '@/components/transactions/AddTransactionForm';
import TransactionFilter from '@/components/transactions/TransactionFilter';

export default async function TransactionsPage(props: { searchParams?: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const allTransactions = await getTransactions();
  
  const filterType = searchParams?.filter || 'month';
  const filterDate = searchParams?.date || new Date().toISOString().substring(0, 7);
  const filterStart = searchParams?.start || '';
  const filterEnd = searchParams?.end || '';

  // Calculate Date Boundaries
  let startBoundary = new Date(0); // Beginning of time
  let endBoundary = new Date(8640000000000000); // End of time


  try {
    if (filterType === 'day') {
      startBoundary = new Date(filterDate);
      startBoundary.setHours(0, 0, 0, 0);
      endBoundary = new Date(filterDate);
      endBoundary.setHours(23, 59, 59, 999);
    } else if (filterType === 'week') {
      // e.g. "2026-W28"
      const [year, week] = filterDate.split('-W');
      if (year && week) {
        const y = parseInt(year);
        const w = parseInt(week);
        const simple = new Date(y, 0, 1 + (w - 1) * 7);
        const dow = simple.getDay();
        const ISOweekStart = simple;
        if (dow <= 4)
          ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else
          ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        
        startBoundary = new Date(ISOweekStart);
        startBoundary.setHours(0, 0, 0, 0);
        endBoundary = new Date(ISOweekStart);
        endBoundary.setDate(endBoundary.getDate() + 6);
        endBoundary.setHours(23, 59, 59, 999);
      }
    } else if (filterType === 'month') {
      // e.g. "2026-07"
      const [year, month] = filterDate.split('-');
      if (year && month) {
        startBoundary = new Date(parseInt(year), parseInt(month) - 1, 1);
        endBoundary = new Date(parseInt(year), parseInt(month), 0); // Last day of month
        endBoundary.setHours(23, 59, 59, 999);
      }
    } else if (filterType === 'quarter') {
      // e.g. "2026-Q3"
      const [yearStr, qStr] = filterDate.split('-');
      if (yearStr && qStr) {
        const y = parseInt(yearStr);
        const q = parseInt(qStr.replace('Q', ''));
        const startMonth = (q - 1) * 3;
        startBoundary = new Date(y, startMonth, 1);
        endBoundary = new Date(y, startMonth + 3, 0);
        endBoundary.setHours(23, 59, 59, 999);
      }
    } else if (filterType === 'year') {
      // e.g. "2026"
      const y = parseInt(filterDate);
      if (y) {
        startBoundary = new Date(y, 0, 1);
        endBoundary = new Date(y, 11, 31);
        endBoundary.setHours(23, 59, 59, 999);
      }
    } else if (filterType === 'custom') {
      if (filterStart) {
        startBoundary = new Date(filterStart);
        startBoundary.setHours(0, 0, 0, 0);
      }
      if (filterEnd) {
        endBoundary = new Date(filterEnd);
        endBoundary.setHours(23, 59, 59, 999);
      }
    }
  } catch {
    // If parsing fails, defaults remain (all time)
  }

  // Filter Transactions
  const transactions = allTransactions.filter(t => {
    const d = new Date(t.date);
    return d >= startBoundary && d <= endBoundary;
  });

  // Calculate Metrics
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);
  const netFlow = totalIncome - totalExpense;

  // Pagination Logic
  const currentPageStr = searchParams?.page || '1';
  let currentPage = parseInt(currentPageStr, 10);
  if (isNaN(currentPage) || currentPage < 1) currentPage = 1;
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(transactions.length / PAGE_SIZE) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const paginatedTransactions = transactions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Helper to build URL with preserved search params
  const getPaginationUrl = (page: number) => {
    const params = new URLSearchParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined) {
          params.set(key, value.toString());
        }
      });
    }
    params.set('page', page.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Receipt color="var(--c-primary)" />
        <h2 className="text-headline-md" style={{ margin: 0 }}>Financial Tracker</h2>
      </div>

      <TransactionFilter />

      {/* Dynamic Summaries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'var(--c-surface-container-high)', padding: '16px', borderRadius: '8px' }}>
          <p className="text-label-sm text-on-surface-variant" style={{ marginBottom: '8px' }}>Total Income</p>
          <p className="text-title-lg" style={{ color: 'var(--c-secondary)', fontWeight: 'bold' }}>
            +${totalIncome.toFixed(2)}
          </p>
        </div>
        <div style={{ backgroundColor: 'var(--c-surface-container-high)', padding: '16px', borderRadius: '8px' }}>
          <p className="text-label-sm text-on-surface-variant" style={{ marginBottom: '8px' }}>Total Expense</p>
          <p className="text-title-lg" style={{ color: 'var(--c-error)', fontWeight: 'bold' }}>
            -${totalExpense.toFixed(2)}
          </p>
        </div>
        <div style={{ backgroundColor: 'var(--c-surface-container-high)', padding: '16px', borderRadius: '8px', border: `1px solid ${netFlow >= 0 ? 'var(--c-secondary)' : 'var(--c-error)'}` }}>
          <p className="text-label-sm text-on-surface-variant" style={{ marginBottom: '8px' }}>Net Flow</p>
          <p className="text-title-lg" style={{ color: netFlow >= 0 ? 'var(--c-secondary)' : 'var(--c-error)', fontWeight: 'bold' }}>
            {netFlow >= 0 ? '+' : '-'}${Math.abs(netFlow).toFixed(2)}
          </p>
        </div>
      </div>

      <AddTransactionForm />

      <div>
        <h3 className="text-body-md text-on-surface-variant" style={{ marginBottom: '16px', fontWeight: 600 }}>
          Recent Transactions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {paginatedTransactions.map(t => (
            <div key={t.id} className="habit-item" style={{ backgroundColor: 'var(--c-surface-container-low)', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {t.type === 'INCOME' ? <ArrowUpCircle color="var(--c-primary)" size={32} /> : <ArrowDownCircle color="var(--c-error)" size={32} />}
                <div>
                  <p className="text-body-md" style={{ fontWeight: 600 }}>{t.description}</p>
                  <p className="text-label-sm text-on-surface-variant">{t.category} • {t.date.toLocaleDateString()}</p>
                </div>
              </div>
              <div style={{ fontWeight: 600, color: t.type === 'INCOME' ? 'var(--c-primary)' : 'var(--c-error)', fontSize: '1.2rem' }}>
                {t.type === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
              </div>
            </div>
          ))}
          {paginatedTransactions.length === 0 && <p className="text-on-surface-variant">No transactions found for this period.</p>}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
            {currentPage > 1 ? (
              <a href={getPaginationUrl(currentPage - 1)} className="primary-btn" style={{ padding: '8px 16px', backgroundColor: 'var(--c-surface-container-high)', color: 'var(--c-on-surface)' }}>
                Previous
              </a>
            ) : (
              <button disabled className="primary-btn" style={{ padding: '8px 16px', backgroundColor: 'var(--c-surface-container-lowest)', color: 'var(--c-on-surface-variant)', opacity: 0.5, cursor: 'not-allowed' }}>
                Previous
              </button>
            )}
            
            <span className="text-body-md text-on-surface-variant">
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages ? (
              <a href={getPaginationUrl(currentPage + 1)} className="primary-btn" style={{ padding: '8px 16px', backgroundColor: 'var(--c-surface-container-high)', color: 'var(--c-on-surface)' }}>
                Next
              </a>
            ) : (
              <button disabled className="primary-btn" style={{ padding: '8px 16px', backgroundColor: 'var(--c-surface-container-lowest)', color: 'var(--c-on-surface-variant)', opacity: 0.5, cursor: 'not-allowed' }}>
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
