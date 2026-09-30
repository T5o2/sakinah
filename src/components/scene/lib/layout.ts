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
 * Proportions measured in pixels from reference photos of the Kaaba in the
 * Hajj season (ratios within one wall, so perspective cancels out):
 * rim 6% · black 29% · belt 6% · black 26% · white cloth 13% · stones and
 * base 20% of the height. The door is half the curtain's width.
 * See docs/ARCHITECTURE.md for the measurement table.
 */
export const KAABA = {
  /** Door wall and the wall opposite it. */
  sizeX: 11.7,
  /** Hijr wall and the wall opposite it. */
  sizeZ: 10.1,
  height: 14,
  /** Low white parapet round the roof, above the kiswa (height and thickness). */
  rimHeight: 0.7,
  rimThickness: 0.55,
  /** Small raised square on the roof, in the Iraqi (+X, +Z) corner. */
  roofHatch: { sizeX: 1.8, sizeZ: 2.9, height: 0.35 },
  /** Kiswa belt (hizam) — centre height and band height. */
  beltY: 8.65,
  beltHeight: 0.9,
  /** How far the embroidered belt and door curtain stand off the wall. */
  reliefDepth: 0.05,
  /** Marble base (shadharwan) running around the foot of the walls, sloped. */
  baseHeight: 0.35,
  baseOutset: 0.35,
  /** Hajj season: the kiswa is raised, exposing the wall stones up to here… */
  stoneTop: 2.6,
  /** …and the band above them is wrapped in white cloth up to here. */
  whiteClothTop: 4.5,
  /** The gold door: raised above the ground, with wall stones below it. */
  door: {
    width: 1.65,
    height: 3.1,
    bottom: 2.2,
    fromBlackStoneCorner: 3.2,
    standOff: 0.12,
  },
  /**
   * Door curtain (sitara): black cloth embroidered in gold, hung over the door
   * from the belt, open at the bottom in an inverted V that shows the door.
   */
  sitara: { width: 3.3, bottom: 2.6, standOff: 0.2 },
  /** Column of embroidered lanterns close to the Black Stone corner. */
  lanternColumnX: 0.45,
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
  /** Three lanterns on the wall: one at each end, one at the very top of the arc. */
  lampAnglesDeg: [-72, 0, 72],
  /** Low gold gates across the two openings next to the Kaaba. */
  gateHeight: 1.25,
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
