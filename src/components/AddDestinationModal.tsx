import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { reverseGeocodeCityStateCountry } from '../lib/geocoding';
import type { Category, Theme } from '../types';

type AddDestinationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, category: Category) => void;
  theme: Theme;
  // Optional prefilled coordinates for reverse geocoding
  coords?: { lat: number; lng: number } | null;
};

export function AddDestinationModal({ isOpen, onClose, onSubmit, theme, coords }: AddDestinationModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('planning');
  const [isLoadingName, setIsLoadingName] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name, category);
      setName('');
      setCategory('planning');
      onClose();
    }
  };

  useEffect(() => {
    let aborted = false;
    const prefill = async () => {
      if (!isOpen || !coords) return;
      setIsLoadingName(true);
      const res = await reverseGeocodeCityStateCountry(coords.lat, coords.lng);
      if (!aborted) {
        if (res?.formatted) setName(res.formatted);
        setIsLoadingName(false);
      }
    };
    prefill();
    return () => {
      aborted = true;
    };
  }, [isOpen, coords?.lat, coords?.lng]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[2001] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`w-full max-w-md rounded-3xl shadow-2xl p-6 ${
                theme === 'dark'
                  ? 'bg-gray-900/95 border-gray-700'
                  : theme === 'sunset'
                  ? 'bg-gradient-to-br from-orange-50/95 to-pink-50/95 border-white/40'
                  : 'bg-white/95 border-white/40'
              } backdrop-blur-xl border`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  New Destination
                </h2>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-full transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-800 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Destination Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Paris, France"
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['dream', 'planning', 'visited'] as Category[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`py-3 rounded-xl font-medium transition-all ${
                          category === cat
                            ? cat === 'dream'
                              ? 'bg-purple-500 text-white'
                              : cat === 'visited'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-500 text-white'
                            : theme === 'dark'
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cat === 'dream' ? '✨ Dream' : cat === 'visited' ? '✓ Visited' : '📍 Planning'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium mt-6"
                >
                  Add Destination
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
