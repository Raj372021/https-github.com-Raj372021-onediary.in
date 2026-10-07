import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MessageCircle, Calculator, X, Send, Bot, GripHorizontal, 
  Minimize2, RotateCcw, Delete, Mic, MicOff, Volume2, VolumeX, Square, Sparkles, Layers, Calendar
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import FestivalCalendarModal from './FestivalCalendarModal';

// Helper to strip markdown and clean text for speech reading
function cleanTextForSpeech(text: string): string {
  if (!text) return "";
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[-*]\s+/g, '')
    .replace(/\|/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/₹\s?([\d,]+)/g, '$1 रुपये')
    .replace(/₹/g, ' रुपये ')
    .trim();
}

export default function DraggableWidgets() {
  const { workers, getTodayStats, getCashStats, activeCashBookId } = useAppContext();
  
  // Dock / Docked state: 'NONE' | 'CHAT' | 'CALC' | 'MENU'
  const [activeWidget, setActiveWidget] = useState<'NONE' | 'CHAT' | 'CALC' | 'MENU'>('NONE');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Calculator State
  const [calcInput, setCalcInput] = useState('');
  
  // Chatbot State
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'नमस्ते! मैं आपका वॉइस-सक्षम एआई असिस्टेंट हूँ। 🎙️ बोलकर या टाइप करके सवाल पूछें!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioFallbackRef = useRef<HTMLAudioElement | null>(null);
  const wasVoiceInputRef = useRef<boolean>(false);

  useEffect(() => {
    if (activeWidget === 'CHAT') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeWidget, isTyping]);

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    if (audioFallbackRef.current) {
      try {
        audioFallbackRef.current.pause();
        audioFallbackRef.current = null;
      } catch (e) {}
    }
    setIsSpeaking(false);
  };

  // Clean up speech on unmount or widget hide
  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
    };
  }, []);

  // Voice Input (Speech Recognition - listening)
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("आपके ब्राउज़र में वॉइस रिकॉग्निशन सपोर्ट नहीं है। कृपया गूगल क्रोम का उपयोग करें।");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Default Hindi / Indian accent
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        wasVoiceInputRef.current = true;
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setChatInput(transcript);
        wasVoiceInputRef.current = true;
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Voice Output (Speech Synthesis - speaking)
  const speakText = (text: string) => {
    if (isSpeaking) {
      stopSpeech();
      return;
    }

    stopSpeech();

    const cleanStr = cleanTextForSpeech(text);
    if (!cleanStr) return;

    const playAudioFallback = () => {
      try {
        if (audioFallbackRef.current) {
          try { audioFallbackRef.current.pause(); } catch (e) {}
        }
        const encodedText = encodeURIComponent(cleanStr.slice(0, 250));
        const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=hi&client=tw-ob`;
        const audio = new Audio(audioUrl);
        audioFallbackRef.current = audio;
        setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
        audio.play().catch(() => setIsSpeaking(false));
      } catch (e) {
        setIsSpeaking(false);
      }
    };

    if (!('speechSynthesis' in window)) {
      playAudioFallback();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanStr);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const hindiVoices = voices.filter(v => v.lang.toLowerCase().includes('hi'));

      let matchVoice = hindiVoices.find(v => {
        const n = v.name.toLowerCase();
        return n.includes('natural') || n.includes('google') || n.includes('online') || n.includes('neural') || n.includes('swara') || n.includes('hemant') || n.includes('madhur');
      });
      if (!matchVoice && hindiVoices.length > 0) {
        matchVoice = hindiVoices[0];
      }

      if (matchVoice) {
        utterance.voice = matchVoice;
      } else {
        playAudioFallback();
        return;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => playAudioFallback();

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      playAudioFallback();
    }
  };

  // Live total helper for widget
  const getWidgetLiveTotal = (expr: string): string => {
    if (!expr || !expr.trim()) return '';
    let cleanExpr = expr.trim();
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

  const widgetLiveTotal = getWidgetLiveTotal(calcInput);

  const handleCalcClick = (val: string) => {
    if (val === 'C') {
      setCalcInput('');
    } else if (val === 'DEL') {
      setCalcInput(prev => prev.slice(0, -1));
    } else if (val === '=') {
      if (!calcInput.trim()) return;
      if (widgetLiveTotal) {
        setCalcInput(widgetLiveTotal);
      }
    } else if (val === '+5%') {
      const base = parseFloat(widgetLiveTotal || calcInput || '0');
      if (!isNaN(base) && base > 0) {
        const res = Math.round(base * 1.05 * 100) / 100;
        setCalcInput(String(res));
      }
    } else if (val === '+18%') {
      const base = parseFloat(widgetLiveTotal || calcInput || '0');
      if (!isNaN(base) && base > 0) {
        const res = Math.round(base * 1.18 * 100) / 100;
        setCalcInput(String(res));
      }
    } else if (val === 'OT1.5') {
      const base = parseFloat(widgetLiveTotal || calcInput || '0');
      if (!isNaN(base) && base > 0) {
        const res = Math.round(base * 1.5 * 100) / 100;
        setCalcInput(String(res));
      }
    } else {
      if (['+', '-', '*', '/'].includes(val) && ['+', '-', '*', '/'].includes(calcInput.slice(-1))) {
        setCalcInput(prev => prev.slice(0, -1) + val);
      } else {
        setCalcInput(prev => prev + val);
      }
    }
  };

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
      setIsListening(false);
    }

    // Capture whether input came from microphone voice recognition
    const sentViaVoice = wasVoiceInputRef.current;
    wasVoiceInputRef.current = false;

    // Stop existing speech when sending new message
    stopSpeech();

    const userMessage = chatInput.trim();
    const newMessages = [...messages, { role: 'user' as const, text: userMessage }];
    setMessages(newMessages);
    setChatInput('');
    setIsTyping(true);

    try {
      const appDataStr = JSON.stringify({
        totalWorkers: workers.length,
        todayStats: getTodayStats(),
        cashStats: getCashStats(activeCashBookId)
      });

      let data: any = null;
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            history: messages.slice(1),
            appData: appDataStr
          })
        });

        if (response.ok) {
          data = await response.json();
        }
      } catch (netErr) {
        console.warn("API route error, falling back to local AI assistant:", netErr);
      }

      let replyText = data?.reply;
      if (!replyText) {
        const q = userMessage.toLowerCase();
        if (q.includes('worker') || q.includes('मजदूर') || q.includes('हाजिरी')) {
          replyText = `👷 **मजदूर स्टेटस:** कुल ${workers.length} मजदूर हैं। आज उपस्थित: ${getTodayStats()?.present || 0}।`;
        } else if (q.includes('cash') || q.includes('कैश') || q.includes('हिसाब')) {
          replyText = `💰 **कैश बुक बैलेंस:** ₹${getCashStats(activeCashBookId)?.netBalance || 0}`;
        } else {
          replyText = `🤖 **AI Assistant:** नमस्ते! मैं आपका सहायता चैटबॉट हूँ। आप मुझसे लेबर, कैशबुक या किसी भी व्यवसायिक विषय पर पूछ सकते हैं।`;
        }
      }

      const nextMessages = [...newMessages, { role: 'model' as const, text: replyText }];
      setMessages(nextMessages);

      // Speak ONLY if autoSpeak is explicitly enabled OR if user asked via voice microphone
      if ((autoSpeak || sentViaVoice) && replyText) {
        setTimeout(() => speakText(replyText), 300);
      }
    } catch (error) {
      const fallbackMsg = '🤖 नमस्ते! मैं आपका AI चैटबॉट सहायक हूँ। आप मुझसे अपने व्यवसाय या लेबर रिकॉर्ड्स के बारे में कोई भी सवाल पूछ सकते हैं।';
      setMessages(prev => [...prev, { role: 'model', text: fallbackMsg }]);
      if (autoSpeak || sentViaVoice) speakText(fallbackMsg);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* 🚀 SINGLE TINY COMPACT FLOATING CONTROL BUTTON (Keeps screen 100% clear) */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.05}
        style={{ position: 'fixed', right: '14px', bottom: '90px', zIndex: 9999, touchAction: 'none' }}
      >
        {activeWidget === 'NONE' && (
          <button
            onClick={() => setActiveWidget('MENU')}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 text-slate-950 shadow-xl shadow-orange-950/40 border-2 border-amber-300 flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 transition-all relative group"
            title="AI स्मार्ट टूल्स खोलें (Draggable Tool)"
          >
            <Sparkles size={18} className="text-slate-950 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-300 border border-slate-900"></span>
            </span>
          </button>
        )}

        {/* TINY POPUP SELECTION MENU */}
        {activeWidget === 'MENU' && (
          <div className="bg-slate-950 text-white p-2 rounded-2xl shadow-2xl border border-blue-500/40 w-52 space-y-1.5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800 text-[10px] font-extrabold text-blue-300">
              <span>⚡ स्मार्ट टूल्स</span>
              <button onClick={() => setActiveWidget('NONE')} className="p-0.5 text-slate-400 hover:text-white cursor-pointer">
                <X size={14} />
              </button>
            </div>

            <button
              onClick={() => {
                setActiveWidget('NONE');
                setIsCalendarOpen(true);
              }}
              className="w-full p-2 rounded-xl bg-gradient-to-r from-red-700 via-amber-600 to-red-800 hover:from-red-600 hover:to-amber-500 text-white font-black text-xs flex items-center justify-between shadow transition cursor-pointer border border-amber-400/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">🚩</span>
                <span>श्री हनुमान प्रसाद कैलेंडर</span>
              </div>
              <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-md">2026</span>
            </button>

            <button
              onClick={() => setActiveWidget('CHAT')}
              className="w-full p-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs flex items-center justify-between shadow transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Bot size={16} />
                <span>AI चैटबॉट (बोलने वाला)</span>
              </div>
              <Mic size={13} className="text-amber-200" />
            </button>

            <button
              onClick={() => setActiveWidget('CALC')}
              className="w-full p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-between shadow transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Calculator size={16} />
                <span>स्मार्ट कैलकुलेटर</span>
              </div>
              <span className="text-[10px] font-black text-blue-200">₹</span>
            </button>
          </div>
        )}

        {/* 🤖 SUPER COMPACT CHATBOT WIDGET WITH VOICE SPEAK & LISTEN */}
        {activeWidget === 'CHAT' && (
          <div className="bg-slate-950 text-white rounded-2xl shadow-2xl border border-orange-500/50 overflow-hidden w-[270px] sm:w-[290px] max-w-[88vw] flex flex-col shadow-orange-950/50 animate-in zoom-in duration-150" style={{ height: '340px' }}>
            {/* Draggable Header */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white px-3 py-2 flex justify-between items-center cursor-grab active:cursor-grabbing select-none shrink-0 touch-none">
              <div className="flex items-center gap-1.5">
                <GripHorizontal size={14} className="text-white/80" />
                <span className="font-extrabold text-xs flex items-center gap-1">
                  <Bot size={15} /> Voice AI
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Stop speech button if currently speaking */}
                {isSpeaking && (
                  <button
                    type="button"
                    onClick={stopSpeech}
                    className="p-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition text-[10px] font-extrabold flex items-center gap-0.5 cursor-pointer animate-pulse"
                    title="आवाज़ रोकें (Stop Voice)"
                  >
                    <Square size={10} className="fill-current" />
                    <span>रोकें</span>
                  </button>
                )}

                {/* Auto Speak Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !autoSpeak;
                    setAutoSpeak(next);
                    if (!next) stopSpeech();
                  }}
                  className={`p-1 rounded-lg transition text-[10px] font-bold flex items-center gap-0.5 cursor-pointer ${
                    autoSpeak ? 'bg-amber-400 text-slate-950' : 'bg-black/30 text-white/70'
                  }`}
                  title={autoSpeak ? "ऑटो आवाज़ ON" : "ऑटो आवाज़ OFF (केवल माइक से बोलने पर आवाज़ आएगी)"}
                >
                  {autoSpeak ? <Volume2 size={12} /> : <VolumeX size={12} />}
                </button>

                <button 
                  onClick={() => {
                    stopSpeech();
                    setActiveWidget('NONE');
                  }} 
                  className="p-1 hover:bg-black/20 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
                  title="Minimize (Screen Clear)"
                >
                  <Minimize2 size={15} />
                </button>

                <button 
                  onClick={() => {
                    stopSpeech();
                    setActiveWidget('NONE');
                  }} 
                  className="p-1 hover:bg-black/20 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
                  title="Close"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
            
            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2 bg-slate-950 text-xs font-sans touch-auto scrollbar-thin">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-2xl px-3 py-1.5 leading-relaxed text-[11px] ${
                    msg.role === 'user' 
                      ? 'bg-orange-600 text-white rounded-br-xs font-medium' 
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs shadow-md'
                  }`}>
                    {msg.role === 'model' && (
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1 text-[9px] font-extrabold text-orange-400">
                        <span>🤖 Voice Assistant</span>
                        <button
                          onClick={() => speakText(msg.text)}
                          className="hover:text-white cursor-pointer"
                          title="बोलकर सुनें"
                        >
                          <Volume2 size={11} />
                        </button>
                      </div>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-xs px-3 py-1.5 shadow-md flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form with Microphone (Listen) & Send */}
            <div className="p-2 bg-slate-900 border-t border-slate-800 shrink-0 touch-auto">
              <form onSubmit={handleSendChat} className="flex items-center gap-1.5">
                {/* Microphone Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-xl text-white font-extrabold transition cursor-pointer shrink-0 ${
                    isListening
                      ? 'bg-rose-600 animate-pulse text-white ring-2 ring-rose-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
                  }`}
                  title={isListening ? "सुन रहा है... (Stop Listening)" : "बोलकर टाइप करें (Mic)"}
                >
                  {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>

                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isListening ? "सुन रहा हूँ... बोलिए!" : "बोलें या टाइप करें..."}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-medium"
                />

                <button 
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-xl disabled:opacity-50 transition cursor-pointer shrink-0"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 🧮 COLORFUL & ENLARGED SMART CALCULATOR WIDGET */}
        {activeWidget === 'CALC' && (
          <div className="bg-slate-950 text-white rounded-3xl shadow-2xl border-2 border-indigo-500/80 overflow-hidden w-[310px] sm:w-[335px] max-w-[92vw] flex flex-col select-none touch-none shadow-[0_0_40px_rgba(99,102,241,0.4)] animate-in zoom-in duration-150">
            {/* Draggable Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-3.5 py-2.5 flex justify-between items-center cursor-grab active:cursor-grabbing shrink-0">
              <div className="flex items-center gap-2">
                <GripHorizontal size={16} className="text-white/80" />
                <span className="font-black text-xs sm:text-sm flex items-center gap-1.5 uppercase tracking-wide">
                  <Calculator size={18} className="text-cyan-300 animate-pulse" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-cyan-200">
                    Smart Calculator
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setActiveWidget('NONE')} 
                  className="p-1 hover:bg-black/20 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
                  title="Minimize (Screen Clear)"
                >
                  <Minimize2 size={16} />
                </button>
                <button 
                  onClick={() => setActiveWidget('NONE')} 
                  className="p-1 hover:bg-black/20 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Calculator Body */}
            <div className="p-3 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 touch-auto space-y-2.5">
              {/* Display Box */}
              <div className="bg-slate-950 border-2 border-indigo-500/60 rounded-2xl p-3 text-right font-mono overflow-x-auto min-h-[82px] flex flex-col justify-between text-white shadow-inner relative">
                <div className="text-indigo-300 text-sm tracking-widest truncate font-extrabold">{calcInput || '0'}</div>
                <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 truncate mt-1 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]">
                  {widgetLiveTotal ? `= ₹${widgetLiveTotal}` : (calcInput ? `= ₹${calcInput}` : '= ₹0')}
                </div>
              </div>

              {/* Quick GST & Overtime Shortcuts Row */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleCalcClick('+5%')}
                  className="py-1.5 px-2 rounded-xl text-[11px] font-black bg-gradient-to-r from-teal-500/30 to-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:from-teal-500/50 hover:to-emerald-500/50 transition cursor-pointer active:scale-95 shadow"
                >
                  +5% GST
                </button>
                <button
                  onClick={() => handleCalcClick('+18%')}
                  className="py-1.5 px-2 rounded-xl text-[11px] font-black bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-purple-300 border border-purple-500/40 hover:from-purple-500/50 hover:to-indigo-500/50 transition cursor-pointer active:scale-95 shadow"
                >
                  +18% GST
                </button>
                <button
                  onClick={() => handleCalcClick('OT1.5')}
                  className="py-1.5 px-2 rounded-xl text-[11px] font-black bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-300 border border-amber-500/40 hover:from-amber-500/50 hover:to-orange-500/50 transition cursor-pointer active:scale-95 shadow"
                >
                  ×1.5 OT
                </button>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-4 gap-2">
                <button 
                  onClick={() => handleCalcClick('C')} 
                  className="p-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white border border-rose-400 hover:brightness-110 active:scale-95 transition cursor-pointer shadow-md shadow-red-950/50"
                >
                  AC
                </button>
                <button 
                  onClick={() => handleCalcClick('/')} 
                  className="p-2.5 rounded-xl font-black text-base bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-400/50 hover:brightness-110 active:scale-95 transition cursor-pointer shadow-md"
                >
                  ÷
                </button>
                <button 
                  onClick={() => handleCalcClick('*')} 
                  className="p-2.5 rounded-xl font-black text-base bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-400/50 hover:brightness-110 active:scale-95 transition cursor-pointer shadow-md"
                >
                  ×
                </button>
                <button 
                  onClick={() => handleCalcClick('DEL')} 
                  className="p-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white border border-amber-400/50 hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center justify-center shadow-md"
                >
                  <Delete size={18} />
                </button>

                <button onClick={() => handleCalcClick('7')} className="p-2.5 rounded-xl font-black text-lg bg-slate-900 hover:bg-slate-800 text-cyan-200 border border-slate-700/80 active:scale-95 transition cursor-pointer shadow-sm">7</button>
                <button onClick={() => handleCalcClick('8')} className="p-2.5 rounded-xl font-black text-lg bg-slate-900 hover:bg-slate-800 text-cyan-200 border border-slate-700/80 active:scale-95 transition cursor-pointer shadow-sm">8</button>
                <button onClick={() => handleCalcClick('9')} className="p-2.5 rounded-xl font-black text-lg bg-slate-900 hover:bg-slate-800 text-cyan-200 border border-slate-700/80 active:scale-95 transition cursor-pointer shadow-sm">9</button>
                <button 
                  onClick={() => handleCalcClick('-')} 
                  className="p-2.5 rounded-xl font-black text-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white border border-indigo-400/50 hover:brightness-110 active:scale-95 transition cursor-pointer shadow-md"
                >
                  -
                </button>

                <button onClick={() => handleCalcClick('4')} className="p-2.5 rounded-xl font-black text-lg bg-slate-900 hover:bg-slate-800 text-cyan-200 border border-slate-700/80 active:scale-95 transition cursor-pointer shadow-sm">4</button>
                <button onClick={() => handleCalcClick('5')} className="p-2.5 rounded-xl font-black text-lg bg-slate-900 hover:bg-slate-800 text-cyan-200 border border-slate-700/80 active:scale-95 transition cursor-pointer shadow-sm">5</button>
                <button onClick={() => handleCalcClick('6')} className="p-2.5 rounded-xl font-black text-lg bg-slate-900 hover:bg-slate-800 text-cyan-200 border border-slate-700/80 active:scale-95 transition cursor-pointer shadow-sm">6</button>
                <button 
                  onClick={() => handleCalcClick('+')} 
                  className="p-2.5 rounded-xl font-black text-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white border border-indigo-400/50 hover:brightness-110 active:scale-95 transition cursor-pointer shadow-md"
                >
                  +
                </button>

                <button onClick={() => handleCalcClick('1')} className="p-2.5 rounded-xl font-black text-lg bg-slate-900 hover:bg-slate-800 text-cyan-200 border border-slate-700/80 active:scale-95 transition cursor-pointer shadow-sm">1</button>
                <button onClick={() => handleCalcClick('2')} className="p-2.5 rounded-xl font-black text-lg bg-slate-900 hover:bg-slate-800 text-cyan-200 border border-slate-700/80 active:scale-95 transition cursor-pointer shadow-sm">2</button>
                <button onClick={() => handleCalcClick('3')} className="p-2.5 rounded-xl font-black text-lg bg-slate-900 hover:bg-slate-800 text-cyan-200 border border-slate-700/80 active:scale-95 transition cursor-pointer shadow-sm">3</button>
                
                <button 
                  onClick={() => handleCalcClick('=')} 
                  className="p-2.5 rounded-xl font-black text-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 border-2 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] row-span-2 flex items-center justify-center hover:brightness-110 active:scale-95 transition cursor-pointer"
                >
                  =
                </button>

                <button onClick={() => handleCalcClick('0')} className="p-2.5 rounded-xl font-black text-lg bg-slate-900 hover:bg-slate-800 text-cyan-200 border border-slate-700/80 col-span-2 active:scale-95 transition cursor-pointer shadow-sm">0</button>
                <button onClick={() => handleCalcClick('.')} className="p-2.5 rounded-xl font-black text-xl bg-slate-900 hover:bg-slate-800 text-cyan-200 border border-slate-700/80 active:scale-95 transition cursor-pointer shadow-sm">.</button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <FestivalCalendarModal 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
      />
    </>
  );
}
