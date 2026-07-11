'use client';

import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';

export default function HistoryDatePicker({ initialDate }: { initialDate: string }) {
  const router = useRouter();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value;
    if (selected) {
      router.push(`/history?date=${selected}`);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ padding: '12px', backgroundColor: 'var(--c-primary-container)', borderRadius: '12px', color: 'var(--c-primary)' }}>
        <Calendar size={24} />
      </div>
      <div style={{ flex: 1 }}>
        <h3 className="text-title-md">Select Date</h3>
        <p className="text-body-md text-on-surface-variant">View tasks from any past date</p>
      </div>
      <div>
        <input 
          type="date" 
          value={initialDate}
          onChange={handleDateChange}
          className="search-input"
          style={{ width: 'auto', padding: '10px 16px', cursor: 'pointer', borderRadius: '8px' }}
        />
      </div>
    </div>
  );
}
