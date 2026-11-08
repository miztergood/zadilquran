/**
 * CONFIG.JS - Konfigurasi Utama Sistem Manajemen Tahfidz Zadil Quran
 * Digunakan baik saat berjalan di Cloudflare Pages (contoh: zadilquran.pages.dev)
 * maupun saat pengujian lokal atau server mandiri.
 */

const APP_CONFIG = {
  // Profil Aplikasi & Identitas
  APP_NAME: 'Zadil Quran',
  APP_TAGLINE: 'Sistem Manajemen Pantauan Tahfidz & Hafalan Al-Qur\'an',

  // Endpoint API:
  // Pada Cloudflare Pages, request diarahkan ke proxy '/api'
  // yang ditangani secara transparan oleh _worker.js tanpa kendala CORS.
  API_PROXY_ENDPOINT: '/api',

  // Direct Google Apps Script Web App URL (Fallback jika tidak lewat Cloudflare Worker)
  // Ganti URL ini dengan URL Web App Deployment Google Apps Script Anda (akhiran /exec)
  DEFAULT_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz_placeholder/exec',

  // Kunci Penyimpanan Lokal (LocalStorage)
  STORAGE_KEYS: {
    API_URL: 'zadil_api_url',
    TOKEN: 'zadil_token',
    SESSION: 'zadil_session',
    THEME: 'theme',
    LAST_ROUTE: 'zadil_last_route'
  }
};

/**
 * Mendapatkan URL endpoint API yang aktif
 * Memprioritaskan:
 * 1. URL Custom dari localStorage (jika disetel manual di halaman Pengaturan)
 * 2. Proxy '/api' jika diakses dari Cloudflare Pages (*.pages.dev atau domain kustom)
 * 3. Fallback direct Apps Script URL
 */
function getApiUrl() {
  const customUrl = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.API_URL);
  if (customUrl && customUrl.trim() !== '') {
    return customUrl.trim();
  }

  // Jika sedang berjalan di Cloudflare Pages (*.pages.dev) atau web server dengan worker /api
  if (window.location.hostname.includes('pages.dev') || window.location.protocol.startsWith('http')) {
    return APP_CONFIG.API_PROXY_ENDPOINT;
  }

  return APP_CONFIG.DEFAULT_APPS_SCRIPT_URL;
}

/**
 * Menyimpan URL API custom ke localStorage
 */
function saveApiUrl(url) {
  if (url && url.trim() !== '') {
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.API_URL, url.trim());
    return true;
  } else {
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.API_URL);
    return true;
  }
}

/**
 * Menghapus URL API custom dan kembali ke default / proxy
 */
function resetApiUrl() {
  localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.API_URL);
}
