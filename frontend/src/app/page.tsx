import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">WASWIT</h1>
        <p className="text-xl text-gray-600">
          Workload-Aware Intelligent Selection between JavaScript and WebAssembly
        </p>
        <div className="mt-4 inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md font-medium text-sm">
          System currently under development
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <section className="border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Workload Configuration</h2>
          <div className="text-gray-500 italic">
            <p>Placeholder: Benchmark controls will go here.</p>
            <p className="text-sm mt-2">(e.g., Workload Type, Input Size, Execution Mode)</p>
          </div>
        </section>

        <section className="border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Results Dashboard</h2>
          <div className="text-gray-500 italic">
            <p>Placeholder: Measurement results and visualization will go here.</p>
            <p className="text-sm mt-2">(e.g., Execution Time, Throughput, Charts)</p>
          </div>
        </section>
      </div>
    </main>
  );
}
