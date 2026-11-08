# WIREFRAMES ZADIL QURAN
# Sketsa Struktur Visual & Tata Letak Antarmuka Aplikasi

Dokumen ini memvisualisasikan arsitektur tata letak antarmuka pengguna (UI Wireframes) untuk seluruh peran dan layar utama pada aplikasi Zadil Quran.

---

## 0. Layar Beranda / Landing Page Utama (`/`)

Layar yang pertama kali tampil saat situs web diakses. Memuat identitas pondok pesantren, program tahfizh, keunggulan, alur pendaftaran, dan formulir online pendaftaran santri baru.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ 📢 PSB 2025/2026 Telah Dibuka! Kuota Terbatas.   [Isi Formulir Online ➜]│
├─────────────────────────────────────────────────────────────────────────┤
│ [Logo] Zadil Qur'an    Program  Ekskul  Fasilitas  Alur PSB  [🌙] [Portal]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│         [ 🏛️ PONDOK PESANTREN TAHFIZH ZADIL QUR'AN TUBAN ]              │
│                                                                         │
│     Mencetak Generasi Qur’ani, Mandiri, dan Berakhlak Mulia             │
│                                                                         │
│     Pondok Pesantren Tahfizh Zadil Qur'an membimbing putra-putri Anda   │
│     menghafal Al-Qur'an 30 Juz dan meraih pendidikan formal berkualitas │
│                                                                         │
│     [ 📝 Daftar Santri Baru ]   [ 💬 WhatsApp ]   [ 📖 Portal Hafalan ] │
│                                                                         │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│ │ Metode Ummi  │ │ Wisuda WTN   │ │ Sekolah Formal│ │ Mulai Usia 7 Thn │ │
│ │ Tartil/Fasih │ │ Darul Qur'an │ │ Terakreditasi│ │ Pembinaan Mandiri│ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────┘ │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ 💡 Mempersiapkan Masa Depan Akhirat dan Dunia Anak Tercinta              │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌───────────────────┐ │
│ │ 1. Mandiri & Beradab │ │ 2. Tahsin Ramah Anak │ │3. Pddk Seimbang   │ │
│ └──────────────────────┘ └──────────────────────┘ └───────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ 📚 Program Unggulan: Tahfizh 30 Juz | Tahsin Ummi | MDTA | Formal | WTN │
├─────────────────────────────────────────────────────────────────────────┤
│ 📝 Formulir Pendaftaran Calon Santri Baru Online                        │
│ [ Nama Lengkap Santri  ]  [ Usia / Tgl Lahir ]                          │
│ [ Jenis Kelamin        ]  [ Jenjang Sekolah  ]                          │
│ [ Nama Orang Tua/Wali  ]  [ No. WhatsApp     ]                          │
│ [ [ 💬 Kirim Formulir Pendaftaran via WhatsApp ]                      ] │
├─────────────────────────────────────────────────────────────────────────┤
│ ❓ Tanya Jawab (FAQ) Accordion                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ 🏛️ Footer: Kampus Semanding, Tuban • WA: 0857 3180 4663 • [Portal Login]│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Layar Autentikasi Bersih (`/login`)

Layar masuk dirancang terpusat dengan kontras tinggi, latar belakang emerald pekat, dan bersih dari konfigurasi teknis yang membingungkan.

```text
┌─────────────────────────────────────────────────────────────┐
│                      [ Mode Gelap / Terang 🌙 ] (Kanan Atas)│
│                                                             │
│                ┌───────────────────────────┐                │
│                │      [ Ikon Mushaf ]      │                │
│                │        ZADIL QURAN        │                │
│                │ Sistem Pantauan Hafalan   │                │
│                ├─────────────┬─────────────┤                │
│                │  Pengurus   │ Wali Santri │                │
│                ├─────────────┴─────────────┤                │
│                │                           │                │
│                │ 👤 [ Username           ] │                │
│                │ 🔒 [ Password           ] │                │
│                │                           │                │
│                │ [  Masuk Dashboard  ➜  ]  │                │
│                │                           │                │
│                │ ------------------------- │                │
│                │ Zadil Quran • Pantauan    │                │
│                └───────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Versi Tab Wali Santri:
```text
                ├─────────────┬─────────────┤
                │  Pengurus   │ Wali Santri │ (Aktif)
                ├─────────────┴─────────────┤
                │ ℹ️ Masukkan ID Unik santri│
                │                           │
                │ 🪪 [ ST-2026-X8K9Z      ] │ (Otomatis Kapital)
                │                           │
                │ [  Lihat Progres Anak ➜ ] │
                └───────────────────────────┘
```

---

## 2. Tata Letak Utama Superadmin (`/admin`)

Menggunakan model dua kolom: Sidebar di sebelah kiri (dapat diciutkan di ponsel) dan area konten utama di sebelah kanan.

```text
┌──────────────┬──────────────────────────────────────────────────────────┐
│ ZADIL QURAN  │ [Mobile Toggle]  Ringkasan Operasional Lembaga           │
├──────────────┼──────────────────────────────────────────────────────────┤
│ 👤 Admin     │ ┌───────────────┐ ┌───────────────┐ ┌──────────────────┐ │
│   Superadmin │ │ Total Santri  │ │ Total Ustadz  │ │ Total Setoran    │ │
├──────────────┤ │      48       │ │       6       │ │      312         │ │
│ 🧭 Dashboard │ └───────────────┘ └───────────────┘ └──────────────────┘ │
│ 👤 Ustadz    │                                                          │
│ 👥 Santri    │ Menu & Navigasi Cepat:                                   │
│ ⚙️ Pengaturan│ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐ │
│              │ │ 👤 Data Ustadz  │ │ 👥 Data Santri  │ │ ⚙️ Pengaturan│ │
│              │ │ /admin/ustadz   │ │ /admin/santri   │ │ /admin/peng..│ │
│              │ └─────────────────┘ └─────────────────┘ └──────────────┘ │
├──────────────┤                                                          │
│ 🚪 Keluar    │                                                          │
└──────────────┴──────────────────────────────────────────────────────────┘
```

---

## 3. Layar Manajemen Data Ustadz (`/admin/ustadz`)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Data Ustadz                            [ + Tambah Ustadz Baru ]         │
│ Daftar pembimbing tahfizh dan jumlah santri binaan                      │
├─────────────────────────────────────────────────────────────────────────┤
│ [ 🔍 Cari ustadz / username...                             ]            │
├─────────────────────────────────────────────────────────────────────────┤
│ NAMA USTADZ          USERNAME       SANTRI BINAAN         AKSI          │
├─────────────────────────────────────────────────────────────────────────┤
│ Ustadz Abdullah      ustadz101      8 Santri       [Edit] [Copy] [Hapus]│
│ Ustadz Fauzan        ustadz102      7 Santri       [Edit] [Copy] [Hapus]│
│ Ustadz M. Ridwan     ustadz103      9 Santri       [Edit] [Copy] [Hapus]│
├─────────────────────────────────────────────────────────────────────────┤
│ Halaman 1 dari 1                                    [Prev] [Next]       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Modal Tambah / Edit Ustadz:
```text
┌──────────────────────────────────────────────┐
│ Tambah Ustadz Baru                       [X] │
├──────────────────────────────────────────────┤
│ Nama Lengkap Ustadz:                         │
│ [ Ustadz Ahmad Fauzi                       ] │
│                                              │
│ Username Login:   [ Generate Ulang ]         │
│ [ ustadz4829                               ] │
│                                              │
│ Password:                                    │
│ [ x9k2p1                                   ] │
│                                              │
│                   [ Batal ] [ Simpan Data ]  │
└──────────────────────────────────────────────┘
```

---

## 4. Layar Manajemen Data Santri (`/admin/santri`)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Data Santri                            [ + Tambah Santri Baru ]         │
│ Daftar santri, nama wali, dan plotting ustadz pembimbing                │
├─────────────────────────────────────────────────────────────────────────┤
│ [ 🔍 Cari santri / ID / nama wali...                       ]            │
├─────────────────────────────────────────────────────────────────────────┤
│ ID SANTRI     NAMA LENGKAP     NAMA WALI     USTADZ PEMBIMBING    AKSI  │
├─────────────────────────────────────────────────────────────────────────┤
│ ST-2026-X8K9  Muhammad Zaki    Bpk. Hendra   Ustadz Abdullah     [•••]  │
│ ST-2026-M4P1  Ahmad Al-Ghazi   Bpk. Ridwan   Ustadz Fauzan       [•••]  │
│ ST-2026-Q2W8  Fathimah Az-ZahraIbu Maryam    Ustadz Abdullah     [•••]  │
├─────────────────────────────────────────────────────────────────────────┤
│ Halaman 1 dari 2                                    [Prev] [Next]       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Layar Pengaturan Sistem (`/admin/pengaturan`)

```text
┌───────────────────────────────────┬─────────────────────────────────────┐
│ 🏛️ Identitas Lembaga              │ 🛡️ Ganti Password Admin            │
├───────────────────────────────────┼─────────────────────────────────────┤
│ Nama Pondok / Aplikasi:           │ Password Saat Ini:                  │
│ [ Zadil Quran                   ] │ [ **********                      ] │
│                                   │ Password Baru:                      │
│                                   │ [ **********                      ] │
│ [ Simpan Identitas ]              │ [ Ubah Password ]                   │
├───────────────────────────────────┴─────────────────────────────────────┤
│ ☁️ Backend Google Apps Script & Cloudflare Pages    [ Status: Online ]   │
├─────────────────────────────────────────────────────────────────────────┤
│ Komunikasi backend dikelola otomatis via Cloudflare Pages proxy (/api). │
│ URL Web App Apps Script dikonfigurasi terpusat di file _worker.js.      │
│                                                                         │
│ [ 🌐 Tes Koneksi API ]        [ 🗄️ Inisialisasi Database Sheets ]       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Workspace Input Setoran Ustadz (`/ustadz`)

Tata letak kolom ganda: Kolom kiri formulir pintar (*Smart Assist*), kolom kanan riwayat setoran ustadz hari berjalan.

```text
┌──────────────────────────────────────┬──────────────────────────────────┐
│ ✍️ Form Input Setoran (Smart Assist) │ 🕒 Riwayat Setoran Hari Ini      │
├──────────────────────────────────────┼──────────────────────────────────┤
│ Tanggal & Jam: [ 08/11/2026 13:00  ] │ ┌──────────────────────────────┐ │
│ Santri Binaan: [ Muhammad Zaki ▾   ] │ │ Muhammad Zaki   HAFALAN BARU │ │
│                                      │ │ Juz 30 • An-Naba' (1-40)     │ │
│ 📌 Lanjutan: An-Naba' Juz 30 [Pakai] │ │ 🟢 Lancar • "Makhraj fasih"  │ │
│                                      │ └──────────────────────────────┘ │
│ Jenis: [ Hafalan Baru ] [ Muroja'ah ]│ ┌──────────────────────────────┐ │
│                                      │ │ Ahmad Al-Ghazi      MUROJA'AH│ │
│ Juz: [ Juz 30 ▾ ]  Surat: [An-Nazi'at]│ │ Juz 30 • An-Nazi'at (1-20)   │ │
│                                      │ │ 🟡 Kurang • "Ulangi ayat 15" │ │
│ Cakupan Ayat:   [✓] 1 Surat Penuh    │ └──────────────────────────────┘ │
│ [ 1 ]  sampai  [ 46 ]                │                                  │
│                                      │                                  │
│ Halaman: [ 583 ]                     │                                  │
│ Predikat: (•) Lancar ( ) Kurang ( )Ulang                                │
│ Catatan: [ Perhatikan tajwid ikhfa ] │                                  │
│                                      │                                  │
│ [      💾 Simpan Setoran Santri    ] │                                  │
└──────────────────────────────────────┴──────────────────────────────────┘
```

---

## 7. Layar Portal Wali Santri (`/wali`) - Mobile First Viewport

Dirancang khusus dengan prinsip *Mobile-First*. Pada layar desktop terpusat rapi dalam kontainer `max-w-md mx-auto` menyerupai antarmuka aplikasi seluler:

```text
┌────────────────────────────────────────────────────────┐
│ [Logo] ZADIL QURAN • WALI      [🌙] [Ganti ID Santri 🚪]│ (Sticky Top Bar)
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ [MZ]  MUHAMMAD ZAKI                                │ │
│ │       ID: ST-2026-X8K9 [📋 Salin]                  │ │ (Hero Gradient
│ │       Pembimbing: Ustadz Abdullah                  │ │  Maroon to Green)
│ ├────────────────────────────────────────────────────┤ │
│ │  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │ │
│ │  │      24      │ │      18      │ │      6      │ │ │ (3 Metric Pills)
│ │  │ Total Setoran│ │ Hafalan Baru │ │  Muroja'ah  │ │ │
│ │  └──────────────┘ └──────────────┘ └─────────────┘ │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ [ 💬 Bagikan Capaian ke WhatsApp                     ] │ (One-Tap Share)
│                                                        │
│ [ Semua (24) ] [ Baru (18) ] [ Muroja'ah (6) ]         │ (Filter Pills)
│ [ 🔍 Cari nama surat Al-Qur'an...                    ] │ (Realtime Search)
│                                                        │
│ Linimasa Riwayat Hafalan (Terbaru):                    │
│                                                        │
│ ┌──┬─────────────────────────────────────────────────┐ │
│ │  │ 79. An-Nazi'at                  [ HAFALAN BARU ]│ │
│ │🟢│ Juz 30 • Ayat 1-46 • Halaman 583                │ │
│ │  │ 📅 08 Nov 2026, 10:15       [ 🟢 Lancar ]       │ │
│ │  │ ┌─────────────────────────────────────────────┐ │ │
│ │  │ │ 💬 "Makhraj dan tajwid sangat fasih"        │ │ │ (Quote Bubble)
│ │  │ └─────────────────────────────────────────────┘ │ │
│ └──┴─────────────────────────────────────────────────┘ │
│                                                        │
│ ┌──┬─────────────────────────────────────────────────┐ │
│ │  │ 78. An-Naba'                    [ MUROJA'AH    ]│ │
│ │🟢│ Juz 30 • Ayat 1-40 • Halaman 582                │ │
│ │  │ 📅 05 Nov 2026, 09:30       [ 🟢 Lancar ]       │ │
│ └──┴─────────────────────────────────────────────────┘ │
│                                                        │
├────────────────────────────────────────────────────────┤
│   [🏠 Beranda]   [💬 Share]   [🔄 Refresh]   [🚪 Keluar]│ (Bottom Bar)
└────────────────────────────────────────────────────────┘
```

---

## 8. Tata Letak Responsif Ponsel (Mobile View) & Ergonomi Halaqah

1. **Role Wali Santri**:
   - Berjalan dalam tampilan aplikasi seluler native (*native mobile app style*).
   - Sidebar desktop dieliminasi sepenuhnya agar perhatian orang tua berfokus pada perkembangan anak.
   - Dilengkapi bilah bawah (*floating bottom bar*) yang mudah dijangkau satu jempol (*one-thumb reach*).
2. **Role Ustadz & Superadmin**:
   - Pada layar ponsel (< 768px), sidebar beralih menjadi Drawer Menu yang meluncur halus dari kiri dengan tombol pemicu di bilah atas (*top bar*).
   - Grid 2-kolom pada Workspace Ustadz dan Dashboard tersusun vertikal (1 kolom) agar formulir input ayat dan pemilih surat Al-Qur'an tetap lapang.
   - Seluruh tombol memiliki tinggi minimal 44 piksel untuk kemudahan sentuh ustadz di halaqah.
