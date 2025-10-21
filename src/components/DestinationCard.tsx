import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, MapPin } from 'lucide-react';
import { useState } from 'react';
import type { DestinationWithNotes, Category, Theme } from '../types';

type DestinationCardProps = {
  destination: DestinationWithNotes;
  onClose: () => void;
  onAddNote: (content: string, moodTags: string[], imageUrl?: string | null) => void;
  onDeleteNote: (noteId: string) => void;
  onDeleteDestination: () => void;
  theme: Theme;
};

const categoryLabels: Record<Category, string> = {
  dream: '✨ Dream',
  visited: '✓ Visited',
  planning: '📍 Planning',
};

const categoryColors: Record<Category, string> = {
  dream: 'bg-purple-100 text-purple-700 border-purple-200',
  visited: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  planning: 'bg-amber-100 text-amber-700 border-amber-200',
};

const moodOptions = ['Nature', 'Culture', 'Food', 'Adventure', 'Romance', 'Relaxing'];

export function DestinationCard({
  destination,
  onClose,
  onAddNote,
  onDeleteNote,
  onDeleteDestination,
  theme,
}: DestinationCardProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [rating, setRating] = useState<number>(0);

  const handleSubmitNote = () => {
    if (noteContent.trim()) {
      onAddNote(noteContent, selectedMoods, imageUrl.trim() || null);
      setNoteContent('');
      setSelectedMoods([]);
      setImageUrl('');
      setRating(0);
      setIsAddingNote(false);
    }
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`w-full max-w-md shadow-2xl overflow-hidden relative ${
        theme === 'dark' ? 'bg-gray-900/85' : theme === 'sunset' ? 'bg-gradient-to-br from-orange-50/85 to-pink-50/85' : 'bg-white/85'
      } backdrop-blur-xl border ${theme === 'dark' ? 'border-gray-700' : 'border-white/60'} rounded-r-3xl
      `}
    >
      {/* Spiral binding bar */}
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-b from-gray-200/70 to-gray-300/70 border-r border-white/40" />
      {/* Coil holes */}
      <div className="absolute left-3 top-6 bottom-6 w-6 pointer-events-none">
        <div className="h-full w-full bg-[radial-gradient(circle_at_6px_10px,rgba(55,65,81,0.9)_4px,transparent_5px)] bg-[length:12px_28px]" />
      </div>
      <div className="pl-16 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <h2
                className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {destination.name}
              </h2>
            </div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
                categoryColors[destination.category]
              }`}
            >
              {categoryLabels[destination.category]}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onDeleteDestination}
              className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
              aria-label="Delete destination"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-800 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          <AnimatePresence>
            {destination.notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-4 rounded-2xl shadow-sm ${
                  theme === 'dark'
                    ? 'bg-gray-800/60'
                    : theme === 'sunset'
                    ? 'bg-white/60'
                    : 'bg-gray-50/60'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p
                    className={`flex-1 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    {note.content}
                  </p>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {note.image_url && (
                  <div className="mb-2">
                    <img src={note.image_url} alt="Note" className="w-full h-auto rounded-xl border border-white/20" />
                  </div>
                )}
                {note.mood_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {note.mood_tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs px-2 py-1 rounded-full ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-white text-gray-600'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {destination.notes.length === 0 && !isAddingNote && (
            <p
              className={`text-center py-8 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              No notes yet. Add your first memory!
            </p>
          )}
        </div>

        <AnimatePresence>
          {isAddingNote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your thoughts, memories, or plans..."
                className={`w-full p-3 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
                rows={3}
              />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL (optional)"
                className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
              <div className="flex items-center gap-2">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Rating:</span>
                {[1,2,3,4,5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                      n <= rating ? 'bg-yellow-400 text-white border-yellow-300' : theme === 'dark' ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                    aria-label={`Rate ${n} star`}
                  >
                    {n <= rating ? '★' : '☆'}
                  </button>
                ))}
              </div>
              <div>
                <p
                  className={`text-sm mb-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Mood tags:
                </p>
                <div className="flex flex-wrap gap-2">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => toggleMood(mood)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        selectedMoods.includes(mood)
                          ? 'bg-blue-500 text-white'
                          : theme === 'dark'
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitNote}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition-colors font-medium"
                >
                  Save Note
                </button>
                <button
                  onClick={() => {
                    setIsAddingNote(false);
                    setNoteContent('');
                    setSelectedMoods([]);
                  }}
                  className={`px-4 py-2 rounded-xl transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isAddingNote && (
          <button
            onClick={() => setIsAddingNote(true)}
            className="w-full mt-4 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Note
          </button>
        )}
      </div>
    </motion.div>
  );
}
