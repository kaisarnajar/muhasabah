'use client';

import { useState, useTransition } from 'react';
import { CalendarRange, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { updateHijriOffset } from '@/features/timetable/actions';
import { getHijriDateString } from '@/lib/hijri';
import { useRouter } from 'next/navigation';

interface Props {
  initialOffset: number;
}

export default function HijriDateDisplay({ initialOffset }: Props) {
  const [offset, setOffset] = useState(initialOffset);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const today = new Date();
  const hijriStr = getHijriDateString(today, offset);
  const gregorianStr = today.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleAdjust = (diff: number) => {
    const newOffset = offset + diff;
    setOffset(newOffset);
    startTransition(async () => {
      try {
        await updateHijriOffset(newOffset);
        router.refresh();
      } catch (error) {
        console.error('Failed to update Hijri offset:', error);
      }
    });
  };

  const handleReset = () => {
    setOffset(0);
    startTransition(async () => {
      try {
        await updateHijriOffset(0);
        router.refresh();
      } catch (error) {
        console.error('Failed to reset Hijri offset:', error);
      }
    });
  };

  return (
    <div 
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderRadius: '16px',
        border: '1px solid var(--c-outline-variant)',
        backgroundColor: 'var(--c-surface-container-low)',
        gap: '16px',
        flexWrap: 'wrap',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div 
          style={{
            padding: '10px',
            backgroundColor: 'rgba(19, 110, 229, 0.1)',
            color: 'var(--c-primary)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CalendarRange size={24} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <h3 
            className="text-headline-sm" 
            style={{ 
              margin: 0, 
              fontWeight: 800, 
              fontSize: '18px', 
              color: 'var(--c-on-surface)',
              letterSpacing: '-0.01em'
            }}
          >
            {hijriStr}
          </h3>
          <span 
            className="text-label-sm" 
            style={{ 
              color: 'var(--c-on-surface-variant)', 
              fontWeight: 550,
              fontSize: '12px'
            }}
          >
            {gregorianStr}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
          <span 
            className="text-label-sm" 
            style={{ 
              fontWeight: 700, 
              fontSize: '11px', 
              color: 'var(--c-on-surface-variant)',
              backgroundColor: 'var(--c-surface-container-high)',
              padding: '4px 10px',
              borderRadius: '20px',
              border: '1px solid var(--c-outline-variant)'
            }}
          >
            Offset: {offset > 0 ? `+${offset}` : offset} {Math.abs(offset) === 1 ? 'Day' : 'Days'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => handleAdjust(-1)}
            disabled={isPending}
            className="primary-btn"
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--c-surface-container-high)',
              color: 'var(--c-on-surface)',
              border: '1px solid var(--c-outline-variant)',
              boxShadow: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: isPending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: isPending ? 0.6 : 1
            }}
            title="Subtract 1 Day"
          >
            <ChevronLeft size={14} /> -1 Day
          </button>

          {offset !== 0 && (
            <button
              onClick={handleReset}
              disabled={isPending}
              className="primary-btn"
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                boxShadow: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: isPending ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: isPending ? 0.6 : 1
              }}
              title="Reset to Default"
            >
              <RotateCcw size={13} /> Reset
            </button>
          )}

          <button
            onClick={() => handleAdjust(1)}
            disabled={isPending}
            className="primary-btn"
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--c-surface-container-high)',
              color: 'var(--c-on-surface)',
              border: '1px solid var(--c-outline-variant)',
              boxShadow: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: isPending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: isPending ? 0.6 : 1
            }}
            title="Add 1 Day"
          >
            +1 Day <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
