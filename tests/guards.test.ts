import { describe, expect, it } from "vitest";
import { Box3, type BufferGeometry, Triangle, Vector3 } from "three";
import {
  createGuardsGeometry,
  guardPlacements,
  guardStepParts,
  placedGuardParts,
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
  const { camo, solid, palms } = placedGuardParts(byId(id));
  const geometry = mergeParts([...camo, ...solid]);
  return { geometry, box: new Box3().setFromBufferAttribute(geometry.getAttribute("position") as never), palms };
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

  it("leans on the strap: hand down at his hip in its opening, the left at his side", () => {
    const { palms, geometry } = bodyOf("blackStone");
    const [right, left] = palms;
    expect(right!.distanceTo(strapGripPoint())).toBeLessThan(1e-3);
    // Down at hip level (hips 0.92 m above his feet).
    expect(Math.abs(right!.y - st.height - 0.92)).toBeLessThan(0.08);
    // Hanging: the left palm below his waist.
    expect(left!.y - st.height).toBeLessThan(0.9);
    // Leaning 10–15°, along the wall: nothing of him goes into the wall.
    expect(GUARDS.blackStone.leanDeg).toBeGreaterThanOrEqual(10);
    expect(GUARDS.blackStone.leanDeg).toBeLessThanOrEqual(15);
    const pos = geometry.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      expect(pos.getZ(i)).toBeGreaterThan(HALF_Z);
    }
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

  it("lies against the door wall, clear of the marble block and the frame", () => {
    expect(box.min.z).toBeGreaterThan(HALF_Z);
    expect(box.max.z - HALF_Z).toBeLessThan(0.12);
    expect(box.min.y).toBeGreaterThan(mb.height + mb.cap + 0.1);
    // The frame meets the door wall about 0.44 m from the corner.
    expect(box.min.x + HALF_X).toBeGreaterThan(0.6);
  });

  it("opens round the guard's hand, the fold just below it", () => {
    const hand = strapGripPoint();
    const pos = strapParts()[0]!.geometry.getAttribute("position");
    let left = false;
    let right = false;
    for (let i = 0; i < pos.count; i++) {
      if (Math.abs(pos.getY(i) - hand.y) > 0.02) continue;
      // Cloth on both sides of the hand, clear of the palm (half-width 0.036).
      if (pos.getX(i) < hand.x - 0.036) left = true;
      if (pos.getX(i) > hand.x + 0.036) right = true;
      expect(Math.abs(pos.getX(i) - hand.x)).toBeGreaterThan(0.036);
    }
    expect(left && right).toBe(true);
    expect(box.min.y).toBeLessThan(hand.y - 0.05);
  });
});
