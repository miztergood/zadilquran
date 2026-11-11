/**
 * ==============================================================================
 * SISTEM MANAJEMEN TAHFIZH & PESANTREN ZADIL QUR'AN V4.0 (API GATEWAY & ENGINE)
 * ==============================================================================
 *
 * Backend Google Apps Script untuk sistem SIM-Tren PPTQ Zadil Qur'an Tuban.
 * Melayani:
 * - REST API Endpoint (doGet & doPost) untuk Web App Cloudflare Pages
 * - Otomasi penerbitan tagihan Syahriyah (SPP) terjadwal harian
 * - Manajemen Buku Induk Santri, Setoran Mutaba'ah, dan Rekap Keuangan
 * - Menu interaktif langsung di bilah menu Google Sheets
 *
 * CARA INSTALASI / DEPLOY:
 * 1. Buka Google Sheet database Pesantren Zadil Qur'an.
 * 2. Klik Extensions > Apps Script.
 * 3. Hapus kode lama, salin dan tempelkan seluruh kode ini ke editor.
 * 4. Klik Simpan (Ctrl+S / Cmd+S).
 * 5. Klik Deploy > Manage deployments > Edit > New version > Deploy.
 *    (Pastikan: Execute as = "Me", Who has access = "Anyone").
 * 6. Muat ulang Google Sheet untuk memunculkan menu "PPTQ Zadil Qur'an".
 * ==============================================================================
 */

// --- MENU SETUP (GOOGLE SHEETS UI) ---
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('PPTQ Zadil Qur\'an')
      .addItem('⚙️ Setup & Mutakhirkan Database', 'menuSetupDatabase')
      .addItem('📢 Terbitkan SPP Bulan Berjalan', 'menuTerbitkanSpp')
      .addSeparator()
      .addItem('ℹ️ Status Sistem & Otomasi SPP', 'menuStatusSistem')
      .addItem('🌐 Panduan & Alamat Web App', 'menuBukaPortalWeb')
      .addToUi();
  } catch (err) {
    Logger.log('onOpen dilewati (non-interactive context): ' + err.message);
  }
}

function menuSetupDatabase() {
  const ui = SpreadsheetApp.getUi();
  const res = setupDatabase();
  SpreadsheetApp.flush();
  if (res && res.status === 'success') {
    ui.alert('Setup Database Berhasil', res.message || 'Seluruh tabel dan kolom telah disiapkan.', ui.ButtonSet.OK);
  } else {
    ui.alert('Setup Database Gagal', (res && res.message) ? res.message : 'Terjadi kendala.', ui.ButtonSet.OK);
  }
}

function menuTerbitkanSpp() {
  const ui = SpreadsheetApp.getUi();
  const currentPeriode = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM");
  const confirm = ui.alert(
    'Konfirmasi Terbitkan SPP',
    'Apakah Anda yakin ingin menerbitkan tagihan Syahriyah (SPP) bulan berjalan (' + currentPeriode + ') untuk seluruh santri aktif yang belum memiliki tagihan?',
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return;

  const res = terbitkanSppPeriode_(currentPeriode);
  SpreadsheetApp.flush();
  if (res && res.status === 'success') {
    ui.alert('Penerbitan SPP Berhasil', res.message, ui.ButtonSet.OK);
  } else {
    ui.alert('Penerbitan SPP Gagal', (res && res.message) ? res.message : 'Gagal memproses SPP.', ui.ButtonSet.OK);
  }
}

function menuStatusSistem() {
  const ui = SpreadsheetApp.getUi();
  const currentPeriode = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM");
  let cfg = { otomatis: true, hariTerbit: 1, hariTempo: 10, nominal: 200000 };
  try {
    const p = getSheetDataAsObjects("Pengaturan").find(x => x.Key === "Config_SPP");
    if (p && p.Value) cfg = normalizeSppConfig_(JSON.parse(p.Value));
  } catch (e) {}

  const triggers = ScriptApp.getProjectTriggers();
  let triggerActive = false;
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "autoTerbitSppHarian") {
      triggerActive = true;
      break;
    }
  }

  const msg = "Status SIM-Tren PPTQ Zadil Qur'an:\n\n" +
    "• Periode Berjalan: " + currentPeriode + "\n" +
    "• Nominal SPP: Rp " + Number(cfg.nominal).toLocaleString('id-ID') + "\n" +
    "• Jadwal Terbit: Tanggal " + cfg.hariTerbit + " setiap bulan\n" +
    "• Jatuh Tempo: Tanggal " + cfg.hariTempo + " setiap bulan\n" +
    "• Status Trigger Otomatis: " + (triggerActive ? "AKTIF (Setiap Pukul 01:00 WIB)" : "NONAKTIF") + "\n\n" +
    "Sistem idempoten & aman dari duplikasi tagihan.";
  ui.alert('Status Sistem & Otomasi SPP', msg, ui.ButtonSet.OK);
}

function menuBukaPortalWeb() {
  const ui = SpreadsheetApp.getUi();
  const html = HtmlService.createHtmlOutput(
    '<div style="font-family:sans-serif;padding:12px;line-height:1.6;font-size:13px;">' +
    '<h3 style="color:#9a2024;margin-top:0;">Portal Web Pesantren Zadil Qur\'an</h3>' +
    '<p>Akses portal web terpadu resmi:</p>' +
    '<p><a href="https://zadilquran.pages.dev" target="_blank" style="background:#9a2024;color:white;padding:8px 16px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Buka Website zadilquran.pages.dev &rarr;</a></p>' +
    '<hr style="border:none;border-top:1px solid #ddd;margin:15px 0;">' +
    '<p style="font-size:11px;color:#666;">• <strong>Portal Staff:</strong> admin.html / ustadz.html<br>• <strong>Portal Wali:</strong> wali.html<br>• <strong>Pendaftaran:</strong> pendaftaran.html</p>' +
    '</div>'
  ).setWidth(380).setHeight(220);
  ui.showModalDialog(html, 'SIM-Tren Zadil Qur\'an');
}

// ==============================================================================
// HTTP API GATEWAY: DOGET & DOPOST
// ==============================================================================

/**
 * Handle HTTP GET Requests
 * Melayani:
 * 1. Healthcheck / Ping API (?action=ping)
 * 2. Ambil branding (?action=getAppBranding)
 * 3. Setup database otomatis (?action=setupDatabase)
 * 4. Tampilan Web App bawaan Apps Script (jika dibuka langsung via browser)
 */
function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action;

    if (action === 'ping') {
      return createJsonResponse(createResponse(true, {
        timestamp: new Date().toISOString(),
        service: 'Zadil Quran API',
        status: 'online'
      }, "Zadil Quran API Online & Siap Digunakan."));
    }

    if (action === 'getAppBranding') {
      return createJsonResponse(getAppBranding());
    }

    if (action === 'getPsbConfig') {
      return createJsonResponse(getPsbConfig());
    }

    if (action === 'setupDatabase') {
      const auth = checkRole(params.token, ["superadmin"]);
      if (auth.status === "error") {
        logSecurityEvent_("UNAUTHORIZED_SETUP", "Percobaan eksekusi setupDatabase via GET tanpa izin.");
        return createJsonResponse(auth);
      }
      return createJsonResponse(setupDatabase());
    }

    // Tampilkan antarmuka HTML jika diakses langsung tanpa parameter API
    return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Zadil Quran - Sistem Manajemen Pesantren & Tahfizh')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return createJsonResponse(createResponse(false, null, "Error pada doGet: " + err.message));
  }
}

/**
 * Handle HTTP POST Requests
 * Digunakan oleh Cloudflare Pages Worker (/api) maupun direct fetch
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse(createResponse(false, null, "Payload data POST kosong."));
    }

    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse(createResponse(false, null, "Format JSON payload tidak valid: " + parseErr.message));
    }

    const action = payload.action;
    const args = payload.args || [];

    let result;
    switch (action) {
      case 'ping':
        result = createResponse(true, {
          timestamp: new Date().toISOString(),
          service: 'Zadil Quran API',
          status: 'online'
        }, "Zadil Quran API Online & Siap Digunakan.");
        break;

      case 'setupDatabase':
        const existingAdmins = getSheetDataAsObjects("Users_Admin");
        if (existingAdmins.length > 0) {
          const authSetup = checkRole(args[0], ["superadmin"]);
          if (authSetup.status === "error") {
            logSecurityEvent_("UNAUTHORIZED_SETUP", "Percobaan eksekusi setupDatabase via POST tanpa izin.");
            result = authSetup;
            break;
          }
        }
        result = setupDatabase();
        break;

      case 'getAppBranding':
        result = getAppBranding();
        break;

      case 'getPsbConfig':
        result = getPsbConfig();
        break;

      case 'savePsbConfig':
        result = savePsbConfig(args[0], args[1]);
        break;

      case 'loginUser':
        result = loginUser(args[0], args[1], args[2]);
        break;

      case 'fetchAppData':
        result = fetchAppData(args[0]);
        break;

      case 'fetchWaliData':
        result = fetchWaliData(args[0], args[1]);
        break;

      case 'addUstadz':
        result = addUstadz(args[0], args[1], args[2], args[3]);
        break;

      case 'editUstadz':
        result = editUstadz(args[0], args[1], args[2], args[3], args[4]);
        break;

      case 'generateNewSantriId':
        result = generateNewSantriId(args[0]);
        break;

      // MODUL 1: BUKU INDUK & PENDAFTARAN SANTRI (ONLINE & ADMIN)
      case 'registerCalonSantriOnline':
        result = registerCalonSantriOnline(args[0]);
        break;

      case 'saveSantriData':
        result = saveSantriData(args[0], args[1]);
        break;

      case 'saveSantriBatch':
        result = saveSantriBatch(args[0], args[1]);
        break;

      case 'addSantri':
        result = addSantri(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12]);
        break;

      case 'editSantri':
        result = editSantri(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12]);
        break;

      case 'deleteDataGlobal':
        result = deleteDataGlobal(args[0], args[1], args[2]);
        break;

      case 'saveSetoran':
        result = saveSetoran(args[0], args[1]);
        break;

      // MODUL 2: KEUANGAN & SPP
      case 'createTagihan':
        result = createTagihan(args[0], args[1]);
        break;

      case 'getSppConfig':
        result = getSppConfig(args[0]);
        break;

      case 'saveSppConfig':
        result = saveSppConfig(args[0], args[1]);
        break;

      case 'getStatusSpp':
        result = getStatusSpp(args[0], args[1]);
        break;

      case 'terbitkanSppSekarang':
        result = terbitkanSppSekarang(args[0], args[1]);
        break;

      case 'bayarTagihan':
        result = bayarTagihan(args[0], args[1], args[2], args[3]);
        break;

      case 'batalBayarTagihan':
        result = batalBayarTagihan(args[0], args[1]);
        break;

      case 'deleteTagihan':
        result = deleteTagihan(args[0], args[1]);
        break;

      case 'updatePondokName':
        result = updatePondokName(args[0], args[1]);
        break;

      case 'updateAdminPassword':
        result = updateAdminPassword(args[0], args[1], args[2]);
        break;

      default:
        result = createResponse(false, null, "Aksi API '" + action + "' tidak dikenali.");
        break;
    }

    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse(createResponse(false, null, "Server Error: " + err.message));
  }
}

/**
 * Helper JSON Response
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// === BOILERPLATE: DATABASE & SETUP ===
const DEFAULT_PSB_CONFIG = {
  syarat: [
    "Berkomitmen menghafal Al-Qur'an 30 Juz.",
    "Mengisi formulir pendaftaran lengkap.",
    "Pas Foto 3x4 (3 lembar): Putra berkopyah, Putri berkerudung.",
    "Fotokopi Ijazah terakhir, Raport, KK, & Akta Kelahiran (masing-masing 2 lembar).",
    "(Bagi Yatim/Piatu) Surat Keterangan Kematian Orang Tua.",
    "Sanggup menaati tata tertib Pesantren bagi santri & wali.",
    "Diantar langsung oleh Orang Tua / Wali ke Pesantren."
  ],
  catatanSyarat: "Berkas fisik diserahkan saat santri tiba di pondok.",
  biayaFasilitas: [
    { id: "bf_1", nama: "Pendaftaran Administrasi", nominal: 100000, kategori: "Pendaftaran" },
    { id: "bf_2", nama: "Almari Santri Pribadi", nominal: 500000, kategori: "Fasilitas" },
    { id: "bf_3", nama: "Infaq Gedung & Sarana Prasarana", nominal: 1000000, kategori: "Fasilitas" },
    { id: "bf_4", nama: "Layanan Kesehatan Santri", nominal: 100000, kategori: "Kesehatan" },
    { id: "bf_5", nama: "Kitab & Buku Panduan Tahfizh", nominal: 100000, kategori: "Kitab" }
  ],
  sppBulanan: 200000
};

const SHEET_CONFIG = {
  "Pengaturan": ["Key", "Value", "Timestamp"],
  "Users_Admin": ["Username", "Password", "Nama", "Role", "Timestamp"],
  "Users_Ustadz": ["ID_Ustadz", "Username", "Password", "Nama", "Timestamp"],
  "Data_Santri": [
    "ID_Santri", "Nama_Santri", "Nama_Panggilan", "Jenis_Kelamin", "Tempat_Lahir", "Tanggal_Lahir",
    "Alamat", "RT", "RW", "Desa", "Kecamatan", "Kab_Kota", "Provinsi",
    "Pendidikan_Terakhir", "Tahun_Lulus", "Sekolah_Asal",
    "Nama_Ayah", "Pekerjaan_Ayah", "Pendidikan_Ayah",
    "Nama_Ibu", "Pekerjaan_Ibu", "Pendidikan_Ibu",
    "Nama_Wali", "No_HP_Wali", "ID_Ustadz", "Status", "Timestamp"
  ],
  "Data_Setoran": ["ID_Setoran", "ID_Santri", "ID_Ustadz", "Tingkatan", "TM", "Jenis", "Juz", "Surah", "SurahNo", "Ayat", "Halaman", "Predikat", "Catatan", "Tanggal", "ParafUstadz", "Detail_Tasmi"],
  "Data_Tagihan": ["ID_Tagihan", "ID_Santri", "Kategori", "Judul_Tagihan", "Nominal", "Jatuh_Tempo", "Status", "Tgl_Bayar", "Metode_Bayar", "Catatan", "Timestamp", "Periode"]
};

// Helper: Parser Bulan & Tahun Indonesia (contoh "November 2026" -> "2026-11")
function parseBulanTahunId_(text) {
  if (!text) return "";
  const months = {
    "januari": "01", "jan": "01",
    "februari": "02", "feb": "02",
    "maret": "03", "mar": "03",
    "april": "04", "apr": "04",
    "mei": "05",
    "juni": "06", "jun": "06",
    "juli": "07", "jul": "07",
    "agustus": "08", "agu": "08", "agt": "08",
    "september": "09", "sep": "09",
    "oktober": "10", "okt": "10",
    "november": "11", "nov": "11",
    "desember": "12", "des": "12"
  };
  const t = String(text).toLowerCase();
  for (let m in months) {
    const regex = new RegExp(m + "[^0-9]*([2][0-9]{3})", "i");
    const match = t.match(regex);
    if (match) {
      return match[1] + "-" + months[m];
    }
  }
  const matchYearMonth = t.match(/([2][0-9]{3})[-/](0[1-9]|1[0-2])/);
  if (matchYearMonth) return matchYearMonth[1] + "-" + matchYearMonth[2];
  return "";
}

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Object.keys(SHEET_CONFIG).forEach(function(sheetName) {
    let sheet = ss.getSheetByName(sheetName);
    const expectedHeaders = SHEET_CONFIG[sheetName];
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(expectedHeaders);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, expectedHeaders.length)
           .setBackground("#9a2024").setFontColor("white").setFontWeight("bold");
    } else {
      // Periksa header yang ada, mutakhirkan kolom baru yang belum ada tanpa menghapus data
      const lastCol = Math.max(sheet.getLastColumn(), 1);
      const currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0] || [];
      expectedHeaders.forEach(function(col) {
        if (currentHeaders.indexOf(col) === -1) {
          const nextCol = sheet.getLastColumn() + 1;
          sheet.getRange(1, nextCol).setValue(col).setBackground("#9a2024").setFontColor("white").setFontWeight("bold");
        }
      });
    }
  });

  const adminSheet = ss.getSheetByName("Users_Admin");
  if (adminSheet.getLastRow() === 1) {
    adminSheet.appendRow(["admin", "admin", "Superadmin Yayasan", "superadmin", new Date()]);
  }

  const pengSheet = ss.getSheetByName("Pengaturan");
  if (pengSheet.getLastRow() === 1) {
    pengSheet.appendRow(["Nama_Pondok", "Zadil Quran", new Date()]);
  }
  const currentPeng = getSheetDataAsObjects("Pengaturan");
  if (!currentPeng.find(x => x.Key === "Config_PSB")) {
    pengSheet.appendRow(["Config_PSB", JSON.stringify(DEFAULT_PSB_CONFIG), new Date()]);
  }
  if (!currentPeng.find(x => x.Key === "Config_SPP")) {
    const defaultSppConfig = {
      "nominal": 200000,
      "hariTerbit": 1,
      "hariTempo": 10,
      "otomatis": true,
      "kategori": "Syahriyah (SPP)",
      "catatan": "SPP Bulanan Santri Mukim"
    };
    pengSheet.appendRow(["Config_SPP", JSON.stringify(defaultSppConfig), new Date()]);
    pasangTriggerSpp_();
  }

  // Backfill Data_Tagihan: Isi kolom Periode yang masih kosong pada tagihan Syahriyah/SPP
  const tagihanSheet = ss.getSheetByName("Data_Tagihan");
  if (tagihanSheet && tagihanSheet.getLastRow() > 1) {
    const tData = tagihanSheet.getDataRange().getValues();
    const tHeaders = tData[0];
    const colPeriodeIdx = tHeaders.indexOf("Periode") + 1;
    const colJudulIdx = tHeaders.indexOf("Judul_Tagihan");
    const colKatIdx = tHeaders.indexOf("Kategori");

    if (colPeriodeIdx > 0 && colJudulIdx >= 0) {
      for (let i = 1; i < tData.length; i++) {
        const row = tData[i];
        const curPeriode = String(row[colPeriodeIdx - 1] || "").trim();
        const curKat = String(row[colKatIdx] || "");
        const curJudul = String(row[colJudulIdx] || "");

        if (!curPeriode && (curKat.includes("SPP") || curKat.includes("Syahriyah") || curJudul.includes("SPP") || curJudul.includes("Syahriyah"))) {
          const parsed = parseBulanTahunId_(curJudul);
          if (parsed) {
            tagihanSheet.getRange(i + 1, colPeriodeIdx).setValue(parsed);
          }
        }
      }
    }
  }

  SpreadsheetApp.flush();
  return createResponse(true, null, "Database berhasil disiapkan, kolom Periode dimutakhirkan & data SPP lama di-backfill. Refresh aplikasi Anda.");
}

function getSheetDataAsObjects(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length <= 1) return []; 
  
  const headers = values.shift();
  return values.map(function(row) {
    const obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
}

// === BOILERPLATE: API RESPONSE HANDLER ===
function createResponse(success, data, message) {
  return { status: success ? "success" : "error", data: data || null, message: message || "" };
}

function safeExecute(fn) {
  try { return fn(); } catch (err) { return createResponse(false, null, "Error: " + err.message); }
}

// === BOILERPLATE: SECURITY LOGGER & SANITIZATION ===
function logSecurityEvent_(eventType, details) {
  try {
    const timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
    Logger.log("[SECURITY_AUDIT] [" + timestamp + "] " + eventType + ": " + (details || "-"));
  } catch(e) {}
}

/**
 * Sanitasi Input Sel Google Sheets (A05: Injection)
 * Mencegah Formula Injection (CSV / Spreadsheet Formula Injection)
 * Mengamankan karakter awalan '=', '+', '-', '@', '\t', '\r'
 */
function sanitizeSpreadsheetCell_(val) {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return "'" + trimmed;
  }
  return val;
}

// === BOILERPLATE: AUTH & ROLE PERMISSION (OWASP A01 & A07 HARDENED) ===
function loginUser(username, password, type) {
  return safeExecute(function() {
    const cleanUser = String(username || "").trim();
    if (!cleanUser) return createResponse(false, null, "Username atau ID wajib diisi.");

    // Rate Limiting (A07: Mitigasi Brute Force Attack via Cache)
    const cache = CacheService.getScriptCache();
    const rateLimitKey = "rl_login_" + cleanUser.toLowerCase();
    const failedAttempts = parseInt(cache.get(rateLimitKey) || "0", 10);
    if (failedAttempts >= 5) {
      logSecurityEvent_("RATE_LIMIT_BLOCKED", "User '" + cleanUser + "' diblokir sementara karena 5x kegagalan berturut-turut.");
      return createResponse(false, null, "Terlalu banyak percobaan login yang gagal. Akses dibekukan sementara selama 15 menit demi keamanan.");
    }

    let user = null, role = null, name = "", idUser = "";

    if (type === 'staff') {
      const admins = getSheetDataAsObjects("Users_Admin");
      user = admins.find(u => u.Username === cleanUser && u.Password === password);
      if (user) { role = "superadmin"; name = user.Nama; idUser = cleanUser; }
      
      if (!user) {
        const ustadzs = getSheetDataAsObjects("Users_Ustadz");
        user = ustadzs.find(u => u.Username === cleanUser && u.Password === password);
        if (user) { role = "ustadz"; name = user.Nama; idUser = user.ID_Ustadz; }
      }
    } else if (type === 'wali') {
      const cleanUsername = cleanUser.toUpperCase();
      const santris = getSheetDataAsObjects("Data_Santri");
      user = santris.find(s => String(s.ID_Santri || "").trim().toUpperCase() === cleanUsername);
      if (user) {
        role = "walisantri";
        name = "Wali " + user.Nama_Santri;
        idUser = user.ID_Santri;
      }
    }

    if (!user) {
      cache.put(rateLimitKey, String(failedAttempts + 1), 900); // Kunci 15 menit jika 5x gagal berturut-turut
      logSecurityEvent_("LOGIN_FAILED", "Kredensial gagal untuk user: " + cleanUser + " (Gagal ke-" + (failedAttempts + 1) + ")");
      return createResponse(false, null, "Kredensial tidak ditemukan atau salah.");
    }

    // Login sukses: Reset counter percobaan gagal
    cache.remove(rateLimitKey);

    // Buat token sesi dengan batas kedaluwarsa (A07: Session Expiry / 24 Jam)
    const token = Utilities.getUuid();
    const now = new Date().getTime();
    const ttlMs = 24 * 60 * 60 * 1000; // 24 jam
    PropertiesService.getScriptProperties().setProperty("session_" + token, JSON.stringify({
      id: idUser,
      role: role,
      name: name,
      createdAt: now,
      expiresAt: now + ttlMs
    }));

    logSecurityEvent_("LOGIN_SUCCESS", "Login sukses sebagai " + role + " (" + idUser + ")");
    return createResponse(true, {
      token: token,
      role: role,
      name: name,
      id: idUser,
      santri: (role === "walisantri") ? user : undefined
    }, "Login berhasil.");
  });
}

function checkRole(token, allowedRoles) {
  if (!token || typeof token !== 'string') return createResponse(false, null, "Token sesi tidak valid.");
  const raw = PropertiesService.getScriptProperties().getProperty("session_" + token);
  if (!raw) return createResponse(false, null, "Sesi tidak ditemukan atau telah kedaluwarsa.");

  try {
    const session = JSON.parse(raw);
    const now = new Date().getTime();
    if (session.expiresAt && now > session.expiresAt) {
      PropertiesService.getScriptProperties().deleteProperty("session_" + token);
      logSecurityEvent_("SESSION_EXPIRED", "Token sesi " + token + " kedaluwarsa.");
      return createResponse(false, null, "Sesi Anda telah kedaluwarsa. Silakan login kembali.");
    }
    if (allowedRoles.indexOf(session.role) === -1) {
      logSecurityEvent_("UNAUTHORIZED_ROLE", "Role " + session.role + " ditolak saat akses endpoint dengan role " + allowedRoles.join(","));
      return createResponse(false, null, "Akses ditolak: Anda tidak memiliki izin untuk tindakan ini.");
    }
    return createResponse(true, session, "Akses diizinkan.");
  } catch(e) {
    return createResponse(false, null, "Format sesi tidak valid.");
  }
}

function validateRequired(fields) {
  for (const key in fields) {
    if (!fields[key] || String(fields[key]).trim() === "") return createResponse(false, null, key + " wajib diisi.");
  }
  return null;
}

// === CUSTOM: LOGIKA BISNIS MANAJEMEN TAHFIZH & PESANTREN ===

function getAppBranding() {
  return safeExecute(function() {
    const p = getSheetDataAsObjects("Pengaturan").find(x => x.Key === "Nama_Pondok");
    return createResponse(true, p ? p.Value : "Zadil Quran", "Branding dimuat");
  });
}

function getPsbConfig() {
  return safeExecute(function() {
    const p = getSheetDataAsObjects("Pengaturan").find(x => x.Key === "Config_PSB");
    if (p && p.Value) {
      try {
        const parsed = JSON.parse(p.Value);
        return createResponse(true, parsed, "Konfigurasi PSB berhasil dimuat");
      } catch (err) {}
    }
    return createResponse(true, DEFAULT_PSB_CONFIG, "Konfigurasi PSB default");
  });
}

function savePsbConfig(token, configData) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;

  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pengaturan");
    if (!sheet) return createResponse(false, null, "Sheet Pengaturan tidak ditemukan");

    const data = sheet.getDataRange().getValues();
    const jsonStr = typeof configData === "string" ? configData : JSON.stringify(configData);
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === "Config_PSB") {
        sheet.getRange(i + 1, 2).setValue(jsonStr);
        sheet.getRange(i + 1, 3).setValue(new Date());
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow(["Config_PSB", jsonStr, new Date()]);
    }
    SpreadsheetApp.flush();
    return createResponse(true, typeof configData === "string" ? JSON.parse(configData) : configData, "Pengaturan PSB & Biaya berhasil disimpan!");
  });
}

function fetchAppData(token) {
  const auth = checkRole(token, ["superadmin", "ustadz"]);
  if (auth.status === "error") return auth;

  return safeExecute(function() {
    const p = getSheetDataAsObjects("Pengaturan").find(x => x.Key === "Nama_Pondok");
    const psb = getPsbConfig();
    const data = {
      appName: p ? p.Value : "Zadil Quran",
      psbConfig: psb.data || DEFAULT_PSB_CONFIG,
      ustadz: getSheetDataAsObjects("Users_Ustadz").reverse(),
      santri: getSheetDataAsObjects("Data_Santri").reverse(),
      setoran: getSheetDataAsObjects("Data_Setoran"),
      tagihan: getSheetDataAsObjects("Data_Tagihan").reverse()
    };
    return createResponse(true, data, "Data berhasil dimuat");
  });
}

function fetchWaliData(arg1, arg2) {
  return safeExecute(function() {
    let token = "";
    let idSantri = "";
    if (arg2 !== undefined) {
      token = arg1;
      idSantri = arg2;
    } else {
      idSantri = arg1;
    }

    const cleanId = String(idSantri || "").trim().toUpperCase();
    if (!cleanId) return createResponse(false, null, "ID Santri wajib diisi.");

    // Pertahanan A01 (Broken Access Control & IDOR): Validasi token jika ada
    if (token) {
      const auth = checkRole(token, ["walisantri", "superadmin", "ustadz"]);
      if (auth.status === "error") return auth;
      // Jika role adalah walisantri, pastikan hanya boleh mengakses data anaknya sendiri
      if (auth.data.role === "walisantri" && String(auth.data.id).trim().toUpperCase() !== cleanId) {
        logSecurityEvent_("IDOR_ATTEMPT", "Wali " + auth.data.id + " diblokir saat mencoba akses ID santri " + cleanId);
        return createResponse(false, null, "Akses ditolak: Anda hanya berhak mengakses data ananda santri Anda sendiri.");
      }
    }

    const p = getSheetDataAsObjects("Pengaturan").find(x => x.Key === "Nama_Pondok");
    const setoran = getSheetDataAsObjects("Data_Setoran").filter(s => String(s.ID_Santri || "").trim().toUpperCase() === cleanId).reverse();
    const santri = getSheetDataAsObjects("Data_Santri").find(s => String(s.ID_Santri || "").trim().toUpperCase() === cleanId);
    const ustadz = getSheetDataAsObjects("Users_Ustadz").find(u => u.ID_Ustadz === (santri ? santri.ID_Ustadz : ""));
    const tagihan = getSheetDataAsObjects("Data_Tagihan").filter(t => String(t.ID_Santri || "").trim().toUpperCase() === cleanId).reverse();
    
    return createResponse(true, { 
      appName: p ? p.Value : "Zadil Quran",
      santri: santri || null, 
      setoran: setoran, 
      ustadz: ustadz || null,
      tagihan: tagihan
    }, "Data wali dimuat");
  });
}

// --- CRUD USTADZ ---
function addUstadz(token, nama, username, password) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;
  const valid = validateRequired({ "Nama": nama, "Username": username, "Password": password });
  if (valid) return valid;

  if (String(password).trim().length < 6) {
    return createResponse(false, null, "Password ustadz minimal harus 6 karakter.");
  }

  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users_Ustadz");
    const newId = "U-" + new Date().getTime().toString().slice(-6);
    sheet.appendRow([newId, username, password, nama, new Date()]);
    SpreadsheetApp.flush();
    return createResponse(true, null, "Ustadz berhasil ditambahkan.");
  });
}

function editUstadz(token, id, nama, username, password) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;
  
  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users_Ustadz");
    const data = sheet.getDataRange().getValues();
    for(let i=1; i<data.length; i++) {
      if(data[i][0] === id) {
        sheet.getRange(i+1, 2).setValue(username);
        if(password) sheet.getRange(i+1, 3).setValue(password);
        sheet.getRange(i+1, 4).setValue(nama);
        SpreadsheetApp.flush();
        return createResponse(true, null, "Data Ustadz berhasil diperbarui.");
      }
    }
    return createResponse(false, null, "Ustadz tidak ditemukan.");
  });
}

// --- CRUD BUKU INDUK SANTRI & PENDAFTARAN (MODUL 1) ---
function generateNewSantriId(token) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;
  return safeExecute(function() {
    const year = new Date().getFullYear();
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return createResponse(true, `ZQ-${year}-${randomStr}`, "ID digenerate");
  });
}

function registerCalonSantriOnline(data) {
  return safeExecute(function() {
    const sheetSantri = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data_Santri");
    if (!sheetSantri) return createResponse(false, null, "Database belum siap. Hubungi admin.");

    const year = new Date().getFullYear();
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newId = `ZQ-${year}-${randomStr}`;

    const lastCol = Math.max(sheetSantri.getLastColumn(), 1);
    const headersSantri = sheetSantri.getRange(1, 1, 1, lastCol).getValues()[0];

    const rowSantri = {
      "ID_Santri": newId,
      "Nama_Santri": String(data.namaSantri || "").trim(),
      "Nama_Panggilan": String(data.namaPanggilan || "").trim(),
      "Jenis_Kelamin": data.jenisKelamin || "Putra",
      "Tempat_Lahir": String(data.tempatLahir || "").trim(),
      "Tanggal_Lahir": String(data.tanggalLahir || "").trim(),
      "Alamat": String(data.alamat || "").trim(),
      "RT": String(data.rt || "-").trim(),
      "RW": String(data.rw || "-").trim(),
      "Desa": String(data.desa || "-").trim(),
      "Kecamatan": String(data.kecamatan || "-").trim(),
      "Kab_Kota": String(data.kabKota || "-").trim(),
      "Provinsi": String(data.provinsi || "Jawa Timur").trim(),
      "Pendidikan_Terakhir": String(data.pendidikanTerakhir || "-").trim(),
      "Tahun_Lulus": String(data.tahunLulus || "-").trim(),
      "Sekolah_Asal": String(data.sekolahAsal || "-").trim(),
      "Nama_Ayah": String(data.namaAyah || "").trim(),
      "Pekerjaan_Ayah": String(data.pekerjaanAyah || "-").trim(),
      "Pendidikan_Ayah": String(data.pendidikanAyah || "-").trim(),
      "Nama_Ibu": String(data.namaIbu || "").trim(),
      "Pekerjaan_Ibu": String(data.pekerjaanIbu || "-").trim(),
      "Pendidikan_Ibu": String(data.pendidikanIbu || "-").trim(),
      "Nama_Wali": String(data.namaWali || data.namaAyah || "").trim(),
      "No_HP_Wali": String(data.noHpWali || "").trim(),
      "ID_Ustadz": "",
      "Status": "Calon Santri",
      "Timestamp": new Date()
    };

    const newRow = headersSantri.map(function(h) {
      const v = rowSantri.hasOwnProperty(h) ? rowSantri[h] : "";
      return sanitizeSpreadsheetCell_(v);
    });
    sheetSantri.appendRow(newRow);

    // Ambil konfigurasi PSB & biaya terbaru (dinamis)
    let psbConfig = DEFAULT_PSB_CONFIG;
    try {
      const cfg = getPsbConfig();
      if (cfg && cfg.status === "success" && cfg.data) psbConfig = cfg.data;
    } catch (e) {}

    const totalFasilitas = (psbConfig.biayaFasilitas || []).reduce(function(sum, item) {
      return sum + (Number(item.nominal) || 0);
    }, 0) || 1800000;
    const sppNominal = Number(psbConfig.sppBulanan) || 200000;
    const grandTotal = totalFasilitas + sppNominal;
    const rincianFasilitasStr = (psbConfig.biayaFasilitas || []).map(function(b) {
      return b.nama + ": Rp " + Number(b.nominal).toLocaleString('id-ID');
    }).join(' • ');

    // Terbitkan Otomatis Tagihan Biaya Masuk & Syahriyah Pertama di Data_Tagihan
    const sheetTagihan = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data_Tagihan");
    if (sheetTagihan) {
      const headersTagihan = sheetTagihan.getRange(1, 1, 1, Math.max(sheetTagihan.getLastColumn(), 1)).getValues()[0];
      const timePrefix = new Date().getTime().toString().slice(-4);

      // Tagihan 1: Paket Pendaftaran & Fasilitas Santri Mukim (Dinamis dari Pengaturan)
      const tagihan1 = {
        "ID_Tagihan": "INV-" + timePrefix + "-001",
        "ID_Santri": newId,
        "Kategori": "Pendaftaran & Fasilitas",
        "Judul_Tagihan": "Biaya Pendaftaran & Fasilitas Santri Mukim",
        "Nominal": totalFasilitas,
        "Jatuh_Tempo": "Saat Masuk Pondok",
        "Status": "Belum Lunas",
        "Tgl_Bayar": "-",
        "Metode_Bayar": "-",
        "Catatan": "Rincian: " + (rincianFasilitasStr || "Paket Pendaftaran Resmi"),
        "Timestamp": new Date()
      };
      sheetTagihan.appendRow(headersTagihan.map(function(h) { return tagihan1.hasOwnProperty(h) ? tagihan1[h] : ""; }));

      // Tagihan 2: Syahriyah (SPP) Bulan Pertama (Dinamis dari Pengaturan)
      const currentMonthStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM");
      const tagihan2 = {
        "ID_Tagihan": "INV-" + timePrefix + "-002",
        "ID_Santri": newId,
        "Kategori": "Syahriyah (SPP)",
        "Judul_Tagihan": "Syahriyah (SPP) Bulan Pertama",
        "Nominal": sppNominal,
        "Jatuh_Tempo": "Saat Masuk Pondok",
        "Status": "Belum Lunas",
        "Tgl_Bayar": "-",
        "Metode_Bayar": "-",
        "Catatan": "Syahriyah Bulanan Standar",
        "Timestamp": new Date(),
        "Periode": currentMonthStr
      };
      sheetTagihan.appendRow(headersTagihan.map(function(h) { return tagihan2.hasOwnProperty(h) ? tagihan2[h] : ""; }));
    }

    SpreadsheetApp.flush();
    return createResponse(true, {
      idSantri: newId,
      namaSantri: rowSantri.Nama_Santri,
      totalBiaya: grandTotal,
      rincianBiaya: "Pendaftaran & Fasilitas (Rp " + totalFasilitas.toLocaleString('id-ID') + ") + Syahriyah (Rp " + sppNominal.toLocaleString('id-ID') + ")"
    }, "Pendaftaran online berhasil! Nomor Registrasi ID: " + newId);
  });
}

function saveSantriData(token, data) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;
  const valid = validateRequired({ "ID Santri": data.idSantri, "Nama Santri": data.namaSantri });
  if (valid) return valid;

  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data_Santri");
    if (!sheet) return createResponse(false, null, "Sheet Data_Santri tidak ditemukan.");

    const lastCol = Math.max(sheet.getLastColumn(), 1);
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const rows = sheet.getDataRange().getValues();

    const rowObj = {
      "ID_Santri": String(data.idSantri).trim().toUpperCase(),
      "Nama_Santri": String(data.namaSantri).trim(),
      "Nama_Panggilan": data.namaPanggilan ? String(data.namaPanggilan).trim() : "",
      "Jenis_Kelamin": data.jenisKelamin || "Putra",
      "Tempat_Lahir": data.tempatLahir ? String(data.tempatLahir).trim() : "",
      "Tanggal_Lahir": data.tanggalLahir ? String(data.tanggalLahir).trim() : "",
      "Alamat": data.alamat ? String(data.alamat).trim() : "",
      "RT": data.rt ? String(data.rt).trim() : "-",
      "RW": data.rw ? String(data.rw).trim() : "-",
      "Desa": data.desa ? String(data.desa).trim() : "-",
      "Kecamatan": data.kecamatan ? String(data.kecamatan).trim() : "-",
      "Kab_Kota": data.kabKota ? String(data.kabKota).trim() : "-",
      "Provinsi": data.provinsi ? String(data.provinsi).trim() : "Jawa Timur",
      "Pendidikan_Terakhir": data.pendidikanTerakhir ? String(data.pendidikanTerakhir).trim() : "-",
      "Tahun_Lulus": data.tahunLulus ? String(data.tahunLulus).trim() : "-",
      "Sekolah_Asal": data.sekolahAsal ? String(data.sekolahAsal).trim() : "-",
      "Nama_Ayah": data.namaAyah ? String(data.namaAyah).trim() : "",
      "Pekerjaan_Ayah": data.pekerjaanAyah ? String(data.pekerjaanAyah).trim() : "-",
      "Pendidikan_Ayah": data.pendidikanAyah ? String(data.pendidikanAyah).trim() : "-",
      "Nama_Ibu": data.namaIbu ? String(data.namaIbu).trim() : "",
      "Pekerjaan_Ibu": data.pekerjaanIbu ? String(data.pekerjaanIbu).trim() : "-",
      "Pendidikan_Ibu": data.pendidikanIbu ? String(data.pendidikanIbu).trim() : "-",
      "Nama_Wali": data.namaWali ? String(data.namaWali).trim() : (data.namaAyah || ""),
      "No_HP_Wali": data.noHpWali ? String(data.noHpWali).trim() : "",
      "ID_Ustadz": data.idUstadz ? String(data.idUstadz).trim() : "",
      "Status": data.status || "Aktif",
      "Timestamp": new Date()
    };

    let existingRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).trim().toUpperCase() === rowObj.ID_Santri) {
        existingRowIndex = i + 1;
        break;
      }
    }

    if (existingRowIndex > 0) {
      headers.forEach(function(headerName, colIdx) {
        if (rowObj.hasOwnProperty(headerName)) {
          sheet.getRange(existingRowIndex, colIdx + 1).setValue(sanitizeSpreadsheetCell_(rowObj[headerName]));
        }
      });
      SpreadsheetApp.flush();
      return createResponse(true, null, "Data Buku Induk Santri berhasil diperbarui.");
    } else {
      const newRow = headers.map(function(h) {
        return sanitizeSpreadsheetCell_(rowObj.hasOwnProperty(h) ? rowObj[h] : "");
      });
      sheet.appendRow(newRow);
      SpreadsheetApp.flush();
      return createResponse(true, null, "Santri baru berhasil didaftarkan ke Buku Induk.");
    }
  });
}

function saveSantriBatch(token, santriList) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;

  if (!Array.isArray(santriList) || santriList.length === 0) {
    return createResponse(false, null, "Daftar santri untuk impor kosong.");
  }

  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data_Santri");
    if (!sheet) return createResponse(false, null, "Sheet Data_Santri tidak ditemukan.");

    const lastCol = Math.max(sheet.getLastColumn(), 1);
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const year = new Date().getFullYear();

    const newRows = santriList.map(function(data) {
      let idSantri = String(data.idSantri || data.ID_Santri || "").trim().toUpperCase();
      if (!idSantri || !idSantri.startsWith("ZQ-")) {
        const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
        idSantri = "ZQ-" + year + "-" + rnd;
      }

      const rowObj = {
        "ID_Santri": idSantri,
        "Nama_Santri": String(data.namaSantri || data.Nama_Santri || "").trim(),
        "Nama_Panggilan": data.namaPanggilan || data.Nama_Panggilan ? String(data.namaPanggilan || data.Nama_Panggilan).trim() : "",
        "Jenis_Kelamin": data.jenisKelamin || data.Jenis_Kelamin || "Putra",
        "Tempat_Lahir": data.tempatLahir || data.Tempat_Lahir ? String(data.tempatLahir || data.Tempat_Lahir).trim() : "",
        "Tanggal_Lahir": data.tanggalLahir || data.Tanggal_Lahir ? String(data.tanggalLahir || data.Tanggal_Lahir).trim() : "",
        "Alamat": data.alamat || data.Alamat ? String(data.alamat || data.Alamat).trim() : "",
        "RT": data.rt || data.RT ? String(data.rt || data.RT).trim() : "-",
        "RW": data.rw || data.RW ? String(data.rw || data.RW).trim() : "-",
        "Desa": data.desa || data.Desa ? String(data.desa || data.Desa).trim() : "-",
        "Kecamatan": data.kecamatan || data.Kecamatan ? String(data.kecamatan || data.Kecamatan).trim() : "-",
        "Kab_Kota": data.kabKota || data.Kab_Kota ? String(data.kabKota || data.Kab_Kota).trim() : "-",
        "Provinsi": data.provinsi || data.Provinsi ? String(data.provinsi || data.Provinsi).trim() : "Jawa Timur",
        "Pendidikan_Terakhir": data.pendidikanTerakhir || data.Pendidikan_Terakhir ? String(data.pendidikanTerakhir || data.Pendidikan_Terakhir).trim() : "-",
        "Tahun_Lulus": data.tahunLulus || data.Tahun_Lulus ? String(data.tahunLulus || data.Tahun_Lulus).trim() : "-",
        "Sekolah_Asal": data.sekolahAsal || data.Sekolah_Asal ? String(data.sekolahAsal || data.Sekolah_Asal).trim() : "-",
        "Nama_Ayah": data.namaAyah || data.Nama_Ayah ? String(data.namaAyah || data.Nama_Ayah).trim() : "",
        "Pekerjaan_Ayah": data.pekerjaanAyah || data.Pekerjaan_Ayah ? String(data.pekerjaanAyah || data.Pekerjaan_Ayah).trim() : "-",
        "Pendidikan_Ayah": data.pendidikanAyah || data.Pendidikan_Ayah ? String(data.pendidikanAyah || data.Pendidikan_Ayah).trim() : "-",
        "Nama_Ibu": data.namaIbu || data.Nama_Ibu ? String(data.namaIbu || data.Nama_Ibu).trim() : "",
        "Pekerjaan_Ibu": data.pekerjaanIbu || data.Pekerjaan_Ibu ? String(data.pekerjaanIbu || data.Pekerjaan_Ibu).trim() : "-",
        "Pendidikan_Ibu": data.pendidikanIbu || data.Pendidikan_Ibu ? String(data.pendidikanIbu || data.Pendidikan_Ibu).trim() : "-",
        "Nama_Wali": data.namaWali || data.Nama_Wali ? String(data.namaWali || data.Nama_Wali).trim() : (data.namaAyah || data.Nama_Ayah || ""),
        "No_HP_Wali": data.noHpWali || data.No_HP_Wali ? String(data.noHpWali || data.No_HP_Wali).trim() : "",
        "ID_Ustadz": data.idUstadz || data.ID_Ustadz ? String(data.idUstadz || data.ID_Ustadz).trim() : "",
        "Status": data.status || data.Status || "Aktif",
        "Timestamp": new Date()
      };

      return headers.map(function(h) {
        return sanitizeSpreadsheetCell_(rowObj.hasOwnProperty(h) ? rowObj[h] : "");
      });
    });

    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, newRows.length, headers.length).setValues(newRows);
    SpreadsheetApp.flush();
    return createResponse(true, { count: newRows.length }, "Berhasil mengimpor " + newRows.length + " data santri ke Buku Induk.");
  });
}

function addSantri(token, idSantri, namaSantri, namaWali, idUstadz, tempatLahir, tanggalLahir, jenisKelamin, namaAyah, namaIbu, noHpWali, alamat, status) {
  return saveSantriData(token, {
    idSantri: idSantri,
    namaSantri: namaSantri,
    namaWali: namaWali,
    idUstadz: idUstadz,
    tempatLahir: tempatLahir,
    tanggalLahir: tanggalLahir,
    jenisKelamin: jenisKelamin,
    namaAyah: namaAyah,
    namaIbu: namaIbu,
    noHpWali: noHpWali,
    alamat: alamat,
    status: status
  });
}

function editSantri(token, id, namaSantri, namaWali, idUstadz, tempatLahir, tanggalLahir, jenisKelamin, namaAyah, namaIbu, noHpWali, alamat, status) {
  return saveSantriData(token, {
    idSantri: id,
    namaSantri: namaSantri,
    namaWali: namaWali,
    idUstadz: idUstadz,
    tempatLahir: tempatLahir,
    tanggalLahir: tanggalLahir,
    jenisKelamin: jenisKelamin,
    namaAyah: namaAyah,
    namaIbu: namaIbu,
    noHpWali: noHpWali,
    alamat: alamat,
    status: status
  });
}

// --- DELETE GLOBAL ---
function deleteDataGlobal(token, sheetName, id) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;
  
  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) return createResponse(false, null, "Sheet tidak ditemukan.");
    const data = sheet.getDataRange().getValues();
    for(let i=1; i<data.length; i++) {
      if(String(data[i][0]).trim().toUpperCase() === String(id).trim().toUpperCase()) {
        sheet.deleteRow(i+1);
        SpreadsheetApp.flush();
        return createResponse(true, null, "Data berhasil dihapus.");
      }
    }
    return createResponse(false, null, "Data tidak ditemukan.");
  });
}

// --- INPUT SETORAN TAHFIZH & MUTABA'AH HARIAN ---
function saveSetoran(token, dataSetoran) {
  const auth = checkRole(token, ["ustadz", "superadmin"]);
  if (auth.status === "error") return auth;

  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data_Setoran");
    if (!sheet) return createResponse(false, null, "Sheet Data_Setoran tidak ditemukan.");

    // Pastikan kolom mutaba'ah terbaru tersedia secara non-destruktif
    const expectedHeaders = SHEET_CONFIG["Data_Setoran"];
    const lastCol = Math.max(sheet.getLastColumn(), 1);
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0] || [];
    expectedHeaders.forEach(function(col) {
      if (headers.indexOf(col) === -1) {
        const nextCol = sheet.getLastColumn() + 1;
        sheet.getRange(1, nextCol).setValue(col).setBackground("#9a2024").setFontColor("white").setFontWeight("bold");
        headers.push(col);
      }
    });

    let juzVal = dataSetoran.juz || "-";
    let surahVal = dataSetoran.surah || "-";
    let surahNoVal = dataSetoran.surahNo || "";
    let ayatVal = dataSetoran.ayat || "-";
    let halVal = dataSetoran.halaman || "-";
    let predikatVal = dataSetoran.predikat || "Mumtaz";
    let detailTasmiJson = "";

    // Validasi & Kalkulasi Ulang Penilaian Khusus Tasmi' (Juz 30 = 23 Hal, Juz 1-29 = 20 Hal, Batas Lulus >= 80)
    const isTasmi = String(dataSetoran.type || "").toLowerCase().indexOf("tasmi") !== -1;
    if (isTasmi && dataSetoran.detailTasmi) {
      let rawDetail = dataSetoran.detailTasmi;
      if (typeof rawDetail === "string") {
        try { rawDetail = JSON.parse(rawDetail); } catch (err) { rawDetail = null; }
      }
      if (!rawDetail || typeof rawDetail !== "object") {
        return createResponse(false, null, "Format data penilaian Tasmi' tidak valid.");
      }

      const tasmiJuz = String(rawDetail.juz || juzVal || "30").trim();
      const totalPages = tasmiJuz === "30" ? 23 : 20;
      const maxScore = totalPages * 5;

      const validScores = [5, 4, 3, 2];
      const skorMap = rawDetail.skorPerHalaman || {};
      const cleanSkorMap = {};
      let serverTotalSkor = 0;

      for (let p = 1; p <= totalPages; p++) {
        const sc = Number(skorMap[p] !== undefined ? skorMap[p] : skorMap[String(p)]);
        if (validScores.indexOf(sc) === -1) {
          return createResponse(false, null, "Skor Halaman " + p + " wajib diisi dengan nilai 5, 4, 3, atau 2.");
        }
        cleanSkorMap[p] = sc;
        serverTotalSkor += sc;
      }

      const validGrades = ["A", "B", "C", "D"];
      const tajwidAspekKeys = [
        "makharijul_huruf", "sifatul_huruf", "nun_sukun_tanwin",
        "mim_mati", "hukum_mad", "qalqalah", "ghunnah",
        "tafkhim_tarqiq", "waqaf_ibtida"
      ];
      const rawTajwid = rawDetail.tajwid || {};
      const cleanTajwid = {};
      for (let i = 0; i < tajwidAspekKeys.length; i++) {
        const k = tajwidAspekKeys[i];
        const g = String(rawTajwid[k] || "").trim().toUpperCase();
        if (validGrades.indexOf(g) === -1) {
          return createResponse(false, null, "Seluruh 9 aspek Praktik Tajwid wajib diisi nilai huruf A, B, C, atau D.");
        }
        cleanTajwid[k] = g;
      }

      const statusKelulusan = serverTotalSkor >= 80 ? "LULUS" : "TIDAK LULUS";

      const sanitizedDetail = {
        juz: tasmiJuz,
        totalPages: totalPages,
        maksimalSkor: maxScore,
        skorPerHalaman: cleanSkorMap,
        totalSkor: serverTotalSkor,
        passingScore: 80,
        statusKelulusan: statusKelulusan,
        tajwid: cleanTajwid
      };

      juzVal = tasmiJuz;
      surahVal = "Penilaian Tasmi' Juz " + tasmiJuz;
      surahNoVal = "";
      ayatVal = totalPages + " Halaman";
      halVal = "Skor: " + serverTotalSkor + "/" + maxScore;
      predikatVal = statusKelulusan + " (" + serverTotalSkor + ")";
      detailTasmiJson = JSON.stringify(sanitizedDetail);
    }

    const idSetoran = "SET-" + new Date().getTime();
    const rowObj = {
      "ID_Setoran": idSetoran,
      "ID_Santri": dataSetoran.santriId,
      "ID_Ustadz": auth.data.id,
      "Tingkatan": isTasmi ? "Al-Qur'an" : (dataSetoran.tingkatan || "Al-Qur'an"),
      "TM": dataSetoran.tm || "-",
      "Jenis": isTasmi ? "Tasmi'" : (dataSetoran.type || "Ziyadah"),
      "Juz": juzVal,
      "Surah": surahVal,
      "SurahNo": surahNoVal,
      "Ayat": ayatVal,
      "Halaman": halVal,
      "Predikat": predikatVal,
      "Catatan": dataSetoran.catatan || "",
      "Tanggal": dataSetoran.date || Utilities.formatDate(new Date(), "Asia/Jakarta", "dd MMM yyyy, HH:mm"),
      "ParafUstadz": dataSetoran.parafUstadz || auth.data.name || "Ustadz Pembimbing",
      "Detail_Tasmi": detailTasmiJson
    };

    const newRow = headers.map(function(h) {
      return sanitizeSpreadsheetCell_(rowObj.hasOwnProperty(h) ? rowObj[h] : "");
    });
    sheet.appendRow(newRow);
    SpreadsheetApp.flush();
    return createResponse(true, { idSetoran: idSetoran }, "Setoran dan penilaian harian berhasil disimpan!");
  });
}

// --- MANAJEMEN KEUANGAN & TAGIHAN SPP (MODUL 2) ---

function createTagihan(token, payloadData) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;

  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data_Tagihan");
    if (!sheet) return createResponse(false, null, "Sheet Data_Tagihan belum ada. Silakan jalankan 'Setup Database'.");

    const target = String(payloadData.targetSantri || payloadData.target || payloadData.idSantri || "").trim();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const santriList = getSheetDataAsObjects("Data_Santri");

    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(20000);
    } catch (e) {
      return createResponse(false, null, "Server sibuk. Silakan coba beberapa saat lagi.");
    }

    try {
      const now = new Date();
      const timeMs = now.getTime();
      let periodeVal = payloadData.periode || "";
      if (!periodeVal && (payloadData.kategori || "").includes("SPP")) {
        periodeVal = parseBulanTahunId_(payloadData.judulTagihan) || Utilities.formatDate(now, "Asia/Jakarta", "yyyy-MM");
      }

      // Mode 1: Generate Massal (misal: SPP Bulanan ke semua santri aktif)
      if (target === 'ALL_ACTIVE') {
        const activeSantris = santriList.filter(s => (s.Status || 'Aktif').toLowerCase() === 'aktif');
        if (activeSantris.length === 0) {
          return createResponse(false, null, "Tidak ada santri aktif untuk diterbitkan tagihan.");
        }

        const newRows = [];
        activeSantris.forEach(function(s, idx) {
          const idTagihan = "INV-" + timeMs + "-" + (idx + 1).toString().padStart(3, '0');
          const rowObj = {
            "ID_Tagihan": idTagihan,
            "ID_Santri": s.ID_Santri,
            "Kategori": payloadData.kategori || "Syahriyah (SPP)",
            "Judul_Tagihan": payloadData.judulTagihan || "Syahriyah (SPP)",
            "Nominal": Number(payloadData.nominal) || 0,
            "Jatuh_Tempo": payloadData.jatuhTempo || "-",
            "Status": "Belum Lunas",
            "Tgl_Bayar": "-",
            "Metode_Bayar": "-",
            "Catatan": payloadData.catatan || "",
            "Timestamp": now,
            "Periode": periodeVal
          };
          newRows.push(headers.map(function(h) { return rowObj.hasOwnProperty(h) ? rowObj[h] : ""; }));
        });

        const startRow = sheet.getLastRow() + 1;
        sheet.getRange(startRow, 1, newRows.length, headers.length).setValues(newRows);
        SpreadsheetApp.flush();
        return createResponse(true, { count: newRows.length }, newRows.length + " tagihan berhasil diterbitkan!");
      } else {
        // Mode 2: Tagihan Individu per santri
        const valid = validateRequired({
          "Santri": target,
          "Judul Tagihan": payloadData.judulTagihan,
          "Nominal": payloadData.nominal
        });
        if (valid) return valid;

        const idTagihan = "INV-" + timeMs + "-" + Math.floor(100 + Math.random() * 900);
        const rowObj = {
          "ID_Tagihan": idTagihan,
          "ID_Santri": target.toUpperCase(),
          "Kategori": payloadData.kategori || "Lainnya",
          "Judul_Tagihan": String(payloadData.judulTagihan).trim(),
          "Nominal": Number(payloadData.nominal) || 0,
          "Jatuh_Tempo": payloadData.jatuhTempo || "-",
          "Status": "Belum Lunas",
          "Tgl_Bayar": "-",
          "Metode_Bayar": "-",
          "Catatan": payloadData.catatan || "",
          "Timestamp": now,
          "Periode": periodeVal
        };

        const newRow = headers.map(function(h) { return rowObj.hasOwnProperty(h) ? rowObj[h] : ""; });
        sheet.appendRow(newRow);
        SpreadsheetApp.flush();
        return createResponse(true, { idTagihan: idTagihan }, "Tagihan berhasil diterbitkan untuk santri.");
      }
    } finally {
      lock.releaseLock();
    }
  });
}

function normalizeSppConfig_(raw) {
  const obj = raw || {};
  const isAktif = obj.aktif !== undefined ? Boolean(obj.aktif) : (obj.otomatis !== undefined ? Boolean(obj.otomatis) : true);
  const tglTerbit = Number(obj.tglTerbit !== undefined ? obj.tglTerbit : obj.hariTerbit) || 1;
  const tglTempo = Number(obj.tglJatuhTempo !== undefined ? obj.tglJatuhTempo : obj.hariTempo) || 10;
  const nominal = Number(obj.nominal) || 200000;
  const kategori = obj.kategori || "Syahriyah (SPP)";
  const catatan = obj.catatan || "SPP Bulanan Santri Mukim";
  return {
    aktif: isAktif,
    otomatis: isAktif,
    tglTerbit: tglTerbit,
    hariTerbit: tglTerbit,
    tglJatuhTempo: tglTempo,
    hariTempo: tglTempo,
    nominal: nominal,
    kategori: kategori,
    catatan: catatan
  };
}

function isSantriAktifForSpp_(s) {
  const st = String((s && s.Status) || "Aktif").trim().toLowerCase();
  return st !== "alumni" && st !== "nonaktif" && st !== "keluar";
}

function getSppConfig(token) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;

  return safeExecute(function() {
    const p = getSheetDataAsObjects("Pengaturan").find(x => x.Key === "Config_SPP");
    if (p && p.Value) {
      try {
        const parsed = normalizeSppConfig_(JSON.parse(p.Value));
        return createResponse(true, parsed, "Konfigurasi SPP berhasil dimuat");
      } catch (err) {}
    }
    let defaultNominal = 200000;
    try {
      const psb = getSheetDataAsObjects("Pengaturan").find(x => x.Key === "Config_PSB");
      if (psb && psb.Value) {
        const parsedPsb = JSON.parse(psb.Value);
        if (parsedPsb.sppBulanan) defaultNominal = Number(parsedPsb.sppBulanan) || 200000;
      }
    } catch(e) {}

    const cfg = normalizeSppConfig_({
      nominal: defaultNominal,
      hariTerbit: 1,
      hariTempo: 10,
      otomatis: true,
      kategori: "Syahriyah (SPP)",
      catatan: "SPP Bulanan Santri Mukim"
    });
    return createResponse(true, cfg, "Konfigurasi SPP default");
  });
}

function saveSppConfig(token, configData) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;

  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pengaturan");
    if (!sheet) return createResponse(false, null, "Sheet Pengaturan tidak ditemukan");

    const data = sheet.getDataRange().getValues();
    const rawObj = typeof configData === "string" ? JSON.parse(configData) : configData;
    const parsedObj = normalizeSppConfig_(rawObj);
    const jsonStr = JSON.stringify(parsedObj);
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === "Config_SPP") {
        sheet.getRange(i + 1, 2).setValue(jsonStr);
        sheet.getRange(i + 1, 3).setValue(new Date());
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow(["Config_SPP", jsonStr, new Date()]);
    }

    if (parsedObj.otomatis) {
      pasangTriggerSpp_();
      // Jika hari ini sudah memasuki/melewati tanggal terbit, langsung terbitkan SPP bulan berjalan
      const today = new Date();
      const dayOfMonth = parseInt(Utilities.formatDate(today, "Asia/Jakarta", "d"), 10);
      if (dayOfMonth >= parsedObj.hariTerbit) {
        const currentPeriode = Utilities.formatDate(today, "Asia/Jakarta", "yyyy-MM");
        terbitkanSppPeriode_(currentPeriode);
      }
    } else {
      hapusTriggerSpp_();
    }

    if (parsedObj.nominal) {
      try {
        for (let i = 1; i < data.length; i++) {
          if (data[i][0] === "Config_PSB") {
            const psbObj = JSON.parse(data[i][1] || "{}");
            psbObj.sppBulanan = Number(parsedObj.nominal) || 200000;
            sheet.getRange(i + 1, 2).setValue(JSON.stringify(psbObj));
            break;
          }
        }
      } catch(e) {}
    }

    SpreadsheetApp.flush();
    return createResponse(true, parsedObj, "Konfigurasi SPP & Otomatisasi berhasil disimpan!");
  });
}

function pasangTriggerSpp_() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    for (let i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === "autoTerbitSppHarian") {
        return;
      }
    }
    ScriptApp.newTrigger("autoTerbitSppHarian")
      .timeBased()
      .everyDays(1)
      .atHour(1)
      .create();
  } catch (err) {
    Logger.log("Gagal memasang trigger SPP: " + err.message);
  }
}

function hapusTriggerSpp_() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    for (let i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === "autoTerbitSppHarian") {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }
  } catch (err) {
    Logger.log("Gagal menghapus trigger SPP: " + err.message);
  }
}

function terbitkanSppPeriode_(periode, opsi) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTagihan = ss.getSheetByName("Data_Tagihan");
  if (!sheetTagihan) return { status: 'error', message: "Sheet Data_Tagihan tidak ditemukan" };

  const targetPeriode = (periode || Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM")).trim();
  const parts = targetPeriode.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const namaBulan = monthNames[month - 1] || "Bulan";

  let sppConfig = normalizeSppConfig_({});
  try {
    const p = getSheetDataAsObjects("Pengaturan").find(x => x.Key === "Config_SPP");
    if (p && p.Value) sppConfig = normalizeSppConfig_(JSON.parse(p.Value));
  } catch(e) {}

  const maxDays = new Date(year, month, 0).getDate();
  const tempoDay = Math.min(Number(sppConfig.hariTempo) || 10, maxDays);
  const jatuhTempoStr = tempoDay + " " + namaBulan + " " + year;
  const judulStr = "Syahriyah (SPP) Bulan " + namaBulan + " " + year;

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (e) {
    return { status: 'error', message: "Server sibuk. Gagal mendapatkan lock." };
  }

  try {
    const headers = sheetTagihan.getRange(1, 1, 1, sheetTagihan.getLastColumn()).getValues()[0];
    const santriList = getSheetDataAsObjects("Data_Santri");
    let activeSantris = santriList.filter(isSantriAktifForSpp_);

    if (opsi && Array.isArray(opsi.hanyaSantriIds) && opsi.hanyaSantriIds.length > 0) {
      const allowedSet = new Set(opsi.hanyaSantriIds.map(id => String(id).trim().toUpperCase()));
      activeSantris = activeSantris.filter(s => allowedSet.has(String(s.ID_Santri).trim().toUpperCase()));
    }

    const allTagihan = getSheetDataAsObjects("Data_Tagihan");
    const alreadyBilledSantriIds = new Set();

    allTagihan.forEach(function(t) {
      const kat = (t.Kategori || "").toLowerCase();
      const jud = (t.Judul_Tagihan || "").toLowerCase();
      const isSpp = kat.includes("spp") || kat.includes("syahriyah") || jud.includes("spp") || jud.includes("syahriyah");
      if (!isSpp) return;

      const per = t.Periode || parseBulanTahunId_(t.Judul_Tagihan);
      if (per === targetPeriode || jud.includes(namaBulan.toLowerCase() + " " + year)) {
        alreadyBilledSantriIds.add(String(t.ID_Santri).trim().toUpperCase());
      }
    });

    const toBillSantris = activeSantris.filter(s => !alreadyBilledSantriIds.has(String(s.ID_Santri).trim().toUpperCase()));
    const dilewatiCount = activeSantris.length - toBillSantris.length;

    if (toBillSantris.length === 0) {
      return {
        status: 'success',
        dibuat: 0,
        dilewati: dilewatiCount,
        periode: targetPeriode,
        message: "Seluruh santri aktif (" + activeSantris.length + " santri) sudah memiliki tagihan SPP untuk periode " + targetPeriode
      };
    }

    const now = new Date();
    const timeMs = now.getTime();
    const newRows = [];

    toBillSantris.forEach(function(s, idx) {
      const idTagihan = "INV-" + timeMs + "-" + (idx + 1).toString().padStart(3, '0');
      const rowObj = {
        "ID_Tagihan": idTagihan,
        "ID_Santri": s.ID_Santri,
        "Kategori": sppConfig.kategori || "Syahriyah (SPP)",
        "Judul_Tagihan": judulStr,
        "Nominal": Number(sppConfig.nominal) || 200000,
        "Jatuh_Tempo": jatuhTempoStr,
        "Status": "Belum Lunas",
        "Tgl_Bayar": "-",
        "Metode_Bayar": "-",
        "Catatan": sppConfig.catatan || "SPP Bulanan Santri Mukim",
        "Timestamp": now,
        "Periode": targetPeriode
      };
      newRows.push(headers.map(function(h) { return rowObj.hasOwnProperty(h) ? rowObj[h] : ""; }));
    });

    const startRow = sheetTagihan.getLastRow() + 1;
    sheetTagihan.getRange(startRow, 1, newRows.length, headers.length).setValues(newRows);
    SpreadsheetApp.flush();

    return {
      status: 'success',
      dibuat: newRows.length,
      dilewati: dilewatiCount,
      periode: targetPeriode,
      message: newRows.length + " tagihan SPP berhasil diterbitkan untuk periode " + namaBulan + " " + year + " (" + dilewatiCount + " santri sudah ditagih sebelumnya)."
    };
  } finally {
    lock.releaseLock();
  }
}

// Fungsi Trigger Harian Otomatis (tanpa token, tidak terdaftar di doPost)
function autoTerbitSppHarian() {
  try {
    const p = getSheetDataAsObjects("Pengaturan").find(x => x.Key === "Config_SPP");
    if (!p || !p.Value) return;
    const cfg = normalizeSppConfig_(JSON.parse(p.Value));
    if (!cfg.otomatis) return;

    const today = new Date();
    const dayOfMonth = parseInt(Utilities.formatDate(today, "Asia/Jakarta", "d"), 10);
    const hariTerbit = parseInt(cfg.hariTerbit, 10) || 1;

    if (dayOfMonth < hariTerbit) return;

    const currentPeriode = Utilities.formatDate(today, "Asia/Jakarta", "yyyy-MM");
    const result = terbitkanSppPeriode_(currentPeriode);
    Logger.log("autoTerbitSppHarian selesai untuk " + currentPeriode + ": " + JSON.stringify(result));
  } catch (err) {
    Logger.log("Error pada autoTerbitSppHarian: " + err.message);
  }
}

function getStatusSpp(token, periode) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;

  return safeExecute(function() {
    const targetPeriode = (periode || Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM")).trim();
    const parts = targetPeriode.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const namaBulan = monthNames[month - 1] || "Bulan";

    let sppConfig = normalizeSppConfig_({});
    try {
      const p = getSheetDataAsObjects("Pengaturan").find(x => x.Key === "Config_SPP");
      if (p && p.Value) sppConfig = normalizeSppConfig_(JSON.parse(p.Value));
    } catch(e) {}

    const santriList = getSheetDataAsObjects("Data_Santri");
    const activeSantris = santriList.filter(isSantriAktifForSpp_);
    const allTagihan = getSheetDataAsObjects("Data_Tagihan");

    const billedMap = new Map();
    allTagihan.forEach(function(t) {
      const kat = (t.Kategori || "").toLowerCase();
      const jud = (t.Judul_Tagihan || "").toLowerCase();
      const isSpp = kat.includes("spp") || kat.includes("syahriyah") || jud.includes("spp") || jud.includes("syahriyah");
      if (!isSpp) return;

      const per = t.Periode || parseBulanTahunId_(t.Judul_Tagihan);
      if (per === targetPeriode || jud.includes(namaBulan.toLowerCase() + " " + year)) {
        billedMap.set(String(t.ID_Santri).trim().toUpperCase(), t);
      }
    });

    const sudahDitagihSantris = [];
    const belumDitagihSantris = [];

    activeSantris.forEach(function(s) {
      const cleanId = String(s.ID_Santri).trim().toUpperCase();
      if (billedMap.has(cleanId)) {
        sudahDitagihSantris.push({
          idSantri: s.ID_Santri,
          namaSantri: s.Nama_Santri,
          tagihan: billedMap.get(cleanId)
        });
      } else {
        belumDitagihSantris.push({
          idSantri: s.ID_Santri,
          namaSantri: s.Nama_Santri
        });
      }
    });

    return createResponse(true, {
      periode: targetPeriode,
      namaPeriode: namaBulan + " " + year,
      totalAktif: activeSantris.length,
      totalSantriAktif: activeSantris.length,
      sudahDitagih: sudahDitagihSantris.length,
      santriSudahTerbit: sudahDitagihSantris.length,
      santriBelumTerbit: belumDitagihSantris.length,
      belumDitagih: belumDitagihSantris,
      isLengkap: activeSantris.length === 0 || belumDitagihSantris.length === 0,
      config: sppConfig,
      nominal: Number(sppConfig.nominal) || 200000,
      otomatis: !!sppConfig.otomatis,
      aktif: !!sppConfig.aktif,
      hariTerbit: Number(sppConfig.hariTerbit) || 1,
      tglTerbit: Number(sppConfig.tglTerbit) || 1,
      hariTempo: Number(sppConfig.hariTempo) || 10,
      tglJatuhTempo: Number(sppConfig.tglJatuhTempo) || 10
    }, "Status SPP periode " + targetPeriode);
  });
}

function terbitkanSppSekarang(token, periode) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;

  return safeExecute(function() {
    const res = terbitkanSppPeriode_(periode);
    if (res.status === 'error') {
      return createResponse(false, null, res.message);
    }
    return createResponse(true, res, res.message);
  });
}

function bayarTagihan(token, idTagihan, metodeBayar, catatan) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;

  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data_Tagihan");
    if (!sheet) return createResponse(false, null, "Sheet Data_Tagihan tidak ditemukan.");

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const statusColIdx = headers.indexOf("Status") + 1;
    const tglBayarColIdx = headers.indexOf("Tgl_Bayar") + 1;
    const metodeColIdx = headers.indexOf("Metode_Bayar") + 1;
    const catatanColIdx = headers.indexOf("Catatan") + 1;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toUpperCase() === String(idTagihan).trim().toUpperCase()) {
        const tglStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "dd/MM/yyyy HH:mm");
        if (statusColIdx > 0) sheet.getRange(i + 1, statusColIdx).setValue("Lunas");
        if (tglBayarColIdx > 0) sheet.getRange(i + 1, tglBayarColIdx).setValue(tglStr);
        if (metodeColIdx > 0) sheet.getRange(i + 1, metodeColIdx).setValue(metodeBayar || "Tunai di Kantor TU");
        if (catatan && catatanColIdx > 0) sheet.getRange(i + 1, catatanColIdx).setValue(catatan);
        
        SpreadsheetApp.flush();
        return createResponse(true, null, "Tagihan " + idTagihan + " berhasil ditandai Lunas.");
      }
    }
    return createResponse(false, null, "Tagihan " + idTagihan + " tidak ditemukan.");
  });
}

function batalBayarTagihan(token, idTagihan) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;

  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data_Tagihan");
    if (!sheet) return createResponse(false, null, "Sheet Data_Tagihan tidak ditemukan.");

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const statusColIdx = headers.indexOf("Status") + 1;
    const tglBayarColIdx = headers.indexOf("Tgl_Bayar") + 1;
    const metodeColIdx = headers.indexOf("Metode_Bayar") + 1;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toUpperCase() === String(idTagihan).trim().toUpperCase()) {
        if (statusColIdx > 0) sheet.getRange(i + 1, statusColIdx).setValue("Belum Lunas");
        if (tglBayarColIdx > 0) sheet.getRange(i + 1, tglBayarColIdx).setValue("-");
        if (metodeColIdx > 0) sheet.getRange(i + 1, metodeColIdx).setValue("-");
        SpreadsheetApp.flush();
        return createResponse(true, null, "Status tagihan dikembalikan menjadi Belum Lunas.");
      }
    }
    return createResponse(false, null, "Tagihan tidak ditemukan.");
  });
}

function deleteTagihan(token, idTagihan) {
  return deleteDataGlobal(token, "Data_Tagihan", idTagihan);
}

// --- PENGATURAN SUPERADMIN ---
function updatePondokName(token, newName) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;
  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pengaturan");
    const data = sheet.getDataRange().getValues();
    let found = false;
    for(let i=1; i<data.length; i++){
      if(data[i][0] === "Nama_Pondok"){
        sheet.getRange(i+1, 2).setValue(newName);
        sheet.getRange(i+1, 3).setValue(new Date());
        found = true; break;
      }
    }
    if(!found) sheet.appendRow(["Nama_Pondok", newName, new Date()]);
    SpreadsheetApp.flush();
    return createResponse(true, null, "Nama lembaga berhasil diperbarui.");
  });
}

function updateAdminPassword(token, oldPw, newPw) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;

  if (!newPw || String(newPw).trim().length < 6) {
    return createResponse(false, null, "Password baru harus memiliki panjang minimal 6 karakter.");
  }

  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users_Admin");
    const data = sheet.getDataRange().getValues();
    for(let i=1; i<data.length; i++){
      if(data[i][0] === auth.data.id && data[i][1] === oldPw){
        sheet.getRange(i+1, 2).setValue(newPw);
        SpreadsheetApp.flush();
        logSecurityEvent_("PASSWORD_CHANGED", "Superadmin " + auth.data.id + " berhasil mengubah password.");
        return createResponse(true, null, "Password berhasil diubah.");
      }
    }
    logSecurityEvent_("PASSWORD_CHANGE_FAILED", "Superadmin " + auth.data.id + " gagal mengubah password (password lama salah).");
    return createResponse(false, null, "Password lama salah.");
  });
}
