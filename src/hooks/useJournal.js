import { useState, useEffect } from 'react';

const STORAGE_KEY = 'my_not_busy_agenda_journal';

export function useJournal() {
    const [entries, setEntries] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }, [entries]);

    const addEntry = (text) => {
        if (!text.trim()) return;
        setEntries([
            {
                id: Date.now().toString(),
                text,
                date: new Date().toISOString(),
            },
            ...entries,
        ]);
    };

    const deleteEntry = (id) => {
        setEntries(entries.filter((entry) => entry.id !== id));
    };

    return { entries, addEntry, deleteEntry };
}
