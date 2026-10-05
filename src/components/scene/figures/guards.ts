import {
  BoxGeometry,
  type BufferGeometry,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  Matrix4,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { hijrPoint } from "../landmarks/hijr";
import { GUARDS, HALF_X, HALF_Z, HIJR } from "../lib/layout";
import { PALETTE } from "../lib/palette";
import { mergeParts, part, type Part } from "../lib/parts";

/**
 * The four guards round the Kaaba: one faceless figure, built by one function
 * and posed by its arguments, in the scene's simple low-poly style. All four
 * are static, so they are placed and merged into a single geometry with
 * their colours baked into vertex colours — one draw call for all of them
 * (instancing would need one per pose and beret colour).
 *
 * No face, no badge on the beret, no patches or insignia, no mask.
 */

const DEG = Math.PI / 180;
const UP = new Vector3(0, 1, 0);

/** Body in metres, modelled facing +Z with the feet at the origin. */
const BODY = {
  hip: 0.92,
  /** Hip joints sit this far either side of the centre line. */
  hipHalf: 0.095,
  waist: 1.0,
  shoulderY: 1.42,
  shoulderHalf: 0.205,
  neckTop: 1.55,
  headY: 1.615,
  headR: 0.1,
  upperArm: 0.3,
  forearm: 0.27,
  /** From the wrist to the middle of the palm. */
  hand: 0.07,
  boot: { width: 0.11, height: 0.11, length: 0.27, shaft: 0.21 },
} as const;

type Beret = "red" | "black";

interface Pose {
  /** Ankles either side of the centre line. "At ease" (photo 82): shoulder width. */
  stanceHalf: number;
  /** Lean of the upper body about the hips. */
  leanDeg: number;
  /** Horizontal direction of the lean, in the figure's own frame; default his right (−X). */
  leanToward?: Vector3;
  /** Middle of the right palm, in the figure's own frame; none = at ease. */
  rightHand?: Vector3;
  /** Where the reaching right elbow points, in the figure's own frame. */
  rightElbowPole?: Vector3;
  /** Left arm hanging at the side instead of behind the back. */
  leftAtSide?: boolean;
}

interface GuardBody {
  camo: Part[];
  solid: Part[];
  /** Middle of each palm, right first. */
  palms: Vector3[];
  /** Reaching right arm: shoulder, elbow, wrist, palm (empty when at ease). */
  rightArm: Vector3[];
  /** Between the ankles, middle of the hips, centre of the head. */
  spine: Vector3[];
}

const AT_EASE: Pose = { stanceHalf: 0.19, leanDeg: 0 };

/** A tapered limb between two points, finely divided so camouflage blotches can form. */
function limb(a: Vector3, b: Vector3, ra: number, rb: number): BufferGeometry {
  const length = a.distanceTo(b);
  const g = new CylinderGeometry(
    rb,
    ra,
    length,
    10,
    Math.max(2, Math.round(length / 0.05)),
    true,
  );
  g.applyQuaternion(
    new Quaternion().setFromUnitVectors(UP, b.clone().sub(a).normalize()),
  );
  const mid = a.clone().add(b).multiplyScalar(0.5);
  return g.translate(mid.x, mid.y, mid.z);
}

function ball(at: Vector3, r: number, scale: [number, number, number] = [1, 1, 1]) {
  return new SphereGeometry(r, 10, 7)
    .scale(...scale)
    .translate(at.x, at.y, at.z);
}

/**
 * Two-bone reach: elbow position for a shoulder `s` reaching a palm at `t`,
 * the elbow bending towards `pole`. Out of reach, the arm points straight at
 * the target.
 */
export function elbowFor(
  s: Vector3,
  t: Vector3,
  upper: number,
  lower: number,
  pole: Vector3,
): Vector3 {
  const toT = t.clone().sub(s);
  const d = Math.min(toT.length(), upper + lower - 1e-4);
  const u = toT.normalize();
  const along = (upper * upper - lower * lower + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, upper * upper - along * along));
  const p = pole
    .clone()
    .addScaledVector(u, -pole.dot(u))
    .normalize();
  return s.clone().addScaledVector(u, along).addScaledVector(p, h);
}

/**
 * One guard in its own frame. Camouflage parts come back separately: they
 * are coloured triangle by triangle once placed (see camouflage).
 */
export function guardParts(
  beret: Beret,
  pose: Pose = AT_EASE,
): GuardBody {
  const camo: Part[] = [];
  const palms: Vector3[] = [];
  const rightArm: Vector3[] = [];
  const solid: Part[] = [];
  const c = (g: BufferGeometry) => camo.push({ geometry: g, color: PALETTE.guardCamo });
  const s = (g: BufferGeometry, color: string) => solid.push({ geometry: g, color });
  const v = (x: number, y: number, z: number) => new Vector3(x, y, z);
  const { boot } = BODY;
  const ankleY = boot.shaft - 0.02;

  // Lean from the ankles: the whole body above the boots turns about the
  // point between them, so ankles, hips and head stay on one straight line
  // with no bend at the waist; the boots stay flat on the floor. Tipping
  // "up" towards the lean direction is a turn about up × direction.
  const leanAxis = UP.clone()
    .cross(pose.leanToward ?? v(-1, 0, 0))
    .normalize();
  const leanM = new Matrix4()
    .makeTranslation(0, ankleY, 0)
    .multiply(new Matrix4().makeRotationAxis(leanAxis, pose.leanDeg * DEG))
    .multiply(new Matrix4().makeTranslation(0, -ankleY, 0));
  const leanInv = leanM.clone().invert();

  // Legs and boots: feet apart. Each leg runs from its ankle, fixed on the
  // boot, up to its hip joint where the leaning body puts it.
  for (const side of [-1, 1]) {
    const hip = v(side * BODY.hipHalf, BODY.hip, 0).applyMatrix4(leanM);
    const ankle = v(side * pose.stanceHalf, ankleY, 0);
    const knee = hip.clone().lerp(ankle, 0.5).add(v(0, 0, 0.02));
    c(limb(hip, knee, 0.09, 0.068));
    c(limb(knee, ankle, 0.068, 0.058));
    c(ball(knee, 0.068));
    s(
      new BoxGeometry(boot.width, boot.height, boot.length).translate(
        ankle.x,
        boot.height / 2,
        0.04,
      ),
      PALETTE.guardBoot,
    );
    s(
      new CylinderGeometry(0.062, 0.066, boot.shaft, 10).translate(
        ankle.x,
        boot.shaft / 2,
        0,
      ),
      PALETTE.guardBoot,
    );
  }

  // Upper body, built straight, then leaned with the legs as one piece.
  const upper: Part[] = [];
  const uc = (g: BufferGeometry) => upper.push({ geometry: g, color: PALETTE.guardCamo });
  const us = (g: BufferGeometry, color: string) => upper.push({ geometry: g, color });
  // Seat and hips.
  uc(
    new CylinderGeometry(0.17, 0.165, 0.2, 14, 4)
      .scale(1, 1, 0.68)
      .translate(0, BODY.hip, 0),
  );
  // Shirt: tapering to the waist, rounded over the shoulders.
  const chest = BODY.shoulderY + 0.03 - BODY.waist;
  uc(
    new CylinderGeometry(0.205, 0.172, chest, 14, 9, true)
      .scale(1, 1, 0.62)
      .translate(0, BODY.waist + chest / 2, 0),
  );
  uc(
    new SphereGeometry(0.205, 14, 5, 0, Math.PI * 2, 0, Math.PI / 2)
      .scale(1, 0.38, 0.62)
      .translate(0, BODY.shoulderY + 0.03, 0),
  );
  // Plain dark belt, no buckle.
  us(
    new CylinderGeometry(0.176, 0.176, 0.045, 14)
      .scale(1, 1, 0.68)
      .translate(0, BODY.waist, 0),
    PALETTE.guardBoot,
  );
  // Neck, faceless head, short dark hair at the back, beret drooping to one side.
  us(
    new CylinderGeometry(0.052, 0.058, BODY.neckTop - BODY.shoulderY, 10).translate(
      0,
      (BODY.neckTop + BODY.shoulderY) / 2,
      0,
    ),
    PALETTE.guardSkin,
  );
  us(ball(v(0, BODY.headY, 0), BODY.headR, [0.9, 1.08, 1]), PALETTE.guardSkin);
  us(
    new SphereGeometry(BODY.headR + 0.004, 12, 6, Math.PI * 0.15, Math.PI * 0.7, 0, Math.PI * 0.62)
      .scale(0.9, 1.08, 1)
      .rotateY(Math.PI)
      .translate(0, BODY.headY, -0.004),
    PALETTE.guardHair,
  );
  us(
    new SphereGeometry(0.118, 14, 6)
      .scale(1, 0.34, 1.04)
      .rotateZ(-0.22)
      .translate(-0.022, BODY.headY + 0.085, -0.01),
    beret === "red" ? PALETTE.beretRed : PALETTE.beretBlack,
  );

  // Arms. At ease: hands clasped at the small of the back (photo 82).
  for (const side of [-1, 1]) {
    const sh = v(side * BODY.shoulderHalf, BODY.shoulderY, -0.01);
    let elbow: Vector3;
    let wrist: Vector3;
    let palm: Vector3;
    if (side === -1 && pose.rightHand) {
      // Reaching arm: solved in the leaned frame the shoulder ends up in.
      const target = pose.rightHand.clone().applyMatrix4(leanInv);
      const lower = BODY.forearm + BODY.hand;
      // Reaching down and out to his side, the elbow turned out.
      const pole = (pose.rightElbowPole ?? v(-1, 0.2, 0.1))
        .clone()
        .transformDirection(leanInv);
      elbow = elbowFor(sh, target, BODY.upperArm, lower, pole);
      const dir = target.clone().sub(elbow).normalize();
      wrist = elbow.clone().addScaledVector(dir, BODY.forearm);
      palm = elbow.clone().addScaledVector(dir, lower);
      rightArm.push(
        ...[sh, elbow, wrist, palm].map((p) => p.clone().applyMatrix4(leanM)),
      );
    } else if (side === 1 && pose.leftAtSide) {
      elbow = v(side * 0.235, 1.13, -0.02);
      wrist = v(side * 0.25, 0.87, 0.02);
      palm = v(side * 0.255, 0.8, 0.03);
    } else {
      elbow = v(side * 0.25, 1.15, -0.09);
      wrist = v(side * 0.07, 1.0, -0.17);
      palm = v(side * 0.03, 0.985, -0.185);
    }
    uc(ball(sh, 0.066));
    uc(limb(sh, elbow, 0.058, 0.048));
    uc(ball(elbow, 0.048));
    uc(limb(elbow, wrist, 0.048, 0.038));
    us(ball(palm, 0.048, [0.75, 1.15, 0.75]), PALETTE.guardSkin);
    palms.push(palm.applyMatrix4(leanM));
  }
  for (const p of upper) {
    p.geometry.applyMatrix4(leanM);
    (p.color === PALETTE.guardCamo ? camo : solid).push(p);
  }

  const spine = [
    v(0, ankleY, 0),
    v(0, BODY.hip, 0).applyMatrix4(leanM),
    v(0, BODY.headY, 0).applyMatrix4(leanM),
  ];
  return { camo, solid, palms, rightArm, spine };
}

/** Smooth 3-D value noise in [0, 1], deterministic. */
function hash(x: number, y: number, z: number): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function valueNoise(x: number, y: number, z: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const f = (t: number) => t * t * (3 - 2 * t);
  const fx = f(x - xi);
  const fy = f(y - yi);
  const fz = f(z - zi);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const corner = (dx: number, dy: number, dz: number) =>
    hash(xi + dx, yi + dy, zi + dz);
  return lerp(
    lerp(
      lerp(corner(0, 0, 0), corner(1, 0, 0), fx),
      lerp(corner(0, 1, 0), corner(1, 1, 0), fx),
      fy,
    ),
    lerp(
      lerp(corner(0, 0, 1), corner(1, 0, 1), fx),
      lerp(corner(0, 1, 1), corner(1, 1, 1), fx),
      fy,
    ),
    fz,
  );
}

/** Camouflage blotches about 10–15 cm across, in three flat tones. */
export function camoTone(x: number, y: number, z: number): string {
  const k = 1 / 0.11;
  const n =
    0.7 * valueNoise(x * k, y * k, z * k) +
    0.3 * valueNoise(x * k * 2.3 + 17, y * k * 2.3, z * k * 2.3);
  if (n < 0.38) return PALETTE.guardCamoDark;
  if (n > 0.64) return PALETTE.guardCamoLight;
  return PALETTE.guardCamo;
}

/** Recolours a merged, non-indexed geometry triangle by triangle from its world position. */
function camouflage(geometry: BufferGeometry): BufferGeometry {
  const pos = geometry.getAttribute("position");
  const col = geometry.getAttribute("color");
  const tone = new Color();
  for (let i = 0; i < pos.count; i += 3) {
    const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3;
    const cy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
    const cz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
    tone.set(camoTone(cx, cy, cz));
    for (let k = 0; k < 3; k++) col.setXYZ(i + k, tone.r, tone.g, tone.b);
  }
  col.needsUpdate = true;
  return geometry;
}

export interface GuardPlacement {
  id: "blackStone" | "yemeni" | "hijrGateIraqi" | "hijrGateShami";
  beret: Beret;
  /** Feet, in world metres. */
  position: Vector3;
  yawDeg: number;
  pose: Pose;
}

/** Centre of the strap's ring, in world metres, standing out from the door wall. */
export function strapRingCentre(): Vector3 {
  const { along, ringY, ringRadius } = GUARDS.strap;
  return new Vector3(-HALF_X + along, ringY, HALF_Z + ringRadius + 0.012);
}

/** Half the gap between the folded strap's two strands, and its thickness. */
const STRAND_HALF = 0.028;
export const STRAP_RADIUS = 0.026;

/** Centre of the strap's cloth where it hangs flat on the wall. */
const STRAP_WALL_Z = HALF_Z + STRAP_RADIUS + 0.01;
/** Half the palm's thickness: it closes a few millimetres into the cloth it grips. */
const PALM_HALF = 0.036;

/**
 * Middle of the Black Stone guard's palm, in world metres: closed on the
 * strap's bottom end from the front, an ordinary grip (photo 91).
 */
export function strapGripPoint(): Vector3 {
  const { along, handY } = GUARDS.strap;
  return new Vector3(
    -HALF_X + along,
    handY,
    STRAP_WALL_Z + STRAP_RADIUS + PALM_HALF - 0.008,
  );
}

/**
 * Centre line of the folded strap (photos 89, 91, 94): one closed loop over
 * the bottom of the ring, its two strands hanging side by side flat on the
 * wall down to the fold at its bottom end, where the guard holds it.
 */
export function strapCurve(): CatmullRomCurve3 {
  const { bottomY, ringRadius } = GUARDS.strap;
  const ring = strapRingCentre();
  const x = ring.x;
  // Centre of the cloth where it lies over the ring's bottom bar.
  const top = ring.y - ringRadius + 0.009 + STRAP_RADIUS;
  const z = STRAP_WALL_Z;
  const strand = (s: 1 | -1) => [
    new Vector3(x + s * 0.012, top - 0.02, ring.z),
    new Vector3(x + s * STRAND_HALF, top - 0.2, z + 0.01),
    new Vector3(x + s * STRAND_HALF, (top + bottomY) / 2, z),
    new Vector3(x + s * STRAND_HALF, bottomY + 0.08, z),
    new Vector3(x + s * 0.018, bottomY + 0.015, z),
  ];
  return new CatmullRomCurve3(
    [
      new Vector3(x, top, ring.z),
      ...strand(1),
      // The fold at the bottom end.
      new Vector3(x, bottomY, z),
      ...strand(-1).reverse(),
    ],
    true,
  );
}

/** The folded black cloth strap. Matte cloth, so it joins the guards' mesh. */
export function strapParts(): Part[] {
  const tube = new TubeGeometry(strapCurve(), 120, STRAP_RADIUS, 6, true);
  return [{ geometry: tube, color: PALETTE.guardStrap }];
}

/**
 * The small metal ring the strap hangs from, above the guard's head, and the
 * staple holding it to the wall. Merged with the other metal.
 */
export function strapRingParts(): Part[] {
  const { ringRadius } = GUARDS.strap;
  const c = strapRingCentre();
  // Ring plane holds the wall's normal and the vertical, like the shadharwan's rings.
  const ring = new TorusGeometry(ringRadius, 0.009, 8, 20).rotateY(
    Math.PI / 2,
  );
  return [
    part(ring, PALETTE.silver, { position: [c.x, c.y, c.z] }),
    part(new BoxGeometry(0.04, 0.03, 0.02), PALETTE.silver, {
      position: [c.x, c.y + ringRadius, HALF_Z + 0.01],
    }),
  ];
}

function placementMatrix(position: Vector3, yawDeg: number): Matrix4 {
  return new Matrix4()
    .makeRotationY(yawDeg * DEG)
    .setPosition(position.x, position.y, position.z);
}

export function guardPlacements(): GuardPlacement[] {
  const bs = GUARDS.blackStone;
  const bsAt = new Vector3(-HALF_X + bs.along, GUARDS.step.height, HALF_Z + bs.out);
  const toLocal = placementMatrix(bsAt, bs.yawDeg).invert();

  const ye = GUARDS.yemeni;
  // Gates: on the mataf side of each, beside the post at the Hijr wall's end.
  const gateZ = Math.abs(hijrPoint(HIJR.arcHalfAngleDeg * DEG)[1]);
  const gz = gateZ + GUARDS.hijrGate.out;

  return [
    {
      id: "blackStone",
      beret: "red",
      position: bsAt,
      yawDeg: bs.yawDeg,
      pose: {
        stanceHalf: 0.13,
        leanDeg: bs.leanDeg,
        leanToward: new Vector3(...bs.leanToward).transformDirection(toLocal),
        rightHand: strapGripPoint().applyMatrix4(toLocal),
        rightElbowPole: new Vector3(...bs.elbowPole).transformDirection(toLocal),
        leftAtSide: true,
      },
    },
    {
      id: "yemeni",
      beret: "black",
      position: new Vector3(-HALF_X - ye.out, 0, -HALF_Z + ye.along),
      yawDeg: ye.yawDeg,
      pose: AT_EASE,
    },
    {
      id: "hijrGateIraqi",
      beret: "black",
      position: new Vector3(GUARDS.hijrGate.x, 0, gz),
      yawDeg: 0,
      pose: AT_EASE,
    },
    {
      id: "hijrGateShami",
      beret: "black",
      position: new Vector3(GUARDS.hijrGate.x, 0, -gz),
      yawDeg: 180,
      pose: AT_EASE,
    },
  ];
}

/** One guard's parts moved to its place in the world; key points in world metres. */
export function placedGuardParts(g: GuardPlacement): GuardBody {
  const m = placementMatrix(g.position, g.yawDeg);
  const parts = guardParts(g.beret, g.pose);
  for (const p of [...parts.camo, ...parts.solid]) p.geometry.applyMatrix4(m);
  const place = (points: Vector3[]) => points.map((p) => p.applyMatrix4(m));
  return {
    ...parts,
    palms: place(parts.palms),
    rightArm: place(parts.rightArm),
    spine: place(parts.spine),
  };
}

/** All four guards, placed, and the strap, as one geometry with vertex colours. */
export function createGuardsGeometry(): BufferGeometry {
  const camo: Part[] = [];
  const solid: Part[] = strapParts();
  for (const g of guardPlacements()) {
    const parts = placedGuardParts(g);
    camo.push(...parts.camo);
    solid.push(...parts.solid);
  }
  const camoGeometry = camouflage(mergeParts(camo));
  const solidGeometry = mergeParts(solid);
  const merged = mergeGeometries([camoGeometry, solidGeometry], false);
  camoGeometry.dispose();
  solidGeometry.dispose();
  if (!merged) throw new Error("Guard parts cannot be merged");
  return merged;
}

/**
 * The marble step the Black Stone guard stands on: behind the marble block
 * on its door side, against the wall (photo 79). Merged with the other
 * marble, so it costs no draw call.
 */
export function guardStepParts(): Part[] {
  const st = GUARDS.step;
  const x = -HALF_X + st.from + st.width / 2;
  const body = st.height - st.cap;
  return [
    part(new BoxGeometry(st.width, body, st.depth), PALETTE.marble, {
      position: [x, body / 2, HALF_Z + st.depth / 2],
    }),
    part(
      new BoxGeometry(st.width, st.cap, st.depth + 0.02),
      PALETTE.marbleCap,
      { position: [x, body + st.cap / 2, HALF_Z + (st.depth + 0.02) / 2] },
    ),
  ];
}
