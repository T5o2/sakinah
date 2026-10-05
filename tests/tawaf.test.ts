import { describe, expect, it } from "vitest";
import { BUDGET, TAWAF, TIER_SETTINGS } from "../src/lib/config/scene";
import { guardPlacements } from "../src/components/scene/figures/guards";
import { createWalkerGeometry } from "../src/components/scene/figures/walkers";
import {
  CLEARANCE,
  HALF_X,
  HALF_Z,
  HIJR,
  KAABA,
  MAQAM,
} from "../src/components/scene/lib/layout";
import { triangleCount } from "../src/components/scene/lib/parts";
import {
  clearanceRadius,
  createWalkers,
  tawafHeading,
  tawafPosition,
  walkerHeading,
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

describe("tawaf crowd (Phase 2)", () => {
  const walkers = createWalkers(TIER_SETTINGS.high.walkers);
  const times = Array.from({ length: 240 }, (_, i) => i * 1.5);

  it("mixes 60% men in ihram, 35% women in abaya, 5% carrying a child", () => {
    const count = (k: string) => walkers.filter((w) => w.kind === k).length;
    const n = walkers.length;
    expect(count("ihram")).toBe(n - Math.round(n * 0.35) - Math.round(n * 0.05));
    expect(count("abaya")).toBe(Math.round(n * 0.35));
    expect(count("carrier")).toBe(Math.round(n * 0.05));
  });

  it("is a calm, medium crowd, lighter on weaker devices", () => {
    expect(TIER_SETTINGS.high.walkers).toBeGreaterThanOrEqual(200);
    expect(TIER_SETTINGS.high.walkers).toBeLessThanOrEqual(300);
    expect(TIER_SETTINGS.low.walkers).toBeLessThan(TIER_SETTINGS.high.walkers / 2);
  });

  it("is densest near the Kaaba, thinning outwards", () => {
    const [lo, hi] = TAWAF.offset;
    const band = (hi - lo) / 3;
    const inner = walkers.filter((w) => w.offset < lo + band).length;
    const middle = walkers.filter((w) => w.offset >= lo + band && w.offset < lo + 2 * band).length;
    const outer = walkers.filter((w) => w.offset >= lo + 2 * band).length;
    expect(inner).toBeGreaterThan(middle);
    expect(middle).toBeGreaterThan(outer);
  });

  it("walks at slightly different speeds, never in lockstep", () => {
    const speeds = walkers.map((w) => w.omega * (CLEARANCE.base + w.offset));
    const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const spread = Math.sqrt(speeds.reduce((a, b) => a + (b - mean) ** 2, 0) / speeds.length);
    // A real spread round a calm walking pace, but no one racing or stopped.
    expect(spread).toBeGreaterThan(0.06);
    expect(Math.min(...speeds)).toBeGreaterThan(0.3);
    expect(Math.max(...speeds)).toBeLessThan(1.6);
    // Irregular spacing: starting angles are not evenly spaced.
    const angles = walkers.map((w) => w.theta0).sort((a, b) => a - b);
    const gaps = angles.slice(1).map((a, i) => a - angles[i]!);
    expect(Math.max(...gaps) / Math.min(...gaps)).toBeGreaterThan(10);
  });

  it("goes round the Maqam Ibrahim, never through it", () => {
    let nearest = Infinity;
    for (const w of walkers) {
      for (const t of times) {
        const p = walkerPosition(w, t);
        nearest = Math.min(nearest, Math.hypot(p.x - MAQAM.x, p.z - MAQAM.z));
      }
    }
    // Footing radius 1.05 m plus a walker's body.
    expect(nearest).toBeGreaterThan(1.05 + 0.35);
  });

  it("keeps clear of the guards", () => {
    const guards = guardPlacements().map((g) => g.position);
    let nearest = Infinity;
    for (const w of walkers) {
      for (const t of times) {
        const p = walkerPosition(w, t);
        for (const g of guards) nearest = Math.min(nearest, Math.hypot(p.x - g.x, p.z - g.z));
      }
    }
    expect(nearest).toBeGreaterThan(0.8);
  });

  it("faces each walker along its actual path, round the Hijr and the Maqam too", () => {
    for (const w of walkers.slice(0, 60)) {
      for (const t of [0, 20, 95]) {
        const h = walkerHeading(w, t);
        const a = walkerPosition(w, t);
        const b = walkerPosition(w, t + 0.05);
        expect(Math.sin(h) * (b.x - a.x) + Math.cos(h) * (b.z - a.z)).toBeGreaterThan(0);
      }
    }
  });

  it("keeps the whole scene within budget, with room left for the pigeons", () => {
    const perKind = Object.fromEntries(
      (["ihram", "abaya", "carrier"] as const).map((k) => [k, triangleCount(createWalkerGeometry(k))]),
    );
    const crowd = walkers.reduce((sum, w) => sum + perKind[w.kind]!, 0);
    // Everything else in the scene measured 37,188 triangles; keep 15k spare for the birds.
    expect(37_188 + crowd).toBeLessThan(BUDGET.triangles - 15_000);
  });
});
