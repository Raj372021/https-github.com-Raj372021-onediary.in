import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  CreditCard, Lock, CheckCircle2, Download, 
  ShieldCheck, BadgeCheck, Zap, 
  ArrowLeft, Check
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";
import { playPaymentSuccessSound } from "../utils/sound";
import { triggerRazorpayPayment } from "../utils/razorpay";
import { safeHtml2Canvas } from "../utils/safeHtml2Canvas";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    paymentSettings, 
    activateSubscription, 
    addPaymentRequest, 
    userProfile,
    subscriptionPlans
  } = useAppContext();
  
  const { language } = useLanguage();

  const plan = searchParams.get("plan") || "plan_199";
  const amountStr = searchParams.get("amount") || String(paymentSettings?.minPlanPrice || "199");
  const amount = parseInt(amountStr, 10) || 199;

  const matchedPlan = subscriptionPlans.find(p => p.id === plan || p.razorpayPlanId === plan) || subscriptionPlans.find(p => p.price === amount);
  
  const isRealRazorpayPlanId = (id?: string) => {
    return id && id.startsWith("plan_") && id.length > 10 && !["plan_199", "plan_499", "plan_999", "plan_2999_year", "free_starter"].includes(id);
  };

  const razorpayPlanId = paymentSettings?.globalRazorpayPlanId || 
    matchedPlan?.razorpayPlanId || 
    (isRealRazorpayPlanId(plan) ? plan : undefined) || 
    (amount === 2999 ? (subscriptionPlans.find(p => p.id === 'plan_2999_year')?.razorpayPlanId || paymentSettings?.globalRazorpayPlanId || "plan_TYbj2MfJ41oskm") : undefined) ||
    subscriptionPlans.find(p => p.price === amount && isRealRazorpayPlanId(p.razorpayPlanId))?.razorpayPlanId ||
    "plan_TYbj2MfJ41oskm";

  const [userName, setUserName] = useState(userProfile?.name || "Contractor");
  const [userPhone, setUserPhone] = useState(userProfile?.phone || "");
  
  const getPlanName = (p: string) => {
    if (matchedPlan?.name) return matchedPlan.name;
    if (p === 'plan_199' || amount === 199) return 'Starter Plan (5 Labour)';
    if (p === 'plan_499' || amount === 499) return 'Standard Plan (15 Labour)';
    if (p === 'plan_999' || amount === 999) return 'Pro Contractor Plan (25 Labour)';
    if (p === 'plan_2999_year' || amount === 2999) return 'Annual VIP Plan (25+ Labour / 1 Year)';
    return 'Contractor Plan';
  };

  const planName = getPlanName(plan);

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (showSuccess) {
      playPaymentSuccessSound();
    }
  }, [showSuccess]);

  const handlePayment = () => {
    setErrorMsg(null);
    setLoading(true);

    triggerRazorpayPayment({
      amount,
      planName,
      userName: userName || userProfile?.name || "Contractor",
      userPhone: userPhone || userProfile?.phone || "9876543210",
      keyId: paymentSettings?.razorpayKeyId,
      keySecret: paymentSettings?.razorpayKeySecret,
      razorpayPlanId,
      onSuccess: (verifiedPayId) => {
        activateSubscription({
          planId: plan,
          planName: planName,
          amount: amount,
          paymentId: verifiedPayId,
          paymentMethod: "Razorpay Online Gateway",
          isApproved: true,
          isSubscribed: true
        });

        addPaymentRequest({
          userName: userName || userProfile?.name || "Contractor",
          userPhone: userPhone || userProfile?.phone || "9876543210",
          planId: plan,
          planName: planName,
          amount: amount,
          utrNumber: verifiedPayId,
          paymentMethod: "Razorpay Online Gateway"
        }, 'APPROVED');

        setPaymentId(verifiedPayId);
        setLoading(false);
        setShowSuccess(true);
      },
      onFailure: (err) => {
        setLoading(false);
        setErrorMsg(err?.message || (language === 'hi' 
          ? "ऑनलाइन पेमेंट रद्द कर दिया गया या अधूरा रहा। कृपया पुनः प्रयास करें।" 
          : "Online payment cancelled or failed. Please try again."));
      }
    });
  };

  const handleDownloadReceipt = async () => {
    const el = document.getElementById('payment-receipt-bill');
    if (!el) return;
    try {
      const canvas = await safeHtml2Canvas(el, { scale: 2, backgroundColor: '#ffffff' });
      const img = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = img;
      a.download = `Subscription_Receipt_${paymentId}.png`;
      a.click();
    } catch (e) {
      console.error(e);
      window.print();
    }
  };

  const basePriceVal = amount / 1.18;
  const gstVal = amount - basePriceVal;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-16">
      
      {/* Top Header Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 sm:py-4 border-b border-slate-800 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => navigate(-1)} 
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-200 transition cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-wide text-white">
                Razorpay Secure Checkout
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Official 256-Bit SSL Encrypted Payment Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-indigo-950/80 border border-indigo-500/30 px-3 py-1.5 rounded-full text-xs font-bold text-indigo-300">
            <ShieldCheck size={14} className="text-indigo-400" />
            <span className="hidden sm:inline">100% Secure Gateway</span>
            <span className="sm:hidden">Secure</span>
          </div>
        </div>
      </div>

      {/* Trust Ticker Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800/40 py-2 px-4 text-center">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-xs font-black text-emerald-800 dark:text-emerald-300">
          <BadgeCheck size={16} className="text-emerald-600 shrink-0" />
          <span>GST Tax Invoice Provided • Instant Activation • 24/7 Official Contractor Support</span>
        </div>
      </div>

      {/* Main Dual Column Layout */}
      <div className="max-w-6xl w-full mx-auto p-4 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Payment Details (7/12) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <span>Payment Method</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>
          </h2>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-800 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200 rounded-2xl text-xs font-bold animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* RAZORPAY GATEWAY CARD */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-indigo-600 shadow-md p-5 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Razorpay Online Gateway</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                      Instant Activation
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Pay securely via UPI (GPay, PhonePe, Paytm), Cards (RuPay, Visa, MasterCard), NetBanking & Wallets
                  </p>
                </div>
              </div>
            </div>

            {/* User Form Inputs */}
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                  {language === 'hi' ? 'आपका नाम (Full Name)' : 'Full Name'}
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Ramesh Kumar"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                  {language === 'hi' ? 'मोबाइल नंबर (Mobile Number)' : 'Mobile Phone Number (+91)'}
                </label>
                <input 
                  type="tel" 
                  placeholder="e.g. 9876543210"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Features Supported */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Razorpay Gateway Includes:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>All UPI Apps</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Debit / Credit Card</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Net Banking (50+ Banks)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Instant Verification</span>
                </div>
              </div>
            </div>

            {/* Main Action Button */}
            <button
              type="button"
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black py-4 rounded-xl shadow-xl text-sm transition cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
            >
              <Zap size={18} className="fill-white" />
              <span>
                {loading 
                  ? (language === 'hi' ? 'रेज़रपे गेटवे खुल रहा है...' : 'Opening Razorpay Gateway...') 
                  : (language === 'hi' ? `Razorpay से ₹${amount} पे करें` : `Pay ₹${amount} via Razorpay`)}
              </span>
            </button>
          </div>

          {/* Secure Trust Indicators */}
          <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-indigo-600" /> SSL Secured Connection</span>
            <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-emerald-600" /> PCI-DSS Compliant</span>
            <span className="flex items-center gap-1.5"><Lock size={14} className="text-slate-600" /> AES-256 Bit Encryption</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary (5/12) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4 text-left">
          <h2 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-wider border-b pb-3 border-slate-100 dark:border-slate-700/60">
            Order Summary
          </h2>

          {/* Selected Plan item layout */}
          <div className="flex justify-between items-start pt-1">
            <div>
              <span className="text-[9px] uppercase tracking-widest font-black bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 px-2.5 py-0.5 rounded-full">
                Enrolled Subscription
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1.5">{planName}</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Billed {plan.includes('year') ? 'yearly' : 'monthly'}</p>
            </div>
            <span className="text-sm font-black text-slate-900 dark:text-white">₹{amount}.00</span>
          </div>

          <div className="border-t pt-3 border-slate-100 dark:border-slate-700/60 space-y-2 text-xs">
            {/* Calculation breakdowns */}
            <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold">
              <span>Base Subscription Price</span>
              <span>₹{basePriceVal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold">
              <span>GST (Goods & Services Tax 18%)</span>
              <span>₹{gstVal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold">
              <span>Setup / Gateway Charges</span>
              <span className="text-emerald-600 font-bold uppercase text-[10px]">FREE</span>
            </div>
          </div>

          {/* Net Amount Total */}
          <div className="border-t-2 border-double py-3.5 border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <span className="text-sm font-black text-slate-900 dark:text-white">Total Amount Billed</span>
            <div className="text-right">
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹{amount}.00</span>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">No extra cost</p>
            </div>
          </div>

          {/* Guaranteed Security Badge */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
            <h4 className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={12} className="text-slate-500" />
              <span>Security Guarantee</span>
            </h4>
            <p className="text-[10px] text-slate-500 leading-normal font-semibold">
              onediary.in protects your billing data. Your payment information remains completely private and secured using top industrial PCI standards.
            </p>
          </div>

          {/* Dynamic Checkout button */}
          <button 
            type="button"
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl transition cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
          >
            <Zap size={16} className="fill-white" />
            <span>
              {loading ? "Opening Razorpay..." : `Confirm & Pay ₹${amount}.00`}
            </span>
          </button>
        </div>

      </div>

      {/* SUCCESS & BILL RECEIPT POPUP */}
      {showSuccess && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4 my-auto">
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">भुगतान सफल हुआ!</h2>
              <p className="text-xs font-bold text-slate-600">
                आपका <span className="text-indigo-600 font-black">{planName}</span> सब्सक्रिप्शन एक्टिव हो गया है।
              </p>
            </div>

            {/* Printable Bill Receipt Box */}
            <div id="payment-receipt-bill" className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-3 font-sans">
              <div className="flex justify-between items-start border-b pb-2 border-slate-300">
                <div>
                  <h3 className="font-black text-sm text-slate-900">ONEDIARY.IN PRO</h3>
                  <p className="text-[10px] text-slate-500">Official Payment Tax Receipt</p>
                </div>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase">
                  PAID
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-left">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Bill To</span>
                  <span className="font-extrabold text-slate-800">{userName || userProfile?.name || "Valued Contractor"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Date</span>
                  <span className="font-mono text-slate-800">{new Date().toLocaleDateString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Payment ID</span>
                  <span className="font-mono font-bold text-indigo-700 text-[11px]">{paymentId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Gateway</span>
                  <span className="font-extrabold text-slate-800">Razorpay</span>
                </div>
              </div>

              <div className="border-t border-slate-300 pt-2 flex justify-between items-center text-sm font-black text-left">
                <span>Total Paid Amount:</span>
                <span className="text-emerald-700 text-base">₹{amount}.00</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button 
                type="button"
                onClick={handleDownloadReceipt}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
              >
                <Download size={15} />
                <span>रसीद / बिल डाउनलोड करें (Download Bill)</span>
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  const message = `*ONEDIARY.IN PRO - PAYMENT RECEIPT*\n\n*Plan:* ${planName}\n*Amount:* ₹${amount}\n*Transaction ID:* ${paymentId}\n*Date:* ${new Date().toLocaleDateString('en-IN')}\n\nYour subscription is now active!`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
              >
                <span className="font-bold text-lg leading-none mt-[-2px]">✆</span>
                <span>WhatsApp पर रसीद भेजें (Share Bill)</span>
              </button>

              <button 
                type="button"
                onClick={() => navigate('/workers')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-xl text-xs shadow transition cursor-pointer"
              >
                डैशबोर्ड पर जाएं (Go to Dashboard) →
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
