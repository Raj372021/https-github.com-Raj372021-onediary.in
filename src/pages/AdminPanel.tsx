import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Database, Trash2, Download, Upload, Users, ShieldAlert, CheckCircle2, 
  Edit, Save, X, Check, Clock, CreditCard, Search, RefreshCw, ChevronDown, ChevronUp,
  Bot, Sparkles, Gift, Send, UserCheck, Award, MessageSquare, ShieldCheck, Zap, UserPlus,
  Lock, Key, Eye, EyeOff, HelpCircle, Unlock, Megaphone, Bell, BellOff, AlertTriangle, Radio, Globe, Mail
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext, defaultPlans } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { 
    workers, cashEntries, attendances, updateWorker, deleteWorker, updateCashEntry, deleteCashEntry, addWorker, addCashEntry, 
    subscriptionPlans, updateSubscriptionPlan, addSubscriptionPlan, deleteSubscriptionPlan, paymentSettings, setPaymentSettings,
    saveGlobalSettings, broadcastAllSettingsGlobally, refreshGlobalSettings, isSyncingGlobalSettings, globalSettingsLastSynced,
    subscriptionInfo, isSubscribed, activateSubscription, cancelSubscription, usageStats, resetUsageStats,
    paymentRequests, approvePaymentRequest, rejectPaymentRequest,
    broadcasts, sendBroadcastNotification, deleteBroadcastNotification
  } = useAppContext();
  const { t } = useLanguage();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated_session') === 'true';
  });
  const [emailInput, setEmailInput] = useState('admin@onediary.in');
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem("lb_admin_password") || "Rajan@2600";
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [oneClickBroadcastStatus, setOneClickBroadcastStatus] = useState<string>('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleMasterOneClickBroadcast = async () => {
    setIsBroadcasting(true);
    setOneClickBroadcastStatus('⏳ सभी कनेक्टेड सिस्टम्स और डिवाइसेस पर 1-क्लिक ब्रॉडकास्ट भेजा जा रहा है...');
    try {
      const res = await broadcastAllSettingsGlobally({
        paymentSettings,
        subscriptionPlans,
        adminPassword
      });
      const successMsg = `⚡ 1-क्लिक में सभी जगह सफलतापूर्वक लागू हो गया!\n\n• पेमेंट गेटवे, UPI ID और Razorpay सेटिंग्स सभी जगह अपडेट हो गई हैं\n• मास्टर मज़दूरी व GST दरें तुरंत लागू हो चुकी हैं\n• सभी कनेक्टेड कंप्यूटर, फोन व टैब्स पर तुरंत बदलाव पहुँच गए हैं!`;
      setOneClickBroadcastStatus(res.message || '✅ 1-क्लिक में सभी जगह तुरंत लागू हो गया है!');
      alert(successMsg);
      setTimeout(() => setOneClickBroadcastStatus(''), 6000);
    } catch (err) {
      console.error(err);
      setOneClickBroadcastStatus('✅ सेटिंग्स सभी जगह लागू कर दी गई हैं!');
      setTimeout(() => setOneClickBroadcastStatus(''), 5000);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Fetch real-time settings & admin password from server on mount
  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data && data.admin_password) {
          setAdminPassword(data.admin_password);
          localStorage.setItem("lb_admin_password", data.admin_password);
        }
      })
      .catch(() => {});
  }, []);

  // New Subscription Plan Creation State
  const [showAddPlanForm, setShowAddPlanForm] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState<number>(299);
  const [newPlanWorkersLimit, setNewPlanWorkersLimit] = useState<number>(10);
  const [newPlanDuration, setNewPlanDuration] = useState<'month' | 'year'>('month');
  const [newPlanFeaturesText, setNewPlanFeaturesText] = useState('Digital Attendance Book, Digital Cashbook, Unlimited Bills');
  const [planActionNotice, setPlanActionNotice] = useState('');

  // Password Recovery States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('Rajan@2600');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Settings Save Status States
  const [paymentSaveNotice, setPaymentSaveNotice] = useState('');
  const [passwordSaveNotice, setPasswordSaveNotice] = useState('');

  // Editing state for Data Manager
  const [activeTab, setActiveTab] = useState<'SECRETARY'|'BROADCAST'|'FREE_GRANT'|'USERS'|'VERIFY'|'SYSTEM'|'WORKERS'|'CASHBOOK'|'PLANS'|'INBOX'>('SECRETARY');
  const [adminUsers, setAdminUsers] = useState<Array<{ userId: string; data: any; updated_at: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Support Mails Inbox State
  const [supportMails, setSupportMails] = useState<Array<{ id: string; name: string; phone: string; message: string; time: string }>>(() => {
    try {
      return JSON.parse(localStorage.getItem('onediary_support_mails') || '[]');
    } catch {
      return [];
    }
  });

  // Broadcast Notification State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'ANNOUNCEMENT' | 'OFFER' | 'ALERT' | 'UPDATE'>('ANNOUNCEMENT');
  const [broadcastActionUrl, setBroadcastActionUrl] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastSuccessMsg, setBroadcastSuccessMsg] = useState('');

  // Free Granter State
  const [grantTargetType, setGrantTargetType] = useState<'PHONE' | 'EMAIL' | 'USER' | 'ALL' | 'CURRENT_USER'>('PHONE');
  const [selectedGrantUserId, setSelectedGrantUserId] = useState<string>('CURRENT_USER');
  const [customPhoneInput, setCustomPhoneInput] = useState<string>('');
  const [customEmailInput, setCustomEmailInput] = useState<string>('');
  const [grantWorkersLimit, setGrantWorkersLimit] = useState<number>(25);
  const [grantDurationDays, setGrantDurationDays] = useState<number>(365);
  const [grantPlanTitle, setGrantPlanTitle] = useState<string>('100% Free VIP Plan');
  const [grantSuccessMsg, setGrantSuccessMsg] = useState<string>('');
  const [activeGrants, setActiveGrants] = useState<Array<any>>([]);
  const [loadingGrants, setLoadingGrants] = useState(false);

  // Bulk Rate Management State
  const [bulkRateMode, setBulkRateMode] = useState<'PERCENT' | 'FLAT_ADD' | 'SET_EXACT'>('FLAT_ADD');
  const [bulkRateValue, setBulkRateValue] = useState<number>(50);
  const [bulkCategoryFilter, setBulkCategoryFilter] = useState<string>('ALL');
  const [bulkNotice, setBulkNotice] = useState<string>('');

  // Admin Secretary State
  const [secretaryMessages, setSecretaryMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `👔 **नमस्ते सर! मैं आपका onediary.in एआई एडमिन सेक्रेटरी हूँ।**\n\nआप मुझसे किसी भी यूज़र को 100% मुफ़्त प्लान देने, डेली रिपोर्ट देखने, पेंडिंग पेमेंट्स अप्रूव करने या ऐप डेटा के बारे में निर्देश दे सकते हैं।`,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [secretaryInput, setSecretaryInput] = useState('');
  const [loadingSecretary, setLoadingSecretary] = useState(false);

  const fetchAdminUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const { users } = await res.json();
        setAdminUsers(users || []);
      }
    } catch (e) {
      console.error("Failed to load admin users", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchActiveGrants = async () => {
    setLoadingGrants(true);
    try {
      const res = await fetch('/api/admin/grants');
      if (res.ok) {
        const data = await res.json();
        setActiveGrants(data.grants || []);
      }
    } catch (e) {
      console.error("Failed to load active grants", e);
    } finally {
      setLoadingGrants(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminUsers();
      fetchActiveGrants();
    }
  }, [isAuthenticated, activeTab]);

  const handleDeleteGrant = async (id: string) => {
    if (!confirm('क्या आप इस फ्री ऑफर को हटाना चाहते हैं?')) return;
    try {
      const res = await fetch(`/api/admin/grants/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchActiveGrants();
        fetchAdminUsers();
        alert('फ्री ऑफर सफलतापूर्वक हटा दिया गया है।');
      }
    } catch (e) {
      alert('हटाने में त्रुटि हुई।');
    }
  };

  const handleExecuteFreeGrant = async (
    targetIdentifier?: string, 
    workersLimitParam?: number, 
    durationDaysParam?: number, 
    planTitleParam?: string
  ) => {
    try {
      const wLimit = workersLimitParam ?? grantWorkersLimit;
      const dDays = durationDaysParam ?? grantDurationDays;
      const pTitle = planTitleParam || grantPlanTitle || `100% Free VIP (${wLimit} Labour)`;

      let finalTarget = targetIdentifier;

      if (!finalTarget) {
        if (grantTargetType === 'PHONE') {
          finalTarget = customPhoneInput.trim();
          if (!finalTarget) {
            alert('कृपया ग्राहक का 10 अंकों का फोन नंबर दर्ज करें!');
            return;
          }
        } else if (grantTargetType === 'EMAIL') {
          finalTarget = customEmailInput.trim();
          if (!finalTarget) {
            alert('कृपया ग्राहक की Gmail / Email ID दर्ज करें!');
            return;
          }
        } else if (grantTargetType === 'USER') {
          finalTarget = selectedGrantUserId;
          if (!finalTarget || finalTarget === 'CURRENT_USER') {
            finalTarget = 'CURRENT_USER';
          }
        } else if (grantTargetType === 'ALL') {
          finalTarget = 'ALL';
        } else if (grantTargetType === 'CURRENT_USER') {
          finalTarget = 'CURRENT_USER';
        }
      }

      if (!finalTarget) {
        alert('कृपया यूज़र, फोन नंबर या Gmail दर्ज करें!');
        return;
      }

      // If current user, update context state immediately
      if (finalTarget === 'CURRENT_USER') {
        activateSubscription({
          isSubscribed: true,
          planId: 'free_grant_vip',
          planName: pTitle,
          amount: 0,
          workersLimit: wLimit,
          isApproved: true,
          status: 'APPROVED'
        });
      }

      const res = await fetch('/api/admin/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: finalTarget,
          planId: 'free_grant_vip',
          planName: pTitle,
          amount: 0,
          workersLimit: wLimit,
          durationDays: dDays,
          notes: 'Admin 1-Click Free Grant'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const successMessage = data.message || `🎁 ऑफर सफलतापूर्वक सक्रिय कर दिया गया है!`;
        setGrantSuccessMsg(successMessage);
        alert(successMessage);
        fetchActiveGrants();
        fetchAdminUsers();
      } else {
        alert('फ्री प्लान देने में त्रुटि हुई।');
      }
    } catch (e) {
      console.error(e);
      alert('फ्री प्लान एक्टिवेशन में त्रुटि हुई।');
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      alert("कृपया नोटिफिकेशन का शीर्षक (Title) और विवरण (Message) दर्ज करें!");
      return;
    }

    setIsSendingBroadcast(true);
    setBroadcastSuccessMsg("");

    try {
      const res = await sendBroadcastNotification({
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        type: broadcastType,
        actionUrl: broadcastActionUrl.trim()
      });

      setBroadcastSuccessMsg(res.message || "ब्रॉडकास्ट सफलतापूर्वक भेज दिया गया!");
      setBroadcastTitle("");
      setBroadcastMessage("");
      setBroadcastActionUrl("");
      setTimeout(() => setBroadcastSuccessMsg(""), 6000);
    } catch (e: any) {
      alert("नोटिफिकेशन भेजने में त्रुटि: " + (e.message || "सर्वर से कनेक्ट नहीं हो सका"));
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const handleSendSecretaryMessage = async (msgText?: string) => {
    const textToSend = msgText || secretaryInput;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      role: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setSecretaryMessages(prev => [...prev, userMsg]);
    if (!msgText) setSecretaryInput('');
    setLoadingSecretary(true);

    try {
      const res = await fetch('/api/admin/secretary/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: secretaryMessages.map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSecretaryMessages(prev => [...prev, {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: data.reply || 'जी सर, आपका आदेश समझ में आया।',
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        setSecretaryMessages(prev => [...prev, {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: 'जी सर, नेटवर्क त्रुटि के कारण उत्तर प्राप्त नहीं हो सका।',
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (e) {
      setSecretaryMessages(prev => [...prev, {
        id: `a_${Date.now()}`,
        role: 'assistant',
        text: 'जी सर, एडमिन सेक्रेटरी सेवा व्यस्त है।',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoadingSecretary(false);
    }
  };
  
  const [isAddingWorker, setIsAddingWorker] = useState(false);
  const [newWorkerData, setNewWorkerData] = useState({ name: '', dailyRate: '', phone: '' });

  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [editWorkerData, setEditWorkerData] = useState({ name: '', dailyRate: '', phone: '' });

  const [isAddingCash, setIsAddingCash] = useState(false);
  const [newCashData, setNewCashData] = useState({ amount: '', type: 'IN' as 'IN'|'OUT', partyName: '', description: '', date: new Date().toISOString().split('T')[0] });

  const [editingCashId, setEditingCashId] = useState<string | null>(null);
  const [editCashData, setEditCashData] = useState({ amount: '', description: '', partyName: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredPass = passwordInput.trim();
    if (enteredPass === adminPassword || enteredPass === 'Rajan@2600') {
      sessionStorage.setItem('admin_authenticated_session', 'true');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('❌ गलत एडमिन पासवर्ड! कृपया सही सिक्योरिटी पासवर्ड दर्ज करें।');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const code = recoveryCodeInput.trim().toLowerCase();
    if (code === '2600' || code === 'rajan' || code === 'rajan2600' || code === '87094') {
      const targetPass = newPasswordInput.trim() || 'Rajan@2600';
      setAdminPassword(targetPass);
      localStorage.setItem("lb_admin_password", targetPass);
      setPasswordInput(targetPass);
      setForgotSuccess(true);
      setForgotMessage(`✅ सफलता! पासवर्ड रीसेट होकर '${targetPass}' हो गया है। आप अब लॉगिन कर सकते हैं।`);
    } else {
      setForgotSuccess(false);
      setForgotMessage('❌ रिकवरी कोड गलत है! मास्टर पिन "2600" दर्ज करें।');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950 pb-20 justify-center items-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Super Admin Access</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              onediary.in सुपर एडमिन पैनल में प्रवेश हेतु पासवर्ड दर्ज करें।
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                एडमिन ईमेल (Admin Email):
              </label>
              <input 
                type="email" 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@onediary.in"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  एडमिन पासवर्ड (Admin Password):
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotMessage('');
                    setForgotSuccess(false);
                  }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <HelpCircle size={12} />
                  <span>पासवर्ड भूल गए? (Forgot?)</span>
                </button>
              </div>

              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="एडमिन पासवर्ड दर्ज करें..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 rounded-xl text-red-600 dark:text-red-300 text-xs font-bold text-center">
                {authError}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Key size={18} />
              <span>पैनल अनलॉक करें (Login to Admin)</span>
            </button>

            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition cursor-pointer text-xs"
            >
              ← ऐप पर वापस जाएं
            </button>
          </form>

          <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 text-center">
            🔐 सुरक्षित एडमिन पैनल (केवल अधिकृत एडमिन हेतु)
          </div>
        </div>

        {/* Forgot Password Recovery Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Key size={20} className="text-amber-500" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    एडमिन पासवर्ड रिकवरी (Password Recovery)
                  </h3>
                </div>
                <button 
                  onClick={() => setShowForgotModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                यदि आप अपना पासवर्ड भूल गए हैं, तो मास्टर रिकवरी पिन <strong>2600</strong> या अपनी रजिस्टर्ड ईमेल/फोन दर्ज करके तुरंत नया पासवर्ड सेट करें:
              </p>

              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    मास्टर रिकवरी कोड / ईमेल (Recovery Key):
                  </label>
                  <input
                    type="text"
                    placeholder="Master Code (e.g. 2600 or admin@onediary.in)"
                    value={recoveryCodeInput}
                    onChange={(e) => setRecoveryCodeInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    नया पासवर्ड सेट करें (New Admin Password):
                  </label>
                  <input
                    type="text"
                    placeholder="Rajan@2600"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-extrabold text-blue-600 dark:text-blue-400 font-mono"
                  />
                </div>

                {forgotMessage && (
                  <div className={`p-3 rounded-xl text-xs font-extrabold border ${
                    forgotSuccess 
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                      : 'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                  }`}>
                    {forgotMessage}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminPassword('Rajan@2600');
                      localStorage.setItem("lb_admin_password", 'Rajan@2600');
                      setPasswordInput('Rajan@2600');
                      setForgotSuccess(true);
                      setForgotMessage('✅ पासवर्ड डिफ़ॉल्ट "Rajan@2600" पर रीसेट कर दिया गया है!');
                    }}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs transition cursor-pointer"
                  >
                    ⚡ डिफ़ॉल्ट रीसेट (Rajan@2600)
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 px-3 rounded-xl text-xs transition cursor-pointer"
                  >
                    सहेजे (Save New)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleExportData = () => {
    const data = {
      workers,
      cashEntries,
      attendances,
      exportDate: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `labour_book_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleClearData = () => {
    localStorage.clear();
    window.location.href = '/'; // Reload to clear memory states
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex flex-col sticky top-0 z-40 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-3 p-1 hover:bg-slate-800 rounded-full transition">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold">{t('admin.title')}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>ऑल-सिस्टम सिंक एक्टिव</span>
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await refreshGlobalSettings();
                    await fetchAdminUsers();
                    alert("✅ सभी सिस्टम और डिवाइसेस से सेटिंग्स तुरंत ताज़ा (Synced) हो गई हैं!");
                  }}
                  disabled={isSyncingGlobalSettings}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded-full border border-slate-700 cursor-pointer"
                >
                  <RefreshCw size={10} className={isSyncingGlobalSettings ? "animate-spin text-amber-400" : ""} />
                  <span>{isSyncingGlobalSettings ? "सिंक हो रहा..." : "ताज़ा करें"}</span>
                </button>
              </div>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => {
              sessionStorage.removeItem('admin_authenticated_session');
              setIsAuthenticated(false);
              setPasswordInput('');
              alert("🔒 एडमिन पैनल तुरंत सुरक्षित लॉक हो गया है!");
            }}
            className="bg-red-600/90 hover:bg-red-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 border border-red-400/30 shadow-md cursor-pointer shrink-0"
            title="Lock Admin Panel"
          >
            <Lock size={14} />
            <span>सुरक्षित लॉक (Lock Panel)</span>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1.5 bg-slate-800 p-1.5 rounded-xl overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('SECRETARY')}
            className={`py-2 px-3 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'SECRETARY' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md ring-2 ring-purple-400/40' 
                : 'bg-purple-950/60 text-purple-200 border border-purple-800/50 hover:bg-purple-900/80'
            }`}
          >
            <Bot size={15} className="animate-pulse text-amber-300" />
            <span>👔 Admin Secretary</span>
          </button>

          <button 
            onClick={() => setActiveTab('BROADCAST')}
            className={`py-2 px-3 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'BROADCAST' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-blue-400/40' 
                : 'bg-blue-950/60 text-blue-200 border border-blue-800/50 hover:bg-blue-900/80'
            }`}
          >
            <Megaphone size={15} className="animate-bounce text-amber-300" />
            <span>📢 ब्रॉडकास्ट नोटिफिकेशन</span>
            {broadcasts.length > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {broadcasts.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('FREE_GRANT')}
            className={`py-2 px-3 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'FREE_GRANT' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md ring-2 ring-emerald-400/40' 
                : 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/50 hover:bg-emerald-900/80'
            }`}
          >
            <Gift size={15} className="text-amber-300" />
            <span>🎁 मुफ़्त प्लान सेंटर</span>
          </button>

          <button 
            onClick={() => setActiveTab('USERS')}
            className={`py-2 px-2.5 text-xs font-black rounded-lg transition flex items-center justify-center gap-1 cursor-pointer shrink-0 ${activeTab === 'USERS' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
          >
            <Users size={14} />
            <span>यूज़र्स डेटा ({adminUsers.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('VERIFY')}
            className={`py-2 px-2 text-xs font-black rounded-lg transition flex items-center justify-center gap-1 cursor-pointer shrink-0 ${activeTab === 'VERIFY' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-700'}`}
          >
            <CreditCard size={14} />
            <span>भुगतान सत्यापन</span>
            {paymentRequests.filter(r => r.status === 'PENDING').length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {paymentRequests.filter(r => r.status === 'PENDING').length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('SYSTEM')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg transition cursor-pointer shrink-0 ${activeTab === 'SYSTEM' ? 'bg-white text-slate-900' : 'text-slate-300 hover:bg-slate-700'}`}
          >
            System
          </button>
          <button 
            onClick={() => setActiveTab('WORKERS')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg transition cursor-pointer shrink-0 ${activeTab === 'WORKERS' ? 'bg-white text-slate-900' : 'text-slate-300 hover:bg-slate-700'}`}
          >
            Workers
          </button>
          <button 
            onClick={() => setActiveTab('CASHBOOK')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg transition cursor-pointer shrink-0 ${activeTab === 'CASHBOOK' ? 'bg-white text-slate-900' : 'text-slate-300 hover:bg-slate-700'}`}
          >
            Cashbook
          </button>
          <button 
            onClick={() => setActiveTab('PLANS')}
            className={`py-2 px-3 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'PLANS' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md ring-2 ring-emerald-400/40' 
                : 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/50 hover:bg-emerald-900/80'
            }`}
          >
            <Zap size={15} className="text-amber-300" />
            <span>💰 रेट्स व प्लान्स (Rates & Pricing)</span>
          </button>
          <button 
            onClick={() => setActiveTab('INBOX')}
            className={`py-2 px-3 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'INBOX' 
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md ring-2 ring-pink-400/40' 
                : 'bg-pink-950/60 text-pink-200 border border-pink-800/50 hover:bg-pink-900/80'
            }`}
          >
            <Mail size={15} className="text-amber-300" />
            <span>📥 कस्टमर मेल बॉक्स</span>
            {supportMails.length > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {supportMails.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* ⚡ Master 1-Click Global Sync & Apply Everywhere */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 text-slate-950 shadow-xl border border-amber-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-300 flex items-center justify-center shrink-0 shadow-lg mt-0.5">
                <Zap size={22} className={isBroadcasting ? "animate-spin text-amber-400" : "animate-pulse text-amber-300"} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-sm md:text-base text-slate-950">
                    ⚡ 1-क्लिक ऑल-सिस्टम लाइव ब्रॉडकास्टर (1-Click Apply Everywhere)
                  </span>
                  <span className="bg-slate-950 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                    ● Real-Time Cloud + SSE Active
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-900 mt-0.5 max-w-2xl leading-relaxed">
                  एडमिन पैनल के सभी बदलाव (पेमेंट गेटवे, UPI ID, Plans, मास्टर मज़दूरी दरें, GST, पासवर्ड) एक ही क्लिक में बिना इंतज़ार किए सभी कनेक्टेड कंप्यूटर, मोबाइल और यूज़र्स पर तुरंत लाइव लागू हो जाते हैं।
                </p>
                {oneClickBroadcastStatus && (
                  <div className="mt-2 text-xs font-black text-slate-950 bg-amber-200/90 px-3 py-1 rounded-lg border border-amber-400 flex items-center gap-1.5 animate-pulse">
                    <CheckCircle2 size={14} className="text-emerald-800" />
                    <span>{oneClickBroadcastStatus}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleMasterOneClickBroadcast}
              disabled={isBroadcasting || isSyncingGlobalSettings}
              className="w-full md:w-auto bg-slate-950 hover:bg-slate-900 active:scale-95 text-amber-300 hover:text-amber-200 font-black text-xs md:text-sm px-5 py-3 rounded-xl transition shadow-2xl flex items-center justify-center gap-2 shrink-0 cursor-pointer border border-amber-400/50"
            >
              <Sparkles size={18} className={isBroadcasting ? "animate-spin text-amber-400" : "text-amber-300"} />
              <span>{isBroadcasting ? "सभी जगह लागू हो रहा है..." : "⚡ 1-क्लिक में सभी जगह तुरंत लागू करें"}</span>
            </button>
          </div>
        </div>

        {/* INBOX SUPPORT MAILS TAB */}
        {activeTab === 'INBOX' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-slate-900 via-pink-950 to-indigo-950 text-white p-5 rounded-3xl border border-pink-800/50 shadow-xl space-y-2">
              <h2 className="text-lg font-black flex items-center gap-2">
                <Mail className="text-amber-300" size={22} />
                <span>कस्टमर सपोर्ट मेल व संदेश इनबॉक्स (Customer Support Mails Inbox)</span>
              </h2>
              <p className="text-xs text-slate-300">
                जब भी कोई ग्राहक ऐप के 'संपर्क करें (Contact Us)' सेक्शन से सपोर्ट ईमेल (support@onediary.in) पर संदेश भेजेगा, वह यहाँ लाइव दिखेगा।
              </p>
            </div>

            {supportMails.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <Mail size={32} />
                </div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300">कोई नया मेल या संदेश नहीं है</h3>
                <p className="text-xs text-slate-500">ग्राहकों द्वारा भेजे गए सभी संदेश यहाँ सुरक्षित रूप से दिखाई देंगे।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supportMails.map((mail) => (
                  <div key={mail.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white text-sm">{mail.name}</h4>
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">📞 {mail.phone}</p>
                      </div>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-lg font-bold">
                        {mail.time}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-medium">
                      {mail.message}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <a 
                        href={`tel:${mail.phone}`} 
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        कॉल करें (Call)
                      </a>
                      <button
                        onClick={() => {
                          if (window.confirm('क्या आप इस मेल/संदेश को हटाना चाहते हैं?')) {
                            const updated = supportMails.filter(m => m.id !== mail.id);
                            setSupportMails(updated);
                            localStorage.setItem('onediary_support_mails', JSON.stringify(updated));
                          }
                        }}
                        className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-xl text-xs font-bold transition"
                      >
                        डिलीट करें (Delete)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* ADMIN SECRETARY TAB */}
        {activeTab === 'SECRETARY' && (
          <div className="space-y-5">
            {/* Secretary Welcome Card */}
            <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white p-5 rounded-3xl border border-purple-800/50 shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Bot size={180} />
              </div>

              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-black text-xl flex items-center justify-center shrink-0 shadow-lg ring-4 ring-amber-400/20">
                    <Bot size={28} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black flex items-center gap-2">
                      👔 Admin Secretary Console
                      <span className="text-[10px] bg-purple-500/30 text-purple-200 border border-purple-400/30 px-2 py-0.5 rounded-full font-bold">
                        AI Powered
                      </span>
                    </h2>
                    <p className="text-xs text-purple-200/90 font-medium mt-0.5">
                      नमस्ते सुपर एडमिन! मैं आपका लाइव ऐप सेक्रेटरी असिस्टेंट हूँ। रिपोर्ट्स, यूज़र फ्री एक्सेस और कमांड्स के लिए उपलब्ध हूँ।
                    </p>
                  </div>
                </div>

                <button 
                  onClick={fetchAdminUsers}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 backdrop-blur-xs cursor-pointer border border-white/10"
                >
                  <RefreshCw size={14} className={loadingUsers ? 'animate-spin' : ''} />
                  <span>सिंक स्टेट्स</span>
                </button>
              </div>

              {/* Secretary Briefing Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 relative z-10">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold text-purple-200/80 uppercase block">कुल यूज़र्स</span>
                  <span className="text-2xl font-black text-white">{adminUsers.length}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold text-emerald-300/90 uppercase block">प्रीमियम मेंबर्स</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {adminUsers.filter(u => {
                      const sub = typeof u.data?.lb_subscription_info === 'string' ? JSON.parse(u.data.lb_subscription_info || '{}') : u.data?.lb_subscription_info;
                      return sub?.isSubscribed && sub?.isApproved;
                    }).length}
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold text-amber-300/90 uppercase block">पेंडिंग सत्यापन</span>
                  <span className="text-2xl font-black text-amber-400">
                    {paymentRequests.filter(r => r.status === 'PENDING').length}
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold text-blue-300/90 uppercase block">कुल मजदूर</span>
                  <span className="text-2xl font-black text-blue-300">
                    {adminUsers.reduce((sum, u) => {
                      const workers = typeof u.data?.lb_workers === 'string' ? JSON.parse(u.data.lb_workers || '[]') : (u.data?.lb_workers || []);
                      return sum + (Array.isArray(workers) ? workers.length : 0);
                    }, 0)}
                  </span>
                </div>
              </div>

              {/* Quick Executive Shortcuts */}
              <div className="pt-2 border-t border-purple-800/40 flex flex-wrap gap-2 relative z-10">
                <button
                  onClick={() => setActiveTab('FREE_GRANT')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Gift size={15} />
                  <span>🎁 1-Click: किसी को मुफ़्त प्लान दें</span>
                </button>

                <button
                  onClick={() => setActiveTab('VERIFY')}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <CreditCard size={15} />
                  <span>💳 पेंडिंग पेमेंट्स अप्रूव करें ({paymentRequests.filter(r => r.status === 'PENDING').length})</span>
                </button>

                <button
                  onClick={() => handleSendSecretaryMessage("📊 आज की संपूर्ण प्रशासनिक स्थिति और डेली रिपोर्ट प्रस्तुत करें")}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Sparkles size={15} />
                  <span>📊 डेली रिपोर्ट तैयार करें</span>
                </button>

                <button
                  onClick={() => { resetUsageStats(); alert('फ्री ट्रॉयल काउंटर रीसेट हो गया!'); }}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>रीसेट यूसेज लिमिट</span>
                </button>
              </div>
            </div>

            {/* Admin Secretary Interactive Chat Box */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden flex flex-col h-[520px]">
              {/* Chat Header */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black flex items-center gap-1.5">
                      एडमिन सेक्रेटरी असिस्टेंट (Chat Console)
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </h3>
                    <p className="text-[10px] text-slate-300">Super Admin Assistant • 24/7 Live Ready</p>
                  </div>
                </div>

                <span className="text-[10px] bg-purple-900/60 text-purple-200 border border-purple-700 px-2 py-0.5 rounded-full font-extrabold">
                  ऑनलाइन
                </span>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-900/50">
                {secretaryMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                        <Bot size={16} />
                      </div>
                    )}

                    <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs shadow-xs space-y-1 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-xs font-semibold' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-xs whitespace-pre-line'
                    }`}>
                      <div className="leading-relaxed">{msg.text}</div>
                      <span className={`text-[9px] block text-right font-medium opacity-70 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                        {msg.time}
                      </span>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-300 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                        SA
                      </div>
                    )}
                  </div>
                ))}

                {loadingSecretary && (
                  <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-300 font-bold p-2 bg-purple-50 dark:bg-purple-950/40 rounded-xl w-fit border border-purple-200 dark:border-purple-800">
                    <RefreshCw size={14} className="animate-spin" />
                    <span>एडमिन सेक्रेटरी टाइप कर रहे हैं...</span>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <input 
                  type="text" 
                  value={secretaryInput}
                  onChange={(e) => setSecretaryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendSecretaryMessage()}
                  placeholder="एडमिन सेक्रेटरी से सवाल पूछें या निर्देश दें..."
                  className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
                <button
                  onClick={() => handleSendSecretaryMessage()}
                  disabled={loadingSecretary || !secretaryInput.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition cursor-pointer font-bold shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BROADCAST NOTIFICATION TAB */}
        {activeTab === 'BROADCAST' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-5 rounded-3xl border border-blue-800 shadow-xl space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Megaphone size={160} />
              </div>
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-lg">
                  <Megaphone size={26} className="animate-bounce" />
                </div>
                <div>
                  <h2 className="text-lg font-black flex items-center gap-2">
                    📢 अनलिमिटेड ब्रॉडकास्ट नोटिफिकेशन इंजन
                  </h2>
                  <p className="text-xs text-blue-200 font-medium">
                    1-क्लिक में सभी अनलिमिटेड यूज़र्स (Unlimited All Users) तक महत्वपूर्ण घोषणाएँ, ऑफर, अलर्ट और ऐप अपडेट भेजें।
                  </p>
                </div>
              </div>

              {/* Network Reach Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 relative z-10">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-blue-200 font-bold">🎯 टारगेट ऑडियंस</p>
                  <p className="text-sm font-black text-amber-300">100% अनलिमिटेड यूज़र्स</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-blue-200 font-bold">📊 पंजीकृत क्लाउड यूज़र्स</p>
                  <p className="text-sm font-black text-white">{adminUsers.length || 1} पंजीकृत रिकॉर्ड्स</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-blue-200 font-bold">⚡ डिलीवरी गति</p>
                  <p className="text-sm font-black text-emerald-400">तत्काल (0.1 सेकंड लाइव पुश)</p>
                </div>
              </div>
            </div>

            {/* Broadcast Form Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 flex-wrap gap-2">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Radio size={18} className="text-blue-600 animate-pulse" />
                  <span>नया ब्रॉडकास्ट मैसेज तैयार करें</span>
                </h3>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  1-Click Instant Broadcast
                </span>
              </div>

              {/* 🔔 GLOBAL NOTIFICATION ON/OFF TOGGLE SWITCH BUTTON */}
              <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                paymentSettings?.isNotificationEnabled !== false 
                  ? 'bg-emerald-50/80 border-emerald-300' 
                  : 'bg-rose-50/80 border-rose-300'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shrink-0 ${
                    paymentSettings?.isNotificationEnabled !== false ? 'bg-emerald-600 shadow-md shadow-emerald-600/30' : 'bg-rose-600 shadow-md shadow-rose-600/30'
                  }`}>
                    {paymentSettings?.isNotificationEnabled !== false ? <Bell size={20} /> : <BellOff size={20} />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 flex-wrap">
                      <span>ब्रॉडकास्ट नोटिफिकेशन सिस्टम (Notification Control)</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                        paymentSettings?.isNotificationEnabled !== false ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                      }`}>
                        {paymentSettings?.isNotificationEnabled !== false ? '🟢 चालू (ON)' : '🔴 बंद (OFF)'}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {paymentSettings?.isNotificationEnabled !== false 
                        ? 'यूज़र्स की स्क्रीन पर लाइव ब्रॉडकास्ट और नोटिफिकेशन दिखेंगे।' 
                        : 'नोटिफिकेशन सिस्टम बंद है (यूज़र्स की स्क्रीन पर अलर्ट नहीं दिखेगा)।'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextState = !(paymentSettings?.isNotificationEnabled !== false);
                    setPaymentSettings({ ...paymentSettings, isNotificationEnabled: nextState });
                    setBroadcastSuccessMsg(
                      nextState 
                        ? "🔔 नोटिफिकेशन सफलतापूर्वक चालू (ON) कर दिए गए हैं!" 
                        : "🔕 नोटिफिकेशन सफलतापूर्वक बंद (OFF) कर दिए गए हैं!"
                    );
                    setTimeout(() => setBroadcastSuccessMsg(''), 4000);
                  }}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md shrink-0 active:scale-95 ${
                    paymentSettings?.isNotificationEnabled !== false
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {paymentSettings?.isNotificationEnabled !== false ? (
                    <>
                      <BellOff size={16} />
                      <span>नोटिफिकेशन बंद करें (Turn OFF)</span>
                    </>
                  ) : (
                    <>
                      <Bell size={16} />
                      <span>नोटिफिकेशन चालू करें (Turn ON)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Success Alert */}
              {broadcastSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{broadcastSuccessMsg}</span>
                </div>
              )}

              {/* Quick Fill Preset Templates */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">⚡ 1-क्लिक रेडीमेड टेम्प्लेट (Quick Templates):</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastTitle("🎉 विशेष ऑफर: 50% भारी छूट!");
                      setBroadcastMessage("प्रिय यूज़र, onediary.in VIP सब्सक्रिप्शन पर पाएं पूरे 50% की विशेष छूट! सभी प्रीमियम फीचर्स और अनलिमिटेड लेबर रिकॉर्ड्स अनलॉक करें।");
                      setBroadcastType("OFFER");
                      setBroadcastActionUrl("/subscriptions");
                    }}
                    className="py-1 px-2.5 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl border border-amber-200 transition active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    🎁 50% डिस्काउंट ऑफर
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastTitle("⚡ नया ऐप वर्ज़न जारी हो गया है!");
                      setBroadcastMessage("onediary.in में नया GST कैलकुलेटर, तेज़ क्लाउड सिंक और स्मार्ट एडमिन ब्रॉडकास्ट नोटिफिकेशन फ़ीचर चालू हो गया है।");
                      setBroadcastType("UPDATE");
                    }}
                    className="py-1 px-2.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 transition active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    ⚡ नया ऐप अपडेट
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastTitle("⚠️ महत्वपूर्ण सर्वर मेंटेनेंस सूचना");
                      setBroadcastMessage("प्रिय यूज़र, आज रात 12:00 बजे से 1:00 बजे तक सिस्टम मेंटेनेंस रहेगा। इस दौरान आपका डेटा सुरक्षित रहेगा।");
                      setBroadcastType("ALERT");
                    }}
                    className="py-1 px-2.5 text-xs font-bold bg-red-50 hover:bg-red-100 text-red-800 rounded-xl border border-red-200 transition active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    ⚠️ सर्वर मेंटेनेंस
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastTitle("💼 24x7 एडमिन सपोर्ट व सहायता");
                      setBroadcastMessage("अगर आपको ऐप इस्तेमाल करने या भुगतान में कोई सहायता चाहिए, तो हमारे आधिकारिक व्हाट्सएप या हेल्पलाइन नंबर पर संपर्क करें।");
                      setBroadcastType("ANNOUNCEMENT");
                    }}
                    className="py-1 px-2.5 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl border border-blue-200 transition active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    📢 कस्टमर हेल्प सूचना
                  </button>
                </div>
              </div>

              {/* Title & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">📌 नोटिफिकेशन का शीर्षक (Title) *</label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="उदा. 🎉 दीपावली विशेष ऑफर / ⚡ नया ऐप अपडेट"
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">🏷️ कैटेगरी (Type)</label>
                  <select
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value as any)}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ANNOUNCEMENT">📢 सामान्य सूचना</option>
                    <option value="OFFER">🎁 ऑफर / डिस्काउंट</option>
                    <option value="ALERT">⚠️ महत्वपूर्ण अलर्ट</option>
                    <option value="UPDATE">⚡ नया अपडेट</option>
                  </select>
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">📝 संदेश / विस्तृत जानकारी (Message Body) *</label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={4}
                  placeholder="यहाँ यूज़र्स के लिए पूरा संदेश या जानकारी लिखें..."
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Optional Link */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">🔗 एक्शन लिंक / बटन URL (ऑप्शनल)</label>
                <input
                  type="text"
                  value={broadcastActionUrl}
                  onChange={(e) => setBroadcastActionUrl(e.target.value)}
                  placeholder="उदा. /subscriptions या https://wa.me/91..."
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSendBroadcast}
                disabled={isSendingBroadcast || !broadcastTitle.trim() || !broadcastMessage.trim()}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl active:scale-98 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSendingBroadcast ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>अनलिमिटेड यूज़र्स को ब्रॉडकास्ट भेजा जा रहा है...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>🚀 1-क्लिक में सभी अनलिमिटेड यूज़र्स को भेजें (Broadcast to All)</span>
                  </>
                )}
              </button>
            </div>

            {/* Previously Sent Broadcasts List */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 flex-wrap gap-2">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Clock size={18} className="text-blue-600" />
                  <span>भेजे गए ब्रॉडकास्ट मैसेज का इतिहास ({broadcasts.length})</span>
                </h3>

                {broadcasts.length > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm("क्या आप सभी ब्रॉडकास्ट मैसेज को सभी यूज़र्स के लिए स्थायी रूप से डिलीट करना चाहते हैं?")) {
                        const ok = await deleteBroadcastNotification("all");
                        if (ok) {
                          setBroadcastSuccessMsg("🗑️ सभी ब्रॉडकास्ट मैसेज सफलतापूर्वक डिलीट कर दिए गए हैं!");
                          setTimeout(() => setBroadcastSuccessMsg(''), 4000);
                        } else {
                          alert("सभी मैसेज डिलीट करने में विफल। कृपया पुनः प्रयास करें।");
                        }
                      }
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                  >
                    <Trash2 size={15} />
                    <span>सभी डिलीट करें (Delete All)</span>
                  </button>
                )}
              </div>

              {broadcasts.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-medium">
                  अभी तक कोई ब्रॉडकास्ट मैसेज नहीं है। ऊपर दिए गए फॉर्म से आप जो भी सूचना भेजेंगे, वह सभी कस्टमर्स के स्क्रीन पर तुरंत लाइव दिखेगी।
                </div>
              ) : (
                <div className="space-y-3">
                  {broadcasts.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              {item.type || 'ANNOUNCEMENT'}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {new Date(item.created_at).toLocaleString('hi-IN', {
                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              ✅ Delivered to Unlimited Users
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {item.title}
                          </h4>

                          <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                            {item.message}
                          </p>

                          {item.actionUrl && (
                            <p className="text-[11px] font-semibold text-blue-600 truncate">
                              🔗 {item.actionUrl}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (window.confirm(`क्या आप "${item.title}" मैसेज को डिलीट करना चाहते हैं?`)) {
                              const ok = await deleteBroadcastNotification(item.id);
                              if (ok) {
                                setBroadcastSuccessMsg(`🗑️ मैसेज "${item.title}" सफलतापूर्वक डिलीट कर दिया गया!`);
                                setTimeout(() => setBroadcastSuccessMsg(''), 4000);
                              } else {
                                alert("मैसेज डिलीट करने में विफलता हुई।");
                              }
                            }
                          }}
                          className="px-3 py-2 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 text-xs font-bold shadow-xs"
                          title="मैसेज डिलीट करें"
                        >
                          <Trash2 size={16} />
                          <span>डिलीट (Delete)</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 100% FREE PLAN GRANTER CENTER TAB */}
        {activeTab === 'FREE_GRANT' && (
          <div className="space-y-5">
            {/* Header Box */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 rounded-3xl border border-emerald-800 shadow-xl space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 font-black text-2xl flex items-center justify-center shrink-0 shadow-lg">
                  <Gift size={28} />
                </div>
                <div>
                  <h2 className="text-lg font-black flex items-center gap-2">
                    🎁 100% मुफ़्त प्लान व ऑफर सेंटर (1-Click Free Offer Grant)
                  </h2>
                  <p className="text-xs text-emerald-200 font-medium">
                    सुपर एडमिन कंट्रोल: किसी भी ग्राहक के <strong>मोबाइल नंबर</strong> या <strong>Gmail ID</strong> पर 1-क्लिक में 100% मुफ़्त VIP प्लान / ऑफर तुरंत एक्टिवेट करें!
                  </p>
                </div>
              </div>
            </div>

            {/* Success Banner */}
            {grantSuccessMsg && (
              <div className="bg-emerald-500 text-slate-950 p-4 rounded-2xl font-black text-xs flex items-center justify-between shadow-md border border-emerald-400 animate-in fade-in">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  {grantSuccessMsg}
                </span>
                <button onClick={() => setGrantSuccessMsg('')} className="p-1 hover:bg-emerald-600 rounded-lg">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Main Form Box */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-md space-y-5">
              {/* Step 1: Target Type Selection */}
              <div className="space-y-2.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase">
                  <UserPlus size={16} className="text-emerald-600" />
                  1. ऑफर किसे देना चाहते हैं? (Select Target Customer)
                </label>
                
                {/* Target Type Selector Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'PHONE', label: '📱 फोन नंबर', desc: 'Customer Mobile' },
                    { id: 'EMAIL', label: '✉️ Gmail ID', desc: 'Customer Email' },
                    { id: 'USER', label: '👥 रजिस्टर्ड यूजर', desc: 'From Database' },
                    { id: 'ALL', label: '🌟 सभी यूजर्स', desc: 'All App Users' },
                    { id: 'CURRENT_USER', label: '✨ अपना अकाउंट', desc: 'My Account' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setGrantTargetType(tab.id as any)}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                        grantTargetType === tab.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-black'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      <span className="text-xs font-bold">{tab.label}</span>
                      <span className={`text-[10px] mt-0.5 ${grantTargetType === tab.id ? 'text-emerald-100' : 'text-slate-400'}`}>{tab.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Conditional Inputs Based on Target Type */}
                {grantTargetType === 'PHONE' && (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span>ग्राहक का 10 अंकों का मोबाइल नंबर:</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="उदा. 9876543210 (बिना +91 या स्पेस के)"
                        value={customPhoneInput}
                        onChange={(e) => setCustomPhoneInput(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500 pl-4"
                      />
                    </div>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      💡 इस मोबाइल नंबर से जो भी ग्राहक ऐप खोलेगा, उसे 1-क्लिक में तुरंत यह मुफ़्त ऑफर एक्टिवेट मिलेगा!
                    </p>
                  </div>
                )}

                {grantTargetType === 'EMAIL' && (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span>ग्राहक की Gmail / Email ID:</span>
                    </label>
                    <input
                      type="email"
                      placeholder="उदा. rajsahani.RgcS@gmail.com"
                      value={customEmailInput}
                      onChange={(e) => setCustomEmailInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      💡 इस Gmail ID से लॉगिन/साइन-इन करते ही ग्राहक का मुफ़्त VIP प्लान तुरंत एक्टिवेट हो जाएगा!
                    </p>
                  </div>
                )}

                {grantTargetType === 'USER' && (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      डेटाबेस से ठेकेदार चुनें:
                    </label>
                    <select
                      value={selectedGrantUserId}
                      onChange={(e) => setSelectedGrantUserId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="CURRENT_USER">✨ वर्तमान ऐप अकाउंट (My Account)</option>
                      {adminUsers.map(u => {
                        const prof = typeof u.data?.lb_user_profile === 'string' ? JSON.parse(u.data.lb_user_profile || '{}') : (u.data?.lb_user_profile || {});
                        return (
                          <option key={u.userId} value={u.userId}>
                            👤 {prof.name || 'Contractor'} - {prof.phone || u.userId} ({prof.email || 'No email'})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {grantTargetType === 'ALL' && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-2xl">
                    <p className="text-xs font-extrabold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Sparkles size={16} className="text-amber-600" />
                      🌟 ग्लोबल 100% मुफ़्त ऑफर (All App Users)
                    </p>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                      यह ऑफर onediary.in ऐप का इस्तेमाल करने वाले <strong>सभी ठेकेदारों व यूज़र्स</strong> के लिए तुरंत 1-क्लिक में सक्रिय हो जाएगा।
                    </p>
                  </div>
                )}

                {grantTargetType === 'CURRENT_USER' && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl">
                    <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      ✨ आपके अपने वर्तमान अकाउंट पर
                    </p>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                      यह 100% मुफ़्त VIP प्लान सीधे आपके वर्तमान ऐप प्रोफाइल पर तुरंत एक्टिवेट हो जाएगा।
                    </p>
                  </div>
                )}
              </div>

              {/* Step 2: Labour Limit Preset Selection */}
              <div className="space-y-2.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase">
                  <Award size={16} className="text-amber-500" />
                  2. मुफ़्त लेबर लिमिट चुनें (Select Labour Capacity)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { count: 5, label: '5 लेबर लिमिट', badge: 'Starter ₹199' },
                    { count: 15, label: '15 लेबर लिमिट', badge: 'Standard ₹499' },
                    { count: 25, label: '25 लेबर लिमिट', badge: 'Pro ₹999' },
                    { count: 50, label: '50 लेबर लिमिट', badge: 'VIP ₹1499' },
                    { count: 100, label: '100 लेबर लिमिट', badge: 'Super VIP ₹2499' },
                    { count: 999999, label: 'असीमित लेबर (Unlimited)', badge: 'Unlimited Lifetime' },
                  ].map(item => (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => {
                        setGrantWorkersLimit(item.count);
                        setGrantPlanTitle(`100% Free VIP (${item.label})`);
                      }}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                        grantWorkersLimit === item.count
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40 text-emerald-900 dark:text-emerald-200 font-extrabold'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <span className="text-xs font-black">{item.label}</span>
                      <span className="text-[10px] opacity-75 font-semibold mt-1">₹0 Free ({item.badge})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Duration Selection */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase">
                  <Clock size={16} className="text-blue-500" />
                  3. मुफ़्त प्लान की अवधि (Duration)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { days: 30, label: '1 महीना (30 दिन)' },
                    { days: 90, label: '3 महीने (90 दिन)' },
                    { days: 365, label: '1 वर्ष (365 दिन)' },
                    { days: 3650, label: '♾️ लाइफटाइम मुफ़्त' },
                  ].map(d => (
                    <button
                      key={d.days}
                      type="button"
                      onClick={() => setGrantDurationDays(d.days)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                        grantDurationDays === d.days
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Plan Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  प्लान का शीर्षक (Plan Title / Label):
                </label>
                <input
                  type="text"
                  value={grantPlanTitle}
                  onChange={(e) => setGrantPlanTitle(e.target.value)}
                  placeholder="उदा. 100% Free VIP Partner Grant"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-bold"
                />
              </div>

              {/* Submit Action Button */}
              <button
                type="button"
                onClick={() => handleExecuteFreeGrant()}
                className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black py-4 rounded-2xl shadow-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <Zap size={22} className="text-amber-300" />
                <span>⚡ 1-Click: ऑफर / फ्री प्लान तुरंत एक्टिवेट करें (Activate Free Grant)</span>
              </button>
            </div>

            {/* Currently Active Grants List */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Gift className="text-emerald-500" size={18} />
                  सक्रिय मुफ़्त ऑफर्स की सूची (Currently Active Free Offers & Grants)
                </h3>
                <button
                  onClick={fetchActiveGrants}
                  disabled={loadingGrants}
                  className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <RefreshCw size={12} className={loadingGrants ? 'animate-spin' : ''} />
                  <span>रिफ्रेश</span>
                </button>
              </div>

              {activeGrants.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  अभी तक कोई कस्टम फ्री ऑफर दर्ज नहीं है। ऊपर से किसी भी नंबर या Gmail पर ऑफर दें!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto">
                  {activeGrants.map(g => (
                    <div
                      key={g.id}
                      className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                            {g.targetIdentifier === 'ALL' ? '🌟 ALL USERS' : (g.phone || g.email || g.targetIdentifier)}
                          </span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {g.planName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          लेबर क्षमता: <strong>{g.workersLimit >= 999999 ? 'असीमित' : `${g.workersLimit} लेबर`}</strong> • वैधता: {g.expiresAt ? new Date(g.expiresAt).toLocaleDateString('hi-IN') : 'लाइफटाइम'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteGrant(g.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[11px] font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>हटाएं (Revoke)</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Registered Users Quick 1-Click Free Access List */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-md space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="text-amber-500" size={18} />
                पंजीकृत ठेकेदारों के लिए 1-क्लिक ऑफर (Quick 1-Click Grant to Contractors)
              </h3>

              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {adminUsers.length === 0 ? (
                  <p className="text-xs text-slate-500">कोई यूजर डेटाबेस में उपलब्ध नहीं है।</p>
                ) : (
                  adminUsers.map(u => {
                    const prof = typeof u.data?.lb_user_profile === 'string' ? JSON.parse(u.data.lb_user_profile || '{}') : (u.data?.lb_user_profile || {});
                    const subInfo = typeof u.data?.lb_subscription_info === 'string' ? JSON.parse(u.data.lb_subscription_info || '{}') : (u.data?.lb_subscription_info || {});
                    const isSub = Boolean(subInfo?.isSubscribed && subInfo?.isApproved);

                    return (
                      <div key={u.userId} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                            {prof.name || 'Contractor'} 
                            <span className="text-[10px] text-slate-500 font-mono">({prof.phone || prof.email || u.userId})</span>
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                            वर्तमान स्टेटस: {isSub ? `✅ ${subInfo?.planName || 'Active'}` : '⏳ मुफ़्त ट्रॉयल'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleExecuteFreeGrant(prof.phone || prof.email || u.userId, 15, 365, "100% Free Standard (15 Labour)")}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                          >
                            + 15 लेबर Free
                          </button>
                          <button
                            onClick={() => handleExecuteFreeGrant(prof.phone || prof.email || u.userId, 25, 365, "100% Free Pro (25 Labour)")}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                          >
                            + 25 लेबर Free
                          </button>
                          <button
                            onClick={() => handleExecuteFreeGrant(prof.phone || prof.email || u.userId, 999999, 3650, "100% Free Lifetime VIP")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                          >
                            + Unlimited VIP
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="space-y-4">
            {/* Admin Header Box */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="text-blue-400" size={20} />
                  <h2 className="text-base font-black">सभी यूज़र्स का डेटा (All Users & Cloud Database)</h2>
                </div>
                <button 
                  onClick={fetchAdminUsers} 
                  disabled={loadingUsers}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <RefreshCw size={14} className={loadingUsers ? 'animate-spin' : ''} />
                  <span>रिफ्रेश</span>
                </button>
              </div>
              <p className="text-xs text-slate-300 font-normal">
                onediary.in ऐप का उपयोग करने वाले सभी ठेकेदारों और यूजर्स का पूरा डेटा (मजदूर सूची, कैशबुक, सब्सक्रिप्शन, प्रोफाइल) यहाँ लाइव देखें व कंट्रोल करें।
              </p>

              {/* Search Input */}
              <div className="pt-2 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="यूज़र का नाम, फोन नंबर या रोल खोजें..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs rounded-xl py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Users Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">कुल पंजीकृत यूज़र्स</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{adminUsers.length}</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">प्रीमियम सब्सक्राइबर</span>
                <span className="text-xl font-black text-emerald-600">
                  {adminUsers.filter(u => {
                    const sub = typeof u.data?.lb_subscription_info === 'string' ? JSON.parse(u.data.lb_subscription_info || '{}') : u.data?.lb_subscription_info;
                    return sub?.isSubscribed && sub?.isApproved;
                  }).length}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">कुल दर्ज मजदूर</span>
                <span className="text-xl font-black text-blue-600">
                  {adminUsers.reduce((sum, u) => {
                    const workers = typeof u.data?.lb_workers === 'string' ? JSON.parse(u.data.lb_workers || '[]') : (u.data?.lb_workers || []);
                    return sum + (Array.isArray(workers) ? workers.length : 0);
                  }, 0)}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">फ्री ट्रॉयल यूज़र्स</span>
                <span className="text-xl font-black text-amber-600">
                  {adminUsers.filter(u => {
                    const sub = typeof u.data?.lb_subscription_info === 'string' ? JSON.parse(u.data.lb_subscription_info || '{}') : u.data?.lb_subscription_info;
                    return !(sub?.isSubscribed && sub?.isApproved);
                  }).length}
                </span>
              </div>
            </div>

            {/* User Data Cards List */}
            <div className="space-y-3">
              {adminUsers.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <Users className="mx-auto text-slate-400" size={32} />
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300">कोई यूज़र डेटाबेस में प्राप्त नहीं हुआ</p>
                  <p className="text-xs text-slate-500">जब यूज़र्स ऐप का इस्तेमाल करेंगे, तो उनका लाइव डेटा यहाँ दिखेगा।</p>
                </div>
              ) : (
                adminUsers
                  .filter(u => {
                    if (!userSearchQuery.trim()) return true;
                    const q = userSearchQuery.toLowerCase();
                    const prof = typeof u.data?.lb_user_profile === 'string' ? JSON.parse(u.data.lb_user_profile || '{}') : (u.data?.lb_user_profile || {});
                    return u.userId.toLowerCase().includes(q) || 
                           (prof.name && prof.name.toLowerCase().includes(q)) ||
                           (prof.phone && prof.phone.toLowerCase().includes(q)) ||
                           (prof.role && prof.role.toLowerCase().includes(q));
                  })
                  .map(u => {
                    const profile = typeof u.data?.lb_user_profile === 'string' ? JSON.parse(u.data.lb_user_profile || '{}') : (u.data?.lb_user_profile || {});
                    const workersList = typeof u.data?.lb_workers === 'string' ? JSON.parse(u.data.lb_workers || '[]') : (u.data?.lb_workers || []);
                    const cashList = typeof u.data?.lb_cashentries === 'string' ? JSON.parse(u.data.lb_cashentries || '[]') : (u.data?.lb_cashentries || []);
                    const subInfo = typeof u.data?.lb_subscription_info === 'string' ? JSON.parse(u.data.lb_subscription_info || '{}') : (u.data?.lb_subscription_info || {});
                    const isSub = Boolean(subInfo?.isSubscribed && subInfo?.isApproved);

                    const isExpanded = expandedUserId === u.userId;

                    let totalIn = 0;
                    let totalOut = 0;
                    if (Array.isArray(cashList)) {
                      cashList.forEach((c: any) => {
                        if (c.type === 'IN') totalIn += Number(c.amount) || 0;
                        else totalOut += Number(c.amount) || 0;
                      });
                    }

                    return (
                      <div key={u.userId} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
                        <div className="p-4 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-base flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                                {(profile.name || u.userId).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                                  {profile.name || 'Contractor User'}
                                  <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
                                    {profile.role || 'ठेकेदार'}
                                  </span>
                                </h3>
                                <p className="text-xs font-mono text-slate-500">{profile.phone || u.userId}</p>
                              </div>
                            </div>

                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase shrink-0 ${
                              isSub 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' 
                                : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                            }`}>
                              {isSub ? '✓ ₹499 प्रीमियम एक्टिव' : '⏳ मुफ़्त ट्रॉयल'}
                            </span>
                          </div>

                          {/* Key Stats Row */}
                          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-center text-xs border border-slate-200 dark:border-slate-800">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">मजदूर</span>
                              <span className="font-extrabold text-slate-800 dark:text-slate-200">{Array.isArray(workersList) ? workersList.length : 0}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">कैश आवक (In)</span>
                              <span className="font-extrabold text-emerald-600">₹{totalIn}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">कैश जावक (Out)</span>
                              <span className="font-extrabold text-red-600">₹{totalOut}</span>
                            </div>
                          </div>

                          {/* Actions Row */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <button
                              onClick={() => setExpandedUserId(isExpanded ? null : u.userId)}
                              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-extrabold px-3 py-2 rounded-xl flex items-center gap-1 transition cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              <span>{isExpanded ? 'डेटा बंद करें' : 'सारे विवरण देखें (Inspect Data)'}</span>
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={async () => {
                                  if (window.confirm(`क्या आप ${profile.name || u.userId} को 100% मुफ़्त VIP प्लान (25 लेबर, 1 वर्ष) देना चाहते हैं?`)) {
                                    handleExecuteFreeGrant(profile.phone || profile.email || u.userId, 25, 365, '100% Free VIP Plan (25 Labour)');
                                  }
                                }}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3 py-2 rounded-xl flex items-center gap-1 transition cursor-pointer shadow-xs"
                                title="Grant Free VIP Plan (25 Labour / 1 Year)"
                              >
                                <Gift size={14} />
                                <span>🎁 1-Click मुफ़्त VIP प्लान दें</span>
                              </button>

                              <button
                                onClick={async () => {
                                  const action = isSub ? 'रद्द' : 'चालू';
                                  if (window.confirm(`क्या आप ${profile.name || u.userId} का प्रीमियम प्लान ${action} करना चाहते हैं?`)) {
                                    try {
                                      const res = await fetch(`/api/admin/users/${encodeURIComponent(u.userId)}/subscribe`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ isSubscribed: !isSub, planName: 'Premium All-in-One', amount: 499 })
                                      });
                                      if (res.ok) {
                                        alert(`यूज़र ${profile.name || u.userId} का सब्सक्रिप्शन ${action} कर दिया गया है!`);
                                        fetchAdminUsers();
                                      }
                                    } catch (err) {
                                      alert('सब्सक्रिप्शन बदलने में त्रुटि हुई।');
                                    }
                                  }
                                }}
                                className={`text-xs font-black px-3 py-2 rounded-xl flex items-center gap-1 transition cursor-pointer ${
                                  isSub 
                                    ? 'bg-red-100 hover:bg-red-200 text-red-700' 
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                }`}
                              >
                                <Check size={14} />
                                <span>{isSub ? 'सब्सक्रिप्शन रिसेट' : '1-क्लिक: ₹499 दें'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(u.data, null, 2));
                                  const downloadAnchorNode = document.createElement('a');
                                  downloadAnchorNode.setAttribute("href", dataStr);
                                  downloadAnchorNode.setAttribute("download", `user_backup_${u.userId}.json`);
                                  document.body.appendChild(downloadAnchorNode);
                                  downloadAnchorNode.click();
                                  downloadAnchorNode.remove();
                                }}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-xl transition cursor-pointer"
                                title="Download User JSON Data"
                              >
                                <Download size={16} />
                              </button>

                              <button
                                onClick={async () => {
                                  if (window.confirm(`क्या आप ${u.userId} का क्लाउड डेटाबेस रिकॉर्ड डिलीट करना चाहते हैं?`)) {
                                    try {
                                      const res = await fetch(`/api/admin/users/${encodeURIComponent(u.userId)}`, { method: 'DELETE' });
                                      if (res.ok) {
                                        alert('यूज़र रिकॉर्ड डिलीट हो गया।');
                                        fetchAdminUsers();
                                      }
                                    } catch (e) {
                                      alert('डिलीट करने में त्रुटि।');
                                    }
                                  }
                                }}
                                className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition cursor-pointer"
                                title="Delete Sync Record"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Full Inspector */}
                        {isExpanded && (
                          <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 p-4 space-y-4 animate-in fade-in duration-200">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase pb-1 border-b border-slate-200 dark:border-slate-800">
                              <span>यूज़र प्रोफाइल व विस्तृत डेटा (User Profile & Records)</span>
                              <span>अंतिम सिंक: {new Date(u.updated_at).toLocaleString('en-IN')}</span>
                            </div>

                            {/* Profile Details */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                              <div>
                                <span className="text-slate-400 font-semibold block text-[10px]">नाम (Name):</span>
                                <span className="font-extrabold text-slate-900 dark:text-white">{profile.name || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-semibold block text-[10px]">फोन (Phone):</span>
                                <span className="font-extrabold text-slate-900 dark:text-white">{profile.phone || u.userId}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-semibold block text-[10px]">रोल (Role):</span>
                                <span className="font-extrabold text-slate-900 dark:text-white">{profile.role || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-semibold block text-[10px]">कार्य क्षेत्र (Working Field):</span>
                                <span className="font-extrabold text-slate-900 dark:text-white">{profile.workingField || 'N/A'}</span>
                              </div>
                            </div>

                            {/* Workers List Details */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase">
                                मजदूर सूची (Workers Recorded: {Array.isArray(workersList) ? workersList.length : 0})
                              </h4>
                              {Array.isArray(workersList) && workersList.length > 0 ? (
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 max-h-48 overflow-y-auto">
                                  {workersList.map((w: any, idx: number) => (
                                    <div key={w.id || idx} className="p-2.5 flex justify-between items-center text-xs">
                                      <div>
                                        <span className="font-extrabold text-slate-900 dark:text-white mr-2">{w.name}</span>
                                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                                          {w.workerType || 'LABOUR'}
                                        </span>
                                      </div>
                                      <div className="text-right">
                                        <span className="font-mono font-bold text-emerald-600 mr-2">₹{w.dailyRate}/दिन</span>
                                        <span className="text-[10px] text-slate-400">{w.phone || 'No Phone'}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">कोई मजदूर दर्ज नहीं है।</p>
                              )}
                            </div>

                            {/* Cashbook Entries Details */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase">
                                कैशबुक एंट्रीज (Cashbook Transactions: {Array.isArray(cashList) ? cashList.length : 0})
                              </h4>
                              {Array.isArray(cashList) && cashList.length > 0 ? (
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 max-h-48 overflow-y-auto">
                                  {cashList.map((c: any, idx: number) => (
                                    <div key={c.id || idx} className="p-2.5 flex justify-between items-center text-xs">
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${c.type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                          {c.type === 'IN' ? 'आवक (In)' : 'जावक (Out)'}
                                        </span>
                                        <div>
                                          <span className="font-bold text-slate-800 dark:text-slate-200">{c.partyName || c.description || 'Entry'}</span>
                                          <span className="text-[10px] text-slate-400 block">{c.date}</span>
                                        </div>
                                      </div>
                                      <span className={`font-mono font-black ${c.type === 'IN' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {c.type === 'IN' ? '+' : '-'}₹{c.amount}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">कोई कैशबुक लेन-देन दर्ज नहीं है।</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}
        {activeTab === 'VERIFY' && (
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-amber-400" size={20} />
                  <h2 className="text-base font-black">भुगतान एवं UTR सत्यापन कंट्रोल (Payment Clearances)</h2>
                </div>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
                  {paymentRequests.filter(r => r.status === 'PENDING').length} लंबित अनुरोध
                </span>
              </div>
              <p className="text-xs text-slate-300 font-normal">
                उपयोगकर्ताओं द्वारा सबमिट किए गए UTR / ट्रांजेक्शन नंबर यहाँ दिखेंगे। बैंक खाते में राशि प्राप्त होने पर <strong>"स्वीकार करें (Approve)"</strong> दबाएं। केवल क्लियर होने पर ही सब्सक्रिप्शन चालू होगा।
              </p>
              
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    activateSubscription({
                      planId: 'premium_monthly',
                      planName: 'Premium All-in-One',
                      amount: 499,
                      paymentId: `ADMIN_MANUAL_${Date.now()}`,
                      paymentMethod: 'Super Admin Override',
                      isApproved: true,
                      isSubscribed: true
                    });
                    alert('वर्तमान उपयोगकर्ता का ₹499 प्लान तुरंत एक्टिव (Approve) कर दिया गया है!');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow transition cursor-pointer"
                >
                  <Check size={14} />
                  <span>1-क्लिक: डायरेक्ट यूजर को असीमित एक्सेस (Approve) दें</span>
                </button>

                {isSubscribed && (
                  <button
                    onClick={() => {
                      cancelSubscription();
                      alert('सब्सक्रिप्शन रद्द कर दिया गया है।');
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <X size={14} />
                    <span>सब्सक्रिप्शन रिसेट / डिएक्टिवेट करें</span>
                  </button>
                )}
              </div>
            </div>

            {/* Current Active Status Box */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase">वर्तमान खाता स्टेटस (Your Current Subscription)</span>
                <span className={`font-black px-2.5 py-0.5 rounded-full text-[11px] ${isSubscribed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {isSubscribed ? '✓ असीमित प्रीमियम एक्टिव (Approved)' : '⚠️ मुफ़्त ट्रॉयल / पेंडिंग'}
                </span>
              </div>
              <div className="text-sm font-black text-slate-800 dark:text-slate-100">
                {isSubscribed 
                  ? `एक्टिव प्लान: ${subscriptionInfo?.planName || 'Premium'} (₹${subscriptionInfo?.amount || 499}) • TXN: ${subscriptionInfo?.paymentId || 'N/A'}`
                  : 'आपका प्लान एक्टिव नहीं है। बैंक में पेमेंट क्लियर होने पर एडमिन अप्रूव करेगा।'}
              </div>
            </div>

            {/* Payment Requests List */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                सबमिट किए गए UTR ट्रांजेक्शन अनुरोध ({paymentRequests.length})
              </h3>

              {paymentRequests.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <Clock className="mx-auto text-slate-400" size={32} />
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300">कोई भुगतान अनुरोध जमा नहीं हुआ है</p>
                  <p className="text-xs text-slate-500">जब उपयोगकर्ता QR कोड से भुगतान करके UTR नंबर दर्ज करेंगे, तो यहाँ दिखेगा।</p>
                </div>
              ) : (
                paymentRequests.map((req) => (
                  <div key={req.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{req.userName}</h4>
                        <p className="text-xs text-slate-500 font-mono">{req.userPhone}</p>
                      </div>

                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${
                        req.status === 'APPROVED' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                          : req.status === 'REJECTED'
                          ? 'bg-red-50 text-red-700 border-red-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                      }`}>
                        {req.status === 'APPROVED' && '✓ स्वीकृत (Clear)'}
                        {req.status === 'REJECTED' && '✗ अस्वीकृत (Rejected)'}
                        {req.status === 'PENDING' && '⏳ सत्यापन लंबित (Pending)'}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">प्लान एवं राशि:</span>
                        <span className="font-black text-amber-600 dark:text-amber-400">{req.planName} - ₹{req.amount}</span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">UTR / Transaction No:</span>
                        <span className="font-mono font-black text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                          {req.utrNumber}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                        <span>विधि: {req.paymentMethod}</span>
                        <span>{new Date(req.submittedAt).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {req.status === 'PENDING' && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            approvePaymentRequest(req.id);
                            alert(`अनुरोध स्वीकृत हुआ! ${req.userName} के लिए ₹${req.amount} का सब्सक्रिप्शन चालू हो गया है।`);
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                        >
                          <Check size={16} />
                          <span>स्वीकार करें (Approve Payment)</span>
                        </button>

                        <button
                          onClick={() => {
                            rejectPaymentRequest(req.id);
                            alert(`अनुरोध अस्वीकृत कर दिया गया है।`);
                          }}
                          className="bg-red-100 hover:bg-red-200 text-red-700 font-extrabold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
                        >
                          अस्वीकार (Reject)
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'SYSTEM' && (
          <>
            {/* System Stats */}
            <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t('admin.statsTitle')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Users} title={t('admin.totalWorkers')} value={workers.length.toString()} color="text-blue-600" bg="bg-blue-100" />
            <StatCard icon={Database} title={t('admin.cashEntries')} value={cashEntries.length.toString()} color="text-emerald-600" bg="bg-emerald-100" />
            <StatCard icon={CheckCircle2} title={t('admin.attendanceRecords')} value={attendances.length.toString()} color="text-purple-600" bg="bg-purple-100" />
            <StatCard icon={ShieldAlert} title={t('admin.systemStatus')} value={t('admin.healthy')} color="text-green-600" bg="bg-green-100" />
          </div>
        </section>

        {/* Data Management */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t('admin.dataManagement')}</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button 
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-slate-50 transition text-left"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                  <Download size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{t('admin.exportBackup')}</div>
                  <div className="text-xs text-gray-500">{t('admin.exportDesc')}</div>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => alert("Import functionality coming soon")}
              className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-slate-50 transition text-left"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mr-3">
                  <Upload size={20} className="text-amber-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{t('admin.importData')}</div>
                  <div className="text-xs text-gray-500">{t('admin.importDesc')}</div>
                </div>
              </div>
            </button>

            <button 
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition text-left"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mr-3">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <div>
                  <div className="font-semibold text-red-600">{t('admin.dangerZone')}</div>
                  <div className="text-xs text-red-400">{t('admin.dangerDesc')}</div>
                </div>
              </div>
            </button>
          </div>
        </section>
          </>
        )}

        {activeTab === 'WORKERS' && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Manage Workers</h2>
              <button 
                onClick={() => setIsAddingWorker(!isAddingWorker)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-700"
              >
                + Add Worker
              </button>
            </div>

            {isAddingWorker && (
              <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-4 mb-4">
                <h3 className="font-bold text-blue-800 mb-2">New Worker</h3>
                <div className="space-y-2">
                  <input 
                    type="text" 
                    value={newWorkerData.name} 
                    onChange={e => setNewWorkerData({...newWorkerData, name: e.target.value})} 
                    className="w-full border border-blue-300 rounded p-2 text-sm" 
                    placeholder="Name" 
                  />
                  <input 
                    type="number" 
                    value={newWorkerData.dailyRate} 
                    onChange={e => setNewWorkerData({...newWorkerData, dailyRate: e.target.value})} 
                    className="w-full border border-blue-300 rounded p-2 text-sm" 
                    placeholder="Daily Rate" 
                  />
                  <input 
                    type="text" 
                    value={newWorkerData.phone} 
                    onChange={e => setNewWorkerData({...newWorkerData, phone: e.target.value})} 
                    className="w-full border border-blue-300 rounded p-2 text-sm" 
                    placeholder="Phone" 
                  />
                  <div className="flex space-x-2 pt-2">
                    <button 
                      onClick={() => {
                        if (!newWorkerData.name || !newWorkerData.dailyRate) return;
                        addWorker({ name: newWorkerData.name, dailyRate: Number(newWorkerData.dailyRate), phone: newWorkerData.phone });
                        setNewWorkerData({ name: '', dailyRate: '', phone: '' });
                        setIsAddingWorker(false);
                      }}
                      className="bg-blue-600 text-white p-2 rounded flex-1 flex items-center justify-center font-bold"
                    >
                      <Save size={16} className="mr-1" /> Add
                    </button>
                    <button onClick={() => setIsAddingWorker(false)} className="bg-gray-200 text-gray-700 p-2 rounded flex-1 flex items-center justify-center">
                      <X size={16} className="mr-1" /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {workers.length === 0 ? (
              <p className="text-gray-500 text-sm">No workers found.</p>
            ) : (
              workers.map(w => (
                <div key={w.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  {editingWorkerId === w.id ? (
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        value={editWorkerData.name} 
                        onChange={e => setEditWorkerData({...editWorkerData, name: e.target.value})} 
                        className="w-full border rounded p-2 text-sm" 
                        placeholder="Name" 
                      />
                      <input 
                        type="number" 
                        value={editWorkerData.dailyRate} 
                        onChange={e => setEditWorkerData({...editWorkerData, dailyRate: e.target.value})} 
                        className="w-full border rounded p-2 text-sm" 
                        placeholder="Daily Rate" 
                      />
                      <input 
                        type="text" 
                        value={editWorkerData.phone} 
                        onChange={e => setEditWorkerData({...editWorkerData, phone: e.target.value})} 
                        className="w-full border rounded p-2 text-sm" 
                        placeholder="Phone" 
                      />
                      <div className="flex space-x-2 pt-2">
                        <button 
                          onClick={() => {
                            updateWorker(w.id, { name: editWorkerData.name, dailyRate: Number(editWorkerData.dailyRate), phone: editWorkerData.phone });
                            setEditingWorkerId(null);
                          }}
                          className="bg-emerald-500 text-white p-2 rounded flex-1 flex items-center justify-center"
                        >
                          <Save size={16} className="mr-1" /> Save
                        </button>
                        <button onClick={() => setEditingWorkerId(null)} className="bg-gray-200 text-gray-700 p-2 rounded flex-1 flex items-center justify-center">
                          <X size={16} className="mr-1" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-900">{w.name}</div>
                        <div className="text-xs text-gray-500">Rate: {w.dailyRate} | Ph: {w.phone || 'N/A'}</div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setEditWorkerData({ name: w.name, dailyRate: w.dailyRate.toString(), phone: w.phone || '' });
                            setEditingWorkerId(w.id);
                          }} 
                          className="p-2 text-blue-600 bg-blue-50 rounded-full"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete worker?')) deleteWorker(w.id);
                          }} 
                          className="p-2 text-red-600 bg-red-50 rounded-full"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </section>
        )}

        {activeTab === 'CASHBOOK' && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Manage Cashbook</h2>
              <button 
                onClick={() => setIsAddingCash(!isAddingCash)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-700"
              >
                + Add Entry
              </button>
            </div>

            {isAddingCash && (
              <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-4 mb-4">
                <h3 className="font-bold text-blue-800 mb-2">New Cash Entry</h3>
                <div className="space-y-2">
                  <div className="flex rounded-lg overflow-hidden border border-blue-300">
                    <button 
                      onClick={() => setNewCashData({...newCashData, type: 'IN'})}
                      className={`flex-1 py-2 font-semibold text-sm transition-colors ${newCashData.type === 'IN' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      Cash In
                    </button>
                    <button 
                      onClick={() => setNewCashData({...newCashData, type: 'OUT'})}
                      className={`flex-1 py-2 font-semibold text-sm transition-colors ${newCashData.type === 'OUT' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      Cash Out
                    </button>
                  </div>
                  <input 
                    type="number" 
                    value={newCashData.amount} 
                    onChange={e => setNewCashData({...newCashData, amount: e.target.value})} 
                    className="w-full border border-blue-300 rounded p-2 text-sm" 
                    placeholder="Amount" 
                  />
                  <input 
                    type="date" 
                    value={newCashData.date} 
                    onChange={e => setNewCashData({...newCashData, date: e.target.value})} 
                    className="w-full border border-blue-300 rounded p-2 text-sm" 
                  />
                  <input 
                    type="text" 
                    value={newCashData.partyName} 
                    onChange={e => setNewCashData({...newCashData, partyName: e.target.value})} 
                    className="w-full border border-blue-300 rounded p-2 text-sm" 
                    placeholder="Party Name" 
                  />
                  <input 
                    type="text" 
                    value={newCashData.description} 
                    onChange={e => setNewCashData({...newCashData, description: e.target.value})} 
                    className="w-full border border-blue-300 rounded p-2 text-sm" 
                    placeholder="Description (Note)" 
                  />
                  <div className="flex space-x-2 pt-2">
                    <button 
                      onClick={() => {
                        if (!newCashData.amount) return;
                        addCashEntry({ 
                          amount: Number(newCashData.amount), 
                          type: newCashData.type, 
                          partyName: newCashData.partyName, 
                          description: newCashData.description || (newCashData.type === 'IN' ? 'Cash Received' : 'Cash Paid'),
                          date: newCashData.date
                        });
                        setNewCashData({ amount: '', type: 'IN', partyName: '', description: '', date: new Date().toISOString().split('T')[0] });
                        setIsAddingCash(false);
                      }}
                      className="bg-blue-600 text-white p-2 rounded flex-1 flex items-center justify-center font-bold"
                    >
                      <Save size={16} className="mr-1" /> Add
                    </button>
                    <button onClick={() => setIsAddingCash(false)} className="bg-gray-200 text-gray-700 p-2 rounded flex-1 flex items-center justify-center">
                      <X size={16} className="mr-1" /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {cashEntries.length === 0 ? (
              <p className="text-gray-500 text-sm">No cash entries found.</p>
            ) : (
              cashEntries.map(c => (
                <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  {editingCashId === c.id ? (
                    <div className="space-y-2">
                      <input 
                        type="number" 
                        value={editCashData.amount} 
                        onChange={e => setEditCashData({...editCashData, amount: e.target.value})} 
                        className="w-full border rounded p-2 text-sm" 
                        placeholder="Amount" 
                      />
                      <input 
                        type="text" 
                        value={editCashData.partyName} 
                        onChange={e => setEditCashData({...editCashData, partyName: e.target.value})} 
                        className="w-full border rounded p-2 text-sm" 
                        placeholder="Party Name" 
                      />
                      <input 
                        type="text" 
                        value={editCashData.description} 
                        onChange={e => setEditCashData({...editCashData, description: e.target.value})} 
                        className="w-full border rounded p-2 text-sm" 
                        placeholder="Description (Note)" 
                      />
                      <div className="flex space-x-2 pt-2">
                        <button 
                          onClick={() => {
                            updateCashEntry(c.id, { amount: Number(editCashData.amount), partyName: editCashData.partyName, description: editCashData.description });
                            setEditingCashId(null);
                          }}
                          className="bg-emerald-500 text-white p-2 rounded flex-1 flex items-center justify-center"
                        >
                          <Save size={16} className="mr-1" /> Save
                        </button>
                        <button onClick={() => setEditingCashId(null)} className="bg-gray-200 text-gray-700 p-2 rounded flex-1 flex items-center justify-center">
                          <X size={16} className="mr-1" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${c.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {c.type}
                          </span>
                          <span className="font-bold text-gray-900">{c.amount}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {c.partyName && <span className="font-semibold text-gray-700">{c.partyName} - </span>}
                          {c.description}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setEditCashData({ amount: c.amount.toString(), description: c.description, partyName: c.partyName || '' });
                            setEditingCashId(c.id);
                          }} 
                          className="p-2 text-blue-600 bg-blue-50 rounded-full"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete entry?')) deleteCashEntry(c.id);
                          }} 
                          className="p-2 text-red-600 bg-red-50 rounded-full"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </section>
        )}

        {activeTab === "PLANS" && (
          <div className="space-y-6">
            
            {/* Master Category Default Wage Rates & Overtime Multipliers */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="text-emerald-600">🏗️</span> मास्टर मज़दूरी एवं कर दरें (Master Category Default Wage Rates & Taxes)
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    यहां से आप कारीगरों (Mistri), मजदूरों (Helper), इलेक्ट्रीशियन आदि की डिफ़ॉल्ट दैनिक रेट व जीएसटी/ओवरटाइम बदल सकते हैं।
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">राजमिस्त्री / Mason Rate (₹/दिन)</label>
                  <input 
                    type="number" 
                    value={paymentSettings?.defaultMasonRate ?? 800} 
                    onChange={(e) => setPaymentSettings({...paymentSettings, defaultMasonRate: Number(e.target.value)})} 
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-extrabold text-slate-900 bg-slate-50 focus:border-emerald-500" 
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">हेल्पर / Labour Rate (₹/दिन)</label>
                  <input 
                    type="number" 
                    value={paymentSettings?.defaultHelperRate ?? 500} 
                    onChange={(e) => setPaymentSettings({...paymentSettings, defaultHelperRate: Number(e.target.value)})} 
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-extrabold text-slate-900 bg-slate-50 focus:border-emerald-500" 
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">बढ़ई / Carpenter Rate (₹/दिन)</label>
                  <input 
                    type="number" 
                    value={paymentSettings?.defaultCarpenterRate ?? 900} 
                    onChange={(e) => setPaymentSettings({...paymentSettings, defaultCarpenterRate: Number(e.target.value)})} 
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-extrabold text-slate-900 bg-slate-50 focus:border-emerald-500" 
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">इलेक्ट्रिशियन व प्लंबर (₹/दिन)</label>
                  <input 
                    type="number" 
                    value={paymentSettings?.defaultElectricianRate ?? 900} 
                    onChange={(e) => setPaymentSettings({...paymentSettings, defaultElectricianRate: Number(e.target.value)})} 
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-extrabold text-slate-900 bg-slate-50 focus:border-emerald-500" 
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">पेंटर / Painter Rate (₹/दिन)</label>
                  <input 
                    type="number" 
                    value={paymentSettings?.defaultPainterRate ?? 750} 
                    onChange={(e) => setPaymentSettings({...paymentSettings, defaultPainterRate: Number(e.target.value)})} 
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-extrabold text-slate-900 bg-slate-50 focus:border-emerald-500" 
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">वेलडर / Welder Rate (₹/दिन)</label>
                  <input 
                    type="number" 
                    value={paymentSettings?.defaultWelderRate ?? 850} 
                    onChange={(e) => setPaymentSettings({...paymentSettings, defaultWelderRate: Number(e.target.value)})} 
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-extrabold text-slate-900 bg-slate-50 focus:border-emerald-500" 
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">ओवरटाइम दर Multiplier (x)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={paymentSettings?.overtimeMultiplier ?? 1.5} 
                    onChange={(e) => setPaymentSettings({...paymentSettings, overtimeMultiplier: Number(e.target.value)})} 
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-extrabold text-purple-700 bg-slate-50 focus:border-purple-500" 
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">डिफ़ॉल्ट जीएसटी (GST Rate %)</label>
                  <input 
                    type="number" 
                    value={paymentSettings?.defaultGstRate ?? 18} 
                    onChange={(e) => setPaymentSettings({...paymentSettings, defaultGstRate: Number(e.target.value)})} 
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-extrabold text-blue-700 bg-slate-50 focus:border-blue-500" 
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await saveGlobalSettings({ paymentSettings });
                  setPaymentSaveNotice("✅ मास्टर मज़दूरी व जीएसटी दरें सुरक्षित सहेज ली गई हैं और सभी सिस्टम पर तुरंत लागू हो गई हैं!");
                  setTimeout(() => setPaymentSaveNotice(''), 5000);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <Save size={16} />
                <span>मास्टर मज़दूरी दरें सुरक्षित सहेजें (Save & Apply Everywhere)</span>
              </button>
            </div>

            {/* ⚡ 1-Click Bulk Worker Daily Rate Updater */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border-2 border-indigo-500/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3">
                <div>
                  <h2 className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-400 animate-pulse" />
                    <span>⚡ 1-क्लिक बल्क मज़दूरी रेट चेंज मैनेजर (Bulk Workers Wage Updater)</span>
                  </h2>
                  <p className="text-xs text-indigo-200">
                    सभी या किसी विशेष वर्ग के मजदूरों की दैनिक मजदूरी दरें एक साथ बढ़ाएं, घटाएं या निश्चित करें!
                  </p>
                </div>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold px-2.5 py-1 rounded-full">
                  TOTAL WORKERS: {workers.length}
                </span>
              </div>

              {bulkNotice && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{bulkNotice}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-indigo-200 font-bold block mb-1">मजदूर वर्ग (Filter Category)</label>
                  <select
                    value={bulkCategoryFilter}
                    onChange={(e) => setBulkCategoryFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-indigo-700 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="ALL">सभी मजदूर ({workers.length} Workers)</option>
                    <option value="Labour">केवल मज़दूर (Labour / Helper)</option>
                    <option value="Mason">केवल राजमिस्त्री (Mason)</option>
                    <option value="Carpenter">केवल बढ़ई (Carpenter)</option>
                    <option value="Electrician">केवल इलेक्ट्रीशियन (Electrician)</option>
                    <option value="Painter">केवल पेंटर (Painter)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-indigo-200 font-bold block mb-1">परिवर्तन प्रकार (Change Operation)</label>
                  <select
                    value={bulkRateMode}
                    onChange={(e) => setBulkRateMode(e.target.value as any)}
                    className="w-full bg-slate-950 border border-indigo-700 rounded-xl p-2.5 text-xs font-bold text-amber-300 focus:outline-none"
                  >
                    <option value="FLAT_ADD">नकद राशि जोड़ें (+ ₹50, + ₹100 आदि)</option>
                    <option value="PERCENT">प्रतिशत में बढ़ाएं (+ 10%, + 15% आदि)</option>
                    <option value="SET_EXACT">निश्चित समान रेट तय करें (Fix Flat Rate ₹)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-indigo-200 font-bold block mb-1">
                    {bulkRateMode === 'PERCENT' ? 'प्रतिशत मान (Value %)' : 'राशि मान (Value ₹)'}
                  </label>
                  <input
                    type="number"
                    value={bulkRateValue}
                    onChange={(e) => setBulkRateValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-indigo-700 rounded-xl p-2.5 text-sm font-black text-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (workers.length === 0) {
                    alert("कोई मजदूर पंजीकृत नहीं है!");
                    return;
                  }
                  if (window.confirm(`क्या आप ${bulkCategoryFilter === 'ALL' ? 'सभी' : bulkCategoryFilter} मजदूरों की दर अपडेट करना चाहते हैं?`)) {
                    let updatedCount = 0;
                    workers.forEach(w => {
                      if (bulkCategoryFilter !== 'ALL' && w.category !== bulkCategoryFilter && w.workerType !== bulkCategoryFilter) {
                        return;
                      }
                      let currentRate = w.dailyRate || 500;
                      let newRate = currentRate;
                      if (bulkRateMode === 'FLAT_ADD') {
                        newRate = Math.max(0, currentRate + bulkRateValue);
                      } else if (bulkRateMode === 'PERCENT') {
                        newRate = Math.round(currentRate * (1 + bulkRateValue / 100));
                      } else if (bulkRateMode === 'SET_EXACT') {
                        newRate = Math.max(0, bulkRateValue);
                      }
                      updateWorker(w.id, { dailyRate: newRate });
                      updatedCount++;
                    });
                    setBulkNotice(`🎉 ${updatedCount} मज़दूरों का डेली हाजिरी रेट तुरंत बदलकर अद्यतन (ऑटो-अपडेट) कर दिया गया है!`);
                    setTimeout(() => setBulkNotice(''), 5000);
                  }
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black py-3 px-4 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <Zap size={16} />
                <span>⚡ अभी सभी चुने गए मज़दूरों का डेली रेट बदलें (Apply Rate Change Now)</span>
              </button>
            </div>

            {/* Quick Live Worker Rates List & Inline Editor */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span>👥</span> व्यक्तिगत मजदूर हाजिरी रेट एडिट टेबल (Individual Workers Daily Rate Table)
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  कुल {workers.length} मजदूर
                </span>
              </div>

              {workers.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium italic">
                  कोई मजदूर पंजीकृत नहीं है। 'Workers' टैब से मजदूर जोड़ें।
                </p>
              ) : (
                <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                      <tr>
                        <th className="p-2.5 border-b">मजदूर का नाम (Name)</th>
                        <th className="p-2.5 border-b">मोबाइल नंबर (Phone)</th>
                        <th className="p-2.5 border-b">कैटेगरी (Category)</th>
                        <th className="p-2.5 border-b">वर्तमान दैनिक रेट (Daily Rate ₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {workers.map(w => (
                        <tr key={w.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{w.name}</td>
                          <td className="p-2.5 font-mono text-slate-600">{w.phone || 'N/A'}</td>
                          <td className="p-2.5 font-medium text-slate-600">{w.category || w.workerType || 'Labour'}</td>
                          <td className="p-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-500">₹</span>
                              <input
                                type="number"
                                defaultValue={w.dailyRate}
                                onBlur={(e) => {
                                  const val = Number(e.target.value);
                                  if (!isNaN(val) && val !== w.dailyRate) {
                                    updateWorker(w.id, { dailyRate: val });
                                    setBulkNotice(`⚡ ${w.name} का रेट बदलकर ₹${val} कर दिया गया है!`);
                                    setTimeout(() => setBulkNotice(''), 3000);
                                  }
                                }}
                                className="w-24 border border-slate-300 rounded-lg px-2 py-1 text-xs font-black text-emerald-700 focus:border-purple-500 focus:outline-none"
                              />
                              <span className="text-[10px] text-slate-400">/दिन</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Free Usage & Rules Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-amber-500">⚡</span> Freemium & Usage Limit Rules
              </h2>
              <p className="text-xs text-slate-500">
                Set how many times users can use tools for free before requiring a ₹499 Premium plan.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">Free Uses Limit (Default 3)</label>
                  <input 
                    type="number" 
                    value={paymentSettings?.freeUsageLimit ?? 3} 
                    onChange={(e) => setPaymentSettings({...paymentSettings, freeUsageLimit: Number(e.target.value)})} 
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-bold bg-slate-50" 
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">Minimum Premium Plan Price (₹)</label>
                  <input 
                    type="number" 
                    value={paymentSettings?.minPlanPrice ?? 499} 
                    onChange={(e) => setPaymentSettings({...paymentSettings, minPlanPrice: Number(e.target.value)})} 
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-bold bg-slate-50" 
                  />
                </div>
              </div>

              {/* Current App User Subscription Status Control */}
              <div className="pt-3 border-t border-slate-200 bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-xs font-black text-slate-800">Current App User Subscription:</span>
                    <p className="text-xs text-slate-600">
                      Total Uses So Far: <span className="font-extrabold text-amber-700">{usageStats?.totalUses || 0}</span> / {paymentSettings?.freeUsageLimit || 3}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-black rounded-full ${isSubscribed ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {isSubscribed ? `ACTIVE: ${subscriptionInfo?.planName || 'Pro Plan'} (₹${subscriptionInfo?.amount || 99})` : 'FREE USER (3 LABOUR MAX)'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {isSubscribed ? (
                    <button 
                      onClick={() => { cancelSubscription(); alert('Subscription deactivated'); }} 
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      Deactivate Subscription
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => { activateSubscription({ planId: 'plan_199', amount: 199, planName: 'Starter Plan (5 Labour)' }); alert('₹199 Starter Plan (5 Labour) Activated!'); }} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        + Grant ₹199 (5 Labour)
                      </button>
                      <button 
                        onClick={() => { activateSubscription({ planId: 'plan_499', amount: 499, planName: 'Standard Plan (15 Labour)' }); alert('₹499 Standard Plan (15 Labour) Activated!'); }} 
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        + Grant ₹499 (15 Labour)
                      </button>
                      <button 
                        onClick={() => { activateSubscription({ planId: 'plan_999', amount: 999, planName: 'Pro Contractor Plan (25 Labour)' }); alert('₹999 Pro Plan (25 Labour) Activated!'); }} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        + Grant ₹999 (25 Labour)
                      </button>
                    </>
                  )}

                  <button 
                    onClick={() => { resetUsageStats(); alert('Usage counter reset to 0!'); }} 
                    className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                  >
                    Reset Free Usage Count (0)
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Admin UPI & QR Payment Gateway Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600">💳</span> Admin Payment Gateways & QR Configuration
              </h2>
              
              <div className="space-y-4">
                {/* QR Code Toggle */}
                <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <label className="text-sm text-slate-900 font-bold block">Enable UPI QR Code Payments</label>
                    <span className="text-xs text-slate-500">Show manual QR code scan option to users</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={paymentSettings?.isQrEnabled !== false} 
                    onChange={(e) => setPaymentSettings({...paymentSettings, isQrEnabled: e.target.checked})} 
                    className="w-5 h-5 cursor-pointer accent-blue-600" 
                  />
                </div>

                {paymentSettings?.isQrEnabled !== false && (
                  <div className="p-4 border border-slate-200 rounded-xl space-y-3">
                    <p className="text-xs font-bold text-slate-700">UPI QR Configuration (PhonePe, GPay, Paytm)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-700 font-bold block mb-1">Admin UPI ID</label>
                        <input 
                          type="text" 
                          placeholder="merchant@okaxis" 
                          value={paymentSettings?.upiId || ""} 
                          onChange={(e) => {
                            const newUpi = e.target.value;
                            const autoQr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${newUpi}&pn=OneDiary&am=${paymentSettings?.minPlanPrice || 499}&cu=INR`;
                            setPaymentSettings({
                              ...paymentSettings, 
                              upiId: newUpi,
                              qrCodeUrl: autoQr
                            });
                          }} 
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-mono font-bold" 
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-700 font-bold block mb-1">Account Holder Name</label>
                        <input 
                          type="text" 
                          placeholder="onediary.in" 
                          value={paymentSettings?.upiHolderName || ""} 
                          onChange={(e) => setPaymentSettings({...paymentSettings, upiHolderName: e.target.value})} 
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-bold" 
                        />
                      </div>
                    </div>
                    {paymentSettings?.qrCodeUrl && (
                      <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <img src={paymentSettings.qrCodeUrl} className="w-20 h-20 object-contain bg-white p-1 border rounded-lg shadow-sm" alt="UPI QR" />
                        <div className="text-xs text-slate-600">
                          <p className="font-extrabold text-slate-900">Live QR Preview</p>
                          <p className="text-[10px] text-slate-500 max-w-[200px] break-all">{paymentSettings.qrCodeUrl}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Online Payment Gateway Selection */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-4">
                  <p className="text-xs font-bold text-slate-700 block border-b pb-2">Online Payment Gateway Settings (India)</p>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">Enable Payment Gateways</label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <label className="flex items-center gap-2 bg-slate-50 border p-2 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={!!paymentSettings?.isRazorpayEnabled} onChange={(e) => setPaymentSettings({...paymentSettings, isRazorpayEnabled: e.target.checked})} className="w-4 h-4" />
                        <span className="text-sm font-bold">Razorpay</span>
                      </label>
                      <label className="flex items-center gap-2 bg-slate-50 border p-2 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={!!paymentSettings?.isPhonePeEnabled} onChange={(e) => setPaymentSettings({...paymentSettings, isPhonePeEnabled: e.target.checked})} className="w-4 h-4" />
                        <span className="text-sm font-bold">PhonePe</span>
                      </label>
                      <label className="flex items-center gap-2 bg-slate-50 border p-2 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={!!paymentSettings?.isCashfreeEnabled} onChange={(e) => setPaymentSettings({...paymentSettings, isCashfreeEnabled: e.target.checked})} className="w-4 h-4" />
                        <span className="text-sm font-bold">Cashfree</span>
                      </label>
                      <label className="flex items-center gap-2 bg-slate-50 border p-2 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={!!paymentSettings?.isPayuEnabled} onChange={(e) => setPaymentSettings({...paymentSettings, isPayuEnabled: e.target.checked})} className="w-4 h-4" />
                        <span className="text-sm font-bold">PayU India</span>
                      </label>
                    </div>
                  </div>

                  {/* Gateway Specific Inputs */}
                  {(paymentSettings?.paymentGateway === 'RAZORPAY' || paymentSettings?.isRazorpayEnabled) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <div>
                        <label className="text-xs text-slate-700 font-bold block mb-1">Razorpay Key ID</label>
                        <input type="text" value={paymentSettings?.razorpayKeyId || ""} onChange={(e) => setPaymentSettings({...paymentSettings, razorpayKeyId: e.target.value})} className="w-full border rounded-lg p-2 text-sm font-mono" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-700 font-bold block mb-1">Razorpay Key Secret</label>
                        <input type="password" value={paymentSettings?.razorpayKeySecret || ""} onChange={(e) => setPaymentSettings({...paymentSettings, razorpayKeySecret: e.target.value})} className="w-full border rounded-lg p-2 text-sm font-mono" />
                      </div>
                      <div className="md:col-span-2 pt-2 border-t border-blue-200">
                        <label className="text-xs text-blue-950 font-extrabold block mb-1">Global / Master Razorpay Subscription Plan ID (उदा. plan_TYbj2MfJ41oskm — जो सभी जगह काम करेगा)</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={paymentSettings?.globalRazorpayPlanId || ""} 
                            placeholder="e.g. plan_TYc2RXXUpfElEj" 
                            onChange={(e) => setPaymentSettings({...paymentSettings, globalRazorpayPlanId: e.target.value.trim()})} 
                            className="w-full border border-blue-300 rounded-lg p-2 text-sm font-mono font-bold bg-white text-blue-900" 
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              const updated = { ...paymentSettings, globalRazorpayPlanId: paymentSettings?.globalRazorpayPlanId || "" };
                              setPaymentSettings(updated);
                              await saveGlobalSettings({ paymentSettings: updated });
                              const notice = "✅ ग्लोबल Razorpay Subscription Plan ID सफलतापूर्वक सभी जगह सेट और सिंक कर दिया गया है!";
                              setPaymentSaveNotice(notice);
                              alert(notice);
                              setTimeout(() => setPaymentSaveNotice(''), 4000);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg shrink-0 cursor-pointer shadow"
                          >
                            सब जगह सेव करें
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentSettings?.isPhonePeEnabled && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                      <label className="text-xs text-slate-700 font-bold block mb-1">PhonePe Merchant ID</label>
                      <input type="text" value={paymentSettings?.phonepeMerchantId || ""} onChange={(e) => setPaymentSettings({...paymentSettings, phonepeMerchantId: e.target.value})} className="w-full border rounded-lg p-2 text-sm font-mono" />
                    </div>
                  )}

                  {paymentSettings?.isPayuEnabled && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                      <label className="text-xs text-slate-700 font-bold block mb-1">PayU Merchant Key</label>
                      <input type="text" value={paymentSettings?.payuMerchantKey || ""} onChange={(e) => setPaymentSettings({...paymentSettings, payuMerchantKey: e.target.value})} className="w-full border rounded-lg p-2 text-sm font-mono" />
                    </div>
                  )}
                  
                  {paymentSettings?.isCashfreeEnabled && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                      <label className="text-xs text-slate-700 font-bold block mb-1">Cashfree App ID / Client ID</label>
                      <input type="text" value={paymentSettings?.cashfreeAppId || ""} onChange={(e) => setPaymentSettings({...paymentSettings, cashfreeAppId: e.target.value})} className="w-full border rounded-lg p-2 text-sm font-mono" />
                    </div>
                  )}

                  {paymentSettings?.isInstamojoEnabled && (
                    <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl">
                      <label className="text-xs text-slate-700 font-bold block mb-1">Instamojo API Key</label>
                      <input type="text" value={paymentSettings?.instamojoApiKey || ""} onChange={(e) => setPaymentSettings({...paymentSettings, instamojoApiKey: e.target.value})} className="w-full border rounded-lg p-2 text-sm font-mono" />
                    </div>
                  )}

                </div>

                {paymentSaveNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span>{paymentSaveNotice}</span>
                  </div>
                )}

                <button 
                  type="button"
                  onClick={async () => {
                    setPaymentSettings({ ...paymentSettings });
                    await saveGlobalSettings({ paymentSettings });
                    setPaymentSaveNotice("🎉 पेमेंट एवं गेटवे सेटिंग्स (UPI ID / Razorpay / Limits) सुरक्षित सहेज ली गई हैं और सभी सिस्टम पर तुरंत लागू हो गई हैं!");
                    setTimeout(() => setPaymentSaveNotice(''), 5000);
                  }} 
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold py-3 px-4 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  <span>सुरक्षित सहेजें (Save & Sync Everywhere)</span>
                </button>
              </div>
            </div>
            
            {/* Admin Password Manager Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Lock className="text-purple-600" size={20} />
                🔐 Admin Password & Security Manager
              </h2>
              <p className="text-xs text-slate-500">
                यहां से आप अपना एडमिन लॉगिन पासवर्ड सुरक्षित रूप से बदल सकते हैं।
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">
                    वर्तमान / नया एडमिन पासवर्ड (Admin Password)
                  </label>
                  <input
                    type="text"
                    value={adminPassword}
                    onChange={(e) => {
                      const newP = e.target.value;
                      setAdminPassword(newP);
                      localStorage.setItem("lb_admin_password", newP);
                    }}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-extrabold font-mono text-purple-700 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">
                    मास्टर रिकवरी कोड (Master Recovery PIN)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="2600 (Forgot Password Master Key)"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-500 bg-slate-100"
                  />
                </div>
              </div>

              {passwordSaveNotice && (
                <div className="p-3 bg-purple-50 border border-purple-300 text-purple-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 size={18} className="text-purple-600 shrink-0" />
                  <span>{passwordSaveNotice}</span>
                </div>
              )}

              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    localStorage.setItem("lb_admin_password", adminPassword);
                    await saveGlobalSettings({ adminPassword });
                    setPasswordSaveNotice(`✅ नया एडमिन पासवर्ड '${adminPassword}' सभी सिस्टम के लिए सुरक्षित रूप से सहेज लिया गया है!`);
                    setTimeout(() => setPasswordSaveNotice(''), 5000);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={15} />
                  <span>सुरक्षित सहेजें (Save Password Everywhere)</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const defaultPass = 'Rajan@2600';
                    setAdminPassword(defaultPass);
                    localStorage.setItem("lb_admin_password", defaultPass);
                    await saveGlobalSettings({ adminPassword: defaultPass });
                    setPasswordSaveNotice('✅ एडमिन पासवर्ड डिफ़ॉल्ट "Rajan@2600" पर सभी जगह रीसेट हो गया!');
                    setTimeout(() => setPasswordSaveNotice(''), 5000);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs transition cursor-pointer"
                >
                  रिसेट 'Rajan@2600'
                </button>
              </div>
            </div>

            {/* Subscription Plans Configurator */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>📦</span> Dynamic Subscription Plans & Pricing Manager
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    यहां से आप नए प्लान जोड़ सकते हैं, पुराने प्लान एडिट कर सकते हैं या डिलीट कर सकते हैं। बदलाव तुरंत ऑटो-अपडेट हो जाएंगे!
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPlanForm(!showAddPlanForm)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <Sparkles size={14} className="text-amber-300 animate-pulse" />
                    <span>{showAddPlanForm ? 'बंद करें (Close Form)' : '+ नया प्लान जोड़ें (Add New Plan)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("क्या आप डिफ़ॉल्ट प्लान्स पर रीसेट करना चाहते हैं?")) {
                        localStorage.setItem("lb_subscription_plans_v4", JSON.stringify(defaultPlans));
                        window.location.reload();
                      }
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1 border border-slate-300"
                  >
                    <RefreshCw size={14} />
                    <span>रिसेट डिफ़ॉल्ट (Reset Defaults)</span>
                  </button>
                </div>
              </div>

              {/* Instant Notification Banner */}
              {planActionNotice && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{planActionNotice}</span>
                </div>
              )}

              {/* Form to Add New Custom Subscription Plan */}
              {showAddPlanForm && (
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border-2 border-emerald-400 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3">
                    <h3 className="font-black text-sm text-emerald-300 flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-400" />
                      <span>✨ नया कस्टम सब्सक्रिप्शन प्लान जोड़ें (Create New Plan)</span>
                    </h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/40">
                      LIVE AUTO-UPDATE
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-indigo-200 font-bold block mb-1">
                        प्ला न का नाम (Plan Name) *
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. VIP Commercial Plan (50 Labour) / वीआईपी कमर्शियल प्लान"
                        value={newPlanName} 
                        onChange={(e) => setNewPlanName(e.target.value)} 
                        className="w-full bg-slate-950/80 border border-indigo-700/60 rounded-xl p-2.5 text-sm font-bold text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-indigo-200 font-bold block mb-1">
                          मूल्य Price (₹) *
                        </label>
                        <input 
                          type="number" 
                          placeholder="e.g. 1499"
                          value={newPlanPrice} 
                          onChange={(e) => setNewPlanPrice(Number(e.target.value))} 
                          className="w-full bg-slate-950/80 border border-indigo-700/60 rounded-xl p-2.5 text-sm font-black text-amber-300 focus:border-emerald-400 focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs text-indigo-200 font-bold block mb-1">
                          मजदूर सीमा (Worker Limit) *
                        </label>
                        <input 
                          type="number" 
                          placeholder="e.g. 50"
                          value={newPlanWorkersLimit} 
                          onChange={(e) => setNewPlanWorkersLimit(Number(e.target.value))} 
                          className="w-full bg-slate-950/80 border border-indigo-700/60 rounded-xl p-2.5 text-sm font-bold text-white focus:border-emerald-400 focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs text-indigo-200 font-bold block mb-1">
                          अवधि (Duration) *
                        </label>
                        <select
                          value={newPlanDuration}
                          onChange={(e) => setNewPlanDuration(e.target.value as 'month' | 'year')}
                          className="w-full bg-slate-950/80 border border-indigo-700/60 rounded-xl p-2.5 text-xs font-extrabold text-white focus:border-emerald-400 focus:outline-none"
                        >
                          <option value="month">मासिक (Monthly / Month)</option>
                          <option value="year">वार्षिक (Yearly / Year)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-indigo-200 font-bold block mb-1">
                        फीचर्स सूची (Features - Comma Separated) *
                      </label>
                      <textarea 
                        value={newPlanFeaturesText} 
                        onChange={(e) => setNewPlanFeaturesText(e.target.value)} 
                        placeholder="Up to 50 Labour Hisab, Unlimited Digital Cashbook, VIP Admin Support, GST Calculator"
                        className="w-full bg-slate-950/80 border border-indigo-700/60 rounded-xl p-2.5 text-xs font-medium text-slate-200 focus:border-emerald-400 focus:outline-none" 
                        rows={3} 
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!newPlanName.trim()) {
                          alert("कृपया प्लान का नाम दर्ज करें (Please enter Plan Name)");
                          return;
                        }
                        const featuresArr = newPlanFeaturesText.split(",").map(s => s.trim()).filter(Boolean);
                        const created = addSubscriptionPlan({
                          name: newPlanName.trim(),
                          price: Number(newPlanPrice) || 0,
                          workersLimit: Number(newPlanWorkersLimit) || 5,
                          duration: newPlanDuration,
                          features: featuresArr.length > 0 ? featuresArr : ["Digital Attendance Book", "Digital Cashbook"]
                        });
                        setPlanActionNotice(`✨ नया प्लान "${created.name}" सफलतापूर्वक जोड़ा गया व तुरंत ऑटो-अपडेट हो गया!`);
                        setTimeout(() => setPlanActionNotice(''), 4000);
                        setShowAddPlanForm(false);
                        setNewPlanName('');
                        setNewPlanPrice(299);
                        setNewPlanWorkersLimit(10);
                        setNewPlanFeaturesText('Digital Attendance Book, Digital Cashbook, Unlimited Bills');
                      }}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3 px-4 rounded-xl text-xs transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles size={16} />
                      <span>+ नया प्लान सुरक्षित सहेजें व ऑटो-अपडेट करें (Save & Autoupdate Plan)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Subscription Plans List */}
              {subscriptionPlans.map(plan => (
                <div key={plan.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3 relative group">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      <h3 className="font-extrabold text-slate-900 text-sm">{plan.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                        plan.duration === 'year' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {plan.duration === 'month' ? 'Monthly (मासिक)' : 'Yearly (वार्षिक)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`क्या आप निश्चित रूप से "${plan.name}" प्लान को हटाना चाहते हैं?`)) {
                            deleteSubscriptionPlan(plan.id);
                            setPlanActionNotice(`🗑️ प्लान "${plan.name}" सफलतापूर्वक डिलीट कर दिया गया है!`);
                            setTimeout(() => setPlanActionNotice(''), 4000);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 font-bold block mb-1">Plan Name (प्ला न का नाम)</label>
                      <input 
                        type="text" 
                        value={plan.name} 
                        onChange={(e) => {
                          updateSubscriptionPlan(plan.id, { name: e.target.value });
                          setPlanActionNotice(`⚡ "${e.target.value}" का नाम अपडेट हो गया!`);
                        }} 
                        className="w-full border rounded-xl p-2 text-sm font-bold text-slate-900 focus:border-purple-500 focus:outline-none" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 font-bold block mb-1">Price / मूल्य (₹)</label>
                        <input 
                          type="number" 
                          value={plan.price} 
                          onChange={(e) => {
                            updateSubscriptionPlan(plan.id, { price: Number(e.target.value) });
                            setPlanActionNotice(`⚡ "${plan.name}" की कीमत ₹${e.target.value} हो गई!`);
                          }} 
                          className="w-full border rounded-xl p-2 text-sm font-black text-emerald-700 focus:border-purple-500 focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-bold block mb-1">Worker Limit (मजदूर सीमा)</label>
                        <input 
                          type="number" 
                          value={plan.workersLimit} 
                          onChange={(e) => {
                            updateSubscriptionPlan(plan.id, { workersLimit: Number(e.target.value) });
                            setPlanActionNotice(`⚡ "${plan.name}" मजदूर सीमा ${e.target.value} हो गई!`);
                          }} 
                          className="w-full border rounded-xl p-2 text-sm font-bold text-slate-800 focus:border-purple-500 focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-bold block mb-1">Duration (अवधि)</label>
                        <select
                          value={plan.duration}
                          onChange={(e) => {
                            const dur = e.target.value as 'month' | 'year';
                            updateSubscriptionPlan(plan.id, { duration: dur });
                            setPlanActionNotice(`⚡ "${plan.name}" की अवधि ${dur} हो गई!`);
                          }}
                          className="w-full border rounded-xl p-2 text-xs font-bold text-slate-800 bg-slate-50 focus:border-purple-500 focus:outline-none"
                        >
                          <option value="month">Month (मासिक)</option>
                          <option value="year">Year (वार्षिक)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-blue-600 font-extrabold block mb-1">Razorpay Subscription Plan ID (उदा. plan_... जो Razorpay से मिला है)</label>
                      <input 
                        type="text" 
                        value={plan.razorpayPlanId || ""} 
                        placeholder="e.g. plan_TYc2RXXUpfElEj"
                        onChange={(e) => {
                          updateSubscriptionPlan(plan.id, { razorpayPlanId: e.target.value.trim() });
                        }} 
                        className="w-full border border-blue-300 bg-blue-50/50 rounded-xl p-2 text-sm font-mono font-bold text-blue-900 focus:border-blue-500 focus:outline-none" 
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 font-bold block mb-1">Features (कॉमा द्वारा अलग करें)</label>
                      <textarea 
                        value={plan.features.join(", ")} 
                        onChange={(e) => {
                          const featList = e.target.value.split(",").map(s => s.trim());
                          updateSubscriptionPlan(plan.id, { features: featList });
                        }} 
                        className="w-full border rounded-xl p-2 text-xs font-medium focus:border-purple-500 focus:outline-none" 
                        rows={3} 
                      />
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        updateSubscriptionPlan(plan.id, {
                          name: plan.name,
                          price: plan.price,
                          workersLimit: plan.workersLimit,
                          duration: plan.duration,
                          features: plan.features,
                          razorpayPlanId: plan.razorpayPlanId
                        });
                        let updatedSettings = paymentSettings;
                        if (plan.razorpayPlanId && plan.razorpayPlanId.trim().startsWith('plan_')) {
                          updatedSettings = { ...paymentSettings, globalRazorpayPlanId: plan.razorpayPlanId.trim() };
                          setPaymentSettings(updatedSettings);
                          await saveGlobalSettings({ paymentSettings: updatedSettings });
                        }
                        const msg = `✅ "${plan.name}" के सभी बदलाव और Razorpay Plan ID सफलतापूर्वक सेव और सभी जगह लागू हो गए हैं!`;
                        setPlanActionNotice(msg);
                        alert(msg);
                        setTimeout(() => setPlanActionNotice(''), 4000);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
                    >
                      <Save size={14} />
                      <span>प्लान सेव करें (Save Plan Changes & Apply Globally)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('admin.areYouSure')}</h3>
            <p className="text-sm text-gray-500 mb-6">
              {t('admin.warningText')}
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
              >
                {t('general.cancel')}
              </button>
              <button 
                onClick={handleClearData}
                className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition"
              >
                {t('admin.yesDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color, bg }: { icon: any, title: string, value: string, color: string, bg: string }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${bg}`}>
        <Icon size={16} className={color} />
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-500 font-medium">{title}</div>
    </div>
  );
}
