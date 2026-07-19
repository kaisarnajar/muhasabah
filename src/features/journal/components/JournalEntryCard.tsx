'use client';

import { useState } from 'react';
import { JournalEntry, JournalCategory } from '@prisma/client';
import { Calendar, GraduationCap, MapPin, Pin } from 'lucide-react';
import { getWorkTypeStyle, getSubjectColor, getMiscActivityStyle } from './utils';
import { togglePinJournalEntry } from '@/features/journal/actions';
import { useToast } from '@/context/ToastContext';

interface Props {
  entry: JournalEntry;
  category: JournalCategory;
  onClick: (entry: JournalEntry) => void;
}

export default function JournalEntryCard({ entry, category, onClick }: Props) {
  const { showToast } = useToast();
  const [isPinning, setIsPinning] = useState(false);

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinning(true);
    try {
      await togglePinJournalEntry(entry.id);
      showToast(entry.isPinned ? 'Unpinned entry' : 'Pinned entry to top', 'success');
    } catch {
      showToast('Failed to toggle pin', 'error');
    } finally {
      setIsPinning(false);
    }
  };

  const renderCardContent = () => {
    if (category === 'OFFICE') {
      const typeStyle = getWorkTypeStyle(entry.workType || 'Other');
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', paddingRight: '20px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--c-on-surface)', wordBreak: 'break-word', lineHeight: 1.4 }}>
              {entry.project || 'General Work'}
            </h4>
            <span style={{ 
              fontSize: '10px', 
              fontWeight: 700, 
              padding: '2px 8px', 
              borderRadius: '20px', 
              backgroundColor: typeStyle.bg,
              color: typeStyle.text,
              border: `1.5px solid ${typeStyle.border}`,
              whiteSpace: 'nowrap',
              textTransform: 'uppercase'
            }}>
              {entry.workType || 'Other'}
            </span>
          </div>

          {(entry.ticketId || entry.duration) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11px', fontWeight: 600, color: 'var(--c-on-surface-variant)', opacity: 0.85 }}>
              {entry.ticketId && <span>🎫 {entry.ticketId}</span>}
              {entry.duration && <span>⏱️ {entry.duration}</span>}
            </div>
          )}

          <p className="text-body-md" style={{ 
            whiteSpace: 'pre-wrap', 
            lineHeight: 1.6, 
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word',
            color: 'var(--c-on-surface-variant)',
            fontSize: '13px'
          }}>{entry.content}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '10px', marginTop: 'auto' }}>
            <Calendar size={12} color="var(--c-on-surface-variant)" style={{ opacity: 0.7 }} />
            <span className="text-label-sm text-on-surface-variant" style={{ textTransform: 'none', fontWeight: 600, fontSize: '11px' }}>
              {new Date(entry.date || entry.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      );
    } else if (category === 'LEARNING') {
      const colors = entry.subject ? getSubjectColor(entry.subject) : null;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingRight: '20px' }}>
            {entry.subject ? (
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                padding: '4px 10px', 
                borderRadius: '20px', 
                backgroundColor: colors?.bg,
                color: colors?.text,
                border: `1.5px solid ${colors?.border}`,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {entry.subject}
              </span>
            ) : (
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                padding: '4px 10px', 
                borderRadius: '20px', 
                backgroundColor: 'var(--c-surface-container-highest)',
                color: 'var(--c-on-surface-variant)',
                border: '1px solid var(--c-outline-variant)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                General
              </span>
            )}
            <GraduationCap size={16} color="var(--c-primary)" style={{ opacity: 0.8 }} />
          </div>

          <p className="text-body-md" style={{ 
            whiteSpace: 'pre-wrap', 
            lineHeight: 1.6, 
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word',
            color: 'var(--c-on-surface)',
            fontWeight: 500
          }}>{entry.content}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '10px', marginTop: 'auto' }}>
            <Calendar size={12} color="var(--c-on-surface-variant)" style={{ opacity: 0.7 }} />
            <span className="text-label-sm text-on-surface-variant" style={{ textTransform: 'none', fontWeight: 600, fontSize: '11px' }}>
              {new Date(entry.date || entry.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      );
    } else if (category === 'MISC') {
      const typeStyle = getMiscActivityStyle(entry.activity || 'Other');
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
          {/* Card Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', paddingRight: '20px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--c-on-surface)', display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1.4 }}>
              <MapPin size={13} color="var(--c-primary)" />
              {entry.location || 'Everyday Event'}
            </h4>
            <span style={{ 
              fontSize: '10px', 
              fontWeight: 700, 
              padding: '2px 8px', 
              borderRadius: '20px', 
              backgroundColor: typeStyle.bg,
              color: typeStyle.text,
              border: `1.5px solid ${typeStyle.border}`,
              whiteSpace: 'nowrap',
              textTransform: 'uppercase'
            }}>
              {entry.activity || 'Other'}
            </span>
          </div>

          {/* Tags row */}
          {entry.tag && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                color: 'var(--c-primary)', 
                backgroundColor: 'rgba(191,145,41,0.06)', 
                border: '1.5px dashed rgba(191,145,41,0.2)',
                padding: '2px 8px', 
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                🏷️ {entry.tag}
              </span>
            </div>
          )}

          {/* Description */}
          <p className="text-body-md" style={{ 
            whiteSpace: 'pre-wrap', 
            lineHeight: 1.6, 
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word',
            color: 'var(--c-on-surface-variant)',
            fontSize: '13px'
          }}>{entry.content}</p>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '10px', marginTop: 'auto' }}>
            <Calendar size={12} color="var(--c-on-surface-variant)" style={{ opacity: 0.7 }} />
            <span className="text-label-sm text-on-surface-variant" style={{ textTransform: 'none', fontWeight: 600, fontSize: '11px' }}>
              {new Date(entry.date || entry.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
          <p className="text-body-md" style={{ 
            whiteSpace: 'pre-wrap', 
            lineHeight: 1.6, 
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word',
            color: 'var(--c-on-surface)',
            fontWeight: 500
          }}>{entry.content}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '10px', marginTop: 'auto' }}>
            <Calendar size={12} color="var(--c-on-surface-variant)" style={{ opacity: 0.7 }} />
            <span className="text-label-sm text-on-surface-variant" style={{ textTransform: 'none', fontWeight: 600, fontSize: '11px' }}>
              {new Date(entry.date || entry.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      );
    }
  };

  return (
    <div 
      className="card" 
      onClick={() => onClick(entry)}
      style={{ 
        padding: '20px', 
        cursor: 'pointer',
        borderRadius: '16px',
        border: entry.isPinned 
          ? '1.5px solid var(--c-primary)' 
          : '1.5px solid var(--c-outline-variant)',
        backgroundColor: entry.isPinned 
          ? 'rgba(220, 174, 46, 0.04)' 
          : 'var(--c-surface-container-low)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        minWidth: 0,
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--c-primary)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(191,145,41,0.14)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = entry.isPinned ? 'var(--c-primary)' : 'var(--c-outline-variant)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* PIN BUTTON */}
      <button
        onClick={handleTogglePin}
        disabled={isPinning}
        title={entry.isPinned ? "Unpin entry" : "Pin to top"}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: entry.isPinned ? 'rgba(220, 174, 46, 0.15)' : 'none',
          border: entry.isPinned ? '1px solid rgba(220, 174, 46, 0.4)' : 'none',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: entry.isPinned ? 'var(--c-primary)' : 'var(--c-on-surface-variant)',
          opacity: entry.isPinned ? 1 : 0.5,
          transition: 'all 0.2s',
          zIndex: 5
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = entry.isPinned ? '1' : '0.5'; }}
      >
        <Pin size={14} style={{ transform: entry.isPinned ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {renderCardContent()}
    </div>
  );
}
