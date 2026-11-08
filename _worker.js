/**
 * CLOUDFLARE PAGES WORKER (_worker.js)
 * Reverse Proxy & API Gateway & SPA Router untuk Zadil Quran (Sistem Manajemen Tahfidz)
 *
 * FUNGSI UTAMA:
 * 1. Meneruskan request /api ke Google Apps Script Web App secara aman (bypass CORS & redirect 302 Google).
 * 2. Melayani aset statis PWA/Web (HTML, CSS, JS, Gambar) melalui env.ASSETS.
 * 3. Menangani SPA Fallback Routing untuk slug URL (seperti /admin, /admin/santri, /ustadz, /wali, /menu)
 *    agar langsung merender index.html tanpa 404 Not Found.
 * 4. Menyediakan header CORS dan preflight OPTIONS otomatis.
 */

// Target default URL Apps Script (Dapat dioverride via Cloudflare Pages Environment Variable: APPS_SCRIPT_URL)
const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_placeholder/exec';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. TANGANI REQUEST OPTIONS PREFLIGHT CORS
    if (request.method === 'OPTIONS') {
      return handleCorsPreflight();
    }

    // 2. TANGANI REQUEST API GATEWAY (/api atau /api/*)
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      return handleApiProxy(request, env, url);
    }

    // 3. LAYANI ASET STATIS VIA CLOUDFLARE PAGES ASSET SERVER & SPA FALLBACK
    let response = await env.ASSETS.fetch(request);

    // Jika aset fisik tidak ditemukan (status 404) dan bukan file fisik (tidak memiliki ekstensi .js, .css, .png, dll)
    // kembalikan index.html agar Client-Side Router SPA (seperti /admin, /ustadz, /menu) berjalan lancar
    if (response.status === 404 && !url.pathname.includes('.')) {
      return env.ASSETS.fetch(new Request(new URL('/', request.url), request));
    }

    return response;
  }
};

/**
 * Proxy request ke Google Apps Script Web App
 */
async function handleApiProxy(request, env, clientUrl) {
  const targetBaseUrl = (env && env.APPS_SCRIPT_URL) ? env.APPS_SCRIPT_URL.trim() : DEFAULT_APPS_SCRIPT_URL;

  // Jika URL masih berupa placeholder
  if (targetBaseUrl.includes('AKfycbz_placeholder')) {
    return jsonResponse({
      status: 'error',
      message: 'APPS_SCRIPT_URL belum disetel di Cloudflare Pages Environment Variables atau _worker.js.',
      code: 'UNCONFIGURED_BACKEND'
    }, 200);
  }

  try {
    const targetUrl = new URL(targetBaseUrl);

    // Salin seluruh query parameter dari client (contoh: ?action=ping)
    for (const [key, value] of clientUrl.searchParams.entries()) {
      targetUrl.searchParams.set(key, value);
    }

    const forwardHeaders = new Headers();
    forwardHeaders.set('User-Agent', 'Cloudflare-Worker-ZadilQuran-Proxy');

    let fetchOptions = {
      method: request.method,
      redirect: 'follow'
    };

    if (request.method === 'POST') {
      const bodyText = await request.text();
      forwardHeaders.set('Content-Type', 'text/plain;charset=utf-8');
      fetchOptions.body = bodyText;
      fetchOptions.headers = forwardHeaders;
    } else {
      fetchOptions.headers = forwardHeaders;
    }

    const scriptResponse = await fetch(targetUrl.toString(), fetchOptions);
    const responseBody = await scriptResponse.text();

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'application/json;charset=utf-8');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return new Response(responseBody, {
      status: scriptResponse.status,
      headers: responseHeaders
    });
  } catch (err) {
    return jsonResponse({
      status: 'error',
      message: 'Gagal menghubungi backend Google Apps Script: ' + err.message
    }, 502);
  }
}

/**
 * Respon Preflight OPTIONS dengan header CORS
 */
function handleCorsPreflight() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400');
  return new Response(null, { status: 204, headers });
}

/**
 * Helper JSON response dengan header CORS
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
