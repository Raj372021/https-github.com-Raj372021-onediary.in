import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Crown, X, Zap, Lock, ShieldCheck, CreditCard, AlertCircle, Check
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { triggerRazorpayPayment } from '../utils/razorpay';
import { playPaymentSuccessSound } from '../utils/sound';

interface InstantPlanPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  amount: number;
  workersLimit?: number;
  onSuccessRedirect?: () => void;
}

export default function InstantPlanPaymentModal({
  isOpen,
  onClose,
  planId,
  planName,
  amount,
  workersLimit,
  onSuccessRedirect
}: InstantPlanPaymentModalProps) {
  const { 
    paymentSettings, 
    activateSubscription, 
    addPaymentRequest, 
    userProfile,
    subscriptionPlans
  } = useAppContext();
  
  const { language } = useLanguage();

  const matchedPlan = subscriptionPlans.find(p => p.id === planId || p.razorpayPlanId === planId) || subscriptionPlans.find(p => p.price === amount);
  
  const isRealRazorpayPlanId = (id?: string) => {
    return id && id.startsWith("plan_") && id.length > 10 && !["plan_199", "plan_499", "plan_999", "plan_2999_year", "free_starter"].includes(id);
  };

  const razorpayPlanId = paymentSettings?.globalRazorpayPlanId || 
    matchedPlan?.razorpayPlanId || 
    (isRealRazorpayPlanId(planId) ? planId : undefined) || 
    (amount === 2999 ? (subscriptionPlans.find(p => p.id === 'plan_2999_year')?.razorpayPlanId || paymentSettings?.globalRazorpayPlanId || "plan_TYbj2MfJ41oskm") : undefined) ||
    subscriptionPlans.find(p => p.price === amount && isRealRazorpayPlanId(p.razorpayPlanId))?.razorpayPlanId ||
    "plan_TYbj2MfJ41oskm";

  const [userNameInput, setUserNameInput] = useState<string>(userProfile?.name || 'Contractor');
  const [userPhoneInput, setUserPhoneInput] = useState<string>(userProfile?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (userProfile?.name) setUserNameInput(userProfile.name);
    if (userProfile?.phone) setUserPhoneInput(userProfile.phone);
  }, [userProfile]);

  useEffect(() => {
    if (paymentSuccess) {
      playPaymentSuccessSound();
    }
  }, [paymentSuccess]);

  if (!isOpen) return null;

  const basePrice = Math.round((amount / 1.18) * 100) / 100;
  const gstAmount = Math.round((amount - basePrice) * 100) / 100;

  const handleTriggerRazorpay = () => {
    setErrorMsg(null);
    setIsSubmitting(true);

    triggerRazorpayPayment({
      amount,
      planName,
      userName: userNameInput || userProfile?.name || 'Contractor User',
      userPhone: userPhoneInput || userProfile?.phone || '9876543210',
      keyId: paymentSettings?.razorpayKeyId,
      keySecret: paymentSettings?.razorpayKeySecret,
      razorpayPlanId,
      onSuccess: (verifiedPaymentId) => {
        activateSubscription({
          planId,
          planName,
          amount,
          paymentId: verifiedPaymentId,
          paymentMethod: 'Razorpay Online Gateway',
          isApproved: true,
          isSubscribed: true
        });

        addPaymentRequest({
          userName: userNameInput || userProfile?.name || 'Contractor User',
          userPhone: userPhoneInput || userProfile?.phone || '9876543210',
          planId,
          planName,
          amount,
          utrNumber: verifiedPaymentId,
          paymentMethod: 'Razorpay Online Gateway'
        }, 'APPROVED');

        setIsSubmitting(false);
        setPaymentSuccess(true);
        setTimeout(() => {
          if (onSuccessRedirect) onSuccessRedirect();
          else onClose();
        }, 2200);
      },
      onFailure: (err) => {
        setIsSubmitting(false);
        setErrorMsg(err?.message || (language === 'hi' 
          ? 'पेमेंट रद्द कर दिया गया या अधूरा रहा। कृपया पुनः प्रयास करें।' 
          : 'Payment cancelled or failed. Please try again.'));
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 border-b border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center text-amber-400 shadow-inner">
              <Crown size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                {language === 'hi' ? 'Razorpay सुरक्षित चेकआउट' : 'Razorpay Secure Checkout'}
              </h2>
              <p className="text-[11px] text-indigo-200 flex items-center gap-1">
                <Lock size={12} className="text-emerald-400" />
                <span>256-Bit SSL Encrypted Payment Gateway</span>
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {paymentSuccess ? (
          <div className="p-8 text-center space-y-4 bg-emerald-50 dark:bg-emerald-950/30">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl animate-bounce">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                🎉 भुगतान सफल! (Payment Complete)
              </h3>
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                आपका {planName} प्लान सफलतापूर्वक चालू कर दिया गया है।
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg">
                <ShieldCheck size={16} /> Active Plan Enrolled
              </span>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-4 text-left">
            
            {/* Plan Info Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-indigo-950/40 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 px-2 py-0.5 rounded-md">
                  Selected Plan
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1">
                  {planName}
                </h3>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {workersLimit === 999999 ? 'Unlimited Labour Record' : `${workersLimit || 25} Labour Capacity`}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  ₹{amount}
                </span>
                <span className="text-[10px] text-slate-500 block font-semibold">Incl. 18% GST</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* User Form Inputs */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                  {language === 'hi' ? 'आपका नाम (Full Name)' : 'Full Name'}
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Ramesh Kumar"
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                  {language === 'hi' ? 'मोबाइल नंबर (Mobile Number)' : 'Mobile Phone Number (+91)'}
                </label>
                <input 
                  type="tel" 
                  placeholder="e.g. 9876543210"
                  value={userPhoneInput}
                  onChange={(e) => setUserPhoneInput(e.target.value)}
                  className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Gateway feature list */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Razorpay Online Gateway Supports:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Check size={13} className="text-emerald-500 shrink-0" />
                  <span>Google Pay / PhonePe / Paytm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={13} className="text-emerald-500 shrink-0" />
                  <span>RuPay / Visa / MasterCard</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={13} className="text-emerald-500 shrink-0" />
                  <span>Net Banking (All Indian Banks)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={13} className="text-emerald-500 shrink-0" />
                  <span>Instant Verification</span>
                </div>
              </div>
            </div>

            {/* Primary Action CTA */}
            <button
              type="button"
              onClick={handleTriggerRazorpay}
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black py-3.5 rounded-xl shadow-xl text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
            >
              <Zap size={16} className="fill-white" />
              <span>
                {isSubmitting 
                  ? (language === 'hi' ? 'गेटवे शुरू हो रहा है...' : 'Opening Gateway...') 
                  : (language === 'hi' ? `Razorpay से ₹${amount} पे करें` : `Pay ₹${amount} via Razorpay`)}
              </span>
            </button>

            <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-indigo-500" /> 256-Bit SSL
              </span>
              <span>•</span>
              <span>100% Secure Transaction</span>
              <span>•</span>
              <span>Instant Activation</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
