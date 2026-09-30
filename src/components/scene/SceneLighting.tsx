"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { PALETTE } from "./lib/palette";

/**
 * Night lighting. A warm floodlight key from high up (the glowing mataf itself
 * is painted into the floor texture),
 * a cool, dim night fill, and a small environment built from light panels —
 * rendered once on the GPU, no HDR download — so the gold has something to
 * reflect. Diffuse light from that environment is kept low so the night
 * stays dark; gold materials raise their own envMapIntensity.
 */
export function SceneLighting() {
  return (
    <>
      <hemisphereLight args={[PALETTE.skyNight, PALETTE.groundBounce, 0.35]} />
      <directionalLight position={[-16, 48, 34]} intensity={1.7} color={PALETTE.keyLight} />
      <directionalLight position={[30, 22, -26]} intensity={0.35} color="#9fb0dc" />

      <Environment resolution={128} frames={1} environmentIntensity={0.3}>
        <Lightformer form="rect" intensity={4} color={PALETTE.lampWarm} position={[0, 30, 0]} rotation-x={Math.PI / 2} scale={[30, 30, 1]} />
        <Lightformer form="ring" intensity={2} color={PALETTE.goldSoft} position={[0, 10, 0]} scale={[50, 50, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={2.5} color={PALETTE.lampWarm} position={[-40, 8, 24]} rotation-y={Math.PI / 2} scale={[30, 6, 1]} />
        <Lightformer form="rect" intensity={2.5} color={PALETTE.lampWarm} position={[40, 8, -24]} rotation-y={-Math.PI / 2} scale={[30, 6, 1]} />
        <Lightformer form="rect" intensity={1.5} color={PALETTE.lampWarm} position={[0, 8, 45]} scale={[40, 6, 1]} />
      </Environment>

      {/* Soft grounding shadow under the Kaaba, rendered once. */}
      <ContactShadows position={[0, 0.02, 0]} scale={34} resolution={512} blur={2.4} opacity={0.6} far={14} frames={1} />
    </>
  );
}
