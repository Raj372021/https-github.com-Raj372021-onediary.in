const fs = require('fs');
let code = fs.readFileSync('src/pages/WorkerDetail.tsx', 'utf-8');

const importStatement = `import { useState } from "react";`;
if (code.includes('import { useState }')) {
    code = code.replace(`import { useState } from "react";`, `import { useState } from "react";\nimport { Eye, EyeOff } from "lucide-react";`);
}

const rateDisplayComponent = `
const RateDisplay = ({ rate, formatCurrency }: { rate: number, formatCurrency: (val: number) => string }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <button 
      onClick={() => setIsVisible(!isVisible)}
      className="flex items-center text-blue-100 hover:text-white transition-colors"
    >
      <span className="mr-2">Rate:</span>
      <span className="font-bold mr-1.5 min-w-[50px] text-left">
        {isVisible ? formatCurrency(rate) : '••••'}
      </span>
      {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
    </button>
  );
};
`;

if (!code.includes('RateDisplay')) {
    code = code.replace(`export default function WorkerDetail() {`, rateDisplayComponent + `\nexport default function WorkerDetail() {`);
}

code = code.replace(
    `<span className="mr-3">Rate: {formatCurrency(worker.dailyRate)}/day</span>`,
    `<RateDisplay rate={worker.dailyRate} formatCurrency={formatCurrency} />`
);

fs.writeFileSync('src/pages/WorkerDetail.tsx', code);
