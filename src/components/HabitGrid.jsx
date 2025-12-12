import React, { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import clsx from 'clsx';

export default function HabitGrid({ habits, habitLogs, currentDate, viewMode = 'month' }) {
    const { t } = useLanguage();
    const { settings } = useSettings();
    const startOfWeek = settings?.startOfWeek || 'monday';

    const days = useMemo(() => {
        const d_arr = [];
        if (viewMode === 'week') {
            // Re-implementing correctly inside
            const curr = new Date(currentDate);
            const currentDay = curr.getDay(); // 0-6

            let diff;
            if (startOfWeek === 'monday') {
                // Monday (1) - Sunday (0)
                diff = curr.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
            } else {
                // Sunday (0) - Saturday (6)
                diff = curr.getDate() - currentDay;
            }

            const startOfWeekDate = new Date(curr);
            startOfWeekDate.setDate(diff);

            for (let i = 0; i < 7; i++) {
                const d = new Date(startOfWeekDate);
                d.setDate(startOfWeekDate.getDate() + i);

                const yearStr = d.getFullYear();
                const monthStr = String(d.getMonth() + 1).padStart(2, '0');
                const dayStr = String(d.getDate()).padStart(2, '0');

                d_arr.push({
                    date: d,
                    day: d.getDate(),
                    label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
                    dateString: `${yearStr}-${monthStr}-${dayStr}`,
                    dayOfWeek: d.getDay()
                });
            }

        } else {
            // Month
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const d = new Date(year, month, i);
                const yearStr = d.getFullYear();
                const monthStr = String(d.getMonth() + 1).padStart(2, '0');
                const dayStr = String(d.getDate()).padStart(2, '0');

                d_arr.push({
                    date: d,
                    day: i,
                    label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
                    dateString: `${yearStr}-${monthStr}-${dayStr}`,
                    dayOfWeek: d.getDay()
                });
            }
        }
        return d_arr;
    }, [currentDate, viewMode]);

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className={clsx("min-w-full", viewMode === 'week' ? "w-full" : "min-w-max")}>
                {/* Header Row */}
                <div className={clsx("flex", viewMode === 'week' ? "mb-4 gap-3" : "mb-1 gap-[2px]")}>
                    <div
                        className={clsx(
                            "flex-shrink-0 font-medium sticky left-0 z-10 bg-[var(--color-bg-primary)] flex items-end pb-1",
                            viewMode === 'week' ? "w-40 px-2 text-sm" : "w-32 px-1 text-xs"
                        )}
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        {/* Empty corner or Label */}
                    </div>
                    {days.map(day => (
                        <div
                            key={day.dateString}
                            className={clsx(
                                "flex-shrink-0 text-center flex flex-col items-center justify-center",
                                viewMode === 'week' ? "flex-1 gap-1" : "w-5" // Week view expands
                            )}
                        >
                            <span
                                className={clsx(
                                    "font-semibold",
                                    viewMode === 'week' ? "text-sm" : "text-[8px]" // Smaller text
                                )}
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                {day.label[0]} {/* Only show first letter for month view compactness? User didn't ask but helps. */}
                            </span>
                            <span
                                className={clsx(
                                    "opacity-70 leading-none",
                                    viewMode === 'week' ? "text-xs" : "text-[8px]"
                                )}
                                style={{ color: 'var(--color-text-primary)' }}
                            >
                                {day.day}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Rows */}
                {habits.map(habit => (
                    <div key={habit.id} className={clsx("flex items-stretch", viewMode === 'week' ? "mb-4 gap-3 min-h-[3rem]" : "mb-1 gap-[2px] min-h-[1.5rem]")}>
                        {/* Habit Name Column */}
                        <div
                            className={clsx(
                                "flex-shrink-0 font-medium sticky left-0 z-10 bg-[var(--color-bg-primary)] flex items-center transition-all",
                                viewMode === 'week' ? "w-40 px-3 text-sm" : "w-32 px-2 text-xs"
                            )}
                            style={{
                                color: 'var(--color-text-primary)',
                                // Remove border-r to match the 'open' style, or keep it? 
                                // User said "similar to image", image has no grid lines.
                                // Let's keep it clean, maybe just a subtle shadow or nothing.
                            }}
                            title={habit.name}
                        >
                            <span className="line-clamp-2 leading-tight whitespace-normal">
                                {habit.name}
                            </span>
                        </div>

                        {days.map(day => {
                            const isScheduled = !habit.frequency || habit.frequency.includes(day.dayOfWeek);

                            // Style bases
                            const cellBase = clsx(
                                "flex-shrink-0 transition-all duration-300",
                                viewMode === 'week' ? "w-full h-10 rounded-xl" : "w-5 h-5 rounded-sm" // Width full to fill flex container, but maybe flex-1 on container is enough?
                                // Actually, if the wrapper is flex-1, the inner div needs to be responsive.
                                // Let's adjust the wrapper in the next chunk, here just defining class.
                            );

                            if (!isScheduled) {
                                return (
                                    <div
                                        key={day.dateString}
                                        className={clsx(
                                            "flex items-center justify-center relative bg-[var(--color-bg-secondary)] opacity-20",
                                            viewMode === 'week' ? "flex-1 h-10 rounded-xl" : "w-5 h-5 rounded-sm"
                                        )}
                                    >
                                        {/* No X in new clean style, just empty/dimmed */}
                                    </div>
                                );
                            }

                            const value = habitLogs[habit.id]?.[day.dateString] || 0;
                            const target = habit.target;

                            let bgColor = viewMode === 'week' ? 'var(--color-bg-secondary)' : 'transparent';

                            if (habit.type === 'limit') {
                                if (value > 0 && value <= target) bgColor = '#22c55e'; // Green
                                else if (value > target) bgColor = '#ef4444'; // Red
                            } else {
                                if (value >= target) bgColor = '#22c55e'; // Green
                                else if (value > 0) bgColor = '#eab308'; // Yellow
                            }

                            // For Month View in new style, we generally want same logic.
                            // Empty = transparent (or maybe light gray placeholder?)
                            // Image shows empty circles for todo.
                            // Let's make empty cells visible as placeholders in both views for consistency
                            if (bgColor === 'transparent') {
                                bgColor = 'var(--color-bg-secondary)'; // Placeholder color
                            }

                            return (
                                <div
                                    key={day.dateString}
                                    className={clsx(
                                        "flex-shrink-0 transition-all duration-300",
                                        viewMode === 'week' ? "flex-1 h-10 rounded-xl" : "w-5 h-5 rounded-sm"
                                    )}
                                    style={{
                                        backgroundColor: bgColor,
                                    }}
                                    title={`${day.dateString}: ${value} / ${target}`}
                                ></div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
