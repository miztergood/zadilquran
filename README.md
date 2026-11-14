# 📖 Zadil Quran - Sistem Informasi Manajemen Pesantren & Tahfizh Terpadu

Aplikasi web modern berbasis **Cloudflare Pages** (Frontend Multi-Page Modular & Edge Proxy Worker) yang terintegrasi dengan **Google Apps Script & Google Sheets** sebagai Backend Database tanpa server berbayar (*Serverless & 100% Free Tier Friendly*).

Dirancang khusus untuk **Pondok Pesantren Tahfizh Zadil Qur'an (PPT ZAQU) Tuban**, mengintegrasikan Buku Induk Santri 27 kolom, Administrasi Keuangan & SPP Otomatis, Pencatatan Mutaba'ah 4 Pilar (Ziyadah, Muroja'ah, Binnadhor, Tasmi'), Kwitansi Digital Resmi berstandar tata naskah Indonesia, serta Portal Wali Santri real-time.

---

## 🌟 Fitur Utama & Pembaruan Terkini

### 1. Modul Manajemen Tahfizh & Mutaba'ah 4 Pilar
- **4 Pilar Penilaian Mutaba'ah**:
  1. **Ziyadah**: Setoran hafalan ayat/halaman baru.
  2. **Muroja'ah**: Pengulangan hafalan lama untuk menjaga kelancaran (*itqon*).
  3. **Binnadhor**: Pembacaan Al-Qur'an dengan melihat mushaf (*tartil & tajwid*).
  4. **Ujian Tasmi' Digital**: Penilaian ujian sekali duduk berbasis lembar standar:
     - 20 Halaman untuk Juz 1 s.d. 29 (skor maks. 100).
     - 23 Halaman untuk Juz 30 (skor maks. 115).
     - Skor per halaman: `5` (Sangat Lancar), `4` (Lancar), `3` (Cukup), `2` (Kurang).
     - 9 Aspek Praktik Tajwid berstandar huruf A/B/C/D (*Makharijul Huruf*, *Sifatul Huruf*, *Nun Sukun/Tanwin*, *Mim Mati*, *Hukum Mad*, *Qalqalah*, *Ghunnah*, *Tafkhim/Tarqiq*, *Waqaf & Ibtida'*).
     - Ambang batas kelulusan otomatis: minimal **80 poin** (*LULUS / TIDAK LULUS*).
- **Workspace Ustadz Cerdas**:
  - Auto-fill hafalan terakhir (*Smart Pin*).
  - Database lengkap 114 Surat & 30 Juz Al-Qur'an dengan pemetaan ayat dan juz mushaf standar.
  - Buku Rekapitulasi Laporan Hafalan dengan filter santri, rentang waktu, kategori 4 pilar, dan nilai.
  - Cetak Rapor Mutaba'ah Digital & Kartu Hasil Ujian Tasmi'.
  - **Pembersihan Catatan Sistem 1-Klik**: Tombol pembersih otomatis untuk mengosongkan metadata teknis bawaan (`TM: ... | Paraf: ...`) dari database spreadsheet secara massal.

### 2. Modul Keuangan & SPP Bulanan Otomatis
- **Penerbitan SPP Otomatis**: Tagihan diterbitkan setiap tanggal 1 bulan berjalan untuk seluruh santri aktif dengan batas jatuh tempo tanggal 10.
- **Konfigurasi Fleksibel & Penyesuaian Massal**: Pengaturan nominal SPP fleksibel (contoh: Rp 200.000 atau Rp 300.000). Dilengkapi fitur **"Sesuaikan Tagihan Belum Lunas"** (*Sync Nominal*) untuk menyelaraskan nominal tagihan yang belum dibayar tanpa mengganggu data tagihan yang sudah lunas.
- **Matriks Pembayaran 12 Bulan**: Pantauan visual status lunas per santri dari Januari hingga Desember.
- **Verifikasi Pelunasan & Reminder WhatsApp**: Verifikasi instan dengan pencatatan metode bayar (Tunai di Kantor / Transfer Bank) serta pengiriman pesan tagihan/terima kasih via WhatsApp API ke nomor wali santri.

### 3. Generator Kwitansi Resmi Digital (PDF & PNG)
- **Standar Tata Naskah Dinas Indonesia**:
  - Dokumen formal ukuran **A5 Landscape** dengan border ganda institusional Crimson Maroon (`#731417`).
  - Kop Resmi Lembaga, Nomor Kwitansi Unik (`KW-...`), Terbilang Rupiah Otomatis, dan Watermark diagonal `LUNAS`.
  - **Penataan Stempel & Tanda Tangan Saling Tumpuk (*Overlapping*)**: Stempel basah ungu diposisikan di sisi kiri dengan rotasi alami (`-6°`), menimpa/menindih sepertiga sisi kiri tanda tangan bendahara di atas nama resmi **Siti Mei Alvita** (*opacity 0.88 & blending alami*).
  - Mendukung ekspor langsung ke dokumen **Cetak / Simpan PDF** dan unduhan file gambar **PNG resolusi tinggi** (via modul `html2canvas`).
  - Mendukung opsi aset 1 file gabungan (`combined`) rancangan Canva/eksternal.

### 4. Portal Terpadu Wali Santri (Mobile-First 3-in-1)
- **Akses Instan Tanpa Password**: Cukup memasukkan ID Unik Santri (`ZQ-2026-XXXX`). Sistem secara fleksibel mendukung format ID lama (`ST-`) maupun format resmi (`ZQ-`).
- **3 Tab Navigasi Terpadu**:
  1. **Tab Laporan Hafalan**:
     - Kartu ringkasan 4 pilar (Total Setoran, Ziyadah, Muroja'ah, Binnadhor, Tasmi').
     - Feed riwayat setoran harian dengan **Paginasi Dinamis** (6 kartu per halaman, navigasi Sebelumnya/Berikutnya, counter halaman, dan smooth scroll).
     - Gelembung catatan evaluasi ustadz yang bersih (hanya muncul jika ustadz menulis catatan evaluasi murni).
     - Tombol *Bagikan ke WA* dan *Unduh Rapor Mutaba'ah*.
  2. **Tab SPP & Kwitansi**:
     - Rekapitulasi Terkumpul (Lunas) vs Belum Lunas (Tunggakan).
     - Rincian tagihan invoice Syahriyah dan Biaya Masuk.
     - Akses cetak PDF dan unduh gambar PNG Kwitansi Resmi untuk setiap tagihan yang lunas.
     - Tombol konfirmasi pembayaran langsung ke WhatsApp Bendahara Pesantren.
  3. **Tab Buku Induk**: Biodata lengkap santri dan checklist berkas fisik persyaratan.

### 5. Arsitektur Tangguh & Keamanan Data
- **Normalisasi Halaman Cerdas**: Mencegah dobel teks "Hal Hal" pada antarmuka via fungsi `formatHalamanDisplay()` dan `stripHalamanPrefix()`, mendukung rentang halaman ganda (`Hal 568-569`).
- **Resolusi ID Santri Multi-Format**: `findSantriById()`, `isSameSantriId()`, dan `getSantriDisplayName()` yang mentoleransi perbedaan spasi dan format prefiks (`ST-` vs `ZQ-`).
- **Keamanan OWASP & Anti-IDOR**: Pemeriksaan hak akses token bertingkat (*superadmin*, *ustadz*, *walisantri*), isolasi akses data wali hanya untuk ananda sendiri, dan sanitasi XSS di seluruh rendering HTML.
- **Progressive Web App (PWA v16)**: Layanan offline-first dengan Service Worker berdaya simpan lokal lintas platform (Android, iOS, Windows, Mac).

---

## 📁 Struktur Repositori

```text
├── css/
│   └── style.css              # Stylesheet kustom, animasi, & penyesuaian TomSelect
├── js/
│   ├── tailwind-config.js     # Konfigurasi tema Tailwind CSS (#9a2024 & #1c6b45)
│   ├── core.js                # Modul Inti: Auth, Quran DB, Kwitansi, Tasmi', XSS Sanitizer, Helper Normalisasi
│   ├── kwitansi-assets.js     # Aset Digital Resmi: Logo, Tanda Tangan, Stempel, Bendahara Siti Mei Alvita
│   ├── html2canvas.min.js     # Engine renderer ekspor gambar kwitansi PNG client-side
│   ├── landing.js             # Modul Landing Page & Pendaftaran Online PSB
│   ├── login.js               # Modul Layar Masuk Multi-Role (Pengurus & Wali)
│   ├── admin.js               # Modul Superadmin: Buku Induk, Keuangan/SPP, Rekap AI, Asatidz, Pengaturan
│   ├── ustadz.js              # Modul Ustadz: Smart Form, 4 Pilar, Ujian Tasmi', Rekap Mandiri
│   └── wali.js                # Modul Portal Wali: Laporan 4 Pilar, Paginasi, Kwitansi, Biodata
├── tests/
│   ├── core-helpers.test.js   # Pengujian unit sanitasi XSS, normalisasi Hal, clean catatan, & Quran DB
│   ├── kwitansi.test.js       # Pengujian unit kwitansi resmi, overlapping stempel-ttd, & PDF/PNG
│   ├── santri-resolution.test.js # Pengujian unit resolusi fleksibel ID santri (ST- vs ZQ-)
│   ├── spp-sync.test.js       # Pengujian unit sinkronisasi penyesuaian nominal SPP belum lunas
│   ├── tasmi.test.js          # Pengujian unit kalkulasi skor Tasmi' 20/23 hal & 9 aspek tajwid
│   ├── ustadz-rekap-actions.test.js # Pengujian aksi CRUD rekapan dan filter ustadz
│   └── worker.test.js         # Pengujian edge worker routing & CORS proxy
├── assets/
│   ├── stempel.png            # Stempel resmi transparan PNG PPTQ Zadil Qur'an
│   ├── tanda-tangan.png       # Tanda tangan digital transparan PNG Bendahara Pesantren
│   └── icons/                 # Ikon PWA berbagai resolusi (192px, 512px, apple-touch)
├── index.html                 # Router Utama & Beranda Pesantren
├── landingpage.html           # Landing Page Profil & Alur PSB Santri Mukim
├── pendaftaran.html           # Formulir Pendaftaran Calon Santri Baru Online
├── login.html                 # Layar Masuk Autentikasi Pengurus & Portal Wali
├── admin.html                 # Dashboard Manajemen Terpadu Superadmin
├── ustadz.html                # Workspace Ustadz Pembimbing Halaqah
├── wali.html                  # Portal Terpadu Mobile-First Wali Santri
├── _worker.js                 # Cloudflare Pages Functions: Reverse Proxy API & Clean URL Router
├── _redirects                 # Konfigurasi routing Clean URL Cloudflare Pages
├── _routes.json               # Aturan eksekusi Cloudflare Pages Functions
├── sw.js                      # Service Worker PWA (Cache: zadil-quran-pwa-v16)
├── config.js                  # Konfigurasi endpoint & storage key client-side
├── code.gs                    # Backend Google Apps Script V4.0 (2044+ baris, RBAC, DB Sheets, Batch Clean)
├── logo.jpg                   # Logo resmi resolusi tinggi PPTQ Zadil Qur'an
├── PRD.md                     # Product Requirements Document
├── design_system.md           # Panduan Desain Sistem & Standar Estetika
├── wireframes.md              # Sketsa Visual Wireframe Seluruh Antarmuka
└── README.md                  # Dokumentasi & Panduan Repositori
```

---

## 🚀 Panduan Instalasi & Deployment

### Langkah 1: Siapkan Google Sheets & Apps Script (Backend)

1. Buka [Google Sheets](https://sheets.new) baru pada akun Google resmi pesantren/yayasan.
2. Beri nama spreadsheet, contoh: `Database PPTQ Zadil Quran`.
3. Klik menu **Extensions (Ekstensi)** > **Apps Script**.
4. Hapus semua kode bawaan di `Code.gs`, lalu salin seluruh isi file [`code.gs`](./code.gs) ke editor Apps Script.
   *(Pastikan menyeleksi seluruh isi file dengan `Ctrl + A` lalu `Ctrl + C` hingga baris penutup terakhir)*.
5. Inisialisasi Database:
   - Pada dropdown nama fungsi di toolbar atas editor, pilih `setupDatabase`.
   - Klik tombol **Run (Jalankan)**.
   - Berikan izin otorisasi akun Google (*Review Permissions* > Pilih akun > *Advanced* > *Go to Untitled project (unsafe)* > *Allow*).
   - Spreadsheet akan otomatis membuat 6 lembar kerja terstruktur: `Pengaturan`, `Users_Admin`, `Users_Ustadz`, `Data_Santri`, `Data_Setoran`, dan `Data_Tagihan`.
6. Deploy Web App:
   - Klik tombol **Deploy** di sudut kanan atas > **New deployment**.
   - Klik ikon gerigi (Select type) > Pilih **Web app**.
   - Masukkan konfigurasi:
     - **Description**: `Zadil Quran Production Engine`
     - **Execute as**: **`Me (email pemilik sheet)`**
     - **Who has access**: **`Anyone (Siapa saja)`** *(Wajib Anyone agar Cloudflare Worker dapat mengakses API)*.
   - Klik **Deploy**, lalu salin **Web app URL** yang berakhiran `/exec`.

---

### Langkah 2: Hubungkan Backend ke Edge Worker (`_worker.js`)

1. Buka file [`_worker.js`](./_worker.js).
2. Perbarui baris ke-12 dengan URL Web App Deployment Anda:
   ```javascript
   const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```
3. URL backend Google Apps Script kini terlindungi di balik reverse proxy edge Cloudflare, bebas kendala CORS, dan otomatis menangani pengalihan 302 Google Apps Script.

---

### Langkah 3: Deploy ke Cloudflare Pages (Frontend)

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/) > Masuk ke menu **Workers & Pages**.
2. Klik **Create Application** > Pilih tab **Pages** > **Connect to Git**.
3. Pilih repositori GitHub: **`miztergood/zadilquran`**.
4. Pada bagian **Build settings**:
   - **Framework preset**: `None`
   - **Build command**: *(Biarkan kosong)*
   - **Build output directory**: *(Biarkan kosong atau `/`)*
5. Klik **Save and Deploy**.
6. Situs web akan live di alamat subdomain Cloudflare Pages (contoh: `https://zadilquran.pages.dev`).

---

## 🔑 Kredensial Default Awal

| Peran | Username / ID | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Superadmin** | `admin` | `admin` | Dibuat otomatis saat `setupDatabase`. Ubah kata sandi di menu `/admin` > Pengaturan. |
| **Ustadz** | *Didaftarkan Admin* | *Didaftarkan Admin* | Ditambahkan melalui menu `/admin` > Data Ustadz. |
| **Wali Santri** | ID Santri (`ZQ-2026-XXXX`) | *Tanpa Password* | Menggunakan kode ID resmi yang terdaftar di Buku Induk atau hasil formulir PSB. |

---

## 🧪 Pengujian Unit Otomatis (Automated Testing)

Aplikasi dilengkapi suite pengujian unit berbasis **Vitest** untuk menjamin keandalan seluruh fungsi logika:

```bash
# Menjalankan seluruh pengujian unit
npm test

# Menjalankan pengujian dalam mode pantau (watch mode)
npm run test:watch
```

**Status Pengujian (83 Tests Passing 100%)**:
- `tests/core-helpers.test.js`: Validasi sanitasi XSS, database 114 surat/30 juz, konversi angka Arab, normalisasi halaman mushaf (`formatHalamanDisplay`), dan pembersihan catatan sistem otomatis (`cleanCatatan`).
- `tests/kwitansi.test.js`: Validasi dokumen kwitansi resmi, integrasi aset digital, dan tata letak stempel menimpa tanda tangan (*overlapping alignment*).
- `tests/santri-resolution.test.js`: Resolusi ID santri lintas format (`ST-` dan `ZQ-`) serta penanganan spasi.
- `tests/tasmi.test.js`: Validasi kalkulasi skor ujian Tasmi' 20/23 halaman dan 9 aspek tajwid.
- `tests/spp-sync.test.js`: Validasi logika penyesuaian tagihan belum lunas saat aturan nominal SPP diperbarui.
- `tests/ustadz-rekap-actions.test.js`: Pengujian aksi filter dan pencatatan rekapan ustadz.
- `tests/worker.test.js`: Pengujian routing proxy edge Cloudflare Worker dan header CORS.

---

## 📄 Lisensi & Hak Cipta
Hak Cipta © 2026 **Pondok Pesantren Tahfizh Zadil Qur'an Tuban**. Dikembangkan untuk memuliakan para penghafal Al-Qur'an dan memudahkan amanah kepengurusan pesantren.
