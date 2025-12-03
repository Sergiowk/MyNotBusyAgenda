import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar({ onDateSelect, selectedDate }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const today = new Date();

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    // Adjust so Monday = 0, Sunday = 6
    const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1;

    // Get number of days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Get month name
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const prevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const handleDayClick = (day) => {
        if (!day) return;
        const selected = new Date(currentYear, currentMonth, day);
        if (onDateSelect) {
            onDateSelect(selected);
        }
    };

    const isSelected = (day) => {
        if (!selectedDate || !day) return false;
        return (
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentMonth &&
            selectedDate.getFullYear() === currentYear
        );
    };

    const isToday = (day) => {
        if (!day) return false;
        return (
            today.getDate() === day &&
            today.getMonth() === currentMonth &&
            today.getFullYear() === currentYear
        );
    };

    // Generate calendar days
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayAdjusted; i++) {
        days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {monthName} {currentYear}
                </h3>
                <div className="flex gap-1">
                    <button
                        onClick={prevMonth}
                        className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {/* Week day headers */}
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-medium py-2"
                        style={{ color: 'var(--color-text-tertiary)' }}
                    >
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {days.map((day, index) => {
                    const selected = isSelected(day);
                    const today = isToday(day);

                    return (
                        <button
                            key={index}
                            onClick={() => handleDayClick(day)}
                            disabled={!day}
                            className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all ${day ? 'hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer' : ''}`}
                            style={{
                                backgroundColor: selected ? 'var(--color-accent)' : today ? 'var(--color-bg-hover)' : 'transparent',
                                color: selected ? '#ffffff' : day ? 'var(--color-text-primary)' : 'transparent',
                                fontWeight: (selected || today) ? '600' : '400',
                                border: today && !selected ? `1px solid var(--color-accent)` : 'none'
                            }}
                        >
                            {day || ''}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
