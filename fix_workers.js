const fs = require('fs');
let code = fs.readFileSync('src/pages/Workers.tsx', 'utf-8');

code = code.replace(
`        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Worker List ({workers.length})</h2>
          <button 
            onClick={() => {
              if (isFreePlanLimitReached) {
                alert("Free plan limit reached (10 workers max). Please upgrade to Pro in the Subscription menu to add more.");
                navigate('/subscriptions');
              } else {
                setShowAddForm(true);
              }
            }}
            className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center"
          >
            <Plus size={16} className="mr-1" /> Add New
          </button>
        </div>`,
`        <div className="mb-6">
          <button 
            onClick={() => {
              if (isFreePlanLimitReached) {
                alert("Free plan limit reached (10 workers max). Please upgrade to Pro in the Subscription menu to add more.");
                navigate('/subscriptions');
              } else {
                setShowAddForm(true);
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center shadow-lg shadow-blue-200"
          >
            <Plus size={24} className="mr-2" /> Add New Worker
          </button>
        </div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Worker List ({workers.length})</h2>
        </div>`
);

fs.writeFileSync('src/pages/Workers.tsx', code);
