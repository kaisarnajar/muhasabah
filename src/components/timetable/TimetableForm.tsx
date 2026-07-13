'use client';

import { useState } from 'react';
import { updateTimeTable, updateUserLocation } from '@/actions/timetable';
import { useToast } from '@/context/ToastContext';
import { Sun, Briefcase, Home, Dumbbell, BookOpen, Moon, Clock, Sunrise, MapPin } from 'lucide-react';

interface TimetableFormProps {
  initialData: {
    wakeUpTime: string;
    tillSunrise: string;
    sunriseTillOffice: string;
    officeDeparture: string;
    officeReturn: string;
    gymPreference: string;
    maghribToIsha: string;
    ishaToHifz: string;
    sleepTime: string;
    latitude?: number | null;
    longitude?: number | null;
  };
}

const gymOptions = [
  {
    value: 'NONE',
    label: 'No Gym',
    desc: 'Skip gym for now',
    icon: '🚫',
    badge: '',
  },
  {
    value: 'AFTER_FAJR',
    label: 'Right after Fajr',
    desc: 'Workout immediately after Fajr prayer',
    icon: '🌙',
    badge: 'Morning',
  },
  {
    value: 'BEFORE_OFFICE',
    label: 'Before leaving Office',
    desc: 'Workout just before heading to office',
    icon: '🌅',
    badge: 'Morning',
  },
  {
    value: 'MAGHRIB_TO_ISHA',
    label: 'Maghrib to Isha',
    desc: 'Workout between Maghrib & Isha prayers',
    icon: '🌆',
    badge: 'Evening',
  },
  {
    value: 'AFTER_ISHA',
    label: 'After Isha',
    desc: 'Workout after Isha till Hifz class',
    icon: '🌙',
    badge: 'Evening',
  },
];

function TimeInput({ name, label, icon, defaultValue, required = true }: {
  name: string; label: string; icon: React.ReactNode; defaultValue: string; required?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--c-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {icon} {label}
      </label>
      <input
        type="time"
        name={name}
        defaultValue={defaultValue}
        className="search-input"
        style={{ borderRadius: '10px', fontWeight: 600, fontSize: '15px' }}
        required={required}
      />
    </div>
  );
}

function TextAreaInput({ name, label, icon, defaultValue, placeholder }: {
  name: string; label: string; icon: React.ReactNode; defaultValue: string; placeholder?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--c-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {icon} {label}
      </label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        className="search-input"
        style={{ borderRadius: '10px', minHeight: '80px', resize: 'vertical', lineHeight: 1.6 }}
        placeholder={placeholder}
      />
    </div>
  );
}

function GymOptionCards({ defaultValue }: { defaultValue: string }) {
  const [selected, setSelected] = useState(defaultValue || 'NONE');

  return (
    <div>
      <input type="hidden" name="gymPreference" value={selected} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
        {gymOptions.map((opt) => {
          const isSelected = selected === opt.value;
          const badgeColor = opt.badge === 'Morning' ? '#f97316' : opt.badge === 'Evening' ? '#8b5cf6' : 'transparent';
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              style={{
                padding: '16px',
                borderRadius: '14px',
                border: `2px solid ${isSelected ? 'var(--c-primary)' : 'var(--c-outline-variant)'}`,
                backgroundColor: isSelected ? 'var(--c-primary-container)' : 'var(--c-surface-container-low)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                transform: isSelected ? 'translateY(-3px)' : 'none',
                boxShadow: isSelected ? '0 6px 20px rgba(191,145,41,0.28)' : 'none',
                position: 'relative',
              }}
            >
              {opt.badge && (
                <span style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  fontSize: '9px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: badgeColor,
                  backgroundColor: `${badgeColor}18`,
                  border: `1px solid ${badgeColor}40`,
                  padding: '2px 7px',
                  borderRadius: '20px',
                }}>
                  {opt.badge}
                </span>
              )}

              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{opt.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? 'var(--c-primary)' : 'var(--c-on-surface)', marginBottom: '4px' }}>
                {opt.label}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', lineHeight: 1.4 }}>
                {opt.desc}
              </div>

              {isSelected && (
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--c-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TimetableForm({ initialData }: TimetableFormProps) {
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [hasLocation, setHasLocation] = useState(!!initialData.latitude);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateTimeTable(formData);
      if (res.success) showToast(res.success, 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await updateUserLocation(position.coords.latitude, position.coords.longitude);
          if (res.success) {
            setHasLocation(true);
            showToast(res.success, 'success');
          }
        } catch (err: any) {
          showToast(err.message || 'Failed to update location', 'error');
        } finally {
          setLocLoading(false);
        }
      },
      (error) => {
        setLocLoading(false);
        showToast('Unable to retrieve your location. Please check browser permissions.', 'error');
      }
    );
  };

  const sectionHeader = (icon: React.ReactNode, title: string, subtitle: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--c-primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--c-on-surface)' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--c-on-surface-variant)' }}>{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Location for Prayer Times */}
      <div className="card" style={{ padding: '24px' }}>
        {sectionHeader(<MapPin size={18} />, 'Prayer Times Location', 'Set your location to automatically fetch Shafi prayer timings')}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', backgroundColor: 'var(--c-surface-container-low)', padding: '16px', borderRadius: '12px', border: '1px solid var(--c-outline-variant)' }}>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: 'var(--c-on-surface)' }}>
              {hasLocation ? '✅ Location is set' : '❌ Location not set'}
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--c-on-surface-variant)' }}>
              {hasLocation ? 'We will automatically adjust your timetable slots based on daily prayer times.' : 'We need your location to fetch accurate prayer times.'}
            </p>
          </div>
          <button 
            type="button" 
            onClick={handleGetLocation} 
            disabled={locLoading}
            className="secondary-btn" 
            style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
          >
            <MapPin size={14} />
            {locLoading ? 'Detecting...' : hasLocation ? 'Update Location' : 'Set Location'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Daily Timings */}
        <div className="card" style={{ padding: '24px' }}>
          {sectionHeader(<Clock size={18} />, 'Daily Timings', 'Set your key time anchors for the day')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            <TimeInput name="wakeUpTime" label="Wake Up Time" icon={<Sun size={13} />} defaultValue={initialData.wakeUpTime} />
            <TimeInput name="officeDeparture" label="Leave for Office" icon={<Briefcase size={13} />} defaultValue={initialData.officeDeparture} />
            <TimeInput name="officeReturn" label="Return from Office" icon={<Home size={13} />} defaultValue={initialData.officeReturn} />
            <TimeInput name="sleepTime" label="Sleep Time" icon={<Moon size={13} />} defaultValue={initialData.sleepTime} />
          </div>
        </div>

        {/* Routine Activities */}
        <div className="card" style={{ padding: '24px' }}>
          {sectionHeader(<BookOpen size={18} />, 'Routine Activities', 'Describe what you do in each time block')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextAreaInput
              name="tillSunrise"
              label="What to do till Sunrise"
              icon={<Sunrise size={13} />}
              defaultValue={initialData.tillSunrise}
              placeholder="e.g., Quran recitation, Morning Adhkar, Fajr prayer, Dhikr..."
            />
            <TextAreaInput
              name="sunriseTillOffice"
              label="What to do from Sunrise till leaving Office"
              icon={<Sun size={13} />}
              defaultValue={initialData.sunriseTillOffice}
              placeholder="e.g., Reading, Quran memorisation, breakfast, getting ready..."
            />
            <TextAreaInput
              name="maghribToIsha"
              label="What to do from Maghrib to Isha"
              icon={<BookOpen size={13} />}
              defaultValue={initialData.maghribToIsha}
              placeholder="e.g., Quran recitation, family time, review of the day..."
            />
            <TextAreaInput
              name="ishaToHifz"
              label="What to do from Isha till Quran Hifz Class"
              icon={<Moon size={13} />}
              defaultValue={initialData.ishaToHifz}
              placeholder="e.g., Dinner, revising Quran portions, Hifz class preparation..."
            />
          </div>
        </div>

        {/* Gym Preference — single choice from all 4 slots */}
        <div className="card" style={{ padding: '24px' }}>
          {sectionHeader(<Dumbbell size={18} />, 'Gym Preference', 'Choose one time slot for your gym session')}
          <GymOptionCards defaultValue={initialData.gymPreference} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="primary-btn" disabled={loading} style={{ padding: '13px 36px', fontSize: '14px' }}>
            {loading ? 'Saving…' : '💾  Save Time Table'}
          </button>
        </div>
      </form>
    </div>
  );
}

