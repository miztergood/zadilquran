# DESIGN SISTEM ZADIL QURAN
# Panduan Desain, Token Visual, Ergonomi Antarmuka & Standar Estetika

> **Design Read**: Reading this as: Islamic Education / Tahfidz Management web app for Islamic teachers, administrators, and parents, with a dignified crimson maroon (`#9a2024`) and pine green (`#1c6b45`) institutional language, leaning toward mobile-first parent portal, crisp contrast, and tactile feedback.

---

## 1. Konfigurasi Tiga Indikator (The Three Dials)

| Indikator | Nilai (Skala 1 - 10) | Alasan & Penerapan |
| :--- | :--- | :--- |
| **`DESIGN_VARIANCE`** | **4 (Structured & Institutional)** | Aplikasi pendidikan tahfidz menuntut ketertiban dan konsistensi tinggi. Penempatan formulir setoran, tombol pemilihan surat, dan tabel data santri harus terprediksi dan konsisten agar ustadz dapat mencatat setoran dengan reflek cepat tanpa distraksi visual. |
| **`MOTION_INTENSITY`** | **4 (Calm & Respectful)** | Animasi dirancang halus, bersahaja, dan menghormati suasana ibadah. Transisi perpindahan tab santai (`transition-all duration-200`), modal muncul dengan skala lembut tanpa guncangan ekstrem, dan tombol memiliki sentuhan taktil visual yang ringkas (`active:scale-95`). |
| **`VISUAL_DENSITY`** | **5 (Balanced Readability)** | Kepadatan antarmuka seimbang antara ruang kosong yang menenangkan dan efisiensi penyajian data mushaf (nomor surat, juz, rentang ayat, nomor halaman mushaf Madinah, serta catatan tajwid). |

---

## 2. Palet Warna & Token Semantik (Color Tokens)

Palet warna dirancang selaras dengan identitas lembaga Zadil Quran dengan kombinasi warna primer Crimson Maroon dan sekunder Pine Green yang memiliki standar kontras tinggi (WCAG AA min 4.5:1 untuk kenyamanan mata orang tua dan ustadz).

### 2.1 Palet Utama (Brand Identity)
- **Primary Crimson Maroon (`#9a2024`)**: Warna utama simbolik wibawa, keteguhan, dan identitas lembaga; digunakan untuk tombol utama (CTA), header kartu santri, border fokus input, dan sidebar desktop.
- **Primary Dark Maroon (`#731417` / `#480a0c`)**: Variasi gelap untuk latar belakang sidebar pengurus dan gradien kartu hero.
- **Primary Tint (`#fdf2f2`)**: Latar belakang lembut untuk badge muroja'ah dan kartu highlight.
- **Secondary Pine Green (`#1c6b45`)**: Warna sekunder simbolik kesegaran rohani, hafalan baru, dan keteduhan; digunakan untuk badge jenis setoran baru, tombol WhatsApp, dan indikator kelancaran.
- **Secondary Dark Green (`#12452c` / `#092316`)**: Variasi gelap untuk kontras mode gelap.
- **Secondary Tint (`#edf7f2`)**: Latar belakang gelembung evaluasi catatan ustadz.

### 2.2 Warna Fungsional & Penilaian Setoran
- **Lancar (Success)**: `#1c6b45` (Hijau pinus; menandakan bacaan tartil dan lancar tanpa celaan makhraj).
- **Kurang Lancar (Warning)**: `#eab308` / `#ca8a04` (Kuning amber; menandakan ada jeda lupa atau koreksi tajwid ringan).
- **Ulang (Danger)**: `#ef4444` / `#dc2626` (Merah; menandakan santri perlu mengulang setoran di halaqah berikutnya).
- **Muroja'ah**: `#9a2024` (Maroon; penanda jenis setoran pengulangan).

### 2.3 Netral & Permukaan (Dual-Mode: Light & Dark)
Aplikasi mendukung mode terang dan gelap dengan transisi kontras lembut tanpa warna hitam pekat murni (`#000000` dilarang) maupun putih silau tanpa batas.

| Token | Mode Terang (Default Siang) | Mode Gelap (Halaqah Ba'da Isya) |
| :--- | :--- | :--- |
| `Latar Aplikasi` | `#f9fafb` (Gray 50 lembut) | `#0f172a` (Slate 900 pekat bernuansa malam) |
| `Permukaan Kartu` | `#ffffff` (Putih bersih berbatas border halus) | `#1e293b` (Slate 800 elevasi tinggi) |
| `Garis Batas (Border)` | `#e5e7eb` (Gray 200 tipis) | `#334155` (Slate 700 kontras seimbang) |
| `Teks Primer` | `#1f2937` (Gray 800 tajam terbaca) | `#f8fafc` (Slate 50 nyaman di mata) |
| `Teks Sekunder` | `#6b7280` (Gray 500) | `#94a3b8` (Slate 400) |
| `Teks Muted` | `#9ca3af` (Gray 400) | `#64748b` (Slate 500) |

---

## 3. Logo Lembaga (`logo.jpg`)

- **Format Asset**: Berkas logo resmi `logo.jpg` berdimensi bujur sangkar resolusi tinggi (1254 x 1254 piksel).
- **Penerapan Layar Masuk**: Ditampilkan dengan ukuran `w-20 h-20` (80 x 80 px), sudut membulat `rounded-2xl`, berbingkai putih halus `border-2 border-white/30`, dan bayangan `shadow-lg`.
- **Penerapan Header Sidebar Desktop**: Ditampilkan dengan ukuran `w-9 h-9` (36 x 36 px) dengan sudut `rounded-xl`.
- **Penerapan Header Mobile Portal Wali**: Ditampilkan dengan ukuran `w-8 h-8` (32 x 32 px) pada bilah navigasi atas ponsel.
- **Favicon Browser**: Terpasang sebagai ikon browser tab dan pintasan layar beranda ponsel (*apple-touch-icon*).

---

## 4. Arsitektur Desain Mobile-First untuk Role Orang Tua (Wali Santri)

Portal pemantauan wali santri dirancang dengan filosofi **Mobile-First App Experience**:

1. **Wadah Terpusat (Native App Viewport)**:
   - Pada layar ponsel: Mengisi 100% lebar layar secara natural.
   - Pada layar tablet / desktop: Terpusat dalam wadah `max-w-md mx-auto` (lebar 448px) sehingga tidak memanjang kaku dan tetap menyerupai aplikasi ponsel pintar modern.
   - Bilah sisi (sidebar desktop) disembunyikan sepenuhnya agar fokus orang tua tertuju penuh pada capaian anak.
2. **Top App Bar Melayang (Sticky Header)**:
   - Header tetap terlihat di bagian atas saat digulir, memuat logo lembaga, nama sistem, tombol mode gelap, dan tombol ganti ID santri.
3. **Kartu Profil Hero Gradient**:
   - Memadukan gradien warna utama `#9a2024` dan sekunder `#1c6b45` dengan siluet mushaf Al-Qur'an.
   - Dilengkapi inisial santri, nama lengkap, badge ID unik santri dengan tombol sentuh salin instan (*tap-to-copy*), serta nama ustadz pembimbing.
4. **Tiga Metrik Capaian**:
   - Tiga kotak ringkas yang dapat dibaca dalam satu lirikan: Total Setoran, Hafalan Baru (aksen hijau), dan Muroja'ah (aksen maroon).
5. **Tombol Sentuh "Bagikan ke WhatsApp"**:
   - Memudahkan orang tua membagikan rekapitulasi capaian hafalan anak ke grup WhatsApp keluarga besar dengan format teks rapi.
6. **Filter & Pencarian Ramah Sentuhan**:
   - Tab tombol pil filter cepat (Semua, Hafalan Baru, Muroja'ah) yang dapat digulir horizontal.
   - Input pencarian cepat nama surat Al-Qur'an secara real-time.
7. **Kartu Linimasa Setoran Cerdas**:
   - Garis warna status di sisi kiri kartu (hijau untuk Lancar, kuning untuk Kurang Lancar, merah untuk Ulang).
   - Penomoran surat, nama surat, juz, ayat, dan nomor halaman mushaf Madinah.
   - Gelembung catatan ustadz (*quote bubble*) berwarna hijau teduh untuk evaluasi bacaan santri.
8. **Bilah Navigasi Bawah Melayang (Floating Bottom Bar)**:
   - Ditempatkan di bagian bawah viewport untuk ergonomi satu jempol (*one-thumb friendly*) dengan tombol Beranda, Bagikan, Refresh, dan Keluar.

---

## 5. Kepatuhan Standar Anti-Slop

1. **Bebas dari Em-Dash**: Seluruh teks, label, judul, dan dokumentasi menggunakan tanda hubung biasa (`-`), titik dua, atau tanda kurung sesuai klausul 9.G anti-slop.
2. **Bebas dari Tombol Pengaturan di Halaman Publik**: Halaman login tidak memuat tombol setup API atau elemen teknis yang membingungkan wali santri.
3. **Bebas dari Nama Generik**: Menggunakan nama-nama islami dan Indonesia yang realistis (contoh: Muhammad Zaki, Ahmad Al-Ghazi, Ustadz Abdullah).
4. **Bebas dari Glow Berlebihan**: Menggunakan batas tepi halus (*hairline border*) dan bayangan lembut alami (*diffused shadow*).
