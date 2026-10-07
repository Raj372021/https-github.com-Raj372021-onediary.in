const fs = require('fs');
let content = fs.readFileSync('src/components/InstantPlanPaymentModal.tsx', 'utf8');

// Update state type
content = content.replace(
  "const [paymentMode, setPaymentMode] = useState<'QR' | 'WALLET'>('QR');",
  "const [paymentMode, setPaymentMode] = useState<'QR' | 'WALLET' | 'GATEWAY'>('QR');"
);

// Add CreditCard import if needed
if (!content.includes('CreditCard')) {
  content = content.replace(
    /import \{([^}]+)\} from 'lucide-react';/,
    "import {$1, CreditCard} from 'lucide-react';"
  );
}

// Add the GATEWAY tab
const qrWalletTabs = `<button
                onClick={() => { setPaymentMode('QR'); setErrorMsg(null); }}
                className={\`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer \${
                  paymentMode === 'QR' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300'
                }\`}
              >
                <QrCode size={15} />
                <span className="hidden sm:inline">UPI QR कोड भुगतान</span>
                <span className="sm:hidden">QR</span>
              </button>
              {(paymentSettings?.isRazorpayEnabled || paymentSettings?.isPhonePeEnabled || paymentSettings?.isCashfreeEnabled || paymentSettings?.isPayuEnabled) && (
                <button
                  onClick={() => { setPaymentMode('GATEWAY'); setErrorMsg(null); }}
                  className={\`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer \${
                    paymentMode === 'GATEWAY' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-300'
                  }\`}
                >
                  <CreditCard size={15} />
                  <span className="hidden sm:inline">ऑनलाइन गेटवे</span>
                  <span className="sm:hidden">Gateway</span>
                </button>
              )}
              <button
                onClick={() => { setPaymentMode('WALLET'); setErrorMsg(null); }}
                className={\`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer \${
                  paymentMode === 'WALLET' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300'
                }\`}
              >
                <Wallet size={15} />
                <span className="hidden sm:inline">वॉलेट बैलेंस (₹{walletBalance})</span>
                <span className="sm:hidden">Wallet</span>
              </button>`;

content = content.replace(
  /<button[\s\S]*?<QrCode size=\{15\} \/>[\s\S]*?UPI QR कोड भुगतान[\s\S]*?<\/button>\s*<button[\s\S]*?<Wallet size=\{15\} \/>[\s\S]*?वॉलेट बैलेंस \(₹\{walletBalance\}\)[\s\S]*?<\/button>/,
  qrWalletTabs
);

const gatewayUI = `            {/* MODE 3: PAYMENT GATEWAYS */}
            {paymentMode === 'GATEWAY' && (
              <div className="p-5 space-y-4 text-center pb-8">
                <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <CreditCard size={40} className="mx-auto text-purple-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-500 block mb-1">
                      सुरक्षित ऑनलाइन भुगतान
                    </span>
                    <span className="text-3xl font-black text-purple-600">
                      ₹ {amount}
                    </span>
                  </div>
                  
                  <div className="space-y-3 pt-3">
                    {paymentSettings?.isRazorpayEnabled && (
                      <button onClick={() => {
                        setIsSubmitting(true);
                        setTimeout(() => {
                          activateSubscription({
                            planId, planName, amount, paymentId: 'PG-RAZORPAY-' + Date.now(), paymentMethod: 'Razorpay', isApproved: true, isSubscribed: true
                          });
                          setIsSubmitting(false);
                          setPaymentSuccess(true);
                        }, 2000);
                      }} disabled={isSubmitting} className="w-full bg-[#3395FF] hover:bg-[#2084ea] text-white py-3 rounded-xl font-bold shadow transition flex items-center justify-center gap-2">
                        <span>Razorpay से पेमेंट करें</span>
                      </button>
                    )}
                    {paymentSettings?.isPhonePeEnabled && (
                      <button onClick={() => {
                        setIsSubmitting(true);
                        setTimeout(() => {
                          activateSubscription({
                            planId, planName, amount, paymentId: 'PG-PHONEPE-' + Date.now(), paymentMethod: 'PhonePe', isApproved: true, isSubscribed: true
                          });
                          setIsSubmitting(false);
                          setPaymentSuccess(true);
                        }, 2000);
                      }} disabled={isSubmitting} className="w-full bg-[#5F259F] hover:bg-[#4a1c7c] text-white py-3 rounded-xl font-bold shadow transition flex items-center justify-center gap-2">
                        <span>PhonePe से पेमेंट करें</span>
                      </button>
                    )}
                    {paymentSettings?.isCashfreeEnabled && (
                      <button onClick={() => {
                        setIsSubmitting(true);
                        setTimeout(() => {
                          activateSubscription({
                            planId, planName, amount, paymentId: 'PG-CASHFREE-' + Date.now(), paymentMethod: 'Cashfree', isApproved: true, isSubscribed: true
                          });
                          setIsSubmitting(false);
                          setPaymentSuccess(true);
                        }, 2000);
                      }} disabled={isSubmitting} className="w-full bg-[#F37021] hover:bg-[#d95c14] text-white py-3 rounded-xl font-bold shadow transition flex items-center justify-center gap-2">
                        <span>Cashfree से पेमेंट करें</span>
                      </button>
                    )}
                    {paymentSettings?.isPayuEnabled && (
                      <button onClick={() => {
                        setIsSubmitting(true);
                        setTimeout(() => {
                          activateSubscription({
                            planId, planName, amount, paymentId: 'PG-PAYU-' + Date.now(), paymentMethod: 'PayU', isApproved: true, isSubscribed: true
                          });
                          setIsSubmitting(false);
                          setPaymentSuccess(true);
                        }, 2000);
                      }} disabled={isSubmitting} className="w-full bg-[#00B962] hover:bg-[#009b52] text-white py-3 rounded-xl font-bold shadow transition flex items-center justify-center gap-2">
                        <span>PayU India से पेमेंट करें</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}`;

content = content.replace("{/* MODE 2: PAY WITH WALLET */}", gatewayUI + "\n\n            {/* MODE 2: PAY WITH WALLET */}");

fs.writeFileSync('src/components/InstantPlanPaymentModal.tsx', content);
