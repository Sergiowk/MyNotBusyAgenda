import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import logo from '../assets/logo.png';
import { useState } from 'react';


export default function Login() {
    const { signInWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
    const { t } = useLanguage();
    const { isDark, toggleDarkMode } = useTheme();
    const [isEmailLogin, setIsEmailLogin] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Failed to sign in:', error);
            setError(t('auth.google_failed'));
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegistering) {
                await registerWithEmail(email, password);
            } else {
                await loginWithEmail(email, password);
            }
        } catch (error) {
            console.error('Failed to authenticate:', error);
            if (error.code === 'auth/email-already-in-use') {
                setError(t('auth.email_in_use'));
            } else if (error.code === 'auth/weak-password') {
                setError(t('auth.weak_password'));
            } else {
                setError(t('auth.auth_failed'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center font-sans relative" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            {/* Top right controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <LanguageSelector />
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <div className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <img src={logo} alt="MyNotBusyAgenda Logo" className="h-50 w-100 mx-auto mb-4" />
                    <h1 className="text-3xl font-serif font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        MyNotBusyAgenda
                    </h1>
                    <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                        {t('auth.subtitle')}
                    </p>
                </div>

                <div className="p-8 rounded-2xl border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                    <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: 'var(--color-text-primary)' }}>
                        {t('auth.welcome')}
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleSignIn}
                            className="w-full py-3 px-4 rounded-lg font-medium transition-all hover:opacity-90 flex items-center justify-center gap-3"
                            style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff' }}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            {t('auth.sign_in_google')}
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t" style={{ borderColor: 'var(--color-border)' }}></div>
                            <span className="flex-shrink-0 mx-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t('auth.or')}</span>
                            <div className="flex-grow border-t" style={{ borderColor: 'var(--color-border)' }}></div>
                        </div>

                        {!isEmailLogin ? (
                            <>
                                <button
                                    onClick={() => setIsEmailLogin(true)}
                                    className="w-full py-3 px-4 rounded-lg font-medium transition-all hover:bg-[var(--color-bg-secondary)] border"
                                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                                >
                                    {t('auth.email_login')}
                                </button>
                                <div className="text-center pt-3">
                                    <button
                                        onClick={() => {
                                            setIsEmailLogin(true);
                                            setIsRegistering(true);
                                        }}
                                        className="text-sm underline hover:opacity-80 transition-opacity"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        {t('auth.need_account')}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleEmailAuth} className="space-y-4 animate-in slide-in-from-top-4 fade-in duration-200">
                                <div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t('auth.email_placeholder')}
                                        className="w-full px-4 py-2 rounded-lg border bg-[var(--color-bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t('auth.password_placeholder')}
                                        className="w-full px-4 py-2 rounded-lg border bg-[var(--color-bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                                        required
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEmailLogin(false);
                                            setIsRegistering(false);
                                            setError('');
                                        }}
                                        className="flex-1 py-2 px-4 rounded-lg font-medium transition-all hover:bg-[var(--color-bg-secondary)] text-sm"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        {t('auth.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-2 px-4 rounded-lg font-medium transition-all hover:opacity-90 text-white disabled:opacity-50"
                                        style={{ backgroundColor: 'var(--color-accent)' }}
                                    >
                                        {loading ? (isRegistering ? t('auth.signing_up') : t('auth.signing_in')) : (isRegistering ? t('auth.sign_up') : t('auth.sign_in'))}
                                    </button>
                                </div>

                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsRegistering(!isRegistering);
                                            setError('');
                                        }}
                                        className="text-sm underline hover:opacity-80 transition-opacity"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        {isRegistering
                                            ? t('auth.already_have_account')
                                            : t('auth.need_account')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Version Display */}
            <div className="absolute bottom-4 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                <p>{t('profile.version')} {__COMMIT_HASH__}</p>
            </div>
        </div>
    );
}
