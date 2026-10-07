cat << 'INNER_EOF' > /tmp/worker_bottom.tsx
      <div className="fixed bottom-0 left-0 right-0 bg-slate-50 border-t border-gray-200 p-4 z-40 pb-6 rounded-t-3xl shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.1)]">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button 
            onClick={shareOnWhatsApp} 
            className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center transition-colors shadow-sm text-sm"
          >
            <MessageCircle size={14} className="mr-1" /> WhatsApp
          </button>
          <button 
            onClick={() => {
              if (!worker || balance <= 0) {
                alert("No pending balance to pay.");
                return;
              }
              setShowUPIOptions(true);
            }} 
            className="bg-white border border-gray-200 text-gray-800 py-3 rounded-2xl font-bold flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <Smartphone size={14} className="mr-1 text-blue-600" /> UPI Pay
          </button>
        </div>
      </div>
    
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
                <div className="flex-1 text-left">
                  <div className="font-bold text-gray-900">Google Pay</div>
                  <div className="text-xs text-gray-500">Pay instantly via GPay</div>
                </div>
              </button>
              <button onClick={() => openUPIApp('phonepe')} className="w-full flex items-center p-4 border border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-colors">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm mr-4 overflow-hidden p-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-gray-900">PhonePe</div>
                  <div className="text-xs text-gray-500">Pay securely via PhonePe</div>
                </div>
              </button>
              <button onClick={() => openUPIApp('any')} className="w-full flex items-center p-4 border border-gray-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm mr-4 overflow-hidden p-2">
                  <Smartphone className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-gray-900">Other UPI App</div>
                  <div className="text-xs text-gray-500">Paytm, BHIM, Amazon Pay, etc.</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
INNER_EOF

sed -i '312,356d' src/pages/WorkerDetail.tsx
cat /tmp/worker_bottom.tsx >> src/pages/WorkerDetail.tsx

