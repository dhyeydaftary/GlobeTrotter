import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function ItineraryCalendar({ days, overBudgetDates = new Set() }) {
  const eventsByDate = useMemo(() => {
    const map = {};
    (days || []).forEach((day) => {
      if (!day.date || day.date === 'Unscheduled') return;
      map[day.date] = day;
    });
    return map;
  }, [days]);

  const firstEventDate = useMemo(() => {
    const keys = Object.keys(eventsByDate).sort();
    return keys.length ? new Date(`${keys[0]}T00:00:00`) : new Date();
  }, [eventsByDate]);

  const [cursor, setCursor] = useState(() => startOfMonth(firstEventDate));

  const cells = useMemo(() => {
    const first = startOfMonth(cursor);
    const blank = first.getDay();
    const count = daysInMonth(cursor);
    const items = [];
    for (let i = 0; i < blank; i += 1) items.push(null);
    for (let d = 1; d <= count; d += 1) {
      items.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    return items;
  }, [cursor]);

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="gt-card p-5 sm:p-7 overflow-x-auto">
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="p-2 rounded-btn text-text-muted hover:bg-surface-raised hover:text-text-main active:scale-[0.95] transition-all"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-display-md font-bold text-text-main text-base sm:text-lg">{monthLabel}</h3>
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="p-2 rounded-btn text-text-muted hover:bg-surface-raised hover:text-text-main active:scale-[0.95] transition-all"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 min-w-[320px] text-center text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 min-w-[320px]">
        {cells.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[105px] rounded-xl bg-transparent" />;
          }
          const key = toKey(date);
          const day = eventsByDate[key];
          const over = overBudgetDates.has(key);
          return (
            <div
              key={key}
              className={`min-h-[80px] sm:min-h-[105px] rounded-xl border p-2 text-left transition-colors ${
                day
                  ? 'border-accent/30 bg-accent-light/40 shadow-sm'
                  : 'border-border-light bg-surface-card'
              } ${over ? 'ring-2 ring-warning/60 bg-warning/5' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${day ? 'text-accent' : 'text-text-main'}`}>
                  {date.getDate()}
                </span>
                {over && (
                  <span className="text-[9px] font-bold uppercase tracking-wide text-warning bg-warning/10 px-1.5 py-0.5 rounded-full border border-warning/20">
                    Over
                  </span>
                )}
              </div>
              {day && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-accent truncate">
                    <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                    <span className="truncate">{day.cityName}</span>
                  </div>
                  {(day.activities || []).slice(0, 2).map((act) => (
                    <p key={act.id} className="text-[10px] text-text-muted truncate leading-tight">
                      {act.scheduledTime ? `${act.scheduledTime} ` : ''}{act.name}
                    </p>
                  ))}
                  {day.activities?.length > 2 && (
                    <p className="text-[9px] text-text-light font-medium">+{day.activities.length - 2} more</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
