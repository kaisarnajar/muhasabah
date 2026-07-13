'use client';

import { useState, useEffect } from 'react';
import { Sun, Sunrise, Briefcase, Dumbbell, BookOpen, Moon, Clock, BedDouble, Home } from 'lucide-react';

interface TimetableData {
  wakeUpTime: string;
  tillSunrise: string;
  sunriseTillOffice: string;
  officeDeparture: string;
  officeReturn: string;
  gymPreference: string;
  maghribToIsha: string;
  ishaToHifz: string;
  sleepTime: string;
}

function formatTime(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function timeToMinutes(t: string) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export default function TimetableDashboardCard({ timetable }: { timetable: TimetableData }) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    };
    update();
    const iv = setInterval(update, 60000);
    return () => clearInterval(iv);
  }, []);

  const nowMin = currentTime ? timeToMinutes(currentTime) : -1;
  const gym = timetable.gymPreference;

  const wakeMin = timeToMinutes(timetable.wakeUpTime);
  const depMin  = timeToMinutes(timetable.officeDeparture);
  const retMin  = timeToMinutes(timetable.officeReturn);
  const sleepMin = timeToMinutes(timetable.sleepTime);

  type Slot = {
    key: string;
    icon: React.ReactNode;
    label: string;
    time: string;
    desc: string;
    color: string;
    startMin: number;
    endMin: number;
  };

  const slots: Slot[] = [
    {
      key: 'wakeup',
      icon: <Sun size={16} />,
      label: 'Wake Up',
      time: formatTime(timetable.wakeUpTime),
      desc: 'Start of the day — Fajr & Dhikr',
      color: '#f59e0b',
      startMin: wakeMin,
      endMin: wakeMin + 45,
    },
    ...(gym === 'AFTER_FAJR' ? [{
      key: 'gym',
      icon: <Dumbbell size={16} />,
      label: 'Gym',
      time: 'After Fajr',
      desc: 'Morning workout right after Fajr prayer',
      color: '#e11d48',
      startMin: wakeMin + 45,
      endMin: wakeMin + 135,
    }] : []),
    {
      key: 'sunrise',
      icon: <Sunrise size={16} />,
      label: 'Till Sunrise',
      time: 'Sunrise Routine',
      desc: timetable.tillSunrise,
      color: '#f97316',
      startMin: wakeMin + 45,
      endMin: depMin - 90,
    },
    ...(gym === 'BEFORE_OFFICE' ? [{
      key: 'gym',
      icon: <Dumbbell size={16} />,
      label: 'Gym',
      time: 'Before Office',
      desc: 'Morning workout before heading to office',
      color: '#e11d48',
      startMin: depMin - 90,
      endMin: depMin,
    }] : []),
    {
      key: 'morning-routine',
      icon: <BookOpen size={16} />,
      label: 'Morning Routine',
      time: `Sunrise – ${formatTime(timetable.officeDeparture)}`,
      desc: timetable.sunriseTillOffice,
      color: '#10b981',
      startMin: depMin - 90,
      endMin: depMin,
    },
    {
      key: 'office',
      icon: <Briefcase size={16} />,
      label: 'Office',
      time: `${formatTime(timetable.officeDeparture)} – ${formatTime(timetable.officeReturn)}`,
      desc: 'Professional work commitments',
      color: '#6366f1',
      startMin: depMin,
      endMin: retMin,
    },
    {
      key: 'return',
      icon: <Home size={16} />,
      label: 'Back Home',
      time: formatTime(timetable.officeReturn),
      desc: 'Arrived back home',
      color: '#0ea5e9',
      startMin: retMin,
      endMin: retMin + 60,
    },
    ...(gym === 'MAGHRIB_TO_ISHA' ? [{
      key: 'gym',
      icon: <Dumbbell size={16} />,
      label: 'Gym',
      time: 'Maghrib–Isha',
      desc: 'Evening workout between prayers',
      color: '#e11d48',
      startMin: retMin + 30,
      endMin: retMin + 120,
    }] : []),
    {
      key: 'maghrib',
      icon: <Moon size={16} />,
      label: 'Maghrib–Isha',
      time: 'Maghrib',
      desc: timetable.maghribToIsha,
      color: '#8b5cf6',
      startMin: retMin + 60,
      endMin: retMin + 180,
    },
    ...(gym === 'AFTER_ISHA' ? [{
      key: 'gym',
      icon: <Dumbbell size={16} />,
      label: 'Gym',
      time: 'After Isha',
      desc: 'Evening workout after Isha prayer',
      color: '#e11d48',
      startMin: retMin + 180,
      endMin: retMin + 270,
    }] : []),
    {
      key: 'isha',
      icon: <BookOpen size={16} />,
      label: 'Isha–Hifz',
      time: 'Isha',
      desc: timetable.ishaToHifz,
      color: '#a855f7',
      startMin: retMin + 180,
      endMin: sleepMin,
    },
    {
      key: 'sleep',
      icon: <BedDouble size={16} />,
      label: 'Sleep',
      time: formatTime(timetable.sleepTime),
      desc: 'Rest & recovery',
      color: '#0ea5e9',
      startMin: sleepMin,
      endMin: sleepMin + 30,
    },
  ];

  const isActive = (slot: Slot) => nowMin >= slot.startMin && nowMin < slot.endMin;
  const activeSlot = slots.find(isActive);

  return (
    <div className="card" style={{ padding: '20px 24px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--c-primary)' }}>
          <Clock size={18} />
          Today&apos;s Time Table
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeSlot && (
            <span style={{ fontSize: '12px', fontWeight: 600, color: activeSlot.color, backgroundColor: `${activeSlot.color}18`, padding: '4px 12px', borderRadius: '20px', border: `1px solid ${activeSlot.color}40` }}>
              Now: {activeSlot.label}
            </span>
          )}
          {currentTime && (
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--c-primary)', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--c-primary-container)', padding: '4px 12px', borderRadius: '20px' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--c-primary)', borderRadius: '50%', display: 'inline-block' }} />
              {formatTime(currentTime)}
            </span>
          )}
        </div>
      </div>

      {/* Horizontal timeline cards */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 4px 20px 4px', margin: '-10px -4px -10px -4px' }}>
        {slots.map((slot, i) => {
          const active = isActive(slot);
          return (
            <div
              key={`${slot.key}-${i}`}
              style={{
                flexShrink: 0,
                minWidth: '128px',
                maxWidth: '155px',
                padding: '12px 14px',
                borderRadius: '14px',
                border: `1.5px solid ${active ? slot.color : 'var(--c-outline-variant)'}`,
                backgroundColor: active ? `${slot.color}14` : 'var(--c-surface-container-low)',
                transition: 'all 0.3s ease',
                transform: active ? 'translateY(-4px)' : 'none',
                boxShadow: active ? `0 6px 20px ${slot.color}30` : 'none',
                position: 'relative',
              }}
            >
              {active && (
                <span style={{ position: 'absolute', top: '8px', right: '8px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: slot.color, display: 'block' }} />
              )}
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: active ? slot.color : `${slot.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', color: active ? '#fff' : slot.color }}>
                {slot.icon}
              </div>
              <p style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 700, color: active ? slot.color : 'var(--c-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {slot.label}
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: active ? slot.color : 'var(--c-primary)', opacity: active ? 1 : 0.85 }}>
                {slot.time}
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--c-on-surface-variant)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {slot.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
