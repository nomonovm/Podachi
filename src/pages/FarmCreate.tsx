import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { backendEngine } from '../lib/backendEngine';
import { Building2, Check, AlertCircle, ShieldCheck } from 'lucide-react';

export const FarmCreate: React.FC = () => {
  const { showToast, setActiveTab } = useApp();

  const [name, setName] = useState('');
  const [displayTitle, setDisplayTitle] = useState('');
  const [location, setLocation] = useState('Toshkent viloyati, Parkent tumani');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('+998 90 123 45 67');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    const check = backendEngine.validateFarmName(val);
    if (!check.valid) {
      setValidationError(check.error || null);
    } else {
      setValidationError(null);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newFarm = backendEngine.createFarm({
        name,
        display_title: displayTitle || name,
        location,
        description,
        contact_phone: phone,
      });

      showToast(`'${newFarm.display_title}' fermasi muvaffaqiyatli yaratildi!`, 'success');
      setActiveTab('dashboard');
    } catch (err: any) {
      setValidationError(err.message);
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="bg-white dark:bg-[#0E1A16] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-white/10 shadow-md">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 dark:bg-forest-900/40 text-forest-800 dark:text-forest-300 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Yangi Ferma Yaratish</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              O'z chorvachilik xo'jaligingizni Podachi platformasida ro'yxatdan o'tkazing
            </p>
          </div>
        </div>

        {/* Technical Specification Notice */}
        <div className="bg-forest-50/70 dark:bg-forest-950/40 border border-forest-200 dark:border-forest-800/40 rounded-2xl p-4 mb-6 text-xs text-forest-900 dark:text-forest-200 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4 text-forest-700 dark:text-forest-400" />
            <span>Ferma nomi uchun qat'iy qoidalar:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300 pl-1">
            <li>Probel (bo'sh joy) belgilariga ruxsat berilmaydi (masalan: <em>"Baraka Ferma"</em> xato, <strong>"BarakaFerma"</strong> to'g'ri).</li>
            <li>Faqat lotin harflari, raqamlar, pastki chiziq (_) va chiziqcha (-) qabul qilinadi.</li>
            <li>Ferma nomi noyob bo'lishi shart (katta-kichik harflar farqlanmaydi, <em>"barakaferma"</em> takroriy hisoblanadi).</li>
          </ul>
        </div>

        <form onSubmit={handleCreate} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ferma Nomi (Tizimli identifikator) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: BarakaFerma yoki Zarafshon_Agro"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm font-semibold transition focus:outline-none focus:ring-2 bg-white dark:bg-[#14231E] text-slate-900 dark:text-white ${
                validationError
                  ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500 bg-rose-50/30 dark:bg-rose-950/30'
                  : 'border-slate-300 dark:border-white/10 focus:ring-forest-600'
              }`}
            />
            {validationError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {validationError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ferma To'liq Ko'rinish Nomi (Taqdimot uchun)
            </label>
            <input
              type="text"
              placeholder="Masalan: Baraka Naslli Chorvachilik Majmuasi"
              value={displayTitle}
              onChange={e => setDisplayTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl text-sm bg-white dark:bg-[#14231E] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Joylashuv (Viloyat, tuman) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl text-sm bg-white dark:bg-[#14231E] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Aloqa telefoni (ixtiyoriy)
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl text-sm bg-white dark:bg-[#14231E] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Qisqacha tavsif (ixtiyoriy)
              </label>
              <input
                type="text"
                placeholder="Hisori qo'ylar va qoramolchilik..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl text-sm bg-white dark:bg-[#14231E] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="px-5 py-2.5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-xs font-bold transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={Boolean(validationError) || !name}
              className="px-6 py-2.5 bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Fermani Yaratish & Rahbar Bo'lish
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
