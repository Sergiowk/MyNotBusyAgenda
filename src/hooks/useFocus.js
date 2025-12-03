import { useState, useEffect } from 'react';

const STORAGE_KEY = 'my_not_busy_agenda_focus';

export function useFocus() {
    const [focus, setFocus] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Reset focus if it's a new day
            if (new Date(parsed.date).toDateString() !== new Date().toDateString()) {
                return { text: '', date: new Date().toISOString(), completed: false };
            }
            return parsed;
        }
        return { text: '', date: new Date().toISOString(), completed: false };
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(focus));
    }, [focus]);

    const setFocusText = (text) => {
        setFocus({ ...focus, text, date: new Date().toISOString() });
    };

    const toggleFocus = () => {
        setFocus({ ...focus, completed: !focus.completed });
    };

    return { focus, setFocusText, toggleFocus };
}
