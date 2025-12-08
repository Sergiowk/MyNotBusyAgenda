import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useUndo } from '../contexts/UndoContext';


export function useJournal(date = null, fetchAll = false) {
    const [entries, setEntries] = useState([]);
    const { user } = useAuth();
    const { scheduleDelete } = useUndo();


    useEffect(() => {
        if (!user) {
            setEntries([]);
            return;
        }

        const entriesRef = collection(db, 'users', user.uid, 'journal');
        let q;

        if (fetchAll) {
            q = query(
                entriesRef,
                orderBy('date', 'desc')
            );
        } else if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);

            q = query(
                entriesRef,
                where('date', '>=', start),
                where('date', '<=', end),
                orderBy('date', 'desc')
            );
        } else {
            // Only show today's entries in the main view
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            q = query(
                entriesRef,
                where('date', '>=', today),
                where('date', '<=', endOfDay),
                orderBy('date', 'desc')
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const entriesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date
            }));
            setEntries(entriesData);
        });

        return unsubscribe;
    }, [user, date, fetchAll]);

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
            // Find the entry to store its data for potential undo
            const entry = entries.find(e => e.id === id);
            if (!entry) return;

            // Schedule the deletion with undo capability
            scheduleDelete(
                id,
                'entry',
                entry,
                // onUndo: restore the entry by adding it back
                async () => {
                    try {
                        await addDoc(collection(db, 'users', user.uid, 'journal'), {
                            text: entry.text,
                            date: new Date(entry.date),
                        });
                    } catch (error) {
                        console.error('Error restoring journal entry:', error);
                    }
                },
                // onConfirm: perform the actual deletion immediately
                async () => {
                    try {
                        await deleteDoc(doc(db, 'users', user.uid, 'journal', id));
                    } catch (error) {
                        console.error('Error deleting journal entry:', error);
                    }
                }
            );
        } catch (error) {
            console.error('Error scheduling journal entry deletion:', error);
        }
    };


    return { entries, addEntry, deleteEntry };
}
