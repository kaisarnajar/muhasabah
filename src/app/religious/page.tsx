'use client';

import { useState, useEffect } from 'react';
import { getReligiousActivity, toggleReligiousActivity } from '@/actions';
import { BookOpen } from 'lucide-react';

export default function ReligiousTracker() {
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getReligiousActivity(dateStr);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateStr]);

  const handleToggle = async (field: string, currentValue: boolean) => {
    const newValue = !currentValue;
    setData({ ...data, [field]: newValue }); // Optimistic update
    try {
      await toggleReligiousActivity(dateStr, field, currentValue);
    } catch (err) {
      console.error('Failed to update', err);
      setData({ ...data, [field]: currentValue }); // Revert on failure
    }
  };

  const prayers = [
    { key: 'fajr', label: 'Fajr' },
    { key: 'dhuhr', label: 'Dhuhr' },
    { key: 'asr', label: 'Asr' },
    { key: 'maghrib', label: 'Maghrib' },
    { key: 'isha', label: 'Isha' }
  ];

  const habits = [
    { key: 'quranReading', label: 'Quran Reading' },
    { key: 'adhkar', label: 'Morning/Evening Adhkar' }
  ];

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BookOpen color="var(--primary-color)" />
          <h2 style={{ margin: 0 }}>Religious Activities</h2>
        </div>
        <input 
          type="date" 
          value={dateStr} 
          onChange={(e) => setDateStr(e.target.value)}
          style={{ width: 'auto', margin: 0 }}
        />
      </div>

      {loading || !data ? <p>Loading...</p> : (
        <div className="grid grid-cols-2">
          <div>
            <h3 className="text-secondary" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Daily Prayers (Salah)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {prayers.map(p => (
                <label key={p.key} className="checkbox-label" style={{ backgroundColor: 'var(--surface-color)', padding: '0.75rem', borderRadius: '8px', margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={data[p.key] || false} 
                    onChange={() => handleToggle(p.key, data[p.key])} 
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-secondary" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Daily Habits</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {habits.map(h => (
                <label key={h.key} className="checkbox-label" style={{ backgroundColor: 'var(--surface-color)', padding: '0.75rem', borderRadius: '8px', margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={data[h.key] || false} 
                    onChange={() => handleToggle(h.key, data[h.key])} 
                  />
                  {h.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
