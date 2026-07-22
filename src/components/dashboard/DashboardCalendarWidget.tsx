'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import IslamicEventsModal from '@/features/religious/components/IslamicEventsModal';

interface DashboardCalendarWidgetProps {
  baseOffset: number;
  maghribPassed: boolean;
}

export default function DashboardCalendarWidget({ baseOffset, maghribPassed }: DashboardCalendarWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="secondary-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '12px',
          backgroundColor: 'var(--c-surface-container-high)',
          color: 'var(--c-on-surface)',
          border: '1px solid var(--c-outline)',
          boxShadow: 'none',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'var(--transition-fast)'
        }}
      >
        <Calendar size={18} /> View Calendar
      </button>

      <IslamicEventsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        baseOffset={baseOffset}
        maghribPassed={maghribPassed}
      />
    </>
  );
}
