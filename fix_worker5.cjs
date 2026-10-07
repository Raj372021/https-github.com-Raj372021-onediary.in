const fs = require('fs');
let content = fs.readFileSync('src/pages/WorkerDetail.tsx', 'utf8');

const t2 = `<button onClick={() => navigate(-1)} className="mr-3 hover:bg-blue-600 p-2 rounded-full transition-colors">
          </button>`;
const r2 = `<button onClick={() => navigate(-1)} className="mr-3 hover:bg-blue-600 p-2 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>`;
content = content.replace(t2, r2);

// Check if any other button was wiped
const t3 = `<button onClick={() => setShowUPIOptions(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
              </button>`;
const r3 = `<button onClick={() => setShowUPIOptions(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>`;
content = content.replace(t3, r3);

fs.writeFileSync('src/pages/WorkerDetail.tsx', content);
