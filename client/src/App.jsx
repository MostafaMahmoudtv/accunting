import { Component } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
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
            <p className="text-sm text-app-muted mb-3">
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
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/clients"
            element={
              <ProtectedRoute roles={['super_admin', 'manager', 'accountant']}>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/:id"
            element={
              <ProtectedRoute roles={['super_admin', 'manager', 'accountant']}>
                <ClientProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route
            path="/workflows"
            element={
              <ProtectedRoute roles={['super_admin', 'manager', 'accountant']}>
                <Workflows />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute roles={['super_admin', 'manager']}>
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/revenue"
            element={
              <ProtectedRoute roles={['super_admin', 'manager']}>
                <Revenue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute roles={['super_admin', 'manager', 'customer_service']}>
                <Expenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salaries"
            element={
              <ProtectedRoute roles={['super_admin', 'manager']}>
                <Salaries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute roles={['super_admin', 'manager']}>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={['super_admin', 'manager']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute roles={['super_admin', 'manager']}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <ProtectedRoute roles={['super_admin', 'manager']}>
                <Activity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute roles={['super_admin', 'manager']}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
