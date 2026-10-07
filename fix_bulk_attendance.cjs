const fs = require('fs');
let code = fs.readFileSync('src/pages/BulkAttendance.tsx', 'utf-8');

code = code.replace(
    `<div className="bg-emerald-500 text-white p-4 flex flex-col shadow-sm sticky top-0 z-40">`,
    `<div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 flex flex-col shadow-md sticky top-0 z-40 rounded-b-2xl">`
);

code = code.replace(
    `<div className="text-xs text-emerald-100 font-bold uppercase mb-2">Mark All ({workers.length} Workers)</div>`,
    `<div className="text-sm text-white font-extrabold uppercase mb-3 tracking-wider">Mark All ({workers.length} Workers)</div>`
);

code = code.replace(
    `<h2 className="font-bold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-1">{category}</h2>`,
    `<h2 className="font-extrabold text-lg text-emerald-800 uppercase tracking-wider border-b-2 border-emerald-100 pb-2">{category}</h2>`
);

code = code.replace(
    `<div key={worker.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">`,
    `<div key={worker.id} className="bg-white rounded-2xl shadow-md border-l-4 border-l-emerald-400 border-y border-r border-gray-100 p-5 hover:shadow-lg transition-shadow">`
);

code = code.replace(
    `<h3 
                      className="font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors mr-2"`,
    `<h3 
                      className="font-extrabold text-xl text-gray-800 cursor-pointer hover:text-emerald-600 transition-colors mr-2 tracking-tight"`
);

code = code.replace(
    `<span className="text-xs text-gray-500 font-medium">{formatCurrency(worker.dailyRate)}/day</span>`,
    `<span className="text-sm bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold">{formatCurrency(worker.dailyRate)}/day</span>`
);

code = code.replace(
    `const isSelected = getWorkerStatus(worker.id) === status;
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(worker.id, status)}
                        className={\`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors flex-1 \${
                          isSelected 
                            ? 'bg-emerald-500 text-white shadow-sm' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }\`}
                      >`,
    `const isSelected = getWorkerStatus(worker.id) === status;
                    const statusColors = {
                      'P': 'bg-emerald-500',
                      'P+1/2': 'bg-teal-500',
                      'PP': 'bg-cyan-600',
                      'PPP': 'bg-blue-600',
                      'A': 'bg-rose-500'
                    };
                    const colorClass = (statusColors as any)[status] || 'bg-emerald-500';
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(worker.id, status)}
                        className={\`px-3 py-2 rounded-xl text-sm font-extrabold whitespace-nowrap transition-all flex-1 \${
                          isSelected 
                            ? \`\${colorClass} text-white shadow-md scale-105\` 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }\`}
                      >`
);

code = code.replace(
    `onClick={() => navigate('/')}
            className="w-full bg-emerald-500 text-white font-bold text-lg py-3 rounded-xl flex items-center justify-center transition hover:bg-emerald-600 shadow-sm"`,
    `onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xl py-4 rounded-2xl flex items-center justify-center transition-all hover:scale-[0.98] shadow-lg shadow-emerald-200"`
);

fs.writeFileSync('src/pages/BulkAttendance.tsx', code);
