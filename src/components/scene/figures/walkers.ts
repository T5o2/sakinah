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

/** Colour slot: the part's own colour, or the walker's skin or hair. */
export const TINT = { own: 0, skin: 1, hair: 2 } as const;
/** Hair shown always, not when bald, or only with long hair. */
export const HAIR = { always: 0, notBald: 1, longOnly: 2 } as const;

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
    for (let i = 0; i < n; i++) {
      col.set([colour.r, colour.g, colour.b], i * 3);
      tint.set([p.tint ?? TINT.own, p.hair ?? HAIR.always], i * 2);
      const hem =
        p.hemAbove === undefined
          ? 0
          : Math.max(0, Math.min(1, (p.hemAbove - pos.getY(i)) / p.hemAbove));
      motion.set([p.swing ?? 0, p.pivot ?? 0, hem], i * 3);
    }
    g.setAttribute("color", new BufferAttribute(col, 3));
    g.setAttribute("aTint", new BufferAttribute(tint, 2));
    g.setAttribute("aMotion", new BufferAttribute(motion, 3));
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
 * Head: a plain egg for face and scalp (no features), a short crop over the
 * top and back (gone when bald), and long hair down the back of the neck
 * (only for some).
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
      hair: HAIR.notBald,
    },
    {
      geometry: new CylinderGeometry(0.075, 0.085, 0.24, 6, 1, true, Math.PI * 0.6, Math.PI * 0.8)
        .scale(1, 1, 0.9)
        .translate(0, y - 0.1, -0.02),
      tint: TINT.hair,
      hair: HAIR.longOnly,
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
    new CylinderGeometry(0.19, 0.175, 0.52, 8, 3, true)
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
      geometry: new CylinderGeometry(0.185, 0.26, 0.86, 9, 2, true)
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
      geometry: new CylinderGeometry(0.165, 0.26, 1.36, 9, 3, true)
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
 * Man in ihram carrying a child on his shoulders: the child sits behind his
 * head, legs forward over his chest, held at the shins by both his hands.
 * The child shares his skin and hair colours.
 */
function carrierPieces(): Piece[] {
  const white = PALETTE.ihram;
  const child = PALETTE.childCloth;
  const shins: Vector3[] = [v(-0.12, 1.3, 0.13), v(0.12, 1.3, 0.13)];
  return [
    ...ihramPieces(false),
    // His arms raised to hold the child's shins.
    { geometry: limb(v(-0.2, SHOULDER_Y, 0), v(-0.24, 1.2, 0.08), 0.05, 0.042), tint: TINT.skin },
    { geometry: limb(v(-0.24, 1.2, 0.08), shins[0]!, 0.042, 0.035), tint: TINT.skin },
    { geometry: limb(v(0.21, SHOULDER_Y, 0), v(0.25, 1.2, 0.08), 0.065, 0.055), color: white },
    { geometry: limb(v(0.25, 1.2, 0.08), shins[1]!, 0.042, 0.035), tint: TINT.skin },
    // The child: seated on his shoulders, torso upright, hands on his head.
    { geometry: ball(v(0, 1.56, -0.07), 0.1, [1.2, 0.7, 1]), color: child },
    { geometry: limb(v(0, 1.56, -0.07), v(0, 1.88, -0.08), 0.095, 0.085), color: child },
    { geometry: ball(v(0, 1.88, -0.08), 0.085, [1.1, 0.6, 0.9]), color: child },
    { geometry: limb(v(-0.08, 1.56, -0.03), v(-0.12, 1.53, 0.11), 0.045, 0.04), color: child },
    { geometry: limb(v(0.08, 1.56, -0.03), v(0.12, 1.53, 0.11), 0.045, 0.04), color: child },
    { geometry: limb(v(-0.12, 1.53, 0.11), v(-0.13, 1.27, 0.15), 0.04, 0.032), tint: TINT.skin },
    { geometry: limb(v(0.12, 1.53, 0.11), v(0.13, 1.27, 0.15), 0.04, 0.032), tint: TINT.skin },
    { geometry: limb(v(-0.1, 1.84, -0.08), v(-0.07, 1.72, 0), 0.032, 0.026), color: child },
    { geometry: limb(v(0.1, 1.84, -0.08), v(0.07, 1.72, 0), 0.032, 0.026), color: child },
    { geometry: ball(v(0, 2.0, -0.09), 0.08, [0.9, 1.08, 1], [6, 4]), tint: TINT.skin },
    {
      geometry: new SphereGeometry(0.086, 6, 2, 0, Math.PI * 2, 0, Math.PI * 0.55)
        .scale(0.9, 1.08, 1)
        .rotateX(-0.35)
        .translate(0, 2.0, -0.095),
      tint: TINT.hair,
    },
  ];
}

/** One merged geometry per kind of walker, with colour and walker data per vertex. */
export function createWalkerGeometry(kind: WalkerKind): BufferGeometry {
  return build(
    kind === "ihram"
      ? ihramPieces()
      : kind === "abaya"
        ? abayaPieces()
        : carrierPieces(),
  );
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
/** Hair styles with their shares: bald (few), short, long. */
const HAIR_STYLES: [number, number][] = [
  [0, 0.08],
  [1, 0.7],
  [2, 0.22],
];

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
  /** 0 bald, 1 short, 2 long. */
  style: number;
}

/** Skin, hair colour and hair style for walker `index` (deterministic). */
export function walkerLook(index: number): WalkerLook {
  const rng = createRng(0x5a4b + index * 7919);
  return {
    skin: SKIN_TONES[Math.floor(rng() * SKIN_TONES.length)]!,
    hair: pick(HAIR_COLOURS, rng()),
    style: pick(HAIR_STYLES, rng()),
  };
}
