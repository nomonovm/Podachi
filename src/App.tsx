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

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

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
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
      {renderContent()}
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
    <div className="min-h-screen bg-[#F8FAF8] dark:bg-[#070E0B] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row">
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
