"use client";

import { useLocale } from "next-intl";
import { directionSign, dirOf } from "@/lib/config/locale";

/**
 * Reading direction of the active locale.
 * `sign` is -1 in RTL and +1 in LTR; multiply any horizontal motion offset by it.
 */
export function useDirection() {
  const dir = dirOf(useLocale());
  return { dir, sign: directionSign(dir), isRtl: dir === "rtl" } as const;
}
