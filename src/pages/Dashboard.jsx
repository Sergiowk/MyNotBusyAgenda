import { useState } from 'react';
import { useFocus } from '../hooks/useFocus';
import { useTodos } from '../hooks/useTodos';
import { useClock } from '../hooks/useClock';
import { Link } from 'react-router-dom';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import Calendar from '../components/Calendar';
import clsx from 'clsx';

export default function Dashboard() {
    const { focus, setFocusText, toggleFocus } = useFocus();
    const { todos } = useTodos();
    const { greeting, formattedTime } = useClock();
    const [isEditing, setIsEditing] = useState(!focus.text);

    const pendingTodos = todos.filter(t => !t.completed).length;

    const handleFocusSubmit = (e) => {
        e.preventDefault();
        setIsEditing(false);
    };

    return (
        <div className="space-y-8">
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-serif font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>{greeting}</h1>
                    <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>Ready for a clear mind?</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-semibold tabular-nums" style={{ color: 'var(--color-text-primary)' }}>
                        {formattedTime}
                    </div>
                </div>
            </header>

            <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--color-bg-hover)', borderColor: 'var(--color-border)' }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Focus for Today</h2>

                {isEditing ? (
                    <form onSubmit={handleFocusSubmit}>
                        <input
                            type="text"
                            value={focus.text}
                            onChange={(e) => setFocusText(e.target.value)}
                            placeholder="What is your main goal?"
                            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                            style={{
                                backgroundColor: 'var(--color-bg-input)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text-primary)'
                            }}
                            autoFocus
                            onBlur={() => { if (focus.text) setIsEditing(false); }}
                        />
                    </form>
                ) : (
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={toggleFocus}>
                        <button style={{ color: 'var(--color-accent)' }}>
                            {focus.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                        </button>
                        <span
                            className={clsx("text-xl font-medium flex-1", focus.completed && "line-through opacity-75")}
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            {focus.text}
                        </span>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                            className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--color-text-tertiary)' }}
                        >
                            Edit
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Link to="/todos" className="p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                    <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Tasks</h3>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{pendingTodos} Pending</p>
                    <div className="mt-4 flex items-center text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                        View Tasks <ArrowRight size={16} className="ml-1" />
                    </div>
                </Link>

                <Link to="/journal" className="p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                    <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Journal</h3>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Reflect</p>
                    <div className="mt-4 flex items-center text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                        Write <ArrowRight size={16} className="ml-1" />
                    </div>
                </Link>
            </div>

            <Calendar />
        </div>
    );
}
