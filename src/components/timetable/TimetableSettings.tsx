'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Edit3 } from 'lucide-react';
import TimetableForm from './TimetableForm';
import TimetableDashboardCard from '../dashboard/TimetableDashboardCard';

interface TimetableSettingsProps {
  initialData: any;
  prayerTimes: any;
}

export default function TimetableSettings({ initialData, prayerTimes }: TimetableSettingsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setIsEditOpen(true)}
          className="primary-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}
        >
          <Edit3 size={16} />
          Edit Time Table
        </button>
      </div>

      <TimetableDashboardCard timetable={initialData} prayerTimes={prayerTimes} />

      {/* Edit Modal */}
      {isEditOpen && mounted && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '20px' }}>
          <div 
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} 
            onClick={() => setIsEditOpen(false)} 
          />
          
          <div className="card" style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto', maxHeight: '90vh', overflowY: 'auto', padding: '0' }}>
            
            <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--c-surface-container)', padding: '16px 24px', borderBottom: '1px solid var(--c-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--c-on-surface)' }}>Edit Time Table</h3>
              <button 
                onClick={() => setIsEditOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)', padding: '4px', borderRadius: '50%', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <TimetableForm initialData={initialData} onSuccess={() => setIsEditOpen(false)} />
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
