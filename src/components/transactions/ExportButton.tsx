'use client';

import { FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Transaction {
  id: number;
  amount: any;
  description: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  date: Date;
}

export default function ExportButton({ transactions }: { transactions: Transaction[] }) {
  const { showToast } = useToast();

  const handleExport = () => {
    if (transactions.length === 0) {
      showToast('No transactions found in this period to export.', 'error');
      return;
    }

    try {
      // Define CSV headers
      const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];

      // Format rows
      const rows = transactions.map(t => {
        const dateStr = new Date(t.date).toISOString().split('T')[0];
        // Clean description/category values to handle commas/quotes properly
        const descriptionClean = t.description ? t.description.replace(/"/g, '""') : '';
        const categoryClean = t.category ? t.category.replace(/"/g, '""') : '';
        const amountClean = Number(t.amount).toFixed(2);
        
        return [
          dateStr,
          `"${descriptionClean}"`,
          `"${categoryClean}"`,
          t.type,
          amountClean
        ];
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      // Create Blob with UTF-8 BOM so Excel opens it with correct encoding
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      
      const dateSuffix = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `transactions_export_${dateSuffix}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast(`Exported ${transactions.length} transactions successfully!`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to export transactions.', 'error');
    }
  };

  return (
    <button 
      onClick={handleExport}
      className="primary-btn" 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 18px',
        borderRadius: '24px',
        backgroundColor: 'var(--c-surface-container-high)',
        color: 'var(--c-on-surface)',
        border: '1px solid var(--c-outline-variant)',
        boxShadow: 'none',
        backgroundImage: 'none',
        fontWeight: 600,
        fontSize: '14px'
      }}
    >
      <FileSpreadsheet size={18} style={{ color: 'var(--c-primary)' }} />
      Export to Excel
    </button>
  );
}
