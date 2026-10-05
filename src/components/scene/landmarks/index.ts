import { BufferAttribute, type BufferGeometry } from "three";
import { guardStepParts } from "../figures/guards";
import { mergeParts } from "../lib/parts";
import { createKiswaGeometry, kaabaParts } from "./kaaba";
import {
  createHijrBandGeometry,
  createHijrGateGeometry,
  hijrParts,
} from "./hijr";
import {
  createMaqamDomeGeometry,
  createMaqamLatticeGeometry,
  maqamParts,
} from "./maqam";

/** Planar UVs from world x/z, so the granite texture tiles evenly along the strip. */
function withFloorUv(
  geometry: BufferGeometry,
  metresPerTile = 0.6,
): BufferGeometry {
  const pos = geometry.getAttribute("position");
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / metresPerTile;
    uv[i * 2 + 1] = pos.getZ(i) / metresPerTile;
  }
  geometry.setAttribute("uv", new BufferAttribute(uv, 2));
  return geometry;
}

/** One geometry per material: each entry is exactly one draw call. */
export interface LandmarkGeometries {
  kiswa: BufferGeometry;
  matte: BufferGeometry;
  metal: BufferGeometry;
  silver: BufferGeometry;
  lanternGlass: BufferGeometry;
  maqamLattice: BufferGeometry;
  maqamDome: BufferGeometry;
  hijrBand: BufferGeometry;
  hijrGates: BufferGeometry;
  floorStrip: BufferGeometry;
}

export function buildLandmarkGeometries(): LandmarkGeometries {
  const kaaba = kaabaParts();
  const hijr = hijrParts();
  const maqam = maqamParts();
  return {
    kiswa: createKiswaGeometry(),
    matte: mergeParts([
      ...kaaba.matte,
      ...hijr.matte,
      ...maqam.matte,
      // The Black Stone guard's marble step, behind the marble block.
      ...guardStepParts(),
    ]),
    metal: mergeParts([...kaaba.metal, ...hijr.metal, ...maqam.metal]),
    silver: mergeParts(kaaba.silver),
    lanternGlass: mergeParts(hijr.lanternGlass),
    maqamLattice: createMaqamLatticeGeometry(),
    maqamDome: createMaqamDomeGeometry(),
    hijrBand: createHijrBandGeometry(),
    hijrGates: createHijrGateGeometry(),
    floorStrip: withFloorUv(mergeParts(kaaba.strip)),
  };
}
