import { CanvasTexture, SRGBColorSpace } from "three";
import {
  BELT_BOTTOM,
  BELT_TOP,
  KISWA_ATLAS,
  KISWA_Y0,
  KISWA_Y1,
  SITARA_APEX,
  SITARA_HEM,
  SITARA_TOP,
  WALLS,
  type Wall,
} from "../landmarks/kaaba";
import { KAABA } from "./layout";
import { PALETTE } from "./palette";
import { eightPointStar } from "./textures";

/**
 * The kiswa atlas: every wall of the Kaaba painted onto three canvases, one
 * quarter per wall so that each corner carries its own ornament.
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
 * Respect rule (CLAUDE.md): wherever the real kiswa carries calligraphy, this
 * atlas has geometric and floral ornament of similar density and placement —
 * lattices, stars, rosettes, drops, arches. Shapes are filled and symmetric;
 * there are no free-flowing strokes and nothing letter-like.
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
/** Joints between the wall stones: a dim, light gold. */
const JOINT = surf("#a38c5c", 0.7, 0.5, 0.35, 0.28);
const STONE_SHADES = ["#57534c", "#5f5a51", "#4f4b45", "#655e54", "#5a544b"];
const CORNER_STONE = surf("#7b705f", 0.55, 0.85, 0, 0.5);
const GROUND = surf("#0f0d0a", 0.3, 0.7, 0.1, 0.45);
/** Thick padded black border round the stone showing at the Yemeni corner. */
const PADDED = surf("#0a0a0b", 0.3, 0.55, 0, 0.95);
const GOLD = surf(PALETTE.gold, 1, 0.3, 0.85, 0.75);
const GOLD_SOFT = surf(PALETTE.goldSoft, 1, 0.26, 0.85, 0.92);
const GOLD_DEEP = surf(PALETTE.goldDeep, 1, 0.45, 0.8, 0.6);

/** Door and curtain, in metres from the Black Stone corner along the door wall. */
const DOOR_X = KAABA.door.fromBlackStoneCorner;
const SITARA_X0 = DOOR_X - KAABA.sitara.width / 2;
const SITARA_X1 = DOOR_X + KAABA.sitara.width / 2;
/** Separate panels and drops hanging below the belt, clear of it. */
const PANEL_TOP = BELT_BOTTOM - 0.3;
const PANEL_H = 0.6;
const PANEL_CY = PANEL_TOP - PANEL_H / 2;
/** The belt is divided into panels about this long, by thin separators. */
const BELT_PANEL_M = 2.4;
/** Yemeni corner: gold band down the corner, and the arch round the exposed stone. */
const YEMENI_BAND_M = 0.26;
const YEMENI_ARCH = { halfWidth: 0.7, top: 2.05, border: 0.14 };

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

  /** Clips all three canvases to `path` for the duration of `draw`. */
  clipped(path: (ctx: Ctx) => void, draw: () => void) {
    this.each((ctx) => {
      ctx.save();
      path(ctx);
      ctx.clip();
    });
    draw();
    this.each((ctx) => ctx.restore());
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

/** Exposed wall stones: few, large courses with light, dim-gold joints. */
function paintStones(p: Painter, L: number, seed: number) {
  const rand = sequence(seed);
  p.rect(JOINT, 0, KISWA_Y0, L, KAABA.stoneTop);
  const rowH = 0.55;
  let row = 0;
  for (let y = KISWA_Y0; y < KAABA.stoneTop; y += rowH, row++) {
    let x = row % 2 === 0 ? 0 : -0.6;
    while (x < L) {
      const w = 1.0 + rand() * 0.6;
      const shade = STONE_SHADES[Math.floor(rand() * STONE_SHADES.length)];
      p.rect(
        surf(shade ?? "#57534c", 0.6, 0.75, 0, 0.5),
        x + 0.022,
        y + 0.022,
        Math.min(x + w, L) - 0.022,
        Math.min(y + rowH, KAABA.stoneTop) - 0.022,
      );
      x += w;
    }
  }
}

/** Hajj season: a wide band of bright white cotton, with a hem at each edge. */
function paintWhiteCloth(p: Painter, L: number) {
  const y0 = KAABA.stoneTop;
  const y1 = KAABA.whiteClothTop;
  p.rect(CLOTH, 0, y0, L, y1);
  p.colorOnly((ctx) => {
    const rand = sequence(11);
    for (let x = 0.3; x < L; x += 0.5 + rand() * 0.7) {
      const half = 0.15 + rand() * 0.2;
      const g = ctx.createLinearGradient(x - half, 0, x + half, 0);
      g.addColorStop(0, "rgba(140, 132, 118, 0)");
      g.addColorStop(0.5, `rgba(140, 132, 118, ${0.03 + rand() * 0.05})`);
      g.addColorStop(1, "rgba(140, 132, 118, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - half, y0, half * 2, y1 - y0);
    }
  });
  p.rect(CLOTH_HEM, 0, y0, L, y0 + 0.06);
  p.rect(CLOTH_HEM, 0, y1 - 0.07, L, y1);
  p.rect(HEM_SHADOW, 0, y1, L, y1 + 0.05);
}

/** Black kiswa with a tone-on-tone woven pattern: lattice, rosettes and stars. */
function paintFabric(p: Painter, L: number) {
  const y0 = KAABA.whiteClothTop;
  p.rect(FABRIC, 0, y0 + 0.05, L, KISWA_Y1);
  p.clipped(
    (ctx) => {
      ctx.beginPath();
      ctx.rect(0, y0 + 0.05, L, KISWA_Y1 - y0);
    },
    () => {
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
        for (let x = row % 2 === 0 ? 0 : tile / 2; x < L + tile; x += tile) {
          p.rosette(WEAVE, x, y, 0.2, 8);
          p.star(WEAVE, 0.022, x + tile / 2, y, 0.12);
        }
      }
    },
  );
}

/**
 * Dense embroidered fill for the inside of a panel — where the real kiswa
 * carries lines of calligraphy. A diagonal gold lattice with a small star in
 * every cell and a dot at every crossing: gold-dominant like the original,
 * but strictly geometric.
 */
function goldFill(p: Painter, x0: number, y0: number, x1: number, y1: number) {
  const h = y1 - y0;
  const w = x1 - x0;
  const cell = Math.min(Math.min(h, w) / 2, 0.3);
  p.clipped(
    (ctx) => {
      ctx.beginPath();
      ctx.rect(x0, y0, w, h);
    },
    () => {
      const span = Math.max(w, h);
      p.with(GOLD, (ctx) => {
        ctx.lineWidth = cell * 0.09;
        ctx.beginPath();
        for (let x = x0 - span; x < x1 + span; x += cell) {
          ctx.moveTo(x, y0);
          ctx.lineTo(x + span, y0 + span);
          ctx.moveTo(x, y1);
          ctx.lineTo(x + span, y1 - span);
        }
        ctx.stroke();
      });
      for (let y = y0 + cell / 2, row = 0; y < y1; y += cell / 2, row++) {
        const offset = row % 2 === 0 ? 0 : cell / 2;
        for (let x = x0 + offset; x <= x1; x += cell) {
          p.star(GOLD_SOFT, cell * 0.07, x + cell / 2, y, cell * 0.26);
          p.disc(GOLD, x, y, cell * 0.07);
        }
      }
    },
  );
}

/** A roundel: gold ring on black with a rosette. Used sparingly, near corners. */
function roundel(p: Painter, cx: number, cy: number, r: number) {
  p.disc(GOLD, cx, cy, r);
  p.disc(GROUND, cx, cy, r - 0.045);
  p.rosette(GOLD_SOFT, cx, cy, r * 0.8, 12);
  p.ring(GOLD, r * 0.06, cx, cy, r * 0.45);
  p.disc(GOLD, cx, cy, r * 0.14);
}

/** A pointed oval: round below, drawn to a point above. */
function dropPath(ctx: Ctx, cx: number, cy: number, w: number, h: number) {
  const top = cy + h / 2;
  const bottom = cy - h / 2;
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.bezierCurveTo(
    cx + w * 0.62,
    cy + h * 0.1,
    cx + w * 0.62,
    bottom,
    cx,
    bottom,
  );
  ctx.bezierCurveTo(
    cx - w * 0.62,
    bottom,
    cx - w * 0.62,
    cy + h * 0.1,
    cx,
    top,
  );
  ctx.closePath();
}

/** An embroidered drop: gold border, black inside, a small geometric motif. */
function drop(p: Painter, cx: number, cy: number, w: number, h: number) {
  p.with(GOLD, (ctx) => {
    dropPath(ctx, cx, cy, w, h);
    ctx.fill();
  });
  p.with(GROUND, (ctx) => {
    dropPath(ctx, cx, cy - h * 0.03, w * 0.74, h * 0.78);
    ctx.fill();
  });
  p.star(GOLD_SOFT, w * 0.05, cx, cy - h * 0.08, w * 0.2);
  p.disc(GOLD, cx, cy - h * 0.08, w * 0.06);
}

/**
 * The hizam: one continuous gold band round the whole Kaaba, divided into
 * panels by thin separators, each panel densely embroidered.
 */
function paintBelt(p: Painter, L: number) {
  p.rect(GOLD, 0, BELT_BOTTOM, L, BELT_TOP);
  p.rect(GOLD_SOFT, 0, BELT_TOP - 0.05, L, BELT_TOP - 0.025);
  p.rect(GOLD_SOFT, 0, BELT_BOTTOM + 0.025, L, BELT_BOTTOM + 0.05);
  const count = Math.max(1, Math.round(L / BELT_PANEL_M));
  const step = L / count;
  for (let i = 0; i < count; i++) {
    const x0 = i * step + 0.04;
    const x1 = (i + 1) * step - 0.04;
    p.rect(GROUND, x0, BELT_BOTTOM + 0.08, x1, BELT_TOP - 0.08);
    goldFill(p, x0 + 0.04, BELT_BOTTOM + 0.11, x1 - 0.04, BELT_TOP - 0.11);
  }
  // Thin separators between the panels.
  for (let i = 1; i < count; i++) {
    p.rect(
      GOLD_SOFT,
      i * step - 0.02,
      BELT_BOTTOM + 0.05,
      i * step + 0.02,
      BELT_TOP - 0.05,
    );
  }
}

/** A separate gold-framed panel below the belt (the approved style). */
function panel(p: Painter, cx: number, width: number) {
  const x0 = cx - width / 2;
  const x1 = cx + width / 2;
  const y0 = PANEL_TOP - PANEL_H;
  p.rect(GOLD, x0, y0, x1, PANEL_TOP);
  p.rect(GROUND, x0 + 0.05, y0 + 0.05, x1 - 0.05, PANEL_TOP - 0.05);
  p.frame(GOLD_SOFT, 0.018, x0 + 0.09, y0 + 0.09, x1 - 0.09, PANEL_TOP - 0.09);
  goldFill(p, x0 + 0.12, y0 + 0.12, x1 - 0.12, PANEL_TOP - 0.12);
}

type BelowBeltItem =
  { panel: number; width: number } | { drop: number } | { roundel: number };

function belowBelt(p: Painter, items: BelowBeltItem[]) {
  for (const item of items) {
    if ("panel" in item) panel(p, item.panel, item.width);
    else if ("drop" in item) drop(p, item.drop, PANEL_CY, 0.32, PANEL_H * 0.95);
    else roundel(p, item.roundel, PANEL_CY, PANEL_H * 0.42);
  }
}

/**
 * Black Stone corner: a column of embroidered drops on the corner edge
 * itself, above the stone, headed by a roundel. Painted centred on the edge,
 * so half of each shape falls on each of the two walls (`edgeX` is the
 * corner's x on this wall).
 */
function paintDropColumn(p: Painter, edgeX: number) {
  roundel(p, edgeX, PANEL_CY, 0.3);
  const top = PANEL_CY - 0.4;
  const bottom = KAABA.whiteClothTop + 0.1;
  const step = (top - bottom) / 5;
  for (let i = 0; i < 5; i++) {
    drop(p, edgeX, top - (i + 0.5) * step, 0.55, step * 0.86);
  }
}

/**
 * Yemeni corner, upper part: a vertical gold band down the corner edge with a
 * square medallion at its head. `edgeX` is the corner's x on this wall and
 * `inward` points along the wall away from the corner (+1 or −1).
 */
function paintYemeniBand(p: Painter, edgeX: number, inward: 1 | -1) {
  const a = edgeX;
  const b = edgeX + inward * YEMENI_BAND_M;
  const x0 = Math.min(a, b);
  const x1 = Math.max(a, b);
  const top = PANEL_TOP;
  const bottom = KAABA.whiteClothTop + 0.05;
  p.rect(GOLD, x0, bottom, x1, top - 0.4);
  p.rect(GROUND, x0 + 0.04, bottom + 0.04, x1 - 0.04, top - 0.44);
  goldFill(p, x0 + 0.06, bottom + 0.06, x1 - 0.06, top - 0.46);
  // Square medallion at the head, half on each wall.
  const m0 = Math.min(edgeX, edgeX + inward * YEMENI_BAND_M * 1.25);
  const m1 = Math.max(edgeX, edgeX + inward * YEMENI_BAND_M * 1.25);
  p.rect(GOLD, m0, top - 0.42, m1, top + 0.02);
  p.rect(GROUND, m0 + 0.04, top - 0.38, m1 - 0.04, top - 0.02);
  p.star(GOLD_SOFT, 0.03, edgeX + inward * 0.16, top - 0.2, 0.12);
}

/**
 * Yemeni corner, lower part: the corner stone showing through an arched
 * opening, framed by a thick padded black border (half of it on each wall).
 */
function paintYemeniArch(p: Painter, edgeX: number, inward: 1 | -1) {
  const { halfWidth, top, border } = YEMENI_ARCH;
  const base = KAABA.baseHeight;
  const outer = edgeX + inward * halfWidth;
  const shoulder = top - halfWidth * 0.9;
  const archPath = (ctx: Ctx, grow: number) => {
    const o = edgeX + inward * (halfWidth + grow);
    ctx.beginPath();
    ctx.moveTo(edgeX, base - 0.2);
    ctx.lineTo(o, base - 0.2);
    ctx.lineTo(o, shoulder);
    ctx.quadraticCurveTo(o, top + grow, edgeX, top + grow);
    ctx.closePath();
  };
  p.with(PADDED, (ctx) => {
    archPath(ctx, border);
    ctx.fill();
  });
  p.with(CORNER_STONE, (ctx) => {
    archPath(ctx, 0);
    ctx.fill();
  });
  // Weathered granite: fine speckle and a few darker veins, not polka dots.
  p.colorOnly((ctx) => {
    const rand = sequence(Math.round(outer * 100) + 7);
    for (let i = 0; i < 900; i++) {
      const x = edgeX + inward * rand() * halfWidth;
      const y = base + rand() * (top - base);
      const light = rand() > 0.55;
      ctx.fillStyle = light
        ? `rgba(170, 160, 140, ${0.1 + rand() * 0.15})`
        : `rgba(35, 32, 28, ${0.1 + rand() * 0.2})`;
      ctx.fillRect(x, y, 0.008 + rand() * 0.018, 0.008 + rand() * 0.018);
    }
    ctx.strokeStyle = "rgba(40, 36, 30, 0.35)";
    ctx.lineWidth = 0.012;
    for (let v = 0; v < 5; v++) {
      let x = edgeX + inward * rand() * halfWidth;
      let y = base + rand() * (top - base);
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < 6; k++) {
        x += inward * (rand() - 0.3) * 0.12;
        y += (rand() - 0.5) * 0.25;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  });
}

/** A curtain register: gold frame, deep-gold ground, dense gold lattice. */
function sitaraPanel(
  p: Painter,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
) {
  p.rect(GOLD_SOFT, x0, y0, x1, y1);
  p.rect(GOLD_DEEP, x0 + 0.04, y0 + 0.04, x1 - 0.04, y1 - 0.04);
  goldFill(p, x0 + 0.07, y0 + 0.07, x1 - 0.07, y1 - 0.07);
}

/** A curtain roundel: gold throughout, a deep-gold ring and a rosette. */
function sitaraRoundel(p: Painter, cx: number, cy: number, r: number) {
  p.disc(GOLD_SOFT, cx, cy, r);
  p.disc(GOLD_DEEP, cx, cy, r - 0.04);
  p.rosette(GOLD, cx, cy, r * 0.85, 12);
  p.ring(GOLD_SOFT, r * 0.06, cx, cy, r * 0.45);
  p.disc(GOLD_SOFT, cx, cy, r * 0.14);
}

/**
 * The door curtain (sitara): embroidered almost entirely in gold, as on the
 * real curtain — bordered registers of gold panels and roundels, one dark
 * cartouche at its heart for contrast, and legs of stacked panels either side
 * of the inverted-V opening over its lower third (the V is cut in the
 * geometry). A black gap separates its top from the belt.
 */
function paintSitara(p: Painter) {
  const cx = DOOR_X;
  const x0 = SITARA_X0;
  const x1 = SITARA_X1;
  const y0 = SITARA_HEM;
  const y1 = SITARA_TOP;

  // Gold field with a border of small roundels.
  p.rect(GOLD, x0, y0, x1, y1);
  p.frame(GOLD_SOFT, 0.05, x0, y0, x1, y1);
  p.frame(GOLD_DEEP, 0.02, x0 + 0.34, y0 + 0.34, x1 - 0.34, y1 - 0.34);
  for (let y = y0 + 0.3; y < y1 - 0.15; y += 0.42) {
    sitaraRoundel(p, x0 + 0.17, y, 0.12);
    sitaraRoundel(p, x1 - 0.17, y, 0.12);
  }
  for (let x = x0 + 0.55; x < x1 - 0.4; x += 0.42) {
    sitaraRoundel(p, x, y1 - 0.17, 0.12);
  }

  const ix0 = x0 + 0.4;
  const ix1 = x1 - 0.4;
  // Registers from the top.
  sitaraPanel(p, ix0, ix1, y1 - 0.85, y1 - 0.38);
  const r2 = y1 - 1.35;
  sitaraPanel(p, ix0, ix1, r2 - 0.42, r2 + 0.42);
  for (const k of [-1, 0, 1])
    sitaraRoundel(p, cx + k * ((ix1 - ix0) / 3), r2, 0.32);
  // The dark cartouche at the heart (where the real curtain's main panel is).
  const cy = r2 - 1.05;
  const ch = 0.5;
  p.with(GOLD_SOFT, (ctx) => {
    ctx.beginPath();
    ctx.moveTo(ix0, cy);
    ctx.lineTo(ix0 + ch, cy + ch);
    ctx.lineTo(ix1 - ch, cy + ch);
    ctx.lineTo(ix1, cy);
    ctx.lineTo(ix1 - ch, cy - ch);
    ctx.lineTo(ix0 + ch, cy - ch);
    ctx.closePath();
    ctx.fill();
  });
  p.with(GROUND, (ctx) => {
    const k = 0.07;
    ctx.beginPath();
    ctx.moveTo(ix0 + k * 1.4, cy);
    ctx.lineTo(ix0 + ch + k * 0.4, cy + ch - k);
    ctx.lineTo(ix1 - ch - k * 0.4, cy + ch - k);
    ctx.lineTo(ix1 - k * 1.4, cy);
    ctx.lineTo(ix1 - ch - k * 0.4, cy - ch + k);
    ctx.lineTo(ix0 + ch + k * 0.4, cy - ch + k);
    ctx.closePath();
    ctx.fill();
  });
  goldFill(p, ix0 + ch, cy - ch + 0.12, ix1 - ch, cy + ch - 0.12);
  // A band below it, then the top of the legs.
  const r4 = cy - ch - 0.35;
  sitaraPanel(p, ix0, ix1, r4 - 0.2, r4 + 0.2);
  const midTop = r4 - 0.3;
  const midBottom = SITARA_APEX + 0.1;
  if (midTop - midBottom > 0.3) sitaraPanel(p, ix0, ix1, midBottom, midTop);

  // The legs either side of the opening: a roundel, then stacked panels.
  const legW = (x1 - x0 - KAABA.door.width) / 2 - 0.45;
  for (const lx of [x0 + 0.37 + legW / 2, x1 - 0.37 - legW / 2]) {
    let y = SITARA_APEX - 0.05;
    sitaraRoundel(p, lx, y - 0.32, Math.min(0.3, legW / 2));
    y -= 0.72;
    while (y - 0.42 > y0 + 0.36) {
      sitaraPanel(p, lx - legW / 2, lx + legW / 2, y - 0.42, y);
      y -= 0.52;
    }
  }
  // Gold hem along both edges of the opening.
  p.with(GOLD_SOFT, (ctx) => {
    ctx.lineWidth = 0.1;
    ctx.beginPath();
    ctx.moveTo(cx - KAABA.door.width / 2, y0);
    ctx.lineTo(cx, SITARA_APEX);
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
  p.clipped(
    (ctx) => {
      ctx.beginPath();
      ctx.moveTo(x0 - 0.01, db);
      ctx.lineTo(x1 + 0.01, db);
      ctx.lineTo(x1 + 0.01, SITARA_HEM);
      ctx.lineTo(cx, SITARA_APEX + 0.02);
      ctx.lineTo(x0 - 0.01, SITARA_HEM);
      ctx.closePath();
    },
    () => {
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
    },
  );
}

/** Evenly spread panels with drops between them, for a stretch of wall. */
function panelsAndDrops(
  x0: number,
  x1: number,
  panels: number,
  width: number,
): BelowBeltItem[] {
  const items: BelowBeltItem[] = [];
  const slot = (x1 - x0) / panels;
  for (let i = 0; i < panels; i++) {
    const c = x0 + (i + 0.5) * slot;
    items.push({ panel: c, width });
    items.push({ drop: x0 + i * slot });
  }
  items.push({ drop: x1 });
  return items;
}

function paintWall(p: Painter, wall: Wall) {
  const L = wall.length;
  paintStones(p, L, wall.id.length * 13 + 29);
  paintWhiteCloth(p, L);
  paintFabric(p, L);
  paintBelt(p, L);

  switch (wall.id) {
    case "door":
      // Black Stone corner on the left: its half of the drop column; the
      // curtain; then panels and drops towards the Iraqi corner.
      paintDropColumn(p, 0);
      belowBelt(p, panelsAndDrops(SITARA_X1 + 0.5, L - 0.55, 2, 2.3));
      paintSitara(p);
      paintDoor(p);
      break;
    case "hijr":
      belowBelt(p, panelsAndDrops(0.6, L - 0.6, 2, 2.9));
      break;
    case "southWest":
      // Yemeni corner at the right end.
      belowBelt(p, panelsAndDrops(0.6, L - 0.9, 2, 3.1));
      paintYemeniBand(p, L, -1);
      paintYemeniArch(p, L, -1);
      break;
    case "southEast":
      // Yemeni corner at the left end; Black Stone corner at the right, with
      // the other half of its drop column.
      belowBelt(p, panelsAndDrops(0.9, L - 1.0, 2, 2.5));
      paintYemeniBand(p, 0, 1);
      paintYemeniArch(p, 0, 1);
      paintDropColumn(p, L);
      break;
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

/** Paints the atlas at `size` × `size` pixels, one quarter per wall. */
export function createKiswaTextures(size: number): KiswaTextures {
  const make = () => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
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

  for (const wall of WALLS) {
    const r = KISWA_ATLAS[wall.id];
    const x0 = r.u0 * size;
    const regionW = (r.u1 - r.u0) * size;
    const regionH = (r.v1 - r.v0) * size;
    const yTop = (1 - r.v1) * size;
    const sx = regionW / wall.length;
    const sy = regionH / (KISWA_Y1 - KISWA_Y0);
    painter.each((ctx) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, yTop, regionW, regionH);
      ctx.clip();
      // Wall metres, y up: canvas x = x0 + sx·x, canvas y = yTop + (Y1 − y)·sy.
      ctx.setTransform(sx, 0, 0, -sy, x0, yTop + KISWA_Y1 * sy);
    });
    paintWall(painter, wall);
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
