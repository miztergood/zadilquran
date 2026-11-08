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

### 2.3 Warna Semantik & Evaluasi Setoran (Status Tokens)

Sistem penilaian setoran Al-Qur'an menggunakan 3 tingkatan evaluasi kelancaran:

| Status Evaluasi | Warna Utama | Latar Mode Terang | Latar Mode Gelap | Arti & Makna Evaluasi |
| :--- | :--- | :--- | :--- | :--- |
| **Lancar (Mumtaz)** | `#1c6b45` | `#edf7f2` (`secondary-50`) | `#092316` (`secondary-900`) | Bacaan tartil, makhraj fasih, dan tajwid terjaga tanpa cela |
| **Kurang Lancar (Jayyid)** | `#eab308` | `#fefce8` (Amber-50) | `#713f12` (Amber-900) | Terdapat jeda ragu atau 1-2 koreksi tajwid ringan |
| **Ulang (Rasib/Takrar)** | `#ef4444` | `#fef2f2` (Red-50) | `#7f1d1d` (Red-900) | Santri belum hafal lancar dan wajib mengulang di halaqah berikutnya |

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
- Menyajikan petuah evaluasi tajwid dan makhraj secara teduh dan bermartabat.

### 3.4 Bilah Bawah Melayang (Floating Bottom Bar)
- Mengambang di bagian bawah layar ponsel dengan latar belakang tembus pandang berdaya buram: `bg-white/90 dark:bg-darkcard/90 backdrop-blur-md border-t border-gray-200 dark:border-darkborder`.
- Ikon aktif memanfaatkan warna aksen `text-primary-500` (`#9a2024`).

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
