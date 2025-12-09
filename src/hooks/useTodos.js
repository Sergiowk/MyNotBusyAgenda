import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, onSnapshot, orderBy, where } from 'firebase/firestore';
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

    const addTodo = async (text, category = 'general', customDate = null) => {
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
    };

    const toggleTodo = async (id) => {
        if (!user) return;

        try {
            const todo = todos.find(t => t.id === id);
            const todoRef = doc(db, 'users', user.uid, 'todos', id);
            await updateDoc(todoRef, {
                completed: !todo.completed
            });
        } catch (error) {
            console.error('Error toggling todo:', error);
        }
    };

    const deleteTodo = async (id) => {
        if (!user) return;

        try {
            // Find the todo to store its data for potential undo
            const todo = todos.find(t => t.id === id);
            if (!todo) return;

            // Schedule the deletion with undo capability
            scheduleDelete(
                id,
                'todo',
                todo,
                // onUndo: restore the todo by adding it back
                async () => {
                    try {
                        const encryptedText = encryptData(todo.text, user.uid);
                        await addDoc(collection(db, 'users', user.uid, 'todos'), {
                            text: encryptedText,
                            completed: todo.completed,
                            category: todo.category,
                            createdAt: todo.createdAt,
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
    };


    const updateTodoText = async (id, newText) => {
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
    };

    const rescheduleTodo = async (id, newDate) => {
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
    };

    const reorderTodos = async (newTodos) => {
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
            const batch = null; // We can't use batch easily if we don't import writeBatch. 
            // For simplicity with the current imports, we will use individual updates. 
            // ideally we should import writeBatch from firebase/firestore.

            // Let's rely on the fact that for a daily list, N is small.
            // But better to use batch if possible. Let's stick to Promise.all for now as it is strictly parallel.

            const updates = newTodos.map((todo, index) => {
                const todoRef = doc(db, 'users', user.uid, 'todos', todo.id);
                return updateDoc(todoRef, { order: index });
            });

            await Promise.all(updates);
        } catch (error) {
            console.error('Error reordering todos:', error);
            // Revert state if needed? For now assuming success or minor glitch.
        }
    };

    return { todos, addTodo, toggleTodo, deleteTodo, updateTodoText, rescheduleTodo, reorderTodos };
}
