import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export function useFocus() {
    const [focus, setFocus] = useState({ text: '', date: new Date().toISOString(), completed: false });
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            setFocus({ text: '', date: new Date().toISOString(), completed: false });
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const focusRef = doc(db, 'users', user.uid, 'focus', today);

        const unsubscribe = onSnapshot(focusRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setFocus({
                    text: data.text || '',
                    date: data.date?.toDate?.()?.toISOString() || data.date,
                    completed: data.completed || false
                });
            } else {
                // Reset focus if it's a new day
                setFocus({ text: '', date: new Date().toISOString(), completed: false });
            }
        });

        return unsubscribe;
    }, [user]);

    const setFocusText = async (text) => {
        if (!user) return;

        try {
            const today = new Date().toISOString().split('T')[0];
            const focusRef = doc(db, 'users', user.uid, 'focus', today);
            await setDoc(focusRef, {
                text,
                date: new Date(),
                completed: focus.completed
            }, { merge: true });
        } catch (error) {
            console.error('Error setting focus:', error);
        }
    };

    const toggleFocus = async () => {
        if (!user) return;

        try {
            const today = new Date().toISOString().split('T')[0];
            const focusRef = doc(db, 'users', user.uid, 'focus', today);
            await setDoc(focusRef, {
                text: focus.text,
                date: new Date(),
                completed: !focus.completed
            }, { merge: true });
        } catch (error) {
            console.error('Error toggling focus:', error);
        }
    };

    return { focus, setFocusText, toggleFocus };
}
