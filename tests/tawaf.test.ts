import { describe, expect, it } from "vitest";
import { BUDGET, TAWAF, TIER_SETTINGS } from "../src/lib/config/scene";
import { guardPlacements } from "../src/components/scene/figures/guards";
import { LEG_SWING } from "../src/components/scene/figures/walkerMaterial";
import {
  CARRIED_SCALE,
  createWalkerGeometry,
  HAIR_STYLE,
  walkerLook,
} from "../src/components/scene/figures/walkers";
import { PALETTE } from "../src/components/scene/lib/palette";
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
  walkerDistance,
  walkerHeading,
  walkerPosition,
  walkerRadius,
  walkerStep,
  walkerTheta,
  PAIR_CASES,
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
    expect(kinds).toEqual(new Set(["ihram", "abaya", "carrier", "mother", "child"]));
  });
});

describe("tawaf crowd (Phase 2)", () => {
  const walkers = createWalkers(TIER_SETTINGS.high.walkers);
  const times = Array.from({ length: 240 }, (_, i) => i * 1.5);

  it("mixes 60% men in ihram, 32% women in abaya, 5% men and 3% women carrying a child, with 3.5% children walking", () => {
    const count = (k: string) => walkers.filter((w) => w.kind === k).length;
    const n = walkers.length;
    const child = Math.round(n * 0.035);
    const [abaya, carrier, mother] = [0.32, 0.05, 0.03].map((s) => Math.round(n * s * 0.965));
    expect(count("child")).toBe(child);
    expect(count("ihram")).toBe(n - abaya! - carrier! - mother! - child);
    expect(count("abaya")).toBe(abaya);
    expect(count("carrier")).toBe(carrier);
    expect(count("mother")).toBe(mother);
  });

  it("is a calm, medium crowd, lighter on weaker devices", () => {
    expect(TIER_SETTINGS.high.walkers).toBeGreaterThanOrEqual(380);
    expect(TIER_SETTINGS.high.walkers).toBeLessThanOrEqual(420);
    expect(TIER_SETTINGS.medium.walkers).toBeLessThan(TIER_SETTINGS.high.walkers);
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
      (["ihram", "abaya", "carrier", "mother", "child"] as const).map((k) => [k, triangleCount(createWalkerGeometry(k))]),
    );
    const crowd = walkers.reduce((sum, w) => sum + perKind[w.kind]!, 0);
    // Everything else in the scene measured 37,188 triangles; keep 15k spare for the birds.
    expect(37_188 + crowd).toBeLessThan(BUDGET.triangles - 15_000);
  });
});

describe("tawaf crowd: spacing, walking, variety", () => {
  const walkers = createWalkers(TIER_SETTINGS.high.walkers);

  it("never lets two walkers overlap, whatever their breadth (a parent and child touch only by the hands)", () => {
    let nearest = Infinity;
    let clearance = Infinity;
    const r = walkers.map(walkerRadius);
    for (let k = 0; k < 120; k++) {
      const ps = walkers.map((w) => walkerPosition(w, k * 2.7));
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          if (walkers[i]!.partner === j) continue;
          const d = Math.hypot(ps[i]!.x - ps[j]!.x, ps[i]!.z - ps[j]!.z);
          nearest = Math.min(nearest, d);
          clearance = Math.min(clearance, d - r[i]! - r[j]!);
        }
      }
    }
    expect(nearest).toBeGreaterThan(0.5);
    // Bodies (shoulder and hem width) never touch.
    expect(clearance).toBeGreaterThan(0);
  });

  it("varies bodies: heights and breadths across the range, most in the middle", () => {
    const { body } = TAWAF;
    const men = walkers.filter((w) => w.kind === "ihram" || w.kind === "carrier").map((w) => w.height * body.modelHeight.man);
    const women = walkers.filter((w) => w.kind === "abaya" || w.kind === "mother").map((w) => w.height * body.modelHeight.woman);
    const breadth = walkers.filter((w) => w.kind !== "child").map((w) => w.breadth);
    const within = (xs: number[], [lo, hi]: [number, number]) => {
      expect(Math.min(...xs)).toBeGreaterThanOrEqual(lo);
      expect(Math.max(...xs)).toBeLessThanOrEqual(hi);
      // Spread out (well over a third of the range) …
      expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan((hi - lo) * 0.6);
      // … with most in the middle half.
      const mid = xs.filter((x) => Math.abs(x - (lo + hi) / 2) < (hi - lo) / 4).length;
      expect(mid / xs.length).toBeGreaterThan(0.6);
    };
    within(men, body.menHeight);
    within(women, body.womenHeight);
    within(breadth, body.breadth);
  });

  it("takes one step per half-turn of the step phase, matched to the distance walked", () => {
    // A step moves a foot from behind to in front: 2 × leg (0.85 m) × sin(swing).
    const stride = 2 * 0.85 * Math.sin(LEG_SWING);
    expect(TAWAF.stepsPerMetre).toBeCloseTo(1 / stride, 6);
    const w = walkers[0]!;
    const dPhase = walkerStep(w, 10) - walkerStep(w, 0);
    const dDist = walkerDistance(w, 10) - walkerDistance(w, 0);
    // Taller walkers have longer legs, so longer strides.
    expect(dPhase / Math.PI).toBeCloseTo(dDist / (stride * w.height), 6);
  });

  it("varies skin and hair: many tones, six hair lengths, bald and very long fewest", () => {
    const looks = walkers.map((_, i) => walkerLook(i));
    expect(new Set(looks.map((l) => l.skin)).size).toBeGreaterThanOrEqual(6);
    expect(new Set(looks.map((l) => l.hair)).size).toBeGreaterThanOrEqual(5);
    const men = walkers
      .map((w, i) => [w, looks[i]!] as const)
      .filter(([w]) => w.kind === "ihram" || w.kind === "carrier");
    const share = (s: number) => men.filter(([, l]) => l.style === s).length / men.length;
    const shares = Object.values(HAIR_STYLE).map(share);
    for (const s of shares) expect(s).toBeGreaterThan(0.02);
    const [bald, ...rest] = shares;
    const veryLong = rest.pop()!;
    for (const s of rest) {
      expect(s).toBeGreaterThan(bald!);
      expect(s).toBeGreaterThan(veryLong);
    }
  });

  it("makes men mostly taller than women, the ranges overlapping", () => {
    const { body } = TAWAF;
    const woman = (w: (typeof walkers)[number]) => w.kind === "abaya" || w.kind === "mother";
    const metres = (w: (typeof walkers)[number]) =>
      w.height * (woman(w) ? body.modelHeight.woman : body.modelHeight.man);
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    const men = walkers.filter((w) => !woman(w) && w.kind !== "child").map(metres);
    const women = walkers.filter(woman).map(metres);
    expect(mean(men) - mean(women)).toBeGreaterThan(0.1);
    expect(Math.min(...men)).toBeLessThan(Math.max(...women));
    // In couples and families, the men are mostly the taller.
    const groups = new Map<number, typeof walkers>();
    walkers.forEach((w) => w.group >= 0 && groups.set(w.group, [...(groups.get(w.group) ?? []), w]));
    let pairs = 0;
    let taller = 0;
    for (const g of groups.values()) {
      const ms = g.filter((w) => !woman(w) && w.kind !== "child");
      if (ms.length === 0) continue;
      const top = Math.max(...ms.map(metres));
      for (const w of g.filter(woman)) {
        pairs++;
        if (metres(w) < top) taller++;
      }
    }
    expect(taller / pairs).toBeGreaterThan(0.85);
  });

  it("varies the carried children: boys in white, girls in white or black with a cover, sizes differing", () => {
    const children = walkers
      .map((w, i) => [w, walkerLook(i).child] as const)
      .filter(([w]) => w.kind === "carrier" || w.kind === "mother")
      .map(([, c]) => c);
    expect(children.some((c) => c.girl)).toBe(true);
    expect(children.some((c) => !c.girl)).toBe(true);
    const all = walkers.map((_, i) => walkerLook(i).child);
    for (const c of all.filter((c) => !c.girl)) expect(c.cloth).toBe(PALETTE.childWhite);
    expect(new Set(all.filter((c) => c.girl).map((c) => c.cloth))).toEqual(
      new Set([PALETTE.childWhite, PALETTE.childBlack]),
    );
    // Three sizes, mostly small or middle, and smaller than before (0.85–1.15).
    const share = (s: number) => children.filter((c) => c.size === s).length / children.length;
    expect(share(0) + share(1)).toBeGreaterThan(0.6);
    expect(share(2)).toBeGreaterThan(0);
    for (const scales of Object.values(CARRIED_SCALE)) {
      expect(scales).toHaveLength(3);
      expect(Math.max(...scales)).toBeLessThan(0.96);
    }
  });

  it("has children walk with a parent, the four ways about equally", () => {
    const children = walkers.filter((w) => w.kind === "child");
    const perCase = PAIR_CASES.map((_, c) => children.filter((w) => w.pairCase === c).length);
    expect(Math.max(...perCase) - Math.min(...perCase)).toBeLessThanOrEqual(1);
    const { body } = TAWAF;
    for (const child of children) {
      const parent = walkers[child.partner]!;
      expect(parent.partner).toBe(walkers.indexOf(child));
      const { parent: kind, childAhead } = PAIR_CASES[child.pairCase]!;
      expect(parent.kind).toBe(kind);
      // Same lane, same pace: never apart.
      expect(parent.offset).toBe(child.offset);
      expect(parent.omega).toBe(child.omega);
      const gaps = [0, 37, 140].map((t) => {
        const a = walkerPosition(child, t);
        const b = walkerPosition(parent, t);
        return Math.hypot(a.x - b.x, a.z - b.z);
      });
      for (const g of gaps) {
        expect(g).toBeGreaterThan(0.35);
        expect(g).toBeLessThan(0.95);
      }
      // The one behind holds on: the child's arms, or the parent's.
      expect(childAhead ? parent.reach : child.reach).toBeGreaterThan(0.2);
      expect(childAhead ? child.reach : parent.reach).toBe(0);
      // Who is ahead: travel is towards larger angles.
      expect(walkerTheta(child, 0) > walkerTheta(parent, 0)).toBe(childAhead);
      const metres = child.height * body.modelHeight.child;
      expect(metres).toBeGreaterThanOrEqual(0.9);
      expect(metres).toBeLessThanOrEqual(1.3);
    }
  });

  it("gives walking children shorter, quicker steps than adults at the same pace", () => {
    const child = walkers.find((w) => w.kind === "child")!;
    const parent = walkers[child.partner]!;
    const steps = (w: (typeof walkers)[number]) => walkerStep(w, 20) - walkerStep(w, 0);
    expect(steps(child)).toBeGreaterThan(steps(parent) * 1.2);
  });
});

describe("tawaf crowd: groups", () => {
  const walkers = createWalkers(TIER_SETTINGS.high.walkers);
  const groups = new Map<number, typeof walkers>();
  walkers.forEach((w) => {
    if (w.group < 0) return;
    groups.set(w.group, [...(groups.get(w.group) ?? []), w]);
  });

  it("puts about 35–40% of the crowd in groups of 2–5", () => {
    const share = walkers.filter((w) => w.group >= 0).length / walkers.length;
    expect(share).toBeGreaterThanOrEqual(0.35);
    expect(share).toBeLessThanOrEqual(0.41);
    for (const g of groups.values()) {
      expect(g.length).toBeGreaterThanOrEqual(2);
      expect(g.length).toBeLessThanOrEqual(5);
    }
  });

  it("forms couples, families and friends from the kinds already in the crowd", () => {
    const kinds = [...groups.values()].map((g) => g.map((w) => w.kind).sort().join("+"));
    expect(kinds).toContain("abaya+ihram");
    expect(kinds.some((k) => k.split("+").length >= 3 && k.includes("abaya"))).toBe(true);
    expect(kinds.some((k) => /^ihram(\+ihram)+$/.test(k))).toBe(true);
    expect(kinds.some((k) => k.includes("carrier") && k.includes("abaya"))).toBe(true);
  });

  it("keeps each group together, at one pace, round the whole mataf", () => {
    let widest = 0;
    for (const g of groups.values()) {
      expect(new Set(g.map((w) => w.omega)).size).toBe(1);
      for (let k = 0; k < 60; k++) {
        const ps = g.map((w) => walkerPosition(w, k * 3.1));
        for (const a of ps) for (const b of ps) widest = Math.max(widest, Math.hypot(a.x - b.x, a.z - b.z));
      }
    }
    // Five people at most: a loose cluster a few metres across, which
    // stretches for a while on the longer outer path round the Hijr.
    expect(widest).toBeLessThan(6);
  });

  it("lays groups out irregularly, not in straight rows", () => {
    const shapes = new Set(
      [...groups.values()].map((g) =>
        g.map((w) => `${w.offset.toFixed(2)}:${(w.theta0 - g[0]!.theta0).toFixed(5)}`).join("|"),
      ),
    );
    expect(shapes.size).toBe(groups.size);
  });
});

describe("tawaf crowd: group mix", () => {
  it("has couples as the commonest group, about 40%", () => {
    const walkers = createWalkers(TIER_SETTINGS.high.walkers);
    const groups = new Map<number, string[]>();
    walkers.forEach((w) => w.group >= 0 && groups.set(w.group, [...(groups.get(w.group) ?? []), w.kind]));
    const couples = [...groups.values()].filter((k) => k.length === 2 && k.includes("abaya")).length;
    const friends = [...groups.values()].filter((k) => k.every((x) => x === "ihram")).length;
    const families = groups.size - couples - friends;
    expect(couples).toBeGreaterThan(families);
    expect(couples).toBeGreaterThan(friends);
    expect(couples / groups.size).toBeGreaterThan(0.33);
    expect(couples / groups.size).toBeLessThan(0.5);
  });
});

describe("walker shader inputs", () => {
  it("stays within WebGL's 16 vertex attribute slots", () => {
    // Per vertex, from walkers.ts, plus per instance from TawafCrowd
    // (aSkin, aHair, aLook, aChild, aChildLook) and the instance matrix (4 slots).
    const perVertex = Object.keys(createWalkerGeometry("carrier").attributes).length;
    expect(perVertex + 5 + 4).toBeLessThanOrEqual(16);
  });
});
