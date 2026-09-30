/**
 * Physical layout of the Kaaba and its surroundings, in metres.
 *
 * Local frame (Y up, origin at the Kaaba's centre on the mataf floor):
 * - +Z  north-east wall — the door wall
 * - +X  north-west wall — faces Hijr Ismail
 * - corners: Black Stone (east) at (-X,+Z) · Iraqi (north) at (+X,+Z)
 *            Shami (west) at (+X,-Z) · Yemeni (south) at (-X,-Z)
 * Walking Black Stone → door → Hijr → Yemeni is counterclockwise seen from
 * above, the direction of tawaf (see tawaf.ts).
 */

export const KAABA = {
  /** Door wall and the wall opposite it. */
  sizeX: 11.9,
  /** Hijr wall and the wall opposite it. */
  sizeZ: 10.1,
  height: 13.1,
  /** Kiswa belt (hizam) — centre height and band height. */
  beltY: 9.1,
  beltHeight: 0.95,
  /** Marble base (shadharwan) running around the foot of the walls. */
  baseHeight: 0.3,
  baseOutset: 0.35,
  door: { width: 1.9, height: 3.1, bottom: 2.2, fromBlackStoneCorner: 2.9 },
  blackStoneHeight: 1.5,
} as const;

export const HALF_X = KAABA.sizeX / 2;
export const HALF_Z = KAABA.sizeZ / 2;

/** Hijr Ismail: a low elliptical wall off the +X face. */
export const HIJR = {
  /** Ellipse centred on the middle of the +X wall. */
  centerX: HALF_X,
  /** Reach out from the wall (x) and half-width along it (z). */
  radiusX: 8.4,
  radiusZ: 4.9,
  /** Arc ends leave an opening next to each corner. */
  arcHalfAngleDeg: 76,
  thickness: 1.5,
  height: 1.3,
} as const;

/** Maqam Ibrahim stands in front of the door wall. */
export const MAQAM = {
  x: -HALF_X + KAABA.door.fromBlackStoneCorner,
  z: HALF_Z + 13,
} as const;

/**
 * Tawaf clearance line: walkers stay outside this radius. It hugs the Kaaba
 * corners and bulges around Hijr Ismail (centred on θ = 0, the +X axis).
 */
export const CLEARANCE = {
  base: 9.0,
  hijrBulge: 7.5,
  hijrHalfSectorDeg: 50,
} as const;

export const MATAF = {
  radius: 64,
  arcadeRadius: 58,
} as const;
