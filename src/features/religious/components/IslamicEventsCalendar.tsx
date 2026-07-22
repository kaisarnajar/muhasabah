'use client';

import { useState } from 'react';
import { MONTH_DETAILS, ISLAMIC_EVENTS_DATA, IslamicEvent, EventCategory, getUpcomingIslamicEvents } from '@/lib/islamicEvents';
import { getHijriMonthNumber, ISLAMIC_MONTHS } from '@/lib/hijri';
import { Search, Calendar, Moon, Sparkles, X, ChevronRight } from 'lucide-react';

interface Props {
  baseOffset?: number;
  maghribPassed?: boolean;
}

export default function IslamicEventsCalendar({ baseOffset = 0, maghribPassed = false }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMonthPopup, setSelectedMonthPopup] = useState<number | null>(null);

  const today = new Date();
  const effectiveOffset = baseOffset + (maghribPassed ? 1 : 0);
  const currentMonthNum = getHijriMonthNumber(today, effectiveOffset);

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

  const selectedMonthDetail = selectedMonthPopup ? MONTH_DETAILS[selectedMonthPopup] : null;
  const selectedMonthEvents = selectedMonthPopup ? filteredEvents.filter(e => e.monthNum === selectedMonthPopup) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
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

      {/* Months Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {Array.from({ length: 12 }, (_, index) => {
          const monthNum = index + 1;
          const monthDetail = MONTH_DETAILS[monthNum];
          const isCurrent = monthNum === currentMonthNum;
          const monthEvents = filteredEvents.filter(e => e.monthNum === monthNum);

          if ((searchTerm !== '' || selectedCategory !== 'ALL') && monthEvents.length === 0) {
            return null;
          }

          return (
            <div 
              key={monthNum}
              className="card"
              onClick={() => setSelectedMonthPopup(monthNum)}
              style={{
                borderRadius: '16px',
                border: isCurrent ? '2px solid var(--c-primary)' : '1px solid var(--c-outline-variant)',
                backgroundColor: isCurrent ? 'rgba(220, 174, 46, 0.03)' : 'var(--c-surface)',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                <ChevronRight size={18} style={{ color: 'var(--c-on-surface-variant)', opacity: 0.5 }} />
              </div>

              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--c-on-surface)' }}>
                  {monthDetail.name}
                </h3>
                {monthDetail.isSacred && (
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--c-primary)', display: 'block', marginTop: '2px' }}>
                    Sacred Month
                  </span>
                )}
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--c-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>
                  {monthEvents.length} Event{monthEvents.length !== 1 && 's'}
                </span>
                {isCurrent && (
                  <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#22c55e', color: '#ffffff' }}>
                    CURRENT
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Popup Details Overlay */}
      {selectedMonthPopup && selectedMonthDetail && (
        <div 
          style={{
            position: 'absolute',
            top: '-24px',
            left: '-24px',
            right: '-24px',
            bottom: '-24px',
            backgroundColor: 'var(--c-surface)',
            borderRadius: 'inherit',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Popup Header */}
          <div style={{ padding: '24px', borderBottom: '1px solid var(--c-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'var(--c-surface-container-lowest)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div 
                style={{
                  width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--c-primary)', color: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800
                }}
              >
                {selectedMonthPopup}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--c-on-surface)' }}>
                  {selectedMonthDetail.name}
                </h2>
                {selectedMonthDetail.isSacred && (
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--c-primary)', backgroundColor: 'rgba(220, 174, 46, 0.1)', padding: '2px 8px', borderRadius: '12px', display: 'inline-block', marginTop: '4px' }}>
                    Sacred Month
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedMonthPopup(null)}
              style={{ background: 'var(--c-surface-container-high)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--c-on-surface)' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Popup Content */}
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', lineHeight: '1.6', color: 'var(--c-on-surface-variant)' }}>
              {selectedMonthDetail.overview}
            </p>

            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: 'var(--c-on-surface)' }}>
              Events in {selectedMonthDetail.name}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedMonthEvents.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--c-surface-container-low)', borderRadius: '12px', border: '1px dashed var(--c-outline-variant)' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--c-on-surface-variant)', fontStyle: 'italic' }}>
                    No major fixed commemorative dates widely observed for this month based on your current filters.
                  </p>
                </div>
              ) : (
                selectedMonthEvents.map(ev => {
                  const badge = getCategoryBadge(ev.category);
                  return (
                    <div 
                      key={ev.id}
                      style={{
                        padding: '16px',
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
                              fontSize: '13px',
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
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: 'var(--c-on-surface)' }}>
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
                      <p style={{ margin: 0, fontSize: '14px', color: 'var(--c-on-surface-variant)', lineHeight: '1.5' }}>
                        {ev.description}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
