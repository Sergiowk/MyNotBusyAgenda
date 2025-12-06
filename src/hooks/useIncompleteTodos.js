import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, where, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export function useIncompleteTodos() {
    const [incompleteTodos, setIncompleteTodos] = useState([]);
    const [groupedTodos, setGroupedTodos] = useState({});
    const { user } = useAuth();

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
            await deleteDoc(doc(db, 'users', user.uid, 'todos', id));
        } catch (error) {
            console.error('Error deleting todo:', error);
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

    return { incompleteTodos, groupedTodos, toggleTodo, deleteTodo, rescheduleTodo };
}
