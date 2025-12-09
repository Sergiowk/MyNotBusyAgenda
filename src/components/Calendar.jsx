import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export default function Calendar({ onDateSelect, selectedDate }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthTasks, setMonthTasks] = useState([]);
    const { language } = useLanguage();
    const { user } = useAuth();

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const today = new Date();

    // Fetch tasks for the current month
    useEffect(() => {
        if (!user) {
            setMonthTasks([]);
            return;
        }

        const monthStart = new Date(currentYear, currentMonth, 1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        const tasksRef = collection(db, 'users', user.uid, 'todos');
        const q = query(
            tasksRef,
            where('createdAt', '>=', monthStart),
            where('createdAt', '<=', monthEnd),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMonthTasks(tasks);
        });

        return unsubscribe;
    }, [user, currentMonth, currentYear]);

    // Get task completion status for a specific day
    const getDayStatus = (day) => {
        if (!day) return null;

        const dayDate = new Date(currentYear, currentMonth, day);
        dayDate.setHours(0, 0, 0, 0);

        const dayTasks = monthTasks.filter(task => {
            const taskDate = new Date(task.createdAt.toDate());
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === dayDate.getTime();
        });

        if (dayTasks.length === 0) return null; // No tasks

        const allCompleted = dayTasks.every(task => task.completed);
        return allCompleted ? 'complete' : 'incomplete';
    };

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    // Adjust so Monday = 0, Sunday = 6
    const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1;

    // Get number of days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Get month name
    const monthName = currentDate.toLocaleString(language, { month: 'long' });

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

    // Generate week days based on locale
    // Jan 2, 2023 was a Monday. We want Mon-Sun.
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(2023, 0, i + 2);
        return d.toLocaleString(language, { weekday: 'short' });
    });

    return (
        <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold capitalize" style={{ color: 'var(--color-text-primary)' }}>
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
                        className="text-center text-xs font-medium py-2 capitalize"
                        style={{ color: 'var(--color-text-tertiary)' }}
                    >
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {days.map((day, index) => {
                    const selected = isSelected(day);
                    const today = isToday(day);
                    const dayStatus = getDayStatus(day);

                    return (
                        <button
                            key={index}
                            onClick={() => handleDayClick(day)}
                            disabled={!day}
                            className={`aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-all relative ${day ? 'hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer' : ''}`}
                            style={{
                                backgroundColor: selected ? 'var(--color-accent)' : today ? 'var(--color-bg-hover)' : 'transparent',
                                color: selected ? '#ffffff' : day ? 'var(--color-text-primary)' : 'transparent',
                                fontWeight: (selected || today) ? '600' : '400',
                                border: today && !selected ? `1px solid var(--color-accent)` : 'none'
                            }}
                        >
                            <span>{day || ''}</span>
                            {dayStatus && (
                                <div
                                    className="absolute bottom-1"
                                    style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        backgroundColor: dayStatus === 'complete' ? '#22c55e' : 'transparent',
                                        border: dayStatus === 'incomplete' ? '1.5px solid #22c55e' : 'none'
                                    }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div >
    );
}
