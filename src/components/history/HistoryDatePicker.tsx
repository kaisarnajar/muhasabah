'use client';

import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';

export default function HistoryDatePicker({ initialDate }: { initialDate: string }) {
  const router = useRouter();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value;
    if (selected) {
      router.push(`/tasks/history?date=${selected}`);
    }
  };

  return (
    <div className="card" style={{ 
      marginBottom: '32px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '20px',
      background: 'var(--c-surface-container-low)',
      padding: '24px'
    }}>
      <div style={{ 
        padding: '16px', 
        background: 'var(--c-primary-gradient)', 
        borderRadius: '16px', 
        color: 'white',
        boxShadow: 'var(--shadow-glow-primary)',
        display: 'flex'
      }}>
        <Calendar size={28} />
      </div>
      <div style={{ flex: 1 }}>
        <h3 className="text-title-md" style={{ marginBottom: '4px' }}>Select Date</h3>
        <p className="text-body-md text-on-surface-variant">Pick a day to view its past tasks and accomplishments</p>
      </div>
      <div>
        <input 
          type="date" 
          value={initialDate}
          onChange={handleDateChange}
          className="search-input"
          style={{ 
            width: '180px', 
            padding: '12px 16px', 
            cursor: 'pointer', 
            borderRadius: '12px',
            backgroundColor: 'var(--c-surface)',
            border: '2px solid var(--c-outline-variant)',
            fontWeight: '600',
            color: 'var(--c-primary)',
            fontSize: '16px',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
      </div>
    </div>
  );
}
