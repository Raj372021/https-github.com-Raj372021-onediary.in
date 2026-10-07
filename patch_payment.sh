sed -i 's/const { formatCurrency } = useAppContext();/const { formatCurrency, paymentSettings } = useAppContext();/g' src/pages/Payment.tsx
sed -i 's/body: JSON.stringify({ amount }),/body: JSON.stringify({ amount, keyId: paymentSettings?.razorpayKeyId, keySecret: paymentSettings?.razorpayKeySecret }),/g' src/pages/Payment.tsx
sed -i 's/order.keyId || (import.meta as any).env.VITE_RAZORPAY_KEY_ID || "rzp_test_mock"/paymentSettings?.razorpayKeyId || order.keyId || "rzp_test_mock"/g' src/pages/Payment.tsx
