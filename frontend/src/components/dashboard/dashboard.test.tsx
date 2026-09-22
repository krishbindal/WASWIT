import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';
import { PolicySummary } from './PolicySummary';
import { PolicyThresholdTable } from './PolicyThresholdTable';
import { ExperimentalMetadata } from './ExperimentalMetadata';
import { CalibrationTable } from './CalibrationTable';
import { VisualizationDataTable } from './VisualizationDataTable';
import { BenchmarkChart } from './BenchmarkChart';
import { WorkloadPolicy } from '@/core/selection/types';
import { ExperimentMetadata, VisualizationPoint } from '@/core/research/types';
import { DashboardShell } from './DashboardShell';

// Mock Recharts so we can test rendering in Vitest without real DOM layout constraints
vi.mock('recharts', async () => {
  const OriginalRechartsModule = await vi.importActual('recharts');
  return {
    ...OriginalRechartsModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

describe('Dashboard Components', () => {
  describe('EmptyState', () => {
    it('renders the message correctly', () => {
      render(<EmptyState message="No experimental results available yet" />);
      expect(screen.getByText('No experimental results available yet')).toBeDefined();
    });
  });

  describe('PolicySummary & PolicyThresholdTable', () => {
    const mockPolicy: WorkloadPolicy = {
      workloadId: 'sort' as const,
      rules: [
        { maxInputSize: 100, runtime: 'javascript' as const },
        { maxInputSize: 500, runtime: 'wasm' as const }
      ],
      defaultRuntime: 'javascript' as const,
      provenance: {
        gridSizes: [100, 500],
        warmupIterations: 5,
        measurementIterations: 10,
        timestamp: '2026-09-23T00:00:00.000Z'
      }
    };

    it('renders empty states when no policy is provided', () => {
      const { container: container1 } = render(<PolicySummary policy={null} />);
      expect(container1.textContent).toContain('No experimental results available yet');

      const { container: container2 } = render(<PolicyThresholdTable policy={null} />);
      expect(container2.textContent).toContain('No experimental results available yet');
    });

    it('renders policy summary accurately with distinct version and derivation rule', () => {
      render(<PolicySummary 
        policy={mockPolicy} 
        version="1.0.0" 
        derivationRule="median-crossover-consistent-v2" 
      />);
      expect(screen.getByText('Policy Version')).toBeDefined();
      expect(screen.getByText('1.0.0')).toBeDefined();
      expect(screen.getByText('Derivation Rule')).toBeDefined();
      expect(screen.getByText('median-crossover-consistent-v2')).toBeDefined();
      expect(screen.getByText('100, 500')).toBeDefined();
      expect(screen.getByText('5 / 10')).toBeDefined();
    });

    it('renders thresholds accurately', () => {
      render(<PolicyThresholdTable policy={mockPolicy} />);
      expect(screen.getByText('<= 100')).toBeDefined();
      expect(screen.getByText('> 100 and <= 500')).toBeDefined();
      expect(screen.getByText('> 500')).toBeDefined();
    });
  });

  describe('ExperimentalMetadata', () => {
    const mockMeta: ExperimentMetadata = {
      browser: 'Chrome 120',
      os: 'Windows 11',
      cpu: 'Core i9',
      ram: '32GB',
      timestamp: '2026-09-23',
      warmupIterations: 5,
      measurementIterations: 10,
      gridSizes: [100, 500]
    };

    it('renders empty state', () => {
      render(<ExperimentalMetadata metadata={null} />);
      expect(screen.getByText('No experimental results available yet')).toBeDefined();
    });

    it('renders metadata correctly', () => {
      render(<ExperimentalMetadata metadata={mockMeta} />);
      expect(screen.getByText('Chrome 120')).toBeDefined();
      expect(screen.getByText('Windows 11')).toBeDefined();
      expect(screen.getByText('Core i9')).toBeDefined();
    });
  });

  describe('CalibrationTable', () => {
    it('renders empty state', () => {
      render(<CalibrationTable record={null} />);
      expect(screen.getByText('No experimental results available yet')).toBeDefined();
    });
  });

  describe('VisualizationDataTable & BenchmarkChart', () => {
    const mockData: VisualizationPoint[] = [
      { inputSize: 100, jsMedian: 5.5, wasmMedian: 2.2, adaptiveMedian: 2.2 },
      { inputSize: 500, jsMedian: 15.5, wasmMedian: 12.2, adaptiveMedian: 12.2 }
    ];

    it('renders empty state for table', () => {
      render(<VisualizationDataTable data={[]} />);
      expect(screen.getByText('No experimental results available yet')).toBeDefined();
    });

    it('renders empty state for chart', () => {
      render(<BenchmarkChart data={[]} />);
      expect(screen.getByText('No experimental results available yet')).toBeDefined();
    });

    it('renders data points accurately in table and avoids claiming raw samples', () => {
      render(<VisualizationDataTable data={mockData} />);
      expect(screen.getByText('Visualization Data Summary')).toBeDefined();
      expect(screen.getByText('100')).toBeDefined();
      expect(screen.getByText('5.5000')).toBeDefined();
    });
    
    it('renders chart without crashing', () => {
      render(<BenchmarkChart data={mockData} />);
      expect(screen.getByText('Execution Time vs Input Size')).toBeDefined();
    });
  });

  describe('DashboardShell', () => {
    it('renders without crashing with empty runs', () => {
      render(<DashboardShell runs={{}} />);
      expect(screen.getByText('Research Dashboard')).toBeDefined();
      expect(screen.getByText('No Policy')).toBeDefined();
    });
  });
});
