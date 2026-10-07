const fs = require('fs');
let content = fs.readFileSync('src/components/InstantPlanPaymentModal.tsx', 'utf8');

const missingCode = `
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-xl font-black flex items-center gap-1.5">
                <Crown size={22} className="text-amber-400" />
                <span>प्लान एक्टिवेट करें</span>
              </h2>
              <p className="text-[11px] text-amber-200 mt-1 font-bold">
                1-क्लिक सुरक्षित पेमेंट (Secure SSL)
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition cursor-pointer">
              <X size={20} />
            </button>
          </div>
        </div>

        {paymentSuccess ? (
          <div className="p-8 text-center space-y-4 bg-emerald-50 dark:bg-emerald-950/20">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg animate-bounce">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                🎉 भुगतान सफल! (Payment Successful)
              </h3>
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                आपका {planName} प्लान तुरंत एक्टिवेट हो गया है!
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                onediary.in अनलिमिटेड फीचर्स का आनंद लें...
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-black border border-emerald-300">
                <ShieldCheck size={16} /> Status: 100% Active Plan
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Option Selector: QR Code vs Wallet */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 p-1">
              <button`;

content = content.replace(
  /<div className="absolute top-0 right-0 w-32 h-32 bg-pink-500\/30 rounded-full blur-2xl pointer-events-none animate-pink-glow" \/>\s*<button/,
  '<div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/30 rounded-full blur-2xl pointer-events-none animate-pink-glow" />' + missingCode
);

fs.writeFileSync('src/components/InstantPlanPaymentModal.tsx', content);
