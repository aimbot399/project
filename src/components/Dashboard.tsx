import { AnalyticsPanel } from './AnalyticsPanel';
import type { DestinationWithNotes, Theme } from '../types';

type DashboardProps = {
  destinations: DestinationWithNotes[];
  theme: Theme;
  onNavigate: (target: 'map' | 'notes') => void;
};

export function Dashboard({ destinations, theme, onNavigate }: DashboardProps) {
  return (
    <div className="w-full h-full p-4 sm:p-6 lg:p-8 space-y-6">
      <div className={`rounded-3xl p-6 shadow-glass ${theme === 'dark' ? 'bg-gray-900/70 border border-gray-800' : 'bg-white/70 border border-white/60'} backdrop-blur-xl`}> 
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className={`text-2xl md:text-3xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Travel Dashboard</h2>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Insights, memories, and plans in one place.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onNavigate('map')} className="px-4 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 font-medium">Open 3D Map</button>
            <button onClick={() => onNavigate('notes')} className="px-4 py-3 rounded-xl bg-purple-500 text-white hover:bg-purple-600 font-medium">New Journal Entry</button>
          </div>
        </div>
      </div>
      <div className={`rounded-3xl overflow-hidden shadow-soft ${theme === 'dark' ? 'bg-gray-900/60 border border-gray-800' : 'bg-white/70 border border-white/60'} backdrop-blur-xl h-[65vh]`}>
        <AnalyticsPanel destinations={destinations} theme={theme} onNavigate={onNavigate} />
      </div>
    </div>
  );
}


