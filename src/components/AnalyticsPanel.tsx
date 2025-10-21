import { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import type { DestinationWithNotes } from '../types';
import { getTotalDistanceKm, getCountriesVisited } from '../lib/geo';

type AnalyticsPanelProps = {
  destinations: DestinationWithNotes[];
  theme: 'pastel' | 'dark' | 'sunset';
  onNavigate?: (target: 'map' | 'notes') => void;
};

export function AnalyticsPanel({ destinations, theme, onNavigate }: AnalyticsPanelProps) {
  const colors = {
    text: theme === 'dark' ? '#e5e7eb' : '#111827',
    grid: theme === 'dark' ? '#1f2937' : '#e5e7eb',
    primary: '#6366f1',
    accent: '#ec4899',
    success: '#10b981',
    warning: '#f59e0b',
  };

  const { countriesCount, countriesBreakdown } = useMemo(() => getCountriesVisited(destinations), [destinations]);
  const totalDistance = useMemo(() => getTotalDistanceKm(destinations), [destinations]);

  const moodTimeline = useMemo(() => {
    const map = new Map<string, number>();
    destinations.forEach((d) => {
      d.notes.forEach((n) => {
        const day = n.created_at.slice(0, 10);
        map.set(day, (map.get(day) || 0) + (n.mood_tags?.length || 0));
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, moodScore]) => ({ date, moodScore }));
  }, [destinations]);

  const pieData = useMemo(() => {
    const catCounts: Record<string, number> = { dream: 0, planning: 0, visited: 0 };
    destinations.forEach((d) => (catCounts[d.category] = (catCounts[d.category] || 0) + 1));
    return [
      { name: 'Dream', value: catCounts.dream, color: '#A78BFA' },
      { name: 'Planning', value: catCounts.planning, color: '#FBBF24' },
      { name: 'Visited', value: catCounts.visited, color: '#34D399' },
    ];
  }, [destinations]);

  return (
    <div className="w-full h-full p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className={`col-span-1 lg:col-span-1 rounded-2xl p-4 shadow-soft ${theme === 'dark' ? 'bg-gray-900/60 border border-gray-800' : 'bg-white/80 border border-white/60'} backdrop-blur-md`}>
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>Countries visited</h3>
        <p className="text-3xl font-extrabold" style={{ color: colors.primary }}>{countriesCount}</p>
        {!!onNavigate && (
          <div className="mt-3 flex gap-2">
            <button onClick={() => onNavigate('map')} className="px-3 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600">Open Map</button>
            <button onClick={() => onNavigate('notes')} className="px-3 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600">New Note</button>
          </div>
        )}
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={countriesBreakdown}>
            <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
            <XAxis dataKey="country" stroke={colors.text} hide />
            <YAxis stroke={colors.text} />
            <Tooltip contentStyle={{ background: '#111827', border: 'none', color: '#e5e7eb' }} />
            <Bar dataKey="count" fill={colors.accent} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className={`col-span-1 lg:col-span-1 rounded-2xl p-4 shadow-soft ${theme === 'dark' ? 'bg-gray-900/60 border border-gray-800' : 'bg-white/80 border border-white/60'} backdrop-blur-md`}>
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>Mood over time</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={moodTimeline}>
            <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke={colors.text} hide />
            <YAxis stroke={colors.text} />
            <Tooltip contentStyle={{ background: '#111827', border: 'none', color: '#e5e7eb' }} />
            <Line type="monotone" dataKey="moodScore" stroke={colors.primary} strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className={`col-span-1 lg:col-span-1 rounded-2xl p-4 shadow-soft ${theme === 'dark' ? 'bg-gray-900/60 border border-gray-800' : 'bg-white/80 border border-white/60'} backdrop-blur-md`}>
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>Categories</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40} paddingAngle={3}>
              {pieData.map((e, i) => (
                <Cell key={i} fill={e.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#111827', border: 'none', color: '#e5e7eb' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4">
          <p className="text-sm" style={{ color: colors.text }}>Total distance</p>
          <p className="text-xl font-bold" style={{ color: colors.success }}>{totalDistance.toFixed(0)} km</p>
        </div>
      </div>
    </div>
  );
}


