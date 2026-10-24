import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastContainer } from './components/ui/Toast';
import { backendEngine } from './lib/backendEngine';

// Auth Screen
import { Auth } from './pages/Auth';

// Application Pages
import { Dashboard } from './pages/Dashboard';
import { Livestock } from './pages/Livestock';
import { AnimalCatalog } from './pages/AnimalCatalog';
import { MovementsHistory } from './pages/MovementsHistory';
import { Veterinary } from './pages/Veterinary';
import { FeedManagement } from './pages/FeedManagement';
import { Finance } from './pages/Finance';
import { Marketplace } from './pages/Marketplace';
import { MyListings } from './pages/MyListings';
import { UserManagement } from './pages/UserManagement';
import { SecurityCenter } from './pages/SecurityCenter';
import { AuditLogs } from './pages/AuditLogs';
import { SecurityTesting } from './pages/SecurityTesting';
import { FarmSettings } from './pages/FarmSettings';
import { FarmJoin } from './pages/FarmJoin';
import { FarmCreate } from './pages/FarmCreate';
import { Payroll } from './pages/Payroll';

import { Lock } from 'lucide-react';
import { UserRole } from './types';
import { NavigationTab } from './context/AppContext';

const ROLE_PERMITTED_TABS: Record<UserRole, NavigationTab[]> = {
  admin: [
    'dashboard', 'livestock', 'catalog', 'movements', 'veterinary',
    'feed', 'finance', 'payroll', 'reports', 'marketplace', 'my-listings',
    'users', 'security-center', 'audit-logs', 'security-testing',
    'farm-settings', 'farm-join', 'farm-create',
  ],
  head_manager: [
    'dashboard', 'livestock', 'catalog', 'movements', 'veterinary',
    'feed', 'finance', 'payroll', 'reports', 'marketplace', 'my-listings',
    'farm-join', 'farm-create',
  ],
  manager: [
    'dashboard', 'livestock', 'catalog', 'movements', 'veterinary',
    'feed', 'finance', 'reports', 'marketplace', 'my-listings',
    'farm-join', 'farm-create',
  ],
  veterinarian: [
    'dashboard', 'livestock', 'catalog', 'movements', 'veterinary',
    'marketplace', 'farm-join', 'farm-create',
  ],
  viewer: [
    'dashboard', 'livestock', 'catalog',
    'marketplace', 'farm-join', 'farm-create',
  ],
};

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, currentRole } = useApp();

  const isPermitted = ROLE_PERMITTED_TABS[currentRole]?.includes(activeTab);

  React.useEffect(() => {
    if (!isPermitted) {
      setActiveTab('dashboard');
    }
  }, [currentRole, isPermitted, setActiveTab]);

  if (!isPermitted) {
    return (
      <main className="flex-1 h-full overflow-y-auto min-h-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl w-full mx-auto">
          <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-10 text-center border border-slate-200 dark:border-forest-800/40 max-w-lg mx-auto mt-12 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900/50">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Kirish Huquqi Cheklangan (RBAC)</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Sizning faol rolingiz: <strong className="capitalize text-slate-900 dark:text-white">{currentRole}</strong>.<br />
              Ushbu bo'limga kirish faqat tegishli vakolatga ega foydalanuvchilar uchun ruxsat etilgan.
            </p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-5 py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Boshqaruv paneliga qaytish
            </button>
          </div>
        </div>
      </main>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'livestock':
        return <Livestock />;
      case 'catalog':
        return <AnimalCatalog />;
      case 'movements':
        return <MovementsHistory />;
      case 'veterinary':
        return <Veterinary />;
      case 'feed':
        return <FeedManagement />;
      case 'finance':
      case 'reports':
        return <Finance />;
      case 'payroll':
        return <Payroll />;
      case 'marketplace':
        return <Marketplace />;
      case 'my-listings':
        return <MyListings />;
      case 'users':
        return <UserManagement />;
      case 'security-center':
        return <SecurityCenter />;
      case 'audit-logs':
        return <AuditLogs />;
      case 'security-testing':
        return <SecurityTesting />;
      case 'farm-settings':
        return <FarmSettings />;
      case 'farm-join':
        return <FarmJoin />;
      case 'farm-create':
        return <FarmCreate />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <main className="flex-1 w-full h-full overflow-y-auto min-h-0 pb-16 md:pb-0">
      <div className="p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <ErrorBoundary>
          {renderContent()}
        </ErrorBoundary>
      </div>
    </main>
  );
};

const AppShell: React.FC = () => {
  const { isAuthenticated } = useApp();

  // Demo/taqdimot rejimi:
  // Foydalanuvchi "Chiqish" tugmasini bosmagan bo'lsa, login sahifasini
  // ko'rsatmasdan, to'g'ridan-to'g'ri admin sifatida tizimga kiritiladi.
  // Loyiha to'liq yakunlangach bu blok o'chiriladi va login majburiy bo'ladi.
  const wasExplicitlyLoggedOut = sessionStorage.getItem('podachi_logged_out');

  React.useEffect(() => {
    if (!isAuthenticated && !wasExplicitlyLoggedOut) {
      try {
        backendEngine.login('admin@podachi.uz', 'podachi2026', false);
      } catch {}
    }
  }, [isAuthenticated, wasExplicitlyLoggedOut]);

  // Login sahifasini faqat foydalanuvchi o'zi "Chiqish" bosganida ko'rsatish
  if (!isAuthenticated && wasExplicitlyLoggedOut) {
    return (
      <>
        <Auth />
        <ToastContainer />
      </>
    );
  }

  // Agar hali auto-login bajarilmagan bo'lsa (birinchi render) — bo'sh ekran
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAF8] dark:bg-[#070E0B] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <Sidebar />
        <MainContent />
      </div>
      <BottomNav />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;
