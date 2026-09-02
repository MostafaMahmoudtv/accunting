import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const KEY = 'ledgerly_theme';
const DEFAULT_THEME = 'light';

const apply = (theme) => {
  const root = document.documentElement;
  // Remove BOTH theme classes so Tailwind's `dark:` variant fully disengages
  // when we're in light mode (the `dark` class is what triggers it).
  root.classList.remove('light', 'dark');
  if (theme === 'dark') root.classList.add('dark');
  // Always mark the root with the active theme for our custom [data-theme] styles.
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;
  if (typeof window !== 'undefined' && window.console) {
    // Helpful in DevTools to confirm which theme is actually applied.
    console.debug('[theme] applied:', theme, '| html.className=', root.className, '| data-theme=', root.getAttribute('data-theme'));
  }
};

const getInitialTheme = () => {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = localStorage.getItem(KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  // Always default to light on first visit — we want a clear, bright UI by default.
  return DEFAULT_THEME;
};

// One-time migration: if a stale `dark` value survived from the previous
// version, wipe it so the app always boots in light mode unless the user
// has explicitly picked dark from the new toggle.
const migrateStaleTheme = () => {
  try {
    if (localStorage.getItem(KEY) === 'dark') {
      // Inspect the current <html>: if `data-theme` is `light` but a stale
      // `dark` cookie is hanging around, clear the cookie.
      if (document.documentElement.getAttribute('data-theme') === 'light') {
        localStorage.removeItem(KEY);
      }
    }
  } catch (_) { /* noop */ }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    apply(theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  // One-time cleanup so a stale `dark` value from before this rewrite
  // doesn't keep forcing the kanban cards and other `dark:` styles on.
  useEffect(() => {
    migrateStaleTheme();
  }, []);

  // Belt-and-braces: keep the Tailwind `dark:` variant in sync with `theme`.
  // The `dark` class must be on <html> for variants to apply, but it must be
  // REMOVED in light mode — otherwise every `dark:bg-ink-800` style on task
  // cards, modals, etc. would still fire and the UI would look half-dark.
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const setLightTheme = () => setTheme('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, setLightTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
