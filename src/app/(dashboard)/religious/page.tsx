import { getReligiousActivity, toggleReligiousActivity, updateQuranMemorization } from '@/actions';
import { Moon } from 'lucide-react';

export default async function ReligiousPage({ searchParams }: { searchParams?: { date?: string } }) {
  const dateParams = await searchParams;
  const dateStr = dateParams?.date || new Date().toISOString().split('T')[0];
  const activity = await getReligiousActivity(dateStr);

  const activities = [
    { key: 'fajr', label: 'Fajr (Dawn)' },
    { key: 'dhuhr', label: 'Dhuhr (Noon)' },
    { key: 'asr', label: 'Asr (Afternoon)' },
    { key: 'maghrib', label: 'Maghrib (Sunset)' },
    { key: 'isha', label: 'Isha (Night)' },
    { key: 'quranReading', label: 'Quran Reading' },
    { key: 'adhkar', label: 'Morning/Evening Adhkar' },
  ] as const;

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Moon color="var(--c-primary)" />
        <h2 className="text-headline-md" style={{ margin: 0 }}>Spiritual Tracker</h2>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <input 
          type="date" 
          value={dateStr}
          className="search-input"
          style={{ padding: '8px 16px', borderRadius: '8px' }}
          readOnly
        />
        <p className="text-label-sm text-on-surface-variant" style={{ marginTop: '8px' }}>Select date feature coming soon</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {activities.map(({ key, label }) => {
          const isCompleted = activity[key as keyof typeof activity];
          // Since server actions cannot be directly passed to onChange in a server component easily without a form/bind,
          // we use a form with a submit button styled as a checkbox
          const toggleAction = toggleReligiousActivity.bind(null, dateStr, key, !!isCompleted);
          return (
            <form key={key} action={toggleAction}>
              <div className="habit-item" style={{ backgroundColor: 'var(--c-surface-container-low)', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button type="submit" className={`habit-checkbox ${isCompleted ? 'checked' : ''}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                  </button>
                  <p className="text-body-md" style={{ fontWeight: 600 }}>{label}</p>
                </div>
              </div>
            </form>
          );
        })}
      </div>

      <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--c-outline-variant)' }}>
        <h3 className="text-body-md" style={{ fontWeight: 600, marginBottom: '16px' }}>Quran Memorization</h3>
        <form action={updateQuranMemorization} style={{ display: 'flex', gap: '16px' }}>
          <input type="hidden" name="date" value={dateStr} />
          <input 
            type="text" 
            name="memorization" 
            className="search-input" 
            placeholder="e.g. Surah Ya-Sin verses 1-5" 
            defaultValue={activity.quranMemorization || ''}
            style={{ flex: 1, borderRadius: '8px' }}
          />
          <button type="submit" className="primary-btn" style={{ borderRadius: '8px', padding: '0 24px' }}>
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
