const fs = require('fs');

// BulkAttendance.tsx
let bulkCode = fs.readFileSync('src/pages/BulkAttendance.tsx', 'utf-8');

const importStatement = `import { useState, useEffect } from "react";`;
const newImportStatement = `import { useState, useEffect } from "react";\nimport { Eye, EyeOff } from "lucide-react";`;
if (!bulkCode.includes('import { Eye')) {
  bulkCode = bulkCode.replace(importStatement, newImportStatement);
}

// Add a RateDisplay component inside or outside the file. Actually, we can just replace the span with a new component in the same file.

const rateDisplayComponent = `
const RateDisplay = ({ rate, formatCurrency }: { rate: number, formatCurrency: (val: number) => string }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <button 
      onClick={() => setIsVisible(!isVisible)}
      className="text-sm bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold flex items-center justify-center min-w-[80px] hover:bg-emerald-100 transition-colors cursor-pointer"
    >
      {isVisible ? (
        <>{formatCurrency(rate)}/day <EyeOff size={14} className="ml-1.5 opacity-60" /></>
      ) : (
        <><span className="opacity-50">••••</span> <Eye size={14} className="ml-1.5 opacity-60" /></>
      )}
    </button>
  );
};
`;

if (!bulkCode.includes('RateDisplay')) {
    bulkCode = bulkCode.replace(`export default function BulkAttendance() {`, rateDisplayComponent + `\nexport default function BulkAttendance() {`);
}

bulkCode = bulkCode.replace(
    `<span className="text-sm bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold">{formatCurrency(worker.dailyRate)}/day</span>`,
    `<RateDisplay rate={worker.dailyRate} formatCurrency={formatCurrency} />`
);

fs.writeFileSync('src/pages/BulkAttendance.tsx', bulkCode);
