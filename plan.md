# Rencana Pengembangan (Plan)
# Zadil Quran - Sistem Manajemen Tahfizh & Pantauan Hafalan Al-Qur'an

Dokumen ini memuat peta jalan teknis dan arsitektur menyeluruh untuk membangun sistem manajemen tahfizh Zadil Quran berbasis Cloudflare Pages (Frontend SPA & Edge Proxy Worker) yang terintegrasi dengan Google Sheets sebagai basis data real-time melalui Google Apps Script (GAS).

---

## 1. Arsitektur Sistem & Struktur File Proyek (Opsi 1: Multi-Page HTML & Modular JS/CSS)

```text
ZADIL QURAN/
├── .agents/                    # Rules dan Skills pendukung (Taste Skill & Apps Script)
├── css/
│   └── style.css               # Stylesheet global, animasi, scrollbar & dark mode
├── js/
│   ├── tailwind-config.js      # Konfigurasi tema Tailwind CSS (Maroon #9a2024 & Pine Green #1c6b45)
│   ├── core.js                 # Engine inti: API Client, Auth Guard, Quran DB 114 Surat, PWA & Notifikasi
│   ├── landing.js              # Logika Landing Page, FAQ & Formulir Pendaftaran Online PSB
│   ├── login.js                # Logika Autentikasi Staff/Ustadz & Portal Wali Santri (ZQ-...)
│   ├── admin.js                # Logika Dashboard Superadmin (Buku Induk, Keuangan & SPP, Ustadz, Pengaturan)
│   ├── ustadz.js               # Logika Portal Ustadz (Smart Form Setoran & Riwayat Binaan)
│   └── wali.js                 # Logika Portal Wali Santri 3-in-1 (Tahfizh, SPP & Biaya, Buku Induk)
├── plans/
│   ├── plan-one-stop-pesantren.md # Blueprint Modul 1 (Buku Induk) & Modul 2 (Keuangan SPP)
│   └── plan-mutabaah-harian.md    # Blueprint transformasi buku mutaba'ah harian
├── index.html                  # Halaman Utama (Landing Page Resmi & Form PSB Online)
├── landingpage.html            # Alias/Salinan Halaman Utama Landing Page & PSB Online
├── login.html                  # Halaman Masuk Portal Staff & Wali Santri
├── admin.html                  # Halaman Dashboard Superadmin (Buku Induk, Keuangan, Ustadz, Pengaturan)
├── ustadz.html                 # Halaman Portal Ustadz (Input Setoran Cerdas)
├── wali.html                   # Halaman Portal Wali Santri Mobile-First 3-in-1
├── code.gs                     # Backend Google Apps Script V4.0 (doGet, doPost, Setup & CRUD Engine)
├── config.js                   # Konfigurasi Klien (Endpoint Proxy & Kunci LocalStorage)
├── _worker.js                  # Cloudflare Pages Worker (Reverse Proxy API & Clean Slug Router)
├── _redirects                  # Aturan Clean URL Cloudflare Pages (/admin -> /admin.html, dll.)
├── _routes.json                # Routing Config Cloudflare Pages Functions
├── sw.js                       # Service Worker PWA v2 (Pre-cache Multi-Page HTML, CSS & JS)
├── manifest.json               # Web App Manifest PWA
├── PRD.md                      # Product Requirements Document
├── DESIGN_SISTEM.md            # Desain Sistem, Token Warna, Tipografi & Standar UI
├── plan.md                     # Dokumen Rencana Pengembangan & Eksekusi Teknis
├── wireframes.md               # Visual Wireframe Antarmuka Setiap Layar
├── README.md                   # Panduan Instalasi, Deployment & Penggunaan
├── logo.jpg                    # Logo Resmi Lembaga Zadil Quran
└── .gitignore                  # Filter File Pengabaian Git
```

---

## 2. Struktur Database Google Sheets (V4.0 - One-Stop Platform)

Fungsi `setupDatabase()` di dalam `code.gs` mengotomatisasi pembuatan dan pembaruan non-destruktif 6 lembar kerja (sheets) berikut beserta format kolom dan pewarnaan header:

### 2.1 Sheet `Pengaturan`
Menyimpan konfigurasi identitas pondok/lembaga:
- Kolom A: `Key` (contoh: `Nama_Pondok`)
- Kolom B: `Value` (contoh: `Zadil Quran`)
- Kolom C: `Timestamp` (waktu pencatatan/pembaruan)

### 2.2 Sheet `Users_Admin`
Menyimpan data otentikasi pengurus/superadmin yayasan:
- Kolom A: `Username` (kredensial login, default: `admin`)
- Kolom B: `Password` (kredensial login, default: `admin`)
- Kolom C: `Nama` (nama lengkap pejabat/admin yayasan)
- Kolom D: `Role` (`superadmin`)
- Kolom E: `Timestamp` (waktu pendaftaran akun)

### 2.3 Sheet `Users_Ustadz`
Menyimpan data pembimbing tahfizh:
- Kolom A: `ID_Ustadz` (ID unik berformat `U-XXXXXX`)
- Kolom B: `Username` (kredensial login ustadz)
- Kolom C: `Password` (kredensial login ustadz)
- Kolom D: `Nama` (nama lengkap ustadz pembimbing)
- Kolom E: `Timestamp` (waktu pendaftaran)

### 2.4 Sheet `Data_Santri` (Modul 1 - Buku Induk Santri Lengkap 27 Kolom)
Menyimpan seluruh data Buku Induk Santri sesuai Formulir Pendaftaran Santri Mukim PPTQ Zadil Qur'an:
- `ID_Santri` (ID unik santri berawalan **`ZQ-`**, contoh: `ZQ-2026-X8K9`)
- `Nama_Santri` (nama lengkap sesuai akta kelahiran)
- `Nama_Panggilan` (nama panggilan santri)
- `Jenis_Kelamin` (`Laki-laki (Putra)` / `Perempuan (Putri)`)
- `Tempat_Lahir` & `Tanggal_Lahir` (TTL)
- `Alamat`, `RT`, `RW`, `Desa`, `Kecamatan`, `Kab_Kota`, `Provinsi` (Alamat lengkap rumah)
- `Pendidikan_Terakhir`, `Tahun_Lulus`, `Sekolah_Asal` (Riwayat pendidikan formal)
- `Nama_Ayah`, `Pekerjaan_Ayah`, `Pendidikan_Ayah` (Data Ayah)
- `Nama_Ibu`, `Pekerjaan_Ibu`, `Pendidikan_Ibu` (Data Ibu)
- `Nama_Wali`, `No_HP_Wali` (Kontak utama orang tua/wali santri)
- `ID_Ustadz` (foreign key ke ID ustadz pembimbing)
- `Status` (`Aktif`, `Calon Santri`, `Alumni`, `Cuti`)
- `Timestamp` (waktu pendaftaran)

### 2.5 Sheet `Data_Tagihan` (Modul 2 - Keuangan, Syahriyah SPP & Pendaftaran)
Menyimpan seluruh tagihan keuangan dan status pembayaran santri:
- `ID_Tagihan` (ID unik tagihan berformat `INV-XXXXXX`)
- `ID_Santri` (Relasi ke `ZQ-YYYY-XXXX`)
- `Kategori` (`Syahriyah (SPP)`, `Biaya Pendaftaran`, `Infaq Gedung`, `Lainnya`)
- `Judul_Tagihan` (Contoh: `Syahriyah (SPP) Bulan November 2026` atau `Paket Pendaftaran Santri Baru`)
- `Nominal` (Angka nominal Rupiah, contoh: `200000` atau `1800000`)
- `Jatuh_Tempo` (Tanggal batas pembayaran)
- `Status` (`Belum Lunas` atau `Lunas`)
- `Tgl_Bayar` (Tanggal pelunasan diverifikasi)
- `Metode_Bayar` (`Tunai / Kas Pondok`, `Transfer Bank`, `QRIS`)
- `Catatan` (Rincian atau keterangan pembayaran)
- `Timestamp` (Waktu pembuatan tagihan)

### 2.6 Sheet `Data_Setoran`
Menyimpan seluruh rekaman mutasi setoran hafalan harian:
- Kolom A: `ID_Setoran` (ID unik berformat `SET-timestamp`)
- Kolom B: `ID_Santri` (ID santri yang menyetor)
- Kolom C: `ID_Ustadz` (ID ustadz yang menyimak dan menilai)
- Kolom D: `Jenis` (`Hafalan Baru` atau `Murojaah`)
- Kolom E: `Juz` (Juz 1 sampai 30)
- Kolom F: `Surah` (nama surat Al-Qur'an)
- Kolom G: `SurahNo` (nomor urut surat 1 sampai 114)
- Kolom H: `Ayat` (rentang ayat yang disetor, misal `1 - 25`)
- Kolom I: `Halaman` (halaman mushaf standar Madinah)
- Kolom J: `Predikat` (`Lancar`, `Kurang Lancar`, atau `Ulang`)
- Kolom K: `Catatan` (catatan tajwid, makhraj, atau motivasi)
- Kolom L: `Tanggal` (waktu pencatatan format lokal)

---

## 3. Arsitektur Cloudflare Pages & Reverse Proxy Edge

Koneksi antara frontend di Cloudflare Pages dan Google Apps Script menggunakan skema arsitektur berikut:

```text
[ Browser Client ]
       │
       ▼ (Request: /api dengan payload POST JSON)
[ Cloudflare Pages Edge Server ]
       │
       ▼ (Menjalankan _worker.js)
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. Menerima request /api                                    │
  │ 2. Membaca target APPS_SCRIPT_URL dari _worker.js           │
  │ 3. Forward request dengan redirect: 'follow' (tangani 302)  │
  │ 4. Menambahkan header CORS (Access-Control-Allow-Origin: *) │
  └─────────────────────────────────────────────────────────────┘
       │
       ▼ (HTTP POST payload text/plain)
[ Google Apps Script Web App (/exec) ]
       │
       ▼ (Eksekusi fungsi doGet / doPost)
[ Google Sheets Database ]
```

### Keunggulan Arsitektur:
1. **Frontend Bersih Tanpa Setup API**: Pengguna tidak perlu mengisi URL teknis di halaman login. Seluruh koneksi diarahkan otomatis ke endpoint `/api`.
2. **Bypass CORS & Google Redirect 302**: Mengeliminasi kendala umum pemanggilan Apps Script dari domain luar.
3. **Konfigurasi Terpusat**: Pengelola cukup menempelkan URL Web App pada konstanta `APPS_SCRIPT_URL` di dalam `_worker.js`.

---

## 4. Skema Routing & Clean Slugs SPA

Aplikasi menggunakan router berbasis HTML5 History API (`window.history.pushState` dan event `popstate`) yang didukung fallback di sisi Cloudflare Worker:

| Slug URL | Hak Akses | Deskripsi Tampilan |
| :--- | :--- | :--- |
| `/` atau `/home` | Publik | Landing page utama profil pesantren, 7 syarat pendaftaran, rincian biaya Rp 2.000.000, dan formulir PSB online otomatis (`ZQ-`). |
| `/login` atau `/portal` | Publik | Layar masuk portal Staff atau Wali Santri (menggunakan ID `ZQ-2026-XXXX`). |
| `/admin` atau `/admin/dashboard` | Superadmin | Statistik santri, ustadz, total setoran hafalan, dan total pemasukan keuangan lunas. |
| `/admin/santri` | Superadmin | **Modul 1**: Tabel Buku Induk Santri lengkap, filter status, detail biodata, dan penugasan pembimbing. |
| `/admin/keuangan` atau `/admin/spp` | Superadmin | **Modul 2**: Manajemen Keuangan & Syahriyah (SPP), generator SPP massal, verifikasi lunas, dan WA tagihan. |
| `/admin/ustadz` | Superadmin | Tabel CRUD akun ustadz pembimbing. |
| `/admin/pengaturan` | Superadmin | Pengaturan nama pondok, ganti password, setup database, dan tes API. |
| `/ustadz` atau `/setoran` | Ustadz | Formulir pintar input setoran hafalan ustadz. |
| `/wali` atau `/progres` | Wali Santri | Portal 3-in-1 Wali Santri: **Tab Tahfizh**, **Tab SPP & Biaya**, dan **Tab Buku Induk**. |
| `/menu` | Semua | Pusat pintasan navigasi cepat sesuai hak akses. |

---

## 5. Alur Kerja Aplikasi (Workflows)

### 5.1 Alur Autentikasi & Session Guard
1. Pengguna membuka alamat situs.
2. Router memeriksa apakah terdapat sesi tersimpan di `localStorage`.
3. Jika tidak ada sesi dan pengguna mengakses rute privat, sistem mengarahkan ke `/login`.
4. Pengurus login dengan username dan password, sedangkan wali santri login cukup menggunakan ID unik santri.
5. Setelah verifikasi berhasil, sesi disimpan di `localStorage` dan pengguna diarahkan ke dashboard sesuai perannya.

### 5.2 Alur Input Setoran Cerdas Ustadz
1. Ustadz memilih santri binaan dari TomSelect dropdown.
2. Sistem otomatis membaca riwayat setoran terakhir santri tersebut dan memunculkan tombol pin pintar (*Smart Pin*).
3. Ustadz dapat mengklik "Pakai" pada pin pintar untuk langsung mengisi surat lanjutan, juz, dan halaman secara instan.
4. Ustadz memilih jenis setoran (`Hafalan Baru` atau `Murojaah`).
5. Ustadz menentukan nomor surat, cakupan ayat, halaman, dan predikat kelancaran (`Lancar`, `Kurang Lancar`, `Ulang`).
6. Setoran disimpan ke Google Sheets melalui `/api`.

### 5.3 Alur Pantauan Wali Santri (Mobile-First Experience)
1. Wali santri memasukkan ID Unik anak (contoh: `ST-2026-X8K9`).
2. Sistem mendeteksi role `walisantri` dan menyembunyikan sidebar navigasi desktop pengurus, beralih penuh ke antarmuka aplikasi ponsel (*mobile app viewport* `max-w-md mx-auto`).
3. Sistem memuat profil santri dalam kartu hero gradien Maroon-Hijau (`#9a2024` ke `#1c6b45`), ringkasan 3 metrik (Total, Baru, Muroja'ah), dan linimasa setoran terbaru (diurutkan dari yang paling baru di posisi atas).
4. Wali santri dapat memfilter riwayat berdasarkan jenis setoran (Semua, Baru, Muroja'ah) atau mencari surat Al-Qur'an secara real-time.
5. Wali santri dapat mengklik tombol "Bagikan Capaian ke WhatsApp" untuk membagikan rekap ke keluarga dengan sekali ketuk.
6. Riwayat menampilkan indikator garis status kelancaran, juz, rentang ayat, nomor halaman mushaf, serta gelembung evaluasi tajwid/makhraj dari ustadz.

---

## 6. Rencana Pengujian & Checklist Verifikasi

- [x] Inisialisasi struktur sheet dan format kolom via `setupDatabase()`.
- [x] Penanganan panggilan API melalui `doPost(e)` di `code.gs`.
- [x] Reverse proxy `/api` dan SPA fallback di `_worker.js`.
- [x] Penghapusan tombol setup API dari halaman login (antarmuka bersih).
- [x] Uji navigasi slug URL (`/admin`, `/admin/ustadz`, `/admin/santri`, `/admin/pengaturan`, `/ustadz`, `/wali`).
- [x] Uji persistensi sesi saat halaman di-refresh.
- [x] Pengujian dark mode dan responsivitas layar ponsel.
- [x] Pembuatan dokumen PRD, Desain Sistem, Plan, dan Wireframes.

---

## 7. Rencana Pengembangan Lanjutan: Transformasi Buku Mutaba'ah Fisik

Berdasarkan referensi lembar fisik `Setoran-hafalan.jpg`, sistem direncanakan untuk bertransformasi penuh menyerupai buku mutaba'ah harian santri:

1. **Struktur Data Tambahan**:
   - Kolom `Tingkatan` (Al-Qur'an / Jilid)
   - Kolom `TM` (Tatap Muka / Nomor Sesi Pertemuan)
   - Kolom `Nilai` (Mumtaz / Jayyid / Dhoif)
   - Kolom `ParafUstadz` (Verifikasi Ustadz Pengampu)
2. **3 Pilar Kategori Setoran Harian**:
   - **Ziyadah**: Menambah hafalan baru
   - **Murojaah**: Mengulang hafalan mutqin
   - **Binnadhor**: Membaca Al-Qur'an / Jilid dengan melihat mushaf langsung di depan ustadz
3. **Dokumen Rencana Detail**:
   - Spesifikasi teknis, wireframe ASCII, dan checklist eksekusi lengkap telah didokumentasikan di `plans/plan-mutabaah-harian.md`.
