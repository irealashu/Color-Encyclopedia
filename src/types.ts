export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
}

export interface ActiveColor {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  cmyk: CMYK;
  alpha: number; // 0 to 1
  name?: string;
}

export type NavTab = 
  | 'explore' 
  | 'engines' 
  | 'studios' 
  | 'accessibility' 
  | 'downloader'
  | 'exports' 
  | 'favorites';

export interface ColorItem {
  id: string;
  name: string;
  hex: string;
  category: 'css' | 'material' | 'tailwind' | 'pastel' | 'neon';
  description?: string;
}

export interface HarmonySet {
  name: string;
  description: string;
  colors: string[];
}

export type CVDDeficiency = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface CVDResult {
  type: CVDDeficiency;
  title: string;
  description: string;
  prevalence: string;
  simulatedHex: string;
  simulatedRgb: RGB;
}

export type DownloadResolutionKey = 'square' | 'desktop' | 'mobile' | 'social' | 'catalog';

export interface DownloadResolution {
  key: DownloadResolutionKey;
  label: string;
  width: number;
  height: number;
  aspect: string;
  subtext: string;
}

export type CardLayoutStyle = 'spec' | 'solid' | 'radial';
export type ExportFormat = 'png' | 'jpeg' | 'webp';

export interface ToastMessage {
  id: string;
  type: 'copy' | 'favorite' | 'download' | 'info' | 'success';
  title: string;
  detail?: string;
}

export interface HistoryItem {
  hex: string;
  name?: string;
  timestamp: number;
}
