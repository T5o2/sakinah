import { describe, expect, it } from "vitest";
import { buildLandmarkGeometries } from "../src/components/scene/landmarks";
import { hijrLampPositions } from "../src/components/scene/landmarks/hijr";
import { kaabaParts } from "../src/components/scene/landmarks/kaaba";
import {
  HALF_X,
  HALF_Z,
  HIJR,
  KAABA,
} from "../src/components/scene/lib/layout";
import { Box3, Mesh, Raycaster, Vector3 } from "three";
import { triangleCount } from "../src/components/scene/lib/parts";
import { BUDGET } from "../src/lib/config/scene";

describe("landmark performance budget", () => {
  const geometries = buildLandmarkGeometries();

  it("draws all landmarks in at most the budgeted draw calls", () => {
    // One geometry per material → one draw call each.
    expect(Object.keys(geometries).length).toBeLessThanOrEqual(
      BUDGET.landmarkDrawCalls,
    );
  });

  it("stays within the landmark triangle budget", () => {
    const total = Object.values(geometries).reduce(
      (sum, g) => sum + triangleCount(g),
      0,
    );
    expect(total).toBeLessThanOrEqual(BUDGET.landmarkTriangles);
  });

  it("gives every merged vertex a colour", () => {
    for (const key of ["matte", "metal", "lanternGlass"] as const) {
      const g = geometries[key];
      expect(g.getAttribute("color").count).toBe(
        g.getAttribute("position").count,
      );
    }
  });
});

describe("Hijr Ismail lamp posts", () => {
  it("has three posts standing on the wall's centre line", () => {
    const posts = hijrLampPositions();
    expect(posts).toHaveLength(3);
    for (const [x, z] of posts) {
      // Normalised ellipse radius of the wall centre line is exactly 1.
      const e =
        ((x - HIJR.centerX) / HIJR.radiusX) ** 2 + (z / HIJR.radiusZ) ** 2;
      expect(e).toBeCloseTo(1, 6);
    }
  });
});

describe("Kaaba base", () => {
  const { matte, strip } = kaabaParts();
  const box = (parts: { geometry: import("three").BufferGeometry }[]) => {
    const b = new Box3();
    for (const p of parts) {
      p.geometry.computeBoundingBox();
      b.union(p.geometry.boundingBox as Box3);
    }
    return b;
  };

  it("never lets the dark granite show beyond the shadharwan's edge", () => {
    const o = KAABA.baseOutset;
    const b = box(strip);
    expect(b.min.x).toBeCloseTo(-HALF_X - o, 5);
    expect(b.max.x).toBeCloseTo(HALF_X + o, 5);
    expect(b.min.z).toBeCloseTo(-HALF_Z - o, 5);
    expect(b.max.z).toBeCloseTo(HALF_Z + o, 5);
  });

  it("keeps the granite to a thin slab under the shadharwan", () => {
    expect(box(strip).max.y).toBeCloseTo(KAABA.blackStrip.slab, 5);
    // The shadharwan pieces (marble, low) all rest on that slab.
    const low = matte.filter((p) => {
      p.geometry.computeBoundingBox();
      return (p.geometry.boundingBox as Box3).max.y <= KAABA.baseHeight + 1e-6;
    });
    expect(low.length).toBeGreaterThan(0);
    for (const p of low) {
      expect((p.geometry.boundingBox as Box3).min.y).toBeGreaterThanOrEqual(
        KAABA.blackStrip.slab - 1e-6,
      );
    }
  });
});

describe("shadharwan corners", () => {
  const { matte } = kaabaParts();
  const meshes = matte.map((p) => new Mesh(p.geometry));
  const o = KAABA.baseOutset;
  const h = KAABA.baseHeight;
  const lip = KAABA.blackStrip.slab + 0.05;
  /** Section height at `d` metres out from the wall. */
  const section = (d: number) =>
    d <= 0.06 ? h : h - ((d - 0.06) * (h - lip)) / (o - 0.06);
  const ray = new Raycaster();
  const down = new Vector3(0, -1, 0);
  const corners = [
    [-HALF_X, HALF_Z],
    [HALF_X, HALF_Z],
    [HALF_X, -HALF_Z],
    [-HALF_X, -HALF_Z],
  ] as const;
  const samples = [
    [0.05, 0.02],
    [0.3, 0.1],
    [0.2, 0.2],
    [0.1, 0.4],
    [0.44, 0.43],
  ] as const;

  it("wraps every corner as one piece at the section's height, with no gap", () => {
    for (const [cx, cz] of corners) {
      for (const [p, q] of samples) {
        // p out past one wall, q out past the other: both are distances
        // from a wall, so the surface is the section at the larger of them.
        const x = cx + Math.sign(cx) * p;
        const z = cz + Math.sign(cz) * q;
        ray.set(new Vector3(x, 0.6, z), down);
        const hit = ray.intersectObjects(meshes, false)[0];
        expect(hit, `hit at (${x}, ${z})`).toBeDefined();
        expect(hit!.point.y).toBeCloseTo(section(Math.max(p, q)), 4);
      }
    }
  });
});
