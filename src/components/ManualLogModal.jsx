import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Check } from 'lucide-react';

export default function ManualLogModal({ isOpen, onClose, onSave, habit }) {
    const { t } = useLanguage();
    const [value, setValue] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setValue('');
            // Focus input after a short delay to ensure modal is rendered
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const num = parseInt(value);
        if (!isNaN(num)) {
            onSave(num);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-[var(--color-bg-card)] rounded-2xl shadow-xl w-full max-w-sm border p-6 animate-in zoom-in-95 duration-200"
                style={{ borderColor: 'var(--color-border)' }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-serif font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        {t('habits.manual_modal_title') || "Add the units here"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 opacity-70" style={{ color: 'var(--color-text-primary)' }}>
                            {habit.name}
                        </label>
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full p-4 text-2xl font-bold bg-[var(--color-bg-secondary)] rounded-xl outline-none text-center"
                                style={{ color: 'var(--color-text-primary)' }}
                                placeholder="0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm opacity-50 font-medium">
                                {habit.unit || (habit.type === 'time' ? 'min' : 'units')}
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!value}
                        className="w-full py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'var(--color-accent)' }}
                    >
                        {t('common.save') || "Save"}
                    </button>
                </form>
            </div>
        </div>
    );
}
