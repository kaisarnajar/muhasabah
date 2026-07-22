'use client';

import Link from 'next/link';
import { useState, useTransition, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarRange, ChevronLeft, ChevronRight, RotateCcw, Edit3, X } from 'lucide-react';
import { updateHijriOffset } from '@/features/timetable/actions';
import { getHijriDateString, getHijriMonthNumber, ISLAMIC_MONTHS } from '@/lib/hijri';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import IslamicEventsModal from '@/features/religious/components/IslamicEventsModal';

interface Props {
  baseOffset: number;
  maghribPassed?: boolean;
  showControls?: boolean;
}

export default function HijriDateDisplay({ baseOffset, maghribPassed = false, showControls = false }: Props) {
  const [offsetState, setOffsetState] = useState(baseOffset);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const today = new Date();
  const effectiveOffset = offsetState + (maghribPassed ? 1 : 0);
  const hijriStr = getHijriDateString(today, effectiveOffset);
  const currentMonthNum = getHijriMonthNumber(today, effectiveOffset);
  const gregorianStr = today.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleAdjust = (diff: number) => {
    const newBaseOffset = offsetState + diff;
    setOffsetState(newBaseOffset);
    startTransition(async () => {
      try {
        await updateHijriOffset(newBaseOffset);
        showToast(`Hijri date adjusted by ${newBaseOffset > 0 ? `+${newBaseOffset}` : newBaseOffset} ${Math.abs(newBaseOffset) === 1 ? 'day' : 'days'}.`, 'success');
        router.refresh();
      } catch (error) {
        console.error('Failed to update Hijri offset:', error);
        showToast('Failed to adjust Hijri date offset.', 'error');
      }
    });
  };

  const handleReset = () => {
    setOffsetState(0);
    startTransition(async () => {
      try {
        await updateHijriOffset(0);
        showToast('Hijri date reset to default.', 'success');
        router.refresh();
      } catch (error) {
        console.error('Failed to reset Hijri offset:', error);
        showToast('Failed to reset Hijri date offset.', 'error');
      }
    });
  };

  return (
    <div 
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 24px',
        borderRadius: '16px',
        border: '1.5px solid var(--c-outline-variant)',
        backgroundColor: 'var(--c-surface-container-low)',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div 
            style={{
              padding: '10px',
              backgroundColor: 'rgba(191, 145, 41, 0.1)',
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

        {/* Buttons group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {offsetState !== 0 && (
            <span 
              className="text-label-sm" 
              style={{ 
                fontWeight: 700, 
                fontSize: '11px', 
                color: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                padding: '4px 10px',
                borderRadius: '20px',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              Offset: {offsetState > 0 ? `+${offsetState}` : offsetState} Day{Math.abs(offsetState) !== 1 && 's'}
            </span>
          )}

          <button
            onClick={() => setIsCalendarOpen(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--c-surface-container-high)',
              color: 'var(--c-on-surface)',
              border: '1px solid var(--c-outline-variant)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <CalendarRange size={15} /> View Calendar
          </button>

          {showControls && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="primary-btn"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Edit3 size={15} /> Adjust Offset
            </button>
          )}
        </div>
      </div>

      <IslamicEventsModal 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
        baseOffset={baseOffset}
        maghribPassed={maghribPassed}
      />

      {/* Edit Offset Modal */}
      {showControls && isModalOpen && mounted && createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 1100, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '20px', 
            backdropFilter: 'blur(6px)', 
            backgroundColor: 'rgba(0,0,0,0.6)' 
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="card"
            style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '420px', 
              padding: '28px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '24px', 
              boxShadow: 'var(--shadow-lg)', 
              border: '1px solid var(--c-outline-variant)' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{ 
                position: 'absolute', 
                top: '16px', 
                right: '16px', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                color: 'var(--c-on-surface-variant)', 
                display: 'flex' 
              }}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--c-on-surface)' }}>
                Adjust Hijri Offset
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--c-on-surface-variant)', lineHeight: 1.5 }}>
                Manually adjust the Hijri calendar offset in days to match your local announcement.
              </p>
            </div>

            {/* Adjuster controls */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '24px',
                padding: '20px 0',
                borderTop: '1px solid var(--c-outline-variant)',
                borderBottom: '1px solid var(--c-outline-variant)'
              }}
            >
              <button
                type="button"
                onClick={() => handleAdjust(-1)}
                disabled={isPending}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--c-surface-container-high)',
                  color: 'var(--c-on-surface)',
                  border: '1px solid var(--c-outline-variant)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  opacity: isPending ? 0.6 : 1,
                  padding: 0
                }}
                title="Subtract 1 Day"
              >
                <ChevronLeft size={20} />
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--c-primary)' }}>
                  {offsetState > 0 ? `+${offsetState}` : offsetState}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {Math.abs(offsetState) === 1 ? 'Day' : 'Days'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleAdjust(1)}
                disabled={isPending}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--c-surface-container-high)',
                  color: 'var(--c-on-surface)',
                  border: '1px solid var(--c-outline-variant)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  opacity: isPending ? 0.6 : 1,
                  padding: 0
                }}
                title="Add 1 Day"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Helper display */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--c-on-surface-variant)' }}>
                <span>Calculated date:</span>
                <span style={{ fontWeight: 600 }}>{getHijriDateString(today, 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--c-on-surface)' }}>
                <span>Adjusted date:</span>
                <span style={{ fontWeight: 800, color: 'var(--c-primary)' }}>{hijriStr}</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '4px' }}>
              <div>
                {offsetState !== 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isPending}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: isPending ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: isPending ? 0.6 : 1
                    }}
                  >
                    <RotateCcw size={14} /> Reset
                  </button>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="primary-btn"
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                Close
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
