import { TAWAF, WALKER_MIX } from "@/lib/config/scene";
import { CLEARANCE } from "./layout";

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

function pickKind(u: number): WalkerKind {
  if (u < WALKER_MIX.ihram) return "ihram";
  if (u < WALKER_MIX.ihram + WALKER_MIX.abaya) return "abaya";
  return "carrier";
}

export function createWalkers(count: number, seed = 1447): Walker[] {
  const rng = createRng(seed);
  const [minOffset, maxOffset] = TAWAF.offset;
  const [minSpeed, maxSpeed] = TAWAF.speed;
  const walkers: Walker[] = [];

  for (let i = 0; i < count; i++) {
    const offset =
      minOffset + (maxOffset - minOffset) * rng() ** TAWAF.offsetBias;
    const speed = minSpeed + (maxSpeed - minSpeed) * rng();
    // Angular speed from the mean radius of this walker's lane.
    const laneRadius = CLEARANCE.base + CLEARANCE.hijrBulge * 0.25 + offset;
    walkers.push({
      kind: pickKind(rng()),
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

/** Floor position of a walker after `t` seconds. */
export function walkerPosition(walker: Walker, t: number): Point2 {
  const theta = walkerTheta(walker, t);
  return tawafPosition(clearanceRadius(theta) + walker.offset, theta);
}
