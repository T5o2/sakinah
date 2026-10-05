import { TAWAF, WALKER_MIX } from "@/lib/config/scene";
import { CLEARANCE, MAQAM } from "./layout";

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

/** Innermost radius a walker may use at θ, clear of the Kaaba and Hijr Ismail. */
export function clearanceRadius(theta: number): number {
  const half = CLEARANCE.hijrHalfSectorDeg * DEG;
  const a = Math.abs(wrapAngle(theta));
  const bulge = a < half ? Math.cos((a / half) * (Math.PI / 2)) ** 2 : 0;
  return CLEARANCE.base + CLEARANCE.hijrBulge * bulge;
}

export type WalkerKind = "ihram" | "abaya" | "carrier" | "mother";

export interface Walker {
  kind: WalkerKind;
  /** Angle at t = 0. */
  theta0: number;
  /** Distance outside the clearance line, metres: the walker's lane. */
  offset: number;
  /** Walking speed along the lane, m/s (shared by everyone in the lane). */
  speed: number;
  /** Angular speed, rad/s — always positive (counterclockwise). */
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
}

export type GroupKind = "couple" | "family" | "friends";

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
  const carriers = Math.round(count * WALKER_MIX.carrier);
  const abayas = Math.round(count * WALKER_MIX.abaya);
  const mothers = Math.round(count * WALKER_MIX.mother);
  const kinds: WalkerKind[] = [
    ...Array<WalkerKind>(count - carriers - abayas - mothers).fill("ihram"),
    ...Array<WalkerKind>(abayas).fill("abaya"),
    ...Array<WalkerKind>(carriers).fill("carrier"),
    ...Array<WalkerKind>(mothers).fill("mother"),
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

/** Shortest radius a lane reaches in a full turn (away from the Hijr bulge). */
const laneInnerRadius = (offset: number) => CLEARANCE.base + offset;

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
 */
export function formGroups(
  kinds: WalkerKind[],
  rng: () => number,
): { kind: GroupKind; ids: number[] }[] {
  const pools: Record<WalkerKind, number[]> = {
    ihram: [],
    abaya: [],
    carrier: [],
    mother: [],
  };
  kinds.forEach((k, i) => pools[k].push(i));
  const take = (k: WalkerKind) => pools[k].pop();
  const target = Math.round(kinds.length * TAWAF.groups.share);
  const groups: { kind: GroupKind; ids: number[] }[] = [];
  let grouped = 0;
  let misses = 0;
  while (grouped < target && misses < 20) {
    const u = rng();
    const ids: (number | undefined)[] = [];
    let kind: GroupKind;
    // Couples most often (about 40% of groups), then families, then friends.
    if (u < 0.5) {
      kind = "couple";
      ids.push(take("ihram"), take("abaya"));
    } else if (u < 0.78) {
      kind = "family";
      const size = 3 + Math.floor(rng() * 3);
      ids.push(take(rng() < 0.4 && pools.carrier.length ? "carrier" : "ihram"));
      ids.push(take(rng() < 0.35 && pools.mother.length ? "mother" : "abaya"));
      for (let k = 2; k < size; k++) ids.push(take(rng() < 0.5 ? "abaya" : "ihram"));
    } else {
      kind = "friends";
      const size = 2 + Math.floor(rng() * 3);
      for (let k = 0; k < size; k++) ids.push(take("ihram"));
    }
    if (ids.some((id) => id === undefined)) {
      // Not enough of a kind left: put back what was taken and try another.
      for (const id of ids) if (id !== undefined) pools[kinds[id]!].push(id);
      misses++;
      continue;
    }
    groups.push({ kind, ids: ids as number[] });
    grouped += ids.length;
  }
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
    const woman = isWoman(kind);
    const metres = span(woman ? body.womenHeight : body.menHeight, middling());
    return {
      height: metres / (woman ? body.modelHeight.woman : body.modelHeight.man),
      breadth: span(body.breadth, middling()),
    };
  });
  /** Room a walker takes along a lane from strangers: its body, and the surge. */
  const need = (i: number) => TAWAF.minGap * bodies[i]!.breadth + 2 * TAWAF.surge;
  /** Room within its own group, which surges as one. */
  const core = (i: number) => TAWAF.minGap * bodies[i]!.breadth;

  // Units: each group, laid out in a loose cluster, and each walker alone.
  const groups = formGroups(kinds, rng);
  // In couples and families the men are mostly taller than the women: a
  // woman as tall as the tallest man with her is redrawn a little shorter.
  for (const { ids } of groups) {
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
  const units: Unit[] = groups.map(({ ids }, g) => {
    // Fill the two lanes of a corridor from the front, each member going
    // a little behind the last one in its lane: side by side or staggered.
    const next = [0, rng() * 0.35];
    const members = ids.map((id) => {
      const lane = next[0]! <= next[1]! ? (rng() < 0.8 ? 0 : 1) : rng() < 0.8 ? 1 : 0;
      const along = next[lane]! + core(id) / 2 + rng() * 0.2;
      next[lane] = along + core(id) / 2;
      return { id, lane, along };
    });
    return { members, group: g };
  });
  const inGroup = new Set(groups.flatMap((g) => g.ids));
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
  const radius = (band: number, lane: number) => {
    const b = bands[band]!;
    return laneInnerRadius(lanes[b[Math.min(lane, b.length - 1)]!]!);
  };
  const tryPlace = (band: number, u: number) => {
    const unit = units[u]!;
    const width = bands[band]!.length;
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
    const meanOffset = b.reduce((a, l) => a + lanes[l]!, 0) / b.length;
    const omega =
      (minSpeed + (maxSpeed - minSpeed) * rng()) /
      (CLEARANCE.base + CLEARANCE.hijrBulge * 0.25 + meanOffset);
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
          speed: omega * (CLEARANCE.base + CLEARANCE.hijrBulge * 0.25 + offset),
          omega,
          phase: rng() * TAU,
          // A group surges as one, so it never spreads out.
          surgeRate,
          surgePhase,
          ...bodies[m.id]!,
          group: unit.group,
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

/** Angle of a walker after `t` seconds. */
export function walkerTheta(walker: Walker, t: number): number {
  return (
    walker.theta0 +
    walker.omega * t +
    surgeAt(walker, t) / laneInnerRadius(walker.offset)
  );
}

/**
 * Radius of a lane at θ, squeezed aside round the Maqam Ibrahim. Near the
 * Maqam the lanes either side of it move apart, out to the keep-out radius,
 * and back, the shift fading over a few metres before and after. The
 * squeeze keeps the lanes in order (it is monotonic in the radius), so
 * walkers in neighbouring lanes stay apart, only a little closer.
 */
export function laneRadius(walker: Walker, theta: number): number {
  const r = clearanceRadius(theta) + walker.offset;
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
  const theta = walkerTheta(walker, t);
  return tawafPosition(laneRadius(walker, theta), theta);
}

/**
 * Walking step phase at `t`: one half-turn per step, so the feet keep pace
 * with the distance actually walked and do not slide. Taller walkers take
 * longer strides, so fewer steps.
 */
export function walkerStep(walker: Walker, t: number): number {
  return (
    walker.phase +
    (Math.PI * TAWAF.stepsPerMetre * walkerDistance(walker, t)) / walker.height
  );
}

/** Half a walker's width at the shoulders and robe hem, metres (for spacing checks). */
export function walkerRadius(walker: Walker): number {
  return 0.27 * walker.breadth;
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
