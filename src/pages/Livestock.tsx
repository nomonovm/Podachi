import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { backendEngine } from '../lib/backendEngine';
import {
  Layers,
  Plus,
  ArrowRightLeft,
  ShoppingBag,
  MapPin,
  HeartPulse,
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { AnimalGroup, MovementType } from '../types';

export const Livestock: React.FC = () => {
  const { state, currentFarm, currentRole, showToast, setActiveTab } = useApp();

  const farmId = currentFarm?.id;
  const groups = state.animalGroups.filter(g => g.farm_id === farmId);
  const catalog = state.animalCatalog;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedGroupForMovement, setSelectedGroupForMovement] = useState<AnimalGroup | null>(null);

  // Filter state
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<string>('all');

  // Form states for new group
  const [species, setSpecies] = useState(catalog[0]?.species || "Qo'y");
  const [breed, setBreed] = useState(catalog[0]?.breeds[0] || 'Hisori');
  const [genderType, setGenderType] = useState<AnimalGroup['gender_type']>('aralash');
  const [ageGroup, setAgeGroup] = useState<AnimalGroup['age_group']>('O\'rtacha (boqilayotgan/naslli)');
  const [initialCount, setInitialCount] = useState<number>(50);
  const [averageWeight, setAverageWeight] = useState<number>(65);
  const [penLocation, setPenLocation] = useState<string>('1-sonli yaylov qo\'rasi');
  const [healthStatus, setHealthStatus] = useState<AnimalGroup['health_status']>('a\'lo');
  const [notes, setNotes] = useState<string>('');

  // Form states for movement
  const [movementType, setMovementType] = useState<MovementType>('birth');
  const [movementCount, setMovementCount] = useState<number>(10);
  const [movementReason, setMovementReason] = useState<string>('Bahorgi mavsumiy tug\'ilish');
  const [movementNotes, setMovementNotes] = useState<string>('');

  // Update breed choices when species changes
  const handleSpeciesChange = (newSpecies: string) => {
    setSpecies(newSpecies);
    const catItem = catalog.find(c => c.species === newSpecies);
    if (catItem && catItem.breeds.length > 0) {
      setBreed(catItem.breeds[0]);
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      backendEngine.addAnimalGroup({
        species,
        breed,
        gender_type: genderType,
        age_group: ageGroup,
        initial_head_count: Number(initialCount),
        average_weight_kg: Number(averageWeight) || undefined,
        pen_location: penLocation,
        health_status: healthStatus,
        notes,
      });
      showToast(`Yangi chorva guruhi qo'shildi: ${initialCount} bosh ${species} (${breed})`, 'success');
      setIsAddModalOpen(false);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRecordMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupForMovement) return;

    try {
      // Determine delta sign
      // Kirimlar: purchase, birth, transfer_in
      // Chiqimlar: sale, death, transfer_out
      const isPositive = ['purchase', 'birth', 'transfer_in'].includes(movementType);
      const isNegative = ['sale', 'death', 'transfer_out'].includes(movementType);

      let delta = Number(movementCount);
      if (isNegative) delta = -Math.abs(delta);
      if (isPositive) delta = Math.abs(delta);

      backendEngine.recordAnimalMovement({
        group_id: selectedGroupForMovement.id,
        movement_type: movementType,
        delta_count: delta,
        reason: movementReason,
        notes: movementNotes,
      });

      showToast(`Chorva harakati muvaffaqiyatli qayd etildi`, 'success');
      setIsMovementModalOpen(false);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const openMovementForGroup = (group: AnimalGroup) => {
    setSelectedGroupForMovement(group);
    setIsMovementModalOpen(true);
  };

  const filteredGroups = selectedSpeciesFilter === 'all'
    ? groups
    : groups.filter(g => g.species === selectedSpeciesFilter);

  const canManage = currentRole === 'admin' || currentRole === 'manager';

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Chorva Hisobi (Guruhlar bo'yicha)</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Har bir guruhning bosh soni, bozordagi bandlik holati va erkin qoldig'i
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canManage && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Yangi guruh qo'shish
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedSpeciesFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
            selectedSpeciesFilter === 'all'
              ? 'bg-forest-800 dark:bg-forest-700 text-white shadow-xs'
              : 'bg-white dark:bg-[#0E1A16] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-forest-900/40'
          }`}
        >
          Barchasi ({groups.length})
        </button>
        {Array.from(new Set(groups.map(g => g.species))).map(sp => (
          <button
            key={sp}
            onClick={() => setSelectedSpeciesFilter(sp)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              selectedSpeciesFilter === sp
                ? 'bg-forest-800 dark:bg-forest-700 text-white shadow-xs'
                : 'bg-white dark:bg-[#0E1A16] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-forest-900/40'
            }`}
          >
            {sp} ({groups.filter(g => g.species === sp).length})
          </button>
        ))}
      </div>

      {/* Group Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filteredGroups.map(group => {
          const stock = backendEngine.getGroupStockInfo(group.id);
          const reservedPercent = stock.total > 0 ? (stock.reserved / stock.total) * 100 : 0;

          return (
            <div
              key={group.id}
              className="bg-white dark:bg-[#0E1A16] rounded-2xl p-5 border border-slate-200/90 dark:border-forest-900/40 shadow-sm hover:shadow-md transition space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {group.breed} {group.species}
                    </h3>
                    <Badge variant="forest">{group.gender_type}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{group.age_group}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{stock.total}</span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">bosh</span>
                </div>
              </div>

              {/* Stock breakdown bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  <span className="text-forest-800 dark:text-forest-300 font-bold">Erkin mavjud: {stock.free} bosh</span>
                  <span className="text-amber-800 dark:text-amber-400 font-bold">Bozorda band: {stock.reserved} bosh</span>
                </div>
                <div className="w-full h-3 bg-forest-100 dark:bg-forest-950/80 rounded-full overflow-hidden flex">
                  <div
                    className="bg-forest-600 dark:bg-forest-500 h-full transition-all duration-300"
                    style={{ width: `${100 - reservedPercent}%` }}
                    title={`Erkin: ${stock.free} bosh`}
                  />
                  <div
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{ width: `${reservedPercent}%` }}
                    title={`Band: ${stock.reserved} bosh`}
                  />
                </div>
              </div>

              {/* Details & Location */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{group.pen_location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <HeartPulse className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Holati: <strong className="capitalize text-slate-800 dark:text-slate-200">{group.health_status}</strong></span>
                </div>
                {group.average_weight_kg && (
                  <div className="text-slate-500 dark:text-slate-400">
                    O'rtacha vazn: <strong className="text-slate-800 dark:text-slate-200">{group.average_weight_kg} kg</strong>
                  </div>
                )}
                <div className="text-slate-500 dark:text-slate-400">
                  Boshlang'ich son: <strong className="text-slate-800 dark:text-slate-200">{group.initial_head_count} bosh</strong>
                </div>
              </div>

              {group.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl">
                  "{group.notes}"
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {canManage && (
                  <button
                    onClick={() => openMovementForGroup(group)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Harakat qayd etish
                  </button>
                )}
                {stock.free > 0 && canManage && (
                  <button
                    onClick={() => setActiveTab('marketplace')}
                    className="flex-1 py-2 bg-forest-50 dark:bg-forest-950 hover:bg-forest-100 dark:hover:bg-forest-900 text-forest-800 dark:text-forest-300 border border-forest-200 dark:border-forest-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Bozorga chiqarish
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-12 text-center border border-slate-200 dark:border-white/10">
          <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Ushbu fermada chorva guruhlari mavjud emas</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Ferma faoliyatini boshlash uchun "Yangi guruh qo'shish" tugmasini bosing.
          </p>
        </div>
      )}

      {/* Modal: Create Animal Group */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Yangi Chorva Guruhini Ro'yxatga Olish"
        subtitle="Individual belgi (tag) shart emas — faqat guruh va bosh soni ko'rsatiladi"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Hayvon turi</label>
              <select
                value={species}
                onChange={e => handleSpeciesChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#14231E] text-slate-900 dark:text-white"
              >
                {catalog.map(c => (
                  <option key={c.id} value={c.species}>
                    {c.species} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Zoti</label>
              <select
                value={breed}
                onChange={e => setBreed(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#14231E] text-slate-900 dark:text-white"
              >
                {catalog
                  .find(c => c.species === species)
                  ?.breeds.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jinsi / Tarkibi</label>
              <select
                value={genderType}
                onChange={e => setGenderType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#14231E] text-slate-900 dark:text-white"
              >
                <option value="aralash">Aralash suruv / poda</option>
                <option value="erkak">Faqat erkak (qo'chqor/buqa/ayg'ir)</option>
                <option value="urg'ochi">Faqat urg'ochi (sovliq/sigir/biya)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Yosh toifasi</label>
              <select
                value={ageGroup}
                onChange={e => setAgeGroup(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#14231E] text-slate-900 dark:text-white"
              >
                <option value="Yosh (qo'zichoq/buzoq/jo'ja)">Yosh (qo'zichoq / buzoq / jo'ja)</option>
                <option value="O'rtacha (boqilayotgan/naslli)">O'rtacha (boqilayotgan / naslli)</option>
                <option value="Katta (yetuk chorva)">Katta (yetuk chorva)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bosh soni (musbat)</label>
              <input
                type="number"
                min="1"
                required
                value={initialCount}
                onChange={e => setInitialCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#14231E] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">O'rtacha vazn (kg)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={averageWeight}
                onChange={e => setAverageWeight(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#14231E] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sog'liq holati</label>
              <select
                value={healthStatus}
                onChange={e => setHealthStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#14231E] text-slate-900 dark:text-white"
              >
                <option value="a'lo">A'lo</option>
                <option value="yaxshi">Yaxshi</option>
                <option value="parvarishda">Parvarishda</option>
                <option value="karantin">Karantin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Saqlash joyi / Qo'ra</label>
            <input
              type="text"
              required
              placeholder="Masalan: 1-sonli Janubiy yaylov qo'rasi"
              value={penLocation}
              onChange={e => setPenLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#14231E] text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Qo'shimcha izoh (ixtiyoriy)</label>
            <textarea
              rows={2}
              placeholder="Guruh xususiyatlari, ozuqa rejasi yoki nasl guvohnomasi..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#14231E] text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-xs font-bold transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Guruhni saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Record Livestock Movement */}
      <Modal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        title="Chorva Harakatini Qayd Etish"
        subtitle={
          selectedGroupForMovement
            ? `${selectedGroupForMovement.breed} ${selectedGroupForMovement.species} (Mavjud: ${selectedGroupForMovement.current_head_count} bosh)`
            : ''
        }
        maxWidth="md"
      >
        <form onSubmit={handleRecordMovement} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Operatsiya turi</label>
            <select
              value={movementType}
              onChange={e => setMovementType(e.target.value as MovementType)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#14231E] text-slate-900 dark:text-white"
            >
              <optgroup label="Kirimlar (+)">
                <option value="birth">Tug'ilish (yangi nasl)</option>
                <option value="purchase">Sotib olish (tashqaridan kirim)</option>
                <option value="transfer_in">Boshqa fermadan qabul qilish</option>
              </optgroup>
              <optgroup label="Chiqimlar (-)">
                <option value="death">O'lim / Talafot</option>
                <option value="sale">To'g'ridan-to'g'ri sotuv</option>
                <option value="transfer_out">Boshqa fermaga berish</option>
              </optgroup>
              <optgroup label="Tuzatishlar">
                <option value="inventory_correction">Inventarizatsiya tuzatishi</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bosh soni (musbat qiymat kiriting)</label>
            <input
              type="number"
              min="1"
              required
              value={movementCount}
              onChange={e => setMovementCount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#14231E] text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sababi / Asos</label>
            <input
              type="text"
              required
              placeholder="Masalan: Bahorgi tug'ruq mavsumi yoki kasallik sababli nobud bo'lish"
              value={movementReason}
              onChange={e => setMovementReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#14231E] text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Izoh (ixtiyoriy)</label>
            <textarea
              rows={2}
              placeholder="Veterinar xulosasi yoki dalolatnoma raqami..."
              value={movementNotes}
              onChange={e => setMovementNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#14231E] text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsMovementModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-xs font-bold transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Operatsiyani tasdiqlash
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
