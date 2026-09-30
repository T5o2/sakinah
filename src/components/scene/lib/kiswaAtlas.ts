import { CanvasTexture, SRGBColorSpace } from "three";
import {
  DOOR_CENTER_X,
  KISWA_ATLAS,
  KISWA_Y0,
  KISWA_Y1,
} from "../landmarks/kaaba";
import { HALF_X, KAABA } from "./layout";
import { PALETTE } from "./palette";
import { eightPointStar } from "./textures";

/**
 * The kiswa atlas: every wall of the Kaaba painted onto one canvas pair.
 *
 * - colour canvas → map (and emissiveMap, so the gold glows faintly at night)
 * - ORM canvas    → aoMap (R), roughnessMap (G), metalnessMap (B)
 *
 * The ORM channels let one material be matte black fabric, white cotton and
 * polished gold at once. Low "AO" on the fabric keeps the environment light
 * off it, so the kiswa stays black while the gold reflects.
 *
 * Respect rule: every ornament is abstract geometry — stars, lattices,
 * frames, lantern silhouettes. No calligraphy and nothing letter-like.
 *
 * Drawing happens in wall metres with y up (a canvas transform per wall).
 */

interface Surface {
  color: string;
  orm: string;
}

function orm(ao: number, roughness: number, metalness: number): string {
  const c = (v: number) => Math.round(v * 255);
  return `rgb(${c(ao)}, ${c(roughness)}, ${c(metalness)})`;
}

const FABRIC: Surface = { color: "#0b0b0d", orm: orm(0.12, 0.9, 0) };
const JACQUARD: Surface = { color: "#17171a", orm: orm(0.14, 0.75, 0) };
const ROOF: Surface = { color: "#08080a", orm: orm(0, 0.95, 0) };
const CLOTH: Surface = { color: "#e9e5dc", orm: orm(0.55, 0.95, 0) };
const CLOTH_HEM: Surface = { color: "#cfc9bd", orm: orm(0.5, 0.95, 0) };
const HEM_SHADOW: Surface = { color: "#030304", orm: orm(0.04, 0.95, 0) };
const GOLD: Surface = { color: PALETTE.gold, orm: orm(1, 0.3, 0.85) };
const GOLD_SOFT: Surface = { color: PALETTE.goldSoft, orm: orm(1, 0.26, 0.85) };
const GOLD_DEEP: Surface = { color: PALETTE.goldDeep, orm: orm(1, 0.45, 0.8) };

/** Wall width the atlas regions are painted at; the shorter walls stretch ~15%. */
const WALL_M = KAABA.sizeX;
const BELT_BOTTOM = KAABA.beltY - KAABA.beltHeight / 2;
const BELT_TOP = KAABA.beltY + KAABA.beltHeight / 2;

type Ctx = CanvasRenderingContext2D;

class Painter {
  constructor(private readonly ctxs: [Ctx, Ctx]) {}

  /** Runs `draw` on both canvases with the surface's colour and ORM values. */
  with(surface: Surface, draw: (ctx: Ctx) => void) {
    const [color, ormCtx] = this.ctxs;
    color.fillStyle = color.strokeStyle = surface.color;
    draw(color);
    ormCtx.fillStyle = ormCtx.strokeStyle = surface.orm;
    draw(ormCtx);
  }

  rect(surface: Surface, x0: number, y0: number, x1: number, y1: number) {
    this.with(surface, (ctx) => ctx.fillRect(x0, y0, x1 - x0, y1 - y0));
  }

  strokeRect(
    surface: Surface,
    width: number,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
  ) {
    this.with(surface, (ctx) => {
      ctx.lineWidth = width;
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    });
  }

  star(surface: Surface, width: number, cx: number, cy: number, r: number) {
    this.with(surface, (ctx) => {
      ctx.lineWidth = width;
      eightPointStar(ctx, cx, cy, r);
    });
  }

  dot(surface: Surface, cx: number, cy: number, r: number) {
    this.with(surface, (ctx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /** Only the colour canvas: shading that must not change the material. */
  colorOnly(draw: (ctx: Ctx) => void) {
    draw(this.ctxs[0]);
  }

  forEachCtx(fn: (ctx: Ctx) => void) {
    for (const ctx of this.ctxs) fn(ctx);
  }
}

/** Black fabric with a faint tone-on-tone lattice woven into it. */
function paintFabric(p: Painter) {
  p.rect(FABRIC, 0, KISWA_Y0, WALL_M, KISWA_Y1);
  const spacing = 0.62;
  p.with(JACQUARD, (ctx) => {
    ctx.lineWidth = 0.022;
    ctx.beginPath();
    for (let k = -30; k < 60; k++) {
      const x = k * spacing;
      ctx.moveTo(x, KAABA.whiteClothTop);
      ctx.lineTo(x + (KISWA_Y1 - KAABA.whiteClothTop), KISWA_Y1);
      ctx.moveTo(x, KISWA_Y1);
      ctx.lineTo(x + (KISWA_Y1 - KAABA.whiteClothTop), KAABA.whiteClothTop);
    }
    ctx.stroke();
  });
}

/** Hajj season: white cotton wrapped round the lower walls, with soft folds. */
function paintWhiteCloth(p: Painter) {
  const top = KAABA.whiteClothTop;
  p.rect(CLOTH, 0, KISWA_Y0, WALL_M, top);
  p.colorOnly((ctx) => {
    // Irregular, soft folds (fixed pseudo-random spacing so the atlas is stable).
    let seed = 11;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let x = 0.2; x < WALL_M; x += 0.35 + rand() * 0.45) {
      const half = 0.12 + rand() * 0.14;
      const g = ctx.createLinearGradient(x - half, 0, x + half, 0);
      g.addColorStop(0, "rgba(120, 112, 98, 0)");
      g.addColorStop(0.5, `rgba(120, 112, 98, ${0.06 + rand() * 0.08})`);
      g.addColorStop(1, "rgba(120, 112, 98, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - half, KISWA_Y0, half * 2, top - KISWA_Y0);
    }
  });
  // Rolled hem, and the kiswa's shadow on it.
  p.rect(CLOTH_HEM, 0, top - 0.08, WALL_M, top);
  p.rect(HEM_SHADOW, 0, top, WALL_M, top + 0.06);
}

/** The hizam: a gold frieze of stars in cartouches between framing rules. */
function paintBelt(p: Painter) {
  p.rect(GOLD_DEEP, 0, BELT_BOTTOM, WALL_M, BELT_TOP);
  for (const [y0, y1] of [
    [BELT_TOP - 0.075, BELT_TOP - 0.04],
    [BELT_BOTTOM + 0.04, BELT_BOTTOM + 0.075],
  ] as const) {
    p.rect(GOLD_SOFT, 0, y0, WALL_M, y1);
  }
  const step = 0.95;
  for (let cx = step / 2; cx < WALL_M; cx += step) {
    p.strokeRect(
      GOLD,
      0.022,
      cx - 0.37,
      KAABA.beltY - 0.28,
      cx + 0.37,
      KAABA.beltY + 0.28,
    );
    p.star(GOLD_SOFT, 0.03, cx, KAABA.beltY, 0.2);
    p.dot(GOLD_SOFT, cx + step / 2, KAABA.beltY, 0.045);
  }
}

/** Gold panel hanging below the belt, filled with a star lattice. */
function paintPanel(p: Painter, cx: number, width: number, height: number) {
  const top = BELT_BOTTOM - 0.1;
  const x0 = cx - width / 2;
  const x1 = cx + width / 2;
  const y0 = top - height;
  p.rect(GOLD_DEEP, x0, y0, x1, top);
  p.strokeRect(GOLD, 0.045, x0 + 0.03, y0 + 0.03, x1 - 0.03, top - 0.03);
  p.strokeRect(GOLD_SOFT, 0.02, x0 + 0.11, y0 + 0.11, x1 - 0.11, top - 0.11);
  const cy = y0 + height / 2;
  p.with(GOLD, (ctx) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0 + 0.13, y0 + 0.13, width - 0.26, height - 0.26);
    ctx.clip();
    ctx.lineWidth = 0.014;
    ctx.beginPath();
    for (let k = -8; k <= 8; k++) {
      const x = cx + k * 0.16;
      ctx.moveTo(x - height, cy - height);
      ctx.lineTo(x + height, cy + height);
      ctx.moveTo(x - height, cy + height);
      ctx.lineTo(x + height, cy - height);
    }
    ctx.stroke();
    ctx.restore();
  });
  p.dot(GOLD_DEEP, cx, cy, 0.25);
  p.star(GOLD_SOFT, 0.035, cx, cy, 0.27);
  p.dot(GOLD_SOFT, cx, cy, 0.06);
  // A small pendant drop under the panel.
  p.with(GOLD, (ctx) => {
    ctx.beginPath();
    ctx.moveTo(cx - 0.14, y0);
    ctx.lineTo(cx + 0.14, y0);
    ctx.lineTo(cx, y0 - 0.2);
    ctx.closePath();
    ctx.fill();
  });
}

/** An embroidered lantern (qandil) hanging from the belt on a chain. */
function paintLantern(p: Painter, cx: number) {
  let y = BELT_BOTTOM - 0.02;
  for (let i = 0; i < 8; i++, y -= 0.09) p.dot(GOLD, cx, y, 0.028);

  const capTop = y;
  const shoulder = capTop - 0.14;
  const waist = shoulder - 0.42;
  const base = waist - 0.5;
  p.with(GOLD, (ctx) => {
    ctx.beginPath();
    ctx.moveTo(cx - 0.12, capTop);
    ctx.lineTo(cx + 0.12, capTop);
    ctx.lineTo(cx + 0.24, shoulder);
    ctx.lineTo(cx - 0.24, shoulder);
    ctx.closePath();
    ctx.fill();
  });
  const body = (ctx: Ctx) => {
    ctx.beginPath();
    ctx.moveTo(cx - 0.24, shoulder);
    ctx.lineTo(cx + 0.24, shoulder);
    ctx.lineTo(cx + 0.33, waist);
    ctx.lineTo(cx + 0.2, base);
    ctx.lineTo(cx - 0.2, base);
    ctx.lineTo(cx - 0.33, waist);
    ctx.closePath();
  };
  p.with(GOLD_DEEP, (ctx) => {
    body(ctx);
    ctx.fill();
  });
  p.with(GOLD, (ctx) => {
    ctx.lineWidth = 0.035;
    body(ctx);
    ctx.stroke();
    ctx.lineWidth = 0.018;
    ctx.beginPath();
    for (const dx of [-0.12, 0, 0.12]) {
      ctx.moveTo(cx + dx, shoulder - 0.05);
      ctx.lineTo(cx + dx * 0.8, base + 0.05);
    }
    ctx.stroke();
  });
  p.star(GOLD_SOFT, 0.025, cx, (shoulder + base) / 2 + 0.05, 0.13);
  p.with(GOLD, (ctx) => {
    ctx.beginPath();
    ctx.moveTo(cx - 0.2, base);
    ctx.lineTo(cx + 0.2, base);
    ctx.lineTo(cx, base - 0.28);
    ctx.closePath();
    ctx.fill();
  });
  p.dot(GOLD_SOFT, cx, base - 0.33, 0.05);
}

/** The door: gold leaves with star panels inside an ornamented gold surround and lintel. */
function paintDoor(p: Painter, cx: number) {
  const { width, height, bottom } = KAABA.door;
  const x0 = cx - width / 2;
  const x1 = cx + width / 2;
  const top = bottom + height;

  // Surround and lintel, studded with small stars.
  const sx0 = x0 - 0.34;
  const sx1 = x1 + 0.34;
  const sy0 = bottom - 0.22;
  const sy1 = top + 0.62;
  p.rect(GOLD, sx0, sy0, sx1, sy1);
  p.strokeRect(GOLD_DEEP, 0.04, sx0 + 0.03, sy0 + 0.03, sx1 - 0.03, sy1 - 0.03);
  p.rect(GOLD_DEEP, x0 - 0.04, bottom - 0.04, x1 + 0.04, top + 0.04);
  for (let y = sy0 + 0.2; y < top; y += 0.24) {
    p.star(GOLD_DEEP, 0.02, sx0 + 0.16, y, 0.075);
    p.star(GOLD_DEEP, 0.02, sx1 - 0.16, y, 0.075);
  }
  for (let x = x0 + 0.1; x < x1; x += 0.3)
    p.star(GOLD_DEEP, 0.022, x + 0.05, top + 0.34, 0.1);

  // Leaves.
  p.rect(GOLD, x0, bottom, x1, top);
  p.rect(GOLD_DEEP, cx - 0.025, bottom, cx + 0.025, top);
  const rows = 5;
  const cellH = (height - 0.2) / rows;
  for (const leaf of [x0, cx]) {
    for (let r = 0; r < rows; r++) {
      const y = bottom + 0.1 + r * cellH;
      p.strokeRect(
        GOLD_DEEP,
        0.025,
        leaf + 0.1,
        y + 0.05,
        leaf + width / 2 - 0.1,
        y + cellH - 0.05,
      );
      p.star(
        GOLD_SOFT,
        0.02,
        leaf + width / 4,
        y + cellH / 2,
        Math.min(width / 4, cellH / 2) * 0.55,
      );
    }
  }
  p.dot(GOLD_SOFT, cx - 0.12, bottom + height * 0.45, 0.05);
  p.dot(GOLD_SOFT, cx + 0.12, bottom + height * 0.45, 0.05);
}

function paintWall(p: Painter, isDoorWall: boolean) {
  paintFabric(p);
  paintWhiteCloth(p);
  paintBelt(p);
  if (isDoorWall) {
    // x measured from the Black Stone corner along the door wall.
    const doorX = DOOR_CENTER_X + HALF_X;
    paintLantern(p, doorX - 1.9);
    paintLantern(p, doorX + 1.95);
    for (const cx of [7.4, 10.3]) paintPanel(p, cx, 1.3, 0.85);
    paintDoor(p, doorX);
  } else {
    for (const cx of [1.5, 4.5, 7.4, 10.4]) paintPanel(p, cx, 1.3, 0.85);
  }
}

export interface KiswaTextures {
  color: CanvasTexture;
  orm: CanvasTexture;
}

/** Paints the atlas at `width` × `width/2` pixels (door wall | other walls). */
export function createKiswaTextures(width: number): KiswaTextures {
  const height = width / 2;
  const canvases = [0, 1].map(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas is unavailable");
    return { canvas, ctx };
  }) as [
    { canvas: HTMLCanvasElement; ctx: Ctx },
    { canvas: HTMLCanvasElement; ctx: Ctx },
  ];
  const painter = new Painter([canvases[0].ctx, canvases[1].ctx]);

  const regions = [
    { u: KISWA_ATLAS.doorWall, isDoorWall: true },
    { u: KISWA_ATLAS.otherWalls, isDoorWall: false },
  ];
  for (const { u, isDoorWall } of regions) {
    const x0 = u[0] * width;
    const regionW = (u[1] - u[0]) * width;
    const sx = regionW / WALL_M;
    const sy = height / (KISWA_Y1 - KISWA_Y0);
    painter.forEachCtx((ctx) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, 0, regionW, height);
      ctx.clip();
      // Wall metres, y up: canvas x = x0 + sx·x, canvas y = (Y1 − y)·sy.
      ctx.setTransform(sx, 0, 0, -sy, x0, KISWA_Y1 * sy);
    });
    paintWall(painter, isDoorWall);
    painter.forEachCtx((ctx) => ctx.restore());
  }

  // Roof swatch (pixel space): solid black that ignores the environment.
  const { u0, u1, v0, v1 } = KISWA_ATLAS.roofSwatch;
  painter.with(ROOF, (ctx) =>
    ctx.fillRect(
      u0 * width,
      (1 - v1) * height,
      (u1 - u0) * width + 1,
      (v1 - v0) * height + 1,
    ),
  );

  const color = new CanvasTexture(canvases[0].canvas);
  color.colorSpace = SRGBColorSpace;
  color.anisotropy = 8;
  const ormTexture = new CanvasTexture(canvases[1].canvas);
  ormTexture.anisotropy = 8;
  return { color, orm: ormTexture };
}
