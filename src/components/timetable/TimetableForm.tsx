'use client';

import { useState } from 'react';
import { updateTimeTable } from '@/actions/timetable';
import { useToast } from '@/context/ToastContext';
import { Sun, Briefcase, Home, Dumbbell, BookOpen, Moon, Clock, Sunrise } from 'lucide-react';

interface TimetableFormProps {
  initialData: {
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
  };
}

const gymMorningOptions = [
  { value: 'NONE', label: 'No Gym in Morning', desc: 'Skip morning workout', icon: '🚫' },
  { value: 'AFTER_FAJR', label: 'Right after Fajr', desc: 'Workout immediately after Fajr prayer', icon: '🌙' },
  { value: 'BEFORE_OFFICE', label: 'Before leaving Office', desc: 'Workout just before heading to office', icon: '🌅' },
];

const gymEveningOptions = [
  { value: 'NONE', label: 'No Gym in Evening', desc: 'Skip evening workout', icon: '🚫' },
  { value: 'MAGHRIB_TO_ISHA', label: 'Maghrib to Isha', desc: 'Workout between Maghrib & Isha prayers', icon: '🌆' },
  { value: 'AFTER_ISHA', label: 'After Isha', desc: 'Workout after Isha till Hifz class', icon: '🌙' },
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

function GymOptionCards({ name, options, defaultValue }: {
  name: string;
  options: typeof gymMorningOptions;
  defaultValue: string;
}) {
  const [selected, setSelected] = useState(defaultValue || options[0].value);
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <input type="hidden" name={name} value={selected} />
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSelected(opt.value)}
            style={{
              flex: '1 1 140px',
              padding: '14px 16px',
              borderRadius: '12px',
              border: `2px solid ${isSelected ? 'var(--c-primary)' : 'var(--c-outline-variant)'}`,
              backgroundColor: isSelected ? 'var(--c-primary-container)' : 'var(--c-surface-container-low)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              transform: isSelected ? 'translateY(-2px)' : 'none',
              boxShadow: isSelected ? '0 4px 12px rgba(191,145,41,0.25)' : 'none',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{opt.icon}</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? 'var(--c-primary)' : 'var(--c-on-surface)', marginBottom: '2px' }}>
              {opt.label}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', lineHeight: 1.4 }}>
              {opt.desc}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function TimetableForm({ initialData }: TimetableFormProps) {
  const [loading, setLoading] = useState(false);
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Row 1: Daily Timings */}
      <div className="card" style={{ padding: '24px' }}>
        {sectionHeader(<Clock size={18} />, 'Daily Timings', 'Set your key time anchors for the day')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          <TimeInput name="wakeUpTime" label="Wake Up Time" icon={<Sun size={13} />} defaultValue={initialData.wakeUpTime} />
          <TimeInput name="officeDeparture" label="Leave for Office" icon={<Briefcase size={13} />} defaultValue={initialData.officeDeparture} />
          <TimeInput name="officeReturn" label="Return from Office" icon={<Home size={13} />} defaultValue={initialData.officeReturn} />
          <TimeInput name="sleepTime" label="Sleep Time" icon={<Moon size={13} />} defaultValue={initialData.sleepTime} />
        </div>
      </div>

      {/* Row 2: Routine Activities */}
      <div className="card" style={{ padding: '24px' }}>
        {sectionHeader(<BookOpen size={18} />, 'Routine Activities', 'Describe what you do in each time block')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextAreaInput
            name="tillSunrise"
            label="2. What to do till Sunrise"
            icon={<Sunrise size={13} />}
            defaultValue={initialData.tillSunrise}
            placeholder="e.g., Quran recitation, Morning Adhkar, Fajr prayer, Dhikr..."
          />
          <TextAreaInput
            name="sunriseTillOffice"
            label="3. What to do from Sunrise till leaving Office"
            icon={<Sun size={13} />}
            defaultValue={initialData.sunriseTillOffice}
            placeholder="e.g., Reading, Quran memorisation, breakfast, getting ready..."
          />
          <TextAreaInput
            name="maghribToIsha"
            label="7. What to do from Maghrib to Isha"
            icon={<BookOpen size={13} />}
            defaultValue={initialData.maghribToIsha}
            placeholder="e.g., Quran recitation, family time, review of the day..."
          />
          <TextAreaInput
            name="ishaToHifz"
            label="8. What to do from Isha till Quran Hifz Class"
            icon={<Moon size={13} />}
            defaultValue={initialData.ishaToHifz}
            placeholder="e.g., Dinner, revising Quran portions, Hifz class preparation..."
          />
        </div>
      </div>

      {/* Row 3: Gym Preferences */}
      <div className="card" style={{ padding: '24px' }}>
        {sectionHeader(<Dumbbell size={18} />, 'Gym Preferences', 'Choose when you want to hit the gym')}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Morning */}
          <div>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700, color: 'var(--c-on-surface)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🌅 Morning Gym (Q. 5) — Right after Fajr or Before Office?
            </p>
            <GymOptionCards name="gymMorningPreference" options={gymMorningOptions} defaultValue={initialData.gymMorningPreference} />
          </div>

          <div style={{ height: '1px', background: 'var(--c-outline-variant)' }} />

          {/* Evening */}
          <div>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700, color: 'var(--c-on-surface)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🌆 Evening Gym (Q. 6) — Maghrib to Isha or After Isha?
            </p>
            <GymOptionCards name="gymEveningPreference" options={gymEveningOptions} defaultValue={initialData.gymEveningPreference} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="primary-btn" disabled={loading} style={{ padding: '13px 36px', fontSize: '14px' }}>
          {loading ? 'Saving…' : '💾  Save Time Table'}
        </button>
      </div>
    </form>
  );
}
