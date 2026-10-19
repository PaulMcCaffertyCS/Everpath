type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

type UnionToTupleLast<U> = UnionToIntersection<U extends any ? (x: U) => void : never> extends (x: infer A) => void ? A : never;

type UnionToTuple<U, Last = UnionToTupleLast<U>> = [U] extends [never] ? [] : [...UnionToTuple<Exclude<U, Last>>, Last];

export type { UnionToTuple };