import { Bucket } from "./buckets";

export const FRICTION_RATE: Partial<Record<Bucket, number>> = {
  // round-trip trading cost assumptions (very rough defaults)
  GLOBAL_EQUITY: 0.0015,
  UK_EQUITY_VALUE: 0.0015,
  GROWTH_TECH: 0.0018,
  IG_CREDIT: 0.0010,
  GILTS_LONG: 0.0006,
  BILLS_SHORT_GILTS: 0.0002,
  COMMODITIES: 0.0010,
  GOLD: 0.0010,
  ALTERNATIVES: 0.0025,
  PROPERTY_UK_RESI: 0.0100,      // assume illiquid/fees
  COLLECTIBLES_ART: 0.0200,
  COLLECTIBLES_WINE: 0.0200,
  CRYPTO_BTC: 0.0030,
  CRYPTO_ETH: 0.0030,
  CASH: 0
};

export const ILLIQUID_BUCKETS: Bucket[] = [
  "PROPERTY_UK_RESI","ALTERNATIVES","COLLECTIBLES_ART","COLLECTIBLES_WINE"
];