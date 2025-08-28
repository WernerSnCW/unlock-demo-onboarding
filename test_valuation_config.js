// Test script to verify the valuation configuration system
import { ValuationConfig, getDiscountRate, computePVMultipleBlock, roundTo } from './server/valuation_config.js';

console.log('🧪 Testing Valuation Configuration System...\n');

// Test 1: Configuration values
console.log('📊 Configuration Values:');
console.log(`  Default discount rate: ${ValuationConfig.defaultDiscountRate}`);
console.log(`  Revenue multiples: ${ValuationConfig.revenueMultiples.Seed.General.join('-')}`);
console.log(`  EBITDA multiples: ${ValuationConfig.ebitdaMultiples.Seed.General.join('-')}`);
console.log(`  Round to nearest: £${ValuationConfig.roundToNearest.toLocaleString()}`);
console.log(`  Hide ROI without terms: ${ValuationConfig.hideROIWithoutTerms}`);

// Test 2: Discount rate logic
console.log('\n💰 Discount Rate Logic:');
console.log(`  Empty KPIs: ${getDiscountRate({})}`);
console.log(`  With discount_rate_pct=0.15: ${getDiscountRate({discount_rate_pct: 0.15})}`);
console.log(`  With discount_rate_pct=null: ${getDiscountRate({discount_rate_pct: null})}`);

// Test 3: PV Multiple Block calculation
console.log('\n🔢 PV Multiple Block Calculation:');
const testBlock = computePVMultipleBlock(1000000, 5, 7.5, 10, 3, 0.25);
console.log('  Input: Base=£1M, Multiples=[5,7.5,10], Years=3, Rate=25%');
console.log(`  Forward values: £${testBlock.implied_forward_low.toLocaleString()}, £${testBlock.implied_forward_mid.toLocaleString()}, £${testBlock.implied_forward_high.toLocaleString()}`);
console.log(`  Present values: £${testBlock.implied_low.toLocaleString()}, £${testBlock.implied_mid.toLocaleString()}, £${testBlock.implied_high.toLocaleString()}`);
console.log(`  Discounted: ${testBlock.discounted}`);
console.log(`  Horizon years: ${testBlock.horizon_years}`);

// Test 4: Rounding function
console.log('\n🎯 Rounding Function:');
console.log(`  roundTo(1234567, 50000) = £${roundTo(1234567, 50000).toLocaleString()}`);
console.log(`  roundTo(987654, 50000) = £${roundTo(987654, 50000).toLocaleString()}`);

console.log('\n✅ Configuration system test complete!');