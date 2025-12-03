import { useState, useEffect } from 'react';

const STORAGE_KEY = 'my_not_busy_agenda_todos';

export function useTodos() {
    const [todos, setTodos] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }, [todos]);

    const addTodo = (text, category = 'general') => {
        if (!text.trim()) return;
        setTodos([
            {
                id: Date.now().toString(),
                text,
                completed: false,
                category,
                createdAt: new Date().toISOString(),
            },
            ...todos,
        ]);
    };

    const toggleTodo = (id) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
    };

    const deleteTodo = (id) => {
        setTodos(todos.filter((todo) => todo.id !== id));
    };

    return { todos, addTodo, toggleTodo, deleteTodo };
}
