import { RGB, HSL, CMYK, HarmonySet, CVDDeficiency, CVDResult } from '../types';

// Clamp a number between min and max
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

// Convert HEX string to RGB (handles 3, 6 digit hex with or without #)
export function hexToRgb(hexInput: string): RGB | null {
  let hex = hexInput.trim().replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length !== 6) {
    return null;
  }
  const num = parseInt(hex, 16);
  if (isNaN(num)) return null;

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Convert RGB to 6-digit uppercase HEX
export function rgbToHex(rgb: RGB): string {
  const r = clamp(Math.round(rgb.r), 0, 255);
  const g = clamp(Math.round(rgb.g), 0, 255);
  const b = clamp(Math.round(rgb.b), 0, 255);
  const toHex = (c: number) => c.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert RGB to HSL
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert HSL to RGB
export function hslToRgb(hsl: HSL): RGB {
  const h = ((hsl.h % 360) + 360) % 360 / 360;
  const s = clamp(hsl.s, 0, 100) / 100;
  const l = clamp(hsl.l, 0, 100) / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let tc = t;
      if (tc < 0) tc += 1;
      if (tc > 1) tc -= 1;
      if (tc < 1 / 6) return p + (q - p) * 6 * tc;
      if (tc < 1 / 2) return q;
      if (tc < 2 / 3) return p + (q - p) * (2 / 3 - tc) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Convert RGB to CMYK
export function rgbToCmyk(rgb: RGB): CMYK {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const k = 1 - Math.max(r, g, b);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

// Convert CMYK to RGB
export function cmykToRgb(cmyk: CMYK): RGB {
  const c = clamp(cmyk.c, 0, 100) / 100;
  const m = clamp(cmyk.m, 0, 100) / 100;
  const y = clamp(cmyk.y, 0, 100) / 100;
  const k = clamp(cmyk.k, 0, 100) / 100;

  const r = Math.round(255 * (1 - c) * (1 - k));
  const g = Math.round(255 * (1 - m) * (1 - k));
  const b = Math.round(255 * (1 - y) * (1 - k));

  return { r, g, b };
}

// Calculate relative luminance according to WCAG 2.1
export function getRelativeLuminance(rgb: RGB): number {
  const sRGB = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
  const linear = sRGB.map(val => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

// Calculate contrast ratio between two colors
export function getContrastRatio(rgb1: RGB, rgb2: RGB): number {
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Number(ratio.toFixed(2));
}

// WCAG Compliance evaluation
export interface WCAGCompliance {
  ratioAgainstWhite: number;
  ratioAgainstBlack: number;
  ratioAgainstBg: number;
  aaNormal: boolean; // >= 4.5
  aaLarge: boolean;  // >= 3.0
  aaaNormal: boolean; // >= 7.0
  aaaLarge: boolean;  // >= 4.5
  bestTextColor: string; // '#000000' or '#FFFFFF' for highest contrast on active color
}

export function evaluateWCAG(colorRgb: RGB, backgroundRgb: RGB = { r: 255, g: 255, b: 255 }): WCAGCompliance {
  const white: RGB = { r: 255, g: 255, b: 255 };
  const black: RGB = { r: 0, g: 0, b: 0 };

  const ratioAgainstWhite = getContrastRatio(colorRgb, white);
  const ratioAgainstBlack = getContrastRatio(colorRgb, black);
  const ratioAgainstBg = getContrastRatio(colorRgb, backgroundRgb);

  return {
    ratioAgainstWhite,
    ratioAgainstBlack,
    ratioAgainstBg,
    aaNormal: ratioAgainstBg >= 4.5,
    aaLarge: ratioAgainstBg >= 3.0,
    aaaNormal: ratioAgainstBg >= 7.0,
    aaaLarge: ratioAgainstBg >= 4.5,
    bestTextColor: ratioAgainstWhite >= ratioAgainstBlack ? '#FFFFFF' : '#000000',
  };
}

// Color Vision Deficiency (CVD) simulation matrices
// Standard Brettel / Vienot simulation algorithms
export function simulateCVD(rgb: RGB, type: CVDDeficiency): RGB {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  let simR = r;
  let simG = g;
  let simB = b;

  if (type === 'protanopia') {
    // Red-blind
    simR = 0.56667 * r + 0.43333 * g + 0.0 * b;
    simG = 0.55833 * r + 0.44167 * g + 0.0 * b;
    simB = 0.0 * r + 0.24167 * g + 0.75833 * b;
  } else if (type === 'deuteranopia') {
    // Green-blind
    simR = 0.625 * r + 0.375 * g + 0.0 * b;
    simG = 0.70 * r + 0.30 * g + 0.0 * b;
    simB = 0.0 * r + 0.30 * g + 0.70 * b;
  } else if (type === 'tritanopia') {
    // Blue-blind
    simR = 0.95 * r + 0.05 * g + 0.0 * b;
    simG = 0.0 * r + 0.43333 * g + 0.56667 * b;
    simB = 0.0 * r + 0.475 * g + 0.525 * b;
  } else if (type === 'achromatopsia') {
    // Monochromatic (luminance only)
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    simR = gray;
    simG = gray;
    simB = gray;
  }

  return {
    r: clamp(Math.round(simR * 255), 0, 255),
    g: clamp(Math.round(simG * 255), 0, 255),
    b: clamp(Math.round(simB * 255), 0, 255),
  };
}

export function getAllCVDResults(rgb: RGB): CVDResult[] {
  const definitions: { type: CVDDeficiency; title: string; description: string; prevalence: string }[] = [
    {
      type: 'protanopia',
      title: 'Protanopia',
      description: 'L-cone absence; complete insensitivity to red light wavelengths.',
      prevalence: '~1.0% of males',
    },
    {
      type: 'deuteranopia',
      title: 'Deuteranopia',
      description: 'M-cone absence; difficulty distinguishing green, yellow, and red spectrums.',
      prevalence: '~1.1% of males',
    },
    {
      type: 'tritanopia',
      title: 'Tritanopia',
      description: 'S-cone deficiency; confusion between blue and yellow hues.',
      prevalence: '~0.003% of population',
    },
    {
      type: 'achromatopsia',
      title: 'Achromatopsia',
      description: 'Complete monochromatic color blindness; perceiving only lightness shades.',
      prevalence: '~0.003% of population',
    },
  ];

  return definitions.map(def => {
    const simRgb = simulateCVD(rgb, def.type);
    return {
      ...def,
      simulatedRgb: simRgb,
      simulatedHex: rgbToHex(simRgb),
    };
  });
}

// Generate Classical Harmonies
export function generateHarmonies(hsl: HSL): HarmonySet[] {
  const normalizeHue = (h: number) => ((h % 360) + 360) % 360;

  const toHexFromHue = (hue: number, s: number = hsl.s, l: number = hsl.l) => {
    return rgbToHex(hslToRgb({ h: normalizeHue(hue), s, l }));
  };

  return [
    {
      name: 'Complementary',
      description: 'Opposite on the 360° color wheel (+180°). High contrast and energetic tension.',
      colors: [
        toHexFromHue(hsl.h),
        toHexFromHue(hsl.h + 180),
      ],
    },
    {
      name: 'Analogous',
      description: 'Adjacent harmonious neighbors (-30°, 0°, +30°). Natural, cohesive, and tranquil.',
      colors: [
        toHexFromHue(hsl.h - 30),
        toHexFromHue(hsl.h),
        toHexFromHue(hsl.h + 30),
      ],
    },
    {
      name: 'Triadic',
      description: 'Equilateral triangle spacing (0°, +120°, +240°). Balanced visual vibrancy.',
      colors: [
        toHexFromHue(hsl.h),
        toHexFromHue(hsl.h + 120),
        toHexFromHue(hsl.h + 240),
      ],
    },
    {
      name: 'Tetradic Square',
      description: 'Four points at 90° intervals (0°, +90°, +180°, +270°). Rich, diverse palette.',
      colors: [
        toHexFromHue(hsl.h),
        toHexFromHue(hsl.h + 90),
        toHexFromHue(hsl.h + 180),
        toHexFromHue(hsl.h + 270),
      ],
    },
    {
      name: 'Split-Complementary',
      description: 'Base color plus two adjacent to its complement (0°, +150°, +210°). High contrast with less tension.',
      colors: [
        toHexFromHue(hsl.h),
        toHexFromHue(hsl.h + 150),
        toHexFromHue(hsl.h + 210),
      ],
    },
    {
      name: 'Monochromatic',
      description: 'Variations in luminance and saturation across the identical hue angle.',
      colors: [
        toHexFromHue(hsl.h, clamp(hsl.s - 20, 10, 100), clamp(hsl.l + 30, 20, 95)),
        toHexFromHue(hsl.h, hsl.s, clamp(hsl.l + 15, 15, 90)),
        toHexFromHue(hsl.h, hsl.s, hsl.l),
        toHexFromHue(hsl.h, hsl.s, clamp(hsl.l - 15, 10, 85)),
        toHexFromHue(hsl.h, clamp(hsl.s + 10, 20, 100), clamp(hsl.l - 30, 5, 75)),
      ],
    },
  ];
}

// Generate random harmonious or vibrant color
export function generateRandomHex(): string {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return rgbToHex({ r, g, b });
}

// Build complete active color object from HEX
export function buildActiveColor(hexInput: string, alpha: number = 1): {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  cmyk: CMYK;
  alpha: number;
} {
  const rgb = hexToRgb(hexInput) || { r: 59, g: 130, b: 246 };
  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);
  const cmyk = rgbToCmyk(rgb);
  return {
    hex,
    rgb,
    hsl,
    cmyk,
    alpha: clamp(alpha, 0, 1),
  };
}
