type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

type UnionToTupleLast<U> = UnionToIntersection<U extends any ? (x: U) => void : never> extends (x: infer A) => void ? A : never;

type UnionToTuple<U, Last = UnionToTupleLast<U>> = [U] extends [never] ? [] : [...UnionToTuple<Exclude<U, Last>>, Last];

function zipToRecord<K extends string | number | symbol, V>(keys: readonly K[], values: readonly V[]): Record<K, V> {
  return keys.reduce((record, key, index) => {
    record[key] = values[index];
    return record;
  }, {} as Record<K, V>);
}

export type { UnionToTuple };
export { zipToRecord };