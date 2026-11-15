/**
 * CONFIG.JS - Konfigurasi Klien Sistem Manajemen Tahfizh Zadil Quran
 * Frontend berkomunikasi secara transparan melalui reverse proxy Cloudflare Pages (/api).
 * URL backend Google Apps Script dikelola terpusat di _worker.js.
 */

const APP_CONFIG = {
  APP_NAME: 'e-zaqu',
  APP_FULL_NAME: 'e-zaqu - PPTQ Zadil Qur\'an',
  APP_TAGLINE: 'Sistem Manajemen Pantauan Tahfizh & Hafalan Al-Qur\'an',

  // Rekening Resmi Pembayaran SPP, PSB & Infaq Pesantren
  REKENING_RESMI: {
    bank: 'Bank BRI',
    nomor: '658001014224533',
    nomorFormat: '6580 0101 4224 533',
    atasNama: 'Fariz Mas\'udin',
    waKonfirmasi: '6285731804663',
    waFormat: '0857-3180-4663'
  },

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
 * Salin nomor rekening resmi ke clipboard ponsel/desktop dengan feedback
 */
function copyRekeningResmi() {
  const rek = (APP_CONFIG.REKENING_RESMI && APP_CONFIG.REKENING_RESMI.nomor) || '658001014224533';
  const rekFmt = (APP_CONFIG.REKENING_RESMI && APP_CONFIG.REKENING_RESMI.nomorFormat) || '6580 0101 4224 533';
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(rek).then(() => {
      if (typeof AppNotify !== 'undefined' && AppNotify.toast) {
        AppNotify.toast('success', `No. Rekening BRI ${rekFmt} berhasil disalin!`);
      } else if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'success',
          title: 'Nomor Rekening Disalin!',
          html: `<b>Bank BRI</b><br><span class="font-mono text-lg">${rekFmt}</span><br>a.n. Fariz Mas'udin`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    }).catch(() => fallbackCopyText(rek, rekFmt));
  } else {
    fallbackCopyText(rek, rekFmt);
  }
}

function fallbackCopyText(text, formatted) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    if (typeof AppNotify !== 'undefined' && AppNotify.toast) {
      AppNotify.toast('success', `No. Rekening BRI ${formatted || text} disalin!`);
    } else {
      alert(`No. Rekening BRI ${formatted || text} disalin!`);
    }
  } catch (e) {
    prompt('Salin nomor rekening BRI manual:', text);
  }
  document.body.removeChild(ta);
}

/**
 * Mendapatkan endpoint API aktif
 * Selalu mengarah ke reverse proxy '/api' yang ditangani oleh _worker.js
 */
function getApiUrl() {
  return APP_CONFIG.API_PROXY_ENDPOINT;
}
