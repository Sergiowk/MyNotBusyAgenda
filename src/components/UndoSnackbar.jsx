import { useEffect, useState } from 'react';
import { useUndo } from '../contexts/UndoContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Undo2 } from 'lucide-react';

export default function UndoSnackbar() {
    const { pendingDelete, undo } = useUndo();
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (pendingDelete) {
            setIsVisible(true);
            setProgress(100);

            // Animate progress bar from 100% to 0% over 5 seconds
            const startTime = Date.now();
            const duration = 5000;

            const animationFrame = () => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
                setProgress(remaining);

                if (remaining > 0) {
                    requestAnimationFrame(animationFrame);
                }
            };

            requestAnimationFrame(animationFrame);
        } else {
            // Delay hiding to allow fade-out animation
            const timeout = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timeout);
        }
    }, [pendingDelete]);

    if (!isVisible) return null;

    const message = pendingDelete?.type === 'todo'
        ? t('common.task_deleted')
        : t('common.entry_deleted');

    return (
        <div
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300"
            style={{
                opacity: pendingDelete ? 1 : 0,
                transform: pendingDelete
                    ? 'translateY(0)'
                    : 'translateY(20px)',
            }}
        >
            <div
                className="min-w-[300px] max-w-md rounded-xl shadow-2xl overflow-hidden"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
                {/* Progress bar */}
                <div className="h-1 bg-gray-200 dark:bg-gray-700">
                    <div
                        className="h-full transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%`, backgroundColor: '#d1bd9f' }}
                    />
                </div>

                {/* Content */}
                <div className="flex items-center justify-between gap-4 p-4">
                    <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        {message}
                    </span>
                    <button
                        onClick={undo}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                        style={{
                            backgroundColor: 'var(--color-accent)',
                            color: 'white'
                        }}
                    >
                        <Undo2 size={16} />
                        {t('common.undo')}
                    </button>
                </div>
            </div>
        </div>
    );
}
