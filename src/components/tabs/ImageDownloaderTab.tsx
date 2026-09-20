import React, { useState, useRef, useEffect } from 'react';
import { ActiveColor, DownloadResolution, CardLayoutStyle, ExportFormat } from '../../types';
import { Download, Check, Sparkles, Sliders, ImageDown, Eye } from 'lucide-react';

interface ImageDownloaderTabProps {
  activeColor: ActiveColor;
  onDownloadTriggered: (filename: string, resolution: string) => void;
}

export const RESOLUTIONS: DownloadResolution[] = [
  {
    key: 'square',
    label: 'Square Swatch',
    width: 512,
    height: 512,
    aspect: '1:1',
    subtext: 'Avatars, icons & UI tokens',
  },
  {
    key: 'desktop',
    label: 'Desktop Wallpaper',
    width: 1920,
    height: 1080,
    aspect: '16:9',
    subtext: 'Monitors & presentation slides',
  },
  {
    key: 'mobile',
    label: 'Mobile Wallpaper',
    width: 1080,
    height: 1920,
    aspect: '9:16',
    subtext: 'Smartphone lock screens',
  },
  {
    key: 'social',
    label: 'Social Media Banner',
    width: 1200,
    height: 630,
    aspect: '1.91:1',
    subtext: 'OpenGraph & social cards',
  },
  {
    key: 'catalog',
    label: 'Catalog Spec Card',
    width: 800,
    height: 500,
    aspect: '16:10',
    subtext: 'Digital reference spec sheets',
  },
];

export const ImageDownloaderTab: React.FC<ImageDownloaderTabProps> = ({
  activeColor,
  onDownloadTriggered,
}) => {
  const [selectedResolutionKey, setSelectedResolutionKey] = useState<string>('catalog');
  const [selectedStyle, setSelectedStyle] = useState<CardLayoutStyle>('spec');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const activeRes = RESOLUTIONS.find((r) => r.key === selectedResolutionKey) || RESOLUTIONS[4];

  // Draw on Canvas
  const drawCard = (canvas: HTMLCanvasElement, targetW: number, targetH: number) => {
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { hex, rgb, hsl, cmyk } = activeColor;
    const scale = targetW / 800; // base scale against catalog spec

    if (selectedStyle === 'solid') {
      // Pure edge-to-edge fill
      ctx.fillStyle = hex;
      ctx.fillRect(0, 0, targetW, targetH);

      // Subtle minimalist label in corner
      ctx.fillStyle = hsl.l > 55 ? '#00000088' : '#ffffffaa';
      ctx.font = `600 ${Math.max(16, Math.round(20 * scale))}px monospace`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${hex} · Color Encyclopedia`, targetW - 30 * scale, targetH - 30 * scale);
    } else if (selectedStyle === 'radial') {
      // Radial Glow: dark vignette background with center glow
      ctx.fillStyle = '#09090B';
      ctx.fillRect(0, 0, targetW, targetH);

      const radial = ctx.createRadialGradient(
        targetW / 2,
        targetH / 2,
        10 * scale,
        targetW / 2,
        targetH / 2,
        Math.max(targetW, targetH) * 0.55
      );
      radial.addColorStop(0, hex);
      radial.addColorStop(0.7, `${hex}44`);
      radial.addColorStop(1, '#09090B');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, targetW, targetH);

      // Glowing Center Card
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.max(24, Math.round(54 * scale))}px monospace`;
      ctx.fillText(hex, targetW / 2, targetH / 2 - 20 * scale);

      ctx.font = `500 ${Math.max(14, Math.round(22 * scale))}px system-ui, sans-serif`;
      ctx.fillStyle = '#E4E4E7';
      ctx.fillText(
        `rgb(${rgb.r}, ${rgb.g}, ${rgb.b}) · hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)`,
        targetW / 2,
        targetH / 2 + 35 * scale
      );
    } else {
      // Spec Card Style
      // Neutral crisp backdrop
      ctx.fillStyle = '#18181B';
      ctx.fillRect(0, 0, targetW, targetH);

      const margin = 40 * scale;
      const cardW = targetW - margin * 2;
      const cardH = targetH - margin * 2;

      // Card frame
      ctx.fillStyle = '#27272A';
      ctx.beginPath();
      ctx.roundRect(margin, margin, cardW, cardH, 24 * scale);
      ctx.fill();

      // Swatch Block
      const swatchH = cardH * 0.52;
      ctx.fillStyle = hex;
      ctx.beginPath();
      ctx.roundRect(margin + 16 * scale, margin + 16 * scale, cardW - 32 * scale, swatchH, 16 * scale);
      ctx.fill();

      // Swatch Border
      ctx.strokeStyle = '#FFFFFF22';
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();

      // Card Specs Info
      const textStartY = margin + swatchH + 50 * scale;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      // Title & Name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.max(20, Math.round(36 * scale))}px monospace`;
      ctx.fillText(hex, margin + 24 * scale, textStartY);

      ctx.fillStyle = '#A1A1AA';
      ctx.font = `500 ${Math.max(12, Math.round(18 * scale))}px system-ui, sans-serif`;
      ctx.fillText(
        `${activeColor.name || 'Universal Color Palette'}`,
        margin + 24 * scale,
        textStartY + 42 * scale
      );

      // Coordinates Grid
      const col2X = margin + cardW * 0.48;
      ctx.font = `bold ${Math.max(11, Math.round(16 * scale))}px monospace`;
      ctx.fillStyle = '#71717A';
      ctx.fillText('RGB:', col2X, textStartY);
      ctx.fillStyle = '#F4F4F5';
      ctx.fillText(`${rgb.r}, ${rgb.g}, ${rgb.b}`, col2X + 60 * scale, textStartY);

      ctx.fillStyle = '#71717A';
      ctx.fillText('HSL:', col2X, textStartY + 26 * scale);
      ctx.fillStyle = '#F4F4F5';
      ctx.fillText(`${hsl.h}°, ${hsl.s}%, ${hsl.l}%`, col2X + 60 * scale, textStartY + 26 * scale);

      ctx.fillStyle = '#71717A';
      ctx.fillText('CMYK:', col2X, textStartY + 52 * scale);
      ctx.fillStyle = '#F4F4F5';
      ctx.fillText(`${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`, col2X + 60 * scale, textStartY + 52 * scale);

      // Footer branding
      ctx.textAlign = 'right';
      ctx.fillStyle = '#52525B';
      ctx.font = `600 ${Math.max(10, Math.round(14 * scale))}px system-ui, sans-serif`;
      ctx.fillText('Color Encyclopedia Studio', targetW - margin - 24 * scale, targetH - margin - 24 * scale);
    }
  };

  // Re-render preview canvas whenever activeColor, resolution, or layout changes
  useEffect(() => {
    if (!previewCanvasRef.current) return;
    // Draw on preview canvas using clamped dimensions for screen display
    const previewScale = Math.min(640 / activeRes.width, 380 / activeRes.height, 1);
    const prevW = Math.round(activeRes.width * previewScale);
    const prevH = Math.round(activeRes.height * previewScale);
    drawCard(previewCanvasRef.current, prevW, prevH);
  }, [activeColor, activeRes, selectedStyle]);

  const handleDownload = () => {
    setIsExporting(true);

    // Create high-res offscreen canvas
    const offscreen = document.createElement('canvas');
    drawCard(offscreen, activeRes.width, activeRes.height);

    const mimeType = selectedFormat === 'png' ? 'image/png' : selectedFormat === 'jpeg' ? 'image/jpeg' : 'image/webp';
    const extension = selectedFormat === 'jpeg' ? 'jpg' : selectedFormat;
    const cleanHex = activeColor.hex.replace('#', '');
    const filename = `color-${cleanHex}-${activeRes.key}-${selectedStyle}.${extension}`;

    const dataUrl = offscreen.toDataURL(mimeType, 0.95);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onDownloadTriggered(filename, `${activeRes.width}×${activeRes.height} ${selectedFormat.toUpperCase()}`);
    setTimeout(() => setIsExporting(false), 500);
  };

  return (
    <div id="downloader-tab-view" className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Multi-Resolution Image Card Downloader
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Generate pixel-perfect high-resolution digital spec cards, desktop & mobile wallpapers, and OpenGraph social graphics directly on client canvas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Target Resolutions (5 items) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2.5">
              1. Target Resolution
            </label>
            <div className="space-y-2">
              {RESOLUTIONS.map((res) => {
                const isSelected = selectedResolutionKey === res.key;
                return (
                  <button
                    key={res.key}
                    id={`res-option-${res.key}`}
                    onClick={() => setSelectedResolutionKey(res.key)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
                        : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{res.label}</p>
                      <p
                        className={`text-[11px] ${
                          isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400'
                        }`}
                      >
                        {res.subtext}
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-xs font-semibold">
                        {res.width} × {res.height}
                      </span>
                      <span
                        className={`block text-[10px] ${
                          isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400'
                        }`}
                      >
                        {res.aspect}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Visual Layout Styles (3 options) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2.5">
              2. Visual Layout Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'spec' as CardLayoutStyle, label: 'Spec Card', desc: 'Detailed badges' },
                { id: 'solid' as CardLayoutStyle, label: 'Solid Fill', desc: 'Edge-to-edge' },
                { id: 'radial' as CardLayoutStyle, label: 'Radial Glow', desc: 'Center vignette' },
              ].map((style) => (
                <button
                  key={style.id}
                  id={`style-option-${style.id}`}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    selectedStyle === style.id
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-semibold shadow-xs'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80'
                  }`}
                >
                  <span className="text-xs block font-bold">{style.label}</span>
                  <span className="text-[10px] opacity-75">{style.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Export Formats (PNG, JPG, WEBP) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2.5">
              3. Output Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'png' as ExportFormat, label: 'PNG Lossless', ext: '.png' },
                { id: 'jpeg' as ExportFormat, label: 'JPEG Photo', ext: '.jpg' },
                { id: 'webp' as ExportFormat, label: 'WEBP Modern', ext: '.webp' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  id={`format-option-${fmt.id}`}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`py-2 px-3 rounded-xl border text-center transition-all ${
                    selectedFormat === fmt.id
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-semibold'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
                  }`}
                >
                  <span className="text-xs font-bold uppercase">{fmt.id}</span>
                  <span className="block text-[10px] text-zinc-400">{fmt.ext}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Download Action Button */}
          <button
            id="render-download-btn"
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download {activeRes.width} × {activeRes.height} ({selectedFormat.toUpperCase()})</span>
          </button>
        </div>

        {/* Right Column: Live Interactive Canvas Preview */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[420px]">
            <div className="flex items-center gap-2 mb-3 text-xs text-zinc-400 font-mono">
              <Eye className="w-3.5 h-3.5" />
              <span>Real-Time Canvas Render ({activeRes.width}×{activeRes.height}px @ {activeRes.aspect})</span>
            </div>

            <div className="max-w-full overflow-hidden flex items-center justify-center rounded-xl shadow-2xl border border-black/10 dark:border-white/10">
              <canvas
                ref={previewCanvasRef}
                className="max-w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Client-side hardware accelerated canvas rendering</span>
            <span className="font-mono text-zinc-700 dark:text-zinc-300 font-bold">
              {activeColor.hex} · {selectedStyle.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
