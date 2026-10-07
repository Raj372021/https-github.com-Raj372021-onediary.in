import React, { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Trash2, Edit, Eye, EyeOff, MessageCircle, Smartphone, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, ListFilter, CheckCircle2, Sun, Moon, Phone, PhoneCall, Plus, IndianRupee, Lock } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext, AttendanceStatus } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";
import { launchUpiPayment } from "../utils/upiHelper";
import { getHolidayForDate, getHolidaysForMonth } from "../utils/indianHolidays";
import { FESTIVALS_2026 } from "../components/FestivalCalendarModal";
import { sanitizeInput } from "../utils/security";

const RateDisplay = ({ 
  rate, 
  rateType, 
  formatCurrency, 
  language 
}: { 
  rate: number, 
  rateType?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ROUND', 
  formatCurrency: (val: number) => string,
  language?: string 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const typeLabels = {
    DAILY: '/day',
    WEEKLY: '/wk',
    MONTHLY: '/mo',
    ROUND: ' Fixed'
  };
  const label = typeLabels[rateType || 'DAILY'];
  return (
    <button 
      type="button"
      onClick={() => setIsVisible(!isVisible)} 
      className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/90 dark:hover:bg-blue-900 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700 rounded-lg px-2.5 py-1 flex items-center text-xs font-black transition cursor-pointer shadow-xs gap-1.5 shrink-0"
      title={isVisible ? (language === 'hi' ? "रेट छिपाएं (Hide Rate)" : "Hide Rate") : (language === 'hi' ? "रेट देखें (Show Rate)" : "Show Rate")}
    >
      {isVisible ? (
        <>
          <span>{formatCurrency(rate)}{label}</span>
          <EyeOff size={13} className="text-blue-700 dark:text-blue-400 opacity-80" />
        </>
      ) : (
        <>
          <span className="opacity-75 tracking-wider">•••• {language === 'hi' ? 'दर' : 'Rate'}</span>
          <Eye size={13} className="text-blue-700 dark:text-blue-400 opacity-80" />
        </>
      )}
    </button>
  );
};

export default function WorkerDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { workers, attendances, updateAttendance, getWorkerStats, getWorkerAttendance, currency, formatCurrency, deleteWorker, updateWorker, theme, toggleTheme } = useAppContext();
  const { language, t } = useLanguage();
  
  const worker = workers.find(w => w.id === id);
  const [loading, setLoading] = useState(false);
  const [showUPIOptions, setShowUPIOptions] = useState(false);
  const [showQuickAdvanceModal, setShowQuickAdvanceModal] = useState(false);
  const [quickAdvanceDate, setQuickAdvanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [quickAdvanceAmount, setQuickAdvanceAmount] = useState('');
  const [quickAdvanceNote, setQuickAdvanceNote] = useState('');
  const [quickPaymentMode, setQuickPaymentMode] = useState<'CASH' | 'UPI' | 'BANK'>('CASH');

  const laborCategories = ["Labour", "Painter", "Polish", "Electrician", "Carpenter", "Mason (Kadiya)", "Plumber", "POP", "Real Estate Contractor", "Other"];
  const officeCategories = ["Supervisor", "Manager", "Accountant", "Office Assistant", "Clerk", "Sales", "Real Estate Agent / Broker", "HR", "Engineer", "Peon", "Other Staff"];

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(worker?.name || '');
  const [editRate, setEditRate] = useState(worker?.dailyRate?.toString() || '');
  const [editPhone, setEditPhone] = useState(worker?.phone || '');
  const [editPaymentPhone, setEditPaymentPhone] = useState(worker?.paymentPhone || '');
  const [editCategory, setEditCategory] = useState(worker?.category || 'Labour');
  const [editWorkerType, setEditWorkerType] = useState<'LABOUR' | 'OFFICE'>((worker?.workerType as any) || 'LABOUR');
  const [editRateType, setEditRateType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ROUND'>(worker?.rateType || 'DAILY');
  
  // Initialize view tab from localStorage or worker's rateType, so it stays persistently selected
  const [selectedViewTab, setSelectedViewTab] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ROUND'>(() => {
    try {
      if (worker?.id) {
        const savedTab = localStorage.getItem(`onediary_worker_tab_${worker.id}`);
        if (savedTab && ['DAILY', 'WEEKLY', 'MONTHLY', 'ROUND'].includes(savedTab)) {
          return savedTab as any;
        }
      }
      return worker?.rateType || 'DAILY';
    } catch (e) {
      return worker?.rateType || 'DAILY';
    }
  });

  // Keep selected tab in sync if worker loads or rateType is explicitly updated
  useEffect(() => {
    if (worker?.id) {
      try {
        const savedTab = localStorage.getItem(`onediary_worker_tab_${worker.id}`) as any;
        if (savedTab && ['DAILY', 'WEEKLY', 'MONTHLY', 'ROUND'].includes(savedTab)) {
          setSelectedViewTab(savedTab);
        } else if (worker.rateType) {
          setSelectedViewTab(worker.rateType);
        }
      } catch (e) {}
    }
  }, [worker?.id, worker?.rateType]);

  // Handler for user clicking Daily, Wk, Mo, Fixed tabs with instant lock
  const handleSelectViewTab = (tab: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ROUND') => {
    setSelectedViewTab(tab);
    if (worker?.id) {
      try {
        localStorage.setItem(`onediary_worker_tab_${worker.id}`, tab);
        localStorage.setItem('onediary_last_selected_view_tab', tab);
      } catch (e) {}
      // Update worker rateType in context & DB so it permanently sticks for this worker
      updateWorker(worker.id, { rateType: tab });

      const tabLabel = tab === 'DAILY' ? (language === 'hi' ? 'दैनिक (Daily)' : 'Daily') :
                       tab === 'WEEKLY' ? (language === 'hi' ? 'साप्ताहिक (Weekly)' : 'Weekly') :
                       tab === 'MONTHLY' ? (language === 'hi' ? 'मासिक (Monthly)' : 'Monthly') :
                       (language === 'hi' ? 'ठेका / फिक्स (Fixed)' : 'Fixed');
      setToastMsg(`🔒 ${tabLabel} ${language === 'hi' ? 'मोड लॉक हो गया!' : 'mode locked!'}`);
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  // Month & Year state for full month attendance viewing
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [displayMode, setDisplayMode] = useState<'BOTH' | 'CALENDAR' | 'LIST'>('LIST');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isBulkDropdownOpen, setIsBulkDropdownOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeAttendanceDate, setActiveAttendanceDate] = useState<string | null>(null);
  const [activeAdvanceDate, setActiveAdvanceDate] = useState<string | null>(null);
  const [tempAdvanceAmt, setTempAdvanceAmt] = useState<string>('');
  const [tempAdvanceNote, setTempAdvanceNote] = useState<string>('');

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const monthLocale = language === 'hi' ? 'hi-IN' : language === 'hinglish' ? 'en-IN' : 'en-US';
  const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString(monthLocale, { month: 'long', year: 'numeric' });
  const monthHolidays = getHolidaysForMonth(selectedMonth);
  
  // Use context data for selected month
  const monthAttendances = worker ? getWorkerAttendance(worker.id, selectedMonth, selectedYear) : [];
  const stats = worker ? getWorkerStats(worker.id) : { earned: 0, advance: 0, balance: 0, presentDays: 0 };
  const { earned, advance, balance } = stats;

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const calculateTabStats = () => {
    if (!worker) return { earned: 0, advance: 0, balance: 0, presentDays: 0, dena: 0, lena: 0 };
    
    // Calculate stats specifically for the selected month
    let monthPresentDays = 0;
    let monthAdvanceTaken = 0;

    monthAttendances.forEach(att => {
      if (att.status === 'P') monthPresentDays += 1;
      else if (att.status === 'P+1/2' || att.status === 'P.1/2') monthPresentDays += 1.5;
      else if (att.status === 'PP') monthPresentDays += 2;
      else if (att.status === 'PPP') monthPresentDays += 3;
      else if (att.status === 'OT') monthPresentDays += 1;

      if (att.advance) monthAdvanceTaken += (Number(att.advance) || 0);
    });

    const rate = Number(worker.dailyRate) || 0;
    let tabEarned = 0;
    
    if (selectedViewTab === 'DAILY') {
      tabEarned = monthPresentDays * rate;
    } else if (selectedViewTab === 'WEEKLY') {
      tabEarned = (monthPresentDays / 6) * rate;
    } else if (selectedViewTab === 'MONTHLY') {
      tabEarned = (monthPresentDays / 30) * rate;
    } else if (selectedViewTab === 'ROUND') {
      tabEarned = rate;
    }
    
    tabEarned = Math.round(tabEarned * 100) / 100;
    const tabAdvance = monthAdvanceTaken;
    const tabBalance = tabEarned - tabAdvance;
    
    return {
      earned: tabEarned,
      advance: tabAdvance,
      balance: tabBalance,
      presentDays: monthPresentDays,
      dena: tabBalance > 0 ? tabBalance : 0,
      lena: tabBalance < 0 ? Math.abs(tabBalance) : 0
    };
  };

  const tabStats = calculateTabStats();

  const shareOnWhatsApp = () => {
    if (!worker) return;
    const reportText = `*Hajiri & Wage Report (${monthName}): ${worker.name}*\n\n*Present Days:* ${tabStats.presentDays}\n*Total Earned:* ${formatCurrency(tabStats.earned)}\n*Total Advance:* ${formatCurrency(tabStats.advance)}\n*Net Balance:* ${formatCurrency(tabStats.balance)}\n\n_Generated via OneDiary.in_`;
    const encodedText = encodeURIComponent(reportText);
    let url = `https://wa.me/?text=${encodedText}`;
    if (worker.phone) {
      url = `https://wa.me/${worker.phone}?text=${encodedText}`;
    }
    window.open(url, '_blank');
  };

  const handleCall = (e?: any) => {
    if (e) e.stopPropagation();
    if (worker?.phone) {
      window.location.href = `tel:${worker.phone}`;
    } else {
      alert(language === 'hi' ? "इस कार्यकर्ता का फोन नंबर उपलब्ध नहीं है। एडिट पर क्लिक करके फोन नंबर जोड़ें।" : "Phone number not available. Click Edit to add phone number.");
    }
  };

  const openUPIApp = (app: string) => {
    if (!worker || balance <= 0) return;
    const rawTarget = worker.paymentPhone || worker.phone;
    const pa = rawTarget ? (rawTarget.includes('@') ? rawTarget : `${rawTarget}@upi`) : 'contractor@upi';

    launchUpiPayment({
      upiId: pa,
      payeeName: worker.name,
      amount: balance,
      note: `Labour Payment - ${worker.name}`,
      appName: app
    });

    const today = new Date().toISOString().split('T')[0];
    const existingToday = attendances.find(a => a.workerId === worker.id && a.date === today);
    const existingAdv = Number(existingToday?.advance) || 0;
    const noteText = existingAdv > 0 
      ? `${existingToday?.advanceNote || 'Advance'} + UPI (${app.toUpperCase()})`
      : `UPI Payment (${app.toUpperCase()})`;

    updateAttendance(worker.id, today, { 
      advance: existingAdv + balance, 
      advanceNote: noteText 
    });
    setShowUPIOptions(false);
  };

  const handleSaveQuickAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker) return;
    const amount = Number(quickAdvanceAmount) || 0;
    if (amount <= 0) {
      alert(language === 'hi' ? "कृपया मान्य राशि दर्ज करें" : "Please enter a valid amount");
      return;
    }

    const existingAtt = attendances.find(a => a.workerId === worker.id && a.date === quickAdvanceDate);
    const currentAdv = Number(existingAtt?.advance) || 0;
    const modeLabel = quickPaymentMode === 'UPI' ? 'UPI' : quickPaymentMode === 'BANK' ? 'Bank' : 'Cash';
    const noteStr = quickAdvanceNote.trim() 
      ? `${quickAdvanceNote.trim()} (${modeLabel})`
      : `${modeLabel} Advance/Payment`;

    const combinedNote = currentAdv > 0 
      ? `${existingAtt?.advanceNote || 'Advance'}, ${noteStr}`
      : noteStr;

    updateAttendance(worker.id, quickAdvanceDate, {
      advance: currentAdv + amount,
      advanceNote: sanitizeInput(combinedNote)
    });

    setToastMsg(language === 'hi' ? `✓ ₹${amount} का एडवांस/भुगतान सफलतापूर्वक दर्ज हो गया!` : `✓ ₹${amount} advance/payment successfully recorded!`);
    setTimeout(() => setToastMsg(null), 3000);
    setShowQuickAdvanceModal(false);
    setQuickAdvanceAmount('');
    setQuickAdvanceNote('');
  };

  if (!worker) {
    return <div className="p-8 text-center text-slate-600 font-bold">Worker not found</div>;
  }

  // Generate days for selected month
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(selectedYear, selectedMonth - 1, i + 1);
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
    const dayName = d.toLocaleDateString('hi-IN', { weekday: 'short' });
    const dayNameEn = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon ...
    const att = monthAttendances.find(a => a.date === dateStr);
    
    return {
      dayNum: i + 1,
      dateStr,
      displayDate: String(i + 1),
      dayName,
      dayNameEn,
      dayOfWeek,
      status: att?.status || '',
      advance: att?.advance?.toString() || '',
      advanceNote: att?.advanceNote || ''
    };
  });

  const filteredDays = days.filter(d => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'P') return d.status === 'P' || d.status === 'P+1/2' || d.status === 'PP' || d.status === 'PPP';
    if (filterStatus === 'A') return d.status === 'A';
    if (filterStatus === 'ADVANCE') return Number(d.advance) > 0;
    return true;
  });

  const handleUpdate = (dateStr: string, field: 'status' | 'advance' | 'advanceNote', value: any) => {
    updateAttendance(worker.id, dateStr, { [field]: value });
  };

  const handleBulkMarkMonth = (statusToMark: AttendanceStatus) => {
    if (!worker) return;
    const labelMap: Record<string, string> = {
      'P': language === 'hi' ? 'सिंगल (1.0)' : 'Single (1.0)',
      'P+1/2': language === 'hi' ? 'डेढ़ी (1.5)' : 'One & Half (1.5)',
      'PP': language === 'hi' ? 'डबल (2.0)' : 'Double (2.0)',
      'PPP': language === 'hi' ? 'ट्रिपल (3.0)' : 'Triple (3.0)',
      'A': language === 'hi' ? 'एब्सेंट (Absent)' : 'Absent (0.0)',
      '': language === 'hi' ? 'हाजिरी साफ़ (Cleared)' : 'Cleared'
    };
    
    // Mark attendance for all days of selected month
    days.forEach(d => {
      updateAttendance(worker.id, d.dateStr, { status: statusToMark });
    });

    const statusLabel = labelMap[statusToMark] || statusToMark || (language === 'hi' ? 'साफ़' : 'Cleared');
    const toastMessage = language === 'hi'
      ? `✓ ${monthName} के पूरे ${daysInMonth} दिनों में "${statusLabel}" हाजिरी लगा दी गई!`
      : `✓ Marked "${statusLabel}" attendance for all ${daysInMonth} days of ${monthName}!`;
    setToastMsg(toastMessage);
    setTimeout(() => setToastMsg(null), 3500);
    setIsBulkDropdownOpen(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${worker.name}?`)) {
      deleteWorker(worker.id);
      navigate(-1);
    }
  };

  const handleSaveEdit = () => {
    if (!editName || !editRate) return;
    updateWorker(worker.id, {
      name: editName.trim(),
      dailyRate: Number(editRate),
      phone: editPhone.trim(),
      paymentPhone: editPaymentPhone.trim(),
      category: editCategory,
      workerType: editWorkerType,
      rateType: editRateType
    });
    setSelectedViewTab(editRateType);
    try {
      localStorage.setItem(`onediary_worker_tab_${worker.id}`, editRateType);
      localStorage.setItem('onediary_last_selected_view_tab', editRateType);
    } catch (e) {}
    setShowEditModal(false);
    setToastMsg(language === 'hi' ? '✓ विवरण सफलतापूर्वक अपडेट हो गया!' : '✓ Worker details successfully updated!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const statusOptions: AttendanceStatus[] = ['P', 'P+1/2', 'PP', 'PPP', 'A'];

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-950 pb-28 font-sans">
      {/* 1. Sleek & Compact Sticky Top Header with Adaptive Theme & Clear Actions */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 px-3 sm:px-4 shadow-md z-40 sticky top-0 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0 text-slate-700 dark:text-slate-200 cursor-pointer"
              title="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white truncate">
              {worker.name}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* ➕ Quick Add Advance Button in Top Bar (Compact) */}
            <button 
              onClick={() => setShowQuickAdvanceModal(true)}
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition cursor-pointer shadow-xs active:scale-95 flex items-center gap-1 text-xs font-black border border-amber-600"
              title={language === 'hi' ? "एडवांस / भुगतान दर्ज करें" : "Add Advance / Payment"}
            >
              <Plus size={14} className="stroke-[3]" />
              <span>{language === 'hi' ? 'एडवांस' : 'Advance'}</span>
            </button>

            {/* Direct Call */}
            <button 
              onClick={handleCall}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition cursor-pointer shadow-xs active:scale-95 flex items-center gap-1 text-xs font-bold"
              title="Call Worker Direct"
            >
              <PhoneCall size={15} />
            </button>

            {/* WhatsApp */}
            <button 
              onClick={shareOnWhatsApp}
              className="p-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-xl transition cursor-pointer shadow-xs active:scale-95"
              title="WhatsApp Report"
            >
              <MessageCircle size={15} />
            </button>
          </div>
        </div>

        {/* Second Row: Rate, Category & Secondary Controls */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            {worker.category && (
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg font-bold shrink-0">
                {worker.category}
              </span>
            )}
            <RateDisplay rate={worker.dailyRate} rateType={worker.rateType} formatCurrency={formatCurrency} language={language} />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Dark / Light Mode Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg text-amber-500 dark:text-yellow-300 transition cursor-pointer shadow-2xs flex items-center justify-center"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={15} className="text-yellow-300" /> : <Moon size={15} className="text-slate-700" />}
            </button>

            {/* Edit Worker Button */}
            <button 
              onClick={() => {
                setEditName(worker.name || '');
                setEditRate(worker.dailyRate?.toString() || '');
                setEditPhone(worker.phone || '');
                setEditPaymentPhone(worker.paymentPhone || '');
                setEditCategory(worker.category || (worker.workerType === 'OFFICE' ? 'Office Assistant' : 'Labour'));
                setEditWorkerType((worker.workerType as any) || 'LABOUR');
                setEditRateType(worker.rateType || 'DAILY');
                setShowEditModal(true);
              }} 
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition cursor-pointer shadow-2xs text-xs font-bold"
              title={language === 'hi' ? "मज़दूर विवरण एडिट करें" : "Edit Worker"}
            >
              Edit
            </button>

            {/* Delete Worker */}
            <button 
              onClick={handleDelete} 
              className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-lg transition cursor-pointer shadow-2xs"
              title="Delete Worker"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Detailed Worker Summary Cards */}
        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0 shadow-inner">
                {(['DAILY', 'WEEKLY', 'MONTHLY', 'ROUND'] as const).map(tab => {
                  const isSelected = selectedViewTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => handleSelectViewTab(tab)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase cursor-pointer transition flex items-center gap-1 ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                      title={isSelected ? "🔒 Locked Mode" : `Click to select and lock ${tab}`}
                    >
                      {isSelected && <Lock size={9} className="stroke-[3] text-white" />}
                      <span>{tab === 'DAILY' ? 'Daily' : tab === 'WEEKLY' ? 'Wk' : tab === 'MONTHLY' ? 'Mo' : 'Fixed'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="text-[11px] text-blue-600 dark:text-amber-300 font-black">
              {t('workerDetail.month')}: {monthName}
            </div>
          </div>

          {/* 4 Summary Stat Cards with High Contrast & Readability */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-2 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('workerDetail.totalPresent')}</span>
              <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">{tabStats.presentDays} <span className="text-[10px] font-normal text-slate-500 dark:text-slate-300">{t('workerDetail.days')}</span></span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/60 rounded-xl p-2 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">{t('workerDetail.totalSalary')}</span>
              <span className="text-sm sm:text-base font-black text-blue-700 dark:text-blue-200">{formatCurrency(tabStats.earned)}</span>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/60 rounded-xl p-2 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">{t('workerDetail.totalAdvance')}</span>
              <span className="text-sm sm:text-base font-black text-amber-700 dark:text-amber-200">{formatCurrency(tabStats.advance)}</span>
            </div>

            <div className={`border rounded-xl p-2 flex flex-col items-center justify-center ${
              tabStats.balance >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800/60' : 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800/60'
            }`}>
              <span className={`text-[10px] font-bold uppercase ${tabStats.balance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                {tabStats.balance >= 0 ? t('workerDetail.payable') : t('workerDetail.receivable')}
              </span>
              <span className={`text-sm sm:text-base font-black ${tabStats.balance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                {formatCurrency(Math.abs(tabStats.balance))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Clear Full Month Section */}
      <div className="p-3 max-w-4xl mx-auto w-full space-y-3">
        {/* Month Selector Bar & Calendar Visibility Controller */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-2 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1 flex-wrap">
          <button 
            onClick={handlePrevMonth}
            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
          >
            <ChevronLeft size={14} /> {t('workerDetail.prev')}
          </button>
          
          <div className="text-center cursor-pointer" onClick={() => setDisplayMode(prev => prev === 'LIST' ? 'BOTH' : 'LIST')}>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">
              {t('workerDetail.fullMonth')}
            </div>
            <div className="text-xs font-black text-slate-900 dark:text-slate-100 capitalize flex items-center gap-1 justify-center mt-0.5">
              <CalendarIcon size={13} className="text-blue-600 dark:text-blue-400" /> {monthName}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Direct Calendar Visible ON/OFF Toggle Button */}
            <button
              type="button"
              onClick={() => setDisplayMode(prev => prev === 'LIST' ? 'BOTH' : 'LIST')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 border shadow-2xs ${
                displayMode !== 'LIST'
                  ? 'bg-amber-400 text-slate-950 border-amber-500'
                  : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <CalendarIcon size={12} />
              <span>{displayMode !== 'LIST' ? '📅 कैलेंडर ON (छिपाएं)' : '📅 कैलेंडर देखें (OFF)'}</span>
            </button>

            <button 
              onClick={handleNextMonth}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
            >
              {t('workerDetail.next')} <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Toast Notification Banner for Bulk Attendance Confirmation */}
        {toastMsg && (
          <div className="bg-emerald-600 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md border border-emerald-400 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="flex items-center gap-2">
              <span className="text-sm">✨</span>
              <span>{toastMsg}</span>
            </span>
            <button 
              onClick={() => setToastMsg(null)}
              className="text-white/80 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-700/60"
            >
              ✕
            </button>
          </div>
        )}

        {/* 3. Monthly Calendar Grid Matrix (30/31 Days visual summary) */}
        {(displayMode === 'BOTH' || displayMode === 'CALENDAR') && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-slate-200 dark:border-slate-800">
            {/* Single Box Collapsible Bulk Month Attendance + View Controls & Filter */}
            <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200 dark:from-amber-950/70 dark:via-yellow-950/70 dark:to-amber-900/70 border border-amber-300 dark:border-amber-800 rounded-lg p-1.5 mb-1.5 text-slate-950 dark:text-slate-100 shadow-2xs relative">
              {/* Clickable Main Merged Button Trigger + Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => setIsBulkDropdownOpen(!isBulkDropdownOpen)}
                  className="flex items-center justify-between text-left cursor-pointer group flex-1 bg-amber-50/90 dark:bg-slate-900/90 hover:bg-amber-100 dark:hover:bg-slate-900 px-2 py-1.5 rounded border border-amber-300 dark:border-amber-700/60 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded bg-amber-500/30 text-amber-950 dark:text-amber-300 flex items-center justify-center font-black text-[10px] border border-amber-400/50">
                      ⚡
                    </span>
                    <div>
                      <span className="text-[11px] font-black text-amber-950 dark:text-amber-200 uppercase tracking-wide block leading-none">
                        Full Month Bulk Attendance ({monthName})
                      </span>
                      <span className="text-[9px] text-slate-800 dark:text-slate-300 font-semibold leading-none mt-0.5 block">
                        Auto-mark attendance
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded shadow-2xs group-hover:bg-amber-300 transition shrink-0 ml-2">
                    <span>{isBulkDropdownOpen ? 'Close' : 'Bulk Options'}</span>
                    <ChevronRight size={11} className={`transition-transform duration-200 ${isBulkDropdownOpen ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Compact Toolbar: Calendar Visible ON/OFF Toggle & Status Filter */}
                <div className="flex items-center justify-between sm:justify-end gap-1.5 flex-wrap">
                  {/* Direct Calendar Visible Toggle */}
                  <div className="flex bg-slate-950/90 p-0.5 rounded-lg border border-slate-700/80 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDisplayMode('BOTH')}
                      className={`px-2.5 py-1 rounded text-[10px] font-black transition cursor-pointer ${displayMode === 'BOTH' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'}`}
                      title="Keep both Calendar and Attendance Log visible"
                    >
                      📅+📋 दोनों ऑन
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisplayMode('CALENDAR')}
                      className={`px-2 py-1 rounded text-[10px] font-black transition cursor-pointer ${displayMode === 'CALENDAR' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'}`}
                    >
                      📅 केवल कैलेंडर
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisplayMode('LIST')}
                      className={`px-2 py-1 rounded text-[10px] font-black transition cursor-pointer bg-rose-500/80 text-white hover:bg-rose-500`}
                      title="Hide Calendar and show only Attendance List"
                    >
                      👁️ OFF (छिपाएं)
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {[
                      { id: 'ALL', label: 'All' },
                      { id: 'P', label: 'P' },
                      { id: 'A', label: 'A' },
                      { id: 'ADVANCE', label: 'Advance' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilterStatus(f.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-black transition cursor-pointer shrink-0 ${
                          filterStatus === f.id 
                            ? 'bg-blue-500 text-white shadow-2xs border border-blue-300/50' 
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expanded Options inside Box */}
              {isBulkDropdownOpen && (
                <div className="mt-2 pt-2 border-t border-indigo-800/60 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] font-extrabold text-amber-200 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>
                      Select Option ({monthName} - all {daysInMonth} days):
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">P, P+1/2, PP, PPP, A</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleBulkMarkMonth('P')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-1.5 px-2.5 rounded-lg shadow-2xs transition cursor-pointer active:scale-95 flex items-center justify-between border border-emerald-400/40"
                    >
                      <span>1.0 Single (P)</span>
                      <span className="bg-emerald-900/80 px-1 py-0.2 rounded text-[9px] font-mono">1.0</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBulkMarkMonth('P+1/2')}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-1.5 px-2.5 rounded-lg shadow-2xs transition cursor-pointer active:scale-95 flex items-center justify-between border border-amber-500/40"
                    >
                      <span>1.5 One & Half (P+1/2)</span>
                      <span className="bg-amber-950/20 px-1 py-0.2 rounded text-[9px] font-mono">1.5</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBulkMarkMonth('PP')}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-1.5 px-2.5 rounded-lg shadow-2xs transition cursor-pointer active:scale-95 flex items-center justify-between border border-blue-400/40"
                    >
                      <span>2.0 Double (PP)</span>
                      <span className="bg-blue-950/80 px-1 py-0.2 rounded text-[9px] font-mono">2.0</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBulkMarkMonth('PPP')}
                      className="bg-pink-600 hover:bg-pink-500 text-white font-black text-xs py-1.5 px-2.5 rounded-lg shadow-2xs transition cursor-pointer active:scale-95 flex items-center justify-between border border-pink-400/40"
                    >
                      <span>3.0 Triple (PPP)</span>
                      <span className="bg-pink-950/80 px-1 py-0.2 rounded text-[9px] font-mono">3.0</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBulkMarkMonth('A')}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs py-1.5 px-2.5 rounded-lg shadow-2xs transition cursor-pointer active:scale-95 flex items-center justify-between border border-rose-400/40"
                    >
                      <span>Absent All (A)</span>
                      <span className="bg-rose-900/80 px-1 py-0.2 rounded text-[9px] font-mono">0.0</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBulkMarkMonth('')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-1.5 px-2.5 rounded-lg transition cursor-pointer active:scale-95 flex items-center justify-center gap-1 border border-slate-700"
                    >
                      <span>🗑️ Clear Attendance</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Calendar & Bottom Holidays Strip Section */}
            <div className="space-y-2">
              {/* Calendar Full Width Grid */}
              <div className="w-full space-y-1">
                {/* Days Header */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center font-black text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>

                {/* Calendar Cells */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {/* Padding offset for 1st day of month */}
                  {Array.from({ length: days[0]?.dayOfWeek || 0 }).map((_, emptyIdx) => (
                    <div key={`empty-${emptyIdx}`} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl sm:rounded-2xl h-14 sm:h-16 border border-slate-100 dark:border-slate-800 opacity-20" />
                  ))}

                  {days.map((dayItem) => {
                    const isPresent = dayItem.status === 'P' || dayItem.status === 'P+1/2' || dayItem.status === 'P.1/2' || dayItem.status === 'PP' || dayItem.status === 'PPP';
                    const isAbsent = dayItem.status === 'A';
                    const hasAdvance = Number(dayItem.advance) > 0;
                    const holiday = getHolidayForDate(selectedMonth, dayItem.displayDate);
                    const fest = FESTIVALS_2026[dayItem.dateStr];

                    let bgClass = 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-400';
                    if (dayItem.status === 'P') bgClass = 'bg-emerald-500 text-white border-2 border-emerald-600 font-extrabold shadow-sm';
                    else if (dayItem.status === 'P+1/2' || dayItem.status === 'P.1/2') bgClass = 'bg-amber-400 text-slate-950 border-2 border-amber-500 font-extrabold shadow-sm';
                    else if (dayItem.status === 'PP') bgClass = 'bg-blue-600 text-white border-2 border-blue-700 font-extrabold shadow-sm';
                    else if (dayItem.status === 'PPP') bgClass = 'bg-pink-600 text-white border-2 border-pink-700 font-extrabold shadow-sm';
                    else if (dayItem.status === 'OT') bgClass = 'bg-purple-600 text-white border-2 border-purple-700 font-extrabold shadow-sm';
                    else if (isAbsent) bgClass = 'bg-rose-600 text-white border-2 border-rose-700 font-extrabold shadow-sm';
                    else if (fest || holiday) bgClass = 'bg-amber-300 text-slate-950 border-2 border-amber-400 font-black shadow-sm';

                    const festivalTitle = fest ? (fest.name.hi || fest.name.en) : holiday ? holiday.nameHi : '';

                    return (
                      <button
                        key={dayItem.dateStr}
                        onClick={() => {
                          const nextStatus: Record<string, AttendanceStatus> = {
                            '': 'P',
                            'P': 'P+1/2',
                            'P+1/2': 'PP',
                            'PP': 'PPP',
                            'PPP': 'OT',
                            'OT': 'A',
                            'A': ''
                          };
                          handleUpdate(dayItem.dateStr, 'status', nextStatus[dayItem.status] || '');
                        }}
                        className={`h-14 sm:h-16 rounded-xl sm:rounded-2xl flex flex-col items-center justify-between p-1.5 sm:p-2 transition-all active:scale-95 cursor-pointer relative overflow-hidden ${bgClass}`}
                        title={`${holiday || fest ? `${fest?.icon || holiday?.symbol || '🎉'} ${festivalTitle} - ` : ''}Day ${dayItem.displayDate} (${dayItem.dayNameEn}) - ${dayItem.status || 'Not marked'}`}
                      >
                        {/* Background photo overlay for holiday if image exists */}
                        {fest?.image && (
                          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                            <img src={fest.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}

                        {/* Top Row: Date & Symbol */}
                        <div className="w-full flex items-center justify-between px-0.5 leading-none relative z-10">
                          <span className="text-xs sm:text-sm font-black leading-none opacity-95">{dayItem.displayDate}</span>
                          {(fest || holiday) && (
                            <div className="flex items-center gap-0.5">
                              {fest?.image && (
                                <div className="w-3 h-3 rounded-full overflow-hidden border border-amber-300 shadow-2xs shrink-0">
                                  <img src={fest.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                              )}
                              <span className="text-[9px] sm:text-[10px] leading-none" title={festivalTitle}>
                                {fest?.icon || holiday?.symbol}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Middle Row: Attendance status / Holiday name */}
                        <div className="w-full flex items-center justify-center leading-none relative z-10">
                          {dayItem.status ? (
                            <span className="text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-md bg-black/40 text-white leading-none min-w-[24px] text-center">
                              {dayItem.status}
                            </span>
                          ) : festivalTitle ? (
                            <span 
                              className="text-[8px] sm:text-[9px] font-black truncate w-full text-center px-1 py-0.5 bg-amber-200/95 text-amber-950 rounded-md leading-none block" 
                              title={festivalTitle}
                            >
                              {festivalTitle.split(' ')[0]}
                            </span>
                          ) : (
                            <span className="text-[9px] sm:text-[10px] opacity-30 font-bold">-</span>
                          )}
                        </div>

                        {hasAdvance && (
                          <span className="absolute -top-0.5 -right-0.5 bg-amber-400 text-slate-900 text-[8px] font-black px-1 rounded-full z-20">
                            ₹
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Proper Holiday List Section Below Calendar */}
              {monthHolidays.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-amber-900/30 border border-amber-300 dark:border-amber-800/80 rounded-xl p-2 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-amber-900 dark:text-amber-200 flex items-center gap-1 uppercase tracking-wide">
                      <span className="text-xs">🎉</span> {monthName} - त्यौहार (Holidays)
                    </span>
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                      {monthHolidays.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                    {monthHolidays.map((h, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-xs shrink-0">{h.symbol}</span>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-900 dark:text-amber-100 truncate">
                              {language === 'hi' ? h.nameHi : language === 'hinglish' ? `${h.nameEn} (${h.nameHi})` : h.nameEn}
                            </p>
                            <p className="text-[8px] font-bold text-amber-700 dark:text-amber-400 leading-none">
                              {h.day} {monthName}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Legend Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-3 pt-2 border-t dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> P (Present)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> P+1/2 (1.5)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> PP (Double)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-pink-600"></span> PPP (Triple)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> OT (Overtime)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> A (Absent)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> ₹ Advance</span>
            </div>
          </div>
        )}

        {/* 4. Day-by-Day Attendance List */}
        {(displayMode === 'BOTH' || displayMode === 'LIST') && (
          <div className="space-y-2">
            <div className="bg-amber-100 dark:bg-amber-950/90 border-2 border-amber-400 dark:border-amber-700 rounded-2xl p-3 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-slate-950 dark:text-white tracking-tight">👤 {worker.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-900 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900 px-2 py-1 rounded-lg">
                  📋 दैनिक हाजिरी ({filteredDays.length} दिन)
                </span>
                {displayMode === 'LIST' && (
                  <button
                    type="button"
                    onClick={() => setDisplayMode('BOTH')}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1.5 rounded-lg border border-amber-600 shadow-2xs transition cursor-pointer flex items-center gap-1"
                  >
                    <CalendarIcon size={12} />
                    <span>कैलेंडर</span>
                  </button>
                )}
              </div>
            </div>

            {filteredDays.map((record) => {
              return (
                <div key={record.dateStr} className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 flex items-center justify-between gap-2 hover:border-blue-300 dark:hover:border-blue-700 transition">
                  {/* Left: Date & Day */}
                  <div className="flex items-center gap-2.5 min-w-[75px]">
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 text-center min-w-[30px]">
                      {record.displayDate}
                    </span>
                    <div>
                      <div className="text-xs font-black text-slate-800 dark:text-slate-200">{record.dayNameEn}</div>
                      <div className="text-[9px] font-bold text-slate-400">{record.dayName}</div>
                    </div>
                  </div>

                  {/* Middle: Attendance Badge / Click to Open Attendance Modal */}
                  <button
                    type="button"
                    onClick={() => setActiveAttendanceDate(record.dateStr)}
                    className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 transition cursor-pointer min-w-[110px] sm:min-w-[130px]"
                  >
                    {record.status ? (
                      <span className={`text-xs sm:text-sm font-black px-2.5 sm:px-3 py-1 rounded-lg ${
                        record.status === 'P' ? 'bg-emerald-500 text-white' :
                        record.status === 'P+1/2' || record.status === 'P.1/2' ? 'bg-amber-400 text-slate-950 font-black' :
                        record.status === 'PP' ? 'bg-blue-600 text-white' :
                        record.status === 'PPP' ? 'bg-pink-600 text-white' :
                        record.status === 'OT' ? 'bg-purple-600 text-white' :
                        record.status === 'A' ? 'bg-rose-600 text-white' : 'bg-slate-500 text-white'
                      }`}>
                        {record.status}
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm font-black text-slate-400">Mark Hajiri</span>
                    )}
                    <span className="text-xs text-slate-400 font-black">▼</span>
                  </button>

                  {/* Right: Advance / Click to Open Advance Modal */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAdvanceDate(record.dateStr);
                      setTempAdvanceAmt(Number(record.advance) > 0 ? String(record.advance) : '');
                      setTempAdvanceNote(record.advanceNote || '');
                    }}
                    className={`flex items-center justify-between gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border-2 transition cursor-pointer min-w-[100px] sm:min-w-[110px] ${
                      Number(record.advance) > 0 
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-950 dark:text-amber-200 font-black' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-black">₹</span>
                    <span className="text-xs sm:text-sm font-bold">
                      {Number(record.advance) > 0 ? formatCurrency(Number(record.advance)) : 'Advance'}
                    </span>
                    <span className="text-xs opacity-75">›</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Customer / Worker Transaction Payment History Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 p-4 space-y-3 mt-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm">
                💳
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white">
                  {language === 'hi' ? 'लेन-देन / भुगतान इतिहास (Transaction History)' : 'Payment & Advance Transaction History'}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                  {monthName} • {monthAttendances.filter(att => Number(att.advance) > 0).length} {language === 'hi' ? 'लेन-देन रिकॉर्ड्स' : 'Transactions Recorded'}
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900/60">
              {language === 'hi' ? 'कुल भुगतान:' : 'Total Paid:'} {formatCurrency(tabStats.advance)}
            </span>
          </div>

          {monthAttendances.filter(att => Number(att.advance) > 0).length > 0 ? (
            <div className="space-y-2">
              {monthAttendances
                .filter(att => Number(att.advance) > 0)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-slate-100">
                          {tx.date} ({new Date(tx.date).toLocaleDateString('hi-IN', { weekday: 'short' })})
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                          {tx.advanceNote || (language === 'hi' ? 'कैश / यूपीआई भुगतान' : 'Advance Payment')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                        - {formatCurrency(Number(tx.advance))}
                      </span>
                      <span className="text-[9px] text-slate-400 block font-bold">Advance Entry</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-4 text-xs font-bold text-slate-400">
              {monthName} में कोई एडवांस/भुगतान लेन-देन दर्ज नहीं है।
            </div>
          )}
        </div>
      </div>


      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 z-40 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.1)]">
        <div className="max-w-md mx-auto flex gap-1.5 sm:gap-2">
          <button 
            onClick={handleCall}
            className="px-3 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold flex items-center justify-center transition shadow-sm text-xs cursor-pointer shrink-0"
            title="Call Phone"
          >
            <PhoneCall size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Call</span>
          </button>

          <button 
            onClick={() => setShowQuickAdvanceModal(true)}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl flex items-center justify-center transition shadow-sm text-xs cursor-pointer"
          >
            <Plus size={15} className="mr-1" />
            <span>{language === 'hi' ? 'एडवांस दें' : 'Add Advance'}</span>
          </button>

          <button 
            onClick={shareOnWhatsApp} 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold flex items-center justify-center transition shadow-sm text-xs cursor-pointer"
          >
            <MessageCircle size={15} className="mr-1" /> WhatsApp
          </button>

          <button 
            onClick={() => {
              if (!worker || balance <= 0) {
                alert(language === 'hi' ? "कोई बकाया राशि नहीं है।" : "No pending balance to clear.");
                return;
              }
              if (window.confirm(`Clear full balance of ${formatCurrency(balance)} for ${worker.name}?`)) {
                const today = new Date().toISOString().split('T')[0];
                const existingToday = attendances.find(a => a.workerId === worker.id && a.date === today);
                const existingAdv = Number(existingToday?.advance) || 0;
                const noteText = existingAdv > 0
                  ? `${existingToday?.advanceNote || 'Advance'} + Full Settlement (₹${balance})`
                  : `Full Settlement (₹${balance})`;

                updateAttendance(worker.id, today, { 
                  advance: existingAdv + balance, 
                  advanceNote: noteText 
                });

                setToastMsg(language === 'hi' ? `✓ ${formatCurrency(balance)} का पूरा हिसाब चुकता हो गया!` : `✓ Full balance of ${formatCurrency(balance)} cleared!`);
                setTimeout(() => setToastMsg(null), 3000);
              }
            }}
            disabled={!worker || balance <= 0}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center transition disabled:opacity-50 shadow-sm cursor-pointer"
          >
            <CreditCard className="mr-1" size={14} />
            {balance > 0 ? `Clear (${formatCurrency(balance)})` : "Paid"}
          </button>
        </div>
      </div>

      {/* Quick Advance / Payment Modal */}
      {showQuickAdvanceModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  {language === 'hi' ? 'एडवांस / भुगतान दर्ज करें' : 'Add Advance / Payment'}
                </h3>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {worker.name} • {formatCurrency(worker.dailyRate)}/{worker.rateType || 'DAILY'}
                </p>
              </div>
              <button 
                onClick={() => setShowQuickAdvanceModal(false)} 
                className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveQuickAdvance} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                  {language === 'hi' ? 'तारीख (Date)' : 'Date'}
                </label>
                <input
                  type="date"
                  value={quickAdvanceDate}
                  onChange={(e) => setQuickAdvanceDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-bold outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                  {language === 'hi' ? 'राशि (Amount)' : 'Amount'}
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl px-3 py-2.5 focus-within:border-amber-500">
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100 mr-2">₹</span>
                  <input
                    type="number"
                    value={quickAdvanceAmount}
                    onChange={(e) => setQuickAdvanceAmount(e.target.value)}
                    placeholder="0"
                    autoFocus
                    required
                    className="w-full bg-transparent text-xl font-black text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                  {language === 'hi' ? 'भुगतान का तरीका (Payment Mode)' : 'Payment Mode'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CASH', 'UPI', 'BANK'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setQuickPaymentMode(mode)}
                      className={`py-2 px-2 rounded-xl text-xs font-black transition border cursor-pointer ${
                        quickPaymentMode === mode
                          ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {mode === 'CASH' ? '💵 Cash' : mode === 'UPI' ? '📱 UPI' : '🏦 Bank'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                  {language === 'hi' ? 'विवरण / नोट (Note)' : 'Notes / Remarks'}
                </label>
                <input
                  type="text"
                  value={quickAdvanceNote}
                  onChange={(e) => setQuickAdvanceNote(e.target.value)}
                  placeholder={language === 'hi' ? "उदा. खर्चा, राशन, पेट्रोल, त्योहार" : "Eg. Food, petrol, rent"}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl transition cursor-pointer text-sm shadow-md flex items-center justify-center gap-1.5"
                >
                  <Plus size={16} />
                  <span>{language === 'hi' ? 'एडवांस सुरक्षित करें (Save)' : 'Save Advance'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPI Options Modal */}
      {showUPIOptions && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full sm:w-96 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-slate-100">Pay via UPI App</h3>
              <button onClick={() => setShowUPIOptions(false)} className="bg-gray-100 dark:bg-slate-800 p-1.5 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2">
              <button onClick={() => openUPIApp('phonepe')} className="w-full flex items-center p-3 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-800 transition cursor-pointer">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-black text-xs mr-3 shadow-xs">
                  पे
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-xs text-gray-900 dark:text-slate-100">PhonePe</div>
                  <div className="text-[10px] text-gray-500 dark:text-slate-400">Direct App Open & Pay</div>
                </div>
              </button>

              <button onClick={() => openUPIApp('gpay')} className="w-full flex items-center p-3 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xs mr-3 shadow-xs">
                  G
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-xs text-gray-900 dark:text-slate-100">Google Pay</div>
                  <div className="text-[10px] text-gray-500 dark:text-slate-400">Instant Tez UPI Transfer</div>
                </div>
              </button>

              <button onClick={() => openUPIApp('paytm')} className="w-full flex items-center p-3 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 transition cursor-pointer">
                <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white font-black text-xs mr-3 shadow-xs">
                  P
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-xs text-gray-900 dark:text-slate-100">Paytm</div>
                  <div className="text-[10px] text-gray-500 dark:text-slate-400">Paytm Payment App</div>
                </div>
              </button>

              <button onClick={() => openUPIApp('bhim')} className="w-full flex items-center p-3 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 transition cursor-pointer">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-black text-xs mr-3 shadow-xs">
                  B
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-xs text-gray-900 dark:text-slate-100">BHIM UPI</div>
                  <div className="text-[10px] text-gray-500 dark:text-slate-400">NPCI Official UPI App</div>
                </div>
              </button>

              <button onClick={() => openUPIApp('amazonpay')} className="w-full flex items-center p-3 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 transition cursor-pointer">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-slate-950 font-black text-xs mr-3 shadow-xs">
                  a
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-xs text-gray-900 dark:text-slate-100">Amazon Pay</div>
                  <div className="text-[10px] text-gray-500 dark:text-slate-400">Amazon UPI Payment</div>
                </div>
              </button>

              <button onClick={() => openUPIApp('upi')} className="w-full flex items-center p-3 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800 transition cursor-pointer">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xs mr-3 shadow-xs">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-xs text-gray-900 dark:text-slate-100">Any Other UPI App</div>
                  <div className="text-[10px] text-gray-500 dark:text-slate-400">Select any installed UPI app</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Popup Modal */}
      {activeAttendanceDate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full sm:w-[420px] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="bg-emerald-600 text-white p-2.5 rounded-2xl text-sm font-black shadow-xs">👤</span>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">{worker.name}</h3>
                  <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                    📅 {new Date(activeAttendanceDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} • हाजिरी लगाएं
                  </p>
                </div>
              </div>
              <button onClick={() => setActiveAttendanceDate(null)} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Mark Attendance for {worker.name}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'P', label: 'P', name: 'Present (1.0)', color: 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-500/30' },
                  { id: 'P+1/2', label: 'P+1/2', name: '1.5 Day', color: 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-md shadow-amber-500/30' },
                  { id: 'PP', label: 'PP', name: 'Double (2.0)', color: 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/30' },
                  { id: 'PPP', label: 'PPP', name: 'Triple (3.0)', color: 'bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-500/30' },
                  { id: 'OT', label: 'OT', name: 'Overtime', color: 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/30' },
                  { id: 'A', label: 'A', name: 'Absent (0.0)', color: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/30' }
                ].map(opt => {
                  const currentAtt = monthAttendances.find(a => a.date === activeAttendanceDate)?.status;
                  const isSelected = currentAtt === opt.id || (opt.id === 'P.1/2' && currentAtt === 'P+1/2');
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        handleUpdate(activeAttendanceDate, 'status', opt.id as any);
                        setActiveAttendanceDate(null);
                      }}
                      className={`p-4 rounded-2xl font-black text-sm transition transform active:scale-95 flex flex-col items-center justify-center cursor-pointer min-h-[78px] ${opt.color} ${isSelected ? 'ring-4 ring-amber-400 scale-105 shadow-xl' : ''}`}
                    >
                      <span className="text-xl font-black">{opt.label}</span>
                      <span className="text-xs font-bold opacity-90 mt-1">{opt.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meanings Guide */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div className="font-black text-slate-800 dark:text-slate-200 mb-1">MEANING:</div>
              <div className="grid grid-cols-2 gap-1 font-medium">
                <div><strong className="text-rose-600">A</strong> - Absent</div>
                <div><strong className="text-teal-600">½</strong> - Half day</div>
                <div><strong className="text-emerald-600">P</strong> - Present</div>
                <div><strong className="text-purple-600">OT</strong> - Overtime</div>
                <div><strong className="text-blue-600">PA</strong> - Paid Leave</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleUpdate(activeAttendanceDate, 'status', '');
                  setActiveAttendanceDate(null);
                }}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl transition cursor-pointer text-xs"
              >
                Remove Marked
              </button>
              <button
                type="button"
                onClick={() => setActiveAttendanceDate(null)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition cursor-pointer text-xs shadow-md"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advance Popup Modal */}
      {activeAdvanceDate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full sm:w-[380px] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="bg-amber-500 text-slate-950 p-2.5 rounded-2xl text-sm font-black shadow-xs">👤</span>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">{worker.name}</h3>
                  <p className="text-xs font-extrabold text-amber-700 dark:text-amber-400">
                    📅 {new Date(activeAdvanceDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} • एडवांस / भुगतान
                  </p>
                </div>
              </div>
              <button onClick={() => setActiveAdvanceDate(null)} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Amount for {worker.name}</label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-800 border-2 border-amber-400 rounded-2xl px-3 py-2.5 focus-within:border-amber-500">
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100 mr-2">₹</span>
                  <input
                    type="number"
                    value={tempAdvanceAmt}
                    onChange={(e) => setTempAdvanceAmt(e.target.value)}
                    placeholder="0"
                    autoFocus
                    className="w-full bg-transparent text-xl font-black text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Notes / Remarks</label>
                <input
                  type="text"
                  value={tempAdvanceNote}
                  onChange={(e) => setTempAdvanceNote(e.target.value)}
                  placeholder="Eg. (Food, petrol, rent)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  updateAttendance(worker.id, activeAdvanceDate, {
                    advance: Number(tempAdvanceAmt) || 0,
                    advanceNote: sanitizeInput(tempAdvanceNote)
                  });
                  setActiveAdvanceDate(null);
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl transition cursor-pointer text-sm shadow-md"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Worker Details Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full sm:w-[440px] max-h-[90vh] overflow-y-auto rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Edit size={16} className="text-blue-600 dark:text-blue-400" />
                  {language === 'hi' ? 'मज़दूर / स्टाफ एडिट करें' : 'Edit Worker Details'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {worker.name} • {worker.category || 'Labour'}
                </p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveEdit();
            }} className="space-y-3.5">
              {/* Worker Type Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {language === 'hi' ? 'कर्मचारी प्रकार (Type)' : 'Worker Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditWorkerType('LABOUR');
                      if (editCategory.includes('Office') || editCategory.includes('Manager') || editCategory.includes('Supervisor') || editCategory.includes('Accountant')) {
                        setEditCategory('Labour');
                      }
                    }}
                    className={`py-2 rounded-xl font-bold text-xs border transition cursor-pointer ${
                      editWorkerType === 'LABOUR'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🔨 Labour (मजदूर / कारीगर)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditWorkerType('OFFICE');
                      if (editCategory === 'Labour' || editCategory === 'Mason (Kadiya)') {
                        setEditCategory('Office Assistant');
                      }
                    }}
                    className={`py-2 rounded-xl font-bold text-xs border transition cursor-pointer ${
                      editWorkerType === 'OFFICE'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    💼 Office Staff (ऑफिस स्टाफ)
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {language === 'hi' ? 'पूरा नाम (Full Name) *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Category and Rate Type */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    {language === 'hi' ? 'श्रेणी / पद' : 'Category / Trade'}
                  </label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    {(editWorkerType === 'OFFICE' ? officeCategories : laborCategories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    {language === 'hi' ? 'वेतन प्रकार' : 'Wage Rate Type'}
                  </label>
                  <select
                    value={editRateType}
                    onChange={e => setEditRateType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="DAILY">{language === 'hi' ? 'दैनिक (Daily / Day)' : 'Daily (/day)'}</option>
                    <option value="WEEKLY">{language === 'hi' ? 'साप्ताहिक (Weekly / Wk)' : 'Weekly (/wk)'}</option>
                    <option value="MONTHLY">{language === 'hi' ? 'मासिक (Monthly / Mo)' : 'Monthly (/mo)'}</option>
                    <option value="ROUND">{language === 'hi' ? 'ठेका / फिक्स (Fixed)' : 'Fixed Contract'}</option>
                  </select>
                </div>
              </div>

              {/* Rate Amount */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {language === 'hi' ? 'वेतन दर (Wage / Salary Rate Amount) *' : 'Wage / Rate Amount *'}
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 focus-within:border-blue-500">
                  <span className="text-sm font-black text-slate-700 dark:text-slate-300 mr-2">₹</span>
                  <input
                    type="number"
                    value={editRate}
                    onChange={e => setEditRate(e.target.value)}
                    placeholder="500"
                    className="w-full bg-transparent text-sm font-black text-slate-900 dark:text-white outline-none"
                    required
                  />
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    {language === 'hi' ? 'मोबाइल नंबर (कॉल)' : 'Mobile Phone'}
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="Mobile phone"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    {language === 'hi' ? 'UPI नंबर (GPay/PhonePe)' : 'UPI Payment Phone'}
                  </label>
                  <input
                    type="tel"
                    value={editPaymentPhone}
                    onChange={e => setEditPaymentPhone(e.target.value)}
                    placeholder="UPI number"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md"
                >
                  {language === 'hi' ? 'सुरक्षित करें (Save)' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl transition cursor-pointer text-xs"
                >
                  {language === 'hi' ? 'रद्द करें (Cancel)' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
