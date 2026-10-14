import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Search, Filter, Lock, CheckCircle2, XCircle, AlertTriangle, Download } from 'lucide-react';
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
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-xl mx-auto mt-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Audit Jurnali Maxfiy</h2>
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
          Sizning rolingiz: <strong className="capitalize text-slate-900">{currentRole}</strong>.<br />
          Xavfsizlik talablariga ko'ra, audit jurnali faqat ferma rahbari (Administrator) tomonidan ko'rilishi mumkin.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Kirish uchun ferma administratoriga murojaat qiling yoki tizimga Administrator sifatida kiring.
        </p>
      </div>
    );
  }

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

  const handleExportLogs = () => {
    const headers = ['Vaqt', 'Foydalanuvchi', 'Email', 'Amal Turi', 'Natija', 'Resurs', 'Tafsilotlar'];
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Xavfsizlik & Audit Jurnali</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            O'zgartirib bo'lmas operatsiyalar ro'yxati, xavfsizlik hodisalari va ruxsatsiz urinishlar monitoringi
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Jurnalni eksport qilish
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Foydalanuvchi, amal yoki tafsilot bo'yicha qidiring..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={resultFilter}
            onChange={e => setResultFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
          >
            <option value="all">Barcha natijalar</option>
            <option value="SUCCESS">Muvaffaqiyatli (SUCCESS)</option>
            <option value="DENIED">Rad etilgan (DENIED)</option>
            <option value="FAILED">Xatolik (FAILED)</option>
          </select>

          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
          >
            <option value="all">Barcha hodisalar</option>
            <option value="SECURITY_UNAUTHORIZED_ACCESS_ATTEMPT">Ruxsatsiz urinishlar</option>
            <option value="SECURITY_OVER_RESERVATION_ATTEMPT">Ortiqcha band qilish urinishlari</option>
            <option value="MARKET_SALE_COMPLETE">Bozor savdolari</option>
            <option value="LIVESTOCK_MOVEMENT">Chorva harakatlari</option>
            <option value="USER_ROLE_CHANGE">Rol o'zgarishlari</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Vaqt (UTC)</th>
                <th className="py-3 px-4">Foydalanuvchi</th>
                <th className="py-3 px-4">Hodisa Kriteyasi</th>
                <th className="py-3 px-4 text-center">Natija</th>
                <th className="py-3 px-4">Resurs</th>
                <th className="py-3 px-4">Operatsiya Tafsilotlari</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => {
                const isSuccess = log.result === 'SUCCESS';
                const isDenied = log.result === 'DENIED';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {log.timestamp.replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-bold text-slate-900">{log.user_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{log.user_email}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {log.action_type}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <Badge
                        size="sm"
                        variant={isSuccess ? 'emerald' : isDenied ? 'rose' : 'amber'}
                      >
                        {log.result}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono whitespace-nowrap">
                      {log.resource_name}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-md">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              Audit jurnali bo'yicha mos yozuvlar topilmadi
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
