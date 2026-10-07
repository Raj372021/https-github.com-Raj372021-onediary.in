import React, { useState } from "react";
import { Bell, Calendar, Users, Wallet, FileText, UserCheck, UserX, ChevronRight, BarChart, Book, Bot, Sparkles, Calculator, Sun, Moon, Receipt, Zap, Share2, ShieldCheck, Eye, EyeOff, Download, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import WalletModal from "../components/WalletModal";
import FestivalCalendarModal from "../components/FestivalCalendarModal";
import KundliModal from "../components/KundliModal";
import HeaderClockWidget from "../components/HeaderClockWidget";
import AppDownloadModal from "../components/AppDownloadModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const { getTodayStats, getAllWorkerStats, userProfile, formatCurrency, workers, attendances, theme, toggleTheme, walletBalance } = useAppContext();
  const { t, language } = useLanguage();
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isKundliOpen, setIsKundliOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [hideAmounts, setHideAmounts] = useState(() => {
    return localStorage.getItem('hide_dashboard_amounts') === 'true';
  });

  const toggleHideAmounts = () => {
    setHideAmounts(prev => {
      const next = !prev;
      localStorage.setItem('hide_dashboard_amounts', String(next));
      return next;
    });
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'onediary.in - Digital Khata & Attendance App',
      text: 'onediary.in (OneDiary) - भारत का नंबर 1 डिजिटल खाता, हाजिरी, कैशबुक और पेमेंट ऐप! अभी इस्तेमाल करें:',
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert("✓ onediary.in ऐप शेयर लिंक कॉपी हो गया है! (App link copied)");
      } catch (err) {
        alert(`Share onediary.in link: ${shareData.url}`);
      }
    }
  };
  
  const stats = getTodayStats();
  const workerStats = getAllWorkerStats();
  const todayLocale = language === 'hi' ? 'hi-IN' : language === 'hinglish' ? 'en-IN' : 'en-US';
  const todayStr = new Date().toLocaleDateString(todayLocale, { day: 'numeric', month: 'long', year: 'numeric' });

  // Calculate Office Staff vs Site Labour breakdown
  const totalPeople = workers.length;
  const officeCount = workers.filter(w => w.workerType === 'OFFICE').length;
  const labourCount = totalPeople - officeCount;

  // Present breakdown today
  const todayStrYMD = new Date().toISOString().split('T')[0];
  let presentOffice = 0;
  let presentLabour = 0;

  workers.forEach(w => {
    const att = attendances.find(a => a.workerId === w.id && a.date === todayStrYMD);
    if (att && att.status && att.status !== 'A') {
      if (w.workerType === 'OFFICE') {
        presentOffice++;
      } else {
        presentLabour++;
      }
    }
  });

  const labelsLocal: Record<string, any> = {
    en: {
      toolsTitle: "Smart Tools & AI Help",
      toolsSub: "Instant business assistant and calculation utilities",
      chatbot: "AI Chatbot",
      chatbotSub: "Ask about cash or wages",
      calculator: "Calculator",
      calculatorSub: "Quick wage math",
      plans: "Premium Plans",
      plansSub: "Unlock features & limits"
    },
    hi: {
      toolsTitle: "स्मार्ट टूल्स और एआई सपोर्ट",
      toolsSub: "त्वरित एआई असिस्टेंट और गणना उपयोगिताएँ",
      chatbot: "एआई चैटबॉट",
      chatbotSub: "कैश या वेतन के सवाल पूछें",
      calculator: "कैलकुलेटर",
      calculatorSub: "तेजी से गणना करें",
      plans: "प्रीमियम प्लान्स",
      plansSub: "सभी सीमाएं और फीचर्स खोलें"
    },
    gu: {
      toolsTitle: "સ્માર્ટ ટૂલ્સ અને એઆઈ સપોર્ટ",
      toolsSub: "ઝડપી એઆઈ આસિસ્ટન્ટ અને ગણતરી",
      chatbot: "એઆઈ ચેટબોટ",
      chatbotSub: "હિસાબ કે વેતનના પ્રશ્નો પૂછો",
      calculator: "કેલ્ક્યુલેટર",
      calculatorSub: "ઝડપી ગણતરી કરો",
      plans: "પ્રીમિયમ પ્લાન્સ",
      plansSub: "નવા ફીચર્સ મેળવો"
    },
    ta: {
      toolsTitle: "ஸ்மார்ட் கருவிகள் & AI உதவி",
      toolsSub: "உடனடி வணிக உதவியாளர் மற்றும் கணக்கீடுகள்",
      chatbot: "AI அரட்டை",
      chatbotSub: "பணம் அல்லது சம்பளம் பற்றி கேட்க",
      calculator: "கால்குலேட்டர்",
      calculatorSub: "விரைவான கணக்கீடு",
      plans: "பிரீமியம் திட்டங்கள்",
      plansSub: "அனைத்து அம்சங்களையும் திறக்கவும்"
    },
    es: {
      toolsTitle: "Herramientas Inteligentes e IA",
      toolsSub: "Asistente de negocios instantáneo y utilidades",
      chatbot: "Chatbot de IA",
      chatbotSub: "Preguntas de caja o salarios",
      calculator: "Calculadora",
      calculatorSub: "Cálculos rápidos",
      plans: "Planes Premium",
      plansSub: "Desbloquear límites y funciones"
    }
  };

  const currentLabels = labelsLocal[language] || labelsLocal['en'];
  
  let plusCount = 0;
  let minusCount = 0;
  let totalPayable = 0;
  let totalAdvance = 0;

  workerStats.forEach(w => {
    if (w.balance > 0) {
      plusCount++;
      totalPayable += w.balance;
    } else if (w.balance < 0) {
      minusCount++;
      totalAdvance += Math.abs(w.balance);
    }
  });

  const pieData = [
    { name: 'Plus (Payable)', value: plusCount, amount: totalPayable, color: '#10b981' }, // emerald-500
    { name: 'Minus (Advance)', value: minusCount, amount: totalAdvance, color: '#ef4444' } // red-500
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Sleek Header Area optimized for mobile */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-b border-indigo-900/40 text-white px-3 py-2.5 sm:px-6 sm:py-3.5 pb-4 shadow-md relative overflow-hidden sticky top-0 z-40 pt-[calc(0.5rem+env(safe-area-inset-top))] rounded-b-2xl sm:rounded-b-3xl">
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col gap-2 relative z-10">
          {/* Top row: Profile & Clock */}
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* App Brand Logo Avatar */}
              <img
                src="/app-logo.svg"
                alt="onediary.in official logo"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain shadow-lg shrink-0 border border-amber-400/60 bg-slate-950 p-0.5"
                title="onediary.in Official Logo"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-emerald-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-none drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]">✨ {t('dashboard.welcome')}</span>
                  {userProfile?.role && !userProfile.role.toLowerCase().includes('contractor') && !userProfile.role.includes('ठेकेदार') && (
                    <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[7px] sm:text-[7.5px] font-bold rounded-full uppercase tracking-wider leading-none">
                      {userProfile.role.replace(/\s*\(.*?\)\s*/g, '')}
                    </span>
                  )}
                </div>
                <h2 className="text-xs sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-blue-200 tracking-tight leading-tight truncate">
                  {(() => {
                    const name = (userProfile?.name || '')
                      .replace(/\bRaj\b/gi, '')
                      .replace(/राज/g, '')
                      .replace(/\bContractor\b/gi, '')
                      .replace(/ठेकेदार/g, '')
                      .trim();
                    return name || 'Digital Diary';
                  })()}
                </h2>
              </div>
            </div>

            {/* Header Clock Widget */}
            <div className="shrink-0">
              <HeaderClockWidget />
            </div>
          </div>

          {/* Bottom row: Controls & Action buttons */}
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-indigo-900/50 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 shrink-0">
              {/* Date */}
              <div className="flex items-center text-slate-300 text-[9.5px] font-semibold bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                <Calendar size={10} className="mr-1 text-indigo-400" />
                <span>{todayStr}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Toggle Hide/Show Amounts Eye Button */}
              <button
                onClick={toggleHideAmounts}
                className={`h-6 px-1.5 border rounded-lg transition cursor-pointer text-[10px] font-bold shadow-xs backdrop-blur-md active:scale-90 flex items-center gap-1 ${
                  hideAmounts 
                    ? 'bg-amber-500/30 text-amber-200 border-amber-400/60' 
                    : 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/20'
                }`}
                title={hideAmounts ? "पैसे दिखाएं" : "पैसे छिपाएं"}
              >
                {hideAmounts ? <EyeOff size={11} className="text-amber-300" /> : <Eye size={11} />}
                <span className="text-[9px] font-extrabold">{hideAmounts ? 'Show' : 'Hide'}</span>
              </button>

              {/* Wallet Quick Button */}
              <button
                onClick={() => setIsWalletOpen(true)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] px-2 py-1 rounded-lg shadow-md transition cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <Wallet size={12} />
                <span>{hideAmounts ? '₹ ••••' : `₹${walletBalance}`}</span>
              </button>

              {/* Calendar Icon Button */}
              <button
                onClick={() => setIsCalendarOpen(true)}
                className="w-6 h-6 bg-red-600/90 hover:bg-red-500 border border-amber-400/50 text-white rounded-lg transition cursor-pointer flex items-center justify-center active:scale-90 text-[10px]"
                title="Calendar & Panchang"
              >
                🚩
              </button>

              {/* App Download Quick Button */}
              <button 
                onClick={() => setIsDownloadOpen(true)}
                className="px-2 py-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-[10px] rounded-lg shadow-md transition cursor-pointer flex items-center gap-1 active:scale-95 shrink-0"
                title="Download App"
              >
                <Smartphone size={12} className="animate-bounce" />
                <span>ऐप डाउनलोड</span>
              </button>

              {/* Share Icon Button */}
              <button 
                onClick={handleShareApp} 
                className="w-6 h-6 bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-400/40 rounded-lg transition cursor-pointer text-white shadow-xs active:scale-90 flex items-center justify-center"
                title="Share App"
              >
                <Share2 size={11} />
              </button>

              {/* Theme Toggle Button */}
              <button 
                onClick={toggleTheme} 
                className="w-6 h-6 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition cursor-pointer text-amber-300 active:scale-90 flex items-center justify-center"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={11} /> : <Moon size={11} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Stats Grid with Office & Labour Sub breakdowns */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 px-3 sm:px-4 mt-3">
        {/* Total People Card */}
        <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-2.5 sm:p-3 rounded-2xl shadow-xl border-2 border-indigo-500/40 relative overflow-hidden flex flex-col justify-between group hover:border-indigo-400/70 transition-all duration-200">
          {/* Decorative ambient backlight */}
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-indigo-500/25 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

          <div className="flex items-center justify-between w-full relative z-10 gap-1">
            <div className="bg-gradient-to-tr from-indigo-500 to-blue-400 text-slate-950 p-1.5 sm:p-2 rounded-xl shadow-md ring-2 ring-indigo-300/40 shrink-0">
              <Users size={15} className="text-slate-950 stroke-[2.5]" />
            </div>
            <div className="text-right min-w-0 flex-1">
              <p className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-blue-200 tracking-tight leading-none truncate">{totalPeople}</p>
              <p className="text-[8.5px] sm:text-[9.5px] text-indigo-200/80 uppercase font-black tracking-wider mt-0.5 leading-tight line-clamp-1">{t('dashboard.totalWorkers')}</p>
            </div>
          </div>

          <div className="mt-2 pt-1 border-t border-indigo-500/30 flex items-center justify-between gap-1 relative z-10">
            <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[9px] font-black flex items-center gap-0.5 shadow-xs truncate">
              <span>🔨 Site:</span> <strong className="text-amber-300 text-[10px]">{labourCount}</strong>
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[9px] font-black flex items-center gap-0.5 shadow-xs truncate">
              <span>💼 Off:</span> <strong className="text-indigo-300 text-[10px]">{officeCount}</strong>
            </span>
          </div>
        </div>
        
        {/* Present Today Card */}
        <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-2.5 sm:p-3 rounded-2xl shadow-xl border-2 border-emerald-500/40 relative overflow-hidden flex flex-col justify-between group hover:border-emerald-400/70 transition-all duration-200">
          {/* Decorative ambient backlight */}
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-500/25 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

          <div className="flex items-center justify-between w-full relative z-10 gap-1">
            <div className="bg-gradient-to-tr from-emerald-400 to-teal-300 text-slate-950 p-1.5 sm:p-2 rounded-xl shadow-md ring-2 ring-emerald-300/40 shrink-0">
              <UserCheck size={15} className="text-slate-950 stroke-[2.5]" />
            </div>
            <div className="text-right min-w-0 flex-1">
              <p className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-teal-200 tracking-tight leading-none truncate">{stats.present}</p>
              <p className="text-[8.5px] sm:text-[9.5px] text-emerald-200/80 uppercase font-black tracking-wider mt-0.5 leading-tight line-clamp-1">{t('dashboard.present')}</p>
            </div>
          </div>

          <div className="mt-2 pt-1 border-t border-emerald-500/30 flex items-center justify-between gap-1 relative z-10">
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[9px] font-black flex items-center gap-0.5 shadow-xs truncate">
              <span>🔨 Site:</span> <strong className="text-amber-300 text-[10px]">{presentLabour}</strong>
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-[9px] font-black flex items-center gap-0.5 shadow-xs truncate">
              <span>💼 Off:</span> <strong className="text-teal-300 text-[10px]">{presentOffice}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-5 gap-1 xs:gap-2.5 px-2.5 sm:px-4 py-3 mt-1">
        <button onClick={() => navigate('/bulk-attendance')} className="flex flex-col items-center group cursor-pointer">
          <div className="w-11 h-11 xs:w-[52px] xs:h-[52px] bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform mb-1 border border-emerald-400/50">
            <Calendar className="w-5 h-5 xs:w-6 xs:h-6" />
          </div>
          <span className="font-black text-[11px] xs:text-[12px] text-slate-950 dark:text-slate-100 text-center leading-tight tracking-tight uppercase drop-shadow-xs">Mark<br/>Attend</span>
        </button>
        
        <button onClick={() => navigate('/workers')} className="flex flex-col items-center group cursor-pointer">
          <div className="w-11 h-11 xs:w-[52px] xs:h-[52px] bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform mb-1 border border-blue-400/50">
            <Users className="w-5 h-5 xs:w-6 xs:h-6" />
          </div>
          <span className="font-black text-[11px] xs:text-[12px] text-slate-950 dark:text-slate-100 text-center leading-tight tracking-tight uppercase drop-shadow-xs">Add<br/>Workers</span>
        </button>

        <button onClick={() => navigate('/cashbook')} className="flex flex-col items-center group cursor-pointer">
          <div className="w-11 h-11 xs:w-[52px] xs:h-[52px] bg-gradient-to-br from-purple-400 to-fuchsia-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform mb-1 border border-purple-400/50">
            <Wallet className="w-5 h-5 xs:w-6 xs:h-6" />
          </div>
          <span className="font-black text-[11px] xs:text-[12px] text-slate-950 dark:text-slate-100 text-center leading-tight tracking-tight uppercase drop-shadow-xs">Cash<br/>Book</span>
        </button>

        <button onClick={() => navigate('/hisab')} className="flex flex-col items-center group cursor-pointer">
          <div className="w-11 h-11 xs:w-[52px] xs:h-[52px] bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform mb-1 border border-amber-400/50">
            <FileText className="w-5 h-5 xs:w-6 xs:h-6" />
          </div>
          <span className="font-black text-[11px] xs:text-[12px] text-slate-950 dark:text-slate-100 text-center leading-tight tracking-tight uppercase drop-shadow-xs">Hisab<br/>Record</span>
        </button>
        
        <button onClick={() => navigate('/diary')} className="flex flex-col items-center group cursor-pointer">
          <div className="w-11 h-11 xs:w-[52px] xs:h-[52px] bg-gradient-to-br from-rose-400 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform mb-1 border border-rose-400/50">
            <Book className="w-5 h-5 xs:w-6 xs:h-6" />
          </div>
          <span className="font-black text-[11px] xs:text-[12px] text-slate-950 dark:text-slate-100 text-center leading-tight tracking-tight uppercase drop-shadow-xs">Smart<br/>Diary</span>
        </button>
      </div>

      <div className="px-4 mt-2 mb-2">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">Plus / Minus Overview</h3>
              <button
                onClick={toggleHideAmounts}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition cursor-pointer"
                title={hideAmounts ? "पैसे दिखाएं (Show Amounts)" : "पैसे छिपाएं (Hide Amounts)"}
              >
                {hideAmounts ? <EyeOff size={16} className="text-amber-500" /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/hisab')}
                className="text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900 cursor-pointer"
              >
                All People <ChevronRight size={16} className="ml-0.5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-1/2 h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any) => [`${value} people`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-1/2 space-y-4 pl-2">
              <div>
                <div className="flex items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></div>
                  Plus ({plusCount} {plusCount === 1 ? 'person' : 'people'})
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">
                  {hideAmounts ? '₹ •••••' : formatCurrency(totalPayable)}
                </div>
                <div className="text-[10px] font-bold text-slate-400">Total Payable</div>
              </div>
              
              <div>
                <div className="flex items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2"></div>
                  Minus ({minusCount} {minusCount === 1 ? 'person' : 'people'})
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">
                  {hideAmounts ? '₹ •••••' : formatCurrency(totalAdvance)}
                </div>
                <div className="text-[10px] font-bold text-slate-400">Advance Taken</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Tools Section */}
      <div className="px-4 mt-1 mb-6">
        <div className="mb-3">
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-1.5">
            <Sparkles size={18} className="text-orange-500" />
            {currentLabels.toolsTitle}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{currentLabels.toolsSub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card -0.5: Real Vedic Kundli & Panchang Generator */}
          <button 
            onClick={() => setIsKundliOpen(true)}
            className="bg-gradient-to-br from-amber-500/25 via-orange-500/25 to-yellow-500/25 dark:from-amber-950/90 dark:via-orange-950/90 dark:to-yellow-950/90 hover:from-amber-500/35 p-3.5 sm:p-4 rounded-2xl border-2 border-orange-500/80 dark:border-orange-500 shadow-md flex items-start gap-3 text-left transition-all active:scale-[0.99] group cursor-pointer relative overflow-hidden"
          >
            <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 text-white p-2.5 sm:p-3 rounded-xl shadow-md shadow-orange-600/30 group-hover:scale-105 transition-transform shrink-0 font-black text-xl border border-amber-300">
              🕉️
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <h4 className="font-black text-sm sm:text-base text-slate-950 dark:text-amber-100 flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-950 dark:text-white font-black drop-shadow-sm">सटीक जन्म कुण्डली</span>
                </h4>
                <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-xs shrink-0">
                  1 कुण्डली (₹199)
                </span>
              </div>
              <p className="text-[11.5px] text-amber-900 dark:text-amber-200 font-extrabold mt-1 leading-snug">
                🔮 1 संपूर्ण जन्म कुण्डली + 10 साल का भविष्यफल + 36 गुण विवाह मिलान + 5 लेबर हाजिरी (₹199 प्लान)
              </p>
            </div>
          </button>

          {/* Card -1: Shree Hanuman Prasad Calendar & Panchang */}
          <button 
            onClick={() => setIsCalendarOpen(true)}
            className="bg-gradient-to-br from-amber-500/20 via-red-500/20 to-orange-500/20 dark:from-amber-950/80 dark:via-red-950/80 dark:to-orange-950/80 hover:from-amber-500/30 p-4 rounded-2xl border-2 border-amber-500/70 dark:border-amber-500/90 shadow-md flex items-start gap-3.5 text-left transition-all active:scale-[0.99] group cursor-pointer relative overflow-hidden"
          >
            <div className="bg-gradient-to-br from-red-600 via-amber-600 to-red-700 text-white p-3 rounded-xl shadow-md shadow-amber-600/30 group-hover:scale-105 transition-transform shrink-0 font-black text-xl border border-amber-300">
              🚩
            </div>
            <div>
              <h4 className="font-black text-base text-slate-950 dark:text-amber-100 flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-950 dark:text-white font-black drop-shadow-sm">श्री हनुमान प्रसाद कैलेंडर</span>
                <span className="bg-amber-400 text-slate-950 text-[9px] px-2 py-0.5 rounded-full font-black shadow">2026</span>
              </h4>
              <div className="text-[11.5px] text-slate-950 dark:text-amber-100 font-extrabold mt-0.5 leading-tight flex items-center gap-1 flex-wrap">
                <span className="text-slate-950 dark:text-white font-black">onediary.in</span>
                <span className="text-slate-900 dark:text-amber-200 font-extrabold">• हिंदी, Gujarati, Tamil, English सभी भाषाओं में पंचांग व फोटो त्योहार</span>
              </div>
            </div>
          </button>

          {/* Card 0: Quotation & Bill Book */}
          <button 
            onClick={() => navigate('/quotation')}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 hover:from-emerald-100 dark:hover:from-slate-850 p-4 rounded-2xl border border-emerald-200/60 dark:border-slate-800 shadow-sm flex items-start gap-3.5 text-left transition-all active:scale-[0.99] group cursor-pointer"
          >
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-3 rounded-xl shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Receipt size={22} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                {language === 'hi' ? 'कोटेशन व बिल बुक' : 'Quotation & Bill Book'}
                <span className="bg-emerald-600 text-[8px] text-white px-1.5 py-0.5 rounded-full font-black">GST/BILL</span>
              </h4>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-400/80 font-medium mt-0.5 leading-tight">
                {language === 'hi' ? 'लेटरहेड बिल व कोटेशन 1-क्लिक में बनाएं' : 'Letterhead & GST Invoice Maker'}
              </p>
            </div>
          </button>

          {/* Card 1: AI Chatbot */}
          <button 
            onClick={() => navigate('/chat')}
            className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 hover:from-orange-100 dark:hover:from-slate-850 p-4 rounded-2xl border border-orange-200/60 dark:border-slate-800 shadow-sm flex items-start gap-3.5 text-left transition-all active:scale-[0.99] group cursor-pointer"
          >
            <div className="bg-gradient-to-br from-orange-400 to-amber-500 text-white p-2.5 rounded-lg shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Bot size={18} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-950 dark:text-amber-300 flex items-center gap-1">
                {currentLabels.chatbot}
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              </h4>
              <p className="text-[11px] text-amber-800 dark:text-amber-400/80 font-medium mt-0.5 leading-tight">{currentLabels.chatbotSub}</p>
            </div>
          </button>

          {/* Card 2: Calculator */}
          <button 
            onClick={() => navigate('/calculator')}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 hover:from-blue-100 dark:hover:from-slate-850 p-4 rounded-2xl border border-blue-200/60 dark:border-slate-800 shadow-sm flex items-start gap-3.5 text-left transition-all active:scale-[0.99] group cursor-pointer"
          >
            <div className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white p-2.5 rounded-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Calculator size={18} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-300">{currentLabels.calculator}</h4>
              <p className="text-[11px] text-indigo-800 dark:text-indigo-400/80 font-medium mt-0.5 leading-tight">{currentLabels.calculatorSub}</p>
            </div>
          </button>

          {/* Card 3: Premium Subscription */}
          <button 
            onClick={() => navigate('/subscriptions')}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 hover:from-purple-100 dark:hover:from-slate-850 p-4 rounded-2xl border border-purple-200/60 dark:border-slate-800 shadow-sm flex items-start gap-3.5 text-left transition-all active:scale-[0.99] group cursor-pointer"
          >
            <div className="bg-gradient-to-br from-purple-400 to-pink-500 text-white p-3 rounded-xl shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-purple-950 dark:text-purple-300 flex items-center gap-1">
                {currentLabels.plans}
                <span className="bg-yellow-400 text-[8px] text-amber-950 px-1.5 py-0.5 rounded-full font-black animate-bounce">NEW</span>
              </h4>
              <p className="text-[11px] text-purple-800 dark:text-purple-400/80 font-medium mt-0.5 leading-tight">{currentLabels.plansSub}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Wallet Drawer / Modal */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
      />

      {/* Thakur Prasad Style Festival & Panchang Calendar Modal */}
      <FestivalCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />

      {/* Real Vedic Kundli & Panchang Modal */}
      <KundliModal
        isOpen={isKundliOpen}
        onClose={() => setIsKundliOpen(false)}
      />

      {/* Mobile App Download Modal */}
      <AppDownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />
    </div>
  );
}
