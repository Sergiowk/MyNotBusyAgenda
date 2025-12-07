import { createContext, useContext, useState, useCallback } from 'react';

const UndoContext = createContext();

export function UndoProvider({ children }) {
    const [pendingDelete, setPendingDelete] = useState(null);

    const scheduleDelete = useCallback((id, type, data, onUndo, onConfirm) => {
        // Cancel any existing pending deletion by clearing its snackbar
        if (pendingDelete) {
            if (pendingDelete.timeoutId) {
                clearTimeout(pendingDelete.timeoutId);
            }
            setPendingDelete(null);
        }

        // Execute the deletion immediately
        onConfirm();

        // Set up new pending deletion with undo capability
        const timeoutId = setTimeout(() => {
            setPendingDelete((current) => {
                if (current && current.id === id) {
                    return null;
                }
                return current;
            });
        }, 5000);

        setPendingDelete({
            id,
            type,
            data,
            onUndo,
            onConfirm,
            timestamp: Date.now(),
            timeoutId
        });
    }, [pendingDelete]);

    const undo = useCallback(() => {
        if (pendingDelete) {
            // Clear the timeout
            if (pendingDelete.timeoutId) {
                clearTimeout(pendingDelete.timeoutId);
            }
            // Call the undo callback
            pendingDelete.onUndo();
            // Clear the pending delete
            setPendingDelete(null);
        }
    }, [pendingDelete]);

    const dismiss = useCallback(() => {
        if (pendingDelete) {
            // Clear the timeout
            if (pendingDelete.timeoutId) {
                clearTimeout(pendingDelete.timeoutId);
            }
            // Confirm the deletion
            pendingDelete.onConfirm();
            // Clear the pending delete
            setPendingDelete(null);
        }
    }, [pendingDelete]);

    return (
        <UndoContext.Provider value={{ pendingDelete, scheduleDelete, undo, dismiss }}>
            {children}
        </UndoContext.Provider>
    );
}

export function useUndo() {
    const context = useContext(UndoContext);
    if (!context) {
        throw new Error('useUndo must be used within UndoProvider');
    }
    return context;
}
