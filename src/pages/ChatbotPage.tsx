import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  Sparkles, 
  Check, 
  Copy, 
  Search, 
  ExternalLink,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Square
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

function getBcp47Lang(code: string): { bcp: string; short: string } {
  if (!code) return { bcp: 'hi-IN', short: 'hi' };
  const c = code.toLowerCase().trim();
  if (c === 'hi' || c === 'hi-in') return { bcp: 'hi-IN', short: 'hi' };
  if (c === 'en-in' || c === 'hinglish' || c === 'en') return { bcp: 'en-IN', short: 'en' };
  if (c === 'gu' || c === 'gu-in') return { bcp: 'gu-IN', short: 'gu' };
  if (c === 'ta' || c === 'ta-in') return { bcp: 'ta-IN', short: 'ta' };
  if (c === 'mr' || c === 'mr-in') return { bcp: 'mr-IN', short: 'mr' };
  if (c === 'bn' || c === 'bn-in') return { bcp: 'bn-IN', short: 'bn' };
  if (c === 'pa' || c === 'pa-in') return { bcp: 'pa-IN', short: 'pa' };
  if (c === 'te' || c === 'te-in') return { bcp: 'te-IN', short: 'te' };
  if (c === 'kn' || c === 'kn-in') return { bcp: 'kn-IN', short: 'kn' };
  if (c === 'ml' || c === 'ml-in') return { bcp: 'ml-IN', short: 'ml' };
  if (c === 'or' || c === 'or-in') return { bcp: 'or-IN', short: 'or' };
  if (c === 'es' || c === 'es-es') return { bcp: 'es-ES', short: 'es' };
  return { bcp: 'hi-IN', short: 'hi' };
}

// Clean markdown syntax & currency symbols out of string for clean natural Web Speech API reading
function cleanTextForSpeech(text: string, lang: string = 'hi'): string {
  if (!text) return "";
  let cleaned = text
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/`([^`]+)`/g, '$1')     // inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1')   // italic
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // links
    .replace(/#{1,6}\s+/g, '')       // headings
    .replace(/[-*]\s+/g, '')          // bullets
    .replace(/\|/g, ' ')             // tables
    .replace(/\n+/g, ' ')            // newlines
    .replace(/₹\s?([\d,]+)/g, lang.startsWith('en') ? '$1 rupees' : '$1 रुपये') // format currency for speech
    .replace(/₹/g, lang.startsWith('en') ? ' rupees ' : ' रुपये ')
    .trim();
  return cleaned;
}

// Helper for intelligent offline/static deployment fallback answers
function generateClientFallbackReply(msg: string, ctx: { workersCount: number; todayStats: any; cashStats: any; workers: any[] }): string {
  const query = (msg || "").toLowerCase().trim();

  // 1. Math calculation
  if (/^[\d\s\+\-\*\/\(\)\.\,]+$/.test(query) || query.includes('calculate') || query.includes('जोड़') || query.includes('गुणा') || query.includes('बराबर')) {
    try {
      const cleanExpr = query.replace(/[^\d\+\-\*\/\.\(\)]/g, '');
      if (cleanExpr) {
        // eslint-disable-next-line no-new-func
        const val = new Function('return ' + cleanExpr)();
        if (val !== undefined && !isNaN(val)) {
          return `🔢 **गणना का उत्तर (Calculation Result):**\n\n\`${cleanExpr}\` = **₹${Number(val).toLocaleString('hi-IN')}**\n\nआप onediary.in के स्मार्ट कैलकुलेटर से सीधी हाजिरी और मजदूरी की गिनती भी कर सकते हैं!`;
        }
      }
    } catch (e) {}
  }

  // 2. Workers / Attendance
  if (query.includes('worker') || query.includes('मजदूर') || query.includes('लेबर') || query.includes('हाजिरी') || query.includes('attendance') || query.includes('list')) {
    let response = `👷 **मजदूर एवं हाजिरी रिपोर्ट (Worker & Attendance Status):**\n\n`;
    response += `- **कुल मजदूर (Total Workers):** ${ctx.workersCount}\n`;
    if (ctx.todayStats) {
      response += `- **आज उपस्थित (Present Today):** ${ctx.todayStats.present || 0}\n`;
      response += `- **आधा दिन (Half Day):** ${ctx.todayStats.halfDay || 0}\n`;
      response += `- **अनुपस्थित (Absent):** ${ctx.todayStats.absent || 0}\n`;
      response += `- **आज का कुल वेतन (Today's Wage):** ₹${Number(ctx.todayStats.totalWageToday || 0).toLocaleString('hi-IN')}\n\n`;
    }

    if (ctx.workers && ctx.workers.length > 0) {
      response += `📋 **मजदूरों की सूची:**\n`;
      ctx.workers.slice(0, 10).forEach((w, idx) => {
        response += `${idx + 1}. **${w.name}** | daily: ₹${w.dailyWage || 0} | 📱 ${w.phone || 'N/A'}\n`;
      });
      if (ctx.workers.length > 10) response += `\n*(और ${ctx.workers.length - 10} मजदूर शामिल हैं)*\n`;
    }
    return response;
  }

  // 3. Cashbook & Balance
  if (query.includes('cash') || query.includes('कैश') || query.includes('हिसाब') || query.includes('balance') || query.includes('पैसा') || query.includes('advance')) {
    const cs = ctx.cashStats || {};
    let response = `💰 **कैश बुक और बैलेंस रिपोर्ट (Cash Book Report):**\n\n`;
    response += `- **कुल आवक (Total In / Recd):** ₹${Number(cs.totalIn || 0).toLocaleString('hi-IN')}\n`;
    response += `- **कुल जावक (Total Out / Expense):** ₹${Number(cs.totalOut || 0).toLocaleString('hi-IN')}\n`;
    response += `- **नेट बैलेंस (Net Balance):** **₹${Number(cs.netBalance || 0).toLocaleString('hi-IN')}**\n\n`;
    response += `💡 **सुझाव:** नियमित रूप से लेन-देन की प्रविष्टि दर्ज करें ताकि कोई अंतर न आए।`;
    return response;
  }

  // 4. Labor Laws & Rules
  if (query.includes('law') || query.includes('pf') || query.includes('esi') || query.includes('rule') || query.includes('नियम') || query.includes('कानून')) {
    return `📜 **साइट सुरक्षा एवं श्रम कानून (Labor Laws & Construction Guidelines):**

1. **न्यूनतम मजदूरी दरें (Minimum Wages):** कानूनन अकुशल, अर्ध-कुशल व कुशल श्रमिकों की न्यूनतम दरें निर्धारित हैं।
2. **ओवरटाइम (Overtime):** सामान्य 8 घंटे की पारी से अधिक काम करने पर दोगुना (2x) दर लागू होता है।
3. **सुरक्षा उपकरण (PPE Safety):** निर्माण स्थल पर हेलमेट, बूट्स और सुरक्षा बेल्ट अनिवार्य हैं।
4. **PF / ESI:** 20 से अधिक कर्मचारियों के लिए PF और ESI रजिस्ट्रेशन आवश्यक है।`;
  }

  // 5. App Knowledge Query (onediary.in features & capabilities)
  if (query.includes('app') || query.includes('एप') || query.includes('onediary') || query.includes('फीचर') || query.includes('विशेषता') || query.includes('जानकारी') || query.includes('क्या काम') || query.includes('about') || query.includes('डायल')) {
    return `📲 **onediary.in ऐप की संपूर्ण जानकारी (Complete App Overview):**

**onediary.in** सिविल व कंस्ट्रक्शन ठेकेदारों, रियल एस्टेट डेवलपर्स, बिल्डरों, दुकानदारों, कारीगरों और व्यवसायियों के लिए भारत का #1 डिजिटल डायरी ऐप है।

### 🌟 मुख्य फीचर्स एवं क्षमताएं:
1. 👷 **मजदूर हाजिरी व वेतन रजिस्टर:** Present, Absent, Half Day व OT 1-क्लिक में दर्ज करें। WhatsApp पे-स्लिप शेयर करें।
2. 💰 **डिजिटल कैश बुक:** आवक, जावक व शुद्ध बकाया (Net Balance) का सही हिसाब। PDF एक्सपोर्ट सुविधा।
3. 🧾 **कोटेशन व जीएसटी बिल मेकर:** HSN कोड, कंपनी लोगो व 5%, 12%, 18%, 28% GST के साथ तुरंत बिल बनाएं।
4. 🧮 **स्मार्ट वेज व जीएसटी कैलकुलेटर:** मजदूरी कैलकुलेटर, GST ब्रेकअप व अंकों को शब्दों में बदलना (In Words)।
5. 🚩 **श्री हनुमान प्रसाद पंचांग 2026:** वर्ष 2026 के सभी व्रत, त्यौहार, विवाह मुहूर्त, गृह प्रवेश मुहूर्त व छुट्टियां।
6. 🔮 **वैदिक कुण्डली एवं 36 गुण मिलान:** 10-वर्षीय कुण्डली, मंगली दोष, विंशोत्तरी दशा व 36 गुण मिलान सर्टिफिकेट।
7. 📖 **डिजिटल डायरी व नोट्स:** साइट की दैनिक गतिविधियां, मटेरियल स्टॉक सूची व वॉइस टाइपिंग नोट्स।
8. ⚡ **1-क्लिक ऐप डाउनलोड व ऑफ-लाइन वर्किंग:** Android व iPhone पर 1-क्लिक में डाउनलोड, बिना इंटरनेट 100% कार्यशील।`;
  }

  // 6. Construction Formulas
  if (query.includes('steel') || query.includes('सरिया') || query.includes('cement') || query.includes('सीमेंट') || query.includes('brick') || query.includes('ईंट') || query.includes('mortar') || query.includes('मसाला')) {
    return `🏗️ **साइट सिविल इंजीनियरिंग फार्मूला व गणना:**

1. **सरिया का वजन (Steel Weight Formula):**
   - \`Weight (kg/m) = d² / 162\` (जहाँ d = व्यास mm में)
   - उदाहरण: 12mm सरिया = (12 × 12) / 162 = **0.888 kg प्रति मीटर**
2. **ईंट की चिनाई (Brickwork Estimate):**
   - 1 घन मीटर (1 m³) में लगभग **500 ईंटें** लगती हैं।
3. **प्लास्टर का मसाला अनुपात (Mortar Ratio):**
   - अंदरूनी प्लास्टर: 1:4 या 1:5 (1 बोरी सीमेंट + 4/5 तगाड़ी बालू)
   - बाहरी प्लास्टर: 1:3 या 1:4 waterproof कंपाउंड के साथ।`;
  }

  // 7. General Knowledge / GK Queries
  if (query.includes('gk') || query.includes('ज्ञान') || query.includes('भारत') || query.includes('प्रधान') || query.includes('capital') || query.includes('science') || query.includes('विज्ञान')) {
    return `🧠 **सामान्य ज्ञान जानकारी (General Knowledge):**

- **भारत की राजधानी:** नई दिल्ली (New Delhi)
- **भारत की मुद्रा:** भारतीय रुपया (₹ - INR)
- **राष्ट्रीय खेल:** हॉकी (Hockey)
- **भारत का राष्ट्रीय पक्षी:** मोर (Peacock)
- **राष्ट्रीय पशु:** बंगाल टाइगर (Bengal Tiger)

आप मुझसे किसी भी विषय, विज्ञान, इतिहास या करंट अफेयर्स के बारे में विस्तार से पूछ सकते हैं!`;
  }

  // 8. Default General Smart Answer
  return `🤖 **onediary.in AI सुपर बिजनेस असिस्टेंट:**

नमस्ते! मैं आपका ऑल-इन-वन एआई असिस्टेंट हूँ। आप मुझसे अपने व्यवसाय, साइट प्रबंधन, सामान्य ज्ञान, कोडिंग, ड्राफ्टिंग या **onediary.in** ऐप के किसी भी फीचर के बारे में पूछ सकते हैं।

### 💡 आप क्या-क्या पूछ सकते हैं:
- **ऐप फीचर्स:** "onediary.in में क्या-क्या सुविधाएं हैं?"
- **हाजिरी हिसाब:** "आज कुल कितने मजदूर आए हैं?"
- **कैश बुक:** "मेरा कैश बुक बैलेंस क्या है?"
- **जीएसटी गणना:** "₹25,000 पर 18% GST कितना होगा?"
- **ड्राफ्ट मैसेज:** "मालिक को पेमेन्ट तकादा मैसेज लिखकर दें।"
- **सामान्य ज्ञान:** "भारत की राजधानी क्या है?" या कोई भी विज्ञान सवाल।`;
}

// Beautiful interactive CodeBlock component with Copy action
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3.5 bg-slate-900 rounded-xl overflow-hidden border border-slate-700/80 font-mono text-xs shadow-md">
      <div className="bg-slate-800/80 px-4 py-2 flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase tracking-widest border-b border-slate-700/60">
        <span>{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="hover:text-white px-2.5 py-1 rounded bg-slate-700/50 hover:bg-slate-700 transition cursor-pointer flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-slate-200 whitespace-pre scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Inline Markdown Parser: parses **, *, `, and [label](url)
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentText = text;
  let keyIdx = 0;

  while (currentText.length > 0) {
    const boldMatch = currentText.match(/\*\*([^*]+)\*\*/);
    const italicMatch = currentText.match(/\*([^*]+)\*/);
    const codeMatch = currentText.match(/`([^`]+)`/);
    const linkMatch = currentText.match(/\[([^\]]+)\]\(([^)]+)\)/);

    const matches = [
      { type: 'bold', index: boldMatch ? currentText.indexOf(boldMatch[0]) : -1, text: boldMatch?.[1], fullText: boldMatch?.[0] },
      { type: 'italic', index: italicMatch ? currentText.indexOf(italicMatch[0]) : -1, text: italicMatch?.[1], fullText: italicMatch?.[0] },
      { type: 'code', index: codeMatch ? currentText.indexOf(codeMatch[0]) : -1, text: codeMatch?.[1], fullText: codeMatch?.[0] },
      { type: 'link', index: linkMatch ? currentText.indexOf(linkMatch[0]) : -1, text: linkMatch?.[1], url: linkMatch?.[2], fullText: linkMatch?.[0] }
    ].filter(m => m.index !== -1).sort((a, b) => a.index - b.index);

    if (matches.length === 0) {
      parts.push(currentText);
      break;
    }

    const firstMatch = matches[0];
    
    if (firstMatch.index > 0) {
      parts.push(currentText.substring(0, firstMatch.index));
    }

    keyIdx++;
    if (firstMatch.type === 'bold') {
      parts.push(<strong key={keyIdx} className="font-extrabold text-white">{firstMatch.text}</strong>);
    } else if (firstMatch.type === 'italic') {
      parts.push(<em key={keyIdx} className="italic text-slate-200">{firstMatch.text}</em>);
    } else if (firstMatch.type === 'code') {
      parts.push(<code key={keyIdx} className="bg-slate-900 border border-slate-700/60 px-1.5 py-0.5 rounded text-xs text-orange-300 font-mono font-semibold">{firstMatch.text}</code>);
    } else if (firstMatch.type === 'link') {
      parts.push(
        <a 
          key={keyIdx} 
          href={firstMatch.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-orange-400 hover:text-orange-300 underline font-bold"
        >
          {firstMatch.text}
        </a>
      );
    }

    currentText = currentText.substring(firstMatch.index + (firstMatch.fullText?.length || 0));
  }

  return parts;
}

// Blocks Markdown Parser: Heading, Bullet List, Code Block, Table, Paragraph
function parseMarkdown(text: string): React.ReactNode[] {
  const blocks = text.split(/\n\n+/);
  return blocks.map((block, bIdx) => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return null;

    // 1. Code Block
    if (trimmedBlock.startsWith('```')) {
      const lines = trimmedBlock.split('\n');
      const firstLine = lines[0];
      const language = firstLine.replace('```', '').trim() || 'code';
      const code = lines.slice(1, lines.length - (lines[lines.length - 1] === '```' ? 1 : 0)).join('\n');
      return (
        <div key={bIdx}>
          <CodeBlock code={code} language={language} />
        </div>
      );
    }

    // 2. Headings
    const headingMatch = trimmedBlock.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      const inlineParsed = parseInlineMarkdown(content);
      if (level === 1) return <h1 key={bIdx} className="text-xl font-black text-white mt-4 mb-2">{inlineParsed}</h1>;
      if (level === 2) return <h2 key={bIdx} className="text-lg font-extrabold text-white mt-3 mb-1.5">{inlineParsed}</h2>;
      return <h3 key={bIdx} className="text-base font-bold text-slate-100 mt-2.5 mb-1">{inlineParsed}</h3>;
    }

    // 3. Bullet & Numbered lists
    if (trimmedBlock.startsWith('- ') || trimmedBlock.startsWith('* ') || trimmedBlock.match(/^\d+\.\s+/)) {
      const lines = trimmedBlock.split('\n');
      const isNumbered = trimmedBlock.match(/^\d+\.\s+/);
      const listItems = lines.map((line, lIdx) => {
        const itemText = line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
        return <li key={lIdx} className="mb-1.5">{parseInlineMarkdown(itemText)}</li>;
      });
      if (isNumbered) {
        return <ol key={bIdx} className="list-decimal pl-5 space-y-1 my-2.5 text-slate-200 font-medium">{listItems}</ol>;
      } else {
        return <ul key={bIdx} className="list-disc pl-5 space-y-1 my-2.5 text-slate-200 font-medium">{listItems}</ul>;
      }
    }

    // 4. Tables
    if (trimmedBlock.startsWith('|') && trimmedBlock.includes('\n|')) {
      const lines = trimmedBlock.split('\n');
      const rows = lines.map(line => line.split('|').map(cell => cell.trim()).filter((cell, i, arr) => i > 0 && i < arr.length - 1));
      if (rows.length >= 2 && rows[1].every(cell => cell.startsWith('-') || cell.includes('---'))) {
        const headers = rows[0];
        const dataRows = rows.slice(2);
        return (
          <div key={bIdx} className="overflow-x-auto my-3 border border-slate-700 rounded-xl">
            <table className="min-w-full divide-y divide-slate-700 bg-slate-900 text-xs">
              <thead className="bg-slate-800 text-slate-300 font-bold">
                <tr>
                  {headers.map((h, i) => <th key={i} className="px-3 py-2 text-left">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/30">
                    {row.map((cell, cIdx) => <td key={cIdx} className="px-3 py-2">{parseInlineMarkdown(cell)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // 5. Normal Paragraph
    const lines = trimmedBlock.split('\n');
    return (
      <p key={bIdx} className="mb-3 last:mb-0 leading-relaxed text-slate-200 font-medium text-sm">
        {lines.map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {lIdx > 0 && <br />}
            {parseInlineMarkdown(line)}
          </React.Fragment>
        ))}
      </p>
    );
  });
}

interface Message {
  role: 'user' | 'model';
  text: string;
  searchQueries?: string[];
  sources?: { title: string; uri: string }[];
}

export default function ChatbotPage() {
  const navigate = useNavigate();
  const { workers, getTodayStats, getCashStats, activeCashBookId } = useAppContext();
  const { language } = useLanguage();

  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [currentlySpeakingIdx, setCurrentlySpeakingIdx] = useState<number | null>(null);
  const [speechLang, setSpeechLang] = useState<string>(() => {
    return getBcp47Lang(language).bcp;
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioFallbackRef = useRef<HTMLAudioElement | null>(null);
  const wasVoiceInputRef = useRef<boolean>(false);

  // Sync available speech synthesis voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const vList = window.speechSynthesis.getVoices();
        setAvailableVoices(vList);
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Sync speech language when global language changes
  useEffect(() => {
    const { bcp } = getBcp47Lang(language);
    setSpeechLang(bcp);
  }, [language]);

  const translationsLocal: Record<string, Record<string, string>> = {
    en: {
      title: "Super AI Genius Chatbot",
      subtitle: "Ask anything, write letters/code & search live web information",
      greeting: "Hello! I am your **Super AI Genius Assistant**. I can answer ANY question, write professional emails, letters, WhatsApp messages, poems, write software code, solve complex math, analyze your worker & cashbook data, or search Google for real-time information!\n\nTap the microphone 🎙️ or type your request below.",
      placeholder: "Ask any question or tell me to write something... (e.g. 'Write a payment reminder letter')",
      errorMsg: "Error connecting to Super AI. Please try again.",
      clearChat: "Clear Chat"
    },
    hi: {
      title: "Super AI Genius (सुपर चैटबॉट)",
      subtitle: "कुछ भी पूछें या पत्र, मैसेज व कोड तुरंत लिखवाएं",
      greeting: "नमस्ते! मैं आपका ऑल-इन-वन **Super AI Genius Chatbot** हूँ। आप मुझसे:\n\n1. ✍️ **कुछ भी लिखवा सकते हैं:** पेमेंट तकादा मैसेज, फॉर्मल ईमेल, पत्र, शायरी या आर्टिकल।\n2. ❓ **कोई भी सवाल पूछ सकते हैं:** सामान्य ज्ञान, विज्ञान, बिजनेस सलाह, कानूनी नियम या रेसिपी।\n3. 🧮 **गणित व कोडिंग:** GST कैलकुलेशन, मजदूरी गणित, या कंप्यूटर कोड।\n4. 👷 **साइट डेटा:** आपके रजिस्टर्ड मजदूरों की हाजिरी व कैश बुक हिसाब।\n5. 🔍 **गूगल लाइव सर्च:** देश-दुनिया की ताज़ा खबरें व ताज़ा भाव।\n\nनीचे बोलकर या टाइप करके कुछ भी पूछें या निर्देश दें!",
      placeholder: "कोई भी सवाल पूछें या लिखवाएं... (जैसे: 'पेमेंट का मैसेज लिखें' या '500 * 18% GST')",
      errorMsg: "कनेक्शन एरर। कृपया दोबारा प्रयास करें।",
      clearChat: "चैट साफ़ करें"
    },
    gu: {
      title: "Super AI Genius (સુપર ચેટબોટ)",
      subtitle: "કોઈપણ પ્રશ્ન પૂછો અથવા પત્ર અને કોડ લખાવો",
      greeting: "નમસ્તે! હું તમારો Super AI Genius Assistant છું. કોઈપણ પ્રશ્ન પૂછો અથવા પત્ર અને મેસેજ લખાવો!",
      placeholder: "બોલીને અથવા ટાઇપ કરીને પૂછો...",
      errorMsg: "કનેક્શન નિષ્ફળ. ફરી પ્રયાસ કરો.",
      clearChat: "ચેટ સાફ કરો"
    },
    ta: {
      title: "Super AI Genius Chatbot",
      subtitle: "எதையும் கேட்கலாம் அல்லது கடிதம்/கோட் எழுதலாம்",
      greeting: "வணக்கம்! நான் உங்கள் Super AI Genius. எதையும் கேட்கலாம் அல்லது கடிதம் எழுத சொல்லலாம்!",
      placeholder: "கேள்வி கேட்கவும் அல்லது எழுத சொல்லவும்...",
      errorMsg: "இணைப்பு பிழை. மீண்டும் முயற்சிக்கவும்.",
      clearChat: "அரட்டையை அழிக்கவும்"
    },
    es: {
      title: "Super AI Genius Chatbot",
      subtitle: "Pregunta cualquier cosa o pide redactar cartas y código",
      greeting: "¡Hola! Soy tu Super AI Genius. Pregúntame lo que quieras o pídeme redactar mensajes y código.",
      placeholder: "Escribe tu pregunta o instrucción...",
      errorMsg: "Error de conexión. Inténtalo de nuevo.",
      clearChat: "Limpiar chat"
    }
  };

  const currentT = translationsLocal[language] || translationsLocal['hi'];

  useEffect(() => {
    // Set initial greeting
    setMessages([
      { role: 'model', text: currentT.greeting }
    ]);
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Stop speech synthesis & audio fallback
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
    setCurrentlySpeakingIdx(null);
  };

  // Clean up speech synthesis when unmounting page
  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
    };
  }, []);

  // Voice Input Handler (Speech Recognition)
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("आपके डिवाइस/ब्राउज़र में वॉइस रिकॉग्निशन (माइक) उपलब्ध नहीं है। कृपया Google Chrome का प्रयोग करें।");
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
      recognition.lang = speechLang || 'hi-IN';
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

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setIsListening(false);
    }
  };

  // Online Audio TTS Fallback (High Quality Google TTS Stream)
  const playGoogleTtsFallback = (cleanStr: string, shortLang: string, msgIndex: number) => {
    try {
      if (audioFallbackRef.current) {
        try { audioFallbackRef.current.pause(); } catch (e) {}
        audioFallbackRef.current = null;
      }
      const encodedText = encodeURIComponent(cleanStr.slice(0, 300));
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${shortLang}&client=tw-ob`;
      const audio = new Audio(audioUrl);
      audioFallbackRef.current = audio;
      setCurrentlySpeakingIdx(msgIndex);
      audio.onended = () => setCurrentlySpeakingIdx(null);
      audio.onerror = () => setCurrentlySpeakingIdx(null);
      audio.play().catch(e => {
        console.warn("Google Studio TTS audio play blocked or error:", e);
        setCurrentlySpeakingIdx(null);
      });
    } catch (e) {
      setCurrentlySpeakingIdx(null);
    }
  };

  // Voice Output Handler (Text-To-Speech with Natural Voice Matching & Fallbacks)
  const speakMessage = (text: string, msgIndex: number, overrideLang?: string) => {
    const targetLangCode = overrideLang || speechLang || 'hi-IN';
    const { bcp, short } = getBcp47Lang(targetLangCode);

    if (currentlySpeakingIdx === msgIndex && !overrideLang) {
      stopSpeech();
      return;
    }

    stopSpeech();

    const cleanStr = cleanTextForSpeech(text, bcp);
    if (!cleanStr) return;

    // Direct Google Studio AI Voice mode option or fallback when SpeechSynthesis unavailable
    if (selectedVoiceURI === 'google-hd' || !('speechSynthesis' in window)) {
      playGoogleTtsFallback(cleanStr, short, msgIndex);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(cleanStr);
      utterance.lang = bcp;
      utterance.rate = 0.95; // Natural clear reading speed
      utterance.pitch = 1.0;  // Standard natural pitch

      let allVoices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      
      if (allVoices && allVoices.length > 0) {
        const langCode = bcp.toLowerCase();
        const shortCode = short.toLowerCase();
        
        let matchVoice: SpeechSynthesisVoice | undefined;

        // Strictly match native voices of the specified language
        const nativeVoices = allVoices.filter(v => {
          const l = v.lang.toLowerCase().replace('_', '-');
          return l.startsWith(shortCode) || l.startsWith(langCode);
        });

        if (selectedVoiceURI && selectedVoiceURI !== 'google-hd') {
          matchVoice = nativeVoices.find(v => v.voiceURI === selectedVoiceURI) || allVoices.find(v => v.voiceURI === selectedVoiceURI);
        }

        if (!matchVoice && nativeVoices.length > 0) {
          // 1. Natural / Google / Microsoft / Neural native voice
          matchVoice = nativeVoices.find(v => {
            const n = v.name.toLowerCase();
            return n.includes('natural') || n.includes('google') || n.includes('online') || n.includes('neural') || n.includes('swara') || n.includes('hemant') || n.includes('madhur') || n.includes('lekha') || n.includes('neel');
          });
          // 2. Any Native voice matching the language
          if (!matchVoice) {
            matchVoice = nativeVoices[0];
          }
        }

        if (matchVoice) {
          utterance.voice = matchVoice;
        } else {
          // If no native voice matching the target language is installed in browser, fallback to Google Studio TTS
          playGoogleTtsFallback(cleanStr, short, msgIndex);
          return;
        }
      } else {
        playGoogleTtsFallback(cleanStr, short, msgIndex);
        return;
      }

      let started = false;

      utterance.onstart = () => {
        started = true;
        setCurrentlySpeakingIdx(msgIndex);
      };

      utterance.onend = () => {
        setCurrentlySpeakingIdx(null);
      };

      utterance.onerror = () => {
        playGoogleTtsFallback(cleanStr, short, msgIndex);
      };

      window.speechSynthesis.speak(utterance);

      // Fallback check if browser speech synthesis gets stuck/silent
      setTimeout(() => {
        if (!started && (!window.speechSynthesis || !window.speechSynthesis.speaking)) {
          playGoogleTtsFallback(cleanStr, short, msgIndex);
        }
      }, 2500);

    } catch (err) {
      console.error("Speech playback error, switching to Google Studio TTS:", err);
      playGoogleTtsFallback(cleanStr, short, msgIndex);
    }
  };

  // Test Voice Feedback for selected language
  const handleSelectLanguageAndTest = (code: string) => {
    const { bcp } = getBcp47Lang(code);
    setSpeechLang(bcp);
    stopSpeech();

    const samplePhrases: Record<string, string> = {
      'hi-IN': "नमस्ते सर! यह OneDiary डिजिटल डायरी की आवाज़ है।",
      'en-IN': "Hello Sir! This is onediary.in voice assistant.",
      'gu-IN': "નમસ્તે સર! આ OneDiary ડિજિટલ ડાયરીનો અવાજ છે.",
      'ta-IN': "வணக்கம் ஐயா! இது OneDiary டிஜிட்டல் டைரி குரல் உதவி.",
      'mr-IN': "नमस्कार सर! हा OneDiary डिजिटल डायरीचा आवाज आहे.",
      'bn-IN': "নমস্কার স্যার! এটি OneDiary ডিজিটাল ডায়েরির ভয়েস।",
      'pa-IN': "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਜੀ! ਇਹ OneDiary ਡਿਜਿਟਲ ਡਾਇਰੀ ਦੀ ਆਵਾਜ਼ ਹੈ।",
      'te-IN': "నమస్తే సర్! ఇది OneDiary డిజిటల్ డైరీ వాయిస్ సహాయకుడు.",
      'kn-IN': "ನಮಸ್ಕಾರ ಸರ್! ಇದು OneDiary ಡಿಜಿಟಲ್ ಡೈರಿಯ ಧ್ವನಿ.",
      'es-ES': "¡Hola Señor! Esta es la voz de onediary.in."
    };

    const phrase = samplePhrases[bcp] || samplePhrases[code] || "नमस्ते सर! OneDiary डिजिटल डायरी में आपका स्वागत है।";
    setTimeout(() => {
      speakMessage(phrase, -999, bcp);
    }, 150);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    // Stop microphone if currently listening
    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
      setIsListening(false);
    }

    // Capture if input was provided via voice microphone
    const sentViaVoice = wasVoiceInputRef.current;
    wasVoiceInputRef.current = false;

    // Stop current speech playback when user submits a new prompt
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
        cashStats: getCashStats(activeCashBookId),
        workersList: workers.map(w => ({ name: w.name, phone: w.phone, dailyWage: w.dailyWage }))
      });

      let data: any = null;
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            history: messages.slice(1).map(m => ({ role: m.role, text: m.text })),
            appData: appDataStr
          })
        });

        if (response.ok) {
          data = await response.json();
        }
      } catch (netErr) {
        console.warn("API route unavailable, using client-side AI assistant fallback:", netErr);
      }

      const replyText = data?.reply || generateClientFallbackReply(userMessage, {
        workersCount: workers.length,
        todayStats: getTodayStats(),
        cashStats: getCashStats(activeCashBookId),
        workers: workers
      });

      const nextMessages = [
        ...newMessages, 
        { 
          role: 'model' as const, 
          text: replyText,
          searchQueries: data?.searchQueries,
          sources: data?.sources
        }
      ];

      setMessages(nextMessages);

      // Auto-speak reply ONLY if autoSpeak is ON OR if user sent prompt via Voice Microphone
      if ((autoSpeak || sentViaVoice) && replyText) {
        setTimeout(() => {
          speakMessage(replyText, nextMessages.length - 1);
        }, 400);
      }

    } catch (error) {
      const clientFallback = generateClientFallbackReply(userMessage, {
        workersCount: workers.length,
        todayStats: getTodayStats(),
        cashStats: getCashStats(activeCashBookId),
        workers: workers
      });

      const nextMessages = [...newMessages, { role: 'model' as const, text: clientFallback }];
      setMessages(nextMessages);

      if ((autoSpeak || sentViaVoice) && clientFallback) {
        setTimeout(() => {
          speakMessage(clientFallback, nextMessages.length - 1);
        }, 400);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear all messages?")) {
      setMessages([{ role: 'model', text: currentT.greeting }]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white font-sans">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 hover:bg-slate-800 rounded-xl transition-all shrink-0 text-slate-300 hover:text-white cursor-pointer"
            title="Go Home"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-base font-extrabold tracking-tight flex items-center gap-2">
              <Bot className="text-orange-400" size={17} />
              <span>{currentT.title}</span>
              <span className="bg-orange-500/25 text-orange-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-orange-500/30 flex items-center gap-1 uppercase tracking-wider">
                <Sparkles size={9} /> Voice AI
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-xs sm:max-w-md">{currentT.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Stop Speech Button if currently speaking */}
          {currentlySpeakingIdx !== null && (
            <button
              type="button"
              onClick={stopSpeech}
              className="text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 animate-pulse shadow-md"
              title="बोलना तुरंत बंद करें"
            >
              <Square size={13} className="fill-current" />
              <span>🛑 आवाज़ रोकें</span>
            </button>
          )}

          {/* Auto-Speak Toggle Button */}
          <button 
            type="button"
            onClick={() => {
              const nextVal = !autoSpeak;
              setAutoSpeak(nextVal);
              if (!nextVal) stopSpeech();
            }}
            className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              autoSpeak 
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="ऑटो बोलकर उत्तर दें (Auto Speak Answers)"
          >
            {autoSpeak ? <Volume2 size={15} className="text-amber-400 animate-pulse" /> : <VolumeX size={15} />}
            <span className="hidden sm:inline">{autoSpeak ? 'आवाज़ ON' : 'आवाज़ OFF'}</span>
          </button>

          <button 
            onClick={clearChat}
            className="text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/10 px-3 py-2 rounded-xl border border-slate-800 hover:border-rose-500/20 transition-all cursor-pointer"
          >
            {currentT.clearChat}
          </button>
        </div>
      </div>

      {/* Multilingual Voice Selection & Speaker Bar */}
      <div className="bg-slate-900/95 border-b border-slate-800/80 px-3.5 py-2.5 flex items-center justify-between text-xs overflow-x-auto gap-2.5 scrollbar-none shrink-0 shadow-inner">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-300 font-extrabold flex items-center gap-1.5 text-[11px] bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
            <Volume2 size={13} className="text-orange-400 animate-pulse" />
            <span>बहुभाषी आवाज़:</span>
          </span>
          <select 
            value={selectedVoiceURI} 
            onChange={(e) => {
              setSelectedVoiceURI(e.target.value);
              setTimeout(() => handleSelectLanguageAndTest(speechLang), 100);
            }}
            className="px-2 py-1 bg-slate-800 text-orange-300 border border-slate-700/60 rounded-lg text-[11px] font-bold outline-none cursor-pointer max-w-[140px] truncate"
            title="अपनी पसंद की AI आवाज़ चुनें"
          >
            <option value="google-hd">✨ Google HD Studio Voice (साफ हिंदी)</option>
            <option value="">📱 ऑटोमैटिक डिवाइस आवाज़ (Auto)</option>
            {availableVoices
              .filter(v => {
                const targetShort = getBcp47Lang(speechLang).short.toLowerCase();
                const vLang = v.lang.toLowerCase();
                return vLang.startsWith(targetShort) || vLang.includes(targetShort);
              })
              .map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name.includes('Male') || v.name.includes('Standard-B') || v.name.includes('Standard-D') || v.name.includes('-x-hid-') || v.name.includes('guy') ? '👨 ' : '👩 '} 
                  {v.name} ({v.lang})
                </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => handleSelectLanguageAndTest(speechLang)}
            className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-bold text-[11px] shadow-sm flex items-center gap-1 cursor-pointer transition active:scale-95 whitespace-nowrap"
            title="क्लिक करके चुनें भाषा की आवाज़ टेस्ट करें"
          >
            <Radio size={12} className="animate-spin" />
            <span>🔊 टेस्ट</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto scrollbar-none">
          {[
            { code: 'hi-IN', label: '🇮🇳 हिन्दी' },
            { code: 'en-IN', label: '🗣️ Hinglish / English' },
            { code: 'gu-IN', label: '🇮🇳 ગુજરાતી (Gujarati)' },
            { code: 'ta-IN', label: '🇮🇳 தமிழ் (Tamil)' },
            { code: 'mr-IN', label: '🇮🇳 मराठी (Marathi)' },
            { code: 'bn-IN', label: '🇮🇳 বাংলা (Bengali)' },
            { code: 'pa-IN', label: '🇮🇳 ਪੰਜਾਬੀ (Punjabi)' },
            { code: 'te-IN', label: '🇮🇳 తెలుగు (Telugu)' },
            { code: 'kn-IN', label: '🇮🇳 ಕನ್ನಡ (Kannada)' },
            { code: 'es-ES', label: '🇪🇸 Español' }
          ].map(item => (
            <button
              key={item.code}
              type="button"
              onClick={() => handleSelectLanguageAndTest(item.code)}
              className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                speechLang === item.code
                  ? 'bg-orange-500 text-white shadow-md ring-2 ring-orange-400 scale-105'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Speech Playing Banner with Instant Stop Button */}
      {currentlySpeakingIdx !== null && (
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-b border-rose-500/50 px-4 py-2 flex items-center justify-between text-xs text-rose-200 font-bold shrink-0 shadow-lg animate-in fade-in slide-in-from-top-1">
          <span className="flex items-center gap-2">
            <Volume2 size={16} className="text-rose-400 animate-pulse" />
            <span>🔊 एआई जवाब बोल रहा है... (AI is reading response)</span>
          </span>
          <button
            type="button"
            onClick={stopSpeech}
            className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-[11px] font-black px-3 py-1 rounded-lg border border-rose-400/60 shadow-md flex items-center gap-1.5 transition cursor-pointer"
            title="बोलना तुरंत रोकें (Stop Speaking Immediately)"
          >
            <Square size={12} className="fill-current" />
            <span>🛑 आवाज़ तुरंत बंद करें (Stop Speaking)</span>
          </button>
        </div>
      )}

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-950 scrollbar-thin">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
            
            {/* Message Box */}
            <div className={`max-w-[88%] md:max-w-[80%] rounded-2xl px-4 py-3.5 text-sm shadow-xl border relative group ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-orange-500 to-amber-600 border-orange-500 text-white rounded-br-sm' 
                : 'bg-slate-900 border-slate-800 text-slate-100 rounded-bl-sm'
            }`}>
              
              {/* Message Header Label with Speaker Button for AI Messages */}
              <div className="flex items-center justify-between gap-2 mb-2 opacity-80 text-[9px] font-black uppercase tracking-widest border-b border-slate-800/40 pb-1">
                {msg.role === 'user' ? (
                  <span>👤 You</span>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Bot size={11} className="text-orange-400 animate-pulse" />
                      ChatGPT Voice AI
                    </span>

                    {/* Speaker Listen / Stop Button */}
                    <button
                      type="button"
                      onClick={() => speakMessage(msg.text, idx)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                        currentlySpeakingIdx === idx
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700'
                      }`}
                      title={currentlySpeakingIdx === idx ? "बोलना रोकें (Stop)" : "बोलकर सुनें (Listen)"}
                    >
                      {currentlySpeakingIdx === idx ? (
                        <>
                          <Square size={10} className="fill-current" />
                          <span>रोकें</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={11} />
                          <span>सुनें 🔊</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Real-time Web Search Indicators */}
              {msg.role === 'model' && msg.searchQueries && msg.searchQueries.length > 0 && (
                <div className="mb-3.5 bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    <Search size={11} className="text-orange-400 animate-pulse" />
                    Real-Time Google Web Search:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {msg.searchQueries.map((query, qIdx) => (
                      <span key={qIdx} className="text-[10px] font-bold text-orange-300 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                        {query}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rendered ChatGPT style markdown text */}
              <div className="space-y-1">
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                ) : (
                  parseMarkdown(msg.text)
                )}
              </div>

              {/* Rendered Citations & Sources Cards */}
              {msg.role === 'model' && msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-slate-800/80">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                    <ExternalLink size={11} className="text-orange-400" />
                    Verified Sources & References:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.sources.map((src, sIdx) => (
                      <a
                        key={sIdx}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-slate-950/50 hover:bg-slate-950 border border-slate-800 hover:border-orange-500/30 rounded-xl transition-all flex items-center gap-2.5 group cursor-pointer"
                      >
                        <div className="w-5.5 h-5.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-black text-orange-400 shrink-0 group-hover:bg-orange-500/15 group-hover:border-orange-500/30 transition-all">
                          {sIdx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-all">
                            {src.title}
                          </div>
                          <div className="text-[9px] text-slate-500 truncate font-mono">
                            {src.uri}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-lg flex items-center space-x-1.5 animate-pulse">
              <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input panel */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0 shadow-[0_-4px_24px_rgba(0,0,0,0.2)]">
        
        {/* Active Speaking Banner with instant stop */}
        {currentlySpeakingIdx !== null && (
          <div className="max-w-4xl mx-auto mb-2 bg-amber-500/15 border border-amber-500/40 text-amber-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between animate-pulse">
            <span className="flex items-center gap-2">
              <Volume2 size={14} className="text-amber-400 animate-bounce" />
              🔊 AI बोलकर उत्तर पढ़ रहा है... (Speaking answer)
            </span>
            <button
              type="button"
              onClick={stopSpeech}
              className="text-[10px] bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-lg font-black transition cursor-pointer flex items-center gap-1"
            >
              <Square size={10} className="fill-current" />
              <span>🛑 आवाज़ रोकें</span>
            </button>
          </div>
        )}

        {/* Active Listening Animated Banner */}
        {isListening && (
          <div className="max-w-4xl mx-auto mb-2 bg-rose-500/15 border border-rose-500/40 text-rose-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between animate-pulse">
            <span className="flex items-center gap-2">
              <Radio size={14} className="text-rose-400 animate-spin" />
              🎙️ आपकी आवाज़ सुनी जा रही है... बोलिए! (Listening...)
            </span>
            <button
              type="button"
              onClick={toggleListening}
              className="text-[10px] bg-rose-500 hover:bg-rose-600 text-white px-2 py-1 rounded-lg font-black transition cursor-pointer"
            >
              बंद करें (Stop Mic)
            </button>
          </div>
        )}

        <form onSubmit={handleSendChat} className="flex gap-2 max-w-4xl mx-auto">
          {/* Voice Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3.5 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-orange-400 hover:text-orange-300 border border-slate-700'
            }`}
            title={isListening ? "माइक बंद करें" : "माइक से बोलकर पूछें (Voice Input)"}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <input
            type="text"
            value={chatInput}
            onChange={(e) => {
              setChatInput(e.target.value);
              wasVoiceInputRef.current = false;
            }}
            placeholder={isListening ? "🎙️ बोलिए... (Listening to your voice)" : currentT.placeholder}
            className={`flex-1 border rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all font-medium ${
              isListening
                ? 'bg-rose-950/20 border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'bg-slate-950 border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
            }`}
            disabled={isTyping}
            required
          />

          <button 
            type="submit"
            disabled={!chatInput.trim() || isTyping}
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-5 rounded-2xl flex items-center justify-center disabled:opacity-50 hover:scale-[0.99] active:scale-[0.97] transition-all cursor-pointer shadow-lg shadow-orange-500/20 shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
