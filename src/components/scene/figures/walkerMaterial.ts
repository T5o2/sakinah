import { MeshStandardMaterial } from "three";

/**
 * Leg swing at the hip, radians, for a swing weight of 1 (arms use ±0.5).
 * Together with TAWAF.stepsPerMetre (one step = 2 × 0.85 m × sin of this)
 * it keeps a planted foot from sliding.
 */
export const LEG_SWING = 0.26;
/** How far the hem of an izar or abaya swings with each step, metres. */
const HEM_SWAY = 0.045;

/**
 * Matte cloth and skin for the walkers, with the walking and the variety
 * done in the vertex shader, per instance:
 * - `aLook.y`, the step phase, swings the legs and arms about their pivot
 *   heights and sways the hem, left and right in turn;
 * - `aLook.x`, the hair style, hides the short crop on the bald (0) and the
 *   long hair on all but the long-haired (2);
 * - `aSkin` and `aHair` colour the vertices marked as skin or hair.
 * Per-vertex data comes from walkers.ts (`aTint`, `aMotion`).
 */
export function createWalkerMaterial(): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.85,
    metalness: 0,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSwing = { value: LEG_SWING };
    shader.uniforms.uHem = { value: HEM_SWAY };
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
attribute vec2 aTint;
attribute vec3 aMotion;
attribute vec3 aSkin;
attribute vec3 aHair;
attribute vec2 aLook;
uniform float uSwing;
uniform float uHem;
// Rotation about the figure's sideways (x) axis.
mat3 walkerSwing(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
}`,
      )
      .replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
float walkerStep = sin(aLook.y);
mat3 walkerRot = walkerSwing(aMotion.x * uSwing * walkerStep);
objectNormal = walkerRot * objectNormal;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
transformed.y -= aMotion.y;
transformed = walkerRot * transformed;
transformed.y += aMotion.y;
// The hem moves forward on the side of the leading leg.
transformed.z -= aMotion.z * uHem * walkerStep * clamp(transformed.x / 0.12, -1.0, 1.0);
if ((aTint.y > 0.5 && aLook.x < 0.5) || (aTint.y > 1.5 && aLook.x < 1.5)) {
  transformed = vec3(0.0);
}`,
      )
      .replace(
        "#include <color_vertex>",
        `#include <color_vertex>
if (aTint.x > 1.5) vColor.rgb = aHair;
else if (aTint.x > 0.5) vColor.rgb = aSkin;`,
      );
  };
  material.customProgramCacheKey = () => "sakinah-walker";
  return material;
}
