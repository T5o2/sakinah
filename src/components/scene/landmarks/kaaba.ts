import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Shape,
  TorusGeometry,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { HALF_X, HALF_Z, KAABA } from "../lib/layout";
import { PALETTE } from "../lib/palette";
import { part, type Part } from "../lib/parts";

/**
 * The Kaaba, built from:
 * - one kiswa mesh: the four walls, the raised embroidered belt and the raised
 *   door curtain, all sampling one painted atlas (see kiswaAtlas.ts) that holds
 *   the exposed wall stones, the white Hajj cloth, the woven black kiswa and
 *   every gold ornament;
 * - small solid parts (marble base, white roof rim, marble roof, Black Stone
 *   frame, mizab) merged with the other landmarks by material.
 */

/** Where each wall lives in the kiswa atlas (u ranges; v spans the wall height). */
export const KISWA_ATLAS = {
  doorWall: [0, 0.5] as const,
  otherWalls: [0.5, 1] as const,
} as const;

/** Heights covered by the kiswa walls: above the marble base, below the roof rim. */
export const KISWA_Y0 = KAABA.baseHeight;
export const KISWA_Y1 = KAABA.height - KAABA.rimHeight;

export const BELT_BOTTOM = KAABA.beltY - KAABA.beltHeight / 2;
export const BELT_TOP = KAABA.beltY + KAABA.beltHeight / 2;
/** The door curtain stops just under the belt. */
export const SITARA_TOP = BELT_BOTTOM - 0.06;

/** Door leaf centre along the door wall, in world x. */
export const DOOR_CENTER_X = -HALF_X + KAABA.door.fromBlackStoneCorner;

interface Wall {
  /** Left and right ends as seen from outside, (x, z). */
  from: [number, number];
  to: [number, number];
  normal: [number, number, number];
  u: readonly [number, number];
}

const WALLS: Wall[] = [
  // North-east: the door wall. Black Stone corner on the left.
  {
    from: [-HALF_X, HALF_Z],
    to: [HALF_X, HALF_Z],
    normal: [0, 0, 1],
    u: KISWA_ATLAS.doorWall,
  },
  // North-west: faces Hijr Ismail.
  {
    from: [HALF_X, HALF_Z],
    to: [HALF_X, -HALF_Z],
    normal: [1, 0, 0],
    u: KISWA_ATLAS.otherWalls,
  },
  // South-west.
  {
    from: [HALF_X, -HALF_Z],
    to: [-HALF_X, -HALF_Z],
    normal: [0, 0, -1],
    u: KISWA_ATLAS.otherWalls,
  },
  // South-east.
  {
    from: [-HALF_X, -HALF_Z],
    to: [-HALF_X, HALF_Z],
    normal: [-1, 0, 0],
    u: KISWA_ATLAS.otherWalls,
  },
];

const vOf = (y: number) => (y - KISWA_Y0) / (KISWA_Y1 - KISWA_Y0);

class QuadBuilder {
  positions: number[] = [];
  normals: number[] = [];
  uvs: number[] = [];
  indices: number[] = [];

  /** Corners bottom-left, bottom-right, top-right, top-left as seen from the front. */
  quad(corners: number[][], normal: number[], uvs: number[][]) {
    const base = this.positions.length / 3;
    corners.forEach((c, i) => {
      this.positions.push(...c);
      this.normals.push(...normal);
      this.uvs.push(...(uvs[i] as number[]));
    });
    this.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }

  build(): BufferGeometry {
    const g = new BufferGeometry();
    g.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(this.positions), 3),
    );
    g.setAttribute(
      "normal",
      new BufferAttribute(new Float32Array(this.normals), 3),
    );
    g.setAttribute("uv", new BufferAttribute(new Float32Array(this.uvs), 2));
    g.setIndex(this.indices);
    return g;
  }
}

/**
 * A panel standing `depth` off a wall, spanning wall coordinate s0..s1 (0–1
 * along the wall) and heights y0..y1, with thin edge strips so it reads as
 * raised. `extend` lengthens it past the wall ends (the belt wraps corners).
 */
function raisedPanel(
  b: QuadBuilder,
  wall: Wall,
  s0: number,
  s1: number,
  y0: number,
  y1: number,
  depth: number,
  extend = 0,
) {
  const [nx, , nz] = wall.normal;
  const dx = wall.to[0] - wall.from[0];
  const dz = wall.to[1] - wall.from[1];
  const len = Math.hypot(dx, dz);
  const ux = dx / len;
  const uz = dz / len;
  const point = (s: number, grow: number, y: number, off: number) => [
    wall.from[0] + ux * (s * len + grow) + nx * off,
    y,
    wall.from[1] + uz * (s * len + grow) + nz * off,
  ];
  const [u0, u1] = wall.u;
  const u = (s: number) => u0 + (u1 - u0) * s;
  const e0 = s0 === 0 ? -extend : 0;
  const e1 = s1 === 1 ? extend : 0;

  // Face.
  b.quad(
    [
      point(s0, e0, y0, depth),
      point(s1, e1, y0, depth),
      point(s1, e1, y1, depth),
      point(s0, e0, y1, depth),
    ],
    wall.normal,
    [
      [u(s0), vOf(y0)],
      [u(s1), vOf(y0)],
      [u(s1), vOf(y1)],
      [u(s0), vOf(y1)],
    ],
  );
  // Top and bottom lips sample the panel's own edge rows.
  const topV = vOf(y1) - 0.002;
  const botV = vOf(y0) + 0.002;
  b.quad(
    [
      point(s0, e0, y1, depth),
      point(s1, e1, y1, depth),
      point(s1, e1, y1, 0),
      point(s0, e0, y1, 0),
    ],
    [0, 1, 0],
    [
      [u(s0), topV],
      [u(s1), topV],
      [u(s1), topV],
      [u(s0), topV],
    ],
  );
  b.quad(
    [
      point(s0, e0, y0, 0),
      point(s1, e1, y0, 0),
      point(s1, e1, y0, depth),
      point(s0, e0, y0, depth),
    ],
    [0, -1, 0],
    [
      [u(s0), botV],
      [u(s1), botV],
      [u(s1), botV],
      [u(s0), botV],
    ],
  );
  if (extend === 0) {
    // Side edges (the belt has none: it wraps round the corners).
    const side = (s: number, sign: number) => {
      const uu = u(s) + sign * 0.001;
      const a = point(s, 0, y0, 0);
      const c = point(s, 0, y0, depth);
      const d = point(s, 0, y1, depth);
      const f = point(s, 0, y1, 0);
      const n = [ux * sign, 0, uz * sign];
      const corners = sign > 0 ? [c, a, f, d] : [a, c, d, f];
      b.quad(corners, n, [
        [uu, vOf(y0)],
        [uu, vOf(y0)],
        [uu, vOf(y1)],
        [uu, vOf(y1)],
      ]);
    };
    side(s0, -1);
    side(s1, 1);
  }
}

/** Walls, the raised belt round all four walls, and the raised door curtain. */
export function createKiswaGeometry(): BufferGeometry {
  const b = new QuadBuilder();

  for (const wall of WALLS) {
    const [u0, u1] = wall.u;
    b.quad(
      [
        [wall.from[0], KISWA_Y0, wall.from[1]],
        [wall.to[0], KISWA_Y0, wall.to[1]],
        [wall.to[0], KISWA_Y1, wall.to[1]],
        [wall.from[0], KISWA_Y1, wall.from[1]],
      ],
      wall.normal,
      [
        [u0, 0],
        [u1, 0],
        [u1, 1],
        [u0, 1],
      ],
    );
    raisedPanel(
      b,
      wall,
      0,
      1,
      BELT_BOTTOM,
      BELT_TOP,
      KAABA.reliefDepth,
      KAABA.reliefDepth,
    );
  }

  // The gold door: its own raised piece on the door wall.
  const doorWall = WALLS[0] as Wall;
  const { door } = KAABA;
  const centre = door.fromBlackStoneCorner / KAABA.sizeX;
  const halfDoor = door.width / 2 / KAABA.sizeX;
  raisedPanel(
    b,
    doorWall,
    centre - halfDoor,
    centre + halfDoor,
    door.bottom,
    door.bottom + door.height,
    door.standOff,
  );

  const walls = b.build().toNonIndexed();
  const merged = mergeGeometries([walls, createSitaraGeometry()], false);
  walls.dispose();
  if (!merged) throw new Error("Kiswa geometry could not be merged");
  return merged;
}

/**
 * The door curtain: a panel hung in front of the door from the belt, with an
 * inverted-V opening at the bottom — apex at the top of the door, as wide as
 * the door at the hem — through which the gold door shows.
 */
function createSitaraGeometry(): BufferGeometry {
  const { door, sitara } = KAABA;
  const cx = door.fromBlackStoneCorner;
  const x0 = cx - sitara.width / 2;
  const x1 = cx + sitara.width / 2;
  const apex = door.bottom + door.height;

  // Wall coordinates: x metres from the Black Stone corner, y up.
  const shape = new Shape();
  shape.moveTo(x0, sitara.bottom);
  shape.lineTo(cx - door.width / 2, sitara.bottom);
  shape.lineTo(cx, apex);
  shape.lineTo(cx + door.width / 2, sitara.bottom);
  shape.lineTo(x1, sitara.bottom);
  shape.lineTo(x1, SITARA_TOP);
  shape.lineTo(x0, SITARA_TOP);
  shape.closePath();

  const geometry = new ExtrudeGeometry(shape, {
    depth: sitara.standOff,
    bevelEnabled: false,
  });

  // Every vertex samples the atlas at its own wall position, so the edges
  // take the colour of the curtain's gold border.
  const pos = geometry.getAttribute("position");
  const uv = new Float32Array(pos.count * 2);
  const [u0, u1] = KISWA_ATLAS.doorWall;
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = u0 + ((u1 - u0) * pos.getX(i)) / KAABA.sizeX;
    uv[i * 2 + 1] = vOf(pos.getY(i));
  }
  geometry.setAttribute("uv", new BufferAttribute(uv, 2));
  geometry.clearGroups();
  // Door wall frame: x along the wall from the Black Stone corner, z out of it.
  geometry.translate(-HALF_X, 0, HALF_Z);
  return geometry;
}

export function kaabaParts(): { matte: Part[]; metal: Part[] } {
  // Shadharwan: a sloped marble plinth. A 4-sided cylinder turned 45° is a
  // square frustum; scaling it gives the rectangular footprint.
  const slope = KAABA.baseOutset / HALF_X;
  const base = part(
    new CylinderGeometry(
      Math.SQRT2,
      Math.SQRT2 * (1 + slope),
      KAABA.baseHeight,
      4,
      1,
    ),
    PALETTE.marble,
    {
      position: [0, KAABA.baseHeight / 2, 0],
      rotation: [0, Math.PI / 4, 0],
      scale: [HALF_X + 0.05, 1, HALF_Z + 0.05],
    },
  );

  // Low white parapet round the roof, and the pale marble roof inside it.
  const r = KAABA.rimHeight;
  const rimY = KAABA.height - r / 2;
  const t = KAABA.rimThickness;
  const rim = [
    part(new BoxGeometry(KAABA.sizeX + 0.04, r, t), PALETTE.marbleCap, {
      position: [0, rimY, HALF_Z - t / 2 + 0.02],
    }),
    part(new BoxGeometry(KAABA.sizeX + 0.04, r, t), PALETTE.marbleCap, {
      position: [0, rimY, -HALF_Z + t / 2 - 0.02],
    }),
    part(new BoxGeometry(t, r, KAABA.sizeZ - 2 * t + 0.04), PALETTE.marbleCap, {
      position: [HALF_X - t / 2 + 0.02, rimY, 0],
    }),
    part(new BoxGeometry(t, r, KAABA.sizeZ - 2 * t + 0.04), PALETTE.marbleCap, {
      position: [-HALF_X + t / 2 - 0.02, rimY, 0],
    }),
  ];
  const roof = part(
    new BoxGeometry(KAABA.sizeX - 2 * t, 0.1, KAABA.sizeZ - 2 * t),
    PALETTE.roof,
    {
      position: [0, KAABA.height - r + 0.05, 0],
    },
  );
  // A small raised square in the Iraqi corner of the roof.
  const hatch = KAABA.roofHatch;
  const hatchPart = part(
    new BoxGeometry(hatch.sizeX, hatch.height, hatch.sizeZ),
    PALETTE.marbleCap,
    {
      position: [
        HALF_X - t - hatch.sizeX / 2,
        KAABA.height - r + 0.1 + hatch.height / 2,
        HALF_Z - t - hatch.sizeZ / 2,
      ],
    },
  );

  // Black Stone: a dark stone inside an oval silver frame, set into the east corner.
  const cornerPos: [number, number, number] = [
    -HALF_X - 0.1,
    KAABA.blackStoneHeight,
    HALF_Z + 0.1,
  ];
  const facingOut: [number, number, number] = [0, -Math.PI / 4, 0];
  const stone = part(new CircleGeometry(0.24, 20), PALETTE.blackStone, {
    position: cornerPos,
    rotation: facingOut,
    scale: [1, 1.3, 1],
  });
  const frame = part(new TorusGeometry(0.28, 0.08, 8, 24), PALETTE.silver, {
    position: cornerPos,
    rotation: facingOut,
    scale: [1, 1.3, 1],
  });

  // Mizab: gold waterspout over Hijr Ismail — a trough with raised sides.
  // It leaves the roof through the parapet, just above roof level.
  const mizabX = HALF_X + 0.45;
  const mizabY = KAABA.height - KAABA.rimHeight + 0.25;
  const mizab = [
    part(new BoxGeometry(1.9, 0.08, 0.34), PALETTE.gold, {
      position: [mizabX, mizabY, 0],
    }),
    part(new BoxGeometry(1.9, 0.2, 0.05), PALETTE.gold, {
      position: [mizabX, mizabY + 0.1, 0.15],
    }),
    part(new BoxGeometry(1.9, 0.2, 0.05), PALETTE.gold, {
      position: [mizabX, mizabY + 0.1, -0.15],
    }),
  ];

  return {
    matte: [base, ...rim, roof, hatchPart, stone],
    metal: [frame, ...mizab],
  };
}
