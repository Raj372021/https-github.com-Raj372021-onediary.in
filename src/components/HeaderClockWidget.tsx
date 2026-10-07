import React, { useState, useEffect } from 'react';

export default function HeaderClockWidget() {
  const [time, setTime] = useState(new Date());
  const [clockMode, setClockMode] = useState<'analog' | 'digital'>(() => {
    return (localStorage.getItem('preferred_header_clock_mode') as 'analog' | 'digital') || 'analog';
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClockMode(prev => {
      const next = prev === 'analog' ? 'digital' : 'analog';
      localStorage.setItem('preferred_header_clock_mode', next);
      return next;
    });
  };

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
  const hourDegrees = (((hours % 12) + minutes / 60) / 12) * 360;

  const hoursStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div 
      onClick={toggleMode}
      className="bg-slate-950/80 hover:bg-slate-900 border border-emerald-400/80 rounded-xl px-2 py-1 shadow-[0_0_10px_rgba(16,185,129,0.3)] flex items-center gap-2 cursor-pointer transition select-none backdrop-blur-md"
      title="Click to toggle Analog / Digital"
    >
      {clockMode === 'analog' ? (
        <div className="relative w-7 h-7 rounded-full bg-slate-950 border border-emerald-400 shadow-[inset_0_0_4px_rgba(16,185,129,0.5)] flex items-center justify-center shrink-0">
          <div className="absolute top-0.5 text-[5px] font-black text-emerald-300">12</div>
          <div className="absolute right-0.5 text-[5px] font-black text-emerald-300">3</div>
          <div className="absolute bottom-0.5 text-[5px] font-black text-emerald-300">6</div>
          <div className="absolute left-0.5 text-[5px] font-black text-emerald-300">9</div>

          <div className="absolute w-1 h-1 rounded-full bg-emerald-300 shadow-[0_0_3px_#34d399] z-10"></div>

          <div
            className="absolute w-0.5 h-2 bg-emerald-300 rounded-full bottom-1/2 left-[calc(50%-0.25px)] origin-bottom shadow-[0_0_2px_#34d399]"
            style={{ transform: `rotate(${hourDegrees}deg)` }}
          ></div>
          <div
            className="absolute w-0.5 h-3 bg-teal-300 rounded-full bottom-1/2 left-[calc(50%-0.25px)] origin-bottom shadow-[0_0_2px_#5eead4]"
            style={{ transform: `rotate(${minuteDegrees}deg)` }}
          ></div>
          <div
            className="absolute w-[0.75px] h-3.5 bg-yellow-300 rounded-full bottom-1/2 left-[calc(50%-0.375px)] origin-bottom shadow-[0_0_4px_#fde047]"
            style={{ transform: `rotate(${secondDegrees}deg)` }}
          ></div>
        </div>
      ) : (
        <div className="px-1.5 py-0.5 bg-slate-950 border border-emerald-400 rounded-lg shadow-[inset_0_0_4px_rgba(16,185,129,0.4)] flex flex-col items-center justify-center">
          <span className="font-mono font-black text-[10px] text-emerald-300 tracking-wider drop-shadow-[0_0_4px_#34d399]">
            {hoursStr}
          </span>
        </div>
      )}
      <div className="flex flex-col pr-0.5">
        <span className="text-[8px] font-black text-emerald-300 uppercase tracking-wider drop-shadow-[0_0_2px_#34d399]">
          {clockMode === 'analog' ? 'Radium' : 'Digital'}
        </span>
        <span className="text-[8px] font-mono font-bold text-emerald-400/90">
          {hoursStr}
        </span>
      </div>
    </div>
  );
}
