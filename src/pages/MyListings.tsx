import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { backendEngine } from '../lib/backendEngine';
import {
  Tag,
  CheckCircle,
  XCircle,
  ShoppingBag,
  DollarSign,
  Phone,
  User,
  AlertCircle,
  History,
  FileCheck,
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { MarketplaceListing, CompletedSale } from '../types';

export const MyListings: React.FC = () => {
  const { state, currentFarm, currentRole, showToast, setActiveTab } = useApp();

  const farmId = currentFarm?.id;
  const myListings = state.marketplaceListings.filter(l => l.farm_id === farmId);
  const myCompletedSales = state.completedSales.filter(s => s.farm_id === farmId);

  // Partial sale modal state
  const [selectedListingForSale, setSelectedListingForSale] = useState<MarketplaceListing | null>(null);
  const [headsSold, setHeadsSold] = useState<number>(10);
  const [buyerName, setBuyerName] = useState('Rustam Shukurov');
  const [buyerPhone, setBuyerPhone] = useState('+998 90 987 65 43');
  const [saleNotes, setSaleNotes] = useState('');

  // Listing close state
  const [listingToClose, setListingToClose] = useState<MarketplaceListing | null>(null);

  const canManage = currentRole === 'admin' || currentRole === 'manager';

  const handleOpenSaleModal = (listing: MarketplaceListing) => {
    setSelectedListingForSale(listing);
    setHeadsSold(Math.min(10, listing.remaining_quantity));
  };

  const handleExecuteSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListingForSale) return;

    try {
      backendEngine.completeSale({
        listing_id: selectedListingForSale.id,
        heads_sold: Number(headsSold),
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        notes: saleNotes,
      });

      showToast(`Sotuv yakunlandi: ${headsSold} bosh chorva sotildi va daromad yozildi`, 'success');
      setSelectedListingForSale(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleConfirmCloseListing = () => {
    if (!listingToClose) return;
    try {
      backendEngine.closeMarketplaceListing(listingToClose.id);
      showToast("E'lon yopildi va qolgan chorva zaxiraga qaytarildi", 'info');
      setListingToClose(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const statusLabels: Record<string, { label: string; variant: 'emerald' | 'amber' | 'slate' | 'rose' }> = {
    active: { label: 'Faol sotuvda', variant: 'emerald' },
    partially_sold: { label: 'Qisman sotilgan', variant: 'amber' },
    fully_sold: { label: 'To\'liq sotilgan', variant: 'slate' },
    closed: { label: 'Yopilgan', variant: 'rose' },
    expired: { label: 'Muddati tugagan', variant: 'slate' },
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mening E'lonlarim &amp; Savdolar</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fermangiz tomonidan joylashtirilgan e'lonlar, bandlik nazorati va sotuvni yakunlash
          </p>
        </div>

        <button
          onClick={() => setActiveTab('marketplace')}
          className="px-4 py-2 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          Bozorga qaytish
        </button>
      </div>

      {/* Listings Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Faol va Tarixiy E'lonlar</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {myListings.map(listing => {
            const isFinished = listing.status === 'fully_sold' || listing.status === 'closed';

            return (
              <div
                key={listing.id}
                className="bg-white dark:bg-[#0E1A16] rounded-2xl p-5 border border-slate-200/90 dark:border-forest-800/40 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={statusLabels[listing.status]?.variant || 'slate'}>
                      {statusLabels[listing.status]?.label || listing.status}
                    </Badge>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      Yaratilgan: {listing.created_at.split('T')[0]}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-slate-900 dark:text-white">
                    {listing.breed} {listing.species}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{listing.age_group} | {listing.gender_type}</p>

                  {/* Stock metrics in card */}
                  <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-xl bg-slate-50 dark:bg-[#0A1411] border border-slate-100 dark:border-forest-900/50 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Boshlang'ich</span>
                      <strong className="text-sm font-black text-slate-800 dark:text-slate-200">{listing.initial_quantity_for_sale}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Sotilgan</span>
                      <strong className="text-sm font-black text-emerald-700 dark:text-emerald-400">{listing.quantity_sold}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Qolgan band</span>
                      <strong className="text-sm font-black text-amber-700 dark:text-amber-400">{listing.remaining_quantity}</strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Bir bosh narxi:</span>
                      <strong>{listing.price_per_head_uzs.toLocaleString()} so'm</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Jami hisoblangan:</span>
                      <strong>{listing.total_calculated_uzs.toLocaleString()} so'm</strong>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {canManage && !isFinished && (
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-forest-900/50">
                    <button
                      onClick={() => handleOpenSaleModal(listing)}
                      className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Sotuvni yakunlash
                    </button>
                    <button
                      onClick={() => setListingToClose(listing)}
                      className="px-3.5 py-2 border border-slate-200 dark:border-forest-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-bold transition"
                      title="E'lonni yopish va zaxiraga qaytarish"
                    >
                      Yopish
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {myListings.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-[#0E1A16] rounded-2xl border border-slate-200 dark:border-forest-800/40 text-slate-400 dark:text-slate-500">
            Fermangiz tomonidan hali e'lonlar joylashtirilmagan
          </div>
        )}
      </div>

      {/* Completed Sales Ledger */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-2xl border border-slate-200/90 dark:border-forest-800/40 shadow-xs p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Yakunlangan Savdolar Jurnali
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-forest-950/60 border-b border-slate-200 dark:border-forest-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Sana</th>
                <th className="py-2.5 px-3">Xaridor</th>
                <th className="py-2.5 px-3">Aloqa</th>
                <th className="py-2.5 px-3 text-center">Sotilgan Miqdor</th>
                <th className="py-2.5 px-3 text-right">Bir bosh narxi</th>
                <th className="py-2.5 px-3 text-right">Jami Daromad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-forest-900/60">
              {myCompletedSales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-forest-950/40 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">{sale.sale_date}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{sale.buyer_name}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{sale.buyer_phone}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-900 dark:text-white">
                    {sale.heads_sold} bosh
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {sale.price_per_head_uzs.toLocaleString()} so'm
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    +{sale.total_revenue_uzs.toLocaleString()} so'm
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {myCompletedSales.length === 0 && (
            <p className="text-center py-6 text-slate-400 dark:text-slate-500">Hali yakunlangan savdolar mavjud emas</p>
          )}
        </div>
      </div>

      {/* Modal: Complete Partial / Full Sale */}
      <Modal
        isOpen={Boolean(selectedListingForSale)}
        onClose={() => setSelectedListingForSale(null)}
        title="Sotuvni Rasmiylashtirish & Yakunlash"
        subtitle={
          selectedListingForSale
            ? `${selectedListingForSale.breed} ${selectedListingForSale.species} (E'londa qolgan: ${selectedListingForSale.remaining_quantity} bosh)`
            : ''
        }
        maxWidth="md"
      >
        <form onSubmit={handleExecuteSale} className="space-y-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-900 dark:text-emerald-200">
            <strong>Eslatma:</strong> Sotuv tasdiqlangach, chorva soni kamaytiriladi va tegishli daromad bir marta moliyaviy hisobotga qo'shiladi.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sotilayotgan bosh soni
            </label>
            <input
              type="number"
              min="1"
              max={selectedListingForSale?.remaining_quantity || 1}
              required
              value={headsSold}
              onChange={e => setHeadsSold(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Qisman sotuv mumkin (qolgan miqdor e'londa faol qoladi).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Xaridorning ismi</label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Xaridor telefoni</label>
              <input
                type="text"
                required
                value={buyerPhone}
                onChange={e => setBuyerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {selectedListingForSale && (
            <div className="p-3 bg-slate-50 dark:bg-[#0A1411] border border-slate-200 dark:border-forest-900/50 rounded-xl text-xs flex items-center justify-between">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Kassaga tushadigan daromad:</span>
              <span className="text-base font-black text-emerald-800 dark:text-emerald-400">
                {(headsSold * selectedListingForSale.price_per_head_uzs).toLocaleString()} so'm
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Qo'shimcha izoh (ixtiyoriy)</label>
            <textarea
              rows={2}
              placeholder="Yetkazib berish yoki to'lov ma'lumotlari..."
              value={saleNotes}
              onChange={e => setSaleNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-forest-900/60">
            <button
              type="button"
              onClick={() => setSelectedListingForSale(null)}
              className="px-4 py-2 border border-slate-200 dark:border-forest-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/50 rounded-xl text-xs font-bold transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Sotuvni tasdiqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Close Listing */}
      <Modal
        isOpen={Boolean(listingToClose)}
        onClose={() => setListingToClose(null)}
        title="E'lonni Yopishni Tasdiqlash"
        subtitle={listingToClose ? `${listingToClose.breed} ${listingToClose.species} — Qolgan band chorva: ${listingToClose.remaining_quantity} bosh` : ''}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Haqiqatan ham ushbu e'lonni yopmoqchimisiz? Band qilingan {listingToClose?.remaining_quantity} bosh chorva avtomatik ravishda ferma erkin zaxirasiga qaytariladi.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-forest-900/60">
            <button
              onClick={() => setListingToClose(null)}
              className="px-4 py-2 border border-slate-200 dark:border-forest-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/50 rounded-xl text-xs font-bold transition"
            >
              Ortga
            </button>
            <button
              onClick={handleConfirmCloseListing}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 dark:bg-rose-700 dark:hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Ha, e'lonni yopish
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
