// Service Worker Registration with Automatic Seamless Background Updates
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Check for updates periodically
          setInterval(() => {
            registration.update().catch(() => {});
          }, 10 * 60 * 1000);
        })
        .catch((err) => {
          console.warn('SW registration failed:', err);
        });
    });
  }
}
