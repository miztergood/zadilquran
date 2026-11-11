import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import vm from 'vm';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');

function loadAdminSandbox(initialTags = []) {
  const storage = {};
  const elements = {};
  const makeEl = (id) => ({
    id,
    value: '',
    checked: false,
    textContent: '',
    innerHTML: '',
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
      contains: vi.fn(() => false)
    },
    addEventListener: vi.fn()
  });

  const apiCalls = [];
  const context = {
    console,
    Date,
    Math,
    JSON,
    RegExp,
    Array,
    Object,
    String,
    Number,
    Boolean,
    Promise,
    setTimeout: (fn) => { if (typeof fn === 'function') fn(); return 1; },
    clearTimeout: vi.fn(),
    URLSearchParams,
    document: {
      getElementById: (id) => {
        if (!elements[id]) elements[id] = makeEl(id);
        return elements[id];
      },
      createElement: () => makeEl('anon'),
      body: { appendChild: vi.fn(), removeChild: vi.fn() },
      querySelectorAll: () => []
    },
    localStorage: {
      getItem: (k) => (k in storage ? storage[k] : null),
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: (k) => { delete storage[k]; }
    },
    APP_CONFIG: {
      STORAGE_KEYS: { TOKEN: 'zq_token' }
    },
    AppNotify: {
      confirm: vi.fn(async () => true),
      loading: vi.fn(),
      close: vi.fn(),
      toast: vi.fn()
    },
    formatRupiah: (n) => 'Rp ' + (Number(n) || 0).toLocaleString('id-ID'),
    closeModal: vi.fn(),
    openModal: vi.fn(),
    initPwa: vi.fn(),
    checkExistingSession: vi.fn(() => false),
    renderKeuanganView: vi.fn(),
    renderTableTagihan: vi.fn(),
    renderCardStatusSpp: vi.fn(),
    refreshAdminData: vi.fn(),
    apiCall: vi.fn(async (...args) => {
      apiCalls.push(args);
      return { status: 'success', message: 'OK', data: {} };
    })
  };
  context.window = {
    location: { search: '', pathname: '/admin.html', href: '' },
    addEventListener: vi.fn(),
    innerWidth: 1024
  };
  storage.zq_token = 'mock-admin-token';

  const code = fs.readFileSync(path.join(ROOT, 'js/admin.js'), 'utf8');
  vm.createContext(context);
  vm.runInContext(code, context);

  // Set initial tags via lexical scope helper (karena `state` dideklarasikan dengan `let`)
  context.__initTags = initialTags;
  vm.runInContext('state.tagihan = __initTags;', context);
  return {
    context,
    storage,
    elements,
    apiCalls,
    setState: (patch) => {
      context.__patch = patch;
      vm.runInContext('Object.assign(state, __patch);', context);
    },
    getTags: () => vm.runInContext('state.tagihan', context)
  };
}

function loadGasSandbox({ rows = [], tz = 'Asia/Jakarta', sppRule = null } = {}) {
  const tagihanUpdates = [];
  const configRows = [
    ['Key', 'Value', 'Updated'],
    ['Config_SPP', JSON.stringify(sppRule || { nominal: 200000, aktif: true }), new Date()]
  ];

  const makeSheet = (name, data) => ({
    getName: () => name,
    getDataRange: () => ({
      getValues: () => data,
      getDisplayValues: () => data.map((row) => row.map((cell) => {
        if (cell instanceof Date) {
          const y = cell.getFullYear();
          const m = String(cell.getMonth() + 1).padStart(2, '0');
          return `${y}-${m}`;
        }
        return String(cell === null || cell === undefined ? '' : cell);
      }))
    }),
    getRange: (r, c) => ({
      setValue: (val) => {
        if (!data[r - 1]) data[r - 1] = [];
        data[r - 1][c - 1] = val;
        if (name === 'Data_Tagihan') {
          tagihanUpdates.push({ row: r, col: c, val });
        }
      }
    }),
    appendRow: (row) => data.push(row),
    setFrozenRows: vi.fn(),
    getLastRow: () => data.length
  });

  const tagihanSheet = makeSheet('Data_Tagihan', rows);
  const pengaturanSheet = makeSheet('Pengaturan', configRows);
  const sheets = { Data_Tagihan: tagihanSheet, Pengaturan: pengaturanSheet };

  const context = {
    console,
    Date,
    Math,
    JSON,
    RegExp,
    Array,
    Object,
    String,
    Number,
    Boolean,
    Logger: { log: vi.fn() },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (name) => sheets[name] || null,
        getSpreadsheetTimeZone: () => tz
      }),
      flush: vi.fn()
    },
    Utilities: {
      formatDate: (d, _tz, fmt) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        if (fmt === 'yyyy-MM') return `${y}-${m}`;
        if (fmt === 'yyyy-MM-dd') return `${y}-${m}-${day}`;
        return d.toISOString();
      }
    }
  };

  const gasCode = fs.readFileSync(path.join(ROOT, 'code.gs'), 'utf8');
  vm.createContext(context);
  vm.runInContext(gasCode, context);

  // Bypass token validation, trigger scheduling, & lock wrapper for pure business-logic test
  context.checkRole = () => ({ status: 'success', role: 'superadmin' });
  context.safeExecute = (fn) => fn();
  context.pasangTriggerSpp_ = vi.fn();
  context.hapusTriggerSpp_ = vi.fn();
  context.terbitkanSppPeriode_ = vi.fn();

  return { context, tagihanUpdates, rows, configRows };
}

describe('Perbaikan Sinkronisasi Nominal SPP (Frontend js/admin.js & Backend code.gs)', () => {
  it('Frontend: getCurrentYearMonth() & getActiveSppConfig() terdefinisi dan membaca state/cache dengan aman', () => {
    const { context, storage, setState } = loadAdminSandbox();

    expect(typeof context.getCurrentYearMonth).toBe('function');
    expect(typeof context.getActiveSppConfig).toBe('function');
    expect(context.getCurrentYearMonth()).toMatch(/^\d{4}-\d{2}$/);

    // Fallback dari localStorage
    storage.zadil_spp_config_v4 = JSON.stringify({ nominal: 300000, aktif: true });
    expect(context.getActiveSppConfig().nominal).toBe(300000);

    // Prioritas state.sppConfig jika sudah dimuat dari server
    setState({ sppConfig: { nominal: 350000, aktif: true } });
    expect(context.getActiveSppConfig().nominal).toBe(350000);
  });

  it('Frontend: triggerSyncNominalSpp() berjalan tanpa ReferenceError dan memperbarui tagihan SPP belum lunas', async () => {
    const sampleTags = [
      {
        ID_Tagihan: 'T-1',
        Kategori: 'Syahriyah (SPP)',
        Judul_Tagihan: 'Syahriyah (SPP) Bulan November 2026',
        Nominal: 200000,
        Status: 'Belum Lunas',
        // Simulasi Date ISO string ketika Google Sheets mengonversi kolom Periode ke Date
        Periode: '2026-10-31T17:00:00.000Z'
      },
      {
        ID_Tagihan: 'T-2',
        Kategori: 'Syahriyah (SPP)',
        Judul_Tagihan: 'Syahriyah (SPP) Bulan November 2026',
        Nominal: 200000,
        Status: 'Lunas',
        Periode: '2026-11'
      },
      {
        ID_Tagihan: 'T-3',
        Kategori: 'Daftar Ulang',
        Judul_Tagihan: 'Daftar Ulang November 2026',
        Nominal: 500000,
        Status: 'Belum Lunas',
        Periode: '2026-11'
      }
    ];
    const { context, storage, apiCalls } = loadAdminSandbox(sampleTags);
    storage.zadil_spp_config_v4 = JSON.stringify({ nominal: 300000, aktif: true });

    // Set periode keuangan aktif ke 2026-11
    vm.runInContext(`currentKeuanganPeriode = '2026-11';`, context);

    await context.triggerSyncNominalSpp();

    const syncCall = apiCalls.find((c) => c[0] === 'syncNominalSppTagihan');
    expect(syncCall).toEqual(['syncNominalSppTagihan', 'mock-admin-token', '2026-11', 300000]);

    // T-1 (belum lunas SPP Nov 2026 meski Periode berupa ISO timestamp) harus menjadi 300000
    expect(sampleTags[0].Nominal).toBe(300000);
    // T-2 (sudah Lunas) dan T-3 (non-SPP) TIDAK boleh berubah
    expect(sampleTags[1].Nominal).toBe(200000);
    expect(sampleTags[2].Nominal).toBe(500000);
  });

  it('Frontend: saveAturanSppAction() mempertahankan flag perbaruiTagihanBelumLunas saat mengirim ke API', async () => {
    const { context, elements, apiCalls } = loadAdminSandbox([]);
    vm.runInContext(`currentKeuanganPeriode = '2026-11';`, context);

    elements.aturanSppAktif = { checked: true };
    elements.aturanSppNominal = { value: '300000' };
    elements.aturanSppKategori = { value: 'Syahriyah (SPP)' };
    elements.aturanSppTglTerbit = { value: '1' };
    elements.aturanSppTglTempo = { value: '10' };
    elements.aturanSppCatatan = { value: 'SPP Bulanan Santri Mukim' };
    elements.aturanSppSyncBelumLunas = { checked: true };

    context.document.getElementById = (id) => elements[id];

    context.saveAturanSppAction({ preventDefault: vi.fn() });
    await Promise.resolve();

    const saveCall = apiCalls.find((call) => call[0] === 'saveSppConfig');
    expect(saveCall).toBeDefined();
    const sentPayload = saveCall[2];
    expect(sentPayload.nominal).toBe(300000);
    expect(sentPayload.perbaruiTagihanBelumLunas).toBe(true);
    expect(sentPayload.updateUnpaid).toBe(true);
    expect(sentPayload.targetPeriode).toBe('2026-11');
  });

  it('Backend GAS: syncNominalSppTagihan_() mengenali Periode berupa Date object Google Sheets maupun teks & judul', () => {
    const headers = ['ID_Tagihan', 'ID_Santri', 'Kategori', 'Judul_Tagihan', 'Nominal', 'Jatuh_Tempo', 'Status', 'Tgl_Bayar', 'Metode_Bayar', 'Catatan', 'Timestamp', 'Periode'];
    const novDate = new Date(2026, 10, 1); // 1 Nov 2026 (ketika Sheets auto-convert "2026-11" menjadi Date)
    const rows = [
      headers,
      ['T-DATE', 'ZQ-01', 'Syahriyah (SPP)', 'Syahriyah (SPP) Bulan November 2026', 200000, '10 November 2026', 'Belum Lunas', '', '', '', '', novDate],
      ['T-STR', 'ZQ-02', 'Syahriyah (SPP)', 'Syahriyah (SPP) Bulan November 2026', 200000, '10 November 2026', 'Belum Lunas', '', '', '', '', '2026-11'],
      ['T-EMPTY', 'ZQ-03', 'Syahriyah (SPP)', 'Syahriyah (SPP) Bulan November 2026', 200000, '10 November 2026', 'Menunggu Verifikasi', '', '', '', '', ''],
      ['T-ALREADY', 'ZQ-04', 'Syahriyah (SPP)', 'Syahriyah (SPP) Bulan November 2026', 300000, '10 November 2026', 'Belum Lunas', '', '', '', '', '2026-11'],
      ['T-LUNAS', 'ZQ-05', 'Syahriyah (SPP)', 'Syahriyah (SPP) Bulan November 2026', 200000, '10 November 2026', 'Lunas', '2026-11-05', 'Transfer', '', '', novDate],
      ['T-OTHER-MON', 'ZQ-06', 'Syahriyah (SPP)', 'Syahriyah (SPP) Bulan Oktober 2026', 200000, '10 Oktober 2026', 'Belum Lunas', '', '', '', '', '2026-10']
    ];

    const { context } = loadGasSandbox({ rows });
    const res = context.syncNominalSppTagihan('token', '2026-11', 300000);

    expect(res.status).toBe('success');
    expect(res.data.updated).toBe(3); // T-DATE, T-STR, T-EMPTY
    expect(res.data.matchedUnpaid).toBe(4); // + T-ALREADY yang sudah 300000
    expect(rows[1][4]).toBe(300000); // T-DATE berubah
    expect(rows[2][4]).toBe(300000); // T-STR berubah
    expect(rows[3][4]).toBe(300000); // T-EMPTY berubah
    expect(rows[4][4]).toBe(300000); // T-ALREADY tetap 300000
    expect(rows[5][4]).toBe(200000); // T-LUNAS tidak boleh berubah
    expect(rows[6][4]).toBe(200000); // T-OTHER-MON (Oktober) tidak boleh berubah
  });

  it('Backend GAS: saveSppConfig() langsung menyesuaikan tagihan belum lunas jika perbaruiTagihanBelumLunas = true', () => {
    const headers = ['ID_Tagihan', 'ID_Santri', 'Kategori', 'Judul_Tagihan', 'Nominal', 'Jatuh_Tempo', 'Status', 'Tgl_Bayar', 'Metode_Bayar', 'Catatan', 'Timestamp', 'Periode'];
    const rows = [
      headers,
      ['T-1', 'ZQ-01', 'Syahriyah (SPP)', 'Syahriyah (SPP) Bulan November 2026', 200000, '10 November 2026', 'Belum Lunas', '', '', '', '', new Date(2026, 10, 1)]
    ];

    const { context } = loadGasSandbox({ rows });
    const res = context.saveSppConfig('token', {
      aktif: true,
      nominal: 300000,
      tglTerbit: 1,
      tglJatuhTempo: 10,
      kategori: 'Syahriyah (SPP)',
      catatan: 'SPP Bulanan Santri Mukim',
      perbaruiTagihanBelumLunas: true,
      targetPeriode: '2026-11'
    });

    expect(res.status).toBe('success');
    expect(rows[1][4]).toBe(300000);
  });
});
