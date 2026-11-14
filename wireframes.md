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
│ 📋 Syarat Pendaftaran (7 Poin) & Rincian Biaya Masuk (Rp 2.000.000)     │
│ ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ 1. Komitmen 30 Juz               │ │ A. Pendaftaran : Rp 1.800.000  │ │
│ │ 2. Mengisi Formulir              │ │    (Daftar, Almari, Gedung,    │ │
│ │ 3. Foto 3x4 (3 Lembar)           │ │     Kesehatan, Kitab)          │ │
│ │ 4. FC Ijazah/Raport/KK/Akta (2x) │ │ B. Syahriyah   : Rp   200.000  │ │
│ │ 5-7. Surat Yatim, Tata Tertib    │ │ TOTAL AWAL     : Rp 2.000.000  │ │
│ └──────────────────────────────────┘ └────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ 📝 Formulir Pendaftaran Santri Mukim Online (Terhubung Database ZQ-)    │
│ [ I. Data Calon Santri: Nama Sesuai Akta, Panggilan, Gender, TTL      ] │
│ [    Alamat Lengkap (RT/RW, Desa, Kec, Kab/Kota, Provinsi), Sekolah   ] │
│ [ II. Data Orang Tua: Nama/Pekerjaan/Pendidikan Ayah & Ibu, No. WA    ] │
│ [ [ 💾 Simpan Pendaftaran & Terbitkan Kode ZQ-2026-XXXX ]             ] │
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
                │ 🪪 [ ZQ-2026-X8K9       ] │ (Otomatis Kapital)
                │                           │
                │ [  Lihat Progres Anak ➜ ] │
                └───────────────────────────┘
```

---

## 2. Tata Letak Utama Superadmin (`/admin`)

Menggunakan model dua kolom: Sidebar di sebelah kiri (dapat diciutkan di ponsel) dan area konten utama di sebelah kanan.

```text
┌──────────────┬──────────────────────────────────────────────────────────┐
│ ZADIL QURAN  │ [Mobile Toggle]  Ringkasan Operasional Pesantren         │
├──────────────┼──────────────────────────────────────────────────────────┤
│ 👤 Admin     │ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌─────────┐ │
│   Superadmin │ │Total Santri│ │Total Ustadz│ │Setoran Hfln│ │Kas Masuk│ │
├──────────────┤ │     48     │ │     6      │ │    312     │ │Rp 24 Jt │ │
│ 🧭 Dashboard │ └────────────┘ └────────────┘ └────────────┘ └─────────┘ │
│ 🪪 Buku Induk│                                                          │
│ 💳 Keuangan  │ Menu & Navigasi Cepat:                                   │
│ 👤 Ustadz    │ ┌──────────────┐ ┌──────────────┐ ┌───────────┐ ┌──────┐ │
│ ⚙️ Pengaturan│ │🪪 Buku Induk │ │💳 SPP & Biaya│ │👤 Ustadz  │ │⚙️ Set│ │
│              │ │/admin/santri │ │/admin/keuang.│ │/admin/ust.│ │      │ │
│              │ └──────────────┘ └──────────────┘ └───────────┘ └──────┘ │
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

## 4. Layar Buku Induk Santri (`/admin/santri`) & Keuangan (`/admin/keuangan`)

### A. Buku Induk Santri (`/admin/santri`):
```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Buku Induk Santri                      [ + Input Santri Baru (Admin) ]  │
│ Database lengkap biodata santri, TTL, alamat, orang tua/wali & ustadz   │
├─────────────────────────────────────────────────────────────────────────┤
│ [ 🔍 Cari nama / kode ZQ / wali / kota...      ] [ Status: Semua ▾ ]    │
├─────────────────────────────────────────────────────────────────────────┤
│ KODE ZQ       NAMA & GENDER    TTL & ALAMAT   ORTU / WALI  STATUS  AKSI │
├─────────────────────────────────────────────────────────────────────────┤
│ ZQ-2026-X8K9  Muhammad Zaki    Tuban, 12/05   Bpk. Hendra  Aktif  [👁️💬✏️]│
│ ZQ-2026-M4P1  Ahmad Al-Ghazi   Lamongan, 01/02Bpk. Ridwan  Calon  [👁️💬✏️]│
└─────────────────────────────────────────────────────────────────────────┘
```

### B. Manajemen Keuangan & Syahriyah SPP (`/admin/keuangan`):
```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Manajemen Keuangan & Syahriyah (SPP)                                    │
│ [ 🔄 Sesuaikan Tagihan Belum Lunas ] [ ⚡ Generate SPP Massal ] [+Tagihan]│
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌───────────────────┐ │
│ │ Total Lunas (Masuk)  │ │ Belum Lunas (Piutang)│ │ Total Invoice     │ │
│ │ Rp 18.400.000        │ │ Rp 3.600.000         │ │ 45 Tagihan        │ │
│ └──────────────────────┘ └──────────────────────┘ └───────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ [ 🔍 Cari santri / nomor invoice / bulan... ]    [ Filter Status: Semua▾ ]│
├─────────────────────────────────────────────────────────────────────────┤
│ SANTRI         RINCIAN TAGIHAN            NOMINAL      STATUS    AKSI   │
├─────────────────────────────────────────────────────────────────────────┤
│ Muhammad Zaki  Syahriyah (SPP) Nov 2026   Rp 200.000   Belum   [✓Lunas] │
│ ZQ-2026-X8K9                                                   [✏️Edit] │
├─────────────────────────────────────────────────────────────────────────┤
│ Alena Ghaniya  Syahriyah (SPP) Okt 2026   Rp 200.000   LUNAS   [📄Kwit] │
│ ZQ-2026-QK3N   Ref: KW-INV-1794399276336                       [↺Batal] │
├─────────────────────────────────────────────────────────────────────────┤
│ Lathifatus S.  Paket Pendaftaran Masuk    Rp 1.800.000 LUNAS   [📄Kwit] │
│ ZQ-2026-LSK1   Ref: KW-INV-1794288102914                       [↺Batal] │
├─────────────────────────────────────────────────────────────────────────┤
│ Matriks 12 Bulan SPP Santri:                                            │
│ [Santri]     [Jul] [Agu] [Sep] [Okt] [Nov] [Des] [Jan] [Feb]...         │
│ M. Zaki      🟢    🟢    🟢    🟢    🟡    ⚪    ⚪    ⚪            │
│ Alena G.     🟢    🟢    🟢    🟢    🟢    ⚪    ⚪    ⚪            │
│ (🟢=Lunas, 🟡=Belum Lunas/Jatuh Tempo, ⚪=Belum Terbit)                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### C. Dokumen Kwitansi Resmi Digital (`kwitansi.html` - Ukuran A5 Landscape):
```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  PONDOK PESANTREN TAHFIZH ZADIL QUR'AN           [ BUKTI PEMBAYARAN SAH ]
│         Akta Notaris Muntafiah, S.H., M.Kn • AHU-0023909.AH.01.12. Tahun 2020│
│         Jl. Raya Penambangan, Semanding, Tuban, Jatim (62381)    KW-INV-1794... │
├──────────────────────────────────────────────────────────────────────────────┤
│                             KWITANSI PEMBAYARAN                              │
│                                                                              │
│ Telah Terima Dari   : AMIL AMRILLAH                                          │
│ Nama Santri (ID)    : ALENA GHANIYA DAMIS (ZQ-2026-QK3N)                     │
│ Uang Sejumlah       : ┌────────────────────────────────────────────────────┐ │
│                       │ # Dua Ratus Ribu Rupiah #                          │ │
│                       └────────────────────────────────────────────────────┘ │
│ Untuk Pembayaran    : Syahriyah (SPP) Bulan Oktober 2026 [Syahriyah (SPP)]   │
│ Metode Pembayaran   : Tunai di Kantor Pesantren • (SPP Bulanan Santri Mukim) │
│                                                                              │
│                         /\                                                   │
│                        /  \    [ W A T E R M A R K ]                         │
│                       / L  \                                                 │
│                      /   U  \         L U N A S                              │
│                     /     N  \                                               │
│                    /       A  \                                              │
│                   /         S  \                                             │
│                                                                              │
│ ┌ - - - - - - - - - - - ┐                       Tuban, 12/11/2026 09:38      │
│ :   JUMLAH PEMBAYARAN   :                       Bendahara Pesantren,         │
│ :                       :                                                    │
│ :     Rp 200.000        :                     ╭───────╮      ✍️              │
│ :                       :                    │ STEMPEL│  (Tanda Tangan       │
│ └ - - - - - - - - - - - ┘                    │  UNGU  │   Siti Mei Alvita)   │
│                                               ╰───────╯                      │
│                                                [ Stempel menimpa 1/3 ttd ]   │
│                                                     Siti Mei Alvita          │
├──────────────────────────────────────────────────────────────────────────────┤
│ [ 🖨️ Cetak / Unduh PDF ]       [ 📥 Simpan Gambar PNG ]       [ 🔙 Kembali ] │
└──────────────────────────────────────────────────────────────────────────────┘
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

## 6. Workspace Input Setoran & Ujian Tasmi' Ustadz (`/ustadz`)

### A. Form Input Setoran Harian (Smart Assist 4 Pilar):
Tata letak kolom ganda: Kolom kiri formulir pintar (*Smart Assist*), kolom kanan riwayat setoran ustadz hari berjalan.

```text
┌──────────────────────────────────────┬──────────────────────────────────┐
│ ✍️ Form Input Setoran (Smart Assist) │ 🕒 Riwayat Setoran Hari Ini      │
├──────────────────────────────────────┼──────────────────────────────────┤
│ Tanggal & Jam: [ 13/11/2026 14:00  ] │ ┌──────────────────────────────┐ │
│ Santri Binaan: [ Lathifatus Salma▾ ] │ │ Lathifatus Salma     ZIYADAH │ │
│                                      │ │ Juz 6 • Al-Ma'idah (109-113) │ │
│ 📌 Pilar Mutaba'ah:                  │ │ Hal 126 • 🟢 Mumtaz          │ │
│ (•) Ziyadah  ( ) Muroja'ah           │ └──────────────────────────────┘ │
│ ( ) Binnadhor( ) Tasmi' [Buka Ujian] │ ┌──────────────────────────────┐ │
│                                      │ │ Rabbiyah Putri    BINNADHOR  │ │
│ Juz: [ Juz 19 ▾ ]  Surat: [An-Naml ▾]│ │ Juz 19 • An-Naml (77-88)     │ │
│ Cakupan Ayat:   [ 77 ] sampai [ 88 ] │ │ Hal 384 • 🟢 Jayyid          │ │
│ Halaman: [ 384 ] (Otomatis/Manual)   │ └──────────────────────────────┘ │
│                                      │ ┌──────────────────────────────┐ │
│ Predikat Evaluasi:                   │ │ ZQ-2026-Q5GW          TASMI' │ │
│ (•) Mumtaz ( ) Jayyid Jiddan         │ │ Penilaian Tasmi' Juz 29      │ │
│ ( ) Jayyid ( ) Maqbul                │ │ 20 Hal • Skor: 87 • 🟢 LULUS │ │
│                                      │ └──────────────────────────────┘ │
│ Catatan Pedagogis Ustadz (Opsional): │                                  │
│ [ Perhatikan makhraj huruf 'ain    ] │                                  │
│                                      │                                  │
│ [      💾 Simpan Setoran Santri    ] │                                  │
└──────────────────────────────────────┴──────────────────────────────────┘
```

### B. Modal Engine Penilaian Ujian Tasmi' Digital (`#modalTasmi`):
```text
┌─────────────────────────────────────────────────────────────────────────┐
│ 🎖️ Lembar Penilaian Ujian Tasmi' Al-Qur'an Bil-Ghoib                 [X]│
├─────────────────────────────────────────────────────────────────────────┤
│ Santri  : Lathifatus Salma Khoiriyah (ZQ-2026-LSK1)                     │
│ Target  : [ Juz 29 ▾ ] (20 Halaman, Standar Rasm Utsmani)               │
│ Penguji : Ust. FARIZ MAS'UDIN                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ I. Penilaian Halaman Demi Halaman (Skor 5=Mumtaz, 4=Lancar, 3=Tawaquf, 2=Ulang):
│ ┌─────┬──────┬──────┬──────┬──────┬─────┬──────┬──────┬──────┬──────┐   │
│ │Hal 1│Hal 2 │Hal 3 │Hal 4 │Hal 5 │Hal 6│Hal 7 │Hal 8 │Hal 9 │Hal 10│   │
│ │[ 5 ]│[ 5 ] │[ 4 ] │[ 5 ] │[ 4 ] │[ 5 ]│[ 4 ] │[ 5 ] │[ 5 ] │[ 4 ] │   │
│ ├─────┼──────┼──────┼──────┼──────┼─────┼──────┼──────┼──────┼──────┤   │
│ │Hal11│Hal12 │Hal13 │Hal14 │Hal15 │Hal16│Hal17 │Hal18 │Hal19 │Hal 20│   │
│ │[ 4 ]│[ 5 ] │[ 4 ] │[ 4 ] │[ 5 ] │[ 4 ]│[ 4 ] │[ 5 ] │[ 5 ] │[ 4 ] │   │
│ └─────┴──────┴──────┴──────┴──────┴─────┴──────┴──────┴──────┴──────┘   │
│                                                                         │
│ II. Penilaian 9 Aspek Tajwid & Fashohah:                                │
│ • Makhorijul Huruf  : [ A ▾ ]      • Ahkamul Madd       : [ A ▾ ]       │
│ • Shifatul Huruf    : [ A ▾ ]      • Ahkamun Nun & Mim  : [ A ▾ ]       │
│ • Waqaf & Ibtida'   : [ B ▾ ]      • Ghunnah & Idgham   : [ A ▾ ]       │
│ • Kelancaran Kelimat: [ B ▾ ]      • Adab & Ketenangan  : [ A ▾ ]       │
│ • Irama / Tartil    : [ A ▾ ]                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ HASIL AKHIR TASMI':                                                     │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌───────────────────┐ │
│ │ Total Skor Halaman   │ │ Nilai Rata-rata      │ │ Status Kelulusan  │ │
│ │ 89 / 100 Poin        │ │ 89.0 (Mumtaz)        │ │ 🟢 LULUS (>= 80)  │ │
│ └──────────────────────┘ └──────────────────────┘ └───────────────────┘ │
│                                                                         │
│ [ ❌ Batal ]      [ 🖨️ Cetak Kartu Tasmi' ]      [ 💾 Simpan Nilai Ujian ]│
└─────────────────────────────────────────────────────────────────────────┘
```

### C. Layar Buku Rekapan Laporan Hafalan Ustadz (`/ustadz?view=rekap`):
```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Buku Rekapitulasi Laporan Hafalan                                       │
│ Rekapan mandiri seluruh setoran & penilaian binaan halaqah              │
├─────────────────────────────────────────────────────────────────────────┤
│ FILTER & PENCARIAN:                                                     │
│ Santri: [ Semua Santri Binaan ▾ ]     Waktu: [ Semua Waktu ▾ ]          │
│ Kategori: [ Semua Kategori (4 Pilar) ▾ ] Nilai: [ Semua Nilai ▾ ]       │
│ [ 🔍 Ketik nama surat, materi jilid, nomor TM, atau catatan evaluasi... ]│
├─────────────────────────────────────────────────────────────────────────┤
│ AKSI REKAPAN:                                                           │
│ [ 🧹 Bersihkan Catatan Sistem ]            [ 🖨️ Cetak Laporan Hafalan ] │
├─────────────────────────────────────────────────────────────────────────┤
│ TANGGAL/TM  NAMA SANTRI        KATEGORI   SURAT/JILID   AYAT/HAL  NILAI │ AKSI
├─────────────────────────────────────────────────────────────────────────┤
│ TM-1315     LATHIFATUS SALMA   BINNADHOR  Al-Jumu'ah    1 - 11    Mumtaz│ [👁️]
│ 13/11/2026  Al-Qur'an                     Juz 28        Hal 553         │ [✏️]
├─────────────────────────────────────────────────────────────────────────┤
│ TM-1        LATHIFATUS SALMA   ZIYADAH    Al-Ma'idah    109 - 113 Mumtaz│ [👁️]
│ 13/11/2026  Al-Qur'an                     Juz 6         Hal 126         │ [✏️]
├─────────────────────────────────────────────────────────────────────────┤
│ TM-1        ZQ-2026-Q5GW       TASMI'     Penilaian     20 Hal    LULUS │ [👁️]
│ 11/11/2026  Al-Qur'an                     Juz 29        Skor:87   (87)  │ [✏️]
├─────────────────────────────────────────────────────────────────────────┤
│ (Catatan ustadz ditampilkan bersih tanpa metadata sistem TM: / Paraf:)  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Layar Portal Wali Santri (`/wali`) - Mobile First Viewport

Dirancang khusus dengan prinsip *Mobile-First*. Pada layar desktop terpusat rapi dalam kontainer `max-w-md mx-auto` menyerupai antarmuka aplikasi seluler:

```text
┌────────────────────────────────────────────────────────┐
│ [Logo] PPT Zadil Quran         [📥 PWA] [🌙] [Keluar 🚪]│ (Sticky Top Bar)
│        Portal Terpadu Wali                             │
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ Ringkasan Capaian 4 Pilar Hafalan:                 │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │ │
│ │ │ TOTAL: 6 │ │ZIYADAH: 2│ │MUROJA': 3│ │BINNA: 1 │ │ │ (Metric Badges
│ │ └──────────┘ └──────────┘ └──────────┘ └─────────┘ │ │  + Tasmi': 0)
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌──────────────────────────┐ ┌───────────────────────┐ │
│ │ [ 💬 Bagikan ke WA ]     │ │ [ 📄 Unduh Laporan ]  │ │ (Quick Actions)
│ └──────────────────────────┘ └───────────────────────┘ │
│                                                        │
│ 📖 Laporan Hafalan Harian (28 Riwayat)                 │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Semua] [Ziyadah] [Muroja'ah] [Binnadhor] [Tasmi'] │ │ (Pilar Filter
│ └────────────────────────────────────────────────────┘ │  Tabs)
│ [ 🔍 Cari surat, jilid, atau sesi TM...              ] │ (Live Search)
│                                                        │
│ Linimasa Riwayat Hafalan (6 Kartu per Halaman):        │
│                                                        │
│ ┌──┬─────────────────────────────────────────────────┐ │
│ │  │ TM-6 • Al-Qur'an                  [ MUROJA'AH ] │ │
│ │84│ Al-Insyiqaq                                     │ │
│ │  │ Juz 30 • Hal 589                                │ │ (Hal Bersih)
│ │  │ // Ayat 1 - 25                      🟡 Jayyid   │ │
│ │  │ 📅 13 Nov 2026, 15:25                           │ │
│ └──┴─────────────────────────────────────────────────┘ │
│                                                        │
│ ┌──┬─────────────────────────────────────────────────┐ │
│ │  │ TM-98 • Al-Qur'an                 [ MUROJA'AH ] │ │
│ │70│ Al-Ma'arij                                      │ │
│ │  │ Juz 29 • Hal 568-569                            │ │ (Rentang Hal)
│ │  │ // Ayat 1 - 44                      🟡 Jayyid   │ │
│ │  │ 💬 "Perhatikan konsistensi panjang mad thabi'i" │ │ (Catatan Asli)
│ │  │ 📅 12 Nov 2026, 15:17                           │ │
│ └──┴─────────────────────────────────────────────────┘ │
│                                                        │
│ ┌──┬─────────────────────────────────────────────────┐ │
│ │  │ TM-4 • Al-Qur'an                  [ BINNADHOR ] │ │
│ │16│ An-Nahl                                         │ │
│ │  │ Juz 14 • Hal 274                                │ │
│ │  │ // Ayat 73 - 79                     🟢 Mumtaz   │ │
│ │  │ 📅 11 Nov 2026, 14:48                           │ │
│ └──┴─────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [ ◀ Sebelumnya ]   Halaman 1 dari 5   [Berikutnya▶]│ │ (Paginasi 6
│ │             Menampilkan 6 dari 28 riwayat          │ │  Kartu/Halaman)
│ └────────────────────────────────────────────────────┘ │
│                                                        │
├────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────────┬──────────────────┐ │
│ │ 📖 Hafalan   │ 💳 SPP & Kwitansi│ 🪪 Buku Induk    │ │ (Bottom Nav
│ └──────────────┴──────────────────┴──────────────────┘ │  3-in-1 Mobile)
└────────────────────────────────────────────────────────┘
```

### Versi Tab SPP & Kwitansi Wali Santri:
```text
┌────────────────────────────────────────────────────────┐
│ Tagihan Syahriyah (SPP) Santri                         │
├────────────────────────────────────────────────────────┤
│ [🟢 LUNAS] Syahriyah (SPP) Bulan Oktober 2026         │
│ Nominal : Rp 200.000                                   │
│ Ref     : KW-INV-1794399276336                         │
│ [ 📄 Lihat Kwitansi Sah (PDF / PNG) ➜ ]                │
├────────────────────────────────────────────────────────┤
│ [🟡 BELUM LUNAS] Syahriyah (SPP) Bulan November 2026   │
│ Nominal : Rp 200.000 (Jatuh Tempo: 10 Nov 2026)        │
│ Cara Bayar: Transfer BSI / Tunai di Kantor Pesantren   │
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
