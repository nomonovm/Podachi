import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { backendEngine } from '../lib/backendEngine';
import { Wheat, Plus, ArrowDown, ArrowUp, AlertTriangle, RotateCw } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { FeedItem } from '../types';

export const FeedManagement: React.FC = () => {
  const { state, currentFarm, currentRole, showToast } = useApp();
  const farmId = currentFarm?.id;

  const feedItems = state.feedItems.filter(f => f.farm_id === farmId);
  const feedTransactions = state.feedTransactions.filter(t => t.farm_id === farmId);

  const [isAddFeedModalOpen, setIsAddFeedModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedFeedForTx, setSelectedFeedForTx] = useState<FeedItem | null>(null);

  const [cycleResult, setCycleResult] = useState<ReturnType<typeof backendEngine.processDailyFarmCycle> | null>(null);
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);

  const handleRunDailyCycle = () => {
    try {
      const res = backendEngine.processDailyFarmCycle();
      setCycleResult(res);
      setIsCycleModalOpen(true);
      showToast(`Kunlik sikl bajarildi: +${res.totalMilkRevenue.toLocaleString()} so'm sut tushumi qo'shildi`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Form states for new feed item
  const [name, setName] = useState('');
  const [feedType, setFeedType] = useState<FeedItem['feed_type']>('xashak');
  const [stockQuantity, setStockQuantity] = useState<number>(100);
  const [unit, setUnit] = useState<FeedItem['unit']>('bog\'lam');
  const [minThreshold, setMinThreshold] = useState<number>(20);
  const [unitPrice, setUnitPrice] = useState<number>(30000);

  // Form states for tx
  const [txType, setTxType] = useState<'incoming' | 'outgoing'>('incoming');
  const [txQuantity, setTxQuantity] = useState<number>(50);
  const [txUnitPrice, setTxUnitPrice] = useState<number>(30000);
  const [txNotes, setTxNotes] = useState<string>('');

  const canManage = ['admin', 'manager'].includes(currentRole);

  const handleCreateFeed = (e: React.FormEvent) => {
    e.preventDefault();
    const initialCost = (Number(stockQuantity) > 0 && Number(unitPrice) > 0)
      ? Number(stockQuantity) * Number(unitPrice)
      : 0;

    try {
      backendEngine.addFeedItem({
        name,
        feed_type: feedType,
        stock_quantity: Number(stockQuantity),
        unit,
        min_threshold: Number(minThreshold),
        unit_price_uzs: Number(unitPrice) || undefined,
      });

      if (initialCost > 0) {
        showToast(`Yangi ozuqa qo'shildi va ${initialCost.toLocaleString()} so'm xarajatlarga yozildi`, 'success');
      } else {
        showToast(`Yangi ozuqa qo'shildi: ${name}`, 'success');
      }
      setIsAddFeedModalOpen(false);
      setName('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRecordTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedForTx) return;

    const calculatedCost = txType === 'incoming' ? Number(txQuantity) * Number(txUnitPrice) : 0;

    try {
      backendEngine.recordFeedTransaction({
        feed_id: selectedFeedForTx.id,
        transaction_type: txType,
        quantity: Number(txQuantity),
        unit_price_uzs: txType === 'incoming' ? Number(txUnitPrice) : undefined,
        total_cost_uzs: calculatedCost > 0 ? calculatedCost : undefined,
        notes: txNotes,
      });

      if (txType === 'incoming' && calculatedCost > 0) {
        showToast(`Ozuqa kirimi saqlandi va ${calculatedCost.toLocaleString()} so'm xarajatlarga yozildi`, 'success');
      } else {
        showToast(`Ozuqa operatsiyasi muvaffaqiyatli saqlandi`, 'success');
      }
      setIsTxModalOpen(false);
      setTxNotes('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const openTx = (item: FeedItem, type: 'incoming' | 'outgoing') => {
    setSelectedFeedForTx(item);
    setTxType(type);
    setTxQuantity(type === 'incoming' ? 50 : Math.min(10, item.stock_quantity));
    setTxUnitPrice(item.unit_price_uzs || 30000);
    setTxNotes('');
    setIsTxModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Yem-Xashak &amp; Ozuqa Boshqaruvi</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ombordagi zaxiralar, kirim/chiqim amallari va minimal zaxira ogohlantirishlari
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRunDailyCycle}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <RotateCw className="w-4 h-4 text-emerald-100" />
              Kunlik Siklni O'tkazish
            </button>
            <button
              onClick={() => setIsAddFeedModalOpen(true)}
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Yangi ozuqa qo'shish
            </button>
          </div>
        )}
      </div>

      {/* Manager Automation Info Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Wheat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Avtomatik Ozuqa &amp; Sut Nazorati</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">Faol</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
              Qoramol va echkilarning kunlik suti daromadga, kunlik ozuqa sarfi esa ombordan ayirib boriladi. Minimal chegara ogohlantirishida Bosh Menejer (Bobur Rustamov) nomidan avtomatik xarid qayd etiladi.
            </p>
          </div>
        </div>
        <button
          onClick={handleRunDailyCycle}
          className="shrink-0 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5" />
          Kunlik Siklni Yurgizish
        </button>
      </div>

      {/* Feed Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {feedItems.map(item => {
          const isLow = item.stock_quantity <= item.min_threshold;

          return (
            <div
              key={item.id}
              className={`bg-white dark:bg-[#0E1A16] rounded-2xl p-5 border shadow-sm flex flex-col justify-between transition ${
                isLow
                  ? 'border-amber-300 dark:border-amber-700/60 ring-1 ring-amber-200 dark:ring-amber-900/50'
                  : 'border-slate-200/90 dark:border-forest-800/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="forest">
                    <span className="capitalize">{item.feed_type}</span>
                  </Badge>
                  {isLow ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/50">
                      <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      Kam qolgan!
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                      Yetarli zaxira
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">{item.name}</h3>

                <div className="my-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {item.stock_quantity.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.unit}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Minimal chegara: {item.min_threshold} {item.unit}
                  </p>
                </div>

                {item.unit_price_uzs && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0A1411] p-2 rounded-lg mb-3 border border-slate-100 dark:border-forest-900/50">
                    Birlik narxi: <strong className="text-slate-900 dark:text-white">{item.unit_price_uzs.toLocaleString()} so'm</strong>
                  </p>
                )}
              </div>

              {canManage && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-forest-900/50">
                  <button
                    onClick={() => openTx(item, 'incoming')}
                    className="flex-1 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Kirim
                  </button>
                  <button
                    onClick={() => openTx(item, 'outgoing')}
                    className="flex-1 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-rose-800 dark:text-rose-300 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    Sarf
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Transactions History */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-2xl border border-slate-200/90 dark:border-forest-800/40 shadow-xs p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Ozuqa Harakatlari Tarixi</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-forest-950/60 border-b border-slate-200 dark:border-forest-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Sana</th>
                <th className="py-2.5 px-3">Mahsulot</th>
                <th className="py-2.5 px-3">Turi</th>
                <th className="py-2.5 px-3 text-center">Miqdor</th>
                <th className="py-2.5 px-3 text-center">Oldingi / Yangi Qoldiq</th>
                <th className="py-2.5 px-3 text-right">Summa (Xarajat)</th>
                <th className="py-2.5 px-3">Izoh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-forest-900/60">
              {feedTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-forest-950/40 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">{tx.date}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{tx.feed_name}</td>
                  <td className="py-2.5 px-3">
                    <Badge size="sm" variant={tx.transaction_type === 'incoming' ? 'emerald' : 'rose'}>
                      {tx.transaction_type === 'incoming' ? 'Kirim' : 'Sarf'}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold">
                    <span className={tx.transaction_type === 'incoming' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                      {tx.transaction_type === 'incoming' ? '+' : '-'}{tx.quantity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-600 dark:text-slate-400">
                    {tx.previous_stock} &rarr; <strong className="text-slate-900 dark:text-white">{tx.new_stock}</strong>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium">
                    {tx.total_cost_uzs ? (
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {tx.total_cost_uzs.toLocaleString()} so'm
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{tx.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {feedTransactions.length === 0 && (
            <p className="text-center py-6 text-slate-400 dark:text-slate-500">Ozuqa tranzaksiyalari hali mavjud emas</p>
          )}
        </div>
      </div>

      {/* Modal: Add Feed Item */}
      <Modal
        isOpen={isAddFeedModalOpen}
        onClose={() => setIsAddFeedModalOpen(false)}
        title="Yangi Ozuqa Mahsulotini Qo'shish"
        maxWidth="md"
      >
        <form onSubmit={handleCreateFeed} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mahsulot nomi</label>
            <input
              type="text"
              required
              placeholder="Masalan: Toza beda poyasi yoki arpa yemi"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ozuqa turi</label>
              <select
                value={feedType}
                onChange={e => setFeedType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              >
                <option value="xashak">Xashak (beda, somon)</option>
                <option value="yem">Don yemi (arpa, bug'doy)</option>
                <option value="silos">Silos</option>
                <option value="kombikorm">Kombikorm</option>
                <option value="vitamin">Vitamin &amp; Premikslar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">O'lchov birligi</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              >
                <option value="bog'lam">Bog'lam</option>
                <option value="kg">Kilogramm (kg)</option>
                <option value="tonna">Tonna</option>
                <option value="qop">Qop</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Boshlang'ich miqdor</label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={e => setStockQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Minimal chegara (ogohlantirish)</label>
              <input
                type="number"
                min="1"
                required
                value={minThreshold}
                onChange={e => setMinThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Birlik narxi (so'm, ixtiyoriy)</label>
            <input
              type="number"
              min="0"
              value={unitPrice}
              onChange={e => setUnitPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
            />
          </div>

          {Number(stockQuantity) > 0 && Number(unitPrice) > 0 && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Boshlang'ich xarajat summasi:</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {(Number(stockQuantity) * Number(unitPrice)).toLocaleString()} so'm (xarajatga yoziladi)
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-forest-900/60">
            <button
              type="button"
              onClick={() => setIsAddFeedModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-forest-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/50 rounded-xl text-xs font-bold transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Mahsulotni saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Record Feed Tx */}
      <Modal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        title={txType === 'incoming' ? "Ozuqa Kirimi (Sotib Olish / Qabul Qilish)" : "Ozuqa Sarfi (Chiqim)"}
        subtitle={selectedFeedForTx ? `${selectedFeedForTx.name} (Hozirgi qoldiq: ${selectedFeedForTx.stock_quantity} ${selectedFeedForTx.unit})` : ''}
        maxWidth="sm"
      >
        <form onSubmit={handleRecordTx} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Miqdor ({selectedFeedForTx?.unit})
            </label>
            <input
              type="number"
              min="1"
              max={txType === 'outgoing' ? selectedFeedForTx?.stock_quantity : undefined}
              required
              value={txQuantity}
              onChange={e => setTxQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
            />
            {txType === 'outgoing' && selectedFeedForTx && txQuantity > selectedFeedForTx.stock_quantity && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-semibold">
                * Sarf miqdori mavjud qoldiqdan ({selectedFeedForTx.stock_quantity} {selectedFeedForTx.unit}) oshmasligi kerak!
              </p>
            )}
          </div>

          {txType === 'incoming' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Birlik narxi (so'm / {selectedFeedForTx?.unit || 'birlik'})
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={txUnitPrice}
                  onChange={e => setTxUnitPrice(Number(e.target.value))}
                  placeholder="Masalan: 30000"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
                />
              </div>

              {/* Calculated Total Expense Card */}
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">Hisoblangan xarajat summasi:</span>
                  <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                    {((Number(txQuantity) || 0) * (Number(txUnitPrice) || 0)).toLocaleString()} so'm
                  </span>
                </div>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                  ✓ Ushbu summa tasdiqlangach avtomatik ravishda ferma xarajatlariga ("Yem-xashak" toifasi) yoziladi.
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Izoh</label>
            <input
              type="text"
              placeholder={txType === 'incoming' ? "Taminotchidan sotib olindi" : "1-sonli qo'raga tarqatildi"}
              value={txNotes}
              onChange={e => setTxNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-forest-900/60">
            <button
              type="button"
              onClick={() => setIsTxModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-forest-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/50 rounded-xl text-xs font-bold transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={txType === 'outgoing' && selectedFeedForTx ? txQuantity > selectedFeedForTx.stock_quantity : false}
              className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 ${
                txType === 'incoming'
                  ? 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600'
                  : 'bg-rose-700 hover:bg-rose-800 dark:bg-rose-700 dark:hover:bg-rose-600'
              }`}
            >
              Tasdiqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* Daily Farm Cycle Summary Modal */}
      <Modal
        isOpen={isCycleModalOpen}
        onClose={() => setIsCycleModalOpen(false)}
        title="Kunlik Ferma Sikli Hisoboti"
        subtitle={`Sana: ${cycleResult?.date || ''} | Mas'ul: Bobur Rustamov (Bosh Menejer)`}
        maxWidth="md"
      >
        {cycleResult && (
          <div className="space-y-4">
            {/* Milk Revenue Card */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    🥛
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Kunlik Sut Mahsuldorligi &amp; Daromad</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Sog'in sigir va echkilar hisobi</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                  +{cycleResult.totalMilkRevenue.toLocaleString()} so'm
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40">
                <div className="bg-white/80 dark:bg-forest-900/40 p-2 rounded-xl">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Qoramol (Sigirlar)</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {cycleResult.cowMilkingHeads} bosh &rarr; {cycleResult.cowMilkLiters.toLocaleString()} litr
                  </p>
                </div>
                <div className="bg-white/80 dark:bg-forest-900/40 p-2 rounded-xl">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Echki (Sog'inlar)</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {cycleResult.goatMilkingHeads} bosh &rarr; {cycleResult.goatMilkLiters.toLocaleString()} litr
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-2">
                ✓ Moliya jurnaliga "Sut va mahsulotlar" toifasida daromad sifatida yozildi (Menejer Bobur Rustamov).
              </p>
            </div>

            {/* Feed Consumption Card */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                  🌾
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Chorva Bosh Soni Bo'yicha Yem Sarfi</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Hayvonlar turi va kunlik me'yor asosida ombordan ayirildi</p>
                </div>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
                {cycleResult.feedDeductions.length > 0 ? (
                  cycleResult.feedDeductions.map((f, i) => (
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
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Ogohlantirish chegarasiga yetgan zaxiralar avtomatik xaridi</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-forest-900/60">
                {cycleResult.feedReplenishments.length > 0 ? (
                  <div className="space-y-2">
                    {cycleResult.feedReplenishments.map((r, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-forest-950/60 border border-slate-200/80 dark:border-forest-800/40 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{r.name}</p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400">+{r.quantity} {r.unit} zaxiraga qabul qilindi</p>
                        </div>
                        <span className="font-extrabold text-rose-600 dark:text-rose-400">
                          -{r.cost.toLocaleString()} so'm
                        </span>
                      </div>
                    ))}
                    <p className="text-[10px] text-forest-700 dark:text-forest-400 font-semibold mt-1">
                      ✓ Bosh Menejer (Bobur Rustamov) nomidan xarajatlarga yozildi va auditga qayd etildi.
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
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Dr. Jamshid Zokirov (Bosh Veterinar) tomonidan o'tkazildi</p>
                </div>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-sky-200/60 dark:border-sky-800/40">
                {cycleResult.vetActions && cycleResult.vetActions.length > 0 ? (
                  cycleResult.vetActions.map((v, i) => (
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
                  ✓ Barcha muolajalar "Veterinariya &amp; Sog'liq" jurnali va xarajatlarga avtomatik yozildi.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsCycleModalOpen(false)}
                className="px-5 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Tushunarli
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
