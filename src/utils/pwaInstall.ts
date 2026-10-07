// Global PWA Installation Helper for Mobile & Desktop Devices

export interface PwaInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

let deferredPrompt: any = null;
const listeners: Array<(state: PwaInstallState) => void> = [];

export function initPwaInstallListener() {
  if (typeof window === 'undefined') return;

  // Listen for beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e;
    (window as any).deferredPwaPrompt = e;
    notifyListeners();
  });

  // Listen for appinstalled
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    (window as any).deferredPwaPrompt = null;
    notifyListeners();
  });
}

export function getPwaInstallState(): PwaInstallState {
  if (typeof window === 'undefined') {
    return { isInstallable: false, isInstalled: false, isIOS: false, isAndroid: false };
  }

  const userAgent = window.navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(userAgent);
  
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true ||
                      document.referrer.includes('android-app://');

  const hasDeferredPrompt = !!deferredPrompt || !!(window as any).deferredPwaPrompt;

  return {
    isInstallable: hasDeferredPrompt || isIOS || isAndroid,
    isInstalled: isStandalone,
    isIOS,
    isAndroid
  };
}

export function subscribePwaInstall(callback: (state: PwaInstallState) => void) {
  listeners.push(callback);
  callback(getPwaInstallState());
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  const state = getPwaInstallState();
  listeners.forEach(cb => cb(state));
}

export async function promptPwaInstall(): Promise<{ outcome: 'accepted' | 'dismissed' | 'manual' | 'already_installed' }> {
  const promptEvent = deferredPrompt || (window as any).deferredPwaPrompt;

  if (promptEvent) {
    try {
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        deferredPrompt = null;
        (window as any).deferredPwaPrompt = null;
        notifyListeners();
        return { outcome: 'accepted' };
      } else {
        return { outcome: 'dismissed' };
      }
    } catch (err) {
      console.error('Error triggering PWA prompt:', err);
    }
  }

  const state = getPwaInstallState();
  if (state.isInstalled) {
    return { outcome: 'already_installed' };
  }

  return { outcome: 'manual' };
}

export function downloadAndroidShortcutLauncher() {
  const appName = "onediary.in - Digital Khata & Attendance";
  const appUrl = window.location.origin;

  const htmlContent = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <meta name="theme-color" content="#1d4ed8">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #fff; text-align: center; padding: 40px 20px; }
    .card { background: #1e293b; padding: 24px; border-radius: 20px; border: 1px solid #334155; max-width: 400px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .btn { display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 14px 28px; border-radius: 12px; font-weight: bold; text-decoration: none; margin-top: 20px; font-size: 16px; }
  </style>
  <script>
    window.location.href = "${appUrl}";
  </script>
</head>
<body>
  <div class="card">
    <h2>📱 onediary.in App Launcher</h2>
    <p>Opening OneDiary Mobile Application...</p>
    <a href="${appUrl}" class="btn">🚀 Open App Now</a>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "onediary-app-launcher.html";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
