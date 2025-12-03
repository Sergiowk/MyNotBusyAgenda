import { useState } from 'react';
import { useFocus } from '../hooks/useFocus';
import { useTodos } from '../hooks/useTodos';
import { Link } from 'react-router-dom';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export default function Dashboard() {
    const { focus, setFocusText, toggleFocus } = useFocus();
    const { todos } = useTodos();
    const [isEditing, setIsEditing] = useState(!focus.text);

    const pendingTodos = todos.filter(t => !t.completed).length;

    const handleFocusSubmit = (e) => {
        e.preventDefault();
        setIsEditing(false);
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-serif font-bold text-brown-900 dark:text-white tracking-tight">Good Morning</h1>
                <p className="text-brown-600 dark:text-gray-300 mt-1">Ready for a clear mind?</p>
            </header>

            <div className="p-6 bg-beige-200 dark:bg-gray-700 rounded-2xl border border-beige-300 dark:border-gray-600">
                <h2 className="text-lg font-semibold text-brown-900 dark:text-white mb-4">Focus for Today</h2>

                {isEditing ? (
                    <form onSubmit={handleFocusSubmit}>
                        <input
                            type="text"
                            value={focus.text}
                            onChange={(e) => setFocusText(e.target.value)}
                            placeholder="What is your main goal?"
                            className="w-full p-3 rounded-lg border border-beige-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-600 dark:focus:ring-brown-400 bg-white dark:bg-gray-800 text-brown-800 dark:text-white"
                            autoFocus
                            onBlur={() => { if (focus.text) setIsEditing(false); }}
                        />
                    </form>
                ) : (
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={toggleFocus}>
                        <button className="text-brown-700 dark:text-brown-400">
                            {focus.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                        </button>
                        <span
                            className={clsx(
                                "text-xl font-medium text-brown-900 dark:text-white flex-1",
                                focus.completed && "line-through opacity-75"
                            )}
                        >
                            {focus.text}
                        </span>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                            className="text-xs text-brown-500 dark:text-brown-400 hover:text-brown-700 dark:hover:text-brown-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            Edit
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Link to="/todos" className="p-5 rounded-2xl bg-white dark:bg-gray-700 border border-beige-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all">
                    <h3 className="text-brown-600 dark:text-gray-300 text-sm font-medium mb-1">Tasks</h3>
                    <p className="text-2xl font-bold text-brown-900 dark:text-white">{pendingTodos} Pending</p>
                    <div className="mt-4 flex items-center text-brown-700 dark:text-brown-400 text-sm font-medium">
                        View Tasks <ArrowRight size={16} className="ml-1" />
                    </div>
                </Link>

                <Link to="/journal" className="p-5 rounded-2xl bg-white dark:bg-gray-700 border border-beige-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all">
                    <h3 className="text-brown-600 dark:text-gray-300 text-sm font-medium mb-1">Journal</h3>
                    <p className="text-2xl font-bold text-brown-900 dark:text-white">Reflect</p>
                    <div className="mt-4 flex items-center text-brown-700 dark:text-brown-400 text-sm font-medium">
                        Write <ArrowRight size={16} className="ml-1" />
                    </div>
                </Link>
            </div>
        </div>
    );
}
