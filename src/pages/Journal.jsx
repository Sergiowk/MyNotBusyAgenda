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
                <h1 className="text-4xl font-serif font-bold text-brown-900 dark:text-white tracking-tight">Journal</h1>
                <p className="text-brown-600 dark:text-gray-300 mt-1">Reflect on your thoughts.</p>
            </header>

            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full p-4 pr-12 rounded-xl bg-white dark:bg-gray-700 border border-beige-200 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-brown-600 dark:focus:ring-brown-400 focus:border-transparent transition-all min-h-[120px] resize-none text-brown-800 dark:text-white placeholder-brown-400 dark:placeholder-gray-400"
                />
                <button
                    type="submit"
                    className="absolute right-2 bottom-2 p-2 bg-brown-700 dark:bg-brown-600 text-white rounded-lg hover:bg-brown-800 dark:hover:bg-brown-700 transition-colors"
                >
                    <Send size={20} />
                </button>
            </form>

            <div className="space-y-4">
                {entries.length === 0 ? (
                    <div className="text-center py-12 text-brown-400 dark:text-gray-400">
                        <p>No entries yet. Start writing!</p>
                    </div>
                ) : (
                    entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="p-5 rounded-xl bg-white dark:bg-gray-700 border border-beige-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium text-brown-500 dark:text-gray-400">
                                    {new Date(entry.date).toLocaleString()}
                                </span>
                                <button
                                    onClick={() => deleteEntry(entry.id)}
                                    className="text-brown-300 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <p className="text-brown-800 dark:text-white whitespace-pre-wrap">{entry.text}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
