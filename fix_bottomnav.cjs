const fs = require('fs');
const newBottomNav = `import { LayoutGrid, Users, Wallet, Book, MoreHorizontal } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function BottomNav() {
  const { t } = useLanguage();

  const navItems = [
    { to: "/", icon: LayoutGrid, label: t('nav.dashboard'), activeColor: "text-blue-100", bgActive: "bg-blue-500/30" },
    { to: "/workers", icon: Users, label: t('nav.workers'), activeColor: "text-emerald-100", bgActive: "bg-emerald-500/30" },
    { to: "/cashbook", icon: Wallet, label: t('nav.cashbook'), activeColor: "text-purple-100", bgActive: "bg-purple-500/30" },
    { to: "/hisab", icon: Book, label: t('dashboard.hisab'), activeColor: "text-orange-100", bgActive: "bg-orange-500/30" },
    { to: "/more", icon: MoreHorizontal, label: t('nav.more'), activeColor: "text-rose-100", bgActive: "bg-rose-500/30" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.3)] flex justify-around items-center h-[72px] px-2 z-40 rounded-t-3xl border-t border-white/10">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            \`flex flex-col items-center justify-center flex-1 h-14 mx-1 rounded-2xl transition-all duration-300 \${
              isActive 
                ? \`\${item.bgActive} \${item.activeColor} scale-105 shadow-inner\` 
                : "text-white/60 hover:text-white hover:bg-white/5"
            }\`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="mb-1 drop-shadow-sm" />
              <span className={\`text-[10px] font-bold tracking-wide \${isActive ? 'opacity-100' : 'opacity-80'}\`}>
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
`;

fs.writeFileSync('src/components/BottomNav.tsx', newBottomNav);
