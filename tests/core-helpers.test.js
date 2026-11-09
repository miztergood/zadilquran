import { describe, it, expect } from 'vitest';
import {
  formatRupiah,
  angkaKeTerbilang,
  formatWaNumber,
  getDashboardUrlByRole
} from '../js/core.js';

describe('Zadil Quran Core Helpers (js/core.js)', () => {
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
});
