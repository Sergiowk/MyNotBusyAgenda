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

    return { time, greeting: getGreeting(), formattedTime: formatTime() };
}
