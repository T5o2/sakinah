import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { PALETTE } from "./palette";

/**
 * Procedural textures drawn on a 2D canvas at runtime: nothing is downloaded.
 *
 * Respect rule: every ornament here is abstract geometry (eight-point stars,
 * lattices, frames). No calligraphy and no letter-like strokes are ever drawn.
 */

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas is unavailable");
  return { canvas, ctx };
}

function toTexture(canvas: HTMLCanvasElement): CanvasTexture {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Eight-point star (two overlapping squares) centred on (cx, cy). */
export function eightPointStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
) {
  for (const turn of [0, Math.PI / 4]) {
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = turn + (i * Math.PI) / 2 + Math.PI / 4;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
}

/**
 * One glass panel of the Maqam's hexagonal cage (repeated six times round it):
 * a gold frame and pointed arch over clear glass, with an interlaced star
 * lattice inside the arch and a finer lattice in the spandrels.
 */
export function createMaqamLatticeTexture(): CanvasTexture {
  const w = 256;
  const h = 512;
  const { canvas, ctx } = createCanvas(w, h);
  ctx.fillStyle = "rgba(250, 232, 190, 0.14)";
  ctx.fillRect(0, 0, w, h);

  const arch = new Path2D();
  arch.moveTo(40, h - 30);
  arch.lineTo(40, 190);
  arch.quadraticCurveTo(40, 90, w / 2, 56);
  arch.quadraticCurveTo(w - 40, 90, w - 40, 190);
  arch.lineTo(w - 40, h - 30);
  arch.closePath();

  ctx.strokeStyle = PALETTE.gold;
  ctx.fillStyle = PALETTE.gold;

  // Spandrels: fine ring lattice between the frame and the arch.
  ctx.save();
  const outside = new Path2D();
  outside.rect(0, 0, w, h);
  outside.addPath(arch);
  ctx.clip(outside, "evenodd");
  ctx.lineWidth = 2;
  for (let y = 12; y < h; y += 22) {
    for (let x = 12; x < w; x += 22) {
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Inside the arch: interlaced stars joined by a diagonal grid.
  ctx.save();
  ctx.clip(arch);
  ctx.lineWidth = 3;
  const step = 44;
  for (let y = 70; y < h; y += step) {
    for (let x = w / 2 - step * 2; x <= w / 2 + step * 2; x += step) {
      eightPointStar(ctx, x, y, 15);
    }
  }
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let k = -12; k < 24; k++) {
    ctx.moveTo(k * step, 0);
    ctx.lineTo(k * step + h, h);
    ctx.moveTo(k * step + h, 0);
    ctx.lineTo(k * step, h);
  }
  ctx.stroke();
  ctx.restore();

  ctx.lineWidth = 8;
  ctx.stroke(arch);
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, w - 16, h - 16);

  const texture = toTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.repeat.set(6, 1);
  return texture;
}

/**
 * Inlay band on the outer face of the Hijr wall: white marble carrying a dark
 * grey interlaced geometric line (one tile, repeated along the arc).
 */
export function createHijrBandTexture(): CanvasTexture {
  const w = 256;
  const h = 128;
  const { canvas, ctx } = createCanvas(w, h);
  ctx.fillStyle = PALETTE.marble;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#4b4a48";
  ctx.lineWidth = 5;
  ctx.strokeRect(0, 10, w, h - 20);
  ctx.lineWidth = 4;
  // Interlaced octagon and diamond, meeting the neighbouring tiles at the edges.
  const cx = w / 2;
  const cy = h / 2;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const x = cx + 40 * Math.cos(a);
    const y = cy + 40 * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.moveTo(0, cy);
  ctx.lineTo(cx - 40, 18);
  ctx.moveTo(0, cy);
  ctx.lineTo(cx - 40, h - 18);
  ctx.moveTo(w, cy);
  ctx.lineTo(cx + 40, 18);
  ctx.moveTo(w, cy);
  ctx.lineTo(cx + 40, h - 18);
  ctx.stroke();
  eightPointStar(ctx, cx, cy, 18);

  const texture = toTexture(canvas);
  texture.wrapS = RepeatWrapping;
  return texture;
}

/**
 * The low gates across Hijr Ismail's openings: two gold leaves of pierced
 * lattice (transparent holes), with a solid rail and crest along the top.
 */
export function createHijrGateTexture(): CanvasTexture {
  const w = 512;
  const h = 256;
  const { canvas, ctx } = createCanvas(w, h);
  // Solid gold leaves…
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(0, 0, w, h);
  // …pierced with round openings (transparent where alpha is cut away).
  ctx.globalCompositeOperation = "destination-out";
  for (const x0 of [0, w / 2]) {
    for (let y = 78; y < h - 16; y += 44) {
      for (let x = x0 + 34; x < x0 + w / 2 - 20; x += 44) {
        ctx.beginPath();
        ctx.arc(x, y, 17, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.globalCompositeOperation = "source-over";
  // A gold star inside every opening, and framing rules.
  ctx.strokeStyle = PALETTE.goldSoft;
  ctx.lineWidth = 5;
  for (const x0 of [0, w / 2]) {
    for (let y = 78; y < h - 16; y += 44) {
      for (let x = x0 + 34; x < x0 + w / 2 - 20; x += 44)
        eightPointStar(ctx, x, y, 11);
    }
    ctx.strokeRect(x0 + 6, 6, w / 2 - 12, h - 12);
    ctx.strokeRect(x0 + 6, 6, w / 2 - 12, 42);
    for (let x = x0 + 30; x < x0 + w / 2 - 10; x += 34)
      eightPointStar(ctx, x, 27, 9);
  }
  return toTexture(canvas);
}

/**
 * Mataf floor: pale marble that glows under the Kaaba and falls off into
 * the night, with faint rings that give the eye a sense of scale.
 */
export function createFloorTexture(size: number): CanvasTexture {
  const { canvas, ctx } = createCanvas(size, size);
  const c = size / 2;

  const glow = ctx.createRadialGradient(c, c, 0, c, c, c);
  glow.addColorStop(0, PALETTE.marble);
  glow.addColorStop(0.28, PALETTE.marbleShade);
  glow.addColorStop(0.5, "#7a7367");
  glow.addColorStop(0.72, "#27231e");
  glow.addColorStop(1, "#100f0d");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(60, 50, 38, 0.07)";
  ctx.lineWidth = Math.max(1, size / 512);
  for (let r = size * 0.16; r < c; r += size * 0.045) {
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Sparse speckle so the marble does not read as flat plastic.
  const speckles = Math.round(size * size * 0.004);
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < speckles; i++) {
    ctx.fillStyle = `rgba(120, 110, 95, ${0.05 + rand() * 0.06})`;
    ctx.fillRect(rand() * size, rand() * size, 1.5, 1.5);
  }
  return toTexture(canvas);
}
