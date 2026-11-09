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
   - Berkas frontend (`admin.html`, `js/admin.js`, `js/wali.js`) telah diperbarui dan siap digunakan secara langsung.
