import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function DatePickerButton({ selectedDate, onDateChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
    const [position, setPosition] = useState({ top: 0, right: 0 });
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const { t } = useLanguage();

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 8,
                right: window.innerWidth - rect.right + window.scrollX
            });
        }
    }, [isOpen]);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSameDay = (date1, date2) => {
        if (!date2) return false;
        return date1.toDateString() === date2.toDateString();
    };

    const handleDateSelect = (day) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        onDateChange(newDate);
        setIsOpen(false);
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleClearDate = (e) => {
        e.stopPropagation();
        onDateChange(null);
        setIsOpen(false);
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' });

    const displayText = selectedDate
        ? selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })
        : t('common.today');

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                    color: selectedDate ? 'var(--color-accent)' : 'var(--color-text-secondary)'
                }}
            >
                <CalendarIcon size={16} />
                <span className="text-sm font-medium whitespace-nowrap">{displayText}</span>
                {selectedDate && (
                    <X
                        size={14}
                        onClick={handleClearDate}
                        className="hover:text-red-600 transition-colors ml-0.5"
                    />
                )}
            </button>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    className="fixed p-4 rounded-xl border shadow-xl"
                    style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border)',
                        minWidth: '280px',
                        top: `${position.top}px`,
                        right: `${position.right}px`,
                        zIndex: 99999
                    }}
                >
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            ←
                        </button>
                        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            {monthName}
                        </span>
                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            →
                        </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div
                                key={i}
                                className="text-center text-xs font-semibold py-1"
                                style={{ color: 'var(--color-text-muted)' }}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                            const isSelected = isSameDay(date, selectedDate);
                            const isTodayDate = isToday(date);

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDateSelect(day)}
                                    className="aspect-square rounded-lg text-sm transition-all hover:bg-black/10 dark:hover:bg-white/10"
                                    style={{
                                        backgroundColor: isSelected
                                            ? 'var(--color-accent)'
                                            : isTodayDate
                                                ? 'var(--color-accent-light)'
                                                : 'transparent',
                                        color: isSelected
                                            ? 'white'
                                            : isTodayDate
                                                ? 'var(--color-accent)'
                                                : 'var(--color-text-primary)',
                                        fontWeight: isTodayDate || isSelected ? '600' : '400'
                                    }}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
