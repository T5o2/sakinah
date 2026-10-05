import { describe, expect, it } from "vitest";
import { Box3, type BufferGeometry, Triangle, Vector3 } from "three";
import {
  createGuardsGeometry,
  guardPlacements,
  guardStepParts,
  placedGuardParts,
  STRAP_RADIUS,
  strapCurve,
  strapGripPoint,
  strapParts,
  strapRingCentre,
} from "../src/components/scene/figures/guards";
import { hijrParts } from "../src/components/scene/landmarks/hijr";
import { kaabaParts } from "../src/components/scene/landmarks/kaaba";
import {
  GUARDS,
  HALF_X,
  HALF_Z,
  KAABA,
} from "../src/components/scene/lib/layout";
import { mergeParts, triangleCount } from "../src/components/scene/lib/parts";
import { clearanceRadius } from "../src/components/scene/lib/tawaf";

const placements = guardPlacements();
const byId = (id: string) => {
  const g = placements.find((p) => p.id === id);
  if (!g) throw new Error(id);
  return g;
};
const bodyOf = (id: string) => {
  const { camo, solid, palms, rightArm, spine } = placedGuardParts(byId(id));
  const geometry = mergeParts([...camo, ...solid]);
  return {
    geometry,
    box: new Box3().setFromBufferAttribute(geometry.getAttribute("position") as never),
    palms,
    rightArm,
    spine,
  };
};

/** True when any triangle of `geometry` touches `box`. */
function touches(geometry: BufferGeometry, box: Box3): boolean {
  const pos = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const count = index ? index.count : pos.count;
  const at = (i: number) => {
    const k = index ? index.getX(i) : i;
    return new Vector3(pos.getX(k), pos.getY(k), pos.getZ(k));
  };
  for (let i = 0; i < count; i += 3) {
    if (box.intersectsTriangle(new Triangle(at(i), at(i + 1), at(i + 2))))
      return true;
  }
  return false;
}

describe("guards", () => {
  it("are four: a red beret at the Black Stone, black at the Yemeni corner and the Hijr gates", () => {
    expect(placements.map((g) => [g.id, g.beret])).toEqual([
      ["blackStone", "red"],
      ["yemeni", "black"],
      ["hijrGateIraqi", "black"],
      ["hijrGateShami", "black"],
    ]);
  });

  it("stand about 1.75 m tall, feet on their floor", () => {
    for (const g of placements) {
      const { box } = bodyOf(g.id);
      // The Black Stone guard leans towards the stone, a little lower.
      expect(box.max.y - box.min.y).toBeGreaterThan(
        g.pose.leanDeg ? 1.7 : 1.73,
      );
      expect(box.max.y - box.min.y).toBeLessThan(1.8);
      expect(box.min.y).toBeCloseTo(g.position.y, 6);
    }
  });

  it("stay inside the tawaf clearance line, so walkers never pass through them", () => {
    for (const g of placements) {
      const theta = Math.atan2(-g.position.z, g.position.x);
      const r = Math.hypot(g.position.x, g.position.z);
      expect(r + 0.5).toBeLessThan(clearanceRadius(theta));
    }
  });

  it("keep clear of the Kaaba and the Hijr wall (the Black Stone guard aside)", () => {
    const kaaba = mergeParts(kaabaParts().matte);
    const hijr = mergeParts(hijrParts().matte);
    for (const id of ["yemeni", "hijrGateIraqi", "hijrGateShami"]) {
      const { box } = bodyOf(id);
      expect(touches(kaaba, box)).toBe(false);
      expect(touches(hijr, box)).toBe(false);
    }
  });

  it("cost one merged geometry, a few thousand triangles each", () => {
    const g = createGuardsGeometry();
    expect(g.getAttribute("color").count).toBe(g.getAttribute("position").count);
    expect(triangleCount(g)).toBeLessThanOrEqual(4 * 4000);
  });
});

describe("Black Stone guard", () => {
  const st = GUARDS.step;
  const mb = KAABA.marbleBlock;

  it("stands on a separate marble step behind the marble block, its top at half the block's height", () => {
    const box = new Box3();
    for (const p of guardStepParts()) {
      p.geometry.computeBoundingBox();
      box.union(p.geometry.boundingBox as Box3);
    }
    // Starts where the block ends along the door wall, against the wall.
    expect(box.min.x).toBeCloseTo(-HALF_X + mb.from + mb.width, 6);
    expect(box.min.z).toBeCloseTo(HALF_Z, 6);
    expect(box.max.y).toBeCloseTo(st.height, 6);
    expect(st.height / mb.height).toBeGreaterThan(0.45);
    expect(st.height / mb.height).toBeLessThan(0.55);
    // Feet on the step's top.
    expect(byId("blackStone").position.y).toBe(st.height);
  });

  it("keeps his feet on the step", () => {
    const { geometry } = bodyOf("blackStone");
    const pos = geometry.getAttribute("position");
    const x0 = -HALF_X + st.from;
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) > st.height + 0.25) continue;
      expect(pos.getX(i)).toBeGreaterThanOrEqual(x0);
      expect(pos.getX(i)).toBeLessThanOrEqual(x0 + st.width);
      expect(pos.getZ(i)).toBeGreaterThanOrEqual(HALF_Z);
      expect(pos.getZ(i)).toBeLessThanOrEqual(HALF_Z + st.depth + 0.02);
    }
  });

  it("leans from the ankles: ankles, hips and head on one straight line", () => {
    const [ankles, hips, head] = bodyOf("blackStone").spine;
    const tilt = (p: Vector3) =>
      (Math.acos((p.y - ankles!.y) / p.distanceTo(ankles!)) * 180) / Math.PI;
    const lean = GUARDS.blackStone.leanDeg;
    // A slight lean.
    expect(lean).toBeGreaterThanOrEqual(8);
    expect(lean).toBeLessThanOrEqual(15);
    expect(tilt(hips!)).toBeCloseTo(lean, 6);
    expect(tilt(head!)).toBeCloseTo(lean, 6);
    // Mostly along the wall towards the strap (−X), a little back onto the wall.
    const dx = ankles!.x - head!.x;
    const dz = ankles!.z - head!.z;
    expect(dx).toBeGreaterThan(0);
    expect(dz).toBeGreaterThan(0);
    expect(dz).toBeLessThan(dx * 0.3);
  });

  it("stands close against the wall: his back touches it without going in", () => {
    const pos = bodyOf("blackStone").geometry.getAttribute("position");
    let nearest = Infinity;
    let at = 0;
    for (let i = 0; i < pos.count; i++) {
      if (pos.getZ(i) - HALF_Z < nearest) {
        nearest = pos.getZ(i) - HALF_Z;
        at = pos.getY(i) - st.height;
      }
    }
    expect(nearest).toBeGreaterThan(0.002);
    expect(nearest).toBeLessThan(0.012);
    // The nearest point is his upper body (back or shoulder), not a heel or hand.
    expect(at).toBeGreaterThan(1.0);
    expect(at).toBeLessThan(1.5);
  });

  it("holds the strap's end at his hip with his right hand, the left at his side", () => {
    const [right, left] = bodyOf("blackStone").palms;
    expect(right!.distanceTo(strapGripPoint())).toBeLessThan(1e-3);
    // Hip level: about 0.92 m above his feet.
    expect(Math.abs(right!.y - st.height - 0.92)).toBeLessThan(0.08);
    expect(left!.y - st.height).toBeLessThan(0.9);
  });
});

describe("Black Stone guard's strap", () => {
  const { strap } = GUARDS;
  const mb = KAABA.marbleBlock;
  const box = new Box3();
  for (const p of strapParts()) {
    p.geometry.computeBoundingBox();
    box.union(p.geometry.boundingBox as Box3);
  }

  it("hangs from a ring above the guard's head, down to his hip", () => {
    const head = bodyOf("blackStone").box.max.y;
    const ring = strapRingCentre();
    expect(ring.y - strap.ringRadius).toBeGreaterThan(head);
    expect(box.min.y).toBeGreaterThan(strap.bottomY - 0.03);
    expect(box.min.y).toBeLessThan(strap.bottomY);
    expect(box.max.y).toBeLessThan(ring.y + strap.ringRadius);
  });

  it("hangs flat on the door wall, clear of the marble block and the frame", () => {
    expect(box.min.z).toBeGreaterThan(HALF_Z);
    expect(box.max.z - HALF_Z).toBeLessThan(0.1);
    expect(box.min.y).toBeGreaterThan(mb.height + mb.cap + 0.1);
    // The frame meets the door wall about 0.44 m from the corner.
    expect(box.min.x + HALF_X).toBeGreaterThan(0.6);
  });

  const samples = strapCurve().getSpacedPoints(800);

  it("is held at its bottom end, from the front", () => {
    const hand = strapGripPoint();
    // The palm in front of the cloth, closing on it.
    const fold = samples.reduce((a, b) => (b.y < a.y ? b : a));
    expect(hand.z).toBeGreaterThan(fold.z);
    expect(hand.z - 0.036).toBeLessThan(fold.z + STRAP_RADIUS);
    // At the very end: the palm's centre within a few centimetres of the fold.
    expect(Math.abs(hand.y - fold.y)).toBeLessThan(0.04);
    expect(Math.abs(hand.x - fold.x)).toBeLessThan(0.01);
  });

  it("never runs into the guard: arm or body (the gripping palm aside)", () => {
    const { rightArm, geometry } = bodyOf("blackStone");
    const [shoulder, elbow, wrist, palm] = rightArm as [Vector3, Vector3, Vector3, Vector3];
    const toSegment = (p: Vector3, a: Vector3, b: Vector3) => {
      const ab = b.clone().sub(a);
      const t = Math.min(1, Math.max(0, p.clone().sub(a).dot(ab) / ab.lengthSq()));
      return p.distanceTo(a.clone().addScaledVector(ab, t));
    };
    let gap = Infinity;
    for (const p of samples) {
      gap = Math.min(
        gap,
        toSegment(p, shoulder, elbow) - 0.066,
        toSegment(p, elbow, wrist) - 0.048,
      );
    }
    expect(gap - STRAP_RADIUS).toBeGreaterThan(0);
    // No vertex of his body inside the cloth.
    const pos = geometry.getAttribute("position");
    const v = new Vector3();
    let inside = Infinity;
    for (let i = 0; i < pos.count; i++) {
      v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      if (v.y < box.min.y - 0.05 || v.y > box.max.y + 0.05) continue;
      if (v.distanceTo(palm) < 0.07) continue;
      for (const p of samples) inside = Math.min(inside, v.distanceTo(p));
    }
    expect(inside).toBeGreaterThan(STRAP_RADIUS);
  });
});
