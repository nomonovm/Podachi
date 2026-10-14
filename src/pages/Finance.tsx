import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { backendEngine } from '../lib/backendEngine';
import {
  Receipt,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  DollarSign,
  Lock,
  Calendar,
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { FinanceRecord } from '../types';

export const Finance: React.FC = () => {
  const { state, currentFarm, currentRole, showToast } = useApp();
  const farmId = currentFarm?.id;

  const finances = state.finances.filter(f => f.farm_id === farmId);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form states
  const [type, setType] = useState<FinanceRecord['type']>('xarajat');
  const [category, setCategory] = useState<FinanceRecord['category']>('yem_xashak');
  const [amount, setAmount] = useState<number>(1000000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const canAccess = currentRole === 'admin' || currentRole === 'manager';

  if (!canAccess) {
    return (
      <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-12 text-center border border-slate-200 dark:border-forest-800/40 max-w-xl mx-auto mt-12">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900/50">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Kirish Huquqi Cheklangan (RBAC)</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Sizning faol rolingiz: <strong className="capitalize text-slate-900 dark:text-white">{currentRole}</strong>.<br />
          Ferma moliyaviy ma'lumotlari faqat <strong>Administrator</strong> va <strong>Menejer</strong> tomonidan ko'rilishi va boshqarilishi mumkin.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Kirish uchun ferma administratoriga murojaat qiling yoki tizimga Administrator yoki Menejer sifatida kiring.
        </p>
      </div>
    );
  }

  const totalRevenues = finances
    .filter(f => f.type === 'daromad')
    .reduce((sum, f) => sum + f.amount_uzs, 0);

  const totalExpenses = finances
    .filter(f => f.type === 'xarajat')
    .reduce((sum, f) => sum + f.amount_uzs, 0);

  const financialResult = totalRevenues - totalExpenses;

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      backendEngine.addFinanceRecord({
        type,
        category,
        amount_uzs: Number(amount),
        date,
        description,
      });

      showToast('Moliyaviy yozuv muvaffaqiyatli saqlandi', 'success');
      setIsAddModalOpen(false);
      setDescription('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Sana', 'Turi', 'Kategoriya', 'Summa (UZS)', 'Izoh', 'Kiritgan Shaxs'];
    const rows = finances.map(f => [
      f.date,
      f.type,
      f.category,
      f.amount_uzs,
      `"${f.description.replace(/"/g, '""')}"`,
      `"${f.created_by}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Podachi_Moliya_${currentFarm?.name}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV hisoboti yuklab olindi', 'success');
  };

  const filteredFinances = finances.filter(f => {
    const matchesType = filterType === 'all' || f.type === filterType;
    const matchesCategory = filterCategory === 'all' || f.category === filterCategory;
    return matchesType && matchesCategory;
  });

  const categoryLabels: Record<string, string> = {
    yem_xashak: 'Yem-xashak',
    veterinariya: 'Veterinariya',
    dori_darmon: 'Dori-darmon',
    ish_haqi: 'Ish haqi',
    transport: 'Transport',
    kommunal: 'Kommunal',
    boshqa: 'Boshqa xarajat',
    chorva_sotuvi: 'Chorva sotish tushumi',
    sut_mahsulotlari: 'Sut va mahsulotlar',
    boshqa_daromad: 'Boshqa daromad',
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Moliya &amp; Hisob-kitob</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daromad va xarajatlar tahlili, sotuvdan tushumlar va operatsion balans
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 border border-slate-200 dark:border-forest-800/60 bg-white dark:bg-[#0E1A16] hover:bg-slate-50 dark:hover:bg-forest-900/50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            CSV yuklab olish
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Yozuv qo'shish
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-5 border border-slate-200/90 dark:border-forest-800/40 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Jami Daromad</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalRevenues.toLocaleString()} so'm</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Chorva va sut mahsulotlari sotuvi</p>
        </div>

        <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-5 border border-slate-200/90 dark:border-forest-800/40 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Jami Xarajat</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalExpenses.toLocaleString()} so'm</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Yem, ish haqi, dori va boshqa</p>
        </div>

        <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-5 border border-slate-200/90 dark:border-forest-800/40 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Moliyaviy Natija</span>
            <Badge variant={financialResult >= 0 ? 'emerald' : 'rose'}>
              {financialResult >= 0 ? 'Ijobiy balans' : 'Salbiy balans'}
            </Badge>
          </div>
          <p className={`text-2xl font-black ${financialResult >= 0 ? 'text-forest-800 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
            {financialResult > 0 ? '+' : ''}{financialResult.toLocaleString()} so'm
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            * Barcha xarajatlar to'liq hisobga olinmaguncha tasdiqlangan sof foyda hisoblanmaydi
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['all', 'daromad', 'xarajat'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === t
                  ? 'bg-forest-800 dark:bg-forest-700 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0E1A16] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-forest-800/60 hover:bg-slate-50 dark:hover:bg-forest-900/50'
              }`}
            >
              {t === 'all' ? `Barchasi (${finances.length})` : t === 'daromad' ? 'Daromadlar' : 'Xarajatlar'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-2xl border border-slate-200/90 dark:border-forest-800/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-forest-950/60 border-b border-slate-200 dark:border-forest-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Sana</th>
                <th className="py-3 px-4">Turi</th>
                <th className="py-3 px-4">Kategoriya</th>
                <th className="py-3 px-4">Tavsif / Asos</th>
                <th className="py-3 px-4 text-right">Summa (UZS)</th>
                <th className="py-3 px-4">Mas'ul</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-forest-900/60">
              {filteredFinances.map(item => {
                const isIncome = item.type === 'daromad';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-forest-950/40 transition">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge size="sm" variant={isIncome ? 'emerald' : 'rose'}>
                        {isIncome ? 'Daromad' : 'Xarajat'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {categoryLabels[item.category] || item.category}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-sm">
                      <p>{item.description}</p>
                      {item.linked_entity_type === 'marketplace_sale' && (
                        <span className="text-[10px] text-forest-700 dark:text-emerald-400 bg-forest-50 dark:bg-forest-950/60 px-1.5 py-0.5 rounded font-bold inline-block mt-0.5">
                          Bozor sotuvi bilan avtomatik bog'langan
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-black font-mono text-sm whitespace-nowrap">
                      <span className={isIncome ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'}>
                        {isIncome ? '+' : '-'}{item.amount_uzs.toLocaleString()} so'm
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {item.created_by}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredFinances.length === 0 && (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
              Moliyaviy yozuvlar mavjud emas
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Record */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Moliyaviy Yozuv Kiritish"
        maxWidth="md"
      >
        <form onSubmit={handleAddRecord} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Operatsiya turi</label>
              <select
                value={type}
                onChange={e => {
                  const newType = e.target.value as any;
                  setType(newType);
                  setCategory(newType === 'daromad' ? 'chorva_sotuvi' : 'yem_xashak');
                }}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              >
                <option value="xarajat">Xarajat</option>
                <option value="daromad">Daromad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategoriya</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              >
                {type === 'daromad' ? (
                  <>
                    <option value="chorva_sotuvi">Chorva sotish</option>
                    <option value="sut_mahsulotlari">Sut va mahsulotlar</option>
                    <option value="boshqa_daromad">Boshqa daromad</option>
                  </>
                ) : (
                  <>
                    <option value="yem_xashak">Yem-xashak xaridi</option>
                    <option value="veterinariya">Veterinariya xizmatlari</option>
                    <option value="dori_darmon">Dori-darmon xaridi</option>
                    <option value="ish_haqi">Xodimlar ish haqi</option>
                    <option value="transport">Yoqilg'i &amp; Transport</option>
                    <option value="kommunal">Kommunal (elektr, suv)</option>
                    <option value="boshqa">Boshqa xarajatlar</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Summa (so'm)</label>
              <input
                type="number"
                min="1000"
                step="1000"
                required
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sana</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tavsif va asos</label>
            <input
              type="text"
              required
              placeholder="Masalan: 500 bog'lam beda press sotib olindi"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-forest-900/60">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-forest-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/50 rounded-xl text-xs font-bold transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Saqlash
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
