import React, { useState, useEffect } from 'react';
import { 
  Wallet, PlusCircle, CheckCircle2, X, ArrowUpRight, ArrowDownLeft, 
  QrCode, ShieldCheck, Zap, Sparkles, Copy, Check, CreditCard, Clock, RefreshCw, AlertCircle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { launchUpiPayment } from '../utils/upiHelper';
import { triggerRazorpayPayment } from '../utils/razorpay';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'RECHARGE' | 'BUY_PLAN' | 'HISTORY';
}

export default function WalletModal({ isOpen, onClose, defaultTab = 'RECHARGE' }: WalletModalProps) {
  const { 
    walletBalance, 
    walletTransactions, 
    addWalletBalance, 
    payWithWallet, 
    paymentSettings, 
    subscriptionPlans, 
    isSubscribed, 
    subscriptionInfo,
    userProfile,
    verifyAndRecordUtr
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'RECHARGE' | 'BUY_PLAN' | 'HISTORY'>(defaultTab);
  const [rechargeAmount, setRechargeAmount] = useState<number>(499);
  const [customAmountInput, setCustomAmountInput] = useState<string>('');
  const [utrInput, setUtrInput] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ⏱️ QR Code Validity Countdown Timer (5 Minutes = 300 Seconds)
  const INITIAL_TIMER_SECONDS = 300;
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIMER_SECONDS);

  useEffect(() => {
    if (!isOpen || activeTab !== 'RECHARGE') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, activeTab]);

  const handleResetTimer = () => {
    setTimeLeft(INITIAL_TIMER_SECONDS);
    setStatusMsg(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(paymentSettings.upiId || 'onediary@okaxis');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConfirmAddMoney = () => {
    const finalAmount = rechargeAmount;
    if (!finalAmount || finalAmount <= 0) {
      setStatusMsg({ type: 'error', text: 'कृपया सही राशि चुनें या दर्ज करें!' });
      return;
    }

    if (timeLeft === 0) {
      setStatusMsg({ type: 'error', text: 'क्यूआर कोड का समय समाप्त हो गया है! कृपया टाइमर रीसेट करके पुनः प्रयास करें।' });
      return;
    }

    // 🛡️ Strict UTR Verification & Replay Protection
    const verifyResult = verifyAndRecordUtr(
      utrInput,
      finalAmount,
      'WALLET',
      `Wallet Recharge ₹${finalAmount}`
    );

    if (!verifyResult.success) {
      setStatusMsg({ type: 'error', text: verifyResult.reason || 'अमान्य अथवा प्रयुक्त UTR नंबर!' });
      return;
    }

    const cleanUtr = verifyResult.finalUtr;

    addWalletBalance(
      finalAmount, 
      cleanUtr, 
      `वॉलेट रिचार्ज (UPI QR Code)`
    );

    setStatusMsg({ type: 'success', text: `🎉 सफलता! ₹${finalAmount} आपके वॉलेट में तुरंत जोड़ दिए गए हैं! (Ref UTR: ${cleanUtr})` });
    setUtrInput('');
    setTimeout(() => {
      setStatusMsg(null);
    }, 4000);
  };

  const handleBuyPlanWithWallet = (planId: string, planName: string, price: number, workersLimit: number) => {
    const result = payWithWallet(planId, planName, price, workersLimit);
    if (result.success) {
      setStatusMsg({ type: 'success', text: `🚀 बधाई हो! ${planName} (₹${price}) का सब्सक्रिप्शन वॉलेट से सफलता से एक्टिवेट हो गया है!` });
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setStatusMsg({ type: 'error', text: result.reason || 'पर्याप्त वॉलेट बैलेंस नहीं है।' });
    }
  };

  const currentUpiId = paymentSettings.upiId || 'onediary@okaxis';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=upi://pay?pa=${encodeURIComponent(currentUpiId)}%26pn=OneDiary%26am=${rechargeAmount}%26cu=INR`;

  const handleLaunchUpiApp = (appName: string) => {
    launchUpiPayment({
      upiId: currentUpiId,
      payeeName: 'OneDiary',
      amount: rechargeAmount,
      note: 'Wallet Recharge',
      appName
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto space-y-0">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-15 pointer-events-none">
            <Wallet size={120} />
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md">
                <Wallet size={22} />
              </div>
              <div>
                <h2 className="text-base font-black flex items-center gap-1.5">
                  ठेकेदार डिजिटल वॉलेट (Contractor Wallet)
                </h2>
                <p className="text-[11px] text-indigo-200 font-medium">
                  {userProfile?.name || 'Contractor'} • Digital Wallet Account
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Balance Display Card */}
          <div className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center justify-between relative z-10">
            <div>
              <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block">
                उपलब्ध वॉलेट बैलेंस (Wallet Balance)
              </span>
              <span className="text-3xl font-black text-amber-300 drop-shadow-sm">
                ₹ {walletBalance.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={() => setActiveTab('RECHARGE')}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle size={16} />
              <span>पैसे जोड़ें</span>
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('RECHARGE')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'RECHARGE' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <QrCode size={14} />
            <span>1. वॉलेट में पैसे जोड़ें (UPI QR)</span>
          </button>

          <button
            onClick={() => setActiveTab('BUY_PLAN')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'BUY_PLAN' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Zap size={14} />
            <span>2. वॉलेट से प्लान लें</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'HISTORY' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <CreditCard size={14} />
            <span>इतिहास ({walletTransactions.length})</span>
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMsg && (
          <div className={`p-3 text-xs font-black text-center flex items-center justify-center gap-2 ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-500 text-slate-950 border-b border-emerald-400' 
              : 'bg-rose-500 text-white border-b border-rose-400'
          }`}>
            <Sparkles size={16} />
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* TAB 1: RECHARGE WALLET VIA UPI QR */}
        {activeTab === 'RECHARGE' && (
          <div className="p-3 sm:p-4 space-y-3 flex-1 overflow-y-auto pb-10">
            {/* Amount Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 block">
                1. रिचार्ज राशि चुनें (Select Amount to Add):
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[199, 499, 999, 2999].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setRechargeAmount(amt); setCustomAmountInput(''); }}
                    className={`py-1.5 px-1 rounded-xl border text-xs font-black transition cursor-pointer text-center ${
                      rechargeAmount === amt && !customAmountInput
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/30'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    ₹ {amt}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="flex items-center gap-2 pt-0.5">
                <input 
                  type="number"
                  placeholder="अन्य राशि दर्ज करें (e.g. 500)"
                  value={customAmountInput}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCustomAmountInput(e.target.value);
                    if (val > 0) setRechargeAmount(val);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>
            </div>

            {/* PAYMENT GATEWAY RECHARGE */}
            <div className="space-y-3 bg-gradient-to-b from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/60 dark:to-purple-950/60 p-4 rounded-2xl border-2 border-indigo-500 shadow-md text-left">
              <div className="flex items-center justify-between border-b border-indigo-200 dark:border-indigo-800/60 pb-2">
                <label className="text-xs font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <CreditCard size={15} className="text-indigo-600 dark:text-indigo-400" />
                  <span>सुरक्षित Razorpay ऑनलाइन वॉलेट रिचार्ज</span>
                </label>
                <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                  100% Instant
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                Razorpay द्वारा UPI (GPay, PhonePe, Paytm), Debit/Credit Card और NetBanking से सीधे ₹{rechargeAmount} अपने वॉलेट में जोड़ें।
              </p>

              <button 
                type="button"
                onClick={() => {
                  triggerRazorpayPayment({
                    amount: rechargeAmount,
                    planName: `Wallet Recharge (₹${rechargeAmount})`,
                    userName: userProfile?.name || "Contractor",
                    userPhone: userProfile?.phone || "9876543210",
                    keyId: paymentSettings?.razorpayKeyId,
                    keySecret: paymentSettings?.razorpayKeySecret,
                    onSuccess: (paymentId) => {
                      addWalletBalance(rechargeAmount, paymentId, `वॉलेट रिचार्ज (Razorpay)`);
                      setStatusMsg({ type: 'success', text: `🎉 सफलता! ₹${rechargeAmount} Razorpay द्वारा आपके वॉलेट में जोड़ दिए गए हैं!` });
                      setTimeout(() => setStatusMsg(null), 3000);
                    },
                    onFailure: (err) => {
                      setStatusMsg({ type: 'error', text: err?.message || 'पेमेंट रद्द कर दिया गया या विफल रहा।' });
                      setTimeout(() => setStatusMsg(null), 4000);
                    }
                  });
                }} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white py-3.5 rounded-xl font-black shadow-lg transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <Zap size={16} className="fill-white" />
                <span>Razorpay से ₹{rechargeAmount} तुरंत वॉलेट में जोड़ें</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 pt-1">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>256-Bit SSL Secured • Razorpay Gateway Official</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BUY PLAN WITH WALLET */}
        {activeTab === 'BUY_PLAN' && (
          <div className="p-5 space-y-3 max-h-[480px] overflow-y-auto">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              ⚡ अपने वॉलेट बैलेंस (₹{walletBalance}) से 1-क्लिक में तुरंत प्लान एक्टिवेट करें:
            </p>

            {subscriptionPlans.map((plan) => {
              const isCurrentActive = isSubscribed && (subscriptionInfo?.planId === plan.id || subscriptionInfo?.amount === plan.price);
              const canAfford = walletBalance >= plan.price;

              return (
                <div 
                  key={plan.id}
                  className={`p-4 rounded-2xl border transition space-y-2 ${
                    isCurrentActive
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        {plan.name}
                        {isCurrentActive && (
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </h4>
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {plan.workersLimit === 999999 ? 'Unlimited Labour' : `${plan.workersLimit} Labour Capacity`}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        ₹{plan.price}
                      </span>
                      <span className="text-[10px] text-slate-500 block">/{plan.duration}</span>
                    </div>
                  </div>

                  {isCurrentActive ? (
                    <div className="w-full py-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs rounded-xl text-center border border-emerald-300 dark:border-emerald-700 flex items-center justify-center gap-1.5">
                      <ShieldCheck size={16} />
                      <span>आपका वर्तमान में यही प्लान एक्टिव है</span>
                    </div>
                  ) : plan.price === 0 ? (
                    <div className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl text-center">
                      Default Free Plan
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!canAfford) {
                          setActiveTab('RECHARGE');
                          setRechargeAmount(plan.price - walletBalance);
                          setStatusMsg({ 
                            type: 'error', 
                            text: `पर्याप्त वॉलेट बैलेंस नहीं है। ₹${plan.price - walletBalance} और जोड़ें!` 
                          });
                        } else {
                          handleBuyPlanWithWallet(plan.id, plan.name, plan.price, plan.workersLimit);
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                        canAfford
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                      }`}
                    >
                      <Zap size={16} />
                      <span>
                        {canAfford 
                          ? `वॉलेट से ₹${plan.price} में खरीदें (1-Click Activate)` 
                          : `कम पड़ रहे हैं ₹${plan.price - walletBalance} (रिचार्ज करें)`}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: WALLET TRANSACTION HISTORY */}
        {activeTab === 'HISTORY' && (
          <div className="p-5 space-y-3 max-h-[480px] overflow-y-auto">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
              📜 आपके वॉलेट लेन-देन का इतिहास (Wallet History):
            </h4>

            {walletTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Wallet size={36} className="mx-auto opacity-30" />
                <p className="text-xs font-semibold">अभी तक कोई वॉलेट लेन-देन नहीं हुआ है।</p>
              </div>
            ) : (
              <div className="space-y-2">
                {walletTransactions.map((tx) => (
                  <div 
                    key={tx.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center shrink-0 ${
                        tx.type === 'CREDIT' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {tx.type === 'CREDIT' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </div>

                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">
                          {tx.description}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          {tx.utr ? ` • UTR: ${tx.utr}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-black block ${
                        tx.type === 'CREDIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {tx.type === 'CREDIT' ? '+' : '-'} ₹{tx.amount}
                      </span>
                      <span className="text-[9px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-md font-bold text-slate-700 dark:text-slate-300">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
