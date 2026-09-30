import {
  BufferAttribute,
  type BufferGeometry,
  Color,
  Euler,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Static landmark detail is modelled as many small parts, then merged into
 * one geometry per material with the part colours baked into vertex colours.
 * Dozens of parts cost one draw call.
 */

export interface Part {
  geometry: BufferGeometry;
  /** sRGB hex; converted to linear for the vertex colour. */
  color: string;
}

export interface Placement {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

const KEPT_ATTRIBUTES = new Set(["position", "normal", "uv", "color"]);

/** Bakes a transform into the geometry and returns it. */
export function place(
  geometry: BufferGeometry,
  placement: Placement = {},
): BufferGeometry {
  const {
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
  } = placement;
  const matrix = new Matrix4().compose(
    new Vector3(...position),
    new Quaternion().setFromEuler(new Euler(...rotation)),
    new Vector3(...scale),
  );
  return geometry.applyMatrix4(matrix);
}

export function part(
  geometry: BufferGeometry,
  color: string,
  placement?: Placement,
): Part {
  return { geometry: place(geometry, placement), color };
}

/** Merges parts into one non-indexed geometry with a per-vertex colour attribute. */
export function mergeParts(parts: Part[]): BufferGeometry {
  const prepared = parts.map(({ geometry, color }) => {
    const flat = geometry.index ? geometry.toNonIndexed() : geometry;
    if (flat !== geometry) geometry.dispose();
    for (const name of Object.keys(flat.attributes)) {
      if (!KEPT_ATTRIBUTES.has(name)) flat.deleteAttribute(name);
    }
    const c = new Color(color);
    const count = flat.getAttribute("position").count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) colors.set([c.r, c.g, c.b], i * 3);
    flat.setAttribute("color", new BufferAttribute(colors, 3));
    return flat;
  });

  const merged = mergeGeometries(prepared, false);
  for (const g of prepared) g.dispose();
  if (!merged)
    throw new Error(
      "Landmark parts have mismatched attributes and cannot be merged",
    );
  return merged;
}

export function triangleCount(geometry: BufferGeometry): number {
  const index = geometry.getIndex();
  return (index ? index.count : geometry.getAttribute("position").count) / 3;
}
