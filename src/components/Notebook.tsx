import { useMemo, useState } from 'react';
import type { DestinationWithNotes, Theme } from '../types';

type NotebookProps = {
  destinations: DestinationWithNotes[];
  onAddNote: (content: string, moodTags: string[], imageUrl?: string | null) => void;
  onDeleteNote: (noteId: string) => void;
  theme: Theme;
  onBack?: () => void;
};

export function Notebook({ destinations, onAddNote, onDeleteNote, theme, onBack }: NotebookProps) {
  const [query, setQuery] = useState('');
  const [selectedDestId, setSelectedDestId] = useState<string | null>(destinations[0]?.id || null);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [moods, setMoods] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return destinations.map((d) => ({
      ...d,
      notes: d.notes.filter((n) => n.content.toLowerCase().includes(q)),
    }));
  }, [destinations, query]);

  const selectedDestination = useMemo(() => destinations.find((d) => d.id === selectedDestId) || null, [destinations, selectedDestId]);

  const bg = theme === 'dark' ? 'bg-gray-900/60 border border-gray-800' : 'bg-white/80 border border-white/60';
  const text = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const muted = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  const moodOptions = ['Nature', 'Culture', 'Food', 'Adventure', 'Romance', 'Relaxing'];

  const toggleMood = (m: string) => setMoods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const handleSave = () => {
    if (!selectedDestination || !content.trim()) return;
    onAddNote(content, moods, imageUrl.trim() || null);
    setContent('');
    setImageUrl('');
    setMoods([]);
  };

  return (
    <div className={`w-full h-full grid grid-cols-1 lg:grid-cols-[320px,1fr] ${bg} rounded-3xl overflow-hidden`}> 
      {/* Sidebar */}
      <div className={`h-full border-r ${theme === 'dark' ? 'border-gray-800' : 'border-white/60'} flex flex-col`}> 
        <div className="p-4 flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-100'}`}>Back</button>
          )}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            className={`flex-1 px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-400 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {destinations.length === 0 && (
            <p className={`px-4 ${muted}`}>No destinations yet.</p>
          )}
          {destinations.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDestId(d.id)}
              className={`w-full text-left px-4 py-2 rounded-lg ${selectedDestId === d.id ? 'bg-blue-600 text-white' : theme === 'dark' ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-100 text-gray-800'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{d.name}</span>
                <span className={`text-xs ${selectedDestId === d.id ? 'text-white/80' : muted}`}>{d.notes.length}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor and notes list */}
      <div className="h-full grid grid-rows-[auto,1fr]">
        {/* Editor */}
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-white/60'}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-lg font-semibold ${text}`}>Notebook</h3>
            <div className="flex gap-2">
              <button onClick={handleSave} className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">Save</button>
              <button onClick={() => { setContent(''); setImageUrl(''); setMoods([]); }} className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-100'}`}>Clear</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr,240px] gap-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={selectedDestination ? `Write about ${selectedDestination.name}...` : 'Select a destination to write notes'}
              className={`w-full p-3 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
              rows={5}
            />
            <div>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL (optional)"
                className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
              />
              <p className={`mt-3 text-sm ${muted}`}>Mood tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {moodOptions.map((m) => (
                  <button
                    key={m}
                    onClick={() => toggleMood(m)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${moods.includes(m) ? 'bg-blue-600 text-white' : theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notes list */}
        <div className="p-4 overflow-y-auto space-y-3">
          {!selectedDestination && <p className={muted}>Select a destination from the left.</p>}
          {selectedDestination && selectedDestination.notes.map((n) => (
            <div key={n.id} className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-800/60 border-gray-700' : 'bg-white/70 border-white/60'}`}>
              <div className="flex items-start justify-between gap-3">
                <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} text-sm flex-1`}>{n.content}</p>
                <button onClick={() => onDeleteNote(n.id)} className={`text-xs ${theme === 'dark' ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}>Delete</button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs ${muted}`}>{new Date(n.created_at).toLocaleString()}</span>
                {n.mood_tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {n.mood_tags.map((t) => (
                      <span key={t} className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
              {n.image_url && (
                <div className="mt-2">
                  <img src={n.image_url} alt="attachment" className="w-full h-auto rounded-lg border border-white/20" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



