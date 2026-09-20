import React, { useState, useEffect } from 'react';
import { ActiveColor, RGB, HSL, CMYK } from '../../types';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToCmyk,
  cmykToRgb,
  clamp,
} from '../../utils/colorMath';
import { Sliders, Copy, Hash, Paintbrush, Layers, Printer } from 'lucide-react';

interface EnginesTabProps {
  activeColor: ActiveColor;
  onChangeColor: (newColor: ActiveColor) => void;
  onCopyText: (text: string, label: string) => void;
}

export const EnginesTab: React.FC<EnginesTabProps> = ({
  activeColor,
  onChangeColor,
  onCopyText,
}) => {
  const [hexInput, setHexInput] = useState<string>(activeColor.hex);
  const [hexError, setHexError] = useState<string | null>(null);

  // Sync internal hex text when activeColor changes externally
  useEffect(() => {
    setHexInput(activeColor.hex);
    setHexError(null);
  }, [activeColor.hex]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) {
      val = '#' + val;
    }
    setHexInput(val);

    const rgb = hexToRgb(val);
    if (rgb) {
      setHexError(null);
      const hex = rgbToHex(rgb);
      const hsl = rgbToHsl(rgb);
      const cmyk = rgbToCmyk(rgb);
      onChangeColor({
        hex,
        rgb,
        hsl,
        cmyk,
        alpha: activeColor.alpha,
      });
    } else {
      if (val.length > 1) {
        setHexError('Invalid 3 or 6 digit hex code');
      }
    }
  };

  const updateFromRgb = (newRgb: RGB) => {
    const hex = rgbToHex(newRgb);
    const hsl = rgbToHsl(newRgb);
    const cmyk = rgbToCmyk(newRgb);
    onChangeColor({
      hex,
      rgb: newRgb,
      hsl,
      cmyk,
      alpha: activeColor.alpha,
    });
  };

  const updateFromHsl = (newHsl: HSL) => {
    const rgb = hslToRgb(newHsl);
    const hex = rgbToHex(rgb);
    const cmyk = rgbToCmyk(rgb);
    onChangeColor({
      hex,
      rgb,
      hsl: newHsl,
      cmyk,
      alpha: activeColor.alpha,
    });
  };

  const updateFromCmyk = (newCmyk: CMYK) => {
    const rgb = cmykToRgb(newCmyk);
    const hex = rgbToHex(rgb);
    const hsl = rgbToHsl(rgb);
    onChangeColor({
      hex,
      rgb,
      hsl,
      cmyk: newCmyk,
      alpha: activeColor.alpha,
    });
  };

  const handleAlphaChange = (alpha: number) => {
    onChangeColor({
      ...activeColor,
      alpha: clamp(alpha, 0, 1),
    });
  };

  const rgbaCode = `rgba(${activeColor.rgb.r}, ${activeColor.rgb.g}, ${activeColor.rgb.b}, ${activeColor.alpha.toFixed(2)})`;

  return (
    <div id="engines-tab-view" className="space-y-8">
      {/* Title & Description */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Mathematical Color Space Engines & Converters
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Real-time synchronized additive (RGB), cylindrical (HSL), subtractive print (CMYK), and floating-point alpha channel engines.
        </p>
      </div>

      {/* Direct Hex & Alpha Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Direct Hexadecimal Input */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="direct-hex-input"
              className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"
            >
              <Hash className="w-3.5 h-3.5" />
              Direct Hexadecimal Input
            </label>
            <button
              onClick={() => onCopyText(activeColor.hex, 'HEX')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
          <div className="relative">
            <input
              id="direct-hex-input"
              type="text"
              maxLength={7}
              value={hexInput}
              onChange={handleHexChange}
              className={`w-full px-4 py-2.5 rounded-xl font-mono text-lg font-bold bg-zinc-50 dark:bg-zinc-800/80 border transition-all text-zinc-900 dark:text-zinc-100 uppercase tracking-widest ${
                hexError
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                  : 'border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100'
              }`}
            />
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg border border-black/10 dark:border-white/20 shadow-xs"
              style={{ backgroundColor: activeColor.hex }}
            />
          </div>
          {hexError && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium">{hexError}</p>
          )}
          <p className="text-xs text-zinc-400 mt-2">
            Accepts #RGB or #RRGGBB. Updates all color spaces synchronously in real-time.
          </p>
        </div>

        {/* Alpha & Opacity Control */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="alpha-slider-input"
              className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              Alpha & Opacity Control
            </label>
            <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {Math.round(activeColor.alpha * 100)}% ({activeColor.alpha.toFixed(2)})
            </span>
          </div>
          <input
            id="alpha-slider-input"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={activeColor.alpha}
            onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
            className="w-full h-2.5 rounded-lg appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-700 accent-zinc-900 dark:accent-zinc-100"
          />
          <div className="flex items-center justify-between mt-3">
            <code className="text-xs font-mono text-zinc-600 dark:text-zinc-300 truncate">
              {rgbaCode}
            </code>
            <button
              onClick={() => onCopyText(rgbaCode, 'CSS rgba')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium shrink-0 ml-2"
            >
              <Copy className="w-3 h-3" /> Copy CSS
            </button>
          </div>
        </div>
      </div>

      {/* 3 Color Engine Channels: RGB, HSL, CMYK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RGB Channel Sliders */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Paintbrush className="w-4 h-4 text-rose-500" />
                RGB Additive Mixing
              </h3>
              <button
                onClick={() =>
                  onCopyText(
                    `rgb(${activeColor.rgb.r}, ${activeColor.rgb.g}, ${activeColor.rgb.b})`,
                    'RGB'
                  )
                }
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Screen primaries on an 8-bit scale [0–255].
            </p>
          </div>

          <div className="space-y-4">
            {/* Red */}
            <div>
              <div className="flex justify-between text-xs font-mono font-medium mb-1">
                <span className="text-rose-600 dark:text-rose-400 font-bold">Red (R)</span>
                <span className="text-zinc-700 dark:text-zinc-300">{activeColor.rgb.r}</span>
              </div>
              <input
                id="rgb-r-slider"
                type="range"
                min={0}
                max={255}
                value={activeColor.rgb.r}
                onChange={(e) =>
                  updateFromRgb({ ...activeColor.rgb, r: parseInt(e.target.value) })
                }
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-rose-600 bg-gradient-to-r from-black to-red-600"
              />
            </div>

            {/* Green */}
            <div>
              <div className="flex justify-between text-xs font-mono font-medium mb-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Green (G)</span>
                <span className="text-zinc-700 dark:text-zinc-300">{activeColor.rgb.g}</span>
              </div>
              <input
                id="rgb-g-slider"
                type="range"
                min={0}
                max={255}
                value={activeColor.rgb.g}
                onChange={(e) =>
                  updateFromRgb({ ...activeColor.rgb, g: parseInt(e.target.value) })
                }
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-600 bg-gradient-to-r from-black to-green-600"
              />
            </div>

            {/* Blue */}
            <div>
              <div className="flex justify-between text-xs font-mono font-medium mb-1">
                <span className="text-blue-600 dark:text-blue-400 font-bold">Blue (B)</span>
                <span className="text-zinc-700 dark:text-zinc-300">{activeColor.rgb.b}</span>
              </div>
              <input
                id="rgb-b-slider"
                type="range"
                min={0}
                max={255}
                value={activeColor.rgb.b}
                onChange={(e) =>
                  updateFromRgb({ ...activeColor.rgb, b: parseInt(e.target.value) })
                }
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-gradient-to-r from-black to-blue-600"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 font-mono text-xs text-zinc-600 dark:text-zinc-400 text-center">
            rgb({activeColor.rgb.r}, {activeColor.rgb.g}, {activeColor.rgb.b})
          </div>
        </div>

        {/* HSL Cylindrical Sliders */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-500" />
                HSL Cylindrical Space
              </h3>
              <button
                onClick={() =>
                  onCopyText(
                    `hsl(${activeColor.hsl.h}, ${activeColor.hsl.s}%, ${activeColor.hsl.l}%)`,
                    'HSL'
                  )
                }
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Human-perceptual hue, saturation, and lightness.
            </p>
          </div>

          <div className="space-y-4">
            {/* Hue */}
            <div>
              <div className="flex justify-between text-xs font-mono font-medium mb-1">
                <span className="text-purple-600 dark:text-purple-400 font-bold">Hue (H)</span>
                <span className="text-zinc-700 dark:text-zinc-300">{activeColor.hsl.h}°</span>
              </div>
              <input
                id="hsl-h-slider"
                type="range"
                min={0}
                max={360}
                value={activeColor.hsl.h}
                onChange={(e) =>
                  updateFromHsl({ ...activeColor.hsl, h: parseInt(e.target.value) })
                }
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-600"
                style={{
                  background:
                    'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                }}
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex justify-between text-xs font-mono font-medium mb-1">
                <span className="text-purple-600 dark:text-purple-400 font-bold">Saturation (S)</span>
                <span className="text-zinc-700 dark:text-zinc-300">{activeColor.hsl.s}%</span>
              </div>
              <input
                id="hsl-s-slider"
                type="range"
                min={0}
                max={100}
                value={activeColor.hsl.s}
                onChange={(e) =>
                  updateFromHsl({ ...activeColor.hsl, s: parseInt(e.target.value) })
                }
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-600 bg-gradient-to-r from-gray-400 to-indigo-600"
              />
            </div>

            {/* Lightness */}
            <div>
              <div className="flex justify-between text-xs font-mono font-medium mb-1">
                <span className="text-purple-600 dark:text-purple-400 font-bold">Lightness (L)</span>
                <span className="text-zinc-700 dark:text-zinc-300">{activeColor.hsl.l}%</span>
              </div>
              <input
                id="hsl-l-slider"
                type="range"
                min={0}
                max={100}
                value={activeColor.hsl.l}
                onChange={(e) =>
                  updateFromHsl({ ...activeColor.hsl, l: parseInt(e.target.value) })
                }
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-600 bg-gradient-to-r from-black via-gray-400 to-white"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 font-mono text-xs text-zinc-600 dark:text-zinc-400 text-center">
            hsl({activeColor.hsl.h}°, {activeColor.hsl.s}%, {activeColor.hsl.l}%)
          </div>
        </div>

        {/* CMYK Printing Sliders */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Printer className="w-4 h-4 text-cyan-500" />
                CMYK Subtractive Ink
              </h3>
              <button
                onClick={() =>
                  onCopyText(
                    `cmyk(${activeColor.cmyk.c}%, ${activeColor.cmyk.m}%, ${activeColor.cmyk.y}%, ${activeColor.cmyk.k}%)`,
                    'CMYK'
                  )
                }
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Four-color process printing separation ink percentages.
            </p>
          </div>

          <div className="space-y-3">
            {/* Cyan */}
            <div>
              <div className="flex justify-between text-xs font-mono font-medium mb-1">
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">Cyan (C)</span>
                <span className="text-zinc-700 dark:text-zinc-300">{activeColor.cmyk.c}%</span>
              </div>
              <input
                id="cmyk-c-slider"
                type="range"
                min={0}
                max={100}
                value={activeColor.cmyk.c}
                onChange={(e) =>
                  updateFromCmyk({ ...activeColor.cmyk, c: parseInt(e.target.value) })
                }
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-cyan-600 bg-gradient-to-r from-white to-cyan-500"
              />
            </div>

            {/* Magenta */}
            <div>
              <div className="flex justify-between text-xs font-mono font-medium mb-1">
                <span className="text-fuchsia-600 dark:text-fuchsia-400 font-bold">Magenta (M)</span>
                <span className="text-zinc-700 dark:text-zinc-300">{activeColor.cmyk.m}%</span>
              </div>
              <input
                id="cmyk-m-slider"
                type="range"
                min={0}
                max={100}
                value={activeColor.cmyk.m}
                onChange={(e) =>
                  updateFromCmyk({ ...activeColor.cmyk, m: parseInt(e.target.value) })
                }
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-fuchsia-600 bg-gradient-to-r from-white to-fuchsia-500"
              />
            </div>

            {/* Yellow */}
            <div>
              <div className="flex justify-between text-xs font-mono font-medium mb-1">
                <span className="text-amber-600 dark:text-amber-400 font-bold">Yellow (Y)</span>
                <span className="text-zinc-700 dark:text-zinc-300">{activeColor.cmyk.y}%</span>
              </div>
              <input
                id="cmyk-y-slider"
                type="range"
                min={0}
                max={100}
                value={activeColor.cmyk.y}
                onChange={(e) =>
                  updateFromCmyk({ ...activeColor.cmyk, y: parseInt(e.target.value) })
                }
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-amber-500 bg-gradient-to-r from-white to-yellow-400"
              />
            </div>

            {/* Key / Black */}
            <div>
              <div className="flex justify-between text-xs font-mono font-medium mb-1">
                <span className="text-zinc-600 dark:text-zinc-400 font-bold">Key / Black (K)</span>
                <span className="text-zinc-700 dark:text-zinc-300">{activeColor.cmyk.k}%</span>
              </div>
              <input
                id="cmyk-k-slider"
                type="range"
                min={0}
                max={100}
                value={activeColor.cmyk.k}
                onChange={(e) =>
                  updateFromCmyk({ ...activeColor.cmyk, k: parseInt(e.target.value) })
                }
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-zinc-800 bg-gradient-to-r from-white to-black"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 font-mono text-xs text-zinc-600 dark:text-zinc-400 text-center">
            cmyk({activeColor.cmyk.c}%, {activeColor.cmyk.m}%, {activeColor.cmyk.y}%, {activeColor.cmyk.k}%)
          </div>
        </div>
      </div>
    </div>
  );
};
