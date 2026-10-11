import React, { useState, useEffect, useRef } from "react";
import { User, Lock, Shield, Settings, Globe, Bell, CreditCard, Clock, HelpCircle, FileText, LogOut, ChevronRight, X, Check, Book, Download, Bot, Calculator, Sparkles, ArrowLeft, Sun, Moon, Receipt, Fingerprint, KeyRound, ShieldCheck, Wallet, Share2, PhoneCall, Mail, Github } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { useAppContext } from "../context/AppContext";
import { TermsModal, PrivacyModal } from "../components/TermsAndPrivacy";
import { getAppLockConfig, saveAppLockConfig, AppLockConfig } from "../components/AppLockGate";
import WalletModal from "../components/WalletModal";
import AppDownloadModal from "../components/AppDownloadModal";
import AdminPasswordModal from "../components/AdminPasswordModal";

export default function More() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { setUserProfile, userProfile, theme, toggleTheme, walletBalance } = useAppContext();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isContactUsOpen, setIsContactUsOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // App Lock State
  const [showAppLockModal, setShowAppLockModal] = useState(false);
  const [appLockState, setAppLockState] = useState<AppLockConfig>(getAppLockConfig());
  const [lockPinInput, setLockPinInput] = useState('');
  const [confirmLockPinInput, setConfirmLockPinInput] = useState('');
  const [lockSetupError, setLockSetupError] = useState('');
  const [lockSetupSuccess, setLockSetupSuccess] = useState('');

  // Secret Admin 3-Tap Symbol State (No countdown, no visible text)
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const adminClickCountRef = useRef(0);
  const adminLastClickTimeRef = useRef(0);

  const handleAdminSymbolClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - adminLastClickTimeRef.current > 2500) {
      adminClickCountRef.current = 1;
    } else {
      adminClickCountRef.current += 1;
    }
    adminLastClickTimeRef.current = now;

    if (adminClickCountRef.current >= 3) {
      adminClickCountRef.current = 0;
      setShowAdminPasswordModal(true);
    }
  };

  const handleSaveAppLock = (e: React.FormEvent) => {
    e.preventDefault();
    setLockSetupError('');
    setLockSetupSuccess('');

    if (appLockState.enabled) {
      if (!appLockState.pin && (!lockPinInput || lockPinInput.length !== 4)) {
        setLockSetupError(language === 'hi' ? 'कृपया 4-अंकों का PIN दर्ज करें' : 'Please enter a 4-digit PIN');
        return;
      }
      if (lockPinInput) {
        if (lockPinInput.length !== 4) {
          setLockSetupError(language === 'hi' ? 'PIN ठीक 4 अंकों का होना चाहिए' : 'PIN must be exactly 4 digits');
          return;
        }
        if (lockPinInput !== confirmLockPinInput) {
          setLockSetupError(language === 'hi' ? 'दोनों PIN मैच नहीं कर रहे हैं!' : 'PINs do not match!');
          return;
        }
      }
    }

    const updatedConfig: AppLockConfig = {
      ...appLockState,
      pin: lockPinInput || appLockState.pin
    };

    saveAppLockConfig(updatedConfig);
    setAppLockState(updatedConfig);
    setLockPinInput('');
    setConfirmLockPinInput('');
    setLockSetupSuccess(language === 'hi' ? '✓ सिक्योरिटी सेटिंग्स सेव हो गई हैं!' : '✓ Security settings saved successfully!');
    setTimeout(() => {
      setShowAppLockModal(false);
      setLockSetupSuccess('');
    }, 1200);
  };

  const [editName, setEditName] = useState(userProfile?.name || '');
  const [editPhone, setEditPhone] = useState(userProfile?.phone || '');
  const [editWorkingField, setEditWorkingField] = useState(userProfile?.workingField || '');

  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.name || '');
      setEditPhone(userProfile.phone || '');
      setEditWorkingField(userProfile.workingField || '');
    }
  }, [userProfile, activeModal]);

  const handleSaveProfile = () => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        name: editName,
        phone: editPhone,
        workingField: editWorkingField
      });
    }
    setActiveModal(null);
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'hi': return 'हिन्दी';
      case 'gu': return 'ગુજરાતી';
      case 'ta': return 'தமிழ்';
      case 'es': return 'Español';
      default: return 'English';
    }
  };

  const openSetting = (title: string) => {
    setActiveModal(title);
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'onediary.in - Digital Khata & Attendance App',
      text: 'onediary.in (OneDiary) - भारत का नंबर 1 डिजिटल खाता, हाजिरी, कैशबुक और पेमेंट ऐप! अभी इस्तेमाल करें:',
      url: 'https://onediary.in'
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert("✓ onediary.in ऐप शेयर लिंक कॉपी हो गया है! (App link copied)");
      } catch (err) {
        alert(`Share onediary.in link: ${shareData.url}`);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-b border-indigo-900/40 text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-lg pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1.5 hover:bg-white/10 rounded-xl transition-colors shrink-0 cursor-pointer text-slate-300 hover:text-white"
            title="Go Back"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-black ml-1 tracking-tight text-white">{t('nav.more')}</h1>
        </div>
        <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer text-slate-200">
          <Bell size={20} />
        </button>
      </div>

      <div className="p-4">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center mb-6">
          {userProfile?.photoURL ? (
            <img 
              src={userProfile.photoURL} 
              alt={userProfile.name || 'User'} 
              className="w-16 h-16 rounded-2xl object-cover mb-3 shadow-md border border-amber-300/40"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 via-orange-500 to-pink-500 rounded-2xl flex items-center justify-center text-slate-950 text-2xl font-black mb-3 shadow-md border border-amber-300/40">
              {(userProfile?.name || userProfile?.role || 'U')[0].toUpperCase()}
            </div>
          )}
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">{userProfile?.name || userProfile?.role || 'User'}</h2>
          {userProfile?.email && (
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-1">
              📧 {userProfile.email}
            </span>
          )}
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
            {userProfile?.role || 'Administrator'} {userProfile?.workingField ? `(${userProfile.workingField})` : ''}
          </p>
          <button 
            onClick={() => openSetting("Edit Profile")}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-xs font-extrabold hover:from-indigo-700 hover:to-blue-700 transition shadow-sm cursor-pointer active:scale-95"
          >
            Edit Profile
          </button>
        </div>

        {/* Prominent App Download Banner */}
        <div 
          onClick={() => setIsDownloadModalOpen(true)}
          className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white rounded-2xl p-4 shadow-lg border border-emerald-400/40 mb-6 flex items-center justify-between cursor-pointer active:scale-98 transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition shadow-sm">
              <Download size={22} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>📲 {language === 'hi' ? 'मोबाइल में ऐप डाउनलोड करें' : 'Download Mobile App'}</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-md uppercase">
                  Free
                </span>
              </h3>
              <p className="text-[11px] text-emerald-100 font-medium">
                {language === 'hi' ? '1-क्लिक में इंस्टॉल करें • 100% सेफ व ऑफलाइन सपोर्ट' : '1-Click Install • Offline & Superfast'}
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/80 group-hover:translate-x-1 transition" />
        </div>

        <Section title="Data & Security">
          <Link to="/sync">
            <MenuItem 
              icon={Shield} 
              colorBg="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              title={language === 'hi' ? 'क्लाउड बैकअप व रिस्टोर' : 'Cloud Backup & Restore'} 
              subtitle={language === 'hi' ? '10 साल डेटा सुरक्षा गारंटी (फोन नंबर)' : '10-Year Lifetime Data Restore via Phone'} 
            />
          </Link>
          <Link to="/sync">
            <MenuItem 
              icon={Github} 
              colorBg="bg-purple-500/15 text-purple-600 dark:text-purple-400"
              title={language === 'hi' ? '🚀 GitHub पर डेटा पुश (Push to GitHub)' : '🚀 Push to GitHub Repository'} 
              subtitle={language === 'hi' ? 'अपने सभी लेजर व डेटा को GitHub में सेव करें' : 'Backup & push records directly to GitHub Repo'} 
            />
          </Link>
          <MenuItem 
            icon={Fingerprint} 
            colorBg="bg-amber-500/15 text-amber-600 dark:text-amber-400"
            title={language === 'hi' ? 'ऐप सिक्योरिटी लॉक (PIN & बायोमेट्रिक)' : 'App Lock (PIN & Fingerprint)'} 
            subtitle={language === 'hi' ? 'फिंगरप्रिंट या 4-अंकों के PIN से सुरक्षित करें' : 'Protect data with Fingerprint or 4-digit PIN'} 
            value={appLockState.enabled ? '🔒 ON' : '🔓 OFF'}
            onClick={() => setShowAppLockModal(true)}
          />
          {appLockState.enabled && (
            <MenuItem 
              icon={Lock} 
              colorBg="bg-rose-500/15 text-rose-600 dark:text-rose-400"
              title={language === 'hi' ? 'अभी ऐप लॉक करें' : 'Lock App Now'} 
              subtitle={language === 'hi' ? 'तुरंत सिक्योरिटी स्क्रीन सक्रिय करें' : 'Instantly trigger app lock screen'} 
              onClick={() => {
                window.dispatchEvent(new Event('lb_trigger_lock'));
              }}
            />
          )}
        </Section>

        <Section title="App Settings">
          <MenuItem 
            icon={theme === 'dark' ? Moon : Sun} 
            colorBg="bg-amber-500/15 text-amber-600 dark:text-amber-400"
            title={language === 'hi' ? 'थीम मोड' : language === 'hinglish' ? 'Theme Mode / थीम मोड' : 'Theme Mode'} 
            value={theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'} 
            onClick={toggleTheme} 
          />
          <MenuItem 
            icon={Globe} 
            colorBg="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
            title={t('more.language')} 
            value={getLanguageLabel(language)} 
            onClick={() => setShowLanguageModal(true)} 
          />
        </Section>

        <Section title="Management">
          <Link to="/quotation">
            <MenuItem 
              icon={Receipt} 
              colorBg="bg-teal-500/15 text-teal-600 dark:text-teal-400"
              title={language === 'hi' ? 'कोटेशन व बिल बुक (GST / Non-GST)' : 'Quotation & Bill Book (GST / Non-GST)'} 
              subtitle={language === 'hi' ? 'ठेकेदार लेटरहेड बिल व कोटेशन 1-क्लिक में बनाएं' : 'Create contractor letterhead bills & estimates'} 
            />
          </Link>
          <Link to="/chat">
            <MenuItem 
              icon={Bot} 
              colorBg="bg-purple-500/15 text-purple-600 dark:text-purple-400"
              title="AI Chatbot Assistant" 
              subtitle={language === 'hi' ? 'कैश या वेतन के सवाल पूछें' : language === 'hinglish' ? 'Ask questions in Hindi / English about wages & cash' : 'Ask questions about wages & cash'} 
            />
          </Link>
          <Link to="/calculator">
            <MenuItem 
              icon={Calculator} 
              colorBg="bg-pink-500/15 text-pink-600 dark:text-pink-400"
              title="Smart Wage & GST Calculator" 
              subtitle={language === 'hi' ? 'दैनिक/मासिक वेतन व GST गणना करें' : 'Perform daily/monthly labor & GST calculations'} 
            />
          </Link>
          {/* Contractor Wallet */}
          <div onClick={() => setIsWalletModalOpen(true)} className="cursor-pointer">
            <MenuItem 
              icon={Wallet} 
              colorBg="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              title={language === 'hi' ? 'ठेकेदार डिजिटल वॉलेट' : 'Contractor Digital Wallet'} 
              subtitle={language === 'hi' ? `वर्तमान बैलेंस: ₹${walletBalance} (रिचार्ज करें व प्लान खरीदें)` : `Balance: ₹${walletBalance} (Recharge & buy plans)`} 
            />
          </div>

          <Link to="/subscriptions">
            <MenuItem 
              icon={Sparkles} 
              colorBg="bg-amber-500/15 text-amber-600 dark:text-amber-400"
              title="Subscription Plans" 
              subtitle="Unlock unlimited worker limits & safe backups" 
            />
          </Link>
          <Link to="/diary">
            <MenuItem 
              icon={Book} 
              colorBg="bg-rose-500/15 text-rose-600 dark:text-rose-400"
              title="My Diary" 
              subtitle="Daily notes & reminders with automatic auto-sums" 
            />
          </Link>
          <Link to="/reports">
            <MenuItem 
              icon={FileText} 
              colorBg="bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"
              title="Salary Sheet & Reports" 
            />
          </Link>
        </Section>

        <Section title="App">
          <MenuItem 
            icon={Share2} 
            colorBg="bg-teal-500/15 text-teal-600 dark:text-teal-400"
            title={language === 'hi' ? 'शेयर ऐप (onediary.in)' : 'Share App (onediary.in)'} 
            subtitle={language === 'hi' ? 'अन्य ठेकेदारों व दोस्तों को लिंक भेजें' : 'Share app link with contractors & colleagues'} 
            onClick={handleShareApp} 
          />
          <MenuItem 
            icon={Download} 
            colorBg="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            title={language === 'hi' ? 'ऐप इंस्टॉल / डाउनलोड करें' : 'Install / Download App'} 
            subtitle={language === 'hi' ? 'अपने मोबाइल की होम स्क्रीन में ऐप जोड़ें' : "Add onediary.in to your phone's home screen"} 
            onClick={() => setIsDownloadModalOpen(true)} 
          />
          <MenuItem 
            icon={FileText} 
            colorBg="bg-blue-500/15 text-blue-600 dark:text-blue-400"
            title={language === 'hi' ? 'सेवा की शर्तें' : language === 'hinglish' ? 'Terms of Service / सेवा की शर्तें' : 'Terms of Service'} 
            subtitle="Read the terms of using Labour Book Pro" 
            onClick={() => setIsTermsOpen(true)} 
          />
          <MenuItem 
            icon={Shield} 
            colorBg="bg-purple-500/15 text-purple-600 dark:text-purple-400"
            title={language === 'hi' ? 'गोपनीयता नीति' : language === 'hinglish' ? 'Privacy Policy / गोपनीयता नीति' : 'Privacy Policy'} 
            subtitle="How we protect your workforce records" 
            onClick={() => setIsPrivacyOpen(true)} 
          />
          <MenuItem 
            icon={PhoneCall} 
            colorBg="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            title={language === 'hi' ? 'संपर्क करें (Contact Us)' : 'Contact Us / ग्राहक सहायता'} 
            subtitle="Email, Phone & Direct App URLs" 
            onClick={() => setIsContactUsOpen(true)} 
          />
        </Section>

        <button 
          onClick={() => {
            const logoutMsg = language === 'hi' ? 'क्या आप लॉग आउट करना चाहते हैं?' : language === 'hinglish' ? 'Are you sure you want to log out? (क्या आप लॉग आउट करना चाहते हैं?)' : 'Are you sure you want to log out?';
            if (window.confirm(logoutMsg)) {
              signOut(auth).then(() => {
                localStorage.removeItem('lb_user_profile');
                localStorage.removeItem('sync_userId');
                setUserProfile(null as any);
                window.location.reload();
              }).catch(() => {
                localStorage.removeItem('lb_user_profile');
                localStorage.removeItem('sync_userId');
                setUserProfile(null as any);
                window.location.reload();
              });
            }
          }}
          className="w-full mt-4 bg-red-700 hover:bg-red-800 transition text-white py-3 rounded-xl flex items-center justify-center font-medium shadow-sm cursor-pointer"
        >
          <LogOut size={18} className="mr-2" />
          Log out
        </button>

        {/* Discreet Footer with subtle 3-Tap Symbol (No text, No countdown) */}
        <div className="mt-8 mb-6 text-center space-y-1.5 pb-4">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide">
            onediary.in • v2.6 Pro Edition
          </p>
          <div className="flex items-center justify-center pt-0.5">
            <button
              type="button"
              onClick={handleAdminSymbolClick}
              aria-label="Security"
              className="p-1 text-slate-400/15 dark:text-slate-600/20 hover:text-slate-400/40 dark:hover:text-slate-400/40 opacity-20 hover:opacity-50 transition-opacity cursor-pointer rounded-full active:scale-90 select-none"
              title="Security"
            >
              <ShieldCheck size={11} className="stroke-[1.5]" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Generic Setting Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">{activeModal}</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:bg-gray-200 rounded-full p-1 transition"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="text-center">
                <Settings size={48} className="mx-auto text-blue-200 mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{activeModal} Settings</h4>
                <p className="text-sm text-gray-500 mb-6">
                  Settings for {activeModal} can be configured here.
                </p>
                
                {/* Mock Form */}
                <div className="space-y-4 text-left">
                  {['Profile Information', 'Edit Profile'].includes(activeModal) && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">
                          {language === 'hi' ? 'नाम' : language === 'hinglish' ? 'Name / Naam' : 'Name'}
                        </label>
                        <input 
                          type="text" 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg p-2 text-sm text-gray-800 bg-white" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">
                          {language === 'hi' ? 'मोबाइल' : language === 'hinglish' ? 'Mobile / Phone' : 'Mobile'}
                        </label>
                        <input 
                          type="text" 
                          value={editPhone} 
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg p-2 text-sm text-gray-800 bg-white" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">
                          {language === 'hi' ? 'कार्य क्षेत्र' : language === 'hinglish' ? 'Working Field / Kshetra' : 'Working Field'}
                        </label>
                        <input 
                          type="text" 
                          value={editWorkingField} 
                          onChange={(e) => setEditWorkingField(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg p-2 text-sm text-gray-800 bg-white" 
                        />
                      </div>
                    </>
                  )}
                  {activeModal === 'Change Password' && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-gray-500">New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-lg p-2 mt-1" />
                      </div>
                    </>
                  )}
                  {['Privacy Policy', 'Terms & Conditions', 'Help Center'].includes(activeModal) && (
                    <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 border border-gray-100">
                      This is the official {activeModal} documentation for Labour Book. All rights reserved.
                    </div>
                  )}
                </div>

              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={() => {
                  if (['Profile Information', 'Edit Profile'].includes(activeModal)) {
                    handleSaveProfile();
                  } else {
                    setActiveModal(null);
                  }
                }}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Globe size={20} />
                {t('more.language')}
              </h3>
              <button onClick={() => setShowLanguageModal(false)} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10">
                <X size={20} />
              </button>
            </div>
            <div className="p-3 overflow-y-auto divide-y divide-gray-100">
              {[
                { id: 'en', name: 'English Only', native: 'English' },
                { id: 'hinglish', name: 'Hindi + English Mix', native: 'हिंदी + English (Bilingual)' },
                { id: 'hi', name: 'Pure Hindi', native: 'केवल हिन्दी' },
                { id: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
                { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
                { id: 'mr', name: 'Marathi', native: 'मराठी' },
                { id: 'bn', name: 'Bengali', native: 'বাংলা' },
                { id: 'te', name: 'Telugu', native: 'తెలుగు' },
                { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
                { id: 'ml', name: 'Malayalam', native: 'മലയാളം' },
                { id: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
                { id: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
                { id: 'es', name: 'Spanish', native: 'Español' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => { setLanguage(lang.id as any); setShowLanguageModal(false); }}
                  className={`w-full p-3.5 text-left flex justify-between items-center transition rounded-xl my-1 ${
                    language === lang.id ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-base font-semibold">{lang.native}</span>
                    <span className="text-xs text-gray-500 font-normal">{lang.name}</span>
                  </div>
                  {language === lang.id && (
                    <span className="bg-blue-600 text-white rounded-full p-1 shadow-sm">
                      <Check size={16} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* App Lock Modal */}
      {showAppLockModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex justify-between items-center border-b border-indigo-900/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-400 text-slate-950 rounded-xl">
                  <Fingerprint size={22} />
                </div>
                <div>
                  <h3 className="font-black text-sm text-amber-300">
                    {language === 'hi' ? 'ऐप लॉक & बायोमेट्रिक सेटिंग्स' : 'App Lock & Biometric Settings'}
                  </h3>
                  <p className="text-[10px] text-slate-300">
                    {language === 'hi' ? '4-अंकों का PIN या फिंगरप्रिंट लगाएं' : 'Secure app with 4-Digit PIN or Fingerprint'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAppLockModal(false)}
                className="text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveAppLock} className="p-5 overflow-y-auto space-y-4 text-left flex-1">
              {lockSetupError && (
                <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-3 rounded-2xl text-xs font-bold animate-shake">
                  {lockSetupError}
                </div>
              )}

              {lockSetupSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 p-3 rounded-2xl text-xs font-bold animate-bounce text-center">
                  {lockSetupSuccess}
                </div>
              )}

              {/* Master Lock Toggle */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <label className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                    {language === 'hi' ? 'ऐप लॉक चालू करें (Enable Lock)' : 'Enable App Lock'}
                  </label>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {language === 'hi' ? 'ऐप खोलने पर PIN या फिंगरप्रिंट मांगेगा' : 'Require PIN or Fingerprint on app open'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAppLockState(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    appLockState.enabled ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <div
                    className={`bg-slate-950 w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ${
                      appLockState.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {appLockState.enabled && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                  {/* PIN Input Section */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-slate-100">
                      <KeyRound size={16} className="text-amber-500" />
                      <span>{language === 'hi' ? '4-अंकों का PIN सेट करें:' : 'Set 4-Digit Passcode PIN:'}</span>
                    </div>

                    {appLockState.pin && !lockPinInput && (
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        ✓ {language === 'hi' ? 'PIN पहले से सेट है। बदलने के लिए नीचे नया PIN दर्ज करें:' : 'PIN currently set. Enter new PIN below to change:'}
                      </p>
                    )}

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                        {language === 'hi' ? 'नया 4-अंकों का PIN' : 'New 4-Digit PIN'}
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="••••"
                        value={lockPinInput}
                        onChange={e => setLockPinInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center text-lg font-black tracking-[0.5em] py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                        {language === 'hi' ? 'PIN दोबारा दर्ज करें (Confirm PIN)' : 'Confirm New PIN'}
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="••••"
                        value={confirmLockPinInput}
                        onChange={e => setConfirmLockPinInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center text-lg font-black tracking-[0.5em] py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Fingerprint Toggle */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-400/20 text-amber-500 rounded-xl">
                        <Fingerprint size={20} />
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                          {language === 'hi' ? 'फिंगरप्रिंट अनलॉक (Biometric)' : 'Fingerprint Unlock'}
                        </label>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {language === 'hi' ? 'बायोमेट्रिक से 1-सेकंड में अनलॉक करें' : 'Unlock quickly with touch sensor'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppLockState(prev => ({ ...prev, useBiometric: !prev.useBiometric }))}
                      className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                        appLockState.useBiometric ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <div
                        className={`bg-slate-950 w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                          appLockState.useBiometric ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Auto Lock Delay */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                    <label className="text-xs font-black text-slate-900 dark:text-slate-100 block mb-2">
                      {language === 'hi' ? 'ऑटो-लॉक समय (Auto-Lock Delay):' : 'Auto-Lock Inactivity Timer:'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { min: 0, label: language === 'hi' ? 'तुरंत (Instant)' : 'Immediately' },
                        { min: 1, label: language === 'hi' ? '1 मिनट' : '1 Minute' },
                        { min: 5, label: language === 'hi' ? '5 मिनट' : '5 Minutes' },
                      ].map(item => (
                        <button
                          key={item.min}
                          type="button"
                          onClick={() => setAppLockState(prev => ({ ...prev, autoLockMinutes: item.min }))}
                          className={`py-2 px-1 text-center rounded-xl text-xs font-black border transition cursor-pointer ${
                            appLockState.autoLockMinutes === item.min
                              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg hover:scale-[0.99] active:scale-[0.97] transition cursor-pointer"
                >
                  {language === 'hi' ? 'सेटिंग्स सेव करें' : 'Save Lock Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Terms & Privacy Modals */}
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {/* Wallet Modal */}
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />

      {/* Contact Us Modal */}
      {isContactUsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 text-white p-5 flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs">
                  <PhoneCall size={24} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">संपर्क करें (Contact Us)</h3>
                  <p className="text-xs text-emerald-100 font-medium">onediary.in Help & Support Center</p>
                </div>
              </div>
              <button 
                onClick={() => setIsContactUsOpen(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Official App URL */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-xs uppercase tracking-wider">
                    <Globe size={16} />
                    <span>आधिकारिक ऐप लिंक (Official Website Link)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('https://onediary.in');
                      alert('✓ लिंक कॉपी हो गया: https://onediary.in');
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold cursor-pointer transition shadow-xs flex items-center gap-1"
                  >
                    <span>कॉपी करें</span>
                  </button>
                </div>
                <a 
                  href="https://onediary.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-sm font-black text-emerald-700 dark:text-emerald-400 underline break-all block hover:text-emerald-800 dark:hover:text-emerald-300"
                >
                  https://onediary.in
                </a>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  यह इस ऐप का मुख्य आधिकारिक लिंक है, जिसे आप किसी भी मोबाइल, कंप्यूटर या टैबलेट पर खोल सकते हैं।
                </p>
              </div>

              {/* Email Support & Direct Support Form */}
              <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/60 space-y-3">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-black text-xs uppercase tracking-wider">
                  <Mail size={16} />
                  <span>आधिकारिक ईमेल & सपोर्ट (support@onediary.in)</span>
                </div>

                <div className="space-y-2 pt-1">
                  <input 
                    type="text" 
                    id="support-sender-name"
                    placeholder="आपका नाम (Your Name)" 
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    defaultValue={userProfile?.name || ''}
                  />
                  <input 
                    type="tel" 
                    id="support-sender-phone"
                    placeholder="मोबाइल नंबर (Mobile Number)" 
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    defaultValue={userProfile?.role || ''}
                  />
                  <textarea 
                    id="support-sender-msg"
                    rows={2}
                    placeholder="अपनी समस्या या संदेश यहाँ लिखें... (Write your message)" 
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                  />
                  <button
                    onClick={() => {
                      const nameInput = (document.getElementById('support-sender-name') as HTMLInputElement)?.value || 'Customer';
                      const phoneInput = (document.getElementById('support-sender-phone') as HTMLInputElement)?.value || '9876543210';
                      const msgInput = (document.getElementById('support-sender-msg') as HTMLTextAreaElement)?.value || '';

                      if (!msgInput.trim()) {
                        alert('कृपया संदेश लिखकर भेजें!');
                        return;
                      }

                      const newMail = {
                        id: Date.now().toString(),
                        name: nameInput,
                        phone: phoneInput,
                        message: msgInput,
                        time: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
                      };

                      try {
                        const existing = JSON.parse(localStorage.getItem('onediary_support_mails') || '[]');
                        localStorage.setItem('onediary_support_mails', JSON.stringify([newMail, ...existing]));
                        alert('✓ आपका संदेश और मेल सफलतापूर्वक एडमिन के पास भेज दिया गया है! एडमिन इसे अपने एडमिन पैनल इनबॉक्स में देख सकेंगे।');
                        (document.getElementById('support-sender-msg') as HTMLTextAreaElement).value = '';
                      } catch (e) {
                        alert('संदेश भेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
                      }
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    <Mail size={14} />
                    <span>एडमिन को मेल/संदेश भेजें (Send to Admin)</span>
                  </button>
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShareApp}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 transition"
              >
                <Share2 size={16} />
                <span>ऐप का लिंक दूसरों के साथ शेयर करें (Share App Link)</span>
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-center">
              <button
                onClick={() => setIsContactUsOpen(false)}
                className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 text-white font-black text-xs rounded-xl shadow cursor-pointer hover:bg-slate-800 transition"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Download Modal */}
      <AppDownloadModal 
        isOpen={isDownloadModalOpen} 
        onClose={() => setIsDownloadModalOpen(false)} 
      />

      {/* Secret Admin Password Modal */}
      <AdminPasswordModal 
        isOpen={showAdminPasswordModal} 
        onClose={() => setShowAdminPasswordModal(false)} 
      />
    </div>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-1">{title}</h3>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, colorBg = "bg-blue-500/15 text-blue-600 dark:text-blue-400", title, subtitle, value, onClick }: { icon: any, colorBg?: string, title: string, subtitle?: string, value?: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl shrink-0 ${colorBg} flex items-center justify-center shadow-xs`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{title}</p>
          {subtitle && <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center">
        {value && <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2">{value}</span>}
        <ChevronRight size={16} className="text-slate-400" />
      </div>
    </div>
  );
}
