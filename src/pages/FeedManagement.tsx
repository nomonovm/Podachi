import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { backendEngine } from '../lib/backendEngine';
import { Wheat, Plus, ArrowDown, ArrowUp, AlertTriangle } from 'lucide-react';
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
  const [txNotes, setTxNotes] = useState<string>('');

  const canManage = ['admin', 'manager'].includes(currentRole);

  const handleCreateFeed = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      backendEngine.addFeedItem({
        name,
        feed_type: feedType,
        stock_quantity: Number(stockQuantity),
        unit,
        min_threshold: Number(minThreshold),
        unit_price_uzs: Number(unitPrice) || undefined,
      });

      showToast(`Yangi ozuqa qo'shildi: ${name}`, 'success');
      setIsAddFeedModalOpen(false);
      setName('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRecordTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedForTx) return;

    try {
      backendEngine.recordFeedTransaction({
        feed_id: selectedFeedForTx.id,
        transaction_type: txType,
        quantity: Number(txQuantity),
        notes: txNotes,
      });

      showToast(`Ozuqa operatsiyasi muvaffaqiyatli saqlandi`, 'success');
      setIsTxModalOpen(false);
      setTxNotes('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const openTx = (item: FeedItem, type: 'incoming' | 'outgoing') => {
    setSelectedFeedForTx(item);
    setTxType(type);
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
          <button
            onClick={() => setIsAddFeedModalOpen(true)}
            className="px-4 py-2 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Yangi ozuqa qo'shish
          </button>
        )}
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
        title={txType === 'incoming' ? "Ozuqa Kirimi (Qabul Qilish)" : "Ozuqa Sarfi (Chiqim)"}
        subtitle={selectedFeedForTx ? `${selectedFeedForTx.name} (Qoldiq: ${selectedFeedForTx.stock_quantity} ${selectedFeedForTx.unit})` : ''}
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

    </div>
  );
};
