import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
    const { user } = useAuth();
    const [settings, setSettingsState] = useState({
        startOfWeek: 'monday' // 'monday' or 'sunday'
    });

    const updateSettings = async (newSettings) => {
        setSettingsState(prev => ({ ...prev, ...newSettings }));

        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                    preferences: newSettings
                }, { merge: true });
            } catch (error) {
                console.error("Error updating settings:", error);
            }
        } else {
            localStorage.setItem('my_not_busy_agenda_settings', JSON.stringify({ ...settings, ...newSettings }));
        }
    };

    // Load from local storage initially
    useEffect(() => {
        const saved = localStorage.getItem('my_not_busy_agenda_settings');
        if (saved) {
            setSettingsState(prev => ({ ...prev, ...JSON.parse(saved) }));
        }
    }, []);


    // Sync with Firestore on login
    useEffect(() => {
        const syncSettings = async () => {
            if (!user) return;

            try {
                const userRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists() && docSnap.data().preferences) {
                    const prefs = docSnap.data().preferences;
                    // Merge DB prefs with current state, DB takes precedence if exists
                    if (prefs.startOfWeek) {
                        setSettingsState(prev => ({ ...prev, startOfWeek: prefs.startOfWeek }));
                    }
                } else {
                    // Save local defaults to DB if new user/no prefs
                    await setDoc(userRef, {
                        preferences: settings
                    }, { merge: true });
                }
            } catch (error) {
                console.error("Error syncing settings:", error);
            }
        };

        syncSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
