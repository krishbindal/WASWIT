import { SelectionPolicy, FrozenSelectionPolicy } from '../selection/types';
import { freezePolicy } from '../selection/policy';

const rawPolicy: SelectionPolicy = {
  version: '1.0.0-fixture',
  derivationRule: 'test-fixture-derivation',
  workloads: {
    matrix: {
      workloadId: 'matrix',
      rules: [
        {
          maxInputSize: 100,
          runtime: 'javascript'
        }
      ],
      defaultRuntime: 'wasm',
      provenance: {
        timestamp: '2026-09-23T00:00:00.000Z',
        gridSizes: [50, 150, 250],
        warmupIterations: 3,
        measurementIterations: 10
      }
    },
    sort: {
      workloadId: 'sort',
      rules: [
        {
          maxInputSize: 2000,
          runtime: 'javascript'
        }
      ],
      defaultRuntime: 'wasm',
      provenance: {
        timestamp: '2026-09-23T00:00:00.000Z',
        gridSizes: [1000, 3000, 5000],
        warmupIterations: 3,
        measurementIterations: 10
      }
    },
    sha256: {
      workloadId: 'sha256',
      rules: [
        {
          maxInputSize: 500,
          runtime: 'javascript'
        }
      ],
      defaultRuntime: 'wasm',
      provenance: {
        timestamp: '2026-09-23T00:00:00.000Z',
        gridSizes: [250, 750, 1000],
        warmupIterations: 3,
        measurementIterations: 10
      }
    }
  }
};

export const uiPolicyFixture: FrozenSelectionPolicy = freezePolicy(rawPolicy);
