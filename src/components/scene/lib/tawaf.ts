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
  /** Distance outside the clearance line, metres. */
  offset: number;
  /** Angular speed, rad/s — always positive (counterclockwise). */
  omega: number;
  /** Phase of the walking bob, rad. */
  phase: number;
  /** Uniform 0–1 value for per-figure variation (height, tint). */
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

export function createWalkers(count: number, seed = 1447): Walker[] {
  const rng = createRng(seed);
  const [minOffset, maxOffset] = TAWAF.offset;
  const [minSpeed, maxSpeed] = TAWAF.speed;
  const kinds = walkerKinds(count, rng);
  const walkers: Walker[] = [];

  for (let i = 0; i < count; i++) {
    const offset =
      minOffset + (maxOffset - minOffset) * rng() ** TAWAF.offsetBias;
    const speed = minSpeed + (maxSpeed - minSpeed) * rng();
    // Angular speed from the mean radius of this walker's lane.
    const laneRadius = CLEARANCE.base + CLEARANCE.hijrBulge * 0.25 + offset;
    walkers.push({
      kind: kinds[i]!,
      theta0: rng() * TAU,
      offset,
      omega: speed / laneRadius,
      phase: rng() * TAU,
      variation: rng(),
    });
  }
  return walkers;
}

/** Angle of a walker after `t` seconds. */
export function walkerTheta(walker: Walker, t: number): number {
  return walker.theta0 + walker.omega * t;
}

/**
 * How close a walker's centre may come to the Maqam's centre: its granite
 * footing (1.05 m), a walker's body (0.35 m) and a margin.
 */
export const MAQAM_KEEP_OUT = 1.05 + 0.35 + 0.3;
const MAQAM_R = Math.hypot(MAQAM.x, MAQAM.z);
const MAQAM_THETA = Math.atan2(-MAQAM.z, MAQAM.x);

/**
 * Lane radius at θ, stepping smoothly round the Maqam Ibrahim: a walker
 * whose lane would cross it eases out (or in, whichever side it is nearer)
 * to clear it, and back. The step reaches the keep-out radius beside the
 * Maqam and fades over 2.5 × that distance before and after it.
 */
export function laneRadius(walker: Walker, theta: number): number {
  const r = clearanceRadius(theta) + walker.offset;
  const c = r - MAQAM_R;
  const along = wrapAngle(theta - MAQAM_THETA) * r;
  const reach = 2.5 * MAQAM_KEEP_OUT;
  if (Math.abs(c) >= MAQAM_KEEP_OUT || Math.abs(along) >= reach) return r;
  const w = Math.cos(((Math.PI / 2) * along) / reach) ** 2;
  const side = c >= 0 ? 1 : -1;
  return MAQAM_R + side * (Math.abs(c) + (MAQAM_KEEP_OUT - Math.abs(c)) * w);
}

/** Floor position of a walker after `t` seconds. */
export function walkerPosition(walker: Walker, t: number): Point2 {
  const theta = walkerTheta(walker, t);
  return tawafPosition(laneRadius(walker, theta), theta);
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
