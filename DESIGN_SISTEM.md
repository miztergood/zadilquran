# DESIGN SISTEM ZADIL QURAN
# Panduan Desain, Token Visual, Ergonomi Antarmuka & Standar Estetika

> **Design Read**: Reading this as: Islamic Education / Tahfidz Management web app for Islamic teachers, administrators, and parents, with a serene, respectful, high-contrast spiritual-modern language, leaning toward Tailwind emerald/slate palette, tactile feedback, and distraction-free typography.

---

## 1. Konfigurasi Tiga Indikator (The Three Dials)

| Indikator | Nilai (Skala 1 - 10) | Alasan & Penerapan |
| :--- | :--- | :--- |
| **`DESIGN_VARIANCE`** | **4 (Structured & Institutional)** | Aplikasi pendidikan tahfidz menuntut ketertiban dan konsistensi tinggi. Penempatan formulir setoran, tombol pemilihan surat, dan tabel data santri harus terprediksi dan konsisten agar ustadz dapat mencatat setoran dengan reflek cepat tanpa distraksi visual. |
| **`MOTION_INTENSITY`** | **4 (Calm & Respectful)** | Animasi dirancang halus, bersahaja, dan menghormati suasana ibadah. Transisi perpindahan tab santai (`transition-all duration-200`), modal muncul dengan skala lembut tanpa guncangan ekstrem, dan tombol memiliki sentuhan taktil visual yang ringkas (`active:scale-95`). |
| **`VISUAL_DENSITY`** | **5 (Balanced Readability)** | Kepadatan antarmuka seimbang antara ruang kosong yang menenangkan dan efisiensi penyajian data mushaf (nomor surat, juz, rentang ayat, nomor halaman mushaf Madinah, serta catatan tajwid). |

---

## 2. Palet Warna & Token Semantik (Color Tokens)

Palet warna dirancang terinspirasi dari nuansa kubah hijau Nabawi, lembaran mushaf Al-Qur'an klasik, dan kesegaran spiritualitas Islam dengan standar kontras tinggi (WCAG AA min 4.5:1 untuk kenyamanan mata saat menyimak hafalan dalam waktu lama).

### 2.1 Palet Utama (Brand Identity)
- **Primary Emerald 600 (`#059669`)**: Warna utama simbolik ketenangan dan keteguhan; digunakan untuk tombol tindakan utama (CTA), header kartu santri, dan indikator aktif.
- **Primary Emerald 500 (`#10b981`)**: Warna aksen untuk highlight, fokus input, dan tombol aktif pada mode gelap.
- **Primary Emerald 700 (`#047857`)**: Warna status hover dan border penegas.
- **Primary Emerald 900 (`#064e3b`)**: Warna latar belakang sidebar desktop dan kartu autentikasi.
- **Emerald Tint (`#ecfdf5`)**: Latar belakang badge hafalan baru dan baris aktif.

### 2.2 Warna Fungsional & Penilaian Setoran
- **Lancar (Success)**: `#10b981` (Hijau emerald; menandakan bacaan tartil dan lancar tanpa celaan makhraj).
- **Kurang Lancar (Warning)**: `#eab308` / `#ca8a04` (Kuning amber; menandakan ada jeda lupa atau koreksi tajwid ringan).
- **Ulang (Danger)**: `#ef4444` / `#dc2626` (Merah; menandakan santri perlu mengulang setoran di halaqah berikutnya).
- **Muroja'ah (Info)**: `#3b82f6` (Biru royal; pembeda visual jenis setoran pengulangan).

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

## 3. Tipografi & Hierarki Teks

Menggunakan jenis huruf **Inter** yang dipadukan dengan angka numerik proporsional untuk kemudahan membaca nomor surat dan ayat Al-Qur'an.

- **Judul Utama Layar (H1/H2)**: Ukuran 24px - 28px, Bobot 700 (Bold), Tracking ketat `-0.02em`. Memberikan penegasan identitas halaman tanpa terlihat berlebihan.
- **Judul Bagian & Modal (H3)**: Ukuran 18px - 20px, Bobot 600 (Semi-bold).
- **Teks Tubuh (Body)**: Ukuran 14px - 15px, Bobot 400 (Regular), Line height 1.5. Keterbacaan optimal untuk catatan tajwid ustadz.
- **Label & Metadata**: Ukuran 12px, Bobot 600, Text-transform Uppercase, Tracking renggang `0.05em`.
- **Nomor ID & Kode Khusus**: Menggunakan jenis huruf monospaced sistem (`font-mono`) untuk kode ID unik santri (`ST-2026-X8K9`) agar tidak terjadi kerancuan antara angka nol dan huruf O.

---

## 4. Komponen Antarmuka & Ergonomi

### 4.1 Formulir Cerdas Input Setoran
- **TomSelect Dropdown**: Menggantikan elemen `<select>` bawaan peramban yang kaku dengan pencarian cerdas berkemampuan filter teks instan saat ustadz mengetik nama santri atau surat Al-Qur'an.
- **Smart Pin Box**: Kotak notifikasi cerdas bergaris tepi emerald lembut yang muncul otomatis ketika nama santri dipilih, menampilkan rekaman batas setoran terakhir santri tersebut dan tombol satu-klik "Pakai".
- **Toggle Sakelar Setoran**: Tombol tab berdampingan dengan elevasi bayangan halus (`shadow-sm`) untuk perpindahan antara Hafalan Baru dan Muroja'ah.

### 4.2 Kartu Progres Santri (Portal Wali)
- **Banner Gradien Islami**: Perpaduan halus antara emerald-600 dan teal-700 dengan siluet dekoratif kaligrafi mushaf transparan beropasitas 10%.
- **Kartu Riwayat Bergaris Aksen Kiri**: Setiap baris mutasi setoran memiliki garis batas vertikal di sisi kiri (`w-1.5`) dengan kode warna status kelancaran (hijau untuk Lancar, kuning untuk Kurang Lancar, merah untuk Ulang).

### 4.3 Dialog Modal
- Menggunakan latar belakang kabur (*backdrop blur*) dengan opasitas gelap 60% (`bg-black/60 backdrop-blur-sm`).
- Modal beranimasi transisi `scale-95` ke `scale-100` saat terbuka dan meredup halus saat ditutup.
- Tombol aksi simpan berwarna emerald yang jelas dan tombol batal netral yang tidak membingungkan pengguna.

---

## 5. Kepatuhan Standar Anti-Slop

1. **Bebas dari Em-Dash**: Seluruh teks, label, judul, dan dokumentasi menggunakan tanda hubung biasa (`-`), titik dua, atau tanda kurung sesuai klausul 9.G anti-slop.
2. **Bebas dari Tombol Pengaturan di Halaman Publik**: Halaman login tidak memuat tombol setup API atau elemen teknis yang membingungkan wali santri.
3. **Bebas dari Nama Generik**: Menggunakan nama-nama islami dan Indonesia yang realistis (contoh: Ahmad Fauzi, Muhammad Zaki, Ustadz Abdullah).
4. **Bebas dari Glow Berlebihan**: Menggunakan batas tepi halus (*hairline border*) dan bayangan lembut alami (*diffused shadow*).
