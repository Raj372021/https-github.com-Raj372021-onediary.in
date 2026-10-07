import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronDown, 
  ArrowLeft, 
  Trash2, 
  X, 
  Search, 
  MoreVertical, 
  Plus, 
  Minus,
  Edit2, 
  Calendar, 
  Clock, 
  Coins, 
  Smartphone, 
  Building, 
  CreditCard, 
  Check, 
  Settings, 
  Info,
  Download,
  Filter
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { sanitizeInput, checkRateLimit } from '../utils/security';

export default function CashBook() {
  const { 
    cashEntries, addCashEntry, deleteCashEntry, updateCashEntry, currency, setCurrency,
    cashBooks, activeCashBookId, setActiveCashBookId, addCashBook, renameCashBook, deleteCashBook,
    workers
  } = useAppContext();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  // Modals / Overlays
  const [showBooks, setShowBooks] = useState(false);
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [showOptionsDrawer, setShowOptionsDrawer] = useState(false);
  const [selectedBookForOptions, setSelectedBookForOptions] = useState<string | null>(null);
  const [selectedEntryForOptions, setSelectedEntryForOptions] = useState<any | null>(null);
  
  // Input fields for Adding/Editing Book
  const [newBookName, setNewBookName] = useState('');
  const [newBookNameInput, setNewBookNameInput] = useState(''); // for rename
  const [isRenaming, setIsRenaming] = useState(false);

  // Input fields for New Cash Entry
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [partyName, setPartyName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [paymentMode, setPaymentMode] = useState<string>('CASH');

  // Helpers to open modal for add vs edit
  const openAddModal = (entryType: 'IN' | 'OUT') => {
    setEditingEntryId(null);
    setType(entryType);
    setAmount('');
    setPartyName('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    
    const now = new Date();
    const currentHours = String(now.getHours() % 12 || 12).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    setTime(`${currentHours}:${currentMinutes} ${ampm}`);
    
    setPaymentMode('CASH');
    setShowAddEntryModal(true);
  };

  const openEditModal = (entry: any) => {
    setEditingEntryId(entry.id);
    setType(entry.type);
    setAmount(entry.amount.toString());
    setPartyName(entry.partyName || '');
    setDescription(entry.description || '');
    setDate(entry.date);
    setTime(entry.time || '');
    setPaymentMode(entry.paymentMode || 'CASH');
    setSelectedEntryForOptions(null); // Close details popup
    setShowAddEntryModal(true);
  };

  // Search, Show Stats, and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('ALL');
  const [showSearchAndFilter, setShowSearchAndFilter] = useState(false);
  const [showStatsSummary, setShowStatsSummary] = useState(true);

  const activeCashBook = cashBooks.find(b => b.id === activeCashBookId) || cashBooks[0];

  // Set default time to current system time when modal opens (only when adding)
  useEffect(() => {
    if (showAddEntryModal && !editingEntryId) {
      const now = new Date();
      const currentHours = String(now.getHours() % 12 || 12).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
      setTime(`${currentHours}:${currentMinutes} ${ampm}`);
    }
  }, [showAddEntryModal, editingEntryId]);

  // Filter entries by active cash book, sort ascending so we can calculate running balance
  const sortedEntries = useMemo(() => {
    return [...cashEntries]
      .filter(entry => entry.cashBookId === activeCashBookId)
      .sort((a, b) => {
        const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return a.id.localeCompare(b.id);
      });
  }, [cashEntries, activeCashBookId]);

  // Extract unique parties used before in cashbook and combine with worker names
  const suggestedParties = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();

    [...cashEntries].reverse().forEach(entry => {
      if (entry.partyName) {
        const name = entry.partyName.trim();
        if (name && !seen.has(name)) {
          seen.add(name);
          list.push(name);
        }
      }
    });

    if (workers && Array.isArray(workers)) {
      workers.forEach(w => {
        const name = w.name.trim();
        if (name && !seen.has(name)) {
          seen.add(name);
          list.push(name);
        }
      });
    }

    return list;
  }, [cashEntries, workers]);

  // Filter suggestions based on typed partyName
  const filteredSuggestions = useMemo(() => {
    const query = partyName.trim().toLowerCase();
    if (!query) {
      return suggestedParties.slice(0, 8);
    }
    return suggestedParties.filter(name => 
      name.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [suggestedParties, partyName]);

  // Calculate stats
  const stats = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    let cashInHand = 0;
    let onlineBalance = 0;

    sortedEntries.forEach(entry => {
      const entryAmt = Number(entry.amount) || 0;
      const mode = entry.paymentMode || 'CASH';

      if (entry.type === 'IN') {
        totalIn += entryAmt;
        if (mode === 'CASH') {
          cashInHand += entryAmt;
        } else {
          onlineBalance += entryAmt;
        }
      } else {
        totalOut += entryAmt;
        if (mode === 'CASH') {
          cashInHand -= entryAmt;
        } else {
          onlineBalance -= entryAmt;
        }
      }
    });

    return {
      totalIn,
      totalOut,
      balance: totalIn - totalOut,
      cashInHand,
      onlineBalance
    };
  }, [sortedEntries]);

  // Calculate running balance and group by date
  const groupedEntries: { date: string; entries: any[] }[] = [];
  let currentRunningBalance = 0;

  sortedEntries.forEach((entry, idx) => {
    const serialNo = idx + 1;
    if (entry.type === 'IN') {
      currentRunningBalance += Number(entry.amount) || 0;
    } else {
      currentRunningBalance -= Number(entry.amount) || 0;
    }
    
    // Check if this entry passes search filter for display
    const entryMode = entry.paymentMode || 'CASH';
    const matchesSearch = 
      (entry.partyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.amount.toString()).includes(searchQuery) ||
      serialNo.toString().includes(searchQuery);
    
    const matchesMode = selectedModeFilter === 'ALL' || entryMode === selectedModeFilter;

    if (matchesSearch && matchesMode) {
      const entryWithBalance = { ...entry, balance: currentRunningBalance, serialNo };
      const d = new Date(entry.date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(-2);
      const entryDate = `${day}-${month}-${year}`;

      let group = groupedEntries.find(g => g.date === entryDate);
      if (!group) {
        group = { date: entryDate, entries: [] };
        groupedEntries.push(group);
      }
      group.entries.push(entryWithBalance);
    }
  });

  // Display newest groups on top and newest entries of each day on top
  const displayGroupedEntries = [...groupedEntries].reverse().map(group => ({
    ...group,
    entries: [...group.entries].reverse()
  }));

  const formatNum = (num: number) => {
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSave = (closeModal = false) => {
    if (!amount || isNaN(Number(amount))) return;
    if (!checkRateLimit('cashbook_save', 15, 10000)) {
      alert("Please wait a moment before saving again.");
      return;
    }
    
    const cleanPartyName = sanitizeInput(partyName.trim(), 100);
    const cleanDesc = sanitizeInput(description.trim(), 300) || (type === 'IN' ? 'Payment Received' : 'Expense Out');

    const entryData = {
      date,
      amount: Number(amount),
      type,
      partyName: cleanPartyName,
      description: cleanDesc,
      cashBookId: activeCashBookId,
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      paymentMode: paymentMode
    };

    if (editingEntryId) {
      updateCashEntry(editingEntryId, entryData);
    } else {
      addCashEntry(entryData);
    }
    
    setAmount('');
    setDescription('');
    setPartyName('');
    setEditingEntryId(null);
    
    if (closeModal) {
      setShowAddEntryModal(false);
    }
  };

  const handleAddNewBook = () => {
    if (newBookName.trim()) {
      addCashBook(newBookName.trim());
      setNewBookName('');
      setShowAddBookForm(false);
    }
  };

  const handleRenameBook = () => {
    if (selectedBookForOptions && newBookNameInput.trim()) {
      renameCashBook(selectedBookForOptions, newBookNameInput.trim());
      setSelectedBookForOptions(null);
      setIsRenaming(false);
    }
  };

  const handleDeleteBook = () => {
    if (selectedBookForOptions) {
      if (cashBooks.length <= 1) {
        alert("Cannot delete the last cash book.");
        return;
      }
      if (window.confirm("Are you sure you want to delete this cash book and all its entries?")) {
        deleteCashBook(selectedBookForOptions);
        setSelectedBookForOptions(null);
        setIsRenaming(false);
      }
    }
  };

  const getModeIcon = (mode: string, className = "w-3 h-3") => {
    switch(mode) {
      case 'CASH': return <Coins className={`${className} text-amber-600`} />;
      case 'UPI': return <Smartphone className={`${className} text-indigo-600`} />;
      case 'BANK': return <Building className={`${className} text-blue-600`} />;
      default: return <CreditCard className={`${className} text-slate-600`} />;
    }
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    if (sortedEntries.length === 0) {
      alert("No data to export");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Particular/Party,Type,Mode,Amount,Description\n";
    
    sortedEntries.forEach(e => {
      const row = [
        e.date,
        `"${e.partyName || ''}"`,
        e.type,
        e.paymentMode || 'CASH',
        e.amount,
        `"${e.description || ''}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeCashBook.name}_cashbook.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowOptionsDrawer(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] pb-[140px] font-sans text-gray-800">
      
      {/* 1. MAGENTA/PINK HEADER BAR (Matches image perfectly) */}
      <div className="bg-[#c2185b] text-white py-4 px-4 sticky top-0 z-40 shadow-md flex items-center justify-between relative select-none pt-[calc(1rem+env(safe-area-inset-top))]">
        {/* Back Arrow */}
        <button 
          onClick={() => navigate(-1)} 
          className="p-1.5 hover:bg-white/10 rounded-full text-white transition cursor-pointer"
          title="Home"
        >
          <ArrowLeft size={22} />
        </button>

        {/* Center Selector Header */}
        <div 
          onClick={() => setShowBooks(true)} 
          className="flex items-center gap-1.5 cursor-pointer active:opacity-85 select-none max-w-[65%] text-center"
        >
          <span className="font-black text-base tracking-wide truncate uppercase">
            {activeCashBook?.name}
          </span>
          <ChevronDown size={18} className="text-white/90 shrink-0" />
        </div>

        {/* Info/Help icon or Options menu toggle */}
        <button 
          onClick={() => {
            const report = displayGroupedEntries.map(group => {
              return `*${group.date}*\n` + group.entries.map(e => `  ${e.type === 'IN' ? '➕' : '➖'} ${formatNum(e.amount)} | ${e.partyName || e.description || 'Entry'} (${e.paymentMode})`).join('\n');
            }).join('\n\n');
            
            const message = `*${activeCashBook?.name || 'Cash Book'} Report*\n\n*Total In:* ${formatNum(stats.totalIn)}\n*Total Out:* ${formatNum(stats.totalOut)}\n*Balance:* ${formatNum(stats.balance)}\n\n*Transactions:*\n${report}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
          }}
          className="p-1.5 hover:bg-white/10 rounded-full text-white transition cursor-pointer"
          title="Share on WhatsApp"
        >
          <span className="font-bold text-lg leading-none">✆</span>
        </button>
      </div>

      {/* 2. TABLE HEADERS BAR (Clean, High Contrast, Perfectly Aligned) */}
      <div className="bg-[#c2185b] text-white px-3 sm:px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-black tracking-wider uppercase border-t border-white/10 select-none shadow-xs">
        <div className="text-left">नाम व रिमार्क (Name & Remark)</div>
        <div className="text-right">राशि / बैलेंस (Amount / Balance)</div>
      </div>

      {/* Optional Search and Filter Bar */}
      {showSearchAndFilter && (
        <div className="bg-white border-b border-gray-200 p-3.5 space-y-3 shadow-inner animate-in slide-in-from-top duration-150">
          <div className="flex bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 items-center gap-2 focus-within:ring-2 focus-within:ring-pink-500/30 focus-within:border-pink-500 transition-all">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="नाम, रिमार्क या राशि खोजें..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm sm:text-base text-gray-800 outline-none placeholder-slate-400 font-bold"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Optional Stats Dashboard - Big & Clear */}
      {showStatsSummary && (
        <div className="bg-white border-b border-slate-200 p-4 grid grid-cols-3 gap-2 text-center shadow-xs select-none">
          <div className="border-r border-slate-200 pr-2">
            <span className="text-[11px] sm:text-xs font-black text-emerald-700 uppercase tracking-wide block mb-0.5">कुल आया (In)</span>
            <span className="text-sm sm:text-lg font-black text-emerald-600 block truncate">+{formatNum(stats.totalIn)}</span>
          </div>
          <div className="border-r border-slate-200 px-2">
            <span className="text-[11px] sm:text-xs font-black text-rose-700 uppercase tracking-wide block mb-0.5">कुल गया (Out)</span>
            <span className="text-sm sm:text-lg font-black text-rose-600 block truncate">-{formatNum(stats.totalOut)}</span>
          </div>
          <div className="pl-2">
            <span className="text-[11px] sm:text-xs font-black text-blue-800 uppercase tracking-wide block mb-0.5">कुल बैलेंस</span>
            <span className={`text-sm sm:text-lg font-black block truncate ${stats.balance >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>{formatNum(stats.balance)}</span>
          </div>
        </div>
      )}

      {/* 3. TRANSACTION LIST FEED - BIG TEXT & FOCUSED ON 3 ITEMS (AMOUNT, NAME, REMARK) */}
      <div className="flex-1 overflow-y-auto px-0 bg-white">
        {displayGroupedEntries.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20 px-6 text-center select-none">
            <Coins size={50} className="text-pink-300 mb-3 animate-bounce" />
            <p className="font-black text-gray-800 text-base sm:text-lg">
              {language === 'hi' ? 'कोई हिसाब / एंट्री नहीं है' : 'No transactions yet'}
            </p>
            <p className="text-sm text-gray-500 mt-1 max-w-xs font-medium">नीचे CASH IN या CASH OUT दबाकर नाम, राशि और रिमार्क दर्ज करें।</p>
            {showSearchAndFilter && (
              <button 
                onClick={() => { setSearchQuery(''); setSelectedModeFilter('ALL'); }}
                className="mt-4 text-xs text-pink-700 font-extrabold bg-pink-50 px-4 py-2 rounded-xl border border-pink-100 hover:bg-pink-100 transition"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          displayGroupedEntries.map((group, gIdx) => (
            <div key={gIdx} className="w-full">
              
              {/* DATE DIVIDER - Big Bold Date */}
              <div className="flex items-center my-3 text-xs sm:text-sm font-black text-slate-500 uppercase tracking-wider select-none px-4">
                <div className="flex-1 border-t-2 border-slate-200"></div>
                <span className="px-4 py-1 bg-slate-100 rounded-full font-black text-slate-700">{group.date}</span>
                <div className="flex-1 border-t-2 border-slate-200"></div>
              </div>

              {/* Day Feed list - Large Text Rows with serial number and stable alignment */}
              <div className="divide-y divide-slate-100">
                {group.entries.map((entry) => {
                  const isIn = entry.type === 'IN';
                  return (
                    <div 
                      key={entry.id}
                      onClick={() => setSelectedEntryForOptions(entry)}
                      className={`border-b border-slate-100 px-3 sm:px-4 py-3.5 flex items-center justify-between gap-3 transition cursor-pointer select-none ${
                        isIn 
                          ? 'bg-emerald-50/35 hover:bg-emerald-100/50 border-l-4 border-l-emerald-600' 
                          : 'bg-rose-50/35 hover:bg-rose-100/50 border-l-4 border-l-rose-600'
                      }`}
                    >
                      {/* Left Side: Serial, Badges & Party Name on distinct lines */}
                      <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                        {/* Top Meta Line: Serial + Type + Mode + Time */}
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="shrink-0 px-2 py-0.5 rounded-lg bg-slate-200 text-slate-800 font-black text-xs">
                            #{entry.serialNo || 1}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            isIn ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}>
                            {isIn ? '✓ जमा' : '✗ खर्च'}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 uppercase">
                            {entry.paymentMode || 'CASH'}
                          </span>
                          {entry.time && (
                            <span className="text-[10px] font-semibold text-slate-400">
                              {entry.time}
                            </span>
                          )}
                        </div>

                        {/* Party Name & Description on its own line */}
                        <div>
                          <span className={`font-black text-base sm:text-lg leading-snug truncate block ${
                            isIn ? 'text-emerald-950' : 'text-rose-950'
                          }`}>
                            {entry.partyName || entry.description || 'लेन-देन'}
                          </span>
                          {entry.description && entry.partyName && entry.description !== entry.partyName && (
                            <span className="text-xs text-slate-600 font-semibold truncate block mt-0.5">
                              {entry.description}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Right Side: Amount & Balance */}
                      <div className="shrink-0 flex flex-col items-end gap-1 text-right">
                        {/* Amount */}
                        <div className="font-black text-base sm:text-xl">
                          <span className={`inline-block px-2.5 py-1 rounded-xl shadow-2xs ${
                            isIn 
                              ? 'text-emerald-700 bg-emerald-100/90 border border-emerald-300' 
                              : 'text-rose-700 bg-rose-100/90 border border-rose-300'
                          }`}>
                            {isIn ? '+' : '-'}{Number(entry.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Running Balance */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] uppercase font-extrabold text-blue-600 tracking-wider">शेष:</span>
                          <span className="font-black text-xs sm:text-sm text-blue-700">
                            {Number(entry.balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ))
        )}
      </div>

      {/* 4. SOLID PURPLE/VIOLET BOTTOM ACTION BAR - Floating Centered */}
      <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-[94%] max-w-[400px] bg-[#4a148c] p-2 rounded-2xl flex gap-2 z-40 shadow-[0_10px_30px_rgba(74,20,140,0.3)] select-none border border-[#6a1b9a]">
        
        {/* CASH IN (GREEN) */}
        <button 
          onClick={() => openAddModal('IN')}
          className="flex-[2] bg-[#00875a] hover:bg-[#00704a] active:scale-[0.98] text-white font-black py-3.5 px-2 rounded-xl text-xs sm:text-sm tracking-wider transition cursor-pointer uppercase shadow-md text-center flex items-center justify-center gap-1.5"
        >
          <Plus size={16} strokeWidth={3} />
          CASH IN
        </button>

        {/* CASH OUT (RED/PINK) */}
        <button 
          onClick={() => openAddModal('OUT')}
          className="flex-[2] bg-[#e0004c] hover:bg-[#be003f] active:scale-[0.98] text-white font-black py-3.5 px-2 rounded-xl text-xs sm:text-sm tracking-wider transition cursor-pointer uppercase shadow-md text-center flex items-center justify-center gap-1.5"
        >
          <Minus size={16} strokeWidth={3} />
          CASH OUT
        </button>

        {/* OPTIONS (BLUE) */}
        <button 
          onClick={() => setShowOptionsDrawer(true)}
          className="flex-[1.2] bg-[#2684ff] hover:bg-[#0062e3] active:scale-[0.98] text-white font-black py-3.5 px-1 rounded-xl text-[10px] sm:text-xs tracking-wider transition cursor-pointer uppercase shadow-md flex flex-col items-center justify-center gap-1"
        >
          <MoreVertical size={16} />
          <span>MORE</span>
        </button>

      </div>

      {/* --- ALL OVERLAYS & MODALS REDESIGNED FOR MAX FIDELITY --- */}

      {/* MODAL 1: SELECT CASH BOOK (Image 1 replica with Rename & Delete capabilities) */}
      {showBooks && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col relative border border-slate-100 animate-in zoom-in-95 duration-150">
            
            {/* Pinkish-Red Header */}
            <div className="bg-[#c2185b] text-white py-4 px-5 text-center text-[15px] font-extrabold tracking-wider uppercase select-none">
              Select Cash Book
            </div>
            
            {/* Cash Books list */}
            <div className="p-4 space-y-2.5 max-h-72 overflow-y-auto divide-y divide-slate-100">
              {cashBooks.map((book) => (
                <div 
                  key={book.id} 
                  className="flex justify-between items-center py-2.5 pl-1"
                >
                  <div 
                    onClick={() => { setActiveCashBookId(book.id); setShowBooks(false); }}
                    className="flex items-center flex-1 cursor-pointer select-none group"
                  >
                    <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center mr-3 transition ${
                      activeCashBookId === book.id 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                        : 'border-slate-300 bg-white text-transparent'
                    }`}>
                      <Check size={11} strokeWidth={4} />
                    </div>
                    <span className={`text-slate-800 font-extrabold text-sm group-hover:text-[#c2185b] transition ${
                      activeCashBookId === book.id ? 'text-[#c2185b] font-black' : ''
                    }`}>
                      {book.name}
                    </span>
                  </div>

                  {/* 3-dot options menu */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBookForOptions(book.id);
                      setNewBookNameInput(book.name);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Blue Add Button */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 select-none">
              <button 
                onClick={() => setShowAddBookForm(true)}
                className="w-full bg-[#2196f3] hover:bg-[#1976d2] text-white font-black py-3.5 rounded-xl shadow-md text-xs tracking-wider transition-all uppercase cursor-pointer text-center"
              >
                ADD NEW CASH BOOK
              </button>
            </div>
            
            {/* Absolute close button */}
            <button 
              onClick={() => { setShowBooks(false); setShowAddBookForm(false); }} 
              className="absolute top-3.5 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
            >
              <X size={18} />
            </button>

          </div>
        </div>
      )}

      {/* FORM: ADD NEW CASH BOOK FORM (Embedded modal style) */}
      {showAddBookForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 flex flex-col relative border border-slate-100 animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 text-center">
              {language === 'hi' ? 'नया खाता बुक' : language === 'hinglish' ? 'Add New Cash Book / Naya Khata' : 'Add New Cash Book'}
            </h3>
            
            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Cash Book Name</label>
                <input 
                  type="text" 
                  value={newBookName}
                  onChange={e => setNewBookName(e.target.value)}
                  placeholder="e.g. Noida Project, Personal"
                  autoFocus
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>

              <div className="flex gap-2.5 pt-1.5">
                <button 
                  onClick={handleAddNewBook}
                  disabled={!newBookName.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-3 rounded-xl shadow text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  SAVE
                </button>
                <button 
                  onClick={() => { setShowAddBookForm(false); setNewBookName(''); }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY: RENAME / DELETE SELECTED CASH BOOK */}
      {selectedBookForOptions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 flex flex-col relative border border-slate-100 animate-in zoom-in-95 duration-150">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 text-center">
              {language === 'hi' ? 'खाता सेटिंग्स' : language === 'hinglish' ? 'Edit Cash Book / Khata Settings' : 'Edit Cash Book'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Rename Cash Book</label>
                <input 
                  type="text" 
                  value={newBookNameInput}
                  onChange={e => setNewBookNameInput(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  placeholder="Enter book name"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1.5">
                <button 
                  onClick={handleRenameBook}
                  disabled={!newBookNameInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  {language === 'hi' ? 'सहेजें' : language === 'hinglish' ? 'Save / Badlein' : 'Save'}
                </button>
                <button 
                  onClick={() => setSelectedBookForOptions(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button 
                  onClick={handleDeleteBook}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={13} /> Delete Cash Book
                </button>
              </div>
            </div>

            <button 
              onClick={() => setSelectedBookForOptions(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD ENTRY MODAL - FOCUSED ON 3 CLEAR LINES (AMOUNT, NAME, REMARK) WITH TOP-RIGHT DATE & TIME + 1-BUTTON PAYMENT MODE */}
      {showAddEntryModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center z-[999] p-3 sm:p-4 pb-16 sm:pb-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[88vh] border border-slate-100 relative animate-in zoom-in-95 duration-150 overflow-hidden mb-1 sm:mb-0">
            
            {/* Modal Header: Title on Left, Date & Time + Close in Top Right Corner */}
            <div className="shrink-0 p-4 pb-3 border-b border-slate-100 bg-slate-50/85">
              <div className="flex items-center justify-between gap-2">
                {/* Left: Title & Badge */}
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                    {editingEntryId ? (type === 'IN' ? 'Edit Cash In' : 'Edit Cash Out') : (type === 'IN' ? 'Cash In (जमा)' : 'Cash Out (खर्च)')}
                  </h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-black uppercase ${
                    type === 'IN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {type === 'IN' ? '+ जमा (आया)' : '- खर्च (गया)'}
                  </span>
                </div>

                {/* Right Corner: Date & Time Picker + Close Button */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-2 py-1 shadow-xs">
                    <Calendar size={13} className="text-[#c2185b] shrink-0" />
                    <input 
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="text-xs font-black text-slate-800 outline-none bg-transparent cursor-pointer"
                      title="दिनांक चुनें"
                    />
                    <span className="text-slate-300">|</span>
                    <Clock size={11} className="text-slate-400 shrink-0" />
                    <input 
                      type="text"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      placeholder="12:00 PM"
                      className="w-14 text-[11px] font-bold text-slate-700 outline-none bg-transparent"
                      title="समय"
                    />
                  </div>

                  <button 
                    onClick={() => setShowAddEntryModal(false)} 
                    className="text-slate-400 hover:bg-slate-200/60 p-1.5 rounded-full transition cursor-pointer"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Sub-Bar: IN/OUT Switch + 1-Click Payment Mode Button (Cash / UPI / Bank) */}
              <div className="flex items-center gap-2 mt-3 select-none">
                {/* Cash In / Out Switch */}
                <div className="flex-1 bg-slate-200/80 p-1 rounded-2xl flex gap-1">
                  <button 
                    type="button"
                    onClick={() => setType('IN')}
                    className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm tracking-wider transition-all uppercase cursor-pointer flex items-center justify-center gap-1 ${
                      type === 'IN' 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-slate-700 hover:text-slate-900 font-bold'
                    }`}
                  >
                    <Plus size={16} strokeWidth={3} />
                    <span>IN (+ जमा)</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType('OUT')}
                    className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm tracking-wider transition-all uppercase cursor-pointer flex items-center justify-center gap-1 ${
                      type === 'OUT' 
                        ? 'bg-rose-600 text-white shadow-md' 
                        : 'text-slate-700 hover:text-slate-900 font-bold'
                    }`}
                  >
                    <Minus size={16} strokeWidth={3} />
                    <span>OUT (- खर्च)</span>
                  </button>
                </div>

                {/* 1 Single Button for Cash, UPI, Bank */}
                <button
                  type="button"
                  onClick={() => {
                    const modes = ['CASH', 'UPI', 'BANK'];
                    const nextIdx = (modes.indexOf(paymentMode) + 1) % modes.length;
                    setPaymentMode(modes[nextIdx]);
                  }}
                  className="px-3 py-2 bg-white hover:bg-slate-50 border-2 border-slate-300 rounded-2xl font-black text-xs text-slate-800 flex items-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap active:scale-95 shrink-0"
                  title="क्लिक करके Cash / UPI / Bank बदलें"
                >
                  {paymentMode === 'CASH' && <span className="flex items-center gap-1 text-emerald-700">💰 <span>Cash (नकद)</span></span>}
                  {paymentMode === 'UPI' && <span className="flex items-center gap-1 text-blue-700">📱 <span>UPI</span></span>}
                  {paymentMode === 'BANK' && <span className="flex items-center gap-1 text-indigo-700">🏦 <span>Bank</span></span>}
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1 py-0.5 rounded-md">⇄ बदलें</span>
                </button>
              </div>
            </div>

            {/* Scrollable Form Body: 3 DISTINCT, LARGE, CRYSTAL-CLEAR LINES */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-left scrollbar-thin">
              
              {/* LINE 1: 💰 AMOUNT (राशि / अमाउंट) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#c2185b] text-white text-xs flex items-center justify-center font-black shrink-0">1</span>
                    <span>राशि / अमाउंट (Amount) <span className="text-rose-500">*</span></span>
                  </label>
                  <span className="text-xs text-slate-500 font-bold">कितना रुपया?</span>
                </div>
                
                <div className={`relative border-2 rounded-2xl px-4 py-3.5 flex items-center gap-2 bg-white transition-all shadow-xs ${
                  type === 'IN' ? 'border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/20' : 'border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/20'
                }`}>
                  <span className={`font-black text-2xl sm:text-3xl ${type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {currency === 'INR' ? '₹' : '$'}
                  </span>
                  <input 
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full outline-none text-2xl sm:text-3xl font-black bg-transparent text-slate-900 placeholder-slate-300"
                    placeholder="यहाँ राशि लिखें (उदा. 5000)"
                    autoFocus
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex gap-1.5 flex-wrap pt-1">
                  {[500, 1000, 2000, 5000, 10000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(prev => {
                        const current = Number(prev) || 0;
                        return String(current + val);
                      })}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl border border-slate-200 transition cursor-pointer"
                    >
                      +₹{val.toLocaleString('en-IN')}
                    </button>
                  ))}
                  {amount && (
                    <button
                      type="button"
                      onClick={() => setAmount('')}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition cursor-pointer"
                    >
                      हटाएं (Clear)
                    </button>
                  )}
                </div>
              </div>

              {/* LINE 2: 👤 NAME / PARTY (नाम / पार्टी) + Quick Advance & Previous Suggestions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#c2185b] text-white text-xs flex items-center justify-center font-black shrink-0">2</span>
                    <span>नाम / पार्टी (Name / Party)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const advText = type === 'IN' ? 'एडवांस मिला (Advance Received)' : 'एडवांस दिया (Advance Given)';
                      setDescription(advText);
                      if (!partyName) setPartyName('Advance');
                    }}
                    className="text-xs font-black bg-pink-100 hover:bg-pink-200 text-[#c2185b] px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 border border-pink-300 shadow-xs"
                  >
                    <span>⚡</span>
                    <span>+ एडवांस (Advance)</span>
                  </button>
                </div>
                
                <div className="relative">
                  <input 
                    type="text"
                    value={partyName}
                    onChange={e => {
                      setPartyName(e.target.value);
                      setDescription(e.target.value);
                    }}
                    className="w-full border-2 border-slate-200 bg-slate-50 focus:bg-white rounded-2xl px-4 py-3.5 pr-10 text-slate-900 text-base sm:text-lg font-bold focus:outline-none focus:border-[#c2185b] focus:ring-4 focus:ring-pink-500/20 transition placeholder-slate-400"
                    placeholder="व्यक्ति / लेबर / पार्टी का नाम (उदा. राहुल, ठेकेदार)..."
                  />
                  {partyName && (
                    <button 
                      type="button" 
                      onClick={() => { setPartyName(''); setDescription(''); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-full cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                {/* Auto Suggestions for Name (Purane/Previous Names) */}
                {filteredSuggestions.length > 0 && (
                  <div className="mt-2 bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide block mb-1.5">
                      💡 पुराने नाम / पार्टियाँ चुनें (Previous Names):
                    </span>
                    <div className="flex gap-1.5 flex-wrap max-h-32 overflow-y-auto">
                      {filteredSuggestions.map(name => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            setPartyName(name);
                            setDescription(name);
                          }}
                          className={`text-xs px-3 py-1.5 rounded-xl font-black border transition-all cursor-pointer flex items-center gap-1 ${
                            partyName.trim() === name.trim()
                              ? 'bg-[#c2185b] border-[#c2185b] text-white shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          <span>👤</span>
                          <span>{name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Sticky Actions Panel at Modal Bottom - Big Save Buttons */}
            <div className="shrink-0 p-4 pb-5 border-t border-slate-200 bg-slate-50 sticky bottom-0 z-30 shadow-lg grid grid-cols-2 gap-3 w-full select-none">
              <button 
                onClick={() => handleSave(true)}
                disabled={!amount}
                className={`py-4 rounded-2xl font-black text-sm tracking-wide text-white transition active:scale-95 cursor-pointer uppercase shadow-lg flex items-center justify-center gap-2 ${
                  type === 'IN' 
                    ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300' 
                    : 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300'
                }`}
              >
                <Check size={18} strokeWidth={3} />
                <span>सहेजें (SAVE)</span>
              </button>
              <button 
                onClick={() => handleSave(false)}
                disabled={!amount}
                className="py-4 rounded-2xl bg-slate-900 hover:bg-slate-850 disabled:opacity-55 text-white font-black text-sm tracking-wide transition active:scale-95 cursor-pointer uppercase shadow-lg text-center"
              >
                SAVE & NEXT (+)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: OPTIONS MENU DRAWER / DIALOG (Triggered by Options button) */}
      {showOptionsDrawer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center z-50 animate-in fade-in duration-200">
          {/* Transparent click out area */}
          <div className="absolute inset-0" onClick={() => setShowOptionsDrawer(false)}></div>
          
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 flex flex-col relative border-t border-slate-100 animate-in slide-in-from-bottom duration-250 z-51 shadow-2xl select-none">
            
            {/* Grab handle bar */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5"></div>
            
            <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider mb-4 text-center flex items-center justify-center gap-2">
              <Settings size={18} className="text-[#c2185b]" />
              <span>कैश बुक विकल्प (Options)</span>
            </h3>

            {/* Grid list of interactive helper options */}
            <div className="grid grid-cols-1 gap-3">
              
              {/* Option 1: Toggle Search and filter */}
              <button 
                onClick={() => { setShowSearchAndFilter(!showSearchAndFilter); setShowOptionsDrawer(false); }}
                className={`p-4 rounded-2xl border-2 font-black text-sm flex items-center justify-between transition-all cursor-pointer ${
                  showSearchAndFilter 
                    ? 'bg-pink-50 border-[#c2185b] text-[#c2185b]' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Search size={18} />
                  <span>{showSearchAndFilter ? 'खोज पट्टी छिपाएं' : 'खोज पट्टी दिखाएं (Search)'}</span>
                </div>
                <span className="text-xs font-black uppercase text-slate-400">🔍 Search</span>
              </button>

              {/* Option 2: Toggle Stats Overview */}
              <button 
                onClick={() => { setShowStatsSummary(!showStatsSummary); setShowOptionsDrawer(false); }}
                className={`p-4 rounded-2xl border-2 font-black text-sm flex items-center justify-between transition-all cursor-pointer ${
                  showStatsSummary 
                    ? 'bg-pink-50 border-[#c2185b] text-[#c2185b]' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Info size={18} />
                  <span>{showStatsSummary ? 'ऊपरी बैलेंस सारांश छिपाएं' : 'ऊपरी बैलेंस सारांश दिखाएं'}</span>
                </div>
                <span className="text-xs font-black uppercase text-slate-400">📊 Stats</span>
              </button>

              {/* Option 3: Export To CSV */}
              <button 
                onClick={handleExportCSV}
                className="p-4 bg-white border-2 border-slate-200 rounded-2xl font-black text-sm text-slate-800 hover:bg-slate-50 transition flex items-center gap-3 cursor-pointer"
              >
                <Download size={18} className="text-blue-500" />
                <div className="text-left flex-1">
                  <span className="block font-black">खाता डाउनलोड करें (Export CSV/Excel)</span>
                  <span className="block text-xs text-slate-500 font-medium">लेन-देन की पूरी लिस्ट डाउनलोड करें</span>
                </div>
              </button>

            </div>

            {/* Cancel Button */}
            <button 
              onClick={() => setShowOptionsDrawer(false)}
              className="mt-5 w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl text-sm uppercase tracking-wider transition cursor-pointer text-center shadow-md"
            >
              बंद करें (CLOSE)
            </button>

          </div>
        </div>
      )}

      {/* MODAL 4: TRANSACTION ROW DETAIL POPUP - BIG TEXT & FOCUSED ON 3 ITEMS (AMOUNT, NAME, REMARK) */}
      {selectedEntryForOptions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 flex flex-col relative border border-slate-100 animate-in zoom-in-95 duration-150 select-none">
            
            <h3 className="font-black text-slate-900 text-lg uppercase tracking-wide mb-4 text-center">
              लेन-देन विवरण (Transaction)
            </h3>

            {/* Data summary - Highlight the 3 things (Amount, Name, Remark) with Big Font */}
            <div className="bg-slate-50 rounded-2xl p-5 text-sm space-y-3.5 border border-slate-200">
              
              {/* Type & Amount */}
              <div className="text-center pb-2 border-b border-slate-200">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black mb-1 ${
                  selectedEntryForOptions.type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {selectedEntryForOptions.type === 'IN' ? '➕ CASH IN (जमा)' : '➖ CASH OUT (खर्च)'}
                </span>
                <p className={`font-black text-2xl sm:text-3xl mt-1 ${
                  selectedEntryForOptions.type === 'IN' ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {formatNum(selectedEntryForOptions.amount)}
                </p>
              </div>

              {/* 1. Name */}
              <div>
                <span className="font-black text-slate-400 uppercase tracking-wider text-[11px] block">1. नाम (Name / Party)</span>
                <span className="font-black text-slate-900 text-lg block mt-0.5">{selectedEntryForOptions.partyName || 'N/A'}</span>
              </div>

              {/* 2. Remark */}
              <div>
                <span className="font-black text-slate-400 uppercase tracking-wider text-[11px] block">2. रिमार्क (Remark / Details)</span>
                <span className="font-bold text-slate-800 text-base block mt-0.5">{selectedEntryForOptions.description || 'कोई रिमार्क नहीं'}</span>
              </div>

              {/* Date & Time */}
              <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-500">
                <span>दिनांक: {selectedEntryForOptions.date}</span>
                <span>{selectedEntryForOptions.time || ''}</span>
              </div>
            </div>

            {/* Actions: EDIT, DELETE or CANCEL */}
            <div className="space-y-2.5 mt-5">
              <button 
                onClick={() => openEditModal(selectedEntryForOptions)}
                className="w-full bg-[#2196f3] hover:bg-[#1976d2] text-white font-black py-4 rounded-2xl text-sm uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <Edit2 size={16} /> <span>सुधारें (Edit Entry)</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button 
                  onClick={() => {
                    if (window.confirm("क्या आप इस एंट्री को हमेशा के लिए हटाना चाहते हैं?")) {
                      deleteCashEntry(selectedEntryForOptions.id);
                      setSelectedEntryForOptions(null);
                    }
                  }}
                  className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Trash2 size={15} /> <span>हटाएं (Delete)</span>
                </button>
                <button 
                  onClick={() => setSelectedEntryForOptions(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-xs text-center"
                >
                  बंद करें (CLOSE)
                </button>
              </div>
            </div>

            <button 
              onClick={() => setSelectedEntryForOptions(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
