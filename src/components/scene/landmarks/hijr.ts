import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  PlaneGeometry,
  Shape,
  SphereGeometry,
} from "three";
import { HALF_X, HALF_Z, HIJR } from "../lib/layout";
import { PALETTE } from "../lib/palette";
import { part, place, type Part } from "../lib/parts";

const SEGMENTS = 48;
const DEG = Math.PI / 180;
const CAP_HEIGHT = 0.1;
/** Extra pedestal height under each Hijr lantern. */
const LIFT = 0.3;
const WALL_TOP = HIJR.height + CAP_HEIGHT;
/** Decorative inlay band on the outer face, below the capstone. */
const BAND = { bottom: 0.82, top: 1.2, tileMetres: 0.76 };

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
  for (let i = 1; i <= SEGMENTS; i++) {
    shape.lineTo(...at(-half + (2 * half * i) / SEGMENTS, t));
  }
  for (let i = SEGMENTS; i >= 0; i--) {
    shape.lineTo(...at(-half + (2 * half * i) / SEGMENTS, -t));
  }
  shape.closePath();

  const geometry = new ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
  });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

/** Positions of the three lanterns on top of the wall, (x, z). */
export function hijrLampPositions(): [number, number][] {
  return HIJR.lampAnglesDeg.map((deg) => hijrPoint(deg * DEG));
}

/**
 * The strip of the wall's outer face that carries the inlay band, with UVs
 * running along the arc (u in tiles, v up), so a small tile repeats evenly.
 */
export function createHijrBandGeometry(): BufferGeometry {
  const half = HIJR.arcHalfAngleDeg * DEG;
  const grow = HIJR.thickness / 2 + 0.006;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let u = 0;
  let prev: [number, number] | null = null;
  for (let i = 0; i <= SEGMENTS; i++) {
    const phi = -half + (2 * half * i) / SEGMENTS;
    const [x, z] = hijrPoint(phi, grow);
    if (prev) u += Math.hypot(x - prev[0], z - prev[1]) / BAND.tileMetres;
    prev = [x, z];
    // Outward normal of the ellipse (x, z) = (a·cosφ, −b·sinφ).
    const a = HIJR.radiusX + grow;
    const b = HIJR.radiusZ + grow;
    const nl = Math.hypot(b * Math.cos(phi), a * Math.sin(phi));
    const n = [(b * Math.cos(phi)) / nl, 0, (-a * Math.sin(phi)) / nl];
    positions.push(x, BAND.bottom, z, x, BAND.top, z);
    normals.push(...n, ...n);
    uvs.push(u, 0, u, 1);
    if (i > 0) {
      const k = i * 2;
      // (prev bottom, this bottom, this top, prev top): counterclockwise from outside.
      indices.push(k - 2, k, k + 1, k - 2, k + 1, k - 1);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3),
  );
  g.setAttribute("normal", new BufferAttribute(new Float32Array(normals), 3));
  g.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
  g.setIndex(indices);
  return g;
}

/** Depth of the gate posts across the opening (along z). */
const GATE_POST_DEPTH = 0.12;

/**
 * How far along the Kaaba's Hijr wall, from each corner, the middle of the
 * nearer gate stands. The shadharwan running round the corner ends there,
 * inside the gate, so its cut end never shows on the corner side.
 */
export function hijrGateFromCorner(): number {
  const [, z] = hijrPoint(HIJR.arcHalfAngleDeg * DEG);
  return HALF_Z - Math.abs(z);
}

/** The two openings, each from the Kaaba's marble base to the end of the wall. */
function openings() {
  const end = HIJR.arcHalfAngleDeg * DEG;
  return [end, -end].map((phi) => {
    const [ex, ez] = hijrPoint(phi);
    // No shadharwan on the Hijr side: the gates meet the wall itself.
    const kx = HALF_X + 0.05;
    return { x0: kx, x1: ex, z: ez };
  });
}

/** Latticed gold gates across the openings (their own alpha-tested material). */
export function createHijrGateGeometry(): BufferGeometry {
  const parts = openings().map(({ x0, x1, z }) =>
    place(new PlaneGeometry(x1 - x0, HIJR.gateHeight), {
      position: [(x0 + x1) / 2, HIJR.gateHeight / 2, z],
    }),
  );
  const [first, second] = parts as [BufferGeometry, BufferGeometry];
  // Two quads: concatenate by hand (same attributes, indexed).
  const count = first.getAttribute("position").count;
  const merged = new BufferGeometry();
  for (const name of ["position", "normal", "uv"] as const) {
    const a = first.getAttribute(name).array as Float32Array;
    const b = second.getAttribute(name).array as Float32Array;
    const out = new Float32Array(a.length + b.length);
    out.set(a);
    out.set(b, a.length);
    merged.setAttribute(name, new BufferAttribute(out, name === "uv" ? 2 : 3));
  }
  const ia = Array.from(first.getIndex()?.array ?? []);
  const ib = Array.from(second.getIndex()?.array ?? []).map((i) => i + count);
  merged.setIndex([...ia, ...ib]);
  first.dispose();
  second.dispose();
  return merged;
}

/** A large lantern: short sturdy gold base, gold frame round dark green glass, gold crown. */
function lanternParts(x: number, z: number): { metal: Part[]; glass: Part[] } {
  const y = WALL_TOP;
  const at = (dy: number): [number, number, number] => [x, y + dy, z];
  const bars: Part[] = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    bars.push(
      part(new BoxGeometry(0.035, 0.64, 0.035), PALETTE.gold, {
        position: [
          x + 0.245 * Math.sin(a),
          y + 0.86 + LIFT,
          z + 0.245 * Math.cos(a),
        ],
        rotation: [0, a, 0],
      }),
    );
  }
  return {
    metal: [
      // Base: a stepped, sturdy pedestal about 0.7 of the lantern's height.
      part(new CylinderGeometry(0.3, 0.34, 0.1, 8), PALETTE.gold, {
        position: at(0.05),
      }),
      part(new CylinderGeometry(0.2, 0.26, 0.2, 8), PALETTE.gold, {
        position: at(0.2),
      }),
      part(new CylinderGeometry(0.16, 0.2, LIFT + 0.02, 8), PALETTE.gold, {
        position: at(0.3 + LIFT / 2),
      }),
      part(new CylinderGeometry(0.28, 0.2, 0.16, 8), PALETTE.gold, {
        position: at(0.38 + LIFT),
      }),
      part(new CylinderGeometry(0.29, 0.29, 0.06, 8), PALETTE.gold, {
        position: at(0.5 + LIFT),
      }),
      ...bars,
      part(new CylinderGeometry(0.3, 0.3, 0.07, 8), PALETTE.gold, {
        position: at(1.2 + LIFT),
      }),
      // Crown: a gold dome with a spire and finial.
      part(
        new SphereGeometry(0.27, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
        PALETTE.gold,
        {
          position: at(1.23 + LIFT),
          scale: [1, 0.9, 1],
        },
      ),
      part(new CylinderGeometry(0.035, 0.05, 0.22, 6), PALETTE.gold, {
        position: at(1.58 + LIFT),
      }),
      part(new SphereGeometry(0.06, 8, 6), PALETTE.goldSoft, {
        position: at(1.72 + LIFT),
      }),
      part(new ConeGeometry(0.04, 0.14, 6), PALETTE.goldSoft, {
        position: at(1.83 + LIFT),
      }),
    ],
    glass: [
      part(new CylinderGeometry(0.235, 0.235, 0.66, 8), PALETTE.lanternGlass, {
        position: at(0.86 + LIFT),
      }),
    ],
  };
}

/**
 * Hijr Ismail: a white marble wall with a slightly wider capstone, three large
 * gold lanterns with dark green glass (one at each end, one at the top of the arc), and
 * gold gate posts and rails at the two openings.
 */
export function hijrParts(): {
  matte: Part[];
  metal: Part[];
  lanternGlass: Part[];
} {
  const matte = [
    part(arcBand(HIJR.thickness, HIJR.height), PALETTE.marble),
    part(arcBand(HIJR.thickness + 0.18, CAP_HEIGHT), PALETTE.marbleCap, {
      position: [0, HIJR.height, 0],
    }),
  ];

  const metal: Part[] = [];
  const lanternGlass: Part[] = [];
  for (const [x, z] of hijrLampPositions()) {
    const l = lanternParts(x, z);
    metal.push(...l.metal);
    lanternGlass.push(...l.glass);
  }

  const h = HIJR.gateHeight;
  for (const { x0, x1, z } of openings()) {
    const mid = (x0 + x1) / 2;
    metal.push(
      part(new BoxGeometry(0.1, h + 0.12, GATE_POST_DEPTH), PALETTE.gold, {
        position: [x0 + 0.05, (h + 0.12) / 2, z],
      }),
      part(new BoxGeometry(0.1, h + 0.12, GATE_POST_DEPTH), PALETTE.gold, {
        position: [x1 - 0.05, (h + 0.12) / 2, z],
      }),
      part(new BoxGeometry(0.08, h, 0.1), PALETTE.gold, {
        position: [mid, h / 2, z],
      }),
      part(new BoxGeometry(x1 - x0, 0.07, 0.12), PALETTE.gold, {
        position: [mid, h + 0.02, z],
      }),
      part(new BoxGeometry(x1 - x0, 0.06, 0.1), PALETTE.gold, {
        position: [mid, 0.05, z],
      }),
      part(new SphereGeometry(0.06, 8, 6), PALETTE.goldSoft, {
        position: [x0 + 0.05, h + 0.18, z],
      }),
      part(new SphereGeometry(0.06, 8, 6), PALETTE.goldSoft, {
        position: [x1 - 0.05, h + 0.18, z],
      }),
    );
  }

  return { matte, metal, lanternGlass };
}
