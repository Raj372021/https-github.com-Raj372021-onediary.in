import React from 'react';
import { Mail, Check, X, Shield, Plus, Sparkles, User } from 'lucide-react';

interface GoogleAccount {
  name: string;
  email: string;
  photoURL?: string;
  isPrimary?: boolean;
}

interface GoogleAccountPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: { email: string; name: string; photoURL?: string }) => void;
  onCustomEmailSubmit: (email: string) => void;
  userEmail?: string;
}

export default function GoogleAccountPickerModal({
  isOpen,
  onClose,
  onSelectAccount,
  onCustomEmailSubmit,
  userEmail = ''
}: GoogleAccountPickerModalProps) {
  const [showCustomInput, setShowCustomInput] = React.useState(false);
  const [customEmail, setCustomEmail] = React.useState('');
  const [customName, setCustomName] = React.useState('');

  if (!isOpen) return null;

  const defaultAccounts: GoogleAccount[] = userEmail ? [
    {
      name: userEmail.split('@')[0],
      email: userEmail,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${userEmail}`,
      isPrimary: true
    }
  ] : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white p-1 shadow flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Choose a Google Account
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                to continue to onediary.in
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Select an account to sign in or sign up instantly:
          </p>

          {defaultAccounts.map((acc, idx) => (
            <div
              key={idx}
              onClick={() => onSelectAccount(acc)}
              className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 cursor-pointer transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={acc.photoURL}
                  alt={acc.name}
                  className="w-10 h-10 rounded-full border border-amber-400/50 shadow-sm"
                />
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                    <span>{acc.name}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full">
                      Active
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {acc.email}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow font-black text-xs shrink-0 group-hover:scale-105 transition">
                <Check size={16} />
              </div>
            </div>
          ))}

          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="w-full py-3 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus size={16} />
              <span>Use another Google Account</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  placeholder="user@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (customEmail.includes('@')) {
                    onSelectAccount({
                      email: customEmail,
                      name: customName || customEmail.split('@')[0],
                      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${customEmail}`
                    });
                  }
                }}
                disabled={!customEmail || !customEmail.includes('@')}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black py-2.5 rounded-xl text-xs transition shadow active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Sign In with this Google Account
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
            <Shield size={12} className="text-emerald-500" />
            <span>Google OAuth 2.0 Secure Authentication</span>
          </p>
        </div>
      </div>
    </div>
  );
}
