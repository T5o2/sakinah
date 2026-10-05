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
  /** Size of the square kiswa atlas (one quarter per wall). */
  kiswaAtlasWidth: number;
}

export const TIER_SETTINGS: Record<DeviceTier, TierSettings> = {
  high: {
    walkers: 400,
    pigeons: 48,
    dpr: [1, 1.75],
    antialias: true,
    floorTextureSize: 1024,
    kiswaAtlasWidth: 2048,
  },
  medium: {
    walkers: 220,
    pigeons: 28,
    dpr: [1, 1.5],
    antialias: true,
    floorTextureSize: 512,
    kiswaAtlasWidth: 1024,
  },
  low: {
    walkers: 120,
    pigeons: 16,
    dpr: [1, 1],
    antialias: false,
    floorTextureSize: 512,
    kiswaAtlasWidth: 1024,
  },
};

/** Share of each figure type among the walkers (sums to 1). */
export const WALKER_MIX = {
  ihram: 0.6,
  abaya: 0.32,
  carrier: 0.05,
  /** A woman in abaya carrying a small child in her arms. */
  mother: 0.03,
} as const;

export const TAWAF = {
  /** Walking speed range, metres per second (scene units are metres). */
  speed: [0.7, 1.05] as [number, number],
  /** Distance kept outside the Kaaba/Hijr clearance line, metres. */
  offset: [0.8, 22] as [number, number],
  /** >1 packs walkers closer to the Kaaba, as in the real mataf. */
  offsetBias: 2.3,
  /**
   * Bodies, per walker: height in metres (the figures are modelled at
   * `modelHeight`) and breadth as a scale on the figure's width and depth.
   * Most fall near the middle of each range (see createWalkers).
   */
  body: {
    menHeight: [1.58, 1.92] as [number, number],
    womenHeight: [1.48, 1.72] as [number, number],
    breadth: [0.85, 1.2] as [number, number],
    modelHeight: { man: 1.7, woman: 1.62 },
  },
  /**
   * Steps per metre walked: one step moves a foot from behind to in front,
   * 2 × leg length (0.85 m) × sin(leg swing), so planted feet do not slide.
   */
  stepsPerMetre: 1 / (2 * 0.85 * Math.sin(0.26)),
  /** How high the body rises over each step, metres. */
  bob: 0.015,
  /** Rings the crowd walks in, this far apart (people pass side by side). */
  laneSpacing: 0.9,
  /**
   * Least gap between two walkers in a lane, centre to centre, for two of
   * average breadth, metres; it grows and shrinks with their breadths.
   */
  minGap: 0.75,
  /** Each walker drifts this far forward and back along the lane, metres. */
  surge: 0.12,
  /** Share of the crowd walking in groups (couples, families, friends). */
  groups: { share: 0.38 },
  /** Lanes within this distance of the Maqam squeeze aside round it, metres. */
  maqamSqueeze: 7,
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

/** Drag-to-orbit (SPEC §3.3). A tap opens the transition; a drag only turns the view. */
export const ORBIT = {
  /** Degrees of orbit per CSS pixel dragged. */
  degPerPx: 0.22,
  /** Elevation limits for mouse drags; touch drags are horizontal only. */
  elevationMinDeg: 12,
  elevationMaxDeg: 40,
  /** Exponential smoothing rate (1/s) towards the dragged angle. */
  damping: 7,
  /** A press that moves less than this and ends quickly is a tap. */
  tapMaxMovePx: 6,
  tapMaxMs: 450,
  /** Idle time before the automatic sway returns, and how long it eases back in. */
  idleResumeMs: 4000,
  swayBlendSec: 2.5,
};

/**
 * The frame-rate monitor that steps the device tier down only starts this
 * long after the scene mounts: the first seconds hold one-off shader
 * compiles and texture uploads, which would otherwise read as a slow device
 * and drop even a fast desktop to the lowest tier for good.
 */
export const PERFORMANCE_WARMUP_MS = 3000;

/** Performance budget for the whole scene (checked by tests and at runtime). */
export const BUDGET = {
  drawCalls: 30,
  triangles: 150_000,
  /** Static landmarks (Kaaba, Hijr, Maqam) — merged by material. */
  landmarkDrawCalls: 10,
  landmarkTriangles: 30_000,
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
