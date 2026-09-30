import { describe, expect, it } from "vitest";
import {
  HALF_X,
  HALF_Z,
  HIJR,
  KAABA,
} from "../src/components/scene/lib/layout";
import {
  clearanceRadius,
  createWalkers,
  tawafHeading,
  tawafPosition,
  walkerPosition,
} from "../src/components/scene/lib/tawaf";

/**
 * y-component of r × v for a point moving from p0 to p1 on the floor (Y up).
 * Positive means the motion is counterclockwise when seen from above.
 */
function angularMomentumY(
  p0: { x: number; z: number },
  p1: { x: number; z: number },
) {
  const vx = p1.x - p0.x;
  const vz = p1.z - p0.z;
  return p0.z * vx - p0.x * vz;
}

describe("tawaf direction", () => {
  it("increasing θ moves counterclockwise seen from above", () => {
    for (let i = 0; i < 36; i++) {
      const theta = (i / 36) * Math.PI * 2;
      const p0 = tawafPosition(12, theta);
      const p1 = tawafPosition(12, theta + 0.01);
      expect(angularMomentumY(p0, p1)).toBeGreaterThan(0);
    }
  });

  it("every walker circles counterclockwise at every moment", () => {
    const walkers = createWalkers(300);
    for (const walker of walkers) {
      expect(walker.omega).toBeGreaterThan(0);
      for (const t of [0, 7.5, 31, 120]) {
        const p0 = walkerPosition(walker, t);
        const p1 = walkerPosition(walker, t + 0.05);
        expect(angularMomentumY(p0, p1)).toBeGreaterThan(0);
      }
    }
  });

  it("passes Black Stone → door wall → Hijr → Yemeni corner in that order", () => {
    // Corner bearings in the local frame (see layout.ts).
    const angleOf = (x: number, z: number) => {
      const a = Math.atan2(-z, x);
      return a < 0 ? a + Math.PI * 2 : a;
    };
    const start = angleOf(-HALF_X, HALF_Z);
    const order = [
      angleOf(-HALF_X, HALF_Z), // Black Stone (east)
      angleOf(0, HALF_Z), // door wall (north-east)
      angleOf(HALF_X, HALF_Z), // Iraqi corner (north)
      angleOf(HALF_X, 0), // Hijr Ismail (north-west)
      angleOf(HALF_X, -HALF_Z), // Shami corner (west)
      angleOf(-HALF_X, -HALF_Z), // Yemeni corner (south)
    ].map((a) => (a - start + Math.PI * 2) % (Math.PI * 2));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("faces each walker along its direction of travel", () => {
    for (const theta of [0, 1, 2.5, 4]) {
      const h = tawafHeading(theta);
      // A figure modelled facing +Z, rotated by h about +Y, faces (sin h, cos h).
      const facing = { x: Math.sin(h), z: Math.cos(h) };
      const p0 = tawafPosition(10, theta);
      const p1 = tawafPosition(10, theta + 0.001);
      const travel = { x: p1.x - p0.x, z: p1.z - p0.z };
      expect(facing.x * travel.x + facing.z * travel.z).toBeGreaterThan(0);
    }
  });
});

describe("tawaf clearance", () => {
  const bodyRadius = 0.35;

  it("keeps walkers off the Kaaba and its marble base", () => {
    const corner = Math.hypot(
      HALF_X + KAABA.baseOutset,
      HALF_Z + KAABA.baseOutset,
    );
    for (let i = 0; i < 360; i++) {
      expect(clearanceRadius((i * Math.PI) / 180)).toBeGreaterThan(
        corner + bodyRadius,
      );
    }
  });

  it("keeps walkers outside the Hijr Ismail wall", () => {
    const half = (HIJR.arcHalfAngleDeg * Math.PI) / 180;
    const outer = {
      x: HIJR.radiusX + HIJR.thickness / 2,
      z: HIJR.radiusZ + HIJR.thickness / 2,
    };
    for (let i = 0; i <= 200; i++) {
      const phi = -half + (2 * half * i) / 200;
      const x = HIJR.centerX + outer.x * Math.cos(phi);
      const z = outer.z * Math.sin(phi);
      const theta = Math.atan2(-z, x);
      expect(clearanceRadius(theta)).toBeGreaterThan(
        Math.hypot(x, z) + bodyRadius,
      );
    }
  });
});

describe("walkers", () => {
  it("are deterministic for a given seed", () => {
    expect(createWalkers(50, 7)).toEqual(createWalkers(50, 7));
  });

  it("include every figure type in a large crowd", () => {
    const kinds = new Set(createWalkers(900).map((w) => w.kind));
    expect(kinds).toEqual(new Set(["ihram", "abaya", "carrier"]));
  });
});
