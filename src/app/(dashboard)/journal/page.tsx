import { getJournal, updateJournal } from '@/actions';
import { BookOpen } from 'lucide-react';

export default async function JournalPage({ searchParams }: { searchParams?: { date?: string } }) {
  const dateParams = await searchParams;
  const dateStr = dateParams?.date || new Date().toISOString().split('T')[0];
  const journal = await getJournal(dateStr);

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <BookOpen color="var(--c-primary)" />
        <h2 className="text-headline-md" style={{ margin: 0 }}>Daily Journal</h2>
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

      <form action={updateJournal} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <input type="hidden" name="date" value={dateStr} />
        
        <div>
          <label className="text-body-md" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>1. Office Work</label>
          <p className="text-label-sm text-on-surface-variant" style={{ marginBottom: '8px' }}>What work have you done today?</p>
          <textarea 
            name="office"
            className="search-input"
            rows={4}
            placeholder="e.g. Attended sprint planning and fixed a critical bug..."
            defaultValue={journal.office || ''}
            style={{ width: '100%', borderRadius: '8px', padding: '16px', resize: 'vertical' }}
          />
        </div>

        <div>
          <label className="text-body-md" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>2. Learning for Future</label>
          <p className="text-label-sm text-on-surface-variant" style={{ marginBottom: '8px' }}>What have you learned today for your future?</p>
          <textarea 
            name="learning"
            className="search-input"
            rows={4}
            placeholder="e.g. Read a chapter on advanced TypeScript..."
            defaultValue={journal.learning || ''}
            style={{ width: '100%', borderRadius: '8px', padding: '16px', resize: 'vertical' }}
          />
        </div>

        <div>
          <label className="text-body-md" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>3. Miscellaneous</label>
          <p className="text-label-sm text-on-surface-variant" style={{ marginBottom: '8px' }}>Any other things you've done today? (e.g. Went for dinner somewhere)</p>
          <textarea 
            name="other"
            className="search-input"
            rows={4}
            placeholder="e.g. Went out for dinner with friends..."
            defaultValue={journal.other || ''}
            style={{ width: '100%', borderRadius: '8px', padding: '16px', resize: 'vertical' }}
          />
        </div>

        <button type="submit" className="primary-btn" style={{ borderRadius: '8px', alignSelf: 'flex-start', padding: '0 32px' }}>
          Save Journal
        </button>
      </form>
    </div>
  );
}
