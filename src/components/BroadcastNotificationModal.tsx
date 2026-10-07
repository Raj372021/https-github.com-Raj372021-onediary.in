import React, { useState } from 'react';
import { X, Check, Megaphone, Sparkles, AlertTriangle, Gift, ExternalLink, Info, Radio, ChevronRight, Trash2, EyeOff } from 'lucide-react';
import { useAppContext, BroadcastNotification } from '../context/AppContext';

export default function BroadcastNotificationModal() {
  const { 
    broadcasts, readBroadcastIds, markBroadcastAsRead, markAllBroadcastsAsRead,
    dismissedBroadcastIds, dismissBroadcast, dismissAllBroadcasts, paymentSettings
  } = useAppContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastNotification | null>(null);
  const [isBannerHidden, setIsBannerHidden] = useState(false);
  const [isFloatingHidden, setIsFloatingHidden] = useState(false);

  const isEnabled = paymentSettings?.isNotificationEnabled !== false;

  // Filter out dismissed notifications (and check if notifications enabled globally)
  const visibleBroadcasts = isEnabled ? broadcasts.filter(b => !dismissedBroadcastIds.includes(b.id)) : [];
  const unreadBroadcasts = visibleBroadcasts.filter(b => !readBroadcastIds.includes(b.id));
  const unreadCount = unreadBroadcasts.length;

  // Icons and styles helper
  const getIconForType = (type?: string) => {
    switch (type) {
      case 'OFFER':
        return <Gift className="w-4 h-4 text-amber-400" />;
      case 'ALERT':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'UPDATE':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      default:
        return <Megaphone className="w-4 h-4 text-blue-400" />;
    }
  };

  const getBadgeStyle = (type?: string) => {
    switch (type) {
      case 'OFFER':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'ALERT':
        return 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
      case 'UPDATE':
        return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      default:
        return 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'OFFER': return '🎁 ऑफर / डिस्काउंट';
      case 'ALERT': return '⚠️ महत्वपूर्ण अलर्ट';
      case 'UPDATE': return '⚡ नया अपडेट';
      default: return '📢 घोषणा / सूचना';
    }
  };

  const activeBroadcasts = visibleBroadcasts.length > 0 ? visibleBroadcasts : [];

  return (
    <>
      {/* 🚀 TOP CONTINUOUS SLIDING TICKER / NOTIFICATION SLIDER BANNER */}
      {activeBroadcasts.length > 0 && !isBannerHidden && (
        <div className="w-full bg-slate-950 border-b border-blue-900/50 text-white text-[10px] py-1 px-2.5 flex items-center justify-between gap-1.5 overflow-hidden select-none relative z-20">
          {/* Left Live Badge */}
          <div 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1 shrink-0 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-1.5 py-0.5 rounded-full font-black cursor-pointer hover:scale-105 transition text-[9px]"
          >
            <Radio className="w-3 h-3 animate-pulse text-slate-950" />
            <span className="uppercase tracking-wider font-extrabold">नोटिस</span>
            {unreadCount > 0 && (
              <span className="bg-rose-600 text-white text-[8px] px-1 rounded-full font-black">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Center Continuous Sliding Text Ticker */}
          <div 
            onClick={() => setIsOpen(true)}
            className="flex-1 overflow-hidden relative cursor-pointer group py-0.5"
            title="क्लिक करके पूरा मैसेज पढ़ें"
          >
            <div className="animate-marquee whitespace-nowrap font-semibold text-blue-100 flex items-center gap-6 group-hover:[animation-play-state:paused] text-[10.5px]">
              {[...activeBroadcasts, ...activeBroadcasts].map((b, idx) => (
                <span key={b.id + '_' + idx} className="inline-flex items-center gap-1.5">
                  <span className="text-amber-300 font-extrabold">📢 [{b.title}]:</span>
                  <span className="text-white font-medium">{b.message}</span>
                  <span className="text-amber-400/80 font-black">✦</span>
                </span>
              ))}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-1.5 py-0.5 rounded text-[9.5px] font-bold transition flex items-center gap-0.5 shadow cursor-pointer active:scale-95"
            >
              <span>पढ़ें</span>
              <ChevronRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => setIsBannerHidden(true)}
              className="p-1 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-rose-600 rounded transition cursor-pointer flex items-center gap-1 text-[10px] font-bold px-1.5"
              title="नोटिफिकेशन बैनर छुपाएं / बंद करें"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating button when ticker is closed but visible broadcasts exist */}
      {activeBroadcasts.length > 0 && isBannerHidden && !isFloatingHidden && (
        <div className="fixed bottom-20 right-3 z-40 flex items-center gap-1">
          <button
            onClick={() => { setIsBannerHidden(false); setIsOpen(true); }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg border border-blue-400/40 flex items-center gap-1.5 cursor-pointer hover:scale-105 transition"
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span>नोटिफिकेशन ({activeBroadcasts.length})</span>
          </button>
          <button
            onClick={() => setIsFloatingHidden(true)}
            className="p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full shadow transition cursor-pointer"
            title="पूरी तरह बंद करें"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Broadcast Notification Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-black">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base leading-tight">📢 लाइव एडमिन सूचना केंद्र</h3>
                  <p className="text-xs text-blue-200">onediary.in Broadcast Network</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllBroadcastsAsRead}
                    className="p-1.5 text-xs bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
                    title="सभी पढ़ा हुआ चिन्हित करें"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">सब पढ़ा</span>
                  </button>
                )}
                {visibleBroadcasts.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm("क्या आप सभी नोटिफिकेशन को अपनी स्क्रीन से हटाना / बंद करना चाहते हैं?")) {
                        dismissAllBroadcasts();
                        setSelectedBroadcast(null);
                      }
                    }}
                    className="p-1.5 text-xs bg-rose-500/80 hover:bg-rose-600 text-white font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
                    title="सभी नोटिफिकेशन हटाएं / बंद करें"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">सब हटाएं</span>
                  </button>
                )}
                <button
                  onClick={() => { setIsOpen(false); setSelectedBroadcast(null); }}
                  className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {selectedBroadcast ? (
                /* Detail View */
                <div className="space-y-4 animate-in slide-in-from-right duration-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedBroadcast(null)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      ← सभी सूचनाएँ देखें
                    </button>
                    <button
                      onClick={() => {
                        dismissBroadcast(selectedBroadcast.id);
                        setSelectedBroadcast(null);
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={14} />
                      <span>यह मैसेज हटाएं (Dismiss)</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-1 text-[11px] font-black rounded-full border ${getBadgeStyle(selectedBroadcast.type)}`}>
                        {getTypeLabel(selectedBroadcast.type)}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {new Date(selectedBroadcast.created_at).toLocaleString('hi-IN', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                      {selectedBroadcast.title}
                    </h4>

                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      {selectedBroadcast.message}
                    </div>

                    {selectedBroadcast.actionUrl && (
                      <a
                        href={selectedBroadcast.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-98 transition"
                      >
                        <span>लिंक खोलें / विशेष जानकारी</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                /* List View */
                visibleBroadcasts.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center mx-auto text-blue-500">
                      <Info className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">कोई नई एडमिन सूचना उपलब्ध नहीं है।</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">जब एडमिन द्वारा नया संदेश या ऑफर भेजा जाएगा, तब ऊपर लाइव स्लाइडर में दिखेगा।</p>
                  </div>
                ) : (
                  visibleBroadcasts.map((item) => {
                    const isRead = readBroadcastIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition relative group ${
                          !isRead 
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-sm' 
                            : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {!isRead && (
                          <span className="absolute top-4 right-10 w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
                        )}

                        <div className="flex items-start gap-3">
                          <div 
                            onClick={() => {
                              setSelectedBroadcast(item);
                              markBroadcastAsRead(item.id);
                            }}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs shrink-0 mt-0.5 cursor-pointer"
                          >
                            {getIconForType(item.type)}
                          </div>

                          <div 
                            onClick={() => {
                              setSelectedBroadcast(item);
                              markBroadcastAsRead(item.id);
                            }}
                            className="min-w-0 flex-1 space-y-1 cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${getBadgeStyle(item.type)}`}>
                                {getTypeLabel(item.type)}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                {new Date(item.created_at).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>

                            <h4 className={`text-sm font-black truncate ${!isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                              {item.title}
                            </h4>

                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-medium">
                              {item.message}
                            </p>
                          </div>

                          {/* Quick Dismiss / Delete Button for User */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissBroadcast(item.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition shrink-0 cursor-pointer"
                            title="इस नोटिफिकेशन को बंद करें / हटाएं"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-center text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between px-4">
              <span>⚡ 100% लाइव ब्रॉडकास्ट नेटवर्क</span>
              {visibleBroadcasts.length > 0 && (
                <button
                  onClick={dismissAllBroadcasts}
                  className="text-slate-500 hover:text-rose-600 text-[11px] underline font-bold cursor-pointer"
                >
                  सभी नोटिफिकेशन बंद करें
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
