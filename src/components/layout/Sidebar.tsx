import React from 'react';
import { useApp, NavigationTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  History,
  Stethoscope,
  Wheat,
  Receipt,
  Coins,
  ShoppingBag,
  Tag,
  Users,
  KeyRound,
  ShieldAlert,
  TestTube2,
  Settings,
  UserPlus,
  Building,
  X,
} from 'lucide-react';

import { UserRole } from '../../types';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
  roles?: UserRole[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentRole, state, isMobileMenuOpen, setIsMobileMenuOpen } = useApp();

  const sections: NavSection[] = [
    {
      title: 'ASOSIY MODULLAR',
      items: [
        { id: 'dashboard', label: 'Boshqaruv Paneli', icon: LayoutDashboard },
        { id: 'livestock', label: 'Chorva Hisobi', icon: Layers },
        { id: 'catalog', label: 'Zotlar Katalogi', icon: BookOpen },
        { id: 'movements', label: 'Harakatlar Tarixi', icon: History, roles: ['admin', 'head_manager', 'manager', 'veterinarian'] },
      ],
    },
    {
      title: 'FERMA AMALIYOTLARI',
      items: [
        { id: 'veterinary', label: 'Veterinariya & Sog\'liq', icon: Stethoscope, roles: ['admin', 'head_manager', 'manager', 'veterinarian'] },
        { id: 'feed', label: 'Yem-Xashak Zaxirasi', icon: Wheat, roles: ['admin', 'head_manager', 'manager'] },
        { id: 'finance', label: 'Moliya & Hisob-kitob', icon: Receipt, roles: ['admin', 'head_manager', 'manager'] },
        { id: 'payroll', label: 'Oylik & Ish Haqi', icon: Coins, roles: ['admin', 'head_manager'] },
      ],
    },
    {
      title: 'BOZOR (MARKETPLACE)',
      items: [
        {
          id: 'marketplace',
          label: 'Bozor Vitrinasi',
          icon: ShoppingBag,
          badge: `${state.marketplaceListings.filter(l => l.status === 'active' || l.status === 'partially_sold').length}`,
        },
        { id: 'my-listings', label: 'Mening E\'lonlarim', icon: Tag, roles: ['admin', 'head_manager', 'manager'] },
      ],
    },
    {
      title: 'XAVFSIZLIK & AUDIT',
      items: [
        { id: 'users', label: 'A\'zolar & Huquqlar (RBAC)', icon: Users, roles: ['admin'] },
        { id: 'security-center', label: 'Kriptografiya Markazi', icon: KeyRound, roles: ['admin'] },
        { id: 'audit-logs', label: 'Audit Jurnali', icon: ShieldAlert, roles: ['admin'] },
        { id: 'security-testing', label: 'Xavfsizlik Testlari', icon: TestTube2, badge: '12 Test', roles: ['admin'] },
      ],
    },
    {
      title: 'SOZLAMALAR',
      items: [
        { id: 'farm-settings', label: 'Ferma Sozlamalari', icon: Settings, roles: ['admin'] },
        { id: 'farm-join', label: 'Fermaga Qo\'shilish', icon: UserPlus },
        { id: 'farm-create', label: 'Yangi Ferma Yaratish', icon: Building },
      ],
    },
  ];

  // Filter sections and items strictly based on current role
  const visibleSections = sections
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.roles || item.roles.includes(currentRole)),
    }))
    .filter(section => section.items.length > 0);

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#0A1310] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col justify-between py-5 px-3 md:static md:translate-x-0 md:w-64 md:shrink-0 md:z-0 md:shadow-none md:border-r md:border-slate-200/80 md:dark:border-forest-900/40 md:h-full md:overflow-y-auto ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6 overflow-y-auto">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-100 dark:border-slate-800 md:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#F9F8F4] flex items-center justify-center border border-forest-700/20">
                <img src="/logo.png" alt="Podachi Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                PODACHI
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {visibleSections.map(section => (
            <div key={section.title}>
              <p className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-2">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-forest-800 dark:bg-forest-700 text-white shadow-sm shadow-forest-900/20'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-transform ${
                            isActive ? 'text-forest-200' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-forest-700 dark:bg-forest-600 text-forest-100'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Role Notice in Sidebar Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 px-3 shrink-0">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-forest-900/40">
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
              Faol Ruxsat: <span className="capitalize text-forest-700 dark:text-forest-400 font-extrabold">{currentRole}</span>
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              RBAC talablari asosida har bir amal serverda tekshiriladi.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

