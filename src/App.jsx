import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { UndoProvider } from './contexts/UndoContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Todos from './pages/Todos';
import Habits from './pages/Habits';
import Journal from './pages/Journal';
import Login from './pages/Login';


function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <div className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="todos" element={<Todos />} />
        <Route path="habits" element={<Habits />} />
        <Route path="journal" element={<Journal />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <UndoProvider>
            <SettingsProvider>
              <BrowserRouter basename={import.meta.env.BASE_URL}>
                <ProtectedRoutes />
              </BrowserRouter>
            </SettingsProvider>
          </UndoProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
