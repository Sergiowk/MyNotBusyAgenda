import { useState, useEffect } from 'react';

const STORAGE_KEY = 'my_not_busy_agenda_theme';

export function useDarkMode() {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(isDark));
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    const toggleDarkMode = () => setIsDark(!isDark);

    return { isDark, toggleDarkMode };
}
