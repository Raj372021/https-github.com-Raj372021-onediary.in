const fs = require('fs');
let content = fs.readFileSync('src/pages/WorkerDetail.tsx', 'utf8');

const target = `    <button 
    </button>`;

const replacement = `    <button 
      onClick={() => setIsVisible(!isVisible)} 
      className="bg-white/20 text-white rounded-full px-3 py-1 flex items-center text-xs font-semibold backdrop-blur-sm mr-3"
    >
      {isVisible ? <EyeOff size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />}
      {isVisible ? formatCurrency(rate) + '/day' : 'Show Rate'}
    </button>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/WorkerDetail.tsx', content);
