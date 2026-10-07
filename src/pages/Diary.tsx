import React, { useState, useEffect, useMemo } from 'react';
import { PenSquare, Trash2, Calendar, FileText, Book, Calculator, Tag, ArrowLeft, ChevronDown, Hash, Save, Type, ChevronLeft, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return dateString;
};

const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface Note {
  id: string;
  date: string;
  content: string;
  totalAmount: number;
  color: string;
  fontId?: string;
}

interface FontOption {
  id: string;
  nameEn: string;
  nameHi: string;
  fontFamily: string;
  textColor: string;
  icon: string;
}

const DARK_FONTS: FontOption[] = [
  {
    id: 'serif',
    nameEn: 'Bold Sans',
    nameHi: 'बोल्ड (मोटा व काला)',
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', sans-serif",
    textColor: '#000000',
    icon: '✒️'
  },
  {
    id: 'charcoal',
    nameEn: 'Charcoal Black',
    nameHi: 'गाढ़ा ब्लैक (Extra Bold)',
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    textColor: '#000000',
    icon: '📝'
  },
  {
    id: 'handwriting',
    nameEn: 'Handwriting Bold',
    nameHi: 'हैंडराइटिंग (Bold)',
    fontFamily: "'Caveat', 'Comic Sans MS', cursive, sans-serif",
    textColor: '#000000',
    icon: '✍️'
  },
  {
    id: 'typewriter',
    nameEn: 'Typewriter Mono',
    nameHi: 'टाइपराइटर (Bold)',
    fontFamily: "'Courier New', Courier, monospace",
    textColor: '#000000',
    icon: '⌨️'
  },
  {
    id: 'calligraphy',
    nameEn: 'Royal Display',
    nameHi: 'रॉयल बोर्ड (Bold)',
    fontFamily: "Georgia, 'Playfair Display', serif",
    textColor: '#000000',
    icon: '📜'
  }
];

const NOTE_COLORS = [
  'bg-amber-50 border-amber-200 text-amber-900',
  'bg-emerald-50 border-emerald-200 text-emerald-900',
  'bg-sky-50 border-sky-200 text-sky-900',
  'bg-rose-50 border-rose-200 text-rose-900',
  'bg-purple-50 border-purple-200 text-purple-900',
  'bg-indigo-50 border-indigo-200 text-indigo-900'
];

export default function Diary() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedFontId, setSelectedFontId] = useState<string>(() => {
    return localStorage.getItem('app_diary_font') || 'serif';
  });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);

  // Quick Amount Addition State
  const [quickItemName, setQuickItemName] = useState('');
  const [quickAmount, setQuickAmount] = useState('');

  const handleAddQuickItem = () => {
    if (!quickAmount.trim()) return;
    const name = quickItemName.trim() || 'खर्चा/आइटम';
    const lineToAdd = `• ${name}: ₹${quickAmount.trim()}`;
    setCurrentNote(prev => prev ? `${prev}\n${lineToAdd}` : lineToAdd);
    setQuickItemName('');
    setQuickAmount('');
  };

  // 📖 3D Page Flip Animation States
  const [pageFlipKey, setPageFlipKey] = useState(0);
  const [pageFlipDirection, setPageFlipDirection] = useState<'next' | 'prev'>('next');
  const [isBookViewMode, setIsBookViewMode] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);

  const triggerPageFlip = (direction: 'next' | 'prev' = 'next') => {
    setPageFlipDirection(direction);
    setPageFlipKey(prev => prev + 1);
  };

  // 📖 Date Navigation & Auto-Sync State
  const changeDateByDays = (dateStr: string, days: number): string => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      d.setDate(d.getDate() + days);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    return dateStr;
  };

  const getPageNumberForDate = (dateStr: string) => {
    const allDates = Array.from(new Set([...notes.map(n => n.date), dateStr])).sort();
    const index = allDates.indexOf(dateStr);
    return index >= 0 ? index + 1 : 1;
  };

  // Sync currentNote when selectedDate or notes change
  useEffect(() => {
    const noteForDate = notes.find(n => n.date === selectedDate);
    if (noteForDate) {
      setCurrentNote(noteForDate.content);
      if (noteForDate.fontId) {
        setSelectedFontId(noteForDate.fontId);
      }
    } else {
      setCurrentNote('');
    }
  }, [selectedDate]);

  const handleDateFlip = (direction: 'next' | 'prev') => {
    triggerPageFlip(direction);
    const newDate = changeDateByDays(selectedDate, direction === 'next' ? 1 : -1);
    setSelectedDate(newDate);
  };

  const handleDateSelect = (newDateStr: string) => {
    if (newDateStr) {
      triggerPageFlip(newDateStr > selectedDate ? 'next' : 'prev');
      setSelectedDate(newDateStr);
    }
  };

  const activeFont = useMemo(() => {
    return DARK_FONTS.find(f => f.id === selectedFontId) || DARK_FONTS[0];
  }, [selectedFontId]);

  const handleFontChange = (fontId: string) => {
    setSelectedFontId(fontId);
    localStorage.setItem('app_diary_font', fontId);
  };
  
  useEffect(() => {
    const saved = localStorage.getItem('app_diary_notes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);
  
  const saveNotes = (newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem('app_diary_notes', JSON.stringify(newNotes));
  };
  
  const calculateTotal = (text: string) => {
    let sum = 0;
    const lines = text.split('\n');
    for (const line of lines) {
      const cleanedLine = line.trim().replace(/^(\d+[\.\)]|\(\d+\)|•|✓|-|\[ \]|\[x\]|s\.?no\.?\s*#?\d*)\s*/i, '');
      
      const currencyMatch = cleanedLine.match(/(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:₹|rs\.?|inr)/i);
      if (currencyMatch) {
        const val = parseFloat(currencyMatch[1] || currencyMatch[2]);
        if (!isNaN(val)) sum += val;
      } else {
        if (!cleanedLine.match(/\b\d{1,4}[-/]\d{1,2}[-/]\d{1,4}\b/)) {
          const nums = cleanedLine.match(/\b\d+(?:\.\d+)?\b/g);
          if (nums && nums.length > 0) {
            const lastNum = parseFloat(nums[nums.length - 1]);
            if (!isNaN(lastNum)) sum += lastNum;
          }
        }
      }
    }
    return sum;
  };

  const currentTotal = useMemo(() => calculateTotal(currentNote), [currentNote]);
  
  const handleSave = () => {
    if (!currentNote.trim()) return;
    
    const existingIndex = notes.findIndex(n => n.date === selectedDate);
    let updatedNotes: Note[];
    
    if (existingIndex >= 0) {
      updatedNotes = notes.map((n, idx) => {
        if (idx === existingIndex) {
          return {
            ...n,
            content: currentNote,
            totalAmount: currentTotal,
            fontId: selectedFontId
          };
        }
        return n;
      });
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        date: selectedDate,
        content: currentNote,
        totalAmount: currentTotal,
        color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
        fontId: selectedFontId
      };
      updatedNotes = [newNote, ...notes];
    }
    
    saveNotes(updatedNotes);
    triggerPageFlip('next');
    const nextDay = changeDateByDays(selectedDate, 1);
    setSelectedDate(nextDay);
  };
  
  const deleteNote = (id: string) => {
    if (confirm('Delete this note?')) {
      saveNotes(notes.filter(n => n.id !== id));
      if (activePageIndex >= notes.length - 1 && activePageIndex > 0) {
        setActivePageIndex(prev => prev - 1);
      }
    }
  };

  const startInlineEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingText(note.content);
  };

  const saveInlineEdit = (id: string) => {
    const updated = notes.map(n => {
      if (n.id === id) {
        return {
          ...n,
          content: editingText,
          totalAmount: calculateTotal(editingText)
        };
      }
      return n;
    });
    saveNotes(updated);
    setEditingNoteId(null);
    setEditingText('');
  };

  const cancelInlineEdit = () => {
    setEditingNoteId(null);
    setEditingText('');
  };

  const handleNextBookPage = () => {
    if (activePageIndex < notes.length - 1) {
      triggerPageFlip('next');
      setActivePageIndex(prev => prev + 1);
    }
  };

  const handlePrevBookPage = () => {
    if (activePageIndex > 0) {
      triggerPageFlip('prev');
      setActivePageIndex(prev => prev - 1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Lined Notebook & 3D Page Flip Styles */}
      <style>{`
        .perspective-1200 {
          perspective: 1400px;
        }
        .page-curl-corner {
          clip-path: polygon(100% 0, 0 100%, 100% 100%);
        }
        .lined-paper-input {
          background-color: #ffffff !important;
          background-image: 
            linear-gradient(90deg, transparent 48px, #ef4444 48px, #ef4444 49.5px, transparent 49.5px),
            repeating-linear-gradient(transparent, transparent 33px, #94a3b8 33px, #94a3b8 34px) !important;
          background-size: 100% 34px, 100% 34px !important;
          line-height: 34px !important;
          padding-top: 10px !important;
          padding-bottom: 10px !important;
          padding-left: 60px !important;
          padding-right: 16px !important;
          font-weight: 800 !important;
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif !important;
          font-size: 18px !important;
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          letter-spacing: 0.3px !important;
          opacity: 1 !important;
          min-height: 380px !important;
          border: 2px solid #64748b !important;
          border-radius: 12px !important;
          box-shadow: inset 0 2px 6px 0 rgba(0, 0, 0, 0.08) !important;
        }
        .lined-paper-input::placeholder {
          font-weight: 700 !important;
          font-family: sans-serif !important;
          color: #64748b !important;
          font-size: 15px !important;
          -webkit-text-fill-color: #64748b !important;
        }
        .lined-paper-note {
          background-color: #ffffff !important;
          background-image: 
            linear-gradient(90deg, transparent 48px, #ef4444 48px, #ef4444 49.5px, transparent 49.5px),
            repeating-linear-gradient(transparent, transparent 33px, #94a3b8 33px, #94a3b8 34px) !important;
          background-size: 100% 34px, 100% 34px !important;
          line-height: 34px !important;
          padding-top: 10px !important;
          padding-bottom: 10px !important;
          padding-left: 60px !important;
          padding-right: 16px !important;
          font-weight: 800 !important;
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif !important;
          font-size: 18px !important;
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          letter-spacing: 0.3px !important;
          opacity: 1 !important;
          border-radius: 12px !important;
          border: 2px solid #94a3b8 !important;
          box-shadow: 0 4px 8px -1px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>

      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-4 py-3 sm:px-6 sm:py-3.5 pb-5 rounded-b-2xl shadow-md sticky top-0 z-40 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1.5 hover:bg-white/15 rounded-full transition-colors shrink-0 cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold flex items-center">
                <Book className="mr-2 text-blue-200" size={22} /> स्मार्ट डायरी / Smart Diary
              </h1>
              <p className="text-blue-100 text-[11px] opacity-90">
                कॉपी पेज पलटें (Book Page Flip) • Auto-Calculated Hisab
              </p>
            </div>
          </div>

          {notes.length > 0 && (
            <button
              onClick={() => setIsBookViewMode(!isBookViewMode)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer shrink-0"
            >
              <BookOpen size={15} />
              <span className="hidden sm:inline">{isBookViewMode ? 'राइटिंग मोड (Write Note)' : '📖 पेज पलटकर देखें'}</span>
              <span className="sm:hidden">{isBookViewMode ? 'Write' : '📖 Flip'}</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="p-3 sm:p-4 -mt-2 flex-1 max-w-4xl mx-auto w-full">
        {/* 📖 3D BOOK PAGE CONTAINER WITH PAGE FLIP EFFECT */}
        <div className="perspective-1200 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pageFlipKey}
              initial={{ rotateY: pageFlipDirection === 'next' ? 65 : -65, opacity: 0.8 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: pageFlipDirection === 'next' ? -65 : 65, opacity: 0.8 }}
              transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
              style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
              className="bg-[#faf8f5] rounded-2xl shadow-2xl border-2 border-amber-300/80 overflow-hidden flex flex-col md:flex-row relative"
            >
              {/* Side Red Binder/Spine Ribbon */}
              <div className="w-full md:w-10 bg-gradient-to-b from-rose-700 to-rose-900 border-b md:border-b-0 md:border-r border-rose-800 p-2 md:py-6 flex md:flex-col justify-around items-center shrink-0 relative min-h-[36px] shadow-inner z-10">
                <div className="w-3 h-3 bg-white border border-slate-400 rounded-full shadow-inner hidden md:block my-4" />
                <div className="w-3 h-3 bg-white border border-slate-400 rounded-full shadow-inner hidden md:block my-4" />
                <div className="w-3 h-3 bg-white border border-slate-400 rounded-full shadow-inner hidden md:block my-4" />
                <div className="w-3 h-3 bg-white border border-slate-400 rounded-full shadow-inner hidden md:block my-4" />
                <span className="text-[9px] tracking-widest font-black text-rose-200 uppercase rotate-0 md:-rotate-90 origin-center whitespace-nowrap">
                  REGISTER COPY
                </span>
              </div>

              <div className="flex-1 p-5 sm:p-6 bg-[#fcfbf7] relative">
                
                {/* Ultra-Compact Single-Line Top Bar */}
                <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-3 pb-2 border-b border-rose-300/60 bg-amber-50/90 dark:bg-slate-900/90 p-2 rounded-xl border border-amber-200 dark:border-amber-900/60 shadow-2xs relative z-20">
                  
                  {/* Left: Prev Page Flip Button */}
                  <button
                    type="button"
                    onClick={() => handleDateFlip('prev')}
                    className="bg-white dark:bg-slate-800 hover:bg-amber-100 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 px-2 py-1 rounded-lg font-black text-xs flex items-center gap-1 transition cursor-pointer active:scale-95 shrink-0 shadow-2xs"
                    title="पिछला दिनांक पेज (Previous Date Page)"
                  >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">👈 पिछला</span>
                  </button>

                  {/* Center: Date Picker & Page No */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-rose-300 dark:border-rose-800 text-xs font-extrabold text-slate-800 dark:text-slate-100 shadow-2xs">
                      <Calendar size={14} className="text-rose-500 shrink-0" />
                      <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => handleDateSelect(e.target.value)}
                        className="font-black text-xs text-slate-900 dark:text-slate-100 bg-transparent border-none outline-none cursor-pointer p-0"
                      />
                    </div>

                    <span className="text-[11px] font-black font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2 py-1 rounded-md border border-rose-200 dark:border-rose-900 shrink-0">
                      PAGE #{getPageNumberForDate(selectedDate)}
                    </span>
                  </div>

                  {/* Right: Font Selector & Flip Next Button */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                        className="bg-white dark:bg-slate-800 hover:bg-amber-100 text-slate-900 dark:text-slate-100 border border-amber-300 dark:border-amber-700 px-2 py-1 rounded-lg font-black text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="फ़ॉन्ट बदलें (Change Font)"
                      >
                        <span>{activeFont.icon}</span>
                        <span className="hidden sm:inline text-[11px]">{activeFont.nameHi}</span>
                        <ChevronDown size={14} className={`transition-transform duration-150 ${isFontDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isFontDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setIsFontDropdownOpen(false)} />
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-700 rounded-xl shadow-2xl z-30 overflow-hidden py-1 divide-y divide-slate-100 dark:divide-slate-800">
                            {DARK_FONTS.map((font) => (
                              <button
                                key={font.id}
                                type="button"
                                onClick={() => {
                                  handleFontChange(font.id);
                                  setIsFontDropdownOpen(false);
                                }}
                                style={{ fontFamily: font.fontFamily, color: font.textColor }}
                                className={`w-full px-2.5 py-1.5 text-left flex items-center justify-between text-xs transition cursor-pointer ${
                                  selectedFontId === font.id ? 'bg-amber-100 dark:bg-amber-950 font-black' : 'hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <span>{font.icon}</span>
                                  <span>{font.nameHi}</span>
                                </span>
                                {selectedFontId === font.id && <span className="text-[10px] text-amber-700 font-bold">✓</span>}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDateFlip('next')}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer active:scale-95 shadow-2xs"
                      title="अगला दिनांक पेज (Next Date Page)"
                    >
                      <span className="hidden sm:inline">अगला 👉</span>
                      <ChevronRight size={16} />
                    </button>

                    {/* TOP SAVE BUTTON IN HEADER */}
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!currentNote.trim()}
                      className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs px-2.5 py-1 rounded-lg transition shadow-md cursor-pointer disabled:opacity-40 shrink-0 flex items-center gap-1"
                      title="पेज सहेजें (Save Page)"
                    >
                      <PenSquare size={13} />
                      <span>सहेजें</span>
                    </button>
                  </div>
                </div>

                {/* 💰 SLEEK TOP TOTAL & QUICK ADD AMOUNT BAR */}
                <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-emerald-500/40 shadow-sm mb-3 space-y-2 relative z-20">
                  {/* Row 1: Clear Total Amount Display + Save Button */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">कुल राशि:</span>
                      <span className="text-base sm:text-lg font-black font-mono text-emerald-300 bg-emerald-950/90 px-2.5 py-0.5 rounded-lg border border-emerald-500/30 truncate">
                        ₹{currentTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (quickAmount.trim()) {
                          handleAddQuickItem();
                          setTimeout(() => handleSave(), 50);
                        } else {
                          handleSave();
                        }
                      }}
                      disabled={!currentNote.trim() && !quickAmount.trim()}
                      className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs px-3 py-1.5 rounded-lg transition shadow cursor-pointer disabled:opacity-40 shrink-0 flex items-center gap-1"
                      title="डायरी सेव करें (Save)"
                    >
                      <PenSquare size={13} />
                      <span>💾 डायरी सेव करें</span>
                    </button>
                  </div>

                  {/* Row 2: Quick Add Item & Amount Inputs - Strictly 1 row side-by-side */}
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      placeholder="सामग्री / विवरण"
                      value={quickItemName}
                      onChange={(e) => setQuickItemName(e.target.value)}
                      className="flex-1 min-w-0 bg-slate-950 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-400 font-medium placeholder:text-slate-500"
                    />
                    <div className="relative w-22 sm:w-28 shrink-0">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        placeholder="राशि"
                        value={quickAmount}
                        onChange={(e) => setQuickAmount(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddQuickItem(); }}
                        className="w-full bg-slate-950 text-emerald-300 text-xs pl-5 pr-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-400 font-bold font-mono placeholder:text-slate-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddQuickItem}
                      disabled={!quickAmount.trim()}
                      className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg transition shadow cursor-pointer disabled:opacity-40 shrink-0 flex items-center gap-1"
                      title="डायरी में जोड़ें"
                    >
                      <span>➕</span>
                      <span className="font-extrabold text-xs">जोड़ें</span>
                    </button>
                  </div>
                </div>

                {/* Text Area Note Input */}
                <textarea 
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="आज की डायरी / हिसाब लिखें... (उदा. 1. सीमेंट ₹500, 2. चाय ₹150, कुल ऑटो-जोड़ होगा)"
                  style={{
                    fontFamily: activeFont.fontFamily,
                    color: activeFont.textColor
                  }}
                  className="w-full lined-paper-input resize-none focus:outline-none relative z-10"
                />
                
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 relative z-10">
                  <div className="flex items-center bg-emerald-50 dark:bg-slate-900 px-4 py-3 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 w-full sm:w-auto flex-1 shadow-2xs">
                    <Calculator size={20} className="text-emerald-600 dark:text-emerald-400 mr-3 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">कुल हिसाब / Total Calculated</span>
                      <span className="font-extrabold text-xl text-emerald-800 dark:text-emerald-300 font-mono">₹{currentTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleSave}
                    disabled={!currentNote.trim()}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 transition text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-blue-200 dark:shadow-none cursor-pointer"
                  >
                    <PenSquare size={18} className="mr-2" /> प्रविष्टि सहेजें (Save Page)
                  </button>
                </div>

                {/* 📖 Curled Dog-Ear Page Turn Corner (Copy Page Palti Effect) */}
                <button
                  type="button"
                  onClick={() => handleDateFlip('next')}
                  className="absolute bottom-0 right-0 z-20 w-12 h-12 bg-gradient-to-tl from-amber-300 via-amber-200/90 to-transparent rounded-tl-2xl border-t border-l border-amber-400/80 shadow-md flex items-end justify-end p-1 hover:w-14 hover:h-14 transition-all cursor-pointer group"
                  title="अगला दिनांक पेज पलटें (Page Turn Next Date)"
                >
                  <span className="text-[9px] font-black text-amber-900 flex items-center gap-0.5 group-hover:scale-110 transition-transform">
                    <span>📖</span>
                    <span>पालटें</span>
                  </span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 📚 DIGITAL BOOK FLIP READER MODE OR ALL PREVIOUS ENTRIES */}
        {isBookViewMode && notes.length > 0 ? (
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-amber-500/40 mb-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="text-amber-400" size={20} />
                <h3 className="font-black text-base sm:text-lg text-amber-200">
                  डिजिटल कॉपी पेज रीडर (Page Flip Reader)
                </h3>
              </div>
              <span className="bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-black font-mono">
                Page {activePageIndex + 1} of {notes.length}
              </span>
            </div>

            {/* Book Flip Reader Single Page Display */}
            <div className="perspective-1200 my-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={notes[activePageIndex]?.id || activePageIndex}
                  initial={{ rotateY: pageFlipDirection === 'next' ? 70 : -70, opacity: 0.8 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: pageFlipDirection === 'next' ? -70 : 70, opacity: 0.8 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{ transformOrigin: 'left center' }}
                  className="bg-[#fcfbf7] text-slate-900 rounded-2xl p-5 border-2 border-amber-300 shadow-2xl relative min-h-[220px]"
                >
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-rose-300">
                    <span className="text-xs font-black text-rose-600 font-mono">
                      PAGE NO. #{notes.length - activePageIndex}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-300">
                      📅 {formatDate(notes[activePageIndex]?.date)}
                    </span>
                  </div>

                  <div 
                    className="lined-paper-note whitespace-pre-wrap text-base font-bold min-h-[140px]"
                    style={{
                      fontFamily: (DARK_FONTS.find(f => f.id === notes[activePageIndex]?.fontId) || activeFont).fontFamily,
                      color: (DARK_FONTS.find(f => f.id === notes[activePageIndex]?.fontId) || activeFont).textColor
                    }}
                  >
                    {notes[activePageIndex]?.content}
                  </div>

                  {notes[activePageIndex]?.totalAmount > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-300 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-600 uppercase">कुल हिसाब</span>
                      <span className="text-base font-extrabold text-blue-700 font-mono">
                        ₹{notes[activePageIndex]?.totalAmount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Book Page Flip Navigation Bar */}
            <div className="flex items-center justify-between gap-3 mt-5 pt-3 border-t border-slate-800">
              <button
                onClick={handlePrevBookPage}
                disabled={activePageIndex === 0}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 font-black text-xs px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer active:scale-95 disabled:active:scale-100"
              >
                <ChevronLeft size={16} />
                <span>👈 पिछला पेज (Flip Prev)</span>
              </button>

              <span className="text-xs font-bold text-slate-400 hidden sm:inline">
                स्वाइप या बटन से कॉपी का पेज पलटें
              </span>

              <button
                onClick={handleNextBookPage}
                disabled={activePageIndex >= notes.length - 1}
                className="bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl border border-amber-300 flex items-center gap-1.5 transition cursor-pointer active:scale-95 disabled:active:scale-100"
              >
                <span>अगला पेज (Flip Next) 👉</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : null}
        
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-5 flex items-center px-1 text-lg justify-between">
          <span className="flex items-center">
            <FileText size={20} className="mr-2 text-blue-600 dark:text-blue-400" /> Previous Entries ({notes.length})
          </span>
          {notes.length > 0 && (
            <button
              onClick={() => setIsBookViewMode(!isBookViewMode)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <BookOpen size={14} />
              <span>{isBookViewMode ? 'सभी नोट्स सूची देखें' : '📖 बुक व्यू मोड (Flip Book)'}</span>
            </button>
          )}
        </h3>
        
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-slate-500 py-10 bg-white dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
              <Book size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-3 opacity-50" />
              <p>No notes yet. Start writing above!</p>
            </div>
          ) : (
            notes.map((note, index) => (
              <div key={note.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200/80 dark:border-slate-800 transition-all hover:shadow-lg relative overflow-hidden flex flex-row">
                {/* Spiral Ring side panel to make it look like a high-end luxury notepad */}
                <div className="w-8 bg-slate-50/50 dark:bg-slate-800/50 border-r border-slate-200/60 dark:border-slate-800 flex flex-col justify-around items-center shrink-0 py-4 relative">
                  <div className="absolute top-4 left-6 w-5 h-2 bg-gradient-to-r from-gray-400 to-gray-200 border border-gray-400 rounded-full shadow-sm z-10" />
                  <div className="absolute top-16 left-6 w-5 h-2 bg-gradient-to-r from-gray-400 to-gray-200 border border-gray-400 rounded-full shadow-sm z-10" />
                  <div className="absolute top-28 left-6 w-5 h-2 bg-gradient-to-r from-gray-400 to-gray-200 border border-gray-400 rounded-full shadow-sm z-10" />
                  <div className="absolute top-40 left-6 w-5 h-2 bg-gradient-to-r from-gray-400 to-gray-200 border border-gray-400 rounded-full shadow-sm z-10" />
                  <div className="absolute bottom-16 left-6 w-5 h-2 bg-gradient-to-r from-gray-400 to-gray-200 border border-gray-400 rounded-full shadow-sm z-10" />
                  <div className="absolute bottom-4 left-6 w-5 h-2 bg-gradient-to-r from-gray-400 to-gray-200 border border-gray-400 rounded-full shadow-sm z-10" />
                </div>
                
                <div className="flex-1 p-5 pl-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-lg text-xs font-black border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                        <Hash size={12} /> S.No. #{notes.length - index}
                      </span>
                      <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center border border-slate-200 dark:border-slate-700">
                        <Calendar size={14} className="mr-1.5 text-slate-500 dark:text-slate-400" /> 
                        {formatDate(note.date)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => startInlineEdit(note)} 
                        className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1 transition cursor-pointer"
                        title="किसी भी लाइन में क्लिक करके एडिट करें"
                      >
                        <PenSquare size={13} />
                        <span>एडिट करें</span>
                      </button>
                      <button onClick={() => deleteNote(note.id)} className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {editingNoteId === note.id ? (
                    <div className="space-y-3 my-2">
                      {/* Line-by-line Lined Textarea */}
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full lined-paper-input focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{
                          fontFamily: (DARK_FONTS.find(f => f.id === note.fontId) || activeFont).fontFamily,
                          color: (DARK_FONTS.find(f => f.id === note.fontId) || activeFont).textColor
                        }}
                      />

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={cancelInlineEdit}
                          className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          रद्द करें
                        </button>
                        <button
                          onClick={() => saveInlineEdit(note.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-black shadow-xs transition cursor-pointer flex items-center gap-1"
                        >
                          <Save size={14} />
                          <span>बदलाव सहेजें (Save Changes)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => startInlineEdit(note)}
                      className="lined-paper-note whitespace-pre-wrap mb-4 cursor-pointer hover:ring-2 hover:ring-amber-400/50 rounded-xl p-2 transition group relative"
                      title="किसी भी लाइन पर क्लिक करके बदलें / टाइप करें"
                      style={{
                        fontFamily: (DARK_FONTS.find(f => f.id === note.fontId) || activeFont).fontFamily,
                        color: (DARK_FONTS.find(f => f.id === note.fontId) || activeFont).textColor
                      }}
                    >
                      {note.content}
                      <span className="absolute bottom-1 right-2 text-[10px] text-amber-700 dark:text-amber-400 opacity-0 group-hover:opacity-100 font-bold bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md transition border border-amber-300">
                        ✏️ किसी भी लाइन पर क्लिक करके बदलें
                      </span>
                    </div>
                  )}
                  
                  {calculateTotal(note.content) > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider flex items-center text-slate-500 dark:text-slate-400">
                        <Tag size={14} className="mr-1 text-slate-400 dark:text-slate-500" /> Total
                      </span>
                      <span className="text-lg font-extrabold text-blue-700 dark:text-blue-400">
                        ₹{calculateTotal(note.content).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
