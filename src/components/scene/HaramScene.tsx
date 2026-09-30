"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useRef, useState } from "react";
import { CAMERA, TIER_SETTINGS } from "@/lib/config/scene";
import { Arcade } from "./Arcade";
import { CameraRig } from "./CameraRig";
import { HijrIsmail } from "./HijrIsmail";
import { Kaaba } from "./Kaaba";
import { MaqamIbrahim } from "./MaqamIbrahim";
import { MatafFloor } from "./MatafFloor";
import { SceneLighting } from "./SceneLighting";
import { detectDeviceTier, lowerTier, readDeviceSignals } from "./lib/deviceTier";
import { PALETTE } from "./lib/palette";

export interface HaramSceneProps {
  /** prefers-reduced-motion: render on demand with a still camera. */
  reducedMotion: boolean;
  /** Called once the first frame has been drawn, so the poster can fade out. */
  onFirstFrame?: () => void;
}

function FirstFrame({ onFirstFrame }: { onFirstFrame?: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    onFirstFrame?.();
  });
  return null;
}

/**
 * The hero scene. Loaded only on the client, only on the home page
 * (next/dynamic, ssr: false), behind a static poster.
 */
export default function HaramScene({ reducedMotion, onFirstFrame }: HaramSceneProps) {
  // Starting tier from device signals; PerformanceMonitor steps it down if frames drop.
  const [tier, setTier] = useState(() => detectDeviceTier(readDeviceSignals()));
  const settings = TIER_SETTINGS[tier];

  return (
    <Canvas
      aria-hidden="true"
      dpr={settings.dpr}
      gl={{ antialias: settings.antialias, powerPreference: "high-performance" }}
      camera={{ fov: CAMERA.fov, near: 1, far: 400 }}
      onCreated={({ gl }) => {
        // Three's recommended production setting: skips the synchronous
        // shader-status check (a compile stall) and driver info-log noise.
        gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
      }}
      frameloop={reducedMotion ? "demand" : "always"}
    >
      <color attach="background" args={[PALETTE.ink]} />
      {/* Near/far are driven by CameraRig from the camera distance. */}
      <fog attach="fog" args={[PALETTE.ink, 70, 150]} />

      <PerformanceMonitor flipflops={3} onDecline={() => setTier(lowerTier)} onFallback={() => setTier("low")} />

      <SceneLighting />
      <MatafFloor textureSize={settings.floorTextureSize} />
      <Arcade />
      <Kaaba sheen={settings.kiswaSheen} />
      <HijrIsmail />
      <MaqamIbrahim />

      <CameraRig still={reducedMotion} />
      <FirstFrame onFirstFrame={onFirstFrame} />
    </Canvas>
  );
}
