'use client';

import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import IslamicEventsCalendar from './IslamicEventsCalendar';

interface IslamicEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseOffset: number;
  maghribPassed: boolean;
}

export default function IslamicEventsModal({ isOpen, onClose, baseOffset, maghribPassed }: IslamicEventsModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)', zIndex: 10 }}
        >
          <X size={24} />
        </button>
        
        <div style={{ marginTop: '12px' }}>
          <IslamicEventsCalendar baseOffset={baseOffset} maghribPassed={maghribPassed} />
        </div>
      </div>
    </div>,
    document.body
  );
}
