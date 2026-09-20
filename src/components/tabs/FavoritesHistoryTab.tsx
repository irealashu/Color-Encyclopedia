import React, { useState } from 'react';
import { HistoryItem } from '../../types';
import { Heart, History, Trash2, Copy } from 'lucide-react';

interface FavoritesHistoryTabProps {
  favorites: string[];
  history: HistoryItem[];
  activeHex: string;
  onSelectColor: (hex: string, name?: string) => void;
  onToggleFavorite: (hex: string) => void;
  onClearHistory: () => void;
  onCopyText: (text: string, label: string) => void;
}

export const FavoritesHistoryTab: React.FC<FavoritesHistoryTabProps> = ({
  favorites,
  history,
  activeHex,
  onSelectColor,
  onToggleFavorite,
  onClearHistory,
  onCopyText,
}) => {
  const [activeSubView, setActiveSubView] = useState<'favorites' | 'history'>('favorites');

  const formatTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div id="favorites-history-tab-view" className="space-y-6">
      {/* Header with Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Favorites & Activity Records
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Locally persisted bookmarks and chronological history log tracking your last 35 inspected swatches.
          </p>
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveSubView('favorites')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubView === 'favorites'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Saved Favorites ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveSubView('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubView === 'history'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            <History className="w-3.5 h-3.5 text-blue-500" />
            <span>Recent History ({history.length}/35)</span>
          </button>
        </div>
      </div>

      {/* Subview: Saved Favorites */}
      {activeSubView === 'favorites' && (
        <div className="space-y-4">
          {favorites.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500 mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                No Favorite Colors Saved Yet
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                Click the heart icon in the global anchor bar or on any card to pin your favorite tones for quick retrieval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
              {favorites.map((hex) => {
                const isCurrent = activeHex.toUpperCase() === hex.toUpperCase();
                return (
                  <div
                    key={hex}
                    id={`fav-item-${hex.replace('#', '')}`}
                    className="group flex flex-col space-y-2.5"
                  >
                    {/* Standalone Visual Color Card */}
                    <div
                      onClick={() => onSelectColor(hex, 'Bookmarked Color')}
                      className={`relative h-28 sm:h-32 w-full rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs group-hover:shadow-md group-hover:-translate-y-1 overflow-hidden ${
                        isCurrent
                          ? 'ring-2 ring-zinc-900 dark:ring-zinc-100 border-transparent shadow-md'
                          : 'border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25'
                      }`}
                      style={{ backgroundColor: hex }}
                      title={`Click to set ${hex} as active`}
                    >
                      {/* Visual Swatch Surface */}

                      {/* Un-favorite button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(hex);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        title="Remove from favorites"
                        aria-label={`Remove ${hex} from favorites`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Active Indicator Badge */}
                      {isCurrent && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-white text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1 shadow-sm">
                          <Heart className="w-2.5 h-2.5 text-rose-400 fill-current" />
                          Active
                        </div>
                      )}
                    </div>

                    {/* Separate Text Section Below Card */}
                    <div className="px-0.5 flex items-center justify-between gap-1">
                      <span
                        onClick={() => onSelectColor(hex, 'Bookmarked Color')}
                        className="font-mono font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 cursor-pointer hover:underline"
                        title="Click to activate"
                      >
                        {hex}
                      </span>
                      <button
                        onClick={() => onCopyText(hex, 'HEX')}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Copy HEX"
                        aria-label={`Copy HEX code ${hex}`}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Subview: Recent History (up to 35) */}
      {activeSubView === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Showing {history.length} of 35 stored swatches
            </span>
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
              <History className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Activity Log is Empty
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Colors you inspect and modify will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {history.map((item, idx) => {
                const isCurrent = activeHex.toUpperCase() === item.hex.toUpperCase();
                return (
                  <div
                    key={`${item.hex}-${item.timestamp}-${idx}`}
                    onClick={() => onSelectColor(item.hex, item.name)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 ${
                      isCurrent
                        ? 'border-zinc-900 dark:border-zinc-100 ring-1 ring-zinc-900 dark:ring-zinc-100'
                        : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg shadow-inner border border-black/10 shrink-0"
                        style={{ backgroundColor: item.hex }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {item.hex}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 break-words leading-tight" title={item.name || 'Inspected Swatch'}>
                          {item.name || 'Inspected Swatch'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-zinc-400 block font-mono">
                        {formatTime(item.timestamp)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyText(item.hex, 'HEX');
                        }}
                        className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
                        title="Copy HEX"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
