"use client";

import { Canvas, invalidate, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { type PointerEvent, useMemo, useRef, useState } from "react";
import { CAMERA, TIER_SETTINGS } from "@/lib/config/scene";
import { Arcade } from "./Arcade";
import { CameraRig } from "./CameraRig";
import { Guards } from "./Guards";
import { HaramLandmarks } from "./HaramLandmarks";
import { MatafFloor } from "./MatafFloor";
import { SceneLighting } from "./SceneLighting";
import {
  detectDeviceTier,
  lowerTier,
  readDeviceSignals,
} from "./lib/deviceTier";
import {
  createOrbitGesture,
  type PointerKind,
  type PointerSample,
} from "./lib/orbitGesture";
import { PALETTE } from "./lib/palette";

export interface HaramSceneProps {
  /** prefers-reduced-motion: render on demand with a still camera. */
  reducedMotion: boolean;
  /** Called once the first frame has been drawn, so the poster can fade out. */
  onFirstFrame?: () => void;
  /** A tap on the scene (not a drag): opens the cinematic transition. */
  onActivate?: () => void;
}

function toSample(e: PointerEvent<HTMLDivElement>): PointerSample {
  return {
    id: e.pointerId,
    kind: e.pointerType as PointerKind,
    x: e.clientX,
    y: e.clientY,
    t: e.timeStamp,
  };
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
export default function HaramScene({
  reducedMotion,
  onFirstFrame,
  onActivate,
}: HaramSceneProps) {
  // Starting tier from device signals; PerformanceMonitor steps it down if frames drop.
  const [tier, setTier] = useState(() => detectDeviceTier(readDeviceSignals()));
  const settings = TIER_SETTINGS[tier];

  const gesture = useMemo(() => createOrbitGesture(), []);

  return (
    // Horizontal drags orbit; vertical touch pans stay with the page (touch-pan-y).
    <div
      className="h-full w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
      onPointerDown={(e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        gesture.down(toSample(e));
      }}
      onPointerMove={(e) => {
        gesture.move(toSample(e));
        if (gesture.state.dragging) invalidate();
      }}
      onPointerUp={(e) => {
        if (gesture.up(toSample(e))) onActivate?.();
      }}
      onPointerCancel={() => gesture.cancel()}
    >
      <Canvas
        aria-hidden="true"
        dpr={settings.dpr}
        gl={{
          antialias: settings.antialias,
          powerPreference: "high-performance",
        }}
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

        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setTier(lowerTier)}
          onFallback={() => setTier("low")}
        />

        <SceneLighting />
        <MatafFloor textureSize={settings.floorTextureSize} />
        <Arcade />
        <HaramLandmarks atlasWidth={settings.kiswaAtlasWidth} />
        <Guards />

        <CameraRig orbit={gesture.state} still={reducedMotion} />
        <FirstFrame onFirstFrame={onFirstFrame} />
      </Canvas>
    </div>
  );
}
