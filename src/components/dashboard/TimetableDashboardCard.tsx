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
  hifzClassTime: string;
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

export default function TimetableDashboardCard({ timetable, prayerTimes }: { timetable: TimetableData, prayerTimes?: Record<string, string> | null }) {
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
  const hifzClassMin = timeToMinutes(timetable.hifzClassTime);

  // Extract prayer times safely (Aladhan API sometimes returns "05:12 (IST)", so we substring)
  const getPT = (name: string) => prayerTimes?.[name] ? timeToMinutes(prayerTimes[name].substring(0, 5)) : null;
  const getPTFmt = (name: string) => prayerTimes?.[name] ? formatTime(prayerTimes[name].substring(0, 5)) : null;

  const fajrMin = getPT('Fajr') || wakeMin + 45;
  const sunriseMin = getPT('Sunrise') || depMin - 90;
  const maghribMin = getPT('Maghrib') || retMin + 60;
  const ishaMin = getPT('Isha') || retMin + 180;

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

  const morningSlots: Slot[] = [];

  if (fajrMin < wakeMin) {
    morningSlots.push({
      key: 'fajr-prayer',
      icon: <Clock size={16} />,
      label: 'Fajr Prayer',
      time: getPTFmt('Fajr') || 'Fajr',
      desc: 'Praying Fajr at dawn',
      color: '#3b82f6',
      startMin: fajrMin,
      endMin: Math.min(fajrMin + 30, wakeMin),
    });
    
    const wakeEnd = wakeMin < sunriseMin ? sunriseMin : wakeMin + 30;
    morningSlots.push({
      key: 'wakeup',
      icon: <Sun size={16} />,
      label: 'Wake Up',
      time: formatTime(timetable.wakeUpTime),
      desc: 'Wake up and prepare for the day',
      color: '#f59e0b',
      startMin: wakeMin,
      endMin: wakeEnd,
    });
    
    if (wakeMin < sunriseMin) {
      morningSlots.push({
        key: 'sunrise',
        icon: <Sunrise size={16} />,
        label: 'Till Sunrise',
        time: getPTFmt('Sunrise') ? `Till Sunrise (${getPTFmt('Sunrise')})` : 'Sunrise Routine',
        desc: timetable.tillSunrise,
        color: '#f97316',
        startMin: Math.max(wakeMin, sunriseMin - 15),
        endMin: sunriseMin,
      });
    }
  } else {
    morningSlots.push({
      key: 'wakeup',
      icon: <Sun size={16} />,
      label: 'Wake Up',
      time: formatTime(timetable.wakeUpTime),
      desc: 'Wake up and prepare for Fajr',
      color: '#f59e0b',
      startMin: wakeMin,
      endMin: fajrMin,
    });
    morningSlots.push({
      key: 'fajr-prayer',
      icon: <Clock size={16} />,
      label: 'Fajr Prayer',
      time: getPTFmt('Fajr') || 'Fajr',
      desc: 'Praying Fajr and early morning adhkar',
      color: '#3b82f6',
      startMin: fajrMin,
      endMin: Math.min(fajrMin + 30, sunriseMin),
    });
    morningSlots.push({
      key: 'sunrise',
      icon: <Sunrise size={16} />,
      label: 'Till Sunrise',
      time: getPTFmt('Sunrise') ? `Till Sunrise (${getPTFmt('Sunrise')})` : 'Sunrise Routine',
      desc: timetable.tillSunrise,
      color: '#f97316',
      startMin: Math.min(fajrMin + 30, sunriseMin),
      endMin: sunriseMin,
    });
  }

  const slots: Slot[] = [
    ...morningSlots,
    ...(gym === 'AFTER_FAJR' ? [{
      key: 'gym',
      icon: <Dumbbell size={16} />,
      label: 'Gym (At Sunrise)',
      time: getPTFmt('Sunrise') ? `Sunrise (${getPTFmt('Sunrise')})` : 'At Sunrise',
      desc: 'Morning workout at sunrise for 1 hour',
      color: '#e11d48',
      startMin: sunriseMin,
      endMin: sunriseMin + 60,
    }] : []),
    {
      key: 'morning-routine',
      icon: <BookOpen size={16} />,
      label: 'Morning Routine',
      time: getPTFmt('Sunrise') ? `${getPTFmt('Sunrise')} – ${formatTime(timetable.officeDeparture)}` : `Sunrise – ${formatTime(timetable.officeDeparture)}`,
      desc: timetable.sunriseTillOffice,
      color: '#10b981',
      startMin: gym === 'AFTER_FAJR' ? sunriseMin + 60 : sunriseMin,
      endMin: gym === 'BEFORE_OFFICE' ? depMin - 60 : depMin,
    },
    ...(gym === 'BEFORE_OFFICE' ? [{
      key: 'gym',
      icon: <Dumbbell size={16} />,
      label: 'Gym (Before Office)',
      time: '1 hr before office',
      desc: 'Morning workout before heading to office',
      color: '#e11d48',
      startMin: depMin - 60,
      endMin: depMin,
    }] : []),
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
      endMin: maghribMin,
    },
    ...(prayerTimes ? [{
      key: 'dhuhr',
      icon: <Clock size={16} />,
      label: 'Dhuhr Prayer',
      time: getPTFmt('Dhuhr') || 'Dhuhr',
      desc: 'Midday prayer — break from work',
      color: '#3b82f6',
      startMin: getPT('Dhuhr') || depMin + 180,
      endMin: (getPT('Dhuhr') || depMin + 180) + 20,
    }] : []),
    ...(prayerTimes ? [{
      key: 'asr',
      icon: <Clock size={16} />,
      label: 'Asr Prayer',
      time: getPTFmt('Asr') || 'Asr',
      desc: 'Afternoon prayer — pause & reflect',
      color: '#f97316',
      startMin: getPT('Asr') || retMin - 90,
      endMin: (getPT('Asr') || retMin - 90) + 20,
    }] : []),
    ...(gym === 'MAGHRIB_TO_ISHA' ? [{
      key: 'gym',
      icon: <Dumbbell size={16} />,
      label: 'Gym (Maghrib–Isha)',
      time: 'Between prayers',
      desc: 'Evening workout between Maghrib and Isha',
      color: '#e11d48',
      startMin: maghribMin,
      endMin: maghribMin + 60,
    }] : []),
    {
      key: 'maghrib-prayer',
      icon: <Clock size={16} />,
      label: 'Maghrib Prayer',
      time: getPTFmt('Maghrib') || 'Maghrib',
      desc: 'Sunset prayer — gratitude for the day',
      color: '#8b5cf6',
      startMin: maghribMin,
      endMin: maghribMin + 15,
    },
    {
      key: 'maghrib',
      icon: <Moon size={16} />,
      label: 'Maghrib–Isha',
      time: (getPTFmt('Maghrib') && getPTFmt('Isha')) ? `${getPTFmt('Maghrib')} – ${getPTFmt('Isha')}` : 'Maghrib',
      desc: timetable.maghribToIsha,
      color: '#8b5cf6',
      startMin: gym === 'MAGHRIB_TO_ISHA' ? maghribMin + 60 : maghribMin + 15,
      endMin: ishaMin,
    },
    {
      key: 'isha-prayer',
      icon: <Clock size={16} />,
      label: 'Isha Prayer',
      time: getPTFmt('Isha') || 'Isha',
      desc: 'Night prayer — close the day with worship',
      color: '#6366f1',
      startMin: ishaMin,
      endMin: ishaMin + 20,
    },
    ...(gym === 'AFTER_ISHA' ? [{
      key: 'gym',
      icon: <Dumbbell size={16} />,
      label: 'Gym (After Isha)',
      time: getPTFmt('Isha') ? `Isha – 10:00 PM` : 'After Isha',
      desc: 'Evening workout before Hifz class',
      color: '#e11d48',
      startMin: ishaMin + 20,
      endMin: hifzClassMin,
    }] : []),
    {
      key: 'isha',
      icon: <BookOpen size={16} />,
      label: 'Isha–Hifz',
      time: getPTFmt('Isha') ? (gym === 'AFTER_ISHA' ? `10:00 PM onwards` : `${getPTFmt('Isha')} onwards`) : 'Isha',
      desc: timetable.ishaToHifz,
      color: '#a855f7',
      startMin: gym === 'AFTER_ISHA' ? hifzClassMin : ishaMin + 20,
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

      {/* Timeline cards grid wrapper */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '8px 0' }}>
        {slots.map((slot, i) => {
          const active = isActive(slot);
          return (
            <div
              key={`${slot.key}-${i}`}
              style={{
                flex: '1 1 calc(12.5% - 12px)',
                minWidth: '135px',
                padding: '12px 14px',
                borderRadius: '14px',
                border: `1.5px solid ${active ? slot.color : 'var(--c-outline-variant)'}`,
                backgroundColor: active ? `${slot.color}14` : 'var(--c-surface-container-low)',
                transition: 'all 0.3s ease',
                transform: active ? 'translateY(-2px)' : 'none',
                boxShadow: active ? `0 4px 12px ${slot.color}25` : 'none',
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
