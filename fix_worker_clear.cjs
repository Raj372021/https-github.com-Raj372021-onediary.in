const fs = require('fs');
let content = fs.readFileSync('src/pages/WorkerDetail.tsx', 'utf8');

const target = `        </div>
      </div>
    
      {showUPIOptions && (`;

const newButton = `        </div>
        <button 
          onClick={() => {
            if (!worker || balance <= 0) {
              alert("No pending balance to clear.");
              return;
            }
            if (window.confirm(\`Clear balance of \${formatCurrency(balance)}?\`)) {
              const today = new Date().toISOString().split('T')[0];
              updateAttendance(worker.id, today, { advance: balance, advanceNote: "Balance Cleared" });
            }
          }}
          disabled={!worker || balance <= 0}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-lg py-3 rounded-2xl flex items-center justify-center transition-all hover:scale-[0.98] disabled:opacity-70 shadow-md mt-3"
        >
          <CreditCard className="mr-2" size={18} />
          {balance > 0 ? \`Clear Record · \${formatCurrency(balance)}\` : "Record Cleared"}
        </button>
      </div>
    
      {showUPIOptions && (`

content = content.replace(target, newButton);
fs.writeFileSync('src/pages/WorkerDetail.tsx', content);
