import { useState } from 'react';
import { useJournal } from '../hooks/useJournal';
import { Send, Trash2 } from 'lucide-react';

export default function Journal() {
    const { entries, addEntry, deleteEntry } = useJournal();
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            addEntry(input);
            setInput('');
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-4xl font-serif font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Journal</h1>
                <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>Reflect on your thoughts.</p>
            </header>

            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="What's on your mind?"
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

            <div className="space-y-4">
                {entries.length === 0 ? (
                    <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
                        <p>No entries yet. Start writing!</p>
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
                                    {new Date(entry.date).toLocaleString()}
                                </span>
                                <button
                                    onClick={() => deleteEntry(entry.id)}
                                    className="hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                    style={{ color: 'var(--color-text-muted)' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <p className="whitespace-pre-wrap" style={{ color: 'var(--color-text-primary)' }}>{entry.text}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
