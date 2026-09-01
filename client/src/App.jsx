import { Component } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientProfile from './pages/ClientProfile';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Workflows from './pages/Workflows';
import Payments from './pages/Payments';
import Revenue from './pages/Revenue';
import Expenses from './pages/Expenses';
import Salaries from './pages/Salaries';
import Employees from './pages/Employees';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-rose-50">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6 border border-rose-200">
            <h1 className="text-xl font-bold text-rose-700 mb-2">Something went wrong</h1>
            <p className="text-sm text-ink-600 mb-3">
              The application crashed while rendering. The full error is logged to the browser console (F12).
            </p>
            <pre className="text-xs bg-ink-900 text-rose-200 p-3 rounded-lg overflow-auto whitespace-pre-wrap">
              {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
            </pre>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="mt-4 btn-primary"
            >
              Clear cache & reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientProfile />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/payments" element={<Payments />} />
          <Route
            path="/revenue"
            element={
              <ProtectedRoute roles={['super_admin', 'manager', 'accountant']}>
                <Revenue />
              </ProtectedRoute>
            }
          />
          <Route path="/expenses" element={<Expenses />} />
          <Route
            path="/salaries"
            element={
              <ProtectedRoute roles={['super_admin', 'manager']}>
                <Salaries />
              </ProtectedRoute>
            }
          />
          <Route path="/employees" element={<Employees />} />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={['super_admin', 'manager']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route path="/reports" element={<Reports />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
