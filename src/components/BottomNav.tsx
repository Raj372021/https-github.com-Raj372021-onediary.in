import { LayoutGrid, Users, FileText, BookOpen, Wallet, MoreHorizontal } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function BottomNav() {
  const { language } = useLanguage();

  // Optimized labels based on language for crystal clear mobile visibility
  const getLabel = (type: 'home' | 'cashbook' | 'diary' | 'quotation' | 'workers' | 'more') => {
    const isHi = language === 'hi' || language === 'hinglish';
    switch (type) {
      case 'home':
        return isHi ? 'होम' : 'Home';
      case 'cashbook':
        return isHi ? 'कैशबुक' : 'CashBook';
      case 'diary':
        return isHi ? 'स्मार्ट डायरी' : 'Diary';
      case 'quotation':
        return isHi ? 'कोटेशन' : 'Quotation';
      case 'workers':
        return isHi ? 'मज़दूर' : 'Workers';
      case 'more':
        return isHi ? 'मेनू' : 'More';
    }
  };

  // Explicit priority order requested: Home -> CashBook/Passbook -> Smart Diary -> Quotation -> Workers -> More
  const navItems = [
    { 
      to: "/", 
      icon: LayoutGrid, 
      label: getLabel('home'), 
      activeStyle: "bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-black shadow-md shadow-amber-500/30 ring-1 ring-amber-300",
      inactiveIconColor: "text-amber-400"
    },
    { 
      to: "/cashbook", 
      icon: Wallet, 
      label: getLabel('cashbook'), 
      activeStyle: "bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 font-black shadow-md shadow-cyan-500/30 ring-1 ring-cyan-300",
      inactiveIconColor: "text-cyan-400"
    },
    { 
      to: "/diary", 
      icon: BookOpen, 
      label: getLabel('diary'), 
      activeStyle: "bg-gradient-to-tr from-purple-500 to-fuchsia-600 text-white font-black shadow-md shadow-purple-500/30 ring-1 ring-purple-300",
      inactiveIconColor: "text-purple-400"
    },
    { 
      to: "/quotation", 
      icon: FileText, 
      label: getLabel('quotation'), 
      activeStyle: "bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-black shadow-md shadow-indigo-500/30 ring-1 ring-indigo-300",
      inactiveIconColor: "text-indigo-400"
    },
    { 
      to: "/workers", 
      icon: Users, 
      label: getLabel('workers'), 
      activeStyle: "bg-gradient-to-tr from-pink-500 to-rose-600 text-white font-black shadow-md shadow-pink-500/30 ring-1 ring-pink-300",
      inactiveIconColor: "text-pink-400"
    },
    { 
      to: "/more", 
      icon: MoreHorizontal, 
      label: getLabel('more'), 
      activeStyle: "bg-gradient-to-tr from-orange-500 to-amber-600 text-white font-black shadow-md shadow-orange-500/30 ring-1 ring-orange-300",
      inactiveIconColor: "text-orange-400"
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-1 pointer-events-none">
      <nav 
        aria-label="Bottom Navigation" 
        className="pointer-events-auto bg-slate-950/95 backdrop-blur-lg border border-slate-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.65)] flex justify-between items-center px-1.5 py-1.5 rounded-2xl w-full max-w-md sm:max-w-lg mx-auto"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => {
              const inactiveStyle = "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800/60";

              return `flex flex-col items-center justify-center flex-1 min-w-0 px-1 py-1.5 h-[58px] sm:h-[62px] mx-[2px] rounded-xl transition-all duration-150 cursor-pointer active:scale-95 ${
                isActive ? item.activeStyle : inactiveStyle
              }`;
            }}
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={20} 
                  strokeWidth={isActive ? 2.6 : 2.1} 
                  className={`mb-0.5 transition-transform duration-150 ${isActive ? 'scale-110' : item.inactiveIconColor}`} 
                />
                <span className={`text-[10px] sm:text-[11px] leading-tight font-black tracking-tight text-center truncate w-full px-0.5 ${isActive ? '' : 'text-slate-200'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
