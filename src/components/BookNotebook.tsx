import { useMemo, useRef, useState } from 'react';
import type { DestinationWithNotes, Theme } from '../types';

type BookNotebookProps = {
  destinations: DestinationWithNotes[];
  onAddNote: (content: string, moodTags: string[], imageUrl?: string | null) => void;
  onDeleteNote: (noteId: string) => void;
  theme: Theme;
};

// Very lightweight page-flip illusion using CSS 3D transforms
export function BookNotebook({ destinations, onAddNote, onDeleteNote, theme }: BookNotebookProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [moods, setMoods] = useState<string[]>([]);
  const [selectedDestId, setSelectedDestId] = useState<string | null>(destinations[0]?.id || null);

  const pages = useMemo(() => {
    const all = destinations.flatMap((d) => d.notes.map((n) => ({ ...n, destName: d.name })));
    return all;
  }, [destinations]);

  const bg = theme === 'dark' ? 'bg-gray-900/70 border-gray-800' : 'bg-white/90 border-white/60';

  const prev = () => setPageIndex((i) => Math.max(0, i - 1));
  const next = () => setPageIndex((i) => Math.min(pages.length - 1, i + 1));

  const save = () => {
    if (!selectedDestId || !content.trim()) return;
    onAddNote(content, moods, imageUrl.trim() || null);
    setContent(''); setImageUrl(''); setMoods([]);
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className={`relative w-[900px] max-w-full h-[600px] max-h-[70vh] perspective-[2000px] rounded-3xl shadow-2xl border ${bg}`}>
        {/* Book spine */}
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-b from-gray-200/70 to-gray-300/70 border-r border-white/40 rounded-l-3xl" />
        {/* Page area */}
        <div className="absolute inset-y-0 left-10 right-0 grid grid-cols-2">
          {/* Left page: reader */}
          <div className={`p-6 overflow-hidden ${theme === 'dark' ? 'bg-gray-900/80' : 'bg-white/95'} border-r ${theme === 'dark' ? 'border-gray-800' : 'border-white/60'} rounded-l-3xl`}
            style={{ transform: 'rotateY(0deg)', transformStyle: 'preserve-3d' }}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={prev} className="px-3 py-1.5 rounded-lg bg-gray-200/70 hover:bg-gray-300 text-gray-800 text-sm disabled:opacity-40" disabled={pageIndex === 0}>Prev</button>
              <div className="text-sm text-gray-500">{pages.length ? pageIndex + 1 : 0} / {pages.length}</div>
              <button onClick={next} className="px-3 py-1.5 rounded-lg bg-gray-200/70 hover:bg-gray-300 text-gray-800 text-sm disabled:opacity-40" disabled={pageIndex >= pages.length - 1}>Next</button>
            </div>
            <div className="h-full overflow-auto pr-2">
              {pages.length === 0 && <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>No notes yet.</p>}
              {pages[pageIndex] && (
                <div>
                  <h3 className="text-xl font-bold mb-2">{pages[pageIndex].destName}</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{pages[pageIndex].content}</p>
                  {pages[pageIndex].image_url && (
                    <img src={pages[pageIndex].image_url} className="mt-3 w-full h-auto rounded-xl border border-white/20" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right page: editor */}
          <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900/80' : 'bg-white/95'} rounded-r-3xl`} style={{ transformStyle: 'preserve-3d' }}>
            <div className="grid grid-cols-1 md:grid-cols-[1fr,220px] gap-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a new page..."
                className={`w-full p-3 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
                rows={8}
              />
              <div>
                <select value={selectedDestId ?? ''} onChange={(e) => setSelectedDestId(e.target.value)} className={`w-full p-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                  <option value="" disabled>Select destination</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL (optional)" className={`mt-2 w-full p-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`} />
                <div className="mt-2 flex gap-2">
                  {['Nature','Culture','Food','Adventure','Romance','Relaxing'].map((m) => (
                    <button key={m} onClick={() => setMoods((prev) => prev.includes(m) ? prev.filter((x)=>x!==m) : [...prev, m])} className={`px-3 py-1 rounded-full text-sm ${moods.includes(m) ? 'bg-blue-600 text-white' : theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{m}</button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={save} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium">Save</button>
                  <button onClick={() => { setContent(''); setImageUrl(''); setMoods([]); }} className={`${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} px-4 py-2 rounded-xl`}>Clear</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



