import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { History, Search, ArrowUpRight, ArrowDownRight, Layers, FileText } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { MovementType } from '../types';

export const MovementsHistory: React.FC = () => {
  const { state, currentFarm } = useApp();
  const farmId = currentFarm?.id;

  const movements = state.movements.filter(m => m.farm_id === farmId);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const movementLabels: Record<MovementType, { label: string; variant: 'emerald' | 'rose' | 'slate' | 'amber' }> = {
    initial: { label: 'Boshlang\'ich qoldiq', variant: 'slate' },
    purchase: { label: 'Sotib olish', variant: 'emerald' },
    birth: { label: 'Tug\'ilish', variant: 'emerald' },
    sale: { label: 'Sotuv', variant: 'rose' },
    death: { label: 'O\'lim / Talafot', variant: 'rose' },
    transfer_in: { label: 'Fermadan qabul', variant: 'emerald' },
    transfer_out: { label: 'Fermaga berish', variant: 'rose' },
    inventory_correction: { label: 'Inventarizatsiya', variant: 'amber' },
  };

  const filteredMovements = movements.filter(m => {
    const matchesType = typeFilter === 'all' || m.movement_type === typeFilter;
    const matchesSearch =
      m.species.toLowerCase().includes(search.toLowerCase()) ||
      m.breed.toLowerCase().includes(search.toLowerCase()) ||
      m.reason.toLowerCase().includes(search.toLowerCase()) ||
      m.created_by_name.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Chorva Harakati Tarixi (Audit Jurnali)</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Barcha kirim, chiqim, tug'ilish va sotuv operatsiyalari tranzaksiyalar asosida saqlanadi
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Zot, sabab yoki mas'ul shaxs bo'yicha qidiring..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0E1A16] border border-slate-200 dark:border-forest-800/60 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-600"
          />
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3.5 py-2 bg-white dark:bg-[#0E1A16] border border-slate-200 dark:border-forest-800/60 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
        >
          <option value="all">Barcha operatsiyalar ({movements.length})</option>
          <option value="birth">Faqat tug'ilishlar</option>
          <option value="purchase">Faqat xaridlar</option>
          <option value="sale">Faqat sotuvlar</option>
          <option value="death">Faqat o'lim/talafot</option>
          <option value="inventory_correction">Inventarizatsiya tuzatishlari</option>
        </select>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-2xl border border-slate-200/90 dark:border-forest-800/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-forest-950/60 border-b border-slate-200 dark:border-forest-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Sana</th>
                <th className="py-3 px-4">Chorva Guruhi</th>
                <th className="py-3 px-4">Operatsiya Turi</th>
                <th className="py-3 px-4 text-center">O'zgarish (Bosh)</th>
                <th className="py-3 px-4 text-center">Oldin / Keyin</th>
                <th className="py-3 px-4">Sabab &amp; Izoh</th>
                <th className="py-3 px-4">Kiritgan Shaxs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-forest-900/60">
              {filteredMovements.map(mov => {
                const isPositive = mov.delta_count > 0;
                const isNegative = mov.delta_count < 0;

                return (
                  <tr key={mov.id} className="hover:bg-slate-50/80 dark:hover:bg-forest-950/40 transition">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {mov.date}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {mov.species} ({mov.breed})
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge
                        size="sm"
                        variant={movementLabels[mov.movement_type]?.variant || 'slate'}
                      >
                        {movementLabels[mov.movement_type]?.label || mov.movement_type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-extrabold px-2 py-0.5 rounded-lg ${
                          isPositive
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                            : isNegative
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                            : 'bg-slate-100 dark:bg-forest-950/40 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isPositive ? `+${mov.delta_count}` : `${mov.delta_count}`} bosh
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {mov.head_count_before} &rarr; <strong className="text-slate-900 dark:text-white">{mov.head_count_after}</strong>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-xs">
                      <p className="font-semibold">{mov.reason}</p>
                      {mov.notes && <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5">{mov.notes}</p>}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {mov.created_by_name}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMovements.length === 0 && (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500">
            <History className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p>Harakatlar tarixi bo'sh yoki qidiruv bo'yicha ma'lumot topilmadi</p>
          </div>
        )}
      </div>

    </div>
  );
};
