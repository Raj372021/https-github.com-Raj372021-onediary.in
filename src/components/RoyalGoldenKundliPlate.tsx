import React, { useRef, useState } from "react";
import { VedicKundliResult, PlanetPosition } from "../utils/vedicAstrology";
import { Download, Sparkles, Share2, Printer, Check, Copy } from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface RoyalGoldenKundliPlateProps {
  kundli: VedicKundliResult;
  type?: 'lagna' | 'navamsha';
  customerName?: string;
  onNameChange?: (name: string) => void;
  onPaymentRequired?: () => void;
}

export default function RoyalGoldenKundliPlate({
  kundli,
  type = 'lagna',
  customerName,
  onNameChange,
  onPaymentRequired
}: RoyalGoldenKundliPlateProps) {
  const { isSubscribed } = useAppContext();
  const plateRef = useRef<HTMLDivElement>(null);
  const [nameColor, setNameColor] = useState<'black' | 'dark-gold' | 'maroon' | 'royal-blue'>('black');
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayName = customerName || kundli.birthDetails.name || "Alex Morgan";

  const houses = type === 'lagna' ? kundli.lagnaChart.houses : kundli.navamshaChart.houses;

  // Short Hindi graha names
  const grahaNamesHi: Record<string, string> = {
    Sun: "सूर्य",
    Moon: "चंद्र",
    Mars: "मंगल",
    Mercury: "बुध",
    Jupiter: "गुरु",
    Venus: "शुक्र",
    Saturn: "शनि",
    Rahu: "राहु",
    Ketu: "केतु"
  };

  // Get planets in a specific house (1 to 12)
  const getHousePlanets = (houseNum: number) => {
    if (type === 'lagna') {
      return kundli.planets.filter(p => p.house === houseNum);
    } else {
      const h = kundli.navamshaChart.houses.find(item => item.houseNumber === houseNum);
      if (!h || !h.planets) return [];
      return h.planets.map(pName => {
        const found = kundli.planets.find(p => p.name === pName || p.nameHi === pName);
        return found || {
          name: pName,
          nameHi: grahaNamesHi[pName] || pName,
          degreeFormatted: "",
          isRetrograde: false,
          isCombust: false
        };
      });
    }
  };

  // Get Rashi number in house
  const getRashiNum = (houseNum: number): number => {
    const h = houses.find(item => item.houseNumber === houseNum);
    return h ? h.rashiIndex + 1 : houseNum;
  };

  // Download high-resolution PNG of the golden plate
  const handleDownloadImage = async () => {
    if (!isSubscribed) {
      if (onPaymentRequired) {
        onPaymentRequired();
      } else {
        alert("3D गोल्ड प्लेट कुण्डली डाउनलोड करने के लिए ₹199 स्टार्टर प्लान खरीदें।");
      }
      return;
    }

    if (!plateRef.current) return;
    setIsExporting(true);

    try {
      // Create offscreen canvas and draw the golden plate
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const width = 1080;
      const height = 1080;
      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        // Draw metallic gold gradient background
        const goldGrad = ctx.createLinearGradient(0, 0, width, height);
        goldGrad.addColorStop(0, "#d4af37");
        goldGrad.addColorStop(0.15, "#f9e076");
        goldGrad.addColorStop(0.35, "#c59a27");
        goldGrad.addColorStop(0.5, "#fff2a3");
        goldGrad.addColorStop(0.7, "#b8860b");
        goldGrad.addColorStop(0.85, "#e5c158");
        goldGrad.addColorStop(1, "#996515");
        ctx.fillStyle = goldGrad;
        ctx.fillRect(0, 0, width, height);

        // Radial gold glow in center
        const radialGlow = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width / 1.5);
        radialGlow.addColorStop(0, "rgba(255, 255, 220, 0.45)");
        radialGlow.addColorStop(0.6, "rgba(212, 175, 55, 0.2)");
        radialGlow.addColorStop(1, "rgba(100, 65, 10, 0.5)");
        ctx.fillStyle = radialGlow;
        ctx.fillRect(0, 0, width, height);

        // Outer 3D Embossed Golden Border
        ctx.lineWidth = 14;
        ctx.strokeStyle = "#684206";
        ctx.strokeRect(28, 28, width - 56, height - 56);

        ctx.lineWidth = 6;
        ctx.strokeStyle = "#fff6b8";
        ctx.strokeRect(36, 36, width - 72, height - 72);

        ctx.lineWidth = 8;
        ctx.strokeStyle = "#996515";
        ctx.strokeRect(48, 48, width - 96, height - 96);

        // Header: ॥ श्री गणेशाय नमः ॥
        ctx.textAlign = "center";
        ctx.font = "bold 32px 'Tiro Devanagari Hindi', 'Cinzel', serif";
        ctx.fillStyle = "#1e1302";
        ctx.shadowColor = "rgba(255, 240, 160, 0.8)";
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 1;
        ctx.fillText("॥ श्री गणेशाय नमः ॥", width / 2, 95);

        // Ganesha Icon representation
        ctx.font = "52px serif";
        ctx.fillText("🕉️ 🐘 🕉️", width / 2, 155);

        // Title: ॥ जन्म कुण्डली ॥
        ctx.font = "900 48px 'Tiro Devanagari Hindi', 'Cinzel', serif";
        ctx.fillStyle = "#221401";
        ctx.shadowColor = "rgba(255, 240, 160, 0.9)";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 2;
        ctx.fillText(type === 'lagna' ? "॥ जन्म कुण्डली ॥" : "॥ नवमांश कुण्डली ॥", width / 2, 225);

        // Reset shadow
        ctx.shadowColor = "transparent";

        // Kundli Frame Box (North Indian Diamond Grid)
        const boxX = 200;
        const boxY = 270;
        const boxSize = 680;

        // Draw outer gold diamond plate
        ctx.fillStyle = "rgba(255, 235, 150, 0.25)";
        ctx.fillRect(boxX, boxY, boxSize, boxSize);

        ctx.lineWidth = 10;
        ctx.strokeStyle = "#5a3a05";
        ctx.strokeRect(boxX, boxY, boxSize, boxSize);

        ctx.lineWidth = 4;
        ctx.strokeStyle = "#fff399";
        ctx.strokeRect(boxX + 6, boxY + 6, boxSize - 12, boxSize - 12);

        // Diagonals
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#6a4507";
        ctx.beginPath();
        ctx.moveTo(boxX, boxY);
        ctx.lineTo(boxX + boxSize, boxY + boxSize);
        ctx.moveTo(boxX + boxSize, boxY);
        ctx.lineTo(boxX, boxY + boxSize);
        ctx.stroke();

        // Inner Diamond
        ctx.beginPath();
        ctx.moveTo(boxX + boxSize / 2, boxY);
        ctx.lineTo(boxX + boxSize, boxY + boxSize / 2);
        ctx.lineTo(boxX + boxSize / 2, boxY + boxSize);
        ctx.lineTo(boxX, boxY + boxSize / 2);
        ctx.closePath();
        ctx.stroke();

        // Central Yantra / Om
        ctx.font = "70px serif";
        ctx.fillStyle = "rgba(100, 60, 10, 0.15)";
        ctx.fillText("🕉️", width / 2, boxY + boxSize / 2 + 25);

        // Draw Planets and House Numbers in classical North positions
        // House 1 (Top Center)
        ctx.font = "bold 26px serif";
        ctx.fillStyle = "#1e1302";
        ctx.fillText(`लग्न ${getRashiNum(1)}`, width / 2, boxY + 120);
        const p1 = getHousePlanets(1);
        if (p1.length) {
          ctx.font = "900 24px serif";
          ctx.fillText(p1.map(p => p.nameHi).join(" "), width / 2, boxY + 160);
        }

        // House 2 (Top Left)
        ctx.font = "bold 22px serif";
        ctx.fillText(`${getRashiNum(2)}`, boxX + 160, boxY + 90);
        const p2 = getHousePlanets(2);
        if (p2.length) {
          ctx.font = "900 22px serif";
          ctx.fillText(p2.map(p => p.nameHi).join(" "), boxX + 160, boxY + 130);
        }

        // House 3 (Far Left Top)
        ctx.font = "bold 22px serif";
        ctx.fillText(`${getRashiNum(3)}`, boxX + 90, boxY + 200);
        const p3 = getHousePlanets(3);
        if (p3.length) {
          ctx.font = "900 22px serif";
          ctx.fillText(p3.map(p => p.nameHi).join(" "), boxX + 90, boxY + 240);
        }

        // House 4 (Left Diamond)
        ctx.font = "bold 24px serif";
        ctx.fillText(`${getRashiNum(4)}`, boxX + 120, boxY + boxSize / 2);
        const p4 = getHousePlanets(4);
        if (p4.length) {
          ctx.font = "900 24px serif";
          ctx.fillText(p4.map(p => p.nameHi).join(" "), boxX + 120, boxY + boxSize / 2 + 40);
        }

        // House 5 (Far Left Bottom)
        ctx.font = "bold 22px serif";
        ctx.fillText(`${getRashiNum(5)}`, boxX + 90, boxY + boxSize - 180);
        const p5 = getHousePlanets(5);
        if (p5.length) {
          ctx.font = "900 22px serif";
          ctx.fillText(p5.map(p => p.nameHi).join(" "), boxX + 90, boxY + boxSize - 140);
        }

        // House 6 (Bottom Left)
        ctx.font = "bold 22px serif";
        ctx.fillText(`${getRashiNum(6)}`, boxX + 160, boxY + boxSize - 90);
        const p6 = getHousePlanets(6);
        if (p6.length) {
          ctx.font = "900 22px serif";
          ctx.fillText(p6.map(p => p.nameHi).join(" "), boxX + 160, boxY + boxSize - 50);
        }

        // House 7 (Bottom Center)
        ctx.font = "bold 24px serif";
        ctx.fillText(`${getRashiNum(7)}`, width / 2, boxY + boxSize - 90);
        const p7 = getHousePlanets(7);
        if (p7.length) {
          ctx.font = "900 24px serif";
          ctx.fillText(p7.map(p => p.nameHi).join(" "), width / 2, boxY + boxSize - 50);
        }

        // House 8 (Bottom Right)
        ctx.font = "bold 22px serif";
        ctx.fillText(`${getRashiNum(8)}`, boxX + boxSize - 160, boxY + boxSize - 90);
        const p8 = getHousePlanets(8);
        if (p8.length) {
          ctx.font = "900 22px serif";
          ctx.fillText(p8.map(p => p.nameHi).join(" "), boxX + boxSize - 160, boxY + boxSize - 50);
        }

        // House 9 (Far Right Bottom)
        ctx.font = "bold 22px serif";
        ctx.fillText(`${getRashiNum(9)}`, boxX + boxSize - 90, boxY + boxSize - 180);
        const p9 = getHousePlanets(9);
        if (p9.length) {
          ctx.font = "900 22px serif";
          ctx.fillText(p9.map(p => p.nameHi).join(" "), boxX + boxSize - 90, boxY + boxSize - 140);
        }

        // House 10 (Right Diamond)
        ctx.font = "bold 24px serif";
        ctx.fillText(`${getRashiNum(10)}`, boxX + boxSize - 120, boxY + boxSize / 2);
        const p10 = getHousePlanets(10);
        if (p10.length) {
          ctx.font = "900 24px serif";
          ctx.fillText(p10.map(p => p.nameHi).join(" "), boxX + boxSize - 120, boxY + boxSize / 2 + 40);
        }

        // House 11 (Far Right Top)
        ctx.font = "bold 22px serif";
        ctx.fillText(`${getRashiNum(11)}`, boxX + boxSize - 90, boxY + 200);
        const p11 = getHousePlanets(11);
        if (p11.length) {
          ctx.font = "900 22px serif";
          ctx.fillText(p11.map(p => p.nameHi).join(" "), boxX + boxSize - 90, boxY + 240);
        }

        // House 12 (Top Right)
        ctx.font = "bold 22px serif";
        ctx.fillText(`${getRashiNum(12)}`, boxX + boxSize - 160, boxY + 90);
        const p12 = getHousePlanets(12);
        if (p12.length) {
          ctx.font = "900 22px serif";
          ctx.fillText(p12.map(p => p.nameHi).join(" "), boxX + boxSize - 160, boxY + 130);
        }

        // Decorative 3D Gold Bar Divider
        ctx.strokeStyle = "#4a2d04";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 250, boxY + boxSize + 25);
        ctx.lineTo(width / 2 + 250, boxY + boxSize + 25);
        ctx.stroke();

        ctx.fillStyle = "#ffd700";
        ctx.font = "20px serif";
        ctx.fillText("✦  ❖  ✦", width / 2, boxY + boxSize + 32);

        // Bottom Customer Name (Black / Deep Dark Embossed Typography)
        ctx.font = "900 52px 'Cinzel', 'Playfair Display', Georgia, serif";
        ctx.fillStyle = nameColor === 'black' ? "#0f0a02" : nameColor === 'maroon' ? "#3b0505" : nameColor === 'royal-blue' ? "#05183b" : "#2a1a03";
        ctx.shadowColor = "rgba(255, 245, 180, 0.95)";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 3;
        ctx.fillText(displayName, width / 2, 1000);

        // Sub details: DOB, Place, Rashi
        ctx.font = "bold 20px serif";
        ctx.fillStyle = "#2d1c04";
        ctx.shadowColor = "transparent";
        ctx.fillText(
          `${kundli.birthDetails.dob} | ${kundli.birthDetails.place} | राशि: ${kundli.panchang.chandraRashiHi}`,
          width / 2,
          1035
        );

        // Create download link
        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `Vedic_Kundli_${displayName.replace(/\s+/g, '_')}_GoldPlate.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Download plate failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  const renderBhavaGrahas = (houseNum: number) => {
    const pls = getHousePlanets(houseNum);
    if (!pls || pls.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center justify-center gap-1 max-w-[85px] mt-0.5 leading-tight">
        {pls.map((p, idx) => {
          const nameHi = (p as any).nameHi || grahaNamesHi[(p as any).name] || (p as any).name;
          return (
            <span
              key={idx}
              className="text-[11px] sm:text-[13px] font-black text-amber-950 dark:text-stone-950 tracking-tight leading-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]"
              title={`${nameHi} ${(p as any).degreeFormatted || ''}`}
            >
              {nameHi}
              {(p as any).isRetrograde ? '℞' : ''}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      
      {/* Top Customizer & Export Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 dark:from-slate-800 dark:to-slate-850 p-3 rounded-2xl border border-amber-300 dark:border-amber-700/60 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
          <span className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200">
            👑 3D रॉयल गोल्डन कुण्डली प्लेट (Royal Gold Certificate)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Name Color Selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-amber-300 dark:border-slate-700 text-xs">
            <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">नाम का रंग:</span>
            <button
              onClick={() => setNameColor('black')}
              className={`w-5 h-5 rounded-full bg-black border-2 transition cursor-pointer ${
                nameColor === 'black' ? 'border-amber-400 scale-110 ring-2 ring-amber-500/50' : 'border-slate-300'
              }`}
              title="क्लासिक ब्लैक (Classic Black 3D)"
            />
            <button
              onClick={() => setNameColor('dark-gold')}
              className={`w-5 h-5 rounded-full bg-[#3d2605] border-2 transition cursor-pointer ${
                nameColor === 'dark-gold' ? 'border-amber-400 scale-110 ring-2 ring-amber-500/50' : 'border-slate-300'
              }`}
              title="डार्क गोल्ड एम्बॉस्ड (Dark Gold Embossed)"
            />
            <button
              onClick={() => setNameColor('maroon')}
              className={`w-5 h-5 rounded-full bg-[#4a0808] border-2 transition cursor-pointer ${
                nameColor === 'maroon' ? 'border-amber-400 scale-110 ring-2 ring-amber-500/50' : 'border-slate-300'
              }`}
              title="शाही महरून (Royal Maroon)"
            />
            <button
              onClick={() => setNameColor('royal-blue')}
              className={`w-5 h-5 rounded-full bg-[#081a4a] border-2 transition cursor-pointer ${
                nameColor === 'royal-blue' ? 'border-amber-400 scale-110 ring-2 ring-amber-500/50' : 'border-slate-300'
              }`}
              title="शाही नेवी (Royal Navy)"
            />
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-900/20 transition transform active:scale-95 cursor-pointer"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={14} />
            )}
            <span>{isExporting ? 'डाउनलोड हो रहा है...' : 'HD गोल्ड प्लेट डाउनलोड'}</span>
          </button>
        </div>
      </div>

      {/* THE ROYAL GOLDEN PLATE (EXACT REPLICA OF THE IMAGE) */}
      <div
        ref={plateRef}
        id="royal-golden-kundli-plate"
        className="relative w-full max-w-[460px] sm:max-w-[520px] aspect-square rounded-[32px] sm:rounded-[38px] p-4 sm:p-6 shadow-[0_20px_60px_rgba(180,130,30,0.45),0_0_0_2px_#7a4f08,0_0_0_6px_#f9e17b,0_0_0_10px_#9b6b15] overflow-hidden select-none border-4 border-[#7a4f08]"
        style={{
          background: `
            radial-gradient(circle at 50% 30%, rgba(255, 252, 210, 0.95) 0%, rgba(240, 205, 95, 0.85) 45%, rgba(184, 134, 11, 0.95) 75%, rgba(100, 65, 8, 1) 100%),
            linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%)
          `,
          boxShadow: "inset 0 0 40px rgba(70, 40, 5, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.9), 0 20px 50px rgba(0, 0, 0, 0.45)"
        }}
      >
        {/* Subtle Metallic Brushed Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-25 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(#ffe066 1px, transparent 1px), radial-gradient(#d4af37 1px, transparent 1px)`,
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0, 4px 4px"
          }}
        />

        {/* Outer 3D Filigree Border Frame */}
        <div className="absolute inset-2 sm:inset-3 rounded-[24px] sm:rounded-[28px] border-2 border-[#5c3a06] pointer-events-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.6)]">
          <div className="absolute inset-1 rounded-[20px] sm:rounded-[24px] border border-[#fef0a2]/80" />
        </div>

        {/* 4 Ornate Floral Corner Filigree Pieces */}
        {/* Top-Left Filigree */}
        <svg className="absolute top-3 left-3 w-12 h-12 sm:w-16 sm:h-16 text-[#523305] drop-shadow-[0_1px_1px_#fff399] pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
          <path d="M10,10 Q40,10 40,30 Q40,50 20,50 Q10,50 10,10 M10,10 Q10,40 30,40 Q50,40 50,20 Q50,10 10,10 M25,25 Q35,15 50,15 Q45,35 25,25 M25,25 Q15,35 15,50 Q35,45 25,25 M5,5 L20,5 Q5,20 5,5 M30,10 C45,12 60,25 65,40 C50,35 35,40 30,10 Z" />
          <circle cx="20" cy="20" r="4" fill="#6a4507" />
        </svg>

        {/* Top-Right Filigree */}
        <svg className="absolute top-3 right-3 w-12 h-12 sm:w-16 sm:h-16 text-[#523305] drop-shadow-[0_1px_1px_#fff399] pointer-events-none transform scale-x-[-1]" viewBox="0 0 100 100" fill="currentColor">
          <path d="M10,10 Q40,10 40,30 Q40,50 20,50 Q10,50 10,10 M10,10 Q10,40 30,40 Q50,40 50,20 Q50,10 10,10 M25,25 Q35,15 50,15 Q45,35 25,25 M25,25 Q15,35 15,50 Q35,45 25,25 M5,5 L20,5 Q5,20 5,5 M30,10 C45,12 60,25 65,40 C50,35 35,40 30,10 Z" />
          <circle cx="20" cy="20" r="4" fill="#6a4507" />
        </svg>

        {/* Bottom-Left Filigree */}
        <svg className="absolute bottom-3 left-3 w-12 h-12 sm:w-16 sm:h-16 text-[#523305] drop-shadow-[0_1px_1px_#fff399] pointer-events-none transform scale-y-[-1]" viewBox="0 0 100 100" fill="currentColor">
          <path d="M10,10 Q40,10 40,30 Q40,50 20,50 Q10,50 10,10 M10,10 Q10,40 30,40 Q50,40 50,20 Q50,10 10,10 M25,25 Q35,15 50,15 Q45,35 25,25 M25,25 Q15,35 15,50 Q35,45 25,25 M5,5 L20,5 Q5,20 5,5 M30,10 C45,12 60,25 65,40 C50,35 35,40 30,10 Z" />
          <circle cx="20" cy="20" r="4" fill="#6a4507" />
        </svg>

        {/* Bottom-Right Filigree */}
        <svg className="absolute bottom-3 right-3 w-12 h-12 sm:w-16 sm:h-16 text-[#523305] drop-shadow-[0_1px_1px_#fff399] pointer-events-none transform scale-[-1]" viewBox="0 0 100 100" fill="currentColor">
          <path d="M10,10 Q40,10 40,30 Q40,50 20,50 Q10,50 10,10 M10,10 Q10,40 30,40 Q50,40 50,20 Q50,10 10,10 M25,25 Q35,15 50,15 Q45,35 25,25 M25,25 Q15,35 15,50 Q35,45 25,25 M5,5 L20,5 Q5,20 5,5 M30,10 C45,12 60,25 65,40 C50,35 35,40 30,10 Z" />
          <circle cx="20" cy="20" r="4" fill="#6a4507" />
        </svg>

        {/* Inner Content Stack */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full py-1">
          
          {/* HEADER: ॥ श्री गणेशाय नमः ॥ */}
          <div className="text-center space-y-0.5">
            <h4 
              className="text-xs sm:text-sm md:text-base font-black tracking-widest text-[#1a0f02]"
              style={{
                textShadow: "1px 1px 0px rgba(255, 245, 170, 0.9), -0.5px -0.5px 0px rgba(0, 0, 0, 0.7)"
              }}
            >
              ॥ श्री गणेशाय नमः ॥
            </h4>

            {/* 3D Ganesha Emblem & Ornate Arch */}
            <div className="flex items-center justify-center gap-1.5 my-0.5">
              <span className="text-xs text-[#523305] drop-shadow-[0_1px_0_#fff]">✤</span>
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gradient-to-b from-[#fff6b8] to-[#b38728] border-2 border-[#523305] shadow-[0_2px_6px_rgba(0,0,0,0.35),inset_0_1px_2px_#fff]">
                <span className="text-lg sm:text-xl transform -translate-y-0.5">🐘</span>
                <span className="absolute -bottom-1 text-[8px] font-black text-[#3a2003]">🕉️</span>
              </div>
              <span className="text-xs text-[#523305] drop-shadow-[0_1px_0_#fff]">✤</span>
            </div>

            {/* MAIN TITLE: ॥ जन्म कुण्डली ॥ */}
            <h3 
              className="text-base sm:text-xl md:text-2xl font-black tracking-wider text-[#1e1201]"
              style={{
                fontFamily: "'Tiro Devanagari Hindi', 'Cinzel', serif",
                textShadow: "1.5px 1.5px 0px rgba(255, 250, 190, 0.95), -1px -1px 0px rgba(0, 0, 0, 0.8), 0 3px 6px rgba(0, 0, 0, 0.3)"
              }}
            >
              {type === 'lagna' ? '॥ जन्म कुण्डली ॥' : '॥ नवमांश कुण्डली ॥'}
            </h3>
          </div>

          {/* CENTER 3D GOLDEN KUNDLI CHART (NORTH INDIAN DIAMOND) */}
          <div className="relative w-[240px] sm:w-[280px] md:w-[310px] aspect-square my-1 rounded-2xl bg-gradient-to-br from-[#fbf4b2] via-[#e6be44] to-[#b8860b] p-2 border-3 border-[#523305] shadow-[inset_0_0_20px_rgba(90,55,10,0.5),0_6px_18px_rgba(0,0,0,0.35)] overflow-hidden">
            
            {/* SVG 3D Diamond Grid */}
            <svg className="w-full h-full" viewBox="0 0 300 300">
              {/* Outer Border */}
              <rect x="2" y="2" width="296" height="296" fill="none" stroke="#4a2c03" strokeWidth="3" />
              <rect x="5" y="5" width="290" height="290" fill="none" stroke="#fff59e" strokeWidth="1.5" />

              {/* Diagonal Lines */}
              <line x1="2" y1="2" x2="298" y2="298" stroke="#4a2c03" strokeWidth="2.5" />
              <line x1="298" y1="2" x2="2" y2="298" stroke="#4a2c03" strokeWidth="2.5" />

              {/* Inner Diamond */}
              <polygon points="150,2 298,150 150,298 2,150" fill="none" stroke="#4a2c03" strokeWidth="2.5" />
              <polygon points="150,5 295,150 150,295 5,150" fill="none" stroke="#fff59e" strokeWidth="1" />
            </svg>

            {/* Central 🕉️ Motif */}
            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 text-3xl font-serif text-[#3a2003]">
              🕉️
            </div>

            {/* 12 Bhavas (Houses) Placements */}
            {/* House 1: Top Center Diamond */}
            <div className="absolute top-[18%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] sm:text-xs font-black text-[#1e1201] drop-shadow-[0_1px_1px_#fff]">
                लग्न {getRashiNum(1)}
              </span>
              {renderBhavaGrahas(1)}
            </div>

            {/* House 2: Top Left Triangle */}
            <div className="absolute top-[18%] left-[28%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] sm:text-xs font-black text-[#1e1201] drop-shadow-[0_1px_1px_#fff]">
                {getRashiNum(2)}
              </span>
              {renderBhavaGrahas(2)}
            </div>

            {/* House 3: Top Far-Left Triangle */}
            <div className="absolute top-[28%] left-[18%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] sm:text-xs font-black text-[#1e1201] drop-shadow-[0_1px_1px_#fff]">
                {getRashiNum(3)}
              </span>
              {renderBhavaGrahas(3)}
            </div>

            {/* House 4: Left Center Diamond */}
            <div className="absolute top-[50%] left-[18%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] sm:text-xs font-black text-[#1e1201] drop-shadow-[0_1px_1px_#fff]">
                {getRashiNum(4)}
              </span>
              {renderBhavaGrahas(4)}
            </div>

            {/* House 5: Bottom Far-Left Triangle */}
            <div className="absolute top-[72%] left-[18%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] sm:text-xs font-black text-[#1e1201] drop-shadow-[0_1px_1px_#fff]">
                {getRashiNum(5)}
              </span>
              {renderBhavaGrahas(5)}
            </div>

            {/* House 6: Bottom Left Triangle */}
            <div className="absolute top-[82%] left-[28%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] sm:text-xs font-black text-[#1e1201] drop-shadow-[0_1px_1px_#fff]">
                {getRashiNum(6)}
              </span>
              {renderBhavaGrahas(6)}
            </div>

            {/* House 7: Bottom Center Diamond */}
            <div className="absolute top-[82%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] sm:text-xs font-black text-[#1e1201] drop-shadow-[0_1px_1px_#fff]">
                {getRashiNum(7)}
              </span>
              {renderBhavaGrahas(7)}
            </div>

            {/* House 8: Bottom Right Triangle */}
            <div className="absolute top-[82%] left-[72%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] sm:text-xs font-black text-[#1e1201] drop-shadow-[0_1px_1px_#fff]">
                {getRashiNum(8)}
              </span>
              {renderBhavaGrahas(8)}
            </div>

            {/* House 9: Bottom Far-Right Triangle */}
            <div className="absolute top-[72%] left-[82%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] sm:text-xs font-black text-[#1e1201] drop-shadow-[0_1px_1px_#fff]">
                {getRashiNum(9)}
              </span>
              {renderBhavaGrahas(9)}
            </div>

            {/* House 10: Right Center Diamond */}
            <div className="absolute top-[50%] left-[82%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] sm:text-xs font-black text-[#1e1201] drop-shadow-[0_1px_1px_#fff]">
                {getRashiNum(10)}
              </span>
              {renderBhavaGrahas(10)}
            </div>

            {/* House 11: Top Far-Right Triangle */}
            <div className="absolute top-[28%] left-[82%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] sm:text-xs font-black text-[#1e1201] drop-shadow-[0_1px_1px_#fff]">
                {getRashiNum(11)}
              </span>
              {renderBhavaGrahas(11)}
            </div>

            {/* House 12: Top Right Triangle */}
            <div className="absolute top-[18%] left-[72%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] sm:text-xs font-black text-[#1e1201] drop-shadow-[0_1px_1px_#fff]">
                {getRashiNum(12)}
              </span>
              {renderBhavaGrahas(12)}
            </div>
          </div>

          {/* ORNATE GOLDEN DIVIDER */}
          <div className="w-full flex items-center justify-center gap-2 my-1 px-8">
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#523305] to-[#523305] shadow-[0_1px_0_#fff]" />
            <div className="flex items-center gap-1 text-[#4a2c03] drop-shadow-[0_1px_0_#fff]">
              <span className="text-xs">✦</span>
              <span className="text-sm">❖</span>
              <span className="text-xs">✦</span>
            </div>
            <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-[#523305] to-[#523305] shadow-[0_1px_0_#fff]" />
          </div>

          {/* BOTTOM CUSTOMER NAME (DEEP BLACK / 3D EMBOSSED AS IN USER'S IMAGE) */}
          <div className="text-center w-full px-2 space-y-0.5">
            <h2
              className={`text-xl sm:text-2xl md:text-3xl font-black tracking-wide ${
                nameColor === 'black'
                  ? 'text-[#0a0601]'
                  : nameColor === 'maroon'
                  ? 'text-[#380505]'
                  : nameColor === 'royal-blue'
                  ? 'text-[#05153b]'
                  : 'text-[#2e1c03]'
              }`}
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                textShadow: `
                  1px 1px 0px rgba(255, 255, 220, 0.95),
                  -1px -1px 0px rgba(0, 0, 0, 0.75),
                  2px 3px 6px rgba(0, 0, 0, 0.6)
                `
              }}
            >
              {displayName}
            </h2>

            {/* Sub details: DOB, Time & Place */}
            <p className="text-[10px] sm:text-xs font-black text-[#2e1c03] tracking-tight drop-shadow-[0_1px_0_#fff599]">
              {kundli.birthDetails.dob} ({kundli.birthDetails.time}) • {kundli.birthDetails.place} • {kundli.panchang.chandraRashiHi} राशि
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
