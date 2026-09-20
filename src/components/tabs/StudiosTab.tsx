import React, { useState, useRef, useEffect } from 'react';
import { ActiveColor } from '../../types';
import { generateHarmonies } from '../../utils/colorMath';
import { extractPaletteFromImageData } from '../../utils/paletteExtractor';
import {
  Sparkles,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  Compass,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface StudiosTabProps {
  activeColor: ActiveColor;
  onSelectColor: (hex: string, name?: string) => void;
  onCopyText: (text: string, label: string) => void;
}

export const StudiosTab: React.FC<StudiosTabProps> = ({
  activeColor,
  onSelectColor,
  onCopyText,
}) => {
  // Harmonies
  const harmonies = generateHarmonies(activeColor.hsl);
  const [copiedHarmonyName, setCopiedHarmonyName] = useState<string | null>(null);

  // Gradient Laboratory state
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'multistop'>('linear');
  const [gradientAngle, setGradientAngle] = useState<number>(135);
  const [gradientStop1, setGradientStop1] = useState<string>(activeColor.hex);
  const [gradientStop2, setGradientStop2] = useState<string>('#4F46E5');
  const [gradientStop3, setGradientStop3] = useState<string>('#EC4899');
  const [copiedCss, setCopiedCss] = useState(false);

  // Sync stop 1 with activeColor if desired
  useEffect(() => {
    setGradientStop1(activeColor.hex);
  }, [activeColor.hex]);

  // Image Palette Extractor state
  const [extractedColors, setExtractedColors] = useState<string[]>([
    activeColor.hex,
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
  ]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pre-loaded sample images generated via canvas
  const loadSampleImage = (type: 'sunset' | 'cyber' | 'forest') => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (type === 'sunset') {
      const grad = ctx.createLinearGradient(0, 0, 0, 250);
      grad.addColorStop(0, '#FF4500');
      grad.addColorStop(0.3, '#FF8C00');
      grad.addColorStop(0.6, '#FFD700');
      grad.addColorStop(0.85, '#8A2BE2');
      grad.addColorStop(1, '#1A0033');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 250);

      // Sun
      ctx.fillStyle = '#FFF8DC';
      ctx.beginPath();
      ctx.arc(200, 140, 45, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'cyber') {
      const grad = ctx.createLinearGradient(0, 0, 400, 250);
      grad.addColorStop(0, '#0F051D');
      grad.addColorStop(0.5, '#2D006B');
      grad.addColorStop(1, '#00F0FF');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 250);

      ctx.fillStyle = '#FF007F';
      ctx.fillRect(50, 40, 120, 160);
      ctx.fillStyle = '#39FF14';
      ctx.fillRect(220, 90, 130, 110);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, 250);
      grad.addColorStop(0, '#87CEEB');
      grad.addColorStop(0.5, '#556B2F');
      grad.addColorStop(0.8, '#2E8B57');
      grad.addColorStop(1, '#1E3F20');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 250);

      ctx.fillStyle = '#8B4513';
      ctx.fillRect(170, 120, 60, 130);
      ctx.fillStyle = '#006400';
      ctx.beginPath();
      ctx.arc(200, 100, 70, 0, Math.PI * 2);
      ctx.fill();
    }

    const dataUrl = canvas.toDataURL('image/jpeg');
    setImagePreviewUrl(dataUrl);

    // Extract colors
    const colors = extractPaletteFromImageData(ctx, 400, 250, 6);
    setExtractedColors(colors);
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsExtracting(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const colors = extractPaletteFromImageData(ctx, img.width, img.height, 6);
          setExtractedColors(colors);
          setImagePreviewUrl(e.target?.result as string);
        }
        setIsExtracting(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCopyHarmonyArray = (harmony: { name: string; colors: string[] }) => {
    const text = JSON.stringify(harmony.colors, null, 2);
    onCopyText(text, `${harmony.name} Palette`);
    setCopiedHarmonyName(harmony.name);
    setTimeout(() => setCopiedHarmonyName(null), 1500);
  };

  // Compute CSS Gradient String
  const computeGradientCss = () => {
    if (gradientType === 'linear') {
      return `linear-gradient(${gradientAngle}deg, ${gradientStop1} 0%, ${gradientStop2} 100%)`;
    } else if (gradientType === 'radial') {
      return `radial-gradient(circle at center, ${gradientStop1} 0%, ${gradientStop2} 100%)`;
    } else {
      return `linear-gradient(${gradientAngle}deg, ${gradientStop1} 0%, ${gradientStop2} 50%, ${gradientStop3} 100%)`;
    }
  };

  const gradientCssString = `background: ${computeGradientCss()};`;

  return (
    <div id="studios-tab-view" className="space-y-10">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Generative Studios
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Classical color theory harmonies, client-side HTML5 canvas image palette extraction, and an interactive gradient generator.
        </p>
      </div>

      {/* 1. Harmonies & Classical Theory */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Harmonies & Classical Theory
            </h3>
          </div>
          <span className="text-xs text-zinc-400">
            Based on active base hue ({activeColor.hsl.h}°)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {harmonies.map((harmony) => {
            const isCopied = copiedHarmonyName === harmony.name;
            return (
              <div
                key={harmony.name}
                id={`harmony-${harmony.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {harmony.name}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-1">
                      {harmony.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyHarmonyArray(harmony)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Copy full array"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Swatches strip */}
                <div className="flex rounded-xl overflow-hidden h-14 border border-zinc-200 dark:border-zinc-800">
                  {harmony.colors.map((hex, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectColor(hex, `${harmony.name} #${idx + 1}`)}
                      className="group relative flex-1 h-full transition-transform hover:scale-105 active:scale-95 focus:outline-hidden"
                      style={{ backgroundColor: hex }}
                      title={`Click to set ${hex} as active`}
                    >
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-mono font-bold transition-opacity">
                        {hex}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  <span>{harmony.colors.length} hues</span>
                  <span className="truncate max-w-[170px]">
                    {harmony.colors.join(' · ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Image Palette Extraction Studio */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Image Palette Extraction Studio
            </h3>
          </div>
          <span className="text-xs text-zinc-400">
            Client-side HTML5 Canvas pixel sampling (No server upload)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          {/* Dropzone & Preview */}
          <div className="lg:col-span-6 space-y-3">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-52 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-500 bg-zinc-50/50 dark:bg-zinc-800/30 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all overflow-hidden group"
            >
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt="Extraction preview"
                  className="absolute inset-0 w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    Drop PNG, JPG, or WEBP image here
                  </p>
                  <p className="text-xs text-zinc-400">
                    Or click to browse from your device
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </div>

            {/* Instant Sample Presets */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Sample art:</span>
              <button
                onClick={() => loadSampleImage('sunset')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Sunset Horizon
              </button>
              <button
                onClick={() => loadSampleImage('cyber')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Cyber Arcade
              </button>
              <button
                onClick={() => loadSampleImage('forest')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Alpine Forest
              </button>
            </div>
          </div>

          {/* Extracted 6 Dominant Swatches */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Extracted 6 Dominant Swatches
                </h4>
                <button
                  onClick={() => {
                    const text = JSON.stringify(extractedColors, null, 2);
                    onCopyText(text, 'Extracted 6 Swatches');
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <Copy className="w-3 h-3" /> Copy Array
                </button>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Click any swatch below to set it as your universal active color.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {extractedColors.map((hex, idx) => (
                <div
                  key={idx}
                  id={`extracted-color-${idx}`}
                  onClick={() => onSelectColor(hex, `Extracted Swatch #${idx + 1}`)}
                  className="group p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-all hover:scale-102"
                >
                  <div
                    className="h-14 w-full rounded-lg shadow-inner mb-2 flex items-center justify-center text-white opacity-95 group-hover:opacity-100"
                    style={{ backgroundColor: hex }}
                  >
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono font-bold bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs transition-opacity">
                      Activate
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      {hex}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyText(hex, 'Swatch HEX');
                      }}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Gradient Laboratory */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Gradient Laboratory
            </h3>
          </div>
          <span className="text-xs text-zinc-400">
            CSS3 linear, radial & 3-stop multi-gradient engine
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          {/* Controls */}
          <div className="lg:col-span-6 space-y-5">
            {/* Mode selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
                Gradient Topology
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'linear', label: 'Linear' },
                  { id: 'radial', label: 'Radial' },
                  { id: 'multistop', label: '3-Stop Multi' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setGradientType(mode.id as any)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      gradientType === mode.id
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Angle Slider (if linear or multistop) */}
            {gradientType !== 'radial' && (
              <div>
                <div className="flex justify-between text-xs font-mono font-medium mb-1.5">
                  <span className="text-zinc-600 dark:text-zinc-400 font-sans font-semibold">
                    Direction Angle
                  </span>
                  <span className="text-zinc-800 dark:text-zinc-200">{gradientAngle}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={gradientAngle}
                  onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-700 accent-zinc-900 dark:accent-zinc-100"
                />
              </div>
            )}

            {/* Stops pickers */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Color Key Stops
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <input
                    type="color"
                    value={gradientStop1}
                    onChange={(e) => setGradientStop1(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200 uppercase font-semibold">
                    {gradientStop1}
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />

                <div className="flex-1 flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <input
                    type="color"
                    value={gradientStop2}
                    onChange={(e) => setGradientStop2(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200 uppercase font-semibold">
                    {gradientStop2}
                  </span>
                </div>

                {gradientType === 'multistop' && (
                  <>
                    <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
                    <div className="flex-1 flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                      <input
                        type="color"
                        value={gradientStop3}
                        onChange={(e) => setGradientStop3(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer border-none bg-transparent"
                      />
                      <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200 uppercase font-semibold">
                        {gradientStop3}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick action to set stop1 as active color */}
            <button
              onClick={() => setGradientStop1(activeColor.hex)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              Set Stop 1 to Active Color ({activeColor.hex})
            </button>
          </div>

          {/* Visual Falloff Preview & Copy Code */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div
              className="w-full h-44 rounded-2xl shadow-inner border border-black/10 dark:border-white/10 transition-all"
              style={{ background: computeGradientCss() }}
            />

            <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-2">
              <code className="text-xs font-mono text-zinc-700 dark:text-zinc-300 truncate">
                {gradientCssString}
              </code>
              <button
                onClick={() => {
                  onCopyText(gradientCssString, 'CSS Gradient');
                  setCopiedCss(true);
                  setTimeout(() => setCopiedCss(false), 1500);
                }}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all inline-flex items-center gap-1.5"
              >
                {copiedCss ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
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
          </div>
        </div>
      </section>
    </div>
  );
};
