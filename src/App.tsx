/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import Dashboard from "./pages/Dashboard";
import More from "./pages/More";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import Payment from "./pages/Payment";
import Workers from "./pages/Workers";
import WorkerDetail from "./pages/WorkerDetail";
import Reports from "./pages/Reports";
import BulkAttendance from "./pages/BulkAttendance";
import CashBook from "./pages/CashBook";
import Hisab from "./pages/Hisab";
import AdminPanel from "./pages/AdminPanel";
import Diary from "./pages/Diary";
import Onboarding from "./pages/Onboarding";
import CloudSync from "./pages/CloudSync";
import ChatbotPage from "./pages/ChatbotPage";
import CalculatorPage from "./pages/CalculatorPage";
import QuotationPage from "./pages/QuotationPage";
import LegalPage from "./pages/LegalPage";
import { AppProvider, useAppContext } from "./context/AppContext";
import DraggableWidgets from "./components/DraggableWidgets";
import OfflineStatusBanner from "./components/OfflineStatusBanner";
import BroadcastNotificationModal from "./components/BroadcastNotificationModal";
import { LanguageProvider } from "./context/LanguageContext";
import AppLockGate from "./components/AppLockGate";

function Layout() {
  const { userProfile } = useAppContext();
  const location = useLocation();
  
  const isLegalPage = location.pathname === '/privacy' || location.pathname === '/terms';

  // Hide bottom nav on payment screen, detail screens, chatbot, and subscriptions
  const hideBottomNav = isLegalPage ||
                        location.pathname === '/payment' || 
                        location.pathname.includes('/worker/') || 
                        location.pathname === '/bulk-attendance' || 
                        location.pathname === '/sync' ||
                        location.pathname === '/chat' ||
                        location.pathname === '/subscriptions';
  
  if (isLegalPage) {
    return <LegalPage />;
  }

  if (!userProfile) return <Onboarding />;

  return (
    <div className="font-sans antialiased text-slate-900 dark:text-slate-100 bg-app-pattern min-h-screen transition-colors duration-200">
      <BroadcastNotificationModal />
      <OfflineStatusBanner />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Onboarding />} />
        <Route path="/workers" element={<Workers />} />
        <Route path="/worker/:id" element={<WorkerDetail />} />
        <Route path="/bulk-attendance" element={<BulkAttendance />} />
        <Route path="/cashbook" element={<CashBook />} />
        <Route path="/hisab" element={<Hisab />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/more" element={<More />} />
        <Route path="/subscriptions" element={<SubscriptionPlans />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/sync" element={<CloudSync />} />
        <Route path="/chat" element={<ChatbotPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/quotation" element={<QuotationPage />} />
      </Routes>
      {!hideBottomNav && <BottomNav />}
      <DraggableWidgets />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <Router>
          <AppLockGate>
            <Layout />
          </AppLockGate>
        </Router>
      </AppProvider>
    </LanguageProvider>
  );
}
