import { TAWAF, WALKER_MIX } from "@/lib/config/scene";
import { CLEARANCE, GUARDS, HALF_X, HALF_Z, HIJR, KAABA, MAQAM } from "./layout";

/**
 * Tawaf kinematics. Pure functions, no three.js, so they can be unit-tested.
 *
 * Convention: θ grows counterclockwise seen from above (+Y). Tawaf is always
 * counterclockwise, so walkers only ever move towards larger θ. Nothing here
 * depends on the UI language: the direction of tawaf is a physical fact, not
 * a reading direction.
 */

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

export interface Point2 {
  x: number;
  z: number;
}

/** Position on the floor for radius r and angle θ (θ↑ ⇒ counterclockwise from above). */
export function tawafPosition(radius: number, theta: number): Point2 {
  return { x: radius * Math.cos(theta), z: -radius * Math.sin(theta) };
}

/**
 * Rotation about +Y that turns a figure modelled facing +Z towards its
 * direction of travel at θ.
 */
export function tawafHeading(theta: number): number {
  return theta + Math.PI;
}

/** Wraps an angle to (-π, π]. */
export function wrapAngle(theta: number): number {
  const a = ((theta % TAU) + TAU) % TAU;
  return a > Math.PI ? a - TAU : a;
}

/**
 * The outer rings' line at θ: a circle clear of the Kaaba's corners that
 * bulges round Hijr Ismail. Lanes far enough out run at a fixed offset
 * outside it; inner lanes follow the Kaaba and the Hijr instead (laneShapeRadius).
 */
export function clearanceRadius(theta: number): number {
  const half = CLEARANCE.hijrHalfSectorDeg * DEG;
  const a = Math.abs(wrapAngle(theta));
  const bulge = a < half ? Math.cos((a / half) * (Math.PI / 2)) ** 2 : 0;
  return CLEARANCE.base + CLEARANCE.hijrBulge * bulge;
}

export type WalkerKind = "ihram" | "abaya" | "carrier" | "mother" | "child";

export interface Walker {
  kind: WalkerKind;
  /** Phase round the lane at t = 0 (2π a full turn, see lanePoint). */
  theta0: number;
  /** The walker's lane, metres (see laneShapeRadius). */
  offset: number;
  /** Walking speed along the lane, m/s, steady all the way round. */
  speed: number;
  /** Phase speed, rad/s, shared by its corridor — always positive (counterclockwise). */
  omega: number;
  /** Phase of the walking step, rad. */
  phase: number;
  /** Gentle surge back and forth along the lane: rate (rad/s) and phase. */
  surgeRate: number;
  surgePhase: number;
  /** Scale on the figure's height (1 = as modelled). */
  height: number;
  /** Scale on the figure's width and depth: slim < 1 < broad. */
  breadth: number;
  /** Index of the group this walker walks with, or −1 alone. */
  group: number;
  /** A parent and a walking child: the other one's index, or −1. */
  partner: number;
  /** Which of the four ways they walk (see PAIR_CASES), or −1. */
  pairCase: number;
  /** Arms raised forward, radians: on a parent's shoulders or a parent's back. 0 = arms swinging. */
  reach: number;
}

export type GroupKind = "couple" | "family" | "friends" | "parentChild";

/**
 * A child walking with a parent: behind the father holding his back,
 * ahead of the father with his hands on its shoulders, behind the mother
 * holding her abaya, ahead of the mother with her hands on its shoulders.
 */
export const PAIR_CASES = [
  { parent: "ihram", childAhead: false },
  { parent: "ihram", childAhead: true },
  { parent: "abaya", childAhead: false },
  { parent: "abaya", childAhead: true },
] as const;

export interface Pair {
  parent: number;
  child: number;
  pairCase: number;
}

/** Small deterministic PRNG (mulberry32) so the scene — and its poster — is reproducible. */
export function createRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Exactly the configured share of each kind (rounded), in a shuffled order
 * so the kinds mix evenly round the mataf.
 */
export function walkerKinds(count: number, rng: () => number): WalkerKind[] {
  // Walking children come out of every other kind in proportion.
  const children = Math.round(count * WALKER_MIX.child);
  const rest = 1 - WALKER_MIX.child;
  const carriers = Math.round(count * WALKER_MIX.carrier * rest);
  const abayas = Math.round(count * WALKER_MIX.abaya * rest);
  const mothers = Math.round(count * WALKER_MIX.mother * rest);
  const kinds: WalkerKind[] = [
    ...Array<WalkerKind>(count - carriers - abayas - mothers - children).fill("ihram"),
    ...Array<WalkerKind>(abayas).fill("abaya"),
    ...Array<WalkerKind>(carriers).fill("carrier"),
    ...Array<WalkerKind>(mothers).fill("mother"),
    ...Array<WalkerKind>(children).fill("child"),
  ];
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [kinds[i], kinds[j]] = [kinds[j]!, kinds[i]!];
  }
  return kinds;
}

/**
 * How close a walker's centre may come to the Maqam's centre: its granite
 * footing (1.05 m), a walker's body (0.35 m) and a margin.
 */
export const MAQAM_KEEP_OUT = 1.05 + 0.35 + 0.3;
const MAQAM_R = Math.hypot(MAQAM.x, MAQAM.z);
const MAQAM_THETA = Math.atan2(-MAQAM.z, MAQAM.x);
/** Lane offset that would pass right over the Maqam's centre. */
const MAQAM_OFFSET = MAQAM_R - CLEARANCE.base;

/**
 * Lane offsets: rings `laneSpacing` apart, placed so that the Maqam's centre
 * falls exactly between two of them (no lane runs into it head-on).
 */
export function laneOffsets(): number[] {
  const [lo, hi] = TAWAF.offset;
  const step = TAWAF.laneSpacing;
  const first = Math.ceil((lo - MAQAM_OFFSET) / step - 0.5);
  const lanes: number[] = [];
  for (let k = first; MAQAM_OFFSET + (k + 0.5) * step <= hi; k++) {
    lanes.push(MAQAM_OFFSET + (k + 0.5) * step);
  }
  return lanes;
}

/* ------------------------------------------------------------------------ */
/* Lane shapes: close round the Kaaba and the Hijr, rings further out.       */
/* ------------------------------------------------------------------------ */

/** Half a walker's width at average breadth (walkerRadius at breadth 1). */
const BODY_HALF_WIDTH = 0.27;
/** The Hijr wall's capstone overhangs both faces by 9 cm (landmarks/hijr.ts). */
const HIJR_FACE = HIJR.thickness / 2 + 0.09;
/** The marble base's outer edge, all round (also where the dark strip runs without it). */
const BASE_X = HALF_X + KAABA.baseOutset;
const BASE_Z = HALF_Z + KAABA.baseOutset;
/** The Hijr's outer face, as a whole ellipse: its gates and openings count as closed. */
const HIJR_A = HIJR.radiusX + HIJR_FACE;
const HIJR_B = HIJR.radiusZ + HIJR_FACE;

/** Distance from (x, z) to an origin-centred ellipse with semi-axes a, b; 0 inside. */
function ellipseDistance(x: number, z: number, a: number, b: number): number {
  const px = Math.abs(x);
  const pz = Math.abs(z);
  if ((px / a) ** 2 + (pz / b) ** 2 <= 1) return 0;
  // Newton's method on the angle of the nearest point, in the first quadrant.
  let t = Math.atan2(a * pz, b * px);
  for (let i = 0; i < 8; i++) {
    const c = Math.cos(t);
    const s = Math.sin(t);
    const ex = a * c - px;
    const ez = b * s - pz;
    const g = -ex * a * s + ez * b * c;
    const h = (a * s) ** 2 + (b * c) ** 2 - ex * a * c - ez * b * s;
    t = Math.min(Math.PI / 2, Math.max(0, t - g / h));
  }
  return Math.hypot(px - a * Math.cos(t), pz - b * Math.sin(t));
}

/**
 * Distance on the floor from (x, z) to the nearest thing walkers go round:
 * the Kaaba's marble base or the Hijr's outer face. 0 inside either.
 */
export function obstacleDistance(x: number, z: number): number {
  const base = Math.hypot(
    Math.max(Math.abs(x) - BASE_X, 0),
    Math.max(Math.abs(z) - BASE_Z, 0),
  );
  return Math.min(base, ellipseDistance(x - HIJR.centerX, z, HIJR_A, HIJR_B));
}

/** Outer root of a·r² + b·r + c = 0 (a > 0, real roots), or 0 if none. */
function outerRoot(a: number, b: number, c: number): number {
  const disc = b * b - 4 * a * c;
  return disc < 0 ? 0 : (-b + Math.sqrt(disc)) / (2 * a);
}

/**
 * Radius at θ of the line `d` metres out from the Kaaba and the Hijr. Both
 * are convex and contain the origin, so each line `d` out from one of them
 * is crossed once by a ray from the origin, and the line round both is the
 * farther of the two crossings.
 */
function contourRadius(theta: number, d: number): number {
  const ux = Math.abs(Math.cos(theta));
  const uz = Math.abs(Math.sin(theta));
  // Round the base: a rectangle with rounded corners, solved directly.
  let base: number;
  if (ux > 1e-9 && ((BASE_X + d) / ux) * uz <= BASE_Z) base = (BASE_X + d) / ux;
  else if (uz > 1e-9 && ((BASE_Z + d) / uz) * ux <= BASE_X) base = (BASE_Z + d) / uz;
  else {
    const dot = ux * BASE_X + uz * BASE_Z;
    base = outerRoot(1, -2 * dot, BASE_X ** 2 + BASE_Z ** 2 - d * d);
  }
  // Round the Hijr: no closed form, but the line lies within the ellipse
  // grown by d, so search only where that reaches past the base's line.
  const vx = Math.cos(theta);
  const vz = -Math.sin(theta);
  const A = HIJR_A + d;
  const B = HIJR_B + d;
  const grown = outerRoot(
    vx ** 2 / A ** 2 + vz ** 2 / B ** 2,
    (-2 * vx * HIJR.centerX) / A ** 2,
    HIJR.centerX ** 2 / A ** 2 - 1,
  );
  if (grown <= base) return base;
  let lo = base;
  let hi = grown;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (ellipseDistance(mid * vx - HIJR.centerX, mid * vz, HIJR_A, HIJR_B) > d) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

/** Where the guards stand on the floor, as figures/guards.ts places them. */
export function guardFloorPositions(): Point2[] {
  const bs = GUARDS.blackStone;
  const ye = GUARDS.yemeni;
  const gz = HIJR.radiusZ * Math.sin(HIJR.arcHalfAngleDeg * DEG) + GUARDS.hijrGate.out;
  return [
    { x: -HALF_X + bs.along, z: HALF_Z + bs.out },
    { x: -HALF_X - ye.out, z: -HALF_Z + ye.along },
    { x: GUARDS.hijrGate.x, z: gz },
    { x: GUARDS.hijrGate.x, z: -gz },
  ];
}

/** Centre line of the innermost lane, out from the base and the Hijr. */
const INNER_DISTANCE = TAWAF.wallGap + BODY_HALF_WIDTH;

/** Each guard: where he stands (angle, radius) and how far the innermost lane must step out. */
const GUARD_BUMPS = guardFloorPositions().map((g) => ({
  theta: Math.atan2(-g.z, g.x),
  radius: Math.hypot(g.x, g.z),
  lift: Math.max(
    0,
    obstacleDistance(g.x, g.z) + TAWAF.guardKeepOut.distance - INNER_DISTANCE,
  ),
}));

/**
 * Extra distance from the walls for a lane `c` metres outside the innermost
 * one, at θ: the most for the innermost lane beside a guard, fading across
 * the lanes and along them. It shrinks with `c` more slowly than lanes are
 * spaced (lift < width), so lanes keep their order.
 */
function guardLift(theta: number, c: number): number {
  const { width, reach } = TAWAF.guardKeepOut;
  if (c >= width) return 0;
  let lift = 0;
  for (const g of GUARD_BUMPS) {
    const along = wrapAngle(theta - g.theta) * g.radius;
    if (Math.abs(along) >= reach) continue;
    lift += g.lift * (1 - c / width) * Math.cos(((Math.PI / 2) * along) / reach) ** 2;
  }
  return lift;
}

let innermost: number | undefined;
/** Offset of the innermost lane. */
const innerLane = () => (innermost ??= laneOffsets()[0]!);

/**
 * Radius at θ of the lane at `offset`, before the squeeze round the Maqam.
 * The innermost lane runs `wallGap` clear of the Kaaba's base and the Hijr
 * (bodies of average breadth), each lane after it one lane spacing further
 * out, so near the Kaaba the lanes are rounded rectangles with a half
 * ellipse round the Hijr. Over `shapeBlend` metres of offset they ease into
 * the outer rings, which run at `offset` outside the clearance line.
 */
export function laneShapeRadius(theta: number, offset: number): number {
  const outer = clearanceRadius(theta) + offset;
  const c = Math.max(0, offset - innerLane());
  const u = c / TAWAF.shapeBlend;
  if (u >= 1) return outer;
  const inner = contourRadius(theta, INNER_DISTANCE + c + guardLift(theta, c));
  const w = u * u * (3 - 2 * u);
  return inner + (outer - inner) * w;
}

/**
 * A lane's path, sampled at even angles round the Kaaba, with the distance
 * walked to each sample, so walkers advance by distance along it.
 */
interface LanePath {
  length: number;
  s: Float64Array;
  x: Float64Array;
  z: Float64Array;
}

const LANE_SAMPLES = 720;
const lanePaths = new Map<number, LanePath>();

function lanePath(offset: number): LanePath {
  const cached = lanePaths.get(offset);
  if (cached) return cached;
  const n = LANE_SAMPLES;
  const x = new Float64Array(n + 1);
  const z = new Float64Array(n + 1);
  const s = new Float64Array(n + 1);
  for (let i = 0; i <= n; i++) {
    const theta = (TAU * (i % n)) / n;
    const p = tawafPosition(laneShapeRadius(theta, offset), theta);
    x[i] = p.x;
    z[i] = p.z;
    if (i > 0) s[i] = s[i - 1]! + Math.hypot(x[i]! - x[i - 1]!, z[i]! - z[i - 1]!);
  }
  const path = { length: s[n]!, s, x, z };
  lanePaths.set(offset, path);
  return path;
}

/** Metres along a lane per radian of a walker's phase (its length over 2π). */
export function laneScale(offset: number): number {
  return lanePath(offset).length / TAU;
}

/**
 * Point on the lane at `offset` for a walker's phase: one full turn is 2π,
 * and equal steps of phase are equal distances walked. Phase 0 is on the
 * +X axis; growing phase goes counterclockwise, like θ.
 */
export function lanePoint(offset: number, phase: number): Point2 {
  const { length, s, x, z } = lanePath(offset);
  const at = (((phase / TAU) % 1) + 1) % 1 * length;
  let lo = 0;
  let hi = LANE_SAMPLES;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (s[mid]! <= at) lo = mid;
    else hi = mid;
  }
  const k = (at - s[lo]!) / (s[hi]! - s[lo]! || 1);
  return { x: x[lo]! + (x[hi]! - x[lo]!) * k, z: z[lo]! + (z[hi]! - z[lo]!) * k };
}

/**
 * Lanes paired into corridors two lanes wide, walked at one angular speed,
 * so a group can walk side by side across a corridor and stay together. The
 * pairing puts the Maqam's centre between two corridors, never inside one:
 * the lanes either side of it, squeezed apart round it, are in different
 * corridors, so no group is split by it. (Lane indices, inner lane first.)
 */
export function corridors(): number[][] {
  const lanes = laneOffsets();
  const inner = lanes.filter((l) => l < MAQAM_OFFSET).length;
  const out: number[][] = [];
  // Lanes inside the Maqam, paired from it inwards (an odd one left alone).
  for (let k = inner - 1; k >= 0; k -= 2) {
    out.unshift(k > 0 ? [k - 1, k] : [k]);
  }
  for (let k = inner; k < lanes.length; k += 2) {
    out.push(k + 1 < lanes.length ? [k, k + 1] : [k]);
  }
  return out;
}

interface Unit {
  /** Walker indices, and where each walks: lane in the corridor (0 inner, 1 outer) and metres along from the unit's start. */
  members: { id: number; lane: number; along: number }[];
  group: number;
}

/**
 * Picks walkers for groups out of the kinds already drawn (so the mix is
 * unchanged), until about `TAWAF.groups.share` of the crowd walks in one.
 * Every walking child goes with a parent, the four cases in turn; about
 * half of those pairs walk within a family, the rest on their own.
 */
export function formGroups(
  kinds: WalkerKind[],
  rng: () => number,
): { kind: GroupKind; ids: number[]; pairs: Pair[] }[] {
  const pools: Record<WalkerKind, number[]> = {
    ihram: [],
    abaya: [],
    carrier: [],
    mother: [],
    child: [],
  };
  kinds.forEach((k, i) => pools[k].push(i));
  const take = (k: WalkerKind) => pools[k].pop();

  // Parent and child pairs, the four cases about equally.
  const pairs: Pair[] = [];
  const cases = pools.child.map((_, j) => j % PAIR_CASES.length);
  for (let i = cases.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cases[i], cases[j]] = [cases[j]!, cases[i]!];
  }
  for (const pairCase of cases) {
    const child = take("child");
    const parent = take(PAIR_CASES[pairCase]!.parent);
    if (child === undefined || parent === undefined) break;
    pairs.push({ parent, child, pairCase });
  }

  const target = Math.round(kinds.length * TAWAF.groups.share);
  const groups: { kind: GroupKind; ids: number[]; pairs: Pair[] }[] = [];
  let grouped = 0;
  // Pairs walking on their own.
  const alone = pairs.filter((_, i) => i % 2 === 1);
  const inFamilies = pairs.filter((_, i) => i % 2 === 0);
  for (const pair of alone) {
    groups.push({ kind: "parentChild", ids: [], pairs: [pair] });
    grouped += 2;
  }
  let misses = 0;
  while (grouped < target && misses < 20) {
    const u = rng();
    const ids: (number | undefined)[] = [];
    const with_: Pair[] = [];
    let kind: GroupKind;
    // Couples most often (about 40% of groups), then families, then friends.
    if (u < 0.5) {
      kind = "couple";
      ids.push(take("ihram"), take("abaya"));
    } else if (u < 0.78) {
      kind = "family";
      const size = 3 + Math.floor(rng() * 3);
      const pair = inFamilies.pop();
      if (pair) with_.push(pair);
      ids.push(take(rng() < 0.4 && pools.carrier.length ? "carrier" : "ihram"));
      if (!pair || PAIR_CASES[pair.pairCase]!.parent === "ihram") {
        ids.push(take(rng() < 0.35 && pools.mother.length ? "mother" : "abaya"));
      }
      while (ids.length + 2 * with_.length < size) ids.push(take(rng() < 0.5 ? "abaya" : "ihram"));
    } else {
      kind = "friends";
      const size = 2 + Math.floor(rng() * 3);
      for (let k = 0; k < size; k++) ids.push(take("ihram"));
    }
    if (ids.some((id) => id === undefined)) {
      // Not enough of a kind left: put back what was taken and try another.
      for (const id of ids) if (id !== undefined) pools[kinds[id]!].push(id);
      inFamilies.push(...with_);
      misses++;
      continue;
    }
    groups.push({ kind, ids: ids as number[], pairs: with_ });
    grouped += ids.length + 2 * with_.length;
  }
  // Pairs no family took walk on their own.
  for (const pair of inFamilies) groups.push({ kind: "parentChild", ids: [], pairs: [pair] });
  return groups;
}

/**
 * The crowd walks in rings ("lanes"), denser near the Kaaba, paired into
 * corridors (see `corridors`). Everyone in a corridor keeps its angular
 * pace, so no one closes up on anyone; lanes are far enough apart that
 * people in neighbouring lanes pass side by side. About a third of the
 * crowd walks in groups — couples, small families, friends — side by side
 * or a little behind one another, in loose irregular clusters that never
 * break up. Spacing is irregular, with a minimum gap that follows each
 * walker's breadth, and walkers alone drift a little forward and back.
 */
export function createWalkers(count: number, seed = 1447): Walker[] {
  const rng = createRng(seed);
  const [minOffset, maxOffset] = TAWAF.offset;
  const [minSpeed, maxSpeed] = TAWAF.speed;
  const kinds = walkerKinds(count, rng);
  const lanes = laneOffsets();
  const bands = corridors();
  const { body } = TAWAF;
  // Mean of three uniforms: anywhere in the range, most near its middle.
  const middling = () => (rng() + rng() + rng()) / 3;
  const span = ([lo, hi]: [number, number], u: number) => lo + (hi - lo) * u;
  const isWoman = (kind: WalkerKind) => kind === "abaya" || kind === "mother";
  const bodies = kinds.map((kind) => {
    if (kind === "child") {
      return {
        // Children of every age across the range, not mostly the middle.
        height: span(body.childHeight, rng()) / body.modelHeight.child,
        breadth: span([0.9, 1.1], middling()),
      };
    }
    const woman = isWoman(kind);
    const metres = span(woman ? body.womenHeight : body.menHeight, middling());
    return {
      height: metres / (woman ? body.modelHeight.woman : body.modelHeight.man),
      breadth: span(body.breadth, middling()),
    };
  });
  /** A walker's width relative to an adult's (children are narrower). */
  const width = (i: number) => bodies[i]!.breadth * (kinds[i] === "child" ? 0.65 : 1);
  /** Room a walker takes along a lane from strangers: its body, and the surge. */
  const need = (i: number) => TAWAF.minGap * width(i) + 2 * TAWAF.surge;
  /** Room within its own group, which surges as one. */
  const core = (i: number) => TAWAF.minGap * width(i);

  // Units: each group, laid out in a loose cluster, and each walker alone.
  const groups = formGroups(kinds, rng);
  // In couples and families the men are mostly taller than the women: a
  // woman as tall as the tallest man with her is redrawn a little shorter.
  for (const { ids: singles, pairs } of groups) {
    const ids = [...singles, ...pairs.map((p) => p.parent)];
    const metres = (i: number) =>
      bodies[i]!.height *
      (isWoman(kinds[i]!) ? body.modelHeight.woman : body.modelHeight.man);
    const men = ids.filter((i) => !isWoman(kinds[i]!));
    if (men.length === 0) continue;
    const tallest = Math.max(...men.map(metres));
    for (const i of ids) {
      if (!isWoman(kinds[i]!) || metres(i) < tallest - 0.03 || rng() < 0.1) continue;
      const [lo, hi] = body.womenHeight;
      const top = Math.max(lo, Math.min(hi, tallest - 0.04));
      bodies[i]!.height = (lo + (top - lo) * middling()) / body.modelHeight.woman;
    }
  }
  // Parent and child: one close behind the other in a lane, the one behind
  // holding the back of the one ahead, or with hands on its shoulders.
  const reach = kinds.map(() => 0);
  const partnerOf = kinds.map(() => -1);
  const caseOf = kinds.map(() => -1);
  const pairGap = ({ parent, child, pairCase }: Pair): number => {
    const p = bodies[parent]!;
    const c = bodies[child]!;
    const mother = kinds[parent] === "abaya";
    partnerOf[parent] = child;
    partnerOf[child] = parent;
    caseOf[parent] = caseOf[child] = pairCase;
    if (!PAIR_CASES[pairCase]!.childAhead) {
      // The child, behind, holds the back of the ihram or the abaya at about
      // its own shoulder height, arms out in front.
      const arm = 0.33 * c.height;
      reach[child] = 1.4;
      const hold = (mother ? 0.15 : 0.13) * p.breadth + arm * Math.sin(1.4) - 0.02;
      // …but never so close that the hems touch.
      const hems = (mother ? 0.2 : 0.25) * p.breadth + 0.14 * c.breadth + 0.01;
      return Math.max(hold, hems);
    }
    // The parent, behind, rests both hands on the child's shoulders.
    const shoulder = (mother ? 1.32 : 1.38) * p.height;
    const arm = (mother ? 0.47 : 0.54) * p.height;
    const drop = shoulder - 0.93 * c.height;
    const angle = Math.acos(Math.min(0.95, Math.max(0.2, drop / arm)));
    reach[parent] = angle;
    // Never so close that the robes touch.
    return Math.max(arm * Math.sin(angle), 0.4);
  };

  const units: Unit[] = groups.map(({ ids, pairs }, g) => {
    // Blocks: each single member, and each pair (the one behind first).
    const blocks: { ids: number[]; gap: number }[] = [
      ...ids.map((id) => ({ ids: [id], gap: 0 })),
      ...pairs.map((pair) => {
        const gap = pairGap(pair);
        const ahead = PAIR_CASES[pair.pairCase]!.childAhead;
        return { ids: ahead ? [pair.parent, pair.child] : [pair.child, pair.parent], gap };
      }),
    ];
    for (let i = blocks.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [blocks[i], blocks[j]] = [blocks[j]!, blocks[i]!];
    }
    // Fill the two lanes of a corridor from the front, each block going a
    // little behind the last one in its lane: side by side or staggered.
    const next = [0, rng() * 0.35];
    const members: Unit["members"] = [];
    for (const block of blocks) {
      const lane = next[0]! <= next[1]! ? (rng() < 0.8 ? 0 : 1) : rng() < 0.8 ? 1 : 0;
      const [first, second] = block.ids;
      const along = next[lane]! + core(first!) / 2 + rng() * 0.2;
      members.push({ id: first!, lane, along });
      let last = first!;
      let end = along;
      if (second !== undefined) {
        end = along + block.gap;
        members.push({ id: second, lane, along: end });
        last = second;
      }
      next[lane] = end + core(last) / 2;
    }
    return { members, group: g };
  });
  const inGroup = new Set(
    groups.flatMap((g) => [...g.ids, ...g.pairs.flatMap((p) => [p.parent, p.child])]),
  );
  kinds.forEach((_, id) => {
    if (!inGroup.has(id)) units.push({ members: [{ id, lane: rng() < 0.5 ? 0 : 1, along: 0 }], group: -1 });
  });

  // Each unit's preferred corridor, biased towards the Kaaba. Stratified
  // (one draw from each equal slice of the distribution, in shuffled order),
  // so a few families landing together cannot upset the gradient.
  const bandOf = lanes.map(() => 0);
  bands.forEach((b, k) => b.forEach((l) => (bandOf[l] = k)));
  const slices = units.map((_, j) => j);
  for (let i = slices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [slices[i], slices[j]] = [slices[j]!, slices[i]!];
  }
  const wanted = units.map((_, u) => {
    const q = (slices[u]! + rng()) / units.length;
    const offset =
      minOffset + (maxOffset - minOffset) * q ** TAWAF.offsetBias;
    let best = 0;
    lanes.forEach((l, i) => {
      if (Math.abs(l - offset) < Math.abs(lanes[best]! - offset)) best = i;
    });
    return bandOf[best]!;
  });

  // Pack units into corridors in order, keeping a cursor (angle) per lane:
  // a unit starts where every lane it uses is free. Half of each corridor is
  // kept free, so gaps stay irregular; a full corridor passes units outwards.
  const order = units.map((_, u) => u);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  const placed = bands.map(() => [] as { unit: number; angles: number[] }[]);
  const cursors = bands.map((b) => b.map(() => 0));
  // Metres along a lane per radian of phase: turns room in metres into phase.
  const radius = (band: number, lane: number) => {
    const b = bands[band]!;
    return laneScale(lanes[b[Math.min(lane, b.length - 1)]!]!);
  };
  const tryPlace = (band: number, u: number) => {
    const unit = units[u]!;
    const width = bands[band]!.length;
    // A one-lane corridor takes people walking alone only.
    if (width === 1 && unit.members.length > 1) return false;
    const lane = (m: Unit["members"][number]) => Math.min(m.lane, width - 1);
    // One-lane corridor: the whole group goes one behind another.
    const along = (m: Unit["members"][number], k: number) =>
      width === 1
        ? unit.members.slice(0, k).reduce((a, n) => a + core(n.id), 0)
        : m.along;
    let start = 0;
    unit.members.forEach((m, k) => {
      const R = radius(band, lane(m));
      start = Math.max(
        start,
        cursors[band]![lane(m)]! + need(m.id) / 2 / R - along(m, k) / R,
      );
    });
    const angles = unit.members.map((m, k) => start + along(m, k) / radius(band, lane(m)));
    const ends = cursors[band]!.slice();
    unit.members.forEach((m, k) => {
      ends[lane(m)] = Math.max(ends[lane(m)]!, angles[k]! + need(m.id) / 2 / radius(band, lane(m)));
    });
    if (Math.max(...ends) > Math.PI) return false;
    cursors[band] = ends;
    placed[band]!.push({ unit: u, angles });
    return true;
  };
  order.forEach((u) => {
    let band = wanted[u]!;
    while (!tryPlace(band, u)) {
      if (band === bands.length - 1) throw new Error("Mataf too full for the crowd");
      band++;
    }
  });

  // Spread the spare length of each corridor between units at random, turn
  // it to a random start, and give each corridor its pace.
  const walkers = new Array<Walker>(count);
  placed.forEach((list, band) => {
    if (list.length === 0) return;
    const b = bands[band]!;
    // One pace in phase for the whole corridor, so groups walk side by side.
    const meanScale = b.reduce((a, l) => a + laneScale(lanes[l]!), 0) / b.length;
    const omega = (minSpeed + (maxSpeed - minSpeed) * rng()) / meanScale;
    const spare = TAU - Math.max(...cursors[band]!);
    const weights = list.map(() => -Math.log(1 - rng() * 0.999));
    const total = weights.reduce((a, c) => a + c, 0);
    let shift = rng() * TAU;
    list.forEach(({ unit: u, angles }, j) => {
      shift += (spare * weights[j]!) / total;
      const unit = units[u]!;
      const surgeRate = 0.25 + 0.2 * rng();
      const surgePhase = rng() * TAU;
      unit.members.forEach((m, k) => {
        const offset = lanes[b[Math.min(m.lane, b.length - 1)]!]!;
        walkers[m.id] = {
          kind: kinds[m.id]!,
          theta0: angles[k]! + shift,
          offset,
          speed: omega * laneScale(offset),
          omega,
          phase: rng() * TAU,
          // A group surges as one, so it never spreads out.
          surgeRate,
          surgePhase,
          ...bodies[m.id]!,
          group: unit.group,
          partner: partnerOf[m.id]!,
          pairCase: caseOf[m.id]!,
          reach: reach[m.id]!,
        };
      });
    });
  });
  return walkers;
}

/** Surge offset along the lane at `t`, metres. */
function surgeAt(walker: Walker, t: number): number {
  return TAWAF.surge * Math.sin(walker.surgeRate * t + walker.surgePhase);
}

/** Distance walked along the lane after `t` seconds, surge included, metres. */
export function walkerDistance(walker: Walker, t: number): number {
  return walker.speed * t + surgeAt(walker, t);
}

/**
 * A walker's phase after `t` seconds: how far round its lane, 2π a full
 * turn (see lanePoint). Always growing: counterclockwise.
 */
export function walkerTheta(walker: Walker, t: number): number {
  return (
    walker.theta0 +
    walker.omega * t +
    surgeAt(walker, t) / laneScale(walker.offset)
  );
}

/**
 * A lane's radius `r` at θ, squeezed aside round the Maqam Ibrahim. Near
 * the Maqam the lanes either side of it move apart, out to the keep-out
 * radius, and back, the shift fading over a few metres before and after.
 * The squeeze keeps the lanes in order (it is monotonic in the radius), so
 * walkers in neighbouring lanes stay apart, only a little closer.
 */
export function aroundMaqam(r: number, theta: number): number {
  const c = r - MAQAM_R;
  const width = TAWAF.maqamSqueeze;
  const reach = 2.65 * MAQAM_KEEP_OUT;
  const along = wrapAngle(theta - MAQAM_THETA) * r;
  if (Math.abs(c) >= width || Math.abs(along) >= reach) return r;
  const squeezed =
    Math.sign(c) *
    (MAQAM_KEEP_OUT + (Math.abs(c) * (width - MAQAM_KEEP_OUT)) / width);
  const w = Math.cos(((Math.PI / 2) * along) / reach) ** 2;
  return MAQAM_R + c + (squeezed - c) * w;
}

/** Floor position of a walker after `t` seconds. */
export function walkerPosition(walker: Walker, t: number): Point2 {
  const p = lanePoint(walker.offset, walkerTheta(walker, t));
  const theta = Math.atan2(-p.z, p.x);
  return tawafPosition(aroundMaqam(Math.hypot(p.x, p.z), theta), theta);
}

/**
 * Walking step phase at `t`: one half-turn per step, so the feet keep pace
 * with the distance actually walked and do not slide. Taller walkers take
 * longer strides, so fewer steps.
 */
export function walkerStep(walker: Walker, t: number): number {
  // A child's legs are shorter for its height: shorter, quicker steps.
  const leg = walker.kind === "child" ? TAWAF.body.childLeg : 1;
  return (
    walker.phase +
    (Math.PI * TAWAF.stepsPerMetre * walkerDistance(walker, t)) /
      (walker.height * leg)
  );
}

/** Half a walker's width at the shoulders and robe hem, metres (for spacing checks). */
export function walkerRadius(walker: Walker): number {
  return (walker.kind === "child" ? 0.17 : 0.27) * walker.breadth;
}

/**
 * Rotation about +Y facing a walker along its actual path at `t` (which
 * bends round the Hijr and the Maqam), for a figure modelled facing +Z.
 */
export function walkerHeading(walker: Walker, t: number): number {
  const a = walkerPosition(walker, t);
  const b = walkerPosition(walker, t + 0.25);
  return Math.atan2(b.x - a.x, b.z - a.z);
}
