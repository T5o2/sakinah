import {
  BoxGeometry,
  type BufferGeometry,
  CylinderGeometry,
  SphereGeometry,
  TorusGeometry,
} from "three";
import { MAQAM } from "../lib/layout";
import { PALETTE } from "../lib/palette";
import { part, place, type Part } from "../lib/parts";

const SIDES = 6;
/** Radius of the hexagonal glass cage (to its corners). */
const CAGE_R = 0.72;
const CAGE_BOTTOM = 1.0;
const CAGE_HEIGHT = 1.7;
const CAGE_TOP = CAGE_BOTTOM + CAGE_HEIGHT;

const at = (x: number, y: number, z: number): [number, number, number] => [
  MAQAM.x + x,
  y,
  MAQAM.z + z,
];

/**
 * Maqam Ibrahim: a hexagonal gold cage with latticed glass panels, a sloping
 * roof, a small glass dome and a crescent, on a white marble plinth with a
 * dark granite footing. Through the glass: the stone bearing the two
 * footprints, in a silver frame — kept simple and plain.
 */
export function maqamParts(): { matte: Part[]; metal: Part[] } {
  const matte = [
    part(new CylinderGeometry(1.02, 1.05, 0.16, SIDES), PALETTE.granite, {
      position: at(0, 0.08, 0),
    }),
    part(new CylinderGeometry(0.95, 0.98, 0.84, SIDES), PALETTE.marble, {
      position: at(0, 0.58, 0),
    }),
  ];

  const metal: Part[] = [
    // Cage rings top and bottom.
    part(
      new CylinderGeometry(CAGE_R + 0.06, CAGE_R + 0.06, 0.16, SIDES),
      PALETTE.gold,
      { position: at(0, CAGE_BOTTOM, 0) },
    ),
    part(
      new CylinderGeometry(CAGE_R + 0.06, CAGE_R + 0.06, 0.16, SIDES),
      PALETTE.gold,
      { position: at(0, CAGE_TOP, 0) },
    ),
    // Sloping bronze roof, then the glass dome's gold collar and the finial.
    part(
      new CylinderGeometry(0.3, CAGE_R + 0.12, 0.38, SIDES),
      PALETTE.bronze,
      { position: at(0, CAGE_TOP + 0.24, 0) },
    ),
    part(new TorusGeometry(0.3, 0.03, 6, 18), PALETTE.gold, {
      position: at(0, CAGE_TOP + 0.44, 0),
      rotation: [Math.PI / 2, 0, 0],
    }),
    part(new CylinderGeometry(0.03, 0.05, 0.3, 6), PALETTE.gold, {
      position: at(0, CAGE_TOP + 0.9, 0),
    }),
    part(new SphereGeometry(0.06, 8, 6), PALETTE.goldSoft, {
      position: at(0, CAGE_TOP + 1.06, 0),
    }),
  ];

  // Inside: the stone bearing the two footprints, clad in a silver metal frame.
  const stoneTop = CAGE_BOTTOM + 0.34;
  matte.push(
    part(new BoxGeometry(0.46, 0.3, 0.52), PALETTE.maqamStone, {
      position: at(0, CAGE_BOTTOM + 0.19, 0),
    }),
  );
  for (const dx of [-0.105, 0.105]) {
    matte.push(
      part(new CylinderGeometry(1, 1, 0.02, 16), PALETTE.footprint, {
        position: at(dx, stoneTop - 0.005, 0),
        scale: [0.075, 1, 0.17],
      }),
    );
  }
  const f = 0.04;
  metal.push(
    part(new BoxGeometry(0.5 + 2 * f, 0.06, f), PALETTE.silver, {
      position: at(0, stoneTop - 0.02, 0.26 + f / 2),
    }),
    part(new BoxGeometry(0.5 + 2 * f, 0.06, f), PALETTE.silver, {
      position: at(0, stoneTop - 0.02, -0.26 - f / 2),
    }),
    part(new BoxGeometry(f, 0.06, 0.52), PALETTE.silver, {
      position: at(0.25 + f / 2, stoneTop - 0.02, 0),
    }),
    part(new BoxGeometry(f, 0.06, 0.52), PALETTE.silver, {
      position: at(-0.25 - f / 2, stoneTop - 0.02, 0),
    }),
    part(new BoxGeometry(0.62, 0.08, 0.66), PALETTE.silver, {
      position: at(0, CAGE_BOTTOM + 0.06, 0),
    }),
  );

  // Corner posts of the cage: flat gold pillars. CylinderGeometry puts corner k at k·60° from +Z.
  for (let k = 0; k < SIDES; k++) {
    const a = (k * 2 * Math.PI) / SIDES;
    metal.push(
      part(new BoxGeometry(0.1, CAGE_HEIGHT, 0.07), PALETTE.gold, {
        position: at(
          CAGE_R * Math.sin(a),
          CAGE_BOTTOM + CAGE_HEIGHT / 2,
          CAGE_R * Math.cos(a),
        ),
        rotation: [0, a, 0],
      }),
    );
  }

  // Crescent: an open ring with its gap facing up.
  const gap = 0.75 * Math.PI;
  metal.push(
    part(
      new TorusGeometry(0.13, 0.028, 6, 20, 2 * Math.PI - gap),
      PALETTE.goldSoft,
      {
        position: at(0, CAGE_TOP + 1.25, 0),
        rotation: [0, 0, gap / 2 + Math.PI / 2],
      },
    ),
  );

  return { matte, metal };
}

/** The latticed glass panels (their own transparent material). */
export function createMaqamLatticeGeometry(): BufferGeometry {
  return place(
    new CylinderGeometry(CAGE_R, CAGE_R, CAGE_HEIGHT, SIDES, 1, true),
    {
      position: at(0, CAGE_BOTTOM + CAGE_HEIGHT / 2, 0),
    },
  );
}

/** The small clear glass dome above the roof. */
export function createMaqamDomeGeometry(): BufferGeometry {
  return place(new SphereGeometry(0.3, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), {
    position: at(0, CAGE_TOP + 0.43, 0),
    scale: [1, 1.15, 1],
  });
}
