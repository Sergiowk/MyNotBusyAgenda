import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, onSnapshot, orderBy, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useUndo } from '../contexts/UndoContext';
import { encryptData, decryptData } from '../utils/encryption';


export function useTodos(date = null) {
    const [todos, setTodos] = useState([]);
    const { user } = useAuth();
    const { scheduleDelete } = useUndo();


    useEffect(() => {
        if (!user) {
            setTodos([]);
            return;
        }

        const todosRef = collection(db, 'users', user.uid, 'todos');
        let q;

        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);

            q = query(
                todosRef,
                where('createdAt', '>=', start),
                where('createdAt', '<=', end),
                orderBy('createdAt', 'desc')
            );
        } else {
            q = query(todosRef, orderBy('createdAt', 'desc'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let todosData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Decrypt the text
                    text: decryptData(data.text, user.uid)
                };
            });

            // Filter out completed tasks from previous dates and future tasks when not in history view
            if (!date) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                todosData = todosData.filter(todo => {
                    const todoDate = new Date(todo.createdAt.toDate());
                    todoDate.setHours(0, 0, 0, 0);

                    // Exclude future tasks
                    if (todoDate.getTime() > today.getTime()) {
                        return false;
                    }

                    // Show all tasks from today, but only incomplete tasks from previous dates
                    if (todoDate.getTime() < today.getTime()) {
                        return !todo.completed;
                    }
                    return true;
                });
            }

            setTodos(todosData);
        });

        return unsubscribe;
    }, [user, date]);

    const addTodo = useCallback(async (text, category = 'general', customDate = null) => {
        if (!text.trim() || !user) return;

        try {
            // Use customDate if provided, otherwise use current date/time
            const createdAt = customDate || new Date();
            const encryptedText = encryptData(text, user.uid);

            await addDoc(collection(db, 'users', user.uid, 'todos'), {
                text: encryptedText,
                completed: false,
                category,
                createdAt,
                order: Date.now(),
            });
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    }, [user]);

    const toggleTodo = useCallback(async (id, currentCompleted) => {
        if (!user) return;

        try {
            const todoRef = doc(db, 'users', user.uid, 'todos', id);
            await updateDoc(todoRef, {
                completed: !currentCompleted
            });
        } catch (error) {
            console.error('Error toggling todo:', error);
        }
    }, [user]);

    const deleteTodo = useCallback(async (id, todoData) => {
        if (!user || !todoData) return;

        try {
            // Schedule the deletion with undo capability
            scheduleDelete(
                id,
                'todo',
                todoData,
                // onUndo: restore the todo by adding it back
                async () => {
                    try {
                        const encryptedText = encryptData(todoData.text, user.uid);
                        await addDoc(collection(db, 'users', user.uid, 'todos'), {
                            text: encryptedText,
                            completed: todoData.completed,
                            category: todoData.category,
                            createdAt: todoData.createdAt,
                        });
                    } catch (error) {
                        console.error('Error restoring todo:', error);
                    }
                },
                // onConfirm: perform the actual deletion immediately
                async () => {
                    try {
                        await deleteDoc(doc(db, 'users', user.uid, 'todos', id));
                    } catch (error) {
                        console.error('Error deleting todo:', error);
                    }
                }
            );
        } catch (error) {
            console.error('Error scheduling todo deletion:', error);
        }
    }, [user, scheduleDelete]);


    const updateTodoText = useCallback(async (id, newText) => {
        if (!user || !newText.trim()) return;

        const trimmedText = newText.trim();

        // Optimistic update (state holds reference to decrypted text)
        setTodos(prev => prev.map(t => t.id === id ? { ...t, text: trimmedText } : t));

        try {
            const encryptedText = encryptData(trimmedText, user.uid);
            const todoRef = doc(db, 'users', user.uid, 'todos', id);
            await updateDoc(todoRef, {
                text: encryptedText
            });
        } catch (error) {
            console.error('Error updating todo text:', error);
        }
    }, [user]);

    const rescheduleTodo = useCallback(async (id, newDate) => {
        if (!user) return;

        try {
            const todoRef = doc(db, 'users', user.uid, 'todos', id);
            const rescheduleDate = new Date(newDate);
            rescheduleDate.setHours(0, 0, 0, 0);

            await updateDoc(todoRef, {
                createdAt: rescheduleDate,
                order: Date.now() // Put it at the end/start of the new day
            });
        } catch (error) {
            console.error('Error rescheduling todo:', error);
        }
    }, [user]);

    const reorderTodos = useCallback(async (newTodos) => {
        if (!user) return;

        // Optimistic update
        setTodos(prev => {
            // Create a map of the new order
            const orderMap = new Map(newTodos.map((t, index) => [t.id, index]));

            // Return new array with updated orders (for local sort)
            return [...prev].map(t => {
                const newIndex = orderMap.get(t.id);
                return newIndex !== undefined ? { ...t, order: newIndex } : t;
            });
        });

        try {
            const batch = writeBatch(db);

            newTodos.forEach((todo, index) => {
                const todoRef = doc(db, 'users', user.uid, 'todos', todo.id);
                batch.update(todoRef, { order: index });
            });

            await batch.commit();
        } catch (error) {
            console.error('Error reordering todos:', error);
            // Revert state if needed? For now assuming success or minor glitch.
        }
    }, [user, setTodos]);

    return { todos, addTodo, toggleTodo, deleteTodo, updateTodoText, rescheduleTodo, reorderTodos };
}
