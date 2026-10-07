import { useAppContext } from "../context/AppContext";
import { ArrowDownToLine, ArrowUpFromLine, Users, Wallet, TrendingUp, TrendingDown, ChevronRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Hisab() {
  const { getAllWorkerStats, getCashStats, formatCurrency, userProfile } = useAppContext();
  const navigate = useNavigate();
  
  const workerStats = getAllWorkerStats();
  
  // Total plus (payable to workers)
  const totalPayableToWorkers = workerStats.reduce((sum, w) => sum + Math.max(0, w.balance), 0);
  
  // Total minus (advance given to workers)
  const totalAdvanceToWorkers = workerStats.reduce((sum, w) => sum + Math.abs(Math.min(0, w.balance)), 0); 
  
  const cashStats = getCashStats();
  const overallBalance = cashStats.balance - totalPayableToWorkers;

  const groupedWorkers = workerStats.reduce((acc, worker) => {
    const cat = worker.category || 'Labour';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(worker);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Header */}
      <div className="bg-amber-500 text-white p-4 sticky top-0 z-40 shadow-sm flex items-center justify-between pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 p-1 cursor-pointer">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold">All People Details</h1>
            <p className="text-amber-100 text-xs">Total Hisab Overview</p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            const workerDetails = workerStats.map(w => `- ${w.name}: Dena Hai (Plus) ${formatCurrency(w.balance || 0)}`).join('\n');
            const message = `*TOTAL HISAB OVERVIEW*\n\n*Kitna Dena Hai (Plus):* ${formatCurrency(totalPayableToWorkers)}\n*Advance Diya (Minus):* ${formatCurrency(totalAdvanceToWorkers)}\n\n*Worker Details:*\n${workerDetails}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
          }}
          className="p-2 hover:bg-white/10 rounded-full text-white transition cursor-pointer"
          title="Share on WhatsApp"
        >
          <span className="font-bold text-xl leading-none">✆</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Workers Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center">
              <Users className="mr-2 text-orange-600 dark:text-orange-400" size={20} />
              <h2 className="font-bold text-gray-900 dark:text-slate-100">Plus / Minus Total</h2>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 dark:bg-slate-800/60 rounded-lg p-3 border border-emerald-100 dark:border-emerald-900/60">
              <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider mb-1">Kitna Dena Hai (Plus)</div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPayableToWorkers)}</div>
            </div>
            <div className="bg-red-50 dark:bg-slate-800/60 rounded-lg p-3 border border-red-100 dark:border-red-900/60">
              <div className="text-[10px] text-red-800 dark:text-red-300 font-bold uppercase tracking-wider mb-1">Advance Diya (Minus)</div>
              <div className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalAdvanceToWorkers)}</div>
            </div>
          </div>
        </div>

        {/* List All People */}
        <div className="space-y-6 mt-6">
          {Object.entries(groupedWorkers).map(([category, catWorkers]) => (
            <div key={category} className="space-y-3">
              <h3 className="font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wide text-xs border-b border-gray-200 dark:border-slate-800 pb-1 mx-2">{category}</h3>
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                {(catWorkers as any[]).sort((a,b) => b.balance - a.balance).map((w, idx) => (
                  <div 
                    key={w.id} 
                    onClick={() => navigate(`/worker/${w.id}`)}
                    className={`flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/60 active:bg-gray-100 transition-colors ${idx !== (catWorkers as any[]).length - 1 ? 'border-b border-gray-100 dark:border-slate-800' : ''}`}
                  >
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 dark:text-slate-100 text-base">{w.name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        <span className="mr-3">Present: <strong className="text-gray-700 dark:text-slate-200">{w.presentDays || 0}</strong></span>
                      </div>
                    </div>
                    <div className="text-right flex items-center">
                      <div className="mr-3">
                        <div className={`font-bold text-lg ${w.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                          {w.balance >= 0 ? '+' : ''}{formatCurrency(w.balance)}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium uppercase text-right">
                          {w.balance >= 0 ? 'Plus' : 'Minus'}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-400 dark:text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {workerStats.length === 0 && (
            <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <Users size={40} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-gray-500 dark:text-slate-400 font-medium">No records found</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
