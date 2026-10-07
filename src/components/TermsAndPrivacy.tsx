import React from 'react';
import { X, Shield, FileText, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: ModalProps) {
  const { language } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-950 text-base">
                {language === 'hi' ? 'सेवा की शर्तें' : language === 'hinglish' ? 'Terms of Service / Seva ki Shartein' : 'Terms of Service'}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Labour Book Pro • Last Updated: July 2026</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full p-1.5 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-slate-700 leading-relaxed font-sans">
          
          {/* Section: English */}
          {(language === 'en' || language === 'hinglish') && (
            <div className="space-y-3">
              <h4 className="font-extrabold text-blue-800 border-b pb-1">Terms & Conditions</h4>
              
              <p className="font-bold">Welcome to Labour Book Pro!</p>
              <p>
                By accessing or using our mobile application, you agree to comply with and be bound by these Terms of Service. Please read them carefully.
              </p>

              <div className="space-y-2 pl-3 border-l-2 border-blue-500 text-xs">
                <p><strong>• Usage Eligibility:</strong> This app is designed for contractors, builders, supervisors, and business owners to manage labor attendance, daily rates, advances, and cash book logs.</p>
                <p><strong>• Account Security:</strong> You verify your account using a one-time OTP sent to your mobile number. You are responsible for all activities conducted under your phone number.</p>
                <p><strong>• Data Ownership:</strong> Your data is stored locally on your device. When Cloud Sync is active, encrypted backup logs are stored on secure cloud databases to allow multi-device recovery.</p>
                <p><strong>• Subscriptions & Fees:</strong> Free accounts have limitations. Upgrading to a Pro Plan unlocks unlimited workers and cloud database features. Payments are securely processed, and subscriptions are subject to renewal.</p>
                <p><strong>• Prohibited Content:</strong> You must not use this app to record fraudulent transactions, mock accounts, or engage in malicious behavior.</p>
              </div>
            </div>
          )}

          {/* Section: Hindi */}
          {(language === 'hi' || language === 'hinglish' || language !== 'en') && (
            <div className="space-y-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <h4 className="font-extrabold text-indigo-800 border-b pb-1">नियम और शर्तें</h4>
              
              <p className="font-bold text-slate-800">लेबर बुक प्रो में आपका स्वागत है!</p>
              <p className="text-xs text-slate-600">
                हमारी मोबाइल एप्लीकेशन का उपयोग करके, आप इन सेवा शर्तों का पालन करने और उनसे बाध्य होने के लिए सहमत होते हैं। कृपया इन्हें ध्यान से पढ़ें।
              </p>

              <div className="space-y-2 pl-3 border-l-2 border-indigo-500 text-xs text-slate-700">
                <p><strong>• उपयोगिता पात्रता:</strong> यह ऐप ठेकेदारों, बिल्डरों, सुपरवाइजरों और व्यापार मालिकों के लिए लेबर हाजिरी, दैनिक वेतन, एडवांस और कैश बुक प्रबंधन के लिए बनाया गया है।</p>
                <p><strong>• खाता सुरक्षा:</strong> आप अपने मोबाइल नंबर पर भेजे गए ओटीपी (OTP) के माध्यम से अपना खाता सत्यापित करते हैं। आप अपने नंबर के तहत होने वाली सभी गतिविधियों के लिए जिम्मेदार हैं।</p>
                <p><strong>• डेटा स्वामित्व:</strong> आपका डेटा मुख्य रूप से आपके डिवाइस पर सुरक्षित रहता है। क्लाउड सिंक सक्षम होने पर, बैकअप को सुरक्षित रखने के लिए इसे क्लाउड पर स्टोर किया जाता है।</p>
                <p><strong>• सदस्यता और शुल्क:</strong> मुफ़्त खातों की कुछ सीमाएँ होती हैं। प्रो प्लान पर अपग्रेड करने से असीमित लेबर जोड़ने और क्लाउड सिंक की सुविधा मिलती है।</p>
                <p><strong>• प्रतिबंध:</strong> ऐप का उपयोग किसी भी प्रकार के अवैध लेनदेन, नकली खातों या दुर्भावनापूर्ण गतिविधियों के लिए नहीं किया जाना चाहिए।</p>
              </div>
            </div>
          )}

          {/* Accept Note */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
            <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              {language === 'hi' 
                ? ' "सहमत हैं" पर क्लिक करके आप इन शर्तों को स्वीकार करते हैं।' 
                : 'By clicking "Agree & Close" or continuing to use this app, you acknowledge that you accept all these terms.'}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button 
            onClick={onClose}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition cursor-pointer text-center text-sm shadow-md shadow-blue-200"
          >
            {language === 'hi' ? 'सहमत हैं और बंद करें' : language === 'hinglish' ? 'Agree & Close / Sahmat Hain' : 'Agree & Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PrivacyModal({ isOpen, onClose }: ModalProps) {
  const { language } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-950 text-base">
                {language === 'hi' ? 'गोपनीयता नीति' : language === 'hinglish' ? 'Privacy Policy / Gopniyata Niti' : 'Privacy Policy'}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Labour Book Pro • Last Updated: July 2026</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full p-1.5 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-slate-700 leading-relaxed font-sans">
          
          {/* Section: English */}
          {(language === 'en' || language === 'hinglish') && (
            <div className="space-y-3">
              <h4 className="font-extrabold text-emerald-800 border-b pb-1">Privacy Policy</h4>
              
              <p className="font-bold">Your Privacy is Our Priority</p>
              <p>
                We are committed to protecting the personal information and transactional ledger data of your workforce.
              </p>

              <div className="space-y-2 pl-3 border-l-2 border-emerald-500 text-xs">
                <p><strong>• Information We Collect:</strong> We collect your phone number, working sector, and role during setup. We also store workers' names, rates, and cash-book entries recorded by you.</p>
                <p><strong>• Data Usage:</strong> This data is solely used to calculate outstanding balances, compile work reports, and offer offline-to-online synchronisation features.</p>
                <p><strong>• Encryption & Safety:</strong> We implement high-grade Secure Sockets Layer (SSL) encryption to guarantee all data synced with cloud backup remains perfectly private.</p>
                <p><strong>• Third-Party Sharing:</strong> We do not sell, rent, or trade your personal data or labor books with any advertising agencies or outer entities.</p>
              </div>
            </div>
          )}

          {/* Section: Hindi */}
          {(language === 'hi' || language === 'hinglish' || language !== 'en') && (
            <div className="space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <h4 className="font-extrabold text-teal-800 border-b pb-1">गोपनीयता नीति</h4>
              
              <p className="font-bold text-slate-800">आपकी गोपनीयता हमारी सर्वोच्च प्राथमिकता है</p>
              <p className="text-xs text-slate-600">
                हम आपके और आपके कर्मचारियों के सभी लेनदेन और हाजिरी डेटा की सुरक्षा के लिए प्रतिबद्ध हैं।
              </p>

              <div className="space-y-2 pl-3 border-l-2 border-teal-500 text-xs text-slate-700">
                <p><strong>• एकत्रित जानकारी:</strong> प्रोफाइल सेटअप के समय हम आपका मोबाइल नंबर, कार्य क्षेत्र और पद की जानकारी लेते हैं। आपके द्वारा जोड़े गए मजदूरों की हाजिरी और वेतन का विवरण सुरक्षित रूप से संग्रहित किया जाता है।</p>
                <p><strong>• डेटा का उपयोग:</strong> इस डेटा का उपयोग केवल वेतन की गणना करने, पीडीएफ रिपोर्ट बनाने और सुरक्षित बैकअप रखने के लिए किया जाता है।</p>
                <p><strong>• डेटा सुरक्षा:</strong> क्लाउड सिंक के माध्यम से ट्रांसफर होने वाला सारा डेटा आधुनिक एन्क्रिप्शन (SSL) द्वारा सुरक्षित रहता है।</p>
                <p><strong>• बाहरी साझाकरण:</strong> हम आपका व्यक्तिगत डेटा या लेबर बहीखाता किसी भी बाहरी विज्ञापन एजेंसी या कंपनी के साथ कभी साझा नहीं करते हैं।</p>
              </div>
            </div>
          )}

          {/* Accept Note */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
            <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              {language === 'hi' 
                ? 'साइन अप करके, आप सहमत होते हैं कि आपकी जानकारी इस गोपनीयता मानक के अनुरूप है।' 
                : 'By signing up, you explicitly agree that your registration information and client list conform to this privacy standard.'}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button 
            onClick={onClose}
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition cursor-pointer text-center text-sm shadow-md shadow-emerald-200"
          >
            {language === 'hi' ? 'सहमत हैं और बंद करें' : language === 'hinglish' ? 'Agree & Close / Sahmat Hain' : 'Agree & Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
