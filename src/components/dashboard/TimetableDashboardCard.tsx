'use client';

import { useState, useEffect } from 'react';
import { Sun, Sunrise, Briefcase, Dumbbell, BookOpen, Moon, Clock, BedDouble } from 'lucide-react';

interface TimetableData {
  wakeUpTime: string;
  tillSunrise: string;
  sunriseTillOffice: string;
  officeDeparture: string;
  officeReturn: string;
  gymMorningPreference: string;
  gymEveningPreference: string;
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

  const slots = [
    {
      key: 'wakeup',
      icon: <Sun size={16} />,
      label: 'Wake Up',
      time: formatTime(timetable.wakeUpTime),
      desc: 'Start of day',
      color: '#f59e0b',
      startMin: timeToMinutes(timetable.wakeUpTime),
      endMin: timeToMinutes(timetable.wakeUpTime) + 30,
    },
    ...(timetable.gymMorningPreference === 'AFTER_FAJR' ? [{
      key: 'gym-fajr',
      icon: <Dumbbell size={16} />,
      label: 'Gym',
      time: 'After Fajr',
      desc: 'Morning workout',
      color: '#e11d48',
      startMin: timeToMinutes(timetable.wakeUpTime) + 30,
      endMin: timeToMinutes(timetable.wakeUpTime) + 90,
    }] : []),
    {
      key: 'sunrise',
      icon: <Sunrise size={16} />,
      label: 'Till Sunrise',
      time: 'Sunrise Routine',
      desc: timetable.tillSunrise,
      color: '#f97316',
      startMin: timeToMinutes(timetable.wakeUpTime) + 30,
      endMin: timeToMinutes(timetable.officeDeparture) - 60,
    },
    ...(timetable.gymMorningPreference === 'BEFORE_OFFICE' ? [{
      key: 'gym-office',
      icon: <Dumbbell size={16} />,
      label: 'Gym',
      time: 'Before Office',
      desc: 'Morning workout',
      color: '#e11d48',
      startMin: timeToMinutes(timetable.officeDeparture) - 90,
      endMin: timeToMinutes(timetable.officeDeparture),
    }] : []),
    {
      key: 'office-leave',
      icon: <Briefcase size={16} />,
      label: 'Leave Office',
      time: formatTime(timetable.officeDeparture),
      desc: 'Depart for work',
      color: '#6366f1',
      startMin: timeToMinutes(timetable.officeDeparture),
      endMin: timeToMinutes(timetable.officeReturn),
    },
    {
      key: 'office-work',
      icon: <Briefcase size={16} />,
      label: 'Office',
      time: `${formatTime(timetable.officeDeparture)} – ${formatTime(timetable.officeReturn)}`,
      desc: 'Professional work',
      color: '#6366f1',
      startMin: timeToMinutes(timetable.officeDeparture),
      endMin: timeToMinutes(timetable.officeReturn),
    },
    {
      key: 'maghrib',
      icon: <BookOpen size={16} />,
      label: 'Maghrib–Isha',
      time: 'Maghrib',
      desc: timetable.maghribToIsha,
      color: '#8b5cf6',
      startMin: timeToMinutes(timetable.officeReturn),
      endMin: timeToMinutes(timetable.officeReturn) + 120,
    },
    ...(timetable.gymEveningPreference === 'MAGHRIB_TO_ISHA' ? [{
      key: 'gym-maghrib',
      icon: <Dumbbell size={16} />,
      label: 'Gym',
      time: 'Maghrib–Isha',
      desc: 'Evening workout',
      color: '#e11d48',
      startMin: timeToMinutes(timetable.officeReturn) + 30,
      endMin: timeToMinutes(timetable.officeReturn) + 90,
    }] : []),
    {
      key: 'isha',
      icon: <BookOpen size={16} />,
      label: 'Isha–Hifz',
      time: 'Isha',
      desc: timetable.ishaToHifz,
      color: '#a855f7',
      startMin: timeToMinutes(timetable.officeReturn) + 120,
      endMin: timeToMinutes(timetable.sleepTime) - 30,
    },
    ...(timetable.gymEveningPreference === 'AFTER_ISHA' ? [{
      key: 'gym-isha',
      icon: <Dumbbell size={16} />,
      label: 'Gym',
      time: 'After Isha',
      desc: 'Evening workout',
      color: '#e11d48',
      startMin: timeToMinutes(timetable.officeReturn) + 120,
      endMin: timeToMinutes(timetable.officeReturn) + 180,
    }] : []),
    {
      key: 'sleep',
      icon: <BedDouble size={16} />,
      label: 'Sleep',
      time: formatTime(timetable.sleepTime),
      desc: 'Rest & recovery',
      color: '#0ea5e9',
      startMin: timeToMinutes(timetable.sleepTime),
      endMin: timeToMinutes(timetable.sleepTime) + 30,
    },
  ];

  const isActive = (slot: (typeof slots)[0]) =>
    nowMin >= slot.startMin && nowMin < slot.endMin;

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
              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--c-primary)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              {formatTime(currentTime)}
            </span>
          )}
        </div>
      </div>

      {/* Horizontal timeline cards */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
        {slots.map((slot, i) => {
          const active = isActive(slot);
          return (
            <div
              key={`${slot.key}-${i}`}
              style={{
                flexShrink: 0,
                minWidth: '130px',
                maxWidth: '160px',
                padding: '12px 14px',
                borderRadius: '14px',
                border: `1.5px solid ${active ? slot.color : 'var(--c-outline-variant)'}`,
                backgroundColor: active ? `${slot.color}14` : 'var(--c-surface-container-low)',
                transition: 'all 0.3s ease',
                transform: active ? 'translateY(-3px)' : 'none',
                boxShadow: active ? `0 4px 16px ${slot.color}30` : 'none',
                position: 'relative',
              }}
            >
              {/* Active indicator dot */}
              {active && (
                <span style={{ position: 'absolute', top: '8px', right: '8px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: slot.color, display: 'block' }} />
              )}

              {/* Icon */}
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: active ? slot.color : `${slot.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', color: active ? '#fff' : slot.color }}>
                {slot.icon}
              </div>

              {/* Label */}
              <p style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 700, color: active ? slot.color : 'var(--c-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {slot.label}
              </p>

              {/* Time */}
              <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: active ? slot.color : 'var(--c-primary)', opacity: active ? 1 : 0.85 }}>
                {slot.time}
              </p>

              {/* Description */}
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
