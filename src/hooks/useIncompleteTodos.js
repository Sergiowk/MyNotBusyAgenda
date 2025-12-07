import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, where, updateDoc, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useUndo } from '../contexts/UndoContext';


export function useIncompleteTodos() {
    const [incompleteTodos, setIncompleteTodos] = useState([]);
    const [groupedTodos, setGroupedTodos] = useState({});
    const { user } = useAuth();
    const { scheduleDelete } = useUndo();


    useEffect(() => {
        if (!user) {
            setIncompleteTodos([]);
            setGroupedTodos({});
            return;
        }

        const todosRef = collection(db, 'users', user.uid, 'todos');
        const q = query(
            todosRef,
            where('completed', '==', false),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const todosData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setIncompleteTodos(todosData);

            // Group todos by date
            const grouped = {};
            todosData.forEach(todo => {
                const todoDate = new Date(todo.createdAt.toDate());
                todoDate.setHours(0, 0, 0, 0);
                const dateKey = todoDate.toISOString();

                if (!grouped[dateKey]) {
                    grouped[dateKey] = {
                        date: todoDate,
                        todos: []
                    };
                }
                grouped[dateKey].todos.push(todo);
            });

            setGroupedTodos(grouped);
        });

        return unsubscribe;
    }, [user]);

    const toggleTodo = async (id) => {
        if (!user) return;

        try {
            const todo = incompleteTodos.find(t => t.id === id);
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
            const todo = incompleteTodos.find(t => t.id === id);
            if (!todo) return;

            // Optimistically update the UI by removing the todo immediately
            setIncompleteTodos(prev => prev.filter(t => t.id !== id));

            // Also update grouped todos
            setGroupedTodos(prev => {
                const updated = { ...prev };
                for (const dateKey in updated) {
                    updated[dateKey] = {
                        ...updated[dateKey],
                        todos: updated[dateKey].todos.filter(t => t.id !== id)
                    };
                    // Remove empty date groups
                    if (updated[dateKey].todos.length === 0) {
                        delete updated[dateKey];
                    }
                }
                return updated;
            });

            // Schedule the deletion with undo capability
            scheduleDelete(
                id,
                'todo',
                todo,
                // onUndo: restore the todo by adding it back
                async () => {
                    try {
                        // Optimistically restore to UI first
                        setIncompleteTodos(prev => [...prev, todo]);

                        // Also restore to grouped todos
                        setGroupedTodos(prev => {
                            const todoDate = new Date(todo.createdAt.toDate());
                            todoDate.setHours(0, 0, 0, 0);
                            const dateKey = todoDate.toISOString();

                            const updated = { ...prev };
                            if (!updated[dateKey]) {
                                updated[dateKey] = {
                                    date: todoDate,
                                    todos: []
                                };
                            } else {
                                updated[dateKey] = { ...updated[dateKey] };
                            }
                            updated[dateKey].todos = [...updated[dateKey].todos, todo];
                            return updated;
                        });

                        // Then add back to Firebase
                        await addDoc(collection(db, 'users', user.uid, 'todos'), {
                            text: todo.text,
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
                        // If deletion fails, we should restore the optimistic update
                        // The Firebase listener will handle this automatically
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

        // Optimistic update
        setIncompleteTodos(prev => prev.map(t => t.id === id ? { ...t, text: trimmedText } : t));

        setGroupedTodos(prev => {
            const updated = { ...prev };
            for (const dateKey in updated) {
                const group = updated[dateKey];
                if (group.todos.some(t => t.id === id)) {
                    updated[dateKey] = {
                        ...group,
                        todos: group.todos.map(t => t.id === id ? { ...t, text: trimmedText } : t)
                    };
                }
            }
            return updated;
        });

        try {
            const todoRef = doc(db, 'users', user.uid, 'todos', id);
            await updateDoc(todoRef, {
                text: trimmedText
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
                createdAt: rescheduleDate
            });
        } catch (error) {
            console.error('Error rescheduling todo:', error);
        }
    };

    return { incompleteTodos, groupedTodos, toggleTodo, deleteTodo, updateTodoText, rescheduleTodo };
}
