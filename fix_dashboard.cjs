const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const oldGrid = `<div className="grid grid-cols-4 gap-3 p-4 mt-2">
        <button 
          onClick={() => navigate('/bulk-attendance')}
          className="bg-emerald-500 hover:bg-emerald-600 transition text-white p-3 rounded-2xl flex flex-col items-center justify-center shadow-sm"
        >
          <Calendar size={24} className="mb-2" />
          <span className="font-bold text-[10px] text-center leading-tight">Mark<br/>Attendance</span>
        </button>
        
        <button 
          onClick={() => navigate('/workers')}
          className="bg-blue-600 hover:bg-blue-700 transition text-white p-3 rounded-2xl flex flex-col items-center justify-center shadow-sm"
        >
          <Users size={24} className="mb-2" />
          <span className="font-bold text-[10px] text-center leading-tight">Add<br/>Workers</span>
        </button>

        <button 
          onClick={() => navigate('/cashbook')}
          className="bg-purple-500 hover:bg-purple-600 transition text-white p-3 rounded-2xl flex flex-col items-center justify-center shadow-sm"
        >
          <Wallet size={24} className="mb-2" />
          <span className="font-bold text-[10px] text-center leading-tight">Cash<br/>Book</span>
        </button>

        <button 
          onClick={() => navigate('/hisab')}
          className="bg-amber-500 hover:bg-amber-600 transition text-white p-3 rounded-2xl flex flex-col items-center justify-center shadow-sm"
        >
          <FileText size={24} className="mb-2" />
          <span className="font-bold text-[10px] text-center leading-tight">Hisab<br/>Record</span>
        </button>
      </div>`;

const newGrid = `<div className="grid grid-cols-5 gap-3 p-4 mt-2">
        <button onClick={() => navigate('/bulk-attendance')} className="flex flex-col items-center group">
          <div className="w-[52px] h-[52px] bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform mb-1.5 border border-emerald-400/50">
            <Calendar size={24} />
          </div>
          <span className="font-bold text-[10px] text-gray-700 text-center leading-tight">Mark<br/>Attend</span>
        </button>
        
        <button onClick={() => navigate('/workers')} className="flex flex-col items-center group">
          <div className="w-[52px] h-[52px] bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform mb-1.5 border border-blue-400/50">
            <Users size={24} />
          </div>
          <span className="font-bold text-[10px] text-gray-700 text-center leading-tight">Add<br/>Workers</span>
        </button>

        <button onClick={() => navigate('/cashbook')} className="flex flex-col items-center group">
          <div className="w-[52px] h-[52px] bg-gradient-to-br from-purple-400 to-fuchsia-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200 group-hover:scale-105 transition-transform mb-1.5 border border-purple-400/50">
            <Wallet size={24} />
          </div>
          <span className="font-bold text-[10px] text-gray-700 text-center leading-tight">Cash<br/>Book</span>
        </button>

        <button onClick={() => navigate('/hisab')} className="flex flex-col items-center group">
          <div className="w-[52px] h-[52px] bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200 group-hover:scale-105 transition-transform mb-1.5 border border-amber-400/50">
            <FileText size={24} />
          </div>
          <span className="font-bold text-[10px] text-gray-700 text-center leading-tight">Hisab<br/>Record</span>
        </button>
        
        <button onClick={() => navigate('/diary')} className="flex flex-col items-center group">
          <div className="w-[52px] h-[52px] bg-gradient-to-br from-rose-400 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200 group-hover:scale-105 transition-transform mb-1.5 border border-rose-400/50">
            <Book size={24} />
          </div>
          <span className="font-bold text-[10px] text-gray-700 text-center leading-tight">Smart<br/>Diary</span>
        </button>
      </div>`;

if (!code.includes('Book')) {
    code = code.replace(`import { Bell, Calendar, Users, Wallet, FileText, UserCheck, UserX, ChevronRight, BarChart } from "lucide-react";`,
    `import { Bell, Calendar, Users, Wallet, FileText, UserCheck, UserX, ChevronRight, BarChart, Book } from "lucide-react";`);
}

code = code.replace(oldGrid, newGrid);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
