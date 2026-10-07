import React, { useState } from "react";
import { VedicKundliResult, PlanetPosition } from "../utils/vedicAstrology";
import RoyalGoldenKundliPlate from "./RoyalGoldenKundliPlate";

interface VedicKundliChartProps {
  kundli: VedicKundliResult;
  type?: 'lagna' | 'navamsha';
  customerName?: string;
}

export default function VedicKundliChart({ kundli, type = 'lagna', customerName }: VedicKundliChartProps) {
  const [chartStyle, setChartStyle] = useState<'gold' | 'north' | 'south'>('gold');

  const houses = type === 'lagna' ? kundli.lagnaChart.houses : null;
  const navHouses = type === 'navamsha' ? kundli.navamshaChart.houses : null;

  // Short Hindi graha codes for crisp chart display
  const grahaAbbr: Record<string, { hi: string; color: string }> = {
    Sun: { hi: "सू", color: "text-amber-800 dark:text-amber-300 font-black" },
    Moon: { hi: "चं", color: "text-blue-800 dark:text-blue-300 font-black" },
    Mars: { hi: "मं", color: "text-rose-800 dark:text-rose-300 font-black" },
    Mercury: { hi: "बु", color: "text-emerald-800 dark:text-emerald-300 font-black" },
    Jupiter: { hi: "गु", color: "text-yellow-900 dark:text-yellow-300 font-black" },
    Venus: { hi: "शु", color: "text-purple-800 dark:text-purple-300 font-black" },
    Saturn: { hi: "श", color: "text-indigo-900 dark:text-indigo-300 font-black" },
    Rahu: { hi: "रा", color: "text-stone-900 dark:text-slate-200 font-black" },
    Ketu: { hi: "के", color: "text-stone-900 dark:text-slate-200 font-black" }
  };

  // Get planets in a specific house for D1
  const getHousePlanetsD1 = (houseNum: number): PlanetPosition[] => {
    return kundli.planets.filter(p => p.house === houseNum);
  };

  // Get planets in a specific house for D9
  const getHousePlanetsD9 = (houseNum: number): string[] => {
    return navHouses?.find(h => h.houseNumber === houseNum)?.planets || [];
  };

  const getRashiNum = (houseNum: number): number => {
    if (type === 'lagna') {
      const h = houses?.find(item => item.houseNumber === houseNum);
      return h ? h.rashiIndex + 1 : houseNum;
    } else {
      const h = navHouses?.find(item => item.houseNumber === houseNum);
      return h ? h.rashiIndex + 1 : houseNum;
    }
  };

  const renderHousePlanets = (houseNum: number) => {
    if (type === 'lagna') {
      const pls = getHousePlanetsD1(houseNum);
      if (pls.length === 0) return null;
      return (
        <div className="flex flex-wrap items-center justify-center gap-1 max-w-[70px] leading-tight">
          {pls.map((p, idx) => {
            const abbr = grahaAbbr[p.name] || { hi: p.nameHi.slice(0, 2), color: "text-slate-800 font-bold" };
            return (
              <span 
                key={idx} 
                title={`${p.nameHi} (${p.degreeFormatted})`}
                className={`text-[10px] sm:text-[11px] px-1 py-0.2 rounded bg-amber-100/90 dark:bg-slate-800 border border-amber-300/80 dark:border-amber-900/60 ${abbr.color} ${p.isRetrograde ? 'underline' : ''}`}
              >
                {abbr.hi}{p.isRetrograde ? '℞' : ''}{p.isCombust ? '°' : ''}
              </span>
            );
          })}
        </div>
      );
    } else {
      const pls = getHousePlanetsD9(houseNum);
      if (pls.length === 0) return null;
      return (
        <div className="flex flex-wrap items-center justify-center gap-1 max-w-[70px] leading-tight">
          {pls.map((pName, idx) => (
            <span key={idx} className="text-[10px] sm:text-[11px] px-1 py-0.2 rounded bg-amber-100/90 dark:bg-slate-800 font-black text-amber-950 dark:text-amber-200">
              {pName.slice(0, 2)}
            </span>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Chart Title & Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-black text-amber-950 dark:text-amber-300">
            {type === 'lagna' ? '✨ लग्न कुण्डली चक्र (Lagna Chart - D1)' : '🌟 नवमांश कुण्डली चक्र (Navamsha Chart - D9)'}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300">
            {chartStyle === 'gold' ? '👑 रॉयल 3D गोल्ड प्लेट' : chartStyle === 'north' ? 'उत्तर शैली' : 'दक्षिण शैली'}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-amber-100/80 dark:bg-slate-800 p-1 rounded-xl border border-amber-300 dark:border-slate-700 text-xs">
          <button
            onClick={() => setChartStyle('gold')}
            className={`px-2.5 py-1 rounded-lg font-black transition cursor-pointer flex items-center gap-1 ${
              chartStyle === 'gold' ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-amber-200/50'
            }`}
          >
            <span>👑</span>
            <span>रॉयल गोल्ड</span>
          </button>
          <button
            onClick={() => setChartStyle('north')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              chartStyle === 'north' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-amber-200/50'
            }`}
          >
            उत्तर शैली
          </button>
          <button
            onClick={() => setChartStyle('south')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              chartStyle === 'south' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-amber-200/50'
            }`}
          >
            दक्षिण शैली
          </button>
        </div>
      </div>

      {chartStyle === 'gold' ? (
        /* Royal 3D Golden Platelet Design (Exact user request) */
        <RoyalGoldenKundliPlate
          kundli={kundli}
          type={type}
          customerName={customerName || kundli.birthDetails.name}
        />
      ) : chartStyle === 'north' ? (
        /* Classical North Indian Diamond Kundli Chart */
        <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square mx-auto bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-slate-900 dark:via-slate-850 dark:to-amber-950/40 rounded-3xl p-3 border-2 border-amber-500 shadow-xl overflow-hidden">
          
          {/* SVG Frame with Lines */}
          <svg className="w-full h-full" viewBox="0 0 300 300">
            {/* Outer Box */}
            <rect x="2" y="2" width="296" height="296" fill="none" stroke="#d97706" strokeWidth="2.5" />
            
            {/* Diagonals */}
            <line x1="2" y1="2" x2="298" y2="298" stroke="#d97706" strokeWidth="2" />
            <line x1="298" y1="2" x2="2" y2="298" stroke="#d97706" strokeWidth="2" />
            
            {/* Inner Diamond */}
            <polygon points="150,2 298,150 150,298 2,150" fill="none" stroke="#d97706" strokeWidth="2" />
          </svg>

          {/* Absolute Placements for 12 Bhavas */}
          {/* House 1: Top Center Diamond */}
          <div className="absolute top-[18%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
            <span className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-300">
              {getRashiNum(1)}
            </span>
            <span className="text-[9px] font-black uppercase text-amber-700 dark:text-amber-400">लग्न (1)</span>
            {renderHousePlanets(1)}
          </div>

          {/* House 2: Top Left Triangle */}
          <div className="absolute top-[18%] left-[28%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-amber-200">{getRashiNum(2)}</span>
            {renderHousePlanets(2)}
          </div>

          {/* House 3: Top Far-Left Triangle */}
          <div className="absolute top-[28%] left-[18%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-amber-200">{getRashiNum(3)}</span>
            {renderHousePlanets(3)}
          </div>

          {/* House 4: Left Center Diamond */}
          <div className="absolute top-[50%] left-[18%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-amber-200">{getRashiNum(4)}</span>
            <span className="text-[8px] font-bold text-slate-500">(4)</span>
            {renderHousePlanets(4)}
          </div>

          {/* House 5: Bottom Far-Left Triangle */}
          <div className="absolute top-[72%] left-[18%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-amber-200">{getRashiNum(5)}</span>
            {renderHousePlanets(5)}
          </div>

          {/* House 6: Bottom Left Triangle */}
          <div className="absolute top-[82%] left-[28%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-amber-200">{getRashiNum(6)}</span>
            {renderHousePlanets(6)}
          </div>

          {/* House 7: Bottom Center Diamond */}
          <div className="absolute top-[82%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-amber-200">{getRashiNum(7)}</span>
            <span className="text-[8px] font-bold text-slate-500">(7)</span>
            {renderHousePlanets(7)}
          </div>

          {/* House 8: Bottom Right Triangle */}
          <div className="absolute top-[82%] left-[72%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-amber-200">{getRashiNum(8)}</span>
            {renderHousePlanets(8)}
          </div>

          {/* House 9: Bottom Far-Right Triangle */}
          <div className="absolute top-[72%] left-[82%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-amber-200">{getRashiNum(9)}</span>
            {renderHousePlanets(9)}
          </div>

          {/* House 10: Right Center Diamond */}
          <div className="absolute top-[50%] left-[82%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-amber-200">{getRashiNum(10)}</span>
            <span className="text-[8px] font-bold text-slate-500">(10)</span>
            {renderHousePlanets(10)}
          </div>

          {/* House 11: Top Far-Right Triangle */}
          <div className="absolute top-[28%] left-[82%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-amber-200">{getRashiNum(11)}</span>
            {renderHousePlanets(11)}
          </div>

          {/* House 12: Top Right Triangle */}
          <div className="absolute top-[18%] left-[72%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-amber-200">{getRashiNum(12)}</span>
            {renderHousePlanets(12)}
          </div>

          {/* Center Vedic Logo */}
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 dark:opacity-30 text-3xl">
            🕉️
          </div>
        </div>
      ) : (
        /* South Indian Grid Style Kundli Chart */
        <div className="w-full max-w-[340px] sm:max-w-[380px] aspect-square mx-auto grid grid-cols-4 grid-rows-4 gap-1 p-2 bg-amber-50 dark:bg-slate-900 border-2 border-amber-500 rounded-3xl shadow-xl">
          {/* South Indian 12 fixed Rashi Boxes (Pisces to Aquarius clockwise) */}
          {[
            { rashiIdx: 11, label: "मीन (Pisces)" },
            { rashiIdx: 0, label: "मेष (Aries)" },
            { rashiIdx: 1, label: "वृषभ (Taurus)" },
            { rashiIdx: 2, label: "मिथुन (Gemini)" },
            { rashiIdx: 10, label: "कुंभ (Aquarius)" },
            null, null,
            { rashiIdx: 3, label: "कर्क (Cancer)" },
            { rashiIdx: 9, label: "मकर (Capricorn)" },
            null, null,
            { rashiIdx: 4, label: "सिंह (Leo)" },
            { rashiIdx: 8, label: "धनु (Sagittarius)" },
            { rashiIdx: 7, label: "वृश्चिक (Scorpio)" },
            { rashiIdx: 6, label: "तुला (Libra)" },
            { rashiIdx: 5, label: "कन्या (Virgo)" }
          ].map((cell, idx) => {
            if (!cell) {
              if (idx === 5) {
                return (
                  <div key={idx} className="col-span-2 row-span-2 flex flex-col items-center justify-center bg-amber-100/50 dark:bg-slate-800 rounded-2xl border border-amber-300 dark:border-slate-700 text-center p-2">
                    <span className="text-xl">🕉️</span>
                    <span className="text-xs font-black text-amber-900 dark:text-amber-200">
                      {type === 'lagna' ? 'लग्न कुण्डली' : 'नवमांश चक्र'}
                    </span>
                    <span className="text-[10px] text-slate-500">South Indian</span>
                  </div>
                );
              }
              return null;
            }

            const isLagnaRashi = kundli.lagnaChart.houses[0].rashiIndex === cell.rashiIdx;
            const planetsInRashi = kundli.planets.filter(p => p.rashiIndex === cell.rashiIdx);

            return (
              <div key={idx} className="bg-white dark:bg-slate-800 border border-amber-300/80 dark:border-slate-700 rounded-xl p-1 flex flex-col justify-between text-[10px] overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[9px] text-slate-500">{cell.label.split(' ')[0]}</span>
                  {isLagnaRashi && <span className="font-black text-red-600 bg-red-100 dark:bg-red-950 px-1 rounded text-[8px]">लग्न</span>}
                </div>
                <div className="flex flex-wrap gap-0.5 mt-0.5">
                  {planetsInRashi.map((p, pIdx) => (
                    <span key={pIdx} className="px-1 py-0.2 rounded bg-amber-100 dark:bg-slate-700 font-bold text-[9px] text-amber-900 dark:text-amber-200">
                      {p.nameHi.slice(0, 2)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 pt-1 border-t border-amber-200 dark:border-slate-800">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> सू: सूर्य</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> चं: चन्द्र</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> मं: मंगल</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> बु: बुध</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> गु: गुरु</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> शु: शुक्र</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> श: शनि</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500" /> रा/के: राहु-केतु</span>
        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">( ℞ = वक्री, ° = अस्त )</span>
      </div>
    </div>
  );
}
