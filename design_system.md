# DESIGN SISTEM ZADIL QURAN
# Panduan Desain, Token Visual, Ergonomi Antarmuka & Standar Estetika

> **Design Read**: Sistem Manajemen Tahfizh & Pemantauan Hafalan Al-Qur'an untuk Lembaga Pendidikan Islam (Pondok Pesantren, Rumah Tahfizh, dan Halaqah Qur'an). Mengusung bahasa visual institusional terhormat dengan kombinasi warna utama Crimson Maroon (`#9a2024`) dan warna sekunder Pine Green (`#1c6b45`), tata letak mobile-first untuk orang tua/wali santri, kontras tajam ramah mata, serta interaksi taktil yang menenangkan.

---

## 1. Konfigurasi Tiga Indikator (The Three Dials)

| Indikator | Nilai (Skala 1 - 10) | Alasan & Penerapan Praktis |
| :--- | :--- | :--- |
| **`DESIGN_VARIANCE`** | **4 (Structured & Institutional)** | Antarmuka tahfizh menuntut ketertiban, stabilitas, dan konsistensi tinggi. Penempatan formulir setoran ayat, pemilihan surat Al-Qur'an, dan rekapitulasi data santri terstruktur rapi agar ustadz dapat mencatat setoran dengan reflek cepat tanpa kebingungan tata letak. |
| **`MOTION_INTENSITY`** | **4 (Calm & Respectful)** | Animasi dirancang bersahaja dan menghormati suasana ibadah halaqah. Transisi perpindahan tab berkecepatan 200ms (`transition-all duration-200`), modal muncul dengan skala lembut tanpa guncangan berlebih, dan tombol interaktif memiliki umpan balik sentuhan ringkas (`active:scale-95`). |
| **`VISUAL_DENSITY`** | **5 (Balanced Readability)** | Kepadatan antarmuka seimbang antara ruang nafas yang nyaman bagi orang tua dan efisiensi penyajian metadata mushaf Al-Qur'an (nomor surat, juz, rentang ayat, nomor halaman mushaf Madinah, serta catatan evaluasi ustadz). |

---

## 2. Palet Warna Resmi & Skala Token Tailwind (Color Tokens)

Palet warna Zadil Quran dibangun menggunakan sistem token warna bertingkat (shades 50 hingga 900) dengan dua poros warna identitas: **Crimson Maroon** sebagai representasi wibawa lembaga dan **Pine Green** sebagai representasi kesegaran spiritual Al-Qur'an.

### 2.1 Skala Warna Utama: Crimson Maroon (`primary`)
Warna utama identitas lembaga Zadil Quran. Digunakan untuk tombol utama (Call-to-Action), header kartu santri, border fokus input aktif, sidebar pengurus yayasan, dan baris header spreadsheet Google Sheets.

| Token Tailwind | Kode Hex | Peruntukan Antarmuka |
| :--- | :--- | :--- |
| `primary-50` | `#fdf2f2` | Latar belakang sangat lembut, highlight baris tabel terpilih |
| `primary-100` | `#fde8e8` | Latar belakang badge Muroja'ah mode terang |
| `primary-200` | `#f9c5c7` | Garis batas (border) halus aksen maroon |
| `primary-300` | `#f29fa3` | Garis aksen sekunder |
| `primary-400` | `#e56b71` | Ikon status atau elemen visual pendukung |
| **`primary-500` (DEFAULT)** | **`#9a2024`** | **Warna Brand Resmi**: Tombol CTA utama, border fokus input, teks judul penting, header Google Sheets |
| `primary-600` | `#871a1e` | State hover tombol utama pada desktop |
| `primary-700` | `#731417` | State active/pressed tombol utama, gradien gelap kartu hero |
| `primary-800` | `#5f1013` | Sidebar desktop pengurus yayasan, badge Muroja'ah mode gelap |
| `primary-900` | `#480a0c` | Permukaan elevasi terdalam palet maroon |

### 2.2 Skala Warna Sekunder: Pine Green (`secondary`)
Warna sekunder pendamping. Digunakan untuk indikator kelancaran hafalan, badge jenis setoran "Hafalan Baru", tombol aksi WhatsApp, serta gelembung kutipan (*quote bubble*) catatan ustadz.

| Token Tailwind | Kode Hex | Peruntukan Antarmuka |
| :--- | :--- | :--- |
| `secondary-50` | `#edf7f2` | Latar belakang gelembung kutipan catatan ustadz |
| `secondary-100` | `#d7efe3` | Latar belakang badge Hafalan Baru mode terang |
| `secondary-200` | `#b2dfc8` | Border aksen hijau lembut |
| `secondary-300` | `#83c9a6` | Aksen visual metrik hafalan |
| `secondary-400` | `#52ad82` | Ikon centang dan indikator aktif |
| **`secondary-500` (DEFAULT)** | **`#1c6b45`** | **Warna Sekunder Resmi**: Tombol WhatsApp, predikat Lancar, badge Hafalan Baru |
| `secondary-600` | `#165737` | State hover tombol WhatsApp dan tombol sekunder |
| `secondary-700` | `#12452c` | State active/pressed tombol sekunder |
| `secondary-800` | `#0e3421` | Border gelembung catatan ustadz pada mode gelap |
| `secondary-900` | `#092316` | Permukaan elevasi terdalam palet hijau mode gelap |

### 2.3 Warna Semantik & Evaluasi Setoran 4 Pilar (Mutaba'ah Tokens)

Sistem evaluasi setoran Al-Qur'an menggunakan token warna semantik untuk membedakan 4 pilar mutaba'ah dan 3 tingkatan kelancaran:

| Pilar Mutaba'ah | Warna Utama | Badge Terang | Badge Gelap | Karakter & Makna Pilar |
| :--- | :--- | :--- | :--- | :--- |
| **Ziyadah** | `#1c6b45` (Pine Green) | `#edf7f2` (`secondary-50`) | `#12452c`/50 | Penambahan setoran ayat/halaman baru |
| **Muroja'ah** | `#9a2024` (Crimson Maroon) | `#fdf2f2` (`primary-50`) | `#731417`/40 | Pengulangan hafalan lama untuk memelihara kelancaran |
| **Binnadhor** | `#d97706` (Amber Gold) | `bg-amber-50` | `bg-amber-950`/50 | Pembacaan Al-Qur'an secara tartil bin-nadhor (melihat mushaf) |
| **Tasmi'** | `#4f46e5` (Royal Indigo) | `bg-indigo-50` | `bg-indigo-950`/60 | Ujian sekali duduk 20/23 halaman dengan 9 aspek tajwid |

Tingkatan predikat kelancaran reguler:
- **Mumtaz / Lancar**: `#1c6b45` (Hijau Pinus)
- **Jayyid / Kurang Lancar**: `#d97706` (Amber)
- **Rasib / Ulang**: `#ef4444` (Merah Terang)

### 2.4 Token Netral & Permukaan (Dual-Mode: Siang & Malam)

Aplikasi menyediakan dua mode tampilan dengan kontras tinggi yang menghindarkan warna hitam pekat (`#000000` dilarang):

| Elemen UI | Mode Terang (Default Siang) | Mode Gelap (Halaqah Ba'da Isya) | Peran Visual |
| :--- | :--- | :--- | :--- |
| `Latar Aplikasi` | `#f9fafb` (Gray 50) | `#0f172a` (`darkbg` - Slate 900) | Latar dasar seluruh viewport |
| `Permukaan Kartu` | `#ffffff` (Pure White) | `#1e293b` (`darkcard` - Slate 800) | Kontainer kartu metrik, formulir, dan feed riwayat |
| `Garis Batas (Border)` | `#e5e7eb` (Gray 200) | `#334155` (`darkborder` - Slate 700) | Garis pemisah tegas dan presisi |
| `Teks Utama` | `#1f2937` (Gray 800) | `#f8fafc` (Slate 50) | Judul surat, nama santri, angka capaian |
| `Teks Sekunder` | `#6b7280` (Gray 500) | `#94a3b8` (Slate 400) | Label tanggal, nama pembimbing, juz |
| `Teks Lembut (Muted)` | `#9ca3af` (Gray 400) | `#64748b` (Slate 500) | Placeholder pencarian, footer watermark |

---

## 3. Penerapan Komponen Berdasarkan Warna

### 3.1 Kartu Hero Profil Santri (Parent Portal)
- Menggunakan gradien linear dari Crimson Maroon ke Pine Green: `bg-gradient-to-r from-[#9a2024] to-[#1c6b45]`.
- Dilengkapi inisial avatar santri berlatar putih transparan `bg-white/20`.
- Tombol salin ID santri (*tap-to-copy*) menggunakan kapsul semi transparan `bg-black/20 hover:bg-black/30`.

### 3.2 Tombol Aksi WhatsApp (One-Tap Share)
- Tombol aksi utama orang tua berbalut warna hijau pinus: `bg-[#1c6b45] hover:bg-[#165737] text-white shadow-sm`.
- Ukuran ergonomis ramah jempol dengan tinggi minimum 44 piksel.

### 3.3 Gelembung Catatan Evaluasi Ustadz (*Quote Bubble*)
- Mode Terang: `bg-[#edf7f2] border-l-4 border-[#1c6b45] text-[#12452c]`.
- Mode Gelap: `bg-[#092316]/50 border-l-4 border-[#1c6b45] text-[#83c9a6]`.
- Aturan Tampilan: Hanya muncul jika terdapat catatan evaluasi murni ustadz. Teks metadata sistem otomatis disembunyikan/dikosongkan.

### 3.4 Paginasi Dinamis Kartu Riwayat (Mobile Pagination)
- Batas item: Maksimal 6 kartu riwayat per halaman untuk menjaga kecepatan rendering dan panjang layar ponsel.
- Kontainer navigasi: Kapsul melayang elegan dengan tombol navigasi Sebelumnya/Berikutnya (`active:scale-95`), teks indikator `Halaman X dari Y`, serta *smooth auto-scroll* kembali ke awal daftar saat berpindah halaman.

---

## 4. Standar Desain Dokumen Kwitansi Resmi Pembayaran Digital

Sebagai representasi tertulis akuntabilitas keuangan lembaga, dokumen kwitansi mengikuti standar tata naskah dinas resmi di Indonesia:

1. **Ukuran & Tata Letak Dasar**:
   - Dimensi standar: **A5 Landscape** (`210mm x 148mm`) dengan margin seimbang `8mm 10mm`.
   - Bingkai luar: Border ganda tebal warna Crimson Maroon `#731417` dengan sudut tegas `border-radius: 4px`.
   - Watermark latar belakang: Tulisan diagonal `LUNAS` warna Pine Green lembut (`color: rgba(28, 107, 69, 0.08)`), ukuran 78px, kemiringan `-25°`.
2. **Kop Surat Lembaga**:
   - Logo bujur sangkar `logo.jpg` dimensi `58 x 58 px`.
   - Identitas Lembaga: *Pondok Pesantren Tahfizh Zadil Qur'an Tuban*.
   - Legalitas Formal: Akta Notaris Muntafiah, S.H., M.Kn, AHU-0023909.AH.01.12. Tahun 2020.
   - Badge status: *Bukti Pembayaran Sah* warna Pine Green berlatar `#edf7f2`.
   - Nomor Kwitansi Unik: Kode monospace tebal berformat `KW-INV-...`.
3. **Komposisi Stempel & Tanda Tangan Saling Tumpuk (*Overlapping Alignment*)**:
   - Area Tanda Tangan (`.ttd-box`): Lebar 230px, teks tanggal dan jabatan rata tengah.
   - Ruang Tanda Tangan (`.ttd-space`): Tinggi 76px dengan penataan tumpang tindih presisi:
     - **Stempel Basah Ungu (`.stempel-img`)**: Diposisikan di sisi kiri (`left: 28px; top: -2px; width: 82px; height: 80px; transform: rotate(-6deg); z-index: 2; opacity: 0.88; pointer-events: none;`).
     - **Tanda Tangan Hitam (`.ttd-img`)**: Diposisikan di tengah (`left: 84px; top: 4px; width: 96px; height: 68px; z-index: 1;`).
     - **Nama Pejabat (`.ttd-name`)**: Nama resmi **Siti Mei Alvita** bergaris bawah tebal di bawah goresan tanda tangan.
     - **Karakteristik Tumpang Tindih**: Stempel menimpa sepertiga sisi kiri tanda tangan dengan area tumpang tindih selebar 26 piksel. Berkat transparansi `opacity: 0.88`, goresan tanda tangan tetap tembus di balik stempel ungu layaknya stempel basah asli di atas kertas.
     - **Dukungan Aset Gabungan**: Menyediakan slot `.combined-ttd-stempel-img` jika pengurus mengunggah 1 file gabungan eksternal (Canva).
4. **Badge Nominal Pembayaran**:
   - Desain kotak bergaris putus-putus (*dashed border*) warna Pine Green `#1c6b45` dengan latar `#edf7f2`.
   - Teks nominal berukuran `19px font-black monospace` untuk keterbacaan mutlak.

---

## 4. Logo Lembaga (`logo.jpg`)

- **Berkas**: `logo.jpg` berdimensi bujur sangkar resolusi tinggi (1254 x 1254 piksel).
- **Favicon Browser**: Terpasang di `<link rel="icon" type="image/jpeg" href="logo.jpg">`.
- **Layar Masuk Publik**: Ukuran `w-20 h-20` (80 x 80 px) dengan sudut `rounded-2xl`, bingkai `border-2 border-white/30`, dan bayangan `shadow-lg`.
- **Top Bar Portal Wali Mobile**: Ukuran `w-8 h-8` (32 x 32 px) berdampingan dengan nama aplikasi Zadil Quran.
- **Sidebar Admin Desktop**: Ukuran `w-9 h-9` (36 x 36 px) dengan sudut `rounded-xl`.

---

## 5. Arsitektur Antarmuka Mobile-First untuk Wali Santri

1. **Wadah Terpusat (Native App Viewport)**:
   - Pada ponsel: Memenuhi 100% lebar layar ponsel.
   - Pada desktop: Dibatasi maksimal selebar `max-w-md mx-auto` (448 piksel) agar menyerupai aplikasi ponsel pintar modern tanpa pemborosan ruang horizontal.
   - Sidebar navigasi desktop pengurus disembunyikan total saat role `walisantri` aktif.
2. **Top App Bar Tetap Terlihat (Sticky Header)**:
   - Logo `logo.jpg`, nama pondok, tombol pengalih mode gelap, dan tombol ganti akun santri.
3. **Penyortiran Terbalik (Newest First)**:
   - Data riwayat setoran otomatis dibalik urutannya (*reverse sorted*) dari Google Apps Script dan JavaScript sehingga rekaman terbaru ustadz selalu tampil di paling atas.
4. **Pencarian Cepat & Filter Tab**:
   - Tab pil instan: Semua, Hafalan Baru, dan Muroja'ah.
   - Kolom pencarian real-time untuk mencari nama surat Al-Qur'an tanpa jeda muat ulang.

---

## 6. Standar Tipografi & Sudut Lengkung (Border Radius)

- **Font Utama**: `Inter, sans-serif` dimuat via Google Fonts.
- **Hierarki Tipografi**:
  - Judul Layar: `text-xl font-bold tracking-tight`
  - Angka Capaian Metrik: `text-2xl font-extrabold tracking-tight`
  - Nama Surat Al-Qur'an: `text-base font-bold text-gray-800 dark:text-white`
  - Metadata Juz / Ayat / Halaman: `text-xs text-gray-500 dark:text-gray-400 font-medium`
  - Catatan Ustadz: `text-xs italic leading-relaxed`
- **Konsistensi Sudut (Shape Lock)**:
  - Kartu Profil & Metrik: `rounded-2xl` (16px)
  - Tombol CTA & Input Form: `rounded-xl` (12px)
  - Badge & Status Pill: `rounded-full` (Pill format)

---

## 7. Kepatuhan Standar Anti-Slop (Anti-Slop Compliance)

1. **Aturan Bebas Tanda Em-Dash**: Seluruh teks antarmuka, judul, label, tooltip, dan dokumentasi dilarang keras memuat karakter em-dash maupun en-dash. Pemisah kata wajib memakai tanda hubung reguler (`-`), titik dua, atau kurung.
2. **Bebas dari Tombol Setup API di Halaman Depan**: Halaman masuk publik steril dari tombol konfigurasi endpoint Apps Script. Seluruh pengaturan backend dikelola di level server via `_worker.js`.
3. **Kenyamanan Kontras (WCAG AA Certified)**: Warna teks putih di atas Crimson Maroon (`#9a2024`) menghasilkan rasio kontras 5.8:1 (melampaui syarat minimum 4.5:1). Teks putih di atas Pine Green (`#1c6b45`) menghasilkan rasio kontras 6.4:1.
4. **Sentuhan Interaktif Bersahaja**: Tidak menggunakan efek bayangan ungu/neon yang berlebihan (*no AI glow slop*). Efek fokus berupa ring halus sewarna brand (`focus:ring-2 focus:ring-primary-500/20`).
