import { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, Circle, Calendar, Trash2, Pencil, MoreVertical } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useIncompleteTodos } from '../hooks/useIncompleteTodos';
import DatePickerButton from './DatePickerButton';
import clsx from 'clsx';

const TaskItem = ({ todo, t, toggleTodo, startEditing, isEditing, editText, setEditText, saveEdit, handleEditKeyDown, deleteTodo, rescheduleTodo, reschedulingTask, setReschedulingTask }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const textareaRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isMenuOpen]);

    // Auto-resize textarea for editing
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            // Focus and move cursor to end
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
        }
    }, [isEditing, editText]);

    return (
        <div
            className="flex items-center justify-between rounded-xl border shadow-sm transition-all hover:shadow-md p-3 relative"
            style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)'
            }}
        >
            {/* Task content */}
            <div className="flex items-start gap-3 flex-1 text-left min-w-0">
                <button
                    onClick={() => toggleTodo(todo.id)}
                    className="mt-0.5 flex-shrink-0"
                >
                    <Circle
                        size={20}
                        style={{ color: 'var(--color-text-muted)' }}
                    />
                </button>

                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <textarea
                            ref={textareaRef}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    saveEdit();
                                }
                                handleEditKeyDown(e);
                            }}
                            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 px-1 py-0.5 resize-none overflow-hidden"
                            rows={1}
                            style={{ color: 'var(--color-text-primary)' }}
                        />
                    ) : (
                        <button
                            onClick={() => toggleTodo(todo.id)}
                            className="text-left w-full"
                        >
                            <span
                                className="text-base block"
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
                    )}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 ml-2 relative">
                {reschedulingTask === todo.id ? (
                    <DatePickerButton
                        selectedDate={null}
                        onDateChange={(newDate) => {
                            if (newDate) {
                                rescheduleTodo(todo.id, newDate);
                            }
                            setReschedulingTask(null);
                        }}
                        onClose={() => setReschedulingTask(null)}
                        autoOpen={true}
                    />
                ) : (
                    <div ref={menuRef} className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                            style={{ color: 'var(--color-text-muted)' }}
                            aria-label="More options"
                        >
                            <MoreVertical size={18} />
                        </button>

                        {isMenuOpen && (
                            <div
                                className="absolute right-0 top-full mt-1 w-32 rounded-xl shadow-lg border overflow-hidden z-10"
                                style={{
                                    backgroundColor: 'var(--color-bg-card)',
                                    borderColor: 'var(--color-border)',
                                }}
                            >
                                <button
                                    onClick={() => {
                                        startEditing(todo);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    style={{ color: 'var(--color-text-primary)' }}
                                >
                                    <Pencil size={14} />
                                    {t('tasks.edit_label')}
                                </button>
                                <button
                                    onClick={() => {
                                        setReschedulingTask(todo.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    style={{ color: 'var(--color-text-primary)' }}
                                >
                                    <Calendar size={14} />
                                    {t('common.reschedule') || 'Reschedule'}
                                </button>
                                <button
                                    onClick={() => {
                                        deleteTodo(todo.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-red-500/10 text-red-600 transition-colors"
                                >
                                    <Trash2 size={14} />
                                    {t('tasks.delete_label')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function IncompleteTasksModal({ isOpen, onClose }) {
    const { t } = useLanguage();
    const { incompleteTodos, groupedTodos, toggleTodo, deleteTodo, rescheduleTodo, updateTodoText } = useIncompleteTodos();
    const [reschedulingTask, setReschedulingTask] = useState(null);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editText, setEditText] = useState('');

    const startEditing = (todo) => {
        setEditingTaskId(todo.id);
        setEditText(todo.text);
    };

    const saveEdit = () => {
        if (editingTaskId && editText.trim()) {
            updateTodoText(editingTaskId, editText);
            setEditingTaskId(null);
            setEditText('');
        }
    };

    const cancelEdit = () => {
        setEditingTaskId(null);
        setEditText('');
    };

    const handleEditKeyDown = (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    };

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
                                                <TaskItem
                                                    key={todo.id}
                                                    todo={todo}
                                                    t={t}
                                                    toggleTodo={toggleTodo}
                                                    startEditing={startEditing}
                                                    isEditing={editingTaskId === todo.id}
                                                    editText={editText}
                                                    setEditText={setEditText}
                                                    saveEdit={saveEdit}
                                                    handleEditKeyDown={handleEditKeyDown}
                                                    deleteTodo={deleteTodo}
                                                    rescheduleTodo={rescheduleTodo}
                                                    reschedulingTask={reschedulingTask}
                                                    setReschedulingTask={setReschedulingTask}
                                                />
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
