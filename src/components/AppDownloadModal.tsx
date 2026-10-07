import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check, Share2, Sparkles, ShieldCheck, ArrowRight, ExternalLink, QrCode } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getPwaInstallState, promptPwaInstall, downloadAndroidShortcutLauncher, subscribePwaInstall, PwaInstallState } from '../utils/pwaInstall';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppDownloadModal({ isOpen, onClose }: AppDownloadModalProps) {
  const { language } = useLanguage();
  const [pwaState, setPwaState] = useState<PwaInstallState>(getPwaInstallState());
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'success' | 'downloaded'>('idle');
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');

  useEffect(() => {
    const state = getPwaInstallState();
    if (state.isIOS) {
      setActiveTab('ios');
    }
    const unsubscribe = subscribePwaInstall((newState) => {
      setPwaState(newState);
      if (newState.isInstalled) {
        setInstallStatus('success');
      }
      if (newState.isIOS) {
        setActiveTab('ios');
      }
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstallStatus('installing');
    
    // 1-Click Action: Trigger Native PWA Prompt + Trigger Direct File Launcher Download
    try {
      const res = await promptPwaInstall();
      if (res.outcome === 'accepted' || res.outcome === 'already_installed') {
        setInstallStatus('success');
        return;
      }
    } catch (e) {
      console.warn("PWA prompt notice:", e);
    }

    // Always trigger immediate 1-click shortcut launcher download for Android / iOS / Web
    downloadAndroidShortcutLauncher();
    setInstallStatus('downloaded');
  };

  const handleGoToLogin = () => {
    onClose();
    window.location.href = '/login';
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `📱 *onediary.in (OneDiary) - डिजिटल खाता, हाजिरी और कैशबुक ऐप*\n\nअपने मोबाइल में तुरंत इंस्टॉल करने के लिए इस लिंक को क्रोम (Chrome) या सफारी में खोलें:\n👉 ${window.location.origin}\n\n100% सेफ, ऑफलाइन मोड व क्लाउड बैकअप उपलब्ध!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl border border-indigo-500/40 shadow-2xl w-full max-w-md overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 p-4 sm:p-5 border-b border-indigo-800/50 flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <img
              src="/app-logo.svg"
              alt="onediary.in Official Logo"
              className="w-12 h-12 rounded-2xl object-contain shadow-lg border border-amber-400/60 shrink-0 bg-slate-950 p-0.5"
            />
            <div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                {language === 'hi' ? 'onediary.in ऐप डाउनलोड' : 'Download onediary.in App'}
              </h3>
              <p className="text-xs text-indigo-200 font-semibold">
                {language === 'hi' ? 'Android और iPhone दोनों के लिए' : 'For Android & iOS iPhone'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Success / Downloaded Alert */}
          {pwaState.isInstalled || installStatus === 'success' ? (
            <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Check size={28} strokeWidth={3} />
              </div>
              <h4 className="text-base font-black text-emerald-300">
                {language === 'hi' ? '✓ ऐप आपके फोन में इंस्टॉल हो गया है!' : '✓ App Installed Successfully!'}
              </h4>
              <p className="text-xs text-slate-200 font-medium">
                {language === 'hi'
                  ? 'अब आप तुरंत अपने मोबाइल नंबर से लॉगिन करके अपना खाता इस्तेमाल कर सकते हैं।'
                  : 'You can now log in with your mobile number.'}
              </p>

              {/* Direct Login Button */}
              <button
                onClick={handleGoToLogin}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <span>🔑 1-क्लिक में लॉगिन / साइन इन करें (Login Now)</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : installStatus === 'downloaded' ? (
            <div className="p-4 rounded-2xl bg-indigo-950/90 border border-indigo-500/60 text-center space-y-3">
              <div className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Download size={26} />
              </div>
              <h4 className="text-base font-black text-indigo-200">
                {language === 'hi' ? '✓ ऐप डाउनलोड फाइल जनरेट हो गई है!' : '✓ App Launcher Downloaded!'}
              </h4>
              <p className="text-xs text-slate-200">
                {language === 'hi'
                  ? 'ऐप लांचर आपके मोबाइल में डाउनलोड हो गया है। नीचे बटन दबाकर तुरंत लॉगिन करें:'
                  : 'App launcher downloaded. Click below to login immediately:'}
              </p>

              {/* Direct Login Button */}
              <button
                onClick={handleGoToLogin}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <span>🔑 1-क्लिक में लॉगिन / साइन इन करें (Login Now)</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <>
              {/* Primary Download / Install Button */}
              <div className="space-y-3">
                <button
                  onClick={handleInstallClick}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 text-slate-950 hover:from-emerald-400 hover:to-blue-500 font-black text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 active:scale-95 transition cursor-pointer"
                >
                  <Smartphone size={24} className="animate-bounce" />
                  <span>
                    {language === 'hi' ? '📲 1-क्लिक ऐप डाउनलोड / इंस्टॉल करें' : '📲 1-Click Download & Install App'}
                  </span>
                </button>

                {/* LOGIN BUTTON (Always accessible right below download button) */}
                <button
                  onClick={handleGoToLogin}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <span>🔑 लॉगिन / साइन इन करें (Login Screen)</span>
                  <ArrowRight size={16} />
                </button>

                {/* WhatsApp Share Option */}
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <Share2 size={16} />
                  <span>WhatsApp पर ऐप शेयर करें (Share Link)</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center font-medium">
                  ⚡ Android और Apple iPhone दोनों पर 1-क्लिक में चालू!
                </p>
              </div>

              {/* Step by Step Manual Installation Guide Tabs */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-300">
                    {language === 'hi' ? 'गाइड (Android / iPhone):' : 'Installation Guide:'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab('android')}
                      className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition ${
                        activeTab === 'android'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Android (Chrome)
                    </button>
                    <button
                      onClick={() => setActiveTab('ios')}
                      className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition ${
                        activeTab === 'ios'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      iPhone (Safari)
                    </button>
                  </div>
                </div>

                {activeTab === 'android' && (
                  <div className="bg-slate-850 p-3 rounded-2xl border border-slate-700/60 space-y-2 text-xs">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <p className="text-slate-200">
                        {language === 'hi'
                          ? 'ऊपर हरा **1-क्लिक ऐप डाउनलोड** बटन दबाएं।'
                          : 'Tap the green **1-Click App Download** button above.'}
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <p className="text-slate-200">
                        {language === 'hi'
                          ? 'यदि क्रोम पूछे, तो **"Install App"** या **"Add to Home Screen"** पर ओके करें।'
                          : 'If Chrome asks, tap **"Install App"** or **"Add to Home Screen"**.'}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'ios' && (
                  <div className="bg-slate-850 p-3 rounded-2xl border border-slate-700/60 space-y-2 text-xs">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <p className="text-slate-200">
                        {language === 'hi'
                          ? 'iPhone के सफारी (Safari) ब्राउज़र में नीचे शेयर **(⬆️)** दबाएं।'
                          : 'Tap Safari Share **(⬆️)** button at bottom in iPhone.'}
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <p className="text-slate-200 font-bold text-emerald-300">
                        {language === 'hi'
                          ? '**"Add to Home Screen" (होम स्क्रीन में जोड़ें)** चुनें।'
                          : 'Select **"Add to Home Screen"**.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* App Advantages */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
              <span>100% सुरक्षित और सेफ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400 shrink-0" />
              <span>ऑफ़लाइन मोड सपोर्ट</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center flex gap-2">
          <button
            onClick={handleGoToLogin}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
          >
            🔑 लॉगिन (Login)
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
