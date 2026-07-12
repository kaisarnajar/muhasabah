import { getTransactions } from '@/actions';
import TasksOfTheDay from '@/components/dashboard/TasksOfTheDay';
import Link from 'next/link';
import prisma from '@/lib/prisma';

const ALL_SECTIONS = [
  { href: '/religious',       icon: 'auto_awesome',   label: 'Spiritual',       desc: 'Daily ibadah & prayers'      },
  { href: '/goals',           icon: 'target',         label: 'Goals',           desc: 'Track your objectives'        },
  { href: '/tasks',           icon: 'checklist',      label: 'Tasks',           desc: 'Daily & recurring tasks'      },
  { href: '/journal/learning',icon: 'school',         label: 'Learning',        desc: 'Notes from what you learn'    },
  { href: '/fitness',         icon: 'fitness_center', label: 'Fitness',         desc: 'Workouts & health logs'       },
  { href: '/journal/office',  icon: 'work',           label: 'Office Work',     desc: 'Work logs & updates'          },
  { href: '/transactions',    icon: 'payments',       label: 'Finances',        desc: 'Income & expense tracker'     },
  { href: '/debts',           icon: 'account_balance',label: 'Ledger',          desc: 'Credit & debit records'       },
  { href: '/notes',           icon: 'sticky_note_2',  label: 'Notes',           desc: 'Quick notes & references'     },
  { href: '/journal/misc',    icon: 'folder_open',    label: 'Miscellaneous',   desc: 'Everything else'              },
];

export default async function Dashboard() {
  const transactions = await getTransactions();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - todayStart.getDay());
  
  const dailySpending = transactions
    .filter(t => new Date(t.date) >= todayStart && t.type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const weeklySpending = transactions
    .filter(t => new Date(t.date) >= weekStart && t.type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const monthlySpending = transactions
    .filter(t => new Date(t.date) >= startOfMonth && t.type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const yearlySpending = transactions
    .filter(t => new Date(t.date) >= startOfYear && t.type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  // Fetch spiritual habit logs for the current year
  const habitLogs = await prisma.spiritualHabitLog.findMany({
    where: {
      date: {
        gte: startOfYear,
      },
    },
    include: {
      habit: true,
    },
  });

  // 1. Calculate monthly prayer stats
  const monthlyLogs = habitLogs.filter(l => new Date(l.date) >= startOfMonth);
  const prayers = ['Fajr', 'Zuhur', 'Asr', 'Maghrib', 'Isha', 'Tahajjud'];
  const monthlyPrayerStats = prayers.map(p => {
    const pLogs = monthlyLogs.filter(l => l.habit.name === p);
    const completed = pLogs.filter(l => l.isCompleted).length;
    const total = pLogs.length || 1;
    const rate = Math.round((completed / total) * 100);
    return { name: p, rate };
  });

  // 2. Fetch spiritual day logs for the current month
  const monthlyDayLogs = await prisma.spiritualDayLog.findMany({
    where: {
      date: {
        gte: startOfMonth,
      },
    },
  });

  // 3. Calculate Quran Memorisation insights for current month
  let monthlyQuranVerses = 0;
  const monthlyQuranSurahs = new Set<number>();
  
  monthlyDayLogs.forEach(log => {
    if (log.quranMemorization) {
      try {
        const parsed = JSON.parse(log.quranMemorization);
        if (parsed && typeof parsed === 'object' && 'surahNumber' in parsed) {
          const count = (parsed.toVerse - parsed.fromVerse) + 1;
          if (count > 0) monthlyQuranVerses += count;
          monthlyQuranSurahs.add(parsed.surahNumber);
        }
      } catch (e) {}
    }
  });

  // 4. Extract recent good deeds logs for current month
  const recentGoodDeeds = monthlyDayLogs
    .filter(l => l.otherActivities && l.otherActivities.trim())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map(l => {
      const text = l.otherActivities!.split('\n')[0].trim();
      return {
        date: l.date,
        text: text.length > 50 ? text.substring(0, 47) + '...' : text,
      };
    });

  return (
    <>
      {/* UMAR RA QUOTE */}
      <div className="quote-card">
        {/* Decorative Quote Icon Background */}
        <span className="material-symbols-outlined quote-icon">format_quote</span>
        
        <p className="quote-arabic">
          حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا، وَزِنُوا أَعْمَالَكُمْ قَبْلَ أَنْ تُوزَنَ عَلَيْكُمْ
        </p>
        
        <div className="quote-divider">
          <div className="quote-divider-line" />
          <span className="material-symbols-outlined quote-divider-symbol">diamond</span>
          <div className="quote-divider-line" />
        </div>
        
        <p className="quote-english">
          "Hold yourselves accountable before you are held accountable, and weigh your deeds before they are weighed against you."
        </p>
        
        <div className="quote-author">
          <div className="quote-author-line" />
          <span className="quote-author-name">Umar ibn al-Khattab</span>
          <span className="quote-author-honorific">رضي الله عنه</span>
        </div>
      </div>

      {/* SUMMARY GRIDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* SPENDING SUMMARY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 className="text-title-sm" style={{ fontWeight: 700, color: 'var(--c-on-surface-variant)', margin: 0 }}>Finance Expenses</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '12px', flexGrow: 1 }}>
            {[
              { label: 'TODAY', value: `$${dailySpending.toFixed(2)}` },
              { label: 'THIS WEEK', value: `$${weeklySpending.toFixed(2)}` },
              { label: 'THIS MONTH', value: `$${monthlySpending.toFixed(2)}`, highlight: true },
              { label: 'THIS YEAR', value: `$${yearlySpending.toFixed(2)}` }
            ].map((item, i) => (
              <div 
                key={i} 
                className={`card flex-col justify-center p-16 ${item.highlight ? 'highlight-card' : ''}`}
                style={{ 
                  backgroundColor: 'var(--c-surface-container-high)',
                  borderTop: item.highlight ? '3px solid var(--c-primary)' : '1px solid var(--c-outline-variant)',
                  padding: '16px',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <span className="text-label-sm text-on-surface-variant mb-8">{item.label}</span>
                <h3 className="summary-amount" style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                  {item.value}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* SPIRITUAL SUMMARY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 className="text-title-sm" style={{ fontWeight: 700, color: 'var(--c-on-surface-variant)', margin: 0 }}>Spiritual Insights (This Month)</h4>
          
          <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', gap: '12px', flexGrow: 1 }}>
            
            {/* 1. Prayer Status Card */}
            <Link 
              href="/religious"
              className="card" 
              style={{ 
                padding: '12px 16px', 
                borderRadius: '12px', 
                backgroundColor: 'var(--c-surface-container-high)',
                border: '1px solid var(--c-outline-variant)',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                justifyContent: 'center',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-secondary)', letterSpacing: '0.05em' }}>PRAYERS CONSISTENCY</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--c-on-surface-variant)' }}>arrow_forward</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
                {monthlyPrayerStats.map(p => (
                  <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: '46px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>{p.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--c-on-surface)' }}>{p.rate}%</span>
                  </div>
                ))}
              </div>
            </Link>

            {/* 2. Quran Memorisation Insights Card */}
            <Link 
              href="/religious"
              className="card" 
              style={{ 
                padding: '12px 16px', 
                borderRadius: '12px', 
                backgroundColor: 'var(--c-surface-container-high)',
                border: '1px solid var(--c-outline-variant)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-secondary)', letterSpacing: '0.05em' }}>QURAN MEMORISATION</span>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--c-on-surface)' }}>
                    {monthlyQuranVerses} <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--c-on-surface-variant)' }}>verses</span>
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--c-on-surface)' }}>
                    {monthlyQuranSurahs.size} <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--c-on-surface-variant)' }}>surahs</span>
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--c-on-surface-variant)' }}>arrow_forward</span>
            </Link>

            {/* 3. Good Deeds Log Card */}
            <Link 
              href="/religious"
              className="card" 
              style={{ 
                padding: '12px 16px', 
                borderRadius: '12px', 
                backgroundColor: 'var(--c-surface-container-high)',
                border: '1px solid var(--c-outline-variant)',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                justifyContent: 'center',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-secondary)', letterSpacing: '0.05em' }}>RECENT GOOD DEEDS</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--c-on-surface-variant)' }}>arrow_forward</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {recentGoodDeeds.length > 0 ? (
                  recentGoodDeeds.map((deed, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        fontSize: '11px', 
                        color: 'var(--c-on-surface)', 
                        textOverflow: 'ellipsis', 
                        overflow: 'hidden', 
                        whiteSpace: 'nowrap',
                        borderLeft: '2px solid var(--c-secondary)',
                        paddingLeft: '6px'
                      }}
                    >
                      {deed.text}
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', fontStyle: 'italic' }}>
                    No activities logged this month.
                  </span>
                )}
              </div>
            </Link>

          </div>
        </div>

      </div>

      {/* SECTION NAVIGATION */}
      <div style={{ marginBottom: '32px' }}>
        <h3 className="text-title-md" style={{ marginBottom: '16px', fontWeight: 700, color: 'var(--c-on-surface-variant)' }}>Sections</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {ALL_SECTIONS.map((section, i) => (
            <Link
              key={i}
              href={section.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '16px',
                backgroundColor: 'var(--c-surface-container-high)',
                border: '1px solid var(--c-outline-variant)',
                borderRadius: '16px',
                textDecoration: 'none',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
              }}
              className="section-nav-card"
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(195, 150, 38, 0.12)',
                color: 'var(--c-primary)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{section.icon}</span>
              </span>
              <div>
                <p className="text-body-md" style={{ fontWeight: 700, marginBottom: '2px', color: 'var(--c-on-surface)' }}>{section.label}</p>
                <p className="text-label-sm" style={{ color: 'var(--c-on-surface-variant)', lineHeight: 1.4 }}>{section.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid-container">
        <div className="col-span-12 flex-col gap-24" style={{ alignContent: 'start' }}>
          <TasksOfTheDay dateStr={todayStr} />
        </div>
      </div>
    </>
  );
}
