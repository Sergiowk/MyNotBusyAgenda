import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { useTodos } from '../hooks/useTodos';
import { Plus, Trash2, CheckCircle, Circle, Clock, X, Calendar, List, Pencil, MoreVertical } from 'lucide-react';
import clsx from 'clsx';
import HistoryModal from '../components/HistoryModal';
import IncompleteTasksModal from '../components/IncompleteTasksModal';
import DatePickerButton from '../components/DatePickerButton';
import { useLanguage } from '../contexts/LanguageContext';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, TouchSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Helper component for rendering task item
const TaskItem = memo(({ todo, toggleTodo, startEditing, editingTaskId, editText, setEditText, saveEdit, handleEditKeyDown, isOverdue, t, isHistoryView, deleteTodo, rescheduleTodo, reschedulingTask, setReschedulingTask }) => {
    const isEditing = editingTaskId === todo.id;
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

    // Helper for menu positioning
    const [menuPosition, setMenuPosition] = useState('bottom'); // 'bottom' or 'top'

    const toggleMenu = () => {
        if (!isMenuOpen) {
            // Check space below before opening
            if (menuRef.current) {
                const rect = menuRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                // If less than 150px below, open upwards
                setMenuPosition(spaceBelow < 150 ? 'top' : 'bottom');
            }
        }
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div
            className={clsx(
                "group flex items-center justify-between rounded-xl border shadow-sm transition-all hover:shadow-md relative",
                isMenuOpen && "z-50",
                isOverdue ? "p-5" : "p-4"
            )}
            style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
                touchAction: 'none'
            }}
        >
            <div className={clsx("flex items-start gap-3 flex-1 text-left min-w-0", todo.completed && "opacity-75")}>
                <div onPointerDown={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => toggleTodo(todo.id, todo.completed)}
                        className="mt-0.5 flex-shrink-0 cursor-pointer"
                        style={{ pointerEvents: 'auto' }}
                    >
                        {todo.completed ? (
                            <CheckCircle className="text-green-600" size={24} />
                        ) : (
                            <Circle size={24} style={{ color: 'var(--color-text-muted)' }} />
                        )}
                    </button>
                </div>

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
                            onClick={() => toggleTodo(todo.id, todo.completed)}
                            className="text-left w-full"
                        >
                            <span
                                className={clsx("text-lg transition-all block", todo.completed && "line-through opacity-50 font-light")}
                                style={{
                                    color: todo.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word',
                                    wordBreak: 'break-word'
                                }}
                            >
                                {todo.text}
                            </span>
                        </button>
                    )}

                    {isOverdue && !editingTaskId && (
                        <span className="text-sm mt-1 block" style={{ color: '#ef4444' }}>
                            {t('tasks.created')}: {isOverdue.toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>

            {!isHistoryView && (
                <div className="flex items-center gap-1 ml-2 relative" onPointerDown={(e) => e.stopPropagation()}>
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
                                onClick={toggleMenu}
                                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                                style={{ color: 'var(--color-text-muted)' }}
                                aria-label="More options"
                            >
                                <MoreVertical size={20} />
                            </button>

                            {isMenuOpen && (
                                <div
                                    className={clsx(
                                        "absolute right-0 w-40 rounded-xl shadow-lg border overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-100",
                                        menuPosition === 'top' ? "bottom-full mb-2" : "top-full mt-1"
                                    )}
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
                                            deleteTodo(todo.id, todo);
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
            )}
        </div>
    );
});

// Sortable wrapper
const SortableTaskItem = memo((props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.todo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none', // Crucial for touch drag
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskItem {...props} />
        </div>
    );
});

export default function Todos() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showIncompleteTasks, setShowIncompleteTasks] = useState(false);
    const [taskDate, setTaskDate] = useState(null); // Date for new task creation
    const { todos, addTodo, toggleTodo, deleteTodo, rescheduleTodo, updateTodoText, reorderTodos } = useTodos(selectedDate);
    const [input, setInput] = useState('');
    const [reschedulingTask, setReschedulingTask] = useState(null); // Track which task is being rescheduled
    const { t } = useLanguage();
    const textareaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 200, // Wait 200ms before drag starts, allows clicking
                tolerance: 5, // Movement tolerance
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Editing state
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editText, setEditText] = useState('');

    const startEditing = useCallback((todo) => {
        setEditingTaskId(todo.id);
        setEditText(todo.text);
    }, []);

    const saveEdit = useCallback(() => {
        if (editingTaskId && editText.trim()) {
            updateTodoText(editingTaskId, editText);
            setEditingTaskId(null);
            setEditText('');
        }
    }, [editingTaskId, editText, updateTodoText]);

    const cancelEdit = useCallback(() => {
        setEditingTaskId(null);
        setEditText('');
    }, []);

    const handleEditKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    }, [saveEdit, cancelEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            // If taskDate is selected, set the time to start of day, otherwise use current date/time
            const dateToUse = taskDate ? new Date(taskDate.setHours(0, 0, 0, 0)) : null;
            addTodo(input, 'general', dateToUse);
            setInput('');
            setTaskDate(null); // Reset date after adding task
        }
    };

    const isHistoryView = !!selectedDate;

    // Determine if selected date is past or future
    const isFutureDate = selectedDate && (() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);
        return selected.getTime() > today.getTime();
    })();

    // Sort and filter todos
    const isTaskOverdue = (todo) => {
        const todoDate = new Date(todo.createdAt.toDate());
        todoDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return !todo.completed && todoDate.getTime() < today.getTime() ? todoDate : false;
    };

    const activeTodos = todos
        .filter(t => !t.completed)
        .sort((a, b) => {
            // Sort by order if available, otherwise createdAt
            if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
            }
            return (a.order || 0) - (b.order || 0);
        });

    const completedTodos = todos.filter(t => t.completed);

    // Handlers
    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = activeTodos.findIndex((t) => t.id === active.id);
            const newIndex = activeTodos.findIndex((t) => t.id === over.id);

            const newOrder = arrayMove(activeTodos, oldIndex, newIndex);
            reorderTodos(newOrder);
        }
    };

    // Colors helper
    const colors = {}; // Placeholder if you had color theming passed down

    return (
        <div className="content-container space-y-6">
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-serif font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                        {isHistoryView
                            ? (isFutureDate ? t('tasks.future_title') : t('tasks.past_title'))
                            : t('tasks.title')}
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {isHistoryView
                            ? `${isFutureDate ? t('tasks.future_subtitle') : t('tasks.past_subtitle')} ${selectedDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
                            : t('tasks.subtitle')}
                    </p>
                </div>
                <div className="flex gap-2">
                    {isHistoryView && (
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="p-2 rounded-xl border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                            title={t('common.clear_filter')}
                        >
                            <X size={24} />
                        </button>
                    )}
                    {!isHistoryView && (
                        <button
                            onClick={() => setShowIncompleteTasks(true)}
                            className="p-2 rounded-xl border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                            title={t('tasks.view_incomplete')}
                        >
                            <List size={24} />
                        </button>
                    )}
                    <button
                        onClick={() => setShowHistory(true)}
                        className="p-2 rounded-xl border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        title={t('common.view_history')}
                    >
                        <Clock size={24} />
                    </button>
                </div>
            </header>

            {!isHistoryView && (
                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('tasks.placeholder')}
                        className="w-full p-4 pr-32 rounded-xl border shadow-sm focus:outline-none focus:ring-2 transition-all resize-none overflow-hidden min-h-[3.5rem]"
                        rows={1}
                        style={{
                            backgroundColor: 'var(--color-bg-card)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-primary)'
                        }}
                    />
                    <div className="absolute right-2 bottom-3 flex items-center gap-1">
                        <DatePickerButton
                            selectedDate={taskDate}
                            onDateChange={setTaskDate}
                        />
                        <div className="w-px h-6 mx-1" style={{ backgroundColor: 'var(--color-border)' }} />
                        <button
                            type="submit"
                            className="p-2 text-white rounded-lg transition-colors"
                            style={{ backgroundColor: 'var(--color-accent)' }}
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {todos.length === 0 ? (
                    <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
                        <p>{isHistoryView ? t('tasks.empty_past') : t('tasks.empty')}</p>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={activeTodos.map(t => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {activeTodos.map(todo => (
                                    <SortableTaskItem
                                        key={todo.id}
                                        todo={todo}
                                        toggleTodo={toggleTodo}
                                        startEditing={startEditing}
                                        editingTaskId={editingTaskId}
                                        editText={editingTaskId === todo.id ? editText : undefined}
                                        setEditText={setEditText}
                                        saveEdit={saveEdit}
                                        handleEditKeyDown={handleEditKeyDown}
                                        isOverdue={isTaskOverdue(todo)}
                                        t={t}
                                        colors={colors}
                                        isHistoryView={isHistoryView}
                                        deleteTodo={deleteTodo}
                                        rescheduleTodo={rescheduleTodo}
                                        reschedulingTask={reschedulingTask}
                                        setReschedulingTask={setReschedulingTask}
                                    />
                                ))}
                            </div>
                        </SortableContext>

                        {/* Completed tasks section */}
                        {completedTodos.length > 0 && (
                            <div className="space-y-3 mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
                                <h3 className="text-sm font-medium opacity-50 px-2" style={{ color: 'var(--color-text-secondary)' }}>
                                    {t('tasks.completed_section') || 'Completed'}
                                </h3>
                                {completedTodos.map(todo => (
                                    <TaskItem
                                        key={todo.id}
                                        todo={todo}
                                        toggleTodo={toggleTodo}
                                        startEditing={startEditing}
                                        editingTaskId={editingTaskId}
                                        editText={editingTaskId === todo.id ? editText : undefined}
                                        setEditText={setEditText}
                                        saveEdit={saveEdit}
                                        handleEditKeyDown={handleEditKeyDown}
                                        isOverdue={false}
                                        t={t}
                                        colors={colors}
                                        isHistoryView={isHistoryView}
                                        deleteTodo={deleteTodo}
                                        rescheduleTodo={rescheduleTodo}
                                        reschedulingTask={reschedulingTask}
                                        setReschedulingTask={setReschedulingTask}
                                    />
                                ))}
                            </div>
                        )}
                    </DndContext>
                )}
            </div>

            <HistoryModal
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate}
            />

            {showIncompleteTasks && (
                <IncompleteTasksModal
                    isOpen={true}
                    onClose={() => setShowIncompleteTasks(false)}
                />
            )}
        </div>
    );
}
