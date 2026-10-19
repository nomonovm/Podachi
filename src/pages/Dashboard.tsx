import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { backendEngine } from '../lib/backendEngine';
import { Modal } from '../components/ui/Modal';
import {
  Layers,
  ShoppingBag,
  Receipt,
  Stethoscope,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  RotateCw,
  Plus,
  CheckCircle2,
  Lock,
  ShieldAlert,
  Wheat,
  Coins,
} from 'lucide-react';
import { DailyFarmCycleSummary } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { state, currentFarm, currentRole, setActiveTab, isDarkMode, showToast } = useApp();

  const canManage = currentRole === 'admin' || currentRole === 'head_manager' || currentRole === 'manager';

  const [cyclePreview, setCyclePreview] = useState<DailyFarmCycleSummary | null>(null);
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [isCycleSaved, setIsCycleSaved] = useState(false);

  const handleOpenCycleModal = () => {
    try {
      const preview = backendEngine.calculateDailyFarmCyclePreview();
      setCyclePreview(preview);
      setIsCycleSaved(false);
      setIsCycleModalOpen(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCommitDailyCycle = () => {
    try {
      const res = backendEngine.processDailyFarmCycle();
      setCyclePreview(res);
      setIsCycleSaved(true);
      showToast(`Kunlik sikl qaydlari muvaffaqiyatli saqlandi! +${res.totalMilkRevenue.toLocaleString()} so'm sut tushumi qo'shildi`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const farmId = currentFarm?.id;

  // Filter farm-specific data
  const groups = state.animalGroups.filter(g => g.farm_id === farmId);
  const movements = state.movements.filter(m => m.farm_id === farmId);
  const vetRecords = state.vetRecords.filter(v => v.farm_id === farmId);
  const feedItems = state.feedItems.filter(f => f.farm_id === farmId);
  const finances = state.finances.filter(f => f.farm_id === farmId);
  const listings = state.marketplaceListings.filter(l => l.farm_id === farmId);

  // Totals calculation
  const totalLivestock = groups.reduce((sum, g) => sum + g.current_head_count, 0);
  const totalReservedInMarket = listings
    .filter(l => l.status === 'active' || l.status === 'partially_sold')
    .reduce((sum, l) => sum + l.quantity_reserved, 0);
  const totalFreeLivestock = Math.max(0, totalLivestock - totalReservedInMarket);

  const totalRevenues = finances
    .filter(f => f.type === 'daromad' && !f.is_cancelled)
    .reduce((sum, f) => sum + f.amount_uzs, 0);
  const totalExpenses = finances
    .filter(f => f.type === 'xarajat' && !f.is_cancelled)
    .reduce((sum, f) => sum + f.amount_uzs, 0);
  const financialResult = totalRevenues - totalExpenses;
  const financialSummary = backendEngine.getFarmFinancialSummary(farmId);
  const farmBalance = financialSummary.farmBalance;

  // Low feed warnings
  const lowFeedCount = feedItems.filter(f => f.stock_quantity <= f.min_threshold).length;

  // Species distribution for Pie Chart
  const speciesMap: Record<string, number> = {};
  groups.forEach(g => {
    speciesMap[g.species] = (speciesMap[g.species] || 0) + g.current_head_count;
  });
  const speciesData = Object.entries(speciesMap).map(([name, value]) => ({ name, value }));

  // Distinct, high-contrast colors for each livestock species
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4'];

  // Financial overview data for Bar Chart — computed from real records
  const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  const monthlyAgg: Record<string, { daromad: number; xarajat: number }> = {};
  finances.filter(f => !f.is_cancelled).forEach(f => {
    const monthKey = f.date.substring(0, 7); // "YYYY-MM"
    if (!monthlyAgg[monthKey]) monthlyAgg[monthKey] = { daromad: 0, xarajat: 0 };
    if (f.type === 'daromad') monthlyAgg[monthKey].daromad += f.amount_uzs;
    else monthlyAgg[monthKey].xarajat += f.amount_uzs;
  });
  const monthlyFinanceData = Object.entries(monthlyAgg)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // last 6 months
    .map(([key, val]) => {
      const [, mm] = key.split('-');
      return { month: monthNames[parseInt(mm, 10) - 1], ...val };
    });

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-forest-800 dark:from-forest-950 dark:via-[#091712] dark:to-[#0C1F19] border border-forest-800/40 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800/80 dark:bg-forest-900/90 border border-forest-600/40 text-forest-200 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-forest-300" />
            <span>Xavfsiz Ferma Boshqaruvi & Raqamli Bozor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {currentFarm?.display_title || 'Xush kelibsiz, Podachi tizimiga!'}
          </h1>
          <p className="text-sm sm:text-base text-forest-200 dark:text-slate-300 mt-2 font-normal leading-relaxed">
            {currentFarm?.description || 'Chorva hisobi, yem-xashak, moliya va bozor operatsiyalarini yagona platformada nazorat qiling.'}
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => setActiveTab('livestock')}
              className="px-4 py-2 bg-white dark:bg-forest-950 text-forest-950 dark:text-forest-100 hover:bg-forest-50 dark:hover:bg-forest-900 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm border border-transparent dark:border-forest-700/50"
            >
              <Layers className="w-4 h-4 text-forest-800 dark:text-forest-300" />
              Chorva guruhlari ({groups.length})
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className="px-4 py-2 bg-forest-800 dark:bg-forest-800/60 hover:bg-forest-700 dark:hover:bg-forest-700/80 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-forest-600 dark:border-forest-700"
            >
              <ShoppingBag className="w-4 h-4 text-forest-300" />
              Bozor e'lonlari
            </button>
            <button
              onClick={handleOpenCycleModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm border border-emerald-500/50"
            >
              <RotateCw className="w-4 h-4 text-emerald-100" />
              Kunlik Sikl: Sut & Yem Nazorati
            </button>
          </div>
        </div>
        {/* Subtle background graphics */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Layers className="w-80 h-80 text-white transform rotate-12" />
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${currentRole !== 'viewer' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
        <StatCard
          title="Jami Chorva Soni"
          value={`${totalLivestock} bosh`}
          subtitle={`Erkin: ${totalFreeLivestock} bosh | Band: ${totalReservedInMarket} bosh`}
          icon={Layers}
          badge={`${groups.length} ta guruh`}
          badgeVariant="forest"
        />

        <StatCard
          title="Bozordagi Bandlik"
          value={`${totalReservedInMarket} bosh`}
          subtitle="Faol sotuv e'lonlarida band"
          icon={ShoppingBag}
          badge={totalReservedInMarket > 0 ? "Aktiv band" : "Band yo'q"}
          badgeVariant={totalReservedInMarket > 0 ? "amber" : "slate"}
        />

        {currentRole !== 'viewer' ? (
          <>
            <StatCard
              title="Ferma Balansi"
              value={`${(farmBalance / 1_000_000).toFixed(1)} mln so'm`}
              subtitle={`Foyda: ${(financialResult / 1_000_000).toFixed(1)}M | Admin olgan: ${(financialSummary.totalAdminPayouts / 1_000_000).toFixed(1)}M`}
              icon={Coins}
              badge={farmBalance >= 0 ? "Likvid hisob" : "Qarz"}
              badgeVariant={farmBalance >= 0 ? "emerald" : "rose"}
            />

            <StatCard
              title="Jami Daromad"
              value={`${(totalRevenues / 1_000_000).toFixed(1)} mln so'm`}
              subtitle="Chorva va mahsulot sotuvidan"
              icon={ArrowUpRight}
              badge="Kirim"
              badgeVariant="emerald"
            />

            <StatCard
              title="Moliyaviy Natija"
              value={`${(financialResult / 1_000_000).toFixed(1)} mln so'm`}
              subtitle={`Jami xarajat: ${(totalExpenses / 1_000_000).toFixed(1)} mln`}
              icon={Receipt}
              badge={financialResult >= 0 ? "Ijobiy balans" : "Zarar"}
              badgeVariant={financialResult >= 0 ? "emerald" : "rose"}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Ozuqa Zaxirasi"
              value={`${feedItems.length} turdagi`}
              subtitle="Ombordagi ozuqa turlari"
              icon={Wheat}
              badge="Zaxira me'yorda"
              badgeVariant="emerald"
            />

            <StatCard
              title="Veterinariya Ko'riklari"
              value={`${vetRecords.length} ta qayd`}
              subtitle="Sog'liq va emlash nazorati"
              icon={Stethoscope}
              badge="Profilaktika"
              badgeVariant="forest"
            />
          </>
        )}
      </div>

      {/* Alerts & Urgent Actions */}
      {lowFeedCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex items-center justify-between text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-800 dark:text-amber-300 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Ozuqa zaxirasi kritik darajadan kamaygan!</p>
              <p className="text-xs text-amber-700 dark:text-amber-300/80">
                Omborda {lowFeedCount} ta mahsulot minimal zaxira chegarasidan past. Zudlik bilan ozuqa to'ldirish tavsiya etiladi.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('feed')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition shrink-0 shadow-xs"
          >
            Omborni ko'rish
          </button>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Livestock Species Distribution */}
        <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-6 border border-slate-200/90 dark:border-forest-900/40 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Chorva Turlari Taqsimoti</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Bosh soni bo'yicha proporsional tahlil</p>
            </div>
            <Badge variant="forest">{totalLivestock} bosh</Badge>
          </div>
          <div className="h-64 flex items-center justify-center">
            {speciesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={speciesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {speciesData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke={isDarkMode ? '#0E1A16' : '#ffffff'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value} bosh`, 'Miqdor']}
                    contentStyle={{ backgroundColor: isDarkMode ? '#0F172A' : '#0C201B', color: '#fff', borderRadius: '12px', border: 'none' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400">Chorva guruhlari mavjud emas</p>
            )}
          </div>
        </div>

        {/* Financial Flow Overview / Visitor Notice */}
        {currentRole !== 'viewer' ? (
          <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-6 border border-slate-200/90 dark:border-forest-900/40 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Moliya Dinamikasi (Daromad vs Xarajat)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">So'nggi 3 oylik taqqoslama hisobot</p>
              </div>
              <button
                onClick={() => setActiveTab('finance')}
                className="text-xs font-semibold text-forest-700 dark:text-forest-400 hover:text-forest-800 transition"
              >
                Batafsil &rarr;
              </button>
            </div>
            <div className="h-64">
              {monthlyFinanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyFinanceData}>
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={11}
                      tickFormatter={(val: number) => `${(val / 1000000).toFixed(0)}m`}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${Number(val).toLocaleString()} so'm`]}
                      contentStyle={{ backgroundColor: isDarkMode ? '#070D0B' : '#0F172A', color: '#fff', borderRadius: '12px', border: '1px solid #1e293b' }}
                    />
                    <Legend />
                    <Bar dataKey="daromad" name="Daromad" fill="#2A6F59" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="xarajat" name="Xarajat" fill="#E11D48" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
                  Moliyaviy yozuvlar mavjud emas
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-6 border border-slate-200/90 dark:border-forest-900/40 shadow-xs flex flex-col justify-center items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 border border-amber-200 dark:border-amber-800/60">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Moliyaviy Hisobot Maxfiy</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-3">
              Kuzatuvchi (mehmon) maqomida ferma daromadlari, xarajatlari va moliyaviy oqim ko'rsatkichlari ko'rsatilmaydi.
            </p>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full">
              Faqat Boshqaruv xodimlari uchun
            </span>
          </div>
        )}

      </div>

      {/* Two Columns: Upcoming Vet Tasks & Latest Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Vet Tasks */}
        <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-6 border border-slate-200/90 dark:border-forest-900/40 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-forest-700 dark:text-forest-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Veterinariya Qaydlari & Rejalar</h3>
            </div>
            <button
              onClick={() => setActiveTab('veterinary')}
              className="text-xs font-semibold text-forest-700 dark:text-forest-400 hover:underline"
            >
              Barchasi
            </button>
          </div>
          <div className="space-y-3">
            {vetRecords.slice(0, 3).map(rec => (
              <div key={rec.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{rec.title}</span>
                    <Badge size="sm" variant={rec.status === 'bajarildi' ? 'emerald' : 'amber'}>
                      {rec.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Guruh: {rec.group_info} | {rec.heads_treated} bosh muolaja qilindi
                  </p>
                  {rec.next_checkup_date && (
                    <div className="flex items-center gap-1.5 text-[11px] text-forest-700 dark:text-forest-400 font-medium mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Keyingi ko'rik: {rec.next_checkup_date}
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-mono">{rec.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Livestock Movements */}
        {currentRole !== 'viewer' ? (
          <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-6 border border-slate-200/90 dark:border-forest-900/40 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-forest-700 dark:text-forest-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">So'nggi Chorva Harakatlari</h3>
              </div>
              <button
                onClick={() => setActiveTab('movements')}
                className="text-xs font-semibold text-forest-700 dark:text-forest-400 hover:underline"
              >
                Tarix &rarr;
              </button>
            </div>
            <div className="space-y-3">
              {movements.slice(0, 4).map(mov => (
                <div key={mov.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{mov.species} ({mov.breed})</span>
                      <Badge size="sm" variant={mov.delta_count > 0 ? 'emerald' : 'rose'}>
                        {mov.delta_count > 0 ? `+${mov.delta_count}` : `${mov.delta_count}`} bosh
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{mov.reason}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{mov.head_count_after} bosh</span>
                    <span className="block text-[10px] text-slate-400">{mov.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-6 border border-slate-200/90 dark:border-forest-900/40 shadow-xs flex flex-col justify-center items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 border border-amber-200 dark:border-amber-800/60">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Harakatlar Tarixi Maxfiy</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-3">
              Kuzatuvchi (mehmon) maqomida ichki chorva operatsiyalari, xarid va sotuv harakatlari ko'rsatilmaydi.
            </p>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full">
              Faqat Boshqaruv xodimlari uchun
            </span>
          </div>
        )}

      </div>

      {/* Daily Farm Cycle Summary Modal */}
      <Modal
        isOpen={isCycleModalOpen}
        onClose={() => setIsCycleModalOpen(false)}
        title={isCycleSaved ? "Kunlik Sikl Qaydlari Saqlandi" : "Kunlik Sikl & Fermerlik Hisobi (Oldindan Ko'rish)"}
        subtitle={
          isCycleSaved
            ? `Sana: ${cyclePreview?.date || ''} | Mas'ul: Bobur Rustamov (Bosh Menejer) - Saqlandi`
            : `Sana: ${cyclePreview?.date || ''} | Qaydlarni ko'rib chiqing va 'Qayd qo'shish' tugmasini bosing`
        }
        maxWidth="md"
      >
        {cyclePreview && (
          <div className="space-y-4">
            {isCycleSaved && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Kunlik sikl qaydlari muvaffaqiyatli saqlandi! Sut tushumi, ozuqa sarfi, zaxira to'ldirish va veterinariya qaydlari tegishli jurnallarga yozildi.</span>
              </div>
            )}

            {/* Milk Revenue Card */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    🥛
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Kunlik Sut Mahsuldorligi & Daromad</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Sog'in sigir va echkilar hisobi</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                  +{cyclePreview.totalMilkRevenue.toLocaleString()} so'm
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40">
                <div className="bg-white/80 dark:bg-forest-900/40 p-2 rounded-xl">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Qoramol (Sigirlar)</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {cyclePreview.cowMilkingHeads} bosh &rarr; {cyclePreview.cowMilkLiters.toLocaleString()} litr
                  </p>
                </div>
                <div className="bg-white/80 dark:bg-forest-900/40 p-2 rounded-xl">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Echki (Sog'inlar)</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {cyclePreview.goatMilkingHeads} bosh &rarr; {cyclePreview.goatMilkLiters.toLocaleString()} litr
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-2">
                {isCycleSaved
                  ? '✓ Moliya jurnaliga "Sut va mahsulotlar" toifasida daromad sifatida yozildi (Menejer Bobur Rustamov).'
                  : 'ℹ Qayd qo\'shilganda moliya jurnaliga daromad sifatida yoziladi.'}
              </p>
            </div>

            {/* Feed Consumption Card with Universal Formula Breakdown */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                  🌾
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Kunlik Ozuqa Sarfi & Universal Formula</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Formula: Ax + By + Cz = E (Faqat fermada mavjud hayvonlar kesimida)</p>
                </div>
              </div>

              {/* Breakdown of existing animal species */}
              {cyclePreview.existingSpeciesFeedFormula && cyclePreview.existingSpeciesFeedFormula.length > 0 && (
                <div className="bg-white/90 dark:bg-forest-950/70 p-3 rounded-xl border border-amber-200/80 dark:border-amber-800/40 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Mavjud chorva turlari va kunlik ozuqa sarfi:
                  </p>
                  <div className="divide-y divide-slate-100 dark:divide-forest-900/60">
                    {cyclePreview.existingSpeciesFeedFormula.map((item, idx) => (
                      <div key={idx} className="py-1.5 flex flex-wrap justify-between items-center text-[11px]">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.species} ({item.headCount} bosh)
                        </span>
                        <div className="text-slate-600 dark:text-slate-300 flex items-center gap-2 font-mono">
                          {item.totalBedaBoglam > 0 && (
                            <span>Beda: <b>{item.totalBedaBoglam}</b> bog'lam</span>
                          )}
                          {item.totalYemKg > 0 && (
                            <span>Yem: <b>{item.totalYemKg}</b> kg</span>
                          )}
                          {item.totalSilosTonna > 0 && (
                            <span>Silos: <b>{item.totalSilosTonna}</b> t</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
                <p className="text-[11px] font-bold text-amber-900 dark:text-amber-200 mb-1">Ombordan jami ayiriladigan ozuqa miqdori:</p>
                {cyclePreview.feedDeductions.length > 0 ? (
                  cyclePreview.feedDeductions.map((f, i) => (
                    <div key={i} className="flex justify-between items-center text-xs bg-white/80 dark:bg-forest-900/40 px-3 py-1.5 rounded-xl">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{f.name}</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">-{f.quantity} {f.unit}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Ozuqa sarfi qayd etilmadi</p>
                )}
              </div>
            </div>

            {/* Replenishment Card (if any low stock bought) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1713] border border-slate-200 dark:border-forest-800/60">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-forest-800 text-white flex items-center justify-center font-bold">
                  🛒
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Minimal Chegara Nazorati (Avto-To'ldirish)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Ogohlantirish chegarasiga yetgan zaxiralar xaridi</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-forest-900/60">
                {cyclePreview.feedReplenishments.length > 0 ? (
                  <div className="space-y-2">
                    {cyclePreview.feedReplenishments.map((r, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-forest-950/60 border border-slate-200/80 dark:border-forest-800/40 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{r.name}</p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400">+{r.quantity} {r.unit} zaxiraga qabul qilinadi</p>
                        </div>
                        <span className="font-extrabold text-rose-600 dark:text-rose-400">
                          -{r.cost.toLocaleString()} so'm
                        </span>
                      </div>
                    ))}
                    <p className="text-[10px] text-forest-700 dark:text-forest-400 font-semibold mt-1">
                      {isCycleSaved
                        ? '✓ Bosh Menejer (Bobur Rustamov) nomidan xarajatlarga yozildi.'
                        : 'ℹ Qayd qo\'shilganda Bosh Menejer nomidan xarajatlarga yoziladi.'}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-1">
                    ✓ Barcha ozuqa zaxiralari minimal me'yorda. Avtomatik xarid talab etilmadi.
                  </p>
                )}
              </div>
            </div>

            {/* Veterinary Care Card */}
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
                  🩺
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Avtomatik Veterinariya &amp; Sog'liq Nazorati</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Dr. Jamshid Zokirov (Bosh Veterinar) tomonidan o'tkaziladi</p>
                </div>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-sky-200/60 dark:border-sky-800/40">
                {cyclePreview.vetActions && cyclePreview.vetActions.length > 0 ? (
                  cyclePreview.vetActions.map((v, i) => (
                    <div key={i} className="p-2 rounded-xl bg-white/80 dark:bg-forest-900/40 text-xs flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{v.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{v.groupInfo} &bull; {v.medicine}</p>
                      </div>
                      <span className="font-bold text-rose-600 dark:text-rose-400 shrink-0 ml-2">
                        -{v.cost.toLocaleString()} so'm
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Veterinariya muolajasi talab etilmadi</p>
                )}
                <p className="text-[10px] text-sky-700 dark:text-sky-400 font-semibold mt-1">
                  {isCycleSaved
                    ? '✓ Barcha muolajalar "Veterinariya & Sog\'liq" jurnali va xarajatlarga yozildi.'
                    : 'ℹ Qayd qo\'shilganda Dr. Jamshid Zokirov nomidan kiritiladi va dori xarajati yoziladi.'}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-forest-900/60">
              <button
                type="button"
                onClick={() => setIsCycleModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-forest-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/40 transition"
              >
                {isCycleSaved ? 'Yopish' : 'Bekor qilish'}
              </button>

              {!isCycleSaved && canManage && (
                <button
                  type="button"
                  onClick={handleCommitDailyCycle}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Qayd qo'shish
                </button>
              )}
              {!isCycleSaved && !canManage && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/40 font-medium">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Kuzatuvchi (mehmon) rejimi: Qayd qo'shish cheklangan</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
