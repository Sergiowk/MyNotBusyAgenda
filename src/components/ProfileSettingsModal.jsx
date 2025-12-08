import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Lock, Check } from 'lucide-react';

export default function ProfileSettingsModal({ isOpen, onClose }) {
    const { user, linkEmailPassword } = useAuth();
    const { t } = useLanguage();
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        if (password.length < 6) {
            setStatus({ type: 'error', message: 'Password must be at least 6 characters' });
            setLoading(false);
            return;
        }

        try {
            await linkEmailPassword(password);
            setStatus({ type: 'success', message: 'Password set successfully! You can now log in with email.' });
            setPassword('');
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                setStatus({ type: 'error', message: 'For security, please log out and log in again to set a password.' });
            } else if (error.code === 'auth/email-already-in-use' || error.message.includes("credential-already-in-use")) {
                setStatus({ type: 'error', message: 'This email is already associated with a password.' });
            } else {
                setStatus({ type: 'error', message: 'Failed to set password. ' + error.message });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="w-full max-w-md rounded-2xl border shadow-xl animate-in fade-in zoom-in duration-200"
                style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                }}
            >
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <h2 className="text-xl font-semibold">Profile Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                            Email
                        </label>
                        <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
                            {user?.email}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Set Password for Alternative Login
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border bg-[var(--color-bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                                />
                            </div>
                        </div>

                        {status.message && (
                            <div className={`text-sm p-3 rounded-lg ${status.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {status.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="w-full py-2 px-4 rounded-lg font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff' }}
                        >
                            {loading ? 'Saving...' : (
                                <>
                                    <Check size={18} />
                                    Set Password
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
