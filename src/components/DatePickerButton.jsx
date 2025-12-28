import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';

export default function DatePickerButton({ selectedDate, onDateChange, autoOpen = false, onClose }) {
    const [isOpen, setIsOpen] = useState(autoOpen);
    const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
    const [position, setPosition] = useState(null);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const { t, language } = useLanguage();

    // Check for mobile view
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Lock scroll on mobile when open
    useEffect(() => {
        if (isMobile && isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobile, isOpen]);

    useEffect(() => {
        function handleClickOutside(event) {
            // On mobile, the backdrop covers everything, so clicking it (outside the modal content) should close.
            // On desktop, we check if click is outside ref.
            if (isMobile) {
                // For mobile, the click outside check is handled by the backdrop onClick
                return;
            }

            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
                if (onClose) onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, isMobile, onClose]);

    useEffect(() => {
        if (isOpen && buttonRef.current && !isMobile) {
            const rect = buttonRef.current.getBoundingClientRect();
            const calendarHeight = 320; // Approx height
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Default to bottom, flip to top if not enough space below AND more space above
            let top = rect.bottom + window.scrollY + 8;
            if (spaceBelow < calendarHeight && spaceAbove > spaceBelow) {
                top = rect.top + window.scrollY - calendarHeight - 8;
            }

            // Ensure it doesn't go off screen horizontally
            let left = rect.left + window.scrollX;
            let right = 'auto';

            // If it would go off the right edge, align to right
            if (rect.left + 280 > window.innerWidth) {
                left = 'auto';
                right = window.innerWidth - rect.right + window.scrollX;
            }

            // Simple positioning object update
            setPosition({
                top,
                left,
                right
            });
        } else if (isMobile) {
            setPosition({}); // Just set non-null to trigger return
        } else {
            setPosition(null);
        }
    }, [isOpen, isMobile]);

    const { settings } = useSettings();
    const startOfWeek = settings?.startOfWeek || 'monday';

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        const day = firstDay.getDay(); // 0 (Sun) - 6 (Sat)
        let startingDayOfWeek = day;

        if (startOfWeek === 'monday') {
            startingDayOfWeek = day === 0 ? 6 : day - 1;
        }

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

    const handleClose = () => {
        setIsOpen(false);
        if (onClose) onClose();
    }

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' });

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => {
                    if (isOpen && onClose) {
                        onClose();
                    }
                    setIsOpen(!isOpen);
                }}
                className="flex items-center gap-1.5 p-2 rounded-md transition-all hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                    color: selectedDate ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    backgroundColor: selectedDate ? 'var(--color-accent)' + '20' : 'transparent'
                }}
            >
                <CalendarIcon size={18} />
                {selectedDate && (
                    <X
                        size={14}
                        onClick={handleClearDate}
                        className="hover:text-red-600 transition-colors"
                    />
                )}
            </button>

            {isOpen && position && createPortal(
                isMobile ? (
                    // Mobile Modal Layout
                    <div
                        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={handleClose}
                    >
                        <div
                            ref={dropdownRef}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm p-4 rounded-2xl shadow-2xl border animate-in fade-in zoom-in-95 duration-200"
                            style={{
                                backgroundColor: 'var(--color-bg-card)',
                                borderColor: 'var(--color-border)',
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    style={{ color: 'var(--color-text-primary)' }}
                                >
                                    ←
                                </button>
                                <span className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                                    {monthName}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    style={{ color: 'var(--color-text-primary)' }}
                                >
                                    →
                                </button>
                            </div>

                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {Array.from({ length: 7 }, (_, i) => {
                                    const startDay = startOfWeek === 'monday' ? 1 : 0; // Mon=1, Sun=0 in js Date getDay() logic? No, JS: Sun=0, Mon=1. 
                                    // If startOfWeek is monday, we want Mon, Tue...
                                    // Mon is 1. Tue is 2.
                                    // If startOfWeek is sunday, we want Sun, Mon...
                                    // Sun is 0. Mon is 1.

                                    // Using a fixed date to get locale string is safer.
                                    // Jan 1 2023 = Sunday. Jan 2 2023 = Monday.
                                    const baseDate = startOfWeek === 'monday' ? 2 : 1;
                                    const d = new Date(2023, 0, i + baseDate);
                                    return (
                                        <div
                                            key={i}
                                            className="text-center text-xs font-semibold py-1"
                                            style={{ color: 'var(--color-text-muted)' }}
                                        >
                                            {d.toLocaleDateString(language, { weekday: 'narrow' })}
                                        </div>
                                    );
                                })}
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
                                            className="aspect-square rounded-lg text-sm transition-all hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center"
                                            style={{
                                                backgroundColor: (isSelected || isTodayDate) ? 'var(--color-accent)' : 'transparent',
                                                color: (isSelected || isTodayDate) ? 'white' : 'var(--color-text-primary)',
                                                fontWeight: (isSelected || isTodayDate) ? '600' : '400'
                                            }}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full mt-4 p-3 rounded-xl border font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                style={{
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-text-primary)'
                                }}
                            >
                                {t ? t('common.close') : 'Close'}
                            </button>
                        </div>
                    </div>
                ) : (
                    // Desktop Popover Layout (Existing but positioned dynamically)
                    <div
                        ref={dropdownRef}
                        className="fixed p-4 rounded-xl border shadow-xl animate-in fade-in zoom-in-95 duration-200"
                        style={{
                            backgroundColor: 'var(--color-bg-card)',
                            borderColor: 'var(--color-border)',
                            minWidth: '280px',
                            top: `${position.top}px`,
                            left: position.left !== 'auto' ? `${position.left}px` : undefined,
                            right: position.right !== 'auto' ? `${position.right}px` : undefined,
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
                            {Array.from({ length: 7 }, (_, i) => {
                                const baseDate = startOfWeek === 'monday' ? 2 : 1;
                                const d = new Date(2023, 0, i + baseDate);
                                return (
                                    <div
                                        key={i}
                                        className="text-center text-xs font-semibold py-1"
                                        style={{ color: 'var(--color-text-muted)' }}
                                    >
                                        {d.toLocaleDateString(language, { weekday: 'narrow' })}
                                    </div>
                                );
                            })}
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
                                            backgroundColor: (isSelected || isTodayDate) ? 'var(--color-accent)' : 'transparent',
                                            color: (isSelected || isTodayDate) ? 'white' : 'var(--color-text-primary)',
                                            fontWeight: (isSelected || isTodayDate) ? '600' : '400'
                                        }}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ),
                document.body
            )}
        </>
    );
}
