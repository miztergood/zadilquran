import { describe, it, expect } from 'vitest';
import worker from '../_worker.js';

describe('Cloudflare Pages Edge Worker (_worker.js)', () => {
  it('menangani request OPTIONS CORS preflight dengan status 204 dan header yang sesuai', async () => {
    const request = new Request('https://zadilquran.pages.dev/api', {
      method: 'OPTIONS'
    });

    const response = await worker.fetch(request, {}, {});
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  it('mengarahkan slug bersih 404 ke file HTML yang tepat (clean slug routing)', async () => {
    const testCases = [
      { path: '/login', expectedFile: '/login.html' },
      { path: '/portal', expectedFile: '/login.html' },
      { path: '/admin', expectedFile: '/admin.html' },
      { path: '/ustadz', expectedFile: '/ustadz.html' },
      { path: '/wali', expectedFile: '/wali.html' },
      { path: '/pendaftaran', expectedFile: '/pendaftaran.html' },
      { path: '/beranda', expectedFile: '/index.html' },
    ];

    for (const tc of testCases) {
      let requestedFallback = null;
      const mockEnv = {
        ASSETS: {
          fetch: async (req) => {
            const url = new URL(req.url);
            if (url.pathname === tc.path) {
              return new Response('Not Found', { status: 404 });
            }
            requestedFallback = url.pathname;
            return new Response('OK', { status: 200 });
          }
        }
      };

      const request = new Request(`https://zadilquran.pages.dev${tc.path}`);
      const res = await worker.fetch(request, mockEnv, {});
      expect(res.status).toBe(200);
      expect(requestedFallback).toBe(tc.expectedFile);
    }
  });
});
