import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Force Vite HMR client to use IPv4 host during dev to avoid [::1] CORS issues
// Safe no-op in production builds
try {
  if (import.meta && (import.meta as any).hot && (window as any).__vite__client?.ws?.url) {
    const wsUrl = new URL((window as any).__vite__client.ws.url);
    if (wsUrl.hostname === 'localhost' || wsUrl.hostname === '::1') {
      wsUrl.hostname = '127.0.0.1';
      (window as any).__vite__client.ws.url = wsUrl.toString();
    }
  }
} catch {}
