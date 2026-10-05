import { describe, expect, it } from "vitest";
import { Box3, Mesh, Raycaster, Vector3 } from "three";
import { kaabaParts } from "../src/components/scene/landmarks/kaaba";
import { HALF_X, HALF_Z, KAABA } from "../src/components/scene/lib/layout";

describe("Black Stone frame", () => {
  const { silver } = kaabaParts();
  const frame = silver.map((p) => new Mesh(p.geometry));
  const f = KAABA.blackStoneFrame;
  const y0 = KAABA.blackStoneHeight;
  // Looking straight in along the corner's diagonal.
  const out = new Vector3(-1, 0, 1).normalize();
  const side = new Vector3(1, 0, 1).normalize();
  const corner = new Vector3(-HALF_X, 0, HALF_Z);
  const ray = new Raycaster();
  /** Does a ray along the diagonal, offset (u across, v up), hit the frame? */
  const hits = (u: number, v: number) => {
    const o = corner
      .clone()
      .addScaledVector(out, 3)
      .addScaledVector(side, u)
      .setY(y0 + v);
    ray.set(o, out.clone().negate());
    return ray.intersectObjects(frame, false).length > 0;
  };
  /** Half-extent of the opening (no hit) or of the frame (hit) along a direction. */
  const edge = (du: number, dv: number, inside: boolean) => {
    let t = 0;
    while (t < 1 && hits(du * t, dv * t) !== inside) t += 0.002;
    return t;
  };

  it("keeps the opening round seen straight on", () => {
    const across = edge(1, 0, true);
    const up = edge(0, 1, true);
    expect(up).toBeCloseTo(f.opening, 2);
    expect(across / up).toBeGreaterThan(0.9);
    expect(across / up).toBeLessThan(1.1);
  });

  it("stands 0.97 m tall, its foot 0.30 m above the shadharwan (photo 75)", () => {
    const b = new Box3();
    for (const p of silver) {
      p.geometry.computeBoundingBox();
      b.union(p.geometry.boundingBox as Box3);
    }
    expect(b.max.y - b.min.y).toBeCloseTo(2 * f.halfHeight, 2);
    expect(b.min.y - KAABA.baseHeight).toBeCloseTo(0.3, 2);
  });
});
