import React from 'react';
import { NavTab } from '../types';
import {
  Compass,
  Sliders,
  Sparkles,
  Eye,
  FileCode2,
  Heart,
  Palette,
  ImageDown,
} from 'lucide-react';

interface SidebarNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  favoritesCount: number;
  historyCount: number;
  activeHex: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentTab,
  onSelectTab,
  favoritesCount,
  historyCount,
  activeHex,
}) => {
  const navCategories = [
    {
      id: 'explore' as NavTab,
      label: 'Explore & Presets',
      icon: Compass,
      description: '5 Curated Libraries & Live Search',
    },
    {
      id: 'engines' as NavTab,
      label: 'Color Space Engines',
      icon: Sliders,
      description: 'HEX, RGB, HSL, CMYK & Alpha',
    },
    {
      id: 'studios' as NavTab,
      label: 'Generative Studios',
      icon: Sparkles,
      description: 'Harmonies, Palette Extractor, Gradients',
    },
    {
      id: 'accessibility' as NavTab,
      label: 'Accessibility & Optics',
      icon: Eye,
      description: 'WCAG 2.1 Matrix & CVD Simulator',
    },
    {
      id: 'downloader' as NavTab,
      label: 'Card Downloader',
      icon: ImageDown,
      description: 'Multi-Resolution Canvas Cards',
    },
    {
      id: 'exports' as NavTab,
      label: 'Developer Center',
      icon: FileCode2,
      description: 'CSS Root, Tailwind & JSON Export',
    },
    {
      id: 'favorites' as NavTab,
      label: 'Favorites & History',
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
      description: `${favoritesCount} saved · ${historyCount} recent`,
    },
  ];

  return (
    <aside
      id="sidebar-navigation"
      className="w-full lg:w-72 shrink-0 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between p-4 lg:p-5 transition-colors duration-200"
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-1">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-transform hover:scale-105"
            style={{ backgroundColor: activeHex }}
          >
            <Palette className="w-5 h-5 text-white drop-shadow-sm" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
              Color Encyclopedia
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Universal Color System
            </p>
          </div>
        </div>

        {/* 5-Category Grouped Navigation List */}
        <nav className="space-y-1" aria-label="Main Navigation">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            Navigation Directory
          </p>
          {navCategories.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full group flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mt-0.5 shrink-0 transition-colors ${
                    isActive
                      ? 'text-white dark:text-zinc-900'
                      : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[11px] truncate mt-0.5 ${
                      isActive
                        ? 'text-zinc-300 dark:text-zinc-600'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
