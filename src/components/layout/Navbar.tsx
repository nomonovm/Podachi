import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  RotateCcw,
  PlusCircle,
  LogIn,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Navbar: React.FC = () => {
  const {
    state,
    currentUser,
    currentFarm,
    currentRole,
    isDarkMode,
    toggleDarkMode,
    logout,
    setCurrentUser,
    setCurrentFarm,
    setActiveTab,
    resetAllData,
  } = useApp();

  const [farmMenuOpen, setFarmMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const roleLabels: Record<string, { label: string; variant: 'forest' | 'emerald' | 'amber' | 'slate' }> = {
    admin: { label: 'Administrator', variant: 'forest' },
    manager: { label: 'Menejer', variant: 'emerald' },
    veterinarian: { label: 'Veterinar', variant: 'amber' },
    viewer: { label: 'Kuzatuvchi', variant: 'slate' },
  };

  // Find user's member farms
  const myFarmMemberships = state.farmMembers.filter(
    m => m.user_id === currentUser.id && m.status === 'active'
  );
  const myFarms = state.farms.filter(f => myFarmMemberships.some(m => m.farm_id === f.id));

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0C1714]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-forest-900/60 shadow-xs transition-colors duration-200 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-forest-700/20 bg-[#F9F8F4] group-hover:scale-105 transition-transform flex items-center justify-center">
                <img src="/logo.png" alt="Podachi Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-forest-700 dark:group-hover:text-forest-400 transition-colors">
                    PODACHI
                  </span>
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-forest-100 dark:bg-forest-900/80 text-forest-800 dark:text-forest-200 px-1.5 py-0.5 rounded border border-forest-200 dark:border-forest-700/50">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5 hidden sm:block">
                  Chorvachilik Boshqaruv & Bozor Platformasi
                </p>
              </div>
            </button>
          </div>

          {/* Center: Active Farm Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setFarmMenuOpen(!farmMenuOpen);
                setUserMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-forest-800/60 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-sm font-semibold transition"
            >
              <Building2 className="w-4 h-4 text-forest-700 dark:text-forest-400" />
              <div className="text-left hidden md:block">
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-tight">Faol Ferma:</span>
                <span className="text-slate-900 dark:text-white font-bold">{currentFarm?.display_title || currentFarm?.name || 'Ferma tanlanmagan'}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {farmMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mening fermalarim</p>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {myFarms.map(f => {
                    const isSelected = f.id === currentFarm?.id;
                    const roleInThisFarm = state.farmMembers.find(
                      m => m.farm_id === f.id && m.user_id === currentUser.id
                    )?.role;

                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          setCurrentFarm(f.id);
                          setFarmMenuOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-start justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition ${
                          isSelected ? 'bg-forest-50/70 dark:bg-forest-950/60 border-l-4 border-forest-600' : ''
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{f.display_title || f.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{f.location}</p>
                        </div>
                        {roleInThisFarm && (
                          <Badge size="sm" variant={roleLabels[roleInThisFarm]?.variant || 'slate'}>
                            {roleLabels[roleInThisFarm]?.label || roleInThisFarm}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 p-2 space-y-1">
                  <button
                    onClick={() => {
                      setFarmMenuOpen(false);
                      setActiveTab('farm-create');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-forest-800 dark:text-forest-300 hover:bg-forest-50 dark:hover:bg-forest-950/60 rounded-lg transition"
                  >
                    <PlusCircle className="w-4 h-4 text-forest-600 dark:text-forest-400" />
                    Yangi ferma ochish
                  </button>
                  <button
                    onClick={() => {
                      setFarmMenuOpen(false);
                      setActiveTab('farm-join');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                  >
                    <LogIn className="w-4 h-4 text-slate-500" />
                    Nom orqali fermaga qo'shilish
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Dark Mode Toggle, Security Pill, User Simulator, & Logout */}
          <div className="flex items-center gap-2.5">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={isDarkMode ? "Yorug' rejimga o'tish" : "Qorong'i rejimga o'tish"}
              aria-label="Rejimni almashtirish"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Security Indicator */}
            {currentRole === 'admin' ? (
              <button
                onClick={() => setActiveTab('security-center')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
                title="Kriptografiya va Xavfsizlik Markazi"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Kriptografiya & RBAC Faol</span>
              </button>
            ) : (
              <div
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                title="RBAC Himoyasi Faol"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>RBAC Faol</span>
              </div>
            )}

            {/* User Simulator / Role Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setFarmMenuOpen(false);
                }}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-forest-900 dark:bg-forest-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {currentUser.full_name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.full_name.split(' ')[0]}</span>
                    <Badge size="sm" variant={roleLabels[currentRole]?.variant || 'slate'}>
                      {roleLabels[currentRole]?.label}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">{currentUser.email}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Profilni sinovdan o'tkazish</span>
                      <span className="text-[11px] text-forest-700 dark:text-forest-300 bg-forest-50 dark:bg-forest-950 px-2 py-0.5 rounded font-semibold border border-forest-200 dark:border-forest-800">
                        RBAC Demo
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Turli rollarda ruxsatlarni sinash uchun foydalanuvchini almashtiring:
                    </p>
                  </div>

                  <div className="py-1">
                    {state.users.map(u => {
                      const isCurrent = u.id === currentUser.id;
                      const roleInCurrentFarm = state.farmMembers.find(
                        m => m.user_id === u.id && m.farm_id === currentFarm?.id
                      )?.role || 'A\'zo emas';

                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            setCurrentUser(u);
                            setUserMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition ${
                            isCurrent ? 'bg-forest-50/70 dark:bg-forest-950/60 font-semibold' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                              {u.full_name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{u.full_name}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</p>
                            </div>
                          </div>
                          <Badge
                            size="sm"
                            variant={roleLabels[roleInCurrentFarm]?.variant || 'slate'}
                          >
                            {roleLabels[roleInCurrentFarm]?.label || roleInCurrentFarm}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 p-2 space-y-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Tizimdan chiqish (Logout)
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (window.confirm("Barcha ma'lumotlarni dastlabki holatga qaytarishni xohlaysizmi?")) {
                          resetAllData();
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Ma'lumotlarni qayta tiklash
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Logout Icon button on Navbar */}
            <button
              onClick={logout}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Chiqish (Logout)"
              aria-label="Tizimdan chiqish"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
