// ==============================================================================
// SISTEM BACKEND MANAJEMEN TAHFIZH & PESANTREN ZADIL QURAN V4.0 (API GATEWAY & ENGINE)
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

    if (action === 'setupDatabase') {
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
        result = setupDatabase();
        break;

      case 'getAppBranding':
        result = getAppBranding();
        break;

      case 'loginUser':
        result = loginUser(args[0], args[1], args[2]);
        break;

      case 'fetchAppData':
        result = fetchAppData(args[0]);
        break;

      case 'fetchWaliData':
        result = fetchWaliData(args[0]);
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
  "Data_Setoran": ["ID_Setoran", "ID_Santri", "ID_Ustadz", "Tingkatan", "TM", "Jenis", "Juz", "Surah", "SurahNo", "Ayat", "Halaman", "Predikat", "Catatan", "Tanggal", "ParafUstadz"],
  "Data_Tagihan": ["ID_Tagihan", "ID_Santri", "Kategori", "Judul_Tagihan", "Nominal", "Jatuh_Tempo", "Status", "Tgl_Bayar", "Metode_Bayar", "Catatan", "Timestamp"]
};

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

  return createResponse(true, null, "Database berhasil disiapkan & kolom dimutakhirkan. Refresh aplikasi Anda.");
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

// === BOILERPLATE: AUTH & ROLE PERMISSION ===
function loginUser(username, password, type) {
  return safeExecute(function() {
    let user = null, role = null, name = "", idUser = "";

    if (type === 'staff') {
      const admins = getSheetDataAsObjects("Users_Admin");
      user = admins.find(u => u.Username === username && u.Password === password);
      if (user) { role = "superadmin"; name = user.Nama; idUser = username; }
      
      if (!user) {
        const ustadzs = getSheetDataAsObjects("Users_Ustadz");
        user = ustadzs.find(u => u.Username === username && u.Password === password);
        if (user) { role = "ustadz"; name = user.Nama; idUser = user.ID_Ustadz; }
      }
    } else if (type === 'wali') {
      const cleanUsername = String(username || "").trim().toUpperCase();
      const santris = getSheetDataAsObjects("Data_Santri");
      user = santris.find(s => String(s.ID_Santri || "").trim().toUpperCase() === cleanUsername);
      if (user) return createResponse(true, { role: "walisantri", santri: user, id: user.ID_Santri }, "Login wali berhasil."); 
    }

    if (!user) return createResponse(false, null, "Kredensial tidak ditemukan atau salah.");

    const token = Utilities.getUuid();
    PropertiesService.getScriptProperties().setProperty("session_" + token, JSON.stringify({ id: idUser, role: role, name: name }));
    return createResponse(true, { token: token, role: role, name: name, id: idUser }, "Login berhasil.");
  });
}

function checkRole(token, allowedRoles) {
  const raw = PropertiesService.getScriptProperties().getProperty("session_" + token);
  if(!raw) return createResponse(false, null, "Sesi kedaluwarsa.");
  const session = JSON.parse(raw);
  if (allowedRoles.indexOf(session.role) === -1) return createResponse(false, null, "Akses ditolak.");
  return createResponse(true, session, "Akses diizinkan.");
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

function fetchAppData(token) {
  const auth = checkRole(token, ["superadmin", "ustadz"]);
  if (auth.status === "error") return auth;

  return safeExecute(function() {
    const p = getSheetDataAsObjects("Pengaturan").find(x => x.Key === "Nama_Pondok");
    const data = {
      appName: p ? p.Value : "Zadil Quran",
      ustadz: getSheetDataAsObjects("Users_Ustadz").reverse(),
      santri: getSheetDataAsObjects("Data_Santri").reverse(),
      setoran: getSheetDataAsObjects("Data_Setoran"),
      tagihan: getSheetDataAsObjects("Data_Tagihan").reverse()
    };
    return createResponse(true, data, "Data berhasil dimuat");
  });
}

function fetchWaliData(idSantri) {
  return safeExecute(function() {
    const p = getSheetDataAsObjects("Pengaturan").find(x => x.Key === "Nama_Pondok");
    const cleanId = String(idSantri || "").trim().toUpperCase();
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

  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users_Ustadz");
    const newId = "U-" + new Date().getTime().toString().slice(-6);
    sheet.appendRow([newId, username, password, nama, new Date()]);
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

    const newRow = headersSantri.map(function(h) { return rowSantri.hasOwnProperty(h) ? rowSantri[h] : ""; });
    sheetSantri.appendRow(newRow);

    // Terbitkan Otomatis Tagihan Biaya Masuk & Syahriyah Pertama di Data_Tagihan
    const sheetTagihan = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data_Tagihan");
    if (sheetTagihan) {
      const headersTagihan = sheetTagihan.getRange(1, 1, 1, Math.max(sheetTagihan.getLastColumn(), 1)).getValues()[0];
      const timePrefix = new Date().getTime().toString().slice(-4);

      // Tagihan 1: Paket Pendaftaran & Fasilitas Santri Mukim (Rp 1.800.000)
      const tagihan1 = {
        "ID_Tagihan": "INV-" + timePrefix + "-001",
        "ID_Santri": newId,
        "Kategori": "Pendaftaran & Fasilitas",
        "Judul_Tagihan": "Biaya Pendaftaran & Fasilitas Santri Mukim",
        "Nominal": 1800000,
        "Jatuh_Tempo": "Saat Masuk Pondok",
        "Status": "Belum Lunas",
        "Tgl_Bayar": "-",
        "Metode_Bayar": "-",
        "Catatan": "Rincian: Pendaftaran 100rb, Almari 500rb, Infaq Gedung 1jt, Kesehatan 100rb, Kitab 100rb",
        "Timestamp": new Date()
      };
      sheetTagihan.appendRow(headersTagihan.map(function(h) { return tagihan1.hasOwnProperty(h) ? tagihan1[h] : ""; }));

      // Tagihan 2: Syahriyah (SPP) Bulan Pertama (Rp 200.000)
      const tagihan2 = {
        "ID_Tagihan": "INV-" + timePrefix + "-002",
        "ID_Santri": newId,
        "Kategori": "Syahriyah (SPP)",
        "Judul_Tagihan": "Syahriyah (SPP) Bulan Pertama",
        "Nominal": 200000,
        "Jatuh_Tempo": "Saat Masuk Pondok",
        "Status": "Belum Lunas",
        "Tgl_Bayar": "-",
        "Metode_Bayar": "-",
        "Catatan": "Syahriyah Bulanan Standar",
        "Timestamp": new Date()
      };
      sheetTagihan.appendRow(headersTagihan.map(function(h) { return tagihan2.hasOwnProperty(h) ? tagihan2[h] : ""; }));
    }

    return createResponse(true, {
      idSantri: newId,
      namaSantri: rowSantri.Nama_Santri,
      totalBiaya: 2000000,
      rincianBiaya: "Pendaftaran & Fasilitas (Rp 1.800.000) + Syahriyah (Rp 200.000)"
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
          sheet.getRange(existingRowIndex, colIdx + 1).setValue(rowObj[headerName]);
        }
      });
      return createResponse(true, null, "Data Buku Induk Santri berhasil diperbarui.");
    } else {
      const newRow = headers.map(function(h) {
        return rowObj.hasOwnProperty(h) ? rowObj[h] : "";
      });
      sheet.appendRow(newRow);
      return createResponse(true, null, "Santri baru berhasil didaftarkan ke Buku Induk.");
    }
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

    const idSetoran = "SET-" + new Date().getTime();
    const rowObj = {
      "ID_Setoran": idSetoran,
      "ID_Santri": dataSetoran.santriId,
      "ID_Ustadz": auth.data.id,
      "Tingkatan": dataSetoran.tingkatan || "Al-Qur'an",
      "TM": dataSetoran.tm || "-",
      "Jenis": dataSetoran.type || "Ziyadah",
      "Juz": dataSetoran.juz || "-",
      "Surah": dataSetoran.surah || "-",
      "SurahNo": dataSetoran.surahNo || "",
      "Ayat": dataSetoran.ayat || "-",
      "Halaman": dataSetoran.halaman || "-",
      "Predikat": dataSetoran.predikat || "Mumtaz",
      "Catatan": dataSetoran.catatan || "",
      "Tanggal": dataSetoran.date || Utilities.formatDate(new Date(), "Asia/Jakarta", "dd MMM yyyy, HH:mm"),
      "ParafUstadz": dataSetoran.parafUstadz || auth.data.name || "Ustadz Pembimbing"
    };

    const newRow = headers.map(function(h) {
      return rowObj.hasOwnProperty(h) ? rowObj[h] : "";
    });
    sheet.appendRow(newRow);
    return createResponse(true, { idSetoran: idSetoran }, "Setoran mutaba'ah harian berhasil disimpan!");
  });
}

// --- MANAJEMEN KEUANGAN & TAGIHAN SPP (MODUL 2) ---

function createTagihan(token, payloadData) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;

  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data_Tagihan");
    if (!sheet) return createResponse(false, null, "Sheet Data_Tagihan belum ada. Silakan jalankan 'Setup Database'.");

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const santriList = getSheetDataAsObjects("Data_Santri");

    // Mode 1: Generate Massal (misal: SPP Bulanan ke semua santri aktif)
    if (payloadData.target === 'ALL_ACTIVE' || payloadData.idSantri === 'ALL_ACTIVE') {
      const activeSantris = santriList.filter(s => (s.Status || 'Aktif').toLowerCase() === 'aktif');
      if (activeSantris.length === 0) {
        return createResponse(false, null, "Tidak ada santri aktif untuk diterbitkan tagihan.");
      }

      let count = 0;
      const timePrefix = new Date().getTime().toString().slice(-4);
      activeSantris.forEach(function(s, idx) {
        const idTagihan = "INV-" + timePrefix + "-" + (idx + 1).toString().padStart(3, '0');
        const rowObj = {
          "ID_Tagihan": idTagihan,
          "ID_Santri": s.ID_Santri,
          "Kategori": payloadData.kategori || "SPP Bulanan",
          "Judul_Tagihan": payloadData.judulTagihan || "SPP Bulanan",
          "Nominal": Number(payloadData.nominal) || 0,
          "Jatuh_Tempo": payloadData.jatuhTempo || "-",
          "Status": "Belum Lunas",
          "Tgl_Bayar": "-",
          "Metode_Bayar": "-",
          "Catatan": payloadData.catatan || "",
          "Timestamp": new Date()
        };

        const newRow = headers.map(function(h) { return rowObj.hasOwnProperty(h) ? rowObj[h] : ""; });
        sheet.appendRow(newRow);
        count++;
      });

      return createResponse(true, { count: count }, count + " tagihan SPP massal berhasil diterbitkan!");
    } else {
      // Mode 2: Tagihan Individu per santri
      const valid = validateRequired({
        "Santri": payloadData.idSantri,
        "Judul Tagihan": payloadData.judulTagihan,
        "Nominal": payloadData.nominal
      });
      if (valid) return valid;

      const idTagihan = "INV-" + new Date().getTime().toString().slice(-6);
      const rowObj = {
        "ID_Tagihan": idTagihan,
        "ID_Santri": String(payloadData.idSantri).trim().toUpperCase(),
        "Kategori": payloadData.kategori || "Lainnya",
        "Judul_Tagihan": String(payloadData.judulTagihan).trim(),
        "Nominal": Number(payloadData.nominal) || 0,
        "Jatuh_Tempo": payloadData.jatuhTempo || "-",
        "Status": "Belum Lunas",
        "Tgl_Bayar": "-",
        "Metode_Bayar": "-",
        "Catatan": payloadData.catatan || "",
        "Timestamp": new Date()
      };

      const newRow = headers.map(function(h) { return rowObj.hasOwnProperty(h) ? rowObj[h] : ""; });
      sheet.appendRow(newRow);
      return createResponse(true, { idTagihan: idTagihan }, "Tagihan berhasil diterbitkan untuk santri.");
    }
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
    return createResponse(true, null, "Nama lembaga berhasil diperbarui.");
  });
}

function updateAdminPassword(token, oldPw, newPw) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;
  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users_Admin");
    const data = sheet.getDataRange().getValues();
    for(let i=1; i<data.length; i++){
      if(data[i][0] === auth.data.id && data[i][1] === oldPw){
        sheet.getRange(i+1, 2).setValue(newPw);
        return createResponse(true, null, "Password berhasil diubah.");
      }
    }
    return createResponse(false, null, "Password lama salah.");
  });
}
