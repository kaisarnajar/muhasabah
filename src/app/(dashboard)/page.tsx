import { getTransactions } from '@/actions';
import TasksOfTheDay from '@/components/dashboard/TasksOfTheDay';
import Link from 'next/link';

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

      {/* SPENDING SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'TODAY', amount: dailySpending },
          { label: 'THIS WEEK', amount: weeklySpending },
          { label: 'THIS MONTH', amount: monthlySpending, highlight: true },
          { label: 'THIS YEAR', amount: yearlySpending }
        ].map((item, i) => (
          <div 
            key={i} 
            className={`card flex-col justify-center p-16 ${item.highlight ? 'highlight-card' : ''}`}
            style={{ 
              backgroundColor: 'var(--c-surface-container-high)',
              borderTop: item.highlight ? '3px solid var(--c-primary)' : '1px solid var(--c-outline-variant)'
            }}
          >
            <span className="text-label-sm text-on-surface-variant mb-8">{item.label}</span>
            <h3 className="summary-amount" style={{ fontSize: '24px', fontWeight: 'bold' }}>
              ${item.amount.toFixed(2)}
            </h3>
          </div>
        ))}
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
