import {
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Shape,
  SphereGeometry,
} from "three";
import { HIJR } from "../lib/layout";
import { PALETTE } from "../lib/palette";
import { part, type Part } from "../lib/parts";

const SEGMENTS = 40;
const DEG = Math.PI / 180;
const CAP_HEIGHT = 0.1;

/** Point on the Hijr ellipse at angle φ, pushed out by `grow` metres. Returns (x, z). */
export function hijrPoint(phi: number, grow = 0): [number, number] {
  return [
    HIJR.centerX + (HIJR.radiusX + grow) * Math.cos(phi),
    -(HIJR.radiusZ + grow) * Math.sin(phi),
  ];
}

/** An elliptical wall band of the given thickness and height, standing on y = 0. */
function arcBand(thickness: number, height: number) {
  const half = HIJR.arcHalfAngleDeg * DEG;
  const t = thickness / 2;
  // Shape plane (x, y) is rotated onto the floor as (x, -z), so pass (x, -z).
  const at = (phi: number, grow: number): [number, number] => {
    const [x, z] = hijrPoint(phi, grow);
    return [x, -z];
  };
  const shape = new Shape();
  shape.moveTo(...at(-half, t));
  for (let i = 1; i <= SEGMENTS; i++)
    shape.lineTo(...at(-half + (2 * half * i) / SEGMENTS, t));
  for (let i = SEGMENTS; i >= 0; i--)
    shape.lineTo(...at(-half + (2 * half * i) / SEGMENTS, -t));
  shape.closePath();

  const geometry = new ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
  });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

/** Positions of the three lamp posts on top of the wall, (x, z). */
export function hijrLampPositions(): [number, number][] {
  return HIJR.lampAnglesDeg.map((deg) => hijrPoint(deg * DEG));
}

/**
 * Hijr Ismail: a white marble wall with a slightly wider capstone, and three
 * gold lamp posts, each carrying a lantern of green glass.
 */
export function hijrParts(): {
  matte: Part[];
  metal: Part[];
  lanternGlass: Part[];
} {
  const wallTop = HIJR.height + CAP_HEIGHT;
  const matte = [
    part(arcBand(HIJR.thickness, HIJR.height), PALETTE.marble),
    part(arcBand(HIJR.thickness + 0.18, CAP_HEIGHT), PALETTE.marbleCap, {
      position: [0, HIJR.height, 0],
    }),
  ];

  const metal: Part[] = [];
  const lanternGlass: Part[] = [];
  for (const [x, z] of hijrLampPositions()) {
    const y = wallTop;
    metal.push(
      part(new CylinderGeometry(0.16, 0.2, 0.18, 8), PALETTE.gold, {
        position: [x, y + 0.09, z],
      }),
      part(new CylinderGeometry(0.055, 0.07, 1.5, 8), PALETTE.gold, {
        position: [x, y + 0.93, z],
      }),
      // Lantern: gold cup, green glass body, gold crown and finial.
      part(new ConeGeometry(0.2, 0.2, 8), PALETTE.gold, {
        position: [x, y + 1.78, z],
        rotation: [Math.PI, 0, 0],
      }),
      part(new CylinderGeometry(0.21, 0.21, 0.05, 8), PALETTE.gold, {
        position: [x, y + 1.9, z],
      }),
      part(new CylinderGeometry(0.21, 0.21, 0.05, 8), PALETTE.gold, {
        position: [x, y + 2.4, z],
      }),
      part(new ConeGeometry(0.22, 0.28, 8), PALETTE.gold, {
        position: [x, y + 2.56, z],
      }),
      part(new SphereGeometry(0.05, 8, 6), PALETTE.goldSoft, {
        position: [x, y + 2.75, z],
      }),
    );
    lanternGlass.push(
      part(new CylinderGeometry(0.19, 0.17, 0.46, 8), PALETTE.lanternGlass, {
        position: [x, y + 2.15, z],
      }),
    );
  }

  return { matte, metal, lanternGlass };
}
