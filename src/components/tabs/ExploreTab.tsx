import React, { useState, useMemo } from 'react';
import { ColorItem } from '../../types';
import {
  ALL_CURATED_COLORS,
  CSS_NAMED_COLORS,
  MATERIAL_500_COLORS,
  TAILWIND_500_COLORS,
  PASTEL_DREAMS_COLORS,
  NEON_CYBERPUNK_COLORS,
} from '../../data/curatedPalettes';
import { Search, Copy, Check, Sparkles, Filter } from 'lucide-react';
import { evaluateWCAG } from '../../utils/colorMath';

interface ExploreTabProps {
  activeHex: string;
  onSelectColor: (hex: string, name?: string) => void;
  onCopyText: (text: string, label: string) => void;
}

export const ExploreTab: React.FC<ExploreTabProps> = ({
  activeHex,
  onSelectColor,
  onCopyText,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recentlyCopiedId, setRecentlyCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Palettes', count: ALL_CURATED_COLORS.length },
    { id: 'css', label: 'CSS 16 Named', count: CSS_NAMED_COLORS.length, desc: 'W3C Web Standards' },
    { id: 'material', label: 'Material 500', count: MATERIAL_500_COLORS.length, desc: 'Google Material Design' },
    { id: 'tailwind', label: 'Tailwind 500', count: TAILWIND_500_COLORS.length, desc: 'Tailwind CSS Core' },
    { id: 'pastel', label: 'Pastel Dreams', count: PASTEL_DREAMS_COLORS.length, desc: 'Soft Muted Tones' },
    { id: 'neon', label: 'Neon & Cyberpunk', count: NEON_CYBERPUNK_COLORS.length, desc: 'High-Saturation Shades' },
  ];

  const filteredColors = useMemo(() => {
    let list = ALL_CURATED_COLORS;
    if (selectedCategory !== 'all') {
      list = list.filter((c) => c.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.hex.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  const handleQuickCopy = (e: React.MouseEvent, color: ColorItem) => {
    e.stopPropagation();
    onCopyText(color.hex, `${color.name} HEX`);
    setRecentlyCopiedId(color.id);
    setTimeout(() => setRecentlyCopiedId(null), 1500);
  };

  return (
    <div id="explore-tab-view" className="space-y-6">
      {/* Header section with live search and filter tags */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Curated Color Databases
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            5 filterable design libraries featuring 16 standard W3C tones, Material Design, Tailwind tokens, pastels, and neon cyber shades.
          </p>
        </div>

        {/* Instant Real-Time Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <input
            id="color-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by color name or #hex..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 5 Filterable Library Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`filter-cat-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isSelected
                  ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Color Cards Grid */}
      {filteredColors.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
          <Filter className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            No colors match "{searchQuery}"
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Try searching for a different name, category, or hex prefix.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredColors.map((color) => {
            const isSelected = activeHex.toUpperCase() === color.hex.toUpperCase();
            const isCopied = recentlyCopiedId === color.id;

            return (
              <div
                key={color.id}
                id={`card-${color.id}`}
                onClick={() => onSelectColor(color.hex, color.name)}
                className={`group relative rounded-2xl border transition-all cursor-pointer bg-white dark:bg-zinc-900 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 ${
                  isSelected
                    ? 'ring-2 ring-zinc-900 dark:ring-zinc-100 border-zinc-900 dark:border-zinc-100 shadow-md'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Visual Swatch Block */}
                <div
                  className="h-24 sm:h-28 w-full relative transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: color.hex }}
                >
                  {/* Hover Quick-Copy Button */}
                  <button
                    id={`quick-copy-${color.id}`}
                    onClick={(e) => handleQuickCopy(e, color)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Hover Quick-Copy HEX"
                    aria-label={`Copy HEX code for ${color.name}`}
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>

                  {/* Active Indicator Badge */}
                  {isSelected && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                      Active
                    </div>
                  )}
                </div>

                {/* Card Details */}
                <div className="p-3">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {color.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className="font-mono text-zinc-500 dark:text-zinc-400 font-medium">
                      {color.hex}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 capitalize">
                      {color.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
