import { getTransactions } from '@/actions/index';
import { Receipt, ArrowUpCircle, ArrowDownCircle, Tag } from 'lucide-react';
import AddTransactionForm from "@/features/transactions/components/AddTransactionForm";
import TransactionFilter from "@/features/transactions/components/TransactionFilter";
import ExportButton from "@/features/transactions/components/ExportButton";
import TransactionGrid from "@/features/transactions/components/TransactionGrid";
import Link from 'next/link';
import SearchInput from "@/components/ui/SearchInput";

export default async function TransactionsPage(props: { searchParams?: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const allTransactions = await getTransactions();
  const search = searchParams?.search || '';
  
  const filterType = searchParams?.filter || 'month';
  const filterDate = searchParams?.date || new Date().toISOString().substring(0, 7);
  const filterStart = searchParams?.start || '';
  const filterEnd = searchParams?.end || '';
  const activeTab = searchParams?.tab === 'income' ? 'INCOME' : 'EXPENSE';
  const activeCategory = searchParams?.category || 'all';

  const allCategories = Array.from(new Set(
    allTransactions
      .filter(t => t.type === activeTab)
      .map(t => t.category)
  )).sort();

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

  // Filter Transactions by Active Tab, Category, and Search
  const displayTransactions = transactionsInPeriod
    .filter(t => t.type === activeTab)
    .filter(t => activeCategory === 'all' || t.category === activeCategory)
    .filter(t => {
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        (t.description && t.description.toLowerCase().includes(term)) ||
        t.category.toLowerCase().includes(term)
      );
    });

  const categoryTotal = displayTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

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

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchInput placeholder="Search transactions by title, description or category..." />
      </div>

      {/* Dynamic Summaries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'var(--c-surface-container-low)', padding: '20px', borderRadius: '16px', border: '1.5px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(34,197,94,0.1)', flexShrink: 0 }}>
            <ArrowUpCircle size={24} color="#22c55e" />
          </div>
          <div>
            <p className="text-label-sm" style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Income</p>
            <p className="text-title-md" style={{ margin: 0, color: '#22c55e', fontWeight: 800, fontSize: '1.25rem' }}>+₹{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--c-surface-container-low)', padding: '20px', borderRadius: '16px', border: '1.5px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(239,68,68,0.1)', flexShrink: 0 }}>
            <ArrowDownCircle size={24} color="#ef4444" />
          </div>
          <div>
            <p className="text-label-sm" style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Expense</p>
            <p className="text-title-md" style={{ margin: 0, color: '#ef4444', fontWeight: 800, fontSize: '1.25rem' }}>-₹{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'var(--c-surface-container-low)', 
          padding: '20px', 
          borderRadius: '16px', 
          border: activeTab === 'INCOME' ? '1.5px solid rgba(34,197,94,0.3)' : '1.5px solid rgba(239,68,68,0.3)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          boxShadow: 'var(--shadow-sm)' 
        }}>
          <div style={{ 
            padding: '12px', 
            borderRadius: '12px', 
            backgroundColor: activeTab === 'INCOME' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', 
            flexShrink: 0 
          }}>
            <Tag size={24} color={activeTab === 'INCOME' ? '#22c55e' : '#ef4444'} />
          </div>
          <div>
            <p className="text-label-sm" style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {activeCategory === 'all' ? 'Category Total (All)' : `Total ${activeCategory}`}
            </p>
            <p className="text-title-md" style={{ margin: 0, color: activeTab === 'INCOME' ? '#22c55e' : '#ef4444', fontWeight: 800, fontSize: '1.25rem' }}>
              {activeTab === 'INCOME' ? '+' : '-'}₹{categoryTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', borderBottom: '1px solid var(--c-outline-variant)', paddingBottom: '12px' }}>
        <Link href={buildUrl({ tab: 'expense', category: 'all', page: '1' })} 
          style={{ 
            fontWeight: activeTab === 'EXPENSE' ? 'bold' : 'normal',
            color: activeTab === 'EXPENSE' ? 'var(--c-on-surface)' : 'var(--c-on-surface-variant)',
            borderBottom: activeTab === 'EXPENSE' ? '2px solid var(--c-error)' : 'none',
            paddingBottom: '4px',
            textDecoration: 'none'
          }}>
          Expenses
        </Link>
        <Link href={buildUrl({ tab: 'income', category: 'all', page: '1' })} 
          style={{ 
            fontWeight: activeTab === 'INCOME' ? 'bold' : 'normal',
            color: activeTab === 'INCOME' ? 'var(--c-on-surface)' : 'var(--c-on-surface-variant)',
            borderBottom: activeTab === 'INCOME' ? '2px solid var(--c-secondary)' : 'none',
            paddingBottom: '4px',
            textDecoration: 'none'
          }}>
          Income
        </Link>
      </div>

      {/* Category Filter Row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
        <Link
          href={buildUrl({ category: 'all', page: '1' })}
          style={{
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            backgroundColor: activeCategory === 'all' 
              ? (activeTab === 'INCOME' ? 'var(--c-secondary)' : 'var(--c-error)') 
              : 'var(--c-surface-container-high)',
            color: activeCategory === 'all'
              ? (activeTab === 'INCOME' ? 'var(--c-on-secondary)' : 'var(--c-on-error)')
              : 'var(--c-on-surface-variant)',
            border: activeCategory === 'all' ? 'none' : '1px solid var(--c-outline-variant)',
            transition: 'background-color 0.2s, color 0.2s'
          }}
        >
          All
        </Link>
        {allCategories.map(cat => (
          <Link
            key={cat}
            href={buildUrl({ category: cat, page: '1' })}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              backgroundColor: activeCategory === cat 
                ? (activeTab === 'INCOME' ? 'var(--c-secondary)' : 'var(--c-error)') 
                : 'var(--c-surface-container-high)',
              color: activeCategory === cat
                ? (activeTab === 'INCOME' ? 'var(--c-on-secondary)' : 'var(--c-on-error)')
                : 'var(--c-on-surface-variant)',
              border: activeCategory === cat ? 'none' : '1px solid var(--c-outline-variant)',
              transition: 'background-color 0.2s, color 0.2s'
            }}
          >
            {cat}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="text-body-md text-on-surface-variant" style={{ fontWeight: 600, margin: 0 }}>
          {activeTab === 'INCOME' ? 'Income Transactions' : 'Expense Transactions'}
          {activeCategory !== 'all' && ` • ${activeCategory}`}
        </h3>
        
        {/* The new simplified Add button */}
        <AddTransactionForm type={activeTab} />
      </div>

      <TransactionGrid transactions={paginatedTransactions} />


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
