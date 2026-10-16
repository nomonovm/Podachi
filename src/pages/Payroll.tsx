import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { backendEngine } from '../lib/backendEngine';
import {
  Coins,
  Calendar,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Edit2,
  Wheat,
  Receipt,
  Users,
  Wallet,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { PayrollPeriodType } from '../types';

export const Payroll: React.FC = () => {
  const { currentRole, currentFarm, showToast } = useApp();
  const farmId = currentFarm?.id;

  const isAdmin = currentRole === 'admin';
  const isHeadManager = currentRole === 'head_manager';
  const canAccess = isAdmin || isHeadManager;

  // Real-time engine data & configurable reserve cycles
  const initialCycles = backendEngine.getFarmFeedReserveCycles(farmId);
  const employeeConfigs = backendEngine.getEmployeeSalaryConfigs(farmId);
  const periodInfo = backendEngine.getCurrentPayrollPeriodInfo();
  const payrollRuns = (backendEngine.getState().payrollRuns || []).filter(r => r.farm_id === farmId);

  // States
  const [reserveCycles, setReserveCycles] = useState<number>(initialCycles);
  const [selectedPeriodType, setSelectedPeriodType] = useState<PayrollPeriodType>(periodInfo.periodType);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isEditSalaryModalOpen, setIsEditSalaryModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingSalary, setEditingSalary] = useState<number>(0);

  const preview = backendEngine.previewPayrollDistribution(selectedPeriodType, undefined, reserveCycles);
  const financialSummary = backendEngine.getFarmFinancialSummary(farmId, reserveCycles);

  if (!canAccess) {
    return (
      <div className="bg-white dark:bg-[#0E1A16] rounded-3xl p-12 text-center border border-slate-200/90 dark:border-forest-800/40 max-w-xl mx-auto mt-12 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Kirish Huquqi Cheklangan</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
          Sizning rolingiz: <strong className="capitalize text-slate-900 dark:text-white">{backendEngine.getRoleTitle(currentRole)}</strong>.<br />
          Ish haqi va oylik taqsimoti faqat <strong>Administrator</strong> va <strong>Bosh Menejer</strong> tomonidan boshqarilishi mumkin.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Ushbu sahifaga kirish uchun ferma ma'muriyatiga murojaat qiling.
        </p>
      </div>
    );
  }

  const handleOpenEditSalary = (userId: string, currentSalary: number) => {
    setEditingUserId(userId);
    setEditingSalary(currentSalary);
    setIsEditSalaryModalOpen(true);
  };

  const handleSaveSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    try {
      backendEngine.updateEmployeeBaseSalary(editingUserId, Number(editingSalary));
      showToast("Xodim oylik maoshi muvaffaqiyatli yangilandi", 'success');
      setIsEditSalaryModalOpen(false);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSetCycles = (cycles: number) => {
    const val = Math.max(0, cycles);
    setReserveCycles(val);
    try {
      backendEngine.setFarmFeedReserveCycles(val, farmId);
      showToast(`Ozuqa zaxirasi ${val} martalik qilib saqlandi`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleExecutePayroll = () => {
    try {
      const res = backendEngine.executePayrollDistribution({
        periodType: selectedPeriodType,
        reserveCycles,
      });
      showToast(
        `${preview.periodType === 'avans' ? 'Avans' : 'Oylik'} muvaffaqiyatli to'landi! Xodimlar: ${res.total_employee_payout_uzs.toLocaleString()} so'm, Rahbar sof foyda ulushi: ${res.admin_payout_uzs.toLocaleString()} so'm`,
        'success'
      );
      setIsConfirmModalOpen(false);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Monthly status checks
  const currentMonthYear = new Date().toISOString().slice(0, 7);
  const avansRunThisMonth = payrollRuns.find(r => r.period_year_month === currentMonthYear && r.period_type === 'avans');
  const oylikRunThisMonth = payrollRuns.find(r => r.period_year_month === currentMonthYear && r.period_type === 'oylik');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Oylik &amp; Ish Haqi Taqsimoti
            </h1>
            <Badge variant="forest">Faqat Rahbar &amp; Bosh Menejer</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Oyiga 2 marotaba (1-15 sanalarda Avans, 16-31 sanalarda Oylik) ish haqi to'lash va belgilangan ozuqa zaxirasi saqlangan holda rahbarga sof foyda (dividend) taqsimlash
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-4 py-2 rounded-2xl text-xs">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-emerald-800 dark:text-emerald-200 font-bold">
            Bugungi sana: {new Date().toISOString().split('T')[0]} ({new Date().getDate()}-kun)
          </span>
        </div>
      </div>

      {/* Ozuqa Zaxirasi Sikllarini Belgilash (Administrator Boshqaruvi) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-forest-500/10 dark:from-amber-950/30 dark:via-emerald-950/30 dark:to-forest-950/30 rounded-2xl p-5 border border-amber-300/40 dark:border-amber-700/40 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Wheat className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Daxlsiz Ozuqa Zaxirasi Miqdori (Administrator Tanlovi)
              </h3>
              <Badge variant="amber" size="sm">
                Faqat mavjud hayvonlar uchun
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
              Fermadagi mavjud chorva bosh soni uchun 1 martalik ozuqa zaxirasi: <strong>{financialSummary.singleFeedCycleCost.toLocaleString()} so'm</strong>.
              Ferma hisobida daxlsiz qoladigan zaxira sikllari sonini tanlang (ortgan mablag' Rahbar sof foydasiga o'tadi):
            </p>
          </div>

          {/* Quick cycle buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleSetCycles(num)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs ${
                  reserveCycles === num
                    ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-slate-900'
                    : 'bg-white dark:bg-[#0E1A16] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-forest-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                <span>{num} martalik</span>
                {num === 2 && (
                  <span className="text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-1 rounded font-bold">
                    Tavsiya
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Financial & Reserve KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ferma Balansi */}
        <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-5 border border-slate-200/90 dark:border-forest-900/40 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Ferma Balansi (Mavjud Pul)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {financialSummary.farmBalance.toLocaleString()} so'm
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Jami daromad: {(financialSummary.totalRevenue / 1e6).toFixed(1)}m | Xarajat: {(financialSummary.totalExpenses / 1e6).toFixed(1)}m
          </p>
        </div>

        {/* N-martalik Ozuqa Zaxirasi */}
        <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-5 border border-slate-200/90 dark:border-forest-900/40 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{reserveCycles} Martalik Ozuqa Zaxirasi</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Wheat className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
            {preview.feedReserveRetained.toLocaleString()} so'm
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Har 1 sikl: {preview.singleFeedCost.toLocaleString()} so'm (Ferma hisobida daxlsiz qoladi)
          </p>
        </div>

        {/* Xodimlar Oylik Jamg'armasi */}
        <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-5 border border-slate-200/90 dark:border-forest-900/40 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Xodimlar Oylik Jamg'armasi</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {preview.totalEmployeePayout.toLocaleString()} so'm
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {preview.employeesPaid.length} nafar xodim uchun davriy 50% to'lov (xarajatlarga yoziladi)
          </p>
        </div>

        {/* Rahbar Sof Foydasi (Dividend) */}
        <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-5 border border-slate-200/90 dark:border-forest-900/40 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Rahbar Sof Foydasi (Dividend)</span>
            <div className="w-9 h-9 rounded-xl bg-forest-50 dark:bg-forest-950/50 text-forest-700 dark:text-forest-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {preview.adminPayout.toLocaleString()} so'm
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Ortgan sof foyda: Balans - Xodimlar - {reserveCycles}x Ozuqa zaxirasi
          </p>
        </div>
      </div>

      {/* Schedule & Dual-Period Status Banner */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-6 border border-slate-200/90 dark:border-forest-900/40 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-forest-700 dark:text-forest-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Oylik Berish Jadvali &amp; Holati (Oyiga 2 marta)
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Oyiga faqat 2 marta: 1-15 kunlarda 1 marta, 16-30/31 kunlarda 1 marta
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Period 1: Avans */}
          <div
            onClick={() => setSelectedPeriodType('avans')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              selectedPeriodType === 'avans'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                : 'border-slate-200 dark:border-forest-900/40 hover:bg-slate-50 dark:hover:bg-forest-900/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">1-Davr: Avans To'lovi</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Har oyning 1-15 kunlari oralig'ida</p>
                </div>
              </div>
              {avansRunThisMonth ? (
                <Badge variant="emerald" size="sm">✓ To'langan ({avansRunThisMonth.payment_date})</Badge>
              ) : (
                <Badge variant={periodInfo.currentDay <= 15 ? 'amber' : 'slate'} size="sm">
                  {periodInfo.currentDay <= 15 ? 'Faol Davr' : 'Kutilmoqda'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Xodimlarga oylik maoshining 50% qismi beriladi va ferma xarajatiga yoziladi.
            </p>
          </div>

          {/* Period 2: Oylik */}
          <div
            onClick={() => setSelectedPeriodType('oylik')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              selectedPeriodType === 'oylik'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                : 'border-slate-200 dark:border-forest-900/40 hover:bg-slate-50 dark:hover:bg-forest-900/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-forest-800 text-white flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">2-Davr: Oylik Qoldig'i</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Har oyning 16-30(31) kunlari oralig'ida</p>
                </div>
              </div>
              {oylikRunThisMonth ? (
                <Badge variant="emerald" size="sm">✓ To'langan ({oylikRunThisMonth.payment_date})</Badge>
              ) : (
                <Badge variant={periodInfo.currentDay > 15 ? 'amber' : 'slate'} size="sm">
                  {periodInfo.currentDay > 15 ? 'Faol Davr' : 'Kutilmoqda'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Xodimlarga oylik maoshining qolgan 50% qismi beriladi. Ortgan mablag' {reserveCycles}x ozuqa zaxirasi qoldirilgach, Rahbarga sof foyda (dividend) sifatida ajratiladi.
            </p>
          </div>
        </div>
      </div>

      {/* Main Payroll Management & Employee Table */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-2xl border border-slate-200/90 dark:border-forest-900/40 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-forest-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {preview.periodLabel} Taqsimoti
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ushbu davrda xodimlarga to'lanadigan to'lov miqdori to'liq oylik maoshining 50% qismini tashkil etadi
            </p>
          </div>

          <div className="flex items-center gap-3">
            {preview.isAlreadyPaid ? (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-2 rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{selectedPeriodType === 'avans' ? 'Avans' : 'Oylik'} allaqachon to'langan</span>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirmModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <Coins className="w-4 h-4" />
                {selectedPeriodType === 'avans' ? 'Avansni to\'lash (1-15)' : 'Oylikni to\'lash (16-31)'}
              </button>
            )}
          </div>
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-forest-900/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-[#070D0B]/50">
                <th className="py-3 px-6">XODIM / LAVOZIM</th>
                <th className="py-3 px-6">TO'LIQ OYLIK ME'YORI</th>
                <th className="py-3 px-6">USHBU DAVRDAGI TO'LOV (50%)</th>
                <th className="py-3 px-6">MOLIYAVIY TASNIF</th>
                <th className="py-3 px-6 text-right">AMALLAR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-forest-900/30 text-xs">
              {preview.employeesPaid.map(emp => (
                <tr key={emp.user_id} className="hover:bg-slate-50/60 dark:hover:bg-forest-900/20 transition">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-forest-200 flex items-center justify-center font-bold text-xs">
                        {emp.user_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{emp.user_name}</p>
                        <Badge size="sm" variant={emp.role === 'head_manager' ? 'forest' : emp.role === 'veterinarian' ? 'emerald' : 'slate'}>
                          {backendEngine.getRoleTitle(emp.role)}
                        </Badge>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 font-bold text-slate-800 dark:text-slate-200">
                    {emp.base_monthly_salary_uzs.toLocaleString()} so'm
                  </td>
                  <td className="py-3.5 px-6 font-extrabold text-emerald-700 dark:text-emerald-400">
                    +{emp.period_amount_uzs.toLocaleString()} so'm
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-md font-semibold border border-rose-200 dark:border-rose-900/40">
                      Xarajat (ish_haqi)
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => handleOpenEditSalary(emp.user_id, emp.base_monthly_salary_uzs)}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-forest-900/40 transition"
                      title="Oylik maoshini tahrirlash"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Administrator Special Row */}
              <tr className="bg-forest-50/40 dark:bg-forest-950/30 font-semibold border-t-2 border-forest-200 dark:border-forest-800">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-forest-700 text-white flex items-center justify-center font-bold text-xs">
                      👑
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white">
                        {preview.adminUser?.user_name || 'Alisher Qodirov (Ferma Rahbari)'}
                      </p>
                      <Badge size="sm" variant="forest">Administrator (Ferma Rahbari)</Badge>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-500 dark:text-slate-400 italic">
                  Sof foyda ulushidan (Belgilanmagan)
                </td>
                <td className="py-4 px-6 font-extrabold text-emerald-700 dark:text-emerald-400">
                  {preview.adminPayout > 0 ? `+${preview.adminPayout.toLocaleString()} so'm` : '0 so\'m (Zaxira yetarli emas)'}
                </td>
                <td className="py-4 px-6" colSpan={2}>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md font-semibold border border-emerald-200 dark:border-emerald-900/40">
                    Daxlsiz {reserveCycles}x zaxira ({preview.feedReserveRetained.toLocaleString()} so'm) qoldirilgach, ortgan sof foyda ulushi (dividend)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Logic & Transparency Explanation Card */}
      <div className="bg-gradient-to-br from-forest-900/10 via-emerald-900/5 to-transparent rounded-2xl p-6 border border-forest-200 dark:border-forest-900/60">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-800 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Fermadagi Ish Haqi &amp; Foyda Taqsimoti Qoidalari:
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>
                <strong>Oylik to'lovi:</strong> Oyiga 2 marta (1-15 kunlari avans 50%, 16-30/31 kunlari oylik qoldig'i 50%) beriladi. Har bir davrda faqat bitta marta oylik tarqatishga ruxsat etiladi.
              </li>
              <li>
                <strong>Xodimlar oyligi:</strong> Bosh Menejer, Menejer va Bosh Veterinar maoshlari to'liq ferma operatsion <strong>xarajatlariga</strong> (`ish_haqi` toifasida) yoziladi va ferma balansini kamaytiradi.
              </li>
              <li>
                <strong>{reserveCycles} Martalik Ozuqa Zaxirasi:</strong> Minimal ozuqa chegarasiga yetganda avtomatik sotib olinadigan xarid miqdoridan administrator tanlagan {reserveCycles} tasiga yetadigan mablag' (<strong>{preview.feedReserveRetained.toLocaleString()} so'm</strong>) daxlsiz ravishda ferma hisobida saqlanib turadi. Faqat fermada <em>mavjud hayvonlar</em> uchun zarur ozuqalar hisoblanadi.
              </li>
              <li>
                <strong>Rahbar Sof Foydasi (Dividend):</strong> Xodimlar maoshi to'lanib, {reserveCycles} martalik ozuqa zaxirasi qoldirilgach, ortgan barcha pul Rahbarga sof foyda ulushi (dividend) sifatida yo'naltiriladi. Ushbu to'lov ferma xarajatiga ham, daromadiga ham qo'shilmaydi, lekin ferma hisobidan yechiladi.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* History of Past Payroll Runs */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-2xl border border-slate-200/90 dark:border-forest-900/40 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-forest-900/40 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Oylik To'lovlari Tarixi</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Avvalgi oylik va avans to'lovlari arxivi</p>
          </div>
          <Badge variant="slate">{payrollRuns.length} ta qayd</Badge>
        </div>

        {payrollRuns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-forest-900/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-[#070D0B]/50">
                  <th className="py-3 px-6">SANA &amp; DAVR</th>
                  <th className="py-3 px-6">XODIMLAR OYLIGI</th>
                  <th className="py-3 px-6">OZUQA ZAXIRASI</th>
                  <th className="py-3 px-6">RAHBAR SOF FOYDASI</th>
                  <th className="py-3 px-6">QOLGAN BALANS</th>
                  <th className="py-3 px-6 text-right">MAS'UL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-forest-900/30">
                {payrollRuns.map(run => (
                  <tr key={run.id} className="hover:bg-slate-50/60 dark:hover:bg-forest-900/20 transition">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{run.payment_date}</span>
                        <Badge size="sm" variant={run.period_type === 'avans' ? 'emerald' : 'forest'}>
                          {run.period_type === 'avans' ? '1-davr: Avans' : '2-davr: Oylik'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{run.period_label}</p>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-rose-600 dark:text-rose-400">
                      -{run.total_employee_payout_uzs.toLocaleString()} so'm
                      <span className="block text-[10px] text-slate-400">{run.employees_paid.length} nafar xodim</span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-amber-600 dark:text-amber-400">
                      {run.feed_reserve_retained_uzs.toLocaleString()} so'm
                      <span className="block text-[10px] text-slate-400">{run.feed_reserve_cycles || 2}x zaxira</span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-emerald-600 dark:text-emerald-400">
                      {run.admin_payout_uzs > 0 ? `+${run.admin_payout_uzs.toLocaleString()} so'm` : '0 so\'m'}
                      <span className="block text-[10px] text-slate-400">Sof foyda ulushi</span>
                    </td>
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {run.farm_balance_after_run_uzs.toLocaleString()} so'm
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{run.created_by_name}</span>
                      <span className="block text-[10px] text-slate-400">{backendEngine.getRoleTitle(run.created_by_role)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Hozircha oylik to'lovlari qayd etilmagan. Yuqoridagi tugma orqali joriy davr uchun to'lovni tasdiqlashingiz mumkin.
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={`${selectedPeriodType === 'avans' ? '1-Davr: Avans' : '2-Davr: Oylik'} To'lovini Tasdiqlash`}
        subtitle={`${preview.periodLabel} - Ushbu amal oyda faqat bir marta bajariladi`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-forest-900/40 border border-slate-200 dark:border-forest-800/60 space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-forest-800/40">
              <span className="text-slate-600 dark:text-slate-400">Ferma hisobidagi mavjud pul:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {preview.farmBalanceBefore.toLocaleString()} so'm
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-forest-800/40">
              <span className="text-rose-600 dark:text-rose-400 font-medium">Xodimlarga to'lanadigan ish haqi (xarajat):</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                -{preview.totalEmployeePayout.toLocaleString()} so'm
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-forest-800/40">
              <span className="text-amber-600 dark:text-amber-400 font-medium">Ferma hisobida qoladigan {reserveCycles}x ozuqa zaxirasi:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {preview.feedReserveRetained.toLocaleString()} so'm
              </span>
            </div>
            <div className="flex justify-between items-center py-1 pt-2">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Rahbarga ajratiladigan sof foyda ulushi (dividend):</span>
              <span className="font-extrabold text-base text-emerald-700 dark:text-emerald-400">
                {preview.adminPayout.toLocaleString()} so'm
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Diqqat: Ushbu to'lov tasdiqlangach, xodimlar ish haqi ferma xarajatlariga qo'shiladi va audit jurnaliga yoziladi. Oyning ushbu davri ({preview.periodLabel}) uchun takroriy to'lov bajarish imkoniyati yopiladi.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-forest-800/60">
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-forest-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/40 transition"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={handleExecutePayroll}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              To'lovni Tasdiqlash &amp; Qayd Etish
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Base Salary Modal */}
      <Modal
        isOpen={isEditSalaryModalOpen}
        onClose={() => setIsEditSalaryModalOpen(false)}
        title="Xodim Oylik Maoshini Belgilash"
        subtitle="To'liq oylik me'yori (oylikning 50% qismi har bir davrda to'lanadi)"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveSalary} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Oylik maoshi (so'm / oy)
            </label>
            <input
              type="number"
              step={500000}
              min={1000000}
              value={editingSalary}
              onChange={e => setEditingSalary(Number(e.target.value))}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-forest-800 bg-white dark:bg-forest-900/40 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Har bir davrda to'lanadigan summa: {(editingSalary / 2).toLocaleString()} so'm
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-forest-800">
            <button
              type="button"
              onClick={() => setIsEditSalaryModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-forest-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/40 transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Saqlash
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
