'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { updateTimeTable, updateUserLocation, updateCalculationMethod } from '@/actions/timetable';
import { useToast } from '@/context/ToastContext';
import { Sun, Briefcase, Home, Dumbbell, BookOpen, Moon, Clock, Sunrise, MapPin, Edit3, X } from 'lucide-react';

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
    hifzClassTime: string;
    latitude?: number | null;
    longitude?: number | null;
    locationName?: string | null;
    calculationMethod?: number;
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

function formatTime(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

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
        onClick={(e) => {
          try {
            if ('showPicker' in e.currentTarget) {
              (e.currentTarget as any).showPicker();
            }
          } catch (err) {}
        }}
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

const calculationMethods = [
  { id: 1, name: 'University of Islamic Sciences, Karachi' },
  { id: 2, name: 'Islamic Society of North America (ISNA)' },
  { id: 3, name: 'Muslim World League (MWL)' },
  { id: 4, name: 'Umm Al-Qura University, Makkah' },
  { id: 5, name: 'Egyptian General Authority of Survey' },
  { id: 7, name: 'Institute of Geophysics, University of Tehran' },
  { id: 12, name: 'Union Organisation Islamique de France' },
  { id: 13, name: 'Diyanet İşleri Başkanlığı, Turkey' },
  { id: 14, name: 'Spiritual Administration of Muslims of Russia' }
];

export default function TimetableForm({ initialData }: TimetableFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [locLoading, setLocLoading] = useState(false);
  const [hasLocation, setHasLocation] = useState(!!initialData.latitude);
  const [locationName, setLocationName] = useState<string | null>(initialData.locationName || null);
  
  const [editingTiming, setEditingTiming] = useState<{ key: string; label: string; icon: React.ReactNode; value: string } | null>(null);
  const [timingsLoading, setTimingsLoading] = useState(false);
  
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [selectedGym, setSelectedGym] = useState(initialData.gymPreference || 'NONE');
  const [gymSaving, setGymSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          let friendlyName: string | null = null;
          try {
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            const geoData = await geoRes.json();
            if (geoData) {
              const city = geoData.city || geoData.locality || geoData.principalSubdivision;
              const country = geoData.countryName;
              friendlyName = city ? `${city}, ${country}` : country || null;
            }
          } catch (e) {
            console.error('Failed to reverse geocode', e);
          }

          const res = await updateUserLocation(lat, lon, friendlyName);
          if (res.success) {
            setHasLocation(true);
            setLocationName(friendlyName);
            showToast(res.success, 'success');
            router.refresh();
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

  const handleTimingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTimingsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateTimeTable(formData);
      if (res.success) {
        showToast('Daily timings updated successfully.', 'success');
        setEditingTiming(null);
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      showToast(message, 'error');
    } finally {
      setTimingsLoading(false);
    }
  };

  const handleGymClick = (val: string) => {
    setSelectedGym(val);
  };

  const handleGymSave = async () => {
    setGymSaving(true);
    const fd = new FormData();
    fd.append('gymPreference', selectedGym);
    try {
      const res = await updateTimeTable(fd);
      if (res.success) {
        showToast('Gym preference updated successfully.', 'success');
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update gym preference', 'error');
    } finally {
      setGymSaving(false);
    }
  };

  const handleActivitiesSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActivitiesLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateTimeTable(formData);
      if (res.success) {
        showToast('Routine activities updated successfully.', 'success');
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update activities', 'error');
    } finally {
      setActivitiesLoading(false);
    }
  };

  const sectionHeader = (icon: React.ReactNode, title: string, subtitle: string, rightElement?: React.ReactNode) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--c-primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--c-on-surface)' }}>{title}</h3>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--c-on-surface-variant)' }}>{subtitle}</p>
        </div>
      </div>
      {rightElement}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Location for Prayer Times */}
      <div className="card" style={{ padding: '24px' }}>
        {sectionHeader(<MapPin size={18} />, 'Prayer Times Location', 'Set your location to automatically fetch Shafi prayer timings')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--c-surface-container-low)', padding: '16px', borderRadius: '12px', border: '1px solid var(--c-outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: 'var(--c-on-surface)' }}>
                {hasLocation ? `✅ Location: ${locationName || 'Detected Coordinates'}` : '❌ Location not set'}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--c-on-surface-variant)' }}>
                {hasLocation ? `We will automatically adjust your timetable slots based on prayer times for ${locationName || 'your coordinates'}.` : 'We need your location to fetch accurate prayer times.'}
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

          {/* Calculation Method Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Clock size={13} /> Calculation Method (For timing accuracy)
            </label>
            <select
              value={initialData.calculationMethod ?? 1}
              onChange={async (e) => {
                const val = Number(e.target.value);
                try {
                  const res = await updateCalculationMethod(val);
                  if (res.success) {
                    showToast(res.success, 'success');
                    router.refresh();
                  }
                } catch (err: any) {
                  showToast(err.message || 'Failed to update method', 'error');
                }
              }}
              className="search-input"
              style={{ borderRadius: '10px', fontWeight: 600, fontSize: '14px', padding: '10px 14px', width: '100%', maxWidth: '350px', backgroundColor: 'var(--c-surface-container-high)', border: '1px solid var(--c-outline-variant)' }}
            >
              {calculationMethods.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Daily Timings (Time-Based Events) */}
      <div className="card" style={{ padding: '24px' }}>
        {sectionHeader(
          <Clock size={18} />, 
          'Daily Timings', 
          'Key time anchors for the day (Click the pencil to edit one)'
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { key: 'wakeUpTime',       label: 'Wake Up Time',         val: initialData.wakeUpTime,       icon: <Sun size={15} color="#f59e0b" /> },
            { key: 'officeDeparture',  label: 'Leave for Office',     val: initialData.officeDeparture,  icon: <Briefcase size={15} color="#6366f1" /> },
            { key: 'officeReturn',     label: 'Return from Office',   val: initialData.officeReturn,     icon: <Home size={15} color="#0ea5e9" /> },
            { key: 'hifzClassTime',    label: 'Hifz Class Time',      val: initialData.hifzClassTime,    icon: <BookOpen size={15} color="#a855f7" /> },
            { key: 'sleepTime',        label: 'Sleep Time',           val: initialData.sleepTime,        icon: <Moon size={15} color="#10b981" /> }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--c-outline-variant)', backgroundColor: 'var(--c-surface-container-low)', position: 'relative' }}
            >
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--c-surface-container-highest)', display: 'flex' }}>
                {item.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {item.label}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--c-on-surface)' }}>
                  {formatTime(item.val)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingTiming({ key: item.key, label: item.label, icon: item.icon, value: item.val })}
                style={{ padding: '5px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'var(--c-on-surface-variant)', display: 'flex', flexShrink: 0, transition: 'color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-on-surface-variant)'; }}
                title={`Edit ${item.label}`}
              >
                <Edit3 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Routine Activities */}
      <form onSubmit={handleActivitiesSubmit} className="card" style={{ padding: '24px' }}>
        {sectionHeader(<BookOpen size={18} />, 'Routine Activities', 'Describe what you do in each time block')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
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
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="primary-btn" disabled={activitiesLoading} style={{ padding: '10px 24px', fontSize: '13px' }}>
            {activitiesLoading ? 'Saving...' : 'Save Routine Activities'}
          </button>
        </div>
      </form>

      {/* Gym Preference — single choice from all 4 slots */}
      <div className="card" style={{ padding: '24px' }}>
        {sectionHeader(<Dumbbell size={18} />, 'Gym Preference', 'Choose one time slot for your gym session')}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            {gymOptions.map((opt) => {
              const isSelected = selectedGym === opt.value;
              const badgeColor = opt.badge === 'Morning' ? '#f97316' : opt.badge === 'Evening' ? '#8b5cf6' : 'transparent';
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleGymClick(opt.value)}
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

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={handleGymSave} 
              className="primary-btn" 
              disabled={gymSaving} 
              style={{ padding: '10px 24px', fontSize: '13px' }}
            >
              {gymSaving ? 'Saving...' : 'Save Gym Preference'}
            </button>
          </div>
        </div>
      </div>

      {/* Single Timing Edit Modal */}
      {editingTiming && mounted && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setEditingTiming(null)}
        >
          <form
            onSubmit={handleTimingsSubmit}
            className="card"
            style={{ position: 'relative', width: '100%', maxWidth: '380px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--c-outline-variant)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setEditingTiming(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)', display: 'flex' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--c-on-surface)', paddingRight: '28px' }}>
              Edit — {editingTiming.label}
            </h3>

            <TimeInput
              name={editingTiming.key}
              label={editingTiming.label}
              icon={editingTiming.icon}
              defaultValue={editingTiming.value}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setEditingTiming(null)}
                style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--c-on-surface-variant)', border: '1px solid var(--c-outline-variant)', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-btn"
                disabled={timingsLoading}
                style={{ padding: '10px 24px', borderRadius: '8px' }}
              >
                {timingsLoading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

    </div>
  );
}
