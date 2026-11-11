# LOG PENGEMBANGAN, AUDIT KEAMANAN & PENILAIAN TASMI' PPTQ ZADIL QUR'AN TUBAN
**Tanggal**: 11 November 2026 (`111126`)  
**Lembaga**: Pondok Pesantren Tahfizh Zadil Qur'an Tuban (PPT ZAQU)  
**Pengasuh**: Ust. Fariz Mas'udin S.Pd.  
**Legalitas**: Akta Notaris Muntafiah, S.H. M.Kn Nomor AHU-0023909.AH.01.12 Tahun 2020  
**Alamat**: Jl. Raya Penambangan, Ds. Penambangan, Kec. Semanding, Kab. Tuban, Prov. Jawa Timur (62381)  
**Tagline Resmi**: *Membumikan Al-Qur'an, Membangun Peradaban*  
**Domain Live Target**: Cloudflare Pages (`zadilquran.pages.dev`)  
**Repository GitHub**: [https://github.com/miztergood/zadilquran.git](https://github.com/miztergood/zadilquran.git) (Branch `main`)  

---

## 1. Ringkasan Pembaruan Konteks Sistem (09 – 11 November 2026)

Dokumen ini melanjutkan catatan log pengembangan dari [`log-zadil-quran.081126.md`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/logs/log-zadil-quran.081126.md). Sistem kini telah berkembang dari arsitektur awal menjadi aplikasi web **Multi-Page Modular PWA** dengan dukungan penuh manajemen Keuangan/SPP, Kwitansi PDF, Penilaian Tasmi' khusus per halaman, keamanan berstandar OWASP Top 10, dan pengujian otomatis (*Automated Testing*).

### Arsitektur File Terkini:
* **Frontend & Portal Halaman Terpisah**:
  * [`index.html`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/index.html) / [`landingpage.html`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/landingpage.html) & [`js/landing.js`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/js/landing.js) (Profil, Galeri 25 foto kegiatan santri)
  * [`login.html`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/login.html) & [`js/login.js`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/js/login.js) (Split-screen desktop login & token session storage)
  * [`pendaftaran.html`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/pendaftaran.html) (PSB Online dengan biaya dinamis)
  * [`admin.html`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/admin.html) & [`js/admin.js`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/js/admin.js) (Superadmin Dashboard, Buku Induk 27 Kolom, Impor Excel Batch, Keuangan & SPP 12 Bulan)
  * [`ustadz.html`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/ustadz.html) & [`js/ustadz.js`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/js/ustadz.js) (Workspace Ustadz: Input Penilaian Harian & Rubrik Khusus Tasmi')
  * [`wali.html`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/wali.html) & [`js/wali.js`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/js/wali.js) (Portal Wali Mobile-First: Laporan Hafalan, SPP & Kwitansi PDF, Buku Induk)
  * [`js/core.js`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/js/core.js) (Modul bersama: `AppNotify`, `apiCall`, `escapeHtml`, `formatRupiah`, `angkaKeTerbilang`, `cetakKwitansiResmi`, Rubrik & Generator Kartu Tasmi')
* **Edge Router & PWA**:
  * [`_worker.js`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/_worker.js) (Reverse proxy `/api`, clean-URL router, CORS preflight, OWASP security headers)
  * [`sw.js`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/sw.js) (Versi cache saat ini: `zadil-quran-pwa-v6`)
* **Backend Database Engine**:
  * [`code.gs`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/code.gs) (Google Apps Script API Gateway, 6 sheets termasuk `Data_Tagihan`, Menu Sheets `onOpen()`, Trigger harian SPP `01:00 WIB`, Hardening OWASP, Validasi Tasmi')
* **Testing Infrastructure**:
  * [`package.json`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/package.json), [`vitest.config.js`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/vitest.config.js), dan direktori [`tests/`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/tests)

---

## 2. Tonggak Implementasi & Perbaikan Utama

### A. Keuangan, Otomasi SPP Bulanan & Kwitansi PDF Resmi (`ef52c6c`, `8ae1233`)
1. **Kwitansi Resmi PDF**: Ketika tagihan diverifikasi `Lunas`, wali santri mendapat tombol **Unduh Kwitansi (PDF)** di dashboard wali (`cetakKwitansiResmi` & `angkaKeTerbilang` di `js/core.js`) berkop resmi PPTQ Zadil Qur'an, nomor kwitansi, nominal, terbilang bahasa Indonesia, serta stempel LUNAS.
2. **Otomasi Penerbitan SPP Bulanan**:
   - Skema konfigurasi `Config_SPP` distandarisasi oleh `normalizeSppConfig_()` agar sinkron antara field `aktif`/`otomatis`, `tglTerbit`/`hariTerbit`, dan `tglJatuhTempo`/`hariTempo`.
   - Saat aturan SPP diaktifkan dan disimpan pada hari yang sudah melewati tanggal terbit (misal tanggal terbit `1`, jatuh tempo `10`), `saveSppConfig` memicu `terbitkanSppPeriode_()` langsung secara idempoten (aman dari tagihan ganda) dan memasang trigger harian `autoTerbitSppHarian` pukul 01:00 WIB.

### B. Kepatuhan Google Apps Script Skill (`a94dd9b`)
Berdasarkan `.agents/skills/google-apps-script/SKILL.md`:
1. **Dokumentasi Header**: Ditambahkan panduan instalasi dan deployment di baris teratas `code.gs`.
2. **Menu Interaktif Google Sheets (`onOpen`)**: Muncul menu **PPTQ Zadil Qur'an** di toolbar Google Sheets (*Setup & Mutakhirkan Database*, *Terbitkan SPP Bulan Berjalan*, *Status Sistem & Otomasi SPP*, *Panduan & Alamat Web App*).
3. **Konsistensi Tulis Instan (`SpreadsheetApp.flush()`)**: Diterapkan pada seluruh 14+ fungsi mutasi data (`setupDatabase`, `savePsbConfig`, `addUstadz`, `editUstadz`, `registerCalonSantriOnline`, `saveSantriData`, `saveSantriBatch`, `deleteDataGlobal`, `saveSetoran`, `createTagihan`, `saveSppConfig`, `terbitkanSppPeriode_`, `bayarTagihan`, `batalBayarTagihan`, `updatePondokName`, `updateAdminPassword`).

### C. Infrastruktur Automated Testing (`0d08a56`)
1. Dipasang framework **Vitest** (`v5.1.0`) berbasis Native ESM untuk Node 22.
2. Konfigurasi di `vitest.config.js` & script `npm test`, `npm run test:watch`, `npm run test:coverage` di `package.json`.
3. Pengujian wajib (*mission-critical*): formatting Rupiah & kalimat terbilang, routing clean-URL Cloudflare Worker, security headers, dan rubrik penilaian Tasmi'.

### D. Self-Security Audit & Hardening Standar OWASP Top 10 (`bee3d77`)
Seluruh 10 poin OWASP Top 10 diverifikasi dan ditambal:
1. **A01 (Broken Access Control & IDOR)**:
   - Login Wali kini menerbitkan token sesi. `fetchWaliData` memvalidasi token serta mencocokkan ID Santri agar wali **hanya bisa membuka data anaknya sendiri** (`IDOR_ATTEMPT` diblokir & dicatat).
   - Eksekusi `setupDatabase` via GET/POST dibatasi dengan token `superadmin` bila tabel `Users_Admin` sudah terisi.
2. **A02 (Security Misconfiguration)**:
   - `_worker.js` menyematkan `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` / `DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, dan `Permissions-Policy`.
3. **A03 (Supply Chain)**: Hasil `npm audit` = **0 vulnerabilities**.
4. **A04 (Cryptographic & Password Policy)**: Validasi panjang password minimal 6 karakter pada `updateAdminPassword` dan `addUstadz`. Semua jalur komunikasi dienkripsi HTTPS TLS.
5. **A05 (Injection: XSS & Formula Injection)**:
   - Sanitasi Spreadsheet Formula Injection `sanitizeSpreadsheetCell_()` di `code.gs` (menghalau awalan `=`, `+`, `-`, `@`, `\t`, `\r` sebelum masuk Sheets).
   - Helper `escapeHtml()` di `js/core.js` untuk mencegah Stored XSS pada render HTML dinamis.
6. **A06 (Insecure Design)**: Harga PSB/SPP & kalkulasi skor kelulusan Tasmi' dikunci dan dihitung ulang di sisi backend (`code.gs`).
7. **A07 (Authentication Failures)**:
   - **Rate Limiting** via `CacheService` di `loginUser`: 5x gagal login berturut-turut memblokir akun sementara selama 15 menit (`900 detik`).
   - **Session Timeout (TTL)**: Token sesi berlaku **24 jam** (`expiresAt`) dan dibersihkan otomatis saat kedaluwarsa.
8. **A09 (Security Logging)**: Penambahan `logSecurityEvent_()` untuk merekam kegagalan login, blokir brute-force, percobaan IDOR, dan perubahan password tanpa menyimpan password plaintext ke log.

---

## 3. Rencana & Implementasi Penilaian Khusus Tasmi' (`57e354e`, `6a97341`, `1d9ef25`)

Mengacu pada rubrik cetak resmi Pesantren ([`kartu setoran tasmi 1.jpeg`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/kartu%20setoran%20tasmi%201.jpeg) & [`kartu setoran tasmi 2.jpeg`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/kartu%20setoran%20tasmi%202.jpeg)) serta konfirmasi aturan final bersama **Ust. Fariz Mas'udin**:

### A. Aturan Bisnis & Skema Kalkulasi Final:
1. **Struktur Halaman Dinamis per Juz (`getTasmiConfigByJuz`)**:
   - **Juz 1 – 29**: Terdiri dari **20 halaman** dengan pembagian 4 blok **`5, 5, 5, 5`** (*Hal 1–5, 6–10, 11–15, 16–20*). Skor maksimal = `100`.
   - **Khusus Juz 30**: Terdiri dari **23 halaman** dengan pembagian 4 blok **`6, 6, 6, 5`** (*Hal 1–6, 7–12, 13–18, 19–23*). Skor maksimal = `115`.
2. **Skala Skor Kelancaran per Halaman**: Dibatasi ketat pada pilihan **`5, 4, 3, 2`**:
   - **`5`**: Hafalan lancar, tidak diingatkan sama sekali.
   - **`4`**: Hafalan diingatkan 1 sampai 5 kali.
   - **`3`**: Hafalan diingatkan 6 sampai 10 kali.
   - **`2`**: Diingatkan 11 kali lebih sampai menuntun.
3. **Aturan Kelulusan (Opsi A — Murni dari Skor Mentah)**:
   - Berlaku seragam baik untuk Juz 1–29 (maks 100) maupun Juz 30 (maks 115).
   - **Total Skor ≥ 80** &rarr; **`LULUS`**
   - **Total Skor < 80** &rarr; **`TIDAK LULUS (Wajib Mengulang)`**
   - *(Seluruh halaman pada Juz yang dipilih wajib dinilai lengkap sebelum bisa disimpan).*
4. **Penilaian Praktik Tajwid (9 Aspek Nilai Huruf `A, B, C, atau D`)**:
   1. Praktik Makharijul Huruf
   2. Praktik Sifatul Huruf
   3. Praktik Hukum Nun Sukun dan Tanwin
   4. Praktik Mim Mati
   5. Praktik Hukum Mad
   6. Praktik Qalqalah
   7. Praktik Ghunnah
   8. Praktik Tafkhim dan Tarqiq
   9. Praktik Waqaf dan Ibtida'
   *(Nilai Tajwid tercatat sebagai evaluasi deskriptif kualitas bacaan, sedangkan penentu status LULUS/TIDAK LULUS murni dari skor kelancaran ≥ 80).*

### B. Penyimpanan Database Non-Destruktif (`code.gs`):
- Menambahkan kolom **`Detail_Tasmi`** di ujung kanan sheet `Data_Setoran`. Kolom ini otomatis ditambahkan secara aman bila belum ada saat `setupDatabase()` atau `saveSetoran()` dijalankan.
- Menyimpan JSON terstruktur `{ juz, totalPages, maksimalSkor, skorPerHalaman, totalSkor, passingScore: 80, statusKelulusan, tajwid }` serta memvalidasi dan menghitung ulang skor di server (OWASP A06).

### C. Fitur UI & Cetak PDF di Portal Ustadz dan Wali Santri:
- **Portal Ustadz (`ustadz.html` & `js/ustadz.js`)**: Saat tab **🎙️ Tasmi'** dipilih, form harian otomatis berubah menjadi Panel Penilaian Tasmi' dengan tombol tap cepat `[5] [4] [3] [2]`, tombol `⚡ Isi Semua Skor 5`, kalkulator skor real-time, dan pilihan Tajwid `[A] [B] [C] [D]`.
- **Portal Wali Santri (`wali.html`, `js/wali.js`, `js/core.js`)**: Orang tua langsung melihat total skor, status **LULUS / TIDAK LULUS**, rincian per 20/23 halaman & 9 aspek Tajwid lewat popup `tampilkanDetailTasmiModal()`, bagikan WA terstruktur (`shareProgressWa()`), dan tombol **Unduh Kartu Tasmi' (PDF)** (`cetakKartuTasmiResmi()`) yang tata letaknya menyesuaikan kartu cetak fisik pondok dengan tanda tangan **Pengasuh PPT ZAQU (`Ust. Fariz Mas'udin S.Pd.`)** dan **Penguji**.

### D. Standardisasi Redaksi Bahasa Familiar (`1d9ef25`):
Sesuai arahan langsung dari Ust. Fariz Mas'udin agar istilah di aplikasi terasa familiar bagi asatidz dan wali santri:
- *Ikhtibar* &rarr; diganti seluruhnya menjadi **Penilaian** / **Penilaian Tasmi'** / **LULUS TASMI'**.
- *Input Mutaba'ah* &rarr; **Input Penilaian** (*Simpan & Paraf Penilaian*).
- *Mutaba'ah* (di Dashboard Wali, Rekap, Login, & Cetakan PDF) &rarr; **Laporan Hafalan**.
- Istilah *TM (Tatap Muka)*, *Ziyadah*, *Muroja'ah*, *Binnadhor*, dan predikat harian *Mumtaz / Jayyid / Dhoif* **tetap dipertahankan**.

---

## 4. Verifikasi Terakhir & Riwayat Commit Git

### Pengujian Otomatis (`npm test`):
Dijalankan setelah perubahan terakhir dan menghasilkan **100% Lulus (0 Failed)**:
* `tests/worker.test.js` : **3 tests passed** (CORS OPTIONS preflight, clean-URL fallback routing, OWASP security headers).
* `tests/core-helpers.test.js` : **17 tests passed** (`escapeHtml`, `formatRupiah`, `angkaKeTerbilang`, `formatWaNumber`, `getDashboardUrlByRole`).
* `tests/tasmi.test.js` : **15 tests passed** (`getTasmiConfigByJuz` untuk 20 hal & 23 hal 6-6-6-5, kalkulasi skor Juz 1–29 & Juz 30, batas lulus 80 vs 79, validasi skala 5/4/3/2, validasi 9 aspek Tajwid A–D, safe parser `parseDetailTasmi`).
* Total Keseluruhan: **3 test suites, 35 tests passed (320ms)**.

### Riwayat Commit Kunci Terbaru ke `origin/main`:
* `a94dd9b` — `feat(gas): implement google-apps-script skill best practices (header docs, onOpen menu & SpreadsheetApp.flush)`
* `0d08a56` — `test: setup automated testing with vitest and add unit tests for core helpers & worker routing`
* `bee3d77` — `sec: implement OWASP Top 10 security hardening (rate limiting, session TTL, IDOR protection, formula injection sanitization, XSS helper & HTTP security headers)`
* `57e354e` — `feat(tasmi): implement specialized 20-page & 9-tajwid Tasmi assessment rubric (passing score >= 80) + official PDF card across ustadz, wali & GAS`
* `6a97341` — `chore: format wali.js/tasmi.test.js and add tasmi reference assets`
* `1d9ef25` — `feat(tasmi): support Juz 30 23 pages (6,6,6,5) with >=80 passing score and update UI labels to familiar terms`

---

## 5. Checklist Pemeliharaan / Tindakan Pengguna di Produksi
1. **Google Apps Script Deployment**: Salin kode terbaru dari [`code.gs`](file:///d:/1.%20MIZTERGOOD/04%20-%20Keuangan%20dan%20Bisnis/JASA/21.%20ZADIL%20QURAN/code.gs) ke editor Google Apps Script, lalu klik **Deploy > Manage deployments > Edit (Pensil) > New version > Deploy**.
2. **Pembaruan Struktur Sheet (Opsional / Otomatis)**: Di Google Sheets klik menu **PPTQ Zadil Qur'an > ⚙️ Setup & Mutakhirkan Database** (atau otomatis terbuat saat Ustadz menyimpan penilaian Tasmi' pertama).
3. **Deployment Frontend Cloudflare Pages**: Tersinkronisasi otomatis via GitHub branch `main` (`zadilquran.pages.dev`).
4. **Eksekusi Test Sebelum Rilis Berikutnya**: Jalankan `npm test` sebelum melakukan `git push`.

