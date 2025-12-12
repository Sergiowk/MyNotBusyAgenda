import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, onSnapshot, orderBy, where, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { encryptData, decryptData } from '../utils/encryption';

export function useHabits(date = null) {
    const [habits, setHabits] = useState([]);
    const [habitLogs, setHabitLogs] = useState({}); // Map of habitId -> logValue
    const { user } = useAuth();

    // 1. Fetch Habits Definitions
    useEffect(() => {
        if (!user) {
            setHabits([]);
            return;
        }

        const habitsRef = collection(db, 'users', user.uid, 'habits');
        const q = query(habitsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const habitsData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    name: decryptData(data.name, user.uid)
                };
            });
            setHabits(habitsData);
        });

        return unsubscribe;
    }, [user]);

    // 2. Fetch Habit Logs for the specific date
    useEffect(() => {
        if (!user || !date) {
            setHabitLogs({});
            return;
        }

        const fetchLogs = async () => {
            // For a specific date, we query the logs
            // Structure: users/{uid}/habit_logs/{date_habitId} OR
            // Structure: users/{uid}/habits/{habitId}/logs/{date}

            // Let's go with a subcollection on the user for easier batch querying if needed, 
            // OR a root collection for logs. 
            // The plan said: `habit_logs`: Stores daily entries.
            // Let's use: users/{uid}/habit_logs
            // Documents will be keyed by `${habitId}_${dateString}` to ensure uniqueness/easy access

            const dateString = date.toISOString().split('T')[0];
            const logsRef = collection(db, 'users', user.uid, 'habit_logs');
            const q = query(logsRef, where('date', '==', dateString));

            // Realtime listener for logs on this date
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const logs = {};
                snapshot.forEach(doc => {
                    const data = doc.data();
                    logs[data.habitId] = data.value;
                });
                setHabitLogs(logs);
            });
            return unsubscribe;
        };

        // We need to handle the promise for unsubscribe properly or just use internal logic
        // Since useEffect can't be async directly, we do this:
        let unsubscribeFunc = () => { };

        fetchLogs().then(unsub => {
            if (unsub) unsubscribeFunc = unsub;
        });

        return () => unsubscribeFunc();

    }, [user, date]);

    const addHabit = useCallback(async (data) => {
        if (!user) return;
        try {
            const encryptedName = encryptData(data.name, user.uid);
            await addDoc(collection(db, 'users', user.uid, 'habits'), {
                ...data,
                name: encryptedName,
                createdAt: new Date(),
                archived: false
            });
        } catch (error) {
            console.error('Error adding habit:', error);
            throw error;
        }
    }, [user]);

    const updateHabit = useCallback(async (id, data) => {
        if (!user) return;
        try {
            const updateData = { ...data };
            if (updateData.name) {
                updateData.name = encryptData(updateData.name, user.uid);
            }
            const habitRef = doc(db, 'users', user.uid, 'habits', id);
            await updateDoc(habitRef, updateData);
        } catch (error) {
            console.error('Error updating habit:', error);
            throw error;
        }
    }, [user]);

    const deleteHabit = useCallback(async (id) => {
        if (!user) return;
        try {
            // Hard delete for now, or we could archive
            await deleteDoc(doc(db, 'users', user.uid, 'habits', id));
            // Should we delete logs? Leaving them for history might be better, or delete them too.
            // For simplicity/safety, just deleting the definition now.
        } catch (error) {
            console.error('Error deleting habit:', error);
            throw error;
        }
    }, [user]);

    const logHabitProgress = useCallback(async (habitId, value, dateObj = new Date()) => {
        if (!user) return;
        try {
            const dateString = dateObj.toISOString().split('T')[0];
            const logId = `${habitId}_${dateString}`;
            const logRef = doc(db, 'users', user.uid, 'habit_logs', logId);

            await setDoc(logRef, {
                habitId,
                date: dateString,
                value: value,
                updatedAt: new Date()
            }, { merge: true });
        } catch (error) {
            console.error('Error logging habit:', error);
        }
    }, [user]);

    return { habits, habitLogs, addHabit, updateHabit, deleteHabit, logHabitProgress };
}
