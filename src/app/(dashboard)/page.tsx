import { getAuthenticatedUser } from '@/features/auth/actions';
import TasksOfTheDay from '@/components/dashboard/TasksOfTheDay';
import TimetableDashboardCard from '@/components/dashboard/TimetableDashboardCard';
import HijriDateDisplay from '@/components/ui/HijriDateDisplay';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardCalendarWidget from '@/components/dashboard/DashboardCalendarWidget';
import prisma from '@/lib/prisma';
import { getUpcomingIslamicEvents } from '@/lib/islamicEvents';
import { getPrayerTimesAndMaghribStatus } from '@/features/timetable/actions';

const ALL_SECTIONS = [
  { href: '/religious',       icon: 'auto_awesome',   label: 'Spiritual',       desc: 'Daily ibadah & prayers'      },
  { href: '/dua',             icon: 'favorite',       label: 'Dua List',        desc: 'Personal supplications & prayers' },
  { href: '/books',           icon: 'menu_book',      label: 'Books',           desc: 'Reading list & references'    },
  { href: '/documents',       icon: 'description',    label: 'Documents',       desc: 'Saved links & file references' },
  { href: '/relapse',         icon: 'health_and_safety',   label: 'Habit Tracker',   desc: 'Addiction & recovery logs'    },
  { href: '/goals',           icon: 'target',         label: 'Goals',           desc: 'Track your objectives'        },
  { href: '/tasks',           icon: 'checklist',      label: 'Tasks',           desc: 'Daily & recurring tasks'      },
  { href: '/journal/learning',icon: 'school',         label: 'Career Learnings', desc: 'Notes from what you learn'  },
  { href: '/fitness',         icon: 'fitness_center', label: 'Fitness',         desc: 'Workouts & health logs'       },
  { href: '/journal/office',  icon: 'work',           label: 'Office Work',     desc: 'Work logs & updates'          },
  { href: '/transactions',    icon: 'payments',       label: 'Finances',        desc: 'Income & expense tracker'     },
  { href: '/debts',           icon: 'account_balance',label: 'Ledger',          desc: 'Credit & debit records'       },
  { href: '/notes',           icon: 'sticky_note_2',  label: 'Notes',           desc: 'Quick notes & references'     },
  { href: '/journal/misc',    icon: 'folder_open',    label: 'Miscellaneous',   desc: 'Everything else'              },
];

export default async function Dashboard() {
  const sessionUser = await getAuthenticatedUser();
  if (!sessionUser) {
    redirect('/login');
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    transactions,
    timetable,
    user,
    habitLogs,
    monthlyDayLogs,
    absoluteLatestGoal,
    latestDua,
    latestBook,
    latestRelapse,
    persons,
    recurringTrackers,
    prayerTimesData
  ] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: sessionUser.id },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.timeTable.findUnique({
      where: { userId: sessionUser.id }
    }).then(async (t) => {
      if (!t) {
        return await prisma.timeTable.create({
          data: { userId: sessionUser.id }
        });
      }
      return t;
    }),
    prisma.user.findUnique({ where: { id: sessionUser.id } }),
    prisma.spiritualHabitLog.findMany({
      where: {
        habit: { userId: sessionUser.id },
        date: { gte: startOfYear },
      },
      include: {
        habit: true,
      },
    }),
    prisma.spiritualDayLog.findMany({
      where: {
        userId: sessionUser.id,
        date: { gte: startOfMonth },
      },
    }),
    prisma.goal.findFirst({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.dua.findFirst({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.book.findFirst({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.relapseLog.findFirst({
      where: { userId: sessionUser.id },
      orderBy: { date: 'desc' },
    }),
    prisma.person.findMany({
      where: { userId: sessionUser.id },
      include: { debts: true }
    }),
    prisma.recurringTracker.findMany({
      where: { userId: sessionUser.id }
    }),
    getPrayerTimesAndMaghribStatus()
  ]);

  const { prayerTimes, maghribPassed } = prayerTimesData;

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

  const monthlyLogs = habitLogs.filter(l => new Date(l.date) >= startOfMonth);
  const prayers = ['Fajr', 'Zuhur', 'Asr', 'Maghrib', 'Isha', 'Tahajjud'];
  const monthlyPrayerStats = prayers.map(p => {
    const pLogs = monthlyLogs.filter(l => l.habit.name === p);
    const completed = pLogs.filter(l => l.isCompleted).length;
    const total = pLogs.length || 1;
    const rate = Math.round((completed / total) * 100);
    return { name: p, rate };
  });

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

  // Calculate recovery streak
  let streakDays = 0;
  let streakText = 'No occurrences logged. Start your recovery journey!';
  if (latestRelapse) {
    const diffMs = new Date().getTime() - new Date(latestRelapse.date).getTime();
    if (diffMs > 0) {
      streakDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (streakDays === 0) {
        streakText = 'Last logged occurrence was today. Reset, refocus, and stay strong!';
      } else {
        streakText = `${streakDays} ${streakDays === 1 ? 'day' : 'days'} clean recovery streak. Keep going!`;
      }
    } else {
      streakText = 'Keep going!';
    }
  }

  // Calculate Net Balances for Ledger
  let totalTheyOweMe = 0;
  let totalIOweThem = 0;

  persons.forEach(person => {
    person.debts.forEach(debt => {
      if (debt.status === 'PENDING') {
        const amt = Number(debt.amount);
        if (debt.type === 'CREDIT') {
          totalTheyOweMe += amt;
        } else {
          totalIOweThem += amt;
        }
      }
    });
  });

  // Calculate overdue periodic trackers (exceeding 35 days)
  const MAX_DAYS = 35;
  const trackerTitlesToCheck = ['Trim Toenails', 'Remove Body Hair', 'Trim Fingernails'];
  const overdueTrackers: { title: string; days: number; lastDone: Date | null }[] = [];

  recurringTrackers.forEach(t => {
    if (trackerTitlesToCheck.includes(t.title)) {
      if (t.lastDone) {
        const diffMs = new Date().getTime() - new Date(t.lastDone).getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > MAX_DAYS) {
          overdueTrackers.push({
            title: t.title,
            days: diffDays,
            lastDone: t.lastDone
          });
        }
      } else {
        // If never done, treat as overdue
        overdueTrackers.push({
          title: t.title,
          days: 36,
          lastDone: null
        });
      }
    }
  });

  // Calculate upcoming Islamic events (occurring today, tomorrow, or in 2 days)
  const baseOffset = user?.hijriOffset ?? 0;
  const effectiveOffset = baseOffset + (maghribPassed ? 1 : 0);
  const upcomingIslamicEvents = getUpcomingIslamicEvents(new Date(), effectiveOffset, 2);

  return (
    <>
      {/* UMAR RA QUOTE */}
      <div className="quote-card" style={{ marginBottom: '24px' }}>
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
          <div className="quote-author-line" />
        </div>
      </div>

      {/* UPCOMING ISLAMIC EVENT ALERT BANNER */}
      {upcomingIslamicEvents.length > 0 && (
        <div 
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px 20px',
            borderRadius: '16px',
            backgroundColor: 'rgba(220, 174, 46, 0.05)',
            border: '1.5px solid rgba(220, 174, 46, 0.3)',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(220, 174, 46, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--c-primary)',
                flexShrink: 0
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 'bold' }}>brightness_3</span>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--c-on-surface)' }}>
                Upcoming Islamic (Hijri) Event Alert
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--c-on-surface-variant)', fontWeight: 550 }}>
                You have {upcomingIslamicEvents.length} event{upcomingIslamicEvents.length !== 1 ? 's' : ''} upcoming within 2 days:
              </p>
            </div>

          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '48px' }}>
            {upcomingIslamicEvents.map((item, idx) => (
              <span 
                key={idx}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: 'rgba(220, 174, 46, 0.15)',
                  color: 'var(--c-primary)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  border: '1px solid rgba(220, 174, 46, 0.3)'
                }}
              >
                🌙 {item.event.title} ({item.event.dayLabel} — {item.status === 'TODAY' ? 'Today' : item.status === 'IN_1_DAY' ? 'Tomorrow' : 'In 2 Days'})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* OVERDUE PERIODIC TRACKER WARNING */}
      {overdueTrackers.length > 0 && (
        <div 
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px 20px',
            borderRadius: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.04)',
            border: '1.5px solid rgba(239, 68, 68, 0.2)',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--c-error)',
                flexShrink: 0
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 'bold' }}>warning</span>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--c-on-surface)' }}>
                Periodic Tracker Alert
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--c-on-surface-variant)', fontWeight: 550 }}>
                You have {overdueTrackers.length} hygiene/personal care tracker{overdueTrackers.length !== 1 ? 's' : ''} that crossed the 35-day limit:
              </p>
            </div>
            <Link 
              href="/tasks" 
              className="primary-btn"
              style={{ 
                padding: '8px 16px', 
                borderRadius: '8px', 
                fontSize: '12px', 
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: 'none'
              }}
            >
              Update Now
            </Link>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '48px' }}>
            {overdueTrackers.map((tracker, idx) => (
              <span 
                key={idx}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                ⚠️ {tracker.title} ({tracker.days} days ago)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* HIJRI DATE DISPLAY & CALENDAR */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <HijriDateDisplay baseOffset={baseOffset} maghribPassed={maghribPassed} />
        <DashboardCalendarWidget baseOffset={baseOffset} maghribPassed={maghribPassed} />
      </div>

      {/* TIMETABLE SECTION */}
      <div style={{ marginBottom: '24px' }}>
        <TimetableDashboardCard timetable={timetable} prayerTimes={prayerTimes} />
      </div>

      {/* SUMMARY GRIDS */}
      <div className="dashboard-summary-grid">
        
        {/* SPENDING SUMMARY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
          <h4 className="text-title-sm" style={{ fontWeight: 700, color: 'var(--c-on-surface-variant)', margin: 0 }}>Finance Expenses</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', flexGrow: 1 }}>
            {[
              { label: 'TODAY', value: `$${dailySpending.toFixed(2)}` },
              { label: 'THIS WEEK', value: `$${weeklySpending.toFixed(2)}` },
              { label: 'THIS MONTH', value: `$${monthlySpending.toFixed(2)}`, highlight: true },
              { label: 'THIS YEAR', value: `$${yearlySpending.toFixed(2)}` }
            ].map((item, i) => (
              <Link 
                key={i} 
                href="/transactions"
                className={`card flex-col justify-center ${item.highlight ? 'highlight-card' : ''}`}
                style={{ 
                  backgroundColor: 'var(--c-surface-container-high)',
                  borderTop: item.highlight ? '3px solid var(--c-primary)' : '1px solid var(--c-outline-variant)',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <span className="text-label-sm text-on-surface-variant mb-8">{item.label}</span>
                <h3 className="summary-amount" style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>
                  {item.value}
                </h3>
              </Link>
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

        {/* GOALS SUMMARY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 className="text-title-sm" style={{ fontWeight: 700, color: 'var(--c-on-surface-variant)', margin: 0 }}>Latest Goal</h4>
          <Link 
            href="/goals"
            className="card" 
            style={{ 
              padding: '16px', 
              borderRadius: '12px', 
              backgroundColor: 'var(--c-surface-container-high)',
              border: '1px solid var(--c-outline-variant)',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              flexGrow: 1,
              justifyContent: 'center',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease'
            }}
          >
            {absoluteLatestGoal ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {absoluteLatestGoal.category} OBJECTIVE
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--c-on-surface-variant)' }}>arrow_forward</span>
                </div>
                <h3 
                  className="text-title-md" 
                  style={{ 
                    margin: 0, 
                    fontWeight: 700, 
                    color: 'var(--c-on-surface)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {absoluteLatestGoal.title}
                </h3>
                {absoluteLatestGoal.description && (
                  <p 
                    style={{ 
                      margin: 0, 
                      lineHeight: 1.6, 
                      fontSize: '13px',
                      color: 'var(--c-on-surface-variant)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {absoluteLatestGoal.description}
                  </p>
                )}
                {absoluteLatestGoal.targetDate && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--c-primary)', fontWeight: 700, marginTop: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>event</span> 
                    Deadline: {new Date(absoluteLatestGoal.targetDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '120px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--c-on-surface-variant)' }}>target</span>
                <span style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', fontStyle: 'italic' }}>
                  No goals defined yet. Click to add!
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* DUA SUMMARY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 className="text-title-sm" style={{ fontWeight: 700, color: 'var(--c-on-surface-variant)', margin: 0 }}>Latest Supplication</h4>
          <Link 
            href="/dua"
            className="card" 
            style={{ 
              padding: '16px', 
              borderRadius: '12px', 
              backgroundColor: 'var(--c-surface-container-high)',
              border: '1px solid var(--c-outline-variant)',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              flexGrow: 1,
              justifyContent: 'center',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease'
            }}
          >
            {latestDua ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {latestDua.category} DUA
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--c-on-surface-variant)' }}>arrow_forward</span>
                </div>
                <h3 
                  className="text-title-md" 
                  style={{ 
                    margin: 0, 
                    fontWeight: 700, 
                    color: 'var(--c-on-surface)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {latestDua.title}
                </h3>
                <p 
                  style={{ 
                    margin: 0, 
                    lineHeight: 1.6, 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word',
                    direction: /[\u0600-\u06FF]/.test(latestDua.content) ? 'rtl' : 'ltr',
                    textAlign: /[\u0600-\u06FF]/.test(latestDua.content) ? 'right' : 'left',
                    fontFamily: /[\u0600-\u06FF]/.test(latestDua.content) ? '"Scheherazade New", Amiri, serif' : 'inherit',
                    fontSize: /[\u0600-\u06FF]/.test(latestDua.content) ? '20px' : '13px',
                    color: 'var(--c-on-surface-variant)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {latestDua.content}
                </p>
                {latestDua.translation && (
                  <p 
                    className="text-label-sm"
                    style={{ 
                      margin: 0, 
                      fontStyle: 'italic', 
                      color: 'var(--c-on-surface-variant)',
                      opacity: 0.8,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {latestDua.translation}
                  </p>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '120px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--c-on-surface-variant)' }}>favorite</span>
                <span style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', fontStyle: 'italic' }}>
                  No supplications added yet. Click to add!
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* BOOK SUMMARY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 className="text-title-sm" style={{ fontWeight: 700, color: 'var(--c-on-surface-variant)', margin: 0 }}>Latest Book</h4>
          <Link 
            href="/books"
            className="card" 
            style={{ 
              padding: '16px', 
              borderRadius: '12px', 
              backgroundColor: 'var(--c-surface-container-high)',
              border: '1px solid var(--c-outline-variant)',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              flexGrow: 1,
              justifyContent: 'center',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease'
            }}
          >
            {latestBook ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    READING REFERENCE
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--c-on-surface-variant)' }}>arrow_forward</span>
                </div>
                <h3 
                  className="text-title-md" 
                  style={{ 
                    margin: 0, 
                    fontWeight: 700, 
                    color: 'var(--c-on-surface)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {latestBook.title}
                </h3>
                {latestBook.author && (
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--c-on-surface-variant)' }}>
                    by {latestBook.author}
                  </p>
                )}
                {latestBook.notes && (
                  <p 
                    style={{ 
                      margin: 0, 
                      lineHeight: 1.6, 
                      fontSize: '13px',
                      color: 'var(--c-on-surface-variant)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {latestBook.notes}
                  </p>
                )}
                {latestBook.driveLink && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--c-primary)', fontWeight: 700, marginTop: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>link</span> Google Drive Link Available
                  </span>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '120px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--c-on-surface-variant)' }}>menu_book</span>
                <span style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', fontStyle: 'italic' }}>
                  No books added yet. Click to add!
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* HABIT TRACKER SUMMARY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 className="text-title-sm" style={{ fontWeight: 700, color: 'var(--c-on-surface-variant)', margin: 0 }}>Habit Tracker</h4>
          <Link 
            href="/relapse"
            className="card" 
            style={{ 
              padding: '16px', 
              borderRadius: '12px', 
              backgroundColor: 'var(--c-surface-container-high)',
              border: '1px solid var(--c-outline-variant)',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              flexGrow: 1,
              justifyContent: 'center',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc3545', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  RECOVERY STATUS
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--c-on-surface-variant)' }}>arrow_forward</span>
              </div>
              <h3 
                className="text-title-md" 
                style={{ 
                  margin: 0, 
                  fontWeight: 700, 
                  color: 'var(--c-on-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Streak: {streakDays} {streakDays === 1 ? 'Day' : 'Days'} Clean
              </h3>
              <p 
                style={{ 
                  margin: 0, 
                  lineHeight: 1.5, 
                  fontSize: '13px',
                  color: 'var(--c-on-surface-variant)',
                  fontStyle: 'italic',
                  fontWeight: 600
                }}
              >
                {streakText}
              </p>
              {latestRelapse && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderLeft: '2px solid rgba(220, 53, 69, 0.3)', paddingLeft: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>LAST OCCURRENCE LOGGED</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--c-on-surface)' }}>
                    {new Date(latestRelapse.date).toLocaleDateString()} at {new Date(latestRelapse.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* LEDGER SUMMARY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 className="text-title-sm" style={{ fontWeight: 700, color: 'var(--c-on-surface-variant)', margin: 0 }}>Ledger</h4>
          <Link 
            href="/debts"
            className="card" 
            style={{ 
              padding: '16px', 
              borderRadius: '12px', 
              backgroundColor: 'var(--c-surface-container-high)',
              border: '1px solid var(--c-outline-variant)',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              flexGrow: 1,
              justifyContent: 'center',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  NET BALANCE STATUS
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--c-on-surface-variant)' }}>arrow_forward</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
                <div style={{ 
                  padding: '10px 12px', 
                  borderRadius: '8px', 
                  backgroundColor: 'var(--c-surface)', 
                  borderLeft: '4px solid var(--c-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--c-on-surface-variant)' }}>THEY OWE YOU</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--c-primary)' }}>
                    ${totalTheyOweMe.toFixed(2)}
                  </span>
                </div>

                <div style={{ 
                  padding: '10px 12px', 
                  borderRadius: '8px', 
                  backgroundColor: 'var(--c-surface)', 
                  borderLeft: '4px solid var(--c-error)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--c-on-surface-variant)' }}>YOU OWE THEM</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--c-error)' }}>
                    ${totalIOweThem.toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--c-on-surface-variant)', fontStyle: 'italic', marginTop: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span>
                {totalTheyOweMe === 0 && totalIOweThem === 0 ? (
                  <span>All debts are currently settled.</span>
                ) : (
                  <span>
                    Net Position: {totalTheyOweMe >= totalIOweThem ? (
                      <strong style={{ color: 'var(--c-primary)' }}>+${(totalTheyOweMe - totalIOweThem).toFixed(2)}</strong>
                    ) : (
                      <strong style={{ color: 'var(--c-error)' }}>-${(totalIOweThem - totalTheyOweMe).toFixed(2)}</strong>
                    )}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>

      </div>

      <div className="grid-container" style={{ marginTop: '24px' }}>
        <div className="col-span-12 flex-col gap-24" style={{ alignContent: 'start' }}>
          <TasksOfTheDay dateStr={todayStr} />
        </div>
      </div>
    </>
  );
}
