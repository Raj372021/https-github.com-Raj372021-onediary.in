import React, { useState } from "react";
import { CheckCircle2, ArrowLeft, Zap, ShieldCheck, Wallet, QrCode, Crown, Sparkles, Star, Award, ShoppingCart, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";
import WalletModal from "../components/WalletModal";
import InstantPlanPaymentModal from "../components/InstantPlanPaymentModal";

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const { 
    formatCurrency, 
    subscriptionPlans, 
    isSubscribed, 
    subscriptionInfo, 
    walletBalance,
    cart,
    addToCart,
    clearCart
  } = useAppContext();
  const { language } = useLanguage();

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [cartToastPlan, setCartToastPlan] = useState<{ id: string; name: string; price: number } | null>(null);
  const [instantModalState, setInstantModalState] = useState<{
    isOpen: boolean;
    planId: string;
    planName: string;
    amount: number;
    workersLimit?: number;
  }>({
    isOpen: false,
    planId: '',
    planName: '',
    amount: 0,
    workersLimit: 0
  });

  const openInstantPayment = (planId: string, planName: string, price: number, workersLimit: number) => {
    setInstantModalState({
      isOpen: true,
      planId,
      planName,
      amount: price,
      workersLimit
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white pb-24 relative overflow-x-hidden">
      {/* Background Subtle Ambient Blue Light Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 p-5 pt-[calc(1rem+env(safe-area-inset-top))] border-b border-blue-500/30 relative z-10 shadow-lg">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0 cursor-pointer text-white"
              title="Go Back"
            >
              <ArrowLeft size={22} />
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <Crown className="w-5 h-5 text-amber-400 animate-bounce" />
                <h1 className="text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-blue-200 to-amber-200">
                  VIP Gold & Platinum Plans
                </h1>
              </div>
              <p className="text-[11px] text-blue-200/80 font-medium">
                {language === 'hi' ? 'गोल्ड व प्लेटिनम प्रीमियम सब्सक्रिप्शन' : 'Luxury VIP Subscription Membership'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Cart Header Button */}
            <button
              onClick={() => {
                if (cart.length > 0) {
                  navigate(`/payment?plan=${cart[0].id}&amount=${cart[0].price}`);
                } else {
                  alert(language === 'hi' ? 'कृपया नीचे से कोई सब्सक्रिप्शन प्लान चुनें।' : 'Please select a subscription plan below.');
                }
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-full shadow-lg relative transition cursor-pointer border border-slate-700 shrink-0"
              title="View Cart / Checkout"
            >
              <ShoppingCart size={16} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white font-black text-[9px] w-5.5 h-5.5 rounded-full flex items-center justify-center border border-slate-900">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Wallet Header Button */}
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition cursor-pointer border border-amber-300/60"
            >
              <Wallet size={14} />
              <span>₹{walletBalance}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 max-w-md mx-auto w-full space-y-5 relative z-10">
        {subscriptionPlans.map((plan) => {
          const isCurrentActive = isSubscribed && (subscriptionInfo?.planId === plan.id || subscriptionInfo?.amount === plan.price);
          const isGold = plan.id === 'plan_499' || plan.price === 499;
          const isPlatinum = plan.id === 'plan_2999_year' || plan.price === 2999;
          const isStarter = plan.id === 'plan_199' || plan.price === 199;

          return (
            <div key={plan.id} className="rotating-blue-thin-card-wrapper my-3">
              <div 
                className={`rotating-blue-thin-card-inner rounded-2xl p-4 sm:p-5 relative border backdrop-blur-md transition-all ${
                  isCurrentActive 
                    ? 'bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 border-emerald-400/80'
                    : isPlatinum 
                    ? 'bg-gradient-to-b from-slate-950 via-blue-950/70 to-slate-950 border-blue-400/60 text-white' 
                    : isGold 
                    ? 'bg-gradient-to-b from-slate-950 via-amber-950/80 to-slate-950 border-amber-400/60 text-white' 
                    : isStarter
                    ? 'bg-gradient-to-b from-slate-950 via-blue-950/80 to-slate-950 border-blue-400/60 text-white'
                    : 'bg-slate-900 border-slate-700'
                }`}
              >
                {/* VIP Badge Header */}
                {isCurrentActive ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[11px] px-3.5 py-1 rounded-full flex items-center shadow-lg gap-1 border border-emerald-300">
                    <ShieldCheck size={13} />
                    <span>ACTIVE PLAN (एक्टिव)</span>
                  </div>
                ) : isPlatinum ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-black text-[11px] px-3.5 py-1 rounded-full flex items-center shadow-xl gap-1 border border-blue-300">
                    <Sparkles size={13} className="text-amber-300 fill-amber-300" />
                    <span>👑 PLATINUM VIP (60% बचत)</span>
                  </div>
                ) : isGold ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-[11px] px-3.5 py-1 rounded-full flex items-center shadow-xl gap-1 border border-amber-200">
                    <Crown size={13} className="text-slate-950" />
                    <span>⭐ GOLD VIP (15 लेबर)</span>
                  </div>
                ) : isStarter ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-[11px] px-3.5 py-1 rounded-full flex items-center shadow-xl gap-1 border border-blue-300">
                    <Zap size={13} className="text-amber-300" />
                    <span>⚡ STARTER VIP (5 लेबर)</span>
                  </div>
                ) : null}

                {/* Plan Header Info */}
                <div className="flex items-start justify-between gap-2 mt-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-black text-white tracking-wide">
                        {plan.name}
                      </h2>
                      {isGold && <Award size={16} className="text-amber-400" />}
                      {isPlatinum && <Crown size={16} className="text-blue-400 fill-blue-400" />}
                    </div>
                    <p className="text-[11px] font-bold text-blue-200/90 mt-0.5">
                      {plan.workersLimit === 999999 ? 'Unlimited Workers (अनलिमिटेड मजदूर)' : `Up to ${plan.workersLimit} Workers (${plan.workersLimit} लेबर)`}
                      {plan.duration === 'year' && ' · 1 Year VIP'}
                    </p>
                  </div>

                  {/* Price Tag */}
                  <div className="text-right">
                    {plan.price === 0 ? (
                      <span className="text-2xl font-black text-slate-300">Free</span>
                    ) : (
                      <div className="flex items-baseline justify-end gap-0.5">
                        <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-amber-200">
                          {formatCurrency(plan.price)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">/{plan.duration === 'month' ? 'महीना' : 'साल'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compact Feature Bullet Points */}
                <div className="grid grid-cols-1 gap-1.5 my-3 pt-2 border-t border-slate-800/80">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-xs text-slate-200 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-400 mr-2 shrink-0" />
                      <span className="text-[11px]">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                {isCurrentActive ? (
                  <div className="w-full py-2.5 bg-emerald-950/80 text-emerald-300 font-extrabold rounded-xl text-center border border-emerald-500/60 flex items-center justify-center gap-2 text-xs">
                    <ShieldCheck size={16} />
                    <span>{language === 'hi' ? 'यह प्लान एक्टिव है' : 'Active Plan Enrolled'}</span>
                  </div>
                ) : plan.price === 0 ? (
                  <div className="w-full py-2 bg-slate-800 text-slate-400 font-bold rounded-xl text-center text-xs border border-slate-700">
                    Default Free Plan
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    {/* Subscription Button */}
                    <button 
                      onClick={() => {
                        openInstantPayment(plan.id, plan.name, plan.price, plan.workersLimit);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl transition text-xs sm:text-sm border border-blue-400/60 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 active:scale-98"
                    >
                      <Crown size={16} className="text-amber-300" />
                      <span>{language === 'hi' ? `✨ सब्सक्रिप्शन लें (Subscription - ₹${plan.price})` : `✨ Get Subscription (₹${plan.price})`}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      {/* Instant Plan Payment Modal */}
      <InstantPlanPaymentModal
        isOpen={instantModalState.isOpen}
        onClose={() => setInstantModalState(prev => ({ ...prev, isOpen: false }))}
        planId={instantModalState.planId}
        planName={instantModalState.planName}
        amount={instantModalState.amount}
        workersLimit={instantModalState.workersLimit}
        onSuccessRedirect={() => {
          setInstantModalState(prev => ({ ...prev, isOpen: false }));
          navigate('/workers');
        }}
      />

      {/* Plan Added to Cart Dialog */}
      {cartToastPlan && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-slate-900 border border-blue-500/50 rounded-2xl p-4 shadow-2xl z-50 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <ShoppingBag size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-white">
                {language === 'hi' ? '✨ सब्सक्रिप्शन प्लान चुना गया!' : '✨ Subscription plan selected!'}
              </p>
              <p className="text-[10px] text-blue-200/80 font-bold">
                {cartToastPlan.name} (₹{cartToastPlan.price})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCartToastPlan(null)}
              className="px-2.5 py-1.5 hover:bg-white/10 rounded-lg text-[10px] font-black text-slate-300 transition cursor-pointer"
            >
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </button>
            <button
              onClick={() => {
                setCartToastPlan(null);
                navigate(`/payment?plan=${cartToastPlan.id}&amount=${cartToastPlan.price}`);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg text-[10px] shadow transition cursor-pointer"
            >
              {language === 'hi' ? 'चेकआउट (Pay)' : 'Checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureItem({ text, textColor = "text-slate-200" }: { text: string; textColor?: string; key?: any }) {
  return (
    <div className="flex items-start">
      <CheckCircle2 size={15} className="text-emerald-400 mr-2 shrink-0 mt-0.5" />
      <span className={`${textColor} text-xs`}>{text}</span>
    </div>
  );
}

