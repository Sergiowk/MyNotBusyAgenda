import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../constants/translations';
import { useAuth } from './AuthContext';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const { user } = useAuth();
    const [language, setLanguageState] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });

    const setLanguage = async (newLang) => {
        setLanguageState(newLang);
        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                    preferences: { language: newLang }
                }, { merge: true });
            } catch (error) {
                console.error("Error updating language:", error);
            }
        }
    }

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    // Sync with Firestore on login
    useEffect(() => {
        const syncLanguage = async () => {
            if (!user) return;
            try {
                const userRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists() && docSnap.data().preferences?.language) {
                    const dbLang = docSnap.data().preferences.language;
                    if (dbLang !== language) {
                        setLanguageState(dbLang);
                    }
                } else {
                    // Save local to DB
                    await setDoc(userRef, {
                        preferences: { language: language }
                    }, { merge: true });
                }
            } catch (error) {
                console.error("Error syncing language:", error);
            }
        };
        syncLanguage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const t = (path) => {
        const keys = path.split('.');
        let current = translations[language];

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation missing for key: ${path} in language: ${language}`);
                return path;
            }
            current = current[key];
        }

        return current;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
