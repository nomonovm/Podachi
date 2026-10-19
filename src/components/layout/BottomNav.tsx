import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Layers,
  Receipt,
  Wheat,
  ShoppingBag,
  Menu,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, currentRole, isMobileMenuOpen, setIsMobileMenuOpen } = useApp();

  const isViewer = currentRole === 'viewer';

  const navItems = [
    { id: 'dashboard' as const, label: 'Boshqaruv', icon: LayoutDashboard },
    { id: 'livestock' as const, label: 'Chorva', icon: Layers },
    isViewer
      ? { id: 'feed' as const, label: 'Ozuqa', icon: Wheat }
      : { id: 'finance' as const, label: 'Moliya', icon: Receipt },
    { id: 'marketplace' as const, label: 'Bozor', icon: ShoppingBag },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-[#0A1310]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-forest-900/50 shadow-lg px-2 py-1 flex items-center justify-around transition-colors">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-forest-800 dark:text-emerald-400 font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-forest-800 dark:text-emerald-400' : ''}`} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}

      {/* Menu / Drawer Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
          isMobileMenuOpen
            ? 'text-forest-800 dark:text-emerald-400 font-extrabold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
        }`}
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Menyu</span>
      </button>
    </nav>
  );
};
