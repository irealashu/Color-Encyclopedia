import React, { useState } from 'react';
import { ActiveColor } from '../../types';
import { Copy, Check, FileCode2, Terminal, Braces, Sparkles } from 'lucide-react';

interface DeveloperExportTabProps {
  activeColor: ActiveColor;
  favorites: string[];
  onCopyText: (text: string, label: string) => void;
}

export const DeveloperExportTab: React.FC<DeveloperExportTabProps> = ({
  activeColor,
  favorites,
  onCopyText,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { hex, rgb, hsl, cmyk, alpha } = activeColor;
  const colorKey = (activeColor.name || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-');

  // 1. CSS Custom Properties
  const cssCustomProps = `:root {
  /* Color Encyclopedia Design Tokens */
  --brand-color: ${hex};
  --brand-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};
  --brand-hsl: ${hsl.h}deg, ${hsl.s}%, ${hsl.l}%;
  --brand-cmyk: ${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%;
  --brand-alpha: ${alpha.toFixed(2)};
  --brand-color-alpha: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)});
}`;

  // 2. Tailwind Configuration snippet
  const tailwindSnippet = `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        '${colorKey}': {
          DEFAULT: '${hex}',
          rgb: 'rgb(${rgb.r}, ${rgb.g}, ${rgb.b})',
          hsl: 'hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)',
          alpha: 'rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})',
        },
      },
    },
  },
};`;

  // 3. Structured JSON Data
  const jsonData = JSON.stringify(
    {
      activeColor: {
        name: activeColor.name || 'Custom Color',
        hex,
        rgb,
        hsl,
        cmyk,
        alpha,
        cssFormats: {
          rgbString: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
          rgbaString: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`,
          hslString: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
          cmykString: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
        },
      },
      savedBookmarks: favorites,
      exportedAt: new Date().toISOString(),
      generator: 'Color Encyclopedia Studio',
    },
    null,
    2
  );

  const handleCopy = (code: string, key: string, label: string) => {
    onCopyText(code, label);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div id="developer-export-tab-view" className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Developer Export Center
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Production-ready code snippets, CSS root custom properties, Tailwind theme configs, and structured JSON representations.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. CSS Custom Properties */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                CSS Custom Properties (:root)
              </h3>
            </div>
            <button
              onClick={() => handleCopy(cssCustomProps, 'css', 'CSS Custom Properties')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              {copiedKey === 'css' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy CSS
                </>
              )}
            </button>
          </div>
          <div className="relative">
            <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
              <code>{cssCustomProps}</code>
            </pre>
          </div>
        </div>

        {/* 2. Tailwind Configuration */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Tailwind CSS Configuration (tailwind.config.js)
              </h3>
            </div>
            <button
              onClick={() => handleCopy(tailwindSnippet, 'tailwind', 'Tailwind Config')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              {copiedKey === 'tailwind' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Tailwind
                </>
              )}
            </button>
          </div>
          <div className="relative">
            <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
              <code>{tailwindSnippet}</code>
            </pre>
          </div>
        </div>

        {/* 3. Structured JSON Data */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Braces className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Structured JSON Data (Coordinates & Bookmarks)
              </h3>
            </div>
            <button
              onClick={() => handleCopy(jsonData, 'json', 'Structured JSON')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              {copiedKey === 'json' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy JSON
                </>
              )}
            </button>
          </div>
          <div className="relative">
            <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800 max-h-72">
              <code>{jsonData}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
