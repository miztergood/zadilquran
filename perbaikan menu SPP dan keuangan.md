# TUGAS: Redesain UI/UX Menu "Keuangan & SPP" + Otomatisasi Penerbitan SPP Bulanan

Proyek: aplikasi manajemen pesantren **PPTQ Zadil Quran**.
Stack: HTML + Vanilla JS + Tailwind CDN (tanpa build step), backend Google Apps Script (`code.gs`) lewat reverse proxy Cloudflare Pages (`_worker.js`, endpoint `/api`). Data di Google Sheets.

Berkas relevan: `admin.html`, `js/admin.js`, `js/core.js`, `js/wali.js`, `wali.html`, `code.gs`, `config.js`, `design_system.md`, `PRD.md`.

## ATURAN KERJA (WAJIB)
1. **Baca dulu, ubah kemudian.** Baca `design_system.md`, `PRD.md`, `admin.html` (template `tpl-superadmin-keuangan`, modal `modalBuatTagihan` dan `modalBayarTagihan`), `js/admin.js` (bagian "MODUL 2: KEUANGAN & SPP"), `js/core.js` (`apiCall`, `formatRupiah`, `cetakKwitansiResmi`, `formatWaNumber`, `closeModal`, `AppNotify`), `code.gs` (blok "MANAJEMEN KEUANGAN & TAGIHAN SPP", `getPsbConfig`, `savePsbConfig`, `setupDatabase`, `SHEET_CONFIG`, `checkRole`, `safeExecute`), dan `js/wali.js` (render tagihan).
2. Ikuti gaya visual yang sudah ada: Tailwind, warna maroon `#9a2024` / `#480a0c` dan hijau `#1c6b45`, dukungan dark mode (`dark:` + `darkcard`/`darkborder`), ikon Font Awesome. **Mobile-first**: bendahara sering memakai HP.
3. Jangan memutus fitur yang sudah jalan: Tandai Lunas, Batal Lunas, Hapus, Kwitansi PDF, Pengingat WA, pagination, pencarian.
4. Jangan menambah dependensi/library baru. Semua kode harus lengkap dan berjalan; tidak ada placeholder atau TODO.
5. Kerjakan bertahap sesuai fase di bawah. Setelah tiap fase, jalankan pemeriksaan sintaks (`node --check js/admin.js`) dan rangkum perubahan.
6. Jangan mengubah URL backend atau konfigurasi proxy.

## FASE 0 — Perbaiki bug payload (verifikasi dulu)
Temuan dari pembacaan kode:
- `saveTagihan()` di `js/admin.js` mengirim `{ targetSantri, kategori, judulTagihan, nominal, jatuhTempo, status, metodeBayar, catatan }`.
- `createTagihan()` di `code.gs` membaca `payloadData.target === 'ALL_ACTIVE' || payloadData.idSantri === 'ALL_ACTIVE'` untuk mode massal, dan `payloadData.idSantri` untuk mode individu.
- Akibatnya `targetSantri` tidak pernah terbaca. Mode massal jatuh ke mode individu dan gagal validasi "Santri".

Langkah: verifikasi temuan ini dengan membaca kode. Jika benar, perbaiki secara **backward-compatible di backend**: di `createTagihan`, normalisasi `const target = payloadData.targetSantri || payloadData.target || payloadData.idSantri;` lalu pakai `target` untuk kedua mode. Frontend baru nanti mengirim `targetSantri` secara konsisten.

Masalah lain di `createTagihan` yang ikut diperbaiki:
- ID tagihan rawan bentrok: `"INV-" + 4/6 digit terakhir timestamp`. Ganti dengan generator ID unik (timestamp penuh + counter/random pendek), dan pastikan tetap berawalan `INV-`.
- Gunakan `LockService.getScriptLock()` (tunggu maks. 20 detik) di sekitar operasi tulis agar penerbitan bersamaan tidak membuat duplikat.
- Mode massal harus memakai `sheet.getRange(...).setValues()` sekali tulis, bukan `appendRow` per baris (lebih cepat dan atomik).

## FASE 1 — Backend: kolom Periode + penerbitan SPP idempoten + auto-trigger
Tujuan: SPP bulanan terbit otomatis tanpa klik manual, dan tidak pernah dobel.

1. **Kolom baru `Periode`** (format `YYYY-MM`, contoh `2026-11`) pada sheet `Data_Tagihan`:
   - Tambahkan ke `SHEET_CONFIG["Data_Tagihan"]`. Pastikan `setupDatabase()` menambahkan kolom yang belum ada tanpa menghapus data lama.
   - Backfill data lama: untuk baris berkategori `Syahriyah (SPP)` yang `Periode`-nya kosong, parse bulan dan tahun dari `Judul_Tagihan` (contoh "Syahriyah (SPP) Bulan November 2026", nama bulan bahasa Indonesia). Jika tidak bisa diparse, biarkan kosong.
   - `createTagihan` menerima field opsional `periode` dan menyimpannya.
   - Sesuaikan juga `registerSantri`/pendaftaran online (sekitar baris 525–567) agar tagihan "Syahriyah (SPP) Bulan Pertama" mengisi `Periode` bulan berjalan.

2. **Konfigurasi aturan SPP** disimpan di sheet `Pengaturan` dengan key baru `Config_SPP` (JSON string), kolom `Key | Value | Timestamp`:
   ```json
   { "nominal": 200000, "hariTerbit": 1, "hariTempo": 10, "otomatis": true, "kategori": "Syahriyah (SPP)", "catatan": "SPP Bulanan Santri Mukim" }
   ```
   Nominal default diambil dari `psbConfig.sppBulanan` bila `Config_SPP` belum ada. Tambahkan action `getSppConfig` dan `saveSppConfig` (hanya `superadmin`, pola sama dengan `getPsbConfig`/`savePsbConfig`) dan daftarkan di router `doPost`. Saat `saveSppConfig` dipanggil dengan `otomatis: true`, pastikan trigger terpasang (lihat poin 4); saat `false`, hapus trigger.

3. **Fungsi inti idempoten** `terbitkanSppPeriode_(periode, opsi)`:
   - Input: `periode` (`YYYY-MM`), konfigurasi, dan opsi `{ hanyaSantriIds }` bila perlu.
   - Ambil santri berstatus Aktif (`(s.Status || 'Aktif').toLowerCase() === 'aktif'`).
   - Lewati santri yang sudah punya tagihan berkategori SPP dengan `Periode` yang sama.
   - Buat judul `Syahriyah (SPP) Bulan {NamaBulanID} {Tahun}` dan jatuh tempo `{hariTempo} {NamaBulanID} {Tahun}` (format teks sama dengan data lama, jangan diubah).
   - Tulis sekaligus dengan `setValues`, dalam `LockService`. Kembalikan `{ dibuat, dilewati, periode }`.
   - Jika `hariTempo` jatuh di luar jumlah hari bulan tersebut, gunakan hari terakhir bulan itu.

4. **Fungsi trigger tanpa token** `autoTerbitSppHarian()`:
   - Dipanggil Time-driven Trigger harian (sekitar pukul 01:00–02:00, zona waktu skrip).
   - Baca `Config_SPP`; jika `otomatis` false atau hari ini < `hariTerbit`, keluar.
   - Panggil `terbitkanSppPeriode_` untuk bulan berjalan. Karena idempoten, boleh berjalan tiap hari: santri baru di tengah bulan otomatis ikut tertagih.
   - Bungkus `try/catch` dan catat hasilnya ke `Logger`.
   - Fungsi ini tidak boleh bisa dipanggil dari router publik `doPost`.

5. **Pasang/hapus trigger**: tambahkan `pasangTriggerSpp_()` dan `hapusTriggerSpp_()` memakai `ScriptApp`. Pastikan tidak terbentuk trigger ganda: cek `ScriptApp.getProjectTriggers()` berdasarkan nama handler.

6. **Action baru untuk UI** (hanya `superadmin`):
   - `getStatusSpp(token, periode)`: mengembalikan `{ periode, totalAktif, sudahDitagih, belumDitagih: [ID_Santri...], nominal, otomatis }`.
   - `terbitkanSppSekarang(token, periode)`: memanggil `terbitkanSppPeriode_` (tombol "Terbitkan sekarang" / susulan).

## FASE 2 — Frontend: redesain halaman Keuangan & SPP
Ganti template `tpl-superadmin-keuangan` dan modul "MODUL 2" di `js/admin.js`. Masalah UX saat ini: SPP rutin tapi harus diterbitkan manual lewat modal; tabel datar satu baris per tagihan; empty state kosong; dua tombol aksi setara; nominal 200.000 hardcoded di modal; tanggal tempo diketik bebas.

### 2.1 Header
- Judul + subjudul tetap. **Satu tombol utama**: "Buat Tagihan" (untuk tagihan khusus: pendaftaran, almari, infaq, kitab, kesehatan, dll.). Hapus tombol "Terbitkan SPP Massal" dari header.
- Tombol sekunder berikon gir: **"Aturan SPP"** (membuka modal pengaturan, lihat 2.5).
- Navigasi periode: `‹  November 2026  ›` plus tombol "Bulan ini". Seluruh kartu dan daftar mengikuti periode terpilih.

### 2.2 Kartu status SPP otomatis (pengganti tombol massal)
Satu kartu lebar di bawah header, berdasarkan `getStatusSpp(periode)`:
- Kondisi lengkap: "✓ SPP November 2026 sudah terbit untuk 45 dari 45 santri aktif" + chip "Otomatis aktif · terbit tgl 1".
- Kondisi ada yang belum ditagih: banner kuning "3 santri belum punya tagihan SPP November 2026" + tombol **"Terbitkan sekarang"** (dialog konfirmasi yang menampilkan jumlah santri, nominal, dan tanggal jatuh tempo).
- Kondisi otomatis nonaktif: banner netral "Penerbitan otomatis nonaktif" + tombol "Aktifkan" yang membuka modal Aturan SPP.
- Bar progres pelunasan periode: `lunas / total` beserta persen.

### 2.3 Kartu ringkasan (3 kartu, mobile grid 2 kolom seperti sekarang)
Untuk periode terpilih: **Terkumpul** (Rp lunas), **Belum Lunas** (Rp), **Menunggak** (jumlah santri dengan tagihan lewat jatuh tempo). Hitung periode tagihan dari kolom `Periode`; jika kosong, parse dari `Judul_Tagihan`/`Jatuh_Tempo` (nama bulan Indonesia), dan kalau tetap gagal masukkan ke grup "Tanpa periode".

### 2.4 Tiga tab
1. **Perlu Ditagih** (default): tagihan berstatus Belum Lunas, urut jatuh tempo terdekat; yang lewat tempo diberi chip merah "Terlambat N hari". Tiap item berupa **kartu responsif** (satu markup yang menjadi baris di desktop dan kartu bertumpuk di mobile), bukan tabel lebar: nama santri + ID, judul, nominal, status, tombol **Lunas** (utama), **WA** (pengingat), dan menu "⋯" untuk Hapus. Sertakan pencarian cepat dan chip filter kategori (Semua / SPP / Biaya lain).
2. **Matriks SPP**: baris = santri aktif, kolom = 12 bulan pada tahun terpilih (dengan pemilih tahun). Sel: ✓ hijau (lunas), ● merah (belum lunas, lewat tempo), ● kuning (belum lunas, belum tempo), – abu (belum ada tagihan). Kolom nama sticky dan `overflow-x-auto`. Klik sel: belum lunas membuka modal Lunas, lunas memunculkan opsi Kwitansi, kosong menawarkan "Terbitkan tagihan bulan ini untuk santri ini". Tambahkan pencarian santri dan baris total per bulan.
3. **Semua Tagihan**: daftar lengkap dengan pencarian, filter status berbentuk chip (Semua / Belum Lunas / Lunas), filter periode, dan pagination yang ada. Boleh mempertahankan struktur tabel lama di desktop, dengan padanan kartu di mobile.

### 2.5 Modal "Aturan SPP"
Form: toggle **Terbitkan otomatis**, **Nominal SPP** (default dari `sppBulanan`), **Tanggal terbit** (1–28), **Tanggal jatuh tempo** (1–28), catatan default. Tombol Simpan memanggil `saveSppConfig`. Tampilkan teks bantu: "Sistem menerbitkan SPP otomatis tiap bulan. Santri baru di tengah bulan ikut tertagih otomatis." Setelah simpan, muat ulang kartu status. Jika Anda juga menyimpan nominal di `psbConfig.sppBulanan`, sinkronkan keduanya.

### 2.6 Modal "Buat Tagihan" (tagihan khusus)
Pertahankan preset kategori yang ada, tetapi:
- Hapus mode massal dari modal ini. Pilih santri lewat select yang bisa dicari (atau input dengan datalist).
- Ganti input teks "Jatuh Tempo" dengan **`<input type="date">`**, lalu konversi ke teks `D NamaBulan YYYY` (Bahasa Indonesia) sebelum dikirim agar kompatibel dengan data lama dan `wali.js`.
- Kirim `targetSantri`, dan `periode` bila kategorinya SPP.

### 2.7 Empty state & loading
- Setiap tab punya empty state informatif beserta aksi, contoh: "Belum ada tagihan periode ini. Aktifkan SPP otomatis atau terbitkan manual."
- Tampilkan skeleton sederhana saat `refreshAdminData()` berjalan.
- Hindari render ulang seluruh halaman setelah aksi kecil bila memungkinkan; setidaknya jaga posisi tab dan periode yang sedang aktif setelah `refreshAdminData()`.

### 2.8 Kode lama
Hapus fungsi dan elemen yang tidak lagi dipakai (`openModalTagihan('MASSAL')`, pilihan `ALL_ACTIVE` di modal, tabel lama bila sepenuhnya digantikan), tetapi pertahankan `openModalBayar`, `confirmBayarTagihan`, `batalLunasTagihan`, `deleteTagihanAction`, `cetakKwitansiAdmin`, `kirimWaTagihan` (boleh dirapikan). Perbarui statistik dashboard (`statKeuanganMasuk`) bila terdampak.

## FASE 3 — Polesan portal wali (`wali.html` / `js/wali.js`)
- Pada daftar tagihan, tampilkan penanda **"Jatuh tempo X hari lagi"** (kuning) atau **"Terlambat X hari"** (merah) berdasarkan parse `Jatuh_Tempo`.
- Urutkan tagihan belum lunas di atas, lalu yang lunas.
- Jadikan tombol "Konfirmasi Pembayaran via WhatsApp" lebih menonjol (sticky di bawah tab Keuangan pada mobile), dan isi pesan WA otomatis dengan tagihan belum lunas teratas.
- Pertahankan badge jumlah tagihan, tombol kwitansi PDF, dan informasi pembayaran resmi.

## FASE 4 — Verifikasi & serah terima
1. `node --check` untuk semua berkas JS. Pastikan `code.gs` tidak punya error sintaks yang jelas (nama fungsi ganda, kurung tak seimbang).
2. Telusuri secara manual (baca kode) skenario berikut dan laporkan hasilnya:
   - Penerbitan manual dua kali untuk periode yang sama tidak menghasilkan tagihan ganda.
   - Santri berstatus selain Aktif tidak ditagih.
   - Santri baru di tengah bulan ikut tertagih pada eksekusi trigger berikutnya.
   - Data lama tanpa kolom `Periode` tetap tampil dan terkelompok benar.
   - Tampilan 360px (mobile) dan dark mode tidak overflow.
3. Buat berkas `CHANGELOG-keuangan.md` yang berisi: daftar berkas yang diubah, action backend baru (`getSppConfig`, `saveSppConfig`, `getStatusSpp`, `terbitkanSppSekarang`, `autoTerbitSppHarian`), struktur `Config_SPP`, kolom `Periode`, dan **langkah deploy**:
   - Salin `code.gs` ke Apps Script lalu **deploy versi baru** dari Web App yang sama agar URL tidak berubah.
   - Jalankan "Setup Database" dari menu Pengaturan untuk menambah kolom `Periode`.
   - Buka Keuangan → Aturan SPP, aktifkan otomatis, lalu simpan agar trigger harian terpasang.
   - Authorize izin tambahan (trigger) saat diminta Google.
   - Cache `sw.js`: naikkan versi cache bila service worker meng-cache `js/admin.js` agar pembaruan sampai ke pengguna PWA.

## YANG TIDAK BOLEH DILAKUKAN
- Jangan mengubah struktur kolom lama pada `Data_Tagihan` (hanya menambah `Periode`).
- Jangan menghapus atau memodifikasi data tagihan yang sudah ada selain mengisi `Periode` pada backfill.
- Jangan membuka endpoint tanpa `checkRole` untuk aksi tulis, kecuali fungsi trigger yang tidak terdaftar di router.
- Jangan menambah framework JS, bundler, atau library eksternal baru.