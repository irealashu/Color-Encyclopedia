import { rgbToHex } from './colorMath';

interface ColorBox {
  rMin: number;
  rMax: number;
  gMin: number;
  gMax: number;
  bMin: number;
  bMax: number;
  pixels: [number, number, number][];
}

// Median Cut Quantization for extracting clean dominant swatches
function getBoxDimensions(box: ColorBox) {
  let rMin = 255, rMax = 0;
  let gMin = 255, gMax = 0;
  let bMin = 255, bMax = 0;

  for (const [r, g, b] of box.pixels) {
    if (r < rMin) rMin = r;
    if (r > rMax) rMax = r;
    if (g < gMin) gMin = g;
    if (g > gMax) gMax = g;
    if (b < bMin) bMin = b;
    if (b > bMax) bMax = b;
  }

  box.rMin = rMin;
  box.rMax = rMax;
  box.gMin = gMin;
  box.gMax = gMax;
  box.bMin = bMin;
  box.bMax = bMax;

  const rRange = rMax - rMin;
  const gRange = gMax - gMin;
  const bRange = bMax - bMin;

  return { rRange, gRange, bRange, maxRange: Math.max(rRange, gRange, bRange) };
}

function splitBox(box: ColorBox): [ColorBox, ColorBox] {
  const { rRange, gRange, bRange } = getBoxDimensions(box);
  let sortIndex = 0;
  if (gRange >= rRange && gRange >= bRange) {
    sortIndex = 1;
  } else if (bRange >= rRange && bRange >= gRange) {
    sortIndex = 2;
  }

  box.pixels.sort((a, b) => a[sortIndex] - b[sortIndex]);
  const mid = Math.floor(box.pixels.length / 2);

  const box1: ColorBox = {
    rMin: 0, rMax: 255, gMin: 0, gMax: 255, bMin: 0, bMax: 255,
    pixels: box.pixels.slice(0, mid),
  };
  const box2: ColorBox = {
    rMin: 0, rMax: 255, gMin: 0, gMax: 255, bMin: 0, bMax: 255,
    pixels: box.pixels.slice(mid),
  };

  return [box1, box2];
}

export function extractPaletteFromImageData(ctx: CanvasRenderingContext2D, width: number, height: number, count: number = 6): string[] {
  // Downsample to max 120x120 for fast responsive computation
  const targetW = Math.min(width, 120);
  const targetH = Math.min(height, 120);

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = targetW;
  tempCanvas.height = targetH;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  tempCtx.drawImage(ctx.canvas, 0, 0, targetW, targetH);
  const imgData = tempCtx.getImageData(0, 0, targetW, targetH).data;

  const validPixels: [number, number, number][] = [];
  // Sample every 2nd pixel
  for (let i = 0; i < imgData.length; i += 8) {
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];
    const a = imgData[i + 3];

    // Filter out transparent and pure white/black extremes to give richer palettes
    if (a > 128) {
      validPixels.push([r, g, b]);
    }
  }

  if (validPixels.length === 0) {
    return ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  }

  let boxes: ColorBox[] = [{
    rMin: 0, rMax: 255, gMin: 0, gMax: 255, bMin: 0, bMax: 255,
    pixels: validPixels,
  }];

  while (boxes.length < count) {
    // Find box with greatest range
    let bestBoxIdx = 0;
    let maxRange = -1;

    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].pixels.length < 2) continue;
      const dims = getBoxDimensions(boxes[i]);
      if (dims.maxRange > maxRange) {
        maxRange = dims.maxRange;
        bestBoxIdx = i;
      }
    }

    if (maxRange <= 0) break; // Cannot split further

    const boxToSplit = boxes.splice(bestBoxIdx, 1)[0];
    const [b1, b2] = splitBox(boxToSplit);
    boxes.push(b1);
    boxes.push(b2);
  }

  // Average each box
  const hexColors: string[] = [];
  for (const b of boxes) {
    if (b.pixels.length === 0) continue;
    let rSum = 0, gSum = 0, bSum = 0;
    for (const [r, g, bVal] of b.pixels) {
      rSum += r;
      gSum += g;
      bSum += bVal;
    }
    const count = b.pixels.length;
    const avgR = Math.round(rSum / count);
    const avgG = Math.round(gSum / count);
    const avgB = Math.round(bSum / count);
    const hex = rgbToHex({ r: avgR, g: avgG, b: avgB });
    if (!hexColors.includes(hex)) {
      hexColors.push(hex);
    }
  }

  // Ensure count is satisfied with fallbacks if duplicates removed
  while (hexColors.length < count) {
    hexColors.push('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase());
  }

  return hexColors.slice(0, count);
}
