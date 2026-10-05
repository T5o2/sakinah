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
  /**
   * Door wall (Multazam side, documented 12.84 m) and its opposite (12.11 m),
   * averaged. Their sum with the other two sides, 47.75 m, matches the
   * documented 47 m length of the kiswa belt.
   */
  sizeX: 12.48,
  /** Hijr wall (documented 11.28 m) and its opposite (11.52 m), averaged. */
  sizeZ: 11.4,
  /** Documented 13.1–15 m; 14 m is the commonly cited middle value. */
  height: 14,
  /** Parapet round the roof; the kiswa wraps over it (height and thickness). */
  rimHeight: 0.7,
  rimThickness: 0.55,
  /** Flat hatch in the roof floor, in the Iraqi (+X, +Z) corner, barely raised. */
  roofHatch: { length: 2.6, depth: 1.6, height: 0.45 },
  /** Kiswa belt (hizam): documented at two thirds of the height, about 0.95 m wide. */
  beltY: (14 * 2) / 3,
  beltHeight: 0.95,
  /**
   * One line under the belt (photo 50): the tops of the corner shields, the
   * panels, the drops and the door curtain all sit this far below it.
   */
  belowBeltGap: 0.3,
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
   * The gold door, with the stone wall running down to the floor beneath it.
   * Size and height documented (Arabic Wikipedia: 1.71 × 3.18 m, 2.22 m
   * above the floor). Centred in the curtain, where the front-on photo 51
   * puts it: 0.262 of the wall from the Black Stone corner. That leaves
   * 2.40 m of wall before the door, more than the "about 2 m" usually given
   * for the Multazam; the photo is followed.
   */
  door: {
    width: 1.71,
    height: 3.18,
    bottom: 2.22,
    fromBlackStoneCorner: 3.26,
    /** Flush with the wall, just behind the curtain. */
    standOff: 0.01,
  },
  /**
   * Door curtain (sitara): black cloth embroidered in gold, hung from the
   * line under the belt to just above the foot of the door, open at the hem
   * in an inverted V reaching just under half its height.
   *
   * 3.47 m wide: 0.278 of the wall on the front-on photo 51, in line with
   * the 3.5 m given on Wikipedia "Kiswah". Its left edge is 0.122 of the
   * wall from the Black Stone corner (1.52 m).
   */
  sitara: {
    width: 3.47,
    /**
     * From the line under the belt down to 0.3 m above the foot of the door:
     * 6.04 m tall (photo 51 reads a little taller, 6.40 m, which would not
     * clear the foot of the door under that line).
     */
    hemAboveDoor: 0.3,
    /** Hangs flat on the wall like the rest of the kiswa. */
    standOff: 0.03,
    /** Apex of the opening, as a fraction of the curtain's height from the hem
     * (measured on a reference photo: 43%). */
    openingFraction: 0.43,
  },
  /**
   * Mizab, the gold waterspout over Hijr Ismail. Documented: about 2.53–2.58 m
   * long, 26 cm wide, its sides 23 cm high. Sources disagree on the 58 cm:
   * inside the roof wall (leaving 1.95 m outside) or outside it. Photo 72
   * settles it: the outer part shows 5.5 × the side height, so at least
   * 1.26 m even seen square-on — 0.58 m outside is ruled out; 1.95 m is what
   * a 40° view gives, and the 58 cm inside matches the parapet's thickness.
   * Base ornament and spout measured on photo 72 against the side height
   * (51 px = 0.23 m), widths corrected for that 40° view: ornament 4.4 × as
   * wide and 3.04 × as tall, spout 0.87 × as wide and 2.74 × as long. Photo
   * 70, face-on, agrees (ornament 4.9 × the spout's width).
   */
  mizab: {
    length: 2.53,
    width: 0.26,
    side: 0.23,
    outside: 1.95,
    /** Bottom of the channel, above the mataf floor. */
    bottom: 13.51,
    crest: { width: 0.23 * 4.4, height: 0.23 * 3.04 },
    spout: { width: 0.23 * 0.87, length: 0.23 * 2.74 },
  },
  /**
   * Black Stone: centre of the stone and of the frame's opening. Written
   * sources give 1.5 m, some 1.10 m; photo 75, measured against the marble
   * block and the shadharwan beside it, wins (see blackStoneFrame): the
   * frame's foot 0.30 m above the shadharwan's top, the block's top at 0.57
   * of the frame's height — centre at 1.185 m.
   */
  blackStoneHeight: 1.185,
  /**
   * The rounded mass of dark stone the frame is set into, bulging out of the
   * east corner (radius, how far its axis sits inside the corner, height span).
   */
  /**
   * The silver frame wraps the corner edge itself: its back follows a
   * rounded fillet tangent to both walls, and it stands a little proud of
   * the edge, facing out along the corner's diagonal.
   */
  blackStoneFrame: {
    /**
     * Shape from photo 74 (0.70 × 0.83 m against the 0.27 m opening), size
     * from photo 75: the frame is 1.13 × the marble block's height above the
     * shadharwan rings, i.e. 0.97 m tall. Frame, opening and stone are
     * scaled together by 0.97 / 0.83, so the opening reads 0.32 m — more
     * than the 0.27 m written figure; photo 75 was followed.
     */
    halfWidth: 0.35 * (0.97 / 0.83),
    halfHeight: 0.97 / 2,
    /** Radius of the opening the stone shows through. */
    opening: 0.135 * (0.97 / 0.83),
    /** Radius of the stone itself. */
    stone: 0.15 * (0.97 / 0.83),
    proud: 0.1,
    edgeThickness: 0.08,
  },
  /**
   * Upright white marble block beside the Black Stone: it rises out of the
   * shadharwan, one piece with it, and is as deep as the shadharwan's foot.
   */
  marbleBlock: { from: 0.5, width: 0.5, depth: 0.45, height: 1.15, cap: 0.1 },
  /**
   * Dark granite base round the whole Kaaba, as wide as the shadharwan's
   * outset: a thin slab under the shadharwan (it shows only as a fine dark
   * line beneath its edge), and flush with the floor where there is none.
   */
  blackStrip: { slab: 0.02, flush: 0.001 },
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

/**
 * Maqam Ibrahim stands in front of the door wall. Its approved place is kept
 * relative to the Kaaba: 3.30 m along the door wall from the Black Stone
 * corner, 13.05 m out from the wall.
 */
export const MAQAM = {
  x: -HALF_X + 3.3,
  z: HALF_Z + 13.05,
} as const;

/**
 * Tawaf clearance line: walkers stay outside this radius. It hugs the Kaaba
 * corners and bulges around Hijr Ismail (centred on θ = 0, the +X axis).
 */
export const CLEARANCE = {
  /** Clear of the corners' shadharwan by the same margin as before (≈ 0.6 m). */
  base: 9.7,
  hijrBulge: 7.5,
  hijrHalfSectorDeg: 50,
} as const;

/**
 * Four guards standing still round the Kaaba (photos 77–86): red berets at
 * the Black Stone and Yemeni corners, black berets at the two Hijr gates.
 * Feet positions on the floor (x, z); `yawDeg` turns a figure modelled
 * facing +Z (0 = facing the door wall's outward side, +Z).
 */
export const GUARDS = {
  /** Head top about 1.72 m; the beret adds a few centimetres. */
  height: 1.75,
  /**
   * White marble step behind the marble block, on its door side, against
   * the wall (photo 79): a separate piece, the block itself untouched. Its
   * top sits at about half the block's height, where the guard's feet are.
   */
  step: {
    /** Starts where the marble block ends along the door wall. */
    from: KAABA.marbleBlock.from + KAABA.marbleBlock.width,
    width: 0.7,
    depth: 0.55,
    height: 0.6,
    cap: 0.04,
  },
  /**
   * Black Stone guard (photos 78, 79, 83): on the step, leaning a little
   * towards the stone, his right arm out to the side at shoulder height, the
   * palm flat on the dark wall stones just beside the silver frame's upper
   * end, above the marble block.
   */
  blackStone: {
    along: KAABA.marbleBlock.from + KAABA.marbleBlock.width + 0.25,
    out: 0.27,
    yawDeg: -30,
    leanDeg: 6,
    /** Palm on the door wall: metres from the Black Stone corner, height. */
    hand: { along: 0.49, y: 1.95 },
  },
  /**
   * Yemeni corner (photo 86): on the floor just outside the shadharwan on
   * the south-east side (towards the Black Stone), a step from the corner,
   * facing out and a little towards the corner.
   */
  yemeni: { along: 0.8, out: KAABA.baseOutset + 0.32, yawDeg: -105 },
  /**
   * Hijr gates (photos 81, 84, 85): on the mataf side of each gate, beside
   * its outer post, in front of the end of the Hijr wall under the lantern.
   */
  hijrGate: { x: 8.12, out: 0.85 },
} as const;

export const MATAF = {
  radius: 64,
  arcadeRadius: 58,
} as const;
