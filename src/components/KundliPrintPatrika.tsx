import React from "react";
import { VedicKundliResult, PlanetPosition } from "../utils/vedicAstrology";

interface KundliPrintPatrikaProps {
  kundliData: VedicKundliResult | null;
  matchingData: any | null;
  activeMainTab: "single" | "matching";
  kundliLang: string;
}

export default function KundliPrintPatrika({
  kundliData,
  matchingData,
  activeMainTab,
  kundliLang,
}: KundliPrintPatrikaProps) {
  if (activeMainTab === "single" && !kundliData) return null;
  if (activeMainTab === "matching" && !matchingData) return null;

  // Short Hindi graha codes for print chart
  const grahaAbbrHi: Record<string, string> = {
    Sun: "सूर्य",
    Moon: "चंद्र",
    Mars: "मंगल",
    Mercury: "बुध",
    Jupiter: "गुरु",
    Venus: "शुक्र",
    Saturn: "शनि",
    Rahu: "राहु",
    Ketu: "केतु",
  };

  const grahaShortHi: Record<string, string> = {
    Sun: "सू",
    Moon: "चं",
    Mars: "मं",
    Mercury: "बु",
    Jupiter: "गु",
    Venus: "शु",
    Saturn: "श",
    Rahu: "रा",
    Ketu: "के",
  };

  // House positions for North Indian Diamond Chart (x, y coordinates for SVG text)
  const houseCoords = [
    { house: 1, rashiX: 150, rashiY: 65, planetsX: 150, planetsY: 95 },   // Top Center Diamond
    { house: 2, rashiX: 85, rashiY: 35, planetsX: 75, planetsY: 55 },    // Top Left Triangle
    { house: 3, rashiX: 35, rashiY: 85, planetsX: 55, planetsY: 105 },   // Far Left Top Triangle
    { house: 4, rashiX: 65, rashiY: 150, planetsX: 90, planetsY: 155 },  // Left Center Diamond
    { house: 5, rashiX: 35, rashiY: 215, planetsX: 55, planetsY: 235 },  // Far Left Bottom
    { house: 6, rashiX: 85, rashiY: 265, planetsX: 75, planetsY: 280 },  // Bottom Left
    { house: 7, rashiX: 150, rashiY: 235, planetsX: 150, planetsY: 205 },// Bottom Center Diamond
    { house: 8, rashiX: 215, rashiY: 265, planetsX: 225, planetsY: 280 },// Bottom Right
    { house: 9, rashiX: 265, rashiY: 215, planetsX: 245, planetsY: 235 },// Far Right Bottom
    { house: 10, rashiX: 235, rashiY: 150, planetsX: 210, planetsY: 155 },// Right Center Diamond
    { house: 11, rashiX: 265, rashiY: 85, planetsX: 245, planetsY: 105 },// Far Right Top
    { house: 12, rashiX: 215, rashiY: 35, planetsX: 225, planetsY: 55 }, // Top Right
  ];

  // Render SVG Kundli Chart for D1 or D9
  const renderSvgChart = (chartType: "lagna" | "navamsha") => {
    if (!kundliData) return null;
    const houses = chartType === "lagna" ? kundliData.lagnaChart.houses : kundliData.navamshaChart.houses;

    return (
      <div className="w-full max-w-[320px] mx-auto bg-[#fffdf5] border-2 border-amber-600 rounded-2xl p-2 shadow-xs">
        <div className="text-center font-black text-xs text-amber-900 mb-1 border-b border-amber-300 pb-0.5">
          {chartType === "lagna" ? "✨ लग्न कुण्डली (D1 Chart)" : "🌟 नवमांश कुण्डली (D9 Chart)"}
        </div>
        <svg viewBox="0 0 300 300" className="w-full h-auto">
          {/* Background */}
          <rect x="2" y="2" width="296" height="296" fill="#fffdf2" stroke="#b8860b" strokeWidth="3" />
          
          {/* Diagonals */}
          <line x1="2" y1="2" x2="298" y2="298" stroke="#b8860b" strokeWidth="2" />
          <line x1="298" y1="2" x2="2" y2="298" stroke="#b8860b" strokeWidth="2" />
          
          {/* Inner Diamond */}
          <polygon points="150,2 298,150 150,298 2,150" fill="none" stroke="#b8860b" strokeWidth="2" />

          {/* Central Om watermark */}
          <text x="150" y="160" textAnchor="middle" fontSize="32" fill="#e5c158" opacity="0.35" fontWeight="bold">
            🕉️
          </text>

          {/* House Numbers & Planets */}
          {houseCoords.map((hc) => {
            const houseObj = houses.find((h) => h.houseNumber === hc.house);
            const rashiNum = houseObj ? houseObj.rashiIndex + 1 : hc.house;

            // Planets in this house
            let planetsInHouse: string[] = [];
            if (chartType === "lagna") {
              planetsInHouse = kundliData.planets
                .filter((p) => p.house === hc.house)
                .map((p) => `${grahaShortHi[p.name] || p.nameHi.slice(0, 2)}${p.isRetrograde ? "℞" : ""}`);
            } else {
              const hD9 = kundliData.navamshaChart.houses.find((h) => h.houseNumber === hc.house);
              if (hD9 && hD9.planets) {
                planetsInHouse = hD9.planets.map((pName) => grahaShortHi[pName] || pName.slice(0, 2));
              }
            }

            return (
              <g key={hc.house}>
                {/* Rashi Index Number */}
                <text
                  x={hc.rashiX}
                  y={hc.rashiY}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#78350f"
                >
                  {rashiNum}
                </text>

                {/* Planets text */}
                {planetsInHouse.length > 0 && (
                  <text
                    x={hc.planetsX}
                    y={hc.planetsY}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="900"
                    fill="#991b1b"
                  >
                    {planetsInHouse.join(" ")}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div
      id="kundli-certificate-print-area"
      className="hidden print:block w-full max-w-[210mm] mx-auto p-4 sm:p-6 bg-[#fffdf5] text-amber-950 font-serif leading-relaxed border-8 border-amber-600 outline outline-4 outline-amber-800 rounded-xl shadow-2xl my-4"
      style={{
        WebkitPrintColorAdjust: "exact",
        colorAdjust: "exact",
      }}
    >
      {/* 1. SINGLE KUNDLI REPORT */}
      {activeMainTab === "single" && kundliData && (
        <div className="space-y-4">
          {/* Auspicious Header */}
          <div className="text-center border-b-2 border-amber-600 pb-3 bg-amber-50/80 p-3 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between text-amber-800 font-black text-sm px-4">
              <span>🕉️ 卐 🚩</span>
              <span className="text-base tracking-widest uppercase">॥ श्री गणेशाय नमः ॥</span>
              <span>🚩 卐 🕉️</span>
            </div>
            
            <h1 className="text-2xl font-black text-amber-900 mt-1 tracking-tight">
              शास्त्र सम्मत प्रमाणित जन्म कुण्डली पत्रिका
            </h1>
            <p className="text-xs text-amber-800 font-bold tracking-wide mt-0.5">
              बृहत्पाराशर होरा शास्त्र एवं सिद्धान्त ज्योतिषीय गणना · onediary.in
            </p>
          </div>

          {/* Birth Details Table */}
          <div className="border-2 border-amber-600 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="bg-amber-600 text-white font-black text-xs px-3 py-1 uppercase tracking-wider">
              📋 जातक जन्म विवरण (Birth Details)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 text-xs">
              <div>
                <span className="font-bold text-amber-800">नाम:</span>{" "}
                <span className="font-black text-slate-900">{kundliData.birthDetails.name}</span>
              </div>
              <div>
                <span className="font-bold text-amber-800">जन्म तिथि:</span>{" "}
                <span className="font-bold text-slate-900">{kundliData.birthDetails.dob}</span>
              </div>
              <div>
                <span className="font-bold text-amber-800">जन्म समय:</span>{" "}
                <span className="font-bold text-slate-900">{kundliData.birthDetails.time}</span>
              </div>
              <div>
                <span className="font-bold text-amber-800">जन्म स्थान:</span>{" "}
                <span className="font-bold text-slate-900">{kundliData.birthDetails.place}</span>
              </div>
              <div>
                <span className="font-bold text-amber-800">जन्म लग्न:</span>{" "}
                <span className="font-black text-amber-900">{kundliData.panchang.lagnaRashiHi}</span>
              </div>
              <div>
                <span className="font-bold text-amber-800">जन्म राशि:</span>{" "}
                <span className="font-black text-amber-900">{kundliData.panchang.chandraRashiHi}</span>
              </div>
              <div>
                <span className="font-bold text-amber-800">नक्षत्र:</span>{" "}
                <span className="font-bold text-slate-900">{kundliData.panchang.nakshatraHi} (चरण {kundliData.panchang.nakshatraPada})</span>
              </div>
              <div>
                <span className="font-bold text-amber-800">मांगलिक स्थिति:</span>{" "}
                <span className={`font-black ${kundliData.doshasAndYogas.manglik.isManglik ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {kundliData.doshasAndYogas.manglik.isManglik ? (kundliData.doshasAndYogas.manglik.parihara ? 'मांगलिक (परिहार सम्मत)' : 'मांगलिक') : 'मांगलिक नहीं'}
                </span>
              </div>
            </div>
          </div>

          {/* Charts Side-by-Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderSvgChart("lagna")}
            {renderSvgChart("navamsha")}
          </div>

          {/* Planets Table */}
          <div className="border-2 border-amber-600 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="bg-amber-600 text-white font-black text-xs px-3 py-1 uppercase tracking-wider">
              🪐 नवग्रह स्पष्ट स्थिति सारणी (Planetary Positions)
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-amber-100 text-amber-900 border-b border-amber-300 font-black">
                  <th className="p-1.5 border-r border-amber-200">ग्रह</th>
                  <th className="p-1.5 border-r border-amber-200">राशि</th>
                  <th className="p-1.5 border-r border-amber-200">अंश</th>
                  <th className="p-1.5 border-r border-amber-200">भाव</th>
                  <th className="p-1.5 border-r border-amber-200">नक्षत्र</th>
                  <th className="p-1.5 border-r border-amber-200">गति</th>
                  <th className="p-1.5">स्थिति/बल</th>
                </tr>
              </thead>
              <tbody>
                {kundliData.planets.map((p, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-amber-50/50"}>
                    <td className="p-1.5 border-r border-amber-200 font-black text-amber-900">{p.nameHi}</td>
                    <td className="p-1.5 border-r border-amber-200 font-bold">{p.rashiNameHi}</td>
                    <td className="p-1.5 border-r border-amber-200 font-mono">{p.degreeFormatted}</td>
                    <td className="p-1.5 border-r border-amber-200 font-bold text-center">{p.house}</td>
                    <td className="p-1.5 border-r border-amber-200">{p.nakshatraHi} ({p.pada})</td>
                    <td className="p-1.5 border-r border-amber-200 font-bold">{p.isRetrograde ? "वक्री ℞" : "मार्गी"}</td>
                    <td className="p-1.5 font-bold text-amber-800">{p.statusHi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vimshottari Dasha & Predictions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dasha Box */}
            <div className="border-2 border-amber-600 rounded-xl p-3 bg-white space-y-1.5">
              <h3 className="font-black text-xs text-amber-900 border-b border-amber-200 pb-1 uppercase tracking-wider">
                🔮 विंशोत्तरी महादशा (Vimshottari Dasha)
              </h3>
              <div className="text-xs space-y-1">
                <div>
                  <span className="font-bold text-amber-800">वर्तमान महादशा:</span>{" "}
                  <span className="font-black text-amber-950">
                    {kundliData.vimshottariDasha.currentDasha.mahadashaHi} / {kundliData.vimshottariDasha.currentDasha.antardashaHi}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  समाप्ति तिथि: {kundliData.vimshottariDasha.currentDasha.endDate}
                </div>
              </div>
            </div>

            {/* Favorable Factors & Remedies */}
            <div className="border-2 border-amber-600 rounded-xl p-3 bg-white space-y-1.5">
              <h3 className="font-black text-xs text-amber-900 border-b border-amber-200 pb-1 uppercase tracking-wider">
                💎 शुभ तत्व एवं शास्त्रोक्त उपाय
              </h3>
              <div className="text-xs grid grid-cols-2 gap-1">
                <div>
                  <span className="font-bold text-amber-800">शुभ रत्न:</span>{" "}
                  <span className="font-black text-amber-900">{kundliData.predictions.favorableFactors.luckyGemstoneHi}</span>
                </div>
                <div>
                  <span className="font-bold text-amber-800">शुभ अंक:</span>{" "}
                  <span className="font-black text-amber-900">{kundliData.predictions.favorableFactors.luckyNumbers?.join(", ")}</span>
                </div>
                <div>
                  <span className="font-bold text-amber-800">इष्ट देव:</span>{" "}
                  <span className="font-black text-amber-900">{kundliData.predictions.favorableFactors.ishtaDevataHi}</span>
                </div>
                <div>
                  <span className="font-bold text-amber-800">रुद्राक्ष:</span>{" "}
                  <span className="font-black text-amber-900">{kundliData.predictions.favorableFactors.luckyRudraksha}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Seal */}
          <div className="border-t-2 border-amber-600 pt-3 text-center flex items-center justify-between text-xs text-amber-900">
            <div>
              <p className="font-bold">प्रमाणित वैदिक ज्योतिष संस्थान</p>
              <p className="text-[10px] text-amber-800">onediary.in · शुद्ध पंचांग व कुण्डली</p>
            </div>
            <div className="w-16 h-16 border-2 border-amber-700 rounded-full flex flex-col items-center justify-center p-1 text-[8px] font-black text-amber-900 bg-amber-100 uppercase tracking-tighter text-center">
              <span>प्रमाणित</span>
              <span>वैदिक सील</span>
              <span>2026</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. MARRIAGE GUN MILAN REPORT */}
      {activeMainTab === "matching" && matchingData && (
        <div className="space-y-4">
          <div className="text-center border-b-2 border-amber-600 pb-3 bg-amber-50/80 p-3 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between text-amber-800 font-black text-sm px-4">
              <span>💍 卐 🕉️</span>
              <span className="text-base tracking-widest uppercase">॥ श्री गणेशाय नमः ॥</span>
              <span>🕉️ 卐 💍</span>
            </div>
            <h1 className="text-2xl font-black text-amber-900 mt-1 tracking-tight">
              शास्त्र सम्मत विवाह अष्टकूट गुण मिलान रिपोर्ट
            </h1>
            <p className="text-xs text-amber-800 font-bold tracking-wide mt-0.5">
              36 गुण मिलान एवं मांगलिक सामंजस्य विश्लेषण · onediary.in
            </p>
          </div>

          {/* Boy & Girl Details */}
          <div className="grid grid-cols-2 gap-4 border-2 border-amber-600 p-3 rounded-xl bg-white text-xs">
            <div className="border-r border-amber-300 pr-2">
              <h3 className="font-black text-amber-900 border-b border-amber-200 pb-1 mb-1">👦 वर पक्ष (Bridegroom)</h3>
              <p><span className="font-bold text-amber-800">नाम:</span> {matchingData.boyName}</p>
              <p><span className="font-bold text-amber-800">जन्म:</span> {matchingData.boyDob} ({matchingData.boyTime})</p>
              <p><span className="font-bold text-amber-800">स्थान:</span> {matchingData.boyPlace}</p>
            </div>
            <div className="pl-2">
              <h3 className="font-black text-amber-900 border-b border-amber-200 pb-1 mb-1">👧 वधू पक्ष (Bride)</h3>
              <p><span className="font-bold text-amber-800">नाम:</span> {matchingData.girlName}</p>
              <p><span className="font-bold text-amber-800">जन्म:</span> {matchingData.girlDob} ({matchingData.girlTime})</p>
              <p><span className="font-bold text-amber-800">स्थान:</span> {matchingData.girlPlace}</p>
            </div>
          </div>

          {/* Score Card */}
          <div className="border-2 border-amber-600 bg-amber-100 p-4 rounded-xl text-center space-y-1">
            <div className="text-xs font-black uppercase tracking-widest text-amber-800">कुल अष्टकूट गुण प्राप्तांक</div>
            <div className="text-3xl font-black text-amber-950">{matchingData.totalGunas} / 36</div>
            <div className="text-sm font-black text-amber-900">{matchingData.verdictHi}</div>
          </div>

          {/* 8 Kootas Table */}
          {matchingData.kootas && matchingData.kootas.length > 0 && (
            <div className="border-2 border-amber-600 rounded-xl overflow-hidden bg-white">
              <div className="bg-amber-600 text-white font-black text-xs px-3 py-1 uppercase">
                📊 अष्टकूट गुण सारणी (8 Kootas Breakup)
              </div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-amber-100 font-black border-b border-amber-300">
                    <th className="p-1.5 border-r border-amber-200">कूट</th>
                    <th className="p-1.5 border-r border-amber-200">वर</th>
                    <th className="p-1.5 border-r border-amber-200">वधू</th>
                    <th className="p-1.5 border-r border-amber-200">अधिकतम</th>
                    <th className="p-1.5 border-r border-amber-200">प्राप्त</th>
                    <th className="p-1.5">निष्कर्ष</th>
                  </tr>
                </thead>
                <tbody>
                  {matchingData.kootas.map((k: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-amber-50/50"}>
                      <td className="p-1.5 border-r border-amber-200 font-black">{k.kootNameHi}</td>
                      <td className="p-1.5 border-r border-amber-200">{k.boyAttr}</td>
                      <td className="p-1.5 border-r border-amber-200">{k.girlAttr}</td>
                      <td className="p-1.5 border-r border-amber-200 font-bold">{k.maxScore}</td>
                      <td className="p-1.5 border-r border-amber-200 font-black text-amber-900">{k.obtainedScore}</td>
                      <td className="p-1.5 text-amber-800">{k.descriptionHi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Seal */}
          <div className="border-t-2 border-amber-600 pt-3 text-center flex items-center justify-between text-xs text-amber-900">
            <div>
              <p className="font-bold">प्रमाणित वैदिक विवाह ज्योतिष संस्थान</p>
              <p className="text-[10px] text-amber-800">onediary.in · गुण मिलान</p>
            </div>
            <div className="w-16 h-16 border-2 border-amber-700 rounded-full flex flex-col items-center justify-center p-1 text-[8px] font-black text-amber-900 bg-amber-100 uppercase tracking-tighter text-center">
              <span>प्रमाणित</span>
              <span>गुण मिलान</span>
              <span>2026</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
