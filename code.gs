// ==============================================================================
// SISTEM BACKEND MANAJEMEN TAHFIDZ ZADIL QURAN V3.5 (API GATEWAY & DATABASE ENGINE)
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
      .setTitle('Zadil Quran - Sistem Manajemen Tahfidz')
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

      case 'addSantri':
        result = addSantri(args[0], args[1], args[2], args[3], args[4]);
        break;

      case 'editSantri':
        result = editSantri(args[0], args[1], args[2], args[3], args[4]);
        break;

      case 'deleteDataGlobal':
        result = deleteDataGlobal(args[0], args[1], args[2]);
        break;

      case 'saveSetoran':
        result = saveSetoran(args[0], args[1]);
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
  "Data_Santri": ["ID_Santri", "Nama_Santri", "Nama_Wali", "ID_Ustadz", "Timestamp"],
  "Data_Setoran": ["ID_Setoran", "ID_Santri", "ID_Ustadz", "Jenis", "Juz", "Surah", "SurahNo", "Ayat", "Halaman", "Predikat", "Catatan", "Tanggal"]
};

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Object.keys(SHEET_CONFIG).forEach(function(sheetName) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(SHEET_CONFIG[sheetName]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, SHEET_CONFIG[sheetName].length)
           .setBackground("#9a2024").setFontColor("white").setFontWeight("bold");
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

  return createResponse(true, null, "Database berhasil disiapkan. Refresh aplikasi Anda.");
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
      const santris = getSheetDataAsObjects("Data_Santri");
      user = santris.find(s => s.ID_Santri === username.toUpperCase());
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

// === CUSTOM: LOGIKA BISNIS MANAJEMEN TAHFIDZ ===

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
      setoran: getSheetDataAsObjects("Data_Setoran")
    };
    return createResponse(true, data, "Data berhasil dimuat");
  });
}

function fetchWaliData(idSantri) {
  return safeExecute(function() {
    const p = getSheetDataAsObjects("Pengaturan").find(x => x.Key === "Nama_Pondok");
    const setoran = getSheetDataAsObjects("Data_Setoran").filter(s => s.ID_Santri === idSantri).reverse();
    const santri = getSheetDataAsObjects("Data_Santri").find(s => s.ID_Santri === idSantri);
    const ustadz = getSheetDataAsObjects("Users_Ustadz").find(u => u.ID_Ustadz === (santri ? santri.ID_Ustadz : ""));
    
    return createResponse(true, { 
      appName: p ? p.Value : "Zadil Quran",
      santri: santri, 
      setoran: setoran, 
      ustadz: ustadz 
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

// --- CRUD SANTRI ---
function generateNewSantriId(token) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;
  return safeExecute(function() {
    const year = new Date().getFullYear();
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return createResponse(true, `ST-${year}-${randomStr}`, "ID digenerate");
  });
}

function addSantri(token, idSantri, namaSantri, namaWali, idUstadz) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;
  const valid = validateRequired({ "ID": idSantri, "Nama Santri": namaSantri, "Nama Wali": namaWali });
  if (valid) return valid;

  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data_Santri");
    sheet.appendRow([idSantri, namaSantri, namaWali, idUstadz || "", new Date()]);
    return createResponse(true, null, "Santri berhasil ditambahkan.");
  });
}

function editSantri(token, id, namaSantri, namaWali, idUstadz) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;
  
  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data_Santri");
    const data = sheet.getDataRange().getValues();
    for(let i=1; i<data.length; i++) {
      if(data[i][0] === id) {
        sheet.getRange(i+1, 2).setValue(namaSantri);
        sheet.getRange(i+1, 3).setValue(namaWali);
        sheet.getRange(i+1, 4).setValue(idUstadz || "");
        return createResponse(true, null, "Data Santri berhasil diperbarui.");
      }
    }
    return createResponse(false, null, "Santri tidak ditemukan.");
  });
}

// --- DELETE GLOBAL ---
function deleteDataGlobal(token, sheetName, id) {
  const auth = checkRole(token, ["superadmin"]);
  if (auth.status === "error") return auth;
  
  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();
    for(let i=1; i<data.length; i++) {
      if(data[i][0] === id) {
        sheet.deleteRow(i+1);
        return createResponse(true, null, "Data berhasil dihapus.");
      }
    }
    return createResponse(false, null, "Data tidak ditemukan.");
  });
}

// --- INPUT SETORAN ---
function saveSetoran(token, dataSetoran) {
  const auth = checkRole(token, ["ustadz"]);
  if (auth.status === "error") return auth;

  return safeExecute(function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data_Setoran");
    const idSetoran = "SET-" + new Date().getTime();
    sheet.appendRow([
      idSetoran, dataSetoran.santriId, auth.data.id, dataSetoran.type, 
      dataSetoran.juz, dataSetoran.surah, dataSetoran.surahNo, dataSetoran.ayat, 
      dataSetoran.halaman || "-", dataSetoran.predikat, dataSetoran.catatan || "", dataSetoran.date
    ]);
    return createResponse(true, null, "Setoran hafalan berhasil disimpan!");
  });
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
