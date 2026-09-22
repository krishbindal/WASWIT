# Project Overview

**Project Name:** WASWIT
**Final Project Title:** WASWIT: Workload-Aware Intelligent Selection between JavaScript and WebAssembly

## Overview
WebAssembly (Wasm) is often assumed to be universally faster than JavaScript for all computational tasks. However, its relative performance can vary significantly depending on the workload characteristics, input size, and the overhead associated with the JS-Wasm boundary (data serialization, memory transfer, and function invocation). 

WASWIT is an experimental browser-based framework that aims to dynamically select the appropriate execution environment-JavaScript or WebAssembly-based on workload characteristics at runtime.

## Objectives
1. Build a controlled environment to benchmark equivalent algorithms in both JavaScript and WebAssembly.
2. Characterize workloads by computational intensity and input size.
3. Design and implement a deterministic selection engine that routes execution to the most efficient environment based on empirical profiles.
4. Evaluate whether this adaptive approach yields better overall efficiency than statically choosing one environment.

## Context & Constraints
This project is a final-year B.Tech project. It focuses strictly on browser-side execution and deterministic selection criteria. It explicitly avoids using AI/ML, backend databases, and external cloud infrastructure, ensuring the scope remains manageable for a single developer while providing a rigorous academic investigation into browser execution optimization.
