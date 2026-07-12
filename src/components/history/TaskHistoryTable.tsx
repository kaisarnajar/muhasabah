'use client';

import { DailyTask } from '@prisma/client';
import { Calendar } from 'lucide-react';

interface TaskHistoryTableProps {
  tasks: DailyTask[];
}

export default function TaskHistoryTable({ tasks }: TaskHistoryTableProps) {
  // Generate the last 14 days
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Extract all unique task titles from the tasks in this period
  const uniqueTaskTitles = Array.from(
    new Set(tasks.map((t) => t.title))
  ).sort();

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Calendar color="var(--c-primary)" size={24} />
        <h3 className="text-title-md" style={{ margin: 0, fontWeight: 600 }}>Daily Tasks Matrix (Last 14 Days)</h3>
      </div>

      {uniqueTaskTitles.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--c-surface-container-low)', borderRadius: '12px', border: '1px dashed var(--c-outline)' }}>
          <p className="text-on-surface-variant" style={{ margin: 0 }}>No daily tasks recorded in the last 14 days.</p>
        </div>
      ) : (
        /* 2D History Scrollable Wrapper (Scrollbar at the top) */
        <div style={{ overflowX: 'auto', transform: 'rotateX(180deg)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '800px', transform: 'rotateX(180deg)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--c-outline-variant)' }}>
                <th style={{ padding: '16px', textAlign: 'left', minWidth: '150px' }}>Date</th>
                {uniqueTaskTitles.map((title) => (
                  <th key={title} style={{ padding: '16px', minWidth: '120px', fontSize: '14px', fontWeight: '700' }}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day, idx) => {
                const dayDateStr = day.toISOString().split('T')[0];
                const displayDate = day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                const isToday = idx === 0;

                return (
                  <tr key={dayDateStr} style={{ backgroundColor: isToday ? 'var(--c-surface-container-high)' : 'transparent', borderBottom: '1px solid var(--c-outline-variant)' }}>
                    <td style={{ padding: '16px', textAlign: 'left', fontWeight: isToday ? '700' : '500' }}>
                      {isToday ? `Today (${displayDate})` : displayDate}
                    </td>

                    {uniqueTaskTitles.map((title) => {
                      // Find if a task with this title was scheduled on this day
                      const matchedTask = tasks.find((t) => {
                        const taskDateStr = new Date(t.targetDate).toISOString().split('T')[0];
                        return taskDateStr === dayDateStr && t.title === title;
                      });

                      if (!matchedTask) {
                        // Task wasn't planned for this day
                        return (
                          <td key={title} style={{ padding: '16px', color: 'var(--c-outline)', fontWeight: 'bold' }}>
                            -
                          </td>
                        );
                      }

                      return (
                        <td key={title} style={{ padding: '16px' }}>
                          <input
                            type="checkbox"
                            checked={matchedTask.isCompleted}
                            readOnly
                            onClick={(e) => e.preventDefault()} // Read-only history
                            className="habit-checkbox"
                            style={{
                              margin: '0 auto',
                              appearance: 'auto',
                              width: '24px',
                              height: '24px',
                              cursor: 'default',
                              accentColor: matchedTask.isCompleted ? 'var(--c-secondary)' : 'var(--c-outline)',
                              opacity: 1
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
