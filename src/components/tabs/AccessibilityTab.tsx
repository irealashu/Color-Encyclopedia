import React, { useState } from 'react';
import { ActiveColor } from '../../types';
import {
  evaluateWCAG,
  getAllCVDResults,
  hexToRgb,
  rgbToHex,
} from '../../utils/colorMath';
import {
  Eye,
  CheckCircle2,
  XCircle,
  Copy,
  Type,
  Shuffle,
  ShieldCheck,
  AlertTriangle,
  ArrowRightLeft,
} from 'lucide-react';

interface AccessibilityTabProps {
  activeColor: ActiveColor;
  onSelectColor: (hex: string, name?: string) => void;
  onCopyText: (text: string, label: string) => void;
}

export const AccessibilityTab: React.FC<AccessibilityTabProps> = ({
  activeColor,
  onSelectColor,
  onCopyText,
}) => {
  // WCAG background state (defaults to pure white #FFFFFF, but user can customize)
  const [bgHex, setBgHex] = useState<string>('#FFFFFF');
  const [isSwapped, setIsSwapped] = useState<boolean>(false); // Active color as background vs text

  const bgRgb = hexToRgb(bgHex) || { r: 255, g: 255, b: 255 };
  const wcag = evaluateWCAG(activeColor.rgb, bgRgb);
  const cvdResults = getAllCVDResults(activeColor.rgb);

  // Quick preset backgrounds
  const bgPresets = [
    { label: 'White', hex: '#FFFFFF' },
    { label: 'Off-White', hex: '#F8FAFC' },
    { label: 'Charcoal', hex: '#1E293B' },
    { label: 'Black', hex: '#000000' },
    { label: 'Navy', hex: '#0F172A' },
  ];

  // Colors for preview
  const textColor = isSwapped ? bgHex : activeColor.hex;
  const surfaceColor = isSwapped ? activeColor.hex : bgHex;

  return (
    <div id="accessibility-tab-view" className="space-y-10">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Accessibility & Optics
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          WCAG 2.1 contrast compliance matrix, interactive typography legibility sandbox, and physiological color vision deficiency simulation.
        </p>
      </div>

      {/* 1. WCAG 2.1 Contrast Checker */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              WCAG 2.1 Contrast Compliance Checker
            </h3>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Ratio: {wcag.ratioAgainstBg}:1
          </span>
        </div>

        {/* Background customizer & swap controls */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Test Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgHex}
                  onChange={(e) => setBgHex(e.target.value.toUpperCase())}
                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                />
                <input
                  type="text"
                  value={bgHex}
                  maxLength={7}
                  onChange={(e) => setBgHex(e.target.value)}
                  className="w-24 px-2 py-1 text-xs font-mono font-bold uppercase rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="hidden sm:flex items-center gap-1.5">
                {bgPresets.map((p) => (
                  <button
                    key={p.hex}
                    onClick={() => setBgHex(p.hex)}
                    className="px-2.5 py-1 text-xs rounded-lg font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Swap Text & Background */}
            <button
              onClick={() => setIsSwapped(!isSwapped)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Swap Text / Background
            </button>
          </div>

          {/* Typography Preview Sandbox */}
          <div
            className="p-6 rounded-xl border border-black/10 dark:border-white/10 transition-colors space-y-3 shadow-inner"
            style={{ backgroundColor: surfaceColor, color: textColor }}
          >
            <div className="flex items-center justify-between border-b border-current/15 pb-2">
              <span className="text-xs font-mono uppercase tracking-wider opacity-75 font-semibold">
                Typography Legibility Sandbox · {isSwapped ? 'Active Color as Background' : 'Active Color as Text'}
              </span>
              <span className="text-xs font-mono font-bold">
                {wcag.ratioAgainstBg}:1 Contrast
              </span>
            </div>
            <h4 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
              Sphinx of black quartz, judge my vow.
            </h4>
            <p className="text-sm leading-relaxed max-w-3xl opacity-90">
              Visual perception relies on sufficient luminance contrast between glyph strokes and the surrounding surface. Clear contrast enhances readability for digital users across varied ambient lighting environments.
            </p>
          </div>

          {/* 4-Item Pass/Fail Compliance Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {[
              {
                title: 'WCAG AA Normal Text',
                req: '≥ 4.5:1',
                desc: 'Body text < 18pt (24px)',
                passed: wcag.aaNormal,
              },
              {
                title: 'WCAG AA Large Text',
                req: '≥ 3.0:1',
                desc: 'Headings ≥ 18pt or 14pt bold',
                passed: wcag.aaLarge,
              },
              {
                title: 'WCAG AAA Normal Text',
                req: '≥ 7.0:1',
                desc: 'Enhanced body contrast',
                passed: wcag.aaaNormal,
              },
              {
                title: 'WCAG AAA Large Text',
                req: '≥ 4.5:1',
                desc: 'Enhanced display headings',
                passed: wcag.aaaLarge,
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`p-4 rounded-xl border transition-all ${
                  item.passed
                    ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/80'
                    : 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </span>
                  {item.passed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Pass
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                      <XCircle className="w-4 h-4" /> Fail
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Requirement: {item.req}</span>
                  <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                    {wcag.ratioAgainstBg}:1
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Color Vision Deficiency (CVD) Simulator */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Color Vision Deficiency (CVD) Simulator
            </h3>
          </div>
          <span className="text-xs text-zinc-400">
            Physiological Brettel & Vienot Transformation Matrix
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cvdResults.map((result) => (
            <div
              key={result.type}
              id={`cvd-card-${result.type}`}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {result.title}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-mono text-zinc-600 dark:text-zinc-400">
                    {result.prevalence}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 min-h-[32px]">
                  {result.description}
                </p>
              </div>

              {/* Side-by-side: Normal vs Simulated */}
              <div className="space-y-2">
                <div className="flex rounded-xl overflow-hidden h-16 border border-zinc-200 dark:border-zinc-800 shadow-inner">
                  {/* Normal side */}
                  <div
                    className="flex-1 flex items-center justify-center text-[10px] font-mono font-bold text-white drop-shadow-md relative group cursor-pointer"
                    style={{ backgroundColor: activeColor.hex }}
                    onClick={() => onCopyText(activeColor.hex, 'Normal HEX')}
                    title="Normal vision color"
                  >
                    <span>Original</span>
                  </div>
                  {/* Simulated side */}
                  <div
                    className="flex-1 flex items-center justify-center text-[10px] font-mono font-bold text-white drop-shadow-md relative group cursor-pointer"
                    style={{ backgroundColor: result.simulatedHex }}
                    onClick={() => onSelectColor(result.simulatedHex, `${result.title} Simulated`)}
                    title={`Click to set simulated ${result.simulatedHex} as active`}
                  >
                    <span>Simulated</span>
                  </div>
                </div>

                {/* Simulated Spec details */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Perceived HEX:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    <span>{result.simulatedHex}</span>
                    <button
                      onClick={() => onCopyText(result.simulatedHex, `${result.title} HEX`)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
                      title="Copy simulated hex"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulated UI Micro-card preview */}
              <div
                className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] space-y-1.5"
                style={{ backgroundColor: `${result.simulatedHex}15` }}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: result.simulatedHex }}
                  />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    UI Element Perception
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">
                  Status buttons & charts render with this perceived tone.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
