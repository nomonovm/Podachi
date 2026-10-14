import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { backendEngine } from '../lib/backendEngine';
import { BookOpen, Plus, Search, Tag, Sparkles } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';

export const AnimalCatalog: React.FC = () => {
  const { state, currentRole, showToast } = useApp();
  const catalog = state.animalCatalog;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddBreedModalOpen, setIsAddBreedModalOpen] = useState(false);

  const [targetSpecies, setTargetSpecies] = useState(catalog[0]?.species || "Qo'y");
  const [newBreedName, setNewBreedName] = useState('');

  const canAdd = currentRole === 'admin' || currentRole === 'manager';

  const categories = ['all', 'Mayda tuyoqli', 'Yirik shoxli', 'Otsimon', 'Tuyasimon', 'Parranda', 'Boshqa'];

  const filteredCatalog = catalog.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.breeds.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAddBreed = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      backendEngine.addCustomBreed(targetSpecies, newBreedName);
      showToast(`'${targetSpecies}' turiga yangi '${newBreedName}' zoti qo'shildi`, 'success');
      setNewBreedName('');
      setIsAddBreedModalOpen(false);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Hayvonlar &amp; Zotlar Katalogi</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            O'zbekiston chorvachiligiga moslashtirilgan turlar va standartlashtirilgan zotlar reyestri
          </p>
        </div>

        {canAdd && (
          <button
            onClick={() => setIsAddBreedModalOpen(true)}
            className="px-4 py-2 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Yangi zot kiritish
          </button>
        )}
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Hayvon turi yoki zot nomini qidiring..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0E1A16] border border-slate-200 dark:border-forest-800/60 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-600"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-forest-800 dark:bg-forest-700 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0E1A16] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-forest-800/60 hover:bg-slate-50 dark:hover:bg-forest-900/50'
              }`}
            >
              {cat === 'all' ? 'Barcha toifalar' : cat}
            </button>
          ))}
        </div>

      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCatalog.map(item => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#0E1A16] rounded-2xl p-5 border border-slate-200/90 dark:border-forest-800/40 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-forest-700 dark:text-emerald-400 bg-forest-50 dark:bg-forest-950/60 px-2.5 py-1 rounded-lg border border-forest-100 dark:border-forest-800/50">
                  {item.category}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {item.breeds.length} ta zot
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{item.species}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{item.description}</p>

              {/* Breeds List */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Ro'yxatdagi zotlar:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.breeds.map(b => (
                    <span
                      key={b}
                      className="text-xs px-2.5 py-1 bg-slate-50 dark:bg-[#0A1411] border border-slate-200 dark:border-forest-900/60 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {canAdd && (
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-forest-900/60">
                <button
                  onClick={() => {
                    setTargetSpecies(item.species);
                    setIsAddBreedModalOpen(true);
                  }}
                  className="w-full py-2 bg-slate-50 dark:bg-[#0A1411] hover:bg-forest-50 dark:hover:bg-forest-900/40 hover:text-forest-800 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-transparent dark:border-forest-900/50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ushbu turga zot qo'shish
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal: Add Custom Breed */}
      <Modal
        isOpen={isAddBreedModalOpen}
        onClose={() => setIsAddBreedModalOpen(false)}
        title="Katalogga Yangi Zot Qo'shish"
        subtitle="Administrator yoki menejer tomonidan katalog kengaytirilishi"
        maxWidth="md"
      >
        <form onSubmit={handleAddBreed} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Hayvon turi</label>
            <select
              value={targetSpecies}
              onChange={e => setTargetSpecies(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
            >
              {catalog.map(c => (
                <option key={c.id} value={c.species}>
                  {c.species} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Yangi zot nomi</label>
            <input
              type="text"
              required
              placeholder="Masalan: Romanov yoki Boer"
              value={newBreedName}
              onChange={e => setNewBreedName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-forest-800/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-forest-900/60">
            <button
              type="button"
              onClick={() => setIsAddBreedModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-forest-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-forest-900/50 rounded-xl text-xs font-bold transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Zotni saqlash
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
