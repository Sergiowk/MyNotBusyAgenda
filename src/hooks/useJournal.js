import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export function useJournal() {
    const [entries, setEntries] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            setEntries([]);
            return;
        }

        const entriesRef = collection(db, 'users', user.uid, 'journal');
        const q = query(entriesRef, orderBy('date', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const entriesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date
            }));
            setEntries(entriesData);
        });

        return unsubscribe;
    }, [user]);

    const addEntry = async (text) => {
        if (!text.trim() || !user) return;

        try {
            await addDoc(collection(db, 'users', user.uid, 'journal'), {
                text,
                date: new Date(),
            });
        } catch (error) {
            console.error('Error adding journal entry:', error);
        }
    };

    const deleteEntry = async (id) => {
        if (!user) return;

        try {
            await deleteDoc(doc(db, 'users', user.uid, 'journal', id));
        } catch (error) {
            console.error('Error deleting journal entry:', error);
        }
    };

    return { entries, addEntry, deleteEntry };
}
