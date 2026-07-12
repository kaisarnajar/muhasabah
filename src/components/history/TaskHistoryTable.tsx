'use client';

import { useState } from 'react';
import { DailyTask } from '@prisma/client';
import { Calendar, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';

interface TaskHistoryTableProps {
  tasks: DailyTask[];
}

export default function TaskHistoryTable({ tasks }: TaskHistoryTableProps) {
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  // Generate the last 30 days of history (extended from 14 for better history coverage)
  const days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const toggleDay = (dayStr: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayStr]: !prev[dayStr],
    }));
  };

  // Group tasks by date string
  const tasksByDay: Record<string, DailyTask[]> = {};
  tasks.forEach((task) => {
    const dateStr = new Date(task.targetDate).toISOString().split('T')[0];
    if (!tasksByDay[dateStr]) {
      tasksByDay[dateStr] = [];
    }
    tasksByDay[dateStr].push(task);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {days.map((day, idx) => {
        const dayStr = day.toISOString().split('T')[0];
        const dayTasks = tasksByDay[dayStr] || [];
        const displayDate = day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
        const isToday = idx === 0;

        if (dayTasks.length === 0) return null; // Only show days that actually had tasks scheduled

        const completedCount = dayTasks.filter((t) => t.isCompleted).length;
        const totalCount = dayTasks.length;
        const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
        const isExpanded = !!expandedDays[dayStr];

        return (
          <div 
            key={dayStr} 
            className="card" 
            style={{ 
              padding: 0, 
              overflow: 'hidden', 
              border: isToday ? '1px solid var(--c-primary)' : '1px solid var(--c-outline-variant)',
              boxShadow: isToday ? 'var(--shadow-glow-primary)' : 'var(--shadow-sm)'
            }}
          >
            {/* Accordion Header */}
            <div 
              onClick={() => toggleDay(dayStr)}
              style={{ 
                padding: '20px 24px', 
                cursor: 'pointer', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px',
                backgroundColor: isToday ? 'var(--c-surface-container-high)' : 'var(--c-surface)',
                userSelect: 'none',
                transition: 'background-color 0.2s ease'
              }}
              className="accordion-header"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Calendar size={20} color={isToday ? 'var(--c-primary)' : 'var(--c-on-surface-variant)'} />
                  <span className="text-body-lg" style={{ fontWeight: 700, color: 'var(--c-on-surface)' }}>
                    {isToday ? `Today (${displayDate})` : displayDate}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span className="text-label-sm text-on-surface-variant" style={{ fontWeight: 600 }}>
                    {completedCount} of {totalCount} tasks done
                  </span>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Thin Progress Bar */}
              <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--c-surface-container-highest)', borderRadius: '2px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${completionRate}%`, 
                    height: '100%', 
                    backgroundColor: completionRate === 100 ? 'var(--c-secondary)' : 'var(--c-primary)',
                    transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
                  }} 
                />
              </div>
            </div>

            {/* Accordion Body (Task list) */}
            {isExpanded && (
              <div 
                style={{ 
                  padding: '20px 24px', 
                  borderTop: '1px solid var(--c-outline-variant)', 
                  backgroundColor: 'var(--c-surface-container-lowest)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {dayTasks.map((task) => (
                  <div 
                    key={task.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '12px 16px', 
                      backgroundColor: 'var(--c-surface)', 
                      borderRadius: '8px', 
                      border: '1px solid var(--c-outline-variant)' 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {task.isCompleted ? (
                        <CheckCircle2 size={20} color="var(--c-secondary)" />
                      ) : (
                        <XCircle size={20} color="var(--c-error)" />
                      )}
                      <span 
                        className="text-body-md" 
                        style={{ 
                          fontWeight: 500, 
                          textDecoration: task.isCompleted ? 'line-through' : 'none',
                          color: task.isCompleted ? 'var(--c-on-surface-variant)' : 'var(--c-on-surface)',
                          opacity: task.isCompleted ? 0.7 : 1
                        }}
                      >
                        {task.title}
                      </span>
                    </div>
                    
                    <span 
                      style={{ 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        color: task.isCompleted ? 'var(--c-secondary)' : 'var(--c-error)',
                        backgroundColor: task.isCompleted ? 'var(--c-surface-container-highest)' : 'var(--c-error-container)',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {task.isCompleted ? 'Completed' : 'Missed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
