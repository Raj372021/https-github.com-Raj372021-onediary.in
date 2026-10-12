import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function OfflineStatusBanner() {
  const { language } = useLanguage();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestoredToast, setShowRestoredToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredToast(true);
      const timer = setTimeout(() => {
        setShowRestoredToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="bg-amber-600 text-white text-xs font-bold py-1.5 px-3 flex items-center justify-between shadow-md sticky top-0 z-50 animate-pulse">
        <div className="flex items-center gap-2 mx-auto">
          <WifiOff size={15} className="shrink-0" />
          <span>
            {language === 'hi'
              ? 'आप अभी ऑफलाइन हैं — सभी डेटा लोकल से सुरक्षित रूप से सेव हो रहा है'
              : 'You are currently offline — all data is securely saved locally'}
          </span>
        </div>
      </div>
    );
  }

  if (showRestoredToast) {
    return (
      <div className="bg-emerald-600 text-white text-xs font-bold py-1.5 px-3 flex items-center justify-between shadow-md sticky top-0 z-50 transition-all duration-300">
        <div className="flex items-center gap-2 mx-auto">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>
            {language === 'hi'
              ? 'ऑनलाइन कनेक्शन वापस आ गया है!'
              : 'Internet connection restored!'}
          </span>
        </div>
      </div>
    );
  }

  return null;
}
