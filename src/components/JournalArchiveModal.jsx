import { X, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useJournal } from '../hooks/useJournal';
import { useMemo, useState } from 'react';

export default function JournalArchiveModal({ isOpen, onClose }) {
    const { t } = useLanguage();
    // Fetch all entries
    const { entries } = useJournal(null, true);
    const [collapsedMonths, setCollapsedMonths] = useState({});

    const groupedEntries = useMemo(() => {
        const groups = {};
        entries.forEach(entry => {
            const date = new Date(entry.date);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!groups[monthYear]) {
                groups[monthYear] = [];
            }
            groups[monthYear].push(entry);
        });
        return groups;
    }, [entries]);

    const toggleMonth = (monthYear) => {
        setCollapsedMonths(prev => ({
            ...prev,
            [monthYear]: !prev[monthYear]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="w-full max-w-md rounded-2xl border shadow-xl flex flex-col max-h-[80vh]"
                style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                }}
            >
                <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                    <h2 className="text-xl font-semibold">{t('journal.archive_title') || 'Journal Archive'}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                    {Object.keys(groupedEntries).length === 0 ? (
                        <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                            {t('journal.no_archived_entries') || 'No entries found.'}
                        </div>
                    ) : (
                        Object.entries(groupedEntries).map(([monthYear, monthEntries]) => (
                            <div key={monthYear} className="mb-6 last:mb-0">
                                <button
                                    onClick={() => toggleMonth(monthYear)}
                                    className="w-full text-lg font-medium mb-3 sticky top-0 py-2 backdrop-blur-sm z-10 flex items-center gap-2 hover:opacity-80 transition-opacity text-left"
                                    style={{
                                        color: 'var(--color-accent)',
                                        backgroundColor: 'var(--color-bg-card)'
                                    }}
                                >
                                    {collapsedMonths[monthYear] ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                    <Calendar size={18} />
                                    {monthYear}
                                    <span className="text-sm font-normal ml-auto opacity-70" style={{ color: 'var(--color-text-secondary)' }}>
                                        {monthEntries.length}
                                    </span>
                                </button>

                                {!collapsedMonths[monthYear] && (
                                    <div className="space-y-3 pl-4 border-l-2 animate-in slide-in-from-top-2 duration-200" style={{ borderColor: 'var(--color-border)' }}>
                                        {monthEntries.map(entry => {
                                            const displayDate = entry.updatedAt ? new Date(entry.updatedAt) : new Date(entry.date);
                                            return (
                                                <div
                                                    key={entry.id}
                                                    className="p-3 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
                                                >
                                                    <div className="text-xs font-medium mb-1 opacity-70">
                                                        {displayDate.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })} • {displayDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                        {entry.updatedAt && ` ${t('common.edited')}`}
                                                    </div>
                                                    <p className="whitespace-pre-wrap text-sm line-clamp-3">
                                                        {entry.text}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
