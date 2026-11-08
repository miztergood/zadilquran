/**
 * ==============================================================================
 * CLOUDFLARE PAGES WORKER (_worker.js)
 * Reverse Proxy API & Multi-Page Clean Slug Router - Zadil Quran (V4.0)
 * ==============================================================================
 *
 * PANDUAN PENGISIAN URL GOOGLE APPS SCRIPT:
 * Tempelkan URL Web App Deployment Apps Script Anda (yang berakhiran /exec)
 * langsung pada variabel APPS_SCRIPT_URL di bawah ini:
 */

// >>> TEMPELKAN URL APPS SCRIPT ANDA DI SINI <<<
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzd4Tacd4r0H3UM3HIztU66zqP-pNQmWnU5ediQz-a41WLsakQENvT4hhfJzXEb7kC4Ng/exec';

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

    // 3. AMBIL ASET STATIS SECARA LANGSUNG
    let response = await env.ASSETS.fetch(request);

    // 4. JIKA 404 (SLUG BERSIH), COBA COCOKKAN DENGAN HALAMAN MULTI-PAGE
    if (response.status === 404) {
      const cleanPath = url.pathname.replace(/\/+$/, '') || '/';
      let mappedFile = null;

      if (cleanPath === '/login' || cleanPath === '/portal') {
        mappedFile = '/login.html';
      } else if (cleanPath === '/admin' || cleanPath.startsWith('/admin/')) {
        mappedFile = '/admin.html';
      } else if (cleanPath === '/ustadz' || cleanPath === '/setoran') {
        mappedFile = '/ustadz.html';
      } else if (cleanPath === '/wali' || cleanPath === '/progres') {
        mappedFile = '/wali.html';
      } else if (cleanPath === '/landingpage' || cleanPath === '/home' || cleanPath === '/beranda') {
        mappedFile = '/index.html';
      } else if (!url.pathname.includes('.')) {
        mappedFile = '/index.html';
      }

      if (mappedFile) {
        const fallbackUrl = new URL(mappedFile, request.url);
        fallbackUrl.search = url.search;
        return env.ASSETS.fetch(new Request(fallbackUrl, request));
      }
    }

    return response;
  }
};

/**
 * Proxy request ke Google Apps Script Web App
 */
async function handleApiProxy(request, env, clientUrl) {
  // Prioritaskan Cloudflare Environment Variable jika disetel, atau gunakan APPS_SCRIPT_URL dari file ini
  const targetBaseUrl = (env && env.APPS_SCRIPT_URL && env.APPS_SCRIPT_URL.trim() !== '')
    ? env.APPS_SCRIPT_URL.trim()
    : APPS_SCRIPT_URL.trim();

  // Jika URL masih berupa placeholder
  if (targetBaseUrl.includes('AKfycbz_placeholder')) {
    return jsonResponse({
      status: 'error',
      message: 'APPS_SCRIPT_URL belum disetel di file _worker.js atau Cloudflare Pages Environment Variables.',
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
