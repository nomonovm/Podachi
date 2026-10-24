import React, { createContext, useContext, useState, useEffect } from 'react';
import { backendEngine, PodachiState } from '../lib/backendEngine';
import { UserProfile, Farm, UserRole, RegisterData } from '../types';

export type NavigationTab =
  | 'dashboard'
  | 'livestock'
  | 'catalog'
  | 'movements'
  | 'veterinary'
  | 'feed'
  | 'finance'
  | 'payroll'
  | 'reports'
  | 'marketplace'
  | 'my-listings'
  | 'users'
  | 'security-center'
  | 'audit-logs'
  | 'security-testing'
  | 'farm-settings'
  | 'farm-join'
  | 'farm-create';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const VALID_TABS: NavigationTab[] = [
  'dashboard',
  'livestock',
  'catalog',
  'movements',
  'veterinary',
  'feed',
  'finance',
  'payroll',
  'reports',
  'marketplace',
  'my-listings',
  'users',
  'security-center',
  'audit-logs',
  'security-testing',
  'farm-settings',
  'farm-join',
  'farm-create',
];

const getStoredTab = (): NavigationTab => {
  if (typeof window === 'undefined') return 'dashboard';
  try {
    const hash = window.location.hash.replace('#', '').trim() as NavigationTab;
    if (VALID_TABS.includes(hash)) {
      return hash;
    }
    const sessionTab = sessionStorage.getItem('podachi_active_tab') as NavigationTab;
    if (VALID_TABS.includes(sessionTab)) {
      return sessionTab;
    }
    const localTab = localStorage.getItem('podachi_active_tab') as NavigationTab;
    if (VALID_TABS.includes(localTab)) {
      return localTab;
    }
  } catch {}
  return 'dashboard';
};

interface AppContextType {
  state: PodachiState;
  currentUser: UserProfile;
  currentFarm: Farm | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  isDarkMode: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  setCurrentUser: (user: UserProfile) => void;
  setCurrentFarm: (farmId: string) => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  toggleDarkMode: () => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PodachiState>(() => backendEngine.getState());
  const [activeTab, setActiveTabState] = useState<NavigationTab>(getStoredTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const setActiveTab = (tab: NavigationTab) => {
    setActiveTabState(tab);
    setIsMobileMenuOpen(false);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('podachi_active_tab', tab);
        localStorage.setItem('podachi_active_tab', tab);
        if (window.location.hash !== `#${tab}`) {
          window.history.replaceState(null, '', `#${tab}`);
        }
      }
    } catch {}
  };

  useEffect(() => {
    // Sync dark mode class on mount
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const unsubscribe = backendEngine.subscribe(() => {
      const newState = { ...backendEngine.getState() };
      setState(newState);
      if (newState.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
    return unsubscribe;
  }, []);

  // Sync hash changes & browser back/forward buttons
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentHash = window.location.hash.replace('#', '').trim() as NavigationTab;
      if (currentHash !== activeTab && VALID_TABS.includes(activeTab)) {
        window.history.replaceState(null, '', `#${activeTab}`);
      }

      const handleHashChange = () => {
        const newHash = window.location.hash.replace('#', '').trim() as NavigationTab;
        if (VALID_TABS.includes(newHash) && newHash !== activeTab) {
          setActiveTabState(newHash);
        }
      };

      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, [activeTab]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogin = async (email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = backendEngine.login(email, password, rememberMe);
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('podachi_logged_out');
          localStorage.removeItem('podachi_logged_out');
        }
      } catch {}
      showToast(`Xush kelibsiz, ${user.full_name}!`, 'success');
      return { success: true };
    } catch (e: any) {
      showToast(e.message, 'error');
      return { success: false, error: e.message };
    }
  };

  const handleRegister = async (data: RegisterData, rememberMe: boolean = false): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = backendEngine.register(data, rememberMe);
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('podachi_logged_out');
          localStorage.removeItem('podachi_logged_out');
        }
      } catch {}
      showToast(`Tabriklaymiz! Hisobingiz yaratildi, ${user.full_name}!`, 'success');
      return { success: true };
    } catch (e: any) {
      showToast(e.message, 'error');
      return { success: false, error: e.message };
    }
  };

  const handleLogout = () => {
    backendEngine.logout();
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('podachi_active_tab');
        localStorage.removeItem('podachi_active_tab');
        sessionStorage.setItem('podachi_logged_out', 'true');
        localStorage.setItem('podachi_logged_out', 'true');
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch {}
    setActiveTabState('dashboard');
    showToast('Tizimdan muvaffaqiyatli chiqdingiz.', 'info');
  };

  const handleToggleDarkMode = () => {
    const isDark = backendEngine.toggleDarkMode();
    showToast(isDark ? "Qorong'i rejim (Dark Mode) yoqildi" : "Yorug' rejim (Light Mode) yoqildi", 'info');
  };

  const handleSetCurrentUser = (user: UserProfile) => {
    backendEngine.setCurrentUser(user);
    showToast(`${user.full_name} profiliga o'tildi`, 'info');
  };

  const handleSetCurrentFarm = (farmId: string) => {
    try {
      backendEngine.setCurrentFarm(farmId);
      const farm = state.farms.find(f => f.id === farmId);
      showToast(`Ferma almashtirildi: ${farm?.display_title || farm?.name}`, 'success');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleReset = () => {
    backendEngine.resetToDefault();
    showToast("Barcha ma'lumotlar dastlabki holatga qaytarildi.", 'info');
  };

  const currentFarm = state.farms.find(f => f.id === state.currentFarmId) || null;
  const currentRole = backendEngine.getCurrentRole();

  return (
    <AppContext.Provider
      value={{
        state,
        currentUser: state.currentUser,
        currentFarm,
        currentRole,
        isAuthenticated: state.isAuthenticated,
        isDarkMode: state.isDarkMode,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        activeTab,
        setActiveTab,
        setCurrentUser: handleSetCurrentUser,
        setCurrentFarm: handleSetCurrentFarm,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        toggleDarkMode: handleToggleDarkMode,
        toasts,
        showToast,
        removeToast,
        resetAllData: handleReset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
