import React from 'react';
import { VisualizationPoint } from '@/core/research/types';
import { EmptyState } from './EmptyState';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BenchmarkChartProps {
  data: VisualizationPoint[];
}

export function BenchmarkChart({ data }: BenchmarkChartProps) {
  if (!data || data.length === 0) {
    return <EmptyState message="No experimental results available yet" />;
  }

  return (
    <div className="p-4 border rounded bg-white shadow-sm w-full h-96">
      <h3 className="font-semibold mb-4">Execution Time vs Input Size</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 25,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="inputSize" 
            type="number"
            domain={['dataMin', 'dataMax']}
            label={{ value: 'Input Size', position: 'bottom', offset: 0 }}
            tickFormatter={(val) => val.toString()}
          />
          <YAxis 
            label={{ value: 'Execution Time (ms)', angle: -90, position: 'insideLeft', offset: -10 }}
            tickFormatter={(val) => val.toFixed(2)}
          />
          <Tooltip 
            formatter={(value: unknown) => [`${Number(value).toFixed(4)} ms`, undefined]}
            labelFormatter={(label) => `Input Size: ${label}`}
          />
          <Legend verticalAlign="top" height={36} />
          
          <Line 
            type="monotone" 
            dataKey="jsMedian" 
            name="JavaScript" 
            stroke="#eab308" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            dataKey="wasmMedian" 
            name="WebAssembly" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            dataKey="adaptiveMedian" 
            name="WASWIT" 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
