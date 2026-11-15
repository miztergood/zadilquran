# CHANGELOG: Redesain Keuangan & Otomasi SPP Bulanan
**Pondok Pesantren Tahfizh Zadil Qur'an (PPTQ Zadil Qur'an)**  
*Dokumentasi Pembaruan Fitur Keuangan & SPP Bulanan*

---

## 📌 Ringkasan Pembaruan
Pembaruan ini menyelesaikan permasalahan alur keuangan manual dan inkonsistensi payload, serta menghadirkan sistem penerbitan SPP otomatis berbasis jadwal kalender, matriks pembayaran tahunan (12 bulan), penagihan cerdas dengan indikator keterlambatan (overdue counter), dan pengalaman portal wali yang lebih intuitif.

---

## 📂 Berkas yang Diubah / Ditambahkan
1. **`code.gs`** (Backend Google Apps Script)
   - Penambahan kolom `"Periode"` (`YYYY-MM`) pada konfigurasi sheet `Data_Tagihan`.
   - Penambahan inisialisasi tabel `Config_SPP` di sheet `Pengaturan`.
   - Fungsi migrasi/backfill otomatis di `setupDatabase()` untuk mengisi `Periode` pada data lama.
   - Pemasangan trigger harian Apps Script (`autoTerbitSppHarian`) dengan fungsi `pasangTriggerSpp_()` & `hapusTriggerSpp_()`.
   - Core engine penerbitan SPP idempoten: `terbitkanSppPeriode_(periode, opsi)`.
   - Routing action baru di `doPost`: `getSppConfig`, `saveSppConfig`, `getStatusSpp`, `terbitkanSppSekarang`.
   - Perbaikan payload normalization (`targetSantri || target || idSantri`), integrasi `LockService`, pencegahan tabrakan ID (`INV-...`), dan optimasi batch `setValues()`.
   - Integrasi santri baru PSB online (`registerCalonSantriOnline`) dengan kolom `Periode`.

2. **`admin.html`** (Frontend Dashboard Admin)
   - Penggantian template `tpl-superadmin-keuangan` dengan tata letak modular baru:
     - Header dengan **Navigasi Periode** (`‹ Bulan Tahun ›` & tombol "Bulan Ini").
     - Tombol sekunder **Aturan SPP** dan tombol utama **Buat Tagihan**.
     - **Kartu Lebar Status SPP**: menampilkan status kelengkapan penerbitan SPP bulan berjalan, progress bar, dan tombol "Terbitkan Sekarang" jika belum lengkap.
     - **3 Kartu Ringkasan KPI**: Terkumpul (Lunas), Belum Lunas, dan Menunggak (Lewat Tempo).
     - **3 Tab Keuangan**:
       1. *Perlu Ditagih* (filter kategori chip, card list dengan status keterlambatan, tombol Sahkan Lunas, WA, & Hapus).
       2. *Matriks SPP 12 Bulan* (tabel grid Jan–Des dengan nama santri sticky, ikon status ✓, ●, –, dan quick-generate).
       3. *Semua Tagihan* (tabel desktop & kartu mobile, filter status, pencarian, dan paginasi).
   - Modal baru: `#modalAturanSpp` (konfigurasi toggle otomatis, nominal, tgl terbit, tgl tempo, catatan).
   - Pembaruan `#modalBuatTagihan`: pemilihan santri satuan (menghapus opsi massal manual) dan date-picker HTML5.

3. **`js/admin.js`** (Logika Keuangan Admin)
   - Implementasi state global: `currentKeuanganPeriode`, `currentMatriksTahun`, `currentKeuanganTab`, filter chips.
   - Helper parsing tanggal Indonesia dan perhitungan status keterlambatan (`hitungKeterlambatan`).
   - Handler `renderKeuanganView()` dan integrasi dengan pemanggil lama `renderTableTagihan()`.
   - Handler kartu status SPP dinamis (`renderCardStatusSpp()`) & konfirmasi penerbitan (`konfirmasiTerbitkanSppSekarang()`).
   - Handler Tab 1 (`renderTabPerluDitagih()`), Tab 2 (`renderTabMatriksSpp()`), dan Tab 3 (`renderTabSemuaTagihan()`).
   - Quick generator SPP satuan dari matriks: `terbitkanSppSantriBulan(idSantri, periode)`.
   - Modal handlers untuk Aturan SPP (`openModalAturanSpp()`, `saveAturanSppAction()`) dan Buat Tagihan (`openModalTagihan()`, `saveTagihan()`).

4. **`js/wali.js`** & **`wali.html`** (Portal Wali Santri)
   - Pengurutan tagihan cerdas: tagihan **Belum Lunas** selalu berada di atas (prioritas terlambat terbanyak, lalu tempo terdekat), diikuti tagihan yang telah Lunas.
   - Penambahan chip status jatuh tempo:
     - Merah: `Terlambat X hari` (jika lewat tempo).
     - Kuning: `Jatuh tempo X hari lagi` (jika H-7 sebelum tempo).
     - Hijau: `LUNAS`.
   - Tombol konfirmasi WhatsApp di setiap kartu belum lunas dan tombol utama yang otomatis memuat rincian tagihan teratas.

---

## 🛠️ Panduan Penerapan (Deployment Instructions)
Untuk memperbarui sistem yang sedang berjalan di Google Apps Script:

1. **Buka Script Editor Google Spreadsheet**:
   - Buka Google Spreadsheet database Zadil Qur'an.
   - Pilih menu **Extensions** > **Apps Script**.
2. **Perbarui `code.gs`**:
   - Salin seluruh isi berkas `code.gs` lokal dan gantikan isi di Google Apps Script editor.
   - Simpan berkas (`Ctrl + S` atau ikon disket).
3. **Jalankan Fungsi Migrasi**:
   - Pada dropdown pilihan fungsi di toolbar Apps Script, pilih fungsi `setupDatabase`.
   - Klik **Run** (Jalankan).
   - Fungsi ini akan otomatis:
     - Menambahkan kolom `Periode` di sheet `Data_Tagihan`.
     - Mengisi kolom `Periode` untuk tagihan-tagihan SPP yang sudah ada.
     - Menyiapkan baris `Config_SPP` di sheet `Pengaturan`.
     - Memasang trigger harian otomatis `autoTerbitSppHarian`.
4. **Deploy Versi Baru Web App**:
   - Klik tombol **Deploy** di kanan atas > **Manage deployments**.
   - Klik ikon pensil (Edit) pada deployment aktif.
   - Pada dropdown **Version**, pilih **New version**.
   - Klik **Deploy**.
5. **Frontend Web**:
   - Berkas frontend (`admin.html`, `js/admin.js`, `js/wali.js`, `wali.html`, `js/core.js`) telah diperbarui dan siap digunakan secara langsung.

---

## 💰 Pembaruan Lanjutan: Modul Titipan & Uang Saku Santri serta Keperluan Lain

### A. Latar Belakang & Masalah
Selain pembayaran rutin SPP dan biaya pendaftaran, wali santri kerap mentransfer dana untuk:
1. **Titipan Uang Saku Santri (Pocket Money)**: Bukan pendapatan pondok, melainkan titipan dana amanah untuk uang jajan atau kebutuhan harian santri yang dicairkan bertahap.
2. **Keperluan Insidental & Non-SPP**: Biaya rihlah/kegiatan, wisuda/khotmil Qur'an, seragam/kitab tambahan, pengobatan santri, atau infaq/donasi sukarela.

### B. Fitur & Penyesuaian yang Diterapkan
1. **Backend Google Apps Script (`code.gs`)**:
   - Penambahan sheet baru `"Data_Uang_Saku"` pada `SHEET_CONFIG` (`ID_Transaksi`, `ID_Santri`, `Tanggal`, `Jenis`, `Nominal`, `Saldo_Akhir`, `Keterangan`, `Dicatat_Oleh`, `Timestamp`).
   - Endpoint API baru:
     - `catatMutasiUangSaku(token, payload)`: Pencatatan mutasi MASUK (top-up) dan KELUAR (pencairan) dengan atomic `LockService` dan validasi saldo mencukupi.
     - `deleteMutasiUangSaku(token, idTransaksi)`: Penghapusan transaksi dan rekalkulasi otomatis saldo santri.
     - `getUangSakuSantri(token, idSantri)`: Pengambilan saldo dan mutasi dengan proteksi IDOR.
   - Pembaruan `fetchAppData` dan `fetchWaliData` untuk menyertakan data uang saku secara langsung.

2. **Panel Admin (`admin.html` & `js/admin.js`)**:
   - **Tab 4 Keuangan: "Titipan & Uang Saku"**:
     - Kartu ringkasan total dana titipan santri aktif, total masuk, dan total pencairan.
     - Daftar saldo per santri dengan indikator status (*Saldo Aman*, *Saldo Menipis*, *Saldo Kosong*).
     - Tombol aksi cepat: *Catat Uang Masuk* & *Catat Pencairan*.
     - Modal **Buku Tabungan / Riwayat Mutasi** per santri dengan opsi cetak bukti tanda terima dan hapus transaksi.
   - Perluasan kategori tagihan fleksibel di Modal Buat Tagihan:
     - *Kegiatan & Rihlah*
     - *Wisuda & Tasmi / Khotmil Qur'an*
     - *Seragam & Atribut*
     - *Infaq & Donasi Sukarela*
     - *Biaya Lainnya (Custom)*

3. **Portal Wali Santri (`wali.html` & `js/wali.js`)**:
   - Sub-tab navigasi di menu Keuangan: **"Tagihan & SPP"** vs **"Uang Saku & Tabungan"**.
   - Tampilan **Dompet Uang Saku Santri** bergradien modern dengan sisa saldo *realtime*.
   - Tombol cepat **"Konfirmasi Transfer Uang Saku"** via WhatsApp ke bendahara dengan draf pesan otomatis.
   - Daftar mutasi uang saku (kredit masuk hijau, debit keluar merah) dan sisa saldo berjalan.
   - Tombol cetak/unduh **"Tanda Terima Titipan Uang Saku"** resmi untuk setiap transaksi masuk.

4. **Generator Kwitansi Resmi (`js/core.js`)**:
   - Adaptasi `generateKwitansiCardHtml` agar otomatis mencetak dokumen dengan judul *"Tanda Terima Titipan Uang Saku"* saat mencetak bukti titipan uang saku.

5. **Pengujian Otomatis (`tests/uang-saku.test.js`)**:
   - 4 skenario uji baru: verifikasi teks tanda terima, tombol aksi cetak/unduh, kalkulasi saldo berjalan, dan pencegahan penarikan melebihi saldo. Seluruh 89 tes vitest lolos (100% pass).
