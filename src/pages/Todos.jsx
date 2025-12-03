import { useState } from 'react';
import { useTodos } from '../hooks/useTodos';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import clsx from 'clsx';

export default function Todos() {
    const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            addTodo(input);
            setInput('');
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-4xl font-serif font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Tasks</h1>
                <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>Organize your day.</p>
            </header>

            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full p-4 pr-12 rounded-xl border shadow-sm focus:outline-none focus:ring-2 transition-all"
                    style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                    }}
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                >
                    <Plus size={20} />
                </button>
            </form>

            <div className="space-y-3">
                {todos.length === 0 ? (
                    <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
                        <p>No tasks yet. Add one above!</p>
                    </div>
                ) : (
                    todos.map((todo) => (
                        <div
                            key={todo.id}
                            className={clsx(
                                "group flex items-center justify-between p-4 rounded-xl border shadow-sm transition-all hover:shadow-md",
                                todo.completed && "opacity-75"
                            )}
                            style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                        >
                            <button
                                onClick={() => toggleTodo(todo.id)}
                                className="flex items-center gap-3 flex-1 text-left"
                            >
                                {todo.completed ? (
                                    <CheckCircle className="text-green-600" size={24} />
                                ) : (
                                    <Circle size={24} style={{ color: 'var(--color-text-muted)' }} />
                                )}
                                <span
                                    className={clsx("text-lg transition-all", todo.completed && "line-through")}
                                    style={{ color: todo.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}
                                >
                                    {todo.text}
                                </span>
                            </button>

                            <button
                                onClick={() => deleteTodo(todo.id)}
                                className="p-2 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                style={{ color: 'var(--color-text-muted)' }}
                                aria-label="Delete task"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
