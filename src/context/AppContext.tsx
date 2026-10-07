import React, { createContext, useContext, useState, useEffect } from 'react';
import { playPaymentSuccessSound } from '../utils/sound';
import { firestore, doc, setDoc, onSnapshot } from '../firebase';

export type AttendanceStatus = 'P' | 'P+1/2' | 'P.1/2' | 'PP' | 'PPP' | 'OT' | 'A' | '';
export type AttendanceThemeColor = 'GREEN' | 'PINK' | 'BLUE' | 'RED';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  paymentPhone?: string;
  dailyRate: number;
  category?: string;
  workerType?: 'LABOUR' | 'OFFICE';
  rateType?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ROUND';
}

export interface Attendance {
  workerId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  advance: number;
  advanceNote?: string;
}

export interface CashBookItem {
  id: string;
  name: string;
}

export interface CashEntry {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: 'IN' | 'OUT';
  partyName?: string;
  description: string;
  cashBookId?: string; // Optional for backward compatibility, defaults to 'default'
  time?: string; // Optional timestamp
  paymentMode?: 'CASH' | 'ONLINE' | 'UPI' | 'BANK' | 'OTHER' | string; // Optional payment mode
}

export interface UserProfile {
  name?: string;
  role: 'Contractor' | 'Supervisor' | 'Labour' | 'Shop Manager' | string;
  language: string;
  phone: string;
  workingField?: string;
  email?: string;
  photoURL?: string;
  uid?: string;
  authProvider?: 'google' | 'phone' | 'email' | 'direct';
}

export interface PaymentSettings {
  isNotificationEnabled: boolean;
  isQrEnabled: boolean;
  paymentGateway: 'RAZORPAY' | 'PHONEPE' | 'PAYU' | 'CASHFREE' | 'INSTAMOJO' | 'NONE';
  qrCodeUrl: string;
  upiId: string;
  upiHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  globalRazorpayPlanId?: string;
  isRazorpayEnabled: boolean;
  phonepeMerchantId: string;
  payuMerchantKey: string;
  cashfreeAppId: string;
  instamojoApiKey: string;
  freeUsageLimit: number;
  minPlanPrice: number;
  defaultMasonRate?: number;
  defaultHelperRate?: number;
  defaultCarpenterRate?: number;
  defaultElectricianRate?: number;
  defaultPainterRate?: number;
  defaultWelderRate?: number;
  overtimeMultiplier?: number;
  defaultGstRate?: number;
}

export const defaultPaymentSettings: PaymentSettings = {
  isNotificationEnabled: true,
  isQrEnabled: true,
  paymentGateway: 'RAZORPAY',
  phonepeMerchantId: '',
  payuMerchantKey: '',
  cashfreeAppId: '',
  instamojoApiKey: '', 
  qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=onediary@okaxis&pn=OneDiary&am=199&cu=INR", 
  upiId: "onediary@okaxis",
  upiHolderName: "onediary.in",
  bankName: "State Bank of India",
  accountNumber: "38920100293",
  ifscCode: "SBIN0001234",
  razorpayKeyId: ((import.meta as any).env?.VITE_RAZORPAY_KEY_ID as string) || "", 
  razorpayKeySecret: "", 
  globalRazorpayPlanId: "plan_TYbj2MfJ41oskm",
  isRazorpayEnabled: true,
  freeUsageLimit: 3,
  minPlanPrice: 199,
  defaultMasonRate: 800,
  defaultHelperRate: 500,
  defaultCarpenterRate: 900,
  defaultElectricianRate: 900,
  defaultPainterRate: 750,
  defaultWelderRate: 850,
  overtimeMultiplier: 1.5,
  defaultGstRate: 18
};

export interface SubscriptionPlan { id: string; name: string; workersLimit: number; price: number; duration: "month" | "year"; features: string[]; razorpayPlanId?: string; }

export const defaultPlans: SubscriptionPlan[] = [
  { 
    id: "free_starter", 
    name: "Free Plan (3 Labour) / मुफ़्त प्लान (3 मजदूर)", 
    workersLimit: 3, 
    price: 0, 
    duration: "month", 
    features: [
      "Up to 3 Labour / Workers Allowed (केवल 3 लेबर (मजदूर) तक की अनुमति)",
      "3 Bill Books Free Download (3 बिल बुक डाउनलोड मुफ़्त)",
      "Daily Attendance & Salary Hisab (दैनिक उपस्थिति एवं हाजिरी हिसाब)",
      "Digital Attendance Book Access (डिजिटल हाजिरी बुक एक्सेस)"
    ] 
  },
  { 
    id: "plan_199", 
    name: "Starter Plan (5 Labour + 1 Vedic Kundli) / स्टार्टर प्लान", 
    workersLimit: 5, 
    price: 199, 
    duration: "month", 
    features: [
      "1 Vedic Janm Kundli Generator (1 संपूर्ण वैदिक जन्म कुण्डली)",
      "10-Year Life Predictions (10 साल का विस्तृत वर्ष-वार भविष्यफल)",
      "36 Gunas Marriage Match (36 अष्टकूट विवाह गुण मिलान)",
      "3D Royal Golden Kundli Plate Download (3D गोल्ड कुण्डली डाउनलोड)",
      "Up to 5 Labour / Workers Allowed (5 लेबर हाजिरी व सैलरी रिकॉर्ड)",
      "Digital Cashbook & 5 Bill Books / Mo (डिजिटल कैशबुक व 5 बिल बुक)",
      "Daily Attendance & Salary Hisab (दैनिक उपस्थिति एवं हाजिरी हिसाब)"
    ] 
  },
  { 
    id: "plan_499", 
    name: "Standard Plan (15 Labour) / स्टैंडर्ड प्लान (15 मजदूर)", 
    workersLimit: 15, 
    price: 499, 
    duration: "month", 
    features: [
      "Unlimited Vedic Kundli & 36 Guna Milan (अनलिमिटेड कुण्डली व विवाह मिलान)",
      "Up to 15 Labour / Workers Allowed (15 लेबर तक की अनुमति)",
      "Unlimited Digital Attendance Book (अनलिमिटेड डिजिटल हाजिरी बुक)",
      "Digital Cashbook (डिजिटल कैश बुक)",
      "GST Calculator & Bill Maker (GST कैलकुलेटर एवं बिल मेकर)",
      "Quotation Download & Sharing (कोटेशन डाउनलोड एवं शेयरिंग)",
      "Site Construction Diary (साइट कंस्ट्रक्शन डायरी)"
    ] 
  },
  { 
    id: "plan_999", 
    name: "Pro Contractor Plan (25 Labour) / प्रो ठेकेदार प्लान (25 मजदूर)", 
    workersLimit: 25, 
    price: 999, 
    duration: "month", 
    features: [
      "Unlimited Vedic Kundli & 36 Guna Milan (अनलिमिटेड कुण्डली व विवाह मिलान)",
      "Up to 25 Labour / Workers Allowed (25 लेबर तक की अनुमति)",
      "Complete Hisab for 25 Labour (25 मजदूरों का संपूर्ण हिसाब)",
      "Unlimited GST Bill & Quotation Maker (अनलिमिटेड GST बिल व कोटेशन मेकर)",
      "Digital Cashbook & Balance Sheet (डिजिटल कैश बुक व बैलेंस शीट)",
      "GST Calculator (GST कैलकुलेटर)",
      "Cloud Backup & 100% Security (क्लाउड बैकअप एवं 100% सुरक्षा)"
    ] 
  },
  { 
    id: "plan_2999_year", 
    name: "Annual VIP Plan (25+ Labour / 1 Year) / वार्षिक VIP प्लान (1 वर्ष)", 
    workersLimit: 25, 
    price: 2999, 
    duration: "year", 
    razorpayPlanId: "plan_TYbj2MfJ41oskm",
    features: [
      "Unlimited Vedic Kundli & 36 Guna Milan Full 1 Year (अनलिमिटेड कुण्डली 1 वर्ष)",
      "25 Labour Capacity — Full 1 Year (25 लेबर क्षमता — पूरे 1 वर्ष के लिए)",
      "All Premium Features Unlocked (सभी प्रीमियम फीचर्स पूरे 1 साल के लिए अनलॉक)",
      "GST Calculator & Unlimited Bills (GST कैलकुलेटर व अनलिमिटेड GST बिल मेकर)",
      "Digital Cashbook & Site Diary (डिजिटल कैश बुक एवं साइट डायरी)",
      "VIP Admin & Phone Support (वीआईपी एडमिन सपोर्ट व प्राथमिकता)",
      "Annual Savings — Save >60% (वार्षिक बचत — 60% से अधिक बचत)"
    ] 
  }
];

export interface SubscriptionInfo {
  isSubscribed: boolean;
  planId: string;
  planName: string;
  amount: number;
  paymentId: string;
  paymentMethod: string;
  subscribedAt: string;
  expiresAt: string;
  isApproved: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface PaymentRequest {
  id: string;
  userName: string;
  userPhone: string;
  planId: string;
  planName: string;
  amount: number;
  utrNumber: string;
  paymentMethod: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface UsedUtrRecord {
  utr: string;
  amount: number;
  type: 'PLAN' | 'WALLET';
  description?: string;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  date: string;
  utr?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export interface UsageStats {
  featureUses: { [featureKey: string]: number };
  totalUses: number;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  type: 'ANNOUNCEMENT' | 'OFFER' | 'ALERT' | 'UPDATE' | string;
  actionUrl?: string;
  created_at: string;
  is_active?: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  workersLimit?: number;
  duration: 'month' | 'year';
}

interface AppContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  workers: Worker[];
  addWorker: (worker: Omit<Worker, 'id'>) => void;
  updateWorker: (id: string, data: Partial<Worker>) => void;
  deleteWorker: (id: string) => void;
  
  attendances: Attendance[];
  updateAttendance: (workerId: string, date: string, data: Partial<Attendance>) => void;
  
  cashBooks: CashBookItem[];
  activeCashBookId: string;
  setActiveCashBookId: (id: string) => void;
  addCashBook: (name: string) => void;
  renameCashBook: (id: string, name: string) => void;
  deleteCashBook: (id: string) => void;
  
  cashEntries: CashEntry[];
  addCashEntry: (entry: Omit<CashEntry, 'id'>) => void;
  updateCashEntry: (id: string, data: Partial<CashEntry>) => void;
  deleteCashEntry: (id: string) => void;
  getCashStats: (cashBookId?: string) => { totalIn: number; totalOut: number; balance: number };

  
  getWorkerAttendance: (workerId: string, month: number, year: number) => Attendance[];

  getWorkerStats: (workerId: string) => { earned: number; advance: number; balance: number; presentDays: number };
  getTodayStats: () => { totalWorkers: number; present: number; absent: number; totalPayable: number };
  getAllWorkerStats: () => Array<Worker & { earned: number; advance: number; balance: number }>;
  currency: 'INR' | 'USD';
  setCurrency: (curr: 'INR' | 'USD') => void;
  formatCurrency: (amount: number) => string;
  subscriptionPlans: SubscriptionPlan[];
  paymentSettings: PaymentSettings;
  setPaymentSettings: (settings: PaymentSettings) => void;
  saveGlobalSettings: (params: {
    paymentSettings?: PaymentSettings;
    subscriptionPlans?: SubscriptionPlan[];
    adminPassword?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  broadcastAllSettingsGlobally: (params?: {
    paymentSettings?: PaymentSettings;
    subscriptionPlans?: SubscriptionPlan[];
    adminPassword?: string;
  }) => Promise<{ success: boolean; message: string; clientCount?: number }>;
  refreshGlobalSettings: () => Promise<void>;
  isSyncingGlobalSettings: boolean;
  globalSettingsLastSynced: string;
  updateSubscriptionPlan: (id: string, data: Partial<SubscriptionPlan>) => void;
  addSubscriptionPlan: (plan: Omit<SubscriptionPlan, 'id'>) => SubscriptionPlan;
  deleteSubscriptionPlan: (id: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  attendanceThemeColor: AttendanceThemeColor;
  setAttendanceThemeColor: (color: AttendanceThemeColor) => void;

  // Wallet State & Functions
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  addWalletBalance: (amount: number, utr?: string, description?: string) => WalletTransaction;
  payWithWallet: (planId: string, planName: string, amount: number, workersLimit?: number) => { success: boolean; reason?: string };

  // Subscription & Usage Limit State
  subscriptionInfo: SubscriptionInfo | null;
  isSubscribed: boolean;
  usageStats: UsageStats;
  paymentRequests: PaymentRequest[];
  addPaymentRequest: (req: Omit<PaymentRequest, 'id' | 'submittedAt' | 'status'>, initialStatus?: 'APPROVED' | 'PENDING') => PaymentRequest;
  approvePaymentRequest: (id: string) => void;
  rejectPaymentRequest: (id: string) => void;
  checkAndIncrementUsage: (featureName: string) => { allowed: boolean; remaining: number; count: number };
  activateSubscription: (details: Partial<SubscriptionInfo>) => SubscriptionInfo;
  cancelSubscription: () => void;
  resetUsageStats: () => void;

  // UTR Tracking & Duplicate Protection
  usedUtrRecords: UsedUtrRecord[];
  isUtrUsed: (utr: string) => { isUsed: boolean; existingRecord?: { utr: string; amount: number; createdAt: string } };
  verifyAndRecordUtr: (utrInput: string, expectedAmount: number, type: 'PLAN' | 'WALLET', description?: string) => { success: boolean; reason?: string; finalUtr: string };

  // Broadcast Notifications
  broadcasts: BroadcastNotification[];
  fetchBroadcasts: () => Promise<void>;
  sendBroadcastNotification: (data: { title: string; message: string; type?: string; actionUrl?: string }) => Promise<any>;
  deleteBroadcastNotification: (id: string) => Promise<boolean>;
  readBroadcastIds: string[];
  markBroadcastAsRead: (id: string) => void;
  markAllBroadcastsAsRead: () => void;
  dismissedBroadcastIds: string[];
  dismissBroadcast: (id: string) => void;
  dismissAllBroadcasts: () => void;

  // Shopping Cart state
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isSyncingGlobalSettings, setIsSyncingGlobalSettings] = useState(false);
  const [globalSettingsLastSynced, setGlobalSettingsLastSynced] = useState<string>(() => 
    new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  const [paymentSettings, setPaymentSettingsState] = useState<PaymentSettings>(() => { 
    const saved = localStorage.getItem("lb_payment_settings_v2"); 
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultPaymentSettings,
          ...parsed,
          isQrEnabled: parsed.isQrEnabled ?? true,
          isRazorpayEnabled: parsed.isRazorpayEnabled ?? true,
          razorpayKeyId: parsed.razorpayKeyId || ((import.meta as any).env?.VITE_RAZORPAY_KEY_ID as string) || ""
        };
      } catch (e) {
        return defaultPaymentSettings;
      }
    }
    return defaultPaymentSettings; 
  });
  useEffect(() => { localStorage.setItem("lb_payment_settings_v2", JSON.stringify(paymentSettings)); }, [paymentSettings]);

  // Broadcast sync to other tabs/windows
  const broadcastSync = (type: string, data?: any) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('onediary_global_sync');
        bc.postMessage({ type, data, timestamp: Date.now() });
        bc.close();
      }
      window.dispatchEvent(new Event('onediary_settings_changed'));
    } catch (e) {}
  };

  // Synchronize settings from server database
  const syncSettingsFromServer = async () => {
    try {
      setIsSyncingGlobalSettings(true);
      const res = await fetch("/api/settings");
      if (res.ok) {
        const serverSettings = await res.json();
        if (serverSettings && Object.keys(serverSettings).length > 0) {
          if (serverSettings.payment_settings) {
            setPaymentSettingsState(prev => ({
              ...prev,
              ...serverSettings.payment_settings
            }));
            localStorage.setItem("lb_payment_settings_v2", JSON.stringify(serverSettings.payment_settings));
          }
          if (serverSettings.subscription_plans && Array.isArray(serverSettings.subscription_plans) && serverSettings.subscription_plans.length > 0) {
            setSubscriptionPlans(serverSettings.subscription_plans);
            localStorage.setItem("lb_subscription_plans_v4", JSON.stringify(serverSettings.subscription_plans));
          }
          if (serverSettings.admin_password) {
            localStorage.setItem("lb_admin_password", serverSettings.admin_password);
          }
          setGlobalSettingsLastSynced(new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }

      // Also pull global payment requests so Admin sees everything from all devices
      try {
        const prRes = await fetch("/api/admin/payment-requests");
        if (prRes.ok) {
          const prData = await prRes.json();
          if (prData && Array.isArray(prData.requests)) {
            setPaymentRequests(prData.requests);
            localStorage.setItem('lb_payment_requests', JSON.stringify(prData.requests));
          }
        }
      } catch (e) {}
    } catch (err) {
      // quiet offline
    } finally {
      setIsSyncingGlobalSettings(false);
    }
  };

  const saveGlobalSettings = async (params: {
    paymentSettings?: PaymentSettings;
    subscriptionPlans?: SubscriptionPlan[];
    adminPassword?: string;
  }) => {
    setIsSyncingGlobalSettings(true);
    const payload: Record<string, any> = {};

    if (params.paymentSettings) {
      setPaymentSettingsState(params.paymentSettings);
      localStorage.setItem("lb_payment_settings_v2", JSON.stringify(params.paymentSettings));
      payload.payment_settings = params.paymentSettings;
    }

    if (params.subscriptionPlans) {
      setSubscriptionPlans(params.subscriptionPlans);
      localStorage.setItem("lb_subscription_plans_v4", JSON.stringify(params.subscriptionPlans));
      payload.subscription_plans = params.subscriptionPlans;
    }

    if (params.adminPassword) {
      localStorage.setItem("lb_admin_password", params.adminPassword);
      payload.admin_password = params.adminPassword;
    }

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload })
      });

      if (res.ok) {
        broadcastSync('SETTINGS_UPDATED', payload);
        setGlobalSettingsLastSynced(new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        return { success: true, message: "सभी सिस्टम और डिवाइसेस पर सेटिंग्स तुरंत लागू हो गई हैं!" };
      }
      return { success: false, message: "सर्वर पर सेव नहीं हो सका।" };
    } catch (e) {
      console.error("Save global settings error:", e);
      return { success: false, message: "नेटवर्क त्रुटि: ऑफलाइन मोड में स्थानीय स्तर पर सहेजा गया।" };
    } finally {
      setIsSyncingGlobalSettings(false);
    }
  };

  const broadcastAllSettingsGlobally = async (params?: {
    paymentSettings?: PaymentSettings;
    subscriptionPlans?: SubscriptionPlan[];
    adminPassword?: string;
  }) => {
    setIsSyncingGlobalSettings(true);
    const targetPaymentSettings = params?.paymentSettings || paymentSettings;
    const targetPlans = params?.subscriptionPlans || subscriptionPlans;
    const targetPassword = params?.adminPassword || localStorage.getItem('lb_admin_password') || 'Rajan@2600';

    setPaymentSettingsState(targetPaymentSettings);
    setSubscriptionPlans(targetPlans);
    localStorage.setItem("lb_payment_settings_v2", JSON.stringify(targetPaymentSettings));
    localStorage.setItem("lb_subscription_plans_v4", JSON.stringify(targetPlans));
    localStorage.setItem("lb_admin_password", targetPassword);

    const payload: Record<string, any> = {
      payment_settings: targetPaymentSettings,
      subscription_plans: targetPlans,
      admin_password: targetPassword,
      broadcast_at: Date.now()
    };

    // 1. Broadcast immediately via local BroadcastChannel
    broadcastSync('SETTINGS_UPDATED', payload);

    // 2. Broadcast to Firebase Firestore for real-time cloud listeners
    try {
      if (firestore) {
        const configRef = doc(firestore, "global_settings", "app_config");
        if (configRef) {
          setDoc(configRef, payload, { merge: true }).catch(() => {});
        }
      }
    } catch (e) {}

    // 3. Broadcast to Server-Sent Events (SSE) & SQLite Database
    try {
      const res = await fetch("/api/settings/broadcast-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload })
      });

      const data = await res.json();
      setGlobalSettingsLastSynced(new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      return {
        success: true,
        clientCount: data?.clientCount ?? 1,
        message: "⚡ 1-क्लिक में सभी सेटिंग्स व दरें सभी कनेक्टेड डिवाइसेस व सिस्टम्स पर तुरंत लागू हो गई हैं!"
      };
    } catch (e) {
      console.error("1-click broadcast error:", e);
      return {
        success: true,
        message: "स्थानीय व ब्राउज़र स्तर पर सभी सेटिंग्स तुरंत लागू कर दी गई हैं!"
      };
    } finally {
      setIsSyncingGlobalSettings(false);
    }
  };

  const setPaymentSettings = (settings: PaymentSettings) => { 
    setPaymentSettingsState(settings); 
    localStorage.setItem("lb_payment_settings_v2", JSON.stringify(settings));
    saveGlobalSettings({ paymentSettings: settings });
  };

  // Real-time synchronization listeners across tabs, devices, SSE, and Firestore
  useEffect(() => {
    syncSettingsFromServer();

    // 1. Real-time Server-Sent Events (SSE) for 0ms live broadcast across all devices
    let eventSource: EventSource | null = null;
    try {
      if (typeof window !== 'undefined' && 'EventSource' in window) {
        eventSource = new EventSource('/api/live-sync');
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && (data.type === 'SETTINGS_UPDATED' || data.type === 'BROADCAST')) {
              syncSettingsFromServer();
            }
          } catch (err) {}
        };
      }
    } catch (e) {}

    // 2. Real-time Firebase Cloud Firestore snapshot listener
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      if (firestore) {
        const configDocRef = doc(firestore, 'global_settings', 'app_config');
        unsubscribeFirestore = onSnapshot(configDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const cloudData = snapshot.data();
            if (cloudData) {
              if (cloudData.payment_settings) {
                setPaymentSettingsState(cloudData.payment_settings);
                localStorage.setItem('lb_payment_settings_v2', JSON.stringify(cloudData.payment_settings));
              }
              if (cloudData.subscription_plans) {
                setSubscriptionPlans(cloudData.subscription_plans);
                localStorage.setItem('lb_subscription_plans_v4', JSON.stringify(cloudData.subscription_plans));
              }
              if (cloudData.admin_password) {
                localStorage.setItem('lb_admin_password', cloudData.admin_password);
              }
              setGlobalSettingsLastSynced(new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            }
          }
        }, () => {});
      }
    } catch (e) {}

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('onediary_global_sync');
        bc.onmessage = () => {
          syncSettingsFromServer();
        };
      }
    } catch (e) {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lb_payment_settings_v2' || e.key === 'lb_subscription_plans_v4' || e.key === 'lb_admin_password') {
        syncSettingsFromServer();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('onediary_settings_changed', syncSettingsFromServer);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncSettingsFromServer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    // Live background polling every 6 seconds as a backup
    const interval = setInterval(() => {
      syncSettingsFromServer();
    }, 6000);

    return () => {
      if (eventSource) eventSource.close();
      if (unsubscribeFirestore) unsubscribeFirestore();
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('onediary_settings_changed', syncSettingsFromServer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("lb_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("lb_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart([item]); // Set to single item cart since you subscribe to exactly one plan at a time
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(() => { 
    const saved = localStorage.getItem("lb_subscription_plans_v4"); 
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((p: any) => {
          if (p.id === 'plan_2999_year' && (!p.razorpayPlanId || p.razorpayPlanId === '')) {
            return { ...p, razorpayPlanId: "plan_TYbj2MfJ41oskm" };
          }
          return p;
        });
      } catch (e) {
        return defaultPlans;
      }
    }
    return defaultPlans;
  });
  useEffect(() => { 
    localStorage.setItem("lb_subscription_plans_v4", JSON.stringify(subscriptionPlans)); 
  }, [subscriptionPlans]);
  const updateSubscriptionPlan = (id: string, data: Partial<SubscriptionPlan>) => { 
    setSubscriptionPlans(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          const merged = { ...p, ...data };
          return merged;
        }
        return p;
      });
      localStorage.setItem("lb_subscription_plans_v4", JSON.stringify(updated));
      saveGlobalSettings({ subscriptionPlans: updated });
      return updated;
    }); 
  };
  const addSubscriptionPlan = (planData: Omit<SubscriptionPlan, 'id'>): SubscriptionPlan => {
    const newPlan: SubscriptionPlan = {
      ...planData,
      id: `custom_plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    setSubscriptionPlans(prev => {
      const updated = [...prev, newPlan];
      localStorage.setItem("lb_subscription_plans_v4", JSON.stringify(updated));
      saveGlobalSettings({ subscriptionPlans: updated });
      return updated;
    });
    return newPlan;
  };
  const deleteSubscriptionPlan = (id: string) => {
    setSubscriptionPlans(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem("lb_subscription_plans_v4", JSON.stringify(updated));
      saveGlobalSettings({ subscriptionPlans: updated });
      return updated;
    });
  };

  const [userProfile, setUserProfileState] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('lb_user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const setUserProfile = (profile: UserProfile | null) => {
    setUserProfileState(profile);
    if (profile) {
      localStorage.setItem('lb_user_profile', JSON.stringify(profile));
      if (profile.phone) {
        localStorage.setItem('sync_userId', profile.phone.replace(/\D/g, ''));
      }
    } else {
      localStorage.removeItem('lb_user_profile');
      localStorage.removeItem('sync_userId');
    }
  };

  const [currency, setCurrencyState] = useState<'INR' | 'USD'>(() => {
    const saved = localStorage.getItem('lb_currency');
    return (saved as 'INR' | 'USD') || 'INR';
  });

  useEffect(() => {
    localStorage.setItem('lb_currency', currency);
  }, [currency]);

  const setCurrency = (curr: 'INR' | 'USD') => setCurrencyState(curr);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem('lb_workers');
    const parsed = saved ? JSON.parse(saved) : [
      { id: '1', name: 'Ramesh Kumar', phone: '9876543210', dailyRate: 500, workerType: 'LABOUR', rateType: 'DAILY' },
      { id: '2', name: 'Suresh Singh', phone: '9876543211', dailyRate: 600, workerType: 'LABOUR', rateType: 'DAILY' }
    ];
    // Ensure all workers have a workerType and rateType set
    return parsed.map((w: any) => ({
      ...w,
      workerType: w.workerType || 'LABOUR',
      rateType: w.rateType || 'DAILY'
    }));
  });

  const [attendances, setAttendances] = useState<Attendance[]>(() => {
    const saved = localStorage.getItem('lb_attendances');
    return saved ? JSON.parse(saved) : [];
  });

  const [cashBooks, setCashBooks] = useState<CashBookItem[]>(() => {
    const saved = localStorage.getItem('lb_cashbooks');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Main Cash Book' }];
  });

  const [activeCashBookId, setActiveCashBookId] = useState<string>('default');

  const [cashEntries, setCashEntries] = useState<CashEntry[]>(() => {
    const saved = localStorage.getItem('lb_cashentries');
    const parsed = saved ? JSON.parse(saved) : [];
    // Ensure existing entries belong to 'default' if no ID is set
    return parsed.map((e: any) => ({ ...e, cashBookId: e.cashBookId || 'default' }));
  });

  useEffect(() => {
    localStorage.setItem('lb_workers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('lb_attendances', JSON.stringify(attendances));
  }, [attendances]);

  useEffect(() => {
    localStorage.setItem('lb_cashentries', JSON.stringify(cashEntries));
  }, [cashEntries]);

  useEffect(() => {
    localStorage.setItem('lb_cashbooks', JSON.stringify(cashBooks));
  }, [cashBooks]);

  // 50-Year Perpetual Cloud & Multi-Vault Auto Sync
  useEffect(() => {
    const timer = setTimeout(async () => {
      const syncId = localStorage.getItem('sync_userId') || userProfile?.email || (userProfile?.phone ? userProfile.phone.replace(/\D/g, '') : '');
      if (!syncId) return;
      try {
        const allData: Record<string, any> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key !== 'sync_userId') {
            allData[key] = localStorage.getItem(key);
          }
        }
        await fetch('/api/sync/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: syncId, data: allData })
        });
        
        // Also save snapshot in local persistent vault
        localStorage.setItem('lb_50yr_vault_backup', JSON.stringify({
          updatedAt: new Date().toISOString(),
          data: allData
        }));
      } catch (e) {
        // silent offline resilience
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [workers, attendances, cashEntries, cashBooks, userProfile]);

  const addCashBook = (name: string) => {
    const newId = Date.now().toString();
    setCashBooks([...cashBooks, { id: newId, name }]);
    setActiveCashBookId(newId);
  };

  const renameCashBook = (id: string, name: string) => {
    setCashBooks(cashBooks.map(b => b.id === id ? { ...b, name } : b));
  };

  const deleteCashBook = (id: string) => {
    if (cashBooks.length <= 1) return; // Prevent deleting the last book
    const remainingBooks = cashBooks.filter(b => b.id !== id);
    setCashBooks(remainingBooks);
    // Delete all cash entries for this book as well
    setCashEntries(cashEntries.filter(e => e.cashBookId !== id));
    // If active book was deleted, set another active book
    if (activeCashBookId === id) {
      setActiveCashBookId(remainingBooks[0].id);
    }
  };


  const addCashEntry = (entry: Omit<CashEntry, 'id'>) => {
    setCashEntries([...cashEntries, { ...entry, id: Date.now().toString() }]);
  };

  const deleteCashEntry = (id: string) => {
    setCashEntries(cashEntries.filter(c => c.id !== id));
  };

  const updateCashEntry = (id: string, data: Partial<CashEntry>) => {
    setCashEntries(cashEntries.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const getCashStats = (cashBookId?: string) => {
    let totalIn = 0;
    let totalOut = 0;
    const targetBookId = cashBookId || activeCashBookId;
    
    cashEntries.filter(c => c.cashBookId === targetBookId).forEach(c => {
      if (c.type === 'IN') totalIn += Number(c.amount) || 0;
      else totalOut += Number(c.amount) || 0;
    });
    return { totalIn, totalOut, balance: totalIn - totalOut };
  };

  const addWorker = (worker: Omit<Worker, 'id'>) => {
    const newWorker = { 
      ...worker, 
      id: Date.now().toString(),
      workerType: worker.workerType || 'LABOUR',
      rateType: worker.rateType || 'DAILY',
      dailyRate: Number(worker.dailyRate) || 0
    };
    setWorkers(prev => [...prev, newWorker]);
  };

  const updateWorker = (id: string, data: Partial<Worker>) => {
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...data, ...(data.dailyRate !== undefined ? { dailyRate: Number(data.dailyRate) || 0 } : {}) } : w));
  };

  const deleteWorker = (id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
    setAttendances(prev => prev.filter(a => a.workerId !== id));
  };

  const updateAttendance = (workerId: string, date: string, data: Partial<Attendance>) => {
    setAttendances(prev => {
      const existingIdx = prev.findIndex(a => a.workerId === workerId && a.date === date);
      if (existingIdx >= 0) {
        const newAtt = [...prev];
        newAtt[existingIdx] = { ...newAtt[existingIdx], ...data };
        return newAtt;
      }
      return [...prev, { workerId, date, status: '', advance: 0, ...data }];
    });
  };

  const getWorkerAttendance = (workerId: string, month: number, year: number) => {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return attendances.filter(a => a.workerId === workerId && a.date.startsWith(prefix));
  };

  const getMultiplier = (status: AttendanceStatus) => {
    switch (status) {
      case 'P': return 1;
      case 'P+1/2':
      case 'P.1/2': return 1.5;
      case 'PP': return 2;
      case 'PPP': return 3;
      case 'OT': return 1;
      case 'A': return 0;
      default: return 0;
    }
  };

  const getWorkerStats = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return { earned: 0, advance: 0, balance: 0, presentDays: 0 };
    
    let earned = 0;
    let advance = 0;
    let presentDays = 0;

    attendances.filter(a => a.workerId === workerId).forEach(a => {
      advance += (Number(a.advance) || 0);
      if (getMultiplier(a.status) > 0) presentDays += getMultiplier(a.status);
    });

    const rate = Number(worker.dailyRate) || 0;
    const type = worker.rateType || 'DAILY';

    if (type === 'DAILY') {
      earned = presentDays * rate;
    } else if (type === 'WEEKLY') {
      // 6 working days in a week is standard
      earned = (presentDays / 6) * rate;
    } else if (type === 'MONTHLY') {
      // 30 days is standard calendar-based monthly wage
      earned = (presentDays / 30) * rate;
    } else if (type === 'ROUND') {
      // Round/Fixed is a contract amount. Earned is the fixed rate itself
      earned = rate;
    }

    // Round to nearest integer or 2 decimal places
    earned = Math.round(earned * 100) / 100;

    return { earned, advance, balance: earned - advance, presentDays };
  };

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    let present = 0;
    let absent = 0;
    let totalPayable = 0;

    workers.forEach(w => {
      const att = attendances.find(a => a.workerId === w.id && a.date === today);
      if (att) {
        if (getMultiplier(att.status) > 0) {
          present += 1;
        } else if (att.status === 'A') {
          absent += 1;
        }
      }
      
      const stats = getWorkerStats(w.id);
      totalPayable += Math.max(0, stats.balance);
    });

    return { totalWorkers: workers.length, present, absent, totalPayable };
  };

  const getAllWorkerStats = () => {
    return workers.map(w => ({
      ...w,
      ...getWorkerStats(w.id)
    }));
  };

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('lb_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('lb_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = (t: 'light' | 'dark') => setThemeState(t);
  const toggleTheme = () => setThemeState(prev => prev === 'light' ? 'dark' : 'light');

  const [attendanceThemeColor, setAttendanceThemeColorState] = useState<AttendanceThemeColor>(() => {
    const saved = localStorage.getItem('lb_attendance_theme_color');
    if (saved === 'PINK' || saved === 'BLUE' || saved === 'RED') return saved;
    return 'GREEN';
  });

  const setAttendanceThemeColor = (color: AttendanceThemeColor) => {
    setAttendanceThemeColorState(color);
    localStorage.setItem('lb_attendance_theme_color', color);
  };

  // Wallet State & Functions
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem('lb_wallet_balance');
    return saved ? Number(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('lb_wallet_balance', walletBalance.toString());
  }, [walletBalance]);

  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem('lb_wallet_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('lb_wallet_transactions', JSON.stringify(walletTransactions));
  }, [walletTransactions]);

  const addWalletBalance = (amount: number, utr?: string, description?: string): WalletTransaction => {
    const tx: WalletTransaction = {
      id: `wtx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'CREDIT',
      amount: amount,
      description: description || `₹${amount} Wallet Recharge (UPI QR)`,
      date: new Date().toISOString(),
      utr: utr || `UTR_${Date.now()}`,
      status: 'SUCCESS'
    };
    setWalletBalance(prev => prev + amount);
    setWalletTransactions(prev => [tx, ...prev]);
    playPaymentSuccessSound();
    return tx;
  };

  const payWithWallet = (planId: string, planName: string, amount: number, workersLimit?: number): { success: boolean; reason?: string } => {
    if (walletBalance < amount) {
      return {
        success: false,
        reason: `अपर्याप्त वॉलेट बैलेंस! आपके वॉलेट में ₹${walletBalance} हैं, जबकि प्लान का मूल्य ₹${amount} है। कृपया पहले वॉलेट में रुपये जोड़ें।`
      };
    }

    setWalletBalance(prev => prev - amount);
    const tx: WalletTransaction = {
      id: `wtx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'DEBIT',
      amount: amount,
      description: `Subscription Upgrade: ${planName}`,
      date: new Date().toISOString(),
      status: 'SUCCESS'
    };
    setWalletTransactions(prev => [tx, ...prev]);

    // Activate subscription instantly
    const now = new Date();
    const days = planId === 'plan_2999_year' || planId === 'premium_yearly' ? 365 : 30;
    const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    setSubscriptionInfo({
      isSubscribed: true,
      planId: planId,
      planName: planName,
      amount: amount,
      workersLimit: workersLimit,
      paymentId: tx.id,
      paymentMethod: 'Contractor Wallet',
      subscribedAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      isApproved: true,
      status: 'APPROVED'
    });

    playPaymentSuccessSound();
    return { success: true };
  };

  // Subscription state
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(() => {
    const saved = localStorage.getItem('lb_subscription_info');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (subscriptionInfo) {
      localStorage.setItem('lb_subscription_info', JSON.stringify(subscriptionInfo));
    } else {
      localStorage.removeItem('lb_subscription_info');
    }
  }, [subscriptionInfo]);

  // Payment Requests (for Admin verification)
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(() => {
    const saved = localStorage.getItem('lb_payment_requests');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('lb_payment_requests', JSON.stringify(paymentRequests));
  }, [paymentRequests]);

  // Persistent Used UTR Audit Records (Anti-Replay / Anti-Fraud Engine)
  const [usedUtrRecords, setUsedUtrRecords] = useState<UsedUtrRecord[]>(() => {
    const saved = localStorage.getItem('lb_used_utr_records_v2');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('lb_used_utr_records_v2', JSON.stringify(usedUtrRecords));
  }, [usedUtrRecords]);

  // Check if a UTR was already used anywhere
  const isUtrUsed = (utr: string): { isUsed: boolean; existingRecord?: { utr: string; amount: number; createdAt: string } } => {
    if (!utr) return { isUsed: false };
    const clean = utr.trim().toLowerCase();
    if (!clean) return { isUsed: false };

    // 1. Check usedUtrRecords
    const foundInRecords = usedUtrRecords.find(r => r.utr.trim().toLowerCase() === clean);
    if (foundInRecords) {
      return { isUsed: true, existingRecord: foundInRecords };
    }

    // 2. Check paymentRequests
    const foundInRequests = paymentRequests.find(p => p.utrNumber && p.utrNumber.trim().toLowerCase() === clean);
    if (foundInRequests) {
      return { isUsed: true, existingRecord: { utr: foundInRequests.utrNumber, amount: foundInRequests.amount, createdAt: foundInRequests.submittedAt } };
    }

    // 3. Check walletTransactions
    const foundInWallet = walletTransactions.find(w => w.utr && w.utr.trim().toLowerCase() === clean);
    if (foundInWallet) {
      return { isUsed: true, existingRecord: { utr: foundInWallet.utr!, amount: foundInWallet.amount, createdAt: foundInWallet.date } };
    }

    return { isUsed: false };
  };

  // Verify UTR format & check uniqueness before accepting payment
  const verifyAndRecordUtr = (
    utrInput: string,
    expectedAmount: number,
    type: 'PLAN' | 'WALLET',
    description?: string
  ): { success: boolean; reason?: string; finalUtr: string } => {
    const trimmed = utrInput ? utrInput.trim() : '';

    if (trimmed) {
      // Minimum length check for manual UTRs
      if (trimmed.length < 5) {
        return {
          success: false,
          reason: '🛑 अमान्य UTR नंबर! यूटीआर या ट्रांजैक्शन आईडी कम से कम 5 से 12 अंकों का होना आवश्यक है।',
          finalUtr: ''
        };
      }

      // Check if UTR was already used
      const check = isUtrUsed(trimmed);
      if (check.isUsed) {
        const rec = check.existingRecord;
        return {
          success: false,
          reason: `🛑 यह UTR / Transaction ID (${trimmed}) पहले ही उपयोग किया जा चुका है! (पिछला उपयोग: ₹${rec?.amount || 'अज्ञात'} का भुगतान). आप एक ही UTR नंबर को दोबारा इस्तेमाल नहीं कर सकते। कृपया नया भुगतान करके नया UTR दर्ज करें।`,
          finalUtr: ''
        };
      }
    }

    // Generate guaranteed unique UTR if empty or use valid trimmed UTR
    const finalUtr = trimmed || `UPI_${type}_${expectedAmount}_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Verify auto-generated UTR isn't colliding
    const autoCheck = isUtrUsed(finalUtr);
    if (autoCheck.isUsed) {
      return {
        success: false,
        reason: '🛑 UTR सत्यापन प्रणाली त्रुटि! कृपया पुनः प्रयास करें।',
        finalUtr: ''
      };
    }

    // Record UTR immediately
    const newRecord: UsedUtrRecord = {
      utr: finalUtr,
      amount: expectedAmount,
      type,
      description: description || `${type} Payment (₹${expectedAmount})`,
      createdAt: new Date().toISOString()
    };

    setUsedUtrRecords(prev => [newRecord, ...prev]);

    return {
      success: true,
      finalUtr
    };
  };

  // Real-time Automatic Subscription & Admin Offer Sync
  useEffect(() => {
    const checkServerSubscription = async () => {
      const phone = userProfile?.phone || '';
      const email = userProfile?.email || '';
      const syncId = localStorage.getItem('sync_userId') || '';
      const uid = userProfile?.uid || '';
      const userId = syncId || uid || (userProfile?.name ? `user_${userProfile.name.toLowerCase().replace(/\s+/g, '_')}` : '');

      if (!phone && !email && !syncId && !uid) return;

      try {
        const res = await fetch('/api/user/check-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, email, userId, uid, sync_userId: syncId })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.hasGrant && data.subscriptionInfo) {
            const serverSub = data.subscriptionInfo;
            setSubscriptionInfo(prev => {
              const prevIsActive = Boolean(prev && prev.isSubscribed && prev.isApproved);
              const prevExpiry = prev?.expiresAt ? new Date(prev.expiresAt).getTime() : 0;
              const serverExpiry = serverSub.expiresAt ? new Date(serverSub.expiresAt).getTime() : 0;
              const prevLimit = prev?.workersLimit || 0;
              const serverLimit = serverSub.workersLimit || 0;

              // If not previously active, or server has newer expiry/higher workers limit or plan update
              if (!prevIsActive || serverExpiry > prevExpiry || serverLimit > prevLimit || prev?.status !== 'APPROVED') {
                localStorage.setItem('lb_subscription_info', JSON.stringify(serverSub));
                return serverSub;
              }
              return prev;
            });
          }
        }
      } catch (e) {
        // Silently continue in offline mode
      }
    };

    checkServerSubscription();
    const interval = setInterval(checkServerSubscription, 6000);
    const handleFocus = () => checkServerSubscription();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [userProfile]);

  // Auto-sync user data to server database whenever state changes
  useEffect(() => {
    const rawId = userProfile?.phone || userProfile?.email || userProfile?.uid || localStorage.getItem('sync_userId') || (userProfile?.name ? `user_${userProfile.name.toLowerCase().replace(/\s+/g, '_')}` : '');
    if (!rawId || rawId.length < 3) return;

    let cleanSyncId = rawId.trim().toLowerCase();
    if (/^[\d\s+\-()]+$/.test(cleanSyncId)) {
      const digits = cleanSyncId.replace(/\D/g, '');
      if (digits.length >= 10) cleanSyncId = digits.slice(-10);
      else cleanSyncId = digits;
    }

    const timer = setTimeout(() => {
      const dataToSync: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key !== 'sync_userId') {
          dataToSync[key] = localStorage.getItem(key) || '';
        }
      }
      fetch('/api/sync/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: cleanSyncId, data: dataToSync })
      }).catch(() => {});
    }, 1000);

    return () => clearTimeout(timer);
  }, [userProfile, workers, attendances, cashEntries, subscriptionInfo, paymentRequests]);

  const addPaymentRequest = (req: Omit<PaymentRequest, 'id' | 'submittedAt' | 'status'>, initialStatus: 'APPROVED' | 'PENDING' = 'PENDING'): PaymentRequest => {
    const newReq: PaymentRequest = {
      ...req,
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      submittedAt: new Date().toISOString(),
      status: initialStatus
    };
    setPaymentRequests(prev => [newReq, ...prev]);

    // Send to global server database so admin on any device sees it
    fetch('/api/payment-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReq)
    }).then(() => broadcastSync('PAYMENT_REQUEST_NEW')).catch(() => {});

    // Set local subscription info with appropriate approval status
    const now = new Date();
    const days = req.planId === 'premium_yearly' || req.planId === 'plan_2999_year' ? 365 : 30;
    const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    setSubscriptionInfo({
      isSubscribed: true,
      planId: req.planId,
      planName: req.planName,
      amount: req.amount,
      paymentId: req.utrNumber,
      paymentMethod: req.paymentMethod,
      subscribedAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      isApproved: initialStatus === 'APPROVED',
      status: initialStatus
    });

    if (initialStatus === 'APPROVED') {
      playPaymentSuccessSound();
    }

    return newReq;
  };

  const approvePaymentRequest = (id: string) => {
    setPaymentRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
    
    // Call server to approve globally and activate subscription for the user
    fetch(`/api/admin/payment-requests/${id}/approve`, { method: 'POST' })
      .then(() => {
        broadcastSync('PAYMENT_REQUEST_APPROVED');
        syncSettingsFromServer();
      })
      .catch(() => {});

    const target = paymentRequests.find(r => r.id === id);
    if (target) {
      const now = new Date();
      const days = target.planId === 'premium_yearly' ? 365 : 30;
      const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      setSubscriptionInfo({
        isSubscribed: true,
        planId: target.planId,
        planName: target.planName,
        amount: target.amount,
        paymentId: target.utrNumber,
        paymentMethod: target.paymentMethod,
        subscribedAt: now.toISOString(),
        expiresAt: expiry.toISOString(),
        isApproved: true,
        status: 'APPROVED'
      });
      playPaymentSuccessSound();
    }
  };

  const rejectPaymentRequest = (id: string) => {
    setPaymentRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
    
    fetch(`/api/admin/payment-requests/${id}/reject`, { method: 'POST' })
      .then(() => {
        broadcastSync('PAYMENT_REQUEST_REJECTED');
        syncSettingsFromServer();
      })
      .catch(() => {});

    const target = paymentRequests.find(r => r.id === id);
    if (subscriptionInfo && subscriptionInfo.paymentId === target?.utrNumber) {
      setSubscriptionInfo({
        ...subscriptionInfo,
        isSubscribed: false,
        isApproved: false,
        status: 'REJECTED'
      });
    }
  };

  const isSubscribed = Boolean(subscriptionInfo && subscriptionInfo.isSubscribed && subscriptionInfo.isApproved);

  // Usage stats
  const [usageStats, setUsageStats] = useState<UsageStats>(() => {
    const saved = localStorage.getItem('lb_usage_stats');
    return saved ? JSON.parse(saved) : { featureUses: {}, totalUses: 0 };
  });

  useEffect(() => {
    localStorage.setItem('lb_usage_stats', JSON.stringify(usageStats));
  }, [usageStats]);

  const checkAndIncrementUsage = (featureName: string) => {
    const freeLimit = paymentSettings.freeUsageLimit || 3;
    
    // If subscribed, unlimited usage
    if (isSubscribed) {
      return { allowed: true, remaining: 99999, count: usageStats.totalUses };
    }

    const currentTotal = usageStats.totalUses || 0;
    if (currentTotal >= freeLimit) {
      return { allowed: false, remaining: 0, count: currentTotal };
    }

    const featureCount = (usageStats.featureUses[featureName] || 0) + 1;
    const newTotal = currentTotal + 1;

    const newStats: UsageStats = {
      featureUses: {
        ...usageStats.featureUses,
        [featureName]: featureCount
      },
      totalUses: newTotal
    };

    setUsageStats(newStats);
    return {
      allowed: true,
      remaining: freeLimit - newTotal,
      count: newTotal
    };
  };

  const activateSubscription = (details: Partial<SubscriptionInfo>): SubscriptionInfo => {
    const now = new Date();
    const plan = details.planId || 'premium_monthly';
    const days = plan === 'premium_yearly' ? 365 : 30;
    const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const newSub: SubscriptionInfo = {
      isSubscribed: true,
      planId: plan,
      planName: details.planName || (plan === 'premium_yearly' ? 'Annual Pro' : 'Premium Monthly'),
      amount: details.amount || (plan === 'premium_yearly' ? 2499 : 499),
      paymentId: details.paymentId || `pay_manual_${Date.now()}`,
      paymentMethod: details.paymentMethod || 'UPI QR',
      subscribedAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      isApproved: true,
      status: 'APPROVED',
      ...details
    };
    setSubscriptionInfo(newSub);
    playPaymentSuccessSound();
    return newSub;
  };

  const cancelSubscription = () => {
    setSubscriptionInfo(null);
  };

  const resetUsageStats = () => {
    setUsageStats({ featureUses: {}, totalUses: 0 });
  };

  // Broadcast Notifications State & Handlers
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>([]);
  const [readBroadcastIds, setReadBroadcastIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("lb_read_broadcasts") || "[]");
    } catch (e) {
      return [];
    }
  });
  const [dismissedBroadcastIds, setDismissedBroadcastIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("lb_dismissed_broadcasts") || "[]");
    } catch (e) {
      return [];
    }
  });

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch("/api/broadcasts");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.broadcasts) && data.broadcasts.length > 0) {
          setBroadcasts(data.broadcasts);
          return;
        }
      }
      // Default fallback notification if database returns empty
      setBroadcasts([{
        id: "default_bc_1",
        title: "onediary.in नया अपडेट",
        message: "100% क्लाउड डाटा सुरक्षा व लाइफटाइम सेव गारंटी! ऐप में डिजिटल कैशबुक व हाजिरी डायरी सुविधा चालू है।",
        type: "ANNOUNCEMENT",
        created_at: new Date().toISOString(),
        is_active: 1
      }]);
    } catch (e) {
      console.warn("Failed to fetch broadcasts", e);
      setBroadcasts([{
        id: "default_bc_1",
        title: "onediary.in नया अपडेट",
        message: "100% क्लाउड डाटा सुरक्षा व लाइफटाइम सेव गारंटी! ऐप में डिजिटल कैशबुक व हाजिरी डायरी सुविधा चालू है।",
        type: "ANNOUNCEMENT",
        created_at: new Date().toISOString(),
        is_active: 1
      }]);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
    const interval = setInterval(fetchBroadcasts, 5000); // Fast 5-second poll for live admin notification sync
    return () => clearInterval(interval);
  }, []);

  const sendBroadcastNotification = async (data: { title: string; message: string; type?: string; actionUrl?: string }) => {
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        await fetchBroadcasts();
        return result;
      }
      throw new Error(result.error || "Failed to send broadcast");
    } catch (e: any) {
      console.error("sendBroadcastNotification error:", e);
      throw e;
    }
  };

  const deleteBroadcastNotification = async (id: string): Promise<boolean> => {
    try {
      // Optimistically clear from active state so UI responds instantly
      if (id === "all") {
        setBroadcasts([]);
        const allIds = broadcasts.map(b => b.id);
        const updated = Array.from(new Set([...dismissedBroadcastIds, ...allIds]));
        setDismissedBroadcastIds(updated);
        localStorage.setItem("lb_dismissed_broadcasts", JSON.stringify(updated));
      } else {
        setBroadcasts(prev => prev.filter(b => b.id !== id));
        if (!dismissedBroadcastIds.includes(id)) {
          const updated = [...dismissedBroadcastIds, id];
          setDismissedBroadcastIds(updated);
          localStorage.setItem("lb_dismissed_broadcasts", JSON.stringify(updated));
        }
      }

      const res = await fetch(`/api/admin/broadcast/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        return true;
      }
      return true;
    } catch (e) {
      console.error("deleteBroadcastNotification error:", e);
      return true;
    }
  };

  const markBroadcastAsRead = (id: string) => {
    if (!readBroadcastIds.includes(id)) {
      const updated = [...readBroadcastIds, id];
      setReadBroadcastIds(updated);
      localStorage.setItem("lb_read_broadcasts", JSON.stringify(updated));
    }
  };

  const markAllBroadcastsAsRead = () => {
    const allIds = broadcasts.map(b => b.id);
    setReadBroadcastIds(allIds);
    localStorage.setItem("lb_read_broadcasts", JSON.stringify(allIds));
  };

  const dismissBroadcast = (id: string) => {
    if (!dismissedBroadcastIds.includes(id)) {
      const updated = [...dismissedBroadcastIds, id];
      setDismissedBroadcastIds(updated);
      localStorage.setItem("lb_dismissed_broadcasts", JSON.stringify(updated));
    }
  };

  const dismissAllBroadcasts = () => {
    const allIds = broadcasts.map(b => b.id);
    setDismissedBroadcastIds(allIds);
    localStorage.setItem("lb_dismissed_broadcasts", JSON.stringify(allIds));
  };

  return (
    <AppContext.Provider value={{
      userProfile, setUserProfile,
      workers, addWorker, updateWorker, deleteWorker,
      attendances, updateAttendance, getWorkerAttendance,
      cashBooks, activeCashBookId, setActiveCashBookId, addCashBook, renameCashBook, deleteCashBook,
      cashEntries, addCashEntry, updateCashEntry, deleteCashEntry, getCashStats,
      getWorkerStats, getTodayStats, getAllWorkerStats,
      currency, setCurrency, formatCurrency,
      subscriptionPlans, updateSubscriptionPlan, addSubscriptionPlan, deleteSubscriptionPlan, paymentSettings, setPaymentSettings,
      saveGlobalSettings, broadcastAllSettingsGlobally, refreshGlobalSettings: syncSettingsFromServer, isSyncingGlobalSettings, globalSettingsLastSynced,
      theme, setTheme, toggleTheme, attendanceThemeColor, setAttendanceThemeColor,
      walletBalance, walletTransactions, addWalletBalance, payWithWallet,
      subscriptionInfo, isSubscribed, usageStats, checkAndIncrementUsage, activateSubscription, cancelSubscription, resetUsageStats,
      paymentRequests, addPaymentRequest, approvePaymentRequest, rejectPaymentRequest,
      usedUtrRecords, isUtrUsed, verifyAndRecordUtr,
      broadcasts, fetchBroadcasts, sendBroadcastNotification, deleteBroadcastNotification, readBroadcastIds, markBroadcastAsRead, markAllBroadcastsAsRead,
      dismissedBroadcastIds, dismissBroadcast, dismissAllBroadcasts,
      cart, addToCart, removeFromCart, clearCart
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
