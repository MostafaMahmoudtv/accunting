import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Menu, Search, LogOut, User as UserIcon, FileText, Users, ListTodo, Wallet, Receipt, X } from 'lucide-react';
import api from '../services/api';
import { initials } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ onToggleSidebar }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const { data: searchData } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => (await api.get(`/search?q=${encodeURIComponent(query)}`)).data.data,
    enabled: query.length > 1,
    staleTime: 5_000,
  });

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target) &&
        !e.target.closest('[data-mobile-search-toggle]')
      ) {
        setMobileSearch(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const goTo = (path) => {
    navigate(path);
    setOpenMenu(false);
    setSearchOpen(false);
    setMobileSearch(false);
    setQuery('');
  };

  return (
    <header className="h-16 sticky top-0 z-20 bg-white/80 dark:bg-ink-900/80 backdrop-blur border-b border-ink-100 dark:border-ink-800">
      <div className="h-full px-3 sm:px-4 lg:px-6 flex items-center gap-1.5 sm:gap-3">
        <button
          className="lg:hidden p-2 -ms-1 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 shrink-0 touch-manipulation"
          onClick={onToggleSidebar}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop / tablet search */}
        <div className="relative flex-1 max-w-xl hidden sm:block min-w-0" ref={searchRef}>
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-ink-400 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder={t('common.search') + '…'}
            className="w-full ps-10 pe-3 py-2 rounded-xl bg-ink-50 dark:bg-ink-800 border border-transparent focus:bg-white dark:focus:bg-ink-900 focus:border-brand-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {searchOpen && query.length > 1 && (
            <SearchResults data={searchData} t={t} onSelect={goTo} />
          )}
        </div>

        {/* Mobile search toggle */}
        <button
          data-mobile-search-toggle
          className="sm:hidden p-2 -ms-1 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 shrink-0 touch-manipulation"
          onClick={() => setMobileSearch((v) => !v)}
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1 ms-auto shrink-0">
          <div className="relative" ref={menuRef}>
            <button
              className="ms-1 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center text-sm touch-manipulation"
              onClick={() => setOpenMenu((v) => !v)}
              aria-label="User menu"
            >
              {initials(user?.name || 'U')}
            </button>
            {openMenu && (
              <div className="absolute end-0 mt-2 w-60 sm:w-56 bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-xl shadow-lg py-1 z-30">
                <div className="px-3 py-2.5 border-b border-ink-100 dark:border-ink-800">
                  <div className="text-sm font-semibold truncate">{user?.name}</div>
                  <div className="text-xs text-ink-500 truncate">{user?.email}</div>
                </div>
                <button onClick={() => goTo('/profile')} className="w-full text-start px-3 py-2.5 text-sm hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center gap-2.5">
                  <UserIcon className="h-4 w-4 shrink-0" /> <span className="truncate">{t('nav.myAccount')}</span>
                </button>
                <button onClick={() => goTo('/settings')} className="w-full text-start px-3 py-2.5 text-sm hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center gap-2.5">
                  <FileText className="h-4 w-4 shrink-0" /> <span className="truncate">{t('nav.settings')}</span>
                </button>
                <div className="border-t border-ink-100 dark:border-ink-800 sm:hidden" />
                <button
                  onClick={async () => {
                    await logout();
                    goTo('/login');
                  }}
                  className="w-full text-start px-3 py-2.5 text-sm hover:bg-ink-100 dark:hover:bg-ink-800 text-rose-600 flex items-center gap-2.5 sm:hidden"
                >
                  <LogOut className="h-4 w-4 shrink-0" /> <span>{t('common.logout')}</span>
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    goTo('/login');
                  }}
                  className="hidden sm:flex w-full text-start px-3 py-2 text-sm hover:bg-ink-100 dark:hover:bg-ink-800 text-rose-600 items-center gap-2"
                >
                  <LogOut className="h-4 w-4 shrink-0" /> {t('common.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search overlay */}
      {mobileSearch && (
        <div
          ref={mobileSearchRef}
          className="sm:hidden absolute start-0 end-0 top-16 bg-white dark:bg-ink-900 border-b border-ink-100 dark:border-ink-800 p-3 shadow-lg"
        >
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-ink-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              placeholder={t('common.search') + '…'}
              className="w-full ps-10 pe-9 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 border border-transparent focus:bg-white dark:focus:bg-ink-900 focus:border-brand-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <button
              className="absolute top-1/2 -translate-y-1/2 end-2 p-1 rounded-md hover:bg-ink-100 dark:hover:bg-ink-800"
              onClick={() => {
                setMobileSearch(false);
                setQuery('');
              }}
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {searchOpen && query.length > 1 && (
            <div className="mt-2">
              <SearchResults data={searchData} t={t} onSelect={goTo} />
            </div>
          )}
        </div>
      )}
    </header>
  );
};

const SearchResults = ({ data, t, onSelect }) => (
  <div className="absolute mt-2 inset-x-0 top-full bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-xl shadow-lg overflow-hidden z-30">
    {data ? (
      <div className="max-h-96 overflow-y-auto p-2 space-y-2 text-sm">
        {[
          { items: data.clients, key: 'clients', label: t('nav.clients'), icon: Users },
          { items: data.tasks, key: 'tasks', label: t('nav.tasks'), icon: ListTodo },
          { items: data.employees, key: 'employees', label: t('nav.employees'), icon: Users },
          { items: data.payments, key: 'payments', label: t('nav.payments'), icon: Receipt },
          { items: data.expenses, key: 'expenses', label: t('nav.expenses'), icon: Wallet },
        ].map(({ items, key, label, icon: Icon }) =>
          items?.length ? (
            <div key={key}>
              <div className="px-2 py-1 text-xs font-semibold text-ink-500 uppercase">{label}</div>
              {items.map((item) => (
                <button
                  key={item._id}
                  onClick={() => onSelect(`/${key}/${item._id}`)}
                  className="w-full text-start px-2 py-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center gap-2"
                >
                  <Icon className="h-3.5 w-3.5 text-ink-400 shrink-0" />
                  <span className="truncate">
                    {item.name || item.title || item.label}
                  </span>
                </button>
              ))}
            </div>
          ) : null
        )}
        {!Object.values(data).some((arr) => arr?.length) && (
          <div className="p-4 text-center text-ink-500">{t('common.noResults')}</div>
        )}
      </div>
    ) : (
      <div className="p-4 text-sm text-ink-500">{t('common.loading')}</div>
    )}
  </div>
);

export default Topbar;
