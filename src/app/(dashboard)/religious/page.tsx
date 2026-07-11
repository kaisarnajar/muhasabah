import { getReligiousActivity, getAllReligiousActivities, toggleReligiousActivity, updateQuranMemorization } from '@/actions';
import { Moon, History, CheckCircle2, Circle } from 'lucide-react';
import QuranSaveForm from './QuranSaveForm';

export default async function ReligiousPage() {
  const today = new Date();
  // Adjust for local timezone to ensure 'today' is the user's today
  const offset = today.getTimezoneOffset() * 60000;
  const localToday = new Date(today.getTime() - offset);
  const dateStr = localToday.toISOString().split('T')[0];
  
  const activity = await getReligiousActivity(dateStr);
  const history = await getAllReligiousActivities();

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
    <div className="flex-col gap-24">
      {/* TODAY'S TRACKER */}
      <div className="card">
        <div className="flex-row gap-12 mb-24">
          <Moon color="var(--c-primary)" />
          <h2 className="text-headline-md" style={{ margin: 0 }}>Today's Spiritual Tracker</h2>
        </div>

        <p className="text-body-md text-on-surface-variant mb-24">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="flex-col gap-8">
          {activities.map(({ key, label }) => {
            const isCompleted = activity[key as keyof typeof activity];
            const toggleAction = toggleReligiousActivity.bind(null, dateStr, key, !!isCompleted);
            return (
              <form key={key} action={toggleAction}>
                <div className="habit-item flex-row gap-16 p-16 rounded-8" style={{ backgroundColor: 'var(--c-surface-container-low)' }}>
                  <button type="submit" className={`habit-checkbox ${isCompleted ? 'checked' : ''}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                  </button>
                  <p className="text-body-md" style={{ fontWeight: 600 }}>{label}</p>
                </div>
              </form>
            );
          })}
        </div>

        <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--c-outline-variant)' }}>
          <h3 className="text-body-md" style={{ fontWeight: 600, marginBottom: '16px' }}>Quran Memorization</h3>
          <QuranSaveForm dateStr={dateStr} initialValue={activity.quranMemorization || ''} />
        </div>
      </div>

      {/* HISTORY LIST */}
      <div className="card">
        <div className="flex-row gap-12 mb-24">
          <History color="var(--c-secondary)" />
          <h2 className="text-headline-md" style={{ margin: 0 }}>History</h2>
        </div>

        {history.length === 0 ? (
          <p className="text-on-surface-variant">No spiritual history found.</p>
        ) : (
          <div className="flex-col gap-16">
            {history.map(record => {
              const totalCompleted = activities.reduce((acc, curr) => {
                return acc + (record[curr.key as keyof typeof record] ? 1 : 0);
              }, 0);

              const recordDate = new Date(record.date).toISOString().split('T')[0];
              const isToday = recordDate === dateStr;

              return (
                <div key={record.id} className="p-16 rounded-12" style={{ backgroundColor: 'var(--c-surface-container-high)' }}>
                  <div className="flex-row justify-between mb-16">
                    <span className="text-title-md" style={{ fontWeight: 'bold' }}>
                      {isToday ? "Today" : new Date(record.date).toLocaleDateString()}
                    </span>
                    <span className="text-label-sm" style={{ backgroundColor: 'var(--c-primary-container)', color: 'var(--c-primary)', padding: '4px 12px', borderRadius: '16px', fontWeight: 'bold' }}>
                      {totalCompleted} / {activities.length} Completed
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                    {activities.map(({ key, label }) => {
                      const isCompleted = record[key as keyof typeof record];
                      return (
                        <div key={key} className="flex-row gap-8">
                          {isCompleted ? <CheckCircle2 size={16} color="var(--c-primary)" /> : <Circle size={16} color="var(--c-on-surface-variant)" style={{ opacity: 0.5 }} />}
                          <span className="text-label-sm text-on-surface-variant" style={{ opacity: isCompleted ? 1 : 0.6 }}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {record.quranMemorization && (
                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--c-outline-variant)' }}>
                      <span className="text-label-sm" style={{ fontWeight: 'bold', color: 'var(--c-on-surface)' }}>Quran: </span>
                      <span className="text-body-sm text-on-surface-variant">{record.quranMemorization}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
