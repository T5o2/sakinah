import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  TorusGeometry,
} from "three";
import { HALF_X, HALF_Z, KAABA } from "../lib/layout";
import { PALETTE } from "../lib/palette";
import { part, type Part } from "../lib/parts";

/**
 * The Kaaba, built from:
 * - one kiswa mesh (four walls + roof) that samples a painted atlas holding
 *   the white Hajj cloth, the black kiswa, the belt, the gold panels, the
 *   lanterns and the door (see kiswaAtlas.ts);
 * - small solid parts (marble base, door frame, Black Stone frame, mizab)
 *   that are merged with the other landmarks by material.
 */

/** Where each wall lives in the kiswa atlas (u ranges; v spans the wall height). */
export const KISWA_ATLAS = {
  doorWall: [0, 0.5] as const,
  otherWalls: [0.5, 1] as const,
  /** A solid, non-reflective black patch the roof samples. */
  roofSwatch: { u0: 0.5, u1: 0.508, v0: 0.984, v1: 1 },
} as const;

/** Heights covered by the kiswa walls (above the marble base). */
export const KISWA_Y0 = KAABA.baseHeight;
export const KISWA_Y1 = KAABA.height;

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

/** Four wall quads and a roof quad, UV-mapped into the kiswa atlas. */
export function createKiswaGeometry(): BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const quad = (
    corners: [number, number, number][],
    normal: [number, number, number],
    quadUvs: [number, number][],
  ) => {
    const base = positions.length / 3;
    corners.forEach((c, i) => {
      positions.push(...c);
      normals.push(...normal);
      uvs.push(...(quadUvs[i] as [number, number]));
    });
    // Bottom-left, bottom-right, top-right, top-left: counterclockwise from outside.
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };

  for (const wall of WALLS) {
    const [u0, u1] = wall.u;
    quad(
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
  }

  const { u0, u1, v0, v1 } = KISWA_ATLAS.roofSwatch;
  const roofUv: [number, number] = [(u0 + u1) / 2, (v0 + v1) / 2];
  quad(
    [
      [-HALF_X, KISWA_Y1, HALF_Z],
      [HALF_X, KISWA_Y1, HALF_Z],
      [HALF_X, KISWA_Y1, -HALF_Z],
      [-HALF_X, KISWA_Y1, -HALF_Z],
    ],
    [0, 1, 0],
    [roofUv, roofUv, roofUv, roofUv],
  );

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3),
  );
  geometry.setAttribute(
    "normal",
    new BufferAttribute(new Float32Array(normals), 3),
  );
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);
  return geometry;
}

/** Door leaf centre along the door wall, from the Black Stone corner. */
export const DOOR_CENTER_X = -HALF_X + KAABA.door.fromBlackStoneCorner;

export function kaabaParts(): { matte: Part[]; metal: Part[] } {
  const { door } = KAABA;

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

  // Raised gold frame around the door leaf (the leaf itself is painted in the atlas).
  const t = 0.16;
  const depth = 0.14;
  const z = HALF_Z + depth / 2;
  const top = door.bottom + door.height;
  const sideH = door.height + 2 * t;
  const midY = door.bottom + door.height / 2;
  const doorFrame = [
    part(new BoxGeometry(t, sideH, depth), PALETTE.gold, {
      position: [DOOR_CENTER_X - door.width / 2 - t / 2, midY, z],
    }),
    part(new BoxGeometry(t, sideH, depth), PALETTE.gold, {
      position: [DOOR_CENTER_X + door.width / 2 + t / 2, midY, z],
    }),
    part(new BoxGeometry(door.width, t, depth), PALETTE.gold, {
      position: [DOOR_CENTER_X, top + t / 2, z],
    }),
    part(
      new BoxGeometry(door.width + 2 * t, t * 1.3, depth * 1.6),
      PALETTE.gold,
      {
        position: [DOOR_CENTER_X, door.bottom - t * 0.65, HALF_Z + depth * 0.8],
      },
    ),
  ];

  // Mizab: gold waterspout over Hijr Ismail — a trough with raised sides.
  const mizabX = HALF_X + 0.7;
  const mizabY = KAABA.height - 0.25;
  const mizab = [
    part(new BoxGeometry(1.4, 0.08, 0.34), PALETTE.gold, {
      position: [mizabX, mizabY, 0],
    }),
    part(new BoxGeometry(1.4, 0.2, 0.05), PALETTE.gold, {
      position: [mizabX, mizabY + 0.1, 0.15],
    }),
    part(new BoxGeometry(1.4, 0.2, 0.05), PALETTE.gold, {
      position: [mizabX, mizabY + 0.1, -0.15],
    }),
  ];

  return { matte: [base, stone], metal: [frame, ...doorFrame, ...mizab] };
}
