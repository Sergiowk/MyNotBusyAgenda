import { useState } from 'react';
import { useJournal } from '../hooks/useJournal';
import { Send, Trash2, Clock, X, Book, Pencil } from 'lucide-react';
import HistoryModal from '../components/HistoryModal';
import JournalArchiveModal from '../components/JournalArchiveModal';
import { useLanguage } from '../contexts/LanguageContext';

export default function Journal() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showArchive, setShowArchive] = useState(false);
    const { entries, addEntry, deleteEntry, updateEntry } = useJournal(selectedDate);
    const [input, setInput] = useState('');
    const { t } = useLanguage();

    // Editing State
    const [editingEntryId, setEditingEntryId] = useState(null);
    const [editText, setEditText] = useState('');

    const startEditing = (entry) => {
        setEditingEntryId(entry.id);
        setEditText(entry.text);
    };

    const cancelEditing = () => {
        setEditingEntryId(null);
        setEditText('');
    };

    const saveEditing = async () => {
        if (editingEntryId) {
            await updateEntry(editingEntryId, editText);
            setEditingEntryId(null);
            setEditText('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            addEntry(input);
            setInput('');
        }
    };

    const isHistoryView = !!selectedDate;

    return (
        <div className="content-container space-y-6">
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-serif font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                        {isHistoryView ? t('journal.past_title') : t('journal.title')}
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {isHistoryView
                            ? `${t('journal.past_subtitle')} ${selectedDate.toLocaleDateString()}`
                            : t('journal.subtitle')}
                    </p>
                </div>
                <div className="flex gap-2">
                    {isHistoryView && (
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="p-2 rounded-xl border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                            title={t('common.clear_filter')}
                        >
                            <X size={24} />
                        </button>
                    )}
                    {!isHistoryView && (
                        <button
                            onClick={() => setShowArchive(true)}
                            className="p-2 rounded-xl border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                            title={t('journal.view_archive')}
                        >
                            <Book size={24} />
                        </button>
                    )}
                    <button
                        onClick={() => setShowHistory(true)}
                        className="p-2 rounded-xl border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        title={t('common.view_history')}
                    >
                        <Clock size={24} />
                    </button>
                </div>
            </header>

            {!isHistoryView && (
                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('journal.placeholder')}
                        className="w-full p-4 pr-12 rounded-xl border shadow-sm focus:outline-none focus:ring-2 transition-all min-h-[120px] resize-none"
                        style={{
                            backgroundColor: 'var(--color-bg-card)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-primary)'
                        }}
                    />
                    <button
                        type="submit"
                        className="absolute right-2 bottom-2 p-2 text-white rounded-lg transition-colors"
                        style={{ backgroundColor: 'var(--color-accent)' }}
                    >
                        <Send size={20} />
                    </button>
                </form>
            )}

            <div className="space-y-4">
                {entries.length === 0 ? (
                    <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
                        <p>{isHistoryView ? t('journal.empty_past') : t('journal.empty')}</p>
                    </div>
                ) : (
                    entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="p-5 rounded-xl border shadow-sm hover:shadow-md transition-all group"
                            style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                                    {entry.updatedAt
                                        ? `${new Date(entry.updatedAt).toLocaleString()} ${t('common.edited')}`
                                        : new Date(entry.date).toLocaleString()}
                                </span>
                                {!isHistoryView && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEditing(entry)}
                                            className="p-1 hover:text-blue-600 transition-colors"
                                            style={{ color: 'var(--color-text-muted)' }}
                                            aria-label={t('common.edit')}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteEntry(entry.id)}
                                            className="p-1 hover:text-red-600 transition-colors"
                                            style={{ color: 'var(--color-text-muted)' }}
                                            aria-label={t('common.delete')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {editingEntryId === entry.id ? (
                                <div className="mt-2">
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="w-full p-2 rounded-lg border bg-transparent focus:outline-none focus:ring-2 min-h-[100px]"
                                        style={{
                                            borderColor: 'var(--color-border)',
                                            color: 'var(--color-text-primary)'
                                        }}
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button
                                            onClick={cancelEditing}
                                            className="px-3 py-1 text-sm rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                            style={{
                                                borderColor: 'var(--color-border)',
                                                color: 'var(--color-text-secondary)'
                                            }}
                                        >
                                            {t('common.cancel')}
                                        </button>
                                        <button
                                            onClick={saveEditing}
                                            className="px-3 py-1 text-sm rounded-lg text-white transition-colors"
                                            style={{ backgroundColor: 'var(--color-accent)' }}
                                        >
                                            {t('common.save')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p
                                    className="whitespace-pre-wrap"
                                    style={{
                                        color: 'var(--color-text-primary)',
                                        wordWrap: 'break-word',
                                        overflowWrap: 'break-word',
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    {entry.text}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>

            <HistoryModal
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate}
            />

            <JournalArchiveModal
                isOpen={showArchive}
                onClose={() => setShowArchive(false)}
            />
        </div>
    );
}
