import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  Search, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Download, 
  ShieldCheck, 
  Activity, 
  FileSpreadsheet 
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { AuditLog } from '../types';

export const AuditLogs: React.FC = () => {
  const { state, currentFarm, currentRole, showToast } = useApp();
  const farmId = currentFarm?.id;

  const logs = state.auditLogs.filter(l => !l.farm_id || l.farm_id === farmId);

  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const isAdmin = currentRole === 'admin';

  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-[#0E1A16] rounded-3xl p-12 text-center border border-slate-200/90 dark:border-forest-800/40 max-w-xl mx-auto mt-12 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Audit Jurnali Maxfiy</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
          Sizning rolingiz: <strong className="capitalize text-slate-900 dark:text-white">{currentRole}</strong>.<br />
          Xavfsizlik talablariga ko'ra, audit jurnali faqat ferma rahbari (Administrator) tomonidan ko'rilishi mumkin.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Kirish uchun ferma administratoriga murojaat qiling yoki tizimga Administrator sifatida kiring.
        </p>
      </div>
    );
  }

  const actionTypeConfig: Record<string, { label: string; variant: 'slate' | 'forest' | 'emerald' | 'amber' | 'rose' }> = {
    AUTH_LOGIN: { label: 'Tizimga kirish', variant: 'emerald' },
    AUTH_LOGOUT: { label: 'Tizimdan chiqish', variant: 'slate' },
    AUTH_FAILED: { label: 'Xato login', variant: 'rose' },
    LIVESTOCK_MOVEMENT: { label: 'Chorva harakati', variant: 'forest' },
    HEALTH_RECORD: { label: 'Veterinariya', variant: 'amber' },
    FEED_PURCHASE: { label: 'Ozuqa xaridi', variant: 'forest' },
    FINANCE_RECORD_CREATE: { label: 'Moliya yozuvi', variant: 'emerald' },
    MARKET_LISTING_CREATE: { label: "Bozor e'loni", variant: 'forest' },
    MARKET_SALE_COMPLETE: { label: 'Bozor sotuvi', variant: 'emerald' },
    SETTINGS_CHANGE: { label: 'Sozlamalar', variant: 'slate' },
    USER_ROLE_CHANGE: { label: "Rol o'zgarishi", variant: 'amber' },
    SECURITY_UNAUTHORIZED_ACCESS_ATTEMPT: { label: 'Ruxsatsiz urinish', variant: 'rose' },
    SECURITY_OVER_RESERVATION_ATTEMPT: { label: 'Ortiqcha bandlik', variant: 'rose' },
  };

  const filteredLogs = logs.filter(log => {
    const matchesResult = resultFilter === 'all' || log.result === resultFilter;
    const matchesAction = actionFilter === 'all' || log.action_type === actionFilter;
    const matchesSearch =
      log.user_email.toLowerCase().includes(search.toLowerCase()) ||
      log.user_name.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.action_type.toLowerCase().includes(search.toLowerCase());
    return matchesResult && matchesAction && matchesSearch;
  });

  const totalLogsCount = logs.length;
  const successCount = logs.filter(l => l.result === 'SUCCESS').length;
  const alertCount = logs.filter(l => l.result === 'DENIED' || l.result === 'FAILED').length;

  const handleExportLogs = () => {
    const headers = ['Vaqt (UTC)', 'Foydalanuvchi', 'Email', 'Amal Turi', 'Natija', 'Resurs', 'Tafsilotlar'];
    const rows = filteredLogs.map(l => [
      l.timestamp,
      `"${l.user_name}"`,
      l.user_email,
      l.action_type,
      l.result,
      l.resource_name,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Podachi_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit jurnali eksport qilindi', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-forest-700 dark:text-emerald-400" />
            Xavfsizlik & Audit Jurnali
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            O'zgartirib bo'lmas operatsiyalar ro'yxati, xavfsizlik hodisalari va ruxsatsiz urinishlar monitoringi
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="px-4 py-2 border border-slate-200 dark:border-forest-800/80 bg-white dark:bg-[#0E1A16] hover:bg-slate-50 dark:hover:bg-forest-900/40 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
        >
          <Download className="w-4 h-4 text-forest-600 dark:text-emerald-400" />
          Jurnalni eksport qilish (CSV)
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0E1A16] p-4 rounded-2xl border border-slate-200/90 dark:border-forest-800/40 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-forest-50 dark:bg-forest-900/50 text-forest-800 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Jami qaydlar</p>
            <p className="text-lg font-black text-slate-900 dark:text-white font-mono">{totalLogsCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0E1A16] p-4 rounded-2xl border border-slate-200/90 dark:border-forest-800/40 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Muvaffaqiyatli amallar</p>
            <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono">{successCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0E1A16] p-4 rounded-2xl border border-slate-200/90 dark:border-forest-800/40 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rad etilgan / Xavfsizlik signallari</p>
            <p className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">{alertCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0E1A16] p-3.5 rounded-2xl border border-slate-200/90 dark:border-forest-800/40 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Foydalanuvchi, amal yoki tafsilot bo'yicha qidiring..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0A1411] border border-slate-200 dark:border-forest-800/60 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-forest-600 dark:focus:ring-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={resultFilter}
            onChange={e => setResultFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#0A1411] border border-slate-200 dark:border-forest-800/60 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 dark:focus:ring-emerald-500 transition"
          >
            <option value="all">Barcha natijalar</option>
            <option value="SUCCESS">Muvaffaqiyatli (SUCCESS)</option>
            <option value="DENIED">Rad etilgan (DENIED)</option>
            <option value="FAILED">Xatolik (FAILED)</option>
          </select>

          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#0A1411] border border-slate-200 dark:border-forest-800/60 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 dark:focus:ring-emerald-500 transition"
          >
            <option value="all">Barcha hodisalar</option>
            <option value="SECURITY_UNAUTHORIZED_ACCESS_ATTEMPT">Ruxsatsiz urinishlar</option>
            <option value="SECURITY_OVER_RESERVATION_ATTEMPT">Ortiqcha band qilish urinishlari</option>
            <option value="MARKET_SALE_COMPLETE">Bozor savdolari</option>
            <option value="LIVESTOCK_MOVEMENT">Chorva harakatlari</option>
            <option value="FINANCE_RECORD_CREATE">Moliya operatsiyalari</option>
            <option value="USER_ROLE_CHANGE">Rol o'zgarishlari</option>
            <option value="AUTH_LOGIN">Tizimga kirish</option>
            <option value="AUTH_LOGOUT">Tizimdan chiqish</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-2xl border border-slate-200/90 dark:border-forest-800/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#14231E] border-b border-slate-200 dark:border-forest-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Vaqt (UTC)</th>
                <th className="py-3 px-4">Foydalanuvchi</th>
                <th className="py-3 px-4">Hodisa Kriteriyasi</th>
                <th className="py-3 px-4 text-center">Natija</th>
                <th className="py-3 px-4">Resurs</th>
                <th className="py-3 px-4">Operatsiya Tafsilotlari</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-forest-900/40">
              {filteredLogs.map(log => {
                const isSuccess = log.result === 'SUCCESS';
                const isDenied = log.result === 'DENIED';
                const actionConf = actionTypeConfig[log.action_type];

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-forest-950/40 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {log.timestamp.replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-bold text-slate-900 dark:text-white">{log.user_name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{log.user_email}</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {actionConf?.label || log.action_type}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 block">
                          {log.action_type}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <Badge
                        size="sm"
                        variant={isSuccess ? 'emerald' : isDenied ? 'rose' : 'amber'}
                      >
                        {log.result}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#14231E] border border-slate-200 dark:border-forest-800/60 text-slate-700 dark:text-emerald-400 font-semibold text-[11px]">
                        {log.resource_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-lg leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p>Audit jurnali bo'yicha mos yozuvlar topilmadi</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
