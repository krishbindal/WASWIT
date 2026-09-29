# Table 3: Confirmatory Results

| RQ | Workload | Size | Comparison | Median Diff (ms) | 95% Bootstrap CI | Raw p | Holm-Adjusted p | Significant |
|---|---|---|---|---|---|---|---|---|
| RQ1 | matrix | 75 | JS vs Wasm | 0.300 | [0.300, 0.400] | 0.0312 | 1.0000 | No |
| RQ1 | matrix | 125 | JS vs Wasm | 1.450 | [1.300, 1.600] | 0.0312 | 1.0000 | No |
| RQ1 | matrix | 175 | JS vs Wasm | 3.850 | [3.575, 3.950] | 0.0312 | 1.0000 | No |
| RQ1 | matrix | 225 | JS vs Wasm | 7.700 | [7.150, 8.175] | 0.0312 | 1.0000 | No |
| RQ1 | matrix | 275 | JS vs Wasm | 13.300 | [12.800, 14.200] | 0.0312 | 1.0000 | No |
| RQ1 | sha256 | 2500 | JS vs Wasm | 0.000 | [-0.000, 0.000] | 1.0000 | 1.0000 | No |
| RQ1 | sha256 | 7500 | JS vs Wasm | 0.200 | [0.200, 0.300] | 0.7539 | 1.0000 | No |
| RQ1 | sha256 | 12500 | JS vs Wasm | 0.200 | [0.200, 0.225] | 0.2891 | 1.0000 | No |
| RQ1 | sha256 | 17500 | JS vs Wasm | 0.300 | [0.300, 0.325] | 0.2891 | 1.0000 | No |
| RQ1 | sort | 1500 | JS vs Wasm | 0.100 | [0.100, 0.100] | 0.7539 | 1.0000 | No |
| RQ1 | sort | 2500 | JS vs Wasm | 0.100 | [0.100, 0.100] | 0.7539 | 1.0000 | No |
| RQ1 | sort | 3500 | JS vs Wasm | 0.300 | [0.200, 0.300] | 0.0312 | 1.0000 | No |
| RQ1 | sort | 4500 | JS vs Wasm | 0.300 | [0.300, 0.300] | 0.2891 | 1.0000 | No |
| RQ3 | matrix | 75 | Adaptive vs JS | -0.225 | [-0.275, -0.200] | 0.0312 | 1.0000 | No |
| RQ3 | matrix | 75 | Adaptive vs Wasm | 0.125 | [0.000, 0.200] | 0.0312 | 1.0000 | No |
| RQ3 | matrix | 125 | Adaptive vs JS | -1.450 | [-1.600, -1.200] | 0.0312 | 1.0000 | No |
| RQ3 | matrix | 125 | Adaptive vs Wasm | 0.100 | [-0.050, 0.125] | 0.2891 | 1.0000 | No |
| RQ3 | matrix | 175 | Adaptive vs JS | -3.700 | [-3.875, -3.425] | 0.0312 | 1.0000 | No |
| RQ3 | matrix | 175 | Adaptive vs Wasm | 0.175 | [0.050, 0.300] | 0.1250 | 1.0000 | No |
| RQ3 | matrix | 225 | Adaptive vs JS | -7.350 | [-7.875, -6.350] | 0.0312 | 1.0000 | No |
| RQ3 | matrix | 225 | Adaptive vs Wasm | 0.075 | [-0.125, 1.400] | 0.4141 | 1.0000 | No |
| RQ3 | matrix | 275 | Adaptive vs JS | -13.850 | [-14.050, -13.100] | 0.0312 | 1.0000 | No |
| RQ3 | matrix | 275 | Adaptive vs Wasm | -0.125 | [-0.550, 0.250] | 0.5605 | 1.0000 | No |
| RQ3 | sha256 | 2500 | Adaptive vs JS | 0.050 | [0.000, 0.100] | 0.0625 | 1.0000 | No |
| RQ3 | sha256 | 2500 | Adaptive vs Wasm | 0.100 | [-0.000, 0.100] | 0.0312 | 1.0000 | No |
| RQ3 | sha256 | 7500 | Adaptive vs JS | -0.150 | [-0.200, -0.050] | 0.0312 | 1.0000 | No |
| RQ3 | sha256 | 7500 | Adaptive vs Wasm | 0.100 | [0.000, 0.150] | 0.0312 | 1.0000 | No |
| RQ3 | sha256 | 12500 | Adaptive vs JS | -0.125 | [-0.200, -0.100] | 0.0469 | 1.0000 | No |
| RQ3 | sha256 | 12500 | Adaptive vs Wasm | 0.100 | [0.025, 0.125] | 0.0312 | 1.0000 | No |
| RQ3 | sha256 | 17500 | Adaptive vs JS | -0.200 | [-0.300, -0.150] | 0.0312 | 1.0000 | No |
| RQ3 | sha256 | 17500 | Adaptive vs Wasm | 0.100 | [0.000, 0.150] | 0.0469 | 1.0000 | No |
| RQ3 | sort | 1500 | Adaptive vs JS | 0.000 | [-0.100, 0.050] | 1.0000 | 1.0000 | No |
| RQ3 | sort | 1500 | Adaptive vs Wasm | 0.100 | [0.050, 0.150] | 0.0547 | 1.0000 | No |
| RQ3 | sort | 2500 | Adaptive vs JS | -0.025 | [-0.100, 0.000] | 0.0312 | 1.0000 | No |
| RQ3 | sort | 2500 | Adaptive vs Wasm | 0.075 | [0.000, 0.100] | 0.0312 | 1.0000 | No |
| RQ3 | sort | 3500 | Adaptive vs JS | -0.200 | [-0.225, -0.150] | 0.0312 | 1.0000 | No |
| RQ3 | sort | 3500 | Adaptive vs Wasm | 0.100 | [0.000, 0.125] | 0.0469 | 1.0000 | No |
| RQ3 | sort | 4500 | Adaptive vs JS | -0.200 | [-0.300, -0.200] | 0.2891 | 1.0000 | No |
| RQ3 | sort | 4500 | Adaptive vs Wasm | 0.100 | [0.000, 0.100] | 0.1250 | 1.0000 | No |