import { Users, FileText, ChevronRight, Calculator, Wallet, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function Reports() {
  const navigate = useNavigate();
  const { getAllWorkerStats, getTodayStats, formatCurrency } = useAppContext();
  
  const workers = getAllWorkerStats();
  const stats = getTodayStats();
  
  const totalEarned = workers.reduce((sum, w) => sum + w.earned, 0);
  const totalAdvance = workers.reduce((sum, w) => sum + w.advance, 0);
  const totalBalance = workers.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-4 py-3 sm:px-6 sm:py-3.5 pb-4 rounded-b-2xl shadow-md sticky top-0 z-40 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1.5 hover:bg-white/15 rounded-full transition-colors shrink-0 cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg sm:text-xl font-bold flex items-center">
            <FileText className="mr-2 text-blue-200" size={22} /> Salary Reports
          </h1>
        </div>
        
        <div className="bg-blue-800/50 border border-white/10 rounded-2xl p-4 flex justify-between items-center shadow-inner mt-2">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Total Outstanding</p>
            <p className="text-3xl font-bold">{formatCurrency(Math.max(0, totalBalance))}</p>
          </div>
          <div className="bg-blue-600 p-3 rounded-xl">
            <Wallet size={28} className="text-blue-100" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Earned</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalEarned)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Advance</p>
            <p className="text-xl font-bold text-orange-500">{formatCurrency(totalAdvance)}</p>
          </div>
        </div>

        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Worker Balances</h2>
        
        <div className="space-y-3">
          {workers.map(worker => (
            <div 
              key={worker.id}
              onClick={() => navigate(`/worker/${worker.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:bg-blue-50 transition shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mr-3">
                    <Users size={16} />
                  </div>
                  <h3 className="font-bold text-gray-900">{worker.name}</h3>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </div>
              
              <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Earned</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(worker.earned)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Advance</p>
                  <p className="text-sm font-bold text-orange-500">{formatCurrency(worker.advance)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Balance</p>
                  <p className={`text-sm font-bold ${worker.balance > 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {formatCurrency(worker.balance)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {workers.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
              <FileText size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No reports available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
