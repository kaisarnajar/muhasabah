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

  const OPTIONAL_HABITS = new Set(['Tahajjud']);

  const calculateSpiritualRate = (filteredLogs: typeof habitLogs) => {
    if (filteredLogs.length === 0) return 0;
    
    let completed = 0;
    let total = 0;
    
    filteredLogs.forEach(l => {
      const isOptional = OPTIONAL_HABITS.has(l.habit.name);
      if (isOptional) {
        if (l.isCompleted) {
          completed += 1;
          total += 1;
        }
      } else {
        total += 1;
        if (l.isCompleted) {
          completed += 1;
        }
      }
    });
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const todayLogs = habitLogs.filter(l => new Date(l.date) >= todayStart);
  const weeklyLogs = habitLogs.filter(l => new Date(l.date) >= weekStart);
  const monthlyLogs = habitLogs.filter(l => new Date(l.date) >= startOfMonth);

  const todayRate = calculateSpiritualRate(todayLogs);
  const weeklyRate = calculateSpiritualRate(weeklyLogs);
  const monthlyRate = calculateSpiritualRate(monthlyLogs);
  const yearlyRate = calculateSpiritualRate(habitLogs);

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
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
                  borderRadius: '12px'
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
          <h4 className="text-title-sm" style={{ fontWeight: 700, color: 'var(--c-on-surface-variant)', margin: 0 }}>Spiritual Consistency</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { label: 'TODAY', value: `${todayRate}%` },
              { label: 'THIS WEEK', value: `${weeklyRate}%` },
              { label: 'THIS MONTH', value: `${monthlyRate}%`, highlight: true },
              { label: 'THIS YEAR', value: `${yearlyRate}%` }
            ].map((item, i) => (
              <div 
                key={i} 
                className={`card flex-col justify-center p-16 ${item.highlight ? 'highlight-card' : ''}`}
                style={{ 
                  backgroundColor: 'var(--c-surface-container-high)',
                  borderTop: item.highlight ? '3px solid var(--c-secondary)' : '1px solid var(--c-outline-variant)',
                  padding: '16px',
                  borderRadius: '12px'
                }}
              >
                <span className="text-label-sm text-on-surface-variant mb-8">{item.label}</span>
                <h3 className="summary-amount" style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: item.highlight ? 'var(--c-secondary)' : 'var(--c-on-surface)' }}>
                  {item.value}
                </h3>
              </div>
            ))}
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
