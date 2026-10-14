import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { backendEngine } from '../lib/backendEngine';
import { Building2, MapPin, Phone, Download, Database, Check } from 'lucide-react';

export const FarmSettings: React.FC = () => {
  const { state, currentFarm, currentRole, showToast } = useApp();

  const [title, setTitle] = useState(currentFarm?.display_title || '');
  const [location, setLocation] = useState(currentFarm?.location || '');
  const [description, setDescription] = useState(currentFarm?.description || '');
  const [phone, setPhone] = useState(currentFarm?.contact_phone || '');

  const isAdmin = currentRole === 'admin';

  const handleExportBackup = () => {
    const backupData = {
      farm: currentFarm,
      livestock: state.animalGroups.filter(g => g.farm_id === currentFarm?.id),
      movements: state.movements.filter(m => m.farm_id === currentFarm?.id),
      vetRecords: state.vetRecords.filter(v => v.farm_id === currentFarm?.id),
      feed: state.feedItems.filter(f => f.farm_id === currentFarm?.id),
      finance: state.finances.filter(f => f.farm_id === currentFarm?.id),
      listings: state.marketplaceListings.filter(l => l.farm_id === currentFarm?.id),
      timestamp: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Podachi_Backup_${currentFarm?.name}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Ferma ma\'lumotlari JSON formatida yuklab olindi', 'success');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      backendEngine.updateFarmSettings({
        display_title: title,
        location,
        description: description || undefined,
        contact_phone: phone || undefined,
      });
      showToast('Ferma sozlamalari muvaffaqiyatli yangilandi', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Ferma Sozlamalari</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {currentFarm?.display_title || currentFarm?.name} xo'jaligining umumiy parametrlari va zaxira nusxalari
        </p>
      </div>

      <div className="bg-white dark:bg-[#0E1A16] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-white/10 shadow-sm space-y-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-[#14231E] border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                O'zgarmas Ferma Identifikatori:
              </span>
              <strong className="text-sm font-mono text-slate-900 dark:text-white">@{currentFarm?.name}</strong>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-400 font-mono">ID: {currentFarm?.id}</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ko'rinish Nomi (Display Title)
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl text-sm bg-white dark:bg-[#14231E] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600 disabled:bg-slate-50 dark:disabled:bg-[#14231E]/60 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Manzil / Joylashuv
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl text-sm bg-white dark:bg-[#14231E] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600 disabled:bg-slate-50 dark:disabled:bg-[#14231E]/60 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Aloqa telefoni
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl text-sm bg-white dark:bg-[#14231E] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600 disabled:bg-slate-50 dark:disabled:bg-[#14231E]/60 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tavsif
            </label>
            <textarea
              rows={3}
              disabled={!isAdmin}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl text-sm bg-white dark:bg-[#14231E] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600 disabled:bg-slate-50 dark:disabled:bg-[#14231E]/60 disabled:text-slate-500"
            />
          </div>

          {isAdmin && (
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <Check className="w-4 h-4" />
                O'zgarishlarni saqlash
              </button>
            </div>
          )}
        </form>

        {/* Data Backup Section */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-white/10 space-y-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-forest-700 dark:text-forest-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Ma'lumotlar Zaxira Nusxasi (Backup)</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Fermangizdagi barcha chorva hisobi, harakatlar, tibbiy qaydlar, moliya va bozor yozuvlarini xavfsiz JSON fayl sifatida yuklab oling.
          </p>
          <button
            onClick={handleExportBackup}
            className="px-4 py-2.5 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#14231E] hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            To'liq zaxira faylini yuklab olish (.json)
          </button>
        </div>

      </div>

    </div>
  );
};
