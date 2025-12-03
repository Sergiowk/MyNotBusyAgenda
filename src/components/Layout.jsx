import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, CheckSquare, BookOpen, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import clsx from 'clsx';

export default function Layout() {
    const location = useLocation();
    const { isDark, toggleDarkMode } = useDarkMode();

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/todos', icon: CheckSquare, label: 'Todos' },
        { path: '/journal', icon: BookOpen, label: 'Journal' },
    ];

    return (
        <div className="min-h-screen font-sans flex justify-center transition-colors duration-200" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
            <div className="w-full max-w-md min-h-screen shadow-xl relative" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <header className="absolute top-0 right-0 p-4 z-20">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-lg transition-colors"
                        style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)' }}
                        aria-label="Toggle dark mode"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </header>

                <main className="pb-24 p-6 pt-16">
                    <Outlet />
                </main>

                <nav className="absolute bottom-0 left-0 right-0 backdrop-blur-md px-8 py-4 flex justify-between items-center z-10" style={{ backgroundColor: 'var(--color-bg-secondary)' + 'cc', borderTop: '1px solid var(--color-border)' }}>
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
        </div>
    );
}
