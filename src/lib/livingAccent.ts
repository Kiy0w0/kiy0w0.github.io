import { useEffect } from "react";

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue(p, q, h + 1 / 3) * 255),
    Math.round(hue(p, q, h) * 255),
    Math.round(hue(p, q, h - 1 / 3) * 255),
  ];
}

function clamp(r: number, g: number, b: number): string {
  const [h, s, l] = rgbToHsl(r, g, b);
  const ns = Math.max(s, 0.45);
  const nl = Math.min(Math.max(l, 0.6), 0.72);
  const [nr, ng, nb] = hslToRgb(h, ns, nl);
  return `rgb(${nr}, ${ng}, ${nb})`;
}

async function dominantColor(url: string): Promise<string | null> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  try {
    await img.decode();
  } catch {
    return null;
  }
  const size = 16;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, size, size);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, size, size).data;
  } catch {
    return null;
  }

  let best = { score: -1, r: 0, g: 0, b: 0 };
  const avg = { r: 0, g: 0, b: 0, n: 0 };
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (data[i + 3] < 200) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const light = (max + min) / 2 / 255;
    const sat = max === min ? 0 : (max - min) / (max + min === 0 ? 1 : max + min);
    avg.r += r;
    avg.g += g;
    avg.b += b;
    avg.n++;
    if (light < 0.15 || light > 0.85) continue;
    const score = sat * (1 - Math.abs(light - 0.55));
    if (score > best.score) best = { score, r, g, b };
  }

  if (best.score <= 0) {
    if (avg.n === 0) return null;
    return clamp(Math.round(avg.r / avg.n), Math.round(avg.g / avg.n), Math.round(avg.b / avg.n));
  }
  return clamp(best.r, best.g, best.b);
}

export function useLivingAccent(url: string | null) {
  useEffect(() => {
    const root = document.documentElement;
    if (!url) {
      root.style.removeProperty("--accent");
      return;
    }
    let alive = true;
    dominantColor(url).then((color) => {
      if (alive && color) root.style.setProperty("--accent", color);
    });
    return () => {
      alive = false;
    };
  }, [url]);
}
