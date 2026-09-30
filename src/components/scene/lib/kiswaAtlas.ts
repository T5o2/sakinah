import { CanvasTexture, SRGBColorSpace } from "three";
import {
  BELT_BOTTOM,
  BELT_TOP,
  KISWA_ATLAS,
  KISWA_Y0,
  KISWA_Y1,
  SITARA_TOP,
} from "../landmarks/kaaba";
import { KAABA } from "./layout";
import { PALETTE } from "./palette";
import { eightPointStar } from "./textures";

/**
 * The kiswa atlas: every wall of the Kaaba painted onto three canvases.
 *
 * - colour → map (and emissiveMap, so the gold glows faintly at night)
 * - ORM    → aoMap (R), roughnessMap (G), metalnessMap (B)
 * - height → turned into a normal map, so the embroidery stands out and the
 *            black-on-black weave catches the light
 *
 * ORM lets one material be matte black fabric, white cotton, stone and
 * polished gold at once. Low "AO" on the fabric keeps environment light off
 * it so the kiswa stays black; the woven pattern gets more, so it glints.
 *
 * Respect rule: wherever the real kiswa carries calligraphy, this atlas has
 * geometric and floral ornament of similar density and placement — stars,
 * lattices, rosettes, palmettes, arches, lantern silhouettes. Shapes are
 * filled and symmetric; there are no free-flowing strokes and nothing
 * letter-like.
 *
 * Drawing happens in wall metres with y up (a canvas transform per wall).
 */

interface Surface {
  color: string;
  /** ambient occlusion (scales environment light), roughness, metalness — 0..1 */
  orm: [number, number, number];
  /** 0..1, for the normal map. */
  height: number;
}

const surf = (
  color: string,
  ao: number,
  rough: number,
  metal: number,
  height: number,
): Surface => ({ color, orm: [ao, rough, metal], height });

const FABRIC = surf("#0b0b0d", 0.12, 0.9, 0, 0.25);
const WEAVE = surf("#131316", 0.32, 0.5, 0, 0.36);
const CLOTH = surf("#f4f2ec", 0.85, 0.95, 0, 0.3);
const CLOTH_HEM = surf("#dedad1", 0.75, 0.95, 0, 0.36);
const HEM_SHADOW = surf("#030304", 0.04, 0.95, 0, 0.2);
const MORTAR = surf("#766b5d", 0.5, 0.9, 0, 0.26);
const STONE_SHADES = ["#5c5044", "#66594b", "#54493e", "#605346", "#4f453b"];
const GROUND = surf("#0f0d0a", 0.3, 0.7, 0.1, 0.45);
const GOLD = surf(PALETTE.gold, 1, 0.3, 0.85, 0.75);
const GOLD_SOFT = surf(PALETTE.goldSoft, 1, 0.26, 0.85, 0.92);
const GOLD_DEEP = surf(PALETTE.goldDeep, 1, 0.45, 0.8, 0.6);

/** Wall width the atlas regions are painted at; the shorter walls stretch ~15%. */
const WALL_M = KAABA.sizeX;
/** Door, curtain and lantern column positions, in metres from the Black Stone corner. */
const DOOR_X = KAABA.door.fromBlackStoneCorner;
const SITARA_X0 = DOOR_X - KAABA.sitara.width / 2;
const SITARA_X1 = DOOR_X + KAABA.sitara.width / 2;
/** Separate panels and roundels hanging below the belt, clear of it. */
const PANEL_TOP = BELT_BOTTOM - 0.35;
const PANEL_H = 0.6;
const PANEL_CY = PANEL_TOP - PANEL_H / 2;
/** Roundels along the belt; long panels fill the wide gaps between them. */
const BELT_ROUNDELS = [0.55, KAABA.sizeX / 2, KAABA.sizeX - 0.55];

/** How strongly the height map bends the normals. */
const NORMAL_STRENGTH = 2.6;

type Ctx = CanvasRenderingContext2D;

function css([r, g, b]: [number, number, number]) {
  const c = (v: number) => Math.round(v * 255);
  return `rgb(${c(r)}, ${c(g)}, ${c(b)})`;
}

class Painter {
  constructor(private readonly ctx: { color: Ctx; orm: Ctx; height: Ctx }) {}

  /** Runs `draw` on all three canvases with the surface's values. */
  with(s: Surface, draw: (ctx: Ctx) => void) {
    const { color, orm, height } = this.ctx;
    const h = Math.round(s.height * 255);
    const passes: [Ctx, string][] = [
      [color, s.color],
      [orm, css(s.orm)],
      [height, `rgb(${h}, ${h}, ${h})`],
    ];
    for (const [ctx, style] of passes) {
      ctx.fillStyle = ctx.strokeStyle = style;
      draw(ctx);
    }
  }

  rect(s: Surface, x0: number, y0: number, x1: number, y1: number) {
    this.with(s, (ctx) => ctx.fillRect(x0, y0, x1 - x0, y1 - y0));
  }

  frame(s: Surface, w: number, x0: number, y0: number, x1: number, y1: number) {
    this.with(s, (ctx) => {
      ctx.lineWidth = w;
      ctx.strokeRect(x0 + w / 2, y0 + w / 2, x1 - x0 - w, y1 - y0 - w);
    });
  }

  star(s: Surface, w: number, cx: number, cy: number, r: number) {
    this.with(s, (ctx) => {
      ctx.lineWidth = w;
      eightPointStar(ctx, cx, cy, r);
    });
  }

  disc(s: Surface, cx: number, cy: number, r: number) {
    this.with(s, (ctx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ring(s: Surface, w: number, cx: number, cy: number, r: number) {
    this.with(s, (ctx) => {
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  /** A rosette of `n` almond-shaped petals. */
  rosette(s: Surface, cx: number, cy: number, r: number, n = 8) {
    this.with(s, (ctx) => {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const px = cx + Math.cos(a) * r * 0.55;
        const py = cy + Math.sin(a) * r * 0.55;
        ctx.moveTo(px + Math.cos(a) * r * 0.45, py + Math.sin(a) * r * 0.45);
        ctx.ellipse(px, py, r * 0.45, r * 0.16, a, 0, Math.PI * 2);
      }
      ctx.fill();
    });
  }

  /** A palmette: a fan of petals rising from a small base. */
  palmette(s: Surface, cx: number, cy: number, r: number) {
    this.with(s, (ctx) => {
      ctx.beginPath();
      for (let i = -2; i <= 2; i++) {
        const a = Math.PI / 2 + (i * Math.PI) / 7;
        const px = cx + Math.cos(a) * r * 0.55;
        const py = cy + Math.sin(a) * r * 0.55;
        ctx.moveTo(px + Math.cos(a) * r * 0.5, py + Math.sin(a) * r * 0.5);
        ctx.ellipse(px, py, r * 0.5, r * 0.14, a, 0, Math.PI * 2);
      }
      ctx.moveTo(cx + r * 0.2, cy);
      ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /** Colour-only shading that must not change the material or relief. */
  colorOnly(draw: (ctx: Ctx) => void) {
    draw(this.ctx.color);
  }

  each(fn: (ctx: Ctx) => void) {
    fn(this.ctx.color);
    fn(this.ctx.orm);
    fn(this.ctx.height);
  }
}

/** Fixed pseudo-random sequence so the atlas is identical on every load. */
function sequence(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

/** Exposed wall stones below the white cloth: courses of dark, brownish blocks. */
function paintStones(p: Painter) {
  const rand = sequence(29);
  p.rect(MORTAR, 0, KISWA_Y0, WALL_M, KAABA.stoneTop);
  const rowH = 0.44;
  let row = 0;
  for (let y = KISWA_Y0; y < KAABA.stoneTop; y += rowH, row++) {
    let x = row % 2 === 0 ? 0 : -0.45;
    while (x < WALL_M) {
      const w = 0.75 + rand() * 0.5;
      const shade = STONE_SHADES[Math.floor(rand() * STONE_SHADES.length)];
      p.rect(
        surf(shade ?? "#5c5044", 0.6, 0.72, 0, 0.5),
        x + 0.025,
        y + 0.025,
        Math.min(x + w, WALL_M) - 0.025,
        Math.min(y + rowH, KAABA.stoneTop) - 0.025,
      );
      x += w;
    }
  }
}

/** Hajj season: bright white cotton over the lower third, with a hem at each edge. */
function paintWhiteCloth(p: Painter) {
  const y0 = KAABA.stoneTop;
  const y1 = KAABA.whiteClothTop;
  p.rect(CLOTH, 0, y0, WALL_M, y1);
  p.colorOnly((ctx) => {
    const rand = sequence(11);
    for (let x = 0.3; x < WALL_M; x += 0.5 + rand() * 0.7) {
      const half = 0.15 + rand() * 0.2;
      const g = ctx.createLinearGradient(x - half, 0, x + half, 0);
      g.addColorStop(0, "rgba(140, 132, 118, 0)");
      g.addColorStop(0.5, `rgba(140, 132, 118, ${0.03 + rand() * 0.05})`);
      g.addColorStop(1, "rgba(140, 132, 118, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - half, y0, half * 2, y1 - y0);
    }
  });
  p.rect(CLOTH_HEM, 0, y0, WALL_M, y0 + 0.05);
  p.rect(CLOTH_HEM, 0, y1 - 0.07, WALL_M, y1);
  p.rect(HEM_SHADOW, 0, y1, WALL_M, y1 + 0.05);
}

/** Black kiswa with a tone-on-tone woven pattern: lattice, rosettes and stars. */
function paintFabric(p: Painter) {
  const y0 = KAABA.whiteClothTop;
  p.rect(FABRIC, 0, y0 + 0.05, WALL_M, KISWA_Y1);
  p.each((ctx) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y0 + 0.05, WALL_M, KISWA_Y1 - y0);
    ctx.clip();
  });
  const tile = 1.05;
  p.with(WEAVE, (ctx) => {
    ctx.lineWidth = 0.028;
    ctx.beginPath();
    for (let k = -20; k < 30; k++) {
      const x = k * tile;
      ctx.moveTo(x, y0);
      ctx.lineTo(x + 20, y0 + 20);
      ctx.moveTo(x, y0);
      ctx.lineTo(x - 20, y0 + 20);
    }
    ctx.stroke();
  });
  for (let row = 0; y0 + row * (tile / 2) < KISWA_Y1 + tile; row++) {
    const y = y0 + row * (tile / 2);
    for (let x = row % 2 === 0 ? 0 : tile / 2; x < WALL_M + tile; x += tile) {
      p.rosette(WEAVE, x, y, 0.2, 8);
      p.star(WEAVE, 0.022, x + tile / 2, y, 0.12);
    }
  }
  p.each((ctx) => ctx.restore());
}

/**
 * Dense embroidered fill for the inside of a panel — where the real kiswa
 * carries lines of calligraphy. A diagonal gold lattice with a small star in
 * every cell and a dot at every crossing: gold-dominant like the original,
 * but strictly geometric.
 */
function goldFill(p: Painter, x0: number, y0: number, x1: number, y1: number) {
  const h = y1 - y0;
  const cell = Math.min(h / 2, 0.3);
  p.each((ctx) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, y0, x1 - x0, h);
    ctx.clip();
  });
  p.with(GOLD, (ctx) => {
    ctx.lineWidth = cell * 0.09;
    ctx.beginPath();
    for (let x = x0 - h; x < x1 + h; x += cell) {
      ctx.moveTo(x, y0);
      ctx.lineTo(x + h, y1);
      ctx.moveTo(x, y1);
      ctx.lineTo(x + h, y0);
    }
    ctx.stroke();
  });
  const cy = (y0 + y1) / 2;
  for (let row = -2; row <= 2; row++) {
    const y = cy + (row * cell) / 2;
    if (y < y0 || y > y1) continue;
    const offset = row % 2 === 0 ? 0 : cell / 2;
    for (let x = x0 + offset; x <= x1; x += cell) {
      p.star(GOLD_SOFT, cell * 0.07, x + cell / 2, y, cell * 0.26);
      p.disc(GOLD, x, y, cell * 0.07);
    }
  }
  p.each((ctx) => ctx.restore());
}

/** A roundel: gold ring on black, one rosette and a small star — kept open. */
function roundel(p: Painter, cx: number, cy: number, r: number) {
  p.disc(GOLD, cx, cy, r);
  p.disc(GROUND, cx, cy, r - 0.045);
  p.rosette(GOLD_SOFT, cx, cy, r * 0.8, 12);
  p.ring(GOLD, r * 0.06, cx, cy, r * 0.45);
  p.disc(GOLD, cx, cy, r * 0.14);
}

/**
 * A long rectangular embroidered panel (where the real belt has an
 * inscription): gold frame on black, filled with the dense gold lattice.
 */
function longPanel(p: Painter, x0: number, x1: number, y0: number, y1: number) {
  p.rect(GOLD, x0, y0, x1, y1);
  p.rect(GROUND, x0 + 0.05, y0 + 0.05, x1 - 0.05, y1 - 0.05);
  p.frame(GOLD_SOFT, 0.02, x0 + 0.09, y0 + 0.09, x1 - 0.09, y1 - 0.09);
  goldFill(p, x0 + 0.12, y0 + 0.12, x1 - 0.12, y1 - 0.12);
}

/** The hizam: long panels with roundels in the wide gaps between them. */
function paintBelt(p: Painter) {
  p.rect(GOLD, 0, BELT_BOTTOM, WALL_M, BELT_BOTTOM + 0.035);
  p.rect(GOLD, 0, BELT_TOP - 0.035, WALL_M, BELT_TOP);
  p.rect(GROUND, 0, BELT_BOTTOM + 0.035, WALL_M, BELT_TOP - 0.035);
  const y0 = BELT_BOTTOM + 0.1;
  const y1 = BELT_TOP - 0.1;
  const r = (y1 - y0) / 2 + 0.03;
  for (const x of BELT_ROUNDELS) roundel(p, x, KAABA.beltY, r);
  for (let i = 0; i < BELT_ROUNDELS.length - 1; i++) {
    const a = BELT_ROUNDELS[i] ?? 0;
    const b = BELT_ROUNDELS[i + 1] ?? WALL_M;
    longPanel(p, a + r + 0.3, b - r - 0.3, y0, y1);
  }
}

/** A separate gold-framed panel below the belt: one medallion, two stars. */
function panel(p: Painter, cx: number, width: number) {
  const x0 = cx - width / 2;
  const x1 = cx + width / 2;
  const y0 = PANEL_TOP - PANEL_H;
  p.rect(GOLD, x0, y0, x1, PANEL_TOP);
  p.rect(GROUND, x0 + 0.05, y0 + 0.05, x1 - 0.05, PANEL_TOP - 0.05);
  p.frame(GOLD_SOFT, 0.018, x0 + 0.09, y0 + 0.09, x1 - 0.09, PANEL_TOP - 0.09);
  goldFill(p, x0 + 0.12, y0 + 0.12, x1 - 0.12, PANEL_TOP - 0.12);
  p.disc(GOLD, cx, PANEL_CY, PANEL_H * 0.36);
  p.disc(GROUND, cx, PANEL_CY, PANEL_H * 0.31);
  p.rosette(GOLD_SOFT, cx, PANEL_CY, PANEL_H * 0.3, 8);
  p.disc(GOLD, cx, PANEL_CY, 0.035);
}

type BelowBeltItem = { panel: number; width: number } | { roundel: number };

function belowBelt(p: Painter, items: BelowBeltItem[]) {
  for (const item of items) {
    if ("roundel" in item) roundel(p, item.roundel, PANEL_CY, PANEL_H * 0.42);
    else panel(p, item.panel, item.width);
  }
}

/** One embroidered lantern (qandil), hanging from (cx, top), `h` metres tall. */
function lantern(p: Painter, cx: number, top: number, h: number) {
  const k = h / 0.85;
  const shoulder = top - 0.12 * k;
  const waist = shoulder - 0.3 * k;
  const base = waist - 0.3 * k;
  const w = 0.2 * k;
  p.with(GOLD, (ctx) => {
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.4, top);
    ctx.lineTo(cx + w * 0.4, top);
    ctx.lineTo(cx + w * 0.85, shoulder);
    ctx.lineTo(cx - w * 0.85, shoulder);
    ctx.closePath();
    ctx.fill();
  });
  const body = (ctx: Ctx) => {
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.85, shoulder);
    ctx.lineTo(cx + w * 0.85, shoulder);
    ctx.lineTo(cx + w * 1.15, waist);
    ctx.lineTo(cx + w * 0.7, base);
    ctx.lineTo(cx - w * 0.7, base);
    ctx.lineTo(cx - w * 1.15, waist);
    ctx.closePath();
  };
  p.with(GOLD, (ctx) => {
    body(ctx);
    ctx.fill();
  });
  p.with(GROUND, (ctx) => {
    ctx.beginPath();
    ctx.arc(cx, (shoulder + base) / 2, w * 0.45, 0, Math.PI * 2);
    ctx.fill();
  });
  p.disc(GOLD_SOFT, cx, (shoulder + base) / 2, w * 0.2);
  p.with(GOLD, (ctx) => {
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.7, base);
    ctx.lineTo(cx + w * 0.7, base);
    ctx.lineTo(cx, base - 0.16 * k);
    ctx.closePath();
    ctx.fill();
  });
}

/** Five lanterns hanging one below another from the belt, close to the Black Stone corner. */
function paintLanternColumn(p: Painter) {
  const cx = KAABA.lanternColumnX;
  const top0 = BELT_BOTTOM - 0.04;
  const span = top0 - (KAABA.whiteClothTop + 0.15);
  const step = span / 5;
  p.rect(GOLD, cx - 0.01, KAABA.whiteClothTop + 0.3, cx + 0.01, top0);
  for (let i = 0; i < 5; i++)
    lantern(p, cx, top0 - i * step - 0.04, step * 0.82);
}

/**
 * The door curtain (sitara): black cloth embroidered in gold — a bordered
 * field of framed registers, roundels and panels, open at the hem in an
 * inverted V over the door (the V itself is cut in the geometry).
 */
function paintSitara(p: Painter) {
  const cx = DOOR_X;
  const x0 = SITARA_X0;
  const x1 = SITARA_X1;
  const y0 = KAABA.sitara.bottom;
  const y1 = SITARA_TOP;
  const apex = KAABA.door.bottom + KAABA.door.height;

  p.rect(GROUND, x0, y0, x1, y1);
  // Gold border with small roundels along it.
  p.frame(GOLD, 0.1, x0, y0, x1, y1);
  p.frame(GOLD_SOFT, 0.015, x0 + 0.14, y0 + 0.14, x1 - 0.14, y1 - 0.14);
  for (let y = y0 + 0.45; y < y1 - 0.3; y += 0.55) {
    p.disc(GOLD, x0 + 0.24, y, 0.06);
    p.disc(GOLD, x1 - 0.24, y, 0.06);
  }

  const ix0 = x0 + 0.38;
  const ix1 = x1 - 0.38;
  // Register 1: a long panel under the belt.
  longPanel(p, ix0, ix1, y1 - 0.72, y1 - 0.22);
  // Register 2: three roundels in a gold frame.
  const r2 = y1 - 1.35;
  p.frame(GOLD, 0.04, ix0, r2 - 0.45, ix1, r2 + 0.45);
  for (const k of [-1, 0, 1]) roundel(p, cx + k * ((ix1 - ix0) / 3), r2, 0.3);
  // Register 3: the great panel (where the curtain's main inscription is).
  longPanel(p, ix0, ix1, r2 - 1.35, r2 - 0.6);
  // Register 4: a narrower embroidered band.
  const r4 = r2 - 1.7;
  p.frame(GOLD, 0.035, ix0, r4 - 0.18, ix1, r4 + 0.18);
  goldFill(p, ix0 + 0.05, r4 - 0.13, ix1 - 0.05, r4 + 0.13);

  // The two legs either side of the opening: a roundel above stacked panels.
  const legW = (x1 - x0 - KAABA.door.width) / 2 - 0.25;
  for (const lx of [x0 + 0.2 + legW / 2, x1 - 0.2 - legW / 2]) {
    const top = r4 - 0.35;
    roundel(p, lx, top - 0.35, Math.min(0.32, legW / 2));
    let y = top - 0.85;
    while (y - 0.45 > y0 + 0.15) {
      longPanel(p, lx - legW / 2, lx + legW / 2, y - 0.45, y);
      y -= 0.6;
    }
  }
  // Gold hem along both edges of the V.
  p.with(GOLD, (ctx) => {
    ctx.lineWidth = 0.09;
    ctx.beginPath();
    ctx.moveTo(cx - KAABA.door.width / 2, y0);
    ctx.lineTo(cx, apex);
    ctx.lineTo(cx + KAABA.door.width / 2, y0);
    ctx.stroke();
  });
}

/**
 * The gold door, painted only where it can be seen: inside the curtain's V
 * and below its hem. Two leaves, each with a great roundel between framed
 * panels, a central bar with the lock, and a frame round the whole.
 */
function paintDoor(p: Painter) {
  const { width: dw, height: dh, bottom: db } = KAABA.door;
  const cx = DOOR_X;
  const x0 = cx - dw / 2;
  const x1 = cx + dw / 2;
  const top = db + dh;
  const hem = KAABA.sitara.bottom;
  p.each((ctx) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0 - 0.01, db);
    ctx.lineTo(x1 + 0.01, db);
    ctx.lineTo(x1 + 0.01, hem);
    ctx.lineTo(cx, top + 0.02);
    ctx.lineTo(x0 - 0.01, hem);
    ctx.closePath();
    ctx.clip();
  });
  p.rect(GOLD, x0, db, x1, top);
  p.frame(GOLD_DEEP, 0.05, x0, db, x1, top);
  p.rect(GOLD_DEEP, cx - 0.035, db, cx + 0.035, top);
  p.rect(GOLD_SOFT, cx - 0.07, db + dh * 0.42, cx + 0.07, db + dh * 0.5);
  for (const lx of [x0 + dw / 4, cx + dw / 4]) {
    p.frame(
      GOLD_DEEP,
      0.025,
      lx - dw / 4 + 0.09,
      db + 0.12,
      lx + dw / 4 - 0.09,
      db + 0.55,
    );
    p.ring(GOLD_DEEP, 0.03, lx, db + dh * 0.33, dw * 0.16);
    p.rosette(GOLD_SOFT, lx, db + dh * 0.33, dw * 0.14, 8);
    p.frame(
      GOLD_DEEP,
      0.025,
      lx - dw / 4 + 0.09,
      db + dh * 0.5,
      lx + dw / 4 - 0.09,
      db + dh * 0.72,
    );
    p.ring(GOLD_DEEP, 0.03, lx, db + dh * 0.82, dw * 0.12);
  }
  p.each((ctx) => ctx.restore());
}

function paintWall(p: Painter, isDoorWall: boolean) {
  paintStones(p);
  paintWhiteCloth(p);
  paintFabric(p);
  paintBelt(p);
  if (isDoorWall) {
    belowBelt(p, [
      { roundel: 5.9 },
      { panel: 8.1, width: 1.9 },
      { roundel: 10.4 },
    ]);
    paintLanternColumn(p);
    paintSitara(p);
    paintDoor(p);
  } else {
    belowBelt(p, [
      { roundel: 1.3 },
      { panel: 3.5, width: 1.9 },
      { roundel: 5.85 },
      { panel: 8.2, width: 1.9 },
      { roundel: 10.4 },
    ]);
  }
}

/** Derives a tangent-space normal map from the height canvas (v up in texture space). */
function heightToNormal(height: HTMLCanvasElement): HTMLCanvasElement {
  const w = height.width;
  const h = height.height;
  const src = height.getContext("2d")?.getImageData(0, 0, w, h).data;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const octx = out.getContext("2d");
  if (!src || !octx) throw new Error("2D canvas is unavailable");
  const img = octx.createImageData(w, h);
  const d = img.data;
  const at = (x: number, y: number) => {
    const cx = Math.min(w - 1, Math.max(0, x));
    const cy = Math.min(h - 1, Math.max(0, y));
    return (src[(cy * w + cx) * 4] ?? 0) / 255;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * NORMAL_STRENGTH;
      // Canvas rows run downwards; texture v runs upwards.
      const dy = (at(x, y - 1) - at(x, y + 1)) * NORMAL_STRENGTH;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * w + x) * 4;
      d[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      d[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
      d[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      d[i + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  return out;
}

export interface KiswaTextures {
  color: CanvasTexture;
  orm: CanvasTexture;
  normal: CanvasTexture;
}

/** Paints the atlas at `width` × `width/2` pixels (door wall | other walls). */
export function createKiswaTextures(width: number): KiswaTextures {
  const height = width / 2;
  const make = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas is unavailable");
    return { canvas, ctx };
  };
  const color = make();
  const orm = make();
  const relief = make();
  const painter = new Painter({
    color: color.ctx,
    orm: orm.ctx,
    height: relief.ctx,
  });

  const regions = [
    { u: KISWA_ATLAS.doorWall, isDoorWall: true },
    { u: KISWA_ATLAS.otherWalls, isDoorWall: false },
  ];
  for (const { u, isDoorWall } of regions) {
    const x0 = u[0] * width;
    const regionW = (u[1] - u[0]) * width;
    const sx = regionW / WALL_M;
    const sy = height / (KISWA_Y1 - KISWA_Y0);
    painter.each((ctx) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, 0, regionW, height);
      ctx.clip();
      // Wall metres, y up: canvas x = x0 + sx·x, canvas y = (Y1 − y)·sy.
      ctx.setTransform(sx, 0, 0, -sy, x0, KISWA_Y1 * sy);
    });
    paintWall(painter, isDoorWall);
    painter.each((ctx) => ctx.restore());
  }

  const colorTexture = new CanvasTexture(color.canvas);
  colorTexture.colorSpace = SRGBColorSpace;
  colorTexture.anisotropy = 8;
  const ormTexture = new CanvasTexture(orm.canvas);
  ormTexture.anisotropy = 8;
  const normalTexture = new CanvasTexture(heightToNormal(relief.canvas));
  normalTexture.anisotropy = 8;
  return { color: colorTexture, orm: ormTexture, normal: normalTexture };
}
