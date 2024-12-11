/**
 * In-place sort object entities by their keys so that it can be serialized to json with sorted order.
 * @param object
 * @returns The original object with modified entities order.
 */
export function inPlaceSortByKeys(object: Record<string, any>): Record<string, any> {
  const sorted: Record<string, any> = {};

  const keys = Object.keys(object);
  keys.sort();
  for (const key of keys) {
    sorted[key] = object[key];
    delete object[key];
  }

  return Object.assign(object, sorted);
}
