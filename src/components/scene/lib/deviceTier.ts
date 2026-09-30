import { DEVICE_TIERS, type DeviceTier } from "@/lib/config/scene";

export interface DeviceSignals {
  /** navigator.hardwareConcurrency, when the browser exposes it. */
  cores?: number;
  /** navigator.deviceMemory in GB (Chromium only). */
  memoryGb?: number;
  coarsePointer: boolean;
  viewportWidth: number;
}

/**
 * Starting quality tier from what the device tells us up front.
 * PerformanceMonitor then corrects it from the measured frame rate.
 */
export function detectDeviceTier(signals: DeviceSignals): DeviceTier {
  const { cores, memoryGb, coarsePointer, viewportWidth } = signals;
  if (
    (memoryGb !== undefined && memoryGb <= 2) ||
    (cores !== undefined && cores <= 2)
  ) {
    return "low";
  }
  if (
    coarsePointer ||
    viewportWidth < 768 ||
    (cores !== undefined && cores <= 4)
  ) {
    return "medium";
  }
  return "high";
}

/** One tier lower, or the same tier when already at the bottom. */
export function lowerTier(tier: DeviceTier): DeviceTier {
  const i = DEVICE_TIERS.indexOf(tier);
  return DEVICE_TIERS[i + 1] ?? tier;
}

export function readDeviceSignals(): DeviceSignals {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    cores: nav.hardwareConcurrency || undefined,
    memoryGb: nav.deviceMemory,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    viewportWidth: window.innerWidth,
  };
}
