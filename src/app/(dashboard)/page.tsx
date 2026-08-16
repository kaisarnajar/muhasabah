import { getAuthenticatedUser } from '@/features/auth/actions';
import TimetableDashboardCard from '@/components/dashboard/TimetableDashboardCard';
import HijriDateDisplay from '@/components/ui/HijriDateDisplay';
import TopGoalCard from '@/components/dashboard/TopGoalCard';
import DashboardFinancialOverview from '@/components/dashboard/DashboardFinancialOverview';
import DashboardSpiritualOverview from '@/components/dashboard/DashboardSpiritualOverview';
import DashboardRecoveryStreakCard from '@/components/dashboard/DashboardRecoveryStreakCard';
import DashboardLedgerOverview from '@/components/dashboard/DashboardLedgerOverview';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getUpcomingIslamicEvents } from '@/lib/islamicEvents';
import { getPrayerTimesAndMaghribStatus } from '@/features/timetable/actions';
import { getTodayDateString, getLocalDateString } from '@/lib/dateUtils';

export default async function Dashboard() {
  const sessionUser = await getAuthenticatedUser();
  if (!sessionUser) {
    redirect('/login');
  }

  const now = new Date();
  const todayStr = getTodayDateString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    transactions,
    timetable,
    user,
    habitLogs,
    monthlyDayLogs,
    absoluteLatestGoal,
    explicitTopGoal,
    allGoals,
    latestDua,
    latestBook,
    latestRelapse,
    latestFitnessLog,
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
    prisma.goal.findFirst({
      where: { userId: sessionUser.id, isTopGoal: true },
    }),
    prisma.goal.findMany({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, description: true, category: true },
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
    prisma.fitnessLog.findFirst({
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

  const { prayerTimes } = prayerTimesData;

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
  const totalDaysElapsed = Math.max(1, now.getDate());
  const prayers = ['Fajr', 'Zuhur', 'Asr', 'Maghrib', 'Isha', 'Tahajjud'];

  const monthlyPrayerStats = prayers.map(p => {
    const pLogs = monthlyLogs.filter(l => l.habit.name === p && l.isCompleted);
    const completedDates = new Set(
      pLogs.map(l => getLocalDateString(l.date, 'UTC'))
    );
    const completed = completedDates.size;
    const total = totalDaysElapsed;
    const rate = Math.min(100, Math.round((completed / total) * 100));
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
      } catch {}
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

  const recentShortcomings = monthlyDayLogs
    .filter(l => l.shortcomings && l.shortcomings.trim())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map(l => {
      const text = l.shortcomings!.split('\n')[0].trim();
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

  // Calculate Net Balances for Ledger per person
  let totalTheyOweMe = 0;
  let totalIOweThem = 0;

  persons.forEach(person => {
    let personNet = 0;
    person.debts.forEach(debt => {
      const amt = Number(debt.amount);
      if (debt.type === 'CREDIT') {
        personNet += amt;
      } else {
        personNet -= amt;
      }
    });
    if (personNet > 0) {
      totalTheyOweMe += personNet;
    } else if (personNet < 0) {
      totalIOweThem += Math.abs(personNet);
    }
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
  const upcomingIslamicEvents = getUpcomingIslamicEvents(new Date(), baseOffset, 2);

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

      {/* HIJRI DATE DISPLAY */}
      <div style={{ marginBottom: '24px' }}>
        <HijriDateDisplay baseOffset={baseOffset} />
      </div>

      {/* TOP GOAL NOTE SECTION */}
      <div style={{ marginBottom: '24px' }}>
        <TopGoalCard 
          topGoal={explicitTopGoal || absoluteLatestGoal} 
          allGoals={allGoals} 
        />
      </div>

      {/* TIMETABLE SECTION */}
      <div style={{ marginBottom: '24px' }}>
        <TimetableDashboardCard timetable={timetable} prayerTimes={prayerTimes} />
      </div>

      {/* SUMMARY GRIDS */}
      <div className="dashboard-summary-grid">
        
        {/* SPENDING SUMMARY */}
        <DashboardFinancialOverview
          dailySpending={dailySpending}
          weeklySpending={weeklySpending}
          monthlySpending={monthlySpending}
          yearlySpending={yearlySpending}
        />

        {/* SPIRITUAL SUMMARY */}
        <DashboardSpiritualOverview
          monthlyPrayerStats={monthlyPrayerStats}
          monthlyQuranVerses={monthlyQuranVerses}
          monthlyQuranSurahsCount={monthlyQuranSurahs.size}
          recentGoodDeeds={recentGoodDeeds}
          recentShortcomings={recentShortcomings}
        />

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
                  className={/[\u0600-\u06FF]/.test(latestDua.content) ? "arabic-text" : ""}
                  style={{ 
                    margin: 0, 
                    lineHeight: /[\u0600-\u06FF]/.test(latestDua.content) ? 2.3 : 1.6, 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word',
                    direction: /[\u0600-\u06FF]/.test(latestDua.content) ? 'rtl' : 'ltr',
                    textAlign: /[\u0600-\u06FF]/.test(latestDua.content) ? 'right' : 'left',
                    fontFamily: /[\u0600-\u06FF]/.test(latestDua.content) ? 'var(--font-arabic)' : 'inherit',
                    fontSize: /[\u0600-\u06FF]/.test(latestDua.content) ? '22px' : '13px',
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

        {/* FITNESS SUMMARY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 className="text-title-sm" style={{ fontWeight: 700, color: 'var(--c-on-surface-variant)', margin: 0 }}>Latest Fitness Activity</h4>
          <Link 
            href="/fitness"
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
            {latestFitnessLog ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {latestFitnessLog.activity.toUpperCase()}
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
                  {latestFitnessLog.duration} mins {latestFitnessLog.distance ? `• ${latestFitnessLog.distance}km` : ''}
                </h3>
                {latestFitnessLog.notes && (
                  <p 
                    style={{ 
                      margin: 0, 
                      lineHeight: 1.6, 
                      fontSize: '13px',
                      color: 'var(--c-on-surface-variant)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {latestFitnessLog.notes}
                  </p>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--c-primary)', fontWeight: 700, marginTop: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>event</span> 
                  {new Date(latestFitnessLog.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '120px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--c-on-surface-variant)' }}>fitness_center</span>
                <span style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', fontStyle: 'italic' }}>
                  No fitness activities logged. Click to add!
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* HABIT TRACKER SUMMARY */}
        <DashboardRecoveryStreakCard
          streakDays={streakDays}
          streakText={streakText}
          latestRelapseDate={latestRelapse?.date}
        />

        {/* LEDGER SUMMARY */}
        <DashboardLedgerOverview
          totalTheyOweMe={totalTheyOweMe}
          totalIOweThem={totalIOweThem}
        />

      </div>
    </>
  );
}
