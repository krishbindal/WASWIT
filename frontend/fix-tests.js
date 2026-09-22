const fs = require('fs');

let content = fs.readFileSync('frontend/src/components/dashboard/dashboard.test.tsx', 'utf8');

content = content.replace(/cpu: 'Core i9',/, "cpuModel: 'Unavailable', logicalProcessorCount: 16,");
content = content.replace(/ram: '32GB',/, "approximateDeviceMemoryGB: 32,");
content = content.replace(/expect\(screen.getByText\('Core i9'\)\).toBeDefined\(\);/, "expect(screen.getByText('16 cores (Unavailable)')).toBeDefined();");
content = content.replace(/expect\(screen.getByText\('32GB'\)\).toBeDefined\(\);/, "expect(screen.getByText('32 GB')).toBeDefined();");

// also update the runs={{}} for DashboardShell
content = content.replace(/<DashboardShell runs={{}} \/>/g, "<DashboardShell runs={{}} frozenPolicy={null} />");

fs.writeFileSync('frontend/src/components/dashboard/dashboard.test.tsx', content);
console.log("Done");
