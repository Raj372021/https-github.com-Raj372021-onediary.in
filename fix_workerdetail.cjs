const fs = require('fs');
let code = fs.readFileSync('src/pages/WorkerDetail.tsx', 'utf-8');

code = code.replace(
  `import { ArrowLeft, CreditCard, Trash2, Edit, Eye, EyeOff } from "lucide-react";`,
  `import { ArrowLeft, CreditCard, Trash2, Edit, Eye, EyeOff, MessageCircle, Smartphone } from "lucide-react";`
);

const shareFunctions = `
  const shareOnWhatsApp = () => {
    if (!worker) return;
    const reportText = \`*Attendance Report: \${worker.name}*\\n\\n*Total Earned:* \${formatCurrency(earned)}\\n*Total Advance:* \${formatCurrency(advance)}\\n*Remaining Balance:* \${formatCurrency(balance)}\\n\\n_Sent via AI App_\`;
    const encodedText = encodeURIComponent(reportText);
    let url = \`https://wa.me/?text=\${encodedText}\`;
    if (worker.phone) {
      url = \`https://wa.me/\${worker.phone}?text=\${encodedText}\`;
    }
    window.open(url, '_blank');
  };

  const payWithUPI = () => {
    if (!worker || balance <= 0) {
      alert("No pending balance to pay.");
      return;
    }
    // Using a standard UPI intent which opens GPay, PhonePe, Paytm, etc.
    const upiUrl = \`upi://pay?pa=\${worker.phone}@upi&pn=\${encodeURIComponent(worker.name)}&am=\${balance}&cu=INR\`;
    window.open(upiUrl, '_blank');
  };
`;

code = code.replace(
  `const { earned, advance, balance } = stats;`,
  `const { earned, advance, balance } = stats;\n${shareFunctions}`
);

const oldFooter = `<div className="fixed bottom-0 left-0 right-0 bg-slate-50 border-t border-gray-200 p-4 z-40 pb-6">
        <button 
          onClick={handlePayment}
          disabled={loading || balance <= 0}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-extrabold text-xl py-4 rounded-2xl flex items-center justify-center transition-all hover:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 shadow-xl shadow-blue-200"
        >
          <CreditCard className="mr-3" size={24} />
          {loading ? "Processing..." : \`Pay Balance · \${balance > 0 ? formatCurrency(balance) : '0'}\`}
        </button>
      </div>`;

const newFooter = `<div className="fixed bottom-0 left-0 right-0 bg-slate-50 border-t border-gray-200 p-4 z-40 pb-6 rounded-t-3xl shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.1)]">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button 
            onClick={shareOnWhatsApp} 
            className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center transition-colors shadow-sm"
          >
            <MessageCircle size={18} className="mr-2" /> WhatsApp Rasid
          </button>
          <button 
            onClick={payWithUPI} 
            className="bg-white border border-gray-200 text-gray-800 py-3 rounded-2xl font-bold flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Smartphone size={18} className="mr-2 text-blue-600" /> UPI Pay
          </button>
        </div>
        <button 
          onClick={handlePayment}
          disabled={loading || balance <= 0}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-extrabold text-xl py-4 rounded-2xl flex items-center justify-center transition-all hover:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 shadow-xl shadow-blue-200"
        >
          <CreditCard className="mr-3" size={24} />
          {loading ? "Processing..." : \`Clear Record · \${balance > 0 ? formatCurrency(balance) : '0'}\`}
        </button>
      </div>`;

code = code.replace(oldFooter, newFooter);

fs.writeFileSync('src/pages/WorkerDetail.tsx', code);
