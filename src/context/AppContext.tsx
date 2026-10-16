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

interface AppContextType {
  state: PodachiState;
  currentUser: UserProfile;
  currentFarm: Farm | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  isDarkMode: boolean;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  setCurrentUser: (user: UserProfile) => void;
  setCurrentFarm: (farmId: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  toggleDarkMode: () => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PodachiState>(backendEngine.getState());
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = backendEngine.login(email, password);
      showToast(`Xush kelibsiz, ${user.full_name}!`, 'success');
      return true;
    } catch (e: any) {
      showToast(e.message, 'error');
      return false;
    }
  };

  const handleRegister = async (data: RegisterData): Promise<boolean> => {
    try {
      const user = backendEngine.register(data);
      showToast(`Tabriklaymiz! Hisobingiz yaratildi, ${user.full_name}!`, 'success');
      return true;
    } catch (e: any) {
      showToast(e.message, 'error');
      return false;
    }
  };

  const handleLogout = () => {
    backendEngine.logout();
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
