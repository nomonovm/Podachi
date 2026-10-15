import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { backendEngine } from '../lib/backendEngine';
import { History, Search, ArrowUpRight, ArrowDownRight, Layers, FileText, Undo2, Trash2, AlertTriangle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { MovementType, AnimalMovement } from '../types';

export const MovementsHistory: React.FC = () => {
  const { state, currentFarm, currentRole, showToast } = useApp();
  const farmId = currentFarm?.id;

  const movements = state.movements.filter(m => m.farm_id === farmId);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Confirmation modal state
  const [selectedMov, setSelectedMov] = useState<AnimalMovement | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [movementModalAction, setMovementModalAction] = useState<'cancel' | 'delete'>('cancel');

  const isAdmin = currentRole === 'admin';
  const isManager = currentRole === 'manager';
  const canAct = isAdmin || isManager;

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

  const handleConfirmAction = () => {
    if (!selectedMov) return;

    try {
      if (movementModalAction === 'cancel') {
        backendEngine.cancelAnimalMovement(selectedMov.id);
        showToast(`Harakat muvaffaqiyatli bekor qilindi. Chorva guruhi soni o'z holiga qaytarildi va audit jurnaliga yozildi.`, 'success');
      } else {
        backendEngine.deleteAnimalMovement(selectedMov.id);
        showToast(`Bekor qilingan harakat qaydi butunlay o'chirildi va audit jurnaliga yozildi.`, 'success');
      }
      setSelectedMov(null);
      setIsCancelModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Xatolik yuz berdi', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Chorva Harakati Tarixi</h1>
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
                {canAct && <th className="py-3 px-4 text-center">Amallar</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-forest-900/60">
              {filteredMovements.map(mov => {
                const isPositive = mov.delta_count > 0;
                const isNegative = mov.delta_count < 0;
                const isCancelled = mov.is_cancelled;

                return (
                  <tr
                    key={mov.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-forest-950/40 transition ${
                      isCancelled ? 'opacity-60 bg-slate-50/40 dark:bg-slate-900/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {mov.date}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {mov.species} ({mov.breed})
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          size="sm"
                          variant={movementLabels[mov.movement_type]?.variant || 'slate'}
                        >
                          {movementLabels[mov.movement_type]?.label || mov.movement_type}
                        </Badge>
                        {isCancelled && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            Bekor qilingan
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-extrabold px-2 py-0.5 rounded-lg ${
                          isCancelled
                            ? 'line-through text-slate-400 bg-slate-100 dark:bg-slate-800'
                            : isPositive
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
                      <p className={`font-semibold ${isCancelled ? 'line-through text-slate-400' : ''}`}>
                        {mov.reason}
                      </p>
                      {mov.total_price_uzs && mov.total_price_uzs > 0 && (
                        <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40 inline-block mt-0.5">
                          Tushum: {mov.total_price_uzs.toLocaleString()} so'm
                        </span>
                      )}
                      {mov.notes && <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5">{mov.notes}</p>}
                      {isCancelled && mov.cancelled_by && (
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                          Bekor qildi: {mov.cancelled_by}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {mov.created_by_name}
                    </td>

                    {canAct && (
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {!isCancelled ? (
                            <button
                              onClick={() => {
                                setSelectedMov(mov);
                                setMovementModalAction('cancel');
                                setIsCancelModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                              title="Harakatni bekor qilish va qoldiqni tiklash"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                              Bekor qilish
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Bekor qilingan</span>
                          )}

                          {/* O'chirish amali (Faqat Administrator uchun va FAQATGINA bekor qilingan harakatlarda!) */}
                          {isAdmin && isCancelled && (
                            <button
                              onClick={() => {
                                setSelectedMov(mov);
                                setMovementModalAction('delete');
                                setIsCancelModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] font-bold transition flex items-center justify-center shadow-xs"
                              title="Bekor qilingan harakatni butunlay o'chirish (Faqat Administrator)"
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
        </div>

        {filteredMovements.length === 0 && (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500">
            <History className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p>Harakatlar tarixi bo'sh yoki qidiruv bo'yicha ma'lumot topilmadi</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setSelectedMov(null);
          setIsCancelModalOpen(false);
        }}
        title={movementModalAction === 'delete' ? "Harakat qaydini butunlay o'chirish" : "Harakatni bekor qilish"}
        subtitle={
          movementModalAction === 'delete'
            ? "Ushbu bekor qilingan yozuv tizimdan butunlay o'chiriladi"
            : "Chorva guruhi soni avtomatik ravishda o'z holiga qaytariladi va auditga qayd etiladi"
        }
      >
        {selectedMov && (
          <div className="space-y-4">
            {movementModalAction === 'delete' ? (
              <div className="p-4 rounded-2xl border flex items-start gap-3 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200">
                <Trash2 className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">
                    Harakat qaydini butunlay o'chirish tasdig'i
                  </p>
                  <p>
                    <strong>Guruh:</strong> {selectedMov.species} ({selectedMov.breed})<br />
                    <strong>Operatsiya:</strong> {movementLabels[selectedMov.movement_type]?.label} ({selectedMov.delta_count > 0 ? '+' : ''}{selectedMov.delta_count} bosh)<br />
                    <strong>Sana:</strong> {selectedMov.date} &bull; <strong>Sabab:</strong> {selectedMov.reason}
                  </p>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 font-medium pt-1">
                    ⚠ Diqqat: Ushbu bekor qilingan yozuv ro'yxatdan butunlay o'chiriladi.
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                    ℹ Ushbu amal Administrator ({state.currentUser.full_name}) nomidan Audit Jurnaliga qayd etiladi.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">
                    Harakatni bekor qilish tasdig'i
                  </p>
                  <p>
                    <strong>Guruh:</strong> {selectedMov.species} ({selectedMov.breed})<br />
                    <strong>Operatsiya:</strong> {movementLabels[selectedMov.movement_type]?.label} ({selectedMov.delta_count > 0 ? '+' : ''}{selectedMov.delta_count} bosh)<br />
                    <strong>Sana:</strong> {selectedMov.date} &bull; <strong>Sabab:</strong> {selectedMov.reason}
                  </p>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium pt-1">
                    ✓ Bekor qilingandan so'ng, chorva bosh sonidagi o'zgarish ({selectedMov.delta_count > 0 ? `-${selectedMov.delta_count}` : `+${Math.abs(selectedMov.delta_count)}`} bosh) guruh qoldig'iga tiklanadi.
                  </p>
                  {selectedMov.movement_type === 'sale' && (
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold pt-1 border-t border-amber-200/60 dark:border-amber-800/60 mt-1">
                      💰 Diqqat: Ushbu chorva sotuvidan kelgan daromad (foyda) ham Moliya bo'limidan avtomatik bekor qilinadi va hisob-kitoblar avvalgi holatiga qaytariladi.
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                    ℹ Ushbu amal {isAdmin ? 'Administrator' : 'Bosh Menejer'} nomidan Audit Jurnaliga qayd etiladi.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedMov(null);
                  setIsCancelModalOpen(false);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-forest-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/40 transition"
              >
                Ortga qaytish
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition shadow-sm ${
                  movementModalAction === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {movementModalAction === 'delete' ? "Qaydni o'chirish" : 'Bekor qilishni tasdiqlash'}
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
