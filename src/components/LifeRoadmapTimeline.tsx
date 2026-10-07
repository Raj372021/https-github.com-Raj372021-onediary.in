import React, { useState } from 'react';
import { VedicKundliResult, YearlyForecastItem, LifeMilestonePhase } from '../utils/vedicAstrology';

interface LifeRoadmapTimelineProps {
  kundli: VedicKundliResult;
  customerName?: string;
}

type LangMode = 'hi' | 'en' | 'both';
type ActiveSection = 'all' | 'nameanalysis' | 'current' | 'yearly' | 'milestones' | 'guidelines';

export const LifeRoadmapTimeline: React.FC<LifeRoadmapTimelineProps> = ({
  kundli,
  customerName
}) => {
  const [lang, setLang] = useState<LangMode>('both');
  const [activeSection, setActiveSection] = useState<ActiveSection>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  const { birthDetails, predictions, vimshottariDasha, panchang, nameAndNumerology } = kundli;
  const { currentLifeState, yearlyTimeline, lifeMilestones } = predictions;

  const displayName = customerName || birthDetails.name || 'जातक';

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `🔮 *वैदिक जीवन यात्रा एवं वर्ष-वार भविष्यफल रिपोर्ट*\n👤 नाम: ${displayName}\n📅 जन्म: ${birthDetails.dob} (${birthDetails.time})\n📍 स्थान: ${birthDetails.place}\n🌟 लग्न: ${panchang.lagnaRashiHi} | राशि: ${panchang.chandraRashiHi}\n⏳ वर्तमान दशा: ${vimshottariDasha.currentDasha.mahadashaHi} / ${vimshottariDasha.currentDasha.antardashaHi}\n\n👑 *2026 से 2035+ तक का वार्षिक भविष्यफल एवं जीवन चक्र रिपोर्ट तैयार है।*\nDigitDairy वैदिक ज्योतिष केंद्र द्वारा प्रमाणित।`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filteredYears = selectedYear === 'all'
    ? yearlyTimeline
    : yearlyTimeline.filter(y => y.year === selectedYear);

  return (
    <div id="life-roadmap-container" className="space-y-6 text-slate-800 dark:text-slate-100">
      
      {/* Top Banner & Bilingual Controls */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-5 sm:p-7 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-900/40 rounded-full text-xs font-bold text-amber-200 border border-amber-400/30">
              <span>🔮</span>
              <span>वैदिक जीवन यात्रा एवं वर्ष-वार भविष्यफल (Annual Life Roadmap)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>👤</span> {displayName} — जीवन चक्र एवं कालखंड भविष्यफल
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 font-medium">
              जन्म: {birthDetails.dob} • समय: {birthDetails.time} • स्थान: {birthDetails.place} • लग्न: {panchang.lagnaRashiHi} ({panchang.lagnaRashi}) • राशि: {panchang.chandraRashiHi} ({panchang.chandraRashi})
            </p>
          </div>

          {/* Print & Share actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white text-amber-900 hover:bg-amber-50 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>🖨️</span>
              <span>भविष्यफल प्रिंट करें</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>📲</span>
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Language Selection & Section Switcher */}
        <div className="pt-3 border-t border-amber-500/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-2xl border border-white/20">
            <span className="text-xs font-black px-2 text-amber-200">भाषा / Language:</span>
            <button
              onClick={() => setLang('hi')}
              className={`px-3 py-1 text-xs font-black rounded-xl transition cursor-pointer ${
                lang === 'hi' ? 'bg-white text-amber-950 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              🇮🇳 हिंदी
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 text-xs font-black rounded-xl transition cursor-pointer ${
                lang === 'en' ? 'bg-white text-amber-950 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => setLang('both')}
              className={`px-3 py-1 text-xs font-black rounded-xl transition cursor-pointer ${
                lang === 'both' ? 'bg-white text-amber-950 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              🌐 दोनों (Both)
            </button>
          </div>

          {/* Filter sub sections */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'समग्र विवरण (All View)' },
              { id: 'nameanalysis', label: '1. नाम व नामाक्षर (Name Astrogram)' },
              { id: 'current', label: '2. वर्तमान स्थिति (Present)' },
              { id: 'yearly', label: '3. वर्ष-वार (Yearly Timeline)' },
              { id: 'milestones', label: '4. जीवन पड़ाव (Milestones)' },
              { id: 'guidelines', label: '5. नियम व उपाय (Remedies)' }
            ].map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as any)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeSection === sec.id
                    ? 'bg-amber-300 text-amber-950 font-black'
                    : 'bg-black/20 text-white hover:bg-white/10'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 0: VEDIC NAME & NUMEROLOGY ASTROGRAM (NAME-KUNDLI HARMONY) */}
      {(activeSection === 'all' || activeSection === 'nameanalysis') && nameAndNumerology && (
        <div className="bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-700/80 rounded-3xl p-5 sm:p-7 shadow-lg space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-lg font-black shadow-md">
                ✍️
              </span>
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-amber-300">
                  {lang === 'en'
                    ? '1. Vedic Name, Birth Syllables & Numerological Synergy'
                    : '1. वैदिक नाम, जन्म नक्षत्र चरण नामाक्षर एवं नामांक-भाग्यांक विश्लेषण'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'en'
                    ? 'Birth star sound vibration, Root Number (Mulank), Destiny (Bhagyank), Name Number (Namank) & Horoscope resonance'
                    : 'जातक के नाम का कुण्डली के लग्न, राशि, नक्षत्र चरण व ग्रहों के साथ शास्त्रीय तालमेल'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 text-xs font-black rounded-full border border-emerald-300 dark:border-emerald-700">
                ★ {nameAndNumerology.nameCompatibilityScore}% {lang === 'en' ? 'Synergy Score' : 'शुभ सामंजस्य'}
              </span>
            </div>
          </div>

          {/* Name & Numbers Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Birth Syllable */}
            <div className="p-3.5 bg-amber-50 dark:bg-slate-850 rounded-2xl border border-amber-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                जन्म नामाक्षर (Pada Syllable)
              </span>
              <div className="text-xl font-black text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <span>'{nameAndNumerology.janmaNamaakshar}'</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 rounded">
                  चरण {panchang.nakshatraPada}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                {panchang.nakshatraHi} नक्षत्र
              </p>
            </div>

            {/* Root Number (Mulank) */}
            <div className="p-3.5 bg-amber-50 dark:bg-slate-850 rounded-2xl border border-amber-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                मूलांक / जन्मांक (Mulank)
              </span>
              <div className="text-xl font-black text-amber-900 dark:text-amber-300">
                {nameAndNumerology.mulank}
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">
                स्वामी: {nameAndNumerology.mulankLordHi}
              </p>
            </div>

            {/* Destiny Number (Bhagyank) */}
            <div className="p-3.5 bg-amber-50 dark:bg-slate-850 rounded-2xl border border-amber-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                भाग्यांक (Destiny Number)
              </span>
              <div className="text-xl font-black text-amber-900 dark:text-amber-300">
                {nameAndNumerology.bhagyank}
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">
                स्वामी: {nameAndNumerology.bhagyankLordHi}
              </p>
            </div>

            {/* Name Number (Namank) */}
            <div className="p-3.5 bg-amber-50 dark:bg-slate-850 rounded-2xl border border-amber-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                नामांक (Name Vibration)
              </span>
              <div className="text-xl font-black text-indigo-700 dark:text-indigo-300">
                {nameAndNumerology.namank}
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">
                स्वामी: {nameAndNumerology.namankLordHi}
              </p>
            </div>
          </div>

          {/* Nakshatra & Rashi Letters List */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 dark:border-slate-700 pb-2">
              <span className="text-xs font-black text-amber-950 dark:text-amber-200">
                🌟 {lang === 'en' ? 'Auspicious Letters for Name & Business (शास्त्रसम्मत शुभ अक्षर)' : 'कुण्डली सम्मत शुभ नामाक्षर एवं व्यावसायिक नामावली'}
              </span>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                चन्द्र राशि: {panchang.chandraRashiHi} ({panchang.chandraRashiLord})
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">नक्षत्र चरण नामाक्षर:</span>
              {nameAndNumerology.allPadaNamaakshar.map((pad, pIdx) => (
                <span
                  key={pIdx}
                  className={`px-2.5 py-1 text-xs font-black rounded-lg border ${
                    pad === nameAndNumerology.janmaNamaakshar
                      ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                      : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-amber-200 dark:border-slate-600'
                  }`}
                >
                  {pad} {pad === nameAndNumerology.janmaNamaakshar ? '★ (जन्म चरण)' : `(चरण ${pIdx + 1})`}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">राशि सम्मत अन्य नामाक्षर:</span>
              {nameAndNumerology.rashiNamaakshar.map((rak, rIdx) => (
                <span
                  key={rIdx}
                  className="px-2 py-0.5 bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-amber-200 text-xs font-bold rounded-md"
                >
                  {rak}
                </span>
              ))}
            </div>
          </div>

          {/* Deep Name Vibration Assessment */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-850 border border-amber-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[11px] font-black rounded-full uppercase">
                {lang === 'en' ? 'Vibration Verdict' : 'नाम कुण्डली संरेखण निर्णय'}
              </span>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {nameAndNumerology.nameCompatibilityStatusHi}
              </span>
            </div>

            {(lang === 'hi' || lang === 'both') && (
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {nameAndNumerology.nameVibrationAnalysisHi}
              </p>
            )}

            {(lang === 'en' || lang === 'both') && (
              <p className="text-[11px] text-slate-600 dark:text-slate-400 italic leading-relaxed pt-2 border-t border-amber-200/60 dark:border-slate-700">
                {nameAndNumerology.nameVibrationAnalysisEn}
              </p>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: IS SAMAY KYA KAR RAHA HAI - CURRENT STATE & TRANSITS */}
      {(activeSection === 'all' || activeSection === 'current') && (
        <div className="bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700/80 rounded-3xl p-5 sm:p-7 shadow-lg space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-lg font-black shadow-md">
                📍
              </span>
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-amber-300">
                  {lang === 'en'
                    ? '1. Current Life Phase & Active Running Planetary Influences'
                    : '1. वर्तमान स्थिति, सक्रिय दशा एवं गोचर प्रभाव (इस समय जातक का कालखंड)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'en'
                    ? 'Exact energetic state, ongoing Mahadasha-Antardasha triggers, opportunities and challenges'
                    : 'वर्तमान आयु, सक्रिय विंशोत्तरी दशा, अवसर, कार्यक्षेत्र प्रभाव एवं वर्तमान चुनौतियां'}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-xs font-black rounded-full border border-amber-300 dark:border-amber-700 animate-pulse">
              ★ वर्तमान प्रभावशील (Active Now)
            </span>
          </div>

          {/* Native's Age & Phase Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-850 p-4 sm:p-5 rounded-2xl border border-amber-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-600 text-white text-[11px] font-black rounded-full uppercase tracking-wider">
                {lang === 'en' ? 'Life Stage' : 'जीवन कालखंड'}
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                (उम्र: {currentLifeState.age} वर्ष / Age: {currentLifeState.age} Yrs)
              </span>
            </div>
            {(lang === 'hi' || lang === 'both') && (
              <p className="text-sm font-black text-amber-950 dark:text-amber-200 leading-snug">
                {currentLifeState.statusHi}
              </p>
            )}
            {(lang === 'en' || lang === 'both') && (
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 italic">
                {currentLifeState.statusEn}
              </p>
            )}
          </div>

          {/* Dasha & Transit Impact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Running Dasha Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between border-b pb-2 dark:border-slate-700">
                <span className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>⏳</span> {lang === 'en' ? 'Active Dasha Trigger' : 'सक्रिय महादशा व अंतर्दशा प्रभाव'}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-200 rounded-md">
                  {vimshottariDasha.currentDasha.mahadashaHi} / {vimshottariDasha.currentDasha.antardashaHi}
                </span>
              </div>
              {(lang === 'hi' || lang === 'both') && (
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {currentLifeState.runningDashaInfluenceHi}
                </p>
              )}
              {(lang === 'en' || lang === 'both') && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 italic leading-relaxed pt-1 border-t border-slate-200 dark:border-slate-700">
                  {currentLifeState.runningDashaInfluenceEn}
                </p>
              )}
            </div>

            {/* Planetary Transits Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between border-b pb-2 dark:border-slate-700">
                <span className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>🪐</span> {lang === 'en' ? 'Current Planetary Transits' : 'वर्तमान गोचर स्थिति (गुरु व शनि प्रभाव)'}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 rounded-md">
                  गोचर फल
                </span>
              </div>
              {(lang === 'hi' || lang === 'both') && (
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {currentLifeState.planetaryTransitsHi}
                </p>
              )}
              {(lang === 'en' || lang === 'both') && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 italic leading-relaxed pt-1 border-t border-slate-200 dark:border-slate-700">
                  {currentLifeState.planetaryTransitsEn}
                </p>
              )}
            </div>
          </div>

          {/* Current Opportunities vs Caution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Opportunities */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700/80 space-y-2">
              <h4 className="font-black text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 border-b border-emerald-200 dark:border-slate-700 pb-1.5">
                <span>🚀</span> {lang === 'en' ? 'Immediate Opportunities (इस समय के मुख्य अवसर)' : 'वर्तमान समय के सुनहरे अवसर व संभावनाएं'}
              </h4>
              <ul className="space-y-1.5 text-xs text-emerald-950 dark:text-slate-200 font-medium">
                {currentLifeState.currentOpportunitiesHi.map((op, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-black">✓</span>
                    <div>
                      {(lang === 'hi' || lang === 'both') && <span>{op}</span>}
                      {(lang === 'en' || lang === 'both') && (
                        <span className="block text-[11px] text-emerald-800 dark:text-emerald-400 italic mt-0.5">
                          {currentLifeState.currentOpportunitiesEn[idx]}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cautions */}
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-slate-800 border border-rose-300 dark:border-rose-700/80 space-y-2">
              <h4 className="font-black text-xs text-rose-900 dark:text-rose-300 flex items-center gap-1.5 border-b border-rose-200 dark:border-slate-700 pb-1.5">
                <span>⚠️</span> {lang === 'en' ? 'Current Caution Areas (वर्तमान सावधानियां)' : 'इस समय क्या न करें और किन बातों से बचें'}
              </h4>
              <ul className="space-y-1.5 text-xs text-rose-950 dark:text-slate-200 font-medium">
                {currentLifeState.currentChallengesHi.map((ch, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-black">!</span>
                    <div>
                      {(lang === 'hi' || lang === 'both') && <span>{ch}</span>}
                      {(lang === 'en' || lang === 'both') && (
                        <span className="block text-[11px] text-rose-800 dark:text-rose-400 italic mt-0.5">
                          {currentLifeState.currentChallengesEn[idx]}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: AAGE KYA KAREGA - YEAR BY YEAR TIMELINE (2026 TO 2035) */}
      {(activeSection === 'all' || activeSection === 'yearly') && (
        <div className="bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700/80 rounded-3xl p-5 sm:p-7 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-orange-600 text-white flex items-center justify-center text-lg font-black shadow-md">
                📅
              </span>
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-amber-300">
                  {lang === 'en'
                    ? '2. Year-by-Year Chronological Life Roadmap (2026 — 2035+)'
                    : '2. वर्ष-वार भविष्यफल एवं कार्ययोजना (आगे कौन से वर्ष में क्या-क्या होगा)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'en'
                    ? 'Detailed annual breakdown for Career, Wealth, Property, Marriage, Family, and Remedies'
                    : 'प्रत्येक वर्ष की आयु, सक्रिय अंतर्दशा, आजीविका, धन, भूमि-वाहन, परिवार व शास्त्रीय उपाय'}
                </p>
              </div>
            </div>

            {/* Year quick buttons */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedYear('all')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  selectedYear === 'all'
                    ? 'bg-amber-600 text-white font-black'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100'
                }`}
              >
                सभी वर्ष
              </button>
              {yearlyTimeline.map(y => (
                <button
                  key={y.year}
                  onClick={() => setSelectedYear(y.year)}
                  className={`px-2 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    selectedYear === y.year
                      ? 'bg-amber-600 text-white font-black'
                      : y.year === 2030
                      ? 'bg-amber-200 dark:bg-amber-950 text-amber-950 dark:text-amber-200 border border-amber-400 font-black'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100'
                  }`}
                >
                  {y.year} {y.year === 2030 ? '👑' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Cards for each year */}
          <div className="space-y-6">
            {filteredYears.map(item => (
              <div
                key={item.year}
                className={`rounded-3xl border-2 transition p-5 sm:p-6 space-y-4 ${
                  item.year === 2030
                    ? 'bg-gradient-to-br from-amber-50 via-yellow-50/70 to-amber-100/50 dark:from-slate-850 dark:to-slate-900 border-amber-400 dark:border-amber-500 shadow-xl ring-2 ring-amber-300/60'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 shadow-md'
                }`}
              >
                {/* Year Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className={`px-3.5 py-1.5 rounded-2xl text-white font-black text-sm sm:text-base flex items-center gap-1.5 shadow-md ${
                      item.year === 2030
                        ? 'bg-gradient-to-r from-amber-600 to-yellow-600'
                        : 'bg-slate-900 dark:bg-slate-750'
                    }`}>
                      <span>📅</span>
                      <span>वर्ष {item.year}</span>
                      <span className="text-amber-200 text-xs font-semibold">({item.age} वर्ष की उम्र)</span>
                    </div>

                    <div>
                      {(lang === 'hi' || lang === 'both') && (
                        <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-amber-200">
                          {item.themeHi}
                        </h4>
                      )}
                      {(lang === 'en' || lang === 'both') && (
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 italic">
                          {item.themeEn}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Rating & Active Dasha Badge */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-xs font-black rounded-xl border border-amber-300">
                      {item.activeDashaHi}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black rounded-xl">
                      ★ {item.favorableScore}% शुभता
                    </span>
                  </div>
                </div>

                {/* 4 Thematic Blocks: Career, Finance/Property, Marriage/Family, Health */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Career & Business Block */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-slate-900/80 border border-amber-200/80 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-900 dark:text-amber-300 border-b border-amber-200/60 dark:border-slate-700 pb-1">
                      <span>💼</span>
                      <span>{lang === 'en' ? 'Career & Business Activities' : 'कैरियर, नौकरी व व्यावसायिक गतिविधियां'}</span>
                    </div>
                    {(lang === 'hi' || lang === 'both') && (
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        {item.careerHi}
                      </p>
                    )}
                    {(lang === 'en' || lang === 'both') && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic leading-relaxed pt-1">
                        {item.careerEn}
                      </p>
                    )}
                  </div>

                  {/* Finance & Real Estate / Assets Block */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-slate-900/80 border border-emerald-200/80 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-300 border-b border-emerald-200/60 dark:border-slate-700 pb-1">
                      <span>💰</span>
                      <span>{lang === 'en' ? 'Wealth, Property & Assets' : 'धन लाभ, भूमि, मकान व वाहन प्राप्ति योग'}</span>
                    </div>
                    {(lang === 'hi' || lang === 'both') && (
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        {item.financeHi}
                      </p>
                    )}
                    {(lang === 'en' || lang === 'both') && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic leading-relaxed pt-1">
                        {item.financeEn}
                      </p>
                    )}
                  </div>

                  {/* Family, Marriage & Relationships */}
                  <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-slate-900/80 border border-orange-200/80 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-black text-orange-900 dark:text-orange-300 border-b border-orange-200/60 dark:border-slate-700 pb-1">
                      <span>💍</span>
                      <span>{lang === 'en' ? 'Family, Matrimony & Children' : 'दांपत्य, पारिवारिक सुख व संतान पक्ष'}</span>
                    </div>
                    {(lang === 'hi' || lang === 'both') && (
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        {item.familyMarriageHi}
                      </p>
                    )}
                    {(lang === 'en' || lang === 'both') && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic leading-relaxed pt-1">
                        {item.familyMarriageEn}
                      </p>
                    )}
                  </div>

                  {/* Health & Vitality Block */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-slate-900/80 border border-blue-200/80 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-black text-blue-900 dark:text-blue-300 border-b border-blue-200/60 dark:border-slate-700 pb-1">
                      <span>🌿</span>
                      <span>{lang === 'en' ? 'Health & Energy' : 'स्वास्थ्य, जीवन ऊर्जा व सावधानियां'}</span>
                    </div>
                    {(lang === 'hi' || lang === 'both') && (
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        {item.healthHi}
                      </p>
                    )}
                    {(lang === 'en' || lang === 'both') && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic leading-relaxed pt-1">
                        {item.healthEn}
                      </p>
                    )}
                  </div>
                </div>

                {/* Annual Remedy & Action Step */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 flex items-start gap-2.5">
                  <span className="text-indigo-600 dark:text-indigo-400 text-base">🎯</span>
                  <div className="space-y-0.5 text-xs">
                    <span className="font-black text-indigo-950 dark:text-indigo-200">
                      {lang === 'en' ? 'Annual Astrological Remedy & Guidance:' : 'वर्ष का विशेष शास्त्रीय उपाय व सफलता सूत्र:'}
                    </span>
                    {(lang === 'hi' || lang === 'both') && (
                      <p className="text-slate-800 dark:text-slate-300 font-medium">{item.remedyHi}</p>
                    )}
                    {(lang === 'en' || lang === 'both') && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">{item.remedyEn}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: LIFE MILESTONES & FORTUNE PEAKS */}
      {(activeSection === 'all' || activeSection === 'milestones') && (
        <div className="bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700/80 rounded-3xl p-5 sm:p-7 shadow-lg space-y-6">
          <div className="flex items-center gap-2.5 border-b border-amber-200 dark:border-slate-800 pb-3">
            <span className="w-9 h-9 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-lg font-black shadow-md">
              🏆
            </span>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-amber-300">
                {lang === 'en'
                  ? '3. Major Life Milestones & Golden Fortune Periods (जीवन के प्रमुख पड़ाव)'
                  : '3. जीवन के 5 प्रमुख महा-पड़ाव एवं स्वर्ण भाग्योदय कालखंड'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'en'
                  ? 'Strategic age phases from career founding to ultimate wealth, empire, and spiritual contentment'
                  : 'युवावस्था से लेकर परिपक्वता, सर्वोच्च भाग्योदय वर्ष एवं स्थाई संपत्ति निर्माण के चरण'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {lifeMilestones.map((ms, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-3xl border-2 transition space-y-3 ${
                  ms.goldenPeriod
                    ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/60 dark:from-slate-850 dark:to-slate-900 border-amber-400 dark:border-amber-500 shadow-xl'
                    : 'bg-slate-50/70 dark:bg-slate-850 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                      ms.goldenPeriod ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                        {lang === 'en' ? ms.phaseTitleEn : ms.phaseTitleHi}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {ms.ageRange} • {ms.yearsSpan}
                      </p>
                    </div>
                  </div>

                  {ms.goldenPeriod && (
                    <span className="px-3 py-1 bg-amber-500 text-white text-xs font-black rounded-full shadow-sm animate-bounce">
                      👑 सर्वोच्च भाग्योदय काल (Golden Period)
                    </span>
                  )}
                </div>

                {(lang === 'hi' || lang === 'both') && (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {ms.significanceHi}
                  </p>
                )}
                {(lang === 'en' || lang === 'both') && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed pt-1">
                    {ms.significanceEn}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700">
                  <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider block mb-1.5">
                    {lang === 'en' ? 'Key Milestones Achieved in this Phase:' : 'इस कालखंड में प्राप्त होने वाली प्रमुख सिद्धियां:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {ms.keyAchievementsHi.map((ach, aIdx) => (
                      <div key={aIdx} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-1.5 font-medium">
                        <span className="text-amber-600 font-bold">★</span>
                        <span>{lang === 'en' ? ms.keyAchievementsEn[aIdx] : ach}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: REMEDIES, AUSPICIOUS FACTORS & GUIDELINES */}
      {(activeSection === 'all' || activeSection === 'guidelines') && (
        <div className="bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700/80 rounded-3xl p-5 sm:p-7 shadow-lg space-y-6">
          <div className="flex items-center gap-2.5 border-b border-amber-200 dark:border-slate-800 pb-3">
            <span className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-md">
              💎
            </span>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-amber-300">
                {lang === 'en'
                  ? '4. Astrological Guidelines, Favorable Factors & Vedic Remedies'
                  : '4. शास्त्रीय नियम, शुभ कारक तत्व एवं वैदिक महा-उपाय'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'en'
                  ? 'Gemstone recommendations, sacred mantras, lucky colors, numbers, and lifelong dos & don’ts'
                  : 'भाग्य रत्न, रुद्राक्ष, इष्ट देव, बीज मंत्र एवं जीवन में क्या करें और क्या न करें'}
              </p>
            </div>
          </div>

          {/* Favorable Factors Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-500 dark:text-slate-400 font-bold">भाग्य रत्न:</span>
              <p className="font-black text-sm text-amber-900 dark:text-amber-300">{predictions.favorableFactors.luckyGemstoneHi}</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-500 dark:text-slate-400 font-bold">अनुकूल रुद्राक्ष:</span>
              <p className="font-black text-sm text-amber-900 dark:text-amber-300">{predictions.favorableFactors.luckyRudraksha}</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-500 dark:text-slate-400 font-bold">इष्ट देव:</span>
              <p className="font-black text-xs text-slate-900 dark:text-white leading-tight">{predictions.favorableFactors.ishtaDevataHi}</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-500 dark:text-slate-400 font-bold">सिद्ध बीज मंत्र:</span>
              <p className="font-black text-xs text-indigo-700 dark:text-indigo-300 font-mono">{predictions.favorableFactors.beejMantra}</p>
            </div>
          </div>

          {/* Dos and Don'ts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Dos */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 space-y-2">
              <h4 className="font-black text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 border-b pb-1.5 dark:border-slate-700">
                <span>✓</span> {lang === 'en' ? 'Mandatory Lifelong Guidelines (क्या करें)' : 'सफलता हेतु नित्य आचरण (क्या करें)'}
              </h4>
              <ul className="space-y-1.5 text-xs text-emerald-950 dark:text-slate-200 font-medium">
                {predictions.dosAndDontsHi.slice(0, 3).map((d, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Don'ts */}
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-slate-800 border border-rose-200 dark:border-slate-700 space-y-2">
              <h4 className="font-black text-xs text-rose-900 dark:text-rose-300 flex items-center gap-1.5 border-b pb-1.5 dark:border-slate-700">
                <span>✕</span> {lang === 'en' ? 'Strict Prohibitions (क्या न करें)' : 'हानि से बचने हेतु निषेध (क्या न करें)'}
              </h4>
              <ul className="space-y-1.5 text-xs text-rose-950 dark:text-slate-200 font-medium">
                {predictions.dosAndDontsHi.slice(3).map((d, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Footer watermark & authentication stamp */}
      <div className="text-center text-xs text-slate-400 py-3 border-t border-slate-200 dark:border-slate-800">
        <p>DigitDairy वैदिक ज्योतिष केंद्र • प्रामाणिक लाहिड़ी अयनांश एवं पराशर सिद्धांत पर आधारित पूर्ण जीवन भविष्यफल</p>
      </div>
    </div>
  );
};
