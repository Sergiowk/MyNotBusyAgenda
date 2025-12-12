import { Plus, Minus, Trash2, Edit2, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function HabitItem({ habit, logValue, onLog, onDelete }) {
    const { t } = useLanguage();
    const current = logValue || 0;
    const { name, target, unit, type } = habit;

    // Calculate progress percentage
    const progress = Math.min(100, Math.max(0, (current / target) * 100));

    // Determine color based on type and completion
    // Count/Time: Green when reached target.
    // Limit: Green while under target, Red when exceeded.
    let progressColor = 'var(--color-accent)';
    if (type === 'limit') {
        progressColor = current > target ? '#ef4444' : '#22c55e'; // Red if over, Green if under
    } else {
        progressColor = current >= target ? '#22c55e' : 'var(--color-accent)';
    }

    const handleIncrement = () => {
        const step = type === 'time' ? 15 : 1; // Default 15 mins for time, 1 for count
        onLog(habit.id, current + step);
    };

    const handleDecrement = () => {
        const step = type === 'time' ? 15 : 1;
        onLog(habit.id, Math.max(0, current - step));
    };

    return (
        <div
            className="p-4 rounded-xl border mb-3 transition-all"
            style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
            }}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-medium text-lg">{name}</h3>
                    <div className="text-sm opacity-70">
                        {current} / {target} {unit || (type === 'time' ? 'min' : '')}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onDelete(habit.id)}
                        className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden mb-3">
                <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{
                        width: `${progress}%`,
                        backgroundColor: progressColor
                    }}
                />
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center bg-[var(--color-bg-secondary)] rounded-lg p-1">
                <button
                    onClick={handleDecrement}
                    className="p-2 rounded-md hover:bg-[var(--color-bg-primary)] transition-colors w-12 flex justify-center"
                    disabled={current <= 0}
                >
                    <Minus size={18} />
                </button>

                <span className="text-sm font-medium opacity-80">
                    {type === 'time' ? '15 min' : '1 unit'}
                </span>

                <button
                    onClick={handleIncrement}
                    className="p-2 rounded-md hover:bg-[var(--color-bg-primary)] transition-colors w-12 flex justify-center"
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>
    );
}
