import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/ui/Toast';

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

import { Lock } from 'lucide-react';
import { UserRole } from './types';
import { NavigationTab } from './context/AppContext';

const ROLE_PERMITTED_TABS: Record<UserRole, NavigationTab[]> = {
  admin: [
    'dashboard', 'livestock', 'catalog', 'movements', 'veterinary',
    'feed', 'finance', 'reports', 'marketplace', 'my-listings',
    'users', 'security-center', 'audit-logs', 'security-testing',
    'farm-settings', 'farm-join', 'farm-create',
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
    'dashboard', 'livestock', 'catalog', 'movements',
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
    <main className="flex-1 h-full overflow-y-auto min-h-0">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {renderContent()}
      </div>
    </main>
  );
};

const AppShell: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return (
      <>
        <Auth />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAF8] dark:bg-[#070E0B] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        <Sidebar />
        <MainContent />
      </div>
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
