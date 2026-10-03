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
/**
 * Dim silver-white thread: only fine accents (the small stars of the lattice)
 * inside the curtain's three distinguished shapes, about 5–10% of each shape.
 * A faint glint from the mataf, never dominant and never bright white.
 */
const SILVER = surf("#bdbcb6", 1, 0.4, 0.5, 0.85);
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
/**
 * The embroidered drop, one size everywhere (reference photo 42): 0.8 m tall,
 * between the old small (0.54 m) and large (1.05 m) drops.
 */
const DROP = { height: 0.8, aspect: 0.62 };
export const DROP_WIDTH = DROP.height * DROP.aspect;
/** Corner shield height: about 1.08 × the belt's height (photo 40). */
const SHIELD_H = KAABA.beltHeight * 1.08;
/**
 * Black gaps round the corner shield as shares of its height, measured on
 * photos 45 and 47: above it, up to the belt (0.44 and 0.36–0.43), and below
 * it, down to the first drop of the Black Stone column (0.40).
 */
const SHIELD_GAP_ABOVE = 0.42;
const SHIELD_GAP_BELOW = 0.4;
/**
 * The corner shield (reference photos 40–41, 45–47): straight sides, a top
 * curving up to a pointed tip, centred on the corner edge — half on each wall,
 * its roundel on the edge itself — with a black gap between it and the belt.
 * Painted about as wide as it is tall (approved).
 */
const CORNER_SHIELD = {
  halfWidth: 0.54,
  top: BELT_BOTTOM - SHIELD_GAP_ABOVE * SHIELD_H,
  bottom: BELT_BOTTOM - (SHIELD_GAP_ABOVE + 1) * SHIELD_H,
  /** Share of the height taken by the pointed top. */
  pointShare: 0.3,
};
/**
 * Below the belt (photo 43): drops sit close to the panels, with one equal
 * gap between every two neighbours — corner shield, drop, panel, curtain.
 */
export const BELOW_BELT_GAP = 0.15;
/**
 * Black Stone corner drop column: a black gap under the corner shield (see
 * SHIELD_GAP_BELOW), then drops at one even spacing down to the stones — two
 * on the black kiswa and two on the white cloth, none crossing the hem
 * between them. Folded over the corner edge itself, as at the Haram: half of
 * each drop on each wall.
 */
const DROP_COLUMN = { count: 4, bottomMargin: 0.05 };

/** Centre heights of the Black Stone column's drops, top to bottom. */
export function dropColumnCentres(): number[] {
  const { count, bottomMargin } = DROP_COLUMN;
  const h = DROP.height;
  const top = CORNER_SHIELD.bottom - SHIELD_GAP_BELOW * SHIELD_H;
  const bottom = KAABA.stoneTop + bottomMargin;
  // The first drop hangs from `top`, the last rests on `bottom`.
  const gap = (top - bottom - count * h) / (count - 1);
  return Array.from({ length: count }, (_, i) => top - h / 2 - i * (h + gap));
}
/** The belt is made of 16 pieces, four on each side (documented). */
const BELT_PIECES_PER_WALL = 4;
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
          // Silver accents are drawn finer than gold ones: a faint glint, not a pattern.
          const thin = accent === SILVER ? 0.045 : 0.07;
          p.star(accent, cell * thin, x + cell / 2, y, cell * 0.26);
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

/**
 * Outline of the drop (photo 42): a wide round bottom — a full circle as wide
 * as the drop — rising into a short, slightly concave pointed top. `waves`
 * scallops the round part like the embroidered rim.
 */
function dropPath(
  ctx: Ctx,
  cx: number,
  cy: number,
  w: number,
  h: number,
  waves = 0,
) {
  const R = w / 2;
  const yc = cy - h / 2 + R;
  const tip = cy + h / 2;
  const join = (35 * Math.PI) / 180;
  const jx = R * Math.cos(join);
  const jy = yc + R * Math.sin(join);
  ctx.beginPath();
  ctx.moveTo(cx, tip);
  // Down the right side of the point (concave), into the circle.
  ctx.bezierCurveTo(
    cx + R * 0.12,
    tip - (tip - jy) * 0.45,
    cx + jx * 1.02,
    jy + R * 0.35,
    cx + jx,
    jy,
  );
  // Round the bottom, right to left, with scallops.
  const n = 72;
  for (let i = 1; i <= n; i++) {
    const a = join - (i / n) * (Math.PI + 2 * join);
    const r = R * (1 + waves * Math.cos(a * 16));
    ctx.lineTo(cx + r * Math.cos(a), yc + r * Math.sin(a));
  }
  // Up the left side of the point, mirrored.
  ctx.bezierCurveTo(
    cx - jx * 1.02,
    jy + R * 0.35,
    cx - R * 0.12,
    tip - (tip - jy) * 0.45,
    cx,
    tip,
  );
  ctx.closePath();
}

/**
 * The embroidered drop, one shape and one size everywhere (photo 42): a
 * scalloped gold rim, a small knob on the pointed top, and inside a dark
 * ground with pierced gold ornament (where the original has an inscription).
 */
function drop(p: Painter, cx: number, cy: number) {
  const h = DROP.height;
  const w = h * DROP.aspect;
  const body = h * 0.9;
  const bodyCy = cy - (h - body) / 2;
  p.with(GOLD, (ctx) => {
    dropPath(ctx, cx, bodyCy, w, body, 0.045);
    ctx.fill();
  });
  // Knob on the tip.
  p.disc(GOLD, cx, bodyCy + body / 2 + h * 0.035, h * 0.035);
  p.with(GOLD, (ctx) => {
    ctx.beginPath();
    ctx.moveTo(cx - h * 0.012, bodyCy + body / 2 + h * 0.06);
    ctx.lineTo(cx + h * 0.012, bodyCy + body / 2 + h * 0.06);
    ctx.lineTo(cx, cy + h / 2);
    ctx.closePath();
    ctx.fill();
  });
  const inner = (ctx: Ctx, k: number) =>
    dropPath(
      ctx,
      cx,
      bodyCy - body * 0.02 * k,
      w * (1 - 0.2 * k),
      body * (1 - 0.13 * k),
    );
  p.with(GOLD_SOFT, (ctx) => {
    ctx.lineWidth = 0.012;
    inner(ctx, 0.45);
    ctx.stroke();
  });
  p.with(GROUND, (ctx) => {
    inner(ctx, 1);
    ctx.fill();
  });
  p.clipped(
    (ctx) => inner(ctx, 1.1),
    () =>
      goldFill(
        p,
        cx - w / 2,
        bodyCy - body / 2,
        cx + w / 2,
        bodyCy + body / 2,
        GOLD,
        GOLD_SOFT,
        1.7,
      ),
  );
}

/**
 * The corner shield (photo 41 for its details, photo 40 for its proportions):
 * straight sides and a flat bottom; the top curves up from both shoulders to
 * a pointed tip with a small finial. A gold frame with a fine inner rule, a
 * dark ground with fine gold ornament, and an ornamented roundel at its
 * centre. Painted centred on a corner edge (`edgeX`), half on each wall.
 */
function cornerShield(p: Painter, edgeX: number) {
  const { halfWidth: hw, top, bottom, pointShare } = CORNER_SHIELD;
  const pointH = (top - bottom) * pointShare;
  const shoulder = top - pointH;
  const shape = (ctx: Ctx, inset: number) => {
    const x0 = edgeX - hw + inset;
    const x1 = edgeX + hw - inset;
    const b = bottom + inset;
    const s = shoulder - inset * 0.3;
    const apex = top - inset * 1.6;
    ctx.beginPath();
    ctx.moveTo(x0, b);
    ctx.lineTo(x1, b);
    ctx.lineTo(x1, s);
    // Ogee: out from the shoulder, then in to the tip.
    ctx.bezierCurveTo(
      x1,
      s + pointH * 0.55,
      edgeX + (x1 - edgeX) * 0.2,
      apex - pointH * 0.45,
      edgeX,
      apex,
    );
    ctx.bezierCurveTo(
      edgeX - (edgeX - x0) * 0.2,
      apex - pointH * 0.45,
      x0,
      s + pointH * 0.55,
      x0,
      s,
    );
    ctx.closePath();
  };
  p.with(GOLD, (ctx) => {
    shape(ctx, 0);
    ctx.fill();
  });
  // Finial above the tip.
  p.disc(GOLD, edgeX, top + 0.02, 0.035);
  p.with(GOLD_SOFT, (ctx) => {
    ctx.lineWidth = 0.014;
    shape(ctx, 0.035);
    ctx.stroke();
  });
  p.with(GROUND, (ctx) => {
    shape(ctx, 0.06);
    ctx.fill();
  });
  p.clipped(
    (ctx) => shape(ctx, 0.075),
    () =>
      goldFill(p, edgeX - hw, bottom, edgeX + hw, top, GOLD, GOLD_SOFT, 1.7),
  );
  // Ornamented roundel at the centre of the square body.
  const cy = (bottom + shoulder) / 2 + 0.02;
  const r = hw * 0.48;
  p.disc(GOLD, edgeX, cy, r);
  p.ring(GOLD_SOFT, 0.012, edgeX, cy, r - 0.025);
  p.disc(GROUND, edgeX, cy, r - 0.045);
  p.rosette(GOLD, edgeX, cy, (r - 0.05) * 0.95, 12);
  p.ring(GOLD_SOFT, 0.012, edgeX, cy, r * 0.42);
  p.disc(GOLD, edgeX, cy, r * 0.16);
}

/**
 * The hizam: one continuous gold band round the whole Kaaba, divided into
 * panels by thin separators, each panel densely embroidered.
 */
function paintBelt(p: Painter, L: number) {
  p.rect(GOLD, 0, BELT_BOTTOM, L, BELT_TOP);
  p.rect(GOLD_SOFT, 0, BELT_TOP - 0.05, L, BELT_TOP - 0.025);
  p.rect(GOLD_SOFT, 0, BELT_BOTTOM + 0.025, L, BELT_BOTTOM + 0.05);
  const count = BELT_PIECES_PER_WALL;
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

export type BelowBeltItem = { panel: number; width: number } | { drop: number };

function belowBelt(p: Painter, items: BelowBeltItem[]) {
  for (const item of items) {
    if ("panel" in item) panel(p, item.panel, item.width);
    else drop(p, item.drop, PANEL_CY);
  }
}

/**
 * Black Stone corner: the column of drops under the corner shield (see
 * DROP_COLUMN). Painted centred on the corner edge (`edgeX`), so half of each
 * drop falls on each wall.
 */
function paintDropColumn(p: Painter, edgeX: number) {
  for (const cy of dropColumnCentres()) drop(p, edgeX, cy);
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
  // It starts right under the corner shield (photo 47): its top end tucks
  // behind the shield, so it seems to run on from the shield's flat bottom.
  const top = CORNER_SHIELD.bottom + 0.1;
  const bottom = KAABA.whiteClothTop + 0.05;
  p.rect(GOLD, x0, bottom, x1, top);
  p.rect(GROUND, x0 + 0.04, bottom + 0.04, x1 - 0.04, top - 0.04);
  goldFill(p, x0 + 0.06, bottom + 0.06, x1 - 0.06, top - 0.06);
  // Its head is the corner shield (painted with the other corners).
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

/**
 * Fills `path` like a curtain panel: gold frame, dark ground and the same
 * fine gold ornament as the rest of the curtain. `accented` swaps the
 * lattice's small stars for dim silver — a light touch of depth for the
 * three distinguished shapes.
 */
function curtainShape(
  p: Painter,
  path: (ctx: Ctx, inset: number) => void,
  bounds: [number, number, number, number],
  accented = false,
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
    () => goldFill(p, ...bounds, GOLD, accented ? SILVER : GOLD_SOFT, 1.7),
  );
}

/**
 * One of the four arched medallions: rounded above, gold like the rest of
 * the curtain, with dim silver accents.
 */
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
    const shoulder = y1 - w / 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0 + inset);
    ctx.lineTo(x1, y0 + inset);
    ctx.lineTo(x1, shoulder);
    ctx.arc(cx, shoulder, w / 2 - inset, 0, Math.PI, false);
    ctx.closePath();
  };
  curtainShape(p, arch, [cx - w / 2, y0, cx + w / 2, y1], true);
}

/**
 * The central cartouche: a long horizontal panel with pointed ends (an
 * elongated hexagon), gold like the rest of the curtain, with dim silver
 * accents.
 */
function curtainCartouche(
  p: Painter,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
) {
  const cy = (y0 + y1) / 2;
  const tip = (y1 - y0) * 0.55;
  const hexagon = (ctx: Ctx, inset: number) => {
    // Pull the tips in a little more than the sides so the frame stays even.
    const k = inset * 1.4;
    ctx.beginPath();
    ctx.moveTo(x0 + k, cy);
    ctx.lineTo(x0 + tip + inset * 0.4, y1 - inset);
    ctx.lineTo(x1 - tip - inset * 0.4, y1 - inset);
    ctx.lineTo(x1 - k, cy);
    ctx.lineTo(x1 - tip - inset * 0.4, y0 + inset);
    ctx.lineTo(x0 + tip + inset * 0.4, y0 + inset);
    ctx.closePath();
  };
  curtainShape(p, hexagon, [x0, y0, x1, y1], true);
}

/** A small roundel of the side frames: gold, a thin black edge, a light-gold rosette. */
function curtainSmallRoundel(p: Painter, cx: number, cy: number, r: number) {
  p.disc(GROUND, cx, cy, r);
  p.disc(GOLD, cx, cy, r - 0.015);
  p.rosette(GOLD_SOFT, cx, cy, r * 0.8, 8);
  p.ring(GROUND, 0.01, cx, cy, r * 0.45);
  p.disc(GOLD_SOFT, cx, cy, r * 0.16);
}

/**
 * A large roundel beside the opening: gold like the rest of the curtain,
 * with dim silver accents, and a gold disc at the centre.
 */
function curtainBigRoundel(p: Painter, cx: number, cy: number, r: number) {
  const circle = (ctx: Ctx, inset: number) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r - inset, 0, Math.PI * 2);
  };
  curtainShape(p, circle, [cx - r, cy - r, cx + r, cy + r], true);
  p.disc(GROUND, cx, cy, r * 0.27);
  p.disc(GOLD, cx, cy, r * 0.24);
  p.rosette(GOLD_SOFT, cx, cy, r * 0.21, 8);
  p.disc(GOLD, cx, cy, r * 0.06);
}

/**
 * The door curtain (sitara), close to the real one but geometric throughout,
 * with no letters: gold throughout, with dim silver accents inside its
 * three distinguished shapes. From the top: a wide panel, a row of four arched
 * medallions, and a long pointed cartouche reaching down to the apex of the
 * inverted-V opening (just under half the curtain's height). Either side of
 * the opening: a large roundel, then small panels down to the hem. A column
 * of small roundels runs down each side edge.
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

  // Side frames: a column of small gold roundels on the same gold field as
  // the middle, so the edges are as bright as the centre (no dark border).
  const sideR = 0.14;
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
    curtainArch(p, ix0 + slot * (k + 0.5), y - 0.9, y, slot - 0.14);
  }
  y -= 0.9 + gap;

  // 3. The long pointed cartouche, down to just above the apex of the opening, with small
  //    panels in its corners.
  const apexTop = SITARA_APEX + gap;
  const bandH = y - apexTop;
  curtainCartouche(p, ix0, ix1, apexTop + bandH * 0.18, y - bandH * 0.18);
  const corner = Math.min(0.3, bandH * 0.3);
  for (const sx of [ix0, ix1 - corner]) {
    curtainPanel(p, sx, sx + corner, y - corner, y);
    curtainPanel(p, sx, sx + corner, apexTop, apexTop + corner);
  }

  // 4. Either side of the opening: a large roundel, then small panels
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

/**
 * Below the belt between two neighbouring ornaments that end at `left` and
 * `right` (photo 43): drop, panel, drop, … , panel, drop — one drop between
 * every two panels and one at each end, with BELOW_BELT_GAP between every
 * two neighbours. The panels share whatever length is left, so the run is
 * evenly spaced and symmetric about its middle.
 */
export function belowBeltRun(
  left: number,
  right: number,
  panels: number,
): BelowBeltItem[] {
  const g = BELOW_BELT_GAP;
  const dw = DROP_WIDTH;
  const width = (right - left - (panels + 1) * dw - 2 * (panels + 1) * g) / panels;
  if (width <= 0) throw new Error("No room for the panels below the belt");
  const items: BelowBeltItem[] = [];
  let x = left + g;
  for (let i = 0; i <= panels; i++) {
    items.push({ drop: x + dw / 2 });
    x += dw + g;
    if (i === panels) break;
    items.push({ panel: x + width / 2, width });
    x += width + g;
  }
  return items;
}

function paintWall(p: Painter, wall: Wall) {
  const L = wall.length;
  paintStones(p, L, wall.id.length * 13 + 29);
  paintWhiteCloth(p, L);
  paintFabric(p, L);
  paintBelt(p, L);

  // Each run lies between the corner shields (or the curtain) beside it.
  const hw = CORNER_SHIELD.halfWidth;
  switch (wall.id) {
    case "door":
      // Black Stone corner on the left: its half of the drop column; the
      // curtain; then one long panel between two drops towards the Iraqi corner.
      paintDropColumn(p, 0);
      belowBelt(p, belowBeltRun(SITARA_X1, L - hw, 1));
      paintSitara(p);
      paintDoor(p);
      break;
    case "hijr":
      belowBelt(p, belowBeltRun(hw, L - hw, 2));
      break;
    case "southWest":
      // Yemeni corner at the right end.
      belowBelt(p, belowBeltRun(hw, L - hw, 2));
      paintYemeniBand(p, L, -1);
      paintYemeniArch(p, L, -1);
      break;
    case "southEast":
      // Yemeni corner at the left end; Black Stone corner at the right, with
      // the other half of its drop column.
      belowBelt(p, belowBeltRun(hw, L - hw, 2));
      paintYemeniBand(p, 0, 1);
      paintYemeniArch(p, 0, 1);
      paintDropColumn(p, L);
      break;
  }
  // The four corner shields: each wall paints its half of the two at its ends.
  cornerShield(p, 0);
  cornerShield(p, L);
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
