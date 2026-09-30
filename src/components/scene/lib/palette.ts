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
  granite: "#1d1c1c",
  blackStone: "#1b1716",
  bronze: "#5b4a2c",
  lanternGlass: "#1e5c3b",
  lanternGlow: "#3fae6c",
  maqamGlass: "#e8dcc0",
  lampWarm: "#ffd9a0",
  keyLight: "#ffe8c8",
  arcadeGlow: "#1b140c",
  skyNight: "#20232e",
  groundBounce: "#2b241b",
} as const;
