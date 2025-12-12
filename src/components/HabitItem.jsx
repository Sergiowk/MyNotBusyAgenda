import { useState, useRef, useEffect } from 'react';
import { Plus, Minus, Trash2, Edit2, MoreVertical, Pencil } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import clsx from 'clsx';

export default function HabitItem({ habit, logValue, onLog, onDelete, onEdit }) {
    const { t } = useLanguage();
    const current = logValue || 0;
    const { name, target, unit, type } = habit;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const [menuPosition, setMenuPosition] = useState('bottom');

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

    const toggleMenu = () => {
        if (!isMenuOpen) {
            // Check space below
            if (menuRef.current) {
                const rect = menuRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                setMenuPosition(spaceBelow < 150 ? 'top' : 'bottom');
            }
        }
        setIsMenuOpen(!isMenuOpen);
    };

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
        const step = type === 'time' ? 15 : 1;
        onLog(habit.id, current + step);
    };

    const handleDecrement = () => {
        const step = type === 'time' ? 15 : 1;
        onLog(habit.id, Math.max(0, current - step));
    };

    return (
        <div
            className="p-4 rounded-xl border mb-3 transition-all relative"
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

                {/* Menu */}
                <div ref={menuRef} className="relative z-10">
                    <button
                        onClick={toggleMenu}
                        className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] transition-colors"
                    >
                        <MoreVertical size={20} />
                    </button>

                    {isMenuOpen && (
                        <div
                            className={clsx(
                                "absolute right-0 w-32 rounded-xl shadow-lg border overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100",
                                menuPosition === 'top' ? "bottom-full mb-2" : "top-full mt-1"
                            )}
                            style={{
                                backgroundColor: 'var(--color-bg-card)',
                                borderColor: 'var(--color-border)',
                            }}
                        >
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onEdit(habit);
                                }}
                                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                style={{ color: 'var(--color-text-primary)' }}
                            >
                                <Pencil size={14} />
                                {t('common.edit') || 'Edit'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onDelete(habit.id);
                                }}
                                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-red-500/10 text-red-600 transition-colors"
                            >
                                <Trash2 size={14} />
                                {t('common.delete') || 'Delete'}
                            </button>
                        </div>
                    )}
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
