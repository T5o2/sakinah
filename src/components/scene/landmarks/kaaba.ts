import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Matrix4,
  Path,
  Quaternion,
  Shape,
  LatheGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { HALF_X, HALF_Z, KAABA } from "../lib/layout";
import { PALETTE } from "../lib/palette";
import { part, type Part } from "../lib/parts";

/**
 * The Kaaba, built from:
 * - one kiswa mesh: the four walls (floor to parapet top), the raised belt,
 *   the raised door, the raised curtain and the cloth wrapped over the
 *   parapet, all sampling one painted atlas (see kiswaAtlas.ts);
 * - small solid parts (shadharwan and its rings, parapet, roof, roof hatch,
 *   Black Stone boss and frame, marble block, mizab) merged with the other
 *   landmarks by material.
 */

export type WallId = "door" | "hijr" | "southWest" | "southEast";

export interface AtlasRect {
  u0: number;
  u1: number;
  v0: number;
  v1: number;
}

/** Each wall owns a quarter of the atlas, so every corner can carry its own ornament. */
export const KISWA_ATLAS: Record<WallId, AtlasRect> = {
  door: { u0: 0, u1: 0.5, v0: 0.5, v1: 1 },
  hijr: { u0: 0.5, u1: 1, v0: 0.5, v1: 1 },
  southWest: { u0: 0, u1: 0.5, v0: 0, v1: 0.5 },
  southEast: { u0: 0.5, u1: 1, v0: 0, v1: 0.5 },
};

/** The kiswa walls run from the floor to the top of the parapet it wraps. */
export const KISWA_Y0 = 0;
export const KISWA_Y1 = KAABA.height;

export const BELT_BOTTOM = KAABA.beltY - KAABA.beltHeight / 2;
export const BELT_TOP = KAABA.beltY + KAABA.beltHeight / 2;
export const SITARA_TOP = BELT_BOTTOM - KAABA.sitara.gapBelowBelt;
export const SITARA_HEM = KAABA.door.bottom + KAABA.sitara.hemAboveDoor;
/** Apex of the inverted V at the curtain's hem. */
export const SITARA_APEX =
  SITARA_HEM + (SITARA_TOP - SITARA_HEM) * KAABA.sitara.openingFraction;

/** Door leaf centre along the door wall, in world x. */
export const DOOR_CENTER_X = -HALF_X + KAABA.door.fromBlackStoneCorner;

export interface Wall {
  id: WallId;
  /** Left and right ends as seen from outside, (x, z). */
  from: [number, number];
  to: [number, number];
  normal: [number, number, number];
  length: number;
}

export const WALLS: Wall[] = [
  // North-east: the door wall. Black Stone corner on the left, Iraqi on the right.
  {
    id: "door",
    from: [-HALF_X, HALF_Z],
    to: [HALF_X, HALF_Z],
    normal: [0, 0, 1],
    length: KAABA.sizeX,
  },
  // North-west: faces Hijr Ismail. Iraqi corner on the left, Shami on the right.
  {
    id: "hijr",
    from: [HALF_X, HALF_Z],
    to: [HALF_X, -HALF_Z],
    normal: [1, 0, 0],
    length: KAABA.sizeZ,
  },
  // South-west. Shami corner on the left, Yemeni on the right.
  {
    id: "southWest",
    from: [HALF_X, -HALF_Z],
    to: [-HALF_X, -HALF_Z],
    normal: [0, 0, -1],
    length: KAABA.sizeX,
  },
  // South-east. Yemeni corner on the left, Black Stone on the right.
  {
    id: "southEast",
    from: [-HALF_X, -HALF_Z],
    to: [-HALF_X, HALF_Z],
    normal: [-1, 0, 0],
    length: KAABA.sizeZ,
  },
];

export const wallById = (id: WallId) => WALLS.find((w) => w.id === id) as Wall;

/** Atlas UV for a point `x` metres along `wall` at height `y`. */
export function atlasUv(wall: Wall, x: number, y: number): [number, number] {
  const r = KISWA_ATLAS[wall.id];
  return [
    r.u0 + ((r.u1 - r.u0) * x) / wall.length,
    r.v0 + ((r.v1 - r.v0) * (y - KISWA_Y0)) / (KISWA_Y1 - KISWA_Y0),
  ];
}

/** World frame of a wall: origin at its left end, x along it, y up, z out of it. */
function wallMatrix(wall: Wall): Matrix4 {
  const dir = new Vector3(
    wall.to[0] - wall.from[0],
    0,
    wall.to[1] - wall.from[1],
  ).normalize();
  // along × up = out, so the basis is right-handed and faces keep their winding.
  return new Matrix4()
    .makeBasis(dir, new Vector3(0, 1, 0), new Vector3(...wall.normal))
    .setPosition(wall.from[0], 0, wall.from[1]);
}

/**
 * Places a piece built in a wall's own frame (x along the wall, y up, z out
 * of it) into the world, with every vertex sampling the atlas at its own wall
 * position — so edges take the colour of whatever is painted at the border.
 */
function onWall(wall: Wall, geometry: BufferGeometry): BufferGeometry {
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  if (flat !== geometry) geometry.dispose();
  const pos = flat.getAttribute("position");
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const [u, v] = atlasUv(wall, pos.getX(i), pos.getY(i));
    uv[i * 2] = u;
    uv[i * 2 + 1] = v;
  }
  flat.setAttribute("uv", new BufferAttribute(uv, 2));
  flat.clearGroups();
  return flat.applyMatrix4(wallMatrix(wall));
}

/** Gives every vertex the same atlas UV (a flat patch of one surface). */
function solidUv(geometry: BufferGeometry, uv: [number, number]) {
  const attr = geometry.getAttribute("uv") as BufferAttribute;
  for (let i = 0; i < attr.count; i++) attr.setXY(i, uv[0], uv[1]);
  return geometry;
}

/** A slab in wall coordinates, standing `depth` off the wall; `extend` lengthens both ends. */
function slab(
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  depth: number,
  extend = 0,
) {
  const g = new BoxGeometry(x1 - x0 + 2 * extend, y1 - y0, depth);
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, depth / 2);
  return g;
}

/** The curtain outline: a panel with an inverted-V opening at the hem. */
function sitaraShape(): Shape {
  const { door, sitara } = KAABA;
  const cx = door.fromBlackStoneCorner;
  const x0 = cx - sitara.width / 2;
  const x1 = cx + sitara.width / 2;
  const shape = new Shape();
  shape.moveTo(x0, SITARA_HEM);
  shape.lineTo(cx - door.width / 2, SITARA_HEM);
  shape.lineTo(cx, SITARA_APEX);
  shape.lineTo(cx + door.width / 2, SITARA_HEM);
  shape.lineTo(x1, SITARA_HEM);
  shape.lineTo(x1, SITARA_TOP);
  shape.lineTo(x0, SITARA_TOP);
  shape.closePath();
  return shape;
}

/** Everything that samples the kiswa atlas, in one geometry (one draw call). */
export function createKiswaGeometry(): BufferGeometry {
  const pieces: BufferGeometry[] = [];
  const t = KAABA.rimThickness;

  for (const wall of WALLS) {
    const L = wall.length;
    // The wall itself, floor to parapet top.
    const face = new BufferGeometry();
    face.setAttribute(
      "position",
      new BufferAttribute(
        new Float32Array([
          0,
          KISWA_Y0,
          0,
          L,
          KISWA_Y0,
          0,
          L,
          KISWA_Y1,
          0,
          0,
          KISWA_Y0,
          0,
          L,
          KISWA_Y1,
          0,
          0,
          KISWA_Y1,
          0,
        ]),
        3,
      ),
    );
    face.setAttribute(
      "normal",
      new BufferAttribute(
        new Float32Array([
          0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        ]),
        3,
      ),
    );
    pieces.push(onWall(wall, face));

    // Raised belt, wrapping round the corners.
    pieces.push(
      onWall(
        wall,
        slab(0, L, BELT_BOTTOM, BELT_TOP, KAABA.reliefDepth, KAABA.reliefDepth),
      ),
    );

    // Kiswa cloth over the parapet top. It sits clear above the parapet and
    // stops short of its inner face, so no two surfaces share a plane (that
    // z-fighting is what made the rim shimmer while orbiting).
    const fabric = atlasUv(wall, L / 2, KISWA_Y1 - 0.25);
    const capDepth = t - 0.02;
    const top = new BoxGeometry(L + 0.06, 0.05, capDepth + 0.03);
    top.translate(L / 2, KISWA_Y1 + 0.025, 0.03 - (capDepth + 0.03) / 2);
    pieces.push(solidUv(onWall(wall, top), fabric));
  }

  // The gold door and, in front of it, the curtain with its inverted-V opening.
  const doorWall = wallById("door");
  const { door, sitara } = KAABA;
  const cx = door.fromBlackStoneCorner;
  pieces.push(
    onWall(
      doorWall,
      slab(
        cx - door.width / 2,
        cx + door.width / 2,
        door.bottom,
        door.bottom + door.height,
        door.standOff,
      ),
    ),
  );
  pieces.push(
    onWall(
      doorWall,
      new ExtrudeGeometry(sitaraShape(), {
        depth: sitara.standOff,
        bevelEnabled: false,
      }),
    ),
  );

  for (const p of pieces) {
    for (const name of Object.keys(p.attributes)) {
      if (!["position", "normal", "uv"].includes(name)) p.deleteAttribute(name);
    }
  }
  const merged = mergeGeometries(pieces, false);
  for (const p of pieces) p.dispose();
  if (!merged) throw new Error("Kiswa geometry could not be merged");
  return merged;
}

/** Sloped marble shadharwan along one wall segment (wall metres x0..x1). */
function shadharwan(wall: Wall, x0: number, x1: number): Part {
  const { baseHeight: h, baseOutset: o } = KAABA;
  // Cross-section in (out, up), extruded along +z.
  const profile = new Shape();
  profile.moveTo(0, 0);
  profile.lineTo(o, 0);
  profile.lineTo(o, 0.05);
  profile.lineTo(0.06, h);
  profile.lineTo(0, h);
  profile.closePath();
  const g = new ExtrudeGeometry(profile, {
    depth: x1 - x0,
    bevelEnabled: false,
  });
  // (out, up, along) → wall frame (x along, y up, z out). Mapping extrusion to
  // −x keeps the basis right-handed; shift so it spans x0..x1.
  g.applyMatrix4(
    new Matrix4().makeBasis(
      new Vector3(0, 0, 1),
      new Vector3(0, 1, 0),
      new Vector3(-1, 0, 0),
    ),
  );
  g.translate(x1, 0, 0);
  g.applyMatrix4(wallMatrix(wall));
  return { geometry: g, color: PALETTE.marble };
}

/** Gold tie rings standing on a shadharwan segment, one every `step` metres. */
function tieRings(wall: Wall, x0: number, x1: number, step = 1.4): Part[] {
  const rings: Part[] = [];
  const m = wallMatrix(wall);
  const q = new Quaternion().setFromRotationMatrix(m);
  const count = Math.max(1, Math.round((x1 - x0) / step));
  for (let i = 0; i < count; i++) {
    const x = x0 + ((i + 0.5) * (x1 - x0)) / count;
    const p = new Vector3(x, KAABA.baseHeight - 0.01, 0.14).applyMatrix4(m);
    const g = new TorusGeometry(0.075, 0.016, 6, 14);
    // Ring plane holds the wall's normal and the vertical: it stands out from the wall.
    g.rotateY(Math.PI / 2);
    g.applyQuaternion(q);
    g.translate(p.x, p.y, p.z);
    rings.push({ geometry: g, color: PALETTE.gold });
  }
  return rings;
}

/**
 * The Black Stone: a rounded mass of dark stone bulging out of the east
 * corner, with the silver frame — rounded above, pointed below, open in the
 * middle — curved round it so it sits on the stone instead of floating.
 */
function blackStone(): { frame: Part; stone: Part; boss: Part } {
  const { radius: R, inset, bottom, top } = KAABA.blackStoneBoss;
  const out = new Vector3(-1, 0, 1).normalize();
  const axis = new Vector3(-HALF_X, 0, HALF_Z).addScaledVector(out, -inset);

  // Boss: a lathe with rounded ends.
  const e = 0.18;
  const profile = [
    new Vector2(0, bottom),
    new Vector2(R * 0.7, bottom + 0.02),
    new Vector2(R, bottom + e),
    new Vector2(R, top - e),
    new Vector2(R * 0.7, top - 0.02),
    new Vector2(0, top),
  ];
  const boss = new LatheGeometry(profile, 28);
  boss.translate(axis.x, 0, axis.z);

  const w = 0.38;
  const outline = new Shape();
  outline.moveTo(0, -0.52);
  outline.quadraticCurveTo(w, -0.3, w, 0.02);
  outline.absarc(0, 0.02, w, 0, Math.PI, false);
  outline.quadraticCurveTo(-w, -0.3, 0, -0.52);
  const hole = new Path();
  hole.absarc(0, 0.04, 0.15, 0, Math.PI * 2, true);
  outline.holes.push(hole);
  const frame = new ExtrudeGeometry(outline, {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.035,
    bevelSegments: 3,
    curveSegments: 18,
  });
  frame.translate(0, 0, 0.03);
  const stone = new CircleGeometry(0.15, 20);
  stone.translate(0, 0.04, 0.02);

  // Wrap both round the boss: x along the surface becomes an angle, z is height off it.
  const wrap = (g: BufferGeometry) => {
    const pos = g.getAttribute("position");
    const nrm = g.getAttribute("normal");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const th = x / R;
      const c = Math.cos(th);
      const sn = Math.sin(th);
      pos.setXYZ(i, (R + z) * sn, pos.getY(i), (R + z) * c);
      // Bending is a rotation by th about y at each point: turn the normal
      // with it, keeping the faces smooth instead of re-deriving facets.
      const nx = nrm.getX(i);
      const nz = nrm.getZ(i);
      nrm.setXYZ(i, nx * c + nz * sn, nrm.getY(i), -nx * sn + nz * c);
    }
    pos.needsUpdate = true;
    nrm.needsUpdate = true;
    // Local +Z (the outward diagonal) → world `out`; origin → boss axis.
    g.applyMatrix4(
      new Matrix4()
        .makeRotationY(-Math.PI / 4)
        .setPosition(axis.x, KAABA.blackStoneHeight, axis.z),
    );
    return g;
  };

  return {
    frame: { geometry: wrap(frame), color: PALETTE.silver },
    stone: { geometry: wrap(stone), color: PALETTE.blackStone },
    boss: { geometry: boss, color: PALETTE.stoneBoss },
  };
}

export function kaabaParts(): { matte: Part[]; metal: Part[]; silver: Part[] } {
  const matte: Part[] = [];
  const metal: Part[] = [];
  /** Polished silver has its own brighter material (see HaramLandmarks). */
  const silver: Part[] = [];

  // Shadharwan: along the two southern walls and along the door wall after
  // the door. None on the Hijr side, and none from the marble block beside the
  // Black Stone to the far edge of the door: there the wall stones run down
  // to the floor.
  const doorWall = wallById("door");
  const { door, baseOutset: o } = KAABA;
  const doorX1 = door.fromBlackStoneCorner + door.width / 2;
  const segments: [Wall, number, number][] = [
    [doorWall, doorX1, doorWall.length],
    [wallById("southWest"), 0, KAABA.sizeX],
    [wallById("southEast"), 0, KAABA.sizeZ],
  ];
  for (const [wall, x0, x1] of segments) {
    matte.push(shadharwan(wall, x0, x1));
    metal.push(
      ...tieRings(wall, Math.max(x0, 0.3), Math.min(x1, wall.length - 0.3)),
    );
  }
  // Convex hip where two runs meet at the Yemeni corner: a square frustum
  // whose faces share the runs' slope.
  for (const z of [-HALF_Z]) {
    matte.push(
      part(
        new CylinderGeometry(
          0.06 * Math.SQRT2,
          o * Math.SQRT2,
          KAABA.baseHeight,
          4,
          1,
        ),
        PALETTE.marble,
        {
          position: [-HALF_X, KAABA.baseHeight / 2, z],
          rotation: [0, Math.PI / 4, 0],
        },
      ),
    );
  }

  // Parapet round the roof: white on its inner face (the kiswa wraps the rest).
  const r = KAABA.rimHeight;
  const t = KAABA.rimThickness;
  const rimY = KAABA.height - r / 2;
  const inset = 0.03;
  matte.push(
    part(new BoxGeometry(KAABA.sizeX - 2 * inset, r, t), PALETTE.marbleCap, {
      position: [0, rimY, HALF_Z - t / 2 - inset],
    }),
    part(new BoxGeometry(KAABA.sizeX - 2 * inset, r, t), PALETTE.marbleCap, {
      position: [0, rimY, -HALF_Z + t / 2 + inset],
    }),
    part(new BoxGeometry(t, r, KAABA.sizeZ - 2 * t), PALETTE.marbleCap, {
      position: [HALF_X - t / 2 - inset, rimY, 0],
    }),
    part(new BoxGeometry(t, r, KAABA.sizeZ - 2 * t), PALETTE.marbleCap, {
      position: [-HALF_X + t / 2 + inset, rimY, 0],
    }),
  );
  // Roof floor: pale grey-white tiles.
  const roofY = KAABA.height - r;
  matte.push(
    part(
      new BoxGeometry(KAABA.sizeX - 2 * t, 0.1, KAABA.sizeZ - 2 * t),
      PALETTE.roof,
      {
        position: [0, roofY + 0.05, 0],
      },
    ),
  );

  // Flat hatch in the Iraqi corner of the roof, barely raised: a pale frame
  // with two panes.
  const hatch = KAABA.roofHatch;
  const hx = HALF_X - t - hatch.depth / 2 - 0.1;
  const hz = HALF_Z - t - hatch.length / 2 - 0.1;
  const hy = roofY + 0.1 + hatch.height / 2;
  matte.push(
    part(
      new BoxGeometry(hatch.depth, hatch.height, hatch.length),
      PALETTE.roofBox,
      {
        position: [hx, hy, hz],
      },
    ),
  );
  for (const dz of [-hatch.length / 4, hatch.length / 4]) {
    matte.push(
      part(
        new BoxGeometry(hatch.depth - 0.2, 0.02, hatch.length / 2 - 0.2),
        PALETTE.roof,
        { position: [hx, hy + hatch.height / 2 + 0.005, hz + dz] },
      ),
    );
  }

  // Black Stone: the stone boss, the silver frame round it, the stone within.
  const bs = blackStone();
  silver.push(bs.frame);
  matte.push(bs.stone, bs.boss);

  // Upright white marble block beside the Black Stone, against the door wall.
  const mb = KAABA.marbleBlock;
  const mbX = -HALF_X + mb.from + mb.width / 2;
  matte.push(
    part(new BoxGeometry(mb.width, mb.height, mb.depth), PALETTE.marble, {
      position: [mbX, mb.height / 2, HALF_Z + mb.depth / 2],
    }),
    part(
      new BoxGeometry(mb.width + 0.06, mb.cap, mb.depth + 0.06),
      PALETTE.marbleCap,
      { position: [mbX, mb.height + mb.cap / 2, HALF_Z + mb.depth / 2] },
    ),
  );

  // Mizab: gold waterspout over Hijr Ismail, leaving the roof through the parapet.
  const mizabX = HALF_X + 0.45;
  const mizabY = roofY + 0.25;
  metal.push(
    part(new BoxGeometry(1.9, 0.08, 0.34), PALETTE.gold, {
      position: [mizabX, mizabY, 0],
    }),
    part(new BoxGeometry(1.9, 0.2, 0.05), PALETTE.gold, {
      position: [mizabX, mizabY + 0.1, 0.15],
    }),
    part(new BoxGeometry(1.9, 0.2, 0.05), PALETTE.gold, {
      position: [mizabX, mizabY + 0.1, -0.15],
    }),
  );

  // Gold rings under the black frame round the stone showing at the Yemeni corner.
  metal.push(
    ...tieRings(
      wallById("southWest"),
      KAABA.sizeX - 0.7,
      KAABA.sizeX - 0.1,
      0.3,
    ),
    ...tieRings(wallById("southEast"), 0.1, 0.7, 0.3),
  );

  return { matte, metal, silver };
}
