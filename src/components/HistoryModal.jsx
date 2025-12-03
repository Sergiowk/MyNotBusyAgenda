import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Calendar from './Calendar';

export default function HistoryModal({ isOpen, onClose, onDateSelect, selectedDate }) {
    const { t } = useLanguage();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="relative w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {t('calendar.select_date')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <Calendar onDateSelect={(date) => {
                        onDateSelect(date);
                        onClose();
                    }} selectedDate={selectedDate} />
                </div>
            </div>
        </div>
    );
}
