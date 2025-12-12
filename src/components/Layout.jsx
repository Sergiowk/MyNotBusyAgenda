import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, CheckSquare, BookOpen, LogOut, User, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import UndoSnackbar from './UndoSnackbar';
import ProfileSettingsModal from './ProfileSettingsModal';
import { useState } from 'react';
import clsx from 'clsx';
import logo from '../assets/logo.png';
import InstallPWAButton from './InstallPWAButton';


export default function Layout() {
    const location = useLocation();
    const { logout } = useAuth();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    // Needed to force re-render on theme change if it affects layout styles directly not handled by CSS variables
    // But since we use CSS variables, just consuming the context might be enough or not even needed 
    // if only children need it. However, we might want to ensure the top div gets the class?
    // The ThemeProvider handles the class on document.documentElement.
    // We import useTheme just in case we need to trigger something or access state.
    useTheme();

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/todos', icon: CheckSquare, label: 'Todos' },
        { path: '/habits', icon: Activity, label: 'Habits' },
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
        <div className="min-h-screen transition-colors duration-200 pb-20 relative" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
            <header className="px-6 py-4 sticky top-0 z-10 backdrop-blur-md bg-opacity-80 border-b" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)' }}>
                <div className="content-container flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="hover:opacity-80 transition-opacity">
                            <img src={logo} alt="MyNotBusyAgenda Logo" className="h-10 w-16" />
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <InstallPWAButton />
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors"
                            title="Profile Settings"
                        >
                            <User size={20} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors text-red-400"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-6">
                <Outlet />
            </main>

            <nav className="absolute bottom-0 left-0 right-0 backdrop-blur-md py-4 z-10" style={{ backgroundColor: 'var(--color-bg-secondary)' + 'cc', borderTop: '1px solid var(--color-border)' }}>
                <div className="content-container flex justify-between items-center">
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
                </div>
            </nav>

            {/* Undo Snackbar */}
            <UndoSnackbar />

            <ProfileSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div>
    );
}
