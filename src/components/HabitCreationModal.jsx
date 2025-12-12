import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Check, Activity, Clock, Ban } from 'lucide-react';

export default function HabitCreationModal({ isOpen, onClose, onSave }) {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [type, setType] = useState('count'); // count, time, limit
    const [target, setTarget] = useState(1);
    const [unit, setUnit] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            await onSave({
                name: name.trim(),
                type,
                target: Number(target),
                unit: unit.trim()
            });
            // Reset and close
            setName('');
            setType('count');
            setTarget(1);
            setUnit('');
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (t) => {
        switch (t) {
            case 'count': return <Activity size={18} />;
            case 'time': return <Clock size={18} />;
            case 'limit': return <Ban size={18} />;
            default: return <Activity size={18} />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="w-full max-w-md rounded-2xl border shadow-xl animate-in fade-in zoom-in duration-200"
                style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                }}
            >
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <h2 className="text-xl font-semibold">{t('habits.create_new') || 'New Habit'}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                {t('habits.name_label') || 'Habit Name'}
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('habits.name_placeholder') || 'e.g., Drink Water'}
                                required
                                className="w-full px-4 py-2 rounded-lg border bg-[var(--color-bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                            />
                        </div>

                        {/* Type Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                {t('habits.type_label') || 'Type'}
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['count', 'time', 'limit'].map((typeOption) => (
                                    <button
                                        key={typeOption}
                                        type="button"
                                        onClick={() => setType(typeOption)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${type === typeOption
                                                ? 'bg-[var(--color-accent)] text-white border-transparent'
                                                : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-primary)]'
                                            }`}
                                        style={type !== typeOption ? { borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' } : {}}
                                    >
                                        {getTypeIcon(typeOption)}
                                        <span className="text-xs mt-1 capitalize">{t(`habits.type_${typeOption}`) || typeOption}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Target & Unit */}
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                    {t('habits.target_label') || 'Target'}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border bg-[var(--color-bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                    {t('habits.unit_label') || 'Unit (Optional)'}
                                </label>
                                <input
                                    type="text"
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    placeholder={t('habits.unit_placeholder') || (type === 'time' ? 'minutes' : 'times')}
                                    className="w-full px-4 py-2 rounded-lg border bg-[var(--color-bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="w-full mt-4 py-2 px-4 rounded-lg font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff' }}
                        >
                            {loading ? (t('common.saving') || 'Saving...') : (
                                <>
                                    <Check size={18} />
                                    {t('habits.create_button') || 'Create Habit'}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
