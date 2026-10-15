import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { backendEngine } from '../lib/backendEngine';
import { Stethoscope, Plus, Calendar, CheckCircle2, AlertCircle, Clock, Pill, RotateCw } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { VeterinaryRecord } from '../types';

export const Veterinary: React.FC = () => {
  const { state, currentFarm, currentRole, showToast } = useApp();
  const farmId = currentFarm?.id;

  const records = state.vetRecords.filter(v => v.farm_id === farmId);
  const groups = state.animalGroups.filter(g => g.farm_id === farmId);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // Form state
  const [groupId, setGroupId] = useState(groups[0]?.id || '');
  const [recordType, setRecordType] = useState<VeterinaryRecord['record_type']>('emlash');
  const [title, setTitle] = useState('');
  const [headsTreated, setHeadsTreated] = useState<number>(50);
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [nextCheckupDate, setNextCheckupDate] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<VeterinaryRecord['status']>('bajarildi');

  const canManage = ['admin', 'manager', 'veterinarian'].includes(currentRole);

  const handleRunAutoVet = () => {
    try {
      const added = backendEngine.runAutomatedVeterinaryCheck();
      showToast(`Avtomatik veterinariya qaydlari muvaffaqiyatli kiritildi (${added.length} ta tadbir Dr. Jamshid Zokirov nomidan)`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) {
      showToast('Iltimos, chorva guruhini tanlang', 'error');
      return;
    }

    try {
      backendEngine.addVeterinaryRecord({
        group_id: groupId,
        record_type: recordType,
        title,
        heads_treated: Number(headsTreated),
        medicine_name: medicineName || undefined,
        dosage: dosage || undefined,
        next_checkup_date: nextCheckupDate || undefined,
        notes: notes || undefined,
        status,
      });

      showToast('Veterinariya qaydi saqlandi', 'success');
      setIsAddModalOpen(false);
      setTitle('');
      setMedicineName('');
      setDosage('');
      setNotes('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const filteredRecords = records.filter(r => {
    if (filterType === 'all') return true;
    if (filterType === 'rejalashtirilgan') return r.status === 'rejalashtirilgan';
    return r.record_type === filterType;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Veterinariya &amp; Sog'liq Nazorati</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Emlashlar, profilaktik ko'riklar, muolajalar va rejalashtirilgan veterinariya tadbirlari
          </p>
        </div>

        {canManage && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRunAutoVet}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
              title="Dr. Jamshid Zokirov nomidan avtomatik rejali ko'riklar va muolajalarni amalga oshirish"
            >
              <RotateCw className="w-4 h-4" />
              Rejaviy Avto-Profilaktika
            </button>

            <button
              onClick={() => {
                if (groups.length === 0) {
                  showToast("Avval 'Chorva hisobi' bo'limida guruh qo'shing", 'error');
                  return;
                }
                setGroupId(groups[0]?.id || '');
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Veterinariya qaydi qo'shish
            </button>
          </div>
        )}
      </div>

      {/* Avto-Veterinariya Nazorati Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-850/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              Avtomatik Veterinariya & Emlash Nazorati (Faol)
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                Dr. Jamshid Zokirov
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Kunlik ferma sikli o'tkazilganda yoki profilaktika tugmasi bosilganda: barcha guruhlar ko'rikdan o'tkaziladi, rejali muolajalar avtomatik yoziladi va dori xarajatlari moliya jurnaliga qayd etiladi.
            </p>
          </div>
        </div>
        {canManage && (
          <button
            onClick={handleRunAutoVet}
            className="px-3.5 py-1.5 bg-white dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-750 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Profilaktikani Bajarish
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `Barchasi (${records.length})` },
          { id: 'emlash', label: 'Emlashlar' },
          { id: 'korik', label: 'Ko\'riklar' },
          { id: 'muolaja', label: 'Muolajalar' },
          { id: 'rejalashtirilgan', label: 'Rejalashtirilgan tadbirlar' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              filterType === tab.id
                ? 'bg-forest-800 dark:bg-forest-700 text-white shadow-xs'
                : 'bg-white dark:bg-[#0E1A16] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/50 border border-slate-200 dark:border-forest-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecords.map(rec => (
          <div
            key={rec.id}
            className="bg-white dark:bg-[#0E1A16] rounded-2xl p-5 border border-slate-200/90 dark:border-forest-800/40 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant={
                    rec.record_type === 'emlash'
                      ? 'emerald'
                      : rec.record_type === 'muolaja'
                      ? 'rose'
                      : 'forest'
                  }
                >
                  <span className="capitalize">{rec.record_type}</span>
                </Badge>
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{rec.date}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{rec.title}</h3>
              <p className="text-xs text-forest-800 dark:text-emerald-400 font-semibold mb-3">
                Guruh: {rec.group_info}
              </p>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0A1411] p-3 rounded-xl mb-3 border border-slate-100 dark:border-forest-900/50">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Muolaja qilingan bosh:</span>
                  <strong className="text-slate-900 dark:text-white">{rec.heads_treated} bosh</strong>
                </div>
                {rec.medicine_name && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Dori vositasi:</span>
                    <strong className="text-slate-900 dark:text-white">{rec.medicine_name}</strong>
                  </div>
                )}
                {rec.dosage && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Dozasi:</span>
                    <span className="text-slate-800 dark:text-slate-200">{rec.dosage}</span>
                  </div>
                )}
              </div>

              {rec.next_checkup_date && (
                <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/50 mb-2 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  Keyingi ko'rik: {rec.next_checkup_date}
                </div>
              )}

              {rec.notes && <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{rec.notes}"</p>}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-forest-900/50 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span>Mas'ul: {rec.veterinarian_name}</span>
              <span className="capitalize font-semibold text-emerald-700 dark:text-emerald-400">{rec.status}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="bg-white dark:bg-[#0E1A16] rounded-2xl p-12 text-center border border-slate-200 dark:border-forest-800/40">
          <Stethoscope className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Veterinariya qaydlari mavjud emas</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Yangi emlash yoki ko'rik qaydini qo'shish uchun tugmani bosing.
          </p>
        </div>
      )}

      {/* Modal: Add Vet Record */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Veterinariya Qaydini Kiritish"
        subtitle="Emlash, umumiy ko'rik yoki alohida muolajalar hisobi"
        maxWidth="lg"
      >
        <form onSubmit={handleAddRecord} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Chorva guruhi</label>
              <select
                value={groupId}
                onChange={e => setGroupId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.breed} {g.species} ({g.current_head_count} bosh mavjud)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tadbir turi</label>
              <select
                value={recordType}
                onChange={e => setRecordType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              >
                <option value="emlash">Emlash (vaktsinatsiya)</option>
                <option value="korik">Profilaktik ko'rik</option>
                <option value="muolaja">Muolaja / Davolash</option>
                <option value="dori_berish">Dori-darmon berish</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tadbir nomi / Maqsadi</label>
            <input
              type="text"
              required
              placeholder="Masalan: Qorason kasalligiga qarshi emlash"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Muolaja qilingan bosh</label>
              <input
                type="number"
                min="1"
                required
                value={headsTreated}
                onChange={e => setHeadsTreated(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dori vositasi</label>
              <input
                type="text"
                placeholder="Masalan: Antraks vaktsinasi"
                value={medicineName}
                onChange={e => setMedicineName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dozasi</label>
              <input
                type="text"
                placeholder="Masalan: 2 ml teri ostiga"
                value={dosage}
                onChange={e => setDosage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Keyingi ko'rik sanasi (ixtiyoriy)</label>
              <input
                type="date"
                value={nextCheckupDate}
                onChange={e => setNextCheckupDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Holati</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
              >
                <option value="bajarildi">Bajarildi</option>
                <option value="rejalashtirilgan">Kelgusiga rejalashtirilgan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Izoh va kuzatuvlar</label>
            <textarea
              rows={2}
              placeholder="Hayvonlarning muolajadan keyingi holati yoki maxsus parvarish ko'rsatmasi..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-forest-900/60">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-forest-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/50 rounded-xl text-xs font-bold transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Qaydni saqlash
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
