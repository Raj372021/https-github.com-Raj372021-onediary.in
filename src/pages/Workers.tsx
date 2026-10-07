import React, { useState } from "react";
import { Plus, Users, Search, ChevronRight, Phone, AlertCircle, BookUser, ArrowLeft, Briefcase, Hammer, MessageCircle, PhoneCall, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";

export default function Workers() {
  const navigate = useNavigate();
  const { getAllWorkerStats, addWorker, formatCurrency, isSubscribed, subscriptionInfo } = useAppContext();
  const { language, t } = useLanguage();
  const workers = getAllWorkerStats();

  const currentCount = workers.length;

  // Determine max workers allowed based on active plan
  let maxWorkersAllowed = 3; // Free default limit: 3 labour
  if (isSubscribed) {
    if (subscriptionInfo?.workersLimit && subscriptionInfo.workersLimit > 0) {
      maxWorkersAllowed = subscriptionInfo.workersLimit;
    } else {
      const planId = subscriptionInfo?.planId;
      const amount = subscriptionInfo?.amount;
      if (planId === 'plan_199' || amount === 199) {
        maxWorkersAllowed = 5;
      } else if (planId === 'plan_499' || amount === 499) {
        maxWorkersAllowed = 15;
      } else if (planId === 'plan_999' || amount === 999) {
        maxWorkersAllowed = 25;
      } else {
        maxWorkersAllowed = 25;
      }
    }
  }

  const isLimitReached = currentCount >= maxWorkersAllowed;

  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'LABOUR' | 'OFFICE'>('ALL');
  const [hideRates, setHideRates] = useState(false);
  const [revealedWorkerIds, setRevealedWorkerIds] = useState<Record<string, boolean>>({});

  const [newWorker, setNewWorker] = useState<{
    name: string;
    phone: string;
    paymentPhone: string;
    dailyRate: number;
    category: string;
    workerType: 'LABOUR' | 'OFFICE';
    rateType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ROUND';
  }>({ name: "", phone: "", paymentPhone: "", dailyRate: 500, category: "Labour", workerType: "LABOUR", rateType: "DAILY" });

  const laborCategories = ["Labour", "Painter", "Polish", "Electrician", "Carpenter", "Mason (Kadiya)", "Plumber", "POP", "Real Estate Contractor", "Other"];
  const officeCategories = ["Supervisor", "Manager", "Accountant", "Office Assistant", "Clerk", "Sales", "Real Estate Agent / Broker", "HR", "Engineer", "Peon", "Other Staff"];
  const currentCategories = newWorker.workerType === 'OFFICE' ? officeCategories : laborCategories;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.name) return;

    if (isLimitReached) {
      if (!isSubscribed) {
        alert(
          language === 'hi'
            ? "मुफ़्त प्लान में केवल 3 लेबर की अनुमति है! 5 लेबर के लिए ₹199, 15 लेबर के लिए ₹499 या 25 लेबर के लिए ₹999 का प्लान लें।"
            : "Free plan allows max 3 workers! Upgrade to ₹199 (5 workers), ₹499 (15 workers) or ₹999 (25 workers) plan."
        );
      } else {
        alert(
          language === 'hi'
            ? `आपके वर्तमान प्लान में अधिकतम ${maxWorkersAllowed} लेबर की सीमा पूरी हो गई है! अधिक लेबर के लिए नया प्लान लें।`
            : `Your current plan limit of ${maxWorkersAllowed} workers has been reached! Upgrade your plan for more workers.`
        );
      }
      navigate('/subscriptions');
      return;
    }

    addWorker({ ...newWorker, dailyRate: Number(newWorker.dailyRate) });
    setShowAddForm(false);
    setNewWorker({ name: "", phone: "", paymentPhone: "", dailyRate: 500, category: "Labour", workerType: "LABOUR", rateType: "DAILY" });
  };

  const filteredWorkers = workers.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || w.workerType === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalEarned = workers.reduce((sum, w) => sum + w.earned, 0);
  const totalAdvance = workers.reduce((sum, w) => sum + w.advance, 0);
  const totalBalance = workers.reduce((sum, w) => sum + w.balance, 0);
  const payableBalance = workers.reduce((sum, w) => sum + Math.max(0, w.balance), 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-b border-indigo-900/40 text-white p-4 pb-5 shadow-lg sticky top-0 z-40 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1.5 hover:bg-white/10 rounded-xl transition-colors shrink-0 cursor-pointer text-slate-300 hover:text-white"
              title="Go Back"
            >
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-xl font-extrabold flex items-center tracking-tight text-white">
              <Users className="mr-2 text-indigo-400" size={22} /> {t('workers.title')}
            </h1>
          </div>

          <button
            onClick={() => setHideRates(!hideRates)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs border ${
              hideRates 
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30' 
                : 'bg-white/10 text-slate-200 border-white/20 hover:bg-white/20'
            }`}
            title={hideRates ? "Show Rates (दर दिखाएं)" : "Hide Rates (दर छिपाएं)"}
          >
            {hideRates ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="hidden sm:inline">{hideRates ? (language === 'hi' ? 'दर दिखाएं' : 'Show Rates') : (language === 'hi' ? 'दर छिपाएं' : 'Hide Rates')}</span>
          </button>
        </div>

        <div className="relative mb-6">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200" />
          <input 
            type="text" 
            placeholder={t('workers.search')} 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-blue-800/50 border border-white/10 text-white placeholder-blue-300 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        
        {/* Grand Summary Section */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-2 shadow-sm overflow-hidden flex flex-col justify-center text-white">
            <div className="text-[9px] text-indigo-100 uppercase font-extrabold tracking-wide mb-0.5">{t('workers.earned')}</div>
            <div className="text-sm sm:text-base font-black truncate">{formatCurrency(totalEarned)}</div>
          </div>
          <div className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-xl p-2 shadow-sm overflow-hidden flex flex-col justify-center text-white">
            <div className="text-[9px] text-amber-100 uppercase font-extrabold tracking-wide mb-0.5">{t('workers.advance')}</div>
            <div className="text-sm sm:text-base font-black truncate">{formatCurrency(totalAdvance)}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-2 shadow-sm overflow-hidden flex flex-col justify-center text-white">
            <div className="text-[9px] text-emerald-100 uppercase font-extrabold tracking-wide mb-0.5">{t('workers.payable')}</div>
            <div className="text-sm sm:text-base font-black truncate">{formatCurrency(payableBalance)}</div>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1">
        {/* Status Banner for Free / Tier Users */}
        {!isSubscribed ? (
          <div 
            onClick={() => navigate('/subscriptions')}
            className={`p-3.5 rounded-2xl mb-4 border flex items-center justify-between shadow-sm cursor-pointer transition ${
              isLimitReached
                ? 'bg-rose-50 border-rose-300 text-rose-950 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-200'
                : 'bg-amber-50 border-amber-300 text-amber-950 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle size={20} className={isLimitReached ? 'text-rose-600 shrink-0' : 'text-amber-600 shrink-0'} />
              <div>
                <p className="text-xs font-black">
                  {language === 'hi' 
                    ? `फ्री प्लान: 3 लेबर तक मुफ़्त (${currentCount}/3)` 
                    : `Free Plan: 3 Workers Free (${currentCount}/3)`}
                </p>
                <p className="text-[10px] font-semibold opacity-85 mt-0.5">
                  {isLimitReached 
                    ? (language === 'hi' ? '3 लेबर की लिमिट पूरी! ₹199 (5 लेबर) या ₹499 (15 लेबर) का प्लान लें' : '3 workers limit reached! Upgrade to ₹199 (5) or ₹499 (15) plan')
                    : (language === 'hi' ? '3 लेबर 100% मुफ़्त। 3 से अधिक लेबर के लिए ₹199+ का प्लान' : 'Up to 3 workers free. ₹199+ for more workers')}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 shrink-0 ml-2 shadow">
              Plans (₹199+)
            </span>
          </div>
        ) : maxWorkersAllowed < 25 ? (
          <div 
            onClick={() => navigate('/subscriptions')}
            className="p-3.5 rounded-2xl mb-4 border bg-indigo-50 border-indigo-300 text-indigo-950 flex items-center justify-between shadow-sm cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle size={20} className="text-indigo-600 shrink-0" />
              <div>
                <p className="text-xs font-black">
                  {language === 'hi' 
                    ? `एक्टिव प्लान: ${maxWorkersAllowed} लेबर लिमिट (${currentCount}/${maxWorkersAllowed})` 
                    : `Active Plan: ${maxWorkersAllowed} Workers Limit (${currentCount}/${maxWorkersAllowed})`}
                </p>
                <p className="text-[10px] font-semibold opacity-85 mt-0.5">
                  {isLimitReached
                    ? (language === 'hi' ? `${maxWorkersAllowed} लेबर की सीमा पूरी! अधिक लेबर के लिए बड़ा प्लान लें` : `${maxWorkersAllowed} workers limit reached! Upgrade plan for more workers`)
                    : (language === 'hi' ? `अधिकतम ${maxWorkersAllowed} लेबर की अनुमति। और लेबर के लिए प्लान बढ़ाएं` : `Up to ${maxWorkersAllowed} workers allowed. Upgrade for more`)}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl bg-indigo-600 text-white shrink-0 ml-2 shadow">
              Upgrade Plan
            </span>
          </div>
        ) : null}

        <div className="mb-3">
          <button 
            onClick={() => {
              if (isLimitReached) {
                if (!isSubscribed) {
                  alert(
                    language === 'hi'
                      ? "मुफ़्त प्लान में केवल 3 लेबर की अनुमति है! 5 लेबर के लिए ₹199, 15 लेबर के लिए ₹499 या 25 लेबर के लिए ₹999 का प्लान लें।"
                      : "Free plan allows max 3 workers! Upgrade to ₹199 (5 workers), ₹499 (15 workers) or ₹999 (25 workers) plan."
                  );
                } else {
                  alert(
                    language === 'hi'
                      ? `आपके वर्तमान प्लान में अधिकतम ${maxWorkersAllowed} लेबर की सीमा पूरी हो गई है! अधिक लेबर के लिए बड़ा प्लान लें।`
                      : `Your current plan limit of ${maxWorkersAllowed} workers has been reached! Upgrade your plan for more workers.`
                  );
                }
                navigate('/subscriptions');
              } else {
                setShowAddForm(true);
              }
            }}
            className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 active:scale-95 transition-all text-white py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center shadow-md shadow-emerald-900/20 cursor-pointer gap-1.5 uppercase tracking-wide"
          >
            <Plus size={16} /> {t('workers.add')}
          </button>
        </div>

        {/* Role Type Filter Tabs */}
        <div className="flex flex-wrap sm:flex-nowrap bg-slate-200/60 p-0.5 rounded-lg mb-3 border border-slate-300/40 gap-1">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`flex-1 min-w-[30%] text-center py-1.5 px-1 rounded-md font-bold text-[10px] transition-all cursor-pointer ${
              typeFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            All ({workers.length})
          </button>
          <button
            onClick={() => setTypeFilter('LABOUR')}
            className={`flex-1 min-w-[30%] text-center py-1.5 px-1 rounded-md font-bold text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1 ${
              typeFilter === 'LABOUR'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-955'
            }`}
          >
            <span className="shrink-0 text-xs">🔨</span> Labour ({workers.filter(w => w.workerType === 'LABOUR' || !w.workerType).length})
          </button>
          <button
            onClick={() => setTypeFilter('OFFICE')}
            className={`flex-1 min-w-[30%] text-center py-1.5 px-1 rounded-md font-bold text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1 ${
              typeFilter === 'OFFICE'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-955'
            }`}
          >
            <span className="shrink-0 text-xs">💼</span> Office ({workers.filter(w => w.workerType === 'OFFICE').length})
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            {typeFilter === 'ALL' ? 'All People List' : typeFilter === 'OFFICE' ? 'Office Staff List' : 'Labour List'} ({filteredWorkers.length})
          </h2>
        </div>

        {isLimitReached && (
          <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl mb-4 flex items-start gap-2 cursor-pointer" onClick={() => navigate('/subscriptions')}>
            <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={16} />
            <div className="text-xs text-orange-800">
              <span className="font-bold">{!isSubscribed ? 'Free Plan Limit (3 Workers):' : `Plan Limit (${maxWorkersAllowed} Workers):`}</span> {!isSubscribed ? 'You reached 3 free workers limit. Upgrade plan to add more workers.' : `You reached your plan limit of ${maxWorkersAllowed} workers. Upgrade plan to add more workers.`}
            </div>
          </div>
        )}

        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-500 p-5 mb-6 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-bold text-lg text-gray-900">Add New Person (स्टाफ/मज़दूर जोड़ें)</h3>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const props = ['name', 'tel'];
                    const opts = { multiple: false };
                    if ('contacts' in navigator) {
                      if (window.self !== window.top) {
                        alert('Contact import only works when the app is opened in a new tab. Please open the app in a full window to use this feature.');
                        return;
                      }
                      const contacts = await (navigator as any).contacts.select(props, opts);
                      if (contacts && contacts.length > 0) {
                        const contact = contacts[0];
                        const name = contact.name ? contact.name[0] : '';
                        const phone = contact.tel ? contact.tel[0].replace(/[^0-9+]/g, '') : '';
                        setNewWorker(prev => ({ ...prev, name, phone }));
                      }
                    } else {
                      alert('Contact import is not supported on this device/browser.');
                    }
                  } catch (ex: any) {
                    console.error(ex);
                    if (ex.name === 'SecurityError' || ex.message.includes('top frame')) {
                      alert('Contact import only works when the app is opened in a new tab. Please open the app in a full window to use this feature.');
                    } else {
                      alert('Error reading contacts: ' + (ex.message || 'Unknown error'));
                    }
                  }
                }}
                className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg font-bold flex items-center hover:bg-blue-100 transition-colors"
              >
                <BookUser size={14} className="mr-1" /> Import Contact
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              {/* Role Type Selection */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Select Role / Type (प्रकार चुनें)</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewWorker(prev => ({ ...prev, workerType: 'LABOUR', category: 'Labour' }))}
                    className={`py-3 rounded-xl font-bold text-xs border-2 transition-all flex items-center justify-center gap-1.5 ${
                      newWorker.workerType === 'LABOUR'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>🔨</span> Site Labour (मज़दूर)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewWorker(prev => ({ ...prev, workerType: 'OFFICE', category: 'Supervisor' }))}
                    className={`py-3 rounded-xl font-bold text-xs border-2 transition-all flex items-center justify-center gap-1.5 ${
                      newWorker.workerType === 'OFFICE'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>💼</span> Office Staff (स्टाफ)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {language === 'hi' ? 'नाम (पूरा नाम) *' : language === 'hinglish' ? 'Name (Pura Naam) *' : 'Name *'}
                </label>
                <input 
                  type="text" 
                  placeholder={newWorker.workerType === 'OFFICE' ? "Enter employee's name" : "Enter worker's full name"}
                  value={newWorker.name}
                  onChange={e => setNewWorker({ ...newWorker, name: e.target.value })}
                  className="w-full border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {language === 'hi' ? 'मोबाइल नंबर' : language === 'hinglish' ? 'Phone Number (Call ke liye)' : 'Phone Number'}
                  </label>
                  <input 
                    type="tel" 
                    placeholder="Mobile number" 
                    value={newWorker.phone}
                    onChange={e => setNewWorker({ ...newWorker, phone: e.target.value })}
                    className="w-full border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">UPI Number (GPay/PhonePe)</label>
                  <input 
                    type="tel" 
                    placeholder="GPay/PhonePe number" 
                    value={newWorker.paymentPhone}
                    onChange={e => setNewWorker({ ...newWorker, paymentPhone: e.target.value })}
                    className="w-full border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {language === 'hi' ? 'श्रेणी / पद' : language === 'hinglish' ? 'Category (Kaam ka Pad)' : 'Category'}
                  </label>
                  <select
                    value={newWorker.category}
                    onChange={e => setNewWorker({ ...newWorker, category: e.target.value })}
                    className="w-full border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                  >
                    {currentCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {language === 'hi' ? 'वेतन प्रकार' : language === 'hinglish' ? 'Wage Type (Vetan Prakar)' : 'Wage Type'}
                  </label>
                  <select
                    value={newWorker.rateType}
                    onChange={e => setNewWorker({ ...newWorker, rateType: e.target.value as any })}
                    className="w-full border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                  >
                    <option value="DAILY">{language === 'hi' ? 'दैनिक' : language === 'hinglish' ? 'Daily (Dainik)' : 'Daily'}</option>
                    <option value="WEEKLY">{language === 'hi' ? 'साप्ताहिक' : language === 'hinglish' ? 'Weekly (Saptahik)' : 'Weekly'}</option>
                    <option value="MONTHLY">{language === 'hi' ? 'मासिक' : language === 'hinglish' ? 'Monthly (Masik)' : 'Monthly'}</option>
                    <option value="ROUND">{language === 'hi' ? 'ठेका / एकमुश्त' : language === 'hinglish' ? 'Round / Fixed (Theka)' : 'Round / Fixed'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {newWorker.rateType === 'DAILY' ? (language === 'hi' ? 'दैनिक वेतन दर *' : language === 'hinglish' ? 'Daily Wage / Rate (Dainik Dar) *' : 'Daily Wage / Rate *') :
                   newWorker.rateType === 'WEEKLY' ? (language === 'hi' ? 'साप्ताहिक वेतन दर *' : language === 'hinglish' ? 'Weekly Wage / Rate (Saptahik Dar) *' : 'Weekly Wage / Rate *') :
                   newWorker.rateType === 'MONTHLY' ? (language === 'hi' ? 'मासिक वेतन दर *' : language === 'hinglish' ? 'Monthly Wage / Rate (Masik Dar) *' : 'Monthly Wage / Rate *') :
                   (language === 'hi' ? 'एकमुश्त / ठेका राशि *' : language === 'hinglish' ? 'Fixed Contract Amount (Theka Rashi) *' : 'Fixed Contract Amount *')}
                </label>
                <input 
                  type="number" 
                  placeholder="Salary / Rate amount" 
                  value={newWorker.dailyRate}
                  onChange={e => setNewWorker({ ...newWorker, dailyRate: Number(e.target.value) })}
                  className="w-full border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                  required
                />
              </div>
              <div className="flex gap-3 pt-3 border-t">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-md shadow-blue-100 cursor-pointer">
                  Save {newWorker.workerType === 'OFFICE' ? 'Staff' : 'Worker'}
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-gray-700 py-3 rounded-xl font-bold transition cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {filteredWorkers.map(worker => (
            <div 
              key={worker.id}
              onClick={() => navigate(`/worker/${worker.id}`)}
              className="rotating-blue-card-wrapper cursor-pointer group transition-transform hover:scale-[1.005]"
            >
              <div className="rotating-blue-card-inner p-4 flex flex-col shadow-md border border-slate-300/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {worker.workerType === 'OFFICE' ? (
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-700 border border-indigo-300 rounded-full flex items-center justify-center mr-3 shadow-inner font-extrabold">
                        <Briefcase size={20} />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-amber-100 text-amber-800 border border-amber-300 rounded-full flex items-center justify-center mr-3 shadow-inner font-extrabold">
                        <Hammer size={20} />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center flex-wrap gap-1.5">
                        <h3 className="font-black text-slate-900 text-base mr-1 tracking-tight">{worker.name}</h3>
                        {worker.workerType === 'OFFICE' ? (
                          <span className="text-[8px] uppercase tracking-wider bg-indigo-600 text-white px-1.5 py-0.5 rounded-md font-extrabold shadow-xs">Office</span>
                        ) : (
                          <span className="text-[8px] uppercase tracking-wider bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-md font-extrabold shadow-xs">Labour</span>
                        )}
                        {worker.category && (
                          <span className="text-[10px] bg-slate-200 text-slate-800 border border-slate-300 px-2 py-0.5 rounded-full font-bold shadow-xs">{worker.category}</span>
                        )}
                      </div>
                      <div className="flex items-center text-[11px] text-slate-700 mt-1 gap-1.5 flex-wrap">
                        <span className="font-bold bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 border border-slate-300">P: {worker.presentDays || 0}</span>
                        {(() => {
                          const isRevealed = !hideRates || revealedWorkerIds[worker.id];
                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRevealedWorkerIds(prev => ({
                                  ...prev,
                                  [worker.id]: !prev[worker.id]
                                }));
                              }}
                              className={`font-extrabold px-2 py-0.5 rounded border flex items-center gap-1 transition cursor-pointer ${
                                isRevealed
                                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                                  : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                              }`}
                              title={isRevealed ? "Click to hide rate" : "Click to peek rate"}
                            >
                              <span>
                                {isRevealed ? formatCurrency(worker.dailyRate) : '₹••••'}
                                /{worker.rateType === 'DAILY' ? 'day' : 
                                  worker.rateType === 'WEEKLY' ? 'week' : 
                                  worker.rateType === 'MONTHLY' ? 'month' : 'fixed'}
                              </span>
                              {hideRates && (
                                isRevealed ? <EyeOff size={11} className="text-blue-700 opacity-80" /> : <Eye size={11} className="text-slate-500" />
                              )}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (worker.phone) {
                          window.location.href = `tel:${worker.phone}`;
                        } else {
                          alert(language === 'hi' ? "फोन नंबर उपलब्ध नहीं है। लेबर/स्टाफ पर क्लिक करके फोन नंबर जोड़ें।" : "Phone number not available. Edit worker to add phone number.");
                        }
                      }}
                      className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                      title="Direct Phone Call"
                    >
                      <PhoneCall size={15} />
                      <span className="hidden sm:inline">Call</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (worker.phone) {
                          window.open(`https://wa.me/${worker.phone}`, '_blank');
                        } else {
                          alert(language === 'hi' ? "फोन नंबर उपलब्ध नहीं है।" : "Phone number not available.");
                        }
                      }}
                      className="p-2 bg-emerald-600 text-white hover:bg-emerald-500 rounded-xl transition cursor-pointer"
                      title="WhatsApp Message"
                    >
                      <MessageCircle size={15} />
                    </button>
                    <ChevronRight size={18} className="text-slate-500 shrink-0 group-hover:text-slate-800 transition-colors" />
                  </div>
                </div>

                {/* Details boxes in light gray theme */}
                <div className="mt-3 pt-2.5 border-t border-slate-300 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-amber-50/90 rounded-xl p-1.5 border border-amber-300/80">
                    <div className="text-[9px] text-amber-900 font-extrabold uppercase tracking-wider">
                      {language === 'hi' ? 'एडवांस लिया' : language === 'hinglish' ? 'Adv. (Advance Liya)' : 'Advance Taken'}
                    </div>
                    <div className="font-extrabold text-amber-950 mt-0.5">{formatCurrency(worker.advance || 0)}</div>
                  </div>
                  <div className="bg-emerald-50/90 rounded-xl p-1.5 border border-emerald-300/80">
                    <div className="text-[9px] text-emerald-900 font-extrabold uppercase tracking-wider">
                      {language === 'hi' ? 'देना है' : language === 'hinglish' ? 'Dena Hai (Payable)' : 'Payable'}
                    </div>
                    <div className="font-extrabold text-emerald-950 mt-0.5">
                      {worker.balance > 0 ? formatCurrency(worker.balance) : formatCurrency(0)}
                    </div>
                  </div>
                  <div className="bg-rose-50/90 rounded-xl p-1.5 border border-rose-300/80">
                    <div className="text-[9px] text-rose-900 font-extrabold uppercase tracking-wider">
                      {language === 'hi' ? 'लेना है' : language === 'hinglish' ? 'Lena Hai (Receivable)' : 'Receivable'}
                    </div>
                    <div className="font-extrabold text-rose-950 mt-0.5">
                      {worker.balance < 0 ? formatCurrency(Math.abs(worker.balance)) : formatCurrency(0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredWorkers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No workers found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
