import { describe, it, expect } from 'vitest';
import { uiPolicyFixture } from './policy';
import { WorkloadId } from '../types';

describe('UI Policy Fixture Immutability', () => {
  it('is completely frozen at all top levels', () => {
    // Top-level
    expect(Object.isFrozen(uiPolicyFixture)).toBe(true);
    // Workloads level
    expect(Object.isFrozen(uiPolicyFixture.workloads)).toBe(true);
  });

  const workloads: WorkloadId[] = ['matrix', 'sort', 'sha256'];

  workloads.forEach((wl) => {
    it(`deeply freezes workload ${wl}`, () => {
      const workload = uiPolicyFixture.workloads[wl];
      expect(workload).toBeDefined();
      expect(Object.isFrozen(workload)).toBe(true);
      
      // Rules array and contents
      expect(Object.isFrozen(workload!.rules)).toBe(true);
      if (workload!.rules.length > 0) {
        expect(Object.isFrozen(workload!.rules[0])).toBe(true);
      }
      
      // Provenance and contents
      expect(Object.isFrozen(workload!.provenance)).toBe(true);
      expect(Object.isFrozen(workload!.provenance.gridSizes)).toBe(true);
    });
  });
});
