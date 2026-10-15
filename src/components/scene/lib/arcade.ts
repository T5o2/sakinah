import { MATAF } from "./layout";

/** The colonnades ringing the mataf: two tiers of columns, the same angles in each. */
export const ARCADE = {
  columnsPerTier: 96,
  tiers: [
    { base: 0, height: 7.5 },
    { base: 9, height: 6.5 },
  ],
} as const;

/** Angle of column `c` round the ring, at (r·cos a, r·sin a) on the floor. */
export function columnAngle(c: number): number {
  return (c / ARCADE.columnsPerTier) * Math.PI * 2;
}

/**
 * Whether a camera standing outside the ring at (x, z) sees column `c` from
 * inside the ring, that is behind the mataf rather than in front of it. The
 * cornices and the lamplight draw only their inner faces, so they drop out
 * in front of the camera by the same rule; the columns follow them, so none
 * stands between the viewer and the Kaaba.
 */
export function columnBehindMataf(c: number, x: number, z: number): boolean {
  const a = columnAngle(c);
  return MATAF.arcadeRadius - (x * Math.cos(a) + z * Math.sin(a)) > 0;
}
