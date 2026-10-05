import {
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  Quaternion,
  SphereGeometry,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { PALETTE } from "../lib/palette";
import { createRng, type WalkerKind } from "../lib/tawaf";

/**
 * The people performing tawaf: three faceless figures in the guards' simple
 * style, but far lighter, since there are hundreds of them. Modelled facing
 * +Z with the feet at the origin; the figure's right is −X.
 *
 * Each vertex carries, besides its own colour, what it is to the walker
 * shader (walkerMaterial.ts): skin or hair (coloured per walker), a leg or
 * arm that swings with the step about a pivot height, a hem that sways, and
 * hair that only some walkers have (bald, short, long). One geometry per
 * kind, drawn instanced: the variety costs no extra models.
 */

const UP = new Vector3(0, 1, 0);
const v = (x: number, y: number, z: number) => new Vector3(x, y, z);

/** Colour slot: the part's own colour, or the walker's skin, hair, or carried child's cloth. */
export const TINT = { own: 0, skin: 1, hair: 2, child: 3 } as const;
/**
 * Hair roles, shaped per walker by the shader: the crop over the scalp
 * (gone when bald, closer or fuller with the style, scaled about the head
 * centre given as the piece's pivot) and the hair down the back (shown from
 * medium length, stretched down from its top, the pivot).
 */
export const HAIR = { none: 0, crop: 1, back: 2 } as const;
/**
 * Carried-child roles: the child's body (scaled per walker about the
 * piece's `kidPivot`), a girl's head cover (girls only) and a boy's hair
 * (boys only).
 */
export const KID = { none: 0, body: 1, cover: 2, hair: 3 } as const;
/** Hair styles for men, shortest first. */
export const HAIR_STYLE = {
  bald: 0,
  veryShort: 1,
  short: 2,
  medium: 3,
  long: 4,
  veryLong: 5,
} as const;

/** Hip and shoulder heights the legs and arms swing about. */
export const HIP_Y = 0.88;
export const SHOULDER_Y = 1.38;

interface Piece {
  geometry: BufferGeometry;
  /** Own colour (sRGB), used when `tint` is own. */
  color?: string;
  tint?: number;
  hair?: number;
  /** Swing: +1 / −1 for the legs, ∓0.5 for the arms (opposite the legs). */
  swing?: number;
  pivot?: number;
  /** Hem sway: full at the floor, fading to nothing at this height. */
  hemAbove?: number;
  /** Carried-child role, and the point the child is scaled about. */
  kid?: number;
  kidPivot?: Vector3;
}

/** A tapered limb between two points (open ends; joints are covered by balls). */
function limb(a: Vector3, b: Vector3, ra: number, rb: number, radial = 5) {
  const g = new CylinderGeometry(rb, ra, a.distanceTo(b), radial, 1, true);
  g.applyQuaternion(
    new Quaternion().setFromUnitVectors(UP, b.clone().sub(a).normalize()),
  );
  const mid = a.clone().add(b).multiplyScalar(0.5);
  return g.translate(mid.x, mid.y, mid.z);
}

function ball(
  at: Vector3,
  r: number,
  scale: [number, number, number] = [1, 1, 1],
  segments: [number, number] = [5, 2],
) {
  return new SphereGeometry(r, ...segments)
    .scale(...scale)
    .translate(at.x, at.y, at.z);
}

/** Merges pieces into one non-indexed geometry with colour and walker data per vertex. */
function build(pieces: Piece[]): BufferGeometry {
  const colour = new Color();
  const prepared = pieces.map((p) => {
    const g = p.geometry.index ? p.geometry.toNonIndexed() : p.geometry;
    if (g !== p.geometry) p.geometry.dispose();
    if (g.getAttribute("uv")) g.deleteAttribute("uv");
    const pos = g.getAttribute("position");
    const n = pos.count;
    colour.set(p.color ?? "#ffffff");
    const col = new Float32Array(n * 3);
    const tint = new Float32Array(n * 2);
    const motion = new Float32Array(n * 3);
    const kid = new Float32Array(n * 4);
    const kp = p.kidPivot ?? new Vector3();
    for (let i = 0; i < n; i++) {
      col.set([colour.r, colour.g, colour.b], i * 3);
      tint.set([p.tint ?? TINT.own, p.hair ?? HAIR.none], i * 2);
      kid.set([p.kid ?? KID.none, kp.x, kp.y, kp.z], i * 4);
      const hem =
        p.hemAbove === undefined
          ? 0
          : Math.max(0, Math.min(1, (p.hemAbove - pos.getY(i)) / p.hemAbove));
      motion.set([p.swing ?? 0, p.pivot ?? 0, hem], i * 3);
    }
    g.setAttribute("color", new BufferAttribute(col, 3));
    g.setAttribute("aTint", new BufferAttribute(tint, 2));
    g.setAttribute("aMotion", new BufferAttribute(motion, 3));
    g.setAttribute("aKid", new BufferAttribute(kid, 4));
    return g;
  });
  const merged = mergeGeometries(prepared, false);
  for (const g of prepared) g.dispose();
  if (!merged) throw new Error("Walker pieces cannot be merged");
  return merged;
}

/**
 * Splits a piece by triangle along a line in (x, y): the triangles above it
 * become bare skin. Used for the rida, which leaves the right shoulder bare.
 */
function bareAbove(
  geometry: BufferGeometry,
  line: (x: number) => number,
): { covered: BufferGeometry; bare: BufferGeometry } {
  const g = geometry.index ? geometry.toNonIndexed() : geometry;
  const pos = g.getAttribute("position");
  const nrm = g.getAttribute("normal");
  const sides: number[][] = [[], []];
  for (let i = 0; i < pos.count; i += 3) {
    const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3;
    const cy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
    sides[cy > line(cx) ? 1 : 0]!.push(i, i + 1, i + 2);
  }
  const pick = (ids: number[]) => {
    const out = new BufferGeometry();
    const p = new Float32Array(ids.length * 3);
    const n = new Float32Array(ids.length * 3);
    ids.forEach((id, k) => {
      p.set([pos.getX(id), pos.getY(id), pos.getZ(id)], k * 3);
      n.set([nrm.getX(id), nrm.getY(id), nrm.getZ(id)], k * 3);
    });
    out.setAttribute("position", new BufferAttribute(p, 3));
    out.setAttribute("normal", new BufferAttribute(n, 3));
    return out;
  };
  g.dispose();
  return { covered: pick(sides[0]!), bare: pick(sides[1]!) };
}

/**
 * Head: a plain egg for face and scalp (no features), a crop over the top
 * and back, and hair down the back of the neck; the shader shapes both to
 * each man's style, from bald to very long.
 */
function head(y: number): Piece[] {
  return [
    { geometry: ball(v(0, y, 0), 0.1, [0.9, 1.1, 1], [6, 4]), tint: TINT.skin },
    {
      geometry: new SphereGeometry(0.108, 6, 2, 0, Math.PI * 2, 0, Math.PI * 0.55)
        .scale(0.9, 1.1, 1)
        .rotateX(-0.35)
        .translate(0, y, -0.006),
      tint: TINT.hair,
      hair: HAIR.crop,
      pivot: y,
    },
    {
      geometry: new CylinderGeometry(0.075, 0.085, 0.24, 6, 1, true, Math.PI * 0.6, Math.PI * 0.8)
        .scale(1, 1, 0.9)
        .translate(0, y - 0.1, -0.02),
      tint: TINT.hair,
      hair: HAIR.back,
      pivot: y + 0.02,
    },
  ];
}

/** Bare legs inside the izar, swinging from the hip: shins and feet show below its hem. */
function legs(): Piece[] {
  return [-1, 1].flatMap((side): Piece[] => {
    const x = side * 0.085;
    return [
      {
        geometry: limb(v(x, HIP_Y - 0.1, 0), v(x, 0.07, 0), 0.065, 0.042),
        tint: TINT.skin,
        swing: side,
        pivot: HIP_Y,
      },
      {
        geometry: ball(v(x, 0.035, 0.05), 0.045, [1, 0.6, 2.2]),
        tint: TINT.skin,
        swing: side,
        pivot: HIP_Y,
      },
    ];
  });
}

/**
 * Man in ihram, 1.70 m (photo 98): the white lower wrap (izar) from the
 * waist nearly to the ankles; the upper wrap (rida) over the left shoulder,
 * across the chest under the right arm and down the left side, leaving the
 * right shoulder and arm bare. Legs and arms swing with his steps.
 */
function ihramPieces(armsDown = true): Piece[] {
  const white = PALETTE.ihram;
  // The rida's upper edge: from the left shoulder down to the right armpit.
  const ridaLine = (x: number) => 1.2 + (x + 0.2) * 0.62;
  const torso = bareAbove(
    new CylinderGeometry(0.19, 0.175, 0.52, 7, 3, true)
      .scale(1, 1, 0.66)
      .translate(0, 1.18, 0),
    ridaLine,
  );
  const shoulders = bareAbove(
    new SphereGeometry(0.19, 8, 2, 0, Math.PI * 2, 0, Math.PI / 2)
      .scale(1, 0.4, 0.66)
      .translate(0, 1.43, 0),
    ridaLine,
  );
  const arms: Piece[] = [
    // Right arm bare, the left covered by the rida to the elbow. Each arm
    // swings with the opposite leg (the right arm with the left leg, +1).
    { geometry: limb(v(-0.2, SHOULDER_Y, 0), v(-0.23, 1.1, 0.02), 0.05, 0.042), tint: TINT.skin, swing: 0.5, pivot: SHOULDER_Y },
    { geometry: limb(v(-0.23, 1.1, 0.02), v(-0.22, 0.86, 0.06), 0.042, 0.035), tint: TINT.skin, swing: 0.5, pivot: SHOULDER_Y },
    { geometry: ball(v(-0.22, 0.84, 0.065), 0.04), tint: TINT.skin, swing: 0.5, pivot: SHOULDER_Y },
    { geometry: limb(v(0.21, SHOULDER_Y, 0), v(0.25, 1.1, 0.02), 0.065, 0.055), color: white, swing: -0.5, pivot: SHOULDER_Y },
    { geometry: limb(v(0.25, 1.1, 0.02), v(0.23, 0.86, 0.06), 0.042, 0.035), tint: TINT.skin, swing: -0.5, pivot: SHOULDER_Y },
    { geometry: ball(v(0.23, 0.84, 0.065), 0.04), tint: TINT.skin, swing: -0.5, pivot: SHOULDER_Y },
  ];
  return [
    ...legs(),
    // Izar, flaring a little to the hem just above the ankles.
    {
      // Full and nearly round, so the legs swing inside it.
      geometry: new CylinderGeometry(0.185, 0.26, 0.86, 9, 1, true)
        .scale(1, 1, 0.95)
        .translate(0, 0.57, 0),
      color: white,
      hemAbove: 0.45,
    },
    { geometry: torso.covered, color: white },
    { geometry: torso.bare, tint: TINT.skin },
    { geometry: shoulders.covered, color: white },
    { geometry: shoulders.bare, tint: TINT.skin },
    // The rida's end hanging down his left side.
    {
      geometry: new CylinderGeometry(0.07, 0.09, 0.62, 5, 1, true)
        .scale(0.6, 1, 1.4)
        .translate(0.2, 1.1, 0),
      color: white,
    },
    { geometry: ball(v(-0.19, 1.39, 0), 0.058), tint: TINT.skin },
    { geometry: ball(v(0.2, 1.4, 0), 0.07), color: white },
    ...(armsDown ? arms : []),
    { geometry: limb(v(0, 1.42, 0), v(0, 1.52, 0), 0.05, 0.05), tint: TINT.skin },
    ...head(1.6),
  ];
}

/** Woman in a black abaya, 1.62 m: one long robe from the floor, head covered; the hem sways as she walks. */
function abayaPieces(): Piece[] {
  const black = PALETTE.abaya;
  return [
    {
      geometry: new CylinderGeometry(0.165, 0.26, 1.36, 9, 2, true)
        .scale(1, 1, 0.75)
        .translate(0, 0.68, 0),
      color: black,
      hemAbove: 0.5,
    },
    {
      geometry: new SphereGeometry(0.2, 10, 2, 0, Math.PI * 2, 0, Math.PI / 2)
        .scale(1, 0.42, 0.72)
        .translate(0, 1.34, 0),
      color: black,
    },
    { geometry: limb(v(-0.19, 1.32, 0), v(-0.22, 0.85, 0.04), 0.055, 0.05), color: black, swing: 0.4, pivot: 1.32 },
    { geometry: limb(v(0.19, 1.32, 0), v(0.22, 0.85, 0.04), 0.055, 0.05), color: black, swing: -0.4, pivot: 1.32 },
    { geometry: ball(v(0, 1.5, 0), 0.115, [0.95, 1.1, 1], [6, 4]), color: black },
  ];
}

/**
 * A carried child's head: a plain egg (no face), a boy's short crop, and a
 * girl's head cover; scaled with the child about `pivot`.
 */
function childHead(at: Vector3, r: number, pivot: Vector3): Piece[] {
  return [
    { geometry: ball(at, r, [0.9, 1.08, 1], [6, 4]), tint: TINT.skin, kid: KID.body, kidPivot: pivot },
    {
      geometry: new SphereGeometry(r * 1.08, 6, 2, 0, Math.PI * 2, 0, Math.PI * 0.55)
        .scale(0.9, 1.08, 1)
        .rotateX(-0.35)
        .translate(at.x, at.y, at.z - 0.005),
      tint: TINT.hair,
      kid: KID.hair,
      kidPivot: pivot,
    },
    {
      // A girl's cover: over the head and down to the shoulders, face open.
      geometry: new SphereGeometry(r * 1.22, 5, 2, Math.PI * 0.75, Math.PI * 1.5, 0, Math.PI * 0.7)
        .scale(0.95, 1.15, 1)
        .translate(at.x, at.y - 0.01, at.z - 0.01),
      tint: TINT.child,
      kid: KID.cover,
      kidPivot: pivot,
    },
  ];
}

/**
 * Man in ihram carrying a child on his shoulders: the child sits behind his
 * head, legs forward over his chest, held at the shins by both his hands.
 * Per walker the child is a boy (white) or a girl (white or black, head
 * covered), and a little younger or older (scaled about the seat).
 */
function carrierPieces(): Piece[] {
  const white = PALETTE.ihram;
  const shins: Vector3[] = [v(-0.12, 1.3, 0.13), v(0.12, 1.3, 0.13)];
  const seat = v(0, 1.52, -0.06);
  const k = (geometry: BufferGeometry, tint: number): Piece => ({
    geometry,
    tint,
    kid: KID.body,
    kidPivot: seat,
  });
  return [
    ...ihramPieces(false),
    // His arms raised to hold the child's shins.
    { geometry: limb(v(-0.2, SHOULDER_Y, 0), v(-0.24, 1.2, 0.08), 0.05, 0.042), tint: TINT.skin },
    { geometry: limb(v(-0.24, 1.2, 0.08), shins[0]!, 0.042, 0.035), tint: TINT.skin },
    { geometry: limb(v(0.21, SHOULDER_Y, 0), v(0.25, 1.2, 0.08), 0.065, 0.055), color: white },
    { geometry: limb(v(0.25, 1.2, 0.08), shins[1]!, 0.042, 0.035), tint: TINT.skin },
    // The child: seated on his shoulders, torso upright, hands on his head.
    k(ball(v(0, 1.56, -0.07), 0.1, [1.2, 0.7, 1]), TINT.child),
    k(limb(v(0, 1.56, -0.07), v(0, 1.88, -0.08), 0.095, 0.085), TINT.child),
    k(ball(v(0, 1.88, -0.08), 0.085, [1.1, 0.6, 0.9]), TINT.child),
    k(limb(v(-0.08, 1.56, -0.03), v(-0.12, 1.53, 0.11), 0.045, 0.04), TINT.child),
    k(limb(v(0.08, 1.56, -0.03), v(0.12, 1.53, 0.11), 0.045, 0.04), TINT.child),
    k(limb(v(-0.12, 1.53, 0.11), v(-0.13, 1.27, 0.15), 0.04, 0.032), TINT.skin),
    k(limb(v(0.12, 1.53, 0.11), v(0.13, 1.27, 0.15), 0.04, 0.032), TINT.skin),
    k(limb(v(-0.1, 1.84, -0.08), v(-0.07, 1.72, 0), 0.032, 0.026), TINT.child),
    k(limb(v(0.1, 1.84, -0.08), v(0.07, 1.72, 0), 0.032, 0.026), TINT.child),
    ...childHead(v(0, 2.0, -0.09), 0.08, seat),
  ];
}

/**
 * Woman in a black abaya carrying a small child in her arms in front of her
 * chest: her forearms cross under the child, who lies across them, head to
 * her right. The child varies as on the carriers' shoulders.
 */
function motherPieces(): Piece[] {
  const black = PALETTE.abaya;
  const centre = v(0.02, 1.12, 0.21);
  return [
    ...abayaPieces().filter((p) => p.swing === undefined),
    // Arms bent, forearms across the front, holding the child.
    { geometry: limb(v(-0.19, 1.32, 0), v(-0.21, 1.06, 0.1), 0.055, 0.05), color: black },
    { geometry: limb(v(-0.21, 1.06, 0.1), v(0.1, 1.06, 0.24), 0.05, 0.045), color: black },
    { geometry: limb(v(0.19, 1.32, 0), v(0.2, 1.1, 0.1), 0.055, 0.05), color: black },
    { geometry: limb(v(0.2, 1.1, 0.1), v(-0.12, 1.13, 0.26), 0.05, 0.045), color: black },
    // The child, wrapped, lying across her arms.
    {
      geometry: ball(centre, 0.1, [1.7, 0.85, 0.85], [6, 3]),
      tint: TINT.child,
      kid: KID.body,
      kidPivot: centre,
    },
    ...childHead(v(-0.17, 1.17, 0.21), 0.062, centre),
  ];
}

/**
 * A child walking, 1.20 m (scaled per walker from 0.90 to 1.30 m): a long
 * plain robe in the child's cloth (white, or black for some girls), legs
 * and feet below it, sleeves to the wrists, a boy's hair or a girl's head
 * cover. Arms swing, or reach forward to hold a parent's back.
 */
function childPieces(): Piece[] {
  const sleeve = (side: number): Piece[] => [
    {
      geometry: limb(v(side * 0.13, 0.93, 0), v(side * 0.15, 0.63, 0.03), 0.035, 0.03),
      tint: TINT.child,
      swing: side * -0.5,
      pivot: 0.93,
    },
    {
      geometry: ball(v(side * 0.15, 0.6, 0.035), 0.028),
      tint: TINT.skin,
      swing: side * -0.5,
      pivot: 0.93,
    },
  ];
  const leg = (side: number): Piece[] => [
    {
      geometry: limb(v(side * 0.06, 0.5, 0), v(side * 0.06, 0.06, 0), 0.045, 0.032),
      tint: TINT.skin,
      swing: side,
      pivot: 0.62,
    },
    {
      geometry: ball(v(side * 0.06, 0.03, 0.035), 0.033, [1, 0.6, 2]),
      tint: TINT.skin,
      swing: side,
      pivot: 0.62,
    },
  ];
  return [
    ...leg(-1),
    ...leg(1),
    {
      geometry: new CylinderGeometry(0.12, 0.17, 0.73, 8, 2, true)
        .scale(1, 1, 0.8)
        .translate(0, 0.585, 0),
      tint: TINT.child,
      hemAbove: 0.4,
    },
    {
      geometry: new SphereGeometry(0.13, 8, 2, 0, Math.PI * 2, 0, Math.PI / 2)
        .scale(1, 0.4, 0.8)
        .translate(0, 0.95, 0),
      tint: TINT.child,
    },
    ...sleeve(-1),
    ...sleeve(1),
    { geometry: limb(v(0, 0.95, 0), v(0, 1.03, 0), 0.035, 0.035), tint: TINT.skin },
    ...childHead(v(0, 1.11, 0), 0.085, v(0, 0, 0)),
  ];
}

/** One merged geometry per kind of walker, with colour and walker data per vertex. */
export function createWalkerGeometry(kind: WalkerKind): BufferGeometry {
  const pieces = {
    ihram: ihramPieces,
    abaya: abayaPieces,
    carrier: carrierPieces,
    mother: motherPieces,
    child: childPieces,
  }[kind];
  return build(pieces());
}
/** Skin tones, dark to light, about equally common (sRGB). */
const SKIN_TONES = [
  "#3f2a1f",
  "#5a3a27",
  "#7a4f35",
  "#9a6a4a",
  "#b88660",
  "#d2a582",
  "#e8c4a4",
];
/** Hair colours with their shares: black, browns, blond, greys (sRGB). */
const HAIR_COLOURS: [string, number][] = [
  ["#141110", 0.4],
  ["#3b2a1e", 0.22],
  ["#6b4a2e", 0.1],
  ["#c9a467", 0.08],
  ["#8f8d88", 0.14],
  ["#c8c6c0", 0.06],
];
/** Men's hair styles with their shares: bald and very long fewest. */
const HAIR_STYLES: [number, number][] = [
  [HAIR_STYLE.bald, 0.06],
  [HAIR_STYLE.veryShort, 0.17],
  [HAIR_STYLE.short, 0.27],
  [HAIR_STYLE.medium, 0.22],
  [HAIR_STYLE.long, 0.19],
  [HAIR_STYLE.veryLong, 0.09],
];
/** Carried children's sizes with their shares: mostly small or middle. */
const CHILD_SIZES: [number, number][] = [
  [0, 0.42],
  [1, 0.4],
  [2, 0.18],
];
/** Scale of a carried child at each size, on the shoulders and in the arms. */
export const CARRIED_SCALE = {
  carrier: [0.62, 0.74, 0.86],
  mother: [0.7, 0.82, 0.94],
} as const;
/** Young children's hair: black and browns only. */
export const CHILD_HAIR = ["#141110", "#3b2a1e", "#6b4a2e"] as const;
/** A carried child's cloth: white for boys; white or black for girls. */
const CHILD_WHITE = PALETTE.childWhite;
const CHILD_BLACK = PALETTE.childBlack;

function pick<T>(choices: [T, number][], u: number): T {
  let acc = 0;
  for (const [value, share] of choices) {
    acc += share;
    if (u < acc) return value;
  }
  return choices[choices.length - 1]![0];
}

export interface WalkerLook {
  /** sRGB colours. */
  skin: string;
  hair: string;
  /** Hair style, see HAIR_STYLE. */
  style: number;
  /**
   * For a child (carried or walking): girl or boy, cloth colour (sRGB), and
   * for a carried child its size: 0 small, 1 middle, 2 a little bigger.
   */
  child: { girl: boolean; cloth: string; size: number };
}

/** Skin, hair colour and hair style for walker `index` (deterministic). */
export function walkerLook(index: number): WalkerLook {
  const rng = createRng(0x5a4b + index * 7919);
  return {
    skin: SKIN_TONES[Math.floor(rng() * SKIN_TONES.length)]!,
    hair: pick(HAIR_COLOURS, rng()),
    style: pick(HAIR_STYLES, rng()),
    child: (() => {
      const girl = rng() < 0.5;
      return {
        girl,
        cloth: girl && rng() < 0.5 ? CHILD_BLACK : CHILD_WHITE,
        size: pick(CHILD_SIZES, rng()),
      };
    })(),
  };
}
