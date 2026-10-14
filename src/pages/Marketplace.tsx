import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { backendEngine } from '../lib/backendEngine';
import {
  ShoppingBag,
  Plus,
  Search,
  MapPin,
  Phone,
  Tag,
  Building,
  DollarSign,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { MarketplaceListing, MarketplaceRequest } from '../types';

export const Marketplace: React.FC = () => {
  const { state, currentFarm, currentRole, showToast, setActiveTab } = useApp();

  const [mainTab, setMainTab] = useState<'listings' | 'requests'>('listings');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Modals
  const [isCreateListingModalOpen, setIsCreateListingModalOpen] = useState(false);
  const [isCreateRequestModalOpen, setIsCreateRequestModalOpen] = useState(false);
  const [selectedRequestForOffer, setSelectedRequestForOffer] = useState<MarketplaceRequest | null>(null);
  const [listingToClose, setListingToClose] = useState<MarketplaceListing | null>(null);
  const [closingReason, setClosingReason] = useState<'sold' | 'cancelled'>('sold');

  // Form states for creating listing
  const groups = state.animalGroups.filter(g => g.farm_id === currentFarm?.id);
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '');
  const [listingQuantity, setListingQuantity] = useState<number>(20);
  const [pricePerHead, setPricePerHead] = useState<number>(2500000);
  const [region, setRegion] = useState('Toshkent viloyati');
  const [district, setDistrict] = useState("Bo'stonliq tumani");
  const [listingDescription, setListingDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('+998 90 123 45 67');
  const [contactName, setContactName] = useState(state.currentUser.full_name);

  // Form states for creating request
  const [reqSpecies, setReqSpecies] = useState('Qo\'y');
  const [reqBreed, setReqBreed] = useState('Hisori');
  const [reqQuantity, setReqQuantity] = useState<number>(50);
  const [reqBudget, setReqBudget] = useState<number>(2200000);
  const [reqRegion, setReqRegion] = useState('Toshkent viloyati');
  const [reqDistrict, setReqDistrict] = useState('Chirchiq');
  const [reqDelivery, setReqDelivery] = useState<MarketplaceRequest['delivery_condition']>('yetkazib_berish');
  const [reqNeededBy, setReqNeededBy] = useState('2026-11-20');
  const [reqPhone, setReqPhone] = useState('+998 90 123 45 67');
  const [reqNotes, setReqNotes] = useState('');

  // Form states for offer
  const [offeredQuantity, setOfferedQuantity] = useState<number>(30);
  const [offeredPrice, setOfferedPrice] = useState<number>(2200000);
  const [offerNotes, setOfferNotes] = useState('');
  const [offerPhone, setOfferPhone] = useState('+998 90 123 45 67');

  const selectedGroupStock = selectedGroupId
    ? backendEngine.getGroupStockInfo(selectedGroupId)
    : { total: 0, reserved: 0, free: 0 };

  const canManage = currentRole === 'admin' || currentRole === 'manager';

  const handleCloseListing = () => {
    if (!listingToClose) return;
    try {
      backendEngine.closeMarketplaceListing(listingToClose.id);
      showToast(
        `E'lon yopildi (${closingReason === 'sold' ? 'Sotildi' : 'Bekor qilindi'}) va qolgan chorva zaxiraga qaytarildi`,
        'success'
      );
      setListingToClose(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      backendEngine.createMarketplaceListing({
        group_id: selectedGroupId,
        quantity: Number(listingQuantity),
        price_per_head_uzs: Number(pricePerHead),
        region,
        district,
        description: listingDescription,
        contact_phone: contactPhone,
        contact_name: contactName,
      });

      showToast("E'lon muvaffaqiyatli joylashtirildi va chorva band qilindi", 'success');
      setIsCreateListingModalOpen(false);
      setListingDescription('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      backendEngine.createMarketplaceRequest({
        species: reqSpecies,
        breed: reqBreed,
        requested_quantity: Number(reqQuantity),
        target_budget_per_head_uzs: Number(reqBudget),
        region: reqRegion,
        district: reqDistrict,
        delivery_condition: reqDelivery,
        needed_by_date: reqNeededBy,
        requirements: reqNotes,
        contact_phone: reqPhone,
      });

      showToast("Sotib olish so'rovi e'lon qilindi", 'success');
      setIsCreateRequestModalOpen(false);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForOffer) return;

    try {
      backendEngine.submitOffer({
        request_id: selectedRequestForOffer.id,
        offered_quantity: Number(offeredQuantity),
        offered_price_per_head_uzs: Number(offeredPrice),
        notes: offerNotes,
        contact_phone: offerPhone,
      });

      showToast('Taklif muvaffaqiyatli yuborildi', 'success');
      setSelectedRequestForOffer(null);
      setOfferNotes('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Filter listings — show active AND partially_sold (both have remaining stock)
  const activeListings = state.marketplaceListings.filter(
    l => l.status === 'active' || l.status === 'partially_sold'
  );
  const filteredListings = activeListings.filter(l => {
    const matchesSpecies = selectedSpecies === 'all' || l.species === selectedSpecies;
    const matchesRegion = selectedRegion === 'all' || l.region.includes(selectedRegion);
    const matchesSearch =
      l.species.toLowerCase().includes(search.toLowerCase()) ||
      l.breed.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.farm_name.toLowerCase().includes(search.toLowerCase());
    return matchesSpecies && matchesRegion && matchesSearch;
  });

  // Filter requests
  const openRequests = state.marketplaceRequests.filter(r => r.status === 'ochiq');
  const filteredRequests = openRequests.filter(r => {
    const matchesSpecies = selectedSpecies === 'all' || r.species === selectedSpecies;
    const matchesSearch =
      r.species.toLowerCase().includes(search.toLowerCase()) ||
      (r.breed && r.breed.toLowerCase().includes(search.toLowerCase())) ||
      (r.requirements && r.requirements.toLowerCase().includes(search.toLowerCase()));
    return matchesSpecies && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Bozor — Marketplace</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fermerlar o'rtasida zotdor chorva oldi-sotdisi, bandlik nazorati va shaxsiy ma'lumotlar himoyasi
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (groups.length === 0) {
                showToast("Sotuvga chiqarish uchun avval 'Chorva hisobi'da guruh yarating", 'error');
                return;
              }
              setSelectedGroupId(groups[0]?.id || '');
              setIsCreateListingModalOpen(true);
            }}
            className="px-4 py-2 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Sotuv e'loni berish
          </button>

          <button
            onClick={() => setIsCreateRequestModalOpen(true)}
            className="px-4 py-2 border border-slate-200 dark:border-forest-800 bg-white dark:bg-[#0E1A16] hover:bg-slate-50 dark:hover:bg-forest-900/50 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            <Tag className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
            Sotib olish so'rovi
          </button>
        </div>
      </div>

      {/* Main Mode Tabs: Listings vs Requests */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-forest-900/60">
        <button
          onClick={() => setMainTab('listings')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            mainTab === 'listings'
              ? 'border-forest-700 dark:border-emerald-400 text-forest-900 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Sotuv E'lonlari ({activeListings.length})
        </button>

        <button
          onClick={() => setMainTab('requests')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            mainTab === 'requests'
              ? 'border-forest-700 dark:border-emerald-400 text-forest-900 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          Sotib Olish So'rovlari ({openRequests.length})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Zot, ferma yoki kalit so'z bo'yicha qidiring..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0E1A16] border border-slate-200 dark:border-forest-800/60 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSpecies}
            onChange={e => setSelectedSpecies(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-[#0E1A16] border border-slate-200 dark:border-forest-800/60 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
          >
            <option value="all">Barcha hayvon turlari</option>
            <option value="Qo'y">Qo'y</option>
            <option value="Qoramol">Qoramol</option>
            <option value="Echki">Echki</option>
            <option value="Ot">Ot</option>
          </select>
        </div>
      </div>

      {/* TAB 1: SELL LISTINGS */}
      {mainTab === 'listings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => {
            const isMyFarm = listing.farm_id === currentFarm?.id;

            return (
              <div
                key={listing.id}
                className="bg-white dark:bg-[#0E1A16] rounded-2xl border border-slate-200/90 dark:border-forest-800/40 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Photo Thumbnail */}
                  <div className="relative h-48 bg-slate-100 dark:bg-forest-950/60 overflow-hidden">
                    <img
                      src={listing.photos[0] || 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=800&q=80'}
                      alt={`${listing.breed} ${listing.species}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-forest-900/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                        {listing.remaining_quantity} bosh mavjud
                      </span>
                      {isMyFarm && (
                        <span className="bg-amber-600/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                          Mening fermam
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                          {listing.breed} {listing.species}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {listing.farm_name}
                        </p>
                      </div>
                      <Badge variant="forest">{listing.gender_type}</Badge>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 my-3">
                      {listing.description}
                    </p>

                    {/* Pricing */}
                    <div className="bg-forest-50/70 dark:bg-forest-950/60 border border-forest-100 dark:border-forest-800/50 rounded-xl p-3 my-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Bir bosh narxi:</span>
                        <span className="text-sm font-black text-forest-900 dark:text-emerald-300">
                          {listing.price_per_head_uzs.toLocaleString()} so'm
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-forest-200/50 dark:border-forest-800/40">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Jami hisoblangan:</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {listing.total_calculated_uzs.toLocaleString()} so'm
                        </span>
                      </div>
                    </div>

                    {/* Region and Contacts */}
                    <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{listing.region}, {listing.district}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{listing.contact_phone} ({listing.contact_name})</span>
                      </div>
                    </div>

                    {/* Partially sold indicator */}
                    {listing.status === 'partially_sold' && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg px-2.5 py-1.5">
                        <DollarSign className="w-3.5 h-3.5 shrink-0" />
                        Qisman sotilgan — {listing.remaining_quantity} bosh hali mavjud
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0 space-y-2">
                  {/* For own farm: show manage buttons */}
                  {isMyFarm && canManage ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('my-listings')}
                        className="flex-1 py-2.5 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                      >
                        <DollarSign className="w-4 h-4" />
                        Sotuvni rasmiylashtirish
                      </button>
                      <button
                        onClick={() => { setListingToClose(listing); setClosingReason('cancelled'); }}
                        className="p-2.5 border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-700 dark:text-rose-400 rounded-xl transition"
                        title="E'lonni bekor qilish"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <a
                      href={`tel:${listing.contact_phone}`}
                      className="w-full py-2.5 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Phone className="w-4 h-4" />
                      Bog'lanish ({listing.contact_phone})
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: BUY REQUESTS */}
      {mainTab === 'requests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map(req => (
            <div
              key={req.id}
              className="bg-white dark:bg-[#0E1A16] rounded-2xl p-5 border border-slate-200/90 dark:border-forest-800/40 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="emerald">Sotib olish so'rovi</Badge>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                    Muddati: {req.needed_by_date}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {req.requested_quantity} bosh {req.breed ? req.breed : ''} {req.species} kerak
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Xaridor: {req.user_name}</p>

                <div className="my-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0A1411] border border-slate-100 dark:border-forest-900/50 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Taxminiy budjet (boshiga):</span>
                    <strong className="text-slate-900 dark:text-white">{req.target_budget_per_head_uzs.toLocaleString()} so'm</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Yetkazib berish sharti:</span>
                    <strong className="text-forest-800 dark:text-emerald-400 capitalize">{req.delivery_condition.replace('_', ' ')}</strong>
                  </div>
                </div>

                {req.requirements && (
                  <p className="text-xs text-slate-600 dark:text-amber-200/90 italic bg-amber-50/50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/50 mb-3">
                    "{req.requirements}"
                  </p>
                )}

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{req.region}, {req.district}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-forest-900/50 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedRequestForOffer(req);
                    setOfferedPrice(req.target_budget_per_head_uzs);
                    setOfferedQuantity(req.requested_quantity);
                  }}
                  className="flex-1 py-2 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Taklif yuborish
                </button>
                <a
                  href={`tel:${req.contact_phone}`}
                  className="p-2 border border-slate-200 dark:border-forest-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-forest-900/50 rounded-xl transition"
                  title="Qo'ng'iroq qilish"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Marketplace Listing */}
      <Modal
        isOpen={isCreateListingModalOpen}
        onClose={() => setIsCreateListingModalOpen(false)}
        title="Bozorga Sotuv E'loni Berish"
        subtitle="Mavjud chorvadan ortiq miqdor band qilinishiga server darajasida yo'l qo'yilmaydi"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateListing} className="space-y-4">
          
          {/* Group Selector with live free stock counter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Chorva guruhini tanlang
            </label>
            <select
              value={selectedGroupId}
              onChange={e => setSelectedGroupId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
            >
              {groups.map(g => {
                const stock = backendEngine.getGroupStockInfo(g.id);
                return (
                  <option key={g.id} value={g.id}>
                    {g.breed} {g.species} — Jami: {stock.total} bosh (Erkin qoldiq: {stock.free} bosh)
                  </option>
                );
              })}
            </select>
            <div className="mt-2 p-3 rounded-xl bg-forest-50/80 dark:bg-forest-950/60 border border-forest-200 dark:border-forest-800/60 text-xs flex items-center justify-between">
              <div>
                <span className="text-forest-900 dark:text-emerald-300 font-bold">Erkin sotuvga mavjud: </span>
                <span className="text-forest-800 dark:text-emerald-400 font-black">{selectedGroupStock.free} bosh</span>
              </div>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                (Jami: {selectedGroupStock.total} | Band: {selectedGroupStock.reserved})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sotuvga chiqariladigan miqdor (bosh)
              </label>
              <input
                type="number"
                min="1"
                max={selectedGroupStock.free}
                required
                value={listingQuantity}
                onChange={e => setListingQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
              {listingQuantity > selectedGroupStock.free && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-semibold">
                  * Xatolik: So'ralgan miqdor erkin qoldiqdan ({selectedGroupStock.free} bosh) ko'p!
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bir bosh narxi (so'm)
              </label>
              <input
                type="number"
                min="1000"
                step="10000"
                required
                value={pricePerHead}
                onChange={e => setPricePerHead(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Auto calculated total */}
          <div className="p-3 bg-slate-50 dark:bg-[#0A1411] border border-slate-200 dark:border-forest-900/50 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Umumiy hisoblangan qiymat:</span>
            <span className="font-black text-slate-900 dark:text-white text-sm">
              {(listingQuantity * pricePerHead).toLocaleString()} so'm
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Viloyat</label>
              <input
                type="text"
                required
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tuman / Joylashuv</label>
              <input
                type="text"
                required
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Aloqa uchun telefon</label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Aloqadagi shaxs</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tavsif va shartlar</label>
            <textarea
              rows={2}
              required
              placeholder="Chorva holati, emlash sertifikatlari, yetkazib berish..."
              value={listingDescription}
              onChange={e => setListingDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-forest-900/60">
            <button
              type="button"
              onClick={() => setIsCreateListingModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-forest-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/50 rounded-xl text-xs font-bold transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={listingQuantity > selectedGroupStock.free || selectedGroupStock.free === 0}
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              E'lonni chop etish
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Buy Request */}
      <Modal
        isOpen={isCreateRequestModalOpen}
        onClose={() => setIsCreateRequestModalOpen(false)}
        title="Chorva Sotib Olish Uchun So'rov Joylashtirish"
        subtitle="Boshqa fermerlar so'rovingizni ko'rib, taklif yuborishlari mumkin"
        maxWidth="md"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Hayvon turi</label>
              <select
                value={reqSpecies}
                onChange={e => setReqSpecies(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              >
                <option value="Qo'y">Qo'y</option>
                <option value="Qoramol">Qoramol</option>
                <option value="Echki">Echki</option>
                <option value="Ot">Ot</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Zoti (ixtiyoriy)</label>
              <input
                type="text"
                placeholder="Masalan: Hisori"
                value={reqBreed}
                onChange={e => setReqBreed(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kerakli miqdor (bosh)</label>
              <input
                type="number"
                min="1"
                required
                value={reqQuantity}
                onChange={e => setReqQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Boshiga budjet (so'm)</label>
              <input
                type="number"
                min="1000"
                step="50000"
                required
                value={reqBudget}
                onChange={e => setReqBudget(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Yetkazib berish sharti</label>
              <select
                value={reqDelivery}
                onChange={e => setReqDelivery(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              >
                <option value="yetkazib_berish">Fermamizga yetkazib berish</option>
                <option value="olib_ketish">O'zimiz olib ketamiz</option>
                <option value="kelishilgan">Kelishilgan holda</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kerakli sana</label>
              <input
                type="date"
                required
                value={reqNeededBy}
                onChange={e => setReqNeededBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Viloyat</label>
              <input
                type="text"
                required
                value={reqRegion}
                onChange={e => setReqRegion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tuman / Joylashuv</label>
              <input
                type="text"
                required
                value={reqDistrict}
                onChange={e => setReqDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bog'lanish uchun telefon</label>
            <input
              type="text"
              required
              value={reqPhone}
              onChange={e => setReqPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Maxsus talablar (ixtiyoriy)</label>
            <textarea
              rows={2}
              placeholder="Masalan: Tirik vazni kamida 45 kg, sog'lom qo'chqorlar..."
              value={reqNotes}
              onChange={e => setReqNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-forest-900/60">
            <button
              type="button"
              onClick={() => setIsCreateRequestModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-forest-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/50 rounded-xl text-xs font-bold transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              So'rovni joylashtirish
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Send Offer to Request */}
      <Modal
        isOpen={Boolean(selectedRequestForOffer)}
        onClose={() => setSelectedRequestForOffer(null)}
        title="Xaridorga Taklif Yuborish"
        subtitle={selectedRequestForOffer ? `${selectedRequestForOffer.requested_quantity} bosh ${selectedRequestForOffer.species} uchun taklif` : ''}
        maxWidth="md"
      >
        <form onSubmit={handleSubmitOffer} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Taklif etilayotgan soni (bosh)</label>
              <input
                type="number"
                min="1"
                required
                value={offeredQuantity}
                onChange={e => setOfferedQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bir bosh narxi (so'm)</label>
              <input
                type="number"
                min="1000"
                step="50000"
                required
                value={offeredPrice}
                onChange={e => setOfferedPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Aloqa uchun telefon</label>
            <input
              type="text"
              required
              value={offerPhone}
              onChange={e => setOfferPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Qo'shimcha taklif izohi</label>
            <textarea
              rows={2}
              placeholder="Yetkazib berish imkoniyati yoki chorva sifatiga kafolat..."
              value={offerNotes}
              onChange={e => setOfferNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-forest-900/60">
            <button
              type="button"
              onClick={() => setSelectedRequestForOffer(null)}
              className="px-4 py-2 border border-slate-200 dark:border-forest-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/50 rounded-xl text-xs font-bold transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Taklifni yuborish
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Close / Cancel Listing Confirmation */}
      <Modal
        isOpen={Boolean(listingToClose)}
        onClose={() => setListingToClose(null)}
        title="E'lonni Yakunlash"
        subtitle={listingToClose ? `${listingToClose.breed} ${listingToClose.species} — Qolgan: ${listingToClose.remaining_quantity} bosh` : ''}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-900 dark:text-amber-200">
            <strong>Diqqat:</strong> E'lonni yakunlagandan so'ng, qolgan band qilingan chorva ({listingToClose?.remaining_quantity} bosh) avtomatik ravishda erkin zaxiraga qaytariladi.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Yakunlash sababi</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setClosingReason('sold')}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                  closingReason === 'sold'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                    : 'bg-white dark:bg-[#0B1713] border-slate-200 dark:border-forest-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/50'
                }`}
              >
                <DollarSign className="w-4 h-4 mb-1" />
                Sotildi
                <p className="text-[10px] font-normal mt-0.5 opacity-70">Chorva boshqa yo'l bilan sotildi</p>
              </button>
              <button
                onClick={() => setClosingReason('cancelled')}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                  closingReason === 'cancelled'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 text-rose-800 dark:text-rose-300'
                    : 'bg-white dark:bg-[#0B1713] border-slate-200 dark:border-forest-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/50'
                }`}
              >
                <XCircle className="w-4 h-4 mb-1" />
                Bekor qilish
                <p className="text-[10px] font-normal mt-0.5 opacity-70">E'lonni bekor qilmoqchiman</p>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-forest-900/60">
            <button
              onClick={() => setListingToClose(null)}
              className="px-4 py-2 border border-slate-200 dark:border-forest-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/50 rounded-xl text-xs font-bold transition"
            >
              Ortga
            </button>
            <button
              onClick={handleCloseListing}
              className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition shadow-sm ${
                closingReason === 'sold'
                  ? 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600'
                  : 'bg-rose-700 hover:bg-rose-800 dark:bg-rose-700 dark:hover:bg-rose-600'
              }`}
            >
              {closingReason === 'sold' ? "Ha, sotildi deb belgilash" : "Ha, bekor qilish"}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
