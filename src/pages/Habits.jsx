import { useState, useEffect } from 'react';
import { useHabits } from '../hooks/useHabits';
import HabitItem from '../components/HabitItem';
import HabitCreationModal from '../components/HabitCreationModal';
import HabitGrid from '../components/HabitGrid';
import HabitCalendar from '../components/HabitCalendar';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, Activity, ChevronLeft, ChevronRight, LayoutGrid, Square } from 'lucide-react';
import clsx from 'clsx';

export default function Habits() {
    const [view, setView] = useState('day'); // day, week, month
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const { t } = useLanguage();

    // For now we default to today. Future: add date navigation.
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { habits, habitLogs, addHabit, updateHabit, deleteHabit, logHabitProgress } = useHabits(selectedDate, view);

    // Month View Selection
    const [selectedHabitId, setSelectedHabitId] = useState(null);
    const [monthViewType, setMonthViewType] = useState('single'); // 'single' | 'compact'

    // Default to first habit when entering month view or when habits load
    useEffect(() => {
        if (habits.length > 0 && !selectedHabitId) {
            setSelectedHabitId(habits[0].id);
        }
    }, [habits, selectedHabitId]);

    const handleDateChange = (amount) => {
        const newDate = new Date(selectedDate);
        if (view === 'month') {
            newDate.setMonth(newDate.getMonth() + amount);
        } else if (view === 'week') {
            newDate.setDate(newDate.getDate() + (amount * 7));
        } else {
            // Day
            newDate.setDate(newDate.getDate() + amount);
        }
        setSelectedDate(newDate);
    };

    const getDateLabel = () => {
        if (view === 'month') {
            return selectedDate.toLocaleDateString(t('locale') || 'en-US', { month: 'long', year: 'numeric' });
        }
        if (view === 'week') {
            // Show start - end of week
            const curr = new Date(selectedDate);
            const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);
            const start = new Date(new Date(curr).setDate(first));
            const end = new Date(new Date(curr).setDate(first + 6));

            const startStr = start.toLocaleDateString(t('locale') || 'en-US', { month: 'short', day: 'numeric' });
            const endStr = end.toLocaleDateString(t('locale') || 'en-US', { month: 'short', day: 'numeric' });
            return `${startStr} - ${endStr}`;
        }
        // Day
        const today = new Date();
        if (selectedDate.toDateString() === today.toDateString()) return t('common.today') || "Today";

        // Check yesterday/tomorrow if desired, or just date
        return selectedDate.toLocaleDateString(t('locale') || 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const handleSaveHabit = async (habitData) => {
        if (habitData.id) {
            // Update existing
            const { id, ...data } = habitData;
            await updateHabit(id, data);
        } else {
            // Create new
            const { id, ...data } = habitData;
            await addHabit(data);
        }
    };

    const openEditModal = (habit) => {
        setEditingHabit(habit);
        setIsCreateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setEditingHabit(null);
    };

    const handleLogProgress = (habitId, value) => {
        logHabitProgress(habitId, value, selectedDate);
    };

    return (
        <div className="content-container space-y-6 pb-24">
            <header className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-serif font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                            {t('habits.title') || 'Habits'}
                        </h1>
                        <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                            {t('habits.subtitle') || 'Track your daily goals'}
                        </p>
                    </div>
                    {/* Add Button (Desktop/Header) */}
                    <button
                        onClick={() => {
                            setEditingHabit(null);
                            setIsCreateModalOpen(true);
                        }}
                        className="p-2 rounded-xl text-white transition-opacity hover:opacity-90 shadow-lg"
                        style={{ backgroundColor: 'var(--color-accent)' }}
                    >
                        <Plus size={24} />
                    </button>
                </div>

                {/* View Toggles */}
                <div className="flex p-1 rounded-xl border bg-[var(--color-bg-card)]" style={{ borderColor: 'var(--color-border)' }}>
                    {['day', 'week', 'month'].map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={clsx(
                                "flex-1 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
                                view === v ? "bg-[var(--color-bg-secondary)] shadow-sm" : "hover:opacity-70"
                            )}
                            style={{
                                color: view === v ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                            }}
                        >
                            {t(`habits.view_${v}`) || v}
                        </button>
                    ))}
                </div>

                {/* Date Navigator */}
                <div className="flex items-center justify-between bg-[var(--color-bg-card)] p-2 rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
                    <button
                        onClick={() => handleDateChange(-1)}
                        className="p-1.5 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <h3 className="font-bold font-serif capitalize text-sm select-none" style={{ color: 'var(--color-text-primary)' }}>
                        {getDateLabel()}
                    </h3>

                    <button
                        onClick={() => handleDateChange(1)}
                        className="p-1.5 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Month View Controls */}
                {view === 'month' && habits.length > 0 && (
                    <div className="space-y-4">
                        {/* Sub-selector: Detail (Single) vs Compact (All) */}
                        <div className="flex p-1 bg-[var(--color-bg-secondary)] rounded-xl w-full">
                            <button
                                onClick={() => setMonthViewType('single')}
                                className={clsx(
                                    "flex-1 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all",
                                    monthViewType === 'single' ? "bg-[var(--color-bg-card)] shadow-sm text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)] hover:opacity-80"
                                )}
                            >
                                <Square size={16} />
                                {t('habits.view_habit') || "Habit Mode"}
                            </button>
                            <button
                                onClick={() => setMonthViewType('compact')}
                                className={clsx(
                                    "flex-1 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all",
                                    monthViewType === 'compact' ? "bg-[var(--color-bg-card)] shadow-sm text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)] hover:opacity-80"
                                )}
                            >
                                <LayoutGrid size={16} />
                                {t('habits.view_compact') || "Compact Mode"}
                            </button>
                        </div>

                        {/* Habit Selector (Only in Single Mode) */}
                        {monthViewType === 'single' && (
                            <div className="w-full">
                                <select
                                    value={selectedHabitId || ''}
                                    onChange={(e) => setSelectedHabitId(e.target.value)}
                                    className="w-full p-3 rounded-xl border appearance-none outline-none font-medium cursor-pointer transition-colors"
                                    style={{
                                        backgroundColor: 'var(--color-bg-card)',
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text-primary)'
                                    }}
                                >
                                    {habits.map(h => (
                                        <option key={h.id} value={h.id}>{h.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                    </div>
                )}
            </header>

            <main>
                {view === 'day' ? (
                    <div className="space-y-4">
                        {habits.length === 0 ? (
                            <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
                                <Activity className="mx-auto mb-3 opacity-50" size={48} />
                                <p>{t('habits.empty') || "No habits yet. Create one to get started!"}</p>
                            </div>
                        ) : (
                            habits
                                .filter(habit => {
                                    // Only show habits scheduled for this day in day view
                                    if (!habit.frequency) return true; // Show all if no frequency set
                                    const dayOfWeek = selectedDate.getDay(); // 0 (Sun) - 6 (Sat)
                                    return habit.frequency.includes(dayOfWeek);
                                })
                                .map(habit => (
                                    <HabitItem
                                        key={habit.id}
                                        habit={habit}
                                        logValue={habitLogs[habit.id]?.[`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`]}
                                        onLog={handleLogProgress}
                                        onDelete={deleteHabit}
                                        onEdit={openEditModal}
                                    />
                                ))
                        )}
                    </div>
                ) : view === 'week' ? (
                    <HabitGrid
                        habits={habits}
                        habitLogs={habitLogs}
                        currentDate={selectedDate}
                        viewMode={view}
                    />
                ) : (
                    // Month View
                    monthViewType === 'single' ? (
                        <HabitCalendar
                            habit={habits.find(h => h.id === selectedHabitId)}
                            habitLogs={habitLogs}
                            currentDate={selectedDate}
                            onMonthChange={handleDateChange}
                        />
                    ) : (
                        // Compact Grid View
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {habits.map(habit => (
                                <HabitCalendar
                                    key={habit.id}
                                    habit={habit}
                                    habitLogs={habitLogs}
                                    currentDate={selectedDate}
                                    onMonthChange={handleDateChange}
                                    hideController={true}
                                    compact={true}
                                />
                            ))}
                        </div>
                    )
                )}
            </main>

            <HabitCreationModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveHabit}
                initialData={editingHabit}
            />
        </div>
    );
}
