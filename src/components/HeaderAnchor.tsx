import React, { useState } from 'react';
import { ActiveColor } from '../types';
import { evaluateWCAG } from '../utils/colorMath';
import { Heart, Copy, ImageDown, Moon, Sun, Check, Sparkles, SlidersHorizontal } from 'lucide-react';

interface HeaderAnchorProps {
  activeColor: ActiveColor;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onCopyText: (text: string, label: string) => void;
  onOpenDownloader: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onRandomize: () => void;
}

export const HeaderAnchor: React.FC<HeaderAnchorProps> = ({
  activeColor,
  isFavorite,
  onToggleFavorite,
  onCopyText,
  onOpenDownloader,
  isDarkMode,
  onToggleDarkMode,
  onRandomize,
}) => {
  const [copiedPill, setCopiedPill] = useState<string | null>(null);

  const wcag = evaluateWCAG(activeColor.rgb, { r: 255, g: 255, b: 255 });
  const isPassAgainstWhite = wcag.ratioAgainstWhite >= 4.5;
  const isPassLargeAgainstWhite = wcag.ratioAgainstWhite >= 3.0;

  const hexString = activeColor.hex;
  const rgbString = activeColor.alpha < 1 
    ? `rgba(${activeColor.rgb.r}, ${activeColor.rgb.g}, ${activeColor.rgb.b}, ${activeColor.alpha.toFixed(2)})`
    : `rgb(${activeColor.rgb.r}, ${activeColor.rgb.g}, ${activeColor.rgb.b})`;
  const hslString = `hsl(${activeColor.hsl.h}°, ${activeColor.hsl.s}%, ${activeColor.hsl.l}%)`;
  const cmykString = `cmyk(${activeColor.cmyk.c}%, ${activeColor.cmyk.m}%, ${activeColor.cmyk.y}%, ${activeColor.cmyk.k}%)`;

  const handleCopyPill = (formatName: string, text: string) => {
    onCopyText(text, formatName);
    setCopiedPill(formatName);
    setTimeout(() => setCopiedPill(null), 1500);
  };

  return (
    <header
      id="header-anchor"
      className="sticky top-0 z-40 w-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 shadow-xs transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Interactive Main Swatch & Active Color Title */}
        <div className="flex items-center gap-3.5">
          <div
            id="main-interactive-swatch"
            onClick={() => onCopyText(hexString, 'HEX')}
            className="group relative cursor-pointer w-11 h-11 sm:w-12 sm:h-12 rounded-xl shadow-inner border border-black/10 dark:border-white/15 overflow-hidden transition-transform hover:scale-105 active:scale-95"
            title="Click to copy HEX"
            role="button"
            tabIndex={0}
            aria-label={`Active Color ${hexString}, click to copy`}
          >
            {/* Checkerboard backdrop for alpha */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%)',
                backgroundSize: '10px 10px',
              }}
            />
            {/* Color fill layer */}
            <div
              className="absolute inset-0 transition-colors"
              style={{
                backgroundColor: activeColor.hex,
                opacity: activeColor.alpha,
              }}
            />
            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Copy className="w-4 h-4 text-white drop-shadow-md" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
                {activeColor.hex}
              </span>
              {activeColor.alpha < 1 && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono font-medium">
                  {Math.round(activeColor.alpha * 100)}% op
                </span>
              )}
              {/* Dynamic WCAG Tag */}
              <span
                id="header-wcag-tag"
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                  isPassAgainstWhite
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                    : isPassLargeAgainstWhite
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                }`}
                title={`WCAG contrast against white background: ${wcag.ratioAgainstWhite}:1`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isPassAgainstWhite ? 'bg-emerald-500' : isPassLargeAgainstWhite ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                />
                {isPassAgainstWhite
                  ? `WCAG Pass (${wcag.ratioAgainstWhite}:1)`
                  : isPassLargeAgainstWhite
                  ? `WCAG AA Lg (${wcag.ratioAgainstWhite}:1)`
                  : `WCAG Low (${wcag.ratioAgainstWhite}:1)`}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              {activeColor.name || 'Universal Active Palette Anchor'}
            </p>
          </div>
        </div>

        {/* Center: Real-Time Format Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { label: 'HEX', value: hexString },
            { label: 'RGB', value: rgbString },
            { label: 'HSL', value: hslString },
            { label: 'CMYK', value: cmykString },
          ].map((pill) => (
            <button
              key={pill.label}
              id={`pill-${pill.label.toLowerCase()}`}
              onClick={() => handleCopyPill(pill.label, pill.value)}
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 text-xs font-mono transition-all active:scale-95"
              title={`Click to copy ${pill.label}`}
            >
              <span className="font-sans font-semibold text-[10px] text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {pill.label}
              </span>
              <span className="max-w-[130px] sm:max-w-none truncate font-medium">
                {pill.value}
              </span>
              {copiedPill === pill.label ? (
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Copy className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 shrink-0 transition-colors" />
              )}
            </button>
          ))}
        </div>

        {/* Right: Instant Action Bar & Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Shuffle */}
          <button
            id="header-shuffle-btn"
            onClick={onRandomize}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all"
            title="Randomize active color"
            aria-label="Randomize active color"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Favoriting Action */}
          <button
            id="header-favorite-btn"
            onClick={onToggleFavorite}
            className={`p-2 rounded-xl border transition-all ${
              isFavorite
                ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            aria-label="Toggle favorite"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Copy Active Color Full Spec */}
          <button
            id="header-copy-all-btn"
            onClick={() => onCopyText(hexString, 'HEX')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xs"
            title="Copy HEX Code"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copy HEX</span>
          </button>

          {/* Open Image Downloader */}
          <button
            id="header-open-downloader-btn"
            onClick={onOpenDownloader}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold transition-all shadow-xs"
            title="Open Card Downloader Studio"
          >
            <ImageDown className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export Card</span>
          </button>

          {/* Dual Toggle Dark Mode: Header Button */}
          <button
            id="header-dark-mode-toggle"
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle color theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
