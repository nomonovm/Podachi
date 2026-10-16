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
  Undo2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Coins,
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { FinanceRecord } from '../types';

export const Finance: React.FC = () => {
  const { state, currentFarm, currentRole, setActiveTab, showToast } = useApp();
  const farmId = currentFarm?.id;

  const finances = state.finances.filter(f => f.farm_id === farmId);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Cancel & Delete modal state
  const [selectedFinance, setSelectedFinance] = useState<FinanceRecord | null>(null);
  const [financeModalAction, setFinanceModalAction] = useState<'cancel' | 'delete' | null>(null);

  // Form states
  const [type, setType] = useState<FinanceRecord['type']>('xarajat');
  const [category, setCategory] = useState<FinanceRecord['category']>('yem_xashak');
  const [amount, setAmount] = useState<number>(1000000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const isAdmin = currentRole === 'admin';
  const isHeadManager = currentRole === 'head_manager';
  const isManager = currentRole === 'manager';
  const canAccess = isAdmin || isHeadManager || isManager;
  const canManage = isAdmin || isHeadManager || isManager;

  if (!canAccess) {
    return (
      <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-12 text-center border border-slate-200 dark:border-forest-800/40 max-w-xl mx-auto mt-12">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900/50">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Kirish Huquqi Cheklangan (RBAC)</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Sizning faol rolingiz: <strong className="capitalize text-slate-900 dark:text-white">{currentRole}</strong>.<br />
          Ferma moliyaviy ma'lumotlari faqat <strong>Administrator</strong>, <strong>Bosh Menejer</strong> va <strong>Menejer</strong> tomonidan ko'rilishi va boshqarilishi mumkin.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Kirish uchun ferma administratoriga murojaat qiling yoki tizimga vakolatli rol orqali kiring.
        </p>
      </div>
    );
  }

  const financialSummary = backendEngine.getFarmFinancialSummary(farmId);
  const farmBalance = financialSummary.farmBalance;

  // Faol (bekor qilinmagan) yozuvlar bo'yicha jami hisob
  const totalRevenues = finances
    .filter(f => f.type === 'daromad' && !f.is_cancelled)
    .reduce((sum, f) => sum + f.amount_uzs, 0);

  const totalExpenses = finances
    .filter(f => f.type === 'xarajat' && !f.is_cancelled)
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

  const handleConfirmAction = () => {
    if (!selectedFinance || !financeModalAction) return;

    try {
      if (financeModalAction === 'cancel') {
        backendEngine.cancelFinanceRecord(selectedFinance.id);
        showToast('Moliya yozuvi bekor qilindi. Summa umumiy hisobdan chiqarilib, balans avvalgi holatiga qaytarildi va auditga yozildi', 'success');
      } else if (financeModalAction === 'delete') {
        backendEngine.deleteFinanceRecord(selectedFinance.id);
        showToast('Moliya yozuvi butunlay o\'chirildi va balansdan chiqarildi', 'success');
      }
      setSelectedFinance(null);
      setFinanceModalAction(null);
    } catch (err: any) {
      showToast(err.message || 'Xatolik yuz berdi', 'error');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Sana', 'Turi', 'Kategoriya', 'Summa (UZS)', 'Holati', 'Izoh', 'Kiritgan Shaxs'];
    const rows = finances.map(f => [
      f.date,
      f.type,
      f.category,
      f.amount_uzs,
      f.is_cancelled ? 'Bekor qilingan' : 'Faol',
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
  };

  const categoryLabels: Record<string, string> = {
    chorva_sotuvi: 'Chorva sotish',
    sut_mahsulotlari: 'Sut va mahsulotlar',
    boshqa_daromad: 'Boshqa daromad',
    yem_xashak: 'Yem-xashak',
    veterinariya: 'Veterinariya',
    dori_darmon: 'Dori-darmon',
    ish_haqi: 'Xodimlar maoshi',
    transport: 'Transport',
    kommunal: 'Kommunal',
    boshqa: 'Boshqa xarajat',
  };

  const filteredFinances = finances.filter(f => {
    const matchesType = filterType === 'all' || f.type === filterType;
    const matchesCategory = filterCategory === 'all' || f.category === filterCategory;
    return matchesType && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Moliya &amp; Hisob-kitob</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Barcha daromad, xarajat, ozuqa sotib olish va chorva sotuvlarining yagona moliyaviy balansi
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white dark:bg-[#0E1A16] border border-slate-200 dark:border-forest-800/60 hover:bg-slate-50 dark:hover:bg-forest-900/50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Eksport (CSV)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Yangi operatsiya
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-[#0E1A16] p-5 rounded-2xl border border-slate-200/90 dark:border-forest-800/40 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ferma Balansi</span>
            <div className="w-8 h-8 rounded-xl bg-forest-50 dark:bg-forest-950/40 text-forest-700 dark:text-forest-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {farmBalance.toLocaleString()} so'm
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Likvid hisob (Rahbar sof foyda ulushlari yechilganidan so'ng)
          </p>
        </div>

        <div className="bg-white dark:bg-[#0E1A16] p-5 rounded-2xl border border-slate-200/90 dark:border-forest-800/40 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jami Daromad</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {totalRevenues.toLocaleString()} so'm
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Chorva va sut mahsulotlari sotuvi</p>
        </div>

        <div className="bg-white dark:bg-[#0E1A16] p-5 rounded-2xl border border-slate-200/90 dark:border-forest-800/40 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jami Xarajat</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {totalExpenses.toLocaleString()} so'm
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Yem, ish haqi, dori va boshqa</p>
        </div>

        <div className={`p-5 rounded-2xl border shadow-xs relative overflow-hidden ${
          financialResult >= 0
            ? 'bg-gradient-to-br from-forest-900 to-forest-950 text-white border-forest-800'
            : 'bg-gradient-to-br from-rose-900 to-rose-950 text-white border-rose-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-200">Moliyaviy Natija</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-forest-800/80 text-emerald-300">
              {financialResult >= 0 ? 'Foyda' : 'Zarar'}
            </span>
          </div>
          <p className="text-2xl font-black mt-2 font-mono">
            {financialResult >= 0 ? `+${financialResult.toLocaleString()}` : financialResult.toLocaleString()} so'm
          </p>
          <p className="text-[11px] text-forest-300/80 mt-1">
            * Jami daromad va operatsion xarajatlar farqi
          </p>
        </div>
      </div>

      {/* Payroll Quick Link Banner for Admin & Head Manager */}
      {(isAdmin || isHeadManager) && (
        <div className="bg-gradient-to-r from-emerald-950 via-forest-900 to-[#0A1A14] border border-emerald-700/40 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/40">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Xodimlar Oyligi &amp; Rahbar Sof Foydasi</span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full">Yangi Tizim</span>
              </h3>
              <p className="text-xs text-forest-200 mt-0.5">
                Oyiga 2 marta (1-15 Avans, 16-31 Oylik). Tanlangan ozuqa zaxirasi saqlanib, ortgan pul rahbar sof foydasi sifatida ajratiladi.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('payroll')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition shrink-0 shadow-sm flex items-center gap-1.5"
          >
            <Coins className="w-4 h-4" />
            <span>Oylik &amp; Ish Haqi Sahifasi &rarr;</span>
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
                {canManage && <th className="py-3 px-4 text-center">Amallar</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-forest-900/60">
              {filteredFinances.map(item => {
                const isIncome = item.type === 'daromad';
                const isCancelled = item.is_cancelled;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-forest-950/40 transition ${
                      isCancelled ? 'opacity-60 bg-slate-50/40 dark:bg-slate-900/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Badge size="sm" variant={isIncome ? 'emerald' : 'rose'}>
                          {isIncome ? 'Daromad' : 'Xarajat'}
                        </Badge>
                        {isCancelled && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            Bekor qilingan
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {categoryLabels[item.category] || item.category}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-sm">
                      <p className={isCancelled ? 'line-through text-slate-400' : ''}>{item.description}</p>
                      {item.linked_entity_type === 'marketplace_sale' && (
                        <span className="text-[10px] text-forest-700 dark:text-emerald-400 bg-forest-50 dark:bg-forest-950/60 px-1.5 py-0.5 rounded font-bold inline-block mt-0.5">
                          Bozor sotuvi bilan avtomatik bog'langan
                        </span>
                      )}
                      {isCancelled && item.cancelled_by && (
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                          Bekor qildi: {item.cancelled_by}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-black font-mono text-sm whitespace-nowrap">
                      <span className={
                        isCancelled
                          ? 'line-through text-slate-400'
                          : isIncome
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-200'
                      }>
                        {isIncome ? '+' : '-'}{item.amount_uzs.toLocaleString()} so'm
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {item.created_by}
                    </td>

                    {canManage && (
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Bekor qilish amali (Admin va Menejer uchun) - Veterinariya uchun bekor qilish taqiqlangan! */}
                          {item.category === 'veterinariya' ? (
                            <span
                              className="text-[10px] text-slate-400 dark:text-slate-500 italic px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 select-none"
                              title="Veterinariya muolajalari va dori-darmon xarajatlarini bekor qilib bo'lmaydi"
                            >
                              Qaytarilmas
                            </span>
                          ) : !isCancelled ? (
                            <button
                              onClick={() => {
                                setSelectedFinance(item);
                                setFinanceModalAction('cancel');
                              }}
                              className="px-2.5 py-1 rounded-lg text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                              title="Moliya yozuvini bekor qilish va balansni avvalgi holatga qaytarish"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                              Bekor qilish
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Bekor qilingan</span>
                          )}

                          {/* O'chirish amali (Faqat Administrator uchun va FAQATGINA bekor qilingan yozuvlar uchun!) */}
                          {isAdmin && isCancelled && (
                            <button
                              onClick={() => {
                                setSelectedFinance(item);
                                setFinanceModalAction('delete');
                              }}
                              className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] font-bold transition flex items-center justify-center shadow-xs"
                              title="Bekor qilingan qaydni butunlay o'chirish (Faqat Administrator)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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

      {/* Confirmation Modal for Cancel / Delete */}
      <Modal
        isOpen={financeModalAction !== null}
        onClose={() => {
          setSelectedFinance(null);
          setFinanceModalAction(null);
        }}
        title={
          financeModalAction === 'cancel'
            ? 'Moliya yozuvini bekor qilish'
            : "Moliya yozuvini butunlay o'chirish"
        }
        subtitle={
          financeModalAction === 'cancel'
            ? "Moliya summasi umumiy balansdan chiqariladi va avvalgi holatiga qaytariladi"
            : "Ushbu amal yozuvni tizimdan butunlay olib tashlaydi (Faqat Administrator)"
        }
      >
        {selectedFinance && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              financeModalAction === 'cancel'
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
            }`}>
              <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                financeModalAction === 'cancel' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
              }`} />
              <div className="text-xs space-y-1">
                <p className="font-bold">
                  {financeModalAction === 'cancel' ? 'Bekor qilish tasdig\'i' : 'Butunlay o\'chirish tasdig\'i'}
                </p>
                <p>
                  <strong>Turi:</strong> {selectedFinance.type === 'daromad' ? 'Daromad' : 'Xarajat'} &bull; <strong>Kategoriya:</strong> {categoryLabels[selectedFinance.category] || selectedFinance.category}<br />
                  <strong>Summa:</strong> {selectedFinance.amount_uzs.toLocaleString()} so'm &bull; <strong>Sana:</strong> {selectedFinance.date}<br />
                  <strong>Izoh / Asos:</strong> {selectedFinance.description}
                </p>
                {financeModalAction === 'cancel' && (
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium pt-1">
                    ✓ Bekor qilingandan so'ng, ushbu summa ({selectedFinance.type === 'daromad' ? 'daromadlardan' : 'xarajatlardan'}) ayirib tashlanadi va ferma moliyaviy balansi avvalgi holatiga qaytadi.
                  </p>
                )}
                {financeModalAction === 'delete' && (
                  <p className="text-[11px] text-rose-800 dark:text-rose-300 font-medium pt-1">
                    ⚠ Diqqat: Ushbu yozuv ma'lumotlar bazasidan butunlay olib tashlanadi va umumiy balansdan chiqariladi.
                  </p>
                )}
                <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                  ℹ Ushbu amal {isAdmin ? 'Administrator' : 'Bosh Menejer'} ({state.currentUser.full_name}) nomidan Audit Jurnaliga qayd etiladi.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedFinance(null);
                  setFinanceModalAction(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-forest-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/40 transition"
              >
                Ortga qaytish
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition shadow-sm ${
                  financeModalAction === 'cancel'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {financeModalAction === 'cancel' ? 'Bekor qilishni tasdiqlash' : 'O\'chirishni tasdiqlash'}
              </button>
            </div>
          </div>
        )}
      </Modal>

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
