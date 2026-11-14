import { describe, it, expect } from 'vitest';
import fs from 'fs';
import {
  escapeHtml,
  formatRupiah,
  angkaKeTerbilang,
  formatWaNumber,
  getDashboardUrlByRole,
  openModal,
  closeModal,
  QURAN_DB,
  convertArabicNumerals,
  parseTahfizhMarkdownTable
} from '../js/core.js';

describe('Zadil Quran Core Helpers (js/core.js)', () => {
  describe('escapeHtml() - OWASP A05 XSS Sanitizer', () => {
    it('mengenkripsi tag script dan karakter bahaya XSS', () => {
      const dangerous = '<script>alert("XSS")</script>';
      expect(escapeHtml(dangerous)).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    it('mengenkripsi tanda petik tunggal dan ganda serta ampersand', () => {
      const input = `Tom & Jerry said 'hello' "world"`;
      expect(escapeHtml(input)).toBe('Tom &amp; Jerry said &#39;hello&#39; &quot;world&quot;');
    });

    it('menangani input null atau undefined dengan mengembalikan string kosong', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });
  });

  describe('formatRupiah()', () => {
    it('memformat angka integer ke format mata uang Rupiah', () => {
      expect(formatRupiah(200000)).toBe('Rp 200.000');
      expect(formatRupiah(1800000)).toBe('Rp 1.800.000');
    });

    it('menangani angka 0 dan nilai kosong/null', () => {
      expect(formatRupiah(0)).toBe('Rp 0');
      expect(formatRupiah(null)).toBe('Rp 0');
      expect(formatRupiah('')).toBe('Rp 0');
    });

    it('menangani string berformat yang memiliki simbol mata uang atau titik', () => {
      expect(formatRupiah('Rp 500.000')).toBe('Rp 500.000');
    });
  });

  describe('angkaKeTerbilang()', () => {
    it('mengubah angka 0 menjadi "Nol Rupiah"', () => {
      expect(angkaKeTerbilang(0)).toBe('Nol Rupiah');
    });

    it('mengubah ratusan ribu (SPP standar) menjadi kalimat terbilang', () => {
      expect(angkaKeTerbilang(200000)).toBe('Dua Ratus Ribu Rupiah');
      expect(angkaKeTerbilang(150000)).toBe('Seratus Lima Puluh Ribu Rupiah');
    });

    it('mengubah jutaan (biaya pendaftaran) menjadi kalimat terbilang', () => {
      expect(angkaKeTerbilang(1800000)).toBe('Satu Juta Delapan Ratus Ribu Rupiah');
    });

    it('mengubah belasan dengan benar', () => {
      expect(angkaKeTerbilang(12000)).toBe('Dua Belas Ribu Rupiah');
    });
  });

  describe('formatWaNumber()', () => {
    it('mengubah nomor lokal berawalan 0 menjadi kode negara 62', () => {
      expect(formatWaNumber('085731804663')).toBe('6285731804663');
    });

    it('membersihkan spasi, tanda tambah, dan tanda strip', () => {
      expect(formatWaNumber('+62 857-3180-4663')).toBe('6285731804663');
    });

    it('mempertahankan nomor yang sudah diawali 62', () => {
      expect(formatWaNumber('6285731804663')).toBe('6285731804663');
    });
  });

  describe('getDashboardUrlByRole()', () => {
    it('mengarahkan peran superadmin ke admin.html', () => {
      expect(getDashboardUrlByRole('superadmin')).toBe('admin.html');
    });

    it('mengarahkan peran ustadz ke ustadz.html', () => {
      expect(getDashboardUrlByRole('ustadz')).toBe('ustadz.html');
    });

    it('mengarahkan peran walisantri ke wali.html', () => {
      expect(getDashboardUrlByRole('walisantri')).toBe('wali.html');
    });

    it('mengarahkan peran yang tidak dikenal ke login.html', () => {
      expect(getDashboardUrlByRole('tamu')).toBe('login.html');
      expect(getDashboardUrlByRole('')).toBe('login.html');
    });
  });

  describe('openModal() & closeModal() helpers', () => {
    it('terekspor sebagai fungsi yang valid', () => {
      expect(typeof openModal).toBe('function');
      expect(typeof closeModal).toBe('function');
    });

    it('berjalan aman tanpa crash bila elemen DOM tidak ditemukan', () => {
      expect(() => openModal('nonExistentModal', 'nonExistentContent')).not.toThrow();
      expect(() => closeModal('nonExistentModal', 'nonExistentContent')).not.toThrow();
    });
  });

  describe('Authoritative Quran DB (QURAN_DB)', () => {
    it('memiliki 114 surat lengkap', () => {
      expect(QURAN_DB).toHaveLength(114);
      expect(QURAN_DB[0].nama).toBe('Al-Fatihah');
      expect(QURAN_DB[113].nama).toBe('An-Nas');
    });

    it('setiap Juz dari 1 sampai 30 memiliki minimal 1 surat yang cocok (termasuk Juz 2 & Juz 5)', () => {
      for (let j = 1; j <= 30; j++) {
        const matchingSurahs = QURAN_DB.filter(q => Array.isArray(q.juz) ? q.juz.includes(j) : q.juz === j);
        expect(matchingSurahs.length, `Juz ${j} harus memiliki surat`).toBeGreaterThan(0);
      }
    });

    it('Juz 2 secara spesifik memuat QS. Al-Baqarah', () => {
      const juz2Surahs = QURAN_DB.filter(q => q.juz.includes(2));
      expect(juz2Surahs.map(s => s.nama)).toContain('Al-Baqarah');
    });
  });

  describe('convertArabicNumerals()', () => {
    it('mengubah angka Arab ke digit latin dengan benar', () => {
      expect(convertArabicNumerals('۲۰-۱۰-۲۶')).toBe('20-10-26');
      expect(convertArabicNumerals('۱۸۲۱')).toBe('1821');
    });
  });

  describe('parseTahfizhMarkdownTable()', () => {
    it('mem-parsing file catatan setoran riil (15 baris)', () => {
      const sampleMd = fs.readFileSync('catatan_perkembangan_setoran_al_qur_an.md', 'utf8');
      const santriList = [{ ID_Santri: 'ZQ-2026-TEST', Nama_Santri: 'Ahmad Fatih' }];
      const ustadzList = [{ ID_Ustadz: 'U-001', Kode: 'U01', Nama: 'Ust. Ahmad Fauzi' }];

      const parsed = parseTahfizhMarkdownTable(sampleMd, santriList, ustadzList);
      expect(parsed).toHaveLength(15);

      // Cek baris pertama (1821 - Al-Ahqaf)
      expect(parsed[0].tm).toBe('1821');
      expect(parsed[0].tanggal).toBe('2026-10-20');
      expect(parsed[0].surah).toBe('Al-Ahqaf');
      expect(parsed[0].surahNo).toBe('46');
      expect(parsed[0].juz).toBe('26');
      expect(parsed[0].jenis).toBe('Binnadhor'); // Kode B

      // Cek baris kedua (1822 - Al-A'raf Muroja'ah)
      expect(parsed[1].tm).toBe('1822');
      expect(parsed[1].jenis).toBe("Muroja'ah"); // Kode M

      // Cek baris ketiga (1823 - Luqman Ziyadah)
      expect(parsed[2].tm).toBe('1823');
      expect(parsed[2].jenis).toBe('Ziyadah'); // Kode Z

      // Cek baris materi Jilid (1825)
      expect(parsed[4].tm).toBe('1825');
      expect(parsed[4].tingkatan).toBe('Jilid');
      expect(parsed[4].halaman).toBe('5');
    });

    it('mencocokkan multi-ustadz berdasarkan Kode Paraf (U01, U02, U03) secara fleksibel', () => {
      const mdContent = `
| TM | Tanggal | Surat / Jilid | Ayat / Hal | Nilai | Paraf | Kode |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: |
| 101 | 2026-11-01 | Al-Baqarah | Ayat 1-10 | A | U01 | Z |
| 102 | 2026-11-02 | Al-Baqarah | Ayat 11-20 | B | U02 | M |
| 103 | 2026-11-03 | Al-Baqarah | Ayat 21-30 | A | U03 | B |
`;
      const ustadzList = [
        { ID_Ustadz: 'UST-A', Kode: 'U01', Nama: 'Ust. Ahmad' },
        { ID_Ustadz: 'UST-B', Kode: 'U02', Nama: 'Ust. Badrus' },
        { ID_Ustadz: 'UST-C', Kode: 'U03', Nama: 'Ust. Choirul' }
      ];

      const res = parseTahfizhMarkdownTable(mdContent, [], ustadzList);
      expect(res).toHaveLength(3);
      expect(res[0].ustadzId).toBe('UST-A');
      expect(res[0].ustadzNama).toBe('Ust. Ahmad');
      expect(res[0].jenis).toBe('Ziyadah');

      expect(res[1].ustadzId).toBe('UST-B');
      expect(res[1].ustadzNama).toBe('Ust. Badrus');
      expect(res[1].jenis).toBe("Muroja'ah");

      expect(res[2].ustadzId).toBe('UST-C');
      expect(res[2].ustadzNama).toBe('Ust. Choirul');
      expect(res[2].jenis).toBe('Binnadhor');
    });

    it('mengekstrak nomor ayat dan halaman secara akurat bila ditulis bersamaan (Ayat 1-20 Hal 582) atau terpisah', () => {
      const mdContent = `
| TM | Tanggal | Surat / Jilid | Ayat / Hal | Nilai | Paraf | Kode |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: |
| 201 | 2026-11-10 | Al-Baqarah | Ayat 1-20 Hal 582 | A | U01 | Z |
| 202 | 2026-11-11 | Al-Baqarah | Hal 583 | B | U01 | M |
| 203 | 2026-11-12 | Al-Baqarah | Ayat 21 - 30 | A | U01 | Z |
`;
      const res = parseTahfizhMarkdownTable(mdContent, [], []);
      expect(res).toHaveLength(3);

      // Baris 1: Ayat 1-20 Hal 582 -> Ayat dan Halaman harus keduanya terisi, ayat TIDAK boleh menjadi '-'
      expect(res[0].ayat).toBe('1-20');
      expect(res[0].halaman).toBe('582');

      // Baris 2: Hal 583 -> Halaman 583, Ayat '-'
      expect(res[1].ayat).toBe('-');
      expect(res[1].halaman).toBe('583');

      // Baris 3: Ayat 21 - 30 -> Ayat 21 - 30, Halaman '-'
      expect(res[2].ayat).toBe('21 - 30');
      expect(res[2].halaman).toBe('-');
    });
  });
});

