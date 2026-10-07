const fs = require('fs');
let code = fs.readFileSync('src/pages/WorkerDetail.tsx', 'utf-8');

// 1. Add X icon to imports
code = code.replace(
  `import { ArrowLeft, CreditCard, Trash2, Edit, Eye, EyeOff, MessageCircle, Smartphone } from "lucide-react";`,
  `import { ArrowLeft, CreditCard, Trash2, Edit, Eye, EyeOff, MessageCircle, Smartphone, X } from "lucide-react";`
);

// 2. Add showUPIOptions state
code = code.replace(
  `const [loading, setLoading] = useState(false);`,
  `const [loading, setLoading] = useState(false);\n  const [showUPIOptions, setShowUPIOptions] = useState(false);`
);

// 3. Replace payWithUPI function
const oldPayFunction = `  const payWithUPI = () => {
    if (!worker || balance <= 0) {
      alert("No pending balance to pay.");
      return;
    }
    // Using a standard UPI intent which opens GPay, PhonePe, Paytm, etc.
    const upiUrl = \`upi://pay?pa=\${worker.phone}@upi&pn=\${encodeURIComponent(worker.name)}&am=\${balance}&cu=INR\`;
    window.open(upiUrl, '_blank');
  };`;

const newPayFunction = `  const openUPIApp = (app: string) => {
    if (!worker || balance <= 0) return;
    let url = \`upi://pay?pa=\${worker.phone}@upi&pn=\${encodeURIComponent(worker.name)}&am=\${balance}&cu=INR\`;
    
    if (app === 'gpay') {
      url = \`tez://upi/pay?pa=\${worker.phone}@upi&pn=\${encodeURIComponent(worker.name)}&am=\${balance}&cu=INR\`;
    } else if (app === 'phonepe') {
      url = \`phonepe://pay?pa=\${worker.phone}@upi&pn=\${encodeURIComponent(worker.name)}&am=\${balance}&cu=INR\`;
    }
    
    window.open(url, '_blank');
    setShowUPIOptions(false);
  };`;

code = code.replace(oldPayFunction, newPayFunction);

// Update button onClick to open modal
code = code.replace(
  `onClick={payWithUPI}`,
  `onClick={() => {
              if (!worker || balance <= 0) {
                alert("No pending balance to pay.");
                return;
              }
              setShowUPIOptions(true);
            }}`
);


// 4. Inject Modal before the final closing div tag
const modalMarkup = `
      {showUPIOptions && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center">
          <div className="bg-white w-full sm:w-96 rounded-t-3xl sm:rounded-3xl p-6 pb-10 sm:pb-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-gray-900">Pay via UPI</h3>
              <button onClick={() => setShowUPIOptions(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <button onClick={() => openUPIApp('gpay')} className="w-full flex items-center p-4 border border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm mr-4 overflow-hidden p-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-lg text-gray-800">Google Pay</span>
              </button>
              <button onClick={() => openUPIApp('phonepe')} className="w-full flex items-center p-4 border border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-colors">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm mr-4 overflow-hidden p-1">
                  <img src="https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png" alt="PhonePe" className="w-full h-full object-contain scale-[1.5]" />
                </div>
                <span className="font-bold text-lg text-gray-800">PhonePe</span>
              </button>
              <button onClick={() => openUPIApp('any')} className="w-full flex items-center p-4 border border-gray-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                  <Smartphone size={20} className="text-emerald-600" />
                </div>
                <span className="font-bold text-lg text-gray-800">Other UPI Apps</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

code = code.substring(0, code.lastIndexOf('</div>')) + modalMarkup;

fs.writeFileSync('src/pages/WorkerDetail.tsx', code);
