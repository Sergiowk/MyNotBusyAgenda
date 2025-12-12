import { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import HabitItem from '../components/HabitItem';
import HabitCreationModal from '../components/HabitCreationModal';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, Calendar, BarChart2, Activity } from 'lucide-react';
import clsx from 'clsx';

export default function Habits() {
    const [view, setView] = useState('day'); // day, week, month
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null); // State for habit being edited
    const { t } = useLanguage();

    // For now we default to today. Future: add date navigation.
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { habits, habitLogs, addHabit, updateHabit, deleteHabit, logHabitProgress } = useHabits(selectedDate);

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
                            habits.map(habit => (
                                <HabitItem
                                    key={habit.id}
                                    habit={habit}
                                    logValue={habitLogs[habit.id]}
                                    onLog={handleLogProgress}
                                    onDelete={deleteHabit}
                                    onEdit={openEditModal}
                                />
                            ))
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12 rounded-xl border border-dashed" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                        <BarChart2 className="mx-auto mb-3 opacity-50" size={48} />
                        <p>{t('habits.view_coming_soon') || `${view.charAt(0).toUpperCase() + view.slice(1)} view coming soon`}</p>
                    </div>
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
