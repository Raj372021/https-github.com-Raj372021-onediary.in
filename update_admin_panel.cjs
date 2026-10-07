const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

const oldSelect = `                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">Select Active Payment Gateway</label>
                    <select 
                      value={paymentSettings?.paymentGateway || (paymentSettings?.isRazorpayEnabled ? 'RAZORPAY' : 'NONE')}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings, 
                        paymentGateway: e.target.value as any,
                        isRazorpayEnabled: e.target.value === 'RAZORPAY'
                      })}
                      className="w-full border-2 border-slate-300 rounded-xl p-3 text-sm font-bold focus:border-blue-500 outline-none"
                    >
                      <option value="NONE">None (Only manual UPI/QR)</option>
                      <option value="RAZORPAY">Razorpay</option>
                      <option value="PHONEPE">PhonePe PG</option>
                      <option value="PAYU">PayU India</option>
                      <option value="CASHFREE">Cashfree</option>
                      <option value="INSTAMOJO">Instamojo</option>
                    </select>
                  </div>`;

const newCheckboxes = `                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">Enable Payment Gateways</label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <label className="flex items-center gap-2 bg-slate-50 border p-2 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={!!paymentSettings?.isRazorpayEnabled} onChange={(e) => setPaymentSettings({...paymentSettings, isRazorpayEnabled: e.target.checked})} className="w-4 h-4" />
                        <span className="text-sm font-bold">Razorpay</span>
                      </label>
                      <label className="flex items-center gap-2 bg-slate-50 border p-2 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={!!paymentSettings?.isPhonePeEnabled} onChange={(e) => setPaymentSettings({...paymentSettings, isPhonePeEnabled: e.target.checked})} className="w-4 h-4" />
                        <span className="text-sm font-bold">PhonePe</span>
                      </label>
                      <label className="flex items-center gap-2 bg-slate-50 border p-2 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={!!paymentSettings?.isCashfreeEnabled} onChange={(e) => setPaymentSettings({...paymentSettings, isCashfreeEnabled: e.target.checked})} className="w-4 h-4" />
                        <span className="text-sm font-bold">Cashfree</span>
                      </label>
                      <label className="flex items-center gap-2 bg-slate-50 border p-2 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={!!paymentSettings?.isPayuEnabled} onChange={(e) => setPaymentSettings({...paymentSettings, isPayuEnabled: e.target.checked})} className="w-4 h-4" />
                        <span className="text-sm font-bold">PayU India</span>
                      </label>
                    </div>
                  </div>`;

content = content.replace(oldSelect, newCheckboxes);

content = content.replace(/paymentSettings\?\.paymentGateway === 'PHONEPE'/g, "paymentSettings?.isPhonePeEnabled");
content = content.replace(/paymentSettings\?\.paymentGateway === 'PAYU'/g, "paymentSettings?.isPayuEnabled");
content = content.replace(/paymentSettings\?\.paymentGateway === 'CASHFREE'/g, "paymentSettings?.isCashfreeEnabled");
content = content.replace(/paymentSettings\?\.paymentGateway === 'INSTAMOJO'/g, "paymentSettings?.isInstamojoEnabled");

fs.writeFileSync('src/pages/AdminPanel.tsx', content);
