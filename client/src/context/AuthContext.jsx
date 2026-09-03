import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { getToken, setToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMe = useCallback(async () => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data.user);
    } catch (err) {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = useCallback(async (email, password) => {
    setError(null);
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.data.token);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    setError(null);
    const { data } = await api.post('/auth/register', payload);
    setToken(data.data.token);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getToken()) await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  const hasRole = useCallback(
    (...roles) => Boolean(user && roles.includes(user.role)),
    [user]
  );

  const canSeeFinancials = useMemo(
    () => Boolean(user && ['super_admin', 'manager'].includes(user.role)),
    [user]
  );

  const value = useMemo(
    () => ({ user, loading, error, login, register, logout, hasRole, canSeeFinancials, setUser }),
    [user, loading, error, login, register, logout, hasRole, canSeeFinancials]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
