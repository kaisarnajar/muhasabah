'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { MONTH_DETAILS, ISLAMIC_EVENTS_DATA, EventCategory } from '@/lib/islamicEvents';

interface Props {
  monthNum: number | null;
  onClose: () => void;
}

export default function IslamicMonthPopup({ monthNum, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!monthNum || !mounted) return null;

  const selectedMonthDetail = MONTH_DETAILS[monthNum];
  const selectedMonthEvents = ISLAMIC_EVENTS_DATA.filter(e => e.monthNum === monthNum);

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

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1100,
        padding: '16px',
        backdropFilter: 'blur(4px)'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          backgroundColor: 'var(--c-surface)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'var(--shadow-lg)'
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
              {monthNum}
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
            onClick={onClose}
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
                  No major fixed commemorative dates widely observed for this month.
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
    </div>,
    document.body
  );
}
