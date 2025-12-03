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
        <div className="min-h-screen bg-beige-100 dark:bg-gray-900 text-brown-800 dark:text-white font-sans flex justify-center transition-colors duration-200">
            <div className="w-full max-w-md bg-beige-50 dark:bg-gray-800 min-h-screen shadow-xl relative">
                <header className="absolute top-0 right-0 p-4 z-20">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-lg bg-beige-200 dark:bg-gray-700 text-brown-700 dark:text-white hover:bg-beige-300 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </header>

                <main className="pb-24 p-6 pt-16">
                    <Outlet />
                </main>

                <nav className="absolute bottom-0 left-0 right-0 bg-beige-50/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-beige-200 dark:border-gray-700 px-8 py-4 flex justify-between items-center z-10">
                    {navItems.map(({ path, icon: Icon, label }) => (
                        <Link
                            key={path}
                            to={path}
                            className={clsx(
                                "flex flex-col items-center gap-1 transition-all duration-200",
                                location.pathname === path
                                    ? "text-brown-700 dark:text-white scale-110"
                                    : "text-brown-400 dark:text-gray-400 hover:text-brown-600 dark:hover:text-gray-300"
                            )}
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
