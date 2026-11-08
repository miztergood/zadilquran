# Product Requirements Document (PRD)
# Zadil Quran - One-Stop Pesantren Platform (Tahfizh, Buku Induk & Keuangan)

## 1. Ringkasan Eksekutif & Visi Produk

Zadil Quran adalah **One-Stop Pesantren Platform (Sistem Informasi Manajemen Pesantren Terpadu)** berbasis arsitektur serverless modern yang dirancang khusus untuk memenuhi kebutuhan operasional Pondok Pesantren Tahfizh Zadil Qur'an Tuban. Aplikasi ini menyatukan:
1. **Modul Buku Induk Santri & PSB Digital 2 Jalur** (sesuai Formulir Pendaftaran Fisik Pondok Pesantren Tahfizh Zadil Qur'an).
2. **Modul Keuangan, Syahriyah (SPP) & Biaya Pendaftaran** (tagihan otomatis, verifikasi bendahara, dan transparansi rekap keuangan di portal wali santri).
3. **Modul Manajemen Tahfizh & Pantauan Setoran Hafalan Al-Qur'an** (workspace ustadz & pantauan real-time orang tua).

Sistem berjalan di atas infrastruktur **Cloudflare Pages** dengan komputasi edge worker (`_worker.js`) dan menggunakan **Google Sheets** sebagai basis data yang dikelola melalui **Google Apps Script** API (`code.gs` V4.0). Pendekatan ini memungkinkan lembaga pendidikan Islam mengoperasikan sistem manajemen pesantren yang andal, cepat, dan berbiaya operasional nol rupiah (Free Tier Friendly).

---

## 2. Profil Pengguna (User Personas)

### 2.1 Superadmin / Pimpinan & Bendahara Pondok
- **Profil**: Pengasuh pondok pesantren, kepala tata usaha, atau bendahara yayasan.
- **Kebutuhan**:
  - Memantau ringkasan total santri aktif, jumlah ustadz, total setoran hafalan, serta total pemasukan keuangan yang sudah lunas secara global.
  - Mengelola **Buku Induk Santri** secara lengkap (biodata sesuai akta, alamat detail RT/RW/Desa/Kecamatan/Kab/Provinsi, riwayat pendidikan, data ayah & ibu lengkap, nomor WhatsApp wali, ustadz pembimbing, dan status santri) dengan kode unik berawalan **`ZQ-`** (contoh: `ZQ-2026-X8K9`).
  - Menerima data santri baru melalui **2 jalur input**: (1) diinput mandiri oleh Wali Santri melalui Formulir PSB Online di beranda web, atau (2) diinput langsung oleh Admin melalui Dashboard Admin.
  - Mengelola **Tagihan Keuangan & Syahriyah (SPP)**: menerbitkan tagihan SPP bulanan secara massal (1-klik untuk seluruh santri aktif), mencatat pembayaran lunas, membatalkan status lunas, dan mengirimkan pengingat tagihan via WhatsApp.

### 2.2 Ustadz Pembimbing Tahfizh
- **Profil**: Guru pengampu halaqah tahfizh yang menyimak langsung setoran hafalan para santri setiap hari.
- **Kebutuhan**:
  - Membuka daftar santri binaan secara terfilter tanpa terganggu data santri halaqah lain.
  - Menginput setoran ayat dengan cepat: memilih surat, juz, ayat awal, ayat akhir, nomor halaman mushaf, dan predikat kelancaran.
  - Memiliki fitur lanjutan otomatis (*Smart Pin*) yang dapat mengingat batas hafalan terakhir santri secara instan.

### 2.3 Wali Santri
- **Profil**: Orang tua santri yang ingin mendaftarkan anaknya serta memantau perkembangan hafalan, profil buku induk, dan status tagihan biaya/SPP dari rumah.
- **Kebutuhan**:
  - Membaca **Syarat Pendaftaran Santri Mukim (7 poin)** dan **Rincian Biaya Pendaftaran (Rp 2.000.000)** secara jelas sebelum mengisi formulir pendaftaran online.
  - Mendapatkan Kode ID Santri (`ZQ-2026-XXXX`) secara otomatis sesaat setelah mengirim formulir pendaftaran online.
  - Mengakses portal pemantauan cukup dengan memasukkan Kode ID Santri (`ZQ-2026-XXXX`) tanpa password rumit.
  - Memiliki **3 Tab Navigasi di Portal Wali Santri**:
    1. **Tab Tahfizh**: Rekap capaian hafalan baru, muroja'ah, dan catatan evaluasi ustadz.
    2. **Tab SPP & Biaya**: Rekapitulasi total tunggakan (Belum Lunas), total yang sudah dibayar (Sudah Lunas), daftar rincian tagihan, serta tombol konfirmasi pembayaran via WhatsApp Bendahara.
    3. **Tab Buku Induk**: Tampilan biodata resmi santri yang tercatat di database pondok.

---

## 3. Sumber Daya & Konfigurasi Sistem

- **Platform Frontend**: Cloudflare Pages (Single Page Application dengan Tailwind CSS, FontAwesome, TomSelect).
- **Edge Gateway**: Cloudflare Pages Worker (`_worker.js`) untuk penanganan reverse proxy `/api` dan fallback routing SPA.
- **Database Backend**: Google Sheets yang dikelola via Google Apps Script (`code.gs`).
- **Repository GitHub**: `https://github.com/miztergood/zadilquran.git`
- **Database Al-Qur'an Terintegrasi**: 114 Surat lengkap dengan informasi jumlah ayat dan nomor juz bawaan aplikasi.

---

## 4. Persyaratan Fungsional (Functional Requirements)

### 4.0 Modul Landing Page, Syarat & Formulir PSB Online (`/`)
1. **Tampilan Utama Publik**: Halaman awal yang muncul pertama kali saat domain situs dibuka.
2. **Syarat Pendaftaran Santri Mukim (7 Poin Resmi)**:
   - Berkomitmen menghafal Al-Qur'an 30 Juz.
   - Mengisi formulir pendaftaran.
   - Menyertakan Foto santri berkopyah (putra) / berkerudung (putri) ukuran 3x4 (3 lembar) saat daftar ulang.
   - Menyertakan Fotokopi Ijazah terakhir, Raport, KK, Akta Kelahiran (masing-masing 2 lembar).
   - Bagi yatim/piatu menyertakan Surat Keterangan Orang Tua Meninggal.
   - Sanggup menaati seluruh tata tertib dan peraturan Pesantren baik santri maupun Wali santri.
   - Diantar langsung oleh Wali Santri.
3. **Rincian Biaya Pendaftaran & Syahriyah (Transparan di Halaman Form)**:
   - **A. Biaya Pendaftaran**: Pendaftaran (`Rp 100.000`), Almari (`Rp 500.000`), Infaq Gedung (`Rp 1.000.000`), Kesehatan (`Rp 100.000`), Kitab & Buku Panduan (`Rp 100.000`) = **Subtotal Rp 1.800.000**.
   - **B. Syahriyah (SPP Bulanan)**: **Rp 200.000 / bulan**.
   - **Total Pembayaran Awal Masuk**: **Rp 2.000.000**.
4. **Formulir PSB Online Terintegrasi Database (`registerCalonSantriOnline`)**:
   - Wali santri mengisi Data Calon Santri (Nama sesuai akta, Panggilan, Gender, TTL, Alamat lengkap RT/RW/Desa/Kec/Kab/Provinsi, Pendidikan terakhir, Tahun lulus, Sekolah asal) dan Data Orang Tua (Nama, Pekerjaan, dan Pendidikan Ayah & Ibu, serta Nomor HP/WA).
   - Saat dikirim, data langsung tersimpan ke sheet `Data_Santri` dengan kode unik **`ZQ-2026-XXXX`** berstatus `Calon Santri`, sekaligus membuat 2 tagihan awal otomatis di `Data_Tagihan` (`Rp 1.800.000` Biaya Pendaftaran & `Rp 200.000` Syahriyah).
   - Pop-up konfirmasi menampilkan Kode ID Santri `ZQ-` beserta tombol kirim WhatsApp ke panitia (`0857-3180-4663`) dan tombol masuk langsung ke Portal Wali Santri.

### 4.1 Modul Autentikasi & Manajemen Sesi
1. **Layar Masuk Ganda (Tabbed Login)**:
   - Tab Pengurus/Ustadz: Input username dan password.
   - Tab Wali Santri: Input ID Unik Santri berformat kode alfanumerik berawalan **`ZQ`** (contoh: `ZQ-2026-X8K9`).
2. **Keamanan Sesi**:
   - Penerbitan token sesi UUID dari Google Apps Script untuk pengurus.
   - Penyimpanan sesi di `localStorage` peramban.

### 4.2 Modul Superadmin (Dashboard, Buku Induk, Keuangan & Ustadz)
1. **Dashboard Statistik Global (`/admin`)**:
   - 4 Kartu Metrik: Total Santri Terdaftar, Total Ustadz Pembimbing, Total Mutasi Setoran, dan Total Kas Masuk (Tagihan Lunas).
2. **Modul 1 - Buku Induk Santri (`/admin/santri`)**:
   - Pencarian multi-kolom dan filter berdasarkan Status Santri (`Aktif`, `Calon Santri`, `Alumni`, `Cuti`).
   - Generator ID Unik Santri otomatis berformat **`ZQ-YYYY-XXXX`** (contoh: `ZQ-2026-A1B2`).
   - Input & Edit Buku Induk lengkap (26 kolom sesuai formulir fisik PPTQ Zadil Qur'an) oleh Admin.
   - Modal Detail Buku Induk (`#modalDetailSantri`) untuk melihat lembar biodata lengkap dan menghubungi WhatsApp Wali Santri dengan sekali klik.
3. **Modul 2 - Keuangan & SPP (`/admin/keuangan`)**:
   - Ringkasan 3 kartu keuangan: Total Pembayaran Lunas, Total Belum Lunas (Piutang), dan Total Tagihan Terbit.
   - Fitur **Generate SPP Massal (`ALL_ACTIVE`)**: Menerbitkan tagihan Syahriyah (`Rp 200.000`) untuk seluruh santri aktif sekaligus.
   - Fitur Buat Tagihan Baru (Individu / Massal) dengan preset otomatis (Syahriyah Rp 200.000 atau Paket Pendaftaran Rp 1.800.000).
   - Verifikasi pembayaran (`Lunas`), pembatalan status lunas, hapus tagihan, dan tombol pengingat tagihan via WhatsApp ke nomor orang tua.
4. **Manajemen Data Ustadz (`/admin/ustadz`) & Pengaturan (`/admin/pengaturan`)**:
   - CRUD akun ustadz pembimbing dan pengaturan identitas pondok serta inisialisasi sheet database non-destruktif (`setupDatabase`).

### 4.3 Modul Workspace Ustadz (`/ustadz`)
1. **Formulir Cerdas Input Setoran**:
   - Pemilihan santri binaan melalui pencarian nama TomSelect.
   - Pengenalan Otomatis (*Smart Pin*) untuk melanjutkan batas hafalan terakhir santri.
   - Pilihan `Hafalan Baru` dan `Muroja'ah`, filter 114 surat & 30 juz, rentang ayat, halaman, predikat (`Lancar`, `Kurang Lancar`, `Ulang`), dan catatan evaluasi.

### 4.4 Modul Portal Wali Santri 3-in-1 (`/wali`)
1. **Desain Mobile-First Native Viewport**:
   - Terpusat rapi dalam kontainer `max-w-md mx-auto` dengan kartu hero bergradien Crimson Maroon (`#9a2024`) ke Pine Green (`#1c6b45`).
2. **Navigasi 3 Tab Terpadu (Segmented Control & Bottom Navigation)**:
   - **Tab 1: Tahfizh**: Ringkasan 3 metrik setoran (Total, Baru, Muroja'ah), tombol bagikan ke WhatsApp, filter riwayat, dan kartu linimasa evaluasi ustadz.
   - **Tab 2: SPP & Biaya**: Kartu rekapitulasi finansial (Total Belum Lunas vs Total Sudah Lunas), badge notifikasi jumlah tunggakan belum dibayar, daftar rincian tagihan (Syahriyah & Pendaftaran), info pembayaran resmi, dan tombol **Konfirmasi Pembayaran via WhatsApp** Bendahara.
   - **Tab 3: Buku Induk**: Kartu profil lengkap santri (NIS/Kode `ZQ-`, TTL, Pendidikan, Alamat Lengkap RT/RW/Desa/Kec/Kab/Prov, serta Data Ayah, Ibu, dan Wali) beserta pengingat penyerahan berkas fisik.

---

## 5. Persyaratan Non-Fungsional (Non-Functional Requirements)

1. **Kecepatan & Responsivitas**:
   - Seluruh aset statis dilayani dari Cloudflare Global CDN dalam hitungan milidetik.
   - Panggilan API ke Google Apps Script di-cache dan diteruskan secara efisien oleh Edge Worker (`_worker.js`).
2. **Kesesuaian Perangkat (Mobile-Friendly & Mobile-First)**:
   - Portal wali santri menerapkan prinsip ketat *mobile-first design* untuk kenyamanan orang tua yang mengakses via smartphone.
   - Antarmuka ustadz dirancang optimal untuk penggunaan tablet dan ponsel pintar saat menyimak di aula halaqah tahfizh.
   - Seluruh elemen sentuh memenuhi standar ergonomis minimum 44 x 44 piksel.
3. **Kenyamanan Visual (Anti-Slop Institutional Palette)**:
   - Menghindari warna neon silau dan hitam pekat murni (`#000000`).
   - Menerapkan palet resmi lembaga: Primary Crimson Maroon (`#9a2024`) dan Secondary Pine Green (`#1c6b45`).
   - Menggunakan logo resmi `logo.jpg` berdimensi bujur sangkar berkualitas tinggi.
   - Mendukung Dark Mode otomatis untuk penggunaan di malam hari setelah salat Maghrib dan Isya.
4. **Keandalan & Ketahanan Data**:
   - Data tersimpan secara permanen di Google Sheets milik yayasan sendiri.
   - Tidak ada ketergantungan pada basis data proprietary yang mengunci data (*no vendor lock-in*).
