'use client';

import { useState } from 'react';
import { updateQuranMemorization } from '@/actions';
import { Check } from 'lucide-react';

export default function QuranSaveForm({ dateStr, initialValue }: { dateStr: string, initialValue: string }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setSaved(false);
    try {
      await updateQuranMemorization(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Failed to save Quran memorization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="flex-row gap-16" style={{ flexWrap: 'wrap' }}>
      <input type="hidden" name="date" value={dateStr} />
      <input 
        type="text" 
        name="memorization" 
        className="search-input" 
        placeholder="e.g. Surah Ya-Sin verses 1-5" 
        defaultValue={initialValue}
        style={{ flex: 1, minWidth: '200px', borderRadius: '8px' }}
      />
      <button 
        type="submit" 
        className="primary-btn" 
        disabled={loading}
        style={{ borderRadius: '8px', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        {saved ? <><Check size={18} /> Saved!</> : (loading ? 'Saving...' : 'Save')}
      </button>
    </form>
  );
}
