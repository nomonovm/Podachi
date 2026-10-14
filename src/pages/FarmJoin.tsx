import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { backendEngine } from '../lib/backendEngine';
import { Search, Building2, MapPin, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Farm } from '../types';

export const FarmJoin: React.FC = () => {
  const { state, showToast, setActiveTab } = useApp();

  const [searchName, setSearchName] = useState('');
  const [foundFarm, setFoundFarm] = useState<Farm | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Check my join requests
  const myRequests = state.joinRequests.filter(r => r.user_id === state.currentUser.id);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setFoundFarm(null);
    setHasSearched(true);

    if (!searchName.trim()) {
      setSearchError("Iltimos, ferma nomini kiriting.");
      return;
    }

    if (/\s/.test(searchName)) {
      setSearchError("Ferma nomida bo'sh joy (probel) bo'lishi mumkin emas. Masalan: 'BarakaFerma'.");
      return;
    }

    const farm = backendEngine.searchFarmByName(searchName);
    if (!farm) {
      setSearchError(`'${searchName}' nomli ferma topilmadi. Ferma nomini to'g'ri kiritganingizni tekshiring.`);
      return;
    }

    setFoundFarm(farm);
  };

  const handleSendRequest = () => {
    if (!foundFarm) return;
    try {
      backendEngine.submitJoinRequest(foundFarm.name);
      showToast(`'${foundFarm.display_title}' fermasiga a'zolik so'rovi yuborildi`, 'success');
      setFoundFarm(null);
      setSearchName('');
      setHasSearched(false);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      
      {/* Search Box */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-white/10 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 dark:bg-forest-900/40 text-forest-800 dark:text-forest-300 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Mavjud Fermaga Qo'shilish</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ferma nomini qidirib toping va administratorga a'zolik so'rovini yuboring
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ferma Nomi (Format: Lotin harflari, probelsiz)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Masalan: BarakaFerma yoki VodiyAgro"
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl text-sm font-semibold bg-white dark:bg-[#14231E] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm shrink-0"
              >
                <Search className="w-4 h-4" />
                Qidirish
              </button>
            </div>
          </div>

          {searchError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
              <span>{searchError}</span>
            </div>
          )}
        </form>

        {/* Found Farm Public Card */}
        {foundFarm && (
          <div className="mt-6 p-5 rounded-2xl border border-forest-200 dark:border-forest-800/40 bg-forest-50/50 dark:bg-forest-950/30 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 dark:text-forest-300 bg-forest-100 dark:bg-forest-900/50 px-2 py-0.5 rounded">
                  Topilgan Ferma
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{foundFarm.display_title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Identifikator: @{foundFarm.name}</p>
              </div>
              <Building2 className="w-8 h-8 text-forest-700 dark:text-forest-400 opacity-60" />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{foundFarm.location}</span>
            </div>

            {foundFarm.description && (
              <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-[#14231E] p-3 rounded-xl border border-slate-200 dark:border-white/10">
                "{foundFarm.description}"
              </p>
            )}

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-[11px] text-amber-900 dark:text-amber-200">
              <strong>Xavfsizlik qoidasi:</strong> Ferma nomini bilish yoki so'rov yuborish avtomatik kirish huquqini bermaydi. Ferma administratori so'rovingizni tasdiqlagach, belgilangan rol bilan ferma ma'lumotlariga kira olasiz.
            </div>

            <button
              onClick={handleSendRequest}
              className="w-full py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              Qo'shilish so'rovini yuborish
            </button>
          </div>
        )}
      </div>

      {/* My Submitted Requests */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-3xl p-6 border border-slate-200/90 dark:border-white/10 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Mening Yuborgan So'rovlarim</h3>
        <div className="space-y-2.5">
          {myRequests.map(req => (
            <div
              key={req.id}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-[#14231E]/60 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{req.farm_name}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 font-mono mt-0.5">
                  Yuborilgan sana: {req.requested_at.split('T')[0]}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {req.status === 'pending' && (
                  <span className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40">
                    <Clock className="w-3 h-3" />
                    Kutilmoqda
                  </span>
                )}
                {req.status === 'accepted' && (
                  <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                    <CheckCircle2 className="w-3 h-3" />
                    Qabul qilingan ({req.assigned_role})
                  </span>
                )}
                {req.status === 'rejected' && (
                  <span className="font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/40">
                    Rad etilgan
                  </span>
                )}
              </div>
            </div>
          ))}
          {myRequests.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">Siz hali hech qanday fermaga so'rov yubormagansiz</p>
          )}
        </div>
      </div>

    </div>
  );
};
