import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, FileText, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LegalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isPrivacy = location.pathname.includes('privacy');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-6"
        >
          <ArrowLeft size={18} /> Back / वापस जाएँ
        </button>

        {isPrivacy ? (
          <div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy / गोपनीयता नीति</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Last updated: October 2026 | OneDiary & Labour Book</p>
              </div>
            </div>

            <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <section className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <h2 className="font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <Lock size={16} /> 1. Data Security & Storage (डेटा सुरक्षा)
                </h2>
                <p>
                  OneDiary values your privacy and is dedicated to protecting all business, attendance, wage records, and personal customer data. All user data is encrypted at rest and in transit.
                </p>
              </section>

              <section>
                <h2 className="font-bold text-base text-slate-900 dark:text-white mb-2">2. Information We Collect</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Account Info:</strong> Name, phone number, email address for authentication and profile management.</li>
                  <li><strong>Workforce & Business Data:</strong> Worker attendance, wage rates, advance payments, hisab-kitab, cashbook entries, and diary notes.</li>
                  <li><strong>Device Permissions:</strong> Storage/Download permission for saving PDF salary sheets, reports, and backup data.</li>
                </ul>
              </section>

              <section>
                <h2 className="font-bold text-base text-slate-900 dark:text-white mb-2">3. How We Use Information</h2>
                <p>
                  Your information is strictly used to provide attendance tracking, wage computation, report generation, and multi-device cloud synchronization. We DO NOT sell or share your records with third-party advertisers.
                </p>
              </section>

              <section>
                <h2 className="font-bold text-base text-slate-900 dark:text-white mb-2">4. User Data Control & Deletion</h2>
                <p>
                  Users can export or delete their data at any time directly through the app settings or by contacting our support team at <a href="mailto:rajsahani.RgcS@gmail.com" className="text-primary underline">rajsahani.RgcS@gmail.com</a>.
                </p>
              </section>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                <FileText size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Terms of Service / सेवा की शर्तें</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Last updated: October 2026 | OneDiary & Labour Book</p>
              </div>
            </div>

            <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <section>
                <h2 className="font-bold text-base text-slate-900 dark:text-white mb-2">1. Acceptance of Terms</h2>
                <p>
                  By accessing or using OneDiary, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may discontinue use of the service.
                </p>
              </section>

              <section>
                <h2 className="font-bold text-base text-slate-900 dark:text-white mb-2">2. Accuracy of Financial & Wage Records</h2>
                <p>
                  OneDiary provides calculation and automated ledger tools for contractor convenience. Contractors and business owners are responsible for verifying their daily attendance, advance amounts, and wage payouts before releasing final payments.
                </p>
              </section>

              <section>
                <h2 className="font-bold text-base text-slate-900 dark:text-white mb-2">3. Subscription & Wallet Credits</h2>
                <p>
                  Subscription upgrades and wallet balances enable unlimited cloud storage and enhanced feature sets. Subscriptions are billed per chosen interval and can be managed directly in the app.
                </p>
              </section>

              <section className="bg-emerald-50/50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-3">
                <CheckCircle className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={20} />
                <p className="text-emerald-900 dark:text-emerald-200 text-xs">
                  We are dedicated to providing continuous uptime, reliable cloud sync, and offline-first availability for contractors across India.
                </p>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
