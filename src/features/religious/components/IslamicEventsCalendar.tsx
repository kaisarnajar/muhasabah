'use client';

import { useState } from 'react';
import { MONTH_DETAILS, ISLAMIC_EVENTS_DATA, IslamicEvent, EventCategory } from '@/lib/islamicEvents';
import { getHijriMonthNumber, ISLAMIC_MONTHS } from '@/lib/hijri';
import { Search, Calendar, Moon, Sparkles, Shield, Bookmark, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  initialHijriOffset?: number;
}

export default function IslamicEventsCalendar({ initialHijriOffset = 0 }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedMonths, setExpandedMonths] = useState<Record<number, boolean>>({});

  const today = new Date();
  const currentMonthNum = getHijriMonthNumber(today, initialHijriOffset);

  // Filter events based on search & category
  const filteredEvents = ISLAMIC_EVENTS_DATA.filter(ev => {
    const matchesSearch = searchTerm === '' || 
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.monthName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.dayLabel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || ev.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleMonth = (monthNum: number) => {
    setExpandedMonths(prev => ({ ...prev, [monthNum]: !prev[monthNum] }));
  };

  const getCategoryBadge = (category: EventCategory) => {
    switch (category) {
      case 'EID':
        return { label: 'Major Eid', bg: 'rgba(34, 197, 94, 0.12)', color: '#16a34a', border: 'rgba(34, 197, 94, 0.3)' };
      case 'SUNNAH_FAST':
        return { label: 'Sunnah Fasting', bg: 'rgba(234, 179, 8, 0.12)', color: '#ca8a04', border: 'rgba(234, 179, 8, 0.3)' };
      case 'SPECIAL_NIGHT':
        return { label: 'Night of Worship', bg: 'rgba(168, 85, 247, 0.12)', color: '#9333ea', border: 'rgba(168, 85, 247, 0.3)' };
      case 'HISTORICAL':
        return { label: 'Historical Event', bg: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', border: 'rgba(59, 130, 246, 0.3)' };
      case 'SACRED_MONTH':
        return { label: 'Sacred Month', bg: 'rgba(220, 174, 46, 0.15)', color: 'var(--c-primary)', border: 'rgba(220, 174, 46, 0.4)' };
      default:
        return { label: category, bg: 'var(--c-surface-container-high)', color: 'var(--c-on-surface)', border: 'var(--c-outline)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div 
        className="card"
        style={{
          padding: '24px 28px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(220, 174, 46, 0.08) 0%, rgba(220, 174, 46, 0.02) 100%)',
          border: '1.5px solid rgba(220, 174, 46, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Moon style={{ color: 'var(--c-primary)', width: '22px', height: '22px' }} />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--c-on-surface)' }}>
              Islamic (Hijri) Calendar & Historical Events
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--c-on-surface-variant)', maxWidth: '700px' }}>
            A day-by-day reference of major historical, religious, and commemorative dates across the 12 Islamic lunar months.
          </p>
        </div>
        <div 
          style={{
            padding: '8px 16px',
            borderRadius: '12px',
            backgroundColor: 'var(--c-surface)',
            border: '1px solid var(--c-outline-variant)',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--c-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sparkles size={16} />
          Current Month: {ISLAMIC_MONTHS[currentMonthNum - 1]} ({currentMonthNum}/12)
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-on-surface-variant)' }} 
            />
            <input 
              type="text"
              placeholder="Search Islamic events, dates, or keywords (e.g. Ashura, Badr, Fasting)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{
                width: '100%',
                paddingLeft: '42px',
                paddingRight: '16px',
                paddingTop: '10px',
                paddingBottom: '10px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600
              }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'SUNNAH_FAST', label: 'Sunnah Fasts' },
            { id: 'EID', label: 'Major Eids' },
            { id: 'SPECIAL_NIGHT', label: 'Nights of Worship' },
            { id: 'HISTORICAL', label: 'Historical Events' },
            { id: 'SACRED_MONTH', label: 'Sacred Months' }
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: selectedCategory === cat.id ? 700 : 550,
                backgroundColor: selectedCategory === cat.id ? 'var(--c-primary)' : 'var(--c-surface-container-high)',
                color: selectedCategory === cat.id ? '#ffffff' : 'var(--c-on-surface)',
                border: '1px solid ' + (selectedCategory === cat.id ? 'var(--c-primary)' : 'var(--c-outline-variant)'),
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Month-by-Month View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Array.from({ length: 12 }, (_, index) => {
          const monthNum = index + 1;
          const monthDetail = MONTH_DETAILS[monthNum];
          const isCurrent = monthNum === currentMonthNum;

          // Events in this month matching search & category filter
          const monthEvents = filteredEvents.filter(e => e.monthNum === monthNum);

          // Skip month if filtering and no events match
          if ((searchTerm !== '' || selectedCategory !== 'ALL') && monthEvents.length === 0) {
            return null;
          }

          const isExpanded = expandedMonths[monthNum] !== undefined ? expandedMonths[monthNum] : (isCurrent || monthEvents.length > 0);

          return (
            <div 
              key={monthNum}
              className="card"
              style={{
                borderRadius: '16px',
                border: isCurrent 
                  ? '2px solid var(--c-primary)' 
                  : '1.5px solid var(--c-outline-variant)',
                backgroundColor: 'var(--c-surface)',
                overflow: 'hidden'
              }}
            >
              {/* Month Header Bar */}
              <div 
                onClick={() => toggleMonth(monthNum)}
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: isCurrent ? 'rgba(220, 174, 46, 0.06)' : 'var(--c-surface-container-low)',
                  borderBottom: isExpanded ? '1px solid var(--c-outline-variant)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isCurrent ? 'var(--c-primary)' : 'var(--c-surface-container-high)',
                      color: isCurrent ? '#ffffff' : 'var(--c-on-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 800
                    }}
                  >
                    {monthNum}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--c-on-surface)' }}>
                        {monthDetail.name}
                      </h3>
                      {monthDetail.isSacred && (
                        <span 
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(220, 174, 46, 0.15)',
                            color: 'var(--c-primary)',
                            border: '1px solid rgba(220, 174, 46, 0.3)'
                          }}
                        >
                          Sacred Month
                        </span>
                      )}
                      {isCurrent && (
                        <span 
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#22c55e',
                            color: '#ffffff'
                          }}
                        >
                          CURRENT MONTH
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--c-on-surface-variant)' }}>
                      {monthDetail.overview}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--c-on-surface-variant)' }}>
                    {monthEvents.length} {monthEvents.length === 1 ? 'Event' : 'Events'}
                  </span>
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* Month Events List */}
              {isExpanded && (
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {monthEvents.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--c-on-surface-variant)', fontStyle: 'italic' }}>
                      No major fixed commemorative dates widely observed for this month.
                    </p>
                  ) : (
                    monthEvents.map(ev => {
                      const badge = getCategoryBadge(ev.category);
                      return (
                        <div 
                          key={ev.id}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            backgroundColor: 'var(--c-surface-container-low)',
                            border: '1px solid var(--c-outline-variant)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span 
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  color: 'var(--c-primary)',
                                  backgroundColor: 'rgba(220, 174, 46, 0.1)',
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  border: '1px solid rgba(220, 174, 46, 0.2)'
                                }}
                              >
                                {ev.dayLabel}
                              </span>
                              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 750, color: 'var(--c-on-surface)' }}>
                                {ev.title}
                              </h4>
                            </div>

                            <span 
                              style={{
                                fontSize: '11px',
                                fontWeight: 750,
                                padding: '3px 10px',
                                borderRadius: '16px',
                                backgroundColor: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`
                              }}
                            >
                              {badge.label}
                            </span>
                          </div>

                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--c-on-surface-variant)', lineHeight: '1.5' }}>
                            {ev.description}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
