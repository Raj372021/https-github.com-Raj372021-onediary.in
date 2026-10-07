sed -i 's/subscriptionPlans, updateSubscriptionPlan } = useAppContext();/subscriptionPlans, updateSubscriptionPlan, paymentSettings, setPaymentSettings } = useAppContext();/g' src/pages/AdminPanel.tsx

sed -i '/<h2 className="text-lg font-bold text-gray-900 mb-2">Manage Plans & Pricing<\/h2>/i \
          <section className="space-y-4 mb-8">\
            <h2 className="text-lg font-bold text-gray-900 mb-2">Payment Settings</h2>\
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">\
              <div>\
                <label className="text-xs text-gray-500 font-bold block mb-1">UPI QR Code URL (Base64/Link)</label>\
                <input type="text" placeholder="https://... or data:image/png..." value={paymentSettings?.qrCodeUrl || ""} onChange={(e) => setPaymentSettings({...paymentSettings, qrCodeUrl: e.target.value})} className="w-full border rounded p-2 text-sm" />\
                {paymentSettings?.qrCodeUrl && <img src={paymentSettings.qrCodeUrl} className="w-24 h-24 mt-2 object-cover border rounded-lg" alt="QR Code" />}\
              </div>\
              <div className="pt-2 border-t">\
                <div className="flex justify-between items-center mb-2">\
                  <label className="text-sm text-gray-900 font-bold">Enable Razorpay Gateway</label>\
                  <input type="checkbox" checked={paymentSettings?.isRazorpayEnabled || false} onChange={(e) => setPaymentSettings({...paymentSettings, isRazorpayEnabled: e.target.checked})} className="w-5 h-5" />\
                </div>\
                <div className="flex gap-2">\
                  <div className="flex-1">\
                    <label className="text-xs text-gray-500 font-bold block mb-1">Razorpay Key ID</label>\
                    <input type="text" value={paymentSettings?.razorpayKeyId || ""} onChange={(e) => setPaymentSettings({...paymentSettings, razorpayKeyId: e.target.value})} className="w-full border rounded p-2 text-sm" />\
                  </div>\
                  <div className="flex-1">\
                    <label className="text-xs text-gray-500 font-bold block mb-1">Razorpay Key Secret</label>\
                    <input type="password" value={paymentSettings?.razorpayKeySecret || ""} onChange={(e) => setPaymentSettings({...paymentSettings, razorpayKeySecret: e.target.value})} className="w-full border rounded p-2 text-sm" />\
                  </div>\
                </div>\
              </div>\
            </div>\
          </section>\
' src/pages/AdminPanel.tsx
