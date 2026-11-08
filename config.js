/**
 * CONFIG.JS - Konfigurasi Klien Sistem Manajemen Tahfizh Zadil Quran
 * Frontend berkomunikasi secara transparan melalui reverse proxy Cloudflare Pages (/api).
 * URL backend Google Apps Script dikelola terpusat di _worker.js.
 */

const APP_CONFIG = {
  APP_NAME: 'Zadil Quran',
  APP_TAGLINE: 'Sistem Manajemen Pantauan Tahfizh & Hafalan Al-Qur\'an',

  // Endpoint API reverse proxy Cloudflare Pages
  API_PROXY_ENDPOINT: '/api',

  // Kunci Penyimpanan Lokal (LocalStorage)
  STORAGE_KEYS: {
    TOKEN: 'zadil_token',
    SESSION: 'zadil_session',
    THEME: 'theme',
    LAST_ROUTE: 'zadil_last_route'
  }
};

/**
 * Mendapatkan endpoint API aktif
 * Selalu mengarah ke reverse proxy '/api' yang ditangani oleh _worker.js
 */
function getApiUrl() {
  return APP_CONFIG.API_PROXY_ENDPOINT;
}
