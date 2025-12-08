import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const { user } = useAuth();
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('my_not_busy_agenda_theme');
        return saved ? JSON.parse(saved) : false;
    });

    // Apply theme to DOM
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('my_not_busy_agenda_theme', JSON.stringify(isDark));
    }, [isDark]);

    // Sync with Firestore
    useEffect(() => {
        const syncTheme = async () => {
            if (!user) return;

            try {
                const userRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists() && docSnap.data().preferences?.theme !== undefined) {
                    // Load from DB if exists
                    const dbTheme = docSnap.data().preferences.theme;
                    if (dbTheme !== isDark) {
                        setIsDark(dbTheme === 'dark');
                    }
                } else {
                    // Save local to DB if not exists
                    await setDoc(userRef, {
                        preferences: { theme: isDark ? 'dark' : 'light' }
                    }, { merge: true });
                }
            } catch (error) {
                console.error("Error syncing theme:", error);
            }
        };

        syncTheme();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]); // Sync on user login

    // Update DB when theme changes (if user logged in)
    const toggleDarkMode = async () => {
        const newMode = !isDark;
        setIsDark(newMode);

        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                    preferences: { theme: newMode ? 'dark' : 'light' }
                }, { merge: true });
            } catch (error) {
                console.error("Error updating theme:", error);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
