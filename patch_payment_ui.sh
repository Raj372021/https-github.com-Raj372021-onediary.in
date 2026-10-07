sed -i '/<PaymentOption icon={QrCode} title="UPI"/i \
        {selectedMethod === "UPI" && paymentSettings?.qrCodeUrl && (\
          <div className="p-4 bg-blue-50 flex flex-col items-center border-b border-gray-100">\
            <div className="text-sm font-bold text-gray-900 mb-2">Scan QR to Pay</div>\
            <img src={paymentSettings.qrCodeUrl} className="w-48 h-48 rounded-xl shadow-sm border border-gray-200" alt="UPI QR Code" />\
            <div className="text-xs text-gray-500 mt-2 text-center">After paying, click "I have paid" below to confirm.</div>\
          </div>\
        )}\
' src/pages/Payment.tsx
