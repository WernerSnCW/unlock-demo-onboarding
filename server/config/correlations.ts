import { CANONICAL_BUCKETS, Bucket } from "./buckets";

// Identity = independent by default
export function defaultCorrelation(): number[][] {
  const n = CANONICAL_BUCKETS.length;
  const M = Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=> i===j ? 1 : 0));
  return M;
}

export const CORRELATION = defaultCorrelation(); // replace with your matrix when ready
export const BUCKET_ORDER: Bucket[] = [...CANONICAL_BUCKETS]; // must match matrix ordering