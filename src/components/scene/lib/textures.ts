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
function eightPointStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
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
 * Kiswa belt (hizam): one horizontal tile of a geometric frieze.
 * The tile is 8:1, so a 0.95 m band repeats roughly every 7.6 m.
 */
export function createBeltTexture(): CanvasTexture {
  const w = 1024;
  const h = 128;
  const { canvas, ctx } = createCanvas(w, h);

  ctx.fillStyle = PALETTE.goldDeep;
  ctx.fillRect(0, 0, w, h);

  // Framing rules along both edges.
  ctx.fillStyle = PALETTE.goldSoft;
  ctx.fillRect(0, 8, w, 5);
  ctx.fillRect(0, h - 13, w, 5);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(0, 18, w, 2);
  ctx.fillRect(0, h - 20, w, 2);

  // Stars in cartouches, with small rosettes between them.
  ctx.lineWidth = 4;
  const step = 128;
  for (let x = step / 2; x < w; x += step) {
    ctx.strokeStyle = PALETTE.goldSoft;
    eightPointStar(ctx, x, h / 2, 34);
    ctx.strokeStyle = PALETTE.gold;
    ctx.strokeRect(x - 52, 28, 104, h - 56);
    ctx.fillStyle = PALETTE.goldSoft;
    ctx.beginPath();
    ctx.arc(x + step / 2, h / 2, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = toTexture(canvas);
  texture.wrapS = RepeatWrapping;
  return texture;
}

/** Door leaf: a grid of raised panels, each with a geometric star. */
export function createDoorTexture(): CanvasTexture {
  const w = 256;
  const h = 512;
  const { canvas, ctx } = createCanvas(w, h);

  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = PALETTE.goldDeep;
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, w - 16, h - 16);
  // Split between the two leaves.
  ctx.fillStyle = PALETTE.goldDeep;
  ctx.fillRect(w / 2 - 3, 8, 6, h - 16);

  ctx.lineWidth = 4;
  const cols = 2;
  const rows = 4;
  const cellW = (w - 40) / cols;
  const cellH = (h - 40) / rows;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = 20 + c * cellW;
      const y = 20 + r * cellH;
      ctx.strokeStyle = PALETTE.goldDeep;
      ctx.strokeRect(x + 8, y + 8, cellW - 16, cellH - 16);
      ctx.strokeStyle = PALETTE.goldSoft;
      eightPointStar(ctx, x + cellW / 2, y + cellH / 2, Math.min(cellW, cellH) * 0.28);
    }
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
