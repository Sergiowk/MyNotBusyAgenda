import { useState } from 'react';
import { X, CheckCircle, Circle, Calendar, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useIncompleteTodos } from '../hooks/useIncompleteTodos';
import DatePickerButton from './DatePickerButton';
import clsx from 'clsx';

export default function IncompleteTasksModal({ isOpen, onClose }) {
    const { t } = useLanguage();
    const { incompleteTodos, groupedTodos, toggleTodo, deleteTodo, rescheduleTodo } = useIncompleteTodos();
    const [reschedulingTask, setReschedulingTask] = useState(null);

    if (!isOpen) return null;

    // Sort date keys in chronological order: old days → today → future days
    const sortedDateKeys = Object.keys(groupedTodos).sort((a, b) => new Date(a) - new Date(b));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="relative w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-xl overflow-hidden flex flex-col"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {t('tasks.incomplete_title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {incompleteTodos.length === 0 ? (
                        <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
                            <p>{t('tasks.no_incomplete')}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {sortedDateKeys.map((dateKey) => {
                                const group = groupedTodos[dateKey];
                                const displayDate = group.date.toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                });
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const isToday = group.date.getTime() === today.getTime();
                                const isPast = group.date.getTime() < today.getTime();

                                return (
                                    <div key={dateKey}>
                                        {/* Date Header */}
                                        <h3
                                            className="text-sm font-semibold mb-3 px-2"
                                            style={{
                                                color: isPast ? '#ef4444' : 'var(--color-text-secondary)'
                                            }}
                                        >
                                            {isToday ? t('common.today') : displayDate}
                                            {isPast && ' ⚠️'}
                                        </h3>

                                        {/* Tasks for this date */}
                                        <div className="space-y-2">
                                            {group.todos.map((todo) => (
                                                <div
                                                    key={todo.id}
                                                    className="flex items-center justify-between rounded-xl border shadow-sm transition-all hover:shadow-md p-3"
                                                    style={{
                                                        backgroundColor: 'var(--color-bg-card)',
                                                        borderColor: 'var(--color-border)'
                                                    }}
                                                >
                                                    {/* Task content */}
                                                    <button
                                                        onClick={() => toggleTodo(todo.id)}
                                                        className="flex items-start gap-3 flex-1 text-left"
                                                    >
                                                        <Circle
                                                            className="mt-0.5 flex-shrink-0"
                                                            size={20}
                                                            style={{ color: 'var(--color-text-muted)' }}
                                                        />
                                                        <span
                                                            className="text-base"
                                                            style={{
                                                                color: 'var(--color-text-primary)',
                                                                wordWrap: 'break-word',
                                                                overflowWrap: 'break-word',
                                                                wordBreak: 'break-word'
                                                            }}
                                                        >
                                                            {todo.text}
                                                        </span>
                                                    </button>

                                                    {/* Action buttons */}
                                                    <div className="flex items-center gap-1 ml-2">
                                                        {/* Reschedule button */}
                                                        {reschedulingTask === todo.id ? (
                                                            <DatePickerButton
                                                                selectedDate={null}
                                                                onDateChange={(newDate) => {
                                                                    if (newDate) {
                                                                        rescheduleTodo(todo.id, newDate);
                                                                    }
                                                                    setReschedulingTask(null);
                                                                }}
                                                                autoOpen={true}
                                                            />
                                                        ) : (
                                                            <button
                                                                onClick={() => setReschedulingTask(todo.id)}
                                                                className="p-2 hover:text-blue-600 transition-colors"
                                                                style={{ color: 'var(--color-text-muted)' }}
                                                                aria-label="Reschedule task"
                                                            >
                                                                <Calendar size={18} />
                                                            </button>
                                                        )}
                                                        {/* Delete button */}
                                                        <button
                                                            onClick={() => deleteTodo(todo.id)}
                                                            className="p-2 hover:text-red-600 transition-colors"
                                                            style={{ color: 'var(--color-text-muted)' }}
                                                            aria-label={t('tasks.delete_label')}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
