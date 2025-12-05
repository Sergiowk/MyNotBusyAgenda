import { X, CheckCircle, Circle } from 'lucide-react';
import { useTodos } from '../hooks/useTodos';

import { useJournal } from '../hooks/useJournal';
import { useLanguage } from '../contexts/LanguageContext';

export default function DaySummaryModal({ isOpen, onClose, date }) {
    const { todos, toggleTodo } = useTodos(date);
    const { entries } = useJournal(date);
    const { t, language } = useLanguage();

    if (!isOpen || !date) return null;

    const handleToggle = (id) => {
        toggleTodo(id);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="relative w-full max-w-lg rounded-2xl shadow-xl overflow-hidden max-h-[80vh] flex flex-col"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
                <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {t('calendar.summary_title')} {date.toLocaleDateString(language)}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Tasks Section */}
                    <div>
                        <h3 className="text-sm font-medium mb-3 uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                            {t('calendar.tasks_section')} ({todos.length})
                        </h3>
                        {todos.length === 0 ? (
                            <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>{t('calendar.no_tasks')}</p>
                        ) : (
                            <ul className="space-y-2">
                                {todos.map(todo => (
                                    <li key={todo.id}>
                                        <button
                                            onClick={() => handleToggle(todo.id)}
                                            className="flex items-start gap-2 text-sm w-full text-left p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                        >
                                            {todo.completed ? (
                                                <CheckCircle size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
                                            ) : (
                                                <Circle size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                                            )}
                                            <span style={{
                                                color: 'var(--color-text-primary)',
                                                textDecoration: todo.completed ? 'line-through' : 'none',
                                                opacity: todo.completed ? 0.7 : 1
                                            }}>
                                                {todo.text}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Journal Section */}
                    <div>
                        <h3 className="text-sm font-medium mb-3 uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                            {t('calendar.journal_section')} ({entries.length})
                        </h3>
                        {entries.length === 0 ? (
                            <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>{t('calendar.no_entries')}</p>
                        ) : (
                            <div className="space-y-3">
                                {entries.map(entry => (
                                    <div key={entry.id} className="p-3 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
                                        <p className="text-xs mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                                            {new Date(entry.date).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text-primary)' }}>
                                            {entry.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
