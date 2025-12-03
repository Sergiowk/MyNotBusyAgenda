import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export function useTodos(date = null) {
    const [todos, setTodos] = useState([]);
    const { user } = useAuth();

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
            const todosData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTodos(todosData);
        });

        return unsubscribe;
    }, [user, date]);

    const addTodo = async (text, category = 'general') => {
        if (!text.trim() || !user) return;

        try {
            await addDoc(collection(db, 'users', user.uid, 'todos'), {
                text,
                completed: false,
                category,
                createdAt: new Date(),
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
            await deleteDoc(doc(db, 'users', user.uid, 'todos', id));
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    return { todos, addTodo, toggleTodo, deleteTodo };
}
