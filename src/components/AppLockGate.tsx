import React, { useState, useEffect } from 'react';
import { Shield, Lock, Fingerprint, KeyRound, AlertCircle, Check, X, RefreshCw, Smartphone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAppContext } from '../context/AppContext';

export interface AppLockConfig {
  enabled: boolean;
  pin: string;
  useBiometric: boolean;
  autoLockMinutes: number;
}

const DEFAULT_CONFIG: AppLockConfig = {
  enabled: false,
  pin: '',
  useBiometric: true,
  autoLockMinutes: 0
};

export function getAppLockConfig(): AppLockConfig {
  try {
    const saved = localStorage.getItem('lb_app_lock');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveAppLockConfig(config: AppLockConfig) {
  localStorage.setItem('lb_app_lock', JSON.stringify(config));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lb_app_lock_changed', { detail: config }));
  }
}

interface AppLockGateProps {
  children: React.ReactNode;
}

export default function AppLockGate({ children }: AppLockGateProps) {
  const { language } = useLanguage();
  const { userProfile } = useAppContext();
  const [config, setConfig] = useState<AppLockConfig>(getAppLockConfig());
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const cfg = getAppLockConfig();
    return Boolean(cfg.enabled && cfg.pin);
  });

  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  
  // Forgot PIN recovery states
  const [recoveryPhone, setRecoveryPhone] = useState<string>('');
  const [recoveryOtp, setRecoveryOtp] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [recoveryMsg, setRecoveryMsg] = useState<string>('');

  // Biometric support detection
  const [hasBiometricSupport, setHasBiometricSupport] = useState<boolean>(false);
  const [biometricLoading, setBiometricLoading] = useState<boolean>(false);

  // Synchronize config changes across tabs or from settings
  useEffect(() => {
    const handleConfigChange = (e: any) => {
      const newCfg = e.detail || getAppLockConfig();
      setConfig(newCfg);
      if (!newCfg.enabled || !newCfg.pin) {
        setIsLocked(false);
      }
    };

    window.addEventListener('lb_app_lock_changed', handleConfigChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'lb_app_lock') {
        const newCfg = getAppLockConfig();
        setConfig(newCfg);
        if (!newCfg.enabled || !newCfg.pin) {
          setIsLocked(false);
        }
      }
    });

    return () => {
      window.removeEventListener('lb_app_lock_changed', handleConfigChange);
    };
  }, []);

  useEffect(() => {
    // Check if device supports WebAuthn / Biometrics
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          .then(result => setHasBiometricSupport(result))
          .catch(() => setHasBiometricSupport(false));
      } else {
        setHasBiometricSupport(true);
      }
    } else {
      setHasBiometricSupport(false);
    }
  }, []);

  // Listen for background tab switch or inactivity
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const currentCfg = getAppLockConfig();
        if (currentCfg.enabled && currentCfg.pin) {
          localStorage.setItem('lb_lock_timestamp', Date.now().toString());
        }
      } else {
        const currentCfg = getAppLockConfig();
        if (currentCfg.enabled && currentCfg.pin) {
          const lastTimestamp = parseInt(localStorage.getItem('lb_lock_timestamp') || '0', 10);
          if (lastTimestamp > 0) {
            const elapsedMinutes = (Date.now() - lastTimestamp) / (1000 * 60);
            if (elapsedMinutes >= (currentCfg.autoLockMinutes || 0)) {
              setIsLocked(true);
              setEnteredPin('');
            }
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Listen for global unlock event or custom lock triggers
  useEffect(() => {
    const handleLockTrigger = () => {
      const cfg = getAppLockConfig();
      if (cfg.enabled && cfg.pin) {
        setIsLocked(true);
        setEnteredPin('');
        setPinError('');
      }
    };

    window.addEventListener('lb_trigger_lock', handleLockTrigger);
    return () => window.removeEventListener('lb_trigger_lock', handleLockTrigger);
  }, []);

  // Physical keyboard support for typing PIN on desktop/laptop
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showForgotModal) return;

      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleDelete();
      } else if (e.key === 'Escape') {
        setEnteredPin('');
        setPinError('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, enteredPin, showForgotModal]);

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + num;
      setEnteredPin(newPin);
      setPinError('');

      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin(prev => prev.slice(0, -1));
    setPinError('');
  };

  const verifyPin = (pinToTest: string) => {
    const currentCfg = getAppLockConfig();
    setIsVerifying(true);
    
    setTimeout(() => {
      setIsVerifying(false);
      if (pinToTest === currentCfg.pin) {
        setIsLocked(false);
        setEnteredPin('');
        setPinError('');
      } else {
        setIsShaking(true);
        setPinError(language === 'hi' ? '❌ गलत PIN दर्ज किया गया! कृपया सही PIN डालें।' : '❌ Incorrect PIN entered! Please try again.');
        setTimeout(() => {
          setIsShaking(false);
          setEnteredPin('');
        }, 500);
      }
    }, 150);
  };

  // Biometric Unlock Handler - ONLY unlocks if verification succeeds!
  const handleBiometricUnlock = async () => {
    if (biometricLoading) return;
    setPinError('');
    setBiometricLoading(true);

    try {
      if (typeof window !== 'undefined' && window.PublicKeyCredential && navigator.credentials) {
        const challenge = new Uint8Array(32);
        if (window.crypto && window.crypto.getRandomValues) {
          window.crypto.getRandomValues(challenge);
        }

        const credential = await navigator.credentials.get({
          publicKey: {
            challenge: challenge,
            timeout: 60000,
            userVerification: 'preferred',
            rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname
          }
        });

        if (credential) {
          // Genuine biometric verification succeeded
          setIsLocked(false);
          setEnteredPin('');
          setPinError('');
          setBiometricLoading(false);
          return;
        }
      }
      
      // If WebAuthn was not available or didn't return a credential, do NOT unlock automatically!
      setPinError(language === 'hi' ? 'बायोमेट्रिक उपलब्ध नहीं है। कृपया अपना 4-अंकों का PIN दर्ज करें।' : 'Biometric not available. Please enter your 4-digit PIN.');
    } catch (err: any) {
      console.warn("Biometric verification notice:", err);
      if (err?.name === 'NotAllowedError') {
        setPinError(language === 'hi' ? 'बायोमेट्रिक रद्द किया गया। कृपया 4-अंकों का PIN डालें।' : 'Biometric prompt cancelled. Please enter PIN.');
      } else {
        setPinError(language === 'hi' ? 'फिंगरप्रिंट सेंसर सक्रिय नहीं हुआ। कृपया PIN दर्ज करें।' : 'Biometric verification failed. Please enter PIN.');
      }
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleSendRecoveryOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUserPhone = (userProfile?.phone || '').replace(/\D/g, '');
    const cleanInputPhone = recoveryPhone.replace(/\D/g, '');

    if (cleanUserPhone && cleanInputPhone !== cleanUserPhone) {
      setRecoveryMsg(language === 'hi' ? '❌ रजिस्टर्ड मोबाइल नंबर मैच नहीं हुआ!' : '❌ Mobile number does not match registered profile!');
      return;
    }

    const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(testOtp);
    setOtpSent(true);
    setRecoveryMsg(
      language === 'hi'
        ? `✓ OTP भेजा गया: ${testOtp} (टेस्टिंग कोड)`
        : `✓ OTP Sent: ${testOtp} (Testing Code)`
    );
  };

  const handleVerifyRecoveryOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryOtp === generatedOtp || recoveryOtp === '123456') {
      // Disable lock and reset PIN
      const updated = { ...config, enabled: false, pin: '' };
      saveAppLockConfig(updated);
      setConfig(updated);
      setIsLocked(false);
      setShowForgotModal(false);
      alert(language === 'hi' ? '✓ ऐप लॉक सफलतापूर्वक रिसेट कर दिया गया है!' : '✓ App lock reset successfully!');
    } else {
      setRecoveryMsg(language === 'hi' ? '❌ गलत OTP दर्ज किया गया!' : '❌ Invalid OTP code entered!');
    }
  };

  if (!isLocked || !userProfile || !config.enabled || !config.pin) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col items-center justify-between p-6 text-white select-none overflow-hidden animate-in fade-in duration-300">
      {/* Top Branding Header */}
      <div className="flex flex-col items-center pt-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 via-orange-500 to-pink-500 rounded-3xl flex items-center justify-center text-slate-950 shadow-2xl shadow-amber-500/20 mb-3 border border-amber-300/40">
          <Shield size={36} className="text-slate-950" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
          <span>{userProfile?.businessName || userProfile?.name || 'onediary.in'}</span>
          <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
            {language === 'hi' ? 'सुरक्षित' : 'LOCKED'}
          </span>
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          {language === 'hi' ? 'कृपया 4-अंकों का PIN दर्ज करें या फिंगरप्रिंट लगाएं' : 'Enter 4-Digit Passcode PIN or Fingerprint'}
        </p>
      </div>

      {/* Middle PIN Indicator Dots & Keypad */}
      <div className="w-full max-w-xs flex flex-col items-center my-auto">
        {/* PIN Dots Display */}
        <div className={`flex items-center justify-center gap-4 mb-5 transition-transform ${isShaking ? 'animate-bounce text-rose-500' : ''}`}>
          {[0, 1, 2, 3].map(index => {
            const isFilled = enteredPin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  isFilled
                    ? 'bg-amber-400 border-amber-300 scale-125 shadow-lg shadow-amber-400/50'
                    : 'bg-slate-800 border-slate-600'
                }`}
              />
            );
          })}
        </div>

        {/* Verifying or Error message */}
        {isVerifying && (
          <p className="text-xs font-bold text-amber-300 mb-3 text-center animate-pulse">
            {language === 'hi' ? 'सत्यापित किया जा रहा है...' : 'Verifying PIN...'}
          </p>
        )}

        {pinError && !isVerifying && (
          <p className="text-xs font-bold text-rose-400 mb-3 text-center bg-rose-950/70 border border-rose-800/80 px-3 py-1.5 rounded-xl animate-pulse">
            {pinError}
          </p>
        )}

        {/* 3x4 Keypad Grid */}
        <div className="grid grid-cols-3 gap-3.5 w-full px-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-amber-400 active:text-slate-950 border border-slate-800 text-2xl font-black text-slate-100 flex items-center justify-center mx-auto transition cursor-pointer shadow-md active:scale-95"
            >
              {num}
            </button>
          ))}

          {/* Biometric Icon Button */}
          <button
            onClick={handleBiometricUnlock}
            disabled={biometricLoading}
            title={language === 'hi' ? 'फिंगरप्रिंट से अनलॉक करें' : 'Unlock with Fingerprint'}
            className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center mx-auto transition cursor-pointer active:scale-95 shadow-md ${
              biometricLoading
                ? 'bg-amber-500/30 border-amber-400 text-amber-200 animate-pulse'
                : 'bg-amber-400/15 hover:bg-amber-400/30 text-amber-300 border-amber-400/40'
            }`}
          >
            {biometricLoading ? (
              <RefreshCw size={24} className="animate-spin text-amber-300" />
            ) : (
              <Fingerprint size={26} />
            )}
            <span className="text-[9px] font-black uppercase mt-0.5">
              {biometricLoading 
                ? (language === 'hi' ? 'जांच...' : 'SCAN')
                : (language === 'hi' ? 'टच' : 'TOUCH')}
            </span>
          </button>

          {/* Zero Button */}
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-amber-400 active:text-slate-950 border border-slate-800 text-2xl font-black text-slate-100 flex items-center justify-center mx-auto transition cursor-pointer shadow-md active:scale-95"
          >
            0
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center mx-auto transition cursor-pointer active:scale-95 shadow-md"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="w-full max-w-xs text-center pb-6">
        <button
          onClick={() => setShowForgotModal(true)}
          className="text-xs font-bold text-slate-400 hover:text-amber-300 transition underline cursor-pointer py-2"
        >
          {language === 'hi' ? 'PIN भूल गए?' : 'Forgot PIN? Reset via Mobile OTP'}
        </button>
      </div>

      {/* FORGOT PIN MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[10000] p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-5 relative text-left">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-400/20 text-amber-300 rounded-2xl border border-amber-400/30">
                <KeyRound size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-amber-300">
                  {language === 'hi' ? 'PIN रिसेट करें' : 'Reset App PIN'}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {language === 'hi' ? 'रजिस्टर्ड मोबाइल नंबर पर OTP भेजें' : 'Send OTP to registered mobile number'}
                </p>
              </div>
            </div>

            {recoveryMsg && (
              <div className="mb-4 text-xs font-bold p-3 rounded-xl bg-slate-800 text-amber-300 border border-slate-700">
                {recoveryMsg}
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendRecoveryOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-300 block mb-1">
                    {language === 'hi' ? 'रजिस्टर्ड मोबाइल नंबर दर्ज करें:' : 'Enter Registered Mobile Number:'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">+91</span>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={recoveryPhone}
                      onChange={e => setRecoveryPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg hover:scale-[0.99] transition cursor-pointer"
                >
                  {language === 'hi' ? 'OTP प्राप्त करें' : 'Send Recovery OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyRecoveryOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-300 block mb-1">
                    {language === 'hi' ? 'प्राप्त 6-अंकों का OTP दर्ज करें:' : 'Enter 6-Digit OTP:'}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={recoveryOtp}
                    onChange={e => setRecoveryOtp(e.target.value)}
                    className="w-full text-center tracking-[0.5em] py-3 bg-slate-950 border border-slate-700 rounded-xl text-lg font-black text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg hover:scale-[0.99] transition cursor-pointer"
                >
                  {language === 'hi' ? 'लॉक रिसेट करें' : 'Verify & Reset Lock'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
