# Rencana Pengembangan: Sistem Mutaba'ah Setoran Harian Santri
# Pondok Pesantren Tahfizh Zadil Qur'an

**Tanggal Penyusunan**: 08 November 2026 (081126)  
**Dokumen Referensi**: Foto Lembar Mutaba'ah Fisik Pesantren (`Setoran-hafalan.jpg`)  
**Status**: Tersimpan (Menunggu Konfirmasi Eksekusi dari Pengguna)  

---

## 1. Latar Belakang & Analisis Dokumen Fisik

Berdasarkan dokumen fisik `Setoran-hafalan.jpg`, buku mutaba'ah harian santri Pondok Pesantren Tahfizh Zadil Qur'an memiliki komponen penting yang akan ditransformasikan ke dalam sistem digital:

### A. Header Dokumen:
1. **Nama Santri**: Mengaitkan setoran dengan akun santri yang dipilih.
2. **Tingkatan (Al-Qur'an / Jilid)**:
   - **Al-Qur'an**: Santri yang telah memasuki hafalan 30 Juz Al-Qur'an (memilih Juz 1-30, Surah 1-114, Ayat, dan Halaman).
   - **Jilid**: Santri tahsin dasar / pra-tahfizh (Iqro, Tilawati, Yanbu'a Jilid 1 s.d. 6, materi pokok, dan halaman).

### B. Tabel Catatan Harian (6 Kolom Utama):
1. **TM (Tatap Muka)**: Nomor pertemuan harian santri atau penanda sesi halaqah harian (contoh: "TM-1", "TM-2", atau "Sesi Pagi / Sore / Malam").
2. **Tanggal**: Tanggal dan jam setoran disimak oleh ustadz.
3. **Surat / Jilid**: Nama surah Al-Qur'an atau nomor jilid materi dasar.
4. **Ayat / Hal**: Rentang ayat (contoh: Ayat 1-25) atau nomor halaman buku materi / mushaf.
5. **Nilai / Predikat**: Standar penilaian kelancaran bacaan dan hafalan:
   - **Mumtaz**: Lancar, makhraj dan tajwid fasih tanpa cela (Nilai A).
   - **Jayyid**: Cukup lancar, ada 1-2 catatan kecil waqaf/ibtida (Nilai B).
   - **Dhoif / Ulang**: Belum lancar, perlu mengulang setoran di halaqah berikutnya (Nilai C).
6. **Paraf Ustadz**: Tanda tangan/paraf digital verifikasi pembimbing (tersimpan otomatis atas nama dan ID ustadz yang login).

### C. 3 Kategori Setoran Utama:
1. **Ziyadah**: Menambah hafalan baru (ayat atau halaman baru yang pertama kali disetorkan ke ustadz).
2. **Murojaah**: Mengulang hafalan yang sudah pernah disetor agar tetap mutqin (kokoh melekat di ingatan).
3. **Binnadhor**: Membaca Al-Qur'an atau materi jilid secara *binnadhor* (dengan melihat teks/mushaf langsung di depan ustadz) untuk memastikan kebenaran makhraj, tajwid, dan kelancaran sebelum dihafalkan secara *bil ghoib* (hafalan).

### D. Footer Lembar Mutaba'ah:
1. **Catatan Ustadz / Ustadzah**: Ruang evaluasi khusus makhraj, tajwid, waqaf, serta motivasi adab.
2. **Ttd Pengampu**: Verifikasi ustadz pembimbing.
3. **Kutipan Hadits HR. Muslim**:
   *"Bacalah Al-Qur'an karena dia akan datang pada hari kiamat sebagai penolong bagi pembacanya."* (HR. Muslim).

---

## 2. Arsitektur Data & Skema Database Baru

### Sheet `Data_Setoran` (Google Sheets):
Skema kolom pada `Code.gs` dan Google Sheets diperluas agar memuat seluruh elemen buku fisik:

| No | Nama Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- | :--- |
| 1 | `ID_Setoran` | String | ID Unik setoran (contoh: `SET-1731056789123`) |
| 2 | `ID_Santri` | String | ID Santri binaan (contoh: `ZQ-2026-X8K9`) |
| 3 | `ID_Ustadz` | String | ID Ustadz pengampu (contoh: `U-001`) |
| 4 | `Tingkatan` | String | `"Al-Qur'an"` atau `"Jilid"` |
| 5 | `TM` | String | Sesi Tatap Muka (contoh: `"TM-15"` atau `"Sesi Pagi"`) |
| 6 | `Jenis` | String | `"Ziyadah"`, `"Murojaah"`, atau `"Binnadhor"` |
| 7 | `Juz` | String | Nomor Juz (1-30) atau Tingkat Jilid (1-6) |
| 8 | `Surah` | String | Nama Surah Al-Qur'an atau Nama Buku Jilid |
| 9 | `SurahNo` | Number/String | Nomor urut surah (1-114) atau index materi |
| 10 | `Ayat` | String | Rentang ayat yang disetor (contoh: `"1 - 25"`) |
| 11 | `Halaman` | String | Halaman mushaf Madinah atau halaman buku jilid |
| 12 | `Nilai` | String | `"Mumtaz"` (Lancar), `"Jayyid"` (Cukup), `"Dhoif"` (Ulang) |
| 13 | `Catatan` | String | Evaluasi tajwid, waqaf, dan pesan ustadz |
| 14 | `Tanggal` | String | Waktu pencatatan format lokal Indonesia |
| 15 | `ParafUstadz` | String | Nama ustadz pembimbing yang menyimak dan mengesahkan |

---

## 3. Wireframe ASCII Antarmuka

### A. Wireframe Smart Form Ustadz (Input Setoran Harian)

```text
┌────────────────────────────────────────────────────────────────────────┐
│ WORKSPACE USTADZ: Form Input Setoran Harian                            │
├────────────────────────────────────────────────────────────────────────┤
│ [ Tanggal & Waktu ]: [ 08/11/2026, 15:30      ▼ ]                      │
│ [ Santri Binaan   ]: [ Pilih Santri (Contoh: Ahmad Fauzan)        ▼ ]  │
│                                                                        │
│ 📌 Lanjutan Terakhir: An-Naba (Juz 30) Hal 582, Ayat 1-20   [ Gunakan ] │
├────────────────────────────────────────────────────────────────────────┤
│ 1. TINGKATAN SANTRI:                                                   │
│    (o) Al-Qur'an (30 Juz)             ( ) Jilid (Iqro / Tilawati / dll)│
│                                                                        │
│ 2. JENIS SETORAN (Pilih Salah Satu):                                   │
│    ┌──────────────┬────────────────────────┬────────────────────────┐  │
│    │  ✨ ZIYADAH   │      🔄 MUROJAAH       │      📖 BINNADHOR      │  │
│    │ (Hafalan Baru)│ (Pengulangan Hafalan)  │ (Melihat Mushaf/Jilid) │  │
│    └──────────────┴────────────────────────┴────────────────────────┘  │
│                                                                        │
│ 3. TATAP MUKA (TM):                                                    │
│    [ TM-15 / Sesi Sore (Halaqah Asar)                             ]    │
│                                                                        │
│ 4. DETAIL CAKUPAN BACAAN / HAFALAN:                                    │
│    ┌───────────────────────────┬──────────────────────────────────┐    │
│    │ Juz / Tingkat Jilid:      │ Nama Surat / Materi:             │    │
│    │ [ Juz 30                ▼ ]│ [ An-Naba' (Surat ke-78)       ▼ ]│    │
│    └───────────────────────────┴──────────────────────────────────┘    │
│    ┌───────────────────────────┬──────────────────────────────────┐    │
│    │ Rentang Ayat:             │ Halaman Mushaf / Jilid:          │    │
│    │ [ 1 ] s.d. [ 20 ]         │ [ 582 ]                          │    │
│    └───────────────────────────┴──────────────────────────────────┘    │
│                                                                        │
│ 5. PENILAIAN / PREDIKAT KELANCARAN:                                    │
│    ┌─────────────────────┬──────────────────────┬────────────────────┐ │
│    │ (o) 🟢 Mumtaz       │ ( ) 🟡 Jayyid        │ ( ) 🔴 Dhoif       │ │
│    │     (Sangat Lancar) │     (Cukup Lancar)   │     (Perlu Ulang)  │ │
│    └─────────────────────┴──────────────────────┴────────────────────┘ │
│                                                                        │
│ 6. CATATAN USTADZ / EVALUASI TAJWID:                                   │
│    [ Perhatikan ghunnah nun bertasydid dan panjang mad thobi'i    ]    │
│                                                                        │
│ [ SIMPAN SETORAN & BERIKAN PARAF DIGITAL ] (Warna Utama #9a2024)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

### B. Wireframe Lembar Mutaba'ah Digital (Portal Wali Santri & Riwayat Ustadz)

Mengadopsi tata letak lembar buku mutaba'ah fisik `Setoran-hafalan.jpg` dalam format digital mobile-first:

```text
┌─────────────────────────────────────────────────────────┐
│ ZADIL QUR'AN - BUKU MUTABA'AH DIGITAL                   │
├─────────────────────────────────────────────────────────┤
│ Nama Santri : Ahmad Fauzan                              │
│ ID Santri   : ST-0021                [ Salin ID ]       │
│ Tingkatan   : Al-Qur'an (30 Juz)                        │
│ Pembimbing  : Ustadz M. Mujahidin Al Hafidz             │
├─────────────────────────────────────────────────────────┤
│ RINGKASAN CAPAIAN:                                      │
│ ┌──────────────┬──────────────┬──────────────┬────────┐ │
│ │ Total Setor  │ Ziyadah      │ Murojaah     │Binnador│ │
│ │ 42 Sesi      │ 18 Sesi      │ 16 Sesi      │ 8 Sesi │ │
│ └──────────────┴──────────────┴──────────────┴────────┘ │
│                                                         │
│ [ Bagikan Rapor Mutaba'ah ke WhatsApp Keluarga ]        │
├─────────────────────────────────────────────────────────┤
│ FILTER MUTABA'AH:                                       │
│ [ SEMUA ]  [ ZIYADAH ]  [ MUROJAAH ]  [ BINNADHOR ]     │
├─────────────────────────────────────────────────────────┤
│ CATATAN SETORAN HARIAN (Seperti Lembar Buku Fisik):     │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ TM: TM-15 • 08 Nov 2026, 15:30      [ ZIYADAH ]     │ │
│ │ Surat/Jilid : An-Naba' (Juz 30)                     │ │
│ │ Ayat / Hal  : Ayat 1-20 | Halaman 582               │ │
│ │ Nilai       : 🟢 Mumtaz (Lancar)                    │ │
│ │ Catatan     : "Makhraj nun tasydid sudah baik."     │ │
│ │ Paraf       : Disahkan Ustadz M. Mujahidin ✔        │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ TM: TM-14 • 07 Nov 2026, 19:45      [ BINNADHOR ]   │ │
│ │ Surat/Jilid : Al-Mulk (Juz 29)                      │ │
│ │ Ayat / Hal  : Ayat 1-30 (1 Surat) | Halaman 562     │ │
│ │ Nilai       : 🟢 Mumtaz (Lancar)                    │ │
│ │ Catatan     : "Bacaan tartil, waqaf tepat."         │ │
│ │ Paraf       : Disahkan Ustadz M. Mujahidin ✔        │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ TM: TM-13 • 07 Nov 2026, 05:30      [ MUROJAAH ]    │ │
│ │ Surat/Jilid : An-Nazi'at (Juz 30)                   │ │
│ │ Ayat / Hal  : Ayat 1-46 | Halaman 583-584           │ │
│ │ Nilai       : 🟡 Jayyid (Cukup)                     │ │
│ │ Catatan     : "Ayat 25-30 perlu diulang kembali."   │ │
│ │ Paraf       : Disahkan Ustadz M. Mujahidin ✔        │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ FOOTER BUKU MUTABA'AH (Sesuai Hadits Fisik):            │
│ "Bacalah Al-Qur'an karena dia akan datang pada hari     │
│  kiamat sebagai penolong bagi pembacanya."              │
│ (HR. Muslim)                                            │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Rencana Kerja Eksekusi (Checklist Tahapan)

Saat pengguna siap untuk melanjutkan implementasi, langkah-langkah kerja yang akan dieksekusi adalah sebagai berikut:

- [ ] **Langkah 1: Perluasan Skema Google Apps Script (`Code.gs`)**
  - Menyesuaikan `SHEET_CONFIG["Data_Setoran"]` dengan 15 kolom baru.
  - Memperbarui fungsi `saveSetoran(token, dataSetoran)` untuk menyimpan `tingkatan`, `tm`, `nilai`, dan `parafUstadz`.
  - Menjaga kompatibilitas mundur (*backward compatibility*) untuk data historis lama.

- [ ] **Langkah 2: Pembaruan Form Input Ustadz (`index.html`)**
  - Menambahkan radio switch pemilihan **Tingkatan** (Al-Qur'an vs Jilid).
  - Mengubah pemilih jenis setoran menjadi 3 tab interaktif: **Ziyadah**, **Murojaah**, dan **Binnadhor**.
  - Menambahkan input nomor sesi **Tatap Muka (TM)** dengan penomoran otomatis.
  - Menyesuaikan opsi penilaian predikat menjadi **Mumtaz (Lancar)**, **Jayyid (Cukup)**, dan **Dhoif (Ulang)**.

- [ ] **Langkah 3: Pembaruan Tampilan Mutaba'ah Wali Santri (`index.html`)**
  - Menampilkan ringkasan 3 pilar utama: Total Ziyadah, Total Murojaah, dan Total Binnadhor.
  - Menambahkan filter 4 tab: Semua, Ziyadah, Murojaah, Binnadhor.
  - Mengubah tampilan kartu linimasa menjadi format kartu buku mutaba'ah fisik lengkap dengan TM, Surat/Jilid, Ayat/Hal, Nilai, Paraf Ustadz, dan Catatan Ustadz.
  - Menambahkan kutipan Hadits HR. Muslim di bagian bawah halaman.

- [ ] **Langkah 4: Pembaruan Format Bagikan WhatsApp (`shareProgressWa()`)**
  - Memformat pesan WhatsApp laporan mutaba'ah agar mencakup rincian Ziyadah, Murojaah, Binnadhor, dan setoran terakhir.

- [ ] **Langkah 5: Pembaruan Dokumen PRD, Desain Sistem, dan Log**
  - Memperbarui `PRD.md`, `DESIGN_SISTEM.md`, `plan.md`, dan `logs/log-zadil-quran.081126.md`.
  - Melakukan uji sintaks JavaScript (`node -c`) dan verifikasi zero em-dash.
  - Commit dan push ke repositori GitHub `zadilquran` branch `main`.
