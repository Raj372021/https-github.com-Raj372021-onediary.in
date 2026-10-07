const fs = require('fs');
let code = fs.readFileSync('src/pages/WorkerDetail.tsx', 'utf-8');

code = code.replace(
    `<div className="bg-blue-700 text-white pt-4 pb-6 px-4 shadow-md rounded-b-3xl z-40 sticky top-0">`,
    `<div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white pt-4 pb-6 px-4 shadow-lg rounded-b-3xl z-40 sticky top-0">`
);

code = code.replace(
    `<h1 className="text-2xl font-bold leading-tight">{worker.name}</h1>`,
    `<h1 className="text-3xl font-extrabold leading-tight tracking-tight drop-shadow-md">{worker.name}</h1>`
);

code = code.replace(
    `const isSelected = getWorkerStatus(worker.id) === status;`, // BulkAttendance had this, WorkerDetail uses record.status === status
    ``
); // No-op, just a note.

// Let's replace the status options buttons in WorkerDetail
const oldStatusButtons = `{statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => handleUpdate(record.dateStr, 'status', status)}
                  className={\`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors flex-1 \${
                    record.status === status 
                      ? 'bg-blue-700 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }\`}
                >
                  {status}
                </button>
              ))}`;

const newStatusButtons = `{statusOptions.map(status => {
                const statusColors = {
                  'P': 'bg-emerald-500',
                  'P+1/2': 'bg-teal-500',
                  'PP': 'bg-cyan-600',
                  'PPP': 'bg-blue-600',
                  'A': 'bg-rose-500'
                };
                const colorClass = (statusColors as any)[status] || 'bg-blue-700';
                return (
                <button
                  key={status}
                  onClick={() => handleUpdate(record.dateStr, 'status', status)}
                  className={\`px-4 py-2.5 rounded-xl text-sm font-extrabold whitespace-nowrap transition-all flex-1 \${
                    record.status === status 
                      ? \`\${colorClass} text-white shadow-md scale-105\` 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }\`}
                >
                  {status}
                </button>
              )
              })}`;

code = code.replace(oldStatusButtons, newStatusButtons);

code = code.replace(
    `<button 
          onClick={handlePayment}
          disabled={loading || balance <= 0}
          className="w-full bg-blue-700 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center transition hover:bg-blue-800 disabled:opacity-70 shadow-lg"
        >`,
    `<button 
          onClick={handlePayment}
          disabled={loading || balance <= 0}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-extrabold text-xl py-4 rounded-2xl flex items-center justify-center transition-all hover:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 shadow-xl shadow-blue-200"
        >`
);

fs.writeFileSync('src/pages/WorkerDetail.tsx', code);
