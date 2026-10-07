sed -i 's/<div className="grid grid-cols-2 gap-3 mb-3">/<div className="grid grid-cols-2 gap-3 mb-3">/g' src/pages/WorkerDetail.tsx

cat << 'INNER_EOF' > /tmp/worker_button.tsx
        <button 
          onClick={() => {
            if (!worker || balance <= 0) {
              alert("No pending balance to clear.");
              return;
            }
            if (window.confirm(`Clear balance of ${formatCurrency(balance)}?`)) {
              const today = new Date().toISOString().split('T')[0];
              updateAttendance(worker.id, today, { advance: balance, advanceNote: "Balance Cleared" });
              alert("Balance cleared automatically.");
            }
          }}
          disabled={!worker || balance <= 0}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-lg py-3 rounded-2xl flex items-center justify-center transition-all hover:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 shadow-md"
        >
          <CreditCard className="mr-2" size={18} />
          {balance > 0 ? `Clear Record · ${formatCurrency(balance)}` : "Record Cleared"}
        </button>
INNER_EOF

sed -i '/<\/div>\n      <\/div>\n    \n      {showUPIOptions && (/i \
        <button \
          onClick={() => {\
            if (!worker || balance <= 0) {\
              alert("No pending balance to clear.");\
              return;\
            }\
            if (window.confirm(`Clear balance of ${formatCurrency(balance)}?`)) {\
              const today = new Date().toISOString().split('\''T'\'')[0];\
              updateAttendance(worker.id, today, { advance: balance, advanceNote: "Balance Cleared" });\
            }\
          }}\
          disabled={!worker || balance <= 0}\
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-lg py-3 rounded-2xl flex items-center justify-center transition-all hover:scale-[0.98] disabled:opacity-70 shadow-md mt-3"\
        >\
          <CreditCard className="mr-2" size={18} />\
          {balance > 0 ? `Clear Record · ${formatCurrency(balance)}` : "Record Cleared"}\
        </button>\
' src/pages/WorkerDetail.tsx

