sed -i '/export interface SubscriptionPlan {/i \
export interface PaymentSettings {\n  qrCodeUrl: string;\n  razorpayKeyId: string;\n  razorpayKeySecret: string;\n  isRazorpayEnabled: boolean;\n}\n\nexport const defaultPaymentSettings: PaymentSettings = { qrCodeUrl: "", razorpayKeyId: "", razorpayKeySecret: "", isRazorpayEnabled: false };\n' src/context/AppContext.tsx

sed -i '/subscriptionPlans: SubscriptionPlan\[\];/a \  paymentSettings: PaymentSettings;\n  setPaymentSettings: (settings: PaymentSettings) => void;' src/context/AppContext.tsx

sed -i '/const \[subscriptionPlans, setSubscriptionPlans\] = useState<SubscriptionPlan\[\]>(() => {/i \
  const [paymentSettings, setPaymentSettingsState] = useState<PaymentSettings>(() => { const saved = localStorage.getItem("lb_payment_settings"); return saved ? JSON.parse(saved) : defaultPaymentSettings; });\n  useEffect(() => { localStorage.setItem("lb_payment_settings", JSON.stringify(paymentSettings)); }, [paymentSettings]);\n  const setPaymentSettings = (settings: PaymentSettings) => { setPaymentSettingsState(settings); };\n' src/context/AppContext.tsx

sed -i 's/subscriptionPlans, updateSubscriptionPlan/subscriptionPlans, updateSubscriptionPlan, paymentSettings, setPaymentSettings/g' src/context/AppContext.tsx
