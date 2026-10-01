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
/** Black Stone corner drop column: one roundel, then these drops. */
const DROP_COLUMN = { count: 5, width: 0.62, height: 0.64, step: 0.82 };
/** Thick padded black border round the stone showing at the Yemeni corner. */
const PADDED = surf("#0a0a0b", 0.3, 0.55, 0, 0.95);
const GOLD = surf(PALETTE.gold, 1, 0.3, 0.85, 0.75);
const GOLD_SOFT = surf(PALETTE.goldSoft, 1, 0.26, 0.85, 0.92);
/** Silver accents, used sparingly inside a few curtain ornaments. */
const SILVER = surf("#cfcfd2", 1, 0.28, 0.85, 0.85);
/**
 * The door is the one gold that differs from the embroidery: a dark, warm
 * gold in solid polished metal. It stands apart by being smooth and
 * reflective, not by being lighter. The curtain uses GOLD / GOLD_SOFT,
 * exactly like the belt and the panels below it, because it is embroidery on
 * the same kiswa cloth.
 */
const DOOR_METAL = surf("#d9a866", 1, 0.22, 0.9, 0.75);
const DOOR_METAL_SOFT = surf("#efcb8c", 1, 0.2, 0.9, 0.9);
const DOOR_METAL_DEEP = surf("#a87a42", 1, 0.26, 0.9, 0.6);

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
function goldFill(
  p: Painter,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  line: Surface = GOLD,
  accent: Surface = GOLD_SOFT,
  weight = 1,
) {
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
      p.with(line, (ctx) => {
        ctx.lineWidth = cell * 0.09 * weight;
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
          p.star(accent, cell * 0.07, x + cell / 2, y, cell * 0.26);
          p.disc(line, x, y, cell * 0.07 * weight);
        }
      }
    },
  );
}

/**
 * Bright embroidery fill, used by the belt, the panels below it and the
 * curtain: a gold ground carrying the same lattice as before, now drawn as
 * hair-thin black lines with light-gold stars — about 85% gold, as on the
 * real kiswa, where the gold covers almost everything.
 */
function brightFill(
  p: Painter,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
) {
  p.rect(GOLD, x0, y0, x1, y1);
  goldFill(p, x0, y0, x1, y1, GROUND, GOLD_SOFT, 0.55);
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
    brightFill(
      p,
      x0 + 0.015,
      BELT_BOTTOM + 0.095,
      x1 - 0.015,
      BELT_TOP - 0.095,
    );
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
  p.frame(
    GOLD_SOFT,
    0.018,
    x0 + 0.065,
    y0 + 0.065,
    x1 - 0.065,
    PANEL_TOP - 0.065,
  );
  brightFill(p, x0 + 0.085, y0 + 0.085, x1 - 0.085, PANEL_TOP - 0.085);
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
 * Black Stone corner: one roundel just under the belt, then five large
 * embroidered drops at a wide, even spacing — about two on the black kiswa
 * and the rest on the white cloth. Painted centred on the corner edge, so
 * half of each shape falls on each wall (`edgeX` is the corner's x).
 */
function paintDropColumn(p: Painter, edgeX: number) {
  roundel(p, edgeX, PANEL_CY, 0.3);
  const { count, width, height, step } = DROP_COLUMN;
  // Bottom drop just above the stones; the rest stacked up at `step`.
  const lowest = KAABA.stoneTop + 0.12 + height / 2;
  for (let i = 0; i < count; i++) {
    drop(p, edgeX, lowest + i * step, width, height);
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

/**
 * A curtain panel, as on the real curtain: a gold frame, and inside it a dark
 * ground carrying fine, dense gold ornament (where the original has lines of
 * calligraphy). The dark ground is what makes each shape legible.
 */
function curtainPanel(
  p: Painter,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
) {
  p.rect(GOLD, x0, y0, x1, y1);
  p.frame(GOLD_SOFT, 0.015, x0 + 0.02, y0 + 0.02, x1 - 0.02, y1 - 0.02);
  p.rect(GROUND, x0 + 0.055, y0 + 0.055, x1 - 0.055, y1 - 0.055);
  goldFill(
    p,
    x0 + 0.065,
    y0 + 0.065,
    x1 - 0.065,
    y1 - 0.065,
    GOLD,
    GOLD_SOFT,
    1.7,
  );
}

/** Fills `path` like a curtain panel: gold frame, dark ground, fine gold ornament. */
function curtainShape(
  p: Painter,
  path: (ctx: Ctx, inset: number) => void,
  bounds: [number, number, number, number],
  accent: Surface = GOLD_SOFT,
) {
  p.with(GOLD, (ctx) => {
    path(ctx, 0);
    ctx.fill();
  });
  p.with(GOLD_SOFT, (ctx) => {
    ctx.lineWidth = 0.015;
    path(ctx, 0.025);
    ctx.stroke();
  });
  p.with(GROUND, (ctx) => {
    path(ctx, 0.055);
    ctx.fill();
  });
  p.clipped(
    (ctx) => path(ctx, 0.065),
    () => goldFill(p, ...bounds, GOLD, accent, 1.7),
  );
}

/** One of the four repeated medallions: a pointed arch with a silver-hearted rosette. */
function curtainArch(
  p: Painter,
  cx: number,
  y0: number,
  y1: number,
  w: number,
) {
  const arch = (ctx: Ctx, inset: number) => {
    const x0 = cx - w / 2 + inset;
    const x1 = cx + w / 2 - inset;
    const shoulder = y1 - w * 0.55;
    ctx.beginPath();
    ctx.moveTo(x0, y0 + inset);
    ctx.lineTo(x1, y0 + inset);
    ctx.lineTo(x1, shoulder);
    ctx.quadraticCurveTo(x1, y1 - inset - w * 0.1, cx, y1 - inset);
    ctx.quadraticCurveTo(x0, y1 - inset - w * 0.1, x0, shoulder);
    ctx.closePath();
  };
  curtainShape(p, arch, [cx - w / 2, y0, cx + w / 2, y1]);
  const cy = y0 + (y1 - y0) * 0.42;
  p.disc(GOLD, cx, cy, w * 0.22);
  p.rosette(GROUND, cx, cy, w * 0.2, 8);
  p.disc(SILVER, cx, cy, w * 0.07);
}

/** The large oval: gold frame, dark ground, fine gold ornament, a small silver heart. */
function curtainOval(
  p: Painter,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
) {
  const oval = (ctx: Ctx, inset: number) => {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx - inset, ry - inset, 0, 0, Math.PI * 2);
  };
  curtainShape(p, oval, [cx - rx, cy - ry, cx + rx, cy + ry]);
  // A small silver-hearted medallion at its centre: the only silver here.
  const m = Math.min(rx, ry) * 0.32;
  p.disc(GOLD, cx, cy, m);
  p.disc(GROUND, cx, cy, m - 0.03);
  p.rosette(GOLD, cx, cy, m * 0.85, 12);
  p.disc(SILVER, cx, cy, m * 0.3);
}

/** A small roundel of the side frames: gold ring, dark ground, gold rosette. */
function curtainSmallRoundel(p: Painter, cx: number, cy: number, r: number) {
  p.disc(GOLD, cx, cy, r);
  p.disc(GROUND, cx, cy, r - 0.03);
  p.rosette(GOLD, cx, cy, r * 0.8, 8);
  p.disc(GOLD_SOFT, cx, cy, r * 0.16);
}

/**
 * A large roundel beside the opening, in nested rings: a gold frame, a dark
 * band of gold stars, a gold ring, and a decorated centre with a silver heart.
 */
function curtainBigRoundel(p: Painter, cx: number, cy: number, r: number) {
  p.disc(GOLD, cx, cy, r);
  p.ring(GOLD_SOFT, 0.015, cx, cy, r - 0.025);
  p.disc(GROUND, cx, cy, r - 0.06);
  const n = Math.max(10, Math.round((2 * Math.PI * r * 0.8) / 0.13));
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2;
    p.star(
      GOLD,
      0.02,
      cx + Math.cos(a) * r * 0.81,
      cy + Math.sin(a) * r * 0.81,
      0.045,
    );
  }
  p.disc(GOLD, cx, cy, r * 0.68);
  p.disc(GROUND, cx, cy, r * 0.62);
  p.rosette(GOLD, cx, cy, r * 0.58, 12);
  p.ring(GOLD_SOFT, Math.max(0.012, r * 0.025), cx, cy, r * 0.3);
  p.disc(SILVER, cx, cy, r * 0.17);
  p.star(GOLD, 0.02, cx, cy, r * 0.13);
}

/**
 * The door curtain (sitara), close to the real one but geometric throughout,
 * with no letters. Every shape has a gold frame around a dark ground carrying
 * fine gold ornament; the field between them is gold. From the top: a wide
 * panel, a row of four arched medallions, and a large oval reaching down to
 * the apex of the inverted-V opening (just under half the curtain's height).
 * Either side of the opening: a large ringed roundel, then small panels down
 * to the hem. A column of small roundels runs down each side edge. Silver
 * appears only as small accents.
 */
function paintSitara(p: Painter) {
  const cx = DOOR_X;
  const x0 = SITARA_X0;
  const x1 = SITARA_X1;
  const y0 = SITARA_HEM;
  const y1 = SITARA_TOP;
  const { width: dw } = KAABA.door;
  const gap = 0.04;

  // Gold field (with the faint lattice of the belt) and a thin black edge.
  brightFill(p, x0, y0, x1, y1);
  p.frame(GROUND, 0.02, x0, y0, x1, y1);

  // Side frames: a column of small roundels in a gold-framed dark strip.
  const sideR = 0.14;
  for (const sx of [x0 + 0.04, x1 - 0.04 - 2 * sideR]) {
    p.rect(GROUND, sx - 0.015, y0 + 0.03, sx + 2 * sideR + 0.015, y1 - 0.03);
  }
  for (let y = y0 + 0.2; y < y1 - 0.12; y += 2 * sideR + 0.03) {
    curtainSmallRoundel(p, x0 + 0.04 + sideR, y, sideR);
    curtainSmallRoundel(p, x1 - 0.04 - sideR, y, sideR);
  }

  const ix0 = x0 + 0.04 + 2 * sideR + gap;
  const ix1 = x1 - 0.04 - 2 * sideR - gap;
  const iw = ix1 - ix0;

  // 1. Wide panel at the top.
  let y = y1 - gap;
  curtainPanel(p, ix0, ix1, y - 0.55, y);
  y -= 0.55 + gap;

  // 2. A row of four arched medallions.
  const slot = iw / 4;
  for (let k = 0; k < 4; k++) {
    curtainArch(p, ix0 + slot * (k + 0.5), y - 0.9, y, slot - gap);
  }
  y -= 0.9 + gap;

  // 3. The large oval, down to just above the apex of the opening, with small
  //    panels in its corners.
  const apexTop = SITARA_APEX + gap;
  const ovalH = y - apexTop;
  curtainOval(p, cx, y - ovalH / 2, iw / 2, ovalH / 2);
  const corner = Math.min(0.3, ovalH * 0.3);
  for (const sx of [ix0, ix1 - corner]) {
    curtainPanel(p, sx, sx + corner, y - corner, y);
    curtainPanel(p, sx, sx + corner, apexTop, apexTop + corner);
  }

  // 4. Either side of the opening: a large ringed roundel, then small panels
  //    whose inner edge follows the sloping side of the opening.
  /** Half-width of the opening at height y (zero at the apex). */
  const open = (yy: number) =>
    ((dw / 2) * (SITARA_APEX - Math.min(yy, SITARA_APEX))) / (SITARA_APEX - y0);
  for (const side of [-1, 1] as const) {
    const outer = side < 0 ? ix0 : ix1;
    let r = 0.5;
    for (let k = 0; k < 3; k++) {
      const inner = open(SITARA_APEX - gap - 2 * r) + gap;
      r = (Math.abs(outer - cx) - inner) / 2;
    }
    r = Math.min(r, 0.62);
    const ry = SITARA_APEX - gap - r;
    curtainBigRoundel(p, cx + side * (Math.abs(outer - cx) - r), ry, r);

    let py = ry - r - gap;
    const rows = Math.max(
      1,
      Math.round((py - (y0 + 0.04) + gap) / (0.36 + gap)),
    );
    const rowH = (py - (y0 + 0.04) - gap * (rows - 1)) / rows;
    for (let i = 0; i < rows; i++) {
      const pIn = cx + side * (open(py - rowH) + gap);
      curtainPanel(
        p,
        Math.min(pIn, outer),
        Math.max(pIn, outer),
        py - rowH,
        py,
      );
      py -= rowH + gap;
    }
  }

  // Gold hem along both edges of the opening, edged in black.
  for (const [surface, width] of [
    [GROUND, 0.1],
    [GOLD_SOFT, 0.06],
  ] as const) {
    p.with(surface, (ctx) => {
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(cx - dw / 2, y0);
      ctx.lineTo(cx, SITARA_APEX);
      ctx.lineTo(cx + dw / 2, y0);
      ctx.stroke();
    });
  }
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
      p.rect(DOOR_METAL, x0, db, x1, top);
      p.frame(DOOR_METAL_DEEP, 0.05, x0, db, x1, top);
      p.rect(DOOR_METAL_DEEP, cx - 0.035, db, cx + 0.035, top);
      p.rect(
        DOOR_METAL_SOFT,
        cx - 0.07,
        db + dh * 0.42,
        cx + 0.07,
        db + dh * 0.5,
      );
      for (const lx of [x0 + dw / 4, cx + dw / 4]) {
        p.frame(
          DOOR_METAL_DEEP,
          0.025,
          lx - dw / 4 + 0.09,
          db + 0.12,
          lx + dw / 4 - 0.09,
          db + 0.55,
        );
        p.ring(DOOR_METAL_DEEP, 0.03, lx, db + dh * 0.33, dw * 0.16);
        p.rosette(DOOR_METAL_SOFT, lx, db + dh * 0.33, dw * 0.14, 8);
        p.frame(
          DOOR_METAL_DEEP,
          0.025,
          lx - dw / 4 + 0.09,
          db + dh * 0.5,
          lx + dw / 4 - 0.09,
          db + dh * 0.72,
        );
        p.ring(DOOR_METAL_DEEP, 0.03, lx, db + dh * 0.82, dw * 0.12);
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
