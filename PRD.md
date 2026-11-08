# Product Requirements Document (PRD)
# Zadil Quran - Sistem Manajemen Tahfidz & Pantauan Hafalan Al-Qur'an

## 1. Ringkasan Eksekutif & Visi Produk

Zadil Quran adalah aplikasi web manajemen tahfidz berbasis arsitektur serverless modern yang dirancang khusus untuk memenuhi kebutuhan operasional pondok pesantren, rumah tahfidz, dan halaqah Al-Qur'an. Aplikasi ini menyatukan pengelolaan data santri, penugasan ustadz pembimbing, pencatatan setoran hafalan harian, serta portal pantauan langsung bagi wali santri dalam satu platform terpadu.

Sistem berjalan di atas infrastruktur **Cloudflare Pages** dengan komputasi edge worker (`_worker.js`) dan menggunakan **Google Sheets** sebagai basis data yang dikelola melalui **Google Apps Script** API. Pendekatan ini memungkinkan lembaga pendidikan Islam mengoperasikan sistem pemantauan hafalan yang andal, cepat, dan berbiaya operasional nol rupiah (Free Tier Friendly).

---

## 2. Profil Pengguna (User Personas)

### 2.1 Superadmin / Pimpinan Lembaga
- **Profil**: Pengasuh pondok pesantren, kepala madrasah, atau staf tata usaha yayasan.
- **Kebutuhan**:
  - Memantau ringkasan total santri, jumlah ustadz, dan total setoran hafalan yang berhasil diselesaikan secara global.
  - Mendaftarkan akun ustadz baru, memperbarui data pembimbing, dan menduplikasi akun dengan cepat.
  - Mendaftarkan santri baru, menerbitkan ID Unik santri secara otomatis, dan memplot santri ke ustadz pembimbing.
  - Mengubah nama identitas lembaga dan memperbarui kredensial kata sandi admin demi keamanan.
- **Tantangan Saat Ini**: Rekapitulasi manual menggunakan buku setoran fisik rentan hilang, rusak, dan memakan waktu lama saat menyusun laporan bulanan kepada pimpinan yayasan.

### 2.2 Ustadz Pembimbing Tahfidz
- **Profil**: Guru pengampu halaqah tahfidz yang menyimak langsung setoran hafalan para santri setiap hari.
- **Kebutuhan**:
  - Membuka daftar santri binaan secara terfilter tanpa terganggu data santri halaqah lain.
  - Menginput setoran ayat dengan cepat: memilih surat, juz, ayat awal, ayat akhir, nomor halaman mushaf, dan predikat kelancaran.
  - Memiliki fitur lanjutan otomatis (*Smart Pin*) yang dapat mengingat batas hafalan terakhir santri secara instan tanpa perlu membolak-balik lembar catatan.
  - Menuliskan catatan evaluasi tajwid dan makhraj huruf santri.
  - Melihat riwayat setoran terbaru yang telah dicatat hari itu.
- **Tantangan Saat Ini**: Waktu menyimak sangat terbatas, sehingga formulir pencatatan harus sangat ringkas dan tidak boleh merepotkan ustadz.

### 2.3 Wali Santri
- **Profil**: Orang tua santri yang ingin mengetahui perkembangan hafalan putra-putrinya secara transparan dari rumah.
- **Kebutuhan**:
  - Mengakses portal pemantauan tanpa perlu registrasi rumit atau mengingat kata sandi, cukup memasukkan ID Unik santri anak.
  - Melihat total capaian setoran, ustadz pembimbing yang bertanggung jawab, dan linimasa rekaman hafalan terbaru.
  - Membaca predikat kelancaran (Lancar, Kurang Lancar, Ulang) dan catatan langsung dari ustadz.
- **Tantangan Saat Ini**: Orang tua sering cemas dan minim informasi mengenai capaian hafalan anak di pondok sampai waktu rapotan akhir semester.

---

## 3. Sumber Daya & Konfigurasi Sistem

- **Platform Frontend**: Cloudflare Pages (Single Page Application dengan Tailwind CSS, FontAwesome, TomSelect).
- **Edge Gateway**: Cloudflare Pages Worker (`_worker.js`) untuk penanganan reverse proxy `/api` dan fallback routing SPA.
- **Database Backend**: Google Sheets yang dikelola via Google Apps Script (`code.gs`).
- **Repository GitHub**: `https://github.com/miztergood/zadilquran.git`
- **Database Al-Qur'an Terintegrasi**: 114 Surat lengkap dengan informasi jumlah ayat dan nomor juz bawaan aplikasi.

---

## 4. Persyaratan Fungsional (Functional Requirements)

### 4.1 Modul Autentikasi & Manajemen Sesi
1. **Layar Masuk Ganda (Tabbed Login)**:
   - Tab Pengurus/Ustadz: Input username dan password.
   - Tab Wali Santri: Input ID Unik Santri berformat kode alfanumerik (misal: `ST-2026-X8K9`).
2. **Keamanan Sesi**:
   - Penerbitan token sesi UUID dari Google Apps Script untuk pengurus.
   - Penyimpanan sesi di `localStorage` peramban untuk menjaga pengguna tidak ter-logout saat me-refresh halaman.
   - Tombol Keluar (Logout) yang membersihkan token dan mengarahkan kembali ke `/login`.
3. **Penyembunyian Konfigurasi Teknis**:
   - Layar login bersih dari tombol pengaturan URL API demi menjaga kesederhanaan dan kenyamanan pengguna awam.

### 4.2 Modul Superadmin
1. **Dashboard Statistik Global (`/admin`)**:
   - Kartu metrik: Total Santri Aktif, Total Ustadz Pembimbing, dan Total Mutasi Setoran.
   - Panel navigasi pintas ke menu data ustadz, santri, dan pengaturan.
2. **Manajemen Data Ustadz (`/admin/ustadz`)**:
   - Daftar tabel seluruh ustadz dilengkapi pencarian nama/username dan paginasi interaktif.
   - Informasi jumlah santri binaan masing-masing ustadz secara dinamis.
   - Modal tambah ustadz dengan fitur generator username dan password otomatis.
   - Fitur edit data dan duplikasi data ustadz untuk percepatan input.
   - Penghapusan akun ustadz dengan konfirmasi keamanan.
3. **Manajemen Data Santri (`/admin/santri`)**:
   - Daftar tabel santri menampilkan ID Unik, Nama Lengkap, Nama Wali, dan Ustadz Pembimbing.
   - Generator ID Unik Santri otomatis berbasis tahun dan kode acak (contoh: `ST-2026-A1B2`).
   - Penugasan santri ke ustadz pembimbing via menu pilihan.
   - Fitur edit data santri dan duplikasi data santri.
   - Penghapusan data santri dengan konfirmasi keamanan.
4. **Pengaturan Lembaga & Sistem (`/admin/pengaturan`)**:
   - Form pembaruan nama lembaga / nama pondok pesantren (otomatis tersinkronisasi ke seluruh judul aplikasi).
   - Form ganti kata sandi superadmin dengan validasi kata sandi lama.
   - Panel pengujian koneksi backend API dan inisialisasi struktur sheet basis data.

### 4.3 Modul Workspace Ustadz (`/ustadz`)
1. **Formulir Cerdas Input Setoran**:
   - Pemilihan santri binaan melalui pencarian nama TomSelect yang cepat dan responsif.
   - Pengenalan Otomatis (*Smart Pin*): Ketika santri dipilih, sistem langsung membaca setoran terakhirnya dan menyediakan tombol "Pakai" untuk mengisi surat, juz, dan halaman lanjutan secara otomatis.
   - Pilihan jenis setoran bertombol sakelar: `Hafalan Baru` dan `Muroja'ah`.
   - Filter surat Al-Qur'an berdasarkan juz yang dipilih atau melihat semua 114 surat.
   - Batas maksimum ayat otomatis mengikuti jumlah ayat asli dari surat yang dipilih.
   - Opsi centang "1 Surat Penuh" untuk mengisi rentang ayat awal sampai akhir secara instan.
   - Pemilihan predikat hasil setoran: `Lancar` (hijau), `Kurang Lancar` (kuning), `Ulang` (merah).
   - Bidang catatan evaluasi ustadz opsional.
2. **Riwayat Setoran Ustadz**:
   - Menampilkan rekaman setoran yang diinput oleh ustadz tersebut pada hari berjalan.
   - Badge warna pembeda antara Hafalan Baru dan Muroja'ah serta ikon predikat kelancaran.

### 4.4 Modul Portal Wali Santri (`/wali`)
1. **Kartu Profil Santri**:
   - Menampilkan nama santri, ID unik santri, nama ustadz pembimbing, dan total akumulasi setoran yang telah diselesaikan.
2. **Linimasa Riwayat Setoran Anak**:
   - Kartu riwayat setiap kali setoran disimak oleh ustadz: nama surat, juz, rentang ayat, halaman mushaf, tanggal, predikat kelancaran, dan pesan evaluasi dari ustadz.
   - Tampilan status kosong (*empty state*) yang santun jika santri baru terdaftar dan belum memiliki riwayat setoran.

---

## 5. Persyaratan Non-Fungsional (Non-Functional Requirements)

1. **Kecepatan & Responsivitas**:
   - Seluruh aset statis dilayani dari Cloudflare Global CDN dalam hitungan milidetik.
   - Panggilan API ke Google Apps Script di-cache dan diteruskan secara efisien oleh Edge Worker.
2. **Kesesuaian Perangkat (Mobile-Friendly)**:
   - Antarmuka dirancang optimal untuk penggunaan tablet dan ponsel pintar ustadz saat berada di aula halaqah tahfidz.
   - Tombol sentuh memiliki ukuran ergonomis minimum 44 x 44 piksel.
3. **Kenyamanan Visual (Anti-Slop Design)**:
   - Menghindari warna neon silau dan hitam pekat murni (`#000000`).
   - Menggunakan palet bernuansa islami modern (Emerald dan Deep Slate).
   - Mendukung Dark Mode otomatis untuk penggunaan di malam hari setelah salat Maghrib dan Isya.
4. **Keandalan & Ketahanan Data**:
   - Data tersimpan secara permanen di Google Sheets milik yayasan sendiri.
   - Tidak ada ketergantungan pada basis data proprietary yang mengunci data (*no vendor lock-in*).
