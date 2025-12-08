import { createContext, useContext, useEffect, useState } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword, linkWithCredential, EmailAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const loginWithEmail = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Error signing in with email:', error);
            throw error;
        }
    };

    const linkEmailPassword = async (password) => {
        try {
            if (!auth.currentUser) throw new Error("No user logged in");
            const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
            await linkWithCredential(auth.currentUser, credential);
        } catch (error) {
            console.error('Error linking credential:', error);
            throw error;
        }
    };

    const registerWithEmail = async (email, password) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Error registering with email:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        signInWithGoogle,
        loginWithEmail,
        linkEmailPassword,
        registerWithEmail,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
