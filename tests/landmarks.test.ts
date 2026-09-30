import { describe, expect, it } from "vitest";
import { buildLandmarkGeometries } from "../src/components/scene/landmarks";
import { hijrLampPositions } from "../src/components/scene/landmarks/hijr";
import { HIJR } from "../src/components/scene/lib/layout";
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
