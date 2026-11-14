# Product Requirements Document (PRD)
# Zadil Quran - One-Stop Pesantren Platform (Tahfizh, Buku Induk, Keuangan & Kwitansi Resmi)

## 1. Ringkasan Eksekutif & Visi Produk

Zadil Quran adalah **One-Stop Pesantren Platform (Sistem Informasi Manajemen Pesantren Terpadu)** berbasis arsitektur serverless modern yang dirancang khusus untuk memenuhi kebutuhan operasional Pondok Pesantren Tahfizh Zadil Qur'an Tuban. Aplikasi ini menyatukan:
1. **Modul Buku Induk Santri & PSB Digital 2 Jalur** (sesuai Formulir Pendaftaran Fisik 27 kolom PPTQ Zadil Qur'an).
2. **Modul Keuangan, Syahriyah (SPP) & Biaya Pendaftaran** (otomasi penerbitan tanggal 1, sinkronisasi aturan SPP, verifikasi pelunasan bendahara, dan matriks 12 bulan).
3. **Generator Kwitansi Resmi Digital Berstandar Nasional** (cetak PDF & unduh PNG dengan tata naskah resmi, terbilang otomatis, dan stempel basah saling tumpuk di atas tanda tangan bendahara).
4. **Modul Mutaba'ah 4 Pilar & Ujian Tasmi' Digital** (Ziyadah, Muroja'ah, Binnadhor, dan Ujian Tasmi' berbasis lembar penilaian 20/23 halaman dan 9 aspek praktik tajwid).
5. **Portal Terpadu Wali Santri (Mobile-First 3-in-1)** (pemantauan capaian hafalan berpaginasi, status tagihan & kwitansi resmi, dan profil biodata santri).

Sistem berjalan di atas infrastruktur **Cloudflare Pages** dengan edge worker reverse proxy (`_worker.js`) dan menggunakan **Google Sheets** sebagai basis data yang dikelola melalui **Google Apps Script** API (`code.gs` V4.0). Pendekatan ini memungkinkan lembaga mengoperasikan sistem manajemen pesantren yang andal, aman, cepat, dan berbiaya operasional nol rupiah (*Serverless & Free Tier Friendly*).

---

## 2. Profil Pengguna (User Personas)

### 2.1 Superadmin / Pimpinan & Bendahara Pondok
- **Profil**: Pengasuh pondok pesantren, kepala tata usaha, atau bendahara yayasan.
- **Kebutuhan**:
  - Memantau ringkasan total santri aktif, jumlah ustadz, mutasi setoran hafalan, serta total kas masuk secara global.
  - Mengelola **Buku Induk Santri** secara lengkap (27 kolom sesuai akta, alamat detail, riwayat sekolah, data ayah & ibu, WhatsApp wali, ustadz pembimbing, dan status santri) dengan kode unik berawalan **`ZQ-`** (contoh: `ZQ-2026-X8K9`).
  - Menerima data santri baru melalui **2 jalur**: (1) diinput mandiri oleh Wali Santri via Formulir PSB Online, atau (2) diinput langsung oleh Admin di dashboard.
  - Mengelola **Tagihan Keuangan & SPP**: penerbitan otomatis tanggal 1, aturan nominal fleksibel (misal: Rp 200.000 atau Rp 300.000), penyesuaian tagihan belum lunas (*Sync Nominal SPP*), verifikasi lunas, dan penerbitan kwitansi resmi.
  - Memantau rekapan tahfizh santri dan mengimpor data massal via AI Markdown Import.

### 2.2 Ustadz Pembimbing Tahfizh
- **Profil**: Guru pengampu halaqah tahfizh yang menyimak setoran harian dan menguji hafalan santri.
- **Kebutuhan**:
  - Membuka daftar santri binaan secara terfilter per halaqah.
  - Menginput setoran harian 4 pilar (*Ziyadah, Muroja'ah, Binnadhor, Tasmi'*) dengan fitur *Smart Pin* (ingat hafalan terakhir).
  - Melakukan penilaian **Ujian Tasmi' Digital Sekali Duduk**: memberi skor halaman (5, 4, 3, 2) untuk 20 atau 23 halaman serta menilai 9 aspek praktik tajwid (A, B, C, D) dengan status kelulusan instan.
  - Membuka Buku Rekapitulasi Laporan Hafalan dengan kolom catatan ustadz yang bersih, tombol pembersih catatan sistem 1-klik, dan cetak rapor mutaba'ah.

### 2.3 Wali Santri
- **Profil**: Orang tua santri yang ingin mendaftarkan anaknya dan memantau perkembangan hafalan serta tagihan dari rumah.
- **Kebutuhan**:
  - Membaca syarat pendaftaran mukim dan rincian biaya pendaftaran secara transparan.
  - Mendapatkan Kode ID Santri (`ZQ-2026-XXXX`) otomatis sesaat setelah mendaftar online.
  - Mengakses portal pemantauan cukup dengan memasukkan Kode ID Santri tanpa kata sandi rumit.
  - Memantau riwayat setoran hafalan harian yang teratur dengan sistem paginasi mobile (6 kartu per halaman).
  - Melihat rincian tagihan, mencetak/mengunduh Kwitansi Resmi Pembayaran berstempel sah, dan konfirmasi bayar via WhatsApp Bendahara.

---

## 3. Sumber Daya & Konfigurasi Sistem

- **Platform Frontend**: Cloudflare Pages (Multi-Page Modular HTML5, Tailwind CSS, FontAwesome, TomSelect, html2canvas).
- **Edge Gateway**: Cloudflare Pages Worker (`_worker.js`) untuk penanganan reverse proxy `/api`, header CORS, dan fallback routing SPA.
- **Database Backend**: Google Sheets yang dikelola via Google Apps Script (`code.gs`).
- **Database Al-Qur'an**: 114 Surat lengkap dengan informasi jumlah ayat dan nomor juz bawaan aplikasi.
- **Pejabat Penandatangan Kwitansi**: Bendahara Pesantren (*Siti Mei Alvita*), Kota Penerbit: *Tuban*.
- **PWA Service Worker**: `sw.js` (Cache version: `zadil-quran-pwa-v16`).

---

## 4. Persyaratan Fungsional (Functional Requirements)

### 4.0 Modul Landing Page, Syarat & Formulir PSB Online (`/`, `pendaftaran.html`)
1. **Tampilan Publik & Profil Lembaga**: Menampilkan visi, program unggulan, ekstrakurikuler, dan fasilitas PPTQ Zadil Qur'an Tuban.
2. **Syarat Pendaftaran Santri Mukim (7 Poin Resmi)**:
   - Berkomitmen menghafal Al-Qur'an 30 Juz.
   - Mengisi formulir pendaftaran.
   - Menyertakan Foto santri berkopyah/berkerudung 3x4 (3 lembar) saat daftar ulang.
   - Menyertakan FC Ijazah terakhir, Raport, KK, Akta Kelahiran (masing-masing 2 lembar).
   - Bagi yatim/piatu menyertakan Surat Keterangan Orang Tua Meninggal.
   - Sanggup menaati tata tertib pesantren baik santri maupun wali.
   - Diantar langsung oleh Wali Santri.
3. **Rincian Biaya Pendaftaran & Syahriyah**:
   - Biaya Masuk: Pendaftaran (`Rp 100.000`), Almari (`Rp 500.000`), Infaq Gedung (`Rp 1.000.000`), Kesehatan (`Rp 100.000`), Kitab/Panduan (`Rp 100.000`) = Subtotal Rp 1.800.000.
   - Syahriyah (SPP): Rp 200.000 / bulan. Total Awal Masuk: Rp 2.000.000.
4. **Formulir Pendaftaran Online Mandiri**:
   - Merekam data santri dan orang tua lengkap, menerbitkan ID Unik `ZQ-2026-XXXX`, otomatis membuat 2 tagihan awal di database, dan memunculkan tombol konfirmasi WhatsApp panitia.

### 4.1 Modul Autentikasi & Manajemen Sesi (`login.html`)
1. **Layar Masuk Ganda (Tabbed Login)**:
   - Tab Pengurus / Ustadz: Autentikasi username dan password terenkripsi token sesi.
   - Tab Wali Santri: Autentikasi nomor ID Santri (`ZQ-2026-XXXX` atau `ST-2026-XXXX`) tanpa password.
2. **Keamanan Sesi & Hak Akses**:
   - Token bearer divalidasi di backend Google Apps Script.
   - Pencegahan IDOR (*Insecure Direct Object Reference*): Wali santri dibatasi hanya dapat mengakses rekapan santri miliknya sendiri.

### 4.2 Modul Superadmin (`admin.html`)
1. **Dashboard Statistik Global**: 4 Kartu metrik (Santri, Asatidz, Setoran, Kas Masuk) dan ringkasan aktivitas terbaru.
2. **Buku Induk Santri (27 Kolom)**:
   - Pencarian multi-kolom, filter status santri (*Aktif, Calon Santri, Alumni, Cuti*), generator ID otomatis `ZQ-`, modal detail lengkap, dan penugasan ustadz pembimbing halaqah.
3. **Manajemen Keuangan & SPP Bulanan**:
   - Penerbitan otomatis tagihan SPP setiap tanggal 1 (jatuh tempo tanggal 10).
   - Konfigurasi nominal SPP dinamis (Rp 200.000, Rp 300.000, dll.).
   - Tombol **"Sesuaikan Tagihan Belum Lunas"** (*Sync Nominal SPP*) untuk memperbarui tagihan aktif yang belum lunas sesuai aturan terbaru tanpa mengubah data tagihan yang sudah lunas.
   - Matriks Pembayaran SPP 12 Bulan (Januari s.d. Desember) dengan indikator lunas/belum.
   - Verifikasi pelunasan pembayaran dan reminder tagihan WhatsApp.
4. **Generator Kwitansi Resmi Digital (PDF & PNG)**:
   - Tombol cetak PDF dan unduh gambar PNG pada setiap tagihan yang lunas.
5. **Rekap Tahfizh AI Markdown Import & Pembersihan Massal**:
   - Parsing berkas `.md` transkripsi fisik menjadi data setoran terstruktur.
   - Tombol **"Bersihkan Catatan Sistem"** untuk mengosongkan metadata teknis bawaan dari spreadsheet secara massal.

### 4.3 Modul Workspace Ustadz (`ustadz.html`)
1. **Formulir Cerdas Mutaba'ah 4 Pilar**:
   - Pemilihan santri halaqah via TomSelect.
   - Fitur *Smart Pin* otomatis mengingat ayat/surat/halaman terakhir.
   - Pilihan pilar: *Ziyadah*, *Muroja'ah*, *Binnadhor*, dan *Tasmi'*.
2. **Panel Penilaian Ujian Tasmi' Digital**:
   - Penilaian interaktif per halaman (skor 5, 4, 3, 2).
   - Penilaian 9 aspek praktik tajwid (A, B, C, D).
   - Kalkulasi kelulusan otomatis (minimum 80 poin).
   - Penerbitan Kartu Hasil Tasmi' Digital.
3. **Buku Rekapitulasi Laporan Hafalan**:
   - Tabel riwayat setoran halaqah dengan kolom catatan evaluasi yang bersih (bebas teks metadata teknis).
   - Tombol **"Bersihkan Catatan Sistem"** (ikon sapu) untuk membersihkan database spreadsheet.
   - Fitur edit dan hapus catatan setoran.
   - Cetak Rapor Mutaba'ah Digital.

### 4.4 Modul Portal Wali Santri (`wali.html`)
1. **Desain Mobile-First 3-in-1**:
   - Kartu profil santri bergradien dengan info capaian dan tombol salin ID.
2. **Tab 1: Laporan Hafalan Harian (Paginasi)**:
   - Ringkasan metrik 4 pilar (Total, Ziyadah, Muroja'ah, Binnadhor, Tasmi').
   - Daftar riwayat hafalan dengan **Paginasi Dinamis** (maksimal 6 kartu per halaman, tombol Sebelumnya/Berikutnya, counter halaman aktif, auto-scroll).
   - Gelembung catatan ustadz hijau hanya tampil jika terdapat evaluasi murni.
   - Tombol bagikan ringkasan progres ke WhatsApp.
3. **Tab 2: SPP & Kwitansi Resmi**:
   - Rekapitulasi finansial (Terkumpul vs Tunggakan).
   - Daftar invoice tagihan beserta tombol unduh **Kwitansi Resmi (PDF & PNG)** untuk setiap pembayaran lunas.
   - Tombol konfirmasi pembayaran WhatsApp ke Bendahara.
4. **Tab 3: Buku Induk**:
   - Lembar biodata resmi santri dan daftar kelengkapan berkas fisik.

---

## 5. Standar Dokumen Kwitansi Resmi Pembayaran

1. **Format Dokumen**: A5 Landscape (210 x 148 mm).
2. **Atribut Legalitas**:
   - Kop Resmi: Nama Yayasan, Akta Notaris Muntafiah, S.H., M.Kn, Nomor SK Kemenkumham, Alamat Tuban.
   - Badge Bukti Pembayaran Sah & Nomor Kwitansi Unik (`KW-...`).
   - Tabel Rincian Pembayaran (Telah Terima Dari, Nama Santri & ID, Terbilang Rupiah, Untuk Pembayaran, Metode Bayar).
   - Badge Nominal Pembayaran Bergaris Putus-Putus Hijau (`Rp XXX.XXX`).
   - Watermark Diagonal: `LUNAS`.
3. **Komposisi Stempel & Tanda Tangan Resmi (*Overlapping Alignment*)**:
   - Stempel basah ungu diposisikan di sisi kiri (`left: 28px`), sedikit miring `-6°`, opacity `0.88`.
   - Tanda tangan hitam bendahara diposisikan di tengah (`left: 84px`), tepat di atas garis nama *Siti Mei Alvita*.
   - Area tumpang tindih (*overlap*) selebar 26 piksel: stempel menimpa sepertiga sisi kiri tanda tangan sesuai kaidah tata naskah dinas resmi di Indonesia.

---

## 6. Persyaratan Non-Fungsional (Non-Functional Requirements)

1. **Performa**: Rendering cepat di bawah 500ms, aset di-cache via Cloudflare Global CDN dan Service Worker v16.
2. **Keandalan Data**: Penyimpanan permanen di Google Sheets yayasan tanpa risiko vendor lock-in.
3. **Kenyamanan Visual**: Bahasa visual anti-slop dengan palet resmi Crimson Maroon (`#9a2024`) dan Pine Green (`#1c6b45`), kontras tinggi, dan dukungan Dark Mode.
4. **Kualitas Kode & Testing**: 83 pengujian unit otomatis Vitest mencakup sanitasi XSS, formula kalkulasi tasmi', resolusi ID santri, kwitansi, dan sinkronisasi SPP.
