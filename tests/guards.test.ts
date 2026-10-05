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

  it("holds the strap with his raised right hand, the left at his side", () => {
    const [right, left] = bodyOf("blackStone").palms;
    expect(right!.distanceTo(strapGripPoint())).toBeLessThan(1e-3);
    // Raised: about shoulder height above his feet.
    expect(right!.y - st.height).toBeGreaterThan(1.35);
    // Hanging: the left palm below his waist.
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

  it("hangs from a ring above the guard's head, down to his waist", () => {
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
    expect(box.min.y).toBeGreaterThan(mb.height + mb.cap + 0.2);
    // The frame meets the door wall about 0.44 m from the corner.
    expect(box.min.x + HALF_X).toBeGreaterThan(0.6);
  });

  it("passes through the guard's grip", () => {
    const grip = strapGripPoint();
    const pos = strapParts()[0]!.geometry.getAttribute("position");
    let nearest = Infinity;
    for (let i = 0; i < pos.count; i++) {
      nearest = Math.min(
        nearest,
        grip.distanceTo(new Vector3(pos.getX(i), pos.getY(i), pos.getZ(i))),
      );
    }
    // Cloth surface within the palm's half-width.
    expect(nearest).toBeLessThan(0.05);
  });
});
