import { getTransactions } from '@/actions';
import { Receipt, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import AddTransactionForm from '@/components/transactions/AddTransactionForm';
import TransactionFilter from '@/components/transactions/TransactionFilter';
import ExportButton from '@/components/transactions/ExportButton';
import Link from 'next/link';

export default async function TransactionsPage(props: { searchParams?: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const allTransactions = await getTransactions();
  
  const filterType = searchParams?.filter || 'month';
  const filterDate = searchParams?.date || new Date().toISOString().substring(0, 7);
  const filterStart = searchParams?.start || '';
  const filterEnd = searchParams?.end || '';
  const activeTab = searchParams?.tab === 'income' ? 'INCOME' : 'EXPENSE';

  // Calculate Date Boundaries
  let startBoundary = new Date(0);
  let endBoundary = new Date(8640000000000000);

  try {
    if (filterType === 'all') {
      startBoundary = new Date(0);
      endBoundary = new Date(8640000000000000);
    } else if (filterType === 'day') {
      startBoundary = new Date(filterDate);
      startBoundary.setHours(0, 0, 0, 0);
      endBoundary = new Date(filterDate);
      endBoundary.setHours(23, 59, 59, 999);
    } else if (filterType === 'week') {
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
      const [year, month] = filterDate.split('-');
      if (year && month) {
        startBoundary = new Date(parseInt(year), parseInt(month) - 1, 1);
        endBoundary = new Date(parseInt(year), parseInt(month), 0);
        endBoundary.setHours(23, 59, 59, 999);
      }
    } else if (filterType === 'quarter') {
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
    // defaults remain
  }

  // Filter Transactions by Date
  const transactionsInPeriod = allTransactions.filter(t => {
    const d = new Date(t.date);
    return d >= startBoundary && d <= endBoundary;
  });

  // Calculate Metrics
  const totalIncome = transactionsInPeriod.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactionsInPeriod.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);
  const netFlow = totalIncome - totalExpense;

  // Filter Transactions by Active Tab
  const displayTransactions = transactionsInPeriod.filter(t => t.type === activeTab);

  // Pagination Logic
  const currentPageStr = searchParams?.page || '1';
  let currentPage = parseInt(currentPageStr, 10);
  if (isNaN(currentPage) || currentPage < 1) currentPage = 1;
  const PAGE_SIZE = 25;
  const totalPages = Math.ceil(displayTransactions.length / PAGE_SIZE) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const paginatedTransactions = displayTransactions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Helper to build URLs preserving params
  const buildUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined) params.set(key, value.toString());
      });
    }
    Object.entries(updates).forEach(([key, value]) => {
      params.set(key, value);
    });
    return `?${params.toString()}`;
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Receipt color="var(--c-primary)" size={28} />
          <h2 className="text-headline-md" style={{ margin: 0 }}>Financial Tracker</h2>
        </div>
        
        <ExportButton transactions={transactionsInPeriod} />
      </div>

      <TransactionFilter />

      {/* Dynamic Summaries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'var(--c-surface-container-high)', padding: '16px', borderRadius: '16px' }}>
          <p className="text-label-sm text-on-surface-variant" style={{ marginBottom: '8px' }}>Total Income</p>
          <p className="text-title-md" style={{ color: 'var(--c-secondary)', fontWeight: 'bold' }}>
            +${totalIncome.toFixed(2)}
          </p>
        </div>
        <div style={{ backgroundColor: 'var(--c-surface-container-high)', padding: '16px', borderRadius: '16px' }}>
          <p className="text-label-sm text-on-surface-variant" style={{ marginBottom: '8px' }}>Total Expense</p>
          <p className="text-title-md" style={{ color: 'var(--c-error)', fontWeight: 'bold' }}>
            -${totalExpense.toFixed(2)}
          </p>
        </div>
        <div style={{ backgroundColor: 'var(--c-surface-container-high)', padding: '16px', borderRadius: '16px', border: `1px solid ${netFlow >= 0 ? 'var(--c-secondary)' : 'var(--c-error)'}` }}>
          <p className="text-label-sm text-on-surface-variant" style={{ marginBottom: '8px' }}>Net Flow</p>
          <p className="text-title-md" style={{ color: netFlow >= 0 ? 'var(--c-secondary)' : 'var(--c-error)', fontWeight: 'bold' }}>
            {netFlow >= 0 ? '+' : '-'}${Math.abs(netFlow).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--c-outline-variant)', paddingBottom: '12px' }}>
        <Link href={buildUrl({ tab: 'expense', page: '1' })} 
          style={{ 
            fontWeight: activeTab === 'EXPENSE' ? 'bold' : 'normal',
            color: activeTab === 'EXPENSE' ? 'var(--c-on-surface)' : 'var(--c-on-surface-variant)',
            borderBottom: activeTab === 'EXPENSE' ? '2px solid var(--c-error)' : 'none',
            paddingBottom: '4px'
          }}>
          Expenses
        </Link>
        <Link href={buildUrl({ tab: 'income', page: '1' })} 
          style={{ 
            fontWeight: activeTab === 'INCOME' ? 'bold' : 'normal',
            color: activeTab === 'INCOME' ? 'var(--c-on-surface)' : 'var(--c-on-surface-variant)',
            borderBottom: activeTab === 'INCOME' ? '2px solid var(--c-secondary)' : 'none',
            paddingBottom: '4px'
          }}>
          Income
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="text-body-md text-on-surface-variant" style={{ fontWeight: 600, margin: 0 }}>
          {activeTab === 'INCOME' ? 'Income Transactions' : 'Expense Transactions'}
        </h3>
        
        {/* The new simplified Add button */}
        <AddTransactionForm type={activeTab} />
      </div>

      <div className="task-history-grid">
        {paginatedTransactions.map(t => (
          <div 
            key={t.id} 
            className="card" 
            style={{ 
              backgroundColor: 'var(--c-surface-container-low)', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '1px solid var(--c-outline-variant)', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              gap: '16px',
              height: '100%',
              margin: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {t.type === 'INCOME' ? <ArrowUpCircle color="var(--c-secondary)" size={28} /> : <ArrowDownCircle color="var(--c-error)" size={28} />}
              <span 
                style={{ 
                  fontWeight: 600, 
                  color: t.type === 'INCOME' ? 'var(--c-secondary)' : 'var(--c-error)', 
                  fontSize: '1.15rem' 
                }}
              >
                {t.type === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
              </span>
            </div>

            <div>
              <p className="text-body-md" style={{ fontWeight: 600, margin: 0, color: 'var(--c-on-surface)' }}>{t.description}</p>
              <p className="text-label-sm text-on-surface-variant" style={{ marginTop: '4px', margin: 0 }}>
                {t.category} • {t.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        ))}
        {paginatedTransactions.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', backgroundColor: 'var(--c-surface-container-low)', borderRadius: '12px', border: '1px dashed var(--c-outline)' }}>
            <p className="text-on-surface-variant" style={{ margin: 0 }}>No {activeTab.toLowerCase()} records found for this period.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
          {currentPage > 1 ? (
            <Link href={buildUrl({ page: (currentPage - 1).toString() })} className="primary-btn" style={{ padding: '8px 16px', backgroundColor: 'var(--c-surface-container-high)', color: 'var(--c-on-surface)', boxShadow: 'none' }}>
              Previous
            </Link>
          ) : (
            <button disabled className="primary-btn" style={{ padding: '8px 16px', backgroundColor: 'var(--c-surface-container-lowest)', color: 'var(--c-on-surface-variant)', opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none' }}>
              Previous
            </button>
          )}
          
          <span className="text-body-md text-on-surface-variant" style={{ fontWeight: 600 }}>
            Page {currentPage} of {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link href={buildUrl({ page: (currentPage + 1).toString() })} className="primary-btn" style={{ padding: '8px 16px', backgroundColor: 'var(--c-surface-container-high)', color: 'var(--c-on-surface)', boxShadow: 'none' }}>
              Next
            </Link>
          ) : (
            <button disabled className="primary-btn" style={{ padding: '8px 16px', backgroundColor: 'var(--c-surface-container-lowest)', color: 'var(--c-on-surface-variant)', opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none' }}>
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}
