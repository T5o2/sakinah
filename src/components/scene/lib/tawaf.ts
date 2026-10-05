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

export type WalkerKind = "ihram" | "abaya" | "carrier";

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
  /** Uniform 0–1 value for per-figure variation (height). */
  variation: number;
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
  const carriers = Math.round(count * WALKER_MIX.carrier);
  const abayas = Math.round(count * WALKER_MIX.abaya);
  const kinds: WalkerKind[] = [
    ...Array<WalkerKind>(count - carriers - abayas).fill("ihram"),
    ...Array<WalkerKind>(abayas).fill("abaya"),
    ...Array<WalkerKind>(carriers).fill("carrier"),
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
 * The crowd walks in rings ("lanes"), denser near the Kaaba. Everyone in a
 * lane keeps the lane's pace, so neighbours in a lane never close up; lanes
 * are far enough apart that people in neighbouring lanes pass side by side.
 * Spacing within a lane is irregular, with a minimum gap, and each walker
 * drifts a little forward and back along it, so no one marches in step.
 */
export function createWalkers(count: number, seed = 1447): Walker[] {
  const rng = createRng(seed);
  const [minOffset, maxOffset] = TAWAF.offset;
  const [minSpeed, maxSpeed] = TAWAF.speed;
  const kinds = walkerKinds(count, rng);
  const lanes = laneOffsets();
  const minGap = TAWAF.minGap + 2 * TAWAF.surge;

  // Each walker's preferred lane, biased towards the Kaaba…
  const wanted = kinds.map(() => {
    const offset =
      minOffset + (maxOffset - minOffset) * rng() ** TAWAF.offsetBias;
    let best = 0;
    lanes.forEach((l, i) => {
      if (Math.abs(l - offset) < Math.abs(lanes[best]! - offset)) best = i;
    });
    return best;
  });
  // …within each lane's room (half its length kept free, so gaps stay
  // irregular); a full lane passes walkers outwards.
  const room = (k: number) =>
    Math.floor((Math.PI * laneInnerRadius(lanes[k]!)) / minGap);
  const members: number[][] = lanes.map(() => []);
  wanted
    .map((lane, i) => [lane, i] as const)
    .sort((a, b) => a[0] - b[0])
    .forEach(([lane, i]) => {
      let l = lane;
      while (l < lanes.length - 1 && members[l]!.length >= room(l)) l++;
      members[l]!.push(i);
    });

  const walkers = new Array<Walker>(count);
  members.forEach((ids, l) => {
    if (ids.length === 0) return;
    const offset = lanes[l]!;
    const speed = minSpeed + (maxSpeed - minSpeed) * rng();
    // Angular speed from the mean radius of the lane, Hijr bulge included.
    const omega =
      speed / (CLEARANCE.base + CLEARANCE.hijrBulge * 0.25 + offset);
    // Irregular gaps round the lane, never under the minimum.
    const gapMin = minGap / laneInnerRadius(offset);
    const weights = ids.map(() => -Math.log(1 - rng() * 0.999));
    const spare = TAU - gapMin * ids.length;
    const total = weights.reduce((a, b) => a + b, 0);
    let theta = rng() * TAU;
    ids.forEach((id, j) => {
      walkers[id] = {
        kind: kinds[id]!,
        theta0: theta,
        offset,
        speed,
        omega,
        phase: rng() * TAU,
        surgeRate: 0.25 + 0.2 * rng(),
        surgePhase: rng() * TAU,
        variation: rng(),
      };
      theta += gapMin + (spare * weights[j]!) / total;
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
 * with the distance actually walked and do not slide.
 */
export function walkerStep(walker: Walker, t: number): number {
  return (
    walker.phase + Math.PI * TAWAF.stepsPerMetre * walkerDistance(walker, t)
  );
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
