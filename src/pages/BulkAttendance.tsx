import { useState } from "react";
import { Eye, EyeOff, Palette } from "lucide-react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext, AttendanceStatus, Worker } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";
import { sanitizeInput } from "../utils/security";


const RateDisplay = ({ rate, formatCurrency, rateDisplayBg }: { rate: number, formatCurrency: (val: number) => string, rateDisplayBg?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const bgClass = rateDisplayBg || "bg-emerald-50 text-emerald-700 hover:bg-emerald-100";
  return (
    <button 
      onClick={() => setIsVisible(!isVisible)}
      className={`text-sm px-2.5 py-1 rounded-lg font-bold flex items-center justify-center min-w-[80px] transition-colors cursor-pointer ${bgClass}`}
    >
      {isVisible ? (
        <>{formatCurrency(rate)}/day <EyeOff size={14} className="ml-1.5 opacity-60" /></>
      ) : (
        <><span className="opacity-50">••••</span> <Eye size={14} className="ml-1.5 opacity-60" /></>
      )}
    </button>
  );
};

export default function BulkAttendance() {
  const navigate = useNavigate();
  const { workers, updateAttendance, attendances, formatCurrency, currency, attendanceThemeColor, setAttendanceThemeColor } = useAppContext();
  const { language, t } = useLanguage();

  const themeStyles = {
    GREEN: {
      headerBg: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700',
      headerSubtext: 'text-emerald-100',
      markAllBarBg: 'bg-emerald-700/80',
      markAllBtnHover: 'hover:bg-emerald-50 text-emerald-800',
      fullMonthBorder: 'border-emerald-500/50',
      toastBg: 'bg-emerald-600 border-emerald-400',
      tabActiveBg: 'bg-emerald-600 text-white shadow-sm',
      categoryTitle: 'text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
      cardBorderLeft: 'border-l-emerald-500',
      cardNameHover: 'hover:text-emerald-600 dark:hover:text-emerald-400',
      rateDisplayBg: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
      doneBtnBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-200'
    },
    PINK: {
      headerBg: 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700',
      headerSubtext: 'text-pink-100',
      markAllBarBg: 'bg-pink-700/80',
      markAllBtnHover: 'hover:bg-pink-50 text-pink-800',
      fullMonthBorder: 'border-pink-500/50',
      toastBg: 'bg-pink-600 border-pink-400',
      tabActiveBg: 'bg-pink-600 text-white shadow-sm',
      categoryTitle: 'text-pink-800 dark:text-pink-400 border-pink-100 dark:border-pink-900',
      cardBorderLeft: 'border-l-pink-500',
      cardNameHover: 'hover:text-pink-600 dark:hover:text-pink-400',
      rateDisplayBg: 'bg-pink-50 text-pink-700 hover:bg-pink-100',
      doneBtnBg: 'bg-gradient-to-r from-pink-500 to-rose-600 shadow-pink-200'
    },
    BLUE: {
      headerBg: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800',
      headerSubtext: 'text-blue-100',
      markAllBarBg: 'bg-blue-700/80',
      markAllBtnHover: 'hover:bg-blue-50 text-blue-800',
      fullMonthBorder: 'border-blue-500/50',
      toastBg: 'bg-blue-600 border-blue-400',
      tabActiveBg: 'bg-blue-600 text-white shadow-sm',
      categoryTitle: 'text-blue-800 dark:text-blue-400 border-blue-100 dark:border-blue-900',
      cardBorderLeft: 'border-l-blue-500',
      cardNameHover: 'hover:text-blue-600 dark:hover:text-blue-400',
      rateDisplayBg: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      doneBtnBg: 'bg-gradient-to-r from-blue-600 to-indigo-700 shadow-blue-200'
    },
    RED: {
      headerBg: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-800',
      headerSubtext: 'text-red-100',
      markAllBarBg: 'bg-red-700/80',
      markAllBtnHover: 'hover:bg-red-50 text-red-800',
      fullMonthBorder: 'border-red-500/50',
      toastBg: 'bg-red-600 border-red-400',
      tabActiveBg: 'bg-red-600 text-white shadow-sm',
      categoryTitle: 'text-red-800 dark:text-red-400 border-red-100 dark:border-red-900',
      cardBorderLeft: 'border-l-red-500',
      cardNameHover: 'hover:text-red-600 dark:hover:text-red-400',
      rateDisplayBg: 'bg-red-50 text-red-700 hover:bg-red-100',
      doneBtnBg: 'bg-gradient-to-r from-red-600 to-rose-700 shadow-red-200'
    }
  };

  const activeTheme = themeStyles[attendanceThemeColor || 'GREEN'];
  
  const todayStr = new Date().toISOString().split('T')[0];
  const displayDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isFullMonthOpen, setIsFullMonthOpen] = useState(false);

  const handleFullMonthMark = (statusToMark: AttendanceStatus) => {
    const now = new Date();
    const targetYear = now.getFullYear();
    const targetMonth = now.getMonth() + 1;
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const monthName = now.toLocaleString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'long', year: 'numeric' });

    filteredWorkersForAttendance.forEach(worker => {
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        updateAttendance(worker.id, dateStr, { status: statusToMark });
      }
    });

    const labelMap: Record<string, string> = {
      'P': language === 'hi' ? 'सिंगल (1.0)' : 'Single (1.0)',
      'P+1/2': language === 'hi' ? 'डेढ़ी (1.5)' : 'One & Half (1.5)',
      'PP': language === 'hi' ? 'डबल (2.0)' : 'Double (2.0)',
      'PPP': language === 'hi' ? 'ट्रिपल (3.0)' : 'Triple (3.0)',
      'A': language === 'hi' ? 'एब्सेंट (Absent)' : 'Absent (0.0)',
      '': language === 'hi' ? 'हाजिरी साफ़ (Cleared)' : 'Cleared'
    };

    const label = labelMap[statusToMark] || statusToMark || (language === 'hi' ? 'साफ़' : 'Cleared');
    setToastMsg(
      language === 'hi'
        ? `✓ सभी ${filteredWorkersForAttendance.length} मजदूरों के ${monthName} के पूरे ${daysInMonth} दिनों में "${label}" हाजिरी लग गई!`
        : `✓ Auto-marked "${label}" for all ${daysInMonth} days of ${monthName} across ${filteredWorkersForAttendance.length} workers!`
    );
    setTimeout(() => setToastMsg(null), 4000);
    setIsFullMonthOpen(false);
  };

  const statusOptions: AttendanceStatus[] = ['P', 'P+1/2', 'PP', 'PPP', 'A'];

  const getWorkerStatus = (workerId: string): AttendanceStatus => {
    const att = attendances.find(a => a.workerId === workerId && a.date === todayStr);
    return att?.status || '';
  };

  const getWorkerAdvance = (workerId: string): string => {
    const att = attendances.find(a => a.workerId === workerId && a.date === todayStr);
    return att?.advance?.toString() || '';
  };

  const getWorkerAdvanceNote = (workerId: string): string => {
    const att = attendances.find(a => a.workerId === workerId && a.date === todayStr);
    return att?.advanceNote || '';
  };

  const handleStatusChange = (workerId: string, status: AttendanceStatus) => {
    updateAttendance(workerId, todayStr, { status });
  };

  const handleAdvanceChange = (workerId: string, advance: string) => {
    updateAttendance(workerId, todayStr, { advance: Number(advance) || 0 });
  };

  const handleAdvanceNoteChange = (workerId: string, note: string) => {
    updateAttendance(workerId, todayStr, { advanceNote: sanitizeInput(note) });
  };

  const [selectedType, setSelectedType] = useState<'ALL' | 'LABOUR' | 'OFFICE'>('ALL');

  const filteredWorkersForAttendance = workers.filter(worker => {
    if (selectedType === 'ALL') return true;
    const isOffice = worker.workerType === 'OFFICE';
    return selectedType === 'OFFICE' ? isOffice : !isOffice;
  });

  const handleMarkAll = (status: AttendanceStatus) => {
    filteredWorkersForAttendance.forEach(worker => {
      updateAttendance(worker.id, todayStr, { status });
    });
  };

  const currSymbol = currency === 'INR' ? '₹' : '$';

  const groupedWorkers = filteredWorkersForAttendance.reduce((acc, worker) => {
    const cat = worker.category || 'Labour';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(worker);
    return acc;
  }, {} as Record<string, Worker[]>);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <div className={`${activeTheme.headerBg} text-white p-5 flex flex-col shadow-md sticky top-0 z-40 rounded-b-2xl transition-all duration-300`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-3">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold">{t('attendance.title')}</h1>
              <p className={`${activeTheme.headerSubtext} text-xs`}>{displayDate}</p>
            </div>
          </div>
        </div>

        {/* 🎨 4-Color Theme Selector for Attendance Header */}
        <div className="bg-black/20 backdrop-blur-md p-2.5 rounded-xl border border-white/20 mt-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-white">
            <Palette size={15} className="text-amber-300" />
            <span>{language === 'hi' ? 'बैकग्राउंड कलर:' : 'Header Color:'}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setAttendanceThemeColor('GREEN')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                attendanceThemeColor === 'GREEN' 
                  ? 'bg-emerald-300 text-slate-950 ring-2 ring-white scale-105 shadow-md' 
                  : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>{language === 'hi' ? 'हरा (Green)' : 'Green'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAttendanceThemeColor('PINK')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                attendanceThemeColor === 'PINK' 
                  ? 'bg-pink-300 text-slate-950 ring-2 ring-white scale-105 shadow-md' 
                  : 'bg-pink-900/60 text-pink-100 hover:bg-pink-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-pink-400"></span>
              <span>{language === 'hi' ? 'पिंक (Pink)' : 'Pink'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAttendanceThemeColor('BLUE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                attendanceThemeColor === 'BLUE' 
                  ? 'bg-blue-300 text-slate-950 ring-2 ring-white scale-105 shadow-md' 
                  : 'bg-blue-900/60 text-blue-100 hover:bg-blue-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <span>{language === 'hi' ? 'ब्लू (Blue)' : 'Blue'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAttendanceThemeColor('RED')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                attendanceThemeColor === 'RED' 
                  ? 'bg-red-300 text-slate-950 ring-2 ring-white scale-105 shadow-md' 
                  : 'bg-red-900/60 text-red-100 hover:bg-red-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              <span>{language === 'hi' ? 'रेड (Red)' : 'Red'}</span>
            </button>
          </div>
        </div>
        
        {workers.length > 0 && (
          <div className="mt-3 space-y-2">
            {/* 1. Daily Mark All Bar */}
            <div className={`${activeTheme.markAllBarBg} rounded-2xl p-3 sm:p-4 shadow-sm transition-colors`}>
              <div className="text-xs sm:text-sm text-white font-black uppercase mb-2.5 tracking-wider flex items-center justify-between">
                <span>{t('attendance.markAll')} ({filteredWorkersForAttendance.length} {selectedType === 'ALL' ? t('attendance.people') : selectedType === 'OFFICE' ? t('attendance.staff') : t('attendance.labour')})</span>
                <span className={`text-xs ${activeTheme.headerSubtext} font-black px-2 py-0.5 bg-black/20 rounded-md`}>Today</span>
              </div>
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-0.5">
                {statusOptions.map(status => (
                  <button
                    key={`all-${status}`}
                    onClick={() => handleMarkAll(status)}
                    className={`px-3 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex-1 bg-white shadow-sm cursor-pointer active:scale-95 hover:scale-102 ${activeTheme.markAllBtnHover}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Single Merged Full Month (August 2026) Bulk Attendance Trigger */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/50 rounded-xl p-2 text-white shadow-sm relative">
              <button
                type="button"
                onClick={() => setIsFullMonthOpen(!isFullMonthOpen)}
                className="w-full flex items-center justify-between text-left cursor-pointer bg-slate-950/80 hover:bg-slate-950 p-2 rounded-lg border border-emerald-500/40 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-xs border border-emerald-400/30">
                    ⚡
                  </span>
                  <div>
                    <span className="text-xs font-black text-emerald-300 uppercase tracking-wide block leading-tight">
                      Full Month Bulk Attendance (August 2026)
                    </span>
                    <span className="text-[10px] text-slate-300 font-medium leading-tight">
                      Auto-mark full month attendance for all {filteredWorkersForAttendance.length} workers in 1 click
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-lg shadow-xs hover:bg-amber-300 transition shrink-0 ml-2">
                  <span>{isFullMonthOpen ? 'Close' : 'Auto Mark'}</span>
                </div>
              </button>

              {isFullMonthOpen && (
                <div className="mt-2 pt-2 border-t border-emerald-800/60 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] font-extrabold text-amber-200 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Select Status for All 31 Days of August 2026:</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleFullMonthMark('P')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-1.5 px-2 rounded-lg shadow-2xs transition cursor-pointer active:scale-95 flex items-center justify-between border border-emerald-400/40"
                    >
                      <span>1.0 Single (P)</span>
                      <span className="bg-emerald-900/80 px-1 py-0.2 rounded text-[9px] font-mono">1.0</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFullMonthMark('P+1/2')}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-1.5 px-2 rounded-lg shadow-2xs transition cursor-pointer active:scale-95 flex items-center justify-between border border-amber-500/40"
                    >
                      <span>1.5 One & Half</span>
                      <span className="bg-amber-950/20 px-1 py-0.2 rounded text-[9px] font-mono">1.5</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFullMonthMark('PP')}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-1.5 px-2 rounded-lg shadow-2xs transition cursor-pointer active:scale-95 flex items-center justify-between border border-blue-400/40"
                    >
                      <span>2.0 Double (PP)</span>
                      <span className="bg-blue-950/80 px-1 py-0.2 rounded text-[9px] font-mono">2.0</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFullMonthMark('PPP')}
                      className="bg-pink-600 hover:bg-pink-500 text-white font-black text-xs py-1.5 px-2 rounded-lg shadow-2xs transition cursor-pointer active:scale-95 flex items-center justify-between border border-pink-400/40"
                    >
                      <span>3.0 Triple (PPP)</span>
                      <span className="bg-pink-950/80 px-1 py-0.2 rounded text-[9px] font-mono">3.0</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFullMonthMark('A')}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs py-1.5 px-2 rounded-lg shadow-2xs transition cursor-pointer active:scale-95 flex items-center justify-between border border-rose-400/40"
                    >
                      <span>Absent All (A)</span>
                      <span className="bg-rose-900/80 px-1 py-0.2 rounded text-[9px] font-mono">0.0</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFullMonthMark('')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-1.5 px-2 rounded-lg transition cursor-pointer active:scale-95 flex items-center justify-center gap-1 border border-slate-700"
                    >
                      <span>🗑️ Clear Month</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className={`mx-4 mt-3 ${activeTheme.toastBg} text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200`}>
          <span className="flex items-center gap-2">
            <span className="text-sm">✨</span>
            <span>{toastMsg}</span>
          </span>
          <button 
            onClick={() => setToastMsg(null)}
            className="text-white/80 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded bg-black/20"
          >
            ✕
          </button>
        </div>
      )}

      <div className="p-4 space-y-6">
        {/* Toggle Switcher for Attendance list */}
        <div className="flex bg-slate-200/75 dark:bg-slate-800 p-1 rounded-xl mb-4 border border-slate-300/40 dark:border-slate-700 shadow-inner">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`flex-1 text-center py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              selectedType === 'ALL'
                ? activeTheme.tabActiveBg
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            {t('attendance.all')} ({workers.length})
          </button>
          <button
            onClick={() => setSelectedType('LABOUR')}
            className={`flex-1 text-center py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
              selectedType === 'LABOUR'
                ? activeTheme.tabActiveBg
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            🔨 {t('attendance.labour')} ({workers.filter(w => w.workerType === 'LABOUR' || !w.workerType).length})
          </button>
          <button
            onClick={() => setSelectedType('OFFICE')}
            className={`flex-1 text-center py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
              selectedType === 'OFFICE'
                ? activeTheme.tabActiveBg
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            💼 {t('attendance.office')} ({workers.filter(w => w.workerType === 'OFFICE').length})
          </button>
        </div>

        {Object.entries(groupedWorkers).map(([category, catWorkers]) => {
          const displayCategory = category.toLowerCase() === 'labour' 
            ? t('attendance.labour') 
            : category.toLowerCase() === 'office' 
              ? t('attendance.office') 
              : category;

          return (
            <div key={category} className="space-y-4">
              <h2 className={`font-extrabold text-lg uppercase tracking-wider border-b-2 pb-2 ${activeTheme.categoryTitle}`}>
                {displayCategory}
              </h2>
              { (catWorkers as Worker[]).map(worker => (
                <div key={worker.id} className="rotating-blue-card-wrapper transition-all">
                  <div className="rotating-blue-card-inner p-4 sm:p-5 flex flex-col shadow-md border border-slate-300">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <h3 
                          className="font-black text-lg sm:text-xl text-slate-900 hover:text-blue-700 cursor-pointer transition-colors mr-1 tracking-tight"
                          onClick={() => navigate(`/worker/${worker.id}`)}
                        >
                          {worker.name}
                        </h3>
                        {worker.workerType === 'OFFICE' ? (
                          <span className="text-[9px] uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded font-black shadow-xs">
                            {t('attendance.office')}
                          </span>
                        ) : (
                          <span className="text-[9px] uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black shadow-xs">
                            {t('attendance.labour')}
                          </span>
                        )}
                        {worker.category && (
                          <span className="text-[10px] bg-slate-200 text-slate-800 border border-slate-300 px-2 py-0.5 rounded-full font-bold">
                            {worker.category}
                          </span>
                        )}
                      </div>
                      <RateDisplay rate={worker.dailyRate} formatCurrency={formatCurrency} rateDisplayBg="bg-blue-100 text-blue-900 border border-blue-300 hover:bg-blue-200 font-extrabold" />
                    </div>
                  
                  <div className="flex gap-2 sm:gap-2.5 mb-4 overflow-x-auto pb-1 pt-1">
                    {statusOptions.map(status => {
                      const isSelected = getWorkerStatus(worker.id) === status;
                      const statusColors = {
                        'P': 'bg-emerald-500 text-white shadow-emerald-500/40',
                        'P+1/2': 'bg-amber-400 text-slate-950 font-black shadow-amber-500/40',
                        'PP': 'bg-blue-600 text-white shadow-blue-500/40',
                        'PPP': 'bg-pink-600 text-white shadow-pink-500/40',
                        'A': 'bg-rose-600 text-white shadow-rose-500/40'
                      };
                      const colorClass = (statusColors as any)[status] || 'bg-emerald-500 text-white';
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(worker.id, status)}
                          className={`py-3 sm:py-3.5 px-3 sm:px-4 rounded-2xl text-base sm:text-lg font-black whitespace-nowrap transition-all flex-1 min-h-[48px] sm:min-h-[52px] flex items-center justify-center cursor-pointer active:scale-95 ${
                            isSelected 
                              ? `${colorClass} shadow-lg scale-105 ring-3 ring-amber-400` 
                              : 'bg-slate-200/90 text-slate-800 hover:bg-slate-300 border border-slate-300'
                          }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 bg-amber-50/95 dark:bg-slate-800/95 rounded-2xl p-4 border-2 border-amber-400 shadow-md">
                    <div className="flex items-center justify-between pb-2.5 border-b-2 border-amber-300 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-xl text-xs font-black shadow-sm">👤 लेबर</span>
                        <span className="text-base sm:text-lg font-black text-slate-950 dark:text-white tracking-tight">
                          {worker.name}
                        </span>
                      </div>
                      <span className="text-xs font-black text-amber-900 dark:text-amber-300 bg-amber-200 px-2.5 py-1 rounded-xl shadow-2xs">
                        {worker.rateType === 'MONTHLY' ? 'मासिक रेट' : 'दैनिक रेट'}: ₹{worker.dailyRate}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <label className="text-xs sm:text-sm uppercase text-slate-900 dark:text-slate-100 font-black ml-1 flex-1">{t('attendance.advance')} ({currSymbol})</label>
                      <input 
                        type="number"
                        placeholder="0"
                        value={getWorkerAdvance(worker.id)}
                        onChange={(e) => handleAdvanceChange(worker.id, e.target.value)}
                        className="w-36 bg-white border-2 border-amber-400 rounded-xl px-4 py-2.5 text-slate-950 font-black focus:outline-none focus:ring-2 focus:ring-amber-500 text-center shadow-xs text-2xl"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="text-xs uppercase text-slate-700 dark:text-slate-300 font-extrabold ml-1 flex-1">{t('attendance.detailNote')}</label>
                      <input 
                        type="text"
                        placeholder={t('attendance.notePlaceholder')}
                        value={getWorkerAdvanceNote(worker.id)}
                        onChange={(e) => handleAdvanceNoteChange(worker.id, e.target.value)}
                        className="flex-1 min-w-0 bg-white border-2 border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}

        {workers.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
            <p>{t('attendance.noWorkers')}</p>
            <button 
              onClick={() => navigate('/workers')}
              className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              {t('attendance.goToWorkers')}
            </button>
          </div>
        )}
      </div>

      {workers.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 p-4">
          <button 
            onClick={() => navigate('/')}
            className={`w-full ${activeTheme.doneBtnBg} text-white font-extrabold text-xl py-4 rounded-2xl flex items-center justify-center transition-all hover:scale-[0.98] shadow-lg cursor-pointer`}
          >
            <CheckCircle2 className="mr-2" size={20} />
            {t('attendance.doneToday')}
          </button>
        </div>
      )}
    </div>
  );
}
