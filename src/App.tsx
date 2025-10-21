import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Map as MapIcon } from 'lucide-react';
import { MapLibre3D } from './components/MapLibre3D';
import { BookNotebook } from './components/BookNotebook';
import { Dashboard } from './components/Dashboard';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { AmbientAudio } from './components/AmbientAudio';
import { DestinationCard } from './components/DestinationCard';
import { AddDestinationModal } from './components/AddDestinationModal';
import { ThemeSelector } from './components/ThemeSelector';
import { useDestinations } from './hooks/useDestinations';
import type { DestinationWithNotes, Category, Theme } from './types';

function App() {
  const {
    destinations,
    loading,
    addDestination,
    deleteDestination,
    addNote,
    deleteNote,
  } = useDestinations();

  const [selectedDestination, setSelectedDestination] = useState<DestinationWithNotes | null>(null);
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [theme, setTheme] = useState<Theme>('pastel');
  const [activeView, setActiveView] = useState<'dashboard' | 'map' | 'notes'>('dashboard');
  const [ambientOn, setAmbientOn] = useState<boolean>(false);
  const [ambientType, setAmbientType] = useState<'forest' | 'waves' | 'city'>('waves');

  const handleAddPin = (lat: number, lng: number) => {
    setPendingLocation({ lat, lng });
  };

  const handleSubmitDestination = async (name: string, category: Category) => {
    if (pendingLocation) {
      const newDest = await addDestination(
        name,
        pendingLocation.lat,
        pendingLocation.lng,
        category
      );
      setPendingLocation(null);
      if (newDest) {
        setSelectedDestination(newDest);
      }
    }
  };

  const handleAddNote = async (content: string, moodTags: string[], imageUrl?: string | null) => {
    if (!selectedDestination) return;
    const newNote = await addNote(selectedDestination.id, content, moodTags, imageUrl ?? null);
    if (newNote) {
      setSelectedDestination({ ...selectedDestination, notes: [newNote, ...selectedDestination.notes] });
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (selectedDestination) {
      deleteNote(selectedDestination.id, noteId);
    }
  };

  const handleDeleteDestination = () => {
    if (selectedDestination) {
      deleteDestination(selectedDestination.id);
      setSelectedDestination(null);
    }
  };

  const backgroundClass =
    theme === 'dark'
      ? 'bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-black'
      : theme === 'sunset'
      ? 'bg-gradient-to-br from-[#ffedd5] via-[#fce7f3] to-[#ede9fe]'
      : 'bg-gradient-to-br from-[#e0f2fe] via-[#e9d5ff] to-[#fde2e4]';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <MapIcon className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${backgroundClass} transition-colors duration-500`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-200/20 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-200/20 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 h-screen flex flex-col p-4 sm:p-6 lg:p-8 gap-4">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`backdrop-blur-md p-3 rounded-2xl shadow-glass ${theme === 'dark' ? 'bg-white/5' : 'bg-white/80'}`}>
              <MapIcon className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h1
                className={`text-3xl md:text-4xl font-extrabold tracking-tight ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Journey Map
              </h1>
              <p
                className={`text-sm md:text-base ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Pin your adventures, capture memories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView((v) => (v === 'dashboard' ? 'map' : 'dashboard'))}
              className={`px-3 py-2 rounded-full text-sm font-medium shadow-soft ${
                theme === 'dark' ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              title="Toggle Dashboard"
            >
              {activeView === 'dashboard' ? 'Map' : 'Dashboard'}
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setAmbientOn((v) => !v)}
                className={`px-4 py-2 rounded-full text-sm font-medium shadow-soft transition-all animate-pulse-on-hover ${
                  ambientOn 
                    ? theme === 'dark' 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                    : theme === 'dark' 
                      ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                title="Click to enable ambient sounds (requires user interaction)"
              >
                {ambientOn ? '🔊 Sound On' : '🔇 Sound Off'}
              </button>
              {ambientOn && (
                <select
                  value={ambientType}
                  onChange={(e) => setAmbientType(e.target.value as any)}
                  className={`px-3 py-2 rounded-full text-sm font-medium shadow-soft transition-all ${
                    theme === 'dark' ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <option value="waves">🌊 Waves</option>
                  <option value="forest">🌲 Forest</option>
                  <option value="city">🏙️ City</option>
                </select>
              )}
            </div>
            <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
          </div>
        </header>

        <div className={`flex-1 ${activeView === 'map' ? 'grid grid-cols-1 lg:grid-cols-[1fr,400px]' : ''} gap-4 min-h-0`}>
          <div className={`${activeView === 'map' ? '' : 'col-span-full'} h-full ${activeView === 'dashboard' ? '' : 'rounded-2xl overflow-hidden shadow-soft'} ${activeView === 'dashboard' ? '' : (theme === 'dark' ? 'bg-gray-900/50 backdrop-blur-md border border-gray-800' : 'bg-white/70 backdrop-blur-md border border-white/60')}`}>
            {activeView === 'dashboard' && (
              <Dashboard
                destinations={destinations}
                theme={theme}
                onNavigate={(target) => setActiveView(target)}
              />
            )}
            {activeView === 'map' && (
              <MapLibre3D
                destinations={destinations}
                onSelectDestination={setSelectedDestination}
                selectedDestination={selectedDestination}
                theme={theme}
                onAddPin={handleAddPin}
              />
            )}
            {activeView === 'notes' && (
              <BookNotebook
                destinations={destinations}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                theme={theme}
              />
            )}
          </div>

          {activeView === 'map' && (
            <AnimatePresence>
              {selectedDestination && (
                <div className={`w-full max-w-md ml-auto rounded-2xl shadow-soft overflow-hidden ${theme === 'dark' ? 'bg-gray-900/60 backdrop-blur-md border border-gray-800' : 'bg-white/80 backdrop-blur-md border border-white/60'}`}>
                  <DestinationCard
                    destination={selectedDestination}
                    onClose={() => setSelectedDestination(null)}
                    onAddNote={handleAddNote}
                    onDeleteNote={handleDeleteNote}
                    onDeleteDestination={handleDeleteDestination}
                    theme={theme}
                  />
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      <AddDestinationModal
        isOpen={pendingLocation !== null}
        onClose={() => setPendingLocation(null)}
        onSubmit={handleSubmitDestination}
        theme={theme}
        coords={pendingLocation ?? undefined}
      />
      {ambientOn && <AmbientAudio enabled={ambientOn} type={ambientType} />}
    </div>
  );
}

export default App;
