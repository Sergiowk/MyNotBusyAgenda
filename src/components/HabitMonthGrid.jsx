import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import clsx from 'clsx';
import { X } from 'lucide-react';

export default function HabitMonthGrid({ habits, habitLogs, currentMonth }) {
    const { t } = useLanguage();

    // Calculate days in the month
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(year, month, i + 1);
        const yearStr = d.getFullYear();
        const monthStr = String(d.getMonth() + 1).padStart(2, '0');
        const dayStr = String(d.getDate()).padStart(2, '0');
        return {
            date: d,
            day: i + 1,
            label: d.toLocaleDateString('en-US', { weekday: 'narrow' }), // S M T ...
            dateString: `${yearStr}-${monthStr}-${dayStr}`,
            dayOfWeek: d.getDay() // 0-6
        };
    });

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-max">
                {/* Header Row */}
                <div className="flex mb-2">
                    <div className="w-48 flex-shrink-0 p-2 font-medium sticky left-0 z-10 bg-[var(--color-bg-primary)]" style={{ color: 'var(--color-text-secondary)' }}>
                        {t('habits.name_label') || 'Habit Name'}
                    </div>
                    {days.map(day => (
                        <div key={day.day} className="w-8 flex-shrink-0 text-center flex flex-col items-center">
                            <span
                                className="text-xs font-semibold mb-1"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                {day.label}
                            </span>
                            <span
                                className="text-xs opacity-70"
                                style={{ color: 'var(--color-text-primary)' }}
                            >
                                {day.day}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Rows */}
                {habits.map(habit => (
                    <div key={habit.id} className="flex items-center mb-2 h-10">
                        <div
                            className="w-48 flex-shrink-0 px-2 truncate font-medium sticky left-0 z-10 bg-[var(--color-bg-primary)] border-r"
                            style={{
                                color: 'var(--color-text-primary)',
                                borderColor: 'var(--color-border)'
                            }}
                            title={habit.name}
                        >
                            {habit.name}
                        </div>

                        {days.map(day => {
                            // 1. Check if scheduled
                            const isScheduled = !habit.frequency || habit.frequency.includes(day.dayOfWeek);

                            // 2. Determine cell content
                            if (!isScheduled) {
                                return (
                                    <div
                                        key={day.dateString}
                                        className="w-8 flex-shrink-0 h-8 flex items-center justify-center border-r border-b relative"
                                        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)', opacity: 0.3 }}
                                    >
                                        {/* Two lines crossing X */}
                                        <div className="absolute inset-0">
                                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="1" />
                                                <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="1" />
                                            </svg>
                                        </div>
                                    </div>
                                );
                            }

                            // 2. Get value
                            const value = habitLogs[habit.id]?.[day.dateString] || 0;
                            const target = habit.target;

                            // 3. Determine Color
                            // Green: Met target (or met limit logic? Limit logic: < limit is good?)
                            // Wait: Limit type logic: "Social Media < 30m"
                            // If value <= target -> Green. If value > target -> Red.
                            // BUT normally "Target" implies "Goal to reach". 
                            // Let's assume standard logic first: >= Target is Green.
                            // If type === 'limit': <= Target is Green currently?
                            // Let's look at HabitItem logic:
                            // if (type === 'limit') progressColor = current > target ? '#ef4444' : '#22c55e';

                            let bgColor = 'transparent';
                            if (habit.type === 'limit') {
                                if (value > 0 && value <= target) bgColor = '#22c55e'; // Green
                                else if (value > target) bgColor = '#ef4444'; // Red
                                else bgColor = 'transparent'; // No activity, so gray/transparent
                            } else {
                                if (value >= target) bgColor = '#22c55e'; // Green
                                else if (value > 0) bgColor = '#eab308'; // Yellow
                                else bgColor = 'transparent';
                            }

                            return (
                                <div
                                    key={day.dateString}
                                    className="w-8 flex-shrink-0 h-8 border-r border-b transition-colors"
                                    style={{
                                        borderColor: 'var(--color-border)',
                                        backgroundColor: bgColor,
                                    }}
                                    title={`${value} / ${target}`}
                                ></div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
