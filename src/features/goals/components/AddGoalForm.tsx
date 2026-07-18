'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';
import { addGoal } from '@/actions/index';
import { GoalCategory } from '@prisma/client';

export function AddGoalForm({ activeCategory }: { activeCategory: GoalCategory | 'ALL' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="primary-btn" 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px', marginBottom: '24px' }}
      >
        <Plus size={20} /> Create New Goal
      </button>

      {isOpen && mounted && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div 
            className="card" 
            style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>New Goal</h3>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}>
                <X size={20} />
              </button>
            </div>

            <form 
              action={async (formData) => {
                await addGoal(formData);
                setIsOpen(false);
              }} 
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="text-label-sm text-on-surface-variant" style={{ fontWeight: 600 }}>Goal Title</label>
                <input 
                  type="text" 
                  name="title"
                  placeholder="e.g. Read the entire Quran" 
                  className="search-input"
                  required 
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="text-label-sm text-on-surface-variant" style={{ fontWeight: 600 }}>Category</label>
                  <select 
                    name="category" 
                    defaultValue={activeCategory === 'ALL' ? 'RELIGIOUS' : activeCategory} 
                    className="search-input" 
                    style={{ width: '100%', borderRadius: '8px' }}
                  >
                    <option value="RELIGIOUS">Religious</option>
                    <option value="CAREER">Career</option>
                    <option value="FINANCES">Finances</option>
                    <option value="HEALTH">Health & Fitness</option>
                    <option value="PERSONAL">Personal</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="text-label-sm text-on-surface-variant" style={{ fontWeight: 600 }}>Priority</label>
                  <select name="priority" className="search-input" style={{ width: '100%', borderRadius: '8px' }}>
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM" defaultValue="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="text-label-sm text-on-surface-variant" style={{ fontWeight: 600 }}>Description (Optional)</label>
                <input 
                  type="text" 
                  name="description"
                  placeholder="Additional details..." 
                  className="search-input"
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="text-label-sm text-on-surface-variant" style={{ fontWeight: 600 }}>Target Date (Optional)</label>
                <input 
                  type="date" 
                  name="targetDate"
                  className="search-input"
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--c-on-surface-variant)', border: '1px solid var(--c-outline-variant)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn" style={{ padding: '10px 24px', borderRadius: '8px' }}>
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
