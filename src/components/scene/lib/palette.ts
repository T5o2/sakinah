/**
 * Scene colours. Hex values mirror the design tokens in globals.css (SPEC §2);
 * three.js cannot read CSS variables, so they are repeated here once.
 */
export const PALETTE = {
  ink: "#0a0a0a",
  kiswa: "#08080a",
  kiswaSheen: "#34343a",
  gold: "#c9a45c",
  goldSoft: "#e6cf9a",
  goldDeep: "#6f5423",
  marble: "#f5f2ea",
  marbleShade: "#d9d3c6",
  stone: "#0e0d0b",
  silver: "#c9c6c0",
  marbleCap: "#fbf9f4",
  roof: "#c8cbcf",
  roofBox: "#e4e6e8",
  granite: "#1d1c1c",
  /** Black with a red cast. */
  blackStone: "#2a1614",
  /** The Black Stone's polished silver frame, brighter than plain silver. */
  blackStoneFrame: "#e6e5e1",
  bronze: "#5b4a2c",
  lanternGlass: "#0f3d27",
  lanternGlow: "#2f8a57",
  maqamGlass: "#e8dcc0",
  maqamStone: "#b8b0a2",
  footprint: "#4a3a2c",
  /** Guards' blue-grey camouflage: base, dark blotches, pale blotches. */
  guardCamo: "#7d8896",
  guardCamoDark: "#454c57",
  guardCamoLight: "#adb6c1",
  guardBoot: "#16171a",
  guardSkin: "#9a7258",
  guardHair: "#1a1512",
  beretRed: "#a3232a",
  beretBlack: "#141519",
  /** The black cloth strap the Black Stone guard holds. */
  guardStrap: "#111113",
  /** Pilgrims: white ihram, black abaya, and a plain neutral grey-beige for a child, set apart from the ihram. */
  ihram: "#ece9e1",
  abaya: "#121214",
  childCloth: "#b9b2a4",
  lampWarm: "#ffd9a0",
  keyLight: "#ffe8c8",
  arcadeGlow: "#1b140c",
  skyNight: "#20232e",
  groundBounce: "#2b241b",
} as const;
