import React, { useState } from 'react';
import { ArrowLeft, Calculator, RotateCcw, Delete, Trash2, Zap, PlusCircle, Receipt, Copy, CheckCircle, ChevronLeft, ChevronRight, Share2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { numberToWordsEnglish, numberToWordsHindi } from './QuotationPage';

export default function CalculatorPage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  const [calcTab, setCalcTab] = useState<'STANDARD' | 'GST'>('STANDARD');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistoryMobile, setShowHistoryMobile] = useState(true);

  // GST Calculator state
  const [gstBaseAmount, setGstBaseAmount] = useState('10000');
  const [selectedGstRate, setSelectedGstRate] = useState<number>(18);
  const [gstType, setGstType] = useState<'EXCLUSIVE' | 'INCLUSIVE'>('EXCLUSIVE'); // EXCLUSIVE (+ GST), INCLUSIVE (- GST)
  const [gstTaxDistribution, setGstTaxDistribution] = useState<'INTRA' | 'INTER'>('INTRA'); // INTRA (CGST+SGST), INTER (IGST)
  const [showGstKeypad, setShowGstKeypad] = useState(true);
  const [copiedGst, setCopiedGst] = useState(false);

  const tLocal: Record<string, Record<string, string>> = {
    en: {
      title: "Smart Wage & GST Calculator",
      subtitle: "Instant auto-calculation & Indian GST breakdown",
      history: "Calculation History & Logs",
      noHistory: "No calculations yet",
      clearHistory: "Clear Logs",
      liveTotal: "Live Total",
      quickAdd: "Quick Add Cash",
      stdCalc: "Standard & Wage Calc",
      gstCalc: "GST Tax Calculator",
      gstRate: "Select GST Rate",
      gstType: "Calculation Type",
      gstExclusive: "+ GST (Exclusive)",
      gstInclusive: "- GST (Inclusive)",
      baseAmount: "Base Amount (Without Tax)",
      cgst: "CGST (Central Tax 50%)",
      sgst: "SGST (State Tax 50%)",
      igst: "IGST (Integrated Tax 100%)",
      totalGst: "Total GST Tax",
      grossTotal: "Grand Total Payable",
      copyGst: "Copy Breakdown",
      sendToCalc: "Paste Total to Calculator",
      presets: "Quick Presets",
      taxDist: "Tax Distribution",
      intrastate: "Intrastate (CGST + SGST)",
      interstate: "Interstate (IGST 100%)",
      inWords: "Grand Total in Words",
      shareWhatsApp: "Share on WhatsApp",
      toggleKeypad: "Touch Keypad",
      lastAdded: "Recent Addition Log"
    },
    hinglish: {
      title: "Smart Wage & GST Calculator",
      subtitle: "Instant auto-calculation & GST breakdown (GST Hisab)",
      history: "Calculation History & Logs (Kul Hisab)",
      noHistory: "Koi history nahi hai",
      clearHistory: "Clear Logs",
      liveTotal: "Live Total (Kul Jod)",
      quickAdd: "Quick Add Cash",
      stdCalc: "Standard & Wage Calc",
      gstCalc: "GST Tax Calculator",
      gstRate: "GST Rate Chunein",
      gstType: "Calculation Type",
      gstExclusive: "+ GST (Alag se Jodein)",
      gstInclusive: "- GST (Shamil Hai / Reverse)",
      baseAmount: "Base Amount (Mool Rashi)",
      cgst: "CGST (Kandriya Kar 50%)",
      sgst: "SGST (Rajya Kar 50%)",
      igst: "IGST (Ekikrit Kar 100%)",
      totalGst: "Total GST Tax",
      grossTotal: "Grand Total Payable (Kul Rashi)",
      copyGst: "Copy Breakdown",
      sendToCalc: "Paste Total to Calculator",
      presets: "Quick Amount Presets",
      taxDist: "Tax Distribution (Kar Prakar)",
      intrastate: "State Local (CGST + SGST)",
      interstate: "Bahar Rajya (IGST 100%)",
      inWords: "Grand Total in Words (Shabdo me)",
      shareWhatsApp: "WhatsApp par Bhejein",
      toggleKeypad: "Touch Keypad ON/OFF",
      lastAdded: "Recent Side Addition Log"
    },
    hi: {
      title: "स्मार्ट वेतन और जीएसटी कैलकुलेटर",
      subtitle: "तुरंत ऑटो-कैलकुलेशन व जीएसटी विवरण देखें",
      history: "गणना इतिहास",
      noHistory: "कोई इतिहास नहीं है",
      clearHistory: "इतिहास मिटाएं",
      liveTotal: "लाइव कुल जोड़",
      quickAdd: "त्वरित नगद जोड़ें",
      stdCalc: "मानक वेतन कैलकुलेटर",
      gstCalc: "जीएसटी टैक्स कैलकुलेटर",
      gstRate: "जीएसटी दर चुनें",
      gstType: "गणना का प्रकार",
      gstExclusive: "+ GST (अलग से जोड़े)",
      gstInclusive: "- GST (शामिल है / रिवर्स)",
      baseAmount: "मूल राशि (कर रहित)",
      cgst: "CGST (केंद्रीय कर 50%)",
      sgst: "SGST (राज्य कर 50%)",
      igst: "IGST (एकीकृत कर 100%)",
      totalGst: "कुल जीएसटी टैक्स",
      grossTotal: "कुल देय राशि",
      copyGst: "विवरण कॉपी करें",
      sendToCalc: "कैलकुलेटर में भेजें",
      presets: "त्वरित राशि",
      taxDist: "टैक्स प्रकार",
      intrastate: "राज्य के अंदर (CGST + SGST)",
      interstate: "राज्य के बाहर (IGST 100%)",
      inWords: "शब्दों में कुल राशि",
      shareWhatsApp: "व्हाट्सएप पर भेजें",
      toggleKeypad: "टच कीपैड",
      lastAdded: "हालिया गणना का रिकॉर्ड"
    }
  };

  const currentT = tLocal[language] || tLocal['en'];

  // Calculate GST figures
  const parsedBase = Math.max(0, parseFloat(gstBaseAmount) || 0);
  let computedBase = 0;
  let computedGstTax = 0;
  let computedGrossTotal = 0;

  if (gstType === 'EXCLUSIVE') {
    computedBase = parsedBase;
    computedGstTax = parsedBase * (selectedGstRate / 100);
    computedGrossTotal = parsedBase + computedGstTax;
  } else {
    computedGrossTotal = parsedBase;
    computedBase = parsedBase / (1 + selectedGstRate / 100);
    computedGstTax = computedGrossTotal - computedBase;
  }

  const computedCgst = computedGstTax / 2;
  const computedSgst = computedGstTax / 2;

  // Words formatting
  const roundedGross = Math.round(computedGrossTotal);
  const wordsEn = numberToWordsEnglish(roundedGross);
  const wordsHi = numberToWordsHindi(roundedGross);

  // Helper to compute live sum without needing = key
  const getLiveTotal = (expr: string): string => {
    if (!expr || !expr.trim()) return '';
    let cleanExpr = expr.trim();
    // Remove trailing math operators
    while (['+', '-', '*', '/', '.'].includes(cleanExpr.slice(-1))) {
      cleanExpr = cleanExpr.slice(0, -1).trim();
    }
    if (!cleanExpr) return '';
    try {
      // eslint-disable-next-line no-new-func
      const res = new Function('return ' + cleanExpr)();
      if (res !== undefined && !isNaN(res) && isFinite(res)) {
        return String(Math.round(res * 10000) / 10000);
      }
    } catch (e) {
      return '';
    }
    return '';
  };

  const liveTotal = getLiveTotal(input);

  const handleKeyClick = (val: string) => {
    if (val === 'C') {
      setInput('');
    } else if (val === 'del') {
      setInput(prev => prev.slice(0, -1));
    } else if (val === '=') {
      if (!input.trim()) return;
      const computed = liveTotal || input;
      if (computed && computed !== 'Error') {
        const calculationLog = `${input} = ${computed}`;
        setHistory(prev => [calculationLog, ...prev].slice(0, 30));
        setInput(computed);
      }
    } else if (val.startsWith('+GST')) {
      // Add GST rate directly to current expression
      const rate = parseFloat(val.replace('+GST', '')) || 18;
      const currentVal = parseFloat(liveTotal || input) || 0;
      if (currentVal > 0) {
        const gstVal = currentVal * (rate / 100);
        const newTotal = currentVal + gstVal;
        const log = `${currentVal} + ${rate}% GST (${gstVal.toFixed(2)}) = ${newTotal.toFixed(2)}`;
        setHistory(prev => [log, ...prev].slice(0, 30));
        setInput(newTotal.toFixed(2));
      }
    } else {
      // Prevent consecutive operators
      if (['+', '-', '*', '/'].includes(val) && ['+', '-', '*', '/'].includes(input.slice(-1))) {
        setInput(prev => prev.slice(0, -1) + val);
      } else {
        setInput(prev => prev + val);
      }
    }
  };

  // Touch Keypad for GST Base Amount
  const handleGstTouchKey = (val: string) => {
    if (val === 'C') {
      setGstBaseAmount('0');
    } else if (val === 'DEL') {
      setGstBaseAmount(prev => {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      });
    } else if (val === '00') {
      setGstBaseAmount(prev => (prev === '0' || !prev ? '0' : prev + '00'));
    } else if (val === '.') {
      setGstBaseAmount(prev => (prev.includes('.') ? prev : prev + '.'));
    } else {
      setGstBaseAmount(prev => (prev === '0' || !prev ? val : prev + val));
    }
  };

  const handleAddGstBase = (amt: number) => {
    const current = parseFloat(gstBaseAmount) || 0;
    setGstBaseAmount(String(current + amt));
  };

  const handleQuickAdd = (num: number) => {
    if (!input || ['+', '-', '*', '/'].includes(input.slice(-1))) {
      setInput(prev => prev + String(num));
    } else {
      setInput(prev => prev + ' + ' + String(num));
    }
  };

  const generateGstTextBreakdown = () => {
    const wordText = language === 'hi' ? wordsHi : wordsEn;
    if (language === 'hi') {
      return `*जीएसटी कर विवरण (GST BREAKDOWN)*\n` +
        `--------------------------------\n` +
        `• मूल राशि (Base Amount): ₹${computedBase.toFixed(2)}\n` +
        `• जीएसटी दर: ${selectedGstRate}% (${gstType === 'EXCLUSIVE' ? '+ GST अलग से' : '- GST शामिल'})\n` +
        (gstTaxDistribution === 'INTRA' 
          ? `• CGST (${selectedGstRate / 2}%): ₹${computedCgst.toFixed(2)}\n• SGST (${selectedGstRate / 2}%): ₹${computedSgst.toFixed(2)}\n`
          : `• IGST (${selectedGstRate}%): ₹${computedGstTax.toFixed(2)}\n`
        ) +
        `• कुल जीएसटी टैक्स: ₹${computedGstTax.toFixed(2)}\n` +
        `================================\n` +
        `*कुल देय राशि: ₹${computedGrossTotal.toFixed(2)}*\n` +
        `_(${wordText})_`;
    } else if (language === 'hinglish') {
      return `*GST CALCULATION BREAKDOWN*\n` +
        `--------------------------------\n` +
        `• Base Amount: ₹${computedBase.toFixed(2)}\n` +
        `• GST Rate: ${selectedGstRate}% (${gstType === 'EXCLUSIVE' ? '+ GST Exclusive' : '- GST Inclusive'})\n` +
        (gstTaxDistribution === 'INTRA' 
          ? `• CGST (${selectedGstRate / 2}%): ₹${computedCgst.toFixed(2)}\n• SGST (${selectedGstRate / 2}%): ₹${computedSgst.toFixed(2)}\n`
          : `• IGST (${selectedGstRate}%): ₹${computedGstTax.toFixed(2)}\n`
        ) +
        `• Total GST Tax: ₹${computedGstTax.toFixed(2)}\n` +
        `================================\n` +
        `*GRAND TOTAL: ₹${computedGrossTotal.toFixed(2)}*\n` +
        `_(${wordsEn})_`;
    } else {
      return `*GST CALCULATION BREAKDOWN*\n` +
        `--------------------------------\n` +
        `• Base Amount: ₹${computedBase.toFixed(2)}\n` +
        `• GST Rate: ${selectedGstRate}% (${gstType === 'EXCLUSIVE' ? '+ GST Extra' : '- GST Included'})\n` +
        (gstTaxDistribution === 'INTRA' 
          ? `• CGST (${selectedGstRate / 2}%): ₹${computedCgst.toFixed(2)}\n• SGST (${selectedGstRate / 2}%): ₹${computedSgst.toFixed(2)}\n`
          : `• IGST (${selectedGstRate}%): ₹${computedGstTax.toFixed(2)}\n`
        ) +
        `• Total GST Tax: ₹${computedGstTax.toFixed(2)}\n` +
        `================================\n` +
        `*GRAND TOTAL: ₹${computedGrossTotal.toFixed(2)}*\n` +
        `_(${wordsEn})_`;
    }
  };

  const handleCopyGstBreakdown = () => {
    const breakdown = generateGstTextBreakdown();
    navigator.clipboard.writeText(breakdown);
    setCopiedGst(true);
    setTimeout(() => setCopiedGst(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = generateGstTextBreakdown();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const gstRates = [5, 12, 18, 28];
  const handlePrevGstRate = () => {
    const idx = gstRates.indexOf(selectedGstRate);
    const prevIdx = (idx - 1 + gstRates.length) % gstRates.length;
    setSelectedGstRate(gstRates[prevIdx]);
  };
  const handleNextGstRate = () => {
    const idx = gstRates.indexOf(selectedGstRate);
    const nextIdx = (idx + 1) % gstRates.length;
    setSelectedGstRate(gstRates[nextIdx]);
  };

  const handleSendGstToCalc = () => {
    const finalVal = Math.round(computedGrossTotal * 100) / 100;
    const log = `GST ${selectedGstRate}% on ₹${parsedBase} = ₹${finalVal}`;
    setHistory(prev => [log, ...prev].slice(0, 30));
    setInput(String(finalVal));
    setCalcTab('STANDARD');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-600 pb-20 md:pb-0">
      
      {/* Main Container: Calculator UI */}
      <div className="flex-1 flex flex-col p-3 sm:p-5 pt-[calc(0.75rem+env(safe-area-inset-top))] md:p-6 max-w-xl mx-auto w-full justify-start">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => navigate('/')} 
              className="p-2 bg-slate-900 hover:bg-slate-800 rounded-2xl transition-all text-slate-300 hover:text-white cursor-pointer border border-slate-800 shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <Calculator className="text-emerald-400" size={17} />
                {currentT.title}
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">{currentT.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 1-Click Language Switcher Bar */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                  language === 'hi'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hinglish')}
                className={`px-2 py-0.5 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                  language === 'hinglish'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hinglish
              </button>
            </div>

            {calcTab === 'STANDARD' ? (
              <button 
                onClick={() => handleKeyClick('C')}
                className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl hover:bg-rose-500/20 transition cursor-pointer"
              >
                Clear
              </button>
            ) : (
              <button 
                onClick={() => setGstBaseAmount('0')}
                className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl hover:bg-rose-500/20 transition cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Mode Switcher Tabs with Left and Right Navigation Buttons */}
        <div className="flex items-center gap-1.5 mb-3.5">
          <button
            onClick={() => setCalcTab(calcTab === 'GST' ? 'STANDARD' : 'GST')}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 rounded-2xl transition cursor-pointer active:scale-95 shadow-sm"
            title="Switch Mode Left"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex-1 flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 gap-1">
            <button
              onClick={() => setCalcTab('STANDARD')}
              className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
                calcTab === 'STANDARD' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator size={16} />
              <span>{currentT.stdCalc}</span>
            </button>
            <button
              onClick={() => setCalcTab('GST')}
              className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
                calcTab === 'GST' 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Receipt size={16} />
              <span>{currentT.gstCalc}</span>
            </button>
          </div>

          <button
            onClick={() => setCalcTab(calcTab === 'STANDARD' ? 'GST' : 'STANDARD')}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-2xl transition cursor-pointer active:scale-95 shadow-sm"
            title="Switch Mode Right"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* STANDARD CALCULATOR VIEW */}
        {calcTab === 'STANDARD' && (
          <>
            {/* Display Screen with Instant Auto-Calculation */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-3xl p-5 font-mono border-2 border-indigo-500/40 mb-3 shadow-[0_0_25px_rgba(99,102,241,0.2)] flex flex-col justify-between min-h-[145px] backdrop-blur-md relative overflow-hidden">
              {/* Live Indicator */}
              <div className="absolute top-2.5 right-3 flex items-center gap-1 text-[11px] font-sans font-black text-emerald-300 bg-emerald-950/95 border border-emerald-500/60 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <Zap size={13} className="text-emerald-400 animate-pulse" /> LIVE AUTO-CALCULATE
              </div>

              {/* Typing expression */}
              <div className="text-indigo-200 text-xl sm:text-3xl font-black tracking-wider break-all pt-6 min-h-[48px]">
                {input ? input : '0'}
              </div>

              {/* Instant Real-Time Total Output */}
              <div className="mt-3 pt-2.5 border-t border-indigo-500/30 flex items-baseline justify-between gap-2">
                <span className="text-xs font-sans font-extrabold text-slate-400 tracking-wider uppercase shrink-0">
                  {currentT.liveTotal}:
                </span>
                <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 tracking-tight font-sans drop-shadow-[0_0_15px_rgba(52,211,153,0.4)] text-right">
                  {liveTotal ? `= ₹${Number(liveTotal).toLocaleString('hi-IN')}` : (input ? `= ₹${input}` : '= ₹0')}
                </span>
              </div>
            </div>

            {/* Quick Cash Addition & GST Quick Keys */}
            <div className="mb-3.5 space-y-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                <span className="text-[11px] font-black text-blue-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <PlusCircle size={13} className="text-blue-400" /> {currentT.quickAdd}:
                </span>
                {[100, 200, 500, 1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => handleQuickAdd(amt)}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-600 hover:to-indigo-600 text-blue-200 hover:text-white border border-blue-500/40 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer active:scale-95 shadow-sm"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              {/* Quick GST Add Buttons Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <Receipt size={13} className="text-amber-400" /> Quick GST:
                </span>
                {[5, 12, 18, 28].map(rate => (
                  <button
                    key={rate}
                    onClick={() => handleKeyClick(`+GST${rate}`)}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-950/80 to-orange-950/80 hover:from-amber-600 hover:to-orange-600 text-amber-300 hover:text-white border border-amber-500/50 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm"
                  >
                    <span>+{rate}% GST</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Keyboard Keys Grid */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 select-none">
              {/* Row 1 */}
              <button onClick={() => handleKeyClick('C')} className="p-4 sm:p-5 rounded-2xl font-black text-xl sm:text-2xl bg-gradient-to-br from-rose-500/20 to-red-600/30 hover:from-rose-500/40 hover:to-red-600/50 text-rose-300 border border-rose-500/40 shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation">AC</button>
              <button onClick={() => handleKeyClick('/')} className="p-4 sm:p-5 rounded-2xl font-black text-2xl sm:text-3xl bg-gradient-to-br from-blue-500/20 to-cyan-600/30 hover:from-blue-500/40 hover:to-cyan-600/50 text-cyan-300 border border-blue-500/40 shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation">÷</button>
              <button onClick={() => handleKeyClick('*')} className="p-4 sm:p-5 rounded-2xl font-black text-2xl sm:text-3xl bg-gradient-to-br from-blue-500/20 to-cyan-600/30 hover:from-blue-500/40 hover:to-cyan-600/50 text-cyan-300 border border-blue-500/40 shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation">×</button>
              <button onClick={() => handleKeyClick('del')} className="p-4 sm:p-5 rounded-2xl font-black text-xl sm:text-2xl bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-slate-200 border border-slate-700 shadow-md flex items-center justify-center transition-all active:scale-95 cursor-pointer touch-manipulation">
                <Delete size={26} />
              </button>

              {/* Row 2 */}
              <button onClick={() => handleKeyClick('7')} className="p-4 sm:p-5 rounded-2xl font-black text-2xl sm:text-3xl bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 border border-slate-800 text-white shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation">7</button>
              <button onClick={() => handleKeyClick('8')} className="p-4 sm:p-5 rounded-2xl font-black text-2xl sm:text-3xl bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 border border-slate-800 text-white shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation">8</button>
              <button onClick={() => handleKeyClick('9')} className="p-4 sm:p-5 rounded-2xl font-black text-2xl sm:text-3xl bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 border border-slate-800 text-white shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation">9</button>
              <button onClick={() => handleKeyClick('-')} className="p-4 sm:p-5 rounded-2xl font-black text-2xl sm:text-3xl bg-gradient-to-br from-blue-500/20 to-cyan-600/30 hover:from-blue-500/40 hover:to-cyan-600/50 text-cyan-300 border border-blue-500/40 shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation">-</button>

              {/* Row 3 */}
              <button onClick={() => handleKeyClick('4')} className="p-4 sm:p-5 rounded-2xl font-black text-2xl sm:text-3xl bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 border border-slate-800 text-white shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation">4</button>
              <button onClick={() => handleKeyClick('5')} className="p-4 sm:p-5 rounded-2xl font-black text-2xl sm:text-3xl bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 border border-slate-800 text-white shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation">5</button>
              <button onClick={() => handleKeyClick('6')} className="p-4 sm:p-5 rounded-2xl font-black text-2xl sm:text-3xl bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 border border-slate-800 text-white shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation">6</button>
              <button onClick={() => handleKeyClick('+')} className="p-4 sm:p-5 rounded-2xl font-black text-2xl sm:text-3xl bg-gradient-to-br from-blue-500/20 to-cyan-600/30 hover:from-blue-500/40 hover:to-cyan-600/50 text-cyan-300 border border-blue-500/40 shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation">+</button>

              {/* Row 4 */}
              <button onClick={() => handleKeyClick('1')} className="p-4 sm:p-5 rounded-2xl font-black text-2xl sm:text-3xl bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 border border-slate-800 text-white shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation">1</button>
              <button onClick={() => handleKeyClick('2')} className="p-4 sm:p-5 rounded-2xl font-black text-2xl sm:text-3xl bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 border border-slate-800 text-white shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation">2</button>
              <button onClick={() => handleKeyClick('3')} className="p-4 sm:p-5 rounded-2xl font-black text-2xl sm:text-3xl bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 border border-slate-800 text-white shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation">3</button>
              
              {/* Equals button */}
              <button 
                onClick={() => handleKeyClick('=')} 
                className="p-4 sm:p-5 rounded-2xl font-black text-3xl sm:text-4xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 hover:from-emerald-300 hover:to-teal-500 text-slate-950 border-2 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] row-span-2 flex items-center justify-center transition-all active:scale-95 cursor-pointer touch-manipulation"
              >
                =
              </button>

              {/* Row 5 */}
              <button onClick={() => handleKeyClick('0')} className="p-4 sm:p-5 rounded-2xl font-black text-2xl sm:text-3xl bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 border border-slate-800 text-white shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation">0</button>
              <button onClick={() => handleKeyClick('00')} className="p-4 sm:p-5 rounded-2xl font-black text-xl sm:text-2xl bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 border border-slate-800 text-slate-300 shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation">00</button>
              <button onClick={() => handleKeyClick('.')} className="p-4 sm:p-5 rounded-2xl font-black text-3xl sm:text-4xl bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 border border-slate-800 text-white shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation">.</button>
            </div>
          </>
        )}

        {/* GST TAX CALCULATOR VIEW */}
        {calcTab === 'GST' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
            
            {/* Amount Input Header & Touch Keypad Toggle */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {currentT.baseAmount} (₹)
                </label>
                <button
                  type="button"
                  onClick={() => setShowGstKeypad(!showGstKeypad)}
                  className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-lg"
                >
                  {showGstKeypad ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{currentT.toggleKeypad}</span>
                </button>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl font-black text-emerald-400">₹</span>
                <input
                  type="number"
                  value={gstBaseAmount}
                  onChange={(e) => setGstBaseAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-3xl sm:text-4xl font-mono font-black text-emerald-400 focus:outline-none focus:border-emerald-500 transition shadow-inner"
                />
              </div>
            </div>

            {/* Quick Amount Presets Row */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Zap size={11} className="text-amber-400" /> {currentT.presets}:
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {[1000, 5000, 10000, 25000, 50000, 100000, 500000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setGstBaseAmount(String(amt))}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-emerald-900/60 text-slate-200 border border-slate-800 hover:border-emerald-600 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer active:scale-95"
                  >
                    ₹{amt >= 100000 ? `${amt / 100000} Lakh` : amt >= 1000 ? `${amt / 1000}k` : amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Embedded Touch Keypad for GST Amount (Super handy for mobile) */}
            {showGstKeypad && (
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="grid grid-cols-4 gap-1.5">
                  {['7', '8', '9', 'DEL'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleGstTouchKey(k)}
                      className={`py-2.5 rounded-xl font-black text-sm sm:text-base border transition cursor-pointer active:scale-95 touch-manipulation ${
                        k === 'DEL'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                          : 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {k === 'DEL' ? 'DEL' : k}
                    </button>
                  ))}
                  {['4', '5', '6', 'C'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleGstTouchKey(k)}
                      className={`py-2.5 rounded-xl font-black text-sm sm:text-base border transition cursor-pointer active:scale-95 touch-manipulation ${
                        k === 'C'
                          ? 'bg-rose-900 text-white border-rose-700'
                          : 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                  {['1', '2', '3', '00'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleGstTouchKey(k)}
                      className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 rounded-xl font-black text-sm sm:text-base transition cursor-pointer active:scale-95 touch-manipulation"
                    >
                      {k}
                    </button>
                  ))}
                  {['0', '.'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleGstTouchKey(k)}
                      className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 rounded-xl font-black text-sm sm:text-base transition cursor-pointer active:scale-95 touch-manipulation"
                    >
                      {k}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddGstBase(1000)}
                    className="col-span-2 py-2.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95"
                  >
                    + ₹1,000
                  </button>
                </div>
              </div>
            )}

            {/* GST Rate Selector with Left & Right Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                <span>{currentT.gstRate}</span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">Tax: {selectedGstRate}%</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevGstRate}
                  className="p-3 bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-2xl transition cursor-pointer active:scale-95 shrink-0"
                  title="Previous GST Rate"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="grid grid-cols-4 gap-1.5 flex-1">
                  {gstRates.map(rate => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setSelectedGstRate(rate)}
                      className={`py-2.5 sm:py-3 rounded-2xl font-black text-sm sm:text-base transition cursor-pointer border ${
                        selectedGstRate === rate 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-md shadow-emerald-950 scale-105' 
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNextGstRate}
                  className="p-3 bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-2xl transition cursor-pointer active:scale-95 shrink-0"
                  title="Next GST Rate"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Exclusive / Inclusive Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {currentT.gstType}
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setGstType(gstType === 'INCLUSIVE' ? 'EXCLUSIVE' : 'INCLUSIVE')}
                  className="p-2.5 bg-slate-950 hover:bg-slate-800 text-purple-400 border border-slate-800 rounded-2xl transition cursor-pointer active:scale-95 shrink-0"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 flex-1">
                  <button
                    type="button"
                    onClick={() => setGstType('EXCLUSIVE')}
                    className={`py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                      gstType === 'EXCLUSIVE'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {currentT.gstExclusive}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGstType('INCLUSIVE')}
                    className={`py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                      gstType === 'INCLUSIVE'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {currentT.gstInclusive}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setGstType(gstType === 'EXCLUSIVE' ? 'INCLUSIVE' : 'EXCLUSIVE')}
                  className="p-2.5 bg-slate-950 hover:bg-slate-800 text-purple-400 border border-slate-800 rounded-2xl transition cursor-pointer active:scale-95 shrink-0"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Intrastate vs Interstate Tax Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {currentT.taxDist}
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setGstTaxDistribution('INTRA')}
                  className={`py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                    gstTaxDistribution === 'INTRA'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {currentT.intrastate}
                </button>
                <button
                  type="button"
                  onClick={() => setGstTaxDistribution('INTER')}
                  className={`py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                    gstTaxDistribution === 'INTER'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {currentT.interstate}
                </button>
              </div>
            </div>

            {/* Breakdown Result Card */}
            <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 space-y-2.5 shadow-inner">
              <div className="text-xs font-extrabold text-slate-400 border-b border-slate-800/80 pb-2 flex justify-between items-center">
                <span>GST Breakdown ({selectedGstRate}% {gstType})</span>
                <span className="text-emerald-400 font-mono font-bold">Auto-Calculated</span>
              </div>

              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>{currentT.baseAmount}:</span>
                <span className="font-mono text-white">₹{computedBase.toFixed(2)}</span>
              </div>

              {gstTaxDistribution === 'INTRA' ? (
                <>
                  <div className="flex justify-between text-xs text-slate-400 pl-2 border-l-2 border-slate-700">
                    <span>{currentT.cgst} ({selectedGstRate / 2}%):</span>
                    <span className="font-mono text-slate-300">₹{computedCgst.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-400 pl-2 border-l-2 border-slate-700">
                    <span>{currentT.sgst} ({selectedGstRate / 2}%):</span>
                    <span className="font-mono text-slate-300">₹{computedSgst.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-xs text-slate-400 pl-2 border-l-2 border-indigo-500">
                  <span>{currentT.igst} ({selectedGstRate}%):</span>
                  <span className="font-mono text-indigo-300 font-bold">₹{computedGstTax.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs font-bold text-amber-400 pt-1 border-t border-slate-800/60">
                <span>{currentT.totalGst}:</span>
                <span className="font-mono">₹{computedGstTax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                <span className="text-xs font-black text-white uppercase tracking-wider">{currentT.grossTotal}:</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">₹{computedGrossTotal.toFixed(2)}</span>
              </div>

              {/* Amount in Words */}
              <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                <div>
                  <strong className="not-italic text-slate-400 font-bold">{currentT.inWords}:</strong>{' '}
                  <span className="font-semibold text-emerald-400">
                    {language === 'hi' ? wordsHi : wordsEn}
                  </span>
                </div>
                {language === 'hinglish' && wordsHi && (
                  <div className="text-[11px] text-slate-400 mt-0.5">({wordsHi})</div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyGstBreakdown}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                {copiedGst ? <CheckCircle size={15} className="text-emerald-400" /> : <Copy size={15} />}
                <span>{copiedGst ? 'Copied!' : currentT.copyGst}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Share2 size={15} />
                <span>{currentT.shareWhatsApp}</span>
              </button>

              <button
                type="button"
                onClick={handleSendGstToCalc}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md shadow-blue-950 sm:col-span-1"
              >
                <Calculator size={15} />
                <span>{currentT.sendToCalc}</span>
              </button>
            </div>

          </div>
        )}

        {/* Mobile Dedicated Side-Addition & Calculation History Box */}
        <div className="mt-4 md:hidden bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <RotateCcw size={15} className="text-emerald-400" />
              <span>{currentT.history}</span>
              {history.length > 0 && (
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-black">
                  {history.length}
                </span>
              )}
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHistoryMobile(!showHistoryMobile)}
                className="text-xs font-bold text-blue-400 hover:underline"
              >
                {showHistoryMobile ? 'Hide' : 'Show'}
              </button>
              {history.length > 0 && (
                <button 
                  type="button"
                  onClick={() => setHistory([])}
                  className="text-slate-500 hover:text-rose-400 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 size={12} />
                  {currentT.clearHistory}
                </button>
              )}
            </div>
          </div>

          {showHistoryMobile && (
            <div className="space-y-2 font-mono max-h-52 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="text-center text-slate-500 text-xs py-4 italic">
                  {currentT.noHistory}
                </div>
              ) : (
                history.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setInput(item.split('=').pop()?.trim() || '')}
                    className="bg-slate-950 border border-slate-800/90 hover:border-emerald-500/50 p-2.5 rounded-xl text-right cursor-pointer hover:bg-slate-900 transition flex items-center justify-between gap-2"
                  >
                    <span className="text-[10px] text-slate-400 font-sans font-bold uppercase shrink-0">#{history.length - idx}</span>
                    <div>
                      <div className="text-slate-400 text-xs">{item.split('=')[0]}</div>
                      <div className="text-emerald-400 text-sm font-bold mt-0.5">= {item.split('=').pop()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>

      {/* Right Area (Desktop): Calculation Logs / Side Additions Panel */}
      <div className="hidden md:flex w-80 bg-slate-900/90 border-l border-slate-800/80 p-5 flex-col shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <RotateCcw size={15} />
            {currentT.history}
          </h3>
          {history.length > 0 && (
            <button 
              type="button"
              onClick={() => setHistory([])}
              className="text-slate-500 hover:text-rose-400 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 size={12} />
              {currentT.clearHistory}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 font-mono">
          {history.length === 0 ? (
            <div className="text-center text-slate-500 text-xs py-10">
              {currentT.noHistory}
            </div>
          ) : (
            history.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => setInput(item.split('=').pop()?.trim() || '')}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 p-3 rounded-2xl text-right cursor-pointer hover:bg-slate-900 transition"
              >
                <div className="text-slate-400 text-xs">{item.split('=')[0]}</div>
                <div className="text-emerald-400 text-base font-bold mt-0.5">= {item.split('=').pop()}</div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}


