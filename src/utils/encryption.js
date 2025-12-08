import CryptoJS from 'crypto-js';

// In a production app, the generic secret should ideally be an environment variable.
const APP_SECRET = import.meta.env.VITE_APP_SECRET;

if (!APP_SECRET) {
    console.warn("VITE_APP_SECRET is not defined. Encryption will not work securely.");
}

/**
 * Generates a unique encryption key for the user.
 * Combines the app secret with the user's UID.
 * @param {string} uid - The user's Firebase UID.
 * @returns {string} The derived encryption key.
 */
const getUserKey = (uid) => {
    return `${APP_SECRET}-${uid}`;
};

/**
 * Encrypts a text string using AES.
 * @param {string} text - The content to encrypt.
 * @param {string} uid - The user's UID (used for key generation).
 * @returns {string} The encrypted ciphertext.
 */
export const encryptData = (text, uid) => {
    if (!text || !uid) return text;
    try {
        const key = getUserKey(uid);
        return CryptoJS.AES.encrypt(text, key).toString();
    } catch (error) {
        console.error("Encryption error:", error);
        return text;
    }
};

/**
 * Decrypts a ciphertext string using AES.
 * If decryption fails (e.g., data is plain text), returns the original text.
 * @param {string} ciphertext - The encrypted content.
 * @param {string} uid - The user's UID.
 * @returns {string} The decrypted text.
 */
export const decryptData = (ciphertext, uid) => {
    if (!ciphertext || !uid) return ciphertext;
    try {
        const key = getUserKey(uid);
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        // If decryption results in empty string but input wasn't, 
        // it likely failed (wrong key or not encrypted). 
        // However, CryptoJS sometimes returns empty string on failure.
        // A better check for existing plaintext is if the result is valid UTF8.

        if (originalText) {
            return originalText;
        }
        // Fallback: If originalText is empty, it might be because it wasn't encrypted 
        // with this key or at all. Return original to be safe for legacy data.
        return ciphertext;
    } catch (error) {
        // Fallback for legacy plain text data
        return ciphertext;
    }
};
