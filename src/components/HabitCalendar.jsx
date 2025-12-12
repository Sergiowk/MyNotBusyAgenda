import React, { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export default function HabitCalendar({ habit, habitLogs, currentDate, onMonthChange, hideController = false, compact = false }) {
    const { t, language } = useLanguage();

    // Determine current month/year from passed date
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const { settings } = useSettings();
    const startOfWeek = settings?.startOfWeek || 'monday';

    // Logic to build calendar days
    const calendarDays = useMemo(() => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let firstDayIdx = new Date(year, month, 1).getDay(); // 0 Sun - 6 Sat

        // Adjust for start of week preference
        let startOffset = firstDayIdx;
        if (startOfWeek === 'monday') {
            startOffset = firstDayIdx === 0 ? 6 : firstDayIdx - 1;
        }

        const days = [];
        // Empty slots
        for (let i = 0; i < startOffset; i++) {
            days.push(null);
        }
        // Scheduled days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({
                day: i,
                date: date,
                dateString: dateString,
                dayOfWeek: date.getDay()
            });
        }
        return days;
    }, [year, month, startOfWeek]);

    // Week Headers
    const weekDays = useMemo(() => {
        // Create ref date starting from correct day
        // Jan 1 2023 was Sunday, Jan 2 2023 was Monday
        const startDay = startOfWeek === 'monday' ? 2 : 1;

        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(2023, 0, i + startDay);
            return d.toLocaleDateString(language, { weekday: 'short' });
        });
    }, [language, startOfWeek]);

    if (!habit) {
        return <div className="text-center py-8 opacity-50">Select a habit to view calendar</div>;
    }

    return (
        <div className="rounded-2xl border p-4 shadow-sm" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
            {/* Header */}
            <div className={clsx("flex items-center justify-between mb-4", compact && "mb-2")}>
                <h3 className={clsx("font-bold font-serif capitalize", compact ? "text-base" : "text-lg")} style={{ color: 'var(--color-text-primary)' }}>
                    {hideController ? habit.name : currentDate.toLocaleDateString(language, { month: 'long', year: 'numeric' })}
                </h3>
                {!hideController && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onMonthChange(-1)}
                            className="p-1.5 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => onMonthChange(1)}
                            className="p-1.5 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-2">
                {/* Headers */}
                {weekDays.map(d => (
                    <div key={d} className="text-center text-xs font-semibold opacity-60 uppercase mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {d}
                    </div>
                ))}

                {/* Days */}
                {calendarDays.map((d, i) => {
                    if (!d) return <div key={`empty-${i}`} className="aspect-square" />;

                    // Logic
                    const isScheduled = !habit.frequency || habit.frequency.includes(d.dayOfWeek);
                    const value = habitLogs[habit.id]?.[d.dateString] || 0;
                    const target = habit.target;

                    let bgColor = 'var(--color-bg-secondary)'; // Default empty
                    let content = null;

                    if (!isScheduled) {
                        // Crossed out
                        bgColor = 'var(--color-bg-secondary)';
                        content = (
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="1" />
                                    <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="1" />
                                </svg>
                            </div>
                        );
                    } else if (value >= target) {
                        bgColor = '#22c55e'; // Green
                    } else if (value > 0) {
                        bgColor = '#eab308'; // Yellow
                    } else {
                        // Empty / Missed
                        bgColor = 'var(--color-bg-hover)';
                    }

                    // Specific logic for limit habits? 
                    if (habit.type === 'limit' && isScheduled) {
                        if (value > 0 && value <= target) bgColor = '#22c55e';
                        else if (value > target) bgColor = '#ef4444';
                        else bgColor = 'var(--color-bg-hover)';
                    }

                    const isToday = d.dateString === new Date().toISOString().split('T')[0];
                    // Fix timezone for today check?
                    const localToday = new Date();
                    const localTodayStr = `${localToday.getFullYear()}-${String(localToday.getMonth() + 1).padStart(2, '0')}-${String(localToday.getDate()).padStart(2, '0')}`;
                    const isLocalToday = d.dateString === localTodayStr;

                    return (
                        <div
                            key={d.dateString}
                            className={clsx(
                                "aspect-square rounded-lg flex items-center justify-center relative font-medium transition-all hover:opacity-90",
                                compact ? "text-xs" : "text-sm",
                                isLocalToday && "ring-2 ring-offset-1 ring-[var(--color-accent)]"
                            )}
                            style={{
                                backgroundColor: bgColor,
                                color: (value > 0 && isScheduled) ? '#fff' : 'var(--color-text-primary)'
                            }}
                            title={`${d.dateString}: ${value}`}
                        >
                            {d.day}
                            {content}
                        </div>
                    );

                })}
            </div>

            {/* Legend - Hide in compact mode */}
            {!compact && (
                <div className="flex justify-center gap-4 mt-6 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[#22c55e]"></div> Complete</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[#eab308]"></div> Partial</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[var(--color-bg-secondary)] relative overflow-hidden"><div className="absolute inset-0 flex items-center justify-center opacity-50"><span className="text-[8px] transform -rotate-45">/</span></div></div> Unscheduled</div>
                </div>
            )}
        </div>
    );
}
