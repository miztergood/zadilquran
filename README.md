# 📖 Zadil Quran - Sistem Manajemen Tahfizh & Pantauan Hafalan Al-Qur'an

Aplikasi web modern berbasis **Cloudflare Pages** (Frontend SPA & Edge Proxy Worker) yang terintegrasi dengan **Google Apps Script & Google Sheets** sebagai Backend Database tanpa server berbayar (Serverless & Free Tier Friendly).

---

## 🌟 Fitur Utama

- **Role & Hak Akses Bertingkat**:
  - **Superadmin**: Kelola akun ustadz, kelola data santri & wali, statistik pencapaian hafalan, dan pengaturan identitas lembaga.
  - **Ustadz**: Formulir cerdas pencatatan setoran hafalan baru & muroja'ah santri binaan dengan database 114 Surat & 30 Juz Al-Qur'an serta riwayat setoran real-time.
  - **Wali Santri (Mobile-First)**: Portal khusus orang tua dengan tata letak aplikasi ponsel terpusat (`max-w-md mx-auto`), kartu hero bergradien, ringkasan 3 metrik, tombol satu ketukan bagikan ke WhatsApp, filter pil, dan evaluasi ustadz.
- **Identitas Visual Lembaga**:
  - Warna Utama: Crimson Maroon (`#9a2024`).
  - Warna Sekunder: Pine Green (`#1c6b45`).
  - Logo Resmi: `logo.jpg` (dimensi bujur sangkar resolusi tinggi).
- **Routing URL Slug Bersih (Clean Slugs / SPA Navigation)**:
  - `/login` : Layar autentikasi pengurus/ustadz & wali santri (bersih tanpa setup API).
  - `/admin` atau `/admin/dashboard` : Ringkasan statistik & metrik hafalan pondok.
  - `/admin/ustadz` : Manajemen data akun ustadz pembimbing.
  - `/admin/santri` : Manajemen pendaftaran santri & pembagian kelompok ustadz.
  - `/admin/pengaturan` : Pengaturan nama lembaga, ubah password, dan konfigurasi API Apps Script.
  - `/ustadz` atau `/setoran` : Portal kartu pintar input setoran ustadz.
  - `/wali` atau `/progres` : Portal kartu pantauan wali santri (Mobile-First).
  - `/menu` : Pusat navigasi cepat.
- **Cloudflare Pages Reverse Proxy (`_worker.js`)**:
  - Mengatasi kendala CORS (*Cross-Origin Resource Sharing*) secara otomatis.
  - Menangani pengalihan *HTTP 302 Redirect* khas Google Apps Script secara transparan.
  - Mendukung SPA Fallback Routing sehingga navigasi langsung ke URL slug (`/admin`, `/ustadz`, dll.) tidak mengalami *404 Not Found*.
  - Mengisolasi URL Apps Script di sisi server sehingga antarmuka pengguna depan tetap bersih.
- **Penyimpanan Offline & Session Persistence**:
  - Sesi login tetap tersimpan di `localStorage` saat halaman di-refresh.
  - Dukungan Dark Mode otomatis mengikuti sistem atau pilihan manual.

---

## 📁 Struktur Repositori

```text
├── _worker.js         # Cloudflare Pages Functions: Reverse Proxy & SPA Fallback Router
├── _redirects         # Aturan fallback SPA Cloudflare Pages (/* -> /index.html 200)
├── _routes.json       # Routing config Cloudflare Pages Functions
├── config.js          # Konfigurasi client-side (URL Proxy, default endpoint, keys)
├── code.gs            # Backend Google Apps Script (doGet, doPost, Auth, CRUD & Database Engine)
├── index.html         # Frontend Single Page Application (Tailwind CSS, FontAwesome, TomSelect)
├── logo.jpg           # Logo resmi lembaga bujur sangkar resolusi tinggi
├── PRD.md             # Product Requirements Document
├── DESIGN_SISTEM.md   # Desain sistem & standar estetika anti-slop (design_system.md)
├── plan.md            # Rencana pengembangan & arsitektur teknis
├── wireframes.md      # Sketsa visual wireframe antarmuka seluruh layar
├── .gitignore         # Daftar file yang diabaikan oleh Git
└── README.md          # Dokumentasi lengkap instalasi & panduan deployment
```

---

## 🚀 Panduan Instalasi & Deployment

### Langkah 1: Siapkan Google Sheets & Apps Script (Backend)

1. Buka [Google Sheets](https://sheets.new) baru.
2. Beri nama spreadsheet, misalnya: `Database Zadil Quran`.
3. Klik menu **Extensions (Ekstensi)** > **Apps Script**.
4. Hapus semua kode bawaan di `Code.gs`, lalu salin seluruh isi file [`code.gs`](./code.gs) ke editor Apps Script.
5. Jalankan fungsi inisialisasi awal:
   - Pada dropdown fungsi di atas toolbar editor, pilih fungsi `setupDatabase`.
   - Klik tombol **Run (Jalankan)**.
   - Setujui perizinan akun Google (*Review Permissions* > Pilih akun > *Advanced* > *Go to ... (unsafe)* > *Allow*).
   - Spreadsheet Anda akan otomatis terisi 5 sheet: `Pengaturan`, `Users_Admin`, `Users_Ustadz`, `Data_Santri`, dan `Data_Setoran`.
6. Buat Web App Deployment:
   - Klik tombol biru **Deploy** di kanan atas > **New deployment**.
   - Klik ikon gerigi (Select type) > Pilih **Web app**.
   - Isi konfigurasi:
     - **Description**: `Zadil Quran Production V1`
     - **Execute as**: **`Me (email Anda)`**
     - **Who has access**: **`Anyone (Siapa saja)`** *(PENTING: Jangan pilih Only Myself atau Domain)*.
   - Klik **Deploy**.
   - Salin **Web app URL** yang berakhiran `/exec` (Contoh: `https://script.google.com/macros/s/AKfycb.../exec`).

---

### Langkah 2: Menghubungkan Backend ke `_worker.js`

URL backend Google Apps Script dikelola secara terpusat di sisi server (Edge Worker) sehingga antarmuka login frontend tetap bersih, profesional, dan aman dari konfigurasi teknis:

1. Buka file [`_worker.js`](./_worker.js).
2. Pada baris ke-12, tempelkan URL Web App Deployment Anda pada variabel `APPS_SCRIPT_URL`:
   ```javascript
   // >>> TEMPELKAN URL APPS SCRIPT ANDA DI SINI <<<
   const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```
3. *(Opsional)* Jika Anda mendeploy via Cloudflare Pages Dashboard, Anda juga dapat menyetelnya via **Settings** > **Environment variables** dengan nama `APPS_SCRIPT_URL`.

---

### Langkah 3: Deploy ke Cloudflare Pages (Frontend)

1. Buka dashboard [Cloudflare Dashboard](https://dash.cloudflare.com/) > Masuk ke menu **Workers & Pages**.
2. Klik tombol **Create Application** > Pilih tab **Pages** > **Connect to Git**.
3. Pilih repository GitHub Anda: **`miztergood/zadilquran`**.
4. Pada bagian **Build settings**:
   - **Framework preset**: `None`
   - **Build command**: *(Biarkan kosong)*
   - **Build output directory**: *(Biarkan kosong atau isi `/`)*
5. Klik **Save and Deploy**.
6. Dalam beberapa detik, situs Anda sudah live di subdomain Cloudflare Pages (contoh: `https://zadilquran.pages.dev`).
7. Login awal sebagai Superadmin:
   - **Username**: `admin`
   - **Password**: `admin`
8. Buka menu **Pengaturan** (`/admin/pengaturan`) dan klik tombol **Tes Koneksi API** untuk memverifikasi status backend sudah `Terhubung (Online)`.

---

## 🔑 Kredensial Default Awal

| Peran | Username | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Superadmin** | `admin` | `admin` | Akun dibuat otomatis saat `setupDatabase`. Ubah password di menu Pengaturan. |
| **Ustadz** | *Dibuat oleh admin* | *Dibuat oleh admin* | Ditambahkan melalui menu `/admin/ustadz`. |
| **Wali Santri** | ID Unik Santri (Contoh: `ST-2026-X8K9`) | *Tanpa password* | Menggunakan ID Unik Santri yang terdaftar di `/admin/santri`. |

---

## 🧭 Panduan Rute & Slug URL

Aplikasi ini menggunakan HTML5 History Routing dengan dukungan Cloudflare Worker Fallback:

| Rute URL | Akses Hak | Keterangan Tampilan |
| :--- | :--- | :--- |
| `/` atau `/login` | Publik | Layar masuk portal Staff atau Wali Santri. |
| `/admin` atau `/admin/dashboard` | Superadmin | Statistik santri, ustadz, dan total setoran hafalan. |
| `/admin/ustadz` | Superadmin | Tabel CRUD akun ustadz pembimbing & duplikasi akun. |
| `/admin/santri` | Superadmin | Tabel CRUD data santri & penugasan ustadz pembimbing. |
| `/admin/pengaturan` | Superadmin | Konfigurasi nama pondok, password admin, dan endpoint Apps Script. |
| `/ustadz` atau `/setoran` | Ustadz | Formulir pintar pencatatan setoran ayat & riwayat setoran. |
| `/wali` atau `/progres` | Wali Santri | Rekapitulasi progres hafalan anak & riwayat setoran. |
| `/menu` | Semua | Pintasan navigasi cepat sesuai peran pengguna. |

---

## 🛠️ Pengembangan Lokal

Jika ingin menguji coba secara lokal:
1. Clone repositori:
   ```bash
   git clone https://github.com/miztergood/zadilquran.git
   cd zadilquran
   ```
2. Anda dapat menggunakan Cloudflare Wrangler untuk menguji Worker & aset statis secara lokal:
   ```bash
   npx wrangler pages dev .
   ```
3. Atau buka file `index.html` menggunakan Live Server / server HTTP lokal, lalu atur URL backend di form konfigurasi.

---

## 📄 Lisensi
Hak Cipta © 2026 Zadil Quran. Dikembangkan untuk kemudahan manajemen hafalan pondok pesantren dan rumah tahfizh.
