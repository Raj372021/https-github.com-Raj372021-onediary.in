const fs = require('fs');
let content = fs.readFileSync('src/components/WalletModal.tsx', 'utf8');

const gatewayUI = `            {/* PAYMENT GATEWAYS IN RECHARGE TAB */}
            {(paymentSettings?.isRazorpayEnabled || paymentSettings?.isPhonePeEnabled || paymentSettings?.isCashfreeEnabled || paymentSettings?.isPayuEnabled) && (
              <div className="space-y-2.5 bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-purple-950/80 dark:to-indigo-900 p-3.5 rounded-2xl border-2 border-purple-500 shadow-md">
                <label className="text-xs font-black text-purple-900 dark:text-purple-200 block flex items-center justify-between">
                  <span>सुरक्षित ऑनलाइन भुगतान (Gateways)</span>
                  <span className="text-[9px] font-bold bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 px-2 py-0.5 rounded-full">Secure</span>
                </label>
                <div className="space-y-2 pt-1">
                  {paymentSettings?.isRazorpayEnabled && (
                    <button onClick={() => {
                        addWalletBalance(rechargeAmount, 'PG-RAZORPAY-' + Date.now(), \`वॉलेट रिचार्ज (Razorpay)\`);
                        setStatusMsg({ type: 'success', text: \`🎉 सफलता! ₹\${rechargeAmount} Razorpay द्वारा आपके वॉलेट में जोड़ दिए गए हैं!\` });
                        setTimeout(() => setStatusMsg(null), 3000);
                    }} className="w-full bg-[#3395FF] hover:bg-[#2084ea] text-white py-2.5 rounded-xl font-bold shadow transition flex items-center justify-center gap-2 text-[11px]">
                      <span>Razorpay से पेमेंट करें</span>
                    </button>
                  )}
                  {paymentSettings?.isPhonePeEnabled && (
                    <button onClick={() => {
                        addWalletBalance(rechargeAmount, 'PG-PHONEPE-' + Date.now(), \`वॉलेट रिचार्ज (PhonePe)\`);
                        setStatusMsg({ type: 'success', text: \`🎉 सफलता! ₹\${rechargeAmount} PhonePe द्वारा आपके वॉलेट में जोड़ दिए गए हैं!\` });
                        setTimeout(() => setStatusMsg(null), 3000);
                    }} className="w-full bg-[#5F259F] hover:bg-[#4a1c7c] text-white py-2.5 rounded-xl font-bold shadow transition flex items-center justify-center gap-2 text-[11px]">
                      <span>PhonePe से पेमेंट करें</span>
                    </button>
                  )}
                  {paymentSettings?.isCashfreeEnabled && (
                    <button onClick={() => {
                        addWalletBalance(rechargeAmount, 'PG-CASHFREE-' + Date.now(), \`वॉलेट रिचार्ज (Cashfree)\`);
                        setStatusMsg({ type: 'success', text: \`🎉 सफलता! ₹\${rechargeAmount} Cashfree द्वारा आपके वॉलेट में जोड़ दिए गए हैं!\` });
                        setTimeout(() => setStatusMsg(null), 3000);
                    }} className="w-full bg-[#F37021] hover:bg-[#d95c14] text-white py-2.5 rounded-xl font-bold shadow transition flex items-center justify-center gap-2 text-[11px]">
                      <span>Cashfree से पेमेंट करें</span>
                    </button>
                  )}
                  {paymentSettings?.isPayuEnabled && (
                    <button onClick={() => {
                        addWalletBalance(rechargeAmount, 'PG-PAYU-' + Date.now(), \`वॉलेट रिचार्ज (PayU)\`);
                        setStatusMsg({ type: 'success', text: \`🎉 सफलता! ₹\${rechargeAmount} PayU द्वारा आपके वॉलेट में जोड़ दिए गए हैं!\` });
                        setTimeout(() => setStatusMsg(null), 3000);
                    }} className="w-full bg-[#00B962] hover:bg-[#009b52] text-white py-2.5 rounded-xl font-bold shadow transition flex items-center justify-center gap-2 text-[11px]">
                      <span>PayU India से पेमेंट करें</span>
                    </button>
                  )}
                </div>
              </div>
            )}
`;

content = content.replace("            </div>\n          </div>\n        )}\n\n        {/* TAB 2: BUY PLAN WITH WALLET */}", gatewayUI + "            </div>\n          </div>\n        )}\n\n        {/* TAB 2: BUY PLAN WITH WALLET */}");

fs.writeFileSync('src/components/WalletModal.tsx', content);
