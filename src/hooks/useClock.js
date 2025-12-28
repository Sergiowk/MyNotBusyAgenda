import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function useClock() {
    const [time, setTime] = useState(new Date());
    const { t, language } = useLanguage();

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hour = time.getHours();
        if (hour < 12) return t('dashboard.greeting.morning');
        if (hour < 18) return t('dashboard.greeting.afternoon');
        return t('dashboard.greeting.evening');
    };

    const formatTime = () => {
        return time.toLocaleTimeString(language, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDate = () => {
        const weekday = time.toLocaleDateString(language, { weekday: 'long' });
        const day = time.getDate().toString().padStart(2, '0');
        const month = (time.getMonth() + 1).toString().padStart(2, '0');
        const year = time.getFullYear();
        return `${weekday} ${day}/${month}/${year}`;
    };

    return { time, greeting: getGreeting(), formattedTime: formatTime(), formattedDate: formatDate() };
}
