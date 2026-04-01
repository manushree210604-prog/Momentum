import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { HabitTracker } from './pages/HabitTracker';
import { Goals } from './pages/Goals';
import { Reports } from './pages/Reports';
import { LoginPage } from './pages/LoginPage';
import { AuthUser } from './lib/supabase';
import { Zap } from 'lucide-react';

// ── Auth Guard: wraps protected routes ────────────────────────────
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, setUser } = useAuth();

  // While checking session on mount — show a minimal loading screen
  if (loading) {
    return (
      <div className="auth-loading-screen" aria-label="Authenticating…">
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 30px rgba(99,102,241,0.5)',
          }}>
            <Zap size={24} color="white" fill="white" />
          </div>
          <p style={{
            fontSize: 9, fontWeight: 900, letterSpacing: '0.35em',
            textTransform: 'uppercase', color: '#334155',
          }}>
            MOMENTUM · INITIALIZING
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated — show login
  if (!user) {
    return <LoginPage onSuccess={(authUser: AuthUser) => setUser(authUser)} />;
  }

  // Authenticated — render the app
  return <>{children}</>;
}

// ── App ───────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <DataProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="habits" element={<HabitTracker />} />
                <Route path="goals" element={<Goals />} />
                <Route path="reports" element={<Reports />} />
              </Route>
            </Routes>
          </HashRouter>
        </DataProvider>
      </AuthGuard>
    </AuthProvider>
  );
}

export default App;
