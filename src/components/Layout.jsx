import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, CheckSquare, BookOpen, Moon, Sun, LogOut } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from './LanguageSelector';
import clsx from 'clsx';
import logo from '../assets/logo.png';

export default function Layout() {
    const location = useLocation();
    const { isDark, toggleDarkMode } = useDarkMode();
    const { logout } = useAuth();

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/todos', icon: CheckSquare, label: 'Todos' },
        { path: '/journal', icon: BookOpen, label: 'Journal' },
    ];

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200 pb-20">
            <header className="px-6 py-4 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md bg-[var(--color-bg-primary)]/80 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="MyNotBusyAgenda Logo" className="h-10 w-16" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        MyNotBusyAgenda
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageSelector />
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors text-red-400"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="p-6">
                <Outlet />
            </main>

            <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-md px-8 py-4 flex justify-between items-center z-10" style={{ backgroundColor: 'var(--color-bg-secondary)' + 'cc', borderTop: '1px solid var(--color-border)' }}>
                {navItems.map(({ path, icon: Icon, label }) => (
                    <Link
                        key={path}
                        to={path}
                        className={clsx(
                            "flex flex-col items-center gap-1 transition-all duration-200",
                            location.pathname === path ? "scale-110" : ""
                        )}
                        style={{ color: location.pathname === path ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
                    >
                        <Icon size={24} strokeWidth={location.pathname === path ? 2.5 : 2} />
                        <span className="text-[10px] font-medium tracking-wide">{label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
