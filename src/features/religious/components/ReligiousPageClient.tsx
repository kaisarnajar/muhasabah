'use client';

import { useState } from 'react';
import SpiritualDashboard from './SpiritualDashboard';
import IslamicEventsCalendar from './IslamicEventsCalendar';
import { Moon, CheckSquare, Calendar } from 'lucide-react';

interface Props {
  dateStr: string;
  initialTodayData: any;
  initialHistory: any;
  allHabits: any;
  hijriOffset: number;
}

export default function ReligiousPageClient({
  dateStr,
  initialTodayData,
  initialHistory,
  allHabits,
  hijriOffset
}: Props) {
  const [activeTab, setActiveTab] = useState<'TRACKERS' | 'CALENDAR'>('TRACKERS');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Navigation Tabs */}
      <div 
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1.5px solid var(--c-outline-variant)',
          paddingBottom: '12px'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('TRACKERS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: activeTab === 'TRACKERS' ? 800 : 600,
            backgroundColor: activeTab === 'TRACKERS' ? 'var(--c-primary)' : 'transparent',
            color: activeTab === 'TRACKERS' ? '#ffffff' : 'var(--c-on-surface-variant)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <CheckSquare size={16} />
          Daily Spiritual Trackers
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CALENDAR')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: activeTab === 'CALENDAR' ? 800 : 600,
            backgroundColor: activeTab === 'CALENDAR' ? 'var(--c-primary)' : 'transparent',
            color: activeTab === 'CALENDAR' ? '#ffffff' : 'var(--c-on-surface-variant)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Moon size={16} />
          Islamic Calendar & Events
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'TRACKERS' ? (
        <SpiritualDashboard
          dateStr={dateStr}
          initialTodayData={initialTodayData}
          initialHistory={initialHistory}
          allHabits={allHabits}
        />
      ) : (
        <IslamicEventsCalendar initialHijriOffset={hijriOffset} />
      )}
    </div>
  );
}
