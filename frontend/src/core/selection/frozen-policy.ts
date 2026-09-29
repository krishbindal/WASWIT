import { SelectionPolicy, FrozenSelectionPolicy } from './types';
import { freezePolicy } from './policy';

export const phase5FinalPolicyRaw: SelectionPolicy = {
  "version": "1.0.0-final",
  "derivationRule": "median-crossover-consistent-v2",
  "workloads": {
    "matrix": {
      "workloadId": "matrix",
      "defaultRuntime": "wasm",
      "provenance": {
        "gridSizes": [
          50,
          100,
          150,
          200,
          250,
          300
        ],
        "warmupIterations": 5,
        "measurementIterations": 30,
        "timestamp": "2026-09-29T17:33:07.945Z"
      },
      "rules": []
    },
    "sort": {
      "workloadId": "sort",
      "defaultRuntime": "wasm",
      "provenance": {
        "gridSizes": [
          1000,
          2000,
          3000,
          4000,
          5000
        ],
        "warmupIterations": 5,
        "measurementIterations": 30,
        "timestamp": "2026-09-29T17:33:07.945Z"
      },
      "rules": []
    },
    "sha256": {
      "workloadId": "sha256",
      "defaultRuntime": "wasm",
      "provenance": {
        "gridSizes": [
          1000,
          5000,
          10000,
          15000,
          20000
        ],
        "warmupIterations": 5,
        "measurementIterations": 30,
        "timestamp": "2026-09-29T17:33:07.945Z"
      },
      "rules": [
        {
          "maxInputSize": 1000,
          "runtime": "javascript"
        }
      ]
    }
  }
};

export const phase5FrozenPolicy: FrozenSelectionPolicy = freezePolicy(phase5FinalPolicyRaw);
