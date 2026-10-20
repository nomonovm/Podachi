import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  Mail,
  User,
  Building2,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Globe,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sun,
  Moon,
} from 'lucide-react';
import { backendEngine } from '../lib/backendEngine';

export const Auth: React.FC = () => {
  const { login, register, isDarkMode, toggleDarkMode, showToast } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login form states
  const [loginEmail, setLoginEmail] = useState('admin@podachi.uz');
  const [loginPassword, setLoginPassword] = useState('podachi2026');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitStatus, setRateLimitStatus] = useState(() => backendEngine.getIpRateLimitStatus());

  const refreshRateLimit = () => {
    setRateLimitStatus(backendEngine.getIpRateLimitStatus());
  };

  // Update countdown periodically when locked
  React.useEffect(() => {
    if (!rateLimitStatus.isLocked) return;
    const interval = setInterval(() => {
      refreshRateLimit();
    }, 10000);
    return () => clearInterval(interval);
  }, [rateLimitStatus.isLocked]);

  // Register form states
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regIntent, setRegIntent] = useState<'create_farm' | 'join_farm'>('create_farm');
  const [regFarmName, setRegFarmName] = useState('');
  const [regFarmTitle, setRegFarmTitle] = useState('');
  const [regLocation, setRegLocation] = useState('Toshkent viloyati, Bo\'stonliq tumani');
  const [regError, setRegError] = useState<string | null>(null);

  // Quick fill demo credentials for university evaluators
  const demoAccounts = [
    {
      role: 'Administrator',
      name: 'Alisher Qodirov',
      email: 'admin@podachi.uz',
      pass: 'podachi2026',
      badge: 'To\'liq huquq',
      color: 'border-forest-300 dark:border-forest-500/40 bg-forest-50/80 dark:bg-forest-950/40 text-forest-900 dark:text-forest-300',
    },
    {
      role: 'Menejer',
      name: 'Bobur Rustamov',
      email: 'manager@podachi.uz',
      pass: 'podachi2026',
      badge: 'Chorva & Moliya',
      color: 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300',
    },
    {
      role: 'Veterinar',
      name: 'Dr. Jamshid Zokirov',
      email: 'vet@podachi.uz',
      pass: 'podachi2026',
      badge: 'Sog\'liq & Qaydlar',
      color: 'border-amber-300 dark:border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300',
    },
    {
      role: 'Kuzatuvchi',
      name: 'Dilshod Karimov',
      email: 'viewer@podachi.uz',
      pass: 'podachi2026',
      badge: 'Faqat o\'qish',
      color: 'border-slate-300 dark:border-slate-500/40 bg-slate-100/80 dark:bg-slate-900/60 text-slate-800 dark:text-slate-300',
    },
  ];

  const fillDemoCredentials = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    const res = await login(loginEmail, loginPassword, rememberMe);
    refreshRateLimit();
    if (!res.success) {
      setLoginError(res.error || "Login yoki parol noto'g'ri.");
    }
    setIsSubmitting(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regPassword !== regConfirmPassword) {
      setRegError("Kiritilgan parollar bir-biriga mos kelmadi!");
      return;
    }

    if (regIntent === 'create_farm') {
      const check = backendEngine.validateFarmName(regFarmName);
      if (!check.valid) {
        setRegError(check.error || "Ferma nomi noto'g'ri formatda.");
        return;
      }
    }

    setIsSubmitting(true);
    const res = await register({
      full_name: regFullName,
      email: regEmail,
      password: regPassword,
      intent: regIntent,
      farm_name: regFarmName,
      farm_title: regFarmTitle || regFarmName,
      location: regLocation,
    }, rememberMe);

    if (!res.success) {
      setRegError(res.error || "Ro'yxatdan o'tishda xatolik yuz berdi. Ma'lumotlarni tekshiring.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] dark:bg-[#070D0B] text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans transition-colors duration-200">
      
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] rounded-full bg-forest-400/15 dark:bg-forest-700/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[650px] h-[650px] rounded-full bg-emerald-500/10 dark:bg-emerald-600/15 blur-[150px] pointer-events-none" />

      {/* Top Navbar in Auth Screen */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg border border-forest-500/30 bg-white dark:bg-[#F9F8F4] flex items-center justify-center">
            <img src="/logo.png" alt="Podachi" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">PODACHI</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-200 border border-forest-300 dark:border-forest-600/40">
                PRO PLATFORM
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 -mt-0.5">Chorvachilik Boshqaruv & Raqamli Bozor</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs transition"
            title={isDarkMode ? "Yorug' rejim" : "Qorong'i rejim"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-100/80 dark:bg-forest-950/80 border border-forest-300 dark:border-forest-700/50 text-xs font-semibold text-forest-900 dark:text-forest-300">
            <ShieldCheck className="w-4 h-4 text-forest-700 dark:text-forest-400" />
            <span>Kiberxavfsizlik & RBAC Himoyasi</span>
          </div>
        </div>
      </header>

      {/* Main Center Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/90 dark:border-forest-700/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-300/50 dark:shadow-forest-950/60 space-y-6 transition-colors">
          
          {/* Tabs: Kirish vs Ro'yxatdan o'tish */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setMode('login');
                setLoginError(null);
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-forest-800 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Tizimga Kirish
            </button>
            <button
              onClick={() => {
                setMode('register');
                setRegError(null);
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-forest-800 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Yangi Ro'yxatdan O'tish
            </button>
          </div>

          {/* MODE 1: LOGIN FORM */}
          {mode === 'login' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Hisobingizga Kiring</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Chorvachilik fermangizni boshqarish va bozor operatsiyalarini davom ettirish uchun kiring.
                </p>
              </div>

              {/* Rate Limit Security Status */}
              {rateLimitStatus.isLocked && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
                  <span>Juda ko'p muvaffaqiyatsiz urinishlar qayd etildi. Iltimos, keyinroq urinib ko'ring.</span>
                </div>
              )}

              {!rateLimitStatus.isLocked && loginError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Manzili
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="admin@podachi.uz"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-forest-600 dark:focus:border-forest-500 focus:ring-1 focus:ring-forest-600 dark:focus:ring-forest-500 font-mono transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Parol
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-forest-600 dark:focus:border-forest-500 focus:ring-1 focus:ring-forest-600 dark:focus:ring-forest-500 font-mono transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 select-none hover:text-slate-900 dark:hover:text-white transition">
                    <input
                      type="checkbox"
                      id="rememberMeLogin"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-forest-600 focus:ring-forest-500 cursor-pointer accent-forest-600"
                    />
                    <span>Kirishni saqlash</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || rateLimitStatus.isLocked}
                  className="w-full py-3 bg-gradient-to-r from-forest-700 to-forest-800 hover:from-forest-600 hover:to-forest-700 disabled:opacity-50 text-white rounded-xl text-sm font-extrabold transition shadow-lg shadow-forest-900/50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>{rateLimitStatus.isLocked ? 'Keyinroq urining' : 'Tizimga Kirish'}</span>
                  {!rateLimitStatus.isLocked && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Quick Fill Demo Credentials for Evaluators */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Demo Sinov Rollari:
                  </span>
                  <span className="text-[10px] text-forest-800 dark:text-forest-400 font-semibold bg-forest-100 dark:bg-forest-950 px-2 py-0.5 rounded border border-forest-300 dark:border-forest-800">
                    1-Klikda to'ldirish
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {demoAccounts.map(acc => (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => fillDemoCredentials(acc.email, acc.pass)}
                      className={`text-left p-2.5 rounded-xl border transition hover:scale-[1.02] ${acc.color}`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-xs block font-bold text-slate-900 dark:text-white">{acc.role}</strong>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 shadow-2xs">
                          {acc.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 block truncate font-mono mt-0.5">
                        {acc.email}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: REGISTER FORM */}
          {mode === 'register' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Yangi Profil Ochish</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Fermangizni ro'yxatdan o'tkazing yoki mavjud xo'jalikka qo'shilish so'rovini yuboring.
                </p>
              </div>

              {regError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ism va Familiyangiz
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Sardor Aliyev"
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-forest-600 dark:focus:border-forest-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Manzili
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sardor@podachi.uz"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-forest-600 dark:focus:border-forest-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Parol</label>
                    <input
                      type="password"
                      required
                      placeholder="Kamida 6 belgi"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-forest-600 dark:focus:border-forest-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tasdiqlash</label>
                    <input
                      type="password"
                      required
                      placeholder="Parolni qaytaring"
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-forest-600 dark:focus:border-forest-500"
                    />
                  </div>
                </div>

                {/* Section 3 Selection: Create vs Join */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Chorvachilik yo'nalishingiz:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegIntent('create_farm')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        regIntent === 'create_farm'
                          ? 'border-forest-600 dark:border-forest-500 bg-forest-50 dark:bg-forest-950/80 text-forest-900 dark:text-forest-200 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <strong className="text-xs block font-bold">Yangi ferma yaratish</strong>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Siz ferma rahbari (Admin) bo'lasiz</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegIntent('join_farm')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        regIntent === 'join_farm'
                          ? 'border-forest-600 dark:border-forest-500 bg-forest-50 dark:bg-forest-950/80 text-forest-900 dark:text-forest-200 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <strong className="text-xs block font-bold">Mavjud fermaga qo'shilish</strong>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Nom orqali so'rov yuborish</span>
                    </button>
                  </div>
                </div>

                {regIntent === 'create_farm' && (
                  <div className="p-3 rounded-xl bg-forest-50/60 dark:bg-forest-950/50 border border-forest-200 dark:border-forest-800/60 space-y-2.5 text-xs">
                    <div>
                      <label className="block font-bold text-forest-900 dark:text-forest-200 mb-1">
                        Ferma Nomi (Probelsiz, lotin harflari):
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Masalan: BarakaNaslAgro"
                        value={regFarmName}
                        onChange={e => setRegFarmName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-forest-300 dark:border-forest-700/70 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-forest-900 dark:text-forest-200 mb-1">Joylashuv</label>
                      <input
                        type="text"
                        value={regLocation}
                        onChange={e => setRegLocation(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-forest-300 dark:border-forest-700/70 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {regIntent === 'join_farm' && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Qo'shilmoqchi bo'lgan ferma nomi:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: BarakaFerma"
                      value={regFarmName}
                      onChange={e => setRegFarmName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      * Administrator so'rovingizni ko'rib chiqqach va tasdiqlagach a'zo bo'lasiz.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between py-1">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 select-none hover:text-slate-900 dark:hover:text-white transition">
                    <input
                      type="checkbox"
                      id="rememberMeRegister"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-forest-600 focus:ring-forest-500 cursor-pointer accent-forest-600"
                    />
                    <span>Kirishni saqlash</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-forest-700 to-forest-800 hover:from-forest-600 hover:to-forest-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition shadow-lg shadow-forest-900/50 flex items-center justify-center gap-2 mt-2"
                >
                  <span>Ro'yxatdan O'tish & Boshlash</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* Footer in Auth Screen */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 PODACHI. Barcha huquqlar himoyalangan.</p>
      </footer>

    </div>
  );
};
