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
                <h1 className="text-4xl font-serif font-bold text-brown-900 dark:text-white tracking-tight">Tasks</h1>
                <p className="text-brown-600 dark:text-gray-300 mt-1">Organize your day.</p>
            </header>

            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full p-4 pr-12 rounded-xl bg-white dark:bg-gray-700 border border-beige-200 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-brown-600 dark:focus:ring-brown-400 focus:border-transparent transition-all text-brown-800 dark:text-white placeholder-brown-400 dark:placeholder-gray-400"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brown-700 dark:bg-brown-600 text-white rounded-lg hover:bg-brown-800 dark:hover:bg-brown-700 transition-colors"
                >
                    <Plus size={20} />
                </button>
            </form>

            <div className="space-y-3">
                {todos.length === 0 ? (
                    <div className="text-center py-12 text-brown-400 dark:text-gray-400">
                        <p>No tasks yet. Add one above!</p>
                    </div>
                ) : (
                    todos.map((todo) => (
                        <div
                            key={todo.id}
                            className={clsx(
                                "group flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-700 border border-beige-200 dark:border-gray-600 shadow-sm transition-all hover:shadow-md",
                                todo.completed && "bg-beige-100 dark:bg-gray-800 opacity-75"
                            )}
                        >
                            <button
                                onClick={() => toggleTodo(todo.id)}
                                className="flex items-center gap-3 flex-1 text-left"
                            >
                                {todo.completed ? (
                                    <CheckCircle className="text-green-600 dark:text-green-500" size={24} />
                                ) : (
                                    <Circle className="text-brown-300 dark:text-gray-500 group-hover:text-brown-600 dark:group-hover:text-brown-400 transition-colors" size={24} />
                                )}
                                <span
                                    className={clsx(
                                        "text-lg transition-all",
                                        todo.completed ? "text-brown-400 dark:text-gray-500 line-through" : "text-brown-800 dark:text-white"
                                    )}
                                >
                                    {todo.text}
                                </span>
                            </button>

                            <button
                                onClick={() => deleteTodo(todo.id)}
                                className="p-2 text-brown-300 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
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
