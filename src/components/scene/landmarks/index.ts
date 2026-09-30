import type { BufferGeometry } from "three";
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
}

export function buildLandmarkGeometries(): LandmarkGeometries {
  const kaaba = kaabaParts();
  const hijr = hijrParts();
  const maqam = maqamParts();
  return {
    kiswa: createKiswaGeometry(),
    matte: mergeParts([...kaaba.matte, ...hijr.matte, ...maqam.matte]),
    metal: mergeParts([...kaaba.metal, ...hijr.metal, ...maqam.metal]),
    silver: mergeParts(kaaba.silver),
    lanternGlass: mergeParts(hijr.lanternGlass),
    maqamLattice: createMaqamLatticeGeometry(),
    maqamDome: createMaqamDomeGeometry(),
    hijrBand: createHijrBandGeometry(),
    hijrGates: createHijrGateGeometry(),
  };
}
