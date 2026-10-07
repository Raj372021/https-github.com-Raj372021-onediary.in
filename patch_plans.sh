sed -i '/{showClearConfirm && (/i \
        {activeTab === "PLANS" && (\
          <section className="space-y-4">\
            <h2 className="text-lg font-bold text-gray-900 mb-2">Manage Plans & Pricing</h2>\
            {subscriptionPlans.map(plan => (\
              <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">\
                <div className="flex justify-between items-center mb-3">\
                  <h3 className="font-bold text-gray-900">{plan.name} Plan</h3>\
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">{plan.duration}</span>\
                </div>\
                <div className="space-y-3">\
                  <div>\
                    <label className="text-xs text-gray-500 font-bold block mb-1">Plan Name</label>\
                    <input type="text" value={plan.name} onChange={(e) => updateSubscriptionPlan(plan.id, { name: e.target.value })} className="w-full border rounded p-2 text-sm" />\
                  </div>\
                  <div className="flex gap-2">\
                    <div className="flex-1">\
                      <label className="text-xs text-gray-500 font-bold block mb-1">Price</label>\
                      <input type="number" value={plan.price} onChange={(e) => updateSubscriptionPlan(plan.id, { price: Number(e.target.value) })} className="w-full border rounded p-2 text-sm" />\
                    </div>\
                    <div className="flex-1">\
                      <label className="text-xs text-gray-500 font-bold block mb-1">Worker Limit</label>\
                      <input type="number" value={plan.workersLimit} onChange={(e) => updateSubscriptionPlan(plan.id, { workersLimit: Number(e.target.value) })} className="w-full border rounded p-2 text-sm" />\
                    </div>\
                  </div>\
                  <div>\
                    <label className="text-xs text-gray-500 font-bold block mb-1">Features (comma separated)</label>\
                    <textarea value={plan.features.join(", ")} onChange={(e) => updateSubscriptionPlan(plan.id, { features: e.target.value.split(",").map(s => s.trim()) })} className="w-full border rounded p-2 text-sm" rows={2} />\
                  </div>\
                </div>\
              </div>\
            ))}\
          </section>\
        )}\
' src/pages/AdminPanel.tsx
