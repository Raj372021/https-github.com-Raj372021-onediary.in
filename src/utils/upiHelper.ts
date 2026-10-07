/**
 * Unified UPI App Deep-Linking & Intent Helper
 * Supports direct app opening (PhonePe, GPay, Paytm, BHIM, Amazon Pay, Any UPI)
 * and auto-return notification.
 */

export interface UpiLaunchOptions {
  upiId: string;
  payeeName: string;
  amount: number;
  note?: string;
  appName?: 'phonepe' | 'gpay' | 'paytm' | 'bhim' | 'amazonpay' | 'cred' | 'upi' | string;
}

export const launchUpiPayment = (options: UpiLaunchOptions): { primaryUrl: string; fallbackUrl: string } => {
  const { upiId, payeeName, amount, note = 'Payment', appName = 'upi' } = options;

  const cleanUpi = upiId.trim();
  const encUpi = encodeURIComponent(cleanUpi);
  const encName = encodeURIComponent(payeeName.trim() || 'Labour Book');
  const encNote = encodeURIComponent(note.trim() || 'Labour Book Payment');
  const amtStr = Number(amount).toFixed(2);

  // Standard Universal UPI Deep Link (Works across iOS and Android with installed UPI apps)
  const universalUpi = `upi://pay?pa=${encUpi}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}`;

  let primaryUrl = universalUpi;
  let fallbackUrl = universalUpi;

  const isAndroid = /android/i.test(navigator.userAgent);

  switch (appName.toLowerCase()) {
    case 'phonepe':
      primaryUrl = `phonepe://pay?pa=${encUpi}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}`;
      if (isAndroid) {
        fallbackUrl = `intent://pay?pa=${encUpi}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}#Intent;scheme=upi;package=com.phonepe.app;end;`;
      }
      break;

    case 'gpay':
      // GPay specific scheme + Intent
      primaryUrl = `tez://upi/pay?pa=${encUpi}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}`;
      if (isAndroid) {
        fallbackUrl = `intent://pay?pa=${encUpi}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end;`;
      }
      break;

    case 'paytm':
      primaryUrl = `paytmmp://pay?pa=${encUpi}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}`;
      if (isAndroid) {
        fallbackUrl = `intent://pay?pa=${encUpi}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}#Intent;scheme=upi;package=net.one97.paytm;end;`;
      }
      break;

    case 'bhim':
      primaryUrl = `bhim://pay?pa=${encUpi}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}`;
      if (isAndroid) {
        fallbackUrl = `intent://pay?pa=${encUpi}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}#Intent;scheme=upi;package=in.org.npci.upiapp;end;`;
      }
      break;

    case 'amazonpay':
      primaryUrl = `amazonpay://pay?pa=${encUpi}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}`;
      if (isAndroid) {
        fallbackUrl = `intent://pay?pa=${encUpi}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}#Intent;scheme=upi;package=com.amazon.mShop.android.shopping;end;`;
      }
      break;

    case 'cred':
      primaryUrl = `cred://pay?pa=${encUpi}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}`;
      if (isAndroid) {
        fallbackUrl = `intent://pay?pa=${encUpi}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}#Intent;scheme=upi;package=com.dreamplug.androidapp;end;`;
      }
      break;

    default:
      primaryUrl = universalUpi;
      fallbackUrl = universalUpi;
      break;
  }

  // Execute redirection logic
  try {
    // Attempt primary app deep link
    window.location.href = primaryUrl;

    // Fallback timer if app didn't open immediately
    setTimeout(() => {
      try {
        if (document.hidden) return; // App opened successfully
        window.location.href = fallbackUrl;
      } catch {
        window.open(universalUpi, '_top');
      }
    }, 800);
  } catch {
    try {
      window.open(universalUpi, '_top');
    } catch {
      window.open(universalUpi, '_blank');
    }
  }

  return { primaryUrl, fallbackUrl };
};
