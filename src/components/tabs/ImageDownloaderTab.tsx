import React, { useState, useRef, useEffect } from 'react';
import { ActiveColor, DownloadResolution, CardLayoutStyle, ExportFormat } from '../../types';
import { Download, Eye } from 'lucide-react';

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

  // Helper to draw rounded rectangle with universal fallback
  const drawRoundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(x, y, w, h, r);
    } else {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
    }
  };

  // Helper to measure and fit text within maxWidth without ever overflowing
  const fitText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    fontFamily: string,
    targetSize: number,
    minSize: number,
    weight: string = 'normal'
  ): { text: string; size: number } => {
    let size = targetSize;
    ctx.font = `${weight} ${size}px ${fontFamily}`;
    while (ctx.measureText(text).width > maxWidth && size > minSize) {
      size -= 1;
      ctx.font = `${weight} ${size}px ${fontFamily}`;
    }
    if (ctx.measureText(text).width > maxWidth) {
      let truncated = text;
      while (ctx.measureText(truncated + '…').width > maxWidth && truncated.length > 2) {
        truncated = truncated.slice(0, -1);
      }
      return { text: truncated + '…', size };
    }
    return { text, size };
  };

  // Draw on Canvas
  const drawCard = (canvas: HTMLCanvasElement, targetW: number, targetH: number) => {
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { hex, rgb, hsl, cmyk } = activeColor;
    const isPortrait = targetH > targetW * 1.1; // e.g. Mobile 1080x1920
    const minDim = Math.min(targetW, targetH);
    const baseScale = minDim / 600; // responsive scale based on shortest dimension

    if (selectedStyle === 'solid') {
      // Pure edge-to-edge fill
      ctx.fillStyle = hex;
      ctx.fillRect(0, 0, targetW, targetH);

      // Subtle minimalist label in corner with automatic width guarantee
      const maxLabelW = targetW * 0.7;
      const { text: labelText, size: labelSize } = fitText(
        ctx,
        `${hex} · Color Encyclopedia`,
        maxLabelW,
        'monospace',
        Math.max(14, Math.round(20 * baseScale)),
        12,
        '600'
      );

      ctx.font = `600 ${labelSize}px monospace`;
      ctx.fillStyle = hsl.l > 55 ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.75)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(labelText, targetW - 28 * baseScale, targetH - 24 * baseScale);
    } else if (selectedStyle === 'radial') {
      // Radial Glow: dark vignette background with center glow
      ctx.fillStyle = '#09090B';
      ctx.fillRect(0, 0, targetW, targetH);

      const radial = ctx.createRadialGradient(
        targetW / 2,
        targetH / 2,
        10 * baseScale,
        targetW / 2,
        targetH / 2,
        Math.max(targetW, targetH) * 0.55
      );
      radial.addColorStop(0, hex);
      radial.addColorStop(0.65, `${hex}44`);
      radial.addColorStop(1, '#09090B');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, targetW, targetH);

      // Glowing Center Card
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 1. Title HEX
      const maxTitleW = targetW * 0.85;
      const { text: titleText, size: titleSize } = fitText(
        ctx,
        hex,
        maxTitleW,
        'monospace',
        Math.max(24, Math.round(52 * baseScale)),
        20,
        'bold'
      );
      ctx.font = `bold ${titleSize}px monospace`;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(titleText, targetW / 2, targetH / 2 - 24 * baseScale);

      // 2. Color Name
      const { text: nameText, size: nameSize } = fitText(
        ctx,
        activeColor.name || 'Universal Color Palette',
        maxTitleW,
        'system-ui, sans-serif',
        Math.max(15, Math.round(24 * baseScale)),
        13,
        '600'
      );
      ctx.font = `600 ${nameSize}px system-ui, sans-serif`;
      ctx.fillStyle = '#E4E4E7';
      ctx.fillText(nameText, targetW / 2, targetH / 2 + 20 * baseScale);

      // 3. Specs Subtitle (Split into 2 lines if portrait or narrow to prevent cut-off)
      if (isPortrait) {
        ctx.font = `500 ${Math.max(14, Math.round(18 * baseScale))}px monospace`;
        ctx.fillStyle = '#A1A1AA';
        ctx.fillText(`RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}`, targetW / 2, targetH / 2 + 65 * baseScale);
        ctx.fillText(`HSL: ${hsl.h}°, ${hsl.s}%, ${hsl.l}%`, targetW / 2, targetH / 2 + 95 * baseScale);
      } else {
        const fullSpec = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})  ·  hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)`;
        const { text: specText, size: specSize } = fitText(
          ctx,
          fullSpec,
          maxTitleW,
          'system-ui, monospace',
          Math.max(13, Math.round(18 * baseScale)),
          11,
          '500'
        );
        ctx.font = `500 ${specSize}px system-ui, monospace`;
        ctx.fillStyle = '#A1A1AA';
        ctx.fillText(specText, targetW / 2, targetH / 2 + 58 * baseScale);
      }
    } else {
      // Spec Card Style
      // Neutral crisp canvas backdrop
      ctx.fillStyle = '#121215';
      ctx.fillRect(0, 0, targetW, targetH);

      const margin = Math.round(minDim * 0.055);
      const cardX = margin;
      const cardY = margin;
      const cardW = targetW - margin * 2;
      const cardH = targetH - margin * 2;
      const cornerRadius = Math.round(20 * baseScale);

      // Card frame
      ctx.fillStyle = '#1F1F24';
      ctx.beginPath();
      drawRoundRect(ctx, cardX, cardY, cardW, cardH, cornerRadius);
      ctx.fill();

      // Card outer border
      ctx.strokeStyle = '#2E2E35';
      ctx.lineWidth = Math.max(1, Math.round(1.5 * baseScale));
      ctx.stroke();

      const padding = Math.round(16 * baseScale);

      if (isPortrait) {
        // --- PORTRAIT LAYOUT (e.g. Mobile Wallpaper 1080x1920) ---
        const swatchH = Math.round(cardH * 0.58);
        const swatchW = cardW - padding * 2;

        // Swatch block
        ctx.fillStyle = hex;
        ctx.beginPath();
        drawRoundRect(ctx, cardX + padding, cardY + padding, swatchW, swatchH, Math.round(14 * baseScale));
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF18';
        ctx.lineWidth = Math.max(1, 1.5 * baseScale);
        ctx.stroke();

        // Info Area
        const infoStartY = cardY + padding + swatchH + 28 * baseScale;
        const leftX = cardX + padding + 12 * baseScale;
        const rightX = cardX + cardW - padding - 12 * baseScale;
        const availableW = rightX - leftX;

        // HEX Code
        const { text: hexStr, size: hexFontSize } = fitText(
          ctx,
          hex,
          availableW,
          'monospace',
          Math.max(26, Math.round(44 * baseScale)),
          22,
          'bold'
        );
        ctx.font = `bold ${hexFontSize}px monospace`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(hexStr, leftX, infoStartY);

        // Color Name
        const nameY = infoStartY + hexFontSize + 8 * baseScale;
        const { text: nameStr, size: nameFontSize } = fitText(
          ctx,
          activeColor.name || 'Universal Palette Anchor',
          availableW,
          'system-ui, sans-serif',
          Math.max(16, Math.round(22 * baseScale)),
          13,
          '500'
        );
        ctx.font = `500 ${nameFontSize}px system-ui, sans-serif`;
        ctx.fillStyle = '#A1A1AA';
        ctx.fillText(nameStr, leftX, nameY);

        // Separator line
        const sepY = nameY + nameFontSize + 20 * baseScale;
        ctx.strokeStyle = '#2E2E35';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftX, sepY);
        ctx.lineTo(rightX, sepY);
        ctx.stroke();

        // Specs 3-Row List
        const specRows = [
          { label: 'RGB Model', value: `${rgb.r}, ${rgb.g}, ${rgb.b}` },
          { label: 'HSL Space', value: `${hsl.h}°, ${hsl.s}%, ${hsl.l}%` },
          { label: 'CMYK Print', value: `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%` },
        ];

        const rowStartY = sepY + 18 * baseScale;
        const rowHeight = 32 * baseScale;
        ctx.font = `bold ${Math.max(13, Math.round(16 * baseScale))}px monospace`;

        specRows.forEach((row, i) => {
          const y = rowStartY + i * rowHeight;
          ctx.textAlign = 'left';
          ctx.fillStyle = '#71717A';
          ctx.fillText(row.label, leftX, y);

          ctx.textAlign = 'right';
          ctx.fillStyle = '#F4F4F5';
          ctx.fillText(row.value, rightX, y);
        });

        // Branding footer
        ctx.textAlign = 'center';
        ctx.fillStyle = '#52525B';
        ctx.font = `600 ${Math.max(11, Math.round(13 * baseScale))}px system-ui, sans-serif`;
        ctx.fillText('Color Encyclopedia Studio', targetW / 2, cardY + cardH - 20 * baseScale);
      } else {
        // --- LANDSCAPE & SQUARE LAYOUT (Catalog, Desktop, Social, Square) ---
        const swatchH = Math.round(cardH * 0.52);
        const swatchW = cardW - padding * 2;

        // Swatch block
        ctx.fillStyle = hex;
        ctx.beginPath();
        drawRoundRect(ctx, cardX + padding, cardY + padding, swatchW, swatchH, Math.round(14 * baseScale));
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF18';
        ctx.lineWidth = Math.max(1, 1.5 * baseScale);
        ctx.stroke();

        // Specs Info Section
        const infoY = cardY + padding + swatchH + 20 * baseScale;
        const leftColX = cardX + padding + 8 * baseScale;
        const midColX = cardX + cardW * 0.46;
        const rightEdgeX = cardX + cardW - padding - 8 * baseScale;
        const leftColMaxW = midColX - leftColX - 16 * baseScale;

        // 1. Left Column: HEX and Color Name
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const { text: hexStr, size: hexFontSize } = fitText(
          ctx,
          hex,
          leftColMaxW,
          'monospace',
          Math.max(22, Math.round(36 * baseScale)),
          18,
          'bold'
        );
        ctx.font = `bold ${hexFontSize}px monospace`;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(hexStr, leftColX, infoY);

        const nameY = infoY + hexFontSize + 6 * baseScale;
        const { text: nameStr, size: nameFontSize } = fitText(
          ctx,
          activeColor.name || 'Universal Color Spec',
          leftColMaxW,
          'system-ui, sans-serif',
          Math.max(13, Math.round(17 * baseScale)),
          11,
          '500'
        );
        ctx.font = `500 ${nameFontSize}px system-ui, sans-serif`;
        ctx.fillStyle = '#A1A1AA';
        ctx.fillText(nameStr, leftColX, nameY);

        // 2. Right Column: RGB, HSL, CMYK specifications
        const rowSpacing = Math.round(22 * baseScale);
        const specRows = [
          { label: 'RGB:', value: `${rgb.r}, ${rgb.g}, ${rgb.b}` },
          { label: 'HSL:', value: `${hsl.h}°, ${hsl.s}%, ${hsl.l}%` },
          { label: 'CMYK:', value: `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%` },
        ];

        specRows.forEach((row, i) => {
          const y = infoY + i * rowSpacing;

          // Label (left-aligned at midColX)
          ctx.textAlign = 'left';
          ctx.font = `bold ${Math.max(12, Math.round(14 * baseScale))}px monospace`;
          ctx.fillStyle = '#71717A';
          ctx.fillText(row.label, midColX, y);

          // Value (right-aligned at rightEdgeX)
          ctx.textAlign = 'right';
          const maxValW = rightEdgeX - midColX - 60 * baseScale;
          const { text: valStr, size: valSize } = fitText(
            ctx,
            row.value,
            maxValW,
            'monospace',
            Math.max(12, Math.round(14 * baseScale)),
            10,
            'bold'
          );
          ctx.font = `bold ${valSize}px monospace`;
          ctx.fillStyle = '#F4F4F5';
          ctx.fillText(valStr, rightEdgeX, y);
        });

        // 3. Footer branding
        ctx.textAlign = 'right';
        ctx.fillStyle = '#52525B';
        ctx.font = `600 ${Math.max(10, Math.round(12 * baseScale))}px system-ui, sans-serif`;
        ctx.fillText('Color Encyclopedia Studio', rightEdgeX, cardY + cardH - 12 * baseScale);
      }
    }
  };

  // Re-render preview canvas whenever activeColor, resolution, or layout changes
  useEffect(() => {
    if (!previewCanvasRef.current) return;
    // Always render at native resolution so canvas coordinate math and quality are 100% faithful
    drawCard(previewCanvasRef.current, activeRes.width, activeRes.height);
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

            <div className="max-w-full overflow-hidden flex items-center justify-center p-2 rounded-xl shadow-xl bg-zinc-950/20 dark:bg-black/40 border border-black/10 dark:border-white/10">
              <canvas
                ref={previewCanvasRef}
                className="max-w-full max-h-[440px] w-auto h-auto object-contain rounded-lg"
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
