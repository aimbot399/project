import { Palette } from 'lucide-react';
import type { Theme } from '../types';

type ThemeSelectorProps = {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
};

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const themes: { value: Theme; label: string; colors: string }[] = [
    { value: 'pastel', label: 'Pastel', colors: 'bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200' },
    { value: 'dark', label: 'Dark Glass', colors: 'bg-gradient-to-r from-gray-800 via-gray-900 to-black' },
    { value: 'sunset', label: 'Sunset', colors: 'bg-gradient-to-r from-orange-300 via-pink-300 to-purple-300' },
  ];

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-full shadow-glass backdrop-blur-md bg-white/70">
      <div className="flex items-center gap-2 pr-2 border-r border-white/60">
        <Palette className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">Theme</span>
      </div>
      <div className="flex gap-1.5">
        {themes.map((theme) => (
          <button
            key={theme.value}
            onClick={() => onThemeChange(theme.value)}
            className={`group relative p-1.5 rounded-full transition-all hover:scale-105 active:scale-95 ${
              currentTheme === theme.value ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-white' : ''
            }`}
            title={theme.label}
          >
            <div className={`w-6 h-6 rounded-full ${theme.colors} shadow-soft`} />
            <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
              {theme.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
