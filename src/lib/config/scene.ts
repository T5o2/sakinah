/**
 * Tunables for the hero scene (SPEC §3.2–3.4). Everything the scene counts,
 * times or scales lives here, never inline in components.
 * The scene is decorative: none of these numbers represent real crowd data.
 */

export type DeviceTier = "high" | "medium" | "low";

export const DEVICE_TIERS: readonly DeviceTier[] = ["high", "medium", "low"];

export interface TierSettings {
  /** People performing tawaf. */
  walkers: number;
  pigeons: number;
  /** Device-pixel-ratio range handed to the canvas. */
  dpr: [min: number, max: number];
  antialias: boolean;
  /** Canvas-texture resolution for the mataf floor. */
  floorTextureSize: number;
  /** Fabric sheen on the kiswa (MeshPhysicalMaterial) — high tier only. */
  kiswaSheen: boolean;
}

export const TIER_SETTINGS: Record<DeviceTier, TierSettings> = {
  high: {
    walkers: 900,
    pigeons: 48,
    dpr: [1, 1.75],
    antialias: true,
    floorTextureSize: 1024,
    kiswaSheen: true,
  },
  medium: {
    walkers: 300,
    pigeons: 28,
    dpr: [1, 1.5],
    antialias: true,
    floorTextureSize: 512,
    kiswaSheen: false,
  },
  low: {
    walkers: 120,
    pigeons: 16,
    dpr: [1, 1],
    antialias: false,
    floorTextureSize: 512,
    kiswaSheen: false,
  },
};

/** Share of each figure type among the walkers (sums to 1). */
export const WALKER_MIX = {
  ihram: 0.55,
  abaya: 0.4,
  carrier: 0.05,
} as const;

export const TAWAF = {
  /** Walking speed range, metres per second (scene units are metres). */
  speed: [0.55, 1.15] as [number, number],
  /** Distance kept outside the Kaaba/Hijr clearance line, metres. */
  offset: [0.8, 22] as [number, number],
  /** >1 packs walkers closer to the Kaaba, as in the real mataf. */
  offsetBias: 1.8,
  /** Motion multiplier under prefers-reduced-motion: an almost still scene. */
  reducedMotionFactor: 0.04,
};

export const CAMERA = {
  fov: 32,
  /** Aimed above the Kaaba so it sits below the hero text. */
  target: [0, 9, 0] as [number, number, number],
  /** Distance from the target, metres. */
  distance: 78,
  /** Degrees above the horizon — an upper-floor view. */
  elevationDeg: 22,
  /** Bearing around the Kaaba; 0 faces the door wall (+Z). */
  azimuthDeg: 24,
  /** Gentle side-to-side drift of the idle orbit. */
  swayDeg: 7,
  swayPeriodSec: 48,
};

export const INTRO = {
  /** Whole welcome sequence stays under 4 s (SPEC §3.1). */
  lineMs: 950,
  fadeInMs: 450,
  fadeOutMs: 550,
};

export const TRANSITION = {
  dollyMs: 700,
  goldFadeMs: 500,
  /** Fade-out of the gold veil once the next page is on screen. */
  revealMs: 450,
};

export const INTRO_SEEN_KEY = "sakinah:intro-seen";
