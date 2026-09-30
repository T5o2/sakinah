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

/**
 * Dimensions follow documented (approximate) figures for the Kaaba; close-up
 * photos are used for shape and detail only, because camera perspective
 * distorts proportions. Where a photo and a documented figure disagree, the
 * documented figure wins. Source notes: docs/ARCHITECTURE.md (Phase 2).
 */
export const KAABA = {
  /** Door wall and its opposite (documented 11.68 m and 12.04 m: averaged). */
  sizeX: 11.9,
  /** Hijr wall and its opposite (documented 9.90 m and 10.18 m: averaged). */
  sizeZ: 10.0,
  /** Documented 13.1–15 m; 14 m is the commonly cited middle value. */
  height: 14,
  /** Parapet round the roof; the kiswa wraps over it (height and thickness). */
  rimHeight: 0.7,
  rimThickness: 0.55,
  /** White box on the roof with ventilation slots, in the Iraqi (+X, +Z) corner. */
  roofBox: { length: 2.6, depth: 1.0, height: 1.0 },
  /** Kiswa belt (hizam): documented at two thirds of the height, about 0.95 m wide. */
  beltY: (14 * 2) / 3,
  beltHeight: 0.95,
  /** How far the embroidered belt and door curtain stand off the wall. */
  reliefDepth: 0.05,
  /**
   * Shadharwan: sloped white marble at the foot of the walls (documented
   * 0.25–0.4 m). None on the Hijr side, and none under the door.
   */
  baseHeight: 0.4,
  baseOutset: 0.45,
  /** Hajj season: wall stones exposed up to here (taller than a person)… */
  stoneTop: 2.35,
  /** …then the white cloth (documented about 2–2.5 m wide) up to here. */
  whiteClothTop: 4.85,
  /**
   * The gold door: documented about 2.13 m above the floor, with the stone
   * wall running down to the floor beneath it. The Multazam — about 2 m of
   * wall between the Black Stone and the door — places its centre ~2.85 m
   * from the Black Stone corner.
   */
  door: {
    width: 1.65,
    height: 3.1,
    bottom: 2.2,
    fromBlackStoneCorner: 2.85,
    standOff: 0.12,
  },
  /**
   * Door curtain (sitara): black cloth embroidered in gold, about 4 m wide,
   * hung from the belt to just above the foot of the door, open at the hem in
   * an inverted V over its lower third.
   */
  sitara: {
    width: 4.0,
    hemAboveDoor: 0.2,
    standOff: 0.2,
    openingFraction: 1 / 3,
  },
  /** Column of embroidered drops by the Black Stone corner, on the door wall. */
  dropColumnX: 0.3,
  /** Black Stone: centre of the silver frame (documented 1.1–1.5 m). */
  blackStoneHeight: 1.4,
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
  /** Three lanterns on the wall: one at each end, one at the very top of the arc. */
  lampAnglesDeg: [-72, 0, 72],
  /** Low gold gates across the two openings next to the Kaaba. */
  gateHeight: 1.25,
} as const;

/** Maqam Ibrahim stands in front of the door wall (position kept as approved). */
export const MAQAM = {
  x: -2.65,
  z: 18.05,
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
