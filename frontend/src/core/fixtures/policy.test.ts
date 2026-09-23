import { describe, it, expect } from 'vitest';
import { uiPolicyFixture } from './policy';

describe('UI Policy Fixture Immutability', () => {
  it('is completely frozen at all levels', () => {
    // Top-level
    expect(Object.isFrozen(uiPolicyFixture)).toBe(true);
    
    // Workloads level
    expect(Object.isFrozen(uiPolicyFixture.workloads)).toBe(true);
    
    // Individual workloads
    const matrixWl = uiPolicyFixture.workloads.matrix;
    expect(matrixWl).toBeDefined();
    expect(Object.isFrozen(matrixWl)).toBe(true);
    
    // Rules array and contents
    expect(Object.isFrozen(matrixWl!.rules)).toBe(true);
    expect(Object.isFrozen(matrixWl!.rules[0])).toBe(true);
    
    // Provenance and contents
    expect(Object.isFrozen(matrixWl!.provenance)).toBe(true);
    expect(Object.isFrozen(matrixWl!.provenance.gridSizes)).toBe(true);
  });
});
