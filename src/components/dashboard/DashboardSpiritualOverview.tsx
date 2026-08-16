'use client';

import Link from 'next/link';

interface PrayerStat {
  name: string;
  rate: number;
}

interface GoodDeed {
  text: string;
}

interface DashboardSpiritualOverviewProps {
  monthlyPrayerStats: PrayerStat[];
  monthlyQuranVerses: number;
  monthlyQuranSurahsCount: number;
  recentGoodDeeds: GoodDeed[];
  recentShortcomings: GoodDeed[];
}

export default function DashboardSpiritualOverview({
  monthlyPrayerStats,
  monthlyQuranVerses,
  monthlyQuranSurahsCount,
  recentGoodDeeds,
  recentShortcomings,
}: DashboardSpiritualOverviewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h4 className="text-title-sm" style={{ fontWeight: 700, color: 'var(--c-on-surface-variant)', margin: 0 }}>
        Spiritual Insights (This Month)
      </h4>

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
            transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-secondary)', letterSpacing: '0.05em' }}>
              PRAYERS CONSISTENCY
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--c-on-surface-variant)' }}>
              arrow_forward
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            {monthlyPrayerStats.map((p) => (
              <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: '46px' }}>
                <span style={{ fontSize: '10px', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>{p.name}</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--c-on-surface)' }}>{p.rate}%</span>
              </div>
            ))}
          </div>
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
            transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-secondary)', letterSpacing: '0.05em' }}>
              RECENT GOOD DEEDS
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--c-on-surface-variant)' }}>
              arrow_forward
            </span>
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
                    paddingLeft: '6px',
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

        {/* 4. Shortcomings Log Card */}
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
            transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-error)', letterSpacing: '0.05em' }}>
              RECENT SHORTCOMINGS
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--c-on-surface-variant)' }}>
              arrow_forward
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {recentShortcomings.length > 0 ? (
              recentShortcomings.map((deed, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '11px',
                    color: 'var(--c-on-surface)',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    borderLeft: '2px solid var(--c-error)',
                    paddingLeft: '6px',
                  }}
                >
                  {deed.text}
                </div>
              ))
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', fontStyle: 'italic' }}>
                No shortcomings logged this month.
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
