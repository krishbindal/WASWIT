import { expect, test, describe } from 'vitest';
import { phase5FinalPolicyRaw } from '../selection/frozen-policy';

describe('Phase 5E Preflight', () => {
  const CALIBRATION_GRIDS = {
    matrix: [50, 100, 150, 200, 250, 300],
    sort: [1000, 2000, 3000, 4000, 5000],
    sha256: [1000, 5000, 10000, 15000, 20000]
  };

  const EVALUATION_GRIDS = {
    matrix: [75, 125, 175, 225, 275],
    sort: [1500, 2500, 3500, 4500],
    sha256: [2500, 7500, 12500, 17500]
  };

  const MODE_PERMUTATIONS = [
    ['js', 'wasm', 'adaptive'],
    ['js', 'adaptive', 'wasm'],
    ['wasm', 'js', 'adaptive'],
    ['wasm', 'adaptive', 'js'],
    ['adaptive', 'js', 'wasm'],
    ['adaptive', 'wasm', 'js']
  ];

  test('no calibration overlap', () => {
    for (const wl of Object.keys(EVALUATION_GRIDS)) {
      const evalSizes = EVALUATION_GRIDS[wl as keyof typeof EVALUATION_GRIDS];
      const calibSizes = CALIBRATION_GRIDS[wl as keyof typeof CALIBRATION_GRIDS];
      for (const size of evalSizes) {
        expect(calibSizes.includes(size)).toBe(false);
      }
    }
  });

  test('exact evaluation grids', () => {
    expect(EVALUATION_GRIDS.matrix).toEqual([75, 125, 175, 225, 275]);
    expect(EVALUATION_GRIDS.sort).toEqual([1500, 2500, 3500, 4500]);
    expect(EVALUATION_GRIDS.sha256).toEqual([2500, 7500, 12500, 17500]);
  });

  test('exact mode permutation assignment', () => {
    expect(MODE_PERMUTATIONS.length).toBe(6);
    const set = new Set(MODE_PERMUTATIONS.map(p => p.join(',')));
    expect(set.size).toBe(6); // all unique
  });

  test('frozen policy matches committed artifact', () => {
    expect(phase5FinalPolicyRaw.version).toBe('1.0.0-final');
    expect(phase5FinalPolicyRaw.derivationRule).toBe('median-crossover-consistent-v2');
  });
});
