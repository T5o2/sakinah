import {
  type BufferGeometry,
  CylinderGeometry,
  Quaternion,
  SphereGeometry,
  Vector3,
} from "three";
import { PALETTE } from "../lib/palette";
import { mergeParts, type Part } from "../lib/parts";
import type { WalkerKind } from "../lib/tawaf";

/**
 * The people performing tawaf: three faceless figures in the guards' simple
 * style, but far lighter, since there are hundreds of them. Each is one
 * geometry with its colours in vertex colours, drawn as one instanced mesh
 * per kind. Modelled facing +Z with the feet at the origin; heights vary per
 * walker by scaling.
 *
 * No coloured clothing: white ihram, black abaya, and a child in white or
 * neutral cloth.
 */

const UP = new Vector3(0, 1, 0);
const v = (x: number, y: number, z: number) => new Vector3(x, y, z);

/** A tapered limb between two points (open ends; joints are covered by balls). */
function limb(a: Vector3, b: Vector3, ra: number, rb: number, radial = 5) {
  const g = new CylinderGeometry(rb, ra, a.distanceTo(b), radial, 1, true);
  g.applyQuaternion(
    new Quaternion().setFromUnitVectors(UP, b.clone().sub(a).normalize()),
  );
  const mid = a.clone().add(b).multiplyScalar(0.5);
  return g.translate(mid.x, mid.y, mid.z);
}

function ball(
  at: Vector3,
  r: number,
  scale: [number, number, number] = [1, 1, 1],
  segments: [number, number] = [5, 3],
) {
  return new SphereGeometry(r, ...segments)
    .scale(...scale)
    .translate(at.x, at.y, at.z);
}

const part = (geometry: BufferGeometry, color: string): Part => ({
  geometry,
  color,
});

/** Head: a plain egg, no face. */
function head(y: number, color: string, z = 0): Part {
  return part(ball(v(0, y, z), 0.1, [0.9, 1.1, 1], [7, 5]), color);
}

/**
 * Man in ihram, 1.70 m: the white lower wrap (izar) to mid-calf, the upper
 * wrap (rida) over the left shoulder with the right shoulder bare, as in
 * tawaf, bare arms and calves.
 */
function ihramParts(armsDown = true): Part[] {
  const white = PALETTE.ihram;
  const skin = PALETTE.pilgrimSkin;
  const arms = [
    // Hanging, a little forward: the left upper arm under the rida.
    part(limb(v(-0.2, 1.38, 0), v(-0.23, 1.1, 0.02), 0.05, 0.042), skin),
    part(limb(v(-0.23, 1.1, 0.02), v(-0.22, 0.86, 0.06), 0.042, 0.035), skin),
    part(limb(v(0.2, 1.38, 0), v(0.23, 1.1, 0.02), 0.055, 0.045), white),
    part(limb(v(0.23, 1.1, 0.02), v(0.22, 0.86, 0.06), 0.042, 0.035), skin),
    part(ball(v(-0.22, 0.84, 0.065), 0.04), skin),
    part(ball(v(0.22, 0.84, 0.065), 0.04), skin),
  ];
  return [
    // Bare calves and feet.
    part(limb(v(-0.09, 0, 0.02), v(-0.09, 0.5, 0), 0.045, 0.055), skin),
    part(limb(v(0.09, 0, 0.02), v(0.09, 0.5, 0), 0.045, 0.055), skin),
    // Izar, flaring a little to the hem; rida over the chest.
    part(
      new CylinderGeometry(0.17, 0.21, 0.58, 8, 1, true)
        .scale(1, 1, 0.7)
        .translate(0, 0.73, 0),
      white,
    ),
    part(
      new CylinderGeometry(0.19, 0.17, 0.44, 8, 1, true)
        .scale(1, 1, 0.66)
        .translate(0, 1.2, 0),
      white,
    ),
    // Shoulders: the left under the rida, the right bare.
    part(
      new SphereGeometry(0.19, 8, 2, 0, Math.PI * 2, 0, Math.PI / 2)
        .scale(1, 0.4, 0.66)
        .translate(0, 1.42, 0),
      white,
    ),
    part(ball(v(-0.19, 1.39, 0), 0.06), skin),
    part(ball(v(0.19, 1.39, 0), 0.065), white),
    ...(armsDown ? arms : []),
    // Neck and head.
    part(limb(v(0, 1.42, 0), v(0, 1.52, 0), 0.05, 0.05), skin),
    head(1.6, skin),
  ];
}

/** Woman in a black abaya, 1.62 m: one long robe from the floor, the head covered. */
function abayaParts(): Part[] {
  const black = PALETTE.abaya;
  return [
    part(
      new CylinderGeometry(0.165, 0.26, 1.36, 10, 1, true)
        .scale(1, 1, 0.75)
        .translate(0, 0.68, 0),
      black,
    ),
    // Shoulders and the arms under the robe, close to the body.
    part(
      new SphereGeometry(0.2, 10, 2, 0, Math.PI * 2, 0, Math.PI / 2)
        .scale(1, 0.42, 0.72)
        .translate(0, 1.34, 0),
      black,
    ),
    part(limb(v(-0.19, 1.32, 0), v(-0.22, 0.85, 0.04), 0.055, 0.05), black),
    part(limb(v(0.19, 1.32, 0), v(0.22, 0.85, 0.04), 0.055, 0.05), black),
    // Covered head, a little fuller than the head itself.
    part(ball(v(0, 1.5, 0), 0.115, [0.95, 1.1, 1], [7, 5]), black),
  ];
}

/**
 * Man in ihram carrying a child on his shoulders: the child sits behind his
 * head, legs forward over his chest, held at the shins by both his hands.
 */
function carrierParts(): Part[] {
  const white = PALETTE.ihram;
  const skin = PALETTE.pilgrimSkin;
  const child = PALETTE.childCloth;
  const shins: Vector3[] = [v(-0.12, 1.3, 0.13), v(0.12, 1.3, 0.13)];
  return [
    ...ihramParts(false),
    // His arms raised to hold the child's shins.
    part(limb(v(-0.2, 1.38, 0), v(-0.24, 1.2, 0.08), 0.05, 0.042), skin),
    part(limb(v(-0.24, 1.2, 0.08), shins[0]!, 0.042, 0.035), skin),
    part(limb(v(0.2, 1.38, 0), v(0.24, 1.2, 0.08), 0.055, 0.045), white),
    part(limb(v(0.24, 1.2, 0.08), shins[1]!, 0.042, 0.035), skin),
    // The child: seated on his shoulders behind his head, torso upright,
    // hands resting on his head, legs forward over his chest.
    part(ball(v(0, 1.56, -0.07), 0.1, [1.2, 0.7, 1]), child),
    part(limb(v(0, 1.56, -0.07), v(0, 1.88, -0.08), 0.095, 0.085), child),
    part(ball(v(0, 1.88, -0.08), 0.085, [1.1, 0.6, 0.9]), child),
    part(limb(v(-0.08, 1.56, -0.03), v(-0.12, 1.53, 0.11), 0.045, 0.04), child),
    part(limb(v(0.08, 1.56, -0.03), v(0.12, 1.53, 0.11), 0.045, 0.04), child),
    part(limb(v(-0.12, 1.53, 0.11), v(-0.13, 1.27, 0.15), 0.04, 0.032), skin),
    part(limb(v(0.12, 1.53, 0.11), v(0.13, 1.27, 0.15), 0.04, 0.032), skin),
    part(limb(v(-0.1, 1.84, -0.08), v(-0.07, 1.72, 0.0), 0.032, 0.026), child),
    part(limb(v(0.1, 1.84, -0.08), v(0.07, 1.72, 0.0), 0.032, 0.026), child),
    part(ball(v(0, 2.0, -0.09), 0.08, [0.9, 1.08, 1], [7, 5]), skin),
  ];
}

/** One merged geometry per kind of walker, colours in vertex colours. */
export function createWalkerGeometry(kind: WalkerKind): BufferGeometry {
  const parts =
    kind === "ihram"
      ? ihramParts()
      : kind === "abaya"
        ? abayaParts()
        : carrierParts();
  return mergeParts(parts);
}
