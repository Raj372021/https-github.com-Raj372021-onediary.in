import React, { useState } from "react";
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  User,
  Printer,
  Share2,
  Compass,
  Star,
  ShieldAlert,
  ShieldCheck,
  Award,
  Heart,
  Download,
  Globe,
  CheckCircle2,
  ChevronRight,
  Flame,
  Zap,
  Info,
  BookOpen,
  Layers,
  Crown,
  Trash2,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAppContext } from "../context/AppContext";
import InstantPlanPaymentModal from "./InstantPlanPaymentModal";
import {
  calculateVedicKundli,
  calculateAshtakootMilan,
  VedicKundliResult,
  RASHIS,
  NAKSHATRAS,
} from "../utils/vedicAstrology";
import VedicKundliChart from "./VedicKundliChart";
import RoyalGoldenKundliPlate from "./RoyalGoldenKundliPlate";
import { LifeRoadmapTimeline } from "./LifeRoadmapTimeline";
import KundliPrintPatrika from "./KundliPrintPatrika";
interface KundliModalProps {
  isOpen: boolean;
  onClose: () => void;
}
interface BirthDetails {
  name: string;
  dob: string;
  time: string;
  place: string;
  gender: string;
}
interface MatchingDetails {
  boyName: string;
  boyDob: string;
  boyTime: string;
  boyPlace: string;
  girlName: string;
  girlDob: string;
  girlTime: string;
  girlPlace: string;
}
export default function KundliModal({ isOpen, onClose }: KundliModalProps) {
  const { language } = useLanguage();
  const { isSubscribed, subscriptionInfo } = useAppContext();
  const [isInstantPaymentOpen, setIsInstantPaymentOpen] = useState(false);
  const [showQuotaLimitModal, setShowQuotaLimitModal] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<"single" | "matching">(
    "single",
  );
  const [activeSubTab, setActiveSubTab] = useState<
    | "goldplate"
    | "timeline"
    | "charts"
    | "planets"
    | "dasha"
    | "dosha"
    | "predictions"
    | "remedies"
    | "ashtakavarga"
  >("goldplate"); // Kundli Language Selector (Hindi, English, Tamil, Telugu)
  const [kundliLang, setKundliLang] = useState<string>(
    language === "en" ? "en" : "hi",
  );
  const [singleStep, setSingleStep] = useState<"form" | "result">("form");
  const [matchStep, setMatchStep] = useState<"form" | "result">("form");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSavedKundlisList, setShowSavedKundlisList] = useState(false); // Local storage for saved kundlis
  const [savedKundlis, setSavedKundlis] = useState<
    Array<{
      id: string;
      name: string;
      dob: string;
      time: string;
      place: string;
      gender: string;
      rashi?: string;
      lagna?: string;
      createdAt: string;
    }>
  >(() => {
    try {
      const stored = localStorage.getItem("onediary_saved_kundlis");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }); // Track if 1 kundli limit has been reached
  const isKundliQuotaUsed = savedKundlis.length >= 1;
  const [formData, setFormData] = useState<BirthDetails>({
    name: language === "en" ? "Alex Morgan" : "एलेक्स मॉर्गन",
    dob: "1995-06-15",
    time: "10:30",
    place:
      language === "en" ? "Varanasi, Uttar Pradesh" : "वाराणसी, उत्तर प्रदेश",
    gender: "Male",
  });
  const [matchingForm, setMatchingForm] = useState<MatchingDetails>({
    boyName: language === "en" ? "Rahul Sharma" : "राहुल शर्मा",
    boyDob: "1994-04-12",
    boyTime: "09:15",
    boyPlace: language === "en" ? "Delhi" : "दिल्ली",
    girlName: language === "en" ? "Priya Kumari" : "प्रिया कुमारी",
    girlDob: "1996-08-20",
    girlTime: "14:30",
    girlPlace: language === "en" ? "Varanasi" : "वाराणसी",
  });
  const [kundliData, setKundliData] = useState<VedicKundliResult | null>(null);
  const [matchingData, setMatchingData] = useState<any | null>(null);
  if (!isOpen) return null;
  const handleSaveToKundliHistory = (
    details: BirthDetails,
    result: VedicKundliResult,
  ) => {
    try {
      const newEntry = {
        id:
          "kundli_" +
          Date.now() +
          "_" +
          Math.random().toString(36).substring(2, 7),
        name: details.name,
        dob: details.dob,
        time: details.time,
        place: details.place,
        gender: details.gender,
        rashi: result.panchang.chandraRashiHi,
        lagna: result.panchang.lagnaRashiHi,
        createdAt: new Date().toISOString(),
      };

      const updated = [
        newEntry,
        ...savedKundlis.filter(
          (k) =>
            k.name.toLowerCase() !== details.name.toLowerCase() ||
            k.dob !== details.dob,
        ),
      ];
      setSavedKundlis(updated);
      localStorage.setItem("onediary_saved_kundlis", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSavedKundli = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedKundlis.filter((k) => k.id !== id);
    setSavedKundlis(updated);
    localStorage.setItem("onediary_saved_kundlis", JSON.stringify(updated));
  };

  const handleLoadSavedKundli = (saved: {
    name: string;
    dob: string;
    time: string;
    place: string;
    gender: string;
  }) => {
    setFormData({
      name: saved.name,
      dob: saved.dob,
      time: saved.time,
      place: saved.place,
      gender: saved.gender,
    });
    setIsGenerating(true);
    setShowSavedKundlisList(false);
    setTimeout(() => {
      const result = calculateVedicKundli(
        saved.name,
        saved.dob,
        saved.time,
        saved.place,
        saved.gender,
      );
      setKundliData(result);
      setIsGenerating(false);
      setSingleStep("result");
      setActiveSubTab("goldplate");
    }, 400);
  };

  const handleCreateNewKundli = () => {
    if (savedKundlis.length >= 1) {
      setShowQuotaLimitModal(true);
      return;
    }
    setFormData({
      name: "",
      dob: "2000-01-01",
      time: "12:00",
      place: "",
      gender: "Male",
    });
    setKundliData(null);
    setSingleStep("form");
  };

  const handleCreateNewMatchmaking = () => {
    setMatchingForm({
      boyName: "",
      boyDob: "1995-01-01",
      boyTime: "10:00",
      boyPlace: "",
      girlName: "",
      girlDob: "1997-01-01",
      girlTime: "10:00",
      girlPlace: "",
    });
    setMatchingData(null);
    setMatchStep("form");
  };

  const handleGenerateKundli = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubscribed) {
      setIsInstantPaymentOpen(true);
      return;
    }
    // Check if customer already generated 1 Kundli and is not just reloading the same person
    if (savedKundlis.length >= 1) {
      const isExistingPerson = savedKundlis.some(
        (k) =>
          k.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
          k.dob === formData.dob,
      );
      if (!isExistingPerson) {
        setShowQuotaLimitModal(true);
        return;
      }
    }
    setIsGenerating(true);
    setTimeout(() => {
      const result = calculateVedicKundli(
        formData.name,
        formData.dob,
        formData.time,
        formData.place,
        formData.gender,
      );
      setKundliData(result);
      handleSaveToKundliHistory(formData, result);
      setIsGenerating(false);
      setSingleStep("result");
      setActiveSubTab("goldplate");
    }, 600);
  };

  const handleGenerateGunMilan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubscribed) {
      setIsInstantPaymentOpen(true);
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const result = calculateAshtakootMilan(
        matchingForm.boyName,
        matchingForm.boyDob,
        matchingForm.boyTime,
        matchingForm.boyPlace,
        matchingForm.girlName,
        matchingForm.girlDob,
        matchingForm.girlTime,
        matchingForm.girlPlace,
      );
      setMatchingData({ ...matchingForm, ...result });
      setIsGenerating(false);
      setMatchStep("result");
    }, 600);
  };

  const handlePrint = () => {
    if (!isSubscribed) {
      setIsInstantPaymentOpen(true);
      return;
    }
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!isSubscribed) {
      setIsInstantPaymentOpen(true);
      return;
    }
    if (activeMainTab === "single" && kundliData) {
      const text = `🕉️ *वैदिक जन्म कुण्डली प्रमाण-पत्र* 🕉️\n\n👤 जातक: *${kundliData.birthDetails.name}*\n� जन्म: ${kundliData.birthDetails.dob} (${kundliData.birthDetails.time})\n📍 स्थान: ${kundliData.birthDetails.place}\n\n✨ *लग्न:* ${kundliData.panchang.lagnaRashiHi} (स्वामी: ${kundliData.panchang.lagnaRashiLord})\n✨ *राशि:* ${kundliData.panchang.chandraRashiHi} (स्वामी: ${kundliData.panchang.chandraRashiLord})\n✨ *नक्षत्र:* ${kundliData.panchang.nakshatraHi} (चरण ${kundliData.panchang.nakshatraPada})\n✨ *महादशा:* ${kundliData.vimshottariDasha.currentDasha.mahadashaHi} / ${kundliData.vimshottariDasha.currentDasha.antardashaHi}\n🛡️ *मांगलिक:* ${kundliData.doshasAndYogas.manglik.isManglik ? (kundliData.doshasAndYogas.manglik.parihara ? "मांगलिक (परिहार सहित)" : "मांगलिक") : "मांगलिक नहीं"}\n💎 *शुभ रत्न:* ${kundliData.predictions.favorableFactors.luckyGemstoneHi}\n\n📱 *onediary.in - वैदिक पंचांग एवं कुण्डली*`;
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
        "_blank",
      );
    } else if (activeMainTab === "matching" && matchingData) {
      const text = `💍 *वैदिक 36 गुण मिलान रिपोर्ट* 💍\n\n👦 वर: *${matchingData.boyName}* (${matchingData.boyDob})\n👧 वधू: *${matchingData.girlName}* (${matchingData.girlDob})\n\n⭐ *कुल मिले गुण:* *${matchingData.totalGunas} / 36*\n🛡️ वर मांगलिक: ${matchingData.boyManglik ? "हाँ" : "नहीं"}\n🛡️ वधू मांगलिक: ${matchingData.girlManglik ? "हाँ" : "नहीं"}\n\n✨ *शास्त्र सम्मत निष्कर्ष:* ${matchingData.verdictHi}\n\n📱 *onediary.in - वैदिक विवाह मिलान*`;
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
        "_blank",
      );
    }
  };

  return (
    <>
      {/* Printable Area for Kundli Patrika & Gun Milan Report */}
      <KundliPrintPatrika
        kundliData={kundliData}
        matchingData={matchingData}
        activeMainTab={activeMainTab}
        kundliLang={kundliLang}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/60 dark:border-amber-500/80 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        {" "}
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-amber-700 via-orange-600 to-red-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl shadow-inner">
              {" "}
              🕉️
            </div>

            <div>
              {" "}
              <h2 className="text-base sm:text-xl font-black tracking-wide flex items-center gap-2">
                <span>
                  {kundliLang === "en"
                    ? "Vedic Kundli & Ashta-Koot Gun Milan"
                    : "शास्त्र सम्मत वैदिक जन्म कुण्डली एवं विवाह गुण मिलान"}
                </span>

                <span className="bg-amber-300 text-slate-950 text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase shadow-xs">
                  {" "}
                  बृहत्पाराशर होरा
                </span>
              </h2>
              <p className="text-xs text-amber-100 font-medium">
                {" "}
                {kundliLang === "en"
                  ? "Authentic Ephemeris, D1/D9 Charts, 27 Nakshatras, Vimshottari Mahadasha & 36 Guna Milan"
                  : "चित्रापक्षीय �यनांश, लग्न व नवमांश चक्र, ग्रह स्पष्ट, 120-वर्षीय विंशोत्तरी महादशा एवं 36 �ष्टकूट मिलान"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition cursor-pointer"
          >
            {" "}
            <X size={20} />
          </button>
        </div>
        {/* Top Switcher Bar */}
        <div className="bg-amber-50 dark:bg-slate-850 border-b border-amber-200 dark:border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveMainTab("single")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 cursor-pointer ${activeMainTab === "single" ? "bg-amber-600 text-white shadow-md" : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"}`}
            >
              <span>📜</span>
              {kundliLang === "en"
                ? "Birth Kundli (Janm Patrika)"
                : "व्यक्तिगत जन्म कुण्डली"}
            </button>

            <button
              onClick={() => setActiveMainTab("matching")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 cursor-pointer ${activeMainTab === "matching" ? "bg-orange-600 text-white shadow-md" : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-orange-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"}`}
            >
              <span>💍</span>
              {kundliLang === "en"
                ? "36 Gunas Marriage Matching"
                : "विवाह गुण मिलान (36 गुण)"}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {" "}
            {isSubscribed && (
              <>
                <button
                  type="button"
                  onClick={handleCreateNewKundli}
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                >
                  <span>✨</span>

                  <span>
                    {kundliLang === "en"
                      ? "+ New Kundli"
                      : "+ नई कुण्डली बनाएं"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSavedKundlisList(!showSavedKundlisList)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 text-slate-800 dark:text-amber-200 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer hover:bg-amber-50 dark:hover:bg-slate-800"
                >
                  <span>📁</span>

                  <span>
                    {kundliLang === "en"
                      ? `Saved (${savedKundlis.length})`
                      : `सुरक्षित इतिहास (${savedKundlis.length})`}
                  </span>
                </button>
              </>
            )}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-slate-700 shadow-xs">
              {" "}
              <Globe size={15} className="text-amber-600" />
              <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                {" "}
                {kundliLang === "en" ? "Lang:" : "भाषा:"}
              </span>
              <select
                value={kundliLang}
                onChange={(e) => setKundliLang(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-black rounded-lg px-2 py-1 focus:outline-none cursor-pointer border border-slate-300 dark:border-slate-700"
              >
                {" "}
                <option value="hi">हिंदी (Hindi)</option>{" "}
                <option value="en">English</option>{" "}
                <option value="ta">தமிழ் (Tamil)</option>{" "}
                <option value="te">తెలుగు (Telugu)</option>{" "}
              </select>
            </div>
          </div>
        </div>
        {/* Saved Kundlis Drawer / Dropdown */}{" "}
        {/* Saved Kundlis Drawer / Dropdown */}{" "}
        {showSavedKundlisList && isSubscribed && (
          <div className="bg-gradient-to-b from-amber-50 to-orange-50 dark:from-slate-850 dark:to-slate-900 border-b-2 border-amber-300 dark:border-slate-700 p-3 sm:p-4 animate-fade-in shadow-inner shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-amber-200 flex items-center gap-2">
                <span>📁</span>

                <span>
                  {kundliLang === "en"
                    ? "Your Saved Kundlis"
                    : "आपकी सुरक्षित कुण्डलियां"}
                </span>

                <span className="bg-amber-200 text-amber-950 dark:bg-amber-900/60 dark:text-amber-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {" "}
                  {savedKundlis.length}{" "}
                  {kundliLang === "en" ? "Saved" : "सुरक्षित"}
                </span>
              </h4>

              <button
                onClick={() => setShowSavedKundlisList(false)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold cursor-pointer"
              >
                {" "}
                ✕ {kundliLang === "en" ? "Close" : "बंद करें"}
              </button>
            </div>
            {savedKundlis.length === 0 ? (
              <div className="text-center py-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-dashed border-amber-300 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {" "}
                  {kundliLang === "en"
                    ? "No saved Kundlis yet. Generate a Kundli below and it will automatically save here!"
                    : "अभी तक कोई कुण्डली सुरक्षित नहीं है। नीचे विवरण भरकर कुण्डली बनाएं, वह अपने-आप यहां सुरक्षित हो जाएगी।"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {" "}
                {savedKundlis.map((k) => (
                  <div
                    key={k.id}
                    className="bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-700 p-2.5 rounded-xl shadow-xs flex items-center justify-between gap-2 hover:border-amber-500 transition"
                  >
                    <div
                      onClick={() => handleLoadSavedKundli(k)}
                      className="cursor-pointer flex-1 min-w-0"
                    >
                      <p className="text-xs font-black text-slate-900 dark:text-amber-200 truncate">
                        {" "}
                        👤 {k.name}
                      </p>

                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {" "}
                        📅 {k.dob} • ⏰ {k.tob} • 📍 {k.place}
                      </p>

                      <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">
                        {" "}
                        {k.kundliData.planets.ascendant.rashi} लग्न •{" "}
                        {k.kundliData.planets.moon.rashi} राशि (
                        {k.kundliData.panchang.nakshatra})
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleLoadSavedKundli(k)}
                        className="px-2 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-lg hover:bg-amber-400 transition"
                        title="देखें / लोड करें"
                      >
                        {" "}
                        {kundliLang === "en" ? "Open" : "खोलें"}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSavedKundli(k.id, e)}
                        className="p-1 text-slate-400 hover:text-red-500 transition rounded-lg"
                        title="हटाएं"
                      >
                        {" "}
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}{" "}
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-6">
          {" "}
          {activeMainTab === "single" && (
            <div className="space-y-6">
              {" "}
              {/* Kundli Generation Form or VIP Plan Banner */}{" "}
              {singleStep === "form" ? (
                <form
                  onSubmit={handleGenerateKundli}
                  className="max-w-4xl mx-auto space-y-6 animate-fade-in"
                >
                  {" "}
                  {/* 💰 VIP PLAN BANNER */}{" "}
                  {isSubscribed ? (
                    isKundliQuotaUsed ? (
                      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white p-4 sm:p-5 rounded-3xl border-2 border-amber-400/80 shadow-xl space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl sm:text-3xl">🔒</span>

                            <div>
                              {" "}
                              <h3 className="font-black text-base sm:text-lg text-amber-300 leading-tight">
                                {" "}
                                {kundliLang === "en"
                                  ? "1 Kundli Quota Completed (1/1 Used)"
                                  : "🔒 1 जन्म कुण्डली कोटा पूर्ण (1/1 उपयोगित)"}{" "}
                              </h3>
                              <p className="text-xs text-amber-100 font-medium mt-0.5">
                                {" "}
                                {kundliLang === "en"
                                  ? "₹199 Plan includes 1 Full Janm Kundli. Your Kundli is saved and ready to view anytime below."
                                  : "₹199 प्लान में 1 संपूर्ण जन्म कुण्डली शामिल है। आपकी बनाई कुण्डली सुरक्षित है और कभी भी देखी जा सकती है।"}
                              </p>
                            </div>
                          </div>

                          <div className="bg-amber-500/20 border border-amber-400 px-3 py-1 rounded-xl text-center">
                            <span className="text-[10px] text-amber-300 font-black uppercase tracking-wider block">
                              कोटा
                            </span>

                            <span className="text-xs font-black text-white">
                              1 / 1 पूर्ण
                            </span>
                          </div>
                        </div>
                        {/* Quick View Saved Kundli Box */}{" "}
                        {savedKundlis[0] && (
                          <div className="bg-slate-950/80 border border-amber-400/50 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2.5">
                            <div>
                              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                                सुरक्षित कुण्डली:
                              </span>

                              <span className="font-black text-white text-sm">
                                👤 {savedKundlis[0].name}
                              </span>

                              <span className="text-xs text-slate-300 ml-2 font-medium">
                                ({savedKundlis[0].dob} • {savedKundlis[0].place}
                                )
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleLoadSavedKundli(savedKundlis[0])
                                }
                                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                              >
                                <span>👁️</span>

                                <span>
                                  {kundliLang === "en"
                                    ? "View My Kundli"
                                    : "अपनी कुण्डली देखें / प्रिंट"}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setIsInstantPaymentOpen(true)}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1"
                              >
                                <span>⚡</span>

                                <span>
                                  {kundliLang === "en"
                                    ? "+ Unlock Next (₹199)"
                                    : "+ नई कुण्डली (₹199)"}
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-3.5 rounded-2xl border border-emerald-500/40 flex items-center justify-between gap-3 shadow-md">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">✨</span>

                          <div>
                            <h4 className="font-black text-sm text-emerald-300">
                              {" "}
                              {kundliLang === "en"
                                ? "Vedic Kundli Access Active"
                                : "वैदिक कुण्डली निर्माण सुविधा सक्रिय"}
                            </h4>

                            <p className="text-xs text-emerald-100/90">
                              {" "}
                              {kundliLang === "en"
                                ? "1 Vedic Kundli + 10-Year Predictions available in your active plan"
                                : "आपके ₹199 प्लान में 1 संपूर्ण वैदिक कुण्डली व 10 साल का भविष्यफल शामिल है"}
                            </p>
                          </div>
                        </div>

                        <span className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs px-2.5 py-1 rounded-lg font-black shrink-0">
                          {" "}
                          1 कुण्डली उपलब्ध
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="bg-gradient-to-br from-amber-900 via-orange-950 to-slate-900 text-white p-4 sm:p-5 rounded-3xl border-2 border-amber-400/80 shadow-xl space-y-3.5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow">
                        {" "}
                        ऑफर प्लान • ₹199/महीना
                      </div>
                      {/* Price Tag Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl sm:text-3xl">🕉️</span>

                          <div>
                            {" "}
                            <h3 className="font-black text-base sm:text-lg text-amber-300 leading-tight">
                              {" "}
                              {kundliLang === "en"
                                ? "Starter Plan (₹199) - 1 Vedic Kundli"
                                : "स्टार्टर प्लान (₹199) • 1 वैदिक कुण्डली व 5 लेबर हाजिरी"}{" "}
                            </h3>
                            <p className="text-xs text-amber-100 font-medium">
                              {" "}
                              {kundliLang === "en"
                                ? "1 Full Janm Kundli + 10-Year Predictions + 36 Guna Milan + 5 Labour"
                                : "1 संपूर्ण जन्म कुण्डली, 10 साल का भविष्यफल, 36 गुण मिलान + 5 लेबर हाजिरी"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-2xl border border-amber-400/50">
                          <span className="text-xs text-slate-400 line-through font-bold">
                            ₹999
                          </span>

                          <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                            ₹199
                          </span>

                          <button
                            type="button"
                            onClick={() => setIsInstantPaymentOpen(true)}
                            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1 transition active:scale-95 cursor-pointer border border-amber-300"
                          >
                            {" "}
                            <Zap size={14} className="fill-slate-950" />
                            <span>₹199 प्लान खरीदें</span>
                          </button>
                        </div>
                      </div>
                      {/* All Included Features List */}
                      <div className="space-y-1.5 pt-1">
                        <p className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                          {" "}
                          <Sparkles size={14} className="text-amber-400" />
                          <span>
                            {kundliLang === "en"
                              ? "What You Get in ₹199 Plan:"
                              : "₹199 के स्टार्टर प्लान में आपको क्या-क्या मिलेगा:"}
                          </span>
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-950/60 p-2 rounded-xl border border-amber-500/20 flex items-start gap-2">
                            <span className="text-amber-400 font-bold shrink-0">
                              🔮
                            </span>

                            <div>
                              <span className="font-black text-amber-200 block">
                                1 संपूर्ण वैदिक जन्म कुण्डली व भविष्यफल
                              </span>

                              <span className="text-[11px] text-slate-300">
                                जातक की संपूर्ण कुण्डली व 10 साल की विस्तृत
                                वर्षवार भविष्यवाणी
                              </span>
                            </div>
                          </div>

                          <div className="bg-slate-950/60 p-2 rounded-xl border border-amber-500/20 flex items-start gap-2">
                            <span className="text-amber-400 font-bold shrink-0">
                              💍
                            </span>

                            <div>
                              <span className="font-black text-amber-200 block">
                                36 अष्टकूट विवाह गुण मिलान
                              </span>

                              <span className="text-[11px] text-slate-300">
                                वर-वधू के 36 गुण, नाड़ी दोष एवं मांगलिक साम्य की
                                अचूक गणना
                              </span>
                            </div>
                          </div>

                          <div className="bg-slate-950/60 p-2 rounded-xl border border-amber-500/20 flex items-start gap-2">
                            <span className="text-amber-400 font-bold shrink-0">
                              👷
                            </span>

                            <div>
                              <span className="font-black text-amber-200 block">
                                5 लेबर (मजदूर) डिजिटल हाजिरी
                              </span>

                              <span className="text-[11px] text-slate-300">
                                मजदूरों की उपस्थिति, ओवरटाइम एवं सैलरी ऑटो-हिसाब
                                प्रबंधन
                              </span>
                            </div>
                          </div>

                          <div className="bg-slate-950/60 p-2 rounded-xl border border-amber-500/20 flex items-start gap-2">
                            <span className="text-amber-400 font-bold shrink-0">
                              📜
                            </span>

                            <div>
                              <span className="font-black text-amber-200 block">
                                3D गोल्ड प्लेट कुण्डली डाउनलोड
                              </span>

                              <span className="text-[11px] text-slate-300">
                                लग्न चक्र (D1), नवमांश चक्र (D9) व 3D रॉयल
                                कुण्डली चार्ट डाउनलोड
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}{" "}
                  {/* Input Form Fields */}
                  <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      {" "}
                      <User size={14} className="text-amber-600" />
                      <span>
                        {kundliLang === "en"
                          ? "Enter Birth Details for Kundli:"
                          : "जातक का विवरण दर्ज करें:"}
                      </span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        {" "}
                        <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5">
                          {" "}
                          <User size={14} className="text-amber-600" />{" "}
                          {kundliLang === "en"
                            ? "Full Name"
                            : "जातक का पूरा नाम"}{" "}
                        </label>{" "}
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="उदा. एलेक्स मॉर्गन (Alex Morgan)"
                        />
                      </div>

                      <div className="space-y-1.5">
                        {" "}
                        <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5">
                          {" "}
                          <Compass size={14} className="text-amber-600" />{" "}
                          {kundliLang === "en"
                            ? "Gender"
                            : "लिंग (Gender)"}{" "}
                        </label>{" "}
                        <select
                          value={formData.gender}
                          onChange={(e) =>
                            setFormData({ ...formData, gender: e.target.value })
                          }
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          {" "}
                          <option value="Male">
                            {kundliLang === "en"
                              ? "Male (पुरुष)"
                              : "पुरुष (Male)"}
                          </option>{" "}
                          <option value="Female">
                            {kundliLang === "en"
                              ? "Female (महिला)"
                              : "महिला (Female)"}
                          </option>{" "}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        {" "}
                        <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5">
                          {" "}
                          <Calendar size={14} className="text-amber-600" />{" "}
                          {kundliLang === "en"
                            ? "Date of Birth"
                            : "जन्म तिथि (DOB)"}{" "}
                        </label>{" "}
                        <input
                          type="date"
                          required
                          value={formData.dob}
                          onChange={(e) =>
                            setFormData({ ...formData, dob: e.target.value })
                          }
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        {" "}
                        <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5">
                          {" "}
                          <Clock size={14} className="text-amber-600" />{" "}
                          {kundliLang === "en"
                            ? "Time of Birth"
                            : "जन्म समय (Time)"}{" "}
                        </label>{" "}
                        <input
                          type="time"
                          required
                          value={formData.time}
                          onChange={(e) =>
                            setFormData({ ...formData, time: e.target.value })
                          }
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {" "}
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5">
                        {" "}
                        <MapPin size={14} className="text-amber-600" />{" "}
                        {kundliLang === "en"
                          ? "Place of Birth (City, State)"
                          : "जन्म स्थान (शहर / जिला)"}{" "}
                      </label>{" "}
                      <input
                        type="text"
                        required
                        value={formData.place}
                        onChange={(e) =>
                          setFormData({ ...formData, place: e.target.value })
                        }
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="उदा. वाराणसी, उत्तर प्रदेश"
                      />
                    </div>
                  </div>
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="w-full py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-black text-base rounded-2xl shadow-xl transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {" "}
                      {isGenerating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>
                            {kundliLang === "en"
                              ? "Generating 10-Year Kundli Report..."
                              : "10-वर्षीय कुण्डली रिपोर्ट तैयार हो रही है..."}
                          </span>
                        </>
                      ) : (
                        <>
                          {" "}
                          <Sparkles size={19} />
                          <span>
                            {" "}
                            {isSubscribed
                              ? kundliLang === "en"
                                ? "Generate 10-Year Kundli Report"
                                : "✨ संपूर्ण 10-वर्षीय कुण्डली रिपोर्ट देखें"
                              : kundliLang === "en"
                                ? "⚡ Buy ₹199 Plan to Unlock Kundli Report"
                                : "⚡ ₹199 प्लान खरीदें व संपूर्ण कुण्डली रिपोर्ट देखें"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                kundliData && (
                  <div className="space-y-6">
                    {" "}
                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-amber-100 to-yellow-50 dark:from-slate-800 dark:to-slate-850 p-3.5 rounded-2xl border border-amber-300 dark:border-slate-700 shadow-sm">
                      <div>
                        {" "}
                        <h3 className="font-black text-slate-900 dark:text-amber-100 text-base flex items-center gap-2">
                          <span>🕉️</span>
                          {kundliData.birthDetails.name} -{" "}
                          {kundliLang === "en"
                            ? "Vedic Horoscope Report"
                            : "वैदिक जन्म कुण्डली"}{" "}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                          {" "}
                          {kundliData.birthDetails.dob} (
                          {kundliData.birthDetails.time}) |{" "}
                          {kundliData.birthDetails.place}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={handleCreateNewKundli}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                        >
                          <span>✨</span>

                          <span>
                            {kundliLang === "en"
                              ? "+ New Kundli"
                              : "+ नई कुण्डली"}
                          </span>
                        </button>

                        <button
                          onClick={() => setSingleStep("form")}
                          className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-amber-300 dark:border-slate-600 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition cursor-pointer"
                        >
                          {" "}
                          {kundliLang === "en" ? "✏️ Edit" : "✏️ बदलें"}
                        </button>

                        <button
                          onClick={handlePrint}
                          className="px-3.5 py-1.5 bg-slate-900 dark:bg-amber-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition hover:bg-slate-800 cursor-pointer"
                        >
                          {" "}
                          <Printer size={15} />
                          <span>
                            {kundliLang === "en"
                              ? "Print / PDF"
                              : "प्रिंट / PDF"}
                          </span>
                        </button>

                        <button
                          onClick={handleWhatsAppShare}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
                        >
                          {" "}
                          <Share2 size={15} />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                    {/* Sub-Tabs for deep exploration */}
                    <div className="flex flex-wrap gap-1.5 border-b border-amber-200 dark:border-slate-800 pb-2">
                      {" "}
                      {[
                        {
                          id: "goldplate",
                          label:
                            kundliLang === "en"
                              ? "👑 Royal 3D Gold Plate"
                              : "👑 3D रॉयल गोल्ड प्लेट",
                          icon: "👑",
                        },
                        {
                          id: "timeline",
                          label:
                            kundliLang === "en"
                              ? "🔮 Life Roadmap & Annual Forecast"
                              : "🔮 जीवन चक्र व वर्ष-वार भविष्यफल",
                          icon: "🔮",
                        },
                        {
                          id: "charts",
                          label:
                            kundliLang === "en"
                              ? "Kundli Charts (D1/D9)"
                              : "कुण्डली चक्र (D1/D9)",
                          icon: "✨",
                        },
                        {
                          id: "planets",
                          label:
                            kundliLang === "en"
                              ? "Planetary Positions & Panchang"
                              : "ग्रह स्पष्ट व पंचांग",
                          icon: "🪐",
                        },
                        {
                          id: "dasha",
                          label:
                            kundliLang === "en"
                              ? "Vimshottari Dasha"
                              : "विंशोत्तरी महादशा",
                          icon: "⏳",
                        },
                        {
                          id: "dosha",
                          label:
                            kundliLang === "en"
                              ? "Doshas & Auspicious Yogas"
                              : "दोष, योग व साढ़े साती",
                          icon: "🛡️",
                        },
                        {
                          id: "predictions",
                          label:
                            kundliLang === "en"
                              ? "Life Predictions"
                              : "शास्त्र सम्मत भविष्यफल",
                          icon: "📜",
                        },
                        {
                          id: "remedies",
                          label:
                            kundliLang === "en"
                              ? "Remedies & Gemstones"
                              : "वैदिक उपाय व रत्न",
                          icon: "💎",
                        },
                        {
                          id: "ashtakavarga",
                          label:
                            kundliLang === "en"
                              ? "Ashtakavarga"
                              : "�ष्टकवर्ग चक्र",
                          icon: "📊",
                        },
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setActiveSubTab(sub.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${activeSubTab === sub.id ? "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-md" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100/60 dark:hover:bg-slate-700"}`}
                        >
                          <span>{sub.icon}</span>

                          <span>{sub.label}</span>
                        </button>
                      ))}
                    </div>
                    {/* SUB TAB 0: ROYAL GOLDEN KUNDLI PLATE (EXACT PHOTO REPLICA) */}{" "}
                    {activeSubTab === "goldplate" && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-b from-amber-50 to-yellow-100/50 dark:from-slate-900 dark:to-slate-850 p-4 sm:p-6 rounded-3xl border-2 border-amber-400/80 dark:border-amber-700/80 shadow-xl flex flex-col items-center">
                          {" "}
                          <RoyalGoldenKundliPlate
                            kundli={kundliData}
                            type="lagna"
                            customerName={kundliData.birthDetails.name}
                            onPaymentRequired={() =>
                              setIsInstantPaymentOpen(true)
                            }
                          />
                        </div>
                      </div>
                    )}{" "}
                    {/* SUB TAB: LIFE ROADMAP & ANNUAL FORECAST (HINDI + ENGLISH DETAILED BREAKDOWN) */}{" "}
                    {activeSubTab === "timeline" && (
                      <LifeRoadmapTimeline
                        kundli={kundliData}
                        customerName={kundliData.birthDetails.name}
                      />
                    )}{" "}
                    {/* SUB TAB 1: CHARTS (LAGNA D1 & NAVAMSHA D9) */}{" "}
                    {activeSubTab === "charts" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-white dark:bg-slate-800/80 p-4 rounded-3xl border border-amber-300/70 dark:border-slate-700 shadow-md">
                            {" "}
                            <VedicKundliChart
                              kundli={kundliData}
                              type="lagna"
                            />
                          </div>

                          <div className="bg-white dark:bg-slate-800/80 p-4 rounded-3xl border border-amber-300/70 dark:border-slate-700 shadow-md">
                            {" "}
                            <VedicKundliChart
                              kundli={kundliData}
                              type="navamsha"
                            />
                          </div>
                        </div>
                        {/* 12 House Lords & Significations */}
                        <div className="bg-white dark:bg-slate-800/80 p-5 rounded-3xl border border-amber-200 dark:border-slate-700 space-y-3">
                          <h4 className="font-black text-sm text-slate-900 dark:text-amber-200 flex items-center gap-2 border-b pb-2 dark:border-slate-700">
                            <span>🏠</span>
                            {kundliLang === "en"
                              ? "12 Bhavas (Houses) Dignity & Lordship Analysis"
                              : "द्वादश भाव (12 भाव) एवं भावेश विश्लेषण"}
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {" "}
                            {kundliData.lagnaChart.houses.map((h) => (
                              <div
                                key={h.houseNumber}
                                className="p-3 rounded-2xl bg-amber-50/60 dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 text-xs space-y-1"
                              >
                                <div className="flex justify-between items-center font-black">
                                  <span className="text-amber-900 dark:text-amber-300">
                                    भाव {h.houseNumber}: {h.rashiNameHi} राशि
                                  </span>

                                  <span className="text-slate-500 font-mono text-[10px]">
                                    स्वामी: {h.lordHi}
                                  </span>
                                </div>

                                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                  {h.significanceHi}
                                </p>
                                {h.planetsHere.length > 0 && (
                                  <div className="pt-1 flex flex-wrap gap-1">
                                    {" "}
                                    {h.planetsHere.map((p, pIdx) => (
                                      <span
                                        key={pIdx}
                                        className="px-2 py-0.5 rounded bg-amber-200/80 dark:bg-slate-800 text-slate-950 dark:text-amber-200 font-bold text-[10px]"
                                      >
                                        {" "}
                                        {p.nameHi} ({p.degreeFormatted})
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}{" "}
                    {/* SUB TAB 2: PLANETS & PANCHANG */}{" "}
                    {activeSubTab === "planets" && (
                      <div className="space-y-6">
                        {" "}
                        {/* Panchang Summary Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-3.5 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700 text-center">
                            <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-400">
                              लग्न (Ascendant)
                            </span>

                            <p className="text-sm sm:text-base font-black text-slate-900 dark:text-amber-100 mt-1">
                              {kundliData.panchang.lagnaRashiHi}
                            </p>

                            <span className="text-[10px] text-slate-500 font-bold">
                              स्वामी: {kundliData.panchang.lagnaRashiLord}
                            </span>
                          </div>

                          <div className="p-3.5 bg-blue-50 dark:bg-slate-800 rounded-2xl border border-blue-200 dark:border-slate-700 text-center">
                            <span className="text-[10px] font-black uppercase text-blue-800 dark:text-blue-400">
                              जन्म राशि (Moon Sign)
                            </span>

                            <p className="text-sm sm:text-base font-black text-slate-900 dark:text-blue-100 mt-1">
                              {kundliData.panchang.chandraRashiHi}
                            </p>

                            <span className="text-[10px] text-slate-500 font-bold">
                              स्वामी: {kundliData.panchang.chandraRashiLord}
                            </span>
                          </div>

                          <div className="p-3.5 bg-purple-50 dark:bg-slate-800 rounded-2xl border border-purple-200 dark:border-slate-700 text-center">
                            <span className="text-[10px] font-black uppercase text-purple-800 dark:text-purple-400">
                              जन्म नक्षत्र (Nakshatra)
                            </span>

                            <p className="text-sm sm:text-base font-black text-slate-900 dark:text-purple-100 mt-1">
                              {kundliData.panchang.nakshatraHi}
                            </p>

                            <span className="text-[10px] text-slate-500 font-bold">
                              चरण: {kundliData.panchang.nakshatraPada} | स्वामी:{" "}
                              {kundliData.panchang.nakshatraLord}
                            </span>
                          </div>

                          <div className="p-3.5 bg-emerald-50 dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-slate-700 text-center">
                            <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-400">
                              सूर्य राशि (Sun Sign)
                            </span>

                            <p className="text-sm sm:text-base font-black text-slate-900 dark:text-emerald-100 mt-1">
                              {kundliData.panchang.suryaRashiHi}
                            </p>

                            <span className="text-[10px] text-slate-500 font-bold">
                              वार: {kundliData.panchang.vaarHi.split(" ")[0]}
                            </span>
                          </div>
                        </div>
                        {/* Detailed Planetary Positions Table */}
                        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-3xl shadow-sm space-y-3">
                          <div className="flex items-center justify-between border-b pb-2 dark:border-slate-700">
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <span>🪐</span>
                              {kundliLang === "en"
                                ? "Planetary Positions (Graha Spasht)"
                                : "नवग्रह स्पष्ट स्थिति (Planetary Longitudes & Dignity)"}
                            </h4>

                            <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">
                              {" "}
                              चित्रापक्षीय �यनांश:{" "}
                              {kundliData.panchang.ayanamsha}
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            {" "}
                            <table className="w-full text-left text-xs">
                              {" "}
                              <thead>
                                {" "}
                                <tr className="border-b dark:border-slate-700 text-slate-500 uppercase text-[10px]">
                                  {" "}
                                  <th className="pb-2">ग्रह (Planet)</th>{" "}
                                  <th className="pb-2">राशि (Sign)</th>{" "}
                                  <th className="pb-2">भाव (House)</th>{" "}
                                  <th className="pb-2">�ंश (Degree)</th>{" "}
                                  <th className="pb-2">नक्षत्र एवं चरण</th>{" "}
                                  <th className="pb-2">नक्षत्र स्वामी</th>{" "}
                                  <th className="pb-2">�वस्था / स्थिति</th>{" "}
                                </tr>{" "}
                              </thead>{" "}
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-medium text-slate-800 dark:text-slate-200">
                                {" "}
                                {kundliData.planets.map((p, idx) => (
                                  <tr
                                    key={idx}
                                    className="hover:bg-amber-50/50 dark:hover:bg-slate-800/60"
                                  >
                                    {" "}
                                    <td className="py-2.5 font-black text-slate-950 dark:text-amber-200 flex items-center gap-1.5">
                                      <span className="text-base">
                                        {p.symbol}
                                      </span>
                                      <span>{p.nameHi}</span>
                                      {p.isRetrograde && (
                                        <span className="text-rose-600 text-[10px] font-black">
                                          [वक्र ℞]
                                        </span>
                                      )}{" "}
                                      {p.isCombust && (
                                        <span className="text-amber-600 text-[10px] font-black">
                                          [�स्त ☀️]
                                        </span>
                                      )}{" "}
                                    </td>{" "}
                                    <td className="py-2.5 font-bold">
                                      {p.rashiNameHi} ({p.rashiNameEn})
                                    </td>{" "}
                                    <td className="py-2.5 font-bold">
                                      भाव {p.house}
                                    </td>{" "}
                                    <td className="py-2.5 font-mono text-[11px]">
                                      {p.degreeFormatted}
                                    </td>{" "}
                                    <td className="py-2.5">
                                      {p.nakshatraHi} (पाद {p.pada})
                                    </td>{" "}
                                    <td className="py-2.5 text-slate-600 dark:text-slate-400">
                                      {p.nakshatraLord}
                                    </td>{" "}
                                    <td className="py-2.5">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-black ${p.dignity === "exalted" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-400" : p.dignity === "own" ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" : p.dignity === "debilitated" ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" : "bg-amber-100/80 text-amber-900 dark:bg-slate-700 dark:text-amber-200"}`}
                                      >
                                        {" "}
                                        {p.statusHi}
                                      </span>
                                    </td>{" "}
                                  </tr>
                                ))}{" "}
                              </tbody>{" "}
                            </table>
                          </div>
                        </div>
                        {/* Panchang Complete Grid */}
                        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-3xl space-y-3">
                          <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b pb-2 dark:border-slate-700">
                            <span>📜</span>
                            {kundliLang === "en"
                              ? "Birth Panchang Details"
                              : "जन्मकालीन पंचांग विवरण"}
                          </h4>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-bold">
                            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                              <span className="text-slate-500">तिथि:</span>

                              <span className="text-slate-950 dark:text-white font-black">
                                {kundliData.panchang.tithiHi}
                              </span>
                            </div>

                            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                              <span className="text-slate-500">करण:</span>

                              <span className="text-slate-950 dark:text-white font-black">
                                {kundliData.panchang.karanHi}
                              </span>
                            </div>

                            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                              <span className="text-slate-500">योग:</span>

                              <span className="text-slate-950 dark:text-white font-black">
                                {kundliData.panchang.yogaHi}
                              </span>
                            </div>

                            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                              <span className="text-slate-500">गण:</span>

                              <span className="text-slate-950 dark:text-white font-black">
                                {kundliData.panchang.ganHi}
                              </span>
                            </div>

                            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                              <span className="text-slate-500">योनि:</span>

                              <span className="text-slate-950 dark:text-white font-black">
                                {kundliData.panchang.yoniHi}
                              </span>
                            </div>

                            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                              <span className="text-slate-500">नाड़ी:</span>

                              <span className="text-slate-950 dark:text-white font-black">
                                {kundliData.panchang.nadiHi}
                              </span>
                            </div>

                            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                              <span className="text-slate-500">वर्ण:</span>

                              <span className="text-slate-950 dark:text-white font-black">
                                {kundliData.panchang.varnaHi}
                              </span>
                            </div>

                            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                              <span className="text-slate-500">वश्य:</span>

                              <span className="text-slate-950 dark:text-white font-black">
                                {kundliData.panchang.vashyaHi}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}{" "}
                    {/* SUB TAB 3: VIMSHOTTARI DASHA TIMELINE */}{" "}
                    {activeSubTab === "dasha" && (
                      <div className="space-y-5">
                        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/20 to-amber-500/15 border-2 border-amber-400 dark:border-amber-600 p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <span className="bg-amber-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              {" "}
                              वर्तमान सक्रिय दशा (Running Dasha)
                            </span>

                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-2xl font-black text-amber-900 dark:text-amber-200">
                                {" "}
                                {
                                  kundliData.vimshottariDasha.currentDasha
                                    .mahadashaHi
                                }{" "}
                                महादशा
                              </span>

                              <span className="text-slate-500">/</span>

                              <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                {" "}
                                {
                                  kundliData.vimshottariDasha.currentDasha
                                    .antardashaHi
                                }{" "}
                                �ंतर्दशा
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                              {" "}
                              समाप्ति तिथि:{" "}
                              {
                                kundliData.vimshottariDasha.currentDasha.endDate
                              }{" "}
                              | जन्मकालीन शेष:{" "}
                              {kundliData.vimshottariDasha.balanceAtBirth}
                            </p>
                          </div>
                        </div>
                        {/* Complete 120-year Dasha Timeline */}
                        <div className="space-y-3">
                          <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <span>⏳</span>
                            {kundliLang === "en"
                              ? "120-Year Vimshottari Mahadasha Sequence"
                              : "120 वर्षीय विंशोत्तरी महादशा एवं �ंतर्दशा चक्र"}
                          </h4>

                          <div className="space-y-3">
                            {" "}
                            {kundliData.vimshottariDasha.timeline.map(
                              (d, idx) => (
                                <div
                                  key={idx}
                                  className={`p-4 rounded-2xl border transition ${d.isCurrent ? "bg-amber-50 dark:bg-slate-800/90 border-2 border-amber-500 shadow-md" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                      <span
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${d.isCurrent ? "bg-amber-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}
                                      >
                                        {" "}
                                        {idx + 1}
                                      </span>

                                      <div>
                                        <p className="font-black text-sm text-slate-900 dark:text-white">
                                          {" "}
                                          {d.planetHi} ({d.planet}) महादशा -{" "}
                                          {d.years} वर्ष
                                        </p>

                                        <p className="text-[11px] text-slate-500 font-mono">
                                          {" "}
                                          {d.startDate} से {d.endDate}
                                        </p>
                                      </div>
                                    </div>
                                    {d.isCurrent && (
                                      <span className="px-3 py-1 bg-amber-200 dark:bg-amber-950 text-amber-950 dark:text-amber-300 text-xs font-black rounded-full animate-pulse">
                                        {" "}
                                        � वर्तमान प्रभावशील
                                      </span>
                                    )}
                                  </div>
                                  {/* Antardashas row */}
                                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5 text-center text-[10px]">
                                    {" "}
                                    {d.antardashas.map((a, aIdx) => (
                                      <div
                                        key={aIdx}
                                        className={`p-1.5 rounded-lg border ${a.isCurrent ? "bg-amber-600 text-white font-black border-amber-700 shadow-xs" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"}`}
                                      >
                                        <p className="font-bold">
                                          {a.planetHi.slice(0, 3)}
                                        </p>

                                        <p className="font-mono text-[8px] opacity-80">
                                          {a.startDate.slice(0, 7)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    )}{" "}
                    {/* SUB TAB 4: DOSHAS, YOGAS & SADE SATI */}{" "}
                    {activeSubTab === "dosha" && (
                      <div className="space-y-6">
                        {" "}
                        {/* Doshas Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {" "}
                          {/* Manglik Analysis */}
                          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-5 rounded-3xl space-y-3">
                            <div className="flex items-center justify-between border-b pb-2.5 dark:border-slate-700">
                              <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <span>🔥</span>
                                मांगलिक दोष विश्लेषण (Manglik Dosha)
                              </h4>

                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${!kundliData.doshasAndYogas.manglik.isManglik ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : kundliData.doshasAndYogas.manglik.parihara ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"}`}
                              >
                                {" "}
                                {!kundliData.doshasAndYogas.manglik.isManglik
                                  ? "✓ मांगलिक नहीं"
                                  : kundliData.doshasAndYogas.manglik.parihara
                                    ? "✓ मांगलिक (स्वतः परिहार)"
                                    : "⚠️ मांगलिक दोष"}
                              </span>
                            </div>

                            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed font-medium">
                              {" "}
                              <p>
                                <strong className="text-slate-900 dark:text-white">
                                  मंगल की स्थिति:
                                </strong>{" "}
                                लग्न चक्र के{" "}
                                {kundliData.doshasAndYogas.manglik.presenceHouses.join(
                                  ", ",
                                )}{" "}
                                भाव में।
                              </p>
                              <p>
                                <strong className="text-slate-900 dark:text-white">
                                  शास्त्र सम्मत परिहार (Cancellation):
                                </strong>{" "}
                                {
                                  kundliData.doshasAndYogas.manglik
                                    .pariharaReasonHi
                                }
                              </p>
                            </div>
                          </div>
                          {/* Kaal Sarp Dosha */}
                          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-5 rounded-3xl space-y-3">
                            <div className="flex items-center justify-between border-b pb-2.5 dark:border-slate-700">
                              <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <span>🐍</span>
                                कालसर्प दोष (Kaal Sarp)
                              </h4>

                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${!kundliData.doshasAndYogas.kaalSarp.hasDosha ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300"}`}
                              >
                                {" "}
                                {!kundliData.doshasAndYogas.kaalSarp.hasDosha
                                  ? "✓ दोष मुक्त"
                                  : kundliData.doshasAndYogas.kaalSarp.typeHi}
                              </span>
                            </div>

                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                              {" "}
                              {kundliData.doshasAndYogas.kaalSarp.descriptionHi}
                            </p>
                          </div>
                          {/* Shani Sade Sati */}
                          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-5 rounded-3xl space-y-3">
                            <div className="flex items-center justify-between border-b pb-2.5 dark:border-slate-700">
                              <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <span>🪐</span>
                                शनि साढ़े साती एवं ढैय्या
                              </h4>

                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                                {" "}
                                {kundliData.doshasAndYogas.sadeSati.phaseHi}
                              </span>
                            </div>

                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                              {" "}
                              {kundliData.doshasAndYogas.sadeSati.impactHi}
                            </p>
                          </div>
                          {/* Gandmool & Pitra Dosha */}
                          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-5 rounded-3xl space-y-3">
                            <div className="flex items-center justify-between border-b pb-2.5 dark:border-slate-700">
                              <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <span>🌿</span>
                                गंडमूल एवं पितृ दोष
                              </h4>

                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${!kundliData.doshasAndYogas.gandmool.hasDosha ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"}`}
                              >
                                {" "}
                                {kundliData.doshasAndYogas.gandmool.hasDosha
                                  ? "गंडमूल जन्म"
                                  : "गंडमूल मुक्त"}
                              </span>
                            </div>

                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                              {" "}
                              {kundliData.doshasAndYogas.gandmool.remedyHi}
                            </p>
                          </div>
                        </div>
                        {/* Auspicious Vedic Yogas */}
                        <div className="bg-white dark:bg-slate-800/80 border-2 border-amber-300 dark:border-amber-700 p-5 rounded-3xl space-y-4">
                          <h4 className="font-black text-base text-amber-900 dark:text-amber-200 flex items-center gap-2 border-b pb-2.5 dark:border-slate-700">
                            <span>👑</span>
                            कुण्डली में विद्यमान प्रमुख राजयोग एवं शुभ योग (
                            {
                              kundliData.doshasAndYogas.auspiciousYogas.length
                            }{" "}
                            योग)
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {" "}
                            {kundliData.doshasAndYogas.auspiciousYogas.map(
                              (y, idx) => (
                                <div
                                  key={idx}
                                  className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-900 border border-amber-300/80 dark:border-slate-800 space-y-1.5"
                                >
                                  <div className="flex items-center justify-between font-black text-sm text-amber-900 dark:text-amber-300">
                                    <span>
                                      ✨ {y.nameHi} ({y.name})
                                    </span>

                                    <span className="text-[10px] px-2 py-0.5 bg-amber-200 text-amber-950 dark:bg-amber-950 dark:text-amber-200 rounded-full font-bold">
                                      राजयोग
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                    {y.descriptionHi}
                                  </p>

                                  <p className="text-xs text-slate-900 dark:text-slate-200 font-bold pt-1">
                                    {y.benefitHi}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    )}{" "}
                    {/* SUB TAB 5: PREDICTIONS */}{" "}
                    {activeSubTab === "predictions" && (
                      <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-amber-700 p-5 rounded-3xl space-y-4 shadow-sm">
                          <h4 className="font-black text-base text-amber-900 dark:text-amber-300 flex items-center gap-2 border-b pb-2.5 dark:border-slate-700">
                            <span>🌟</span>
                            शास्त्र सम्मत जीवन भविष्यफल एवं मार्गदर्शन (Life
                            Predictions)
                          </h4>

                          <div className="space-y-3.5 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                            <div className="p-3.5 bg-amber-50/70 dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-slate-700">
                              <p className="font-black text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-1.5">
                                <span>👤</span>
                                व्यक्तित्व एवं स्वभाव (Personality & Nature):
                              </p>
                              <p>{kundliData.predictions.personalityHi}</p>
                            </div>

                            <div className="p-3.5 bg-emerald-50/70 dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-slate-700">
                              <p className="font-black text-emerald-900 dark:text-emerald-200 mb-1 flex items-center gap-1.5">
                                <span>💼</span>
                                करियर, व्यवसाय एवं धन योग (Career & Wealth):
                              </p>
                              <p>{kundliData.predictions.careerAndWealthHi}</p>
                            </div>

                            <div className="p-3.5 bg-orange-50/70 dark:bg-slate-900 rounded-2xl border border-orange-200 dark:border-slate-700">
                              <p className="font-black text-orange-900 dark:text-orange-200 mb-1 flex items-center gap-1.5">
                                <span>💍</span>
                                विवाह, वैवाहिक जीवन एवं संतान सुख (Marriage &
                                Family):
                              </p>
                              <p>
                                {kundliData.predictions.marriageAndFamilyHi}
                              </p>
                            </div>

                            <div className="p-3.5 bg-blue-50/70 dark:bg-slate-900 rounded-2xl border border-blue-200 dark:border-slate-700">
                              <p className="font-black text-blue-900 dark:text-blue-200 mb-1 flex items-center gap-1.5">
                                <span>🌿</span>
                                स्वास्थ्य एवं जीवन ऊर्जा (Health & Vitality):
                              </p>
                              <p>
                                {kundliData.predictions.healthAndVitalityHi}
                              </p>
                            </div>

                            <div className="p-3.5 bg-indigo-50/70 dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-slate-700">
                              <p className="font-black text-indigo-900 dark:text-indigo-200 mb-1.5 flex items-center gap-1.5">
                                <span>⚡</span>
                                जीवन में क्या करें और क्या न करें (Dos &
                                Don'ts):
                              </p>
                              <ul className="space-y-1 text-xs">
                                {" "}
                                {kundliData.predictions.dosAndDontsHi.map(
                                  (item, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-1.5"
                                    >
                                      <span className="text-indigo-600 font-bold">
                                        •
                                      </span>

                                      <span>{item}</span>
                                    </li>
                                  ),
                                )}{" "}
                              </ul>
                            </div>

                            <div className="p-3.5 bg-purple-50/70 dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-slate-700">
                              <p className="font-black text-purple-900 dark:text-purple-200 mb-1 flex items-center gap-1.5">
                                <span>🔮</span>
                                आगामी वर्ष का गोचर भविष्यफल (Yearly Forecast):
                              </p>
                              <p>{kundliData.predictions.yearlyForecastHi}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}{" "}
                    {/* SUB TAB 6: REMEDIES, GEMSTONES & MANTRAS */}{" "}
                    {activeSubTab === "remedies" && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {" "}
                          {/* Lucky Gemstone & Rudraksha */}
                          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-3xl space-y-3">
                            <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 dark:border-slate-700">
                              <span>💎</span>
                              शुभ रत्न एवं रुद्राक्ष (Auspicious Gems)
                            </h4>

                            <div className="space-y-2 text-xs font-bold">
                              <div className="p-2.5 bg-amber-50 dark:bg-slate-900 rounded-xl border border-amber-200 flex justify-between items-center">
                                <span className="text-slate-600 dark:text-slate-400">
                                  भाग्य रत्न (Lucky Gem):
                                </span>

                                <span className="text-amber-900 dark:text-amber-200 font-black text-sm">
                                  {
                                    kundliData.predictions.favorableFactors
                                      .luckyGemstoneHi
                                  }
                                </span>
                              </div>

                              <div className="p-2.5 bg-amber-50 dark:bg-slate-900 rounded-xl border border-amber-200 flex justify-between items-center">
                                <span className="text-slate-600 dark:text-slate-400">
                                  उपरत्न (Substitute):
                                </span>

                                <span className="text-slate-900 dark:text-white">
                                  {
                                    kundliData.predictions.favorableFactors
                                      .substituteGem
                                  }
                                </span>
                              </div>

                              <div className="p-2.5 bg-amber-50 dark:bg-slate-900 rounded-xl border border-amber-200 flex justify-between items-center">
                                <span className="text-slate-600 dark:text-slate-400">
                                  �नुकूल रुद्राक्ष:
                                </span>

                                <span className="text-amber-900 dark:text-amber-200 font-black">
                                  {
                                    kundliData.predictions.favorableFactors
                                      .luckyRudraksha
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Mantras & Worship */}
                          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-3xl space-y-3">
                            <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 dark:border-slate-700">
                              <span>🪔</span>
                              इष्ट देव एवं वैदिक बीज मन्त्र
                            </h4>

                            <div className="space-y-2 text-xs font-bold">
                              <div className="p-2.5 bg-orange-50 dark:bg-slate-900 rounded-xl border border-orange-200">
                                <span className="text-slate-500 block text-[10px]">
                                  इष्ट देवता:
                                </span>

                                <span className="text-orange-950 dark:text-orange-200 font-black text-sm mt-0.5 block">
                                  {
                                    kundliData.predictions.favorableFactors
                                      .ishtaDevataHi
                                  }
                                </span>
                              </div>

                              <div className="p-2.5 bg-orange-50 dark:bg-slate-900 rounded-xl border border-orange-200">
                                <span className="text-slate-500 block text-[10px]">
                                  ग्रह बीज मन्त्र (नियमित जप):
                                </span>

                                <span className="text-amber-900 dark:text-amber-300 font-mono font-black text-sm mt-0.5 block">
                                  {
                                    kundliData.predictions.favorableFactors
                                      .beejMantra
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Favorable Elements Grid */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-3xl space-y-3">
                          <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 dark:border-slate-700">
                            <span>✨</span>
                            जीवन के शुभ कारक तत्व (Favorable Astrological
                            Elements)
                          </h4>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                              <span className="text-slate-400 block text-[10px]">
                                शुभ रंग (Lucky Colors)
                              </span>

                              <span className="text-slate-950 dark:text-white font-black mt-1 block">
                                {kundliData.predictions.favorableFactors.luckyColors.join(
                                  ", ",
                                )}
                              </span>
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                              <span className="text-slate-400 block text-[10px]">
                                शुभ अंकंक (Lucky Numbers)
                              </span>

                              <span className="text-slate-950 dark:text-white font-black mt-1 block">
                                {kundliData.predictions.favorableFactors.luckyNumbers.join(
                                  ", ",
                                )}
                              </span>
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                              <span className="text-slate-400 block text-[10px]">
                                शुभ दिन (Lucky Days)
                              </span>

                              <span className="text-slate-950 dark:text-white font-black mt-1 block">
                                {kundliData.predictions.favorableFactors.luckyDays.join(
                                  ", ",
                                )}
                              </span>
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                              <span className="text-slate-400 block text-[10px]">
                                शुभ दिशा (Lucky Direction)
                              </span>

                              <span className="text-slate-950 dark:text-white font-black mt-1 block">
                                {
                                  kundliData.predictions.favorableFactors
                                    .luckyDirections
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}{" "}
                    {/* SUB TAB 7: ASHTAKAVARGA */}{" "}
                    {activeSubTab === "ashtakavarga" && (
                      <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-3xl space-y-4">
                          <div className="flex items-center justify-between border-b pb-2 dark:border-slate-700">
                            <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                              <span>📊</span>
                              सर्वाष्टकवर्ग चक्र एवं भाव बल (Sarvashtakavarga
                              Points)
                            </h4>

                            <span className="text-xs font-black text-amber-700 dark:text-amber-400">
                              {" "}
                              कुल बिंदु: {kundliData.ashtakavarga.totalPoints} /
                              337
                            </span>
                          </div>

                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {" "}
                            {kundliData.ashtakavarga.housePoints.map(
                              (pts, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 rounded-2xl bg-amber-50/60 dark:bg-slate-900 border border-amber-200 dark:border-slate-800 text-center"
                                >
                                  <span className="text-[10px] font-bold text-slate-500">
                                    भाव {idx + 1}
                                  </span>

                                  <p className="text-lg font-black text-amber-900 dark:text-amber-200 mt-0.5">
                                    {pts}
                                  </p>

                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${pts >= 28 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950" : "bg-slate-200 text-slate-700"}`}
                                  >
                                    {" "}
                                    {pts >= 28 ? "बलवान (Strong)" : "मध्यम"}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    )}{" "}
                    {/* Astrologer Verification Stamp */}
                    <div className="flex items-center justify-between p-4 bg-amber-50/60 dark:bg-slate-850 rounded-2xl border border-amber-300 dark:border-slate-700 text-xs font-bold">
                      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                        {" "}
                        <Award size={18} className="text-amber-600" />
                        <div>
                          {" "}
                          <p>
                            प्रमाणित वैदिक पंचांग एवं ज्योतिष गणना (Brihat
                            Parashara Compliant)
                          </p>
                          <p className="text-[10px] text-slate-500 font-normal">
                            onediary.in · शुद्ध गणना एवं शास्त्र सम्मत सूत्र
                            2026
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl text-xs font-black shadow-md hover:scale-105 transition cursor-pointer flex items-center gap-1.5"
                      >
                        {" "}
                        <Download size={14} />
                        <span>प्रमाणित कुण्डली PDF डाउनलोड करें</span>
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}{" "}
          {/* TAB 2: 36 GUN MILAN (MATCHMAKING) */}{" "}
          {activeMainTab === "matching" && (
            <>
              {" "}
              {matchStep === "form" ? (
                <form
                  onSubmit={handleGenerateGunMilan}
                  className="space-y-6 max-w-3xl mx-auto py-2"
                >
                  <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-rose-50 dark:from-orange-950/40 dark:via-amber-950/20 dark:to-rose-950/40 border-2 border-orange-300 dark:border-orange-700 p-4 rounded-2xl flex items-center gap-3">
                    <span className="text-3xl">💍</span>

                    <div>
                      <p className="text-xs sm:text-sm text-orange-950 dark:text-orange-200 font-black">
                        {" "}
                        {kundliLang === "en"
                          ? "Vedic Ashta-Koot 36 Guna Milan & Manglik Analysis"
                          : "शास्त्र सम्मत वैदिक 36 �ष्टकूट गुण मिलान"}
                      </p>

                      <p className="text-[11px] text-orange-800 dark:text-orange-300 font-medium">
                        {" "}
                        {kundliLang === "en"
                          ? "Enter exact birth details of both Var (Boy) and Vadhu (Girl). Our engine calculates all 8 Kootas (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi) with classical Parihara remedies."
                          : "वर और वधू दोनों के जन्म का विवरण दर्ज करें। हमारा पंचांग इंजन 8 कूटों (वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट, नाड़ी) के 36 गुणों एवं मांगलिक साम्य की �चूक गणना करेगा।"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {" "}
                    {/* Boy Form */}
                    <div className="bg-blue-50/50 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 p-4 rounded-2xl space-y-3.5">
                      <h4 className="font-black text-sm text-blue-900 dark:text-blue-300 flex items-center gap-2 border-b pb-2 dark:border-slate-700">
                        <span>👦</span>
                        {kundliLang === "en"
                          ? "Boy (Var) Birth Details"
                          : "वर (Boy) का विवरण"}
                      </h4>

                      <div className="space-y-1">
                        {" "}
                        <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase">
                          {" "}
                          {kundliLang === "en"
                            ? "Boy Full Name"
                            : "वर का पूरा नाम"}{" "}
                        </label>{" "}
                        <input
                          type="text"
                          required
                          value={matchingForm.boyName}
                          onChange={(e) =>
                            setMatchingForm({
                              ...matchingForm,
                              boyName: e.target.value,
                            })
                          }
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white"
                          placeholder="राहुल शर्मा"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          {" "}
                          <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase">
                            {" "}
                            {kundliLang === "en"
                              ? "Birth Date"
                              : "जन्म तिथि"}{" "}
                          </label>{" "}
                          <input
                            type="date"
                            required
                            value={matchingForm.boyDob}
                            onChange={(e) =>
                              setMatchingForm({
                                ...matchingForm,
                                boyDob: e.target.value,
                              })
                            }
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          {" "}
                          <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase">
                            {" "}
                            {kundliLang === "en"
                              ? "Birth Time"
                              : "जन्म समय"}{" "}
                          </label>{" "}
                          <input
                            type="time"
                            required
                            value={matchingForm.boyTime}
                            onChange={(e) =>
                              setMatchingForm({
                                ...matchingForm,
                                boyTime: e.target.value,
                              })
                            }
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        {" "}
                        <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase">
                          {" "}
                          {kundliLang === "en"
                            ? "Birth Place"
                            : "जन्म स्थान"}{" "}
                        </label>{" "}
                        <input
                          type="text"
                          required
                          value={matchingForm.boyPlace}
                          onChange={(e) =>
                            setMatchingForm({
                              ...matchingForm,
                              boyPlace: e.target.value,
                            })
                          }
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white"
                          placeholder="दिल्ली"
                        />
                      </div>
                    </div>
                    {/* Girl Form */}
                    <div className="bg-rose-50/50 dark:bg-slate-800/80 border border-rose-200 dark:border-slate-700 p-4 rounded-2xl space-y-3.5">
                      <h4 className="font-black text-sm text-rose-900 dark:text-rose-300 flex items-center gap-2 border-b pb-2 dark:border-slate-700">
                        <span>👧</span>
                        {kundliLang === "en"
                          ? "Girl (Vadhu) Birth Details"
                          : "वधू (Girl) का विवरण"}
                      </h4>

                      <div className="space-y-1">
                        {" "}
                        <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase">
                          {" "}
                          {kundliLang === "en"
                            ? "Girl Full Name"
                            : "वधू का पूरा नाम"}{" "}
                        </label>{" "}
                        <input
                          type="text"
                          required
                          value={matchingForm.girlName}
                          onChange={(e) =>
                            setMatchingForm({
                              ...matchingForm,
                              girlName: e.target.value,
                            })
                          }
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white"
                          placeholder="प्रिया कुमारी"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          {" "}
                          <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase">
                            {" "}
                            {kundliLang === "en"
                              ? "Birth Date"
                              : "जन्म तिथि"}{" "}
                          </label>{" "}
                          <input
                            type="date"
                            required
                            value={matchingForm.girlDob}
                            onChange={(e) =>
                              setMatchingForm({
                                ...matchingForm,
                                girlDob: e.target.value,
                              })
                            }
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          {" "}
                          <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase">
                            {" "}
                            {kundliLang === "en"
                              ? "Birth Time"
                              : "जन्म समय"}{" "}
                          </label>{" "}
                          <input
                            type="time"
                            required
                            value={matchingForm.girlTime}
                            onChange={(e) =>
                              setMatchingForm({
                                ...matchingForm,
                                girlTime: e.target.value,
                              })
                            }
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        {" "}
                        <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase">
                          {" "}
                          {kundliLang === "en"
                            ? "Birth Place"
                            : "जन्म स्थान"}{" "}
                        </label>{" "}
                        <input
                          type="text"
                          required
                          value={matchingForm.girlPlace}
                          onChange={(e) =>
                            setMatchingForm({
                              ...matchingForm,
                              girlPlace: e.target.value,
                            })
                          }
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white"
                          placeholder="वाराणसी"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="w-full py-4 bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-base rounded-2xl shadow-xl transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {" "}
                      {isGenerating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>
                            {kundliLang === "en"
                              ? "Calculating 36 Ashtakoot Gunas..."
                              : "36 �ष्टकूट गुणों एवं नाड़ी दोष की गणना हो रही है..."}
                          </span>
                        </>
                      ) : (
                        <>
                          {" "}
                          <Heart size={19} className="fill-white" />
                          <span>
                            {" "}
                            {isSubscribed
                              ? kundliLang === "en"
                                ? "Calculate 36 Gunas Marriage Match"
                                : "विवाह गुण मिलान देखें (Calculate 36 Gunas)"
                              : kundliLang === "en"
                                ? "⚡ Buy ₹199 Plan to Unlock 36 Guna Match"
                                : "⚡ ₹199 प्लान खरीदें व 36 गुण मिलान देखें"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                matchingData && (
                  <div className="space-y-6">
                    {" "}
                    {/* Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-orange-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-orange-200 dark:border-slate-700">
                      <div>
                        {" "}
                        <h3 className="font-black text-slate-900 dark:text-orange-100 text-base">
                          {" "}
                          💍 {matchingData.boyName} & {matchingData.girlName} -{" "}
                          {kundliLang === "en"
                            ? "Marriage Compatibility"
                            : "विवाह गुण मिलान"}{" "}
                        </h3>
                        <p className="text-xs text-orange-800 dark:text-orange-300 font-semibold mt-0.5">
                          {" "}
                          वर: {matchingData.boyDob} ({matchingData.boyPlace}) |
                          वधू: {matchingData.girlDob} ({matchingData.girlPlace})
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={handleCreateNewMatchmaking}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                        >
                          <span>💍</span>

                          <span>
                            {kundliLang === "en"
                              ? "+ New Match"
                              : "+ नया गुण मिलान"}
                          </span>
                        </button>

                        <button
                          onClick={() => setMatchStep("form")}
                          className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-orange-300 dark:border-slate-600 rounded-xl text-xs font-bold text-orange-900 dark:text-orange-200 hover:bg-orange-100 transition cursor-pointer"
                        >
                          {" "}
                          {kundliLang === "en" ? "✏️ Edit" : "✏️ बदलें"}
                        </button>

                        <button
                          onClick={handlePrint}
                          className="px-3 py-1.5 bg-slate-900 dark:bg-orange-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                          {" "}
                          <Printer size={14} />{" "}
                          {kundliLang === "en"
                            ? "Print Report"
                            : "प्रिंट / PDF"}
                        </button>

                        <button
                          onClick={handleWhatsAppShare}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                          {" "}
                          <Share2 size={14} /> WhatsApp
                        </button>
                      </div>
                    </div>
                    {/* Highlight Score Card */}
                    <div className="bg-gradient-to-br from-amber-500/15 via-orange-500/20 to-red-500/15 border-2 border-orange-400 dark:border-orange-600 p-6 rounded-3xl text-center space-y-3 shadow-md">
                      <span className="bg-orange-600 text-white text-[11px] font-black px-3.5 py-1 rounded-full uppercase tracking-widest shadow-xs">
                        {" "}
                        {kundliLang === "en"
                          ? "Ashtakoot Guna Milan Result"
                          : "�ष्टकूट गुण मिलान परिणाम (36 गुण)"}
                      </span>

                      <div className="flex items-center justify-center gap-2">
                        <span className="text-5xl sm:text-7xl font-black text-slate-950 dark:text-amber-100">
                          {matchingData.totalGunas}
                        </span>

                        <span className="text-2xl sm:text-3xl font-bold text-orange-700 dark:text-orange-400">
                          / 36
                        </span>
                      </div>

                      <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white max-w-xl mx-auto leading-relaxed">
                        {" "}
                        {matchingData.verdictHi}
                      </p>
                    </div>
                    {/* Manglik Compatibility Card */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl space-y-3">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b pb-2 dark:border-slate-700">
                        <span>🔥</span>
                        मांगलिक साम्य विश्लेषण (Manglik Matching)
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            वर ({matchingData.boyName})
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded text-[11px] font-black ${matchingData.boyManglik ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"}`}
                          >
                            {" "}
                            {matchingData.boyManglik
                              ? "मांगलिक"
                              : "मांगलिक नहीं"}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            वधू ({matchingData.girlName})
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded text-[11px] font-black ${matchingData.girlManglik ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"}`}
                          >
                            {" "}
                            {matchingData.girlManglik
                              ? "मांगलिक"
                              : "मांगलिक नहीं"}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {" "}
                        <strong>निष्कर्ष:</strong>{" "}
                        {matchingData.manglikVerdictHi}
                      </p>
                    </div>
                    {/* 8 Ashtakoot Breakdown Detailed Cards */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 sm:p-5 rounded-3xl space-y-4">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b pb-2.5 dark:border-slate-700">
                        <span>📊</span>8 अष्टकूट मिलान विवरणष्टकूट गुण विवरण (8
                        Kootas Detailed Vedic Analysis)
                      </h4>

                      <div className="space-y-2.5">
                        {" "}
                        {matchingData.kootas.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-950 dark:text-amber-200">
                                  {idx + 1}. {item.kootNameHi} ({item.kootName})
                                </span>

                                <span className="text-[10px] text-slate-500 font-medium">
                                  · {item.areaHi}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                                {item.descriptionHi}
                              </p>

                              <p className="text-[10px] text-amber-900 dark:text-amber-400 font-mono">
                                वर: {item.boyAttr} | वधू: {item.girlAttr}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <span
                                className={`text-base font-black ${item.obtainedScore === item.maxScore ? "text-emerald-600 dark:text-emerald-400" : item.obtainedScore > 0 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}
                              >
                                {" "}
                                {item.obtainedScore}
                                <span className="text-xs text-slate-400 font-normal">
                                  / {item.maxScore}
                                </span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              )}{" "}
            </>
          )}
        </div>
        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
            <span>🕉️</span>
            {kundliLang === "en"
              ? "Vedic Astrology Panchang Engine • onediary.in"
              : "शास्त्र सम्मत वैदिक ज्योतिष प्रणाली • onediary.in"}
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-xs font-black transition cursor-pointer"
          >
            {" "}
            {kundliLang === "en" ? "Close" : "बंद करें (Close)"}
          </button>
        </div>
      </div>
      {/* Instant Payment Modal for ₹199 Starter Plan */}
      <InstantPlanPaymentModal
        isOpen={isInstantPaymentOpen}
        onClose={() => setIsInstantPaymentOpen(false)}
        planId="plan_199"
        planName="Starter Plan (5 Labour + Kundli)"
        amount={199}
        workersLimit={5}
      />

      {/* ⚠️ Quota Limit Modal: Customer cannot generate more than 1 Kundli */}
      {showQuotaLimitModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-500 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up text-center">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/80 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-inner border border-amber-300 dark:border-amber-700">
              🔒
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-amber-100">
                {kundliLang === 'en' ? 'Kundli Limit Reached (1/1 Used)' : 'जन्म कुण्डली निर्माण सीमा (1/1 पूर्ण)'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {kundliLang === 'en'
                  ? 'Your account allows generating 1 full Janm Kundli. You have already created 1 Kundli, which is securely saved.'
                  : 'आपके खाते में केवल 1 मुख्य जन्म कुण्डली बनाने की अनुमति है। आपकी 1 कुण्डली पहले से बनी हुई है और सुरक्षित है।'}
              </p>
            </div>

            {savedKundlis.length > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/60 text-left flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-900 dark:text-white">
                    👤 {savedKundlis[0].name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    📅 {savedKundlis[0].dob} · 📍 {savedKundlis[0].place}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuotaLimitModal(false);
                    handleLoadSavedKundli(savedKundlis[0]);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer shadow-xs"
                >
                  {kundliLang === 'en' ? 'Open Kundli' : 'कुण्डली देखें'}
                </button>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowQuotaLimitModal(false);
                  setIsInstantPaymentOpen(true);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>⚡</span> {kundliLang === 'en' ? 'Upgrade Plan (₹199)' : 'VIP प्लान में अपग्रेड करें (₹199)'}
              </button>

              <button
                type="button"
                onClick={() => setShowQuotaLimitModal(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {kundliLang === 'en' ? 'Close' : 'वापस जाएं (Close)'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
